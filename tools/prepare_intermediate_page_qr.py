"""Add canonical page QR assets to Course 1. Requires the Python qrcode package.

Use --games for Intermediate 1 games, --course basico for Basic 1, or no flag
for all Intermediate 1 pages. Existing SVGs are preserved.
"""
import argparse
import re
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
SCRIPT = '<script src="/assets/js/page-qr-access.js?v=20261003-intermediate1-priority" defer fetchpriority="high"></script>'


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--games", action="store_true")
    parser.add_argument("--course", choices=["intermediate", "basico"], default="intermediate")
    args = parser.parse_args()
    if args.games and args.course != "intermediate":
        parser.error("--games applies to Intermediate 1")
    pages = GAMES if args.games else [
        str(p.relative_to(ROOT)) for p in sorted((ROOT / "ingles" / args.course).glob("*.html"))
    ]
    for name in pages:
        page = ROOT / name
        raw = page.read_bytes()
        if SCRIPT.encode() not in raw.split(b"</head>")[0]:
            assert raw.lower().count(b"</head>") == 1, name
            newline = b"\r\n" if b"\r\n" in raw else b"\n"
            raw, removed = re.subn(rb'<script\b[^>]*src=["\'][^"\']*page-qr-access\.js[^"\']*["\'][^>]*>\s*</script>\r?\n?', b'', raw)
            assert removed <= 1, name + ': duplicate QR scripts'
            raw = raw.replace(b"</head>", b"  " + SCRIPT.encode() + newline + b"</head>")
            page.write_bytes(raw)
        asset = ROOT / "assets/img/page-qr" / (name[:-5].replace("/", "-") + ".svg")
        url = "https://www.jaralingua.com/" + name
        if not asset.exists():
            qr = qrcode.make(url, image_factory=qrcode.image.svg.SvgPathImage, border=4)
            qr.save(asset)
        print(name)


if __name__ == "__main__":
    main()
