"""Add canonical page QR assets to Course 1. Requires the Python qrcode package.

Run with --games for the first release, then without it for the remaining pages.
"""
import argparse
from pathlib import Path
import qrcode
import qrcode.image.svg

ROOT = Path(__file__).resolve().parents[1]
GAMES = [
    "ingles/intermediate/games.html",
    "ingles/intermediate/game-decision-room.html",
    "ingles/intermediate/game-hangman.html",
    "ingles/intermediate/game-unit-4-family-impostor.html",
    "ingles/intermediate/game-unit-5-food-vocabulary-memory.html",
    "ingles/intermediate/stereotype-guessing-game.html",
    "ingles/basico/practice-unit-3-favorite-people.html",
]
SCRIPT = '<script src="/assets/js/page-qr-access.js?v=20261003-intermediate1" defer></script>'


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--games", action="store_true")
    args = parser.parse_args()
    pages = GAMES if args.games else [
        str(p.relative_to(ROOT)) for p in sorted((ROOT / "ingles/intermediate").glob("*.html"))
    ]
    for name in pages:
        page = ROOT / name
        raw = page.read_bytes()
        if b"page-qr-access.js" not in raw:
            assert raw.lower().count(b"</body>") == 1, name
            newline = b"\r\n" if b"\r\n" in raw else b"\n"
            raw = raw.replace(b"</body>", SCRIPT.encode() + newline + b"</body>")
            page.write_bytes(raw)
        asset = ROOT / "assets/img/page-qr" / (name[:-5].replace("/", "-") + ".svg")
        url = "https://www.jaralingua.com/" + name
        qr = qrcode.make(url, image_factory=qrcode.image.svg.SvgPathImage, border=4)
        qr.save(asset)
        print(name)


if __name__ == "__main__":
    main()
