export type Station = {
  id: number;
  name: string;
  address?: string;
  city: string;
  province: string;
  price?: number;
  lat: number;
  lng: number;
  operator?: string;
  hours?: string;
  payment?: string[];
};

export type Stop = {
  stop_number: number;
  station: Station;
  is_open_at_eta: boolean | null; // null = unknown
  eta_label: string;
  detour_km: number;
};

export type PlanResult = {
  route: { distance_km: number; duration_min: number; polyline: [number, number][] };
  stops: Stop[];
  warnings: string[];
  meta: { current_range_km: number; remaining_range_km: number; safety_margin_km: number };
};

export type PlanRequest = {
  origin: string;
  destination: string;
  waypoints: string[];
  current_range_km: number;
  max_range_km: number;
  safety_margin_km: number;
  depart_at?: string | null;
};
