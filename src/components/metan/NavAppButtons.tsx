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
  /** se true, quando ci sono 3+ app il pulsante mostra solo l'icona */
  iconOnlyWhenCrowded?: boolean;
  /** navigazione semplice verso un punto */
  toPoint: (p: LatLng) => string;
};

function isAndroid(): boolean {
  if (Capacitor.getPlatform() === "android") return true;
  return typeof navigator !== "undefined" && /android/i.test(navigator.userAgent);
}

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
    // Vale anche per il sito aperto dal browser di un telefono Android.
    available: () => !isAndroid(),
    toPoint: ({ lat, lng }) => `https://maps.apple.com/?dirflg=d&daddr=${lat},${lng}`,
  },
  {
    id: "waze",
    label: "Waze",
    icon: Car,
    accent: "#05C8F7",
    available: () => true,
    iconOnlyWhenCrowded: true, // su iOS, accanto a Google e Apple, resta solo l'icona
    // Deep link ufficiale Waze: ll = lat,lon ; navigate=yes avvia subito la guida.
    toPoint: ({ lat, lng }) => `https://waze.com/ul?ll=${lat},${lng}&navigate=yes&utm_source=metanapp`,
  },
];

export type RouteParams = {
  /** citta' o "lat,lng" */
  origin: string;
  destination: string;
  /** soste intermedie come "lat,lng" */
  stops: string[];
};

/**
 * URL per l'intero itinerario (partenza, soste, destinazione) nell'app scelta.
 * Waze non accetta tappe intermedie: punta alla prima sosta, o alla
 * destinazione se il viaggio non ne ha.
 */
export function buildRouteUrl(provider: NavProvider, r: RouteParams): string {
  const enc = encodeURIComponent;
  if (provider === "google") {
    const waypoints = r.stops.length ? `&waypoints=${r.stops.join("|")}` : "";
    return `https://www.google.com/maps/dir/?api=1&origin=${enc(r.origin)}&destination=${enc(r.destination)}${waypoints}&travelmode=driving`;
  }
  if (provider === "apple") {
    const daddr = r.stops.length
      ? `${r.stops.map(enc).join("+to:")}+to:${enc(r.destination)}`
      : enc(r.destination);
    return `https://maps.apple.com/?dirflg=d&saddr=${enc(r.origin)}&daddr=${daddr}`;
  }
  const target = r.stops[0] ?? r.destination;
  const ll = /^-?[\d.]+,-?[\d.]+$/.test(target) ? `ll=${target}` : `q=${enc(target)}`;
  return `https://waze.com/ul?${ll}&navigate=yes&utm_source=metanapp`;
}

type Props = {
  /** URL da aprire per ciascun provider. Default: navigazione verso `point`. */
  getUrl?: (provider: NavProvider) => string;
  point?: LatLng;
  /** "full" = icona + nome app; "compact" = solo icona (per le card strette) */
  variant?: "full" | "compact";
  /** "onGradient" per i pulsanti bianchi sopra la card colorata dei risultati */
  tone?: "default" | "onGradient";
  /** "full" = pillole arrotondate (barra flottante sulla mappa) */
  rounded?: "lg" | "full";
  className?: string;
  linkClassName?: string;
  onClick?: (e: React.MouseEvent) => void;
};

export function NavAppButtons({ getUrl, point, variant = "full", tone = "default", rounded = "lg", className, linkClassName, onClick }: Props) {
  const apps = NAV_APPS.filter((a) => a.available());
  const urlFor = (app: NavApp) => (getUrl ? getUrl(app.id) : point ? app.toPoint(point) : "#");
  const crowded = apps.length >= 3;

  return (
    <div className={cn("flex gap-2", className)}>
      {apps.map((app) => {
        const Icon = app.icon;
        // Solo icona: variante compatta, oppure app marcata iconOnlyWhenCrowded con 3+ pulsanti
        const compact = variant === "compact" || (crowded && !!app.iconOnlyWhenCrowded);
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
              "inline-flex items-center justify-center gap-2 font-semibold active:scale-[0.98] transition",
              rounded === "full" ? "rounded-full" : "rounded-lg",
              linkClassName,
              compact
                ? variant === "compact" ? "h-9 w-9 shrink-0" : "h-11 w-11 shrink-0"
                : "flex-1 h-11 text-sm",
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
