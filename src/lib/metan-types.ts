export type DayKey =
  | "monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday" | "sunday";

// One day can have multiple intervals (e.g. lunch break). null = closed all day.
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
  payment_methods?: string[];
};

export type StopAlternative = {
  station: Station;
  detour_km: number;
  is_open_at_eta: boolean | null;
};

export type Stop = {
  stop_number: number;
  station: Station;
  is_open_at_eta: boolean | null; // null = unknown
  eta_label: string;
  eta_iso: string;
  detour_km: number;
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

export type PlanRequest = {
  origin: string;
  destination: string;
  waypoints: (string | Waypoint)[];
  current_range_km: number;
  max_range_km: number;
  safety_margin_km: number;
  depart_at?: string | null;
  forced_station_ids?: number[]; // stations that MUST be in the stop list
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
  if (station.always_open) return true;
  const day = dayKeyFromDate(date);
  const intervals = station.opening_hours?.[day];
  if (intervals === undefined) return null;
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
