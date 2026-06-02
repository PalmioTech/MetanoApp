import { createFileRoute } from "@tanstack/react-router";
import { lazy, Suspense, useState } from "react";
import { ChevronUp, ChevronDown, AlertTriangle } from "lucide-react";
import { TripForm } from "@/components/metan/TripForm";
import { ResultsPanel } from "@/components/metan/ResultsPanel";
import { StationSheet } from "@/components/metan/StationSheet";
import { mockPlan, ALL_STATIONS, CITIES } from "@/lib/metan-mock";
import { Navigation, ExternalLink } from "lucide-react";
import { useStations } from "@/hooks/use-stations";
import type { PlanRequest, PlanResult, Station } from "@/lib/metan-types";
import { cn } from "@/lib/utils";
import { Fuel } from "lucide-react";

const MapView = lazy(() =>
  import("@/components/metan/MapView").then((m) => ({ default: m.MapView }))
);

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "MetanApp — Pianifica viaggi a metano (CNG)" },
      { name: "description", content: "Pianifica il tuo viaggio in auto a metano (CNG). Trova le migliori stazioni di rifornimento sul tuo percorso, con prezzi, orari e dettagli." },
      { property: "og:title", content: "MetanApp — Trip Planner per auto a metano" },
      { property: "og:description", content: "Calcola il percorso ottimale e le soste CNG migliori in tutta Italia." },
    ],
  }),
  component: HomePage,
  ssr: false,
});

function HomePage() {
  const { ready: stationsReady, error: stationsError } = useStations();
  const [result, setResult] = useState<PlanResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [highlighted, setHighlighted] = useState<number | null>(null);
  const [selectedStation, setSelectedStation] = useState<Station | null>(null);
  const [formCollapsed, setFormCollapsed] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(true);
  const [lastReq, setLastReq] = useState<PlanRequest | null>(null);
  const [forcedStationIds, setForcedStationIds] = useState<number[]>([]);
  const [hoveredAltId, setHoveredAltId] = useState<number | null>(null);
  const [excludedStationIds, setExcludedStationIds] = useState<number[]>([]);

  const runPlan = async (req: PlanRequest) => {
    setLoading(true);
    const res = await mockPlan(req);
    setResult(res);
    setLastReq(req);
    setLoading(false);
  };

  const handlePlan = async (req: PlanRequest) => {
    setForcedStationIds([]);
    setExcludedStationIds([]);
    await runPlan({ ...req, forced_station_ids: [], excluded_station_ids: [] });
    setFormCollapsed(true);
    setDrawerOpen(true);
  };

  const handleEdit = () => {
    setFormCollapsed(false);
    setResult(null);
    setForcedStationIds([]);
    setExcludedStationIds([]);
    setLastReq(null);
  };

  const handleAddStation = async (stationId: number) => {
    if (!lastReq) return;
    if (forcedStationIds.includes(stationId)) return;
    const next = [...forcedStationIds, stationId];
    setForcedStationIds(next);
    setHighlighted(null);
    await runPlan({ ...lastReq, forced_station_ids: next, excluded_station_ids: excludedStationIds });
    // On mobile, collapse drawer to show the map with the new stop
    if (window.innerWidth < 768) setDrawerOpen(false);
  };

  const handleSwapStation = async (oldId: number, newId: number) => {
    if (!lastReq) return;
    const nextForced = forcedStationIds.filter((id) => id !== oldId).concat(newId);
    const nextExcluded = [...excludedStationIds.filter((id) => id !== newId), oldId];
    setForcedStationIds(nextForced);
    setExcludedStationIds(nextExcluded);
    setHighlighted(null);
    await runPlan({ ...lastReq, forced_station_ids: nextForced, excluded_station_ids: nextExcluded });
  };

  const handleRemoveStation = async (stationId: number) => {
    if (!lastReq) return;
    // Remove from forced AND add to excluded so algorithm skips it
    const nextForced = forcedStationIds.filter((id) => id !== stationId);
    const nextExcluded = [...excludedStationIds, stationId];
    setForcedStationIds(nextForced);
    setExcludedStationIds(nextExcluded);
    setHighlighted(null);
    await runPlan({ ...lastReq, forced_station_ids: nextForced, excluded_station_ids: nextExcluded });
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-background">
      <Suspense fallback={<div className="w-screen h-screen bg-secondary animate-pulse" />}>
        <MapView
          result={result}
          highlightedStopNumber={highlighted}
          externalHoveredStationId={hoveredAltId}
          onStationClick={setSelectedStation}
        />
      </Suspense>

      {/* Stations CSV loading / error */}
      {!stationsReady && !stationsError && (
        <div className="absolute inset-0 z-[2500] flex items-center justify-center bg-background/70 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-3 p-6 rounded-2xl bg-card border border-border shadow-[var(--shadow-panel)]">
            <div className="h-10 w-10 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
            <p className="text-sm font-medium text-foreground">Carico distributori…</p>
          </div>
        </div>
      )}
      {stationsError && (
        <div className="absolute inset-0 z-[2500] flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
          <div className="max-w-sm flex flex-col items-center gap-3 p-6 rounded-2xl bg-card border border-destructive/40 shadow-[var(--shadow-panel)] text-center">
            <AlertTriangle className="h-8 w-8 text-destructive" />
            <p className="text-sm font-semibold">Impossibile caricare i distributori</p>
            <p className="text-xs text-muted-foreground">{stationsError}</p>
            <p className="text-[11px] text-muted-foreground">Verifica che il file <code>public/distributori.csv</code> esista.</p>
          </div>
        </div>
      )}

      {/* Loading overlay */}
      {loading && (
        <div className="absolute inset-0 z-[2000] flex items-center justify-center bg-background/60 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-4 p-8 rounded-2xl bg-card border border-border shadow-[var(--shadow-panel)]">
            <div className="relative h-16 w-16">
              <div className="absolute inset-0 rounded-full border-4 border-primary/20" />
              <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-primary animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Fuel className="h-6 w-6 text-primary animate-pulse" />
              </div>
            </div>
            <div className="text-center">
              <p className="text-sm font-semibold text-foreground">Calcolo percorso...</p>
              <p className="text-xs text-muted-foreground mt-1">Cerco le migliori stazioni CNG</p>
            </div>
          </div>
        </div>
      )}

      {/* Floating left panel (desktop) — also acts as full sheet on mobile when no result */}
      <div
        className={cn(
          "absolute z-[1000] transition-all duration-300",
          "md:top-4 md:left-4 md:bottom-4 md:w-[380px]",
          !result && "top-0 left-0 right-0 bottom-0 md:bottom-4",
          result && formCollapsed && "hidden md:block",
          formCollapsed && "md:opacity-0 md:pointer-events-none md:-translate-x-4"
        )}
      >
        <div className="bg-card md:rounded-2xl shadow-[var(--shadow-panel)] border border-border h-full overflow-y-auto p-5 md:p-6">
          <TripForm onPlan={handlePlan} loading={loading} />
        </div>
      </div>

      {/* Compact "edit" chip when form collapsed (desktop) */}
      {result && formCollapsed && (
        <button
          onClick={handleEdit}
          className="hidden md:flex absolute top-4 left-4 z-[1000] items-center gap-2 bg-card border border-border rounded-full px-4 py-2.5 shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-panel)] transition text-sm font-medium"
        >
          <ChevronUp className="h-4 w-4 rotate-[-90deg]" />
          Modifica viaggio
        </button>
      )}

      {/* Bottom drawer with results */}
      {result && (
        <div
          className={cn(
            "absolute z-[1000] transition-all duration-300 ease-out",
            "md:bottom-4 md:right-4 md:w-[420px] md:max-h-[calc(100vh-2rem)] md:rounded-2xl",
            "left-0 right-0 bottom-0 md:left-auto",
            drawerOpen
              ? "h-[80vh] md:h-[calc(100vh-2rem)]"
              : "h-[64px]"
          )}
        >
          <div className="bg-card border border-border md:rounded-2xl rounded-t-3xl shadow-[var(--shadow-panel)] overflow-hidden h-full flex flex-col">
            <button
              onClick={() => setDrawerOpen(!drawerOpen)}
              className="md:hidden flex flex-col items-center justify-center py-2 border-b border-border"
            >
              <div className="h-1 w-10 rounded-full bg-border mb-1" />
              <div className="text-[11px] text-muted-foreground flex items-center gap-1">
                {drawerOpen ? (
                  <>
                    <ChevronDown className="h-3 w-3" />
                    Riduci
                  </>
                ) : (
                  <>
                    <ChevronUp className="h-3 w-3" />
                    {result.stops.length} {result.stops.length === 1 ? "sosta" : "soste"} · {result.route.distance_km} km
                  </>
                )}
              </div>
            </button>

            {drawerOpen && (
              <ResultsPanel
                result={result}
                highlightedStopNumber={highlighted}
                onHighlight={setHighlighted}
                onEdit={handleEdit}
                onAddStation={handleAddStation}
                onSwapStation={handleSwapStation}
                onRemoveStation={handleRemoveStation}
                onAlternativeHover={setHoveredAltId}
                forcedStationIds={forcedStationIds}
                origin={lastReq?.origin ?? ""}
                destination={lastReq?.destination ?? ""}
              />
            )}
          </div>
        </div>
      )}

      <StationSheet
        station={selectedStation}
        onClose={() => setSelectedStation(null)}
        canAdd={!!result}
        isAdded={selectedStation ? forcedStationIds.includes(selectedStation.id) : false}
        onAddStation={handleAddStation}
        onRemoveStation={handleRemoveStation}
      />
    </div>
  );
}
