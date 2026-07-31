import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { S as Slot } from "../_libs/radix-ui__react-slot.mjs";
import { c as cva } from "../_libs/class-variance-authority.mjs";
import { c as clsx } from "../_libs/clsx.mjs";
import { t as twMerge } from "../_libs/tailwind-merge.mjs";
import { R as Root } from "../_libs/radix-ui__react-label.mjs";
import { R as Root2, L as List, T as Trigger, C as Content } from "../_libs/radix-ui__react-tabs.mjs";
import { P as Papa } from "../_libs/papaparse.mjs";
import { F as Fuel, T as TriangleAlert, X, M as MapPinned, C as ChevronUp, a as ChevronDown, E as ExternalLink, P as Plus, N as Navigation, G as Gauge, L as LoaderCircle, b as MapPin, c as Clock, d as Pencil, B as Building2, e as CreditCard, f as Crosshair, R as Repeat } from "../_libs/lucide-react.mjs";
import "../_libs/radix-ui__react-compose-refs.mjs";
import "../_libs/radix-ui__react-primitive.mjs";
import "../_libs/react-dom.mjs";
import "util";
import "crypto";
import "async_hooks";
import "stream";
import "../_libs/radix-ui__primitive.mjs";
import "../_libs/radix-ui__react-context.mjs";
import "../_libs/radix-ui__react-roving-focus.mjs";
import "../_libs/radix-ui__react-collection.mjs";
import "../_libs/radix-ui__react-id.mjs";
import "../_libs/@radix-ui/react-use-layout-effect+[...].mjs";
import "../_libs/@radix-ui/react-use-callback-ref+[...].mjs";
import "../_libs/@radix-ui/react-use-controllable-state+[...].mjs";
import "../_libs/radix-ui__react-direction.mjs";
import "../_libs/radix-ui__react-presence.mjs";
function cn(...inputs) {
  return twMerge(clsx(inputs));
}
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground shadow hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
        outline: "border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline"
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-10 rounded-md px-8",
        icon: "h-9 w-9"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default"
    }
  }
);
const Button = reactExports.forwardRef(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return /* @__PURE__ */ jsxRuntimeExports.jsx(Comp, { className: cn(buttonVariants({ variant, size, className })), ref, ...props });
  }
);
Button.displayName = "Button";
const Input = reactExports.forwardRef(
  ({ className, type, ...props }, ref) => {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      "input",
      {
        type,
        className: cn(
          "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          className
        ),
        ref,
        ...props
      }
    );
  }
);
Input.displayName = "Input";
const labelVariants = cva(
  "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
);
const Label = reactExports.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(Root, { ref, className: cn(labelVariants(), className), ...props }));
Label.displayName = Root.displayName;
const Tabs = Root2;
const TabsList = reactExports.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(
  List,
  {
    ref,
    className: cn(
      "inline-flex h-9 items-center justify-center rounded-lg bg-muted p-1 text-muted-foreground",
      className
    ),
    ...props
  }
));
TabsList.displayName = List.displayName;
const TabsTrigger = reactExports.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(
  Trigger,
  {
    ref,
    className: cn(
      "inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow",
      className
    ),
    ...props
  }
));
TabsTrigger.displayName = Trigger.displayName;
const TabsContent = reactExports.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(
  Content,
  {
    ref,
    className: cn(
      "mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
      className
    ),
    ...props
  }
));
TabsContent.displayName = Content.displayName;
const DAY_ORDER = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday"
];
const DAY_LABELS_IT = {
  monday: "Lunedì",
  tuesday: "Martedì",
  wednesday: "Mercoledì",
  thursday: "Giovedì",
  friday: "Venerdì",
  saturday: "Sabato",
  sunday: "Domenica"
};
function dayKeyFromDate(d) {
  return ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"][d.getDay()];
}
function isStationOpenAt(station, date) {
  if (station.always_open) return true;
  const day = dayKeyFromDate(date);
  const intervals = station.opening_hours?.[day];
  if (intervals === void 0) return null;
  if (intervals === null) return false;
  if (!intervals.length) return false;
  const mins = date.getHours() * 60 + date.getMinutes();
  for (const it of intervals) {
    const [oh, om] = it.open.split(":").map(Number);
    const [ch, cm] = it.close.split(":").map(Number);
    const o = oh * 60 + om;
    const c = ch * 60 + cm;
    if (mins >= o && mins < c) return true;
  }
  return false;
}
function parsePrice(raw) {
  if (!raw) return null;
  const cleaned = raw.toString().trim().replace(",", ".");
  const n = parseFloat(cleaned);
  return Number.isFinite(n) && n > 0 ? n : null;
}
function parseCoord(raw) {
  if (!raw) return null;
  const n = parseFloat(raw.toString().trim().replace(",", "."));
  return Number.isFinite(n) ? n : null;
}
function parseDayHours(raw) {
  const t = (raw || "").trim();
  if (!t) return null;
  if (/chius/i.test(t)) return null;
  if (/0?0[:.]?0?0\s*-\s*24[:.]?0?0/.test(t)) {
    return [{ open: "00:00", close: "24:00" }];
  }
  const parts = t.split("/").map((p) => p.trim()).filter(Boolean);
  const intervals = [];
  for (const p of parts) {
    const times = p.match(/\d{1,2}:\d{2}/g);
    if (!times) continue;
    for (let i = 0; i + 1 < times.length; i += 2) {
      intervals.push({ open: times[i], close: times[i + 1] });
    }
  }
  return intervals.length ? intervals : null;
}
function buildWeeklyHours(feriali, prefestivi, festivi) {
  const fer = parseDayHours(feriali);
  const pre = parseDayHours(prefestivi);
  const fes = parseDayHours(festivi);
  const map = {
    monday: fer,
    tuesday: fer,
    wednesday: fer,
    thursday: fer,
    friday: fer,
    saturday: pre,
    sunday: fes
  };
  const is24 = (h) => !!h && h.length === 1 && h[0].open === "00:00" && h[0].close === "24:00";
  const always_open = is24(fer) && is24(pre) && is24(fes);
  return { hours: map, always_open };
}
function rowToStation(row, id) {
  const lng = parseCoord(row.lat);
  const lat = parseCoord(row.Long);
  if (lat == null || lng == null) return null;
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
    payment_methods: []
  };
}
let cache = null;
let inflight = null;
class StationsLoadError extends Error {
  constructor(message, cause) {
    super(message);
    this.cause = cause;
    this.name = "StationsLoadError";
  }
}
async function fetchAndParse() {
  let res;
  try {
    res = await fetch("/distributori.csv", { cache: "no-cache" });
  } catch (e) {
    throw new StationsLoadError("Impossibile scaricare /distributori.csv", e);
  }
  if (!res.ok) {
    throw new StationsLoadError(
      `Errore HTTP ${res.status} caricando /distributori.csv`
    );
  }
  const text = await res.text();
  if (!text || text.length < 50) {
    throw new StationsLoadError("File /distributori.csv vuoto o troppo corto");
  }
  const parsed = Papa.parse(text, {
    header: true,
    delimiter: ";",
    skipEmptyLines: true,
    transformHeader: (h) => h.trim()
  });
  if (parsed.errors && parsed.errors.length > 0) {
    console.warn("[stations-loader] CSV parse warnings:", parsed.errors.slice(0, 3));
  }
  const rows = parsed.data || [];
  const stations = [];
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
function loadStations() {
  if (cache) return Promise.resolve(cache);
  if (inflight) return inflight;
  inflight = fetchAndParse().then((s) => {
    cache = s;
    inflight = null;
    return s;
  }).catch((e) => {
    inflight = null;
    throw e;
  });
  return inflight;
}
function getCachedStations() {
  return cache ?? [];
}
function titleCase(s) {
  return s.toLowerCase().split(/(\s|')/).map((p) => p.length > 1 ? p[0].toUpperCase() + p.slice(1) : p).join("");
}
const ALL_STATIONS = [];
const CITIES = [];
const CITY_INDEX = /* @__PURE__ */ new Map();
const EXTRA_CITIES = {
  roma: { lat: 41.9028, lng: 12.4964 },
  milano: { lat: 45.4642, lng: 9.19 },
  napoli: { lat: 40.8518, lng: 14.2681 },
  torino: { lat: 45.0703, lng: 7.6869 },
  firenze: { lat: 43.7696, lng: 11.2558 },
  bologna: { lat: 44.4949, lng: 11.3426 },
  venezia: { lat: 45.4408, lng: 12.3155 },
  genova: { lat: 44.4056, lng: 8.9463 },
  verona: { lat: 45.4384, lng: 10.9916 },
  padova: { lat: 45.4064, lng: 11.8768 },
  bari: { lat: 41.1171, lng: 16.8719 },
  palermo: { lat: 38.1157, lng: 13.3615 },
  catania: { lat: 37.5079, lng: 15.083 },
  trieste: { lat: 45.6495, lng: 13.7768 },
  brescia: { lat: 45.5416, lng: 10.2118 },
  bergamo: { lat: 45.6983, lng: 9.6773 },
  parma: { lat: 44.8015, lng: 10.3279 },
  modena: { lat: 44.6471, lng: 10.9252 },
  rimini: { lat: 44.0678, lng: 12.5695 },
  ancona: { lat: 43.6158, lng: 13.5189 },
  perugia: { lat: 43.1107, lng: 12.3908 },
  pisa: { lat: 43.7228, lng: 10.4017 },
  cagliari: { lat: 39.2238, lng: 9.1217 },
  trento: { lat: 46.0748, lng: 11.1217 },
  bolzano: { lat: 46.4983, lng: 11.3548 }
};
let stationsReady = false;
function rebuildIndexes(stations) {
  ALL_STATIONS.length = 0;
  for (const s of stations) {
    ALL_STATIONS.push({
      ...s,
      city: titleCase(s.city),
      name: titleCase(s.name),
      address: s.address ? titleCase(s.address) : s.address
    });
  }
  CITY_INDEX.clear();
  const sums = /* @__PURE__ */ new Map();
  for (const s of ALL_STATIONS) {
    const key = s.city.toLowerCase();
    const cur = sums.get(key) ?? { lat: 0, lng: 0, n: 0 };
    cur.lat += s.lat;
    cur.lng += s.lng;
    cur.n += 1;
    sums.set(key, cur);
  }
  for (const [k, v] of sums) {
    CITY_INDEX.set(k, { lat: v.lat / v.n, lng: v.lng / v.n });
  }
  for (const [k, v] of Object.entries(EXTRA_CITIES)) {
    if (!CITY_INDEX.has(k)) CITY_INDEX.set(k, v);
  }
  CITIES.length = 0;
  const sorted = Array.from(new Set(Array.from(CITY_INDEX.keys()).map(titleCase))).sort();
  for (const c of sorted) CITIES.push(c);
  stationsReady = true;
}
async function ensureStationsLoaded() {
  if (stationsReady) return;
  const cached = getCachedStations();
  if (cached.length > 0) {
    rebuildIndexes(cached);
    return;
  }
  const stations = await loadStations();
  rebuildIndexes(stations);
}
function isStationsReady() {
  return stationsReady;
}
function geocodeCity(name) {
  if (!name) return null;
  const key = name.trim().toLowerCase();
  if (CITY_INDEX.has(key)) return CITY_INDEX.get(key);
  for (const [k, v] of CITY_INDEX) {
    if (k.startsWith(key) || key.startsWith(k)) return v;
  }
  return null;
}
function haversine(a, b) {
  const R = 6371;
  const toRad = (x) => x * Math.PI / 180;
  const dLat = toRad(b[0] - a[0]);
  const dLng = toRad(b[1] - a[1]);
  const lat1 = toRad(a[0]);
  const lat2 = toRad(b[0]);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}
function pointToSegmentKm(p, a, b) {
  const ax = a[1], ay = a[0], bx = b[1], by = b[0], px = p[1], py = p[0];
  const dx = bx - ax, dy = by - ay;
  const len2 = dx * dx + dy * dy;
  let t = len2 > 0 ? ((px - ax) * dx + (py - ay) * dy) / len2 : 0;
  t = Math.max(0, Math.min(1, t));
  const proj = [ay + t * dy, ax + t * dx];
  return { dist: haversine(p, proj), t };
}
function buildRoute(points) {
  const polyline = [];
  const cumulative = [];
  let cum = 0;
  for (let i = 0; i < points.length - 1; i++) {
    const a = points[i], b = points[i + 1];
    const segKm = haversine(a, b);
    const steps = Math.max(8, Math.ceil(segKm / 15));
    for (let s = 0; s < steps; s++) {
      const t = s / steps;
      const lat = a[0] + (b[0] - a[0]) * t;
      const lng = a[1] + (b[1] - a[1]) * t;
      if (polyline.length === 0 || polyline[polyline.length - 1][0] !== lat || polyline[polyline.length - 1][1] !== lng) {
        if (polyline.length > 0) cum += haversine(polyline[polyline.length - 1], [lat, lng]);
        polyline.push([lat, lng]);
        cumulative.push(cum);
      }
    }
  }
  const last = points[points.length - 1];
  if (polyline.length === 0 || polyline[polyline.length - 1][0] !== last[0] || polyline[polyline.length - 1][1] !== last[1]) {
    if (polyline.length > 0) cum += haversine(polyline[polyline.length - 1], last);
    polyline.push(last);
    cumulative.push(cum);
  }
  return { polyline, cumulative, totalKm: cum };
}
const MAX_DETOUR_KM = 8;
function isHighwayStationName(name) {
  const n = name.toLowerCase();
  return /\b(a\d+|autostrad|ads)\b/.test(n);
}
function highwayServesDirection(s) {
  if (!isHighwayStationName(s.name)) return null;
  const n = s.name.toLowerCase();
  if (/\bnord\b/.test(n)) return "north";
  if (/\bsud\b/.test(n)) return "south";
  if (/\bovest\b/.test(n)) return "south";
  if (/\best\b/.test(n)) return "north";
  return null;
}
function candidatesAlongRoute(polyline, cumulative) {
  const out = [];
  for (const s of ALL_STATIONS) {
    let best = { dist: Infinity, cumKm: 0, segIdx: 0 };
    for (let i = 0; i < polyline.length - 1; i++) {
      const seg = pointToSegmentKm([s.lat, s.lng], polyline[i], polyline[i + 1]);
      if (seg.dist < best.dist) {
        const segLen = cumulative[i + 1] - cumulative[i];
        best = { dist: seg.dist, cumKm: cumulative[i] + seg.t * segLen, segIdx: i };
      }
    }
    if (best.dist <= MAX_DETOUR_KM) {
      const span = Math.max(15, Math.floor(polyline.length / 30));
      const a = polyline[Math.max(0, best.segIdx - span)];
      const b = polyline[Math.min(polyline.length - 1, best.segIdx + span + 1)];
      const dLat = b[0] - a[0];
      const dLng = b[1] - a[1];
      let localDir = "ew";
      if (Math.abs(dLat) >= Math.abs(dLng) * 0.4) {
        localDir = dLat > 0 ? "north" : "south";
      }
      out.push({ station: s, cumKm: best.cumKm, detourKm: Math.round(best.dist * 10) / 10, localDir });
    }
  }
  return out.sort((a, b) => a.cumKm - b.cumKm);
}
function pickStops(candidates, totalKm, currentRange, maxRange, safety, forcedIds = /* @__PURE__ */ new Set(), startTime = /* @__PURE__ */ new Date(), durationMin = 0) {
  const usable = (range2) => Math.max(0, range2 - safety);
  const picked = [];
  const warnings = [];
  let pos = 0;
  let range = currentRange;
  let lastIdx = -1;
  const etaAt = (cumKm) => {
    const minutes = totalKm > 0 ? Math.round(cumKm / totalKm * durationMin) : 0;
    return new Date(startTime.getTime() + minutes * 6e4);
  };
  const forced = candidates.map((c, i) => ({ c, i })).filter((x) => forcedIds.has(x.c.station.id)).sort((a, b) => a.c.cumKm - b.c.cumKm);
  let forcedPtr = 0;
  while (pos + usable(range) < totalKm || forcedPtr < forced.length) {
    const nextForced = forced[forcedPtr];
    if (nextForced && nextForced.c.cumKm > pos + 0.1 && nextForced.c.cumKm - pos <= usable(range)) {
      picked.push(nextForced.c);
      pos = nextForced.c.cumKm;
      range = maxRange;
      lastIdx = nextForced.i;
      forcedPtr++;
      continue;
    }
    const upperLimitCum = nextForced ? Math.min(totalKm, nextForced.c.cumKm) : totalKm;
    let bestIdx = -1;
    let bestCum = -1;
    for (let i = lastIdx + 1; i < candidates.length; i++) {
      const c = candidates[i];
      if (c.cumKm <= pos + 0.1) continue;
      if (c.cumKm > upperLimitCum) break;
      const reach = c.cumKm - pos;
      if (reach > usable(range)) break;
      if (c.cumKm > bestCum) {
        bestCum = c.cumKm;
        bestIdx = i;
      }
    }
    if (bestIdx === -1 && !nextForced) break;
    if (bestIdx === -1) {
      warnings.push("Autonomia insufficiente per raggiungere la prossima tappa lungo il percorso.");
      break;
    }
    const minCum = bestCum - 25;
    let chosen = -1;
    let chosenScore = [2, Infinity];
    for (let i = lastIdx + 1; i <= bestIdx; i++) {
      const c = candidates[i];
      if (c.cumKm < minCum) continue;
      const open = isStationOpenAt(c.station, etaAt(c.cumKm));
      const openRank = open === true ? 0 : open === null ? 1 : 2;
      const detour = c.detourKm;
      if (openRank < chosenScore[0] || openRank === chosenScore[0] && detour < chosenScore[1]) {
        chosen = i;
        chosenScore = [openRank, detour];
      }
    }
    if (chosen === -1) chosen = bestIdx;
    picked.push(candidates[chosen]);
    pos = candidates[chosen].cumKm;
    range = maxRange;
    lastIdx = chosen;
    if (nextForced && candidates[chosen].station.id === nextForced.c.station.id) {
      forcedPtr++;
    }
  }
  return { picked, warnings };
}
const AVG_SPEED_KMH = 95;
async function fetchOsrmRoute(points) {
  try {
    const coords = points.map(([lat, lng]) => `${lng},${lat}`).join(";");
    const alt = points.length === 2 ? "true" : "false";
    const url = `https://router.project-osrm.org/route/v1/driving/${coords}?overview=full&geometries=geojson&alternatives=${alt}&continue_straight=true`;
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 1e4);
    const res = await fetch(url, { signal: ctrl.signal });
    clearTimeout(timer);
    if (!res.ok) return null;
    const data = await res.json();
    const routes = data?.routes;
    if (!routes || routes.length === 0) return null;
    const scored = routes.map((r) => ({
      r,
      score: r.distance / 1e3 + r.duration / 60 * 0.15
    })).sort((a, b) => a.score - b.score);
    const best = scored[0].r;
    const coordsArr = best.geometry.coordinates.map(
      ([lng, lat]) => [lat, lng]
    );
    return {
      polyline: coordsArr,
      distanceKm: best.distance / 1e3,
      durationMin: best.duration / 60
    };
  } catch {
    return null;
  }
}
function cumulativeDistances(polyline) {
  const cum = [0];
  for (let i = 1; i < polyline.length; i++) {
    cum.push(cum[i - 1] + haversine(polyline[i - 1], polyline[i]));
  }
  return cum;
}
async function geocodeNominatim(query) {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&countrycodes=it&limit=1&q=${encodeURIComponent(query)}`
    );
    const data = await res.json();
    if (data.length > 0) return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
  } catch {
  }
  return null;
}
async function geocodeAny(name) {
  const local = geocodeCity(name);
  if (local) return local;
  return geocodeNominatim(name);
}
async function resolveWaypoint(w) {
  if (typeof w === "string") {
    const g2 = await geocodeAny(w);
    return { point: g2 ? [g2.lat, g2.lng] : null, label: w };
  }
  if (typeof w.lat === "number" && typeof w.lng === "number") {
    return { point: [w.lat, w.lng], label: w.label };
  }
  const g = await geocodeAny(w.label);
  return { point: g ? [g.lat, g.lng] : null, label: w.label };
}
async function mockPlan(req) {
  await ensureStationsLoaded();
  const points = [];
  const missing = [];
  const reqAny = req;
  let originG = reqAny.origin_coords ?? null;
  if (!originG) originG = await geocodeAny(req.origin);
  if (!originG) missing.push(req.origin);
  else points.push([originG.lat, originG.lng]);
  const formWaypoints = [];
  for (const w of req.waypoints) {
    if (!w) continue;
    const { point, label } = await resolveWaypoint(w);
    if (!point) missing.push(label);
    else formWaypoints.push(point);
  }
  points.push(...formWaypoints);
  let destG = reqAny.destination_coords ?? null;
  if (!destG) destG = await geocodeAny(req.destination);
  if (!destG) missing.push(req.destination);
  else points.push([destG.lat, destG.lng]);
  const forcedSet = new Set(req.forced_station_ids ?? []);
  for (const w of req.waypoints) {
    if (w && typeof w !== "string" && typeof w.forced_station_id === "number") {
      forcedSet.add(w.forced_station_id);
    }
  }
  if (forcedSet.size > 0 && points.length >= 2) {
    const origin = points[0];
    const dest = points[points.length - 1];
    const totalDirect = haversine(origin, dest) || 1;
    const forcedStations = ALL_STATIONS.filter((s) => forcedSet.has(s.id));
    const ordered = forcedStations.map((s) => ({
      s,
      t: haversine(origin, [s.lat, s.lng]) / (haversine(origin, [s.lat, s.lng]) + haversine([s.lat, s.lng], dest) || 1),
      progress: haversine(origin, [s.lat, s.lng]) / totalDirect
    })).sort((a, b) => a.progress - b.progress);
    const insertPos = points.length - 1;
    points.splice(insertPos, 0, ...ordered.map((x) => [x.s.lat, x.s.lng]));
  }
  if (points.length < 2) {
    return {
      route: { distance_km: 0, duration_min: 0, polyline: [] },
      stops: [],
      candidates: [],
      warnings: [
        missing.length ? `Città non riconosciuta: ${missing.join(", ")}.` : "Inserisci partenza e destinazione."
      ],
      meta: {
        current_range_km: req.current_range_km,
        remaining_range_km: req.current_range_km,
        safety_margin_km: req.safety_margin_km
      }
    };
  }
  const warnings = [];
  let polyline;
  let cumulative;
  let totalKm;
  let durationMin;
  const osrm = await fetchOsrmRoute(points);
  if (osrm && osrm.polyline.length > 1) {
    polyline = osrm.polyline;
    cumulative = cumulativeDistances(polyline);
    totalKm = osrm.distanceKm;
    durationMin = Math.round(osrm.durationMin);
  } else {
    const built = buildRoute(points);
    polyline = built.polyline;
    cumulative = built.cumulative;
    totalKm = built.totalKm;
    durationMin = Math.round(totalKm / AVG_SPEED_KMH * 60);
    warnings.push("Routing stradale non disponibile: percorso approssimato in linea retta.");
  }
  const excludedSet = new Set(req.excluded_station_ids ?? []);
  const candidatesAll = candidatesAlongRoute(polyline, cumulative).filter((c) => {
    if (excludedSet.has(c.station.id)) return false;
    if ((req.forced_station_ids ?? []).includes(c.station.id)) return true;
    const sd = highwayServesDirection(c.station);
    if (sd && c.localDir !== "ew" && sd !== c.localDir) return false;
    return true;
  });
  const startTime = req.depart_at ? new Date(req.depart_at) : /* @__PURE__ */ new Date();
  const { picked, warnings: pickWarnings } = pickStops(
    candidatesAll,
    totalKm,
    req.current_range_km,
    req.max_range_km,
    req.safety_margin_km,
    forcedSet,
    startTime,
    durationMin
  );
  warnings.push(...pickWarnings);
  const pickedIds = new Set(picked.map((p) => p.station.id));
  const stops = picked.map((c, i) => {
    const minutes = Math.round(c.cumKm / totalKm * durationMin);
    const eta = new Date(startTime.getTime() + minutes * 6e4);
    const etaStr = eta.toLocaleTimeString("it-IT", { hour: "2-digit", minute: "2-digit" });
    const prevCum = i > 0 ? picked[i - 1].cumKm : 0;
    const kmFromPrev = Math.round(c.cumKm - prevCum);
    const baseDetour = c.detourKm;
    const pool = candidatesAll.filter((cand) => !pickedIds.has(cand.station.id)).filter((cand) => Math.abs(cand.cumKm - c.cumKm) <= 40).sort((a, b) => a.detourKm - b.detourKm).slice(0, 3).map((cand) => ({
      station: cand.station,
      detour_km: cand.detourKm,
      extra_trip_km: Math.max(0, Math.round(2 * (cand.detourKm - baseDetour) * 10) / 10),
      is_open_at_eta: isStationOpenAt(cand.station, eta)
    }));
    const alts = pool;
    return {
      stop_number: i + 1,
      station: c.station,
      is_open_at_eta: isStationOpenAt(c.station, eta),
      eta_label: `Arrivo stimato: ${etaStr}`,
      eta_iso: eta.toISOString(),
      detour_km: c.detourKm,
      km_from_prev: kmFromPrev,
      alternatives: alts,
      is_user_added: forcedSet.has(c.station.id)
    };
  });
  const lastCum = picked.length > 0 ? picked[picked.length - 1].cumKm : 0;
  const startingRange = picked.length > 0 ? req.max_range_km : req.current_range_km;
  const kmAfterLast = totalKm - lastCum;
  const remaining = Math.max(0, Math.round(startingRange - kmAfterLast));
  if (missing.length) warnings.unshift(`Città non riconosciuta: ${missing.join(", ")}.`);
  const candidates = candidatesAll.filter((c) => !pickedIds.has(c.station.id)).map((c) => ({ station: c.station, detour_km: c.detourKm, cum_km: c.cumKm }));
  return {
    route: { distance_km: Math.round(totalKm), duration_min: durationMin, polyline },
    stops,
    candidates,
    warnings,
    meta: {
      current_range_km: req.current_range_km,
      remaining_range_km: remaining,
      safety_margin_km: req.safety_margin_km
    }
  };
}
const LANGUAGE_STORAGE_KEY = "metanoapp-language";
const languageNames = {
  it: "Italiano",
  en: "English"
};
const languageFlags = {
  it: "🇮🇹",
  en: "🇬🇧"
};
const copy = {
  it: {
    chooseTitle: "Scegli la lingua",
    chooseSubtitle: "Potrai cambiarla dopo dal pannello di ricerca.",
    continue: "Continua",
    loadingStations: "Carico distributori...",
    stationLoadError: "Impossibile caricare i distributori",
    stationLoadHint: "Verifica che il file public/distributori.csv esista.",
    calculating: "Calcolo percorso...",
    calculatingSub: "Cerco le migliori stazioni CNG",
    planTrip: "Pianifica viaggio",
    editTrip: "Modifica viaggio",
    reduce: "Riduci",
    stopSingular: "sosta",
    stopPlural: "soste",
    showMap: "Mostra mappa"
  },
  en: {
    chooseTitle: "Choose language",
    chooseSubtitle: "You can change it later from the search panel.",
    continue: "Continue",
    loadingStations: "Loading stations...",
    stationLoadError: "Unable to load stations",
    stationLoadHint: "Check that public/distributori.csv exists.",
    calculating: "Calculating route...",
    calculatingSub: "Finding best CNG stations",
    planTrip: "Plan trip",
    editTrip: "Edit trip",
    reduce: "Collapse",
    stopSingular: "stop",
    stopPlural: "stops",
    showMap: "Show map"
  }
};
const formCopy = {
  it: {
    subtitle: "CNG Trip Planner",
    navigate: "Naviga",
    organize: "Organizza",
    navigateHelp: "Calcola la rotta da partenza a destinazione. Poi scegli sulla mappa le stazioni dove fermarti.",
    organizeHelp: "Indica la tua autonomia: ti suggeriamo automaticamente dove fermarti.",
    origin: "Partenza",
    destination: "Destinazione",
    waypoint: "Tappa intermedia",
    addressPlaceholder: "Città, via o indirizzo",
    addresses: "Indirizzi",
    usePosition: "Usa la mia posizione",
    positionError: "Impossibile ottenere la posizione. Controlla i permessi del browser.",
    addWaypoint: "Aggiungi tappa intermedia",
    currentRange: "Autonomia attuale (km)",
    maxRange: "Km con il pieno (max)",
    safety: "Margine sicurezza (km)",
    leaveNow: "Parto ora",
    schedule: "Pianifica orario",
    calculating: "Calcolo in corso...",
    calculateRoute: "Calcola percorso",
    findStops: "Trova le soste migliori",
    language: "Lingua"
  },
  en: {
    subtitle: "CNG Trip Planner",
    navigate: "Navigate",
    organize: "Plan",
    navigateHelp: "Calculate route from start to destination. Then choose stations on the map.",
    organizeHelp: "Enter your range: we suggest where to stop automatically.",
    origin: "Start",
    destination: "Destination",
    waypoint: "Intermediate stop",
    addressPlaceholder: "City, street or address",
    addresses: "Addresses",
    usePosition: "Use my location",
    positionError: "Unable to get location. Check browser permissions.",
    addWaypoint: "Add intermediate stop",
    currentRange: "Current range (km)",
    maxRange: "Full tank range (km)",
    safety: "Safety margin (km)",
    leaveNow: "Leave now",
    schedule: "Schedule time",
    calculating: "Calculating...",
    calculateRoute: "Calculate route",
    findStops: "Find best stops",
    language: "Language"
  }
};
function CityInput({ value, onChange, onCoordsChange, placeholder, showGeo, language }) {
  const [open, setOpen] = reactExports.useState(false);
  const ref = reactExports.useRef(null);
  const [geoLoading, setGeoLoading] = reactExports.useState(false);
  reactExports.useEffect(() => {
    const onDoc = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);
  const [nominatimResults, setNominatimResults] = reactExports.useState([]);
  const debounceRef = reactExports.useRef(null);
  reactExports.useEffect(() => {
    if (!value || value.length < 3) {
      setNominatimResults([]);
      return;
    }
    const cityMatch = CITIES.filter((c) => c.toLowerCase().includes(value.toLowerCase()));
    if (cityMatch.length >= 3) {
      setNominatimResults([]);
      return;
    }
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&countrycodes=it&limit=6&q=${encodeURIComponent(value)}`
        );
        const data = await res.json();
        setNominatimResults(
          data.map((d) => ({
            display: d.display_name.split(",").slice(0, 3).join(","),
            label: d.display_name.split(",").slice(0, 2).join(",").trim(),
            lat: parseFloat(d.lat),
            lng: parseFloat(d.lon)
          }))
        );
      } catch {
        setNominatimResults([]);
      }
    }, 400);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [value]);
  const filtered = value ? CITIES.filter((c) => c.toLowerCase().includes(value.toLowerCase())).slice(0, 4) : [];
  const handleGeolocate = () => {
    if (!navigator.geolocation) return;
    setGeoLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        onCoordsChange?.({ lat: latitude, lng: longitude });
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
          );
          const data = await res.json();
          const label = data.address?.road ? `${data.address.road}, ${data.address.city || data.address.town || data.address.village || ""}` : data.display_name?.split(",").slice(0, 2).join(",").trim() || `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
          onChange(label);
        } catch {
          onChange(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
        }
        setGeoLoading(false);
      },
      () => {
        setGeoLoading(false);
        alert(formCopy[language].positionError);
      },
      { enableHighAccuracy: true, timeout: 1e4 }
    );
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { ref, className: "relative", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Input,
        {
          value,
          onChange: (e) => {
            onChange(e.target.value);
            onCoordsChange?.(null);
            setOpen(true);
          },
          onFocus: () => setOpen(true),
          placeholder,
          className: cn("h-11 pr-10 bg-secondary/50 border-secondary focus-visible:bg-card")
        }
      ),
      showGeo && /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          type: "button",
          onClick: handleGeolocate,
          disabled: geoLoading,
          className: "absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-md hover:bg-primary-soft text-primary transition",
          title: formCopy[language].usePosition,
          children: geoLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-4 w-4 animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Crosshair, { className: "h-4 w-4" })
        }
      )
    ] }),
    open && (filtered.length > 0 || nominatimResults.length > 0) && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "absolute z-[1000] mt-1 w-full bg-card border border-border rounded-lg shadow-lg overflow-hidden max-h-52 overflow-y-auto", children: [
      filtered.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          type: "button",
          onClick: () => {
            onChange(c);
            onCoordsChange?.(null);
            setOpen(false);
          },
          className: "w-full text-left px-3 py-2 text-sm hover:bg-primary-soft transition",
          children: c
        },
        c
      )),
      nominatimResults.length > 0 && filtered.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "border-t border-border px-3 py-1 text-[10px] text-muted-foreground uppercase tracking-wide", children: formCopy[language].addresses }),
      nominatimResults.map((r, i) => /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          type: "button",
          onClick: () => {
            onChange(r.label);
            onCoordsChange?.({ lat: r.lat, lng: r.lng });
            setOpen(false);
          },
          className: "w-full text-left px-3 py-2 text-xs hover:bg-primary-soft transition text-muted-foreground",
          children: r.display
        },
        i
      ))
    ] })
  ] });
}
function TripForm({ onPlan, loading, language, onLanguageChange }) {
  const t = formCopy[language];
  const [mode, setMode] = reactExports.useState("navigate");
  const [origin, setOrigin] = reactExports.useState("");
  const [destination, setDestination] = reactExports.useState("");
  const [originCoords, setOriginCoords] = reactExports.useState(null);
  const [destCoords, setDestCoords] = reactExports.useState(null);
  const [waypoints, setWaypoints] = reactExports.useState([]);
  const [showWaypoints, setShowWaypoints] = reactExports.useState(false);
  const [currentRange, setCurrentRange] = reactExports.useState("80");
  const [maxRange, setMaxRange] = reactExports.useState("250");
  const [safety, setSafety] = reactExports.useState("20");
  const [departMode, setDepartMode] = reactExports.useState("now");
  const [departAt, setDepartAt] = reactExports.useState("");
  const handleSubmit = (e) => {
    e.preventDefault();
    const isOrganize = mode === "organize";
    onPlan({
      origin,
      destination,
      waypoints,
      mode,
      // In "navigate" mode we don't auto-suggest stops: give a huge range so
      // the planner draws the route only. The user picks stations from the map.
      current_range_km: isOrganize ? Number(currentRange) || 0 : 999999,
      max_range_km: isOrganize ? Number(maxRange) || 0 : 999999,
      safety_margin_km: isOrganize ? Number(safety) || 0 : 0,
      depart_at: departMode === "schedule" ? departAt : null,
      origin_coords: originCoords ?? void 0,
      destination_coords: destCoords ?? void 0
    });
  };
  const sharedFields = /* @__PURE__ */ jsxRuntimeExports.jsx(jsxRuntimeExports.Fragment, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs font-medium text-muted-foreground", children: t.origin }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        CityInput,
        {
          value: origin,
          onChange: setOrigin,
          onCoordsChange: setOriginCoords,
          placeholder: t.addressPlaceholder,
          showGeo: true,
          language
        }
      )
    ] }),
    showWaypoints && waypoints.map((wp, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { className: "text-xs font-medium text-muted-foreground", children: [
        t.waypoint,
        " ",
        i + 1
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          CityInput,
          {
            value: wp,
            onChange: (v) => setWaypoints(waypoints.map((w, j) => j === i ? v : w)),
            placeholder: t.addressPlaceholder,
            language
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            type: "button",
            onClick: () => setWaypoints(waypoints.filter((_, j) => j !== i)),
            className: "h-11 w-11 flex items-center justify-center rounded-md border border-border text-muted-foreground hover:text-destructive hover:border-destructive transition",
            children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "h-4 w-4" })
          }
        )
      ] })
    ] }, i)),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs font-medium text-muted-foreground", children: t.destination }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        CityInput,
        {
          value: destination,
          onChange: setDestination,
          onCoordsChange: setDestCoords,
          placeholder: t.addressPlaceholder,
          language
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "button",
      {
        type: "button",
        onClick: () => {
          setShowWaypoints(true);
          setWaypoints([...waypoints, ""]);
        },
        className: "text-xs font-medium text-primary hover:text-primary-glow flex items-center gap-1 transition",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-3.5 w-3.5" }),
          t.addWaypoint
        ]
      }
    )
  ] }) });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handleSubmit, className: "space-y-5", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2.5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center shadow-md", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Fuel, { className: "h-5 w-5 text-primary-foreground" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-bold text-lg leading-tight", children: "MetanApp" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[11px] text-muted-foreground leading-tight", children: t.subtitle })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "ml-auto flex items-center gap-1 rounded-full bg-secondary p-1", children: ["it", "en"].map((lang) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "button",
        {
          type: "button",
          onClick: () => onLanguageChange(lang),
          className: cn(
            "h-7 px-2 rounded-full text-[11px] font-semibold transition",
            language === lang ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
          ),
          title: `${t.language}: ${languageNames[lang]}`,
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { "aria-hidden": "true", children: languageFlags[lang] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "ml-1", children: lang.toUpperCase() })
          ]
        },
        lang
      )) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Tabs, { value: mode, onValueChange: (v) => setMode(v), children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsList, { className: "grid grid-cols-2 w-full h-10", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsTrigger, { value: "navigate", className: "text-xs font-medium gap-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Navigation, { className: "h-3.5 w-3.5" }),
          t.navigate
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsTrigger, { value: "organize", className: "text-xs font-medium gap-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Gauge, { className: "h-3.5 w-3.5" }),
          t.organize
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsContent, { value: "navigate", className: "space-y-4 mt-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: t.navigateHelp }),
        sharedFields
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsContent, { value: "organize", className: "space-y-4 mt-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: t.organizeHelp }),
        sharedFields,
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs font-medium text-muted-foreground", children: t.currentRange }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                type: "number",
                value: currentRange,
                onChange: (e) => setCurrentRange(e.target.value),
                className: "h-11 bg-secondary/50 border-secondary"
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs font-medium text-muted-foreground", children: t.maxRange }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                type: "number",
                value: maxRange,
                onChange: (e) => setMaxRange(e.target.value),
                className: "h-11 bg-secondary/50 border-secondary"
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs font-medium text-muted-foreground", children: t.safety }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              type: "number",
              value: safety,
              onChange: (e) => setSafety(e.target.value),
              className: "h-11 bg-secondary/50 border-secondary"
            }
          )
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-1 p-1 bg-secondary rounded-lg", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            type: "button",
            onClick: () => setDepartMode("now"),
            className: cn(
              "py-2 text-xs font-medium rounded-md transition",
              departMode === "now" ? "bg-card shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
            ),
            children: t.leaveNow
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            type: "button",
            onClick: () => setDepartMode("schedule"),
            className: cn(
              "py-2 text-xs font-medium rounded-md transition",
              departMode === "schedule" ? "bg-card shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
            ),
            children: t.schedule
          }
        )
      ] }),
      departMode === "schedule" && /* @__PURE__ */ jsxRuntimeExports.jsx(
        Input,
        {
          type: "datetime-local",
          value: departAt,
          onChange: (e) => setDepartAt(e.target.value),
          className: "h-11 bg-secondary/50 border-secondary"
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      Button,
      {
        type: "submit",
        disabled: loading || !origin.trim() || !destination.trim(),
        className: "w-full h-12 text-sm font-semibold bg-gradient-to-r from-primary to-primary-glow hover:opacity-95 shadow-md disabled:opacity-50 disabled:cursor-not-allowed",
        children: loading ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-4 w-4 mr-2 animate-spin" }),
          t.calculating
        ] }) : mode === "navigate" ? t.calculateRoute : t.findStops
      }
    )
  ] });
}
const resultsCopy = {
  it: {
    open: "Aperto",
    closed: "Chiuso",
    unknownHours: "Orario sconosciuto",
    stop: "Tappa",
    fromStart: "dalla partenza",
    fromPrev: "dalla sosta precedente",
    sameDetour: "stessa deviazione",
    extraTrip: "km al viaggio",
    detour: "km deviazione",
    navigate: "Naviga",
    removeStop: "Rimuovi sosta",
    hideAlternatives: "Nascondi alternative",
    changeStation: "Cambia stazione",
    alternatives: "alternative",
    stopSingular: "sosta",
    stopPlural: "soste",
    edit: "Modifica",
    routeReadyHelp: "Percorso calcolato. Le stazioni aperte ora lungo la strada sono evidenziate in verde sulla mappa. Tocca un'icona per aggiungerla come sosta.",
    noStops: "Nessuna sosta necessaria. Hai autonomia sufficiente per arrivare a destinazione.",
    ready: "Pronto a partire",
    startNavigation: "Avvia navigazione",
    arrival: "Arrivo a destinazione",
    remainingRange: "Autonomia residua",
    safetyMargin: "Margine di sicurezza richiesto:",
    notEnoughRange: "Autonomia insufficiente per raggiungere la destinazione",
    launchWith: "Avvia navigazione con:"
  },
  en: {
    open: "Open",
    closed: "Closed",
    unknownHours: "Hours unknown",
    stop: "Stop",
    fromStart: "from start",
    fromPrev: "from previous stop",
    sameDetour: "same detour",
    extraTrip: "km extra",
    detour: "km detour",
    navigate: "Navigate",
    removeStop: "Remove stop",
    hideAlternatives: "Hide alternatives",
    changeStation: "Change station",
    alternatives: "alternatives",
    stopSingular: "stop",
    stopPlural: "stops",
    edit: "Edit",
    routeReadyHelp: "Route calculated. Stations open now along the road are highlighted in green on the map. Tap an icon to add it as a stop.",
    noStops: "No stop needed. You have enough range to reach your destination.",
    ready: "Ready to go",
    startNavigation: "Start navigation",
    arrival: "Arrival at destination",
    remainingRange: "Remaining range",
    safetyMargin: "Required safety margin:",
    notEnoughRange: "Not enough range to reach destination",
    launchWith: "Start navigation with:"
  }
};
function statusColor(open) {
  if (open === true) return "bg-success text-success-foreground";
  if (open === false) return "bg-destructive text-destructive-foreground";
  return "bg-muted text-muted-foreground";
}
function statusLabel(open, language) {
  const t = resultsCopy[language];
  if (open === true) return t.open;
  if (open === false) return t.closed;
  return t.unknownHours;
}
function borderColor(open) {
  if (open === true) return "border-l-success";
  if (open === false) return "border-l-destructive";
  return "border-l-muted-foreground/40";
}
function AlternativeRow({
  alt,
  onSwap,
  onHover,
  onLeave,
  language
}) {
  const t = resultsCopy[language];
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "button",
    {
      type: "button",
      onClick: onSwap,
      onMouseEnter: onHover,
      onMouseLeave: onLeave,
      className: "w-full text-left px-3 py-2 rounded-lg border border-border bg-secondary/40 hover:bg-secondary hover:border-primary/60 hover:shadow-sm transition flex items-center gap-2",
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Repeat, { className: "h-3.5 w-3.5 text-muted-foreground flex-shrink-0" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs font-medium truncate", children: alt.station.name }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-[11px] text-muted-foreground flex items-center gap-2 flex-wrap", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
              alt.station.city,
              " (",
              alt.station.province,
              ")"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold text-foreground", children: alt.extra_trip_km > 0 ? `+${alt.extra_trip_km} ${t.extraTrip}` : t.sameDetour }),
            alt.station.price && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
              "€ ",
              alt.station.price.toFixed(3)
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: cn(
          "text-[10px] font-semibold px-1.5 py-0.5 rounded-full whitespace-nowrap",
          statusColor(alt.is_open_at_eta)
        ), children: statusLabel(alt.is_open_at_eta, language) })
      ]
    }
  );
}
function StopCard({
  stop,
  highlighted,
  onHover,
  onLeave,
  onClick,
  onAdd,
  onRemove,
  onSwap,
  onAlternativeHover,
  isAdded,
  language
}) {
  const [showAlts, setShowAlts] = reactExports.useState(false);
  const t = resultsCopy[language];
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    "div",
    {
      onMouseEnter: onHover,
      onMouseLeave: onLeave,
      onClick,
      className: cn(
        "bg-card border border-border rounded-xl p-4 border-l-4 transition-all cursor-pointer",
        borderColor(stop.is_open_at_eta),
        highlighted ? "shadow-md ring-2 ring-primary/30 -translate-y-0.5" : "hover:shadow-md"
      ),
      children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-shrink-0 h-9 w-9 rounded-full bg-gradient-to-br from-primary to-primary-glow text-primary-foreground font-bold text-sm flex items-center justify-center shadow-sm", children: stop.stop_number }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "font-semibold text-sm truncate flex items-center gap-1.5", children: [
                stop.station.name,
                isAdded && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[9px] font-bold px-1.5 py-0.5 rounded bg-primary/15 text-primary uppercase tracking-wide", children: t.stop })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-muted-foreground flex items-center gap-1 mt-0.5", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(MapPin, { className: "h-3 w-3" }),
                stop.station.city,
                " (",
                stop.station.province,
                ")"
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: cn(
              "text-[10px] font-semibold px-2 py-0.5 rounded-full whitespace-nowrap",
              statusColor(stop.is_open_at_eta)
            ), children: statusLabel(stop.is_open_at_eta, language) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 mt-2.5 text-xs flex-wrap", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-primary font-semibold flex items-center gap-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Navigation, { className: "h-3 w-3" }),
              stop.km_from_prev,
              " km ",
              stop.stop_number === 1 ? t.fromStart : t.fromPrev
            ] }),
            stop.station.price && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-semibold text-foreground", children: [
              "€ ",
              stop.station.price.toFixed(3),
              "/kg"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-muted-foreground", children: [
              "+",
              stop.detour_km,
              " ",
              t.detour
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-muted-foreground flex items-center gap-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { className: "h-3 w-3" }),
              stop.eta_label.replace("Arrivo stimato: ", "")
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2 mt-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "a",
              {
                href: `https://www.google.com/maps/dir/?api=1&destination=${stop.station.lat},${stop.station.lng}`,
                target: "_blank",
                rel: "noopener noreferrer",
                onClick: (e) => e.stopPropagation(),
                className: "flex-1 h-9 inline-flex items-center justify-center gap-1.5 text-xs font-medium bg-primary text-primary-foreground rounded-lg hover:opacity-95 transition",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Navigation, { className: "h-3.5 w-3.5" }),
                  t.navigate
                ]
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "button",
              {
                type: "button",
                onClick: (e) => {
                  e.stopPropagation();
                  onRemove();
                },
                className: "flex-1 h-9 inline-flex items-center justify-center gap-1.5 text-xs font-medium rounded-lg transition bg-destructive/10 text-destructive border border-destructive/40 hover:bg-destructive/20",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "h-3.5 w-3.5" }),
                  t.removeStop
                ]
              }
            )
          ] }),
          stop.alternatives.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-3 pt-3 border-t border-border", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "button",
              {
                type: "button",
                onClick: (e) => {
                  e.stopPropagation();
                  setShowAlts((v) => !v);
                },
                className: "flex items-center gap-1 text-xs font-medium text-primary hover:text-primary-glow transition",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronDown, { className: cn("h-3.5 w-3.5 transition-transform", showAlts && "rotate-180") }),
                  showAlts ? t.hideAlternatives : `${t.changeStation} (${stop.alternatives.length} ${t.alternatives})`
                ]
              }
            ),
            showAlts && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-2 space-y-1.5", children: stop.alternatives.map((alt) => /* @__PURE__ */ jsxRuntimeExports.jsx(
              AlternativeRow,
              {
                alt,
                onSwap: () => onSwap(alt.station.id),
                onHover: () => onAlternativeHover(alt.station.id),
                onLeave: () => onAlternativeHover(null),
                language
              },
              alt.station.id
            )) })
          ] })
        ] })
      ] })
    }
  );
}
function ResultsPanel({
  result,
  highlightedStopNumber,
  onHighlight,
  onEdit,
  onAddStation,
  onSwapStation,
  onRemoveStation,
  onAlternativeHover,
  forcedStationIds,
  origin,
  destination,
  mode = "organize",
  language
}) {
  const t = resultsCopy[language];
  const hours = Math.floor(result.route.duration_min / 60);
  const minutes = result.route.duration_min % 60;
  const forcedSet = new Set(forcedStationIds);
  const remaining = result.meta.remaining_range_km;
  const margin = result.meta.safety_margin_km;
  const canStart = remaining >= margin;
  const isNavigate = mode === "navigate";
  const buildMapsUrl = (provider) => {
    const poly = result.route.polyline;
    const cityNames = new Set(CITIES.map((c) => c.toLowerCase().trim()));
    const isCity = (s) => cityNames.has(s.toLowerCase().trim());
    const originParam = isCity(origin) || !poly.length ? origin : `${poly[0][0]},${poly[0][1]}`;
    const destParam = isCity(destination) || !poly.length ? destination : `${poly[poly.length - 1][0]},${poly[poly.length - 1][1]}`;
    const stops = result.stops.map((s) => `${s.station.lat},${s.station.lng}`);
    if (provider === "google") {
      const waypoints = stops.length > 0 ? `&waypoints=${stops.join("|")}` : "";
      return `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(originParam)}&destination=${encodeURIComponent(destParam)}${waypoints}&travelmode=driving`;
    }
    const appleStops = stops.map((s) => encodeURIComponent(s)).join("+to:");
    const appleRoute = appleStops ? `https://maps.apple.com/?dirflg=d&saddr=${encodeURIComponent(originParam)}&daddr=${appleStops}+to:${encodeURIComponent(destParam)}` : `https://maps.apple.com/?dirflg=d&saddr=${encodeURIComponent(originParam)}&daddr=${encodeURIComponent(destParam)}`;
    return appleRoute;
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col h-full", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-5 py-4 border-b border-border bg-gradient-to-r from-primary-soft/60 to-card flex items-center justify-between gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-4 text-sm flex-wrap", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(MapPin, { className: "h-4 w-4 text-primary" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-bold", children: [
            result.route.distance_km,
            " km"
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-border", children: "·" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { className: "h-4 w-4 text-primary" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-bold", children: [
            hours,
            "h ",
            minutes,
            "m"
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-border", children: "·" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Fuel, { className: "h-4 w-4 text-primary" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-bold", children: [
            result.stops.length,
            " ",
            result.stops.length === 1 ? t.stopSingular : t.stopPlural
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        Button,
        {
          variant: "outline",
          size: "sm",
          onClick: onEdit,
          className: "h-8 gap-1.5 text-xs",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "h-3 w-3" }),
            t.edit
          ]
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 overflow-y-auto px-5 py-4 pb-24 md:pb-6 space-y-3", children: [
      result.warnings.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg bg-warning/15 border border-warning/40 p-3 flex gap-2.5 text-xs", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "h-4 w-4 text-warning-foreground flex-shrink-0 mt-0.5" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-1", children: result.warnings.map((w, i) => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: w }, i)) })
      ] }),
      result.stops.length === 0 && result.warnings.length === 0 && (isNavigate ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-xl border border-border bg-secondary/40 p-4 text-xs text-muted-foreground leading-relaxed", children: t.routeReadyHelp }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-center py-6 text-sm text-muted-foreground", children: t.noStops })),
      result.stops.map((stop) => {
        const isPinned = highlightedStopNumber === stop.stop_number;
        return /* @__PURE__ */ jsxRuntimeExports.jsx(
          StopCard,
          {
            stop,
            highlighted: isPinned,
            onHover: () => {
              if (highlightedStopNumber == null) onHighlight(stop.stop_number);
            },
            onLeave: () => {
            },
            onClick: () => onHighlight(isPinned ? null : stop.stop_number),
            onAdd: () => onAddStation(stop.station.id),
            onRemove: () => onRemoveStation(stop.station.id),
            onSwap: (newId) => onSwapStation(stop.station.id, newId),
            onAlternativeHover,
            isAdded: forcedSet.has(stop.station.id) || stop.is_user_added === true,
            language
          },
          stop.stop_number
        );
      }),
      isNavigate ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl p-4 shadow-md text-primary-foreground bg-gradient-to-br from-primary to-primary-glow", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs opacity-90", children: t.ready }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-semibold text-base mt-0.5", children: t.startNavigation }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-3 flex gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "a",
            {
              href: buildMapsUrl("google"),
              target: "_blank",
              rel: "noopener noreferrer",
              className: "flex-1 h-10 inline-flex items-center justify-center gap-1.5 text-xs font-semibold bg-white/95 text-foreground rounded-lg hover:bg-white transition",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(ExternalLink, { className: "h-3.5 w-3.5" }),
                "Google Maps"
              ]
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "a",
            {
              href: buildMapsUrl("apple"),
              target: "_blank",
              rel: "noopener noreferrer",
              className: "flex-1 h-10 inline-flex items-center justify-center gap-1.5 text-xs font-semibold bg-white/20 text-white border border-white/30 rounded-lg hover:bg-white/30 transition",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(ExternalLink, { className: "h-3.5 w-3.5" }),
                "Apple Maps"
              ]
            }
          )
        ] })
      ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: cn(
        "rounded-xl p-4 shadow-md text-primary-foreground bg-gradient-to-br",
        canStart ? "from-primary to-primary-glow" : "from-destructive to-destructive/70"
      ), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs opacity-90", children: t.arrival }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-semibold text-base mt-0.5", children: t.remainingRange })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-right", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-2xl font-bold", children: remaining }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs opacity-90", children: "km" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-3 text-[11px] opacity-90", children: [
          t.safetyMargin,
          " ",
          margin,
          " km"
        ] }),
        !canStart && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-3 flex items-center gap-2 bg-white/15 rounded-lg px-3 py-2 text-xs font-medium", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "h-4 w-4" }),
          t.notEnoughRange
        ] }),
        canStart && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-3 space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[11px] font-medium opacity-90", children: t.launchWith }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "a",
              {
                href: buildMapsUrl("google"),
                target: "_blank",
                rel: "noopener noreferrer",
                className: "flex-1 h-10 inline-flex items-center justify-center gap-1.5 text-xs font-semibold bg-white/95 text-foreground rounded-lg hover:bg-white transition",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(ExternalLink, { className: "h-3.5 w-3.5" }),
                  "Google Maps"
                ]
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "a",
              {
                href: buildMapsUrl("apple"),
                target: "_blank",
                rel: "noopener noreferrer",
                className: "flex-1 h-10 inline-flex items-center justify-center gap-1.5 text-xs font-semibold bg-white/20 text-white border border-white/30 rounded-lg hover:bg-white/30 transition",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(ExternalLink, { className: "h-3.5 w-3.5" }),
                  "Apple Maps"
                ]
              }
            )
          ] })
        ] })
      ] })
    ] })
  ] });
}
const sheetCopy = {
  it: {
    cash: "Contanti",
    card: "Carta",
    app: "App",
    closed: "Chiuso",
    allDay: "24 ore",
    status: "Stato:",
    openNow: "Aperto ora",
    closedNow: "Chiuso ora",
    unknown: "Sconosciuto",
    price: "Prezzo:",
    operator: "Operatore:",
    payments: "Pagamenti:",
    weeklyHours: "Orari settimanali",
    today: "Oggi",
    removeRoute: "Rimuovi dal percorso",
    addRoute: "Aggiungi al percorso",
    close: "Chiudi",
    days: DAY_LABELS_IT
  },
  en: {
    cash: "Cash",
    card: "Card",
    app: "App",
    closed: "Closed",
    allDay: "24 hours",
    status: "Status:",
    openNow: "Open now",
    closedNow: "Closed now",
    unknown: "Unknown",
    price: "Price:",
    operator: "Operator:",
    payments: "Payments:",
    weeklyHours: "Weekly hours",
    today: "Today",
    removeRoute: "Remove from route",
    addRoute: "Add to route",
    close: "Close",
    days: {
      monday: "Monday",
      tuesday: "Tuesday",
      wednesday: "Wednesday",
      thursday: "Thursday",
      friday: "Friday",
      saturday: "Saturday",
      sunday: "Sunday"
    }
  }
};
function formatIntervals(intervals, language) {
  const t = sheetCopy[language];
  if (intervals === null) return t.closed;
  if (!intervals.length) return t.closed;
  if (intervals.length === 1 && intervals[0].open === "00:00" && intervals[0].close === "23:59") return t.allDay;
  return intervals.map((i) => `${i.open}–${i.close}`).join(" / ");
}
function paymentLabel(method, language) {
  const t = sheetCopy[language];
  if (method === "cash") return t.cash;
  if (method === "card") return t.card;
  if (method === "app") return t.app;
  return method;
}
function StationSheet({ station, onClose, onAddStation, onRemoveStation, isAdded, canAdd, language }) {
  if (!station) return null;
  const t = sheetCopy[language];
  const now = /* @__PURE__ */ new Date();
  const todayKey = dayKeyFromDate(now);
  const openNow = isStationOpenAt(station, now);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "div",
      {
        className: "fixed inset-0 z-[1100] bg-foreground/20 backdrop-blur-[2px] animate-in fade-in duration-200",
        onClick: onClose
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "fixed left-1/2 -translate-x-1/2 bottom-4 z-[1101] w-[calc(100%-2rem)] max-w-md bg-card rounded-2xl shadow-[var(--shadow-panel)] border border-border animate-in slide-in-from-bottom-4 duration-300 max-h-[85vh] overflow-hidden flex flex-col", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-5 overflow-y-auto", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between gap-3 mb-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-bold text-lg leading-tight", children: station.name }),
          station.address && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-sm text-muted-foreground mt-1 flex items-start gap-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(MapPin, { className: "h-3.5 w-3.5 mt-0.5 flex-shrink-0" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
              station.address,
              ", ",
              station.city,
              " (",
              station.province,
              ")"
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            onClick: onClose,
            title: t.close,
            className: "h-8 w-8 rounded-full hover:bg-secondary flex items-center justify-center transition flex-shrink-0",
            children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "h-4 w-4" })
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2.5 text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { className: "h-4 w-4 text-muted-foreground flex-shrink-0" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: t.status }),
          openNow === true && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] font-semibold px-2 py-0.5 rounded-full bg-success text-success-foreground", children: t.openNow }),
          openNow === false && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] font-semibold px-2 py-0.5 rounded-full bg-destructive text-destructive-foreground", children: t.closedNow }),
          openNow === null && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] font-semibold px-2 py-0.5 rounded-full bg-muted text-muted-foreground", children: t.unknown }),
          station.always_open && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] font-semibold px-2 py-0.5 rounded-full bg-primary-soft text-primary ml-auto", children: "H24" })
        ] }),
        station.price != null && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "h-4 w-4 flex items-center justify-center text-muted-foreground font-bold text-sm", children: "€" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: t.price }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-bold text-base", children: [
            "€ ",
            station.price.toFixed(3)
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-muted-foreground", children: "/kg" })
        ] }),
        station.operator && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Building2, { className: "h-4 w-4 text-muted-foreground flex-shrink-0" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: t.operator }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: station.operator })
        ] }),
        station.payment_methods && station.payment_methods.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-2.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CreditCard, { className: "h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: t.payments }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap gap-1", children: station.payment_methods.map((p) => /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[11px] font-medium px-2 py-0.5 rounded-md bg-secondary", children: paymentLabel(p, language) }, p)) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2", children: t.weeklyHours }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-lg border border-border overflow-hidden", children: DAY_ORDER.map((d) => {
          const intervals = station.always_open ? [{ open: "00:00", close: "23:59" }] : station.opening_hours[d];
          const isToday = d === todayKey;
          const isClosed = intervals === null || Array.isArray(intervals) && intervals.length === 0;
          return /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "div",
            {
              className: `flex items-center justify-between px-3 py-2 text-sm border-b border-border last:border-b-0 ${isToday ? "bg-primary-soft/40 font-semibold" : ""}`,
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: isToday ? "text-foreground" : "text-muted-foreground", children: [
                  t.days[d],
                  isToday && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "ml-1.5 text-[10px] uppercase text-primary", children: t.today })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: isClosed ? "text-destructive" : "text-foreground", children: formatIntervals(intervals, language) })
              ]
            },
            d
          );
        }) })
      ] }),
      canAdd && (isAdded ? /* @__PURE__ */ jsxRuntimeExports.jsxs(
        Button,
        {
          onClick: () => {
            onRemoveStation?.(station.id);
            onClose();
          },
          variant: "outline",
          className: "w-full mt-5 h-11 border-destructive/40 text-destructive hover:bg-destructive/10 font-semibold gap-2",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "h-4 w-4" }),
            t.removeRoute
          ]
        }
      ) : /* @__PURE__ */ jsxRuntimeExports.jsxs(
        Button,
        {
          onClick: () => {
            onAddStation?.(station.id);
            onClose();
          },
          className: "w-full mt-5 h-11 bg-gradient-to-r from-primary to-primary-glow font-semibold gap-2",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-4 w-4" }),
            t.addRoute
          ]
        }
      ))
    ] }) })
  ] });
}
function useStations() {
  const [ready, setReady] = reactExports.useState(isStationsReady());
  const [error, setError] = reactExports.useState(null);
  reactExports.useEffect(() => {
    if (ready) return;
    let cancelled = false;
    ensureStationsLoaded().then(() => {
      if (!cancelled) setReady(true);
    }).catch((e) => {
      if (!cancelled) {
        setError(e?.message ?? "Errore caricamento distributori");
      }
    });
    return () => {
      cancelled = true;
    };
  }, [ready]);
  return { ready, error };
}
const MapView = reactExports.lazy(() => import("./MapView-DO87jVkh.mjs").then((m) => ({
  default: m.MapView
})));
function HomePage() {
  const [language, setLanguageState] = reactExports.useState(null);
  const {
    ready: stationsReady2,
    error: stationsError
  } = useStations();
  const [result, setResult] = reactExports.useState(null);
  const [loading, setLoading] = reactExports.useState(false);
  const [highlighted, setHighlighted] = reactExports.useState(null);
  const [selectedStation, setSelectedStation] = reactExports.useState(null);
  const [formCollapsed, setFormCollapsed] = reactExports.useState(false);
  const [drawerOpen, setDrawerOpen] = reactExports.useState(true);
  const [lastReq, setLastReq] = reactExports.useState(null);
  const [forcedStationIds, setForcedStationIds] = reactExports.useState([]);
  const [hoveredAltId, setHoveredAltId] = reactExports.useState(null);
  const [excludedStationIds, setExcludedStationIds] = reactExports.useState([]);
  const [mobileFormOpen, setMobileFormOpen] = reactExports.useState(false);
  const t = copy[language ?? "it"];
  reactExports.useEffect(() => {
    const stored = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);
    if (stored === "it" || stored === "en") setLanguageState(stored);
  }, []);
  const setLanguage = (next) => {
    window.localStorage.setItem(LANGUAGE_STORAGE_KEY, next);
    setLanguageState(next);
  };
  const runPlan = async (req) => {
    setLoading(true);
    const res = await mockPlan(req);
    setResult(res);
    setLastReq(req);
    setLoading(false);
  };
  const handlePlan = async (req) => {
    setForcedStationIds([]);
    setExcludedStationIds([]);
    await runPlan({
      ...req,
      forced_station_ids: [],
      excluded_station_ids: []
    });
    setFormCollapsed(true);
    setDrawerOpen(true);
    setMobileFormOpen(false);
  };
  const handleEdit = () => {
    setFormCollapsed(false);
    setResult(null);
    setForcedStationIds([]);
    setExcludedStationIds([]);
    setLastReq(null);
    setMobileFormOpen(true);
  };
  const handleAddStation = async (stationId) => {
    if (!lastReq) return;
    if (forcedStationIds.includes(stationId)) return;
    const next = [...forcedStationIds, stationId];
    setForcedStationIds(next);
    setHighlighted(null);
    await runPlan({
      ...lastReq,
      forced_station_ids: next,
      excluded_station_ids: excludedStationIds
    });
    if (window.innerWidth < 768) setDrawerOpen(false);
  };
  const handleSwapStation = async (oldId, newId) => {
    if (!lastReq) return;
    const nextForced = forcedStationIds.filter((id) => id !== oldId).concat(newId);
    const nextExcluded = [...excludedStationIds.filter((id) => id !== newId), oldId];
    setForcedStationIds(nextForced);
    setExcludedStationIds(nextExcluded);
    setHighlighted(null);
    await runPlan({
      ...lastReq,
      forced_station_ids: nextForced,
      excluded_station_ids: nextExcluded
    });
  };
  const handleRemoveStation = async (stationId) => {
    if (!lastReq) return;
    const removed = ALL_STATIONS.find((s) => s.id === stationId);
    const RADIUS_KM = 40;
    const toRad = (x) => x * Math.PI / 180;
    const distKm = (a, b) => {
      const R = 6371;
      const dLat = toRad(b.lat - a.lat);
      const dLng = toRad(b.lng - a.lng);
      const h = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
      return 2 * R * Math.asin(Math.sqrt(h));
    };
    const nearby = removed ? ALL_STATIONS.filter((s) => distKm(removed, s) <= RADIUS_KM).map((s) => s.id) : [stationId];
    const nextForced = forcedStationIds.filter((id) => !nearby.includes(id));
    const nextExcluded = Array.from(/* @__PURE__ */ new Set([...excludedStationIds, ...nearby]));
    setForcedStationIds(nextForced);
    setExcludedStationIds(nextExcluded);
    setHighlighted(null);
    await runPlan({
      ...lastReq,
      forced_station_ids: nextForced,
      excluded_station_ids: nextExcluded
    });
  };
  const buildGoogleMapsUrl = () => {
    if (!result || !lastReq) return null;
    const poly = result.route.polyline;
    const cityNames = new Set(CITIES.map((c) => c.toLowerCase().trim()));
    const isCity = (s) => cityNames.has(s.toLowerCase().trim());
    const originParam = isCity(lastReq.origin) || !poly.length ? lastReq.origin : `${poly[0][0]},${poly[0][1]}`;
    const destParam = isCity(lastReq.destination) || !poly.length ? lastReq.destination : `${poly[poly.length - 1][0]},${poly[poly.length - 1][1]}`;
    const stops = result.stops.map((s) => `${s.station.lat},${s.station.lng}`);
    const waypoints = stops.length > 0 ? `&waypoints=${stops.join("|")}` : "";
    return `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(originParam)}&destination=${encodeURIComponent(destParam)}${waypoints}&travelmode=driving`;
  };
  const buildAppleMapsUrl = () => {
    if (!result || !lastReq) return null;
    const poly = result.route.polyline;
    const cityNames = new Set(CITIES.map((c) => c.toLowerCase().trim()));
    const isCity = (s) => cityNames.has(s.toLowerCase().trim());
    const originParam = isCity(lastReq.origin) || !poly.length ? lastReq.origin : `${poly[0][0]},${poly[0][1]}`;
    const destParam = isCity(lastReq.destination) || !poly.length ? lastReq.destination : `${poly[poly.length - 1][0]},${poly[poly.length - 1][1]}`;
    const stops = result.stops.map((s) => encodeURIComponent(`${s.station.lat},${s.station.lng}`));
    if (stops.length > 0) {
      return `https://maps.apple.com/?dirflg=d&saddr=${encodeURIComponent(originParam)}&daddr=${stops.join("+to:")}+to:${encodeURIComponent(destParam)}`;
    }
    return `https://maps.apple.com/?dirflg=d&saddr=${encodeURIComponent(originParam)}&daddr=${encodeURIComponent(destParam)}`;
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative w-screen h-screen overflow-hidden bg-background", children: [
    !language && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 z-[3000] flex items-center justify-center bg-background/90 backdrop-blur-md p-5", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "w-full max-w-sm rounded-2xl border border-border bg-card shadow-[var(--shadow-panel)] p-5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-12 w-12 rounded-2xl bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center shadow-md mb-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Fuel, { className: "h-6 w-6 text-primary-foreground" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-xl font-bold text-foreground", children: t.chooseTitle }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground mt-1", children: t.chooseSubtitle }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 gap-2 mt-5", children: ["it", "en"].map((lang) => /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", onClick: () => setLanguage(lang), className: "relative h-24 overflow-hidden rounded-xl border border-border bg-secondary/50 text-sm font-semibold text-foreground hover:border-primary hover:bg-primary-soft transition", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "absolute -right-2 -bottom-5 text-7xl opacity-25 saturate-125", "aria-hidden": "true", children: languageFlags[lang] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "relative z-10 flex h-full flex-col items-start justify-end gap-1 p-3 text-left", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-2xl", "aria-hidden": "true", children: languageFlags[lang] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: languageNames[lang] })
        ] })
      ] }, lang)) })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(reactExports.Suspense, { fallback: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-screen h-screen bg-secondary animate-pulse" }), children: /* @__PURE__ */ jsxRuntimeExports.jsx(MapView, { result, highlightedStopNumber: highlighted, externalHoveredStationId: hoveredAltId, onStationClick: setSelectedStation }) }),
    !stationsReady2 && !stationsError && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 z-[2500] flex items-center justify-center bg-background/70 backdrop-blur-sm", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center gap-3 p-6 rounded-2xl bg-card border border-border shadow-[var(--shadow-panel)]", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-10 w-10 rounded-full border-4 border-primary/20 border-t-primary animate-spin" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-medium text-foreground", children: t.loadingStations })
    ] }) }),
    stationsError && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 z-[2500] flex items-center justify-center bg-background/80 backdrop-blur-sm p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-sm flex flex-col items-center gap-3 p-6 rounded-2xl bg-card border border-destructive/40 shadow-[var(--shadow-panel)] text-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "h-8 w-8 text-destructive" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-semibold", children: t.stationLoadError }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: stationsError }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[11px] text-muted-foreground", children: t.stationLoadHint })
    ] }) }),
    loading && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 z-[2000] flex items-center justify-center bg-background/60 backdrop-blur-sm", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center gap-4 p-8 rounded-2xl bg-card border border-border shadow-[var(--shadow-panel)]", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative h-16 w-16", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 rounded-full border-4 border-primary/20" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 rounded-full border-4 border-transparent border-t-primary animate-spin" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Fuel, { className: "h-6 w-6 text-primary animate-pulse" }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-semibold text-foreground", children: t.calculating }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mt-1", children: t.calculatingSub })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: cn(
      "absolute z-[1500] transition-all duration-300",
      "md:top-4 md:left-4 md:bottom-4 md:w-[380px]",
      "top-0 left-0 right-0 bottom-0 md:bottom-4",
      // Mobile visibility
      !mobileFormOpen && "hidden md:block",
      // Desktop: hide when form is collapsed after a plan
      result && formCollapsed && "md:hidden",
      formCollapsed && "md:opacity-0 md:pointer-events-none md:-translate-x-4"
    ), children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-card md:rounded-2xl shadow-[var(--shadow-panel)] border border-border h-full overflow-y-auto px-5 pb-5 pt-16 md:p-6 relative", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => setMobileFormOpen(false), className: "md:hidden absolute top-3 right-3 h-9 w-9 inline-flex items-center justify-center rounded-full bg-secondary text-foreground hover:bg-secondary/80 transition", "aria-label": "Chiudi", children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "h-4 w-4" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TripForm, { onPlan: handlePlan, loading, language: language ?? "it", onLanguageChange: setLanguage })
    ] }) }),
    !result && !mobileFormOpen && stationsReady2 && /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", onClick: () => setMobileFormOpen(true), className: "md:hidden absolute left-1/2 -translate-x-1/2 top-5 z-[1100] inline-flex items-center gap-2 px-5 h-11 rounded-full bg-card/85 text-foreground font-medium text-sm shadow-[var(--shadow-card)] border border-border/60 backdrop-blur-md active:scale-[0.96] transition-transform duration-150", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(MapPinned, { className: "h-4 w-4 text-primary" }),
      t.planTrip
    ] }),
    result && formCollapsed && /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: handleEdit, className: "hidden md:flex absolute top-4 left-4 z-[1000] items-center gap-2 bg-card border border-border rounded-full px-4 py-2.5 shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-panel)] transition text-sm font-medium", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronUp, { className: "h-4 w-4 rotate-[-90deg]" }),
      t.editTrip
    ] }),
    result && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: cn("absolute z-[1000] transition-all duration-300 ease-out", "md:bottom-4 md:right-4 md:w-[420px] md:max-h-[calc(100vh-2rem)] md:rounded-2xl", "left-0 right-0 bottom-0 md:left-auto", drawerOpen ? "h-[80vh] md:h-[calc(100vh-2rem)]" : "h-[64px]"), children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-card border border-border md:rounded-2xl rounded-t-3xl shadow-[var(--shadow-panel)] overflow-hidden h-full flex flex-col", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => setDrawerOpen(!drawerOpen), className: "md:hidden flex flex-col items-center justify-center py-2 border-b border-border", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-1 w-10 rounded-full bg-border mb-1" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[11px] text-muted-foreground flex items-center gap-1", children: drawerOpen ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronDown, { className: "h-3 w-3" }),
          t.reduce
        ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronUp, { className: "h-3 w-3" }),
          result.stops.length,
          " ",
          result.stops.length === 1 ? t.stopSingular : t.stopPlural,
          " · ",
          result.route.distance_km,
          " km"
        ] }) })
      ] }),
      drawerOpen && /* @__PURE__ */ jsxRuntimeExports.jsx(ResultsPanel, { result, highlightedStopNumber: highlighted, onHighlight: setHighlighted, onEdit: handleEdit, onAddStation: handleAddStation, onSwapStation: handleSwapStation, onRemoveStation: handleRemoveStation, onAlternativeHover: setHoveredAltId, forcedStationIds, origin: lastReq?.origin ?? "", destination: lastReq?.destination ?? "", mode: lastReq?.mode, language: language ?? "it" })
    ] }) }),
    result && !drawerOpen && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "md:hidden absolute left-3 right-3 bottom-[76px] z-[1100] flex gap-2 pointer-events-none", children: [
      buildGoogleMapsUrl() && /* @__PURE__ */ jsxRuntimeExports.jsxs("a", { href: buildGoogleMapsUrl(), target: "_blank", rel: "noopener noreferrer", className: "pointer-events-auto flex-1 h-12 inline-flex items-center justify-center gap-1.5 text-xs font-semibold bg-white text-foreground rounded-full shadow-[var(--shadow-panel)] active:scale-[0.98] transition border border-border", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(ExternalLink, { className: "h-3.5 w-3.5" }),
        "Google Maps"
      ] }),
      buildAppleMapsUrl() && /* @__PURE__ */ jsxRuntimeExports.jsxs("a", { href: buildAppleMapsUrl(), target: "_blank", rel: "noopener noreferrer", className: "pointer-events-auto flex-1 h-12 inline-flex items-center justify-center gap-1.5 text-xs font-semibold bg-gradient-to-r from-primary to-primary-glow text-primary-foreground rounded-full shadow-[var(--shadow-panel)] active:scale-[0.98] transition", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(ExternalLink, { className: "h-3.5 w-3.5" }),
        "Apple Maps"
      ] })
    ] }),
    result && drawerOpen && /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => setDrawerOpen(false), className: "md:hidden absolute top-3 left-1/2 -translate-x-1/2 z-[1100] inline-flex items-center gap-1.5 bg-card/95 backdrop-blur border border-border rounded-full px-4 py-2 shadow-[var(--shadow-card)] text-xs font-semibold", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronDown, { className: "h-3.5 w-3.5" }),
      t.showMap
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(StationSheet, { station: selectedStation, onClose: () => setSelectedStation(null), canAdd: !!result, isAdded: selectedStation ? forcedStationIds.includes(selectedStation.id) : false, onAddStation: handleAddStation, onRemoveStation: handleRemoveStation, language: language ?? "it" })
  ] });
}
const index = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  component: HomePage
}, Symbol.toStringTag, { value: "Module" }));
export {
  ALL_STATIONS as A,
  index as a,
  isStationOpenAt as i
};
