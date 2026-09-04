#!/usr/bin/env python3
"""
Aggiorna public/distributori.csv dai dati aperti MIMIT (licenza IODL 2.0).

Fonte: https://www.mimit.gov.it/it/open-data/elenco-dataset/carburanti-prezzi-praticati-e-anagrafica-degli-impianti
  - prezzo_alle_8.csv            -> prezzi del metano per idImpianto
  - anagrafica_impianti_attivi.csv -> coordinate e indirizzi degli impianti

Particolarita' dei file MIMIT (verificate sui file reali, luglio 2026):
  - separatore "|" (pipe) dal 10/02/2026
  - la PRIMA riga e' "Estrazione del AAAA-MM-GG" e va saltata
  - alcuni campi contengono virgolette spaiate: il parsing deve usare
    QUOTE_NONE, altrimenti il csv reader ingoia righe intere
  - prezzo del metano espresso in EUR/kg, punto decimale

Output: stesso identico formato del vecchio distributori.csv, cosi' l'app
non richiede alcuna modifica. ATTENZIONE alla stranezza storica del file,
che va preservata perche' l'app la compensa gia' (vedi stations-loader.ts):
la colonna "lat" contiene la LONGITUDINE e la colonna "Long" la LATITUDINE.

Gli orari (feriali/festivi/prefestivi) NON esistono nei dati MIMIT: vengono
recuperati dal distributori.csv precedente abbinando gli impianti per
vicinanza (<250 m). Gli impianti nuovi restano senza orari.

Uso (identico al vecchio script, cosi' il workflow cambia solo il nome):
  python scripts/aggiorna_mimit.py public/distributori.csv -o public/distributori.csv
"""

from __future__ import annotations

import argparse
import csv
import io
import json
import math
import ssl
import sys
import time
import urllib.request

PREZZI_URL = "https://www.mimit.gov.it/images/exportCSV/prezzo_alle_8.csv"
ANAGRAFICA_URL = "https://www.mimit.gov.it/images/exportCSV/anagrafica_impianti_attivi.csv"

# Sotto questa soglia il risultato e' considerato rotto e lo script fallisce
# senza scrivere: meglio nessun aggiornamento che un CSV mutilato online.
MIN_STAZIONI_ATTESE = 300

# Distanza massima per considerare "lo stesso impianto" nel recupero orari.
RAGGIO_ABBINAMENTO_METRI = 250.0

OUTPUT_HEADER = [
    "lat", "Long", "Via estesa", "provincia", "citta", "via",
    "prezzo", "feriali", "festivi", "prefestivi", "self", "telefono",
    "fonte_orari",  # "osm" | "metanoauto" | "" (vedi applica_orari_osm.py)
]


def scarica(url: str, tentativi: int = 3, attesa: float = 10.0,
            insecure: bool = False) -> str:
    """Scarica un URL come testo, con tentativi ripetuti e backoff."""
    contesto = ssl._create_unverified_context() if insecure else None
    ultimo_errore: Exception | None = None
    for i in range(1, tentativi + 1):
        try:
            req = urllib.request.Request(url, headers={"User-Agent": "MetanApp-updater/1.0"})
            with urllib.request.urlopen(req, timeout=120, context=contesto) as r:
                dati = r.read()
            testo = dati.decode("utf-8-sig", errors="replace")
            if len(testo) < 1000:
                raise RuntimeError(f"risposta sospettosamente corta ({len(testo)} byte)")
            return testo
        except Exception as e:  # noqa: BLE001 - vogliamo ritentare su tutto
            ultimo_errore = e
            print(f"[tentativo {i}/{tentativi}] {url}: {e}", file=sys.stderr)
            if i < tentativi:
                time.sleep(attesa * i)  # 10s, 20s, ...
    raise RuntimeError(f"download fallito dopo {tentativi} tentativi: {url}") from ultimo_errore


def righe_mimit(testo: str) -> tuple[list[str], "csv.reader"]:
    """Salta la riga 'Estrazione del ...', restituisce (header, reader)."""
    buf = io.StringIO(testo)
    prima = buf.readline()
    if "estrazione" not in prima.lower():
        # formato cambiato di nuovo? proviamo a trattarla come header
        buf.seek(0)
    reader = csv.reader(buf, delimiter="|", quoting=csv.QUOTE_NONE)
    header = [c.strip() for c in next(reader)]
    return header, reader


def indice(header: list[str], nome: str) -> int:
    """Trova una colonna per nome (case-insensitive). Errore chiaro se manca."""
    nomi = [c.lower() for c in header]
    if nome.lower() not in nomi:
        raise RuntimeError(f"colonna '{nome}' non trovata nell'header: {header}")
    return nomi.index(nome.lower())


def prezzi_metano(testo: str) -> tuple[dict[str, float], set[str]]:
    """(idImpianto -> prezzo metano minimo, insieme degli id con prezzo self)."""
    header, reader = righe_mimit(testo)
    i_id = indice(header, "idImpianto")
    i_desc = indice(header, "descCarburante")
    i_prezzo = indice(header, "prezzo")
    i_self = indice(header, "isSelf")
    prezzi: dict[str, float] = {}
    self_ids: set[str] = set()
    for riga in reader:
        if len(riga) <= max(i_id, i_desc, i_prezzo, i_self):
            continue
        if riga[i_desc].strip().lower() != "metano":
            continue
        try:
            p = float(riga[i_prezzo].strip().replace(",", "."))
        except ValueError:
            continue
        if not (0.1 < p < 10):  # scarto refusi tipo 0 o 999
            continue
        chiave = riga[i_id].strip()
        if riga[i_self].strip() == "1":
            self_ids.add(chiave)
        if chiave not in prezzi or p < prezzi[chiave]:
            prezzi[chiave] = p
    return prezzi, self_ids


def anagrafica(testo: str) -> dict[str, dict]:
    """idImpianto -> dati impianto (nome, indirizzo, comune, provincia, lat, lng)."""
    header, reader = righe_mimit(testo)
    i_id = indice(header, "idImpianto")
    i_nome = indice(header, "Nome Impianto")
    i_bandiera = indice(header, "Bandiera")
    i_ind = indice(header, "Indirizzo")
    i_com = indice(header, "Comune")
    i_prov = indice(header, "Provincia")
    i_lat = indice(header, "Latitudine")
    i_lng = indice(header, "Longitudine")
    impianti: dict[str, dict] = {}
    for riga in reader:
        if len(riga) <= i_lng:
            continue
        try:
            lat = float(riga[i_lat].strip().replace(",", "."))
            lng = float(riga[i_lng].strip().replace(",", "."))
        except ValueError:
            continue
        # bounding box Italia: coordinate fuori = dato inserito male, si scarta
        if not (35.0 <= lat <= 48.0 and 6.0 <= lng <= 19.0):
            continue
        nome = riga[i_nome].strip().strip('"') or riga[i_bandiera].strip()
        impianti[riga[i_id].strip()] = {
            "nome": nome,
            "indirizzo": riga[i_ind].strip(),
            "comune": riga[i_com].strip(),
            "provincia": riga[i_prov].strip(),
            "lat": lat,
            "lng": lng,
        }
    return impianti


def distanza_m(lat1: float, lng1: float, lat2: float, lng2: float) -> float:
    """Haversine, in metri."""
    r = 6371000.0
    p1, p2 = math.radians(lat1), math.radians(lat2)
    dp = math.radians(lat2 - lat1)
    dl = math.radians(lng2 - lng1)
    a = math.sin(dp / 2) ** 2 + math.cos(p1) * math.cos(p2) * math.sin(dl / 2) ** 2
    return 2 * r * math.asin(math.sqrt(a))


def carica_orari_precedenti(percorso: str) -> list[dict]:
    """Legge il distributori.csv precedente per recuperare gli orari.

    Ricorda: nel file storico la colonna 'lat' contiene la LONGITUDINE
    e 'Long' la LATITUDINE.
    """
    voci: list[dict] = []
    try:
        with open(percorso, newline="", encoding="utf-8-sig") as f:
            for r in csv.DictReader(f, delimiter=";"):
                try:
                    lng = float((r.get("lat") or "").replace(",", "."))
                    lat = float((r.get("Long") or "").replace(",", "."))
                except ValueError:
                    continue
                voci.append({
                    "lat": lat, "lng": lng,
                    "feriali": (r.get("feriali") or "").strip(),
                    "festivi": (r.get("festivi") or "").strip(),
                    "prefestivi": (r.get("prefestivi") or "").strip(),
                    "fonte": (r.get("fonte_orari") or "").strip(),
                })
    except FileNotFoundError:
        print("[info] nessun CSV precedente: gli orari partiranno vuoti", file=sys.stderr)
    return voci


def orari_per(lat: float, lng: float, precedenti: list[dict],
              griglia: dict[tuple[int, int], list[dict]]) -> tuple[str, str, str, str]:
    """Orari (e loro fonte) della voce precedente piu' vicina entro il raggio, o vuoti."""
    # griglia ~0.01 grado (~1 km) per non fare N*M confronti su tutta Italia
    cx, cy = int(lat * 100), int(lng * 100)
    migliore, dist_migliore = None, RAGGIO_ABBINAMENTO_METRI + 1
    for dx in (-1, 0, 1):
        for dy in (-1, 0, 1):
            for voce in griglia.get((cx + dx, cy + dy), ()):
                d = distanza_m(lat, lng, voce["lat"], voce["lng"])
                if d < dist_migliore:
                    migliore, dist_migliore = voce, d
    if migliore and dist_migliore <= RAGGIO_ABBINAMENTO_METRI:
        ha_orari = migliore["feriali"] or migliore["festivi"] or migliore["prefestivi"]
        fonte = migliore["fonte"] or ("metanoauto" if ha_orari else "")
        return migliore["feriali"], migliore["festivi"], migliore["prefestivi"], fonte
    return "", "", "", ""


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("precedente", nargs="?", default="public/distributori.csv",
                    help="CSV precedente da cui recuperare gli orari")
    ap.add_argument("-o", "--output", default="public/distributori.csv")
    ap.add_argument("--insecure", action="store_true",
                    help="disabilita la verifica SSL (solo se il download fallisce)")
    args = ap.parse_args()

    print("[1/4] scarico prezzi...", file=sys.stderr)
    prezzi, self_ids = prezzi_metano(scarica(PREZZI_URL, insecure=args.insecure))
    print(f"      impianti con prezzo metano: {len(prezzi)} (self: {len(self_ids)})", file=sys.stderr)

    print("[2/4] scarico anagrafica...", file=sys.stderr)
    impianti = anagrafica(scarica(ANAGRAFICA_URL, insecure=args.insecure))
    print(f"      impianti in anagrafica: {len(impianti)}", file=sys.stderr)

    print("[3/4] incrocio e recupero orari dal CSV precedente...", file=sys.stderr)
    precedenti = carica_orari_precedenti(args.precedente)
    griglia: dict[tuple[int, int], list[dict]] = {}
    for v in precedenti:
        griglia.setdefault((int(v["lat"] * 100), int(v["lng"] * 100)), []).append(v)

    # telefoni da data/telefoni.json (generato da arricchisci_telefoni.py);
    # se il file manca la colonna esce vuota e nulla si rompe
    try:
        with open("data/telefoni.json", encoding="utf-8") as f:
            telefoni = json.load(f)
    except FileNotFoundError:
        telefoni = {}
    print(f"      telefoni disponibili: {len(telefoni)}", file=sys.stderr)

    righe, con_orari = [], 0
    for id_imp, prezzo in prezzi.items():
        imp = impianti.get(id_imp)
        if imp is None:
            continue  # prezzo senza anagrafica: non georeferenziabile
        feriali, festivi, prefestivi, fonte = orari_per(imp["lat"], imp["lng"], precedenti, griglia)
        if feriali or festivi or prefestivi:
            con_orari += 1
        righe.append([
            f"{imp['lng']:.6f}",          # colonna 'lat' = LONGITUDINE (quirk storico)
            f"{imp['lat']:.6f}",          # colonna 'Long' = LATITUDINE
            imp["nome"],
            imp["provincia"],
            imp["comune"],
            imp["indirizzo"],
            f"{prezzo:.3f}",
            feriali, festivi, prefestivi,
            "1" if id_imp in self_ids else "",
            telefoni.get(id_imp, ""),
            fonte,
        ])

    print(f"      stazioni metano georeferenziate: {len(righe)} "
          f"(con orari recuperati: {con_orari})", file=sys.stderr)

    if len(righe) < MIN_STAZIONI_ATTESE:
        print(f"ERRORE: solo {len(righe)} stazioni (< {MIN_STAZIONI_ATTESE}). "
              "Non scrivo il file per non pubblicare dati mutilati.", file=sys.stderr)
        return 1

    righe.sort(key=lambda r: (r[3], r[4], r[2]))  # provincia, citta, nome

    print(f"[4/4] scrivo {args.output}", file=sys.stderr)
    with open(args.output, "w", newline="", encoding="utf-8") as f:
        w = csv.writer(f, delimiter=";")
        w.writerow(OUTPUT_HEADER)
        w.writerows(righe)
    return 0


if __name__ == "__main__":
    sys.exit(main())
