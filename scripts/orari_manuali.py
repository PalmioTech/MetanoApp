#!/usr/bin/env python3
"""Correzioni manuali agli impianti (segnalazioni degli utenti).

Il file data/orari_manuali.csv ha una riga per impianto, abbinato per
provincia + citta' + frammento del nome (case-insensitive). I campi vuoti non
toccano nulla; quelli compilati sovrascrivono la riga di distributori.csv:
  feriali / festivi / prefestivi  -> orari (formato dell'app, es. 07:00-20:00, Chiuso)
  self                            -> "1" forza il badge self service
  self_h24                        -> "1" = erogazione self attiva anche fuori orario
  nota, data                      -> solo per noi
Viene applicato da aggiorna_mimit.py a ogni giro, dopo il recupero degli orari,
cosi' le correzioni sopravvivono alla rigenerazione giornaliera.

Uso a mano su un CSV gia' generato:
  python3 scripts/orari_manuali.py public/distributori.csv
"""
from __future__ import annotations

import csv
import sys
from pathlib import Path

MANUALI = Path(__file__).resolve().parent.parent / "data" / "orari_manuali.csv"


def carica() -> list[dict]:
    if not MANUALI.exists():
        return []
    with open(MANUALI, encoding="utf-8-sig", newline="") as f:
        return [r for r in csv.DictReader(f, delimiter=";") if (r.get("citta") or "").strip()]


def applica(righe: list[dict]) -> int:
    """Applica le correzioni a righe (dict con le colonne del CSV). Ritorna quante righe toccate."""
    regole = carica()
    toccate = 0
    for reg in regole:
        prov = (reg.get("provincia") or "").strip().upper()
        citta = (reg.get("citta") or "").strip().upper()
        frag = (reg.get("nome_contiene") or "").strip().upper()
        for r in righe:
            if (r.get("provincia") or "").strip().upper() != prov:
                continue
            if (r.get("citta") or "").strip().upper() != citta:
                continue
            if frag and frag not in (r.get("Via estesa") or "").upper():
                continue
            cambiati_orari = False
            for col in ("feriali", "festivi", "prefestivi"):
                v = (reg.get(col) or "").strip()
                if v:
                    r[col] = v
                    cambiati_orari = True
            if (reg.get("self") or "").strip() == "1":
                r["self"] = "1"
            if (reg.get("self_h24") or "").strip() == "1":
                r["self_h24"] = "1"
            if cambiati_orari:
                r["fonte_orari"] = "segnalazione"
            toccate += 1
    return toccate


def main() -> int:
    path = sys.argv[1] if len(sys.argv) > 1 else "public/distributori.csv"
    with open(path, encoding="utf-8-sig", newline="") as f:
        rd = csv.DictReader(f, delimiter=";")
        header = list(rd.fieldnames or [])
        righe = list(rd)
    if "self_h24" not in header:
        header.append("self_h24")
    for r in righe:
        r.setdefault("self_h24", "")
    n = applica(righe)
    with open(path, "w", encoding="utf-8", newline="") as f:
        w = csv.DictWriter(f, fieldnames=header, delimiter=";", extrasaction="ignore")
        w.writeheader()
        w.writerows(righe)
    print(f"correzioni manuali applicate a {n} impianti -> {path}", file=sys.stderr)
    return 0


if __name__ == "__main__":
    sys.exit(main())
