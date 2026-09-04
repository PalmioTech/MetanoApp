#!/usr/bin/env python3
"""Confronta gli orari di public/distributori.csv (ereditati da metanoauto)
con il tag opening_hours dei distributori metano su OpenStreetMap.

I dati MIMIT non hanno orari, quindi OSM e' l'unica fonte indipendente con
cui verificare quanto sono affidabili quelli che l'app mostra oggi.

Cosa fa:
  1. scarica da Overpass gli amenity=fuel con fuel:cng=yes in Italia
     (oppure legge un JSON salvato con --osm-json, per non rifare la query);
  2. abbina ogni impianto del CSV al nodo OSM piu' vicino entro --raggio metri;
  3. traduce entrambi gli orari in intervalli per feriali / sabato / domenica
     e li confronta;
  4. scrive un CSV di confronto (--output) e stampa un riepilogo.

Uso (dalla radice del repo):
  python3 scripts/confronta_orari_osm.py
  python3 scripts/confronta_orari_osm.py --salva-osm data/osm_cng.json   # tiene la risposta
  python3 scripts/confronta_orari_osm.py --osm-json data/osm_cng.json    # riusa la risposta

Solo libreria standard, come gli altri script.
"""
from __future__ import annotations

import argparse
import csv
import json
import math
import re
import sys
import urllib.parse
import urllib.request
from collections import Counter
from pathlib import Path

OVERPASS_SERVERS = [
    "https://overpass-api.de/api/interpreter",
    "https://overpass.kumi.systems/api/interpreter",
]
QUERY = ('[out:json][timeout:180];'
         'area["ISO3166-1"="IT"][admin_level=2]->.it;'
         'nwr["amenity"="fuel"]["fuel:cng"="yes"](area.it);'
         'out center tags;')

Intervalli = list[tuple[int, int]]  # minuti dall'inizio del giorno, [(420, 1140)]
Giorno = dict[str, Intervalli | None]  # "feriali"/"sabato"/"domenica" -> intervalli, None = sconosciuto


# ----------------------------------------------------------------- utilita'
def distanza_m(lat1: float, lng1: float, lat2: float, lng2: float) -> float:
    r = 6_371_000.0
    p1, p2 = math.radians(lat1), math.radians(lat2)
    dp = p2 - p1
    dl = math.radians(lng2 - lng1)
    a = math.sin(dp / 2) ** 2 + math.cos(p1) * math.cos(p2) * math.sin(dl / 2) ** 2
    return 2 * r * math.asin(math.sqrt(a))


def _hm(s: str) -> int:
    h, m = s.replace(".", ":").split(":")
    return int(h) * 60 + int(m)


def normalizza(iv: Intervalli) -> Intervalli:
    """Ordina, fonde intervalli contigui, tratta 00:00-24:00 come 24h."""
    iv = sorted((a, b if b > a else b + 1440) for a, b in iv)
    out: Intervalli = []
    for a, b in iv:
        if out and a <= out[-1][1]:
            out[-1] = (out[-1][0], max(out[-1][1], b))
        else:
            out.append((a, b))
    return out


def minuti_aperti(iv: Intervalli | None) -> int:
    return sum(min(b, 1440) - a for a, b in iv) if iv else 0


def fmt(iv: Intervalli | None) -> str:
    if iv is None:
        return "?"
    if not iv:
        return "chiuso"
    if minuti_aperti(iv) >= 1440:
        return "24h"
    return "/".join(f"{a // 60:02d}:{a % 60:02d}-{min(b, 1440) // 60:02d}:{min(b, 1440) % 60:02d}" for a, b in iv)


# --------------------------------------------------- parser orari dell'app
RANGE_RE = re.compile(r"(\d{1,2}[:.]\d{2})\s*[-–]\s*(\d{1,2}[:.]\d{2})")
SOLO_SLASH_RE = re.compile(r"^(\d{1,2}[:.]\d{2})\s*/\s*(\d{1,2}[:.]\d{2})$")  # "07:00/20:00" = apertura/chiusura


def parse_app(testo: str) -> Intervalli | None:
    """'07:30-12:30/14:30-19:00' -> intervalli; 'Chiuso' -> []; vuoto -> None."""
    t = testo.strip()
    if not t:
        return None
    if t.lower().startswith("chius"):
        return []
    if t.lower() in ("24h", "h24", "24 ore"):
        return [(0, 1440)]
    m = SOLO_SLASH_RE.match(t)
    if m:
        return normalizza([(_hm(m.group(1)), _hm(m.group(2)))])
    iv = [(_hm(a), _hm(b)) for a, b in RANGE_RE.findall(t)]
    if not iv:
        return None
    return normalizza(iv)


def orari_app(riga: dict) -> Giorno:
    return {
        "feriali": parse_app(riga.get("feriali", "")),
        "sabato": parse_app(riga.get("prefestivi", "")),
        "domenica": parse_app(riga.get("festivi", "")),
    }


# ------------------------------------------------ parser opening_hours OSM
GIORNI = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"]
OH_RANGE_RE = re.compile(r"(\d{1,2}:\d{2})\s*-\s*(\d{1,2}:\d{2})")
OH_DAYS_RE = re.compile(r"^((?:(?:Mo|Tu|We|Th|Fr|Sa|Su|PH|SH)(?:-(?:Mo|Tu|We|Th|Fr|Sa|Su))?)(?:,(?:Mo|Tu|We|Th|Fr|Sa|Su|PH|SH)(?:-(?:Mo|Tu|We|Th|Fr|Sa|Su))?)*)\s*(.*)$")


def _espandi_giorni(spec: str) -> set[str]:
    out: set[str] = set()
    for parte in spec.split(","):
        if parte in ("PH", "SH"):
            continue  # festivita': ignorate nel confronto
        if "-" in parte:
            a, b = parte.split("-")
            ia, ib = GIORNI.index(a), GIORNI.index(b)
            idx = range(ia, ib + 1) if ia <= ib else list(range(ia, 7)) + list(range(0, ib + 1))
            out.update(GIORNI[i] for i in idx)
        else:
            out.add(parte)
    return out


def parse_osm(oh: str) -> Giorno | None:
    """Sottoinsieme di opening_hours: '24/7', 'Mo-Fr 07:00-19:00; Sa 07:00-12:00; Su off',
    'Mo-Su 06:00-22:00', '07:00-20:00'. Restituisce None se non capisce la sintassi."""
    oh = oh.strip()
    if not oh:
        return None
    if oh in ("24/7", "Mo-Su 00:00-24:00", "00:00-24:00"):
        return {"feriali": [(0, 1440)], "sabato": [(0, 1440)], "domenica": [(0, 1440)]}
    per_giorno: dict[str, Intervalli | None] = {g: None for g in GIORNI}
    for regola in re.split(r"\s*;\s*|\s*\|\|\s*", oh):
        regola = regola.strip()
        if not regola:
            continue
        if re.search(r"\b(sunrise|sunset|dawn|dusk|week|Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec|easter)\b", regola):
            return None  # regole stagionali/astronomiche: fuori portata
        m = OH_DAYS_RE.match(regola)
        if m and m.group(1):
            giorni = _espandi_giorni(m.group(1))
            resto = m.group(2).strip()
        else:
            giorni = set(GIORNI)
            resto = regola
        if resto.lower() in ("off", "closed"):
            iv: Intervalli = []
        elif resto == "24/7" or resto == "00:00-24:00":
            iv = [(0, 1440)]
        else:
            trovati = OH_RANGE_RE.findall(resto)
            if not trovati or re.sub(OH_RANGE_RE, "", resto).replace(",", "").strip():
                return None  # c'e' qualcosa che non e' un intervallo orario
            iv = normalizza([(_hm(a), _hm(b)) for a, b in trovati])
        for g in giorni:
            per_giorno[g] = iv
    if all(v is None for v in per_giorno.values()):
        return None
    # giorni non nominati in una regola con giorni espliciti = chiuso (convenzione OSM)
    feriali = [per_giorno[g] for g in GIORNI[:5]]
    feriali_def = [x for x in feriali if x is not None]
    # se i feriali differiscono tra loro prendo il lun (giorno tipo) ma lo segnalo con None se troppo eterogenei
    fer: Intervalli | None
    if not feriali_def:
        fer = []
    else:
        fer = feriali_def[0]
        if any(x != fer for x in feriali_def):
            fer = feriali_def[0]  # approssimazione: giorno tipo
    return {
        "feriali": fer,
        "sabato": per_giorno["Sa"] if per_giorno["Sa"] is not None else [],
        "domenica": per_giorno["Su"] if per_giorno["Su"] is not None else [],
    }


# ---------------------------------------------------------------- confronto
def classifica(app: Intervalli | None, osm: Intervalli | None) -> str:
    if app is None or osm is None:
        return "non confrontabile"
    if app == osm:
        return "uguale"
    ma, mo = minuti_aperti(app), minuti_aperti(osm)
    if mo >= 1440 and ma < 1440:
        return "OSM 24h, app limitata"
    if ma >= 1440 and mo < 1440:
        return "app 24h, OSM limitata"
    if not app and osm:
        return "app chiuso, OSM aperto"
    if app and not osm:
        return "app aperto, OSM chiuso"
    # stesso numero di intervalli e scostamento piccolo?
    if len(app) == len(osm) and all(abs(a[0] - o[0]) <= 30 and abs(a[1] - o[1]) <= 30 for a, o in zip(app, osm)):
        return "scostamento <=30 min"
    return "diverso"


def interroga_overpass() -> dict:
    dati = urllib.parse.urlencode({"data": QUERY}).encode()
    for url in OVERPASS_SERVERS:
        try:
            req = urllib.request.Request(url, data=dati, headers={"User-Agent": "MetanApp-orari-check/1.0"})
            with urllib.request.urlopen(req, timeout=240) as r:
                return json.load(r)
        except Exception as e:  # noqa: BLE001
            print(f"[overpass] {url}: {e} - provo il prossimo", file=sys.stderr)
    raise RuntimeError("tutti i server Overpass hanno fallito, riprova tra qualche minuto")


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--csv", default="public/distributori.csv")
    ap.add_argument("--raggio", type=float, default=200.0, help="metri per l'abbinamento (default 200)")
    ap.add_argument("--osm-json", help="risposta Overpass gia' salvata, evita la query")
    ap.add_argument("--salva-osm", help="dove salvare la risposta Overpass per riusarla")
    ap.add_argument("-o", "--output", default="data/confronto_orari_osm.csv")
    args = ap.parse_args()

    # 1) impianti dell'app. Quirk storico del CSV: la colonna "lat" contiene la
    #    longitudine e "Long" la latitudine (vedi aggiorna_mimit.py).
    with open(args.csv, encoding="utf-8", newline="") as f:
        righe = list(csv.DictReader(f, delimiter=";"))
    impianti = []
    for r in righe:
        try:
            lng, lat = float(r["lat"]), float(r["Long"])
        except (KeyError, ValueError):
            continue
        impianti.append((lat, lng, r))
    print(f"[1/3] impianti nel CSV: {len(impianti)}", file=sys.stderr)

    # 2) OSM
    if args.osm_json:
        osm = json.loads(Path(args.osm_json).read_text(encoding="utf-8"))
    else:
        print("[2/3] interrogo OpenStreetMap (30-60s)...", file=sys.stderr)
        osm = interroga_overpass()
        if args.salva_osm:
            Path(args.salva_osm).write_text(json.dumps(osm), encoding="utf-8")
    nodi = []
    for e in osm.get("elements", []):
        tags = e.get("tags", {})
        if "opening_hours" not in tags:
            continue
        lat = e.get("lat") or e.get("center", {}).get("lat")
        lon = e.get("lon") or e.get("center", {}).get("lon")
        if lat is None or lon is None:
            continue
        nodi.append((float(lat), float(lon), tags, f"{e['type']}/{e['id']}"))
    print(f"      distributori CNG su OSM con opening_hours: {len(nodi)}", file=sys.stderr)

    # 3) abbinamento + confronto (griglia ~0.05 gradi per non fare 1500x3000 distanze)
    griglia: dict[tuple[int, int], list] = {}
    for n in nodi:
        griglia.setdefault((int(n[0] / 0.05), int(n[1] / 0.05)), []).append(n)

    out_rows = []
    stats = Counter()
    for lat, lng, r in impianti:
        k = (int(lat / 0.05), int(lng / 0.05))
        best, best_d = None, args.raggio + 1
        for dk in (-1, 0, 1):
            for dj in (-1, 0, 1):
                for n in griglia.get((k[0] + dk, k[1] + dj), []):
                    d = distanza_m(lat, lng, n[0], n[1])
                    if d < best_d:
                        best, best_d = n, d
        if best is None:
            stats["senza corrispondenza OSM"] += 1
            continue
        tags = best[2]
        oh = tags.get("opening_hours", "")
        a = orari_app(r)
        o = parse_osm(oh)
        if o is None:
            stats["opening_hours OSM non interpretabile"] += 1
            esito = {g: "non confrontabile" for g in ("feriali", "sabato", "domenica")}
        else:
            esito = {g: classifica(a[g], o[g]) for g in ("feriali", "sabato", "domenica")}
            stats["abbinati e confrontati"] += 1
            for g, v in esito.items():
                stats[f"{g}: {v}"] += 1
        # verdetto sintetico sulla riga: peggiore dei tre giorni
        ordine = ["uguale", "scostamento <=30 min", "non confrontabile", "OSM 24h, app limitata",
                  "app 24h, OSM limitata", "app chiuso, OSM aperto", "app aperto, OSM chiuso", "diverso"]
        verdetto = max(esito.values(), key=ordine.index)
        out_rows.append({
            "verdetto": verdetto,
            "nome": r.get("Via estesa", ""),
            "citta": r.get("citta", ""),
            "provincia": r.get("provincia", ""),
            "self": r.get("self", ""),
            "distanza_m": round(best_d),
            "osm_id": best[3],
            "osm_nome": tags.get("name", tags.get("brand", "")),
            "app_feriali": fmt(a["feriali"]), "osm_feriali": fmt(o["feriali"]) if o else "?", "esito_feriali": esito["feriali"],
            "app_sabato": fmt(a["sabato"]), "osm_sabato": fmt(o["sabato"]) if o else "?", "esito_sabato": esito["sabato"],
            "app_domenica": fmt(a["domenica"]), "osm_domenica": fmt(o["domenica"]) if o else "?", "esito_domenica": esito["domenica"],
            "osm_opening_hours": oh,
            "osm_check_date": tags.get("check_date:opening_hours", tags.get("check_date", "")),
            "lat": lat, "lng": lng,
        })

    Path(args.output).parent.mkdir(parents=True, exist_ok=True)
    ordine_v = ["diverso", "app aperto, OSM chiuso", "app chiuso, OSM aperto", "app 24h, OSM limitata",
                "OSM 24h, app limitata", "scostamento <=30 min", "non confrontabile", "uguale"]
    out_rows.sort(key=lambda x: (ordine_v.index(x["verdetto"]), x["provincia"], x["citta"]))
    with open(args.output, "w", encoding="utf-8", newline="") as f:
        w = csv.DictWriter(f, fieldnames=list(out_rows[0].keys()) if out_rows else ["verdetto"], delimiter=";")
        w.writeheader()
        w.writerows(out_rows)

    print(f"\n[3/3] riepilogo (raggio {args.raggio:.0f} m) -> {args.output}", file=sys.stderr)
    print(f"  impianti app: {len(impianti)}", file=sys.stderr)
    for k in ("senza corrispondenza OSM", "opening_hours OSM non interpretabile", "abbinati e confrontati"):
        print(f"  {k}: {stats[k]}", file=sys.stderr)
    for g in ("feriali", "sabato", "domenica"):
        print(f"  -- {g}", file=sys.stderr)
        for k, v in sorted(((k, v) for k, v in stats.items() if k.startswith(g + ": ")), key=lambda kv: -kv[1]):
            print(f"     {k.split(': ', 1)[1]:<28} {v}", file=sys.stderr)
    verd = Counter(r["verdetto"] for r in out_rows)
    print("  -- verdetto per impianto (peggiore dei tre giorni)", file=sys.stderr)
    for k in ordine_v:
        if verd[k]:
            print(f"     {k:<28} {verd[k]}", file=sys.stderr)
    return 0


if __name__ == "__main__":
    sys.exit(main())
