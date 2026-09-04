#!/usr/bin/env python3
"""Applica a public/distributori.csv gli orari di OpenStreetMap dove sono piu'
affidabili di quelli storici (metanoauto, congelati da giugno 2026).

Legge il report di scripts/confronta_orari_osm.py e, per ogni impianto:
  - salta gli abbinamenti oltre --max-distanza metri (impianto sbagliato);
  - salta i casi in cui OSM dice "24h": su una stazione multi-carburante
    opening_hours descrive le pompe self benzina, non l'erogatore metano;
  - sostituisce feriali / prefestivi / festivi con l'orario OSM dove i due
    differiscono (anche "chiuso"), lasciando il resto com'e'.
Aggiunge/aggiorna la colonna `fonte_orari`: "osm" se almeno un giorno viene da
OSM, "metanoauto" se l'impianto ha orari storici, vuota se non ne ha.
Normalizza infine i valori spazzatura ("Segue turni", "n.p.", "07:00/20:00").

Uso (dalla radice del repo, dopo confronta_orari_osm.py):
  python3 scripts/applica_orari_osm.py            # scrive public/distributori.csv
  python3 scripts/applica_orari_osm.py --dry-run  # mostra solo cosa cambierebbe
"""
from __future__ import annotations

import argparse
import csv
import re
import sys

from aggiorna_mimit import OUTPUT_HEADER, distanza_m

CAMBIA = {"diverso", "scostamento <=30 min", "app chiuso, OSM aperto", "app aperto, OSM chiuso"}
GIORNI = (("feriali", "feriali"), ("sabato", "prefestivi"), ("domenica", "festivi"))
SOLO_SLASH = re.compile(r"^(\d{1,2}[:.]\d{2})\s*/\s*(\d{1,2}[:.]\d{2})$")
HA_ORARIO = re.compile(r"\d{1,2}[:.]\d{2}\s*[-–/.]\s*\d{1,2}[:.]\d{2}")


def da_report(v: str) -> str:
    """Formato del report -> formato del CSV dell'app."""
    if v == "chiuso":
        return "Chiuso"
    if v == "24h":
        return "00:00-24:00"
    return v


def normalizza_app(v: str) -> str:
    """Ripulisce i valori storici non interpretabili dall'app."""
    t = v.strip().replace("–", "-")
    if not t:
        return ""
    if t.lower().startswith("chius"):
        return "Chiuso"
    m = SOLO_SLASH.match(t)
    if m:
        return f"{m.group(1)}-{m.group(2)}".replace(".", ":")
    if not HA_ORARIO.search(t):
        return ""  # "Segue turni", "n.p.", ...: meglio sconosciuto che finto
    return t


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--report", default="data/confronto_orari_osm.csv")
    ap.add_argument("--csv", default="public/distributori.csv")
    ap.add_argument("--max-distanza", type=float, default=100.0)
    ap.add_argument("--dry-run", action="store_true")
    args = ap.parse_args()

    with open(args.report, encoding="utf-8", newline="") as f:
        report = list(csv.DictReader(f, delimiter=";"))
    with open(args.csv, encoding="utf-8-sig", newline="") as f:
        righe = list(csv.DictReader(f, delimiter=";"))

    # indice del report per coordinate (lat, lng reali)
    patch: list[tuple[float, float, dict[str, str]]] = []
    for x in report:
        if float(x["distanza_m"]) > args.max_distanza or x["osm_feriali"] == "24h":
            continue
        mod = {}
        # La colonna "festivi" dell'app copre domeniche E festivi; se OSM ha un
        # orario per PH (festivita') non posso concludere "chiuso" solo perche'
        # la domenica non e' nominata: il confronto su quel giorno e' ambiguo.
        ph_con_orario = re.search(r"PH[^;]*\d{1,2}:\d{2}", x["osm_opening_hours"]) is not None
        for g, col in GIORNI:
            if x[f"esito_{g}"] in CAMBIA and x[f"osm_{g}"] != "?":
                if col == "festivi" and x[f"osm_{g}"] == "chiuso" and ph_con_orario:
                    continue
                # "chiuso" in settimana da OSM = impianto dismesso (opening_hours=closed):
                # finche' il MIMIT lo elenca con un prezzo non lo dichiaro chiuso.
                if col in ("feriali", "prefestivi") and x[f"osm_{g}"] == "chiuso":
                    continue
                mod[col] = da_report(x[f"osm_{g}"])
        if mod:
            patch.append((float(x["lat"]), float(x["lng"]), mod))

    header = list(OUTPUT_HEADER)
    if "fonte_orari" not in header:
        header.append("fonte_orari")
    n_osm = n_norm = 0
    for r in righe:
        lng, lat = float(r["lat"]), float(r["Long"])  # quirk storico: colonne invertite
        for col in ("feriali", "festivi", "prefestivi"):
            nuovo = normalizza_app(r.get(col, ""))
            if nuovo != (r.get(col) or ""):
                n_norm += 1
                r[col] = nuovo
        fonte = "metanoauto" if any(r.get(c) for c in ("feriali", "festivi", "prefestivi")) else ""
        for plat, plng, mod in patch:
            if distanza_m(lat, lng, plat, plng) < 5:
                if args.dry_run:
                    print(f"{r['citta']} ({r['provincia']}) {r['Via estesa']}: " +
                          ", ".join(f"{c} {r.get(c) or '-'} -> {v}" for c, v in mod.items()))
                r.update(mod)
                fonte = "osm"
                n_osm += 1
                break
        r["fonte_orari"] = fonte

    print(f"impianti aggiornati da OSM: {n_osm}; valori storici normalizzati: {n_norm}", file=sys.stderr)
    if args.dry_run:
        return 0
    with open(args.csv, "w", encoding="utf-8", newline="") as f:
        w = csv.DictWriter(f, fieldnames=header, delimiter=";", extrasaction="ignore")
        w.writeheader()
        w.writerows(righe)
    print(f"scritto {args.csv}", file=sys.stderr)
    return 0


if __name__ == "__main__":
    sys.exit(main())
