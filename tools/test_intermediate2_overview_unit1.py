"""Static checks for Intermediate English Course 2 Course Overview and Unit 1.

This validator intentionally does not start a local web server. It checks the
published static architecture, local references, HTML tag balance, and the
ElevenLabs audio contract directly from repository files.
"""

from __future__ import annotations

from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote


ROOT = Path(__file__).resolve().parents[1]
OVERVIEW = ROOT / "ingles" / "intermediate-2" / "course-overview.html"
UNIT_ONE = ROOT / "ingles" / "intermediate-2" / "unit-1-relationships-meeting-people.html"
AUDIO_ROOT = ROOT / "ingles" / "intermediate-2" / "audio" / "unit-1-explanation"

VOID_TAGS = {
    "area",
    "base",
    "br",
    "col",
    "embed",
    "hr",
    "img",
    "input",
    "link",
    "meta",
    "param",
    "source",
    "track",
    "wbr",
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
        attributes = {name: value or "" for name, value in attrs}
        self.elements.append((tag, attributes))

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
    unit_text, unit = parse_page(UNIT_ONE)
    overview_search_text = " ".join(overview_text.split())
    unit_search_text = " ".join(unit_text.split())
    check_local_references(OVERVIEW, overview)
    check_local_references(UNIT_ONE, unit)

    overview_units = [attrs for tag, attrs in overview.elements if tag == "details" and "ie2-overview-unit" in classes(attrs)]
    theory_topics = [attrs for tag, attrs in unit.elements if tag == "details" and "ie2-theory-topic" in classes(attrs)]
    unit_audio = [attrs for tag, attrs in unit.elements if tag == "audio"]
    overview_unit_images = [attrs for tag, attrs in overview.elements if tag == "img" and "english-intermediate-2/units/" in attrs.get("src", "")]

    assert len(overview_units) == 6, f"Expected 6 Course Overview units, found {len(overview_units)}"
    assert len(overview_unit_images) == 6, f"Expected 6 unit images, found {len(overview_unit_images)}"
    assert len(theory_topics) == 9, f"Expected 9 Unit 1 theory topics, found {len(theory_topics)}"
    assert len(unit_audio) == 9, f"Expected 9 ElevenLabs audio models, found {len(unit_audio)}"

    expected_topic_ids = {
        "relative-clauses",
        "social-circle",
        "tactful-descriptions",
        "dating-meeting",
        "phrasal-verbs",
        "fixed-expressions",
        "idioms",
        "sound-practice",
        "complete-model",
    }
    assert {attrs.get("id") for attrs in theory_topics} == expected_topic_ids

    assert "speechSynthesis" not in overview_search_text + unit_search_text
    assert "Teaching Route" not in overview_search_text + unit_search_text
    assert "How Unit 1 will be taught" not in overview_search_text + unit_search_text
    assert "fixed / multiword expressions" in unit_search_text
    assert "Classification: idioms" in unit_search_text
    assert "do not describe different kinds of actions" in unit_search_text
    assert "Use <strong>who</strong>, never <strong>that</strong>" in unit_search_text

    individual_activity_fragments = (
        "speaking-secret-social-circle",
        "reading-unit-1-saturday-table",
        "listening-unit-1-noras-voice-note",
        "pronunciation-unit-1-people-who-changed-my-circle",
        "conversation-coach-unit-1-coffee-with-gabriel",
    )
    assert not any(fragment in overview_search_text for fragment in individual_activity_fragments)

    assert (AUDIO_ROOT / "scripts.md").exists()
    assert (AUDIO_ROOT / "metadata.json").exists()
    for attributes in unit_audio:
        audio_path = local_path(UNIT_ONE, attributes["src"])
        assert audio_path is not None and audio_path.exists()
        assert audio_path.stat().st_size > 100_000, f"Audio looks incomplete: {audio_path.name}"
        assert audio_path.read_bytes()[:3] == b"ID3", f"Audio has no ID3 header: {audio_path.name}"

    print("PASS Course Overview: 6 expandable units and 6 professional images")
    print("PASS Unit 1: 9 complete theory topics and corrected expression labels")
    print("PASS Audio: 9 real ElevenLabs MP3 references with local metadata")
    print("PASS Architecture: no individual Practice Lab activities in Course Overview")
    print("PASS References: every local href and src exists")


if __name__ == "__main__":
    main()
