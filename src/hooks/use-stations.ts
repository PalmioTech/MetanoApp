import { useEffect, useState } from "react";
import { ensureStationsLoaded, isStationsReady } from "@/lib/metan-mock";
import { getStationsUpdatedAt } from "@/lib/stations-loader";

/**
 * Loads /distributori.csv on first mount and caches it in memory.
 * Returns { ready, error, updatedAt } so callers can render a loading state,
 * a fallback, or the freshness of the data.
 */
export function useStations(): { ready: boolean; error: string | null; updatedAt: string | null } {
  const [ready, setReady] = useState<boolean>(isStationsReady());
  const [error, setError] = useState<string | null>(null);

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

  return { ready, error, updatedAt: ready ? getStationsUpdatedAt() : null };
}
