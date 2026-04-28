import type { PlanRequest, PlanResult, Station, CandidateStation, StopAlternative, Waypoint } from "./metan-types";
import { isStationOpenAt } from "./metan-types";
import rawStations from "./metan-stations.json";

// Title-case Italian city names like "REGGIO EMILIA" -> "Reggio Emilia"
function titleCase(s: string): string {
  return s
    .toLowerCase()
    .split(/(\s|')/)
    .map((p) => (p.length > 1 ? p[0].toUpperCase() + p.slice(1) : p))
    .join("");
}

export const ALL_STATIONS: Station[] = (rawStations as Station[]).map((s) => ({
  ...s,
  city: titleCase(s.city),
  name: titleCase(s.name),
  address: s.address ? titleCase(s.address) : s.address,
}));

// Build city -> centroid map (average of all stations in that city)
const CITY_INDEX = new Map<string, { lat: number; lng: number }>();
{
  const sums = new Map<string, { lat: number; lng: number; n: number }>();
  for (const s of ALL_STATIONS) {
    const key = s.city.toLowerCase();
    const cur = sums.get(key) ?? { lat: 0, lng: 0, n: 0 };
    cur.lat += s.lat; cur.lng += s.lng; cur.n += 1;
    sums.set(key, cur);
  }
  for (const [k, v] of sums) {
    CITY_INDEX.set(k, { lat: v.lat / v.n, lng: v.lng / v.n });
  }
}

// Extra well-known Italian cities (fallback if not represented in dataset)
const EXTRA_CITIES: Record<string, { lat: number; lng: number }> = {
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
  bolzano: { lat: 46.4983, lng: 11.3548 },
};
for (const [k, v] of Object.entries(EXTRA_CITIES)) {
  if (!CITY_INDEX.has(k)) CITY_INDEX.set(k, v);
}

export function geocodeCity(name: string): { lat: number; lng: number } | null {
  if (!name) return null;
  const key = name.trim().toLowerCase();
  if (CITY_INDEX.has(key)) return CITY_INDEX.get(key)!;
  // try fuzzy: starts-with
  for (const [k, v] of CITY_INDEX) {
    if (k.startsWith(key) || key.startsWith(k)) return v;
  }
  return null;
}

export const CITIES: string[] = Array.from(
  new Set([
    ...Array.from(CITY_INDEX.keys()).map(titleCase),
  ])
).sort();

// Haversine distance in km
function haversine(a: [number, number], b: [number, number]): number {
  const R = 6371;
  const toRad = (x: number) => (x * Math.PI) / 180;
  const dLat = toRad(b[0] - a[0]);
  const dLng = toRad(b[1] - a[1]);
  const lat1 = toRad(a[0]);
  const lat2 = toRad(b[0]);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

// Distance from point P to segment AB in km
function pointToSegmentKm(p: [number, number], a: [number, number], b: [number, number]): { dist: number; t: number } {
  // Project in degree-space (good enough for short segments at IT latitudes)
  const ax = a[1], ay = a[0], bx = b[1], by = b[0], px = p[1], py = p[0];
  const dx = bx - ax, dy = by - ay;
  const len2 = dx * dx + dy * dy;
  let t = len2 > 0 ? ((px - ax) * dx + (py - ay) * dy) / len2 : 0;
  t = Math.max(0, Math.min(1, t));
  const proj: [number, number] = [ay + t * dy, ax + t * dx];
  return { dist: haversine(p, proj), t };
}

type RoutePoint = { latlng: [number, number]; cumKm: number };

function buildRoute(points: [number, number][]): { polyline: [number, number][]; cumulative: number[]; totalKm: number } {
  // Densify each segment so the polyline looks like a route and curvy enough for projection
  const polyline: [number, number][] = [];
  const cumulative: number[] = [];
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

type Candidate = {
  station: Station;
  cumKm: number;     // distance along route to closest projection
  detourKm: number;  // perpendicular distance to route
};

const MAX_DETOUR_KM = 8;

function candidatesAlongRoute(polyline: [number, number][], cumulative: number[]): Candidate[] {
  const out: Candidate[] = [];
  for (const s of ALL_STATIONS) {
    let best = { dist: Infinity, cumKm: 0 };
    for (let i = 0; i < polyline.length - 1; i++) {
      const seg = pointToSegmentKm([s.lat, s.lng], polyline[i], polyline[i + 1]);
      if (seg.dist < best.dist) {
        const segLen = cumulative[i + 1] - cumulative[i];
        best = { dist: seg.dist, cumKm: cumulative[i] + seg.t * segLen };
      }
    }
    if (best.dist <= MAX_DETOUR_KM) {
      out.push({ station: s, cumKm: best.cumKm, detourKm: Math.round(best.dist * 10) / 10 });
    }
  }
  return out.sort((a, b) => a.cumKm - b.cumKm);
}

function pickStops(
  candidates: Candidate[],
  totalKm: number,
  currentRange: number,
  maxRange: number,
  safety: number,
  forcedIds: Set<number> = new Set(),
  startTime: Date = new Date(),
  durationMin: number = 0,
): { picked: Candidate[]; warnings: string[] } {
  const usable = (range: number) => Math.max(0, range - safety);
  const picked: Candidate[] = [];
  const warnings: string[] = [];
  let pos = 0;
  let range = currentRange;
  let lastIdx = -1;

  const etaAt = (cumKm: number) => {
    const minutes = totalKm > 0 ? Math.round((cumKm / totalKm) * durationMin) : 0;
    return new Date(startTime.getTime() + minutes * 60_000);
  };

  // Build sorted list of forced candidates by cumKm
  const forced = candidates
    .map((c, i) => ({ c, i }))
    .filter((x) => forcedIds.has(x.c.station.id))
    .sort((a, b) => a.c.cumKm - b.c.cumKm);
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
      if (c.cumKm > bestCum) { bestCum = c.cumKm; bestIdx = i; }
    }

    if (bestIdx === -1 && !nextForced) break;
    if (bestIdx === -1) {
      warnings.push("Autonomia insufficiente per raggiungere la prossima tappa lungo il percorso.");
      break;
    }

    // Among reachable candidates in the last 25 km of reach, prefer OPEN first, then cheapest.
    const minCum = bestCum - 25;
    let chosen = -1;
    let chosenScore: [number, number] = [2, Infinity]; // [closedRank (0=open,1=unknown,2=closed), price]
    for (let i = lastIdx + 1; i <= bestIdx; i++) {
      const c = candidates[i];
      if (c.cumKm < minCum) continue;
      const open = isStationOpenAt(c.station, etaAt(c.cumKm));
      const openRank = open === true ? 0 : open === null ? 1 : 2;
      const price = c.station.price ?? Infinity;
      if (openRank < chosenScore[0] || (openRank === chosenScore[0] && price < chosenScore[1])) {
        chosen = i;
        chosenScore = [openRank, price];
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

const AVG_SPEED_KMH = 95; // highway-ish

async function fetchOsrmRoute(
  points: [number, number][],
): Promise<{ polyline: [number, number][]; distanceKm: number; durationMin: number } | null> {
  try {
    const coords = points.map(([lat, lng]) => `${lng},${lat}`).join(";");
    const url = `https://router.project-osrm.org/route/v1/driving/${coords}?overview=full&geometries=geojson`;
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 8000);
    const res = await fetch(url, { signal: ctrl.signal });
    clearTimeout(timer);
    if (!res.ok) return null;
    const data = await res.json();
    const route = data?.routes?.[0];
    if (!route) return null;
    const coordsArr: [number, number][] = route.geometry.coordinates.map(
      ([lng, lat]: [number, number]) => [lat, lng],
    );
    return {
      polyline: coordsArr,
      distanceKm: route.distance / 1000,
      durationMin: route.duration / 60,
    };
  } catch {
    return null;
  }
}

function cumulativeDistances(polyline: [number, number][]): number[] {
  const cum: number[] = [0];
  for (let i = 1; i < polyline.length; i++) {
    cum.push(cum[i - 1] + haversine(polyline[i - 1], polyline[i]));
  }
  return cum;
}

function resolveWaypoint(w: string | Waypoint): { point: [number, number] | null; label: string } {
  if (typeof w === "string") {
    const g = geocodeCity(w);
    return { point: g ? [g.lat, g.lng] : null, label: w };
  }
  if (typeof w.lat === "number" && typeof w.lng === "number") {
    return { point: [w.lat, w.lng], label: w.label };
  }
  const g = geocodeCity(w.label);
  return { point: g ? [g.lat, g.lng] : null, label: w.label };
}

export async function mockPlan(req: PlanRequest): Promise<PlanResult> {
  const points: [number, number][] = [];
  const missing: string[] = [];

  const originG = geocodeCity(req.origin);
  if (!originG) missing.push(req.origin);
  else points.push([originG.lat, originG.lng]);

  // Insert string/coord waypoints from the form first
  const formWaypoints: [number, number][] = [];
  for (const w of req.waypoints) {
    if (!w) continue;
    const { point, label } = resolveWaypoint(w);
    if (!point) missing.push(label);
    else formWaypoints.push(point);
  }
  points.push(...formWaypoints);

  const destG = geocodeCity(req.destination);
  if (!destG) missing.push(req.destination);
  else points.push([destG.lat, destG.lng]);

  // Forced station IDs: insert them as routing waypoints in geographic order
  // between origin and destination so OSRM physically routes through them.
  const forcedSet = new Set<number>(req.forced_station_ids ?? []);
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
    // Order forced stations by progress along origin->dest direction
    const ordered = forcedStations
      .map((s) => ({
        s,
        t: haversine(origin, [s.lat, s.lng]) / (haversine(origin, [s.lat, s.lng]) + haversine([s.lat, s.lng], dest) || 1),
        progress: haversine(origin, [s.lat, s.lng]) / totalDirect,
      }))
      .sort((a, b) => a.progress - b.progress);
    // Insert before destination
    const insertPos = points.length - 1;
    points.splice(insertPos, 0, ...ordered.map((x) => [x.s.lat, x.s.lng] as [number, number]));
  }

  if (points.length < 2) {
    return {
      route: { distance_km: 0, duration_min: 0, polyline: [] },
      stops: [],
      candidates: [],
      warnings: [
        missing.length
          ? `Città non riconosciuta: ${missing.join(", ")}.`
          : "Inserisci partenza e destinazione.",
      ],
      meta: {
        current_range_km: req.current_range_km,
        remaining_range_km: req.current_range_km,
        safety_margin_km: req.safety_margin_km,
      },
    };
  }

  // Try OSRM first for a real driving route
  const warnings: string[] = [];
  let polyline: [number, number][];
  let cumulative: number[];
  let totalKm: number;
  let durationMin: number;

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
    durationMin = Math.round((totalKm / AVG_SPEED_KMH) * 60);
    warnings.push("Routing stradale non disponibile: percorso approssimato in linea retta.");
  }

  const candidatesAll = candidatesAlongRoute(polyline, cumulative);

  // forcedSet was already computed above (used for routing waypoints)

  const startTime = req.depart_at ? new Date(req.depart_at) : new Date();

  const { picked, warnings: pickWarnings } = pickStops(
    candidatesAll,
    totalKm,
    req.current_range_km,
    req.max_range_km,
    req.safety_margin_km,
    forcedSet,
    startTime,
    durationMin,
  );
  warnings.push(...pickWarnings);

  // Build alternatives for each picked stop: candidates near same cumKm (within ±40 km), not already picked
  const pickedIds = new Set(picked.map((p) => p.station.id));

  const stops = picked.map((c, i) => {
    const minutes = Math.round((c.cumKm / totalKm) * durationMin);
    const eta = new Date(startTime.getTime() + minutes * 60_000);
    const etaStr = eta.toLocaleTimeString("it-IT", { hour: "2-digit", minute: "2-digit" });

    // Alternatives: candidates near same cumKm (within ±40 km), not already picked.
    // Take a pool by proximity, then re-rank: open first, then closed/unknown.
    const pool = candidatesAll
      .filter((cand) => !pickedIds.has(cand.station.id))
      .filter((cand) => Math.abs(cand.cumKm - c.cumKm) <= 40)
      .sort((a, b) => Math.abs(a.cumKm - c.cumKm) - Math.abs(b.cumKm - c.cumKm))
      .slice(0, 8)
      .map((cand) => ({
        station: cand.station,
        detour_km: cand.detourKm,
        is_open_at_eta: isStationOpenAt(cand.station, eta),
      }));

    const openAlts = pool.filter((a) => a.is_open_at_eta === true).slice(0, 2);
    const otherAlts = pool
      .filter((a) => a.is_open_at_eta !== true && !openAlts.includes(a))
      .slice(0, 2);
    const alts: StopAlternative[] = [...openAlts, ...otherAlts];

    return {
      stop_number: i + 1,
      station: c.station,
      is_open_at_eta: isStationOpenAt(c.station, eta),
      eta_label: `Arrivo stimato: ${etaStr}`,
      eta_iso: eta.toISOString(),
      detour_km: c.detourKm,
      alternatives: alts,
      is_user_added: forcedSet.has(c.station.id),
    };
  });

  // Remaining range at destination
  const lastCum = picked.length > 0 ? picked[picked.length - 1].cumKm : 0;
  const startingRange = picked.length > 0 ? req.max_range_km : req.current_range_km;
  const kmAfterLast = totalKm - lastCum;
  const remaining = Math.max(0, Math.round(startingRange - kmAfterLast));

  if (missing.length) warnings.unshift(`Città non riconosciuta: ${missing.join(", ")}.`);

  const candidates: CandidateStation[] = candidatesAll
    .filter((c) => !pickedIds.has(c.station.id))
    .map((c) => ({ station: c.station, detour_km: c.detourKm, cum_km: c.cumKm }));

  return {
    route: { distance_km: Math.round(totalKm), duration_min: durationMin, polyline },
    stops,
    candidates,
    warnings,
    meta: {
      current_range_km: req.current_range_km,
      remaining_range_km: remaining,
      safety_margin_km: req.safety_margin_km,
    },
  };
}


