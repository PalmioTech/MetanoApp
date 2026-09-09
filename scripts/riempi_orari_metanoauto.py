#!/usr/bin/env python3
"""Riempie SOLO gli orari mancanti di public/distributori.csv usando la lista
pubblica di metanoauto.com (stesso scraping leggero di aggiorna_metanoauto.py:
~42 pagine, una ogni 1,5 s). Gli impianti che un orario ce l'hanno gia' non
vengono toccati.

Abbinamento: stessa provincia e stesso comune, poi l'indirizzo piu' simile
(difflib). Se la somiglianza e' bassa o ci sono piu' candidati equivalenti,
l'impianto finisce nel report come "da verificare" e non viene modificato.

Uso (dalla radice del repo, sul Mac: servono requests e beautifulsoup4):
  python3 scripts/riempi_orari_metanoauto.py --dry-run     # solo report
  python3 scripts/riempi_orari_metanoauto.py               # applica
Report: data/orari_mancanti_report.csv
"""
from __future__ import annotations

import argparse
import csv
import difflib
import re
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from aggiorna_metanoauto import scrape_updates  # noqa: E402

SOGLIA_SIMILARITA = 0.45


def norm(s: str) -> str:
    s = s.lower()
    s = re.sub(r"\b(via|viale|v\.le|v\.|strada|statale|s\.s\.|ss|piazza|p\.zza|localita'|loc\.|contrada|c\.da|km)\b", " ", s)
    s = re.sub(r"[^a-z0-9 ]+", " ", s)
    return re.sub(r"\s+", " ", s).strip()


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--csv", default="public/distributori.csv")
    ap.add_argument("--report", default="data/orari_mancanti_report.csv")
    ap.add_argument("--pages", type=int, default=42)
    ap.add_argument("--delay", type=float, default=1.5)
    ap.add_argument("--insecure", action="store_true", help="ignora il certificato di metanoauto (spesso rotto)")
    ap.add_argument("--dry-run", action="store_true")
    args = ap.parse_args()

    with open(args.csv, encoding="utf-8-sig", newline="") as f:
        rd = csv.DictReader(f, delimiter=";")
        header = list(rd.fieldnames or [])
        righe = list(rd)
    mancanti = [r for r in righe if not any((r.get(c) or "").strip() for c in ("feriali", "festivi", "prefestivi"))]
    print(f"impianti senza orario: {len(mancanti)} su {len(righe)}", file=sys.stderr)
    if not mancanti:
        return 0

    print("scarico la lista metanoauto...", file=sys.stderr)
    updates = scrape_updates(args.pages, args.delay, 30, not args.insecure, args.insecure)
    # indice per (provincia, citta) -> [record]
    per_comune: dict[tuple[str, str], list[dict]] = {}
    for rec in updates.values():
        per_comune.setdefault((rec["provincia"].upper(), norm(rec["citta"])), []).append(rec)
    print(f"voci metanoauto: {len(updates)}", file=sys.stderr)

    report, applicati = [], 0
    for r in mancanti:
        chiave = ((r.get("provincia") or "").upper(), norm(r.get("citta") or ""))
        cand = per_comune.get(chiave, [])
        cand = [c for c in cand if any(c.get(k) for k in ("feriali", "festivi", "prefestivi"))]
        esito, scelto, score = "nessun candidato", None, 0.0
        if cand:
            testo_app = norm(f'{r.get("Via estesa","")} {r.get("via","")}')
            punteggi = sorted(
                ((difflib.SequenceMatcher(None, testo_app, norm(c["via"])).ratio(), c) for c in cand),
                key=lambda x: -x[0],
            )
            score, scelto = punteggi[0]
            if len(cand) == 1 and score < SOGLIA_SIMILARITA:
                esito = "unico nel comune (somiglianza bassa)"  # unico impianto: accettiamo comunque
            elif score >= SOGLIA_SIMILARITA and (len(punteggi) == 1 or score - punteggi[1][0] >= 0.1):
                esito = "abbinato"
            else:
                esito, scelto = "ambiguo: da verificare", None
        if scelto and not args.dry_run:
            for k in ("feriali", "festivi", "prefestivi"):
                r[k] = scelto.get(k, "")
            r["fonte_orari"] = "metanoauto"
            applicati += 1
        report.append({
            "esito": esito, "provincia": r.get("provincia"), "citta": r.get("citta"),
            "nome_app": r.get("Via estesa"), "via_app": r.get("via"),
            "via_metanoauto": scelto["via"] if scelto else "", "somiglianza": f"{score:.2f}",
            "feriali": scelto.get("feriali", "") if scelto else "",
            "festivi": scelto.get("festivi", "") if scelto else "",
            "prefestivi": scelto.get("prefestivi", "") if scelto else "",
            "candidati_nel_comune": len(cand),
        })

    Path(args.report).parent.mkdir(parents=True, exist_ok=True)
    with open(args.report, "w", encoding="utf-8", newline="") as f:
        w = csv.DictWriter(f, fieldnames=list(report[0].keys()), delimiter=";")
        w.writeheader(); w.writerows(sorted(report, key=lambda x: (x["esito"], x["provincia"], x["citta"])))
    from collections import Counter
    for k, v in Counter(x["esito"] for x in report).items():
        print(f"  {k}: {v}", file=sys.stderr)
    print(f"report -> {args.report}", file=sys.stderr)

    if not args.dry_run:
        with open(args.csv, "w", encoding="utf-8", newline="") as f:
            w = csv.DictWriter(f, fieldnames=header, delimiter=";", extrasaction="ignore")
            w.writeheader(); w.writerows(righe)
        print(f"orari applicati a {applicati} impianti -> {args.csv}", file=sys.stderr)
    return 0


if __name__ == "__main__":
    sys.exit(main())
