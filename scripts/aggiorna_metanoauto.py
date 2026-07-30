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
PDI_URL = urljoin(
    BASE_URL,
    "modules.php?name=Distributori&op=DistUEPreparaPDI&p=1",
)
MAP_DATA_URL = urljoin(
    BASE_URL,
    "modules.php?name=Distributori&op=DistUEGetDati&p=1",
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


def norm(text: str) -> str:
    text = clean(text).upper()
    text = re.sub(r"[^\w]+", " ", text, flags=re.UNICODE)
    return re.sub(r"\s+", " ", text).strip()


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


def coord_pair(first: str, second: str) -> tuple[str, str] | None:
    try:
        a = float(first.replace(",", "."))
        b = float(second.replace(",", "."))
    except ValueError:
        return None

    # Il CSV storico ha colonne invertite: "lat" = longitudine, "Long" = latitudine.
    if 6 <= a <= 19 and 35 <= b <= 48:
        return (f"{a:.6f}".rstrip("0").rstrip("."), f"{b:.6f}".rstrip("0").rstrip("."))
    if 35 <= a <= 48 and 6 <= b <= 19:
        return (f"{b:.6f}".rstrip("0").rstrip("."), f"{a:.6f}".rstrip("0").rstrip("."))
    return None


def via_estesa(provincia: str, citta: str, via: str) -> str:
    return clean(f"{provincia} {citta} {via}").upper()


def parse_address_from_extended(text: str) -> tuple[str, str, str]:
    parts = clean(text).split(" ", 2)
    if len(parts) < 3:
        return "", "", clean(text)
    return parts[0], parts[1], parts[2]


def js_unquote(value: str) -> str:
    value = value.strip()
    if len(value) >= 2 and value[0] in "'\"" and value[-1] == value[0]:
        value = value[1:-1]
    return clean(value.replace("\\'", "'").replace('\\"', '"'))


def split_js_array(raw: str) -> list[str]:
    out = []
    current = []
    quote = ""
    escaped = False
    for ch in raw:
        if escaped:
            current.append(ch)
            escaped = False
            continue
        if ch == "\\":
            current.append(ch)
            escaped = True
            continue
        if quote:
            current.append(ch)
            if ch == quote:
                quote = ""
            continue
        if ch in "'\"":
            current.append(ch)
            quote = ch
            continue
        if ch == ",":
            out.append(js_unquote("".join(current)))
            current = []
            continue
        current.append(ch)
    out.append(js_unquote("".join(current)))
    return out


def parse_js_map_data(text: str) -> dict[tuple[str, str, str], dict[str, str]]:
    coords_by_id: dict[str, tuple[str, str]] = {}
    recap_by_id: dict[str, list[str]] = {}

    for match in re.finditer(
        r"distributori\[(\d+)\]\s*\[\s*['\"]coordinate['\"]\s*\]\s*=\s*new Array\(([^)]*)\)",
        text,
    ):
        pair = split_js_array(match.group(2))
        if len(pair) >= 2:
            coords = coord_pair(pair[0], pair[1])
            if coords:
                coords_by_id[match.group(1)] = coords

    for match in re.finditer(
        r"distributori\[(\d+)\]\s*\[\s*['\"]recapito['\"]\s*\]\s*=\s*new Array\(([^)]*)\)",
        text,
    ):
        recap_by_id[match.group(1)] = split_js_array(match.group(2))

    records: dict[tuple[str, str, str], dict[str, str]] = {}
    for station_id, coords in coords_by_id.items():
        recap = recap_by_id.get(station_id, [])
        if len(recap) < 3:
            continue
        provincia = recap[0]
        citta = recap[1]
        via = recap[2]
        if not provincia or not citta or not via:
            continue
        records[key(provincia, citta, via)] = {
            "lat": coords[0],
            "Long": coords[1],
            "Via estesa": via_estesa(provincia, citta, via),
            "provincia": provincia,
            "citta": citta,
            "via": via,
        }
    return records


def parse_csv_like_pdi(text: str) -> dict[tuple[str, str, str], dict[str, str]]:
    sample = text[:4096]
    try:
        dialect = csv.Sniffer().sniff(sample, delimiters=";,\t|")
    except csv.Error:
        dialect = csv.excel
        dialect.delimiter = ";"

    rows = list(csv.reader(text.splitlines(), dialect))
    if not rows:
        return {}

    header = [norm(c) for c in rows[0]]
    has_header = any(h in header for h in ("LAT", "LONG", "LON", "LONGITUDINE", "VIA ESTESA", "PROVINCIA", "CITTA"))
    data_rows = rows[1:] if has_header else rows

    def idx(*names: str) -> int | None:
        for name in names:
            name_n = norm(name)
            if name_n in header:
                return header.index(name_n)
        return None

    records: dict[tuple[str, str, str], dict[str, str]] = {}
    if has_header:
        lat_i = idx("lat", "latitude", "latitudine")
        lon_i = idx("long", "lon", "lng", "longitude", "longitudine")
        ext_i = idx("via estesa", "descrizione", "indirizzo esteso", "name")
        prov_i = idx("provincia", "prov")
        city_i = idx("citta", "città", "comune")
        via_i = idx("via", "indirizzo")
        for row in data_rows:
            if lat_i is None or lon_i is None or len(row) <= max(lat_i, lon_i):
                continue
            coords = coord_pair(row[lat_i], row[lon_i])
            if not coords:
                continue
            extended = clean(row[ext_i]) if ext_i is not None and len(row) > ext_i else ""
            provincia = clean(row[prov_i]) if prov_i is not None and len(row) > prov_i else ""
            citta = clean(row[city_i]) if city_i is not None and len(row) > city_i else ""
            via = clean(row[via_i]) if via_i is not None and len(row) > via_i else ""
            if not (provincia and citta and via) and extended:
                provincia, citta, via = parse_address_from_extended(extended)
            if not (provincia and citta and via):
                continue
            records[key(provincia, citta, via)] = {
                "lat": coords[0],
                "Long": coords[1],
                "Via estesa": extended or via_estesa(provincia, citta, via),
                "provincia": provincia,
                "citta": citta,
                "via": via,
            }
        return records

    for row in data_rows:
        if len(row) < 3:
            continue
        coords = None
        coord_indexes = None
        for i in range(len(row) - 1):
            coords = coord_pair(row[i], row[i + 1])
            if coords:
                coord_indexes = {i, i + 1}
                break
        if not coords or coord_indexes is None:
            continue
        text_parts = [cell for i, cell in enumerate(row) if i not in coord_indexes]
        extended = clean(" ".join(text_parts))
        provincia, citta, via = parse_address_from_extended(extended)
        if not (provincia and citta and via):
            continue
        records[key(provincia, citta, via)] = {
            "lat": coords[0],
            "Long": coords[1],
            "Via estesa": extended,
            "provincia": provincia,
            "citta": citta,
            "via": via,
        }
    return records


def parse_coordinate_data(text: str) -> dict[tuple[str, str, str], dict[str, str]]:
    records = parse_js_map_data(text)
    if records:
        return records
    return parse_csv_like_pdi(text)


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


def fetch_coordinate_data(
    session: requests.Session,
    timeout: int,
    verify: str | bool,
    insecure: bool,
    pdi_file: Path | None,
    pdi_url: str,
) -> dict[tuple[str, str, str], dict[str, str]]:
    sources: list[tuple[str, str]] = []
    if pdi_file:
        sources.append((f"file {pdi_file}", pdi_file.read_text(encoding="utf-8-sig", errors="replace")))
    else:
        for url in (MAP_DATA_URL, pdi_url):
            try:
                print(f"Scarico coordinate: {url}")
                sources.append((url, fetch(session, url, timeout, verify, insecure)))
            except Exception as exc:
                print(f"Coordinate non scaricate da {url}: {exc}")

    for source_name, text in sources:
        if "Non sei registrato" in text:
            print(f"Coordinate non disponibili da {source_name}: serve login metanoauto.")
            continue
        records = parse_coordinate_data(text)
        if records:
            print(f"Coordinate trovate da {source_name}: {len(records)}")
            return records
        print(f"Coordinate non riconosciute da {source_name}.")
    return {}


def find_coordinate_record(
    update: dict[str, str],
    coordinate_records: dict[tuple[str, str, str], dict[str, str]],
) -> dict[str, str] | None:
    direct = coordinate_records.get(key(update["provincia"], update["citta"], update["via"]))
    if direct:
        return direct

    target_prov = norm(update["provincia"])
    target_city = norm(update["citta"])
    target_via = norm(update["via"])
    for record in coordinate_records.values():
        extended = norm(record.get("Via estesa", ""))
        if not extended:
            extended = norm(via_estesa(record.get("provincia", ""), record.get("citta", ""), record.get("via", "")))
        if target_prov and target_prov not in extended:
            continue
        if target_city and target_city not in extended:
            continue
        if target_via and target_via in extended:
            return record
    return None


def update_csv(
    input_path: Path,
    output_path: Path,
    updates: dict[tuple[str, str, str], dict[str, str]],
    coordinate_records: dict[tuple[str, str, str], dict[str, str]] | None = None,
    add_new: bool = False,
) -> tuple[int, int, int, int]:
    with input_path.open("r", encoding="utf-8-sig", newline="") as f:
        rows = list(csv.DictReader(f, delimiter=";"))

    changed = 0
    matched = 0
    existing_keys = set()
    for row in rows:
        row_key = key(row["provincia"], row["citta"], row["via"])
        existing_keys.add(row_key)
        update = updates.get(row_key)
        if not update:
            continue
        matched += 1
        for field in ("prezzo", "feriali", "festivi", "prefestivi"):
            if row.get(field, "") != update[field]:
                row[field] = update[field]
                changed += 1

    added = 0
    missing_coords = 0
    if add_new:
        coordinate_records = coordinate_records or {}
        for update_key, update in sorted(updates.items()):
            if update_key in existing_keys:
                continue
            coords = find_coordinate_record(update, coordinate_records)
            if not coords:
                missing_coords += 1
                continue
            rows.append(
                {
                    "lat": coords["lat"],
                    "Long": coords["Long"],
                    "Via estesa": coords.get("Via estesa") or via_estesa(update["provincia"], update["citta"], update["via"]),
                    "provincia": update["provincia"],
                    "citta": update["citta"],
                    "via": update["via"],
                    "prezzo": update["prezzo"],
                    "feriali": update["feriali"],
                    "festivi": update["festivi"],
                    "prefestivi": update["prefestivi"],
                }
            )
            existing_keys.add(update_key)
            added += 1

    with output_path.open("w", encoding="utf-8", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=FIELDNAMES, delimiter=";")
        writer.writeheader()
        writer.writerows(rows)

    return matched, changed, added, missing_coords


def main() -> None:
    default_csv = (
        Path("distributori.csv")
        if Path("distributori.csv").exists()
        else Path("/Users/devpecas/Downloads/distributori.csv")
    )
    parser = argparse.ArgumentParser(
        description="Aggiorna prezzo/orari e, opzionalmente, aggiunge nuovi distributori usando metanoauto.com."
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
        "--add-new",
        action="store_true",
        help="Aggiunge al CSV i distributori nuovi quando trova coordinate da mappa/PDI.",
    )
    parser.add_argument(
        "--pdi-file",
        help="File PDI/CSV/HTML già scaricato da metanoauto da usare per coordinate.",
    )
    parser.add_argument(
        "--pdi-url",
        default=PDI_URL,
        help="URL PDI da usare per coordinate se accessibile/loggato.",
    )
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
    coordinate_records = {}
    if args.add_new:
        session = requests.Session()
        session.headers.update(HEADERS)
        pdi_file = Path(args.pdi_file).expanduser() if args.pdi_file else None
        coordinate_records = fetch_coordinate_data(
            session,
            args.timeout,
            verify,
            args.insecure,
            pdi_file,
            args.pdi_url,
        )
    matched, changed, added, missing_coords = update_csv(
        input_path,
        output_path,
        updates,
        coordinate_records=coordinate_records,
        add_new=args.add_new,
    )
    print(f"Righe sorgente abbinate: {matched}")
    print(f"Campi aggiornati: {changed}")
    if args.add_new:
        print(f"Nuovi distributori aggiunti: {added}")
        print(f"Nuovi senza coordinate: {missing_coords}")
    print(f"File scritto: {output_path}")


if __name__ == "__main__":
    main()
