"""Audit French 8 audio against canonical scripts with ElevenLabs Scribe."""

from __future__ import annotations

import argparse
import json
import mimetypes
import os
from pathlib import Path
import re
import sys
import unicodedata
import urllib.request
import uuid


ROOT = Path(__file__).resolve().parents[1]
ENV_FILE = ROOT / "elevenlabs.local.env"
AUDIO_ROOT = ROOT / "frances" / "Niveau 8" / "audio"

LISTENING_SCRIPTS = {
    "france": AUDIO_ROOT / "french8-listenings-b2-france-scripts.md",
    "quebec": AUDIO_ROOT / "french8-listenings-b2-quebec-scripts.md",
}

PRONUNCIATION_SCRIPTS = [
    AUDIO_ROOT / "pronunciation-conditionnel-passe-script.md",
    AUDIO_ROOT / "pronunciation-hypotheses-passe-script.md",
    AUDIO_ROOT / "pronunciation-subjonctif-passe-script.md",
    AUDIO_ROOT / "pronunciation-discours-rapporte-script.md",
    AUDIO_ROOT / "pronunciation-medias-desinformation-script.md",
    AUDIO_ROOT / "pronunciation-ia-ethique-script.md",
    AUDIO_ROOT / "pronunciation-justice-sociale-script.md",
    AUDIO_ROOT / "pronunciation-francais-oral-script.md",
]


def load_local_env() -> None:
    if not ENV_FILE.exists():
        return
    for raw_line in ENV_FILE.read_text(encoding="utf-8-sig").splitlines():
        line = raw_line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, value = line.split("=", 1)
        os.environ.setdefault(key.strip(), value.strip().strip('"').strip("'"))


def repair_mojibake(text: str) -> str:
    if "Ã" not in text and "â" not in text:
        return text
    try:
        repaired = text.encode("latin-1").decode("utf-8")
    except UnicodeError:
        return text
    return repaired if repaired.count("�") <= text.count("�") else text


def read_text(path: Path) -> str:
    return repair_mojibake(path.read_text(encoding="utf-8-sig"))


def multipart_body(audio: bytes, content_type: str) -> tuple[bytes, str]:
    boundary = f"----JaraLinguaAudit{uuid.uuid4().hex}"
    chunks: list[bytes] = []

    def add_field(name: str, value: str) -> None:
        chunks.extend(
            [
                f"--{boundary}\r\n".encode(),
                f'Content-Disposition: form-data; name="{name}"\r\n\r\n'.encode(),
                value.encode("utf-8"),
                b"\r\n",
            ]
        )

    add_field("model_id", "scribe_v2")
    add_field("language_code", "fr")
    add_field("tag_audio_events", "false")
    add_field("diarize", "false")
    add_field("num_speakers", "1")
    add_field("timestamps_granularity", "word")
    chunks.extend(
        [
            f"--{boundary}\r\n".encode(),
            b'Content-Disposition: form-data; name="file"; filename="audit.mp3"\r\n',
            f"Content-Type: {content_type}\r\n\r\n".encode(),
            audio,
            b"\r\n",
            f"--{boundary}--\r\n".encode(),
        ]
    )
    return b"".join(chunks), boundary


def transcribe(audio_path: Path, api_key: str) -> str:
    content_type = mimetypes.guess_type(audio_path.name)[0] or "audio/mpeg"
    body, boundary = multipart_body(audio_path.read_bytes(), content_type)
    request = urllib.request.Request(
        "https://api.elevenlabs.io/v1/speech-to-text",
        data=body,
        method="POST",
        headers={
            "xi-api-key": api_key,
            "Content-Type": f"multipart/form-data; boundary={boundary}",
            "Accept": "application/json",
            "User-Agent": "JaraLingua-STT-Audit/1.0",
        },
    )
    with urllib.request.urlopen(request, timeout=180) as response:
        payload = json.loads(response.read().decode("utf-8"))
    return str(payload.get("text", "")).strip()


def text_after_file(markdown: str, rel_audio: str) -> str:
    marker = f"File: `{rel_audio}`"
    start = markdown.find(marker)
    if start == -1:
        raise ValueError(f"No script block found for {rel_audio}")
    block = markdown[start + len(marker) :]
    next_heading = re.search(r"\n##\s+", block)
    if next_heading:
        block = block[: next_heading.start()]
    return " ".join(line.strip() for line in block.splitlines() if line.strip() and not line.strip().startswith("File:"))


def listening_targets(themes: set[int]) -> list[dict]:
    targets = []
    for accent, path in LISTENING_SCRIPTS.items():
        markdown = read_text(path)
        for match in re.finditer(r"^File: `(?P<rel>complete/n8-(?P<theme>\d{2})(?P<letter>[abc])-[^`]+\.mp3)`", markdown, flags=re.M):
            theme = int(match.group("theme"))
            if theme not in themes:
                continue
            rel = match.group("rel")
            targets.append(
                {
                    "id": f"{theme:02d}{match.group('letter').upper()} {accent.capitalize()}",
                    "kind": "listening",
                    "theme": theme,
                    "script": path,
                    "audio": AUDIO_ROOT / rel,
                    "expected": text_after_file(markdown, rel),
                }
            )
    return sorted(targets, key=lambda item: (item["theme"], item["id"]))


def pronunciation_targets(themes: set[int]) -> list[dict]:
    targets = []
    for path in PRONUNCIATION_SCRIPTS:
        if not path.exists():
            continue
        markdown = read_text(path)
        for match in re.finditer(r"^File: `(?P<rel>pronunciation/(?:(?:theme-(?P<theme_dir>\d{2})/)|)(?P<name>[^`]+\.mp3))`", markdown, flags=re.M):
            rel = match.group("rel")
            theme_match = match.group("theme_dir") or re.search(r"n8-(?P<theme>\d{2})d-", match.group("name")).group("theme")
            theme = int(theme_match)
            if theme not in themes:
                continue
            suffix = "final" if "modele" in match.group("name") else Path(match.group("name")).stem
            targets.append(
                {
                    "id": f"{theme:02d}D France {suffix}",
                    "kind": "pronunciation",
                    "theme": theme,
                    "script": path,
                    "audio": AUDIO_ROOT / rel,
                    "expected": text_after_file(markdown, rel),
                }
            )
    return sorted(targets, key=lambda item: (item["theme"], item["audio"].as_posix()))


def strip_speaker_labels(text: str) -> str:
    return re.sub(
        r"(^|[.!?]\s+|\n)([A-ZÀ-ÖØ-Ý][A-Za-zÀ-ÖØ-öø-ÿ'-]+(?:\s+[A-ZÀ-ÖØ-Ý][A-Za-zÀ-ÖØ-öø-ÿ'-]+){0,2}):\s+",
        r"\1",
        text,
    )


def normalize_numbers(text: str) -> str:
    replacements = {
        r"\b30\s*%": "trente pour cent",
        r"\b32\s*%": "trente deux pour cent",
        r"\b40\s*%": "quarante pour cent",
        r"\b45\s*%": "quarante cinq pour cent",
        r"\b50\s*%": "cinquante pour cent",
        r"\b150\b": "cent cinquante",
        r"\b1815\b": "mille huit cent quinze",
        r"\b1940\b": "mille neuf cent quarante",
        r"\b2010\b": "deux mille dix",
        r"\b2022\b": "deux mille vingt deux",
        r"\b2035\b": "deux mille trente cinq",
        r"\ba\s*320\b": "a trois cent vingt",
        r"\b5\s*000\b": "cinq mille",
    }
    for pattern, replacement in replacements.items():
        text = re.sub(pattern, replacement, text)
    return text


def normalize(text: str) -> list[str]:
    text = repair_mojibake(strip_speaker_labels(text))
    text = normalize_numbers(text)
    text = text.replace("’", "'").replace("—", " ")
    text = re.sub(r"\bj[’']sais\b", "jesais", text, flags=re.I)
    text = re.sub(r"\bje\s+sais\b", "jesais", text, flags=re.I)
    text = re.sub(r"\bchais\b", "jesais", text, flags=re.I)
    text = re.sub(r"\bil\s+y\s+a\b", "ya", text, flags=re.I)
    text = re.sub(r"\by\s+a\b", "ya", text, flags=re.I)
    text = re.sub(r"\by[’']a\b", "ya", text, flags=re.I)
    text = re.sub(r"\bt[’']as\b", "tuas", text, flags=re.I)
    text = re.sub(r"\btu\s+as\b", "tuas", text, flags=re.I)
    text = re.sub(r"\bj[’']te\b", "jete", text, flags=re.I)
    text = re.sub(r"\bje\s+te\b", "jete", text, flags=re.I)
    text = unicodedata.normalize("NFD", text)
    text = "".join(ch for ch in text if unicodedata.category(ch) != "Mn")
    text = text.lower()
    text = text.replace("quoi que", "quoique")
    text = text.replace("auteure", "auteur")
    text = re.sub(r"[^a-z0-9']+", " ", text)
    return [token.strip("'") for token in text.split() if token.strip("'")]


def levenshtein_rows(expected: list[str], actual: list[str]) -> list[list[int]]:
    rows = [[0] * (len(actual) + 1) for _ in range(len(expected) + 1)]
    for i in range(len(expected) + 1):
        rows[i][0] = i
    for j in range(len(actual) + 1):
        rows[0][j] = j
    for i, exp in enumerate(expected, start=1):
        for j, got in enumerate(actual, start=1):
            cost = 0 if exp == got else 1
            rows[i][j] = min(rows[i - 1][j] + 1, rows[i][j - 1] + 1, rows[i - 1][j - 1] + cost)
    return rows


def backtrace(expected: list[str], actual: list[str], rows: list[list[int]]) -> list[tuple[str, str, str]]:
    i, j = len(expected), len(actual)
    ops: list[tuple[str, str, str]] = []
    while i or j:
        if i and j and rows[i][j] == rows[i - 1][j - 1] + (0 if expected[i - 1] == actual[j - 1] else 1):
            op = "ok" if expected[i - 1] == actual[j - 1] else "sub"
            ops.append((op, expected[i - 1], actual[j - 1]))
            i -= 1
            j -= 1
        elif i and rows[i][j] == rows[i - 1][j] + 1:
            ops.append(("del", expected[i - 1], ""))
            i -= 1
        else:
            ops.append(("ins", "", actual[j - 1]))
            j -= 1
    ops.reverse()
    return ops


def compare(expected_text: str, actual_text: str) -> dict:
    expected = normalize(expected_text)
    actual = normalize(actual_text)
    rows = levenshtein_rows(expected, actual)
    distance = rows[-1][-1]
    denominator = max(len(expected), len(actual), 1)
    similarity = 100 * (1 - distance / denominator)
    diffs = [op for op in backtrace(expected, actual, rows) if op[0] != "ok"]
    return {
        "expected_words": len(expected),
        "actual_words": len(actual),
        "distance": distance,
        "similarity": round(similarity, 2),
        "diffs": diffs[:25],
    }


def parse_themes(value: str) -> set[int]:
    themes: set[int] = set()
    for part in value.split(","):
        part = part.strip()
        if "-" in part:
            start, end = part.split("-", 1)
            themes.update(range(int(start), int(end) + 1))
        elif part:
            themes.add(int(part))
    return themes


def load_previous(path: Path | None) -> dict[str, dict]:
    if not path or not path.exists():
        return {}
    try:
        data = json.loads(path.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError):
        return {}
    return {item["audio"]: item for item in data if item.get("transcription")}


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--themes", default="1-6", help="Theme list/range, e.g. 1-6 or 2,4,6.")
    parser.add_argument("--write-json", type=Path, help="Path for JSON report.")
    parser.add_argument("--no-listening", action="store_true")
    parser.add_argument("--no-pronunciation", action="store_true")
    parser.add_argument("--resume", action="store_true", help="Reuse transcriptions from --write-json when available.")
    args = parser.parse_args()

    load_local_env()
    api_key = os.environ.get("ELEVENLABS_API_KEY", "").strip()
    if not api_key:
        print("ELEVENLABS_API_KEY is not configured.", file=sys.stderr)
        return 2

    themes = parse_themes(args.themes)
    targets = []
    if not args.no_listening:
        targets.extend(listening_targets(themes))
    if not args.no_pronunciation:
        targets.extend(pronunciation_targets(themes))

    previous = load_previous(args.write_json) if args.resume else {}
    results = []
    for index, target in enumerate(targets, start=1):
        rel_audio = str(target["audio"].relative_to(ROOT))
        print(f"[{index}/{len(targets)}] Auditing {target['id']}...", flush=True)
        if rel_audio in previous:
            actual = previous[rel_audio]["transcription"]
            print("  using cached transcription", flush=True)
        else:
            actual = transcribe(target["audio"], api_key)
        comparison = compare(target["expected"], actual)
        result = {
            "id": target["id"],
            "kind": target["kind"],
            "theme": target["theme"],
            "audio": rel_audio,
            "script": str(target["script"].relative_to(ROOT)),
            "transcription": actual,
            **comparison,
        }
        results.append(result)
        print(
            f"  {result['similarity']}% "
            f"({result['actual_words']}/{result['expected_words']} words, distance {result['distance']})",
            flush=True,
        )
        if result["diffs"]:
            preview = "; ".join(f"{op}:{exp}->{got}" for op, exp, got in result["diffs"][:8])
            print(f"  diffs: {preview}", flush=True)
        if args.write_json:
            args.write_json.parent.mkdir(parents=True, exist_ok=True)
            args.write_json.write_text(json.dumps(results, ensure_ascii=False, indent=2), encoding="utf-8")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
