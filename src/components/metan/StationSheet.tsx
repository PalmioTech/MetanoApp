import { X, MapPin, Clock, CreditCard, Building2, Plus } from "lucide-react";
import type { Station, DayKey } from "@/lib/metan-types";
import { DAY_ORDER, DAY_LABELS_IT, isStationOpenAt, dayKeyFromDate } from "@/lib/metan-types";
import { Button } from "@/components/ui/button";

interface StationSheetProps {
  station: Station | null;
  onClose: () => void;
}

const PAYMENT_LABELS: Record<string, string> = {
  cash: "Contanti",
  card: "Carta",
  app: "App",
};

function formatIntervals(intervals: { open: string; close: string }[] | null): string {
  if (intervals === null) return "Chiuso";
  if (!intervals.length) return "Chiuso";
  if (intervals.length === 1 && intervals[0].open === "00:00" && intervals[0].close === "23:59") return "24 ore";
  return intervals.map((i) => `${i.open}–${i.close}`).join(" / ");
}

export function StationSheet({ station, onClose }: StationSheetProps) {
  if (!station) return null;

  const now = new Date();
  const todayKey: DayKey = dayKeyFromDate(now);
  const openNow = isStationOpenAt(station, now);

  return (
    <>
      <div
        className="fixed inset-0 z-[1100] bg-foreground/20 backdrop-blur-[2px] animate-in fade-in duration-200"
        onClick={onClose}
      />
      <div className="fixed left-1/2 -translate-x-1/2 bottom-4 z-[1101] w-[calc(100%-2rem)] max-w-md bg-card rounded-2xl shadow-[var(--shadow-panel)] border border-border animate-in slide-in-from-bottom-4 duration-300 max-h-[85vh] overflow-hidden flex flex-col">
        <div className="p-5 overflow-y-auto">
          <div className="flex items-start justify-between gap-3 mb-4">
            <div className="min-w-0">
              <div className="font-bold text-lg leading-tight">{station.name}</div>
              {station.address && (
                <div className="text-sm text-muted-foreground mt-1 flex items-start gap-1">
                  <MapPin className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" />
                  <span>
                    {station.address}, {station.city} ({station.province})
                  </span>
                </div>
              )}
            </div>
            <button
              onClick={onClose}
              className="h-8 w-8 rounded-full hover:bg-secondary flex items-center justify-center transition flex-shrink-0"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="space-y-2.5 text-sm">
            <div className="flex items-center gap-2.5">
              <Clock className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <span className="text-muted-foreground">Stato:</span>
              {openNow === true && (
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-success text-success-foreground">
                  Aperto ora
                </span>
              )}
              {openNow === false && (
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-destructive text-destructive-foreground">
                  Chiuso ora
                </span>
              )}
              {openNow === null && (
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                  Sconosciuto
                </span>
              )}
              {station.always_open && (
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-primary-soft text-primary ml-auto">
                  H24
                </span>
              )}
            </div>

            {station.price != null && (
              <div className="flex items-center gap-2.5">
                <span className="h-4 w-4 flex items-center justify-center text-muted-foreground font-bold text-sm">€</span>
                <span className="text-muted-foreground">Prezzo:</span>
                <span className="font-bold text-base">€ {station.price.toFixed(3)}</span>
                <span className="text-xs text-muted-foreground">/kg</span>
              </div>
            )}

            {station.operator && (
              <div className="flex items-center gap-2.5">
                <Building2 className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <span className="text-muted-foreground">Operatore:</span>
                <span className="font-medium">{station.operator}</span>
              </div>
            )}

            {station.payment_methods && station.payment_methods.length > 0 && (
              <div className="flex items-start gap-2.5">
                <CreditCard className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                <span className="text-muted-foreground">Pagamenti:</span>
                <div className="flex flex-wrap gap-1">
                  {station.payment_methods.map((p: string) => (
                    <span key={p} className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-secondary">
                      {PAYMENT_LABELS[p] ?? p}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Weekly schedule */}
          <div className="mt-5">
            <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
              Orari settimanali
            </div>
            <div className="rounded-lg border border-border overflow-hidden">
              {DAY_ORDER.map((d) => {
                const intervals = station.always_open
                  ? [{ open: "00:00", close: "23:59" }]
                  : station.opening_hours[d];
                const isToday = d === todayKey;
                const isClosed = intervals === null || (Array.isArray(intervals) && intervals.length === 0);
                return (
                  <div
                    key={d}
                    className={`flex items-center justify-between px-3 py-2 text-sm border-b border-border last:border-b-0 ${
                      isToday ? "bg-primary-soft/40 font-semibold" : ""
                    }`}
                  >
                    <span className={isToday ? "text-foreground" : "text-muted-foreground"}>
                      {DAY_LABELS_IT[d]}
                      {isToday && <span className="ml-1.5 text-[10px] uppercase text-primary">Oggi</span>}
                    </span>
                    <span className={isClosed ? "text-destructive" : "text-foreground"}>
                      {formatIntervals(intervals)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <Button className="w-full mt-5 h-11 bg-gradient-to-r from-primary to-primary-glow font-semibold gap-2">
            <Plus className="h-4 w-4" />
            Aggiungi al percorso
          </Button>
        </div>
      </div>
    </>
  );
}
