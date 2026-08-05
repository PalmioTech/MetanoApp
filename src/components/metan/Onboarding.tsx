import { useEffect, useMemo, useState } from "react";
import type { Language } from "@/lib/i18n";
import { copy } from "@/lib/i18n";

const TUTORIAL_STORAGE_KEY = "metanapp:tutorial-done";

export function isTutorialDone(): boolean {
  try {
    return window.localStorage.getItem(TUTORIAL_STORAGE_KEY) === "1";
  } catch {
    return true; // storage inaccessibile: meglio non insistere col tutorial
  }
}

function markTutorialDone() {
  try {
    window.localStorage.setItem(TUTORIAL_STORAGE_KEY, "1");
  } catch {
    /* pazienza */
  }
}

type Rect = { top: number; left: number; width: number; height: number };

type TextKeys =
  | "tutorialWelcome"
  | "tutorialPlan"
  | "tutorialNaviga"
  | "tutorialOrganizza"
  | "tutorialUpdated"
  | "tutorialEnd";

type Step = {
  /** selettore dell'elemento da illuminare; null = riflettore centrale o nessuno */
  target: string | null;
  key: TextKeys;
  /** riflettore circolare centrato sulla mappa */
  centerSpot?: boolean;
  /** questa tappa richiede il form di ricerca aperto */
  form?: boolean;
};

const STEPS: Step[] = [
  { target: null, key: "tutorialWelcome", centerSpot: true },
  { target: "[data-tutorial='plan']", key: "tutorialPlan" },
  { target: "[role='tablist'] [role='tab']:first-child", key: "tutorialNaviga", form: true },
  { target: "[role='tablist'] [role='tab']:last-child", key: "tutorialOrganizza", form: true },
  { target: "[data-tutorial='updated']", key: "tutorialUpdated" },
  { target: null, key: "tutorialEnd" },
];

const SPOT_PADDING = 8;
const MEASURE_RETRIES = 12;
const MEASURE_INTERVAL_MS = 120;

export function Onboarding({
  language,
  onClose,
  onRequireForm,
}: {
  language: Language;
  onClose: () => void;
  /** apre/chiude il modulo di ricerca quando una tappa lo richiede */
  onRequireForm: (open: boolean) => void;
}) {
  const t = copy[language];
  const [stepIndex, setStepIndex] = useState(0);
  const [rect, setRect] = useState<Rect | null>(null);

  const steps = useMemo(() => STEPS, []);
  const step = steps[Math.min(stepIndex, steps.length - 1)];
  const isLast = stepIndex >= steps.length - 1;

  // Apri/chiudi il form come richiesto dalla tappa corrente
  useEffect(() => {
    onRequireForm(!!step.form);
  }, [step, onRequireForm]);

  // Misura l'elemento bersaglio, con tentativi ripetuti: dopo l'apertura del
  // form gli elementi impiegano qualche frame a comparire. Se il bersaglio
  // non esiste proprio (es. pillola data assente offline), la tappa si salta.
  useEffect(() => {
    let cancelled = false;
    let attempts = 0;

    const measure = () => {
      if (cancelled) return;
      if (step.centerSpot) {
        const size = Math.min(window.innerWidth, window.innerHeight) * 0.5;
        setRect({
          top: window.innerHeight * 0.42 - size / 2,
          left: window.innerWidth / 2 - size / 2,
          width: size,
          height: size,
        });
        return;
      }
      if (!step.target) {
        setRect(null);
        return;
      }
      const el = document.querySelector(step.target);
      if (!el) {
        attempts += 1;
        if (attempts < MEASURE_RETRIES) {
          setTimeout(measure, MEASURE_INTERVAL_MS);
        } else {
          // bersaglio inesistente: avanti senza fermarsi
          setStepIndex((i) => Math.min(i + 1, steps.length - 1));
        }
        return;
      }
      const r = el.getBoundingClientRect();
      setRect({
        top: r.top - SPOT_PADDING,
        left: r.left - SPOT_PADDING,
        width: r.width + SPOT_PADDING * 2,
        height: r.height + SPOT_PADDING * 2,
      });
    };

    measure();
    window.addEventListener("resize", measure);
    return () => {
      cancelled = true;
      window.removeEventListener("resize", measure);
    };
  }, [step, steps.length]);

  const finish = () => {
    markTutorialDone();
    onRequireForm(false);
    onClose();
  };

  const next = () => {
    if (isLast) finish();
    else setStepIndex((i) => i + 1);
  };

  // La scheda di testo va sopra o sotto il riflettore, dove c'e' piu' spazio
  const cardBelow = rect ? rect.top + rect.height / 2 < window.innerHeight / 2 : false;

  return (
    <div className="fixed inset-0 z-[3000]" role="dialog" aria-label={t.tutorialWelcomeTitle}>
      {/* Riflettore: il "buco" luminoso e' questo div; l'ombra gigante scurisce tutto il resto */}
      {rect ? (
        <div
          className="absolute transition-all duration-300 ease-out pointer-events-none"
          style={{
            top: rect.top,
            left: rect.left,
            width: rect.width,
            height: rect.height,
            borderRadius: step.centerSpot ? "9999px" : "1.25rem",
            boxShadow: "0 0 0 9999px rgba(10, 15, 12, 0.82)",
            outline: "2px solid rgba(255,255,255,0.55)",
            outlineOffset: "2px",
          }}
        />
      ) : (
        <div className="absolute inset-0 bg-[rgba(10,15,12,0.82)]" />
      )}

      {/* Salta: sempre visibile, sotto la Dynamic Island */}
      <button
        type="button"
        onClick={finish}
        className="absolute right-4 top-[calc(0.75rem+env(safe-area-inset-top,0px))] px-4 h-9 rounded-full bg-white/15 text-white text-sm font-medium backdrop-blur border border-white/25 active:scale-95 transition"
      >
        {t.tutorialSkip}
      </button>

      {/* Scheda con titolo, testo e Avanti */}
      <div
        className="absolute left-1/2 -translate-x-1/2 w-[88vw] max-w-sm"
        style={
          cardBelow
            ? { top: (rect ? rect.top + rect.height : window.innerHeight * 0.55) + 16 }
            : { bottom: window.innerHeight - (rect ? rect.top : window.innerHeight * 0.45) + 16 }
        }
      >
        <div className="rounded-2xl bg-card text-foreground shadow-2xl border border-border p-5">
          <p className="font-semibold text-base mb-1">{t[`${step.key}Title`]}</p>
          <p className="text-sm text-muted-foreground leading-relaxed">{t[`${step.key}Text`]}</p>
          <div className="mt-4 flex items-center justify-between">
            <div className="flex gap-1.5">
              {steps.map((_, i) => (
                <span
                  key={i}
                  className={
                    "h-1.5 rounded-full transition-all " +
                    (i === stepIndex ? "w-5 bg-primary" : "w-1.5 bg-border")
                  }
                />
              ))}
            </div>
            <button
              type="button"
              onClick={next}
              className="px-5 h-10 rounded-full bg-primary text-primary-foreground text-sm font-semibold active:scale-95 transition"
            >
              {isLast ? t.tutorialDone : t.tutorialNext}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
