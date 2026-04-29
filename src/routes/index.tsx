import { createFileRoute } from "@tanstack/react-router";
import { lazy, Suspense, useState } from "react";
import { ChevronUp, ChevronDown } from "lucide-react";
import { TripForm } from "@/components/metan/TripForm";
import { ResultsPanel } from "@/components/metan/ResultsPanel";
import { StationSheet } from "@/components/metan/StationSheet";
import { mockPlan } from "@/lib/metan-mock";
import type { PlanRequest, PlanResult, Station } from "@/lib/metan-types";
import { cn } from "@/lib/utils";

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
  const [result, setResult] = useState<PlanResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [highlighted, setHighlighted] = useState<number | null>(null);
  const [selectedStation, setSelectedStation] = useState<Station | null>(null);
  const [formCollapsed, setFormCollapsed] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(true);
  const [lastReq, setLastReq] = useState<PlanRequest | null>(null);
  const [forcedStationIds, setForcedStationIds] = useState<number[]>([]);
  const [hoveredAltId, setHoveredAltId] = useState<number | null>(null);

  const runPlan = async (req: PlanRequest) => {
    setLoading(true);
    const res = await mockPlan(req);
    setResult(res);
    setLastReq(req);
    setLoading(false);
  };

  const handlePlan = async (req: PlanRequest) => {
    // Fresh plan from form -> reset forced stops
    setForcedStationIds([]);
    await runPlan({ ...req, forced_station_ids: [] });
    setFormCollapsed(true);
    setDrawerOpen(true);
  };

  const handleEdit = () => {
    setFormCollapsed(false);
    setResult(null);
    setForcedStationIds([]);
    setLastReq(null);
  };

  const handleAddStation = async (stationId: number) => {
    if (!lastReq) return;
    if (forcedStationIds.includes(stationId)) return;
    const next = [...forcedStationIds, stationId];
    setForcedStationIds(next);
    setHighlighted(null); // return map to overview
    await runPlan({ ...lastReq, forced_station_ids: next });
  };

  const handleSwapStation = async (oldId: number, newId: number) => {
    if (!lastReq) return;
    const next = forcedStationIds.filter((id) => id !== oldId).concat(newId);
    setForcedStationIds(next);
    setHighlighted(null);
    await runPlan({ ...lastReq, forced_station_ids: next });
  };

  const handleRemoveStation = async (stationId: number) => {
    if (!lastReq) return;
    const next = forcedStationIds.filter((id) => id !== stationId);
    setForcedStationIds(next);
    setHighlighted(null);
    await runPlan({ ...lastReq, forced_station_ids: next });
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

      {/* Floating left panel (desktop) — also acts as full sheet on mobile when no result */}
      <div
        className={cn(
          "absolute z-[1000] transition-all duration-300",
          // Desktop
          "md:top-4 md:left-4 md:bottom-4 md:w-[380px]",
          // Mobile when planning
          !result && "top-0 left-0 right-0 bottom-0 md:bottom-4",
          // Mobile after result: collapsed to a chip
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
            // Desktop: bottom-right floating panel
            "md:bottom-4 md:right-4 md:w-[420px] md:max-h-[calc(100vh-2rem)] md:rounded-2xl",
            // Mobile: bottom sheet
            "left-0 right-0 bottom-0 md:left-auto",
            drawerOpen
              ? "max-h-[70vh] md:max-h-[calc(100vh-2rem)]"
              : "max-h-[64px]"
          )}
        >
          <div className="bg-card border border-border md:rounded-2xl rounded-t-3xl shadow-[var(--shadow-panel)] overflow-hidden h-full flex flex-col">
            {/* Mobile drag handle / collapse */}
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
              />
            )}
          </div>
        </div>
      )}

      <StationSheet station={selectedStation} onClose={() => setSelectedStation(null)} />
    </div>
  );
}
