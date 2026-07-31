export type Language = "it" | "en";

export const LANGUAGE_STORAGE_KEY = "metanoapp-language";

export const languageNames: Record<Language, string> = {
  it: "Italiano",
  en: "English",
};

export const languageFlags: Record<Language, string> = {
  it: "🇮🇹",
  en: "🇬🇧",
};

export const copy = {
  it: {
    chooseTitle: "Scegli la lingua",
    chooseSubtitle: "Potrai cambiarla dopo dal pannello di ricerca.",
    continue: "Continua",
    loadingStations: "Carico distributori...",
    stationLoadError: "Impossibile caricare i distributori",
    stationLoadHint: "Verifica che il file public/distributori.csv esista.",
    stationsUpdated: "Distributori aggiornati al",
    calculating: "Calcolo percorso...",
    calculatingSub: "Cerco le migliori stazioni CNG",
    planTrip: "Pianifica viaggio",
    editTrip: "Modifica viaggio",
    reduce: "Riduci",
    stopSingular: "sosta",
    stopPlural: "soste",
    showMap: "Mostra mappa",
  },
  en: {
    chooseTitle: "Choose language",
    chooseSubtitle: "You can change it later from the search panel.",
    continue: "Continue",
    loadingStations: "Loading stations...",
    stationLoadError: "Unable to load stations",
    stationLoadHint: "Check that public/distributori.csv exists.",
    stationsUpdated: "Stations updated",
    calculating: "Calculating route...",
    calculatingSub: "Finding best CNG stations",
    planTrip: "Plan trip",
    editTrip: "Edit trip",
    reduce: "Collapse",
    stopSingular: "stop",
    stopPlural: "stops",
    showMap: "Show map",
  },
} as const;
