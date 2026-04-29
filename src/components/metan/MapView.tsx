import { useEffect, useMemo, useState } from "react";
import { MapContainer, TileLayer, Marker, Polyline, useMap, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { PlanResult, Station } from "@/lib/metan-types";
import { ALL_STATIONS } from "@/lib/metan-mock";

const stopIcon = (number: number, highlighted = false) => {
  // Highlighted = vivid orange/amber so the user clearly sees which stop is selected.
  // Default = green gradient.
  const size = highlighted ? 44 : 34;
  const bg = highlighted
    ? "linear-gradient(135deg, oklch(0.72 0.19 50), oklch(0.78 0.18 65))"
    : "linear-gradient(135deg, oklch(0.62 0.17 150), oklch(0.72 0.18 155))";
  const shadow = highlighted
    ? "0 6px 20px rgba(234,88,12,.55)"
    : "0 4px 14px rgba(22,163,74,.45)";
  const ring = highlighted
    ? "outline:4px solid oklch(0.78 0.18 65 / .35);outline-offset:2px;"
    : "";
  return L.divIcon({
    className: "metan-marker",
    html: `<div style="
      width:${size}px;height:${size}px;border-radius:50%;
      background:${bg};
      border:3px solid white;box-shadow:${shadow};
      display:flex;align-items:center;justify-content:center;color:white;font-weight:700;
      font-family:Inter,sans-serif;font-size:14px;transform:translate(-50%,-50%);
      transition:all .15s ease;${ring}
    ">${number}</div>`,
    iconSize: [0, 0],
  });
};

const grayIcon = (hover = false) => {
  const size = hover ? 28 : 20;
  const inner = hover ? 10 : 7;
  const bg = hover
    ? "linear-gradient(135deg, oklch(0.62 0.17 150), oklch(0.72 0.18 155))"
    : "linear-gradient(135deg, oklch(0.55 0.02 250), oklch(0.65 0.02 250))";
  const shadow = hover
    ? "0 6px 16px rgba(22,163,74,.5)"
    : "0 2px 6px rgba(15,23,42,.25)";
  return L.divIcon({
    className: "metan-marker metan-marker-candidate",
    html: `<div style="
      width:${size}px;height:${size}px;border-radius:50%;
      background:${bg};
      border:2px solid white;
      box-shadow:${shadow};
      display:flex;align-items:center;justify-content:center;
      transform:translate(-50%,-50%);
      transition:all .15s ease;cursor:pointer;
    "><div style="width:${inner}px;height:${inner}px;border-radius:50%;background:white;opacity:.9;"></div></div>`,
    iconSize: [0, 0],
  });
};

const pinIcon = (color: string) =>
  L.divIcon({
    className: "metan-marker",
    html: `<div style="
      width:18px;height:18px;border-radius:50%;background:${color};
      border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,.3);
      transform:translate(-50%,-50%);
    "></div>`,
    iconSize: [0, 0],
  });

function FitBounds({ result }: { result: PlanResult | null }) {
  const map = useMap();
  useEffect(() => {
    if (!result || result.route.polyline.length === 0) return;
    const bounds = L.latLngBounds(result.route.polyline);
    map.fitBounds(bounds, { padding: [80, 80], maxZoom: 11 });
  }, [result, map]);
  return null;
}

function FlyToStop({ result, stopNumber }: { result: PlanResult | null; stopNumber: number | null }) {
  const map = useMap();
  useEffect(() => {
    if (stopNumber == null || !result) return;
    const stop = result.stops.find((s) => s.stop_number === stopNumber);
    if (!stop) return;
    const targetZoom = Math.max(map.getZoom(), 13);
    map.flyTo([stop.station.lat, stop.station.lng], targetZoom, { duration: 0.6 });
  }, [stopNumber, result, map]);
  return null;
}

function ViewportTracker({ onChange }: { onChange: (b: L.LatLngBounds, zoom: number) => void }) {
  const map = useMapEvents({
    moveend: () => onChange(map.getBounds(), map.getZoom()),
    zoomend: () => onChange(map.getBounds(), map.getZoom()),
  });
  useEffect(() => {
    onChange(map.getBounds(), map.getZoom());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return null;
}

interface MapViewProps {
  result: PlanResult | null;
  highlightedStopNumber: number | null;
  externalHoveredStationId?: number | null;
  onStationClick: (s: Station) => void;
  simulating?: boolean;
  simulationProgress?: number; // 0..1 along route polyline
}

const carIcon = () =>
  L.divIcon({
    className: "metan-marker metan-car",
    html: `<div style="
      width:36px;height:36px;border-radius:50%;
      background:linear-gradient(135deg, oklch(0.55 0.22 25), oklch(0.65 0.20 35));
      border:3px solid white;
      box-shadow:0 6px 18px rgba(220,38,38,.55);
      display:flex;align-items:center;justify-content:center;
      transform:translate(-50%,-50%);
      font-size:18px;
    ">🚗</div>`,
    iconSize: [0, 0],
  });

function interpolateOnPolyline(poly: [number, number][], t: number): [number, number] | null {
  if (poly.length === 0) return null;
  if (poly.length === 1) return poly[0];
  // total length in degrees (good enough for animation)
  const segLens: number[] = [];
  let total = 0;
  for (let i = 1; i < poly.length; i++) {
    const dx = poly[i][0] - poly[i - 1][0];
    const dy = poly[i][1] - poly[i - 1][1];
    const l = Math.sqrt(dx * dx + dy * dy);
    segLens.push(l);
    total += l;
  }
  if (total === 0) return poly[0];
  let target = Math.max(0, Math.min(1, t)) * total;
  for (let i = 0; i < segLens.length; i++) {
    if (target <= segLens[i]) {
      const r = segLens[i] === 0 ? 0 : target / segLens[i];
      return [
        poly[i][0] + (poly[i + 1][0] - poly[i][0]) * r,
        poly[i][1] + (poly[i + 1][1] - poly[i][1]) * r,
      ];
    }
    target -= segLens[i];
  }
  return poly[poly.length - 1];
}

function FollowCar({ pos, active }: { pos: [number, number] | null; active: boolean }) {
  const map = useMap();
  useEffect(() => {
    if (!active || !pos) return;
    map.panTo(pos, { animate: true, duration: 0.6 });
  }, [pos, active, map]);
  return null;
}

export function MapView({ result, highlightedStopNumber, externalHoveredStationId, onStationClick, simulating, simulationProgress }: MapViewProps) {
  const [bounds, setBounds] = useState<L.LatLngBounds | null>(null);
  const [zoom, setZoom] = useState<number>(7);
  const [internalHoveredId, setInternalHoveredId] = useState<number | null>(null);
  const hoveredStationId = externalHoveredStationId ?? internalHoveredId;
  const setHoveredStationId = setInternalHoveredId;

  const recommendedIds = useMemo(
    () => new Set(result?.stops.map((s) => s.station.id) ?? []),
    [result],
  );

  // When a route is planned, always show the route's candidate stations (already filtered to detour ≤ 8km).
  // Without a route, show stations within current viewport at any zoom (capped to avoid 1604 markers at once).
  const visibleStations = useMemo(() => {
    if (result && result.candidates.length > 0) {
      return result.candidates.map((c) => c.station);
    }
    if (!bounds) return [];
    const cap = zoom >= 9 ? 600 : zoom >= 7 ? 250 : 120;
    const out: Station[] = [];
    for (const s of ALL_STATIONS) {
      if (recommendedIds.has(s.id)) continue;
      if (bounds.contains([s.lat, s.lng])) {
        out.push(s);
        if (out.length >= cap) break;
      }
    }
    return out;
  }, [bounds, zoom, recommendedIds, result]);

  const carPos = useMemo(() => {
    if (!simulating || !result || result.route.polyline.length === 0) return null;
    return interpolateOnPolyline(result.route.polyline, simulationProgress ?? 0);
  }, [simulating, simulationProgress, result]);

  return (
    <MapContainer
      center={[42.5, 12.5]}
      zoom={6}
      className="h-screen w-screen"
      zoomControl={false}
    >
      <TileLayer
        attribution='&copy; OpenStreetMap'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <ViewportTracker onChange={(b, z) => { setBounds(b); setZoom(z); }} />

      {result && result.route.polyline.length > 0 && (
        <>
          <Polyline
            positions={result.route.polyline}
            pathOptions={{ color: "oklch(0.62 0.17 150)", weight: 5, opacity: 0.85 }}
          />
          <Marker
            position={result.route.polyline[0]}
            icon={pinIcon("oklch(0.4 0.15 250)")}
          />
          <Marker
            position={result.route.polyline[result.route.polyline.length - 1]}
            icon={pinIcon("oklch(0.55 0.22 25)")}
          />
        </>
      )}

      {visibleStations.map((s) => (
        <Marker
          key={s.id}
          position={[s.lat, s.lng]}
          icon={grayIcon(hoveredStationId === s.id)}
          eventHandlers={{
            click: () => onStationClick(s),
            mouseover: () => setHoveredStationId(s.id),
            mouseout: () => setHoveredStationId((id) => (id === s.id ? null : id)),
          }}
        />
      ))}

      {result?.stops.map((stop) => (
        <Marker
          key={`${stop.station.id}-${highlightedStopNumber === stop.stop_number ? "h" : "n"}`}
          position={[stop.station.lat, stop.station.lng]}
          icon={stopIcon(stop.stop_number, highlightedStopNumber === stop.stop_number)}
          eventHandlers={{ click: () => onStationClick(stop.station) }}
        />
      ))}

      {carPos && (
        <Marker position={carPos} icon={carIcon()} />
      )}

      <FitBounds result={result} />
      {!simulating && <FlyToStop result={result} stopNumber={highlightedStopNumber} />}
      <FollowCar pos={carPos} active={!!simulating} />
    </MapContainer>
  );
}
