import { Capacitor } from "@capacitor/core";
import { Geolocation } from "@capacitor/geolocation";

/**
 * Posizione corrente, con un'unica interfaccia per web e app nativa.
 *
 * - Dentro l'app iOS/Android usa il plugin @capacitor/geolocation, che parla
 *   direttamente con CoreLocation: alert di permesso di sistema, maggiore
 *   affidabilita' e nessuna dipendenza dai permessi della WebView.
 * - Nel browser il plugin delega a navigator.geolocation, quindi il sito su
 *   Vercel continua a funzionare identico, senza rami di codice separati.
 *
 * Lancia un errore se il permesso viene negato o la posizione non arriva
 * entro il timeout: chi chiama decide come mostrarlo all'utente.
 */
export async function getCurrentPosition(): Promise<{ lat: number; lng: number }> {
  // Su nativo controlliamo/chiediamo il permesso esplicitamente: cosi'
  // l'alert di iOS compare al primo uso e un successivo "negato" produce
  // un errore chiaro invece di un timeout silenzioso.
  if (Capacitor.isNativePlatform()) {
    let status = await Geolocation.checkPermissions();
    if (status.location === "prompt" || status.location === "prompt-with-rationale") {
      status = await Geolocation.requestPermissions();
    }
    if (status.location === "denied") {
      throw new Error("permission-denied");
    }
  }

  const pos = await Geolocation.getCurrentPosition({
    enableHighAccuracy: true,
    timeout: 10000,
  });

  return { lat: pos.coords.latitude, lng: pos.coords.longitude };
}
