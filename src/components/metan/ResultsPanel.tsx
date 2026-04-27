import { Pencil, Navigation, Plus, MapPin, Clock, Fuel, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { PlanResult, Stop } from "@/lib/metan-types";
import { cn } from "@/lib/utils";

interface ResultsPanelProps {
  result: PlanResult;
  highlightedStopNumber: number | null;
  onHighlight: (n: number | null) => void;
  onEdit: () => void;
}

function statusColor(open: boolean | null) {
  if (open === true) return "bg-success text-success-foreground";
  if (open === false) return "bg-destructive text-destructive-foreground";
  return "bg-muted text-muted-foreground";
}
function statusLabel(open: boolean | null) {
  if (open === true) return "Aperto";
  if (open === false) return "Chiuso";
  return "Orario sconosciuto";
}
function borderColor(open: boolean | null) {
  if (open === true) return "border-l-success";
  if (open === false) return "border-l-destructive";
  return "border-l-muted-foreground/40";
}

function StopCard({ stop, highlighted, onHover, onLeave }: {
  stop: Stop;
  highlighted: boolean;
  onHover: () => void;
  onLeave: () => void;
}) {
  return (
    <div
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
      onClick={onHover}
      className={cn(
        "bg-card border border-border rounded-xl p-4 border-l-4 cursor-pointer transition-all",
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
              <div className="font-semibold text-sm truncate">{stop.station.name}</div>
              <div className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                <MapPin className="h-3 w-3" />
                {stop.station.city} ({stop.station.province})
              </div>
            </div>
            <span className={cn(
              "text-[10px] font-semibold px-2 py-0.5 rounded-full whitespace-nowrap",
              statusColor(stop.is_open_at_eta)
            )}>
              {statusLabel(stop.is_open_at_eta)}
            </span>
          </div>

          <div className="flex items-center gap-3 mt-2.5 text-xs">
            {stop.station.price && (
              <span className="font-semibold text-foreground">
                € {stop.station.price.toFixed(3)}/kg
              </span>
            )}
            <span className="text-muted-foreground">+{stop.detour_km} km</span>
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
              Naviga
            </a>
            <button
              onClick={(e) => e.stopPropagation()}
              className="flex-1 h-9 inline-flex items-center justify-center gap-1.5 text-xs font-medium bg-secondary text-secondary-foreground rounded-lg hover:bg-accent transition"
            >
              <Plus className="h-3.5 w-3.5" />
              Aggiungi tappa
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function ResultsPanel({ result, highlightedStopNumber, onHighlight, onEdit }: ResultsPanelProps) {
  const hours = Math.floor(result.route.duration_min / 60);
  const minutes = result.route.duration_min % 60;

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
              {result.stops.length} {result.stops.length === 1 ? "sosta consigliata" : "soste consigliate"}
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
          Modifica
        </Button>
      </div>

      {/* Scrollable stop list */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
        {result.warnings.length > 0 && (
          <div className="rounded-lg bg-warning/15 border border-warning/40 p-3 flex gap-2.5 text-xs">
            <AlertTriangle className="h-4 w-4 text-warning-foreground flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              {result.warnings.map((w, i) => <div key={i}>{w}</div>)}
            </div>
          </div>
        )}

        {result.stops.length === 0 && result.warnings.length === 0 && (
          <div className="text-center py-6 text-sm text-muted-foreground">
            Nessuna sosta necessaria. Hai autonomia sufficiente per arrivare a destinazione.
          </div>
        )}

        {result.stops.map((stop) => (
          <StopCard
            key={stop.stop_number}
            stop={stop}
            highlighted={highlightedStopNumber === stop.stop_number}
            onHover={() => onHighlight(stop.stop_number)}
            onLeave={() => onHighlight(null)}
          />
        ))}

        {/* Arrival card */}
        <div className="rounded-xl bg-gradient-to-br from-primary to-primary-glow text-primary-foreground p-4 shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs opacity-90">Arrivo a destinazione</div>
              <div className="font-semibold text-base mt-0.5">Autonomia residua</div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold">{result.meta.remaining_range_km}</div>
              <div className="text-xs opacity-90">km</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
