export type DayKey =
  | "monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday" | "sunday";

// One day can have multiple intervals (e.g. lunch break).
// [] = chiuso tutto il giorno (dato certo); null = orario NON conosciuto.
// La distinzione conta: un impianto senza dati non va mostrato come chiuso.
export type DayHours = { open: string; close: string }[] | null;

export type WeeklyHours = Record<DayKey, DayHours>;

export type Station = {
  id: number;
  name: string;
  address?: string | null;
  city: string;
  province: string;
  price?: number | null;
  lat: number;
  lng: number;
  operator?: string | null;
  opening_hours: WeeklyHours;
  always_open: boolean;
  /** true se il MIMIT registra un prezzo self-service per l'impianto */
  self_service?: boolean;
  /** true se l'erogazione self e' attiva anche fuori dall'orario del presidio (segnalazioni) */
  self_h24?: boolean;
  /** telefono dell'impianto (da OpenStreetMap), null se non disponibile */
  phone?: string | null;
  /** da dove vengono gli orari: "osm" (OpenStreetMap) o "metanoauto" (storico) */
  hours_source?: "osm" | "metanoauto" | "segnalazione" | null;
  payment_methods?: string[];
};

export type StopAlternative = {
  station: Station;
  detour_km: number;        // perpendicular distance from route (one-way)
  extra_trip_km: number;    // additional km to the total trip if this alt is chosen instead of the recommended stop
  is_open_at_eta: boolean | null;
};

export type Stop = {
  stop_number: number;
  station: Station;
  is_open_at_eta: boolean | null; // null = unknown
  eta_label: string;
  eta_iso: string;
  detour_km: number;
  km_from_prev: number; // km from origin (if first) or from previous stop
  alternatives: StopAlternative[];
  is_user_added?: boolean;
};

export type CandidateStation = {
  station: Station;
  detour_km: number;
  cum_km: number;
};

export type PlanResult = {
  route: { distance_km: number; duration_min: number; polyline: [number, number][] };
  stops: Stop[];
  candidates: CandidateStation[];
  warnings: string[];
  meta: { current_range_km: number; remaining_range_km: number; safety_margin_km: number };
};

export type Waypoint = {
  label: string;             // displayed text (city name or station name)
  lat?: number;              // optional explicit coords (forced stop)
  lng?: number;
  forced_station_id?: number;
};

/** Quali distributori considerare nella pianificazione. */
export type StationFilter = "all" | "highway" | "no_highway";

/**
 * Impianto in autostrada: riconosciuto dal nome (A1, A14, "autostrada", "ADS"
 * = area di servizio). Usato da mappa e planner.
 */
export function isHighwayStation(s: Station): boolean {
  // Nel MIMIT il nome e' spesso solo "ESINO EST" o "ARDA OVEST": l'autostrada
  // sta nell'indirizzo ("Autostrada A14 BOLOGNA-BARI-TARANTO, Km. ..."). Con il
  // solo nome si riconoscevano 7 impianti su ~1500; con l'indirizzo circa 90.
  const name = s.name.toLowerCase();
  const addr = (s.address ?? "").toLowerCase();
  return (
    /\b(a\d+|autostrad|ads)\b/.test(name) ||
    /\bautostrad|\braccordo autostradale|\btangenziale\b|\ba\d{1,2}\b/.test(addr)
  );
}

export type PlanRequest = {
  origin: string;
  destination: string;
  waypoints: (string | Waypoint)[];
  current_range_km: number;
  max_range_km: number;
  safety_margin_km: number;
  depart_at?: string | null;
  forced_station_ids?: number[]; // stations that MUST be in the stop list
  excluded_station_ids?: number[]; // stations to exclude from picks
  mode?: "navigate" | "organize";
  station_filter?: StationFilter; // default "all"
};

export const DAY_ORDER: DayKey[] = [
  "monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday",
];

export const DAY_LABELS_IT: Record<DayKey, string> = {
  monday: "Lunedì",
  tuesday: "Martedì",
  wednesday: "Mercoledì",
  thursday: "Giovedì",
  friday: "Venerdì",
  saturday: "Sabato",
  sunday: "Domenica",
};

// JS Date.getDay(): 0=Sun..6=Sat. Map to our keys.
export function dayKeyFromDate(d: Date): DayKey {
  return (["sunday","monday","tuesday","wednesday","thursday","friday","saturday"] as DayKey[])[d.getDay()];
}

export function isStationOpenAt(station: Station, date: Date): boolean | null {
  // H24 dichiarato, oppure self che eroga anche fuori orario (segnalato).
  if (station.always_open || station.self_h24) return true;
  const day = dayKeyFromDate(date);
  const intervals = station.opening_hours?.[day];
  if (intervals === undefined || intervals === null) return null; // orario sconosciuto
  if (!intervals.length) return false; // chiuso tutto il giorno
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
