import { cn } from "@/lib/utils";
import type { Language } from "@/lib/i18n";

/**
 * Bandiere disegnate come SVG inline al posto delle emoji: le emoji bandiera
 * sono coppie di "regional indicator" (es. 🇮+🇹) che la WebView di iOS non
 * fonde in un'unica bandiera, mostrando "??". Un SVG rende identico ovunque
 * ed e' piu' nitido a qualunque dimensione.
 */
export function FlagIcon({ lang, className }: { lang: Language; className?: string }) {
  return (
    <span
      className={cn(
        "inline-block overflow-hidden rounded-[3px] ring-1 ring-black/10 align-middle",
        className
      )}
      aria-hidden="true"
    >
      {lang === "it" ? (
        <svg viewBox="0 0 3 2" className="h-full w-full" preserveAspectRatio="none">
          <rect width="1" height="2" fill="#009246" />
          <rect x="1" width="1" height="2" fill="#ffffff" />
          <rect x="2" width="1" height="2" fill="#ce2b37" />
        </svg>
      ) : (
        <svg viewBox="0 0 60 30" className="h-full w-full" preserveAspectRatio="none">
          <rect width="60" height="30" fill="#012169" />
          <path d="M0,0 L60,30 M60,0 L0,30" stroke="#ffffff" strokeWidth="6" />
          <path d="M0,0 L60,30 M60,0 L0,30" stroke="#C8102E" strokeWidth="3" />
          <path d="M30,0 V30 M0,15 H60" stroke="#ffffff" strokeWidth="10" />
          <path d="M30,0 V30 M0,15 H60" stroke="#C8102E" strokeWidth="6" />
        </svg>
      )}
    </span>
  );
}
