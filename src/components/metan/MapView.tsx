import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Polyline, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { PlanResult, Station } from "@/lib/metan-types";
import { ALL_STATIONS } from "@/lib/metan-mock";

const greenIcon = (number: number, highlighted = false) =>
  L.divIcon({
    className: "metan-marker",
    html: `<div style="
      width:${highlighted ? 40 : 34}px;height:${highlighted ? 40 : 34}px;border-radius:50%;
      background:linear-gradient(135deg, oklch(0.62 0.17 150), oklch(0.72 0.18 155));
      border:3px solid white;box-shadow:0 4px 14px rgba(22,163,74,.45);
      display:flex;align-items:center;justify-content:center;color:white;font-weight:700;
      font-family:Inter,sans-serif;font-size:14px;transform:translate(-50%,-50%);
      ${highlighted ? "outline:3px solid oklch(0.72 0.18 155 / .35);outline-offset:2px;" : ""}
    ">${number}</div>`,
    iconSize: [0, 0],
  });

const grayIcon = L.divIcon({
  className: "metan-marker",
  html: `<div style="
    width:22px;height:22px;border-radius:50%;background:#9ca3af;
    border:2px solid white;box-shadow:0 2px 6px rgba(0,0,0,.2);
    transform:translate(-50%,-50%);opacity:.75;
  "></div>`,
  iconSize: [0, 0],
});

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
    if (!result) return;
    const bounds = L.latLngBounds(result.route.polyline);
    map.fitBounds(bounds, { padding: [80, 80], maxZoom: 11 });
  }, [result, map]);
  return null;
}

interface MapViewProps {
  result: PlanResult | null;
  highlightedStopNumber: number | null;
  onStationClick: (s: Station) => void;
}

export function MapView({ result, highlightedStopNumber, onStationClick }: MapViewProps) {
  const recommendedIds = new Set(result?.stops.map((s) => s.station.id) ?? []);
  const otherStations = ALL_STATIONS.filter((s) => !recommendedIds.has(s.id));

  return (
    <MapContainer
      center={[44.95, 10.5]}
      zoom={7}
      className="h-screen w-screen"
      zoomControl={false}
    >
      <TileLayer
        attribution='&copy; OpenStreetMap'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {result && (
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

      {otherStations.map((s) => (
        <Marker
          key={s.id}
          position={[s.lat, s.lng]}
          icon={grayIcon}
          eventHandlers={{ click: () => onStationClick(s) }}
        />
      ))}

      {result?.stops.map((stop) => (
        <Marker
          key={stop.station.id}
          position={[stop.station.lat, stop.station.lng]}
          icon={greenIcon(stop.stop_number, highlightedStopNumber === stop.stop_number)}
          eventHandlers={{ click: () => onStationClick(stop.station) }}
        />
      ))}

      <FitBounds result={result} />
    </MapContainer>
  );
}
