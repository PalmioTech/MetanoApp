import { useEffect, useState } from "react";
import { ensureStationsLoaded, isStationsReady, applyRefreshedStations } from "@/lib/metan-mock";
import { getStationsUpdatedAt } from "@/lib/stations-loader";
import type { Station } from "@/lib/metan-types";

/**
 * Loads /distributori.csv on first mount and caches it in memory.
 * Returns { ready, error, updatedAt } so callers can render a loading state,
 * a fallback, or the freshness of the data.
 *
 * Ascolta anche "metanapp:stations-refreshed": quando il refresh in
 * sottofondo porta il CSV del giorno, i dati vengono scambiati a caldo e il
 * contatore interno forza un re-render (aggiornando anche la data mostrata).
 */
export function useStations(): { ready: boolean; error: string | null; updatedAt: string | null } {
  const [ready, setReady] = useState<boolean>(isStationsReady());
  const [error, setError] = useState<string | null>(null);
  const [, setRefreshTick] = useState(0);

  useEffect(() => {
    if (ready) return;
    let cancelled = false;
    ensureStationsLoaded()
      .then(() => {
        if (!cancelled) setReady(true);
      })
      .catch((e) => {
        if (!cancelled) {
          setError(e?.message ?? "Errore caricamento distributori");
        }
      });
    return () => {
      cancelled = true;
    };
  }, [ready]);

  useEffect(() => {
    const onRefreshed = (e: Event) => {
      const stations = (e as CustomEvent).detail as Station[];
      applyRefreshedStations(stations);
      setRefreshTick((t) => t + 1);
    };
    window.addEventListener("metanapp:stations-refreshed", onRefreshed);
    return () => window.removeEventListener("metanapp:stations-refreshed", onRefreshed);
  }, []);

  return { ready, error, updatedAt: ready ? getStationsUpdatedAt() : null };
}
