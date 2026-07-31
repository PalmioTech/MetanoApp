import type { CapacitorConfig } from "@capacitor/cli";

/**
 * Capacitor config — preparazione per build mobile nativo.
 * NON viene usato dalla preview web di Lovable.
 *
 * Per fare la build nativa in locale (su tuo Mac/PC):
 *   1. git pull del progetto
 *   2. bun install
 *   3. bun run build:mobile    (NON `bun run build`: quello genera la
 *                              build SSR per Vercel in .vercel/output,
 *                              senza index.html. Vedi vite.config.mobile.ts)
 *   4. npx cap add ios         (oppure: npx cap add android)
 *   5. npx cap sync
 *   6. npx cap open ios        (apre Xcode)
 *
 * Il campo `server.url` è commentato: in produzione l'app userà i file
 * bundlati offline. Decommentalo SOLO se vuoi che l'app nativa carichi
 * dal sito pubblicato (utile per hot-reload in dev).
 */
const config: CapacitorConfig = {
  appId: "it.federicopalmieri.metano",
  appName: "MetanApp",
  webDir: "dist/client",
  // server: {
  //   url: "https://metano-route-genius.lovable.app",
  //   cleartext: false,
  // },
  android: {
    allowMixedContent: false,
  },
  ios: {
    contentInset: "always",
  },
};

export default config;
