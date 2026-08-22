"""Static checks for Intermediate English Course 2 Unit 2 Listening Part 1.

This validator intentionally starts no local server.
"""

from __future__ import annotations

import json
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote


ROOT = Path(__file__).resolve().parents[1]
PAGE = ROOT / "ingles" / "intermediate-2" / "listening-unit-2-the-call-before-midnight.html"
PRACTICE = ROOT / "ingles" / "intermediate-2" / "practice-lab.html"
LIBRARY = ROOT / "ingles" / "intermediate-2" / "listening-library.html"
CATALOG = ROOT / "assets" / "data" / "english-intermediate-2-content.json"
CSS = ROOT / "assets" / "css" / "english-intermediate-2.css"
AUDIO = ROOT / "ingles" / "intermediate-2" / "audio" / "unit-2" / "the-call-before-midnight.mp3"
SCRIPT = ROOT / "ingles" / "intermediate-2" / "audio" / "unit-2" / "listening-scripts.md"
META = ROOT / "ingles" / "intermediate-2" / "audio" / "unit-2" / "the-call-before-midnight.elevenlabs.json"
IMAGE = ROOT / "assets" / "img" / "english-intermediate-2" / "unit-2" / "call-before-midnight-listening" / "call-before-midnight-listening-hero-v1.webp"

VOID = {"area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta", "param", "source", "track", "wbr"}


class Parser(HTMLParser):
    def __init__(self) -> None:
        super().__init__(convert_charrefs=True)
        self.stack: list[str] = []
        self.elements: list[tuple[str, dict[str, str]]] = []

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        data = {key: value or "" for key, value in attrs}
        self.elements.append((tag, data))
        if tag not in VOID:
            self.stack.append(tag)

    def handle_startendtag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        self.elements.append((tag, {key: value or "" for key, value in attrs}))

    def handle_endtag(self, tag: str) -> None:
        if tag in VOID:
            return
        assert self.stack, f"Unexpected closing tag </{tag}>"
        expected = self.stack.pop()
        assert expected == tag, f"Expected </{expected}> before </{tag}>"


def local_path(raw: str) -> Path | None:
    if not raw or raw.startswith(("#", "http:", "https:", "data:")):
        return None
    clean = unquote(raw.split("?", 1)[0].split("#", 1)[0])
    return ROOT / clean.lstrip("/") if clean.startswith("/") else PAGE.parent / clean


def main() -> None:
    text = PAGE.read_text(encoding="utf-8")
    parser = Parser()
    parser.feed(text)
    parser.close()
    assert not parser.stack, f"Unclosed tags: {parser.stack}"

    ids = [attrs["id"] for _, attrs in parser.elements if attrs.get("id")]
    assert len(ids) == len(set(ids)), "Duplicate HTML ids"
    for related_page in (PRACTICE, LIBRARY):
        related_parser = Parser()
        related_parser.feed(related_page.read_text(encoding="utf-8"))
        related_parser.close()
        assert not related_parser.stack, f"{related_page.name}: unclosed tags {related_parser.stack}"
        related_ids = [attrs["id"] for _, attrs in related_parser.elements if attrs.get("id")]
        assert len(related_ids) == len(set(related_ids)), f"{related_page.name}: duplicate HTML ids"
    for tag, attrs in parser.elements:
        for attribute in ("href", "src"):
            target = local_path(attrs.get(attribute, ""))
            if target is not None:
                assert target.exists(), f"Missing {tag} {attribute}: {attrs[attribute]}"

    assert text.count('class="ie2-reading-question"') == 10
    assert text.count("data-listen-pass=") == 3
    assert text.count("<audio ") == 1
    assert "speechSynthesis" not in text
    assert "Maya" not in text
    assert "Part 2 reading · Coming next" not in text
    assert 'href="./reading-unit-2-the-six-week-window.html"' in text
    assert text.index('class="ie2-listening-hero"') < text.index("data-course-search-panel") < text.index('id="listening-activity"')

    assert AUDIO.read_bytes()[:3] == b"ID3"
    assert AUDIO.stat().st_size > 1_200_000
    assert IMAGE.stat().st_size > 50_000
    script_text = SCRIPT.read_text(encoding="utf-8")
    assert "Salome:" in script_text and "Mr. Vega:" in script_text
    assert "The first sentence... it changes everything." in script_text
    metadata = json.loads(META.read_text(encoding="utf-8"))
    assert metadata["audioProvider"] == "elevenlabs"
    assert metadata["model"] == "eleven_v3"
    assert len(metadata["voices"]) == 2
    assert 80 <= metadata["durationSeconds"] <= 95

    catalog = json.loads(CATALOG.read_text(encoding="utf-8"))
    item = next(item for item in catalog["items"] if item["id"] == "unit-2-the-call-before-midnight")
    assert item["unit"] == 2 and item["order"] == 1 and item["type"] == "listening"
    assert item["teacherSubmission"] is True and item["gradebookProjected"] is False
    assert item["gradebookWeight"] is None and item["affectsAverage"] is False
    assert item["questionCount"] == 10 and len(item["speakers"]) == 2

    practice = PRACTICE.read_text(encoding="utf-8")
    library = LIBRARY.read_text(encoding="utf-8")
    practice_js = (ROOT / "assets" / "js" / "english-intermediate2-practice-lab.js").read_text(encoding="utf-8")
    library_js = (ROOT / "assets" / "js" / "english-intermediate2-listening-library.js").read_text(encoding="utf-8")
    assert 'id="unit2ActivityGrid"' in practice and 'id="unit2ActivityCount"' in practice
    assert 'id="unit2ListeningGrid"' in library and 'id="unit2ListeningCount"' in library
    assert 'Number(item.unit) === 1' not in practice_js
    assert 'Number(item.unit) === 1' not in library_js
    assert "units.forEach" in practice_js and "units.forEach" in library_js

    css = CSS.read_text(encoding="utf-8")
    assert ".ie2-midnight-listening-page .ie2-listening-hero" in css
    assert css.count("call-before-midnight-listening-hero-v1.webp") == 2
    assert "@media (max-width: 640px)" in css
    print("Intermediate English 2 Unit 2 listening checks passed.")


if __name__ == "__main__":
    main()
