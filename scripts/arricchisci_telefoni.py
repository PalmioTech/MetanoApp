#!/usr/bin/env python3
"""One-shot: telefoni degli impianti CNG da OpenStreetMap -> data/telefoni.json.

Interroga Overpass per gli amenity=fuel con fuel:cng=yes in Italia,
prende i tag phone/contact:phone e li abbina agli impianti metano MIMIT
per vicinanza (stessa tecnica del recupero orari). Da rilanciare solo
quando si vuole rinfrescare la base numeri.

Uso (dalla radice del repo):
  python3 scripts/arricchisci_telefoni.py
"""
from __future__ import annotations

import argparse
import json
import sys
import urllib.parse
import urllib.request
from pathlib import Path

from aggiorna_mimit import (ANAGRAFICA_URL, PREZZI_URL, anagrafica,
                            distanza_m, prezzi_metano, scarica)

OVERPASS_SERVERS = [
    "https://overpass-api.de/api/interpreter",
    "https://overpass.kumi.systems/api/interpreter",
]
QUERY = ('[out:json][timeout:180];'
         'area["ISO3166-1"="IT"][admin_level=2]->.it;'
         'nwr["amenity"="fuel"]["fuel:cng"="yes"](area.it);'
         'out center tags;')


def interroga_overpass() -> dict:
    dati = urllib.parse.urlencode({"data": QUERY}).encode()
    for url in OVERPASS_SERVERS:
        try:
            req = urllib.request.Request(
                url, data=dati, headers={"User-Agent": "MetanApp-enricher/1.0"})
            with urllib.request.urlopen(req, timeout=240) as r:
                return json.load(r)
        except Exception as e:  # noqa: BLE001 - proviamo il server successivo
            print(f"[overpass] {url}: {e} - provo il prossimo", file=sys.stderr)
    raise RuntimeError("tutti i server Overpass hanno fallito, riprova tra qualche minuto")


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("--raggio", type=float, default=200.0,
                    help="distanza max in metri per l'abbinamento (default 200)")
    ap.add_argument("-o", "--output", default="data/telefoni.json")
    args = ap.parse_args()

    print("[1/3] scarico impianti metano dal MIMIT...", file=sys.stderr)
    prezzi, _ = prezzi_metano(scarica(PREZZI_URL))
    tutti = anagrafica(scarica(ANAGRAFICA_URL))
    metano = {i: tutti[i] for i in prezzi if i in tutti}
    print(f"      impianti metano georeferenziati: {len(metano)}", file=sys.stderr)

    print("[2/3] interrogo OpenStreetMap (30-60s)...", file=sys.stderr)
    elementi = interroga_overpass().get("elements", [])
    voci: list[dict] = []
    for el in elementi:
        tags = el.get("tags") or {}
        tel = (tags.get("phone") or tags.get("contact:phone") or "").strip()
        lat = el.get("lat") or (el.get("center") or {}).get("lat")
        lng = el.get("lon") or (el.get("center") or {}).get("lon")
        if tel and lat is not None and lng is not None:
            voci.append({"lat": lat, "lng": lng, "tel": tel})
    print(f"      impianti CNG su OSM: {len(elementi)}, con telefono: {len(voci)}",
          file=sys.stderr)

    # griglia ~1 km per non fare N*M confronti (stesso trucco degli orari)
    griglia: dict[tuple[int, int], list[dict]] = {}
    for v in voci:
        griglia.setdefault((int(v["lat"] * 100), int(v["lng"] * 100)), []).append(v)

    telefoni: dict[str, str] = {}
    for id_imp, imp in metano.items():
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

    pct = 100 * len(telefoni) / max(len(metano), 1)
    print(f"[3/3] abbinati {len(telefoni)} telefoni su {len(metano)} impianti "
          f"({pct:.0f}%)", file=sys.stderr)
    out = Path(args.output)
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(json.dumps(dict(sorted(telefoni.items())),
                              ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"      scritto {out}", file=sys.stderr)
    return 0


if __name__ == "__main__":
    sys.exit(main())
