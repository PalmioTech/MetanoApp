import { createFileRoute } from "@tanstack/react-router";
import { lazy, Suspense, useEffect, useState } from "react";
import { ChevronUp, ChevronDown, AlertTriangle, MapPinned, X } from "lucide-react";
import { TripForm } from "@/components/metan/TripForm";
import { ResultsPanel } from "@/components/metan/ResultsPanel";
import { StationSheet } from "@/components/metan/StationSheet";
import { mockPlan, ALL_STATIONS, CITIES } from "@/lib/metan-mock";
import { Navigation, ExternalLink } from "lucide-react";
import { useStations } from "@/hooks/use-stations";
import type { PlanRequest, PlanResult, Station } from "@/lib/metan-types";
import type { Language } from "@/lib/i18n";
import { LANGUAGE_STORAGE_KEY, copy, languageFlags, languageNames } from "@/lib/i18n";
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
      { property: "og:url", content: "https://metano-route-genius.lovable.app/" },
      { property: "og:type", content: "website" },
    ],
    links: [
      { rel: "canonical", href: "https://metano-route-genius.lovable.app/" },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebApplication",
          name: "MetanApp",
          url: "https://metano-route-genius.lovable.app/",
          description: "Pianifica viaggi a metano (CNG) trovando le migliori stazioni sul percorso.",
          applicationCategory: "TravelApplication",
          operatingSystem: "Any",
          offers: { "@type": "Offer", price: "0", priceCurrency: "EUR" },
        }),
      },
    ],
  }),
  component: HomePage,
  ssr: false,
});

function HomePage() {
  const [language, setLanguageState] = useState<Language | null>(null);
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
  const [mobileFormOpen, setMobileFormOpen] = useState(false);
  const t = copy[language ?? "it"];

  useEffect(() => {
    const stored = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);
    if (stored === "it" || stored === "en") setLanguageState(stored);
  }, []);

  const setLanguage = (next: Language) => {
    window.localStorage.setItem(LANGUAGE_STORAGE_KEY, next);
    setLanguageState(next);
  };

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
    setMobileFormOpen(false);
  };

  const handleEdit = () => {
    setFormCollapsed(false);
    setResult(null);
    setForcedStationIds([]);
    setExcludedStationIds([]);
    setLastReq(null);
    setMobileFormOpen(true);
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
    // Find the removed station, then exclude every station within ~40 km of it
    // so the algorithm doesn't immediately substitute another stop in the same area.
    const removed = ALL_STATIONS.find((s) => s.id === stationId);
    const RADIUS_KM = 40;
    const toRad = (x: number) => (x * Math.PI) / 180;
    const distKm = (a: { lat: number; lng: number }, b: { lat: number; lng: number }) => {
      const R = 6371;
      const dLat = toRad(b.lat - a.lat);
      const dLng = toRad(b.lng - a.lng);
      const h =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
      return 2 * R * Math.asin(Math.sqrt(h));
    };
    const nearby = removed
      ? ALL_STATIONS.filter((s) => distKm(removed, s) <= RADIUS_KM).map((s) => s.id)
      : [stationId];
    const nextForced = forcedStationIds.filter((id) => !nearby.includes(id));
    const nextExcluded = Array.from(new Set([...excludedStationIds, ...nearby]));
    setForcedStationIds(nextForced);
    setExcludedStationIds(nextExcluded);
    setHighlighted(null);
    await runPlan({ ...lastReq, forced_station_ids: nextForced, excluded_station_ids: nextExcluded });
  };

  // Build a Google Maps directions URL for the full planned route.
  const buildGoogleMapsUrl = (): string | null => {
    if (!result || !lastReq) return null;
    const poly = result.route.polyline;
    const cityNames = new Set(CITIES.map((c) => c.toLowerCase().trim()));
    const isCity = (s: string) => cityNames.has(s.toLowerCase().trim());
    const originParam = isCity(lastReq.origin) || !poly.length
      ? lastReq.origin
      : `${poly[0][0]},${poly[0][1]}`;
    const destParam = isCity(lastReq.destination) || !poly.length
      ? lastReq.destination
      : `${poly[poly.length - 1][0]},${poly[poly.length - 1][1]}`;
    const stops = result.stops.map((s) => `${s.station.lat},${s.station.lng}`);
    const waypoints = stops.length > 0 ? `&waypoints=${stops.join("|")}` : "";
    return `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(originParam)}&destination=${encodeURIComponent(destParam)}${waypoints}&travelmode=driving`;
  };

  // Build an Apple Maps directions URL for the full planned route.
  const buildAppleMapsUrl = (): string | null => {
    if (!result || !lastReq) return null;
    const poly = result.route.polyline;
    const cityNames = new Set(CITIES.map((c) => c.toLowerCase().trim()));
    const isCity = (s: string) => cityNames.has(s.toLowerCase().trim());
    const originParam = isCity(lastReq.origin) || !poly.length
      ? lastReq.origin
      : `${poly[0][0]},${poly[0][1]}`;
    const destParam = isCity(lastReq.destination) || !poly.length
      ? lastReq.destination
      : `${poly[poly.length - 1][0]},${poly[poly.length - 1][1]}`;
    const stops = result.stops.map((s) => encodeURIComponent(`${s.station.lat},${s.station.lng}`));
    if (stops.length > 0) {
      return `https://maps.apple.com/?dirflg=d&saddr=${encodeURIComponent(originParam)}&daddr=${stops.join("+to:")}+to:${encodeURIComponent(destParam)}`;
    }
    return `https://maps.apple.com/?dirflg=d&saddr=${encodeURIComponent(originParam)}&daddr=${encodeURIComponent(destParam)}`;
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-background">
      {!language && (
        <div className="absolute inset-0 z-[3000] flex items-center justify-center bg-background/90 backdrop-blur-md p-5">
          <div className="w-full max-w-sm rounded-2xl border border-border bg-card shadow-[var(--shadow-panel)] p-5">
            <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center shadow-md mb-4">
              <Fuel className="h-6 w-6 text-primary-foreground" />
            </div>
            <h1 className="text-xl font-bold text-foreground">{t.chooseTitle}</h1>
            <p className="text-sm text-muted-foreground mt-1">{t.chooseSubtitle}</p>
            <div className="grid grid-cols-2 gap-2 mt-5">
              {(["it", "en"] as const).map((lang) => (
                <button
                  key={lang}
                  type="button"
                  onClick={() => setLanguage(lang)}
                  className="relative h-24 overflow-hidden rounded-xl border border-border bg-secondary/50 text-sm font-semibold text-foreground hover:border-primary hover:bg-primary-soft transition"
                >
                  <span className="absolute -right-2 -bottom-5 text-7xl opacity-25 saturate-125" aria-hidden="true">
                    {languageFlags[lang]}
                  </span>
                  <span className="relative z-10 flex h-full flex-col items-start justify-end gap-1 p-3 text-left">
                    <span className="text-2xl" aria-hidden="true">{languageFlags[lang]}</span>
                    <span>{languageNames[lang]}</span>
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
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
            <p className="text-sm font-medium text-foreground">{t.loadingStations}</p>
          </div>
        </div>
      )}
      {stationsError && (
        <div className="absolute inset-0 z-[2500] flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
          <div className="max-w-sm flex flex-col items-center gap-3 p-6 rounded-2xl bg-card border border-destructive/40 shadow-[var(--shadow-panel)] text-center">
            <AlertTriangle className="h-8 w-8 text-destructive" />
            <p className="text-sm font-semibold">{t.stationLoadError}</p>
            <p className="text-xs text-muted-foreground">{stationsError}</p>
            <p className="text-[11px] text-muted-foreground">{t.stationLoadHint}</p>
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
              <p className="text-sm font-semibold text-foreground">{t.calculating}</p>
              <p className="text-xs text-muted-foreground mt-1">{t.calculatingSub}</p>
            </div>
          </div>
        </div>
      )}

      {/* Floating left panel (desktop) — full sheet on mobile only when mobileFormOpen */}
      <div
        className={cn(
          "absolute z-[1500] transition-all duration-300",
          "md:top-4 md:left-4 md:bottom-4 md:w-[380px]",
          "top-0 left-0 right-0 bottom-0 md:bottom-4",
          // Mobile visibility
          !mobileFormOpen && "hidden md:block",
          // Desktop: hide when form is collapsed after a plan
          result && formCollapsed && "md:hidden",
          formCollapsed && "md:opacity-0 md:pointer-events-none md:-translate-x-4"
        )}
      >
        <div className="bg-card md:rounded-2xl shadow-[var(--shadow-panel)] border border-border h-full overflow-y-auto p-5 md:p-6 relative">
          {/* Mobile close button */}
          <button
            type="button"
            onClick={() => setMobileFormOpen(false)}
            className="md:hidden absolute top-3 right-3 h-9 w-9 inline-flex items-center justify-center rounded-full bg-secondary text-foreground hover:bg-secondary/80 transition"
            aria-label="Chiudi"
          >
            <X className="h-4 w-4" />
          </button>
          <TripForm onPlan={handlePlan} loading={loading} language={language ?? "it"} onLanguageChange={setLanguage} />
        </div>
      </div>

      {/* Mobile: floating CTA over the map to open the search modal (only when no result) */}
      {!result && !mobileFormOpen && stationsReady && (
        <button
          type="button"
          onClick={() => setMobileFormOpen(true)}
          className="md:hidden absolute left-1/2 -translate-x-1/2 top-5 z-[1100] inline-flex items-center gap-2 px-5 h-11 rounded-full bg-card/85 text-foreground font-medium text-sm shadow-[var(--shadow-card)] border border-border/60 backdrop-blur-md active:scale-[0.96] transition-transform duration-150"
        >
          <MapPinned className="h-4 w-4 text-primary" />
          {t.planTrip}
        </button>
      )}

      {/* Compact "edit" chip when form collapsed (desktop) */}
      {result && formCollapsed && (
        <button
          onClick={handleEdit}
          className="hidden md:flex absolute top-4 left-4 z-[1000] items-center gap-2 bg-card border border-border rounded-full px-4 py-2.5 shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-panel)] transition text-sm font-medium"
        >
          <ChevronUp className="h-4 w-4 rotate-[-90deg]" />
          {t.editTrip}
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
                    {t.reduce}
                  </>
                ) : (
                  <>
                    <ChevronUp className="h-3 w-3" />
                    {result.stops.length} {result.stops.length === 1 ? t.stopSingular : t.stopPlural} · {result.route.distance_km} km
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
                mode={lastReq?.mode}
                language={language ?? "it"}
              />
            )}
          </div>
        </div>
      )}

      {/* Mobile: floating buttons when drawer collapsed — quick Naviga */}
      {result && !drawerOpen && (
        <div className="md:hidden absolute left-3 right-3 bottom-[76px] z-[1100] flex gap-2 pointer-events-none">
          {buildGoogleMapsUrl() && (
            <a
              href={buildGoogleMapsUrl()!}
              target="_blank"
              rel="noopener noreferrer"
              className="pointer-events-auto flex-1 h-12 inline-flex items-center justify-center gap-1.5 text-xs font-semibold bg-white text-foreground rounded-full shadow-[var(--shadow-panel)] active:scale-[0.98] transition border border-border"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              Google Maps
            </a>
          )}
          {buildAppleMapsUrl() && (
            <a
              href={buildAppleMapsUrl()!}
              target="_blank"
              rel="noopener noreferrer"
              className="pointer-events-auto flex-1 h-12 inline-flex items-center justify-center gap-1.5 text-xs font-semibold bg-gradient-to-r from-primary to-primary-glow text-primary-foreground rounded-full shadow-[var(--shadow-panel)] active:scale-[0.98] transition"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              Apple Maps
            </a>
          )}
        </div>
      )}

      {/* Mobile: when drawer is open, show a quick "Mostra mappa" button at the top */}
      {result && drawerOpen && (
        <button
          onClick={() => setDrawerOpen(false)}
          className="md:hidden absolute top-3 left-1/2 -translate-x-1/2 z-[1100] inline-flex items-center gap-1.5 bg-card/95 backdrop-blur border border-border rounded-full px-4 py-2 shadow-[var(--shadow-card)] text-xs font-semibold"
        >
          <ChevronDown className="h-3.5 w-3.5" />
          {t.showMap}
        </button>
      )}

      <StationSheet
        station={selectedStation}
        onClose={() => setSelectedStation(null)}
        canAdd={!!result}
        isAdded={selectedStation ? forcedStationIds.includes(selectedStation.id) : false}
        onAddStation={handleAddStation}
        onRemoveStation={handleRemoveStation}
        language={language ?? "it"}
      />
    </div>
  );
}
