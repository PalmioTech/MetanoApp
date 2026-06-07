import { useState, useRef, useEffect } from "react";
import { Crosshair, Plus, X, Loader2, Fuel, Navigation, Gauge } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { CITIES } from "@/lib/metan-mock";
import type { PlanRequest } from "@/lib/metan-types";
import { cn } from "@/lib/utils";

interface CityInputProps {
  value: string;
  onChange: (v: string) => void;
  onCoordsChange?: (coords: { lat: number; lng: number } | null) => void;
  placeholder: string;
  showGeo?: boolean;
}

function CityInput({ value, onChange, onCoordsChange, placeholder, showGeo }: CityInputProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const [geoLoading, setGeoLoading] = useState(false);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const [nominatimResults, setNominatimResults] = useState<{ display: string; label: string; lat: number; lng: number }[]>([]);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!value || value.length < 3) { setNominatimResults([]); return; }
    const cityMatch = CITIES.filter((c) => c.toLowerCase().includes(value.toLowerCase()));
    if (cityMatch.length >= 3) { setNominatimResults([]); return; }
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&countrycodes=it&limit=6&q=${encodeURIComponent(value)}`,
        );
        const data = await res.json();
        setNominatimResults(
          data.map((d: any) => ({
            display: d.display_name.split(",").slice(0, 3).join(","),
            label: d.display_name.split(",").slice(0, 2).join(",").trim(),
            lat: parseFloat(d.lat),
            lng: parseFloat(d.lon),
          }))
        );
      } catch { setNominatimResults([]); }
    }, 400);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [value]);

  const filtered = value
    ? CITIES.filter((c) => c.toLowerCase().includes(value.toLowerCase())).slice(0, 4)
    : [];

  const handleGeolocate = () => {
    if (!navigator.geolocation) return;
    setGeoLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        onCoordsChange?.({ lat: latitude, lng: longitude });
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
          );
          const data = await res.json();
          const label = data.address?.road
            ? `${data.address.road}, ${data.address.city || data.address.town || data.address.village || ""}`
            : data.display_name?.split(",").slice(0, 2).join(",").trim() || `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
          onChange(label);
        } catch {
          onChange(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
        }
        setGeoLoading(false);
      },
      () => {
        setGeoLoading(false);
        alert("Impossibile ottenere la posizione. Controlla i permessi del browser.");
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  return (
    <div ref={ref} className="relative">
      <div className="relative">
        <Input
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            onCoordsChange?.(null);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          placeholder={placeholder}
          className={cn("h-11 pr-10 bg-secondary/50 border-secondary focus-visible:bg-card")}
        />
        {showGeo && (
          <button
            type="button"
            onClick={handleGeolocate}
            disabled={geoLoading}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-md hover:bg-primary-soft text-primary transition"
            title="Usa la mia posizione"
          >
            {geoLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Crosshair className="h-4 w-4" />}
          </button>
        )}
      </div>
      {open && (filtered.length > 0 || nominatimResults.length > 0) && (
        <div className="absolute z-[1000] mt-1 w-full bg-card border border-border rounded-lg shadow-lg overflow-hidden max-h-52 overflow-y-auto">
          {filtered.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => {
                onChange(c);
                onCoordsChange?.(null);
                setOpen(false);
              }}
              className="w-full text-left px-3 py-2 text-sm hover:bg-primary-soft transition"
            >
              {c}
            </button>
          ))}
          {nominatimResults.length > 0 && filtered.length > 0 && (
            <div className="border-t border-border px-3 py-1 text-[10px] text-muted-foreground uppercase tracking-wide">Indirizzi</div>
          )}
          {nominatimResults.map((r, i) => (
            <button
              key={i}
              type="button"
              onClick={() => {
                onChange(r.label);
                onCoordsChange?.({ lat: r.lat, lng: r.lng });
                setOpen(false);
              }}
              className="w-full text-left px-3 py-2 text-xs hover:bg-primary-soft transition text-muted-foreground"
            >
              {r.display}
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
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [originCoords, setOriginCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [destCoords, setDestCoords] = useState<{ lat: number; lng: number } | null>(null);
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
      origin_coords: originCoords ?? undefined,
      destination_coords: destCoords ?? undefined,
    } as any);
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
          <CityInput
            value={origin}
            onChange={setOrigin}
            onCoordsChange={setOriginCoords}
            placeholder="Città, via o indirizzo"
            showGeo
          />
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
                placeholder="Città, via o indirizzo"
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
          <CityInput
            value={destination}
            onChange={setDestination}
            onCoordsChange={setDestCoords}
            placeholder="Città, via o indirizzo"
          />
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
        disabled={loading || !origin.trim() || !destination.trim()}
        className="w-full h-12 text-sm font-semibold bg-gradient-to-r from-primary to-primary-glow hover:opacity-95 shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
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
