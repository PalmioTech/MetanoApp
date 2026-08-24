import Papa from "papaparse";
import { Capacitor, CapacitorHttp } from "@capacitor/core";
import type { DayHours, DayKey, Station, WeeklyHours } from "./metan-types";

/**
 * CSV-backed station data source.
 *
 * The CSV file lives at /public/distributori.csv and is fetched once at runtime.
 * Replace the file to update prices/hours/stations — no rebuild required.
 *
 * To swap to a real backend later, replace `loadStations()` with a fetch to
 * your API; the rest of the app uses the same Station[] shape.
 */

type CsvRow = {
  lat: string;        // NOTE: in the source CSV the columns are swapped:
  Long: string;       // "lat" column actually holds longitude, "Long" holds latitude.
  "Via estesa": string;
  provincia: string;
  citta: string;
  via: string;
  prezzo: string;
  feriali: string;    // Mon-Fri
  festivi: string;    // Sunday
  prefestivi: string; // Saturday
  self?: string;      // "1" se il MIMIT registra un prezzo self-service
};

function parsePrice(raw: string | undefined | null): number | null {
  if (!raw) return null;
  const cleaned = raw.toString().trim().replace(",", ".");
  const n = parseFloat(cleaned);
  return Number.isFinite(n) && n > 0 ? n : null;
}

function parseCoord(raw: string | undefined | null): number | null {
  if (!raw) return null;
  const n = parseFloat(raw.toString().trim().replace(",", "."));
  return Number.isFinite(n) ? n : null;
}

function parseDayHours(raw: string | undefined | null): DayHours {
  const t = (raw || "").trim();
  if (!t) return null;
  if (/chius/i.test(t)) return null;
  // 24h: "00:00-24:00" or "00.00-24.00"
  if (/0?0[:.]?0?0\s*-\s*24[:.]?0?0/.test(t)) {
    return [{ open: "00:00", close: "24:00" }];
  }
  // Split intervals by '/' first (e.g. "08:00-12:00/15:00-19:00")
  const parts = t.split("/").map((p) => p.trim()).filter(Boolean);
  const intervals: { open: string; close: string }[] = [];
  for (const p of parts) {
    // Tolerate "07:30-12:15-14:30-19:00" by pairing all matched tokens.
    // Accetta sia i due punti sia il punto come separatore ("07.30-12.30",
    // presente in alcune righe del CSV) e normalizza a HH:MM.
    const times = p.match(/\d{1,2}[:.]\d{2}/g);
    if (!times) continue;
    const norm = times.map((x) => x.replace(".", ":"));
    for (let i = 0; i + 1 < norm.length; i += 2) {
      intervals.push({ open: norm[i], close: norm[i + 1] });
    }
  }
  return intervals.length ? intervals : null;
}

function buildWeeklyHours(feriali: string, prefestivi: string, festivi: string): {
  hours: WeeklyHours;
  always_open: boolean;
} {
  const fer = parseDayHours(feriali);
  const pre = parseDayHours(prefestivi);
  const fes = parseDayHours(festivi);
  const map: Record<DayKey, DayHours> = {
    monday: fer,
    tuesday: fer,
    wednesday: fer,
    thursday: fer,
    friday: fer,
    saturday: pre,
    sunday: fes,
  };
  const is24 = (h: DayHours) =>
    !!h && h.length === 1 && h[0].open === "00:00" && h[0].close === "24:00";
  const always_open = is24(fer) && is24(pre) && is24(fes);
  return { hours: map, always_open };
}

function rowToStation(row: CsvRow, id: number): Station | null {
  // The CSV column header "lat" actually contains LONGITUDE values
  // (e.g. 7.36 for Aosta) and "Long" contains LATITUDE values (e.g. 45.7).
  const lng = parseCoord(row.lat);
  const lat = parseCoord(row.Long);
  if (lat == null || lng == null) return null;

  // Italy bbox sanity check; if coords look swapped or invalid, drop.
  if (lat < 35 || lat > 48 || lng < 6 || lng > 19) return null;

  const city = (row.citta || "").trim();
  const province = (row.provincia || "").trim();
  const address = (row.via || "").trim() || null;
  const fullName = (row["Via estesa"] || "").trim() || `${province} ${city}`;
  const { hours, always_open } = buildWeeklyHours(row.feriali, row.prefestivi, row.festivi);

  return {
    id,
    name: fullName,
    address,
    city,
    province,
    price: parsePrice(row.prezzo),
    lat,
    lng,
    opening_hours: hours,
    always_open,
    self_service: (row.self || "").trim() === "1",
    operator: null,
    payment_methods: [],
  };
}

let cache: Station[] | null = null;
let inflight: Promise<Station[]> | null = null;

export class StationsLoadError extends Error {
  constructor(message: string, public cause?: unknown) {
    super(message);
    this.name = "StationsLoadError";
  }
}

async function fetchText(url: string, timeoutMs: number): Promise<{ text: string; lastModified: string | null }> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(url, { cache: "no-cache", signal: ctrl.signal });
    if (!res.ok) {
      throw new StationsLoadError(`Errore HTTP ${res.status} caricando ${url}`);
    }
    const text = await res.text();
    if (!text || text.length < 50) {
      throw new StationsLoadError(`File ${url} vuoto o troppo corto`);
    }
    return { text, lastModified: res.headers.get("last-modified") };
  } catch (e) {
    if (e instanceof StationsLoadError) throw e;
    throw new StationsLoadError(`Impossibile scaricare ${url}`, e);
  } finally {
    clearTimeout(timer);
  }
}

function parseCsvText(text: string): Station[] {
  const parsed = Papa.parse<CsvRow>(text, {
    header: true,
    delimiter: ";",
    skipEmptyLines: true,
    transformHeader: (h) => h.trim(),
  });

  if (parsed.errors && parsed.errors.length > 0) {
    // Non-fatal: surface in console but continue with the rows we got.
    // PapaParse typically still returns valid rows alongside parse errors.
    console.warn("[stations-loader] CSV parse warnings:", parsed.errors.slice(0, 3));
  }

  const rows = parsed.data || [];
  const stations: Station[] = [];
  let id = 1;
  for (const row of rows) {
    const s = rowToStation(row, id);
    if (s) {
      stations.push(s);
      id += 1;
    }
  }

  if (stations.length === 0) {
    throw new StationsLoadError("CSV parsato ma nessuna stazione valida trovata");
  }
  return stations;
}

/**
 * Il CSV viene rigenerato ogni mattina dal workflow GitHub e pubblicato dal
 * sito. Sul WEB il path relativo /distributori.csv punta gia' a quel file
 * aggiornato, quindi non serve fare nulla di diverso. Dentro l'APP NATIVA,
 * invece, il path relativo punta alla copia impacchettata al momento della
 * build, che non si aggiornerebbe mai: per questo da nativo proviamo prima il
 * CSV remoto (via CapacitorHttp, che esegue la richiesta a livello nativo ed
 * evita il blocco CORS della WebView), poi l'ultima copia scaricata con
 * successo (localStorage), e solo come ultima spiaggia la copia inclusa
 * nell'app — che garantisce comunque il funzionamento offline al primo avvio.
 */
const REMOTE_CSV_URL = "https://metano-app.vercel.app/distributori.csv";
const CSV_CACHE_KEY = "metanapp:distributori-csv";
const CSV_CACHE_DATE_KEY = "metanapp:distributori-csv-date";

/**
 * Data dell'ultimo aggiornamento dei dati mostrati (ISO), ricavata
 * dall'header Last-Modified del server — cioe' dal momento in cui il
 * workflow quotidiano ha pubblicato il CSV. null quando non determinabile
 * (es. copia impacchettata nella build): in quel caso la UI non mostra nulla.
 */
let stationsUpdatedAt: string | null = null;

export function getStationsUpdatedAt(): string | null {
  return stationsUpdatedAt;
}

function toIsoOrNull(lastModified: string | null): string | null {
  if (!lastModified) return null;
  const d = new Date(lastModified);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}

async function fetchRemoteCsvNative(): Promise<{ text: string; lastModified: string | null }> {
  // Cache-buster: un parametro sempre diverso rende la richiesta unica e
  // impedisce alla cache HTTP di iOS (URLSession) di rispondere con una
  // copia vecchia senza interrogare il server. Il server ignora il parametro.
  const url = `${REMOTE_CSV_URL}?t=${Date.now()}`;
  const resp = await CapacitorHttp.get({
    url,
    headers: { "Cache-Control": "no-cache", Pragma: "no-cache" },
    connectTimeout: 10000,
    readTimeout: 10000,
    responseType: "text",
  });
  if (resp.status !== 200) {
    throw new StationsLoadError(`Errore HTTP ${resp.status} caricando ${REMOTE_CSV_URL}`);
  }
  const text = typeof resp.data === "string" ? resp.data : String(resp.data ?? "");
  if (!text || text.length < 50) {
    throw new StationsLoadError(`CSV remoto vuoto o troppo corto`);
  }
  const headers = resp.headers ?? {};
  const lastModified = headers["last-modified"] ?? headers["Last-Modified"] ?? null;
  return { text, lastModified };
}

function saveCsvToLocal(text: string, dateIso: string): void {
  stationsUpdatedAt = dateIso;
  try {
    localStorage.setItem(CSV_CACHE_KEY, text);
    localStorage.setItem(CSV_CACHE_DATE_KEY, dateIso);
  } catch {
    /* storage pieno o non disponibile: non e' un errore bloccante */
  }
}

/**
 * Aggiornamento in sottofondo: parte 1,5s dopo l'avvio (per non contendere
 * risorse al primo render), scarica il CSV del giorno e, se arriva, scambia i
 * dati a caldo notificando la UI con l'evento "metanapp:stations-refreshed".
 * Se fallisce, pazienza: l'utente resta sui dati della copia locale.
 */
let refreshScheduled = false;
function scheduleBackgroundRefresh(): void {
  if (refreshScheduled) return;
  refreshScheduled = true;
  setTimeout(async () => {
    try {
      const { text, lastModified } = await fetchRemoteCsvNative();
      const stations = parseCsvText(text);
      saveCsvToLocal(text, toIsoOrNull(lastModified) ?? new Date().toISOString());
      cache = stations;
      window.dispatchEvent(new CustomEvent("metanapp:stations-refreshed", { detail: stations }));
    } catch (e) {
      console.warn("[stations-loader] refresh in sottofondo non riuscito:", e);
    }
  }, 1500);
}

async function fetchAndParse(): Promise<Station[]> {
  if (Capacitor.isNativePlatform()) {
    // 1) ISTANTANEO: l'ultima copia scaricata. L'avvio non aspetta mai la
    //    rete: i distributori compaiono subito, il CSV del giorno arriva in
    //    sottofondo e viene scambiato a caldo appena pronto.
    try {
      const cachedText = localStorage.getItem(CSV_CACHE_KEY);
      if (cachedText) {
        const stations = parseCsvText(cachedText);
        stationsUpdatedAt = localStorage.getItem(CSV_CACHE_DATE_KEY);
        scheduleBackgroundRefresh();
        return stations;
      }
    } catch {
      /* cache illeggibile: si prosegue con la rete */
    }
    // 2) primo avvio in assoluto: serve la rete
    try {
      const { text, lastModified } = await fetchRemoteCsvNative();
      const stations = parseCsvText(text);
      saveCsvToLocal(text, toIsoOrNull(lastModified) ?? new Date().toISOString());
      return stations;
    } catch (e) {
      console.warn("[stations-loader] CSV remoto non disponibile, uso il fallback:", e);
    }
    // 3) copia impacchettata nella build (offline al primissimo avvio)
  }
  const { text, lastModified } = await fetchText("/distributori.csv", 10000);
  const stations = parseCsvText(text);
  stationsUpdatedAt = toIsoOrNull(lastModified);
  return stations;
}

/** Async loader with in-memory caching. Safe to call repeatedly. */
export function loadStations(): Promise<Station[]> {
  if (cache) return Promise.resolve(cache);
  if (inflight) return inflight;
  inflight = fetchAndParse()
    .then((s) => {
      cache = s;
      inflight = null;
      return s;
    })
    .catch((e) => {
      inflight = null;
      throw e;
    });
  return inflight;
}

/** Synchronous accessor — returns [] until loadStations() resolves. */
export function getCachedStations(): Station[] {
  return cache ?? [];
}

export function isStationsCacheReady(): boolean {
  return cache !== null;
}

/** Test/dev helper. */
export function _resetStationsCache() {
  cache = null;
  inflight = null;
}
