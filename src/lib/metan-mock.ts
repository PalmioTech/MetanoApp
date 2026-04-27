import type { PlanRequest, PlanResult, Station } from "./metan-types";

// Realistic Italian CNG stations (lat/lng approximate to real cities)
export const ALL_STATIONS: Station[] = [
  { id: 1, name: "Distributore Agip", address: "Via Emilia 142", city: "Bologna", province: "BO", price: 1.389, lat: 44.4949, lng: 11.3426, operator: "Eni", hours: "06:00 - 22:00", payment: ["Carta", "Contanti", "App"] },
  { id: 2, name: "Q8 Metano", address: "Via Cavour 23", city: "Modena", province: "MO", price: 1.359, lat: 44.6471, lng: 10.9252, operator: "Q8", hours: "24/7", payment: ["Carta", "App"] },
  { id: 3, name: "IP Gas Station", address: "SS9 km 145", city: "Reggio Emilia", province: "RE", price: 1.419, lat: 44.6989, lng: 10.6297, operator: "IP", hours: "07:00 - 21:00", payment: ["Carta", "Contanti"] },
  { id: 4, name: "Metano Service Parma", address: "Via La Spezia 88", city: "Parma", province: "PR", price: 1.399, lat: 44.8015, lng: 10.3279, operator: "Indipendente", hours: "06:30 - 20:30", payment: ["Carta", "Contanti"] },
  { id: 5, name: "Eni Stazione Fidenza", address: "Via Emilia 12", city: "Fidenza", province: "PR", price: 1.379, lat: 44.8676, lng: 10.0589, operator: "Eni", hours: "24/7", payment: ["Carta", "App"] },
  { id: 6, name: "Tamoil Piacenza", address: "Tangenziale Est", city: "Piacenza", province: "PC", price: 1.369, lat: 45.0526, lng: 9.6929, operator: "Tamoil", hours: "06:00 - 23:00", payment: ["Carta"] },
  { id: 7, name: "Esso Lodi Sud", address: "Via Milano 201", city: "Lodi", province: "LO", price: 1.405, lat: 45.3148, lng: 9.5036, operator: "Esso", hours: "Sconosciuto", payment: ["Carta"] },
  { id: 8, name: "Metano San Donato", address: "Via Emilia 5", city: "San Donato Milanese", province: "MI", price: 1.429, lat: 45.4160, lng: 9.2666, operator: "Indipendente", hours: "06:00 - 22:00", payment: ["Carta", "Contanti", "App"] },
  { id: 9, name: "Q8 Milano Est", address: "Via Mecenate 90", city: "Milano", province: "MI", price: 1.449, lat: 45.4642, lng: 9.2300, operator: "Q8", hours: "24/7", payment: ["Carta", "App"] },
  { id: 10, name: "Eni Forlì Centro", address: "Via Ravegnana 50", city: "Forlì", province: "FC", price: 1.379, lat: 44.2225, lng: 12.0408, operator: "Eni", hours: "06:00 - 22:00", payment: ["Carta", "Contanti"] },
];

// Hardcoded route from Bologna -> Milano along A1 (approximate polyline)
const BOLOGNA_MILANO_ROUTE: [number, number][] = [
  [44.4949, 11.3426], [44.5500, 11.2000], [44.6471, 10.9252], [44.6989, 10.6297],
  [44.8015, 10.3279], [44.8676, 10.0589], [44.9500, 9.8500], [45.0526, 9.6929],
  [45.1800, 9.6000], [45.3148, 9.5036], [45.4160, 9.2666], [45.4642, 9.1900],
];

function pickStops(currentRange: number, maxRange: number, safety: number, totalKm: number): { idx: number[]; warnings: string[] } {
  // Stations along route in order: 1,2,3,4,5,6,7,8,9
  // Cumulative km from origin (Bologna)
  const cumKm = [0, 40, 80, 110, 145, 175, 220, 260, 295, 312];
  const stationOrder = [2, 3, 4, 5, 6, 7, 8, 9]; // skip origin
  const cumKmStations = [40, 80, 110, 145, 175, 220, 260, 295];

  const usable = (range: number) => Math.max(0, range - safety);
  const picked: number[] = [];
  const warnings: string[] = [];
  let pos = 0;
  let range = currentRange;

  while (pos + usable(range) < totalKm) {
    // Find furthest reachable station ahead of pos
    let bestIdx = -1;
    for (let i = 0; i < stationOrder.length; i++) {
      const sKm = cumKmStations[i];
      if (sKm <= pos) continue;
      if (sKm - pos <= usable(range)) bestIdx = i;
    }
    if (bestIdx === -1) {
      warnings.push("Autonomia insufficiente per raggiungere la prossima stazione consigliata.");
      break;
    }
    picked.push(stationOrder[bestIdx]);
    pos = cumKmStations[bestIdx];
    range = maxRange; // refuel
  }

  return { idx: picked, warnings };
}

export function mockPlan(req: PlanRequest): PlanResult {
  const totalKm = 312;
  const durationMin = 195;
  const { idx, warnings } = pickStops(req.current_range_km, req.max_range_km, req.safety_margin_km, totalKm);

  const startTime = req.depart_at ? new Date(req.depart_at) : new Date();
  const stops: PlanResult["stops"] = idx.map((stationId, i) => {
    const station = ALL_STATIONS.find((s) => s.id === stationId)!;
    // Approx ETA based on station index along the route
    const stationCumKm = [0, 40, 80, 110, 145, 175, 220, 260, 295][stationId - 1] ?? 0;
    const minutes = Math.round((stationCumKm / totalKm) * durationMin);
    const eta = new Date(startTime.getTime() + minutes * 60_000);
    const etaStr = eta.toLocaleTimeString("it-IT", { hour: "2-digit", minute: "2-digit" });

    // Determine open status
    let isOpen: boolean | null = true;
    if (station.hours === "Sconosciuto") isOpen = null;
    else if (station.hours && station.hours !== "24/7") {
      const [openH] = station.hours.split(" - ")[0].split(":").map(Number);
      const [closeH] = station.hours.split(" - ")[1].split(":").map(Number);
      const h = eta.getHours();
      isOpen = h >= openH && h < closeH;
    }

    return {
      stop_number: i + 1,
      station,
      is_open_at_eta: isOpen,
      eta_label: `Arrivo stimato: ${etaStr}`,
      detour_km: Math.round((Math.random() * 0.8 + 0.1) * 10) / 10,
    };
  });

  // Compute remaining range on arrival
  const lastStopKm = stops.length > 0
    ? [0, 40, 80, 110, 145, 175, 220, 260, 295][stops[stops.length - 1].station.id - 1]
    : 0;
  const kmAfterLast = totalKm - lastStopKm;
  const startingRange = stops.length > 0 ? req.max_range_km : req.current_range_km;
  const remaining = Math.max(0, Math.round(startingRange - kmAfterLast));

  return {
    route: { distance_km: totalKm, duration_min: durationMin, polyline: BOLOGNA_MILANO_ROUTE },
    stops,
    warnings,
    meta: {
      current_range_km: req.current_range_km,
      remaining_range_km: remaining,
      safety_margin_km: req.safety_margin_km,
    },
  };
}

// Italian cities autocomplete
export const CITIES = [
  "Bologna", "Milano", "Modena", "Reggio Emilia", "Parma", "Fidenza", "Piacenza",
  "Lodi", "San Donato Milanese", "Forlì", "Roma", "Firenze", "Torino", "Venezia",
  "Napoli", "Genova", "Verona", "Padova", "Brescia", "Bergamo", "Trento",
];
