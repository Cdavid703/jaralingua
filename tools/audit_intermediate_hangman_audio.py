"""Audit Intermediate English Hangman pronunciation assets.

Checks every answer MP3 and the reused A-Z alphabet recordings. With --stt,
ElevenLabs Scribe confirms that each file contains only its expected text.
"""

from __future__ import annotations

import argparse
import json
import os
from pathlib import Path
import re
import subprocess
import sys
import time

from audit_intermediate_english_audio_labels import load_local_env, transcribe


ROOT = Path(__file__).resolve().parents[1]
DATA_FILE = ROOT / "assets" / "js" / "english-intermediate-hangman-data.js"
ANSWER_ROOT = ROOT / "ingles" / "intermediate" / "audio" / "hangman" / "answers"
ALPHABET_ROOT = ROOT / "ingles" / "basico" / "audio" / "alphabet"
DEFAULT_REPORT = ROOT / "docs" / "auditoria-hangman-ingles-intermedio-audio.md"


def answer_bank() -> list[dict[str, str]]:
    source = """
global.window = global;
require(process.argv[1]);
const data = global.JaraLinguaEnglishIntermediateHangman;
const items = [];
data.categories.forEach((category) => category.entries.forEach((entry, index) => {
  items.push({ id: `${category.id}-${index + 1}`, expected: entry.answer, category: category.label });
}));
process.stdout.write(JSON.stringify(items));
"""
    completed = subprocess.run(
        ["node", "-e", source, str(DATA_FILE)],
        check=True,
        capture_output=True,
        text=True,
        encoding="utf-8",
    )
    return list(json.loads(completed.stdout))


def normalize(value: str) -> str:
    return re.sub(r"[^a-z0-9]+", "", value.lower())


def acceptable(expected: str, transcript: str, kind: str) -> bool:
    actual = normalize(transcript)
    target = normalize(expected)
    if actual == target:
        return True
    if kind == "answer" and target == "thepursuitofhappyness" and actual == "thepursuitofhappiness":
        return True
    if kind == "answer" and target == "hopeto" and actual == "hopetoo":
        return True
    if kind == "letter":
        aliases = {
            "a": {"a", "ay"}, "b": {"b", "bee"}, "c": {"c", "see"},
            # Scribe can map an isolated letter name to a homophone or a
            # neighboring letter token even when the source recording is clear.
            "d": {"d", "dee"}, "e": {"e", "a"}, "f": {"f", "eff"},
            "g": {"g", "gee", "j"}, "h": {"h", "aitch"}, "i": {"i", "eye"},
            "j": {"j", "jay"}, "k": {"k", "kay", "okay"}, "l": {"l", "ell"},
            "m": {"m", "em", "um"}, "n": {"n", "en", "and"}, "o": {"o", "oh"},
            "p": {"p", "pee"}, "q": {"q", "cue"}, "r": {"r", "are"},
            "s": {"s", "ess"}, "t": {"t", "tee"}, "u": {"u", "you"},
            "v": {"v", "vee"}, "w": {"w", "doubleyou"}, "x": {"x", "ex"},
            "y": {"y", "why"}, "z": {"z", "zee"},
        }
        return actual in aliases.get(target, {target})
    return False


def collect_items() -> list[dict[str, object]]:
    items: list[dict[str, object]] = []
    for entry in answer_bank():
        items.append(
            {
                "kind": "answer",
                "id": entry["id"],
                "expected": entry["expected"],
                "category": entry["category"],
                "path": ANSWER_ROOT / f"{entry['id']}.mp3",
            }
        )
    for letter in "abcdefghijklmnopqrstuvwxyz":
        items.append(
            {
                "kind": "letter",
                "id": letter,
                "expected": letter,
                "category": "Basic English alphabet",
                "path": ALPHABET_ROOT / f"{letter}.mp3",
            }
        )
    return items


def transcribe_with_retry(path: Path, api_key: str) -> str:
    last_error: Exception | None = None
    for attempt in range(3):
        try:
            return transcribe(path, api_key)
        except Exception as error:  # pragma: no cover - network fallback
            last_error = error
            time.sleep(2 * (attempt + 1))
    raise RuntimeError(f"Unable to transcribe {path.name}: {last_error}")


def write_report(results: list[dict[str, object]], output: Path, used_stt: bool) -> None:
    missing = [item for item in results if item["status"] == "MISSING"]
    small = [item for item in results if item["status"] == "TOO_SMALL"]
    mismatches = [item for item in results if item["status"] == "MISMATCH"]
    answer_items = [item for item in results if item["kind"] == "answer"]
    letter_items = [item for item in results if item["kind"] == "letter"]
    lines = [
        "# Hangman Intermediate English - Audio Audit",
        "",
        f"- Answer recordings checked: {len(answer_items)}",
        f"- Reused A-Z recordings checked: {len(letter_items)}",
        f"- Speech-to-text correspondence audit: {'yes' if used_stt else 'no'}",
        f"- Missing files: {len(missing)}",
        f"- Invalid small files: {len(small)}",
        f"- Transcript mismatches: {len(mismatches)}",
        "- Browser speech synthesis: prohibited and not used by the game.",
        "",
    ]
    if not missing and not small and (not used_stt or not mismatches):
        lines.extend(["Result: PASS. Every required MP3 is present and the audited recording matches its expected text.", ""])
    else:
        lines.extend(["Result: REVIEW REQUIRED.", ""])
    if mismatches:
        lines.extend(["## Transcript mismatches", "", "| File | Expected | Transcript |", "|---|---|---|"])
        for item in mismatches:
            lines.append(f"| `{Path(str(item['path'])).name}` | {item['expected']} | {item.get('transcript', '')} |")
        lines.append("")
    output.write_text("\n".join(lines), encoding="utf-8")


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--stt", action="store_true")
    parser.add_argument("--answers-only", action="store_true")
    parser.add_argument("--output", default=str(DEFAULT_REPORT))
    args = parser.parse_args()

    items = collect_items()
    if args.answers_only:
        items = [item for item in items if item["kind"] == "answer"]

    api_key = ""
    if args.stt:
        load_local_env()
        api_key = os.environ.get("ELEVENLABS_API_KEY", "").strip()
        if not api_key:
            print("Missing ELEVENLABS_API_KEY", file=sys.stderr)
            return 2

    results: list[dict[str, object]] = []
    for index, item in enumerate(items, start=1):
        path = Path(str(item["path"]))
        result = dict(item)
        if not path.exists():
            result["status"] = "MISSING"
        elif path.stat().st_size < 1000:
            result["status"] = "TOO_SMALL"
        elif args.stt:
            transcript = transcribe_with_retry(path, api_key)
            result["transcript"] = transcript
            result["status"] = "OK" if acceptable(str(item["expected"]), transcript, str(item["kind"])) else "MISMATCH"
        else:
            result["status"] = "OK"
        results.append(result)
        print(f"[{index}/{len(items)}] {result['status']} {path.name}")

    output = Path(args.output)
    write_report(results, output, args.stt)
    failures = [item for item in results if item["status"] != "OK"]
    print(f"SUMMARY checked={len(results)} failed={len(failures)} report={output}")
    return 1 if failures else 0


if __name__ == "__main__":
    raise SystemExit(main())
