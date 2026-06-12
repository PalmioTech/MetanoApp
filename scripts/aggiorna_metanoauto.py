#!/usr/bin/env python3
import argparse
import csv
import re
import subprocess
import time
from pathlib import Path
from urllib.parse import urljoin

import requests
from bs4 import BeautifulSoup

try:
    import certifi
except ImportError:
    certifi = None


BASE_URL = "https://www.metanoauto.com/"
LIST_URL = urljoin(
    BASE_URL,
    "modules.php?name=Distributori&op=DistUELista&p=1&orderby=paeseA&min={min}",
)
FIELDNAMES = [
    "lat",
    "Long",
    "Via estesa",
    "provincia",
    "citta",
    "via",
    "prezzo",
    "feriali",
    "festivi",
    "prefestivi",
]
HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/125.0 Safari/537.36"
    ),
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Accept-Language": "it-IT,it;q=0.9,en;q=0.8",
}


def clean(text: str) -> str:
    text = text.replace("\xa0", " ")
    return re.sub(r"\s+", " ", text).strip()


def key(provincia: str, citta: str, via: str) -> tuple[str, str, str]:
    return (clean(provincia).upper(), clean(citta).upper(), clean(via).upper())


def split_address(cell) -> tuple[str, str]:
    city_node = cell.find("b")
    city = clean(city_node.get_text(" ", strip=True)) if city_node else ""
    full = clean(cell.get_text(" ", strip=True))
    address = clean(full[len(city) :]) if city and full.upper().startswith(city.upper()) else full
    return city, address


def parse_hours(cell) -> dict[str, str]:
    text = clean(cell.get_text(" ", strip=True))
    if "Contanti" in text:
        text = text.split("Contanti", 1)[1]
    text = text.lstrip(" :")

    hours = {"feriali": "", "prefestivi": "", "festivi": ""}
    labels = {
        "Feriali": "feriali",
        "Prefestivi": "prefestivi",
        "Festivi": "festivi",
    }

    for part in [clean(x) for x in text.split(";") if clean(x)]:
        match = re.match(
            r"((?:Feriali|Prefestivi|Festivi)(?:-(?:Feriali|Prefestivi|Festivi))*)\s+(.+)$",
            part,
        )
        if not match:
            continue
        label_text, value = match.groups()
        value = clean(value)
        for label in label_text.split("-"):
            hours[labels[label]] = value

    return hours


def parse_page(html: str) -> list[dict[str, str]]:
    soup = BeautifulSoup(html, "html.parser")
    table = soup.find("table", class_="forumline")
    if not table:
        if "You have been blocked" in html:
            raise RuntimeError("metanoauto ha bloccato richiesta: rallenta o cambia user-agent/IP")
        raise RuntimeError("tabella distributori non trovata")

    records = []
    for tr in table.find_all("tr"):
        cells = tr.find_all("td", recursive=False)
        if len(cells) < 9:
            continue

        provincia = clean(cells[2].get_text(" ", strip=True))
        citta, via = split_address(cells[3])
        prezzo_node = cells[5].find("b")
        prezzo = clean(prezzo_node.get_text(" ", strip=True)) if prezzo_node else ""
        hours = parse_hours(cells[7])

        records.append(
            {
                "provincia": provincia,
                "citta": citta,
                "via": via,
                "prezzo": prezzo,
                **hours,
            }
        )

    return records


def fetch_with_curl(url: str, timeout: int, insecure: bool = False) -> str:
    command = [
        "curl",
        "-L",
        "-sS",
        "--max-time",
        str(timeout),
        "-A",
        HEADERS["User-Agent"],
        "-H",
        f"Accept-Language: {HEADERS['Accept-Language']}",
    ]
    if insecure:
        command.append("-k")
    command.append(url)
    result = subprocess.run(command, check=True, capture_output=True)
    return result.stdout.decode("utf-8", errors="replace")


def fetch(session: requests.Session, url: str, timeout: int, verify: str | bool, insecure: bool) -> str:
    try:
        response = session.get(url, timeout=timeout, verify=verify)
        response.raise_for_status()
        response.encoding = response.apparent_encoding or "utf-8"
        return response.text
    except requests.exceptions.SSLError:
        print("SSL Python fallito, uso curl.")
        return fetch_with_curl(url, timeout, insecure)


def scrape_updates(
    max_pages: int,
    delay: float,
    timeout: int,
    verify: str | bool,
    insecure: bool,
) -> dict[tuple[str, str, str], dict[str, str]]:
    session = requests.Session()
    session.headers.update(HEADERS)
    updates = {}

    for page in range(max_pages):
        min_value = page * 45
        url = LIST_URL.format(min=min_value)
        print(f"Scarico pagina {page + 1}/{max_pages}: min={min_value}")
        html = fetch(session, url, timeout, verify, insecure)
        records = parse_page(html)
        if not records:
            print("Nessuna riga trovata, stop.")
            break

        for record in records:
            updates[key(record["provincia"], record["citta"], record["via"])] = record

        if page < max_pages - 1:
            time.sleep(delay)

    return updates


def update_csv(input_path: Path, output_path: Path, updates: dict[tuple[str, str, str], dict[str, str]]) -> tuple[int, int]:
    with input_path.open("r", encoding="utf-8-sig", newline="") as f:
        rows = list(csv.DictReader(f, delimiter=";"))

    changed = 0
    matched = 0
    for row in rows:
        update = updates.get(key(row["provincia"], row["citta"], row["via"]))
        if not update:
            continue
        matched += 1
        for field in ("prezzo", "feriali", "festivi", "prefestivi"):
            if row.get(field, "") != update[field]:
                row[field] = update[field]
                changed += 1

    with output_path.open("w", encoding="utf-8", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=FIELDNAMES, delimiter=";")
        writer.writeheader()
        writer.writerows(rows)

    return matched, changed


def main() -> None:
    default_csv = (
        Path("distributori.csv")
        if Path("distributori.csv").exists()
        else Path("/Users/devpecas/Downloads/distributori.csv")
    )
    parser = argparse.ArgumentParser(
        description="Aggiorna prezzo e orari nel CSV distributori usando metanoauto.com."
    )
    parser.add_argument(
        "input_csv",
        nargs="?",
        default=str(default_csv),
        help="CSV sorgente già popolato.",
    )
    parser.add_argument(
        "-o",
        "--output",
        default="distributori_aggiornato.csv",
        help="CSV aggiornato da scrivere.",
    )
    parser.add_argument("--pages", type=int, default=42, help="Numero pagine lista da scaricare.")
    parser.add_argument("--delay", type=float, default=1.5, help="Secondi pausa tra pagine.")
    parser.add_argument("--timeout", type=int, default=30, help="Timeout HTTP in secondi.")
    parser.add_argument(
        "--insecure",
        action="store_true",
        help="Disabilita verifica certificato SSL. Usare solo se certificati locali Python sono rotti.",
    )
    args = parser.parse_args()

    input_path = Path(args.input_csv).expanduser()
    output_path = Path(args.output).expanduser()

    verify = False if args.insecure else (certifi.where() if certifi else True)
    updates = scrape_updates(args.pages, args.delay, args.timeout, verify, args.insecure)
    matched, changed = update_csv(input_path, output_path, updates)
    print(f"Righe sorgente abbinate: {matched}")
    print(f"Campi aggiornati: {changed}")
    print(f"File scritto: {output_path}")


if __name__ == "__main__":
    main()
