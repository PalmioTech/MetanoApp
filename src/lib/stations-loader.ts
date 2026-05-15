import Papa from "papaparse";
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
    // Tolerate "07:30-12:15-14:30-19:00" by pairing all matched HH:MM tokens.
    const times = p.match(/\d{1,2}:\d{2}/g);
    if (!times) continue;
    for (let i = 0; i + 1 < times.length; i += 2) {
      intervals.push({ open: times[i], close: times[i + 1] });
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

async function fetchAndParse(): Promise<Station[]> {
  let res: Response;
  try {
    res = await fetch("/distributori.csv", { cache: "force-cache" });
  } catch (e) {
    throw new StationsLoadError("Impossibile scaricare /distributori.csv", e);
  }
  if (!res.ok) {
    throw new StationsLoadError(
      `Errore HTTP ${res.status} caricando /distributori.csv`,
    );
  }
  const text = await res.text();
  if (!text || text.length < 50) {
    throw new StationsLoadError("File /distributori.csv vuoto o troppo corto");
  }

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
