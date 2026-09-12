#!/usr/bin/env python3
"""Impianti aggiunti a mano (segnalazioni) che il MIMIT non elenca ancora.

data/impianti_manuali.csv: una riga per impianto con coordinate REALI
(latitudine;longitudine, non invertite), nome, indirizzo, prezzo, orari ecc.
A ogni giro aggiorna_mimit.py li accoda al CSV dell'app, salvo che il MIMIT
abbia nel frattempo un impianto entro RAGGIO_DUPLICATO_M: in quel caso la riga
manuale viene ignorata (e conviene toglierla dal file).

Uso a mano su un CSV gia' generato:
  python3 scripts/impianti_manuali.py public/distributori.csv
"""
from __future__ import annotations

import csv
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from aggiorna_mimit import OUTPUT_HEADER, distanza_m  # noqa: E402

MANUALI = Path(__file__).resolve().parent.parent / "data" / "impianti_manuali.csv"
RAGGIO_DUPLICATO_M = 150.0


def carica() -> list[dict]:
    if not MANUALI.exists():
        return []
    with open(MANUALI, encoding="utf-8-sig", newline="") as f:
        return [r for r in csv.DictReader(f, delimiter=";") if (r.get("latitudine") or "").strip()]


def in_riga_app(m: dict) -> dict:
    """Riga manuale -> riga nel formato del CSV dell'app (quirk lat/Long invertite)."""
    lat, lng = float(m["latitudine"]), float(m["longitudine"])
    ha_orari = any((m.get(c) or "").strip() for c in ("feriali", "festivi", "prefestivi"))
    return {
        "lat": f"{lng:.6f}", "Long": f"{lat:.6f}",
        "Via estesa": (m.get("nome") or "").strip(),
        "provincia": (m.get("provincia") or "").strip().upper(),
        "citta": (m.get("citta") or "").strip().upper(),
        "via": (m.get("via") or "").strip(),
        "prezzo": (m.get("prezzo") or "").strip(),
        "feriali": (m.get("feriali") or "").strip(),
        "festivi": (m.get("festivi") or "").strip(),
        "prefestivi": (m.get("prefestivi") or "").strip(),
        "self": "1" if (m.get("self") or "").strip() == "1" else "",
        "telefono": (m.get("telefono") or "").strip(),
        "fonte_orari": "segnalazione" if ha_orari else "",
        "self_h24": "1" if (m.get("self_h24") or "").strip() == "1" else "",
    }


def applica(righe: list[dict]) -> int:
    """Accoda gli impianti manuali non gia' presenti. Ritorna quanti aggiunti."""
    aggiunti = 0
    for m in carica():
        lat, lng = float(m["latitudine"]), float(m["longitudine"])
        doppione = False
        for r in righe:
            try:
                rlng, rlat = float(r["lat"]), float(r["Long"])
            except (KeyError, ValueError):
                continue
            if distanza_m(lat, lng, rlat, rlng) <= RAGGIO_DUPLICATO_M:
                doppione = True
                break
        if doppione:
            print(f"[manuali] {m.get('nome')}: gia' presente (MIMIT), riga ignorata", file=sys.stderr)
            continue
        righe.append(in_riga_app(m))
        aggiunti += 1
    return aggiunti


def main() -> int:
    path = sys.argv[1] if len(sys.argv) > 1 else "public/distributori.csv"
    with open(path, encoding="utf-8-sig", newline="") as f:
        rd = csv.DictReader(f, delimiter=";")
        header = list(rd.fieldnames or [])
        righe = list(rd)
    for c in OUTPUT_HEADER:
        if c not in header:
            header.append(c)
    n = applica(righe)
    righe.sort(key=lambda r: (r.get("provincia", ""), r.get("citta", ""), r.get("Via estesa", "")))
    with open(path, "w", encoding="utf-8", newline="") as f:
        w = csv.DictWriter(f, fieldnames=header, delimiter=";", extrasaction="ignore")
        w.writeheader()
        w.writerows(righe)
    print(f"impianti manuali aggiunti: {n} -> {path}", file=sys.stderr)
    return 0


if __name__ == "__main__":
    sys.exit(main())
