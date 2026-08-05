import { useState } from "react";
import { Pencil, Navigation, Plus, MapPin, Clock, Fuel, AlertTriangle, Check, Repeat, ChevronDown, X, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { PlanResult, Stop, StopAlternative } from "@/lib/metan-types";
import { CITIES } from "@/lib/metan-mock";
import type { Language } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { Capacitor } from "@capacitor/core";

// Su Android il pulsante "Apple Maps" non ha senso: l'app non esiste e il
// link aprirebbe la versione web nel browser. Meglio solo Google Maps.
const showAppleMaps = Capacitor.getPlatform() !== "android";

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
    launchWith: "Avvia navigazione con:",
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
    launchWith: "Start navigation with:",
  },
} as const;

interface ResultsPanelProps {
  result: PlanResult;
  highlightedStopNumber: number | null;
  onHighlight: (n: number | null) => void;
  onEdit: () => void;
  onAddStation: (stationId: number) => void;
  onRemoveStation: (stationId: number) => void;
  onSwapStation: (oldStationId: number, newStationId: number) => void;
  onAlternativeHover: (stationId: number | null) => void;
  forcedStationIds: number[];
  origin: string;
  destination: string;
  mode?: "navigate" | "organize";
  language: Language;
}

function statusColor(open: boolean | null) {
  if (open === true) return "bg-success text-success-foreground";
  if (open === false) return "bg-destructive text-destructive-foreground";
  return "bg-muted text-muted-foreground";
}
function statusLabel(open: boolean | null, language: Language) {
  const t = resultsCopy[language];
  if (open === true) return t.open;
  if (open === false) return t.closed;
  return t.unknownHours;
}
function borderColor(open: boolean | null) {
  if (open === true) return "border-l-success";
  if (open === false) return "border-l-destructive";
  return "border-l-muted-foreground/40";
}

function AlternativeRow({
  alt,
  onSwap,
  onHover,
  onLeave,
  language,
}: {
  alt: StopAlternative;
  onSwap: () => void;
  onHover: () => void;
  onLeave: () => void;
  language: Language;
}) {
  const t = resultsCopy[language];
  return (
    <button
      type="button"
      onClick={onSwap}
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
      className="w-full text-left px-3 py-2 rounded-lg border border-border bg-secondary/40 hover:bg-secondary hover:border-primary/60 hover:shadow-sm transition flex items-center gap-2"
    >
      <Repeat className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <div className="text-xs font-medium truncate">{alt.station.name}</div>
        <div className="text-[11px] text-muted-foreground flex items-center gap-2 flex-wrap">
          <span>{alt.station.city} ({alt.station.province})</span>
          <span className="font-semibold text-foreground">
            {alt.extra_trip_km > 0 ? `+${alt.extra_trip_km} ${t.extraTrip}` : t.sameDetour}
          </span>
          {alt.station.price && <span>€ {alt.station.price.toFixed(3)}</span>}
        </div>
      </div>
      <span className={cn(
        "text-[10px] font-semibold px-1.5 py-0.5 rounded-full whitespace-nowrap",
        statusColor(alt.is_open_at_eta)
      )}>
        {statusLabel(alt.is_open_at_eta, language)}
      </span>
    </button>
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
  language,
}: {
  stop: Stop;
  highlighted: boolean;
  onHover: () => void;
  onLeave: () => void;
  onClick: () => void;
  onAdd: () => void;
  onRemove: () => void;
  onSwap: (newId: number) => void;
  onAlternativeHover: (stationId: number | null) => void;
  isAdded: boolean;
  language: Language;
}) {
  const [showAlts, setShowAlts] = useState(false);
  const t = resultsCopy[language];

  return (
    <div
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
      onClick={onClick}
      className={cn(
        "bg-card border border-border rounded-xl p-4 border-l-4 transition-all cursor-pointer",
        borderColor(stop.is_open_at_eta),
        highlighted ? "shadow-md ring-2 ring-primary/30 -translate-y-0.5" : "hover:shadow-md"
      )}
    >
      <div className="flex gap-3">
        <div className="flex-shrink-0 h-9 w-9 rounded-full bg-gradient-to-br from-primary to-primary-glow text-primary-foreground font-bold text-sm flex items-center justify-center shadow-sm">
          {stop.stop_number}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <div className="font-semibold text-sm truncate flex items-center gap-1.5">
                {stop.station.name}
                {isAdded && (
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-primary/15 text-primary uppercase tracking-wide">
                    {t.stop}
                  </span>
                )}
              </div>
              <div className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                <MapPin className="h-3 w-3" />
                {stop.station.city} ({stop.station.province})
              </div>
            </div>
            <span className={cn(
              "text-[10px] font-semibold px-2 py-0.5 rounded-full whitespace-nowrap",
              statusColor(stop.is_open_at_eta)
            )}>
              {statusLabel(stop.is_open_at_eta, language)}
            </span>
          </div>

          <div className="flex items-center gap-3 mt-2.5 text-xs flex-wrap">
            <span className="text-primary font-semibold flex items-center gap-1">
              <Navigation className="h-3 w-3" />
              {stop.km_from_prev} km {stop.stop_number === 1 ? t.fromStart : t.fromPrev}
            </span>
            {stop.station.price && (
              <span className="font-semibold text-foreground">
                € {stop.station.price.toFixed(3)}/kg
              </span>
            )}
            <span className="text-muted-foreground">+{stop.detour_km} {t.detour}</span>
            <span className="text-muted-foreground flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {stop.eta_label.replace("Arrivo stimato: ", "")}
            </span>
          </div>

          <div className="flex gap-2 mt-3">
            <a
              href={`https://www.google.com/maps/dir/?api=1&destination=${stop.station.lat},${stop.station.lng}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="flex-1 h-9 inline-flex items-center justify-center gap-1.5 text-xs font-medium bg-primary text-primary-foreground rounded-lg hover:opacity-95 transition"
            >
              <Navigation className="h-3.5 w-3.5" />
              {t.navigate}
            </a>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onRemove();
              }}
              className="flex-1 h-9 inline-flex items-center justify-center gap-1.5 text-xs font-medium rounded-lg transition bg-destructive/10 text-destructive border border-destructive/40 hover:bg-destructive/20"
            >
              <X className="h-3.5 w-3.5" />
              {t.removeStop}
            </button>
          </div>

          {stop.alternatives.length > 0 && (
            <div className="mt-3 pt-3 border-t border-border">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowAlts((v) => !v);
                }}
                className="flex items-center gap-1 text-xs font-medium text-primary hover:text-primary-glow transition"
              >
                <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", showAlts && "rotate-180")} />
                {showAlts ? t.hideAlternatives : `${t.changeStation} (${stop.alternatives.length} ${t.alternatives})`}
              </button>
              {showAlts && (
                <div className="mt-2 space-y-1.5">
                  {stop.alternatives.map((alt) => (
                    <AlternativeRow
                      key={alt.station.id}
                      alt={alt}
                      onSwap={() => onSwap(alt.station.id)}
                      onHover={() => onAlternativeHover(alt.station.id)}
                      onLeave={() => onAlternativeHover(null)}
                      language={language}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function ResultsPanel({
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
  language,
}: ResultsPanelProps) {
  const t = resultsCopy[language];
  const hours = Math.floor(result.route.duration_min / 60);
  const minutes = result.route.duration_min % 60;
  const forcedSet = new Set(forcedStationIds);
  const remaining = result.meta.remaining_range_km;
  const margin = result.meta.safety_margin_km;
  const canStart = remaining >= margin;
  const isNavigate = mode === "navigate";

  const buildMapsUrl = (provider: "google" | "apple") => {
    const poly = result.route.polyline;
    const cityNames = new Set(CITIES.map((c) => c.toLowerCase().trim()));
    const isCity = (s: string) => cityNames.has(s.toLowerCase().trim());
    const originParam = isCity(origin) || !poly.length
      ? origin
      : `${poly[0][0]},${poly[0][1]}`;
    const destParam = isCity(destination) || !poly.length
      ? destination
      : `${poly[poly.length - 1][0]},${poly[poly.length - 1][1]}`;
    const stops = result.stops.map((s) => `${s.station.lat},${s.station.lng}`);
    if (provider === "google") {
      const waypoints = stops.length > 0 ? `&waypoints=${stops.join("|")}` : "";
      return `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(originParam)}&destination=${encodeURIComponent(destParam)}${waypoints}&travelmode=driving`;
    }
    const appleStops = stops.map((s) => encodeURIComponent(s)).join("+to:");
    const appleRoute = appleStops
      ? `https://maps.apple.com/?dirflg=d&saddr=${encodeURIComponent(originParam)}&daddr=${appleStops}+to:${encodeURIComponent(destParam)}`
      : `https://maps.apple.com/?dirflg=d&saddr=${encodeURIComponent(originParam)}&daddr=${encodeURIComponent(destParam)}`;
    return appleRoute;
  };

  return (
    <div className="flex flex-col h-full">
      {/* Summary bar */}
      <div className="px-5 py-4 border-b border-border bg-gradient-to-r from-primary-soft/60 to-card flex items-center justify-between gap-3">
        <div className="flex items-center gap-4 text-sm flex-wrap">
          <div className="flex items-center gap-1.5">
            <MapPin className="h-4 w-4 text-primary" />
            <span className="font-bold">{result.route.distance_km} km</span>
          </div>
          <span className="text-border">·</span>
          <div className="flex items-center gap-1.5">
            <Clock className="h-4 w-4 text-primary" />
            <span className="font-bold">{hours}h {minutes}m</span>
          </div>
          <span className="text-border">·</span>
          <div className="flex items-center gap-1.5">
            <Fuel className="h-4 w-4 text-primary" />
            <span className="font-bold">
              {result.stops.length} {result.stops.length === 1 ? t.stopSingular : t.stopPlural}
            </span>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={onEdit}
          className="h-8 gap-1.5 text-xs"
        >
          <Pencil className="h-3 w-3" />
          {t.edit}
        </Button>
      </div>

      {/* Scrollable stop list */}
      <div className="flex-1 overflow-y-auto px-5 py-4 pb-24 md:pb-6 space-y-3">
        {result.warnings.length > 0 && (
          <div className="rounded-lg bg-warning/15 border border-warning/40 p-3 flex gap-2.5 text-xs">
            <AlertTriangle className="h-4 w-4 text-warning-foreground flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              {result.warnings.map((w, i) => <div key={i}>{w}</div>)}
            </div>
          </div>
        )}

        {result.stops.length === 0 && result.warnings.length === 0 && (
          isNavigate ? (
            <div className="rounded-xl border border-border bg-secondary/40 p-4 text-xs text-muted-foreground leading-relaxed">
              {t.routeReadyHelp}
            </div>
          ) : (
            <div className="text-center py-6 text-sm text-muted-foreground">
              {t.noStops}
            </div>
          )
        )}

        {result.stops.map((stop) => {
          const isPinned = highlightedStopNumber === stop.stop_number;
          return (
            <StopCard
              key={stop.stop_number}
              stop={stop}
              highlighted={isPinned}
              onHover={() => { if (highlightedStopNumber == null) onHighlight(stop.stop_number); }}
              onLeave={() => { /* sticky: clear only via click */ }}
              onClick={() => onHighlight(isPinned ? null : stop.stop_number)}
              onAdd={() => onAddStation(stop.station.id)}
              onRemove={() => onRemoveStation(stop.station.id)}
              onSwap={(newId) => onSwapStation(stop.station.id, newId)}
              onAlternativeHover={onAlternativeHover}
              isAdded={forcedSet.has(stop.station.id) || stop.is_user_added === true}
              language={language}
            />
          );
        })}

        {/* Arrival card: navigate mode shows only the launch buttons; organize mode shows autonomy */}
        {isNavigate ? (
          <div className="rounded-xl p-4 shadow-md text-primary-foreground bg-gradient-to-br from-primary to-primary-glow">
            <div className="text-xs opacity-90">{t.ready}</div>
            <div className="font-semibold text-base mt-0.5">{t.startNavigation}</div>
            <div className="mt-3 flex gap-2">
              <a
                href={buildMapsUrl("google")}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 h-10 inline-flex items-center justify-center gap-1.5 text-xs font-semibold bg-white/95 text-foreground rounded-lg hover:bg-white transition"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                Google Maps
              </a>
              {showAppleMaps && (
              <a
                href={buildMapsUrl("apple")}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 h-10 inline-flex items-center justify-center gap-1.5 text-xs font-semibold bg-white/20 text-white border border-white/30 rounded-lg hover:bg-white/30 transition"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                Apple Maps
              </a>
              )}
            </div>
          </div>
        ) : (
          <div className={cn(
            "rounded-xl p-4 shadow-md text-primary-foreground bg-gradient-to-br",
            canStart ? "from-primary to-primary-glow" : "from-destructive to-destructive/70"
          )}>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs opacity-90">{t.arrival}</div>
                <div className="font-semibold text-base mt-0.5">{t.remainingRange}</div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold">{remaining}</div>
                <div className="text-xs opacity-90">km</div>
              </div>
            </div>
            <div className="mt-3 text-[11px] opacity-90">
              {t.safetyMargin} {margin} km
            </div>

            {!canStart && (
              <div className="mt-3 flex items-center gap-2 bg-white/15 rounded-lg px-3 py-2 text-xs font-medium">
                <AlertTriangle className="h-4 w-4" />
                {t.notEnoughRange}
              </div>
            )}

            {canStart && (
              <div className="mt-3 space-y-2">
                <div className="text-[11px] font-medium opacity-90">{t.launchWith}</div>
                <div className="flex gap-2">
                  <a
                    href={buildMapsUrl("google")}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 h-10 inline-flex items-center justify-center gap-1.5 text-xs font-semibold bg-white/95 text-foreground rounded-lg hover:bg-white transition"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    Google Maps
                  </a>
                  {showAppleMaps && (
                  <a
                    href={buildMapsUrl("apple")}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 h-10 inline-flex items-center justify-center gap-1.5 text-xs font-semibold bg-white/20 text-white border border-white/30 rounded-lg hover:bg-white/30 transition"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    Apple Maps
                  </a>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
