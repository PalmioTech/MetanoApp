import { X, MapPin, Clock, CreditCard, Building2, Plus, Navigation } from "lucide-react";
import { Capacitor } from "@capacitor/core";
import type { Station, DayKey } from "@/lib/metan-types";
import { DAY_ORDER, DAY_LABELS_IT, isStationOpenAt, dayKeyFromDate } from "@/lib/metan-types";
import { Button } from "@/components/ui/button";
import type { Language } from "@/lib/i18n";

const sheetCopy = {
  it: {
    cash: "Contanti",
    card: "Carta",
    app: "App",
    closed: "Chiuso",
    allDay: "24 ore",
    status: "Stato:",
    openNow: "Aperto ora",
    closedNow: "Chiuso ora",
    unknown: "Sconosciuto",
    price: "Prezzo:",
    operator: "Operatore:",
    payments: "Pagamenti:",
    weeklyHours: "Orari settimanali",
    selfService: "Self service",
    today: "Oggi",
    removeRoute: "Rimuovi dal percorso",
    addRoute: "Aggiungi al percorso",
    close: "Chiudi",
    days: DAY_LABELS_IT,
  },
  en: {
    cash: "Cash",
    card: "Card",
    app: "App",
    closed: "Closed",
    allDay: "24 hours",
    status: "Status:",
    openNow: "Open now",
    closedNow: "Closed now",
    unknown: "Unknown",
    price: "Price:",
    operator: "Operator:",
    payments: "Payments:",
    weeklyHours: "Weekly hours",
    selfService: "Self-service",
    today: "Today",
    removeRoute: "Remove from route",
    addRoute: "Add to route",
    close: "Close",
    days: {
      monday: "Monday",
      tuesday: "Tuesday",
      wednesday: "Wednesday",
      thursday: "Thursday",
      friday: "Friday",
      saturday: "Saturday",
      sunday: "Sunday",
    },
  },
} as const;

interface StationSheetProps {
  station: Station | null;
  onClose: () => void;
  onAddStation?: (stationId: number) => void;
  onRemoveStation?: (stationId: number) => void;
  isAdded?: boolean;
  canAdd?: boolean;
  language: Language;
}

function formatIntervals(intervals: { open: string; close: string }[] | null, language: Language): string {
  const t = sheetCopy[language];
  if (intervals === null) return t.closed;
  if (!intervals.length) return t.closed;
  if (intervals.length === 1 && intervals[0].open === "00:00" && intervals[0].close === "23:59") return t.allDay;
  return intervals.map((i) => `${i.open}–${i.close}`).join(" / ");
}

function paymentLabel(method: string, language: Language): string {
  const t = sheetCopy[language];
  if (method === "cash") return t.cash;
  if (method === "card") return t.card;
  if (method === "app") return t.app;
  return method;
}

export function StationSheet({ station, onClose, onAddStation, onRemoveStation, isAdded, canAdd, language }: StationSheetProps) {
  if (!station) return null;
  const t = sheetCopy[language];

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
              title={t.close}
              className="h-8 w-8 rounded-full hover:bg-secondary flex items-center justify-center transition flex-shrink-0"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="space-y-2.5 text-sm">
            <div className="flex items-center gap-2.5">
              <Clock className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <span className="text-muted-foreground">{t.status}</span>
              {openNow === true && (
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-success text-success-foreground">
                  {t.openNow}
                </span>
              )}
              {openNow === false && (
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-destructive text-destructive-foreground">
                  {t.closedNow}
                </span>
              )}
              {openNow === null && (
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                  {t.unknown}
                </span>
              )}
              {station.self_service && (
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-sky-100 text-sky-700">
                  {t.selfService}
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
                <span className="text-muted-foreground">{t.price}</span>
                <span className="font-bold text-base">€ {station.price.toFixed(3)}</span>
                <span className="text-xs text-muted-foreground">/kg</span>
              </div>
            )}

            {station.operator && (
              <div className="flex items-center gap-2.5">
                <Building2 className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <span className="text-muted-foreground">{t.operator}</span>
                <span className="font-medium">{station.operator}</span>
              </div>
            )}

            {station.payment_methods && station.payment_methods.length > 0 && (
              <div className="flex items-start gap-2.5">
                <CreditCard className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                <span className="text-muted-foreground">{t.payments}</span>
                <div className="flex flex-wrap gap-1">
                  {station.payment_methods.map((p: string) => (
                    <span key={p} className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-secondary">
                      {paymentLabel(p, language)}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Weekly schedule */}
          <div className="mt-5">
            <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
              {t.weeklyHours}
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
                      {t.days[d]}
                      {isToday && <span className="ml-1.5 text-[10px] uppercase text-primary">{t.today}</span>}
                    </span>
                    <span className={isClosed ? "text-destructive" : "text-foreground"}>
                      {formatIntervals(intervals, language)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Naviga fino a questo distributore */}
          <div className="mt-5 flex gap-2">
            <a
              href={`https://www.google.com/maps/dir/?api=1&destination=${station.lat},${station.lng}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 h-11 inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-primary to-primary-glow text-primary-foreground text-sm font-semibold active:scale-[0.98] transition"
            >
              <Navigation className="h-4 w-4" />
              Google Maps
            </a>
            {Capacitor.getPlatform() !== "android" && (
              <a
                href={`https://maps.apple.com/?daddr=${station.lat},${station.lng}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 h-11 inline-flex items-center justify-center gap-2 rounded-lg border border-border bg-secondary text-foreground text-sm font-semibold active:scale-[0.98] transition"
              >
                <Navigation className="h-4 w-4" />
                Apple Maps
              </a>
            )}
          </div>

          {canAdd && (
            isAdded ? (
              <Button
                onClick={() => { onRemoveStation?.(station.id); onClose(); }}
                variant="outline"
                className="w-full mt-5 h-11 border-destructive/40 text-destructive hover:bg-destructive/10 font-semibold gap-2"
              >
                <X className="h-4 w-4" />
                {t.removeRoute}
              </Button>
            ) : (
              <Button
                onClick={() => { onAddStation?.(station.id); onClose(); }}
                className="w-full mt-5 h-11 bg-gradient-to-r from-primary to-primary-glow font-semibold gap-2"
              >
                <Plus className="h-4 w-4" />
                {t.addRoute}
              </Button>
            )
          )}
        </div>
      </div>
    </>
  );
}
