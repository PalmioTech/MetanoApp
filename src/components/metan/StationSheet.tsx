import { X, MapPin, Clock, CreditCard, Building2, Plus } from "lucide-react";
import type { Station } from "@/lib/metan-types";
import { Button } from "@/components/ui/button";

interface StationSheetProps {
  station: Station | null;
  onClose: () => void;
}

export function StationSheet({ station, onClose }: StationSheetProps) {
  if (!station) return null;

  const isOpen = station.hours && station.hours !== "Sconosciuto";

  return (
    <>
      <div
        className="fixed inset-0 z-[1100] bg-foreground/20 backdrop-blur-[2px] animate-in fade-in duration-200"
        onClick={onClose}
      />
      <div className="fixed left-1/2 -translate-x-1/2 bottom-4 z-[1101] w-[calc(100%-2rem)] max-w-md bg-card rounded-2xl shadow-[var(--shadow-panel)] border border-border animate-in slide-in-from-bottom-4 duration-300">
        <div className="p-5">
          <div className="flex items-start justify-between gap-3 mb-4">
            <div>
              <div className="font-bold text-lg leading-tight">{station.name}</div>
              {station.address && (
                <div className="text-sm text-muted-foreground mt-1 flex items-start gap-1">
                  <MapPin className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" />
                  <span>{station.address}, {station.city} ({station.province})</span>
                </div>
              )}
            </div>
            <button
              onClick={onClose}
              className="h-8 w-8 rounded-full hover:bg-secondary flex items-center justify-center transition"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="space-y-2.5 text-sm">
            <div className="flex items-center gap-2.5">
              <Clock className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <span className="text-muted-foreground">Orario:</span>
              <span className="font-medium">{station.hours ?? "Sconosciuto"}</span>
              {isOpen && (
                <span className="ml-auto text-[10px] font-semibold px-2 py-0.5 rounded-full bg-success text-success-foreground">
                  Aperto
                </span>
              )}
            </div>

            {station.price && (
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

            {station.payment && (
              <div className="flex items-start gap-2.5">
                <CreditCard className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                <span className="text-muted-foreground">Pagamenti:</span>
                <div className="flex flex-wrap gap-1">
                  {station.payment.map((p) => (
                    <span key={p} className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-secondary">
                      {p}
                    </span>
                  ))}
                </div>
              </div>
            )}
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
