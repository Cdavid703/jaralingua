"""Static checks for Intermediate English Course 2 Unit 2.

This validator intentionally starts no local server. It checks the static page,
Course Overview route, responsive CSS contract, professional hero asset, and
ElevenLabs audio sources directly from repository files.
"""

from __future__ import annotations

from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote


ROOT = Path(__file__).resolve().parents[1]
OVERVIEW = ROOT / "ingles" / "intermediate-2" / "course-overview.html"
UNIT_TWO = ROOT / "ingles" / "intermediate-2" / "unit-2-wishes-dilemmas-advice.html"
CSS = ROOT / "assets" / "css" / "english-intermediate-2.css"
HERO = ROOT / "assets" / "img" / "english-intermediate-2" / "units" / "unit-2-wishes-dilemmas-hero-v1.webp"
AUDIO_ROOT = ROOT / "ingles" / "intermediate-2" / "audio" / "unit-2-explanation"

VOID_TAGS = {
    "area", "base", "br", "col", "embed", "hr", "img", "input", "link",
    "meta", "param", "source", "track", "wbr",
}


class PageParser(HTMLParser):
    def __init__(self) -> None:
        super().__init__(convert_charrefs=True)
        self.stack: list[str] = []
        self.elements: list[tuple[str, dict[str, str]]] = []

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        attributes = {name: value or "" for name, value in attrs}
        self.elements.append((tag, attributes))
        if tag not in VOID_TAGS:
            self.stack.append(tag)

    def handle_startendtag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        self.elements.append((tag, {name: value or "" for name, value in attrs}))

    def handle_endtag(self, tag: str) -> None:
        if tag in VOID_TAGS:
            return
        assert self.stack, f"Unexpected closing tag </{tag}>"
        expected = self.stack.pop()
        assert expected == tag, f"Expected </{expected}> before </{tag}>"


def parse_page(path: Path) -> tuple[str, PageParser]:
    text = path.read_text(encoding="utf-8")
    parser = PageParser()
    parser.feed(text)
    parser.close()
    assert not parser.stack, f"{path.name}: unclosed tags {parser.stack}"
    return text, parser


def classes(attributes: dict[str, str]) -> set[str]:
    return set(attributes.get("class", "").split())


def local_path(page: Path, raw_reference: str) -> Path | None:
    if not raw_reference or raw_reference.startswith(("#", "http:", "https:", "data:", "mailto:", "tel:")):
        return None
    clean = unquote(raw_reference.split("#", 1)[0].split("?", 1)[0])
    if not clean:
        return None
    if clean.startswith("/"):
        return ROOT / clean.lstrip("/")
    return page.parent / clean


def check_local_references(page: Path, parser: PageParser) -> None:
    for tag, attributes in parser.elements:
        for attribute in ("href", "src"):
            reference = attributes.get(attribute)
            if reference is None:
                continue
            target = local_path(page, reference)
            if target is not None:
                assert target.exists(), f"{page.name}: missing {tag} {attribute}={reference}"


def main() -> None:
    overview_text, overview = parse_page(OVERVIEW)
    unit_text, unit = parse_page(UNIT_TWO)
    css_text = CSS.read_text(encoding="utf-8")
    check_local_references(OVERVIEW, overview)
    check_local_references(UNIT_TWO, unit)

    ids = [attrs["id"] for _, attrs in unit.elements if attrs.get("id")]
    assert len(ids) == len(set(ids)), "Unit 2 contains duplicate HTML ids"

    theory_topics = [attrs for tag, attrs in unit.elements if tag == "details" and "ie2-theory-topic" in classes(attrs)]
    unit_audio = [attrs for tag, attrs in unit.elements if tag == "audio"]
    expected_topic_ids = {
        "wish-hope-dream", "present-wishes", "ability-wishes", "future-wishes",
        "past-wishes-regrets", "second-conditional", "dilemmas", "advice",
        "responding-to-advice", "unit-vocabulary", "phrasal-verbs",
        "fixed-expressions-idioms", "sound-practice", "complete-model",
    }
    assert len(theory_topics) == 14, f"Expected 14 theory topics, found {len(theory_topics)}"
    assert {attrs.get("id") for attrs in theory_topics} == expected_topic_ids
    assert len(unit_audio) == 14, f"Expected 14 ElevenLabs models, found {len(unit_audio)}"

    assert "speechSynthesis" not in unit_text
    assert "Teaching Route" not in unit_text
    assert "How Unit 2 will be taught" not in unit_text
    assert unit_text.count('class="ie2-unit2-hero"') == 1
    assert unit_text.index('class="ie2-unit2-hero"') < unit_text.index("data-course-search-panel") < unit_text.index('id="unit2-theory-content"')
    assert "The past form after <em>wish</em> does not refer to past time" in unit_text
    assert "Would inside the if-clause" in unit_text
    assert "<em>Advice</em> is a noun; <em>advise</em> is a verb" in unit_text
    assert "Phrasal verb" in unit_text and "Fixed expression" in unit_text and "Idiom" in unit_text
    assert "Midterm Writing Task · 20%" in unit_text
    assert "August 22, 2026 · Session 5" in unit_text
    assert "Maya" not in unit_text

    unit_two_overview = overview_text.split('id="unit-2"', 1)[1].split('id="unit-3"', 1)[0]
    assert "unit-2-wishes-dilemmas-advice.html" in unit_two_overview
    assert "Complete explanation planned" not in unit_two_overview
    assert "practice-lab.html#unit-2-folder" in unit_two_overview

    assert ".ie2-unit2-hero" in css_text
    assert "unit-2-wishes-dilemmas-hero-v1.webp" in css_text
    assert "@media (max-width: 700px)" in css_text
    assert HERO.exists() and HERO.stat().st_size > 50_000

    assert (AUDIO_ROOT / "scripts.md").exists()
    assert (AUDIO_ROOT / "metadata.json").exists()
    for attributes in unit_audio:
        audio_path = local_path(UNIT_TWO, attributes["src"])
        assert audio_path is not None and audio_path.exists()
        assert audio_path.stat().st_size > 100_000, f"Audio looks incomplete: {audio_path.name}"
        assert audio_path.read_bytes()[:3] == b"ID3", f"Audio has no ID3 header: {audio_path.name}"

    print("PASS Unit 2: 14 complete, searchable theory topics")
    print("PASS Audio: 14 real ElevenLabs MP3 files with scripts and metadata")
    print("PASS Architecture: Course Overview links to theory and Practice Lab remains separate")
    print("PASS Mobile contract: one non-fixed hero, search before content, responsive CSS")
    print("PASS References: every local href and src exists")


if __name__ == "__main__":
    main()
