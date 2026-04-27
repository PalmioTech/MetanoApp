import { useState, useRef, useEffect } from "react";
import { Crosshair, Plus, X, Loader2, Fuel } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CITIES } from "@/lib/metan-mock";
import type { PlanRequest } from "@/lib/metan-types";
import { cn } from "@/lib/utils";

interface CityInputProps {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  showGeo?: boolean;
}

function CityInput({ value, onChange, placeholder, showGeo }: CityInputProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const filtered = value
    ? CITIES.filter((c) => c.toLowerCase().includes(value.toLowerCase())).slice(0, 6)
    : [];

  return (
    <div ref={ref} className="relative">
      <div className="relative">
        <Input
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          placeholder={placeholder}
          className={cn("h-11 pr-10 bg-secondary/50 border-secondary focus-visible:bg-card")}
        />
        {showGeo && (
          <button
            type="button"
            onClick={() => onChange("Bologna")}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-md hover:bg-primary-soft text-primary transition"
            title="Usa la mia posizione"
          >
            <Crosshair className="h-4 w-4" />
          </button>
        )}
      </div>
      {open && filtered.length > 0 && (
        <div className="absolute z-[1000] mt-1 w-full bg-card border border-border rounded-lg shadow-lg overflow-hidden">
          {filtered.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => {
                onChange(c);
                setOpen(false);
              }}
              className="w-full text-left px-3 py-2 text-sm hover:bg-primary-soft transition"
            >
              {c}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

interface TripFormProps {
  onPlan: (req: PlanRequest) => void;
  loading: boolean;
}

export function TripForm({ onPlan, loading }: TripFormProps) {
  const [origin, setOrigin] = useState("Bologna");
  const [destination, setDestination] = useState("Milano");
  const [waypoints, setWaypoints] = useState<string[]>([]);
  const [showWaypoints, setShowWaypoints] = useState(false);
  const [currentRange, setCurrentRange] = useState("80");
  const [maxRange, setMaxRange] = useState("250");
  const [safety, setSafety] = useState("20");
  const [departMode, setDepartMode] = useState<"now" | "schedule">("now");
  const [departAt, setDepartAt] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onPlan({
      origin,
      destination,
      waypoints,
      current_range_km: Number(currentRange) || 0,
      max_range_km: Number(maxRange) || 0,
      safety_margin_km: Number(safety) || 0,
      depart_at: departMode === "schedule" ? departAt : null,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="flex items-center gap-2.5">
        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center shadow-md">
          <Fuel className="h-5 w-5 text-primary-foreground" />
        </div>
        <div>
          <div className="font-bold text-lg leading-tight">MetanApp</div>
          <div className="text-[11px] text-muted-foreground leading-tight">CNG Trip Planner</div>
        </div>
      </div>

      <div>
        <h2 className="text-base font-semibold tracking-tight">
          Pianifica il tuo viaggio a metano
        </h2>
        <p className="text-xs text-muted-foreground mt-0.5">
          Trova le stazioni CNG migliori sul percorso
        </p>
      </div>

      <div className="space-y-3">
        <div className="space-y-1.5">
          <Label className="text-xs font-medium text-muted-foreground">Partenza</Label>
          <CityInput value={origin} onChange={setOrigin} placeholder="Da dove parti?" showGeo />
        </div>

        {showWaypoints && waypoints.map((wp, i) => (
          <div key={i} className="space-y-1.5">
            <Label className="text-xs font-medium text-muted-foreground">
              Tappa intermedia {i + 1}
            </Label>
            <div className="flex gap-2">
              <CityInput
                value={wp}
                onChange={(v) => setWaypoints(waypoints.map((w, j) => (j === i ? v : w)))}
                placeholder="Città"
              />
              <button
                type="button"
                onClick={() => setWaypoints(waypoints.filter((_, j) => j !== i))}
                className="h-11 w-11 flex items-center justify-center rounded-md border border-border text-muted-foreground hover:text-destructive hover:border-destructive transition"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}

        <div className="space-y-1.5">
          <Label className="text-xs font-medium text-muted-foreground">Destinazione</Label>
          <CityInput value={destination} onChange={setDestination} placeholder="Dove vai?" />
        </div>

        <button
          type="button"
          onClick={() => {
            setShowWaypoints(true);
            setWaypoints([...waypoints, ""]);
          }}
          className="text-xs font-medium text-primary hover:text-primary-glow flex items-center gap-1 transition"
        >
          <Plus className="h-3.5 w-3.5" />
          Aggiungi tappa intermedia
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label className="text-xs font-medium text-muted-foreground">
            Autonomia attuale (km)
          </Label>
          <Input
            type="number"
            value={currentRange}
            onChange={(e) => setCurrentRange(e.target.value)}
            className="h-11 bg-secondary/50 border-secondary"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs font-medium text-muted-foreground">
            Km con il pieno (max)
          </Label>
          <Input
            type="number"
            value={maxRange}
            onChange={(e) => setMaxRange(e.target.value)}
            className="h-11 bg-secondary/50 border-secondary"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs font-medium text-muted-foreground">
          Margine sicurezza (km)
        </Label>
        <Input
          type="number"
          value={safety}
          onChange={(e) => setSafety(e.target.value)}
          className="h-11 bg-secondary/50 border-secondary"
        />
      </div>

      <div className="space-y-2">
        <div className="grid grid-cols-2 gap-1 p-1 bg-secondary rounded-lg">
          <button
            type="button"
            onClick={() => setDepartMode("now")}
            className={cn(
              "py-2 text-xs font-medium rounded-md transition",
              departMode === "now"
                ? "bg-card shadow-sm text-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            Parto ora
          </button>
          <button
            type="button"
            onClick={() => setDepartMode("schedule")}
            className={cn(
              "py-2 text-xs font-medium rounded-md transition",
              departMode === "schedule"
                ? "bg-card shadow-sm text-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            Organizza viaggio
          </button>
        </div>
        {departMode === "schedule" && (
          <Input
            type="datetime-local"
            value={departAt}
            onChange={(e) => setDepartAt(e.target.value)}
            className="h-11 bg-secondary/50 border-secondary"
          />
        )}
      </div>

      <Button
        type="submit"
        disabled={loading}
        className="w-full h-12 text-sm font-semibold bg-gradient-to-r from-primary to-primary-glow hover:opacity-95 shadow-md"
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Calcolo in corso...
          </>
        ) : (
          "Trova il percorso migliore"
        )}
      </Button>
    </form>
  );
}
