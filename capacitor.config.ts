import type { CapacitorConfig } from "@capacitor/cli";

/**
 * Capacitor config — preparazione per build mobile nativo.
 * NON viene usato dalla preview web di Lovable.
 *
 * Per fare la build nativa in locale (su tuo Mac/PC):
 *   1. git pull del progetto
 *   2. bun install
 *   3. bun run build           (genera .output/public)
 *   4. npx cap add android     (oppure: npx cap add ios — solo su Mac)
 *   5. npx cap sync
 *   6. npx cap open android    (apre Android Studio)
 *
 * Il campo `server.url` è commentato: in produzione l'app userà i file
 * bundlati offline. Decommentalo SOLO se vuoi che l'app nativa carichi
 * dal sito pubblicato (utile per hot-reload in dev).
 */
const config: CapacitorConfig = {
  appId: "app.lovable.metano",
  appName: "MetanApp",
  webDir: ".output/public",
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
