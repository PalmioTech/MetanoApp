import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { L } from "../_libs/leaflet.mjs";
import { A as ALL_STATIONS, i as isStationOpenAt } from "./index-0iJo1_NI.mjs";
import "../_libs/papaparse.mjs";
import { M as MapContainer, T as TileLayer, P as Polyline, a as Marker, u as useMapEvents, b as useMap } from "../_libs/react-leaflet.mjs";
import "../_libs/radix-ui__react-slot.mjs";
import "../_libs/radix-ui__react-compose-refs.mjs";
import "../_libs/class-variance-authority.mjs";
import "../_libs/clsx.mjs";
import "../_libs/tailwind-merge.mjs";
import "../_libs/radix-ui__react-label.mjs";
import "../_libs/radix-ui__react-primitive.mjs";
import "../_libs/react-dom.mjs";
import "util";
import "crypto";
import "async_hooks";
import "stream";
import "../_libs/radix-ui__react-tabs.mjs";
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
import "../_libs/lucide-react.mjs";
import "../_libs/react-leaflet__core.mjs";
function isHighwayStation(s) {
  const n = s.name.toLowerCase();
  return /\b(a\d+|autostrad|ads)\b/.test(n);
}
function isH24Station(s) {
  return s.always_open;
}
const stopIcon = (number, highlighted = false) => {
  const size = highlighted ? 44 : 34;
  const bg = highlighted ? "linear-gradient(135deg, oklch(0.72 0.19 50), oklch(0.78 0.18 65))" : "linear-gradient(135deg, oklch(0.62 0.17 150), oklch(0.72 0.18 155))";
  const shadow = highlighted ? "0 6px 20px rgba(234,88,12,.55)" : "0 4px 14px rgba(22,163,74,.45)";
  const ring = highlighted ? "outline:4px solid oklch(0.78 0.18 65 / .35);outline-offset:2px;" : "";
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
    iconSize: [0, 0]
  });
};
const grayIcon = (station, hover = false, openNow = false) => {
  const highway = isHighwayStation(station);
  const h24 = isH24Station(station);
  const size = hover ? 28 : 20;
  const inner = hover ? 10 : 7;
  let bg;
  let shadow;
  if (openNow) {
    bg = hover ? "linear-gradient(135deg, oklch(0.68 0.20 150), oklch(0.76 0.20 155))" : "linear-gradient(135deg, oklch(0.62 0.19 150), oklch(0.70 0.18 155))";
    shadow = hover ? "0 6px 16px rgba(22,163,74,.55)" : "0 2px 6px rgba(22,163,74,.4)";
  } else if (highway) {
    bg = hover ? "linear-gradient(135deg, oklch(0.55 0.22 250), oklch(0.65 0.20 260))" : "linear-gradient(135deg, oklch(0.50 0.18 250), oklch(0.58 0.16 255))";
    shadow = hover ? "0 6px 16px rgba(37,99,235,.5)" : "0 2px 6px rgba(37,99,235,.3)";
  } else if (h24) {
    bg = hover ? "linear-gradient(135deg, oklch(0.72 0.19 85), oklch(0.78 0.17 75))" : "linear-gradient(135deg, oklch(0.65 0.16 85), oklch(0.72 0.14 80))";
    shadow = hover ? "0 6px 16px rgba(217,119,6,.5)" : "0 2px 6px rgba(217,119,6,.3)";
  } else {
    bg = hover ? "linear-gradient(135deg, oklch(0.62 0.17 150), oklch(0.72 0.18 155))" : "linear-gradient(135deg, oklch(0.55 0.02 250), oklch(0.65 0.02 250))";
    shadow = hover ? "0 6px 16px rgba(22,163,74,.5)" : "0 2px 6px rgba(15,23,42,.25)";
  }
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
    iconSize: [0, 0]
  });
};
const altIcon = (hover = false) => {
  const size = hover ? 32 : 26;
  const inner = hover ? 12 : 9;
  return L.divIcon({
    className: "metan-marker metan-marker-alt",
    html: `<div style="
      width:${size}px;height:${size}px;border-radius:50%;
      background:linear-gradient(135deg, oklch(0.72 0.19 50), oklch(0.78 0.18 65));
      border:3px solid white;
      box-shadow:0 4px 14px rgba(234,88,12,.55);
      display:flex;align-items:center;justify-content:center;
      transform:translate(-50%,-50%);
      transition:all .15s ease;cursor:pointer;
    "><div style="width:${inner}px;height:${inner}px;border-radius:50%;background:white;opacity:.95;"></div></div>`,
    iconSize: [0, 0]
  });
};
const pinIcon = (color) => L.divIcon({
  className: "metan-marker",
  html: `<div style="
      width:18px;height:18px;border-radius:50%;background:${color};
      border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,.3);
      transform:translate(-50%,-50%);
    "></div>`,
  iconSize: [0, 0]
});
function FitBounds({ result }) {
  const map = useMap();
  const prevPolylineRef = reactExports.useRef("");
  reactExports.useEffect(() => {
    if (!result || result.route.polyline.length === 0) return;
    const key = result.route.polyline.length + "-" + result.route.polyline[0]?.[0] + "-" + result.route.polyline[result.route.polyline.length - 1]?.[0];
    if (key === prevPolylineRef.current) return;
    prevPolylineRef.current = key;
    const bounds = L.latLngBounds(result.route.polyline);
    result.stops.forEach((s) => bounds.extend([s.station.lat, s.station.lng]));
    map.fitBounds(bounds, { padding: [60, 60], maxZoom: 14 });
  }, [result, map]);
  return null;
}
function FitToStopAlternatives({
  result,
  stopNumber
}) {
  const map = useMap();
  reactExports.useEffect(() => {
    if (!result || stopNumber == null) return;
    const stop = result.stops.find((s) => s.stop_number === stopNumber);
    if (!stop) return;
    const points = [[stop.station.lat, stop.station.lng]];
    stop.alternatives.forEach((a) => points.push([a.station.lat, a.station.lng]));
    if (points.length === 1) {
      map.setView(points[0], Math.max(map.getZoom(), 12), { animate: true });
      return;
    }
    const b = L.latLngBounds(points);
    map.fitBounds(b, { padding: [80, 80], maxZoom: 13, animate: true });
  }, [result, stopNumber, map]);
  return null;
}
function ViewportTracker({ onChange }) {
  const map = useMapEvents({
    moveend: () => onChange(map.getBounds(), map.getZoom()),
    zoomend: () => onChange(map.getBounds(), map.getZoom())
  });
  reactExports.useEffect(() => {
    onChange(map.getBounds(), map.getZoom());
  }, []);
  return null;
}
function MapView({ result, highlightedStopNumber, externalHoveredStationId, onStationClick }) {
  const [bounds, setBounds] = reactExports.useState(null);
  const [zoom, setZoom] = reactExports.useState(7);
  const [internalHoveredId, setInternalHoveredId] = reactExports.useState(null);
  const hoveredStationId = externalHoveredStationId ?? internalHoveredId;
  const setHoveredStationId = setInternalHoveredId;
  const recommendedIds = reactExports.useMemo(
    () => new Set(result?.stops.map((s) => s.station.id) ?? []),
    [result]
  );
  const highlightedAlternatives = reactExports.useMemo(() => {
    if (!result || highlightedStopNumber == null) return [];
    const stop = result.stops.find((s) => s.stop_number === highlightedStopNumber);
    return stop?.alternatives ?? [];
  }, [result, highlightedStopNumber]);
  const highlightedAltIds = reactExports.useMemo(
    () => new Set(highlightedAlternatives.map((a) => a.station.id)),
    [highlightedAlternatives]
  );
  const visibleStations = reactExports.useMemo(() => {
    if (result && result.candidates.length > 0) {
      return result.candidates.map((c) => c.station).filter((s) => !highlightedAltIds.has(s.id));
    }
    if (!bounds) return [];
    const out = [];
    for (const s of ALL_STATIONS) {
      if (recommendedIds.has(s.id)) continue;
      if (highlightedAltIds.has(s.id)) continue;
      if (bounds.contains([s.lat, s.lng])) {
        out.push(s);
      }
    }
    return out;
  }, [bounds, zoom, recommendedIds, result, highlightedAltIds]);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    MapContainer,
    {
      bounds: L.latLngBounds([35.4, 6.5], [47.1, 18.6]),
      boundsOptions: { padding: [20, 20] },
      className: "h-screen w-screen",
      zoomControl: false,
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          TileLayer,
          {
            attribution: "© OpenStreetMap",
            url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(ViewportTracker, { onChange: (b, z) => {
          setBounds(b);
          setZoom(z);
        } }),
        result && result.route.polyline.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Polyline,
            {
              positions: result.route.polyline,
              pathOptions: { color: "oklch(0.62 0.17 150)", weight: 5, opacity: 0.85 }
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Marker,
            {
              position: result.route.polyline[0],
              icon: pinIcon("oklch(0.4 0.15 250)")
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Marker,
            {
              position: result.route.polyline[result.route.polyline.length - 1],
              icon: pinIcon("oklch(0.55 0.22 25)")
            }
          )
        ] }),
        visibleStations.map((s) => {
          const openNow = isStationOpenAt(s, /* @__PURE__ */ new Date()) === true;
          return /* @__PURE__ */ jsxRuntimeExports.jsx(
            Marker,
            {
              position: [s.lat, s.lng],
              icon: grayIcon(s, hoveredStationId === s.id, openNow),
              eventHandlers: {
                click: () => onStationClick(s),
                mouseover: () => setHoveredStationId(s.id),
                mouseout: () => setHoveredStationId((id) => id === s.id ? null : id)
              }
            },
            s.id
          );
        }),
        highlightedAlternatives.map((alt) => /* @__PURE__ */ jsxRuntimeExports.jsx(
          Marker,
          {
            position: [alt.station.lat, alt.station.lng],
            icon: altIcon(hoveredStationId === alt.station.id),
            eventHandlers: {
              click: () => onStationClick(alt.station),
              mouseover: () => setHoveredStationId(alt.station.id),
              mouseout: () => setHoveredStationId((id) => id === alt.station.id ? null : id)
            }
          },
          `alt-${alt.station.id}`
        )),
        result?.stops.map((stop) => /* @__PURE__ */ jsxRuntimeExports.jsx(
          Marker,
          {
            position: [stop.station.lat, stop.station.lng],
            icon: stopIcon(stop.stop_number, highlightedStopNumber === stop.stop_number),
            eventHandlers: { click: () => onStationClick(stop.station) }
          },
          `${stop.station.id}-${highlightedStopNumber === stop.stop_number ? "h" : "n"}`
        )),
        /* @__PURE__ */ jsxRuntimeExports.jsx(FitBounds, { result }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(FitToStopAlternatives, { result, stopNumber: highlightedStopNumber })
      ]
    }
  );
}
export {
  MapView
};
