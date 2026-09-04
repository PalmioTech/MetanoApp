import { Capacitor } from "@capacitor/core";
import { MapPin, Map, Car } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Pulsanti "apri in un'app di navigazione": Google Maps, Apple Maps e Waze.
 *
 * Tutti i link sono universal link https:// — sul telefono il sistema li
 * inoltra all'app installata (come già succede per Google/Apple Maps); se
 * l'app manca si apre la pagina web che rimanda allo store. Per questo non
 * servono LSApplicationQueriesSchemes (iOS) né <queries> (Android).
 */
export type NavProvider = "google" | "apple" | "waze";

export type LatLng = { lat: number; lng: number };

type NavApp = {
  id: NavProvider;
  label: string;
  icon: LucideIcon;
  /** colore del bollino-icona (solo un accento, non il logo ufficiale) */
  accent: string;
  /** l'app ha senso su questa piattaforma? */
  available: () => boolean;
  /** navigazione semplice verso un punto */
  toPoint: (p: LatLng) => string;
};

export const NAV_APPS: NavApp[] = [
  {
    id: "google",
    label: "Google Maps",
    icon: MapPin,
    accent: "#34A853",
    available: () => true,
    toPoint: ({ lat, lng }) =>
      `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=driving`,
  },
  {
    id: "apple",
    label: "Apple Maps",
    icon: Map,
    accent: "#3B82F6",
    // Su Android Apple Maps non esiste: il link aprirebbe solo la versione web.
    available: () => Capacitor.getPlatform() !== "android",
    toPoint: ({ lat, lng }) => `https://maps.apple.com/?dirflg=d&daddr=${lat},${lng}`,
  },
  {
    id: "waze",
    label: "Waze",
    icon: Car,
    accent: "#05C8F7",
    available: () => true,
    // Deep link ufficiale Waze: ll = lat,lon ; navigate=yes avvia subito la guida.
    toPoint: ({ lat, lng }) => `https://waze.com/ul?ll=${lat},${lng}&navigate=yes`,
  },
];

type Props = {
  /** URL da aprire per ciascun provider. Default: navigazione verso `point`. */
  getUrl?: (provider: NavProvider) => string;
  point?: LatLng;
  /** "full" = icona + nome app; "compact" = solo icona (per le card strette) */
  variant?: "full" | "compact";
  /** "onGradient" per i pulsanti bianchi sopra la card colorata dei risultati */
  tone?: "default" | "onGradient";
  className?: string;
  onClick?: (e: React.MouseEvent) => void;
};

export function NavAppButtons({ getUrl, point, variant = "full", tone = "default", className, onClick }: Props) {
  const apps = NAV_APPS.filter((a) => a.available());
  const urlFor = (app: NavApp) => (getUrl ? getUrl(app.id) : point ? app.toPoint(point) : "#");
  const compact = variant === "compact";

  return (
    <div className={cn("flex gap-2", className)}>
      {apps.map((app) => {
        const Icon = app.icon;
        return (
          <a
            key={app.id}
            href={urlFor(app)}
            target="_blank"
            rel="noopener noreferrer"
            onClick={onClick}
            aria-label={app.label}
            title={app.label}
            className={cn(
              "inline-flex items-center justify-center gap-2 rounded-lg font-semibold active:scale-[0.98] transition",
              compact ? "h-9 w-9 shrink-0" : "flex-1 h-11 text-sm",
              tone === "onGradient"
                ? "bg-white/95 text-foreground hover:bg-white"
                : "border border-border bg-secondary text-foreground",
            )}
          >
            <span
              className="inline-flex h-6 w-6 items-center justify-center rounded-full text-white shrink-0"
              style={{ backgroundColor: app.accent }}
            >
              <Icon className="h-3.5 w-3.5" />
            </span>
            {!compact && <span className="truncate">{app.label}</span>}
          </a>
        );
      })}
    </div>
  );
}
