"""Static checks for Intermediate English Course 2 Unit 2 Reading Part 2.

No local server is started by this validator.
"""

from __future__ import annotations

import json
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote


ROOT = Path(__file__).resolve().parents[1]
PAGE = ROOT / "ingles" / "intermediate-2" / "reading-unit-2-the-six-week-window.html"
LISTENING = ROOT / "ingles" / "intermediate-2" / "listening-unit-2-the-call-before-midnight.html"
PRACTICE = ROOT / "ingles" / "intermediate-2" / "practice-lab.html"
CATALOG = ROOT / "assets" / "data" / "english-intermediate-2-content.json"
CSS = ROOT / "assets" / "css" / "english-intermediate-2.css"
IMAGE = ROOT / "assets" / "img" / "english-intermediate-2" / "unit-2" / "answer-before-midnight-reading" / "answer-before-midnight-reading-hero-v1.webp"
SCRIPT = ROOT / "assets" / "js" / "intermediate2-reading-six-week-window.js"

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

    for tag, attrs in parser.elements:
        for attribute in ("href", "src"):
            target = local_path(attrs.get(attribute, ""))
            if target is not None:
                assert target.exists(), f"Missing {tag} {attribute}: {attrs[attribute]}"

    assert text.count("ie2-chapter-number") == 5
    assert text.count('class="ie2-reading-question"') == 10
    assert text.count("data-reading-prediction=") == 3
    assert text.count("ie2-reading-pause") == 5
    assert text.count("ie2-language-detective") == 1
    assert "The first sentence" in text and "six weeks" in text
    assert "The story ends here" in text
    assert "Maya" not in text
    assert "speechSynthesis" not in text
    assert "<textarea" not in text
    assert "localStorage" not in text
    assert "Save draft" not in text and "Copy response" not in text
    assert "teacher" not in text.lower()
    assert text.index('class="ie2-reading-hero"') < text.index("data-course-search-panel") < text.index('id="reading-activity"')

    image_bytes = IMAGE.read_bytes()
    assert image_bytes[:4] == b"RIFF" and image_bytes[8:12] == b"WEBP"
    assert IMAGE.stat().st_size > 60_000

    script = SCRIPT.read_text(encoding="utf-8")
    assert "checkSixWeekReading" in script
    assert "Answer all 10 questions" in script
    assert "localStorage" not in script and "textarea" not in script

    catalog = json.loads(CATALOG.read_text(encoding="utf-8"))
    item = next(item for item in catalog["items"] if item["id"] == "unit-2-the-six-week-window-reading")
    assert item["unit"] == 2 and item["order"] == 2 and item["type"] == "reading"
    assert item["questionCount"] == 10 and item["chapterCount"] == 5
    assert item["writtenResponse"] is False and item["teacherSubmission"] is False
    assert item["gradebookWeight"] == 0

    listening = LISTENING.read_text(encoding="utf-8")
    practice = PRACTICE.read_text(encoding="utf-8")
    assert 'href="./reading-unit-2-the-six-week-window.html"' in listening
    assert "Part 2 reading · Coming next" not in listening
    assert 'id="unit2ActivityCount">2 activities' in practice
    assert "Reading · live" in practice
    assert 'id="labActivityTotal">7' in practice

    css = CSS.read_text(encoding="utf-8")
    assert ".ie2-midnight-reading-page .ie2-reading-hero" in css
    assert css.count("answer-before-midnight-reading-hero-v1.webp") == 2
    print("Intermediate English 2 Unit 2 reading checks passed.")


if __name__ == "__main__":
    main()
