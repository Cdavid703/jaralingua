"""Audit French 8 theme 07 audio against canonical scripts with ElevenLabs Scribe."""

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


TARGETS = [
    {
        "id": "07A France",
        "script": AUDIO_ROOT / "french8-listenings-b2-france-scripts.md",
        "audio": AUDIO_ROOT / "complete" / "n8-07a-egalite-chances-france-b2.mp3",
    },
    {
        "id": "07A Quebec",
        "script": AUDIO_ROOT / "french8-listenings-b2-quebec-scripts.md",
        "audio": AUDIO_ROOT / "complete" / "n8-07a-egalite-chances-quebec-b2.mp3",
    },
    {
        "id": "07B France",
        "script": AUDIO_ROOT / "french8-listenings-b2-france-scripts.md",
        "audio": AUDIO_ROOT / "complete" / "n8-07b-engagement-citoyen-france-b2.mp3",
    },
    {
        "id": "07B Quebec",
        "script": AUDIO_ROOT / "french8-listenings-b2-quebec-scripts.md",
        "audio": AUDIO_ROOT / "complete" / "n8-07b-engagement-citoyen-quebec-b2.mp3",
    },
    {
        "id": "07C France",
        "script": AUDIO_ROOT / "french8-listenings-b2-france-scripts.md",
        "audio": AUDIO_ROOT / "complete" / "n8-07c-discrimination-embauche-france-b2.mp3",
    },
    {
        "id": "07C Quebec",
        "script": AUDIO_ROOT / "french8-listenings-b2-quebec-scripts.md",
        "audio": AUDIO_ROOT / "complete" / "n8-07c-discrimination-embauche-quebec-b2.mp3",
    },
    {
        "id": "07D France final",
        "script": AUDIO_ROOT / "pronunciation-justice-sociale-script.md",
        "audio": AUDIO_ROOT / "pronunciation" / "theme-07" / "n8-07d-justice-sociale-modele-france.mp3",
    },
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


def script_for_audio(markdown_path: Path, audio_path: Path) -> str:
    markdown = markdown_path.read_text(encoding="utf-8-sig")
    rel = audio_path.relative_to(AUDIO_ROOT).as_posix()
    marker = f"File: `{rel}`"
    start = markdown.find(marker)
    if start == -1:
        raise ValueError(f"No script block found for {rel} in {markdown_path}")
    block = markdown[start + len(marker) :]
    next_heading = re.search(r"\n##\s+", block)
    if next_heading:
        block = block[: next_heading.start()]
    lines = [line.strip() for line in block.splitlines() if line.strip()]
    text_lines = []
    for line in lines:
        if line.startswith("File:"):
            continue
        text_lines.append(line)
    return " ".join(text_lines)


def strip_speaker_labels(text: str) -> str:
    return re.sub(r"(?m)(^|\s)[A-ZÀ-ÖØ-Ý][\wÀ-ÖØ-öø-ÿ' -]{0,40}:\s+", " ", text)


def normalize(text: str) -> list[str]:
    text = strip_speaker_labels(text)
    text = text.replace("’", "'").replace("—", " ")
    text = unicodedata.normalize("NFD", text)
    text = "".join(ch for ch in text if unicodedata.category(ch) != "Mn")
    text = text.lower()
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
    ops = backtrace(expected, actual, rows)
    diffs = [op for op in ops if op[0] != "ok"]
    return {
        "expected_words": len(expected),
        "actual_words": len(actual),
        "distance": distance,
        "similarity": round(similarity, 2),
        "diffs": diffs[:20],
    }


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--write-json", type=Path, help="Optional path for full JSON report.")
    args = parser.parse_args()

    load_local_env()
    api_key = os.environ.get("ELEVENLABS_API_KEY", "").strip()
    if not api_key:
        print("ELEVENLABS_API_KEY is not configured.", file=sys.stderr)
        return 2

    results = []
    for target in TARGETS:
        print(f"Auditing {target['id']}...", flush=True)
        expected = script_for_audio(target["script"], target["audio"])
        actual = transcribe(target["audio"], api_key)
        comparison = compare(expected, actual)
        result = {
            "id": target["id"],
            "audio": str(target["audio"].relative_to(ROOT)),
            "script": str(target["script"].relative_to(ROOT)),
            "transcription": actual,
            **comparison,
        }
        results.append(result)
        print(
            f"{result['id']}: {result['similarity']}% "
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
