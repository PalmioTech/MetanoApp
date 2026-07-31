import { defineConfig } from "@lovable.dev/vite-tanstack-config";

/**
 * Config di build DEDICATA all'app mobile (Capacitor).
 * Il web su Vercel continua a usare vite.config.ts, che NON va toccato.
 *
 * Uso:  bun run build:mobile
 *
 * Note:
 *  - `nitro: false` disattiva del tutto Nitro (opzione prevista dal wrapper
 *    Lovable: "skip nitro entirely"). Senza server non c'e' ne' bundle SSR
 *    ne' prerender, cioe' nessuna delle fasi che facevano fallire la build.
 *    NON reintrodurre nitro() a mano dentro vite.plugins: scavalca il
 *    wrapper e riporta l'errore "rollupOptions.input should not be an html".
 *  - `spa.enabled` fa generare l'index.html che monta l'app lato client,
 *    l'unica cosa che puo' funzionare dentro la WebView di iOS.
 *  - L'unica rotta (src/routes/index.tsx) ha gia' `ssr: false`, quindi non
 *    si perde niente: nessun dato arriva dal server.
 */
export default defineConfig({
  nitro: false,
  tanstackStart: {
    spa: {
      enabled: true,
      prerender: {
        // Di default il guscio SPA si chiama /_shell -> _shell.html.
        // Capacitor cerca tassativamente index.html, quindi lo rinominiamo qui.
        outputPath: "/index.html",
      },
    },
  },
});
