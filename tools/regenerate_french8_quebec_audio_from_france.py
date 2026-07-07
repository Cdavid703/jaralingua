"""Regenerate French 8 Quebec listening audio from the France scripts.

Policy enforced by this script:
- France is the canonical script and question set.
- Quebec uses the same script and the same questions.
- Only the voice/accent changes.
- Quebec audio is generated with the two validated Quebec voices selected by
  the course owner after human listening.
"""

from __future__ import annotations

import argparse
import json
import os
from pathlib import Path
import re
import time
import urllib.error
import urllib.request


ROOT = Path(__file__).resolve().parents[1]
ENV_FILE = ROOT / "elevenlabs.local.env"
AUDIO_DIR = ROOT / "frances" / "Niveau 8" / "audio"
COMPLETE_DIR = AUDIO_DIR / "complete"
ATELIERS_DIR = ROOT / "frances" / "Niveau 8" / "ateliers"
LISTENING_DATA_JS = ROOT / "assets" / "js" / "french8-listening-activity-data.js"

FRANCE_SCRIPT = AUDIO_DIR / "french8-listenings-b2-france-scripts.md"
QUEBEC_SCRIPT = AUDIO_DIR / "french8-listenings-b2-quebec-scripts.md"
FRANCE_09_SCRIPT = AUDIO_DIR / "french8-theme09-synthese-b2-france-script.md"
QUEBEC_09_SCRIPT = AUDIO_DIR / "french8-theme09-synthese-b2-quebec-script.md"

# Human-approved voices for the Quebec variant.
QUEBEC_FEMALE_VOICE_ID = "UJCi4DDncuo0VJDSIegj"  # JaraLingua QC Amelie
QUEBEC_MALE_VOICE_ID = "j9RedbMRSNQ74PyikQwD"  # JaraLingua QC Louis

VOICE_SETTINGS = {
    "stability": 0.28,
    "similarity_boost": 0.98,
    "style": 0.85,
    "use_speaker_boost": True,
}

CACHE_TAG = "20260707-qc-canonical"


def load_env() -> None:
    if not ENV_FILE.exists():
        return
    for raw in ENV_FILE.read_text(encoding="utf-8-sig").splitlines():
        line = raw.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, value = line.split("=", 1)
        os.environ.setdefault(key.strip(), value.strip().strip('"').strip("'"))


def read_text(path: Path) -> str:
    return path.read_text(encoding="utf-8-sig")


def write_text(path: Path, text: str) -> None:
    path.write_text(text, encoding="utf-8", newline="\n")


def parse_sections(path: Path) -> list[dict[str, str]]:
    text = read_text(path)
    pattern = re.compile(
        r"^## Audio (?P<id>\d{2}[a-c]?) - (?P<title>.+?) \((?P<accent>France|Québec)\)\n\n"
        r"File: `(?P<file>complete/[^`]+)`\n\n"
        r"(?P<body>.*?)(?=\n\n## Audio |\Z)",
        re.S | re.M,
    )
    sections = []
    for match in pattern.finditer(text):
        sections.append(match.groupdict())
    if not sections:
        raise RuntimeError(f"No audio sections found in {path}")
    return sections


def quebec_file(france_file: str) -> str:
    return france_file.replace("-france-b2.mp3", "-quebec-b2.mp3")


def build_quebec_markdown(france_path: Path, title: str) -> str:
    parts = [title.rstrip(), ""]
    for section in parse_sections(france_path):
        parts.append(f"## Audio {section['id']} - {section['title']} (Québec)")
        parts.append("")
        parts.append(f"File: `{quebec_file(section['file'])}`")
        parts.append("")
        parts.append(section["body"].strip())
        parts.append("")
        parts.append("")
    return "\n".join(parts).rstrip() + "\n"


def turn_lines(body: str) -> list[tuple[str, str]]:
    turns: list[tuple[str, str]] = []
    for raw in body.splitlines():
        line = raw.strip()
        if not line:
            continue
        match = re.match(r"([^:]{1,50}):\s*(.+)", line)
        if not match:
            raise RuntimeError(f"Cannot parse dialogue line: {line}")
        turns.append((match.group(1).strip(), match.group(2).strip()))
    return turns


def speaker_voice_map(turns: list[tuple[str, str]]) -> dict[str, str]:
    speakers: list[str] = []
    for speaker, _ in turns:
        if speaker not in speakers:
            speakers.append(speaker)
    return {
        speaker: QUEBEC_FEMALE_VOICE_ID if index % 2 == 0 else QUEBEC_MALE_VOICE_ID
        for index, speaker in enumerate(speakers)
    }


def request_tts(text: str, voice_id: str, api_key: str) -> bytes:
    body = {
        "text": text,
        "model_id": "eleven_multilingual_v2",
        "language_code": "fr",
        "voice_settings": VOICE_SETTINGS,
    }
    request = urllib.request.Request(
        f"https://api.elevenlabs.io/v1/text-to-speech/{voice_id}?output_format=mp3_44100_128",
        data=json.dumps(body, ensure_ascii=False).encode("utf-8"),
        method="POST",
        headers={
            "xi-api-key": api_key,
            "Content-Type": "application/json",
            "Accept": "audio/mpeg",
            "User-Agent": "JaraLingua-French8-Quebec-Regenerator/1.0",
        },
    )
    with urllib.request.urlopen(request, timeout=180) as response:
        return response.read()


def generate_audio(section: dict[str, str], api_key: str, dry_run: bool = False) -> Path:
    turns = turn_lines(section["body"])
    voices = speaker_voice_map(turns)
    output = AUDIO_DIR / quebec_file(section["file"])
    print(f"{section['id']} -> {output.relative_to(ROOT)}")
    print("  voices: " + ", ".join(f"{speaker}={voice}" for speaker, voice in voices.items()))
    if dry_run:
        return output
    chunks = []
    for index, (speaker, text) in enumerate(turns, start=1):
        audio = request_tts(text, voices[speaker], api_key)
        chunks.append(audio)
        print(f"  {index:02d}. {speaker}: {len(audio)} bytes")
        time.sleep(0.15)
    output.write_bytes(b"".join(chunks))
    print(f"  wrote {output.stat().st_size} bytes")
    return output


def replace_block(text: str, name: str) -> str:
    marker = f"window.{name} = "
    start = text.index(marker)
    brace_start = text.index("{", start)
    depth = 0
    for index in range(brace_start, len(text)):
        char = text[index]
        if char == "{":
            depth += 1
        elif char == "}":
            depth -= 1
            if depth == 0:
                end = text.index(";", index) + 1
                return text[:start] + f"window.{name} = {{}};" + text[end:]
    raise RuntimeError(f"Could not replace {name}")


def remove_quebec_overrides() -> None:
    text = read_text(LISTENING_DATA_JS)
    text = replace_block(text, "FRENCH8_LISTENING_QUEBEC_TRANSCRIPTS")
    text = replace_block(text, "FRENCH8_LISTENING_QUEBEC_QUESTIONS")
    write_text(LISTENING_DATA_JS, text)


def update_html_defaults() -> int:
    count = 0
    for path in sorted(ATELIERS_DIR.glob("comprehension-orale-*.html")):
        text = read_text(path)
        if "data-audio-variant" not in text:
            continue
        updated = text
        updated = updated.replace(
            'class="audio-variant-button" data-audio-variant="france"',
            'class="audio-variant-button is-active" data-audio-variant="france"',
        )
        updated = updated.replace(
            'class="audio-variant-button is-active" data-audio-variant="quebec"',
            'class="audio-variant-button" data-audio-variant="quebec"',
        )
        updated = re.sub(
            r'src="(\.\./audio/complete/n8-[^"]+?)-quebec-b2\.mp3(?:\?[^"]*)?"',
            rf'src="\1-france-b2.mp3?v={CACHE_TAG}"',
            updated,
        )
        updated = re.sub(
            r'"file":"(\.\./audio/complete/n8-[^"]+?)-quebec-b2\.mp3(?:\?[^"]*)?"',
            rf'"file":"\1-france-b2.mp3?v={CACHE_TAG}"',
            updated,
        )
        updated = re.sub(
            r"french8-listening-activity-data\.js\?v=[^\"']+",
            f"french8-listening-activity-data.js?v={CACHE_TAG}",
            updated,
        )
        updated = re.sub(
            r"french8-listening-activity\.js\?v=[^\"']+",
            f"french8-listening-activity.js?v={CACHE_TAG}",
            updated,
        )
        if updated != text:
            write_text(path, updated)
            count += 1
    return count


def selected_sections(only: str | None) -> list[dict[str, str]]:
    sections = parse_sections(FRANCE_SCRIPT) + parse_sections(FRANCE_09_SCRIPT)
    if not only:
        return sections
    tokens = {part.strip().lower() for part in only.split(",") if part.strip()}
    return [
        section
        for section in sections
        if section["id"].lower() in tokens
        or section["file"].lower() in tokens
        or any(token in section["file"].lower() for token in tokens)
    ]


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--only", help="Comma-separated ids or filename fragments, e.g. 01a,09a.")
    parser.add_argument("--dry-run", action="store_true")
    parser.add_argument("--no-generate", action="store_true")
    parser.add_argument("--metadata-only", action="store_true", help="Only rewrite scripts/pages/JS; do not generate audio.")
    args = parser.parse_args()

    if not args.no_generate and not args.metadata_only:
        load_env()
        api_key = os.environ.get("ELEVENLABS_API_KEY", "").strip()
        if not api_key:
            raise RuntimeError("ELEVENLABS_API_KEY is not configured.")
        for section in selected_sections(args.only):
            try:
                generate_audio(section, api_key, dry_run=args.dry_run)
            except urllib.error.HTTPError as error:
                detail = error.read().decode("utf-8", errors="replace")
                raise RuntimeError(f"ElevenLabs HTTP {error.code}: {detail}") from error

    if not args.dry_run:
        print("Updating Quebec markdown from France canonical scripts...")
        write_text(QUEBEC_SCRIPT, build_quebec_markdown(FRANCE_SCRIPT, "# Français Niveau 8 — Compréhensions orales B2 (Accent Québec)"))
        write_text(QUEBEC_09_SCRIPT, build_quebec_markdown(FRANCE_09_SCRIPT, "# Français Niveau 8 — Thème 09 Synthèse grammaticale B2 (Québec)"))

        print("Removing separate Quebec questions/transcript overrides...")
        remove_quebec_overrides()

        changed_pages = update_html_defaults()
        print(f"Updated {changed_pages} listening pages to default France.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
