#!/usr/bin/env python3
"""One-shot: integra data/telefoni.json con i telefoni di Overture Maps Places.

Overture Places (overturemaps.org) e' il dataset aperto di POI derivato dai
dati Meta/Microsoft, licenza CDLA Permissive 2.0: contiene i telefoni delle
pagine business (es. Facebook) delle stazioni di servizio. Questo script
interroga il Parquet remoto via DuckDB scaricando SOLO le stazioni italiane
con telefono, poi riempie i buchi lasciati da OSM senza toccare i numeri
gia' presenti.

Prerequisiti:
  pip3 install duckdb

Uso (dalla radice del repo). Il numero di release va letto una volta su
https://docs.overturemaps.org (sezione Releases, formato tipo 2026-08-20.0):
  python3 scripts/telefoni_overture.py --release 2026-08-20.0
"""
from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

from aggiorna_mimit import (ANAGRAFICA_URL, PREZZI_URL, anagrafica,
                            distanza_m, prezzi_metano, scarica)

try:
    import duckdb
except ImportError:
    print("Manca duckdb: esegui `pip3 install duckdb` e rilancia.", file=sys.stderr)
    sys.exit(1)


def stazioni_overture(release: str) -> list[dict]:
    """Stazioni di servizio italiane con telefono dal Parquet Overture."""
    con = duckdb.connect()
    con.execute("INSTALL httpfs; LOAD httpfs;")
    con.execute("SET s3_region='us-west-2';")
    url = (f"s3://overturemaps-us-west-2/release/{release}"
           "/theme=places/type=place/*")
    q = f"""
        SELECT names.primary            AS nome,
               phones[1]                AS tel,
               bbox.xmin                AS lng,
               bbox.ymin                AS lat
        FROM read_parquet('{url}', hive_partitioning=1)
        WHERE bbox.xmin BETWEEN 6 AND 19
          AND bbox.ymin BETWEEN 35 AND 48
          AND (categories.primary ILIKE '%gas_station%'
               OR categories.primary ILIKE '%fuel%'
               OR categories.primary ILIKE '%petrol%')
          AND phones IS NOT NULL AND len(phones) > 0
    """
    righe = con.execute(q).fetchall()
    return [{"nome": r[0], "tel": (r[1] or "").strip(), "lng": r[2], "lat": r[3]}
            for r in righe if r[1]]


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("--release", required=True,
                    help="release Overture, es. 2026-08-20.0 (vedi docs.overturemaps.org)")
    ap.add_argument("--raggio", type=float, default=200.0,
                    help="distanza max in metri per l'abbinamento (default 200)")
    ap.add_argument("-o", "--output", default="data/telefoni.json")
    args = ap.parse_args()

    out = Path(args.output)
    telefoni: dict[str, str] = {}
    if out.exists():
        telefoni = json.loads(out.read_text(encoding="utf-8"))
    gia = len(telefoni)
    print(f"[1/3] telefoni gia' presenti (OSM): {gia}", file=sys.stderr)

    print("[1/3] scarico impianti metano dal MIMIT...", file=sys.stderr)
    prezzi, _ = prezzi_metano(scarica(PREZZI_URL))
    tutti = anagrafica(scarica(ANAGRAFICA_URL))
    metano = {i: tutti[i] for i in prezzi if i in tutti}
    buchi = {i: imp for i, imp in metano.items() if i not in telefoni}
    print(f"      impianti metano: {len(metano)}, senza telefono: {len(buchi)}",
          file=sys.stderr)

    print("[2/3] interrogo Overture Places (1-3 min alla prima esecuzione)...",
          file=sys.stderr)
    voci = stazioni_overture(args.release)
    print(f"      stazioni di servizio italiane con telefono su Overture: {len(voci)}",
          file=sys.stderr)

    griglia: dict[tuple[int, int], list[dict]] = {}
    for v in voci:
        griglia.setdefault((int(v["lat"] * 100), int(v["lng"] * 100)), []).append(v)

    nuovi = 0
    for id_imp, imp in buchi.items():
        cx, cy = int(imp["lat"] * 100), int(imp["lng"] * 100)
        migliore, dist = None, args.raggio + 1
        for dx in (-1, 0, 1):
            for dy in (-1, 0, 1):
                for v in griglia.get((cx + dx, cy + dy), ()):
                    d = distanza_m(imp["lat"], imp["lng"], v["lat"], v["lng"])
                    if d < dist:
                        migliore, dist = v, d
        if migliore and dist <= args.raggio:
            telefoni[id_imp] = migliore["tel"]
            nuovi += 1

    print(f"[3/3] nuovi telefoni da Overture: {nuovi} "
          f"(totale: {len(telefoni)} su {len(metano)}, "
          f"{100 * len(telefoni) / max(len(metano), 1):.0f}%)", file=sys.stderr)
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(json.dumps(dict(sorted(telefoni.items())),
                              ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"      scritto {out}", file=sys.stderr)
    return 0


if __name__ == "__main__":
    sys.exit(main())
