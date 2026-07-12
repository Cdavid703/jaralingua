"""Audit Intermediate English listening MP3 files for spoken speaker labels.

This checks the main course listening files with ElevenLabs Scribe and flags
likely production mistakes such as a generated voice saying "Narrator:" or
"Sara:" aloud. It is intended for generated course audio, not student uploads.
"""

from __future__ import annotations

import argparse
import json
import mimetypes
import os
from pathlib import Path
import re
import sys
import urllib.request
import uuid


ROOT = Path(__file__).resolve().parents[1]
ENV_FILE = ROOT / "elevenlabs.local.env"
AUDIO_ROOT = ROOT / "ingles" / "intermediate" / "audio"
DEFAULT_OUTPUT = ROOT / "docs" / "auditoria-audios-ingles-intermedio-speaker-labels.md"
DEFAULT_SCRIPT_PATHS = [
    ROOT / "ingles" / "intermediate" / "audio" / "listening-scripts-intermediate-course-1.md",
    ROOT / "ingles" / "intermediate" / "audio" / "unit-4-explanation-scripts.md",
    ROOT / "ingles" / "intermediate" / "audio" / "human-natural-wonders" / "human-natural-wonders-world-records-scripts.md",
    ROOT / "ingles" / "intermediate" / "audio" / "superlative-wall" / "superlative-wall-audio-scripts.md",
    ROOT / "ingles" / "intermediate" / "audio" / "unit-4-expressions" / "expression-sentence-wall-scripts.md",
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


def parse_listening_blocks(markdown: str, source_path: Path) -> list[dict[str, object]]:
    blocks: list[dict[str, object]] = []
    current_title = ""
    current_file = ""
    current_lines: list[str] = []

    def flush() -> None:
        nonlocal current_title, current_file, current_lines
        if current_title and current_file and current_lines:
            speakers = []
            for line in current_lines:
                match = re.match(r"^([^:]{1,80}):\s+(.+)$", line)
                if match and match.group(1) not in speakers:
                    speakers.append(match.group(1))
            blocks.append(
                {
                    "title": current_title,
                    "file": current_file,
                    "source": str(source_path.relative_to(ROOT)),
                    "source_path": str(source_path),
                    "script": "\n".join(current_lines),
                    "speakers": speakers,
                }
            )
        current_title = ""
        current_file = ""
        current_lines = []

    for raw_line in markdown.splitlines():
        line = raw_line.strip()
        heading = re.match(r"^##\s+(.+)$", line)
        if heading:
            flush()
            current_title = heading.group(1).strip()
            continue
        file_match = re.match(r"^File:\s+`([^`]+\.mp3)`", line)
        if file_match:
            current_file = file_match.group(1)
            continue
        if current_title and current_file and line:
            if line.startswith("File:"):
                continue
            current_lines.append(line)
    flush()
    return blocks


def multipart_body(audio: bytes, content_type: str) -> tuple[bytes, str]:
    boundary = f"----JaraLinguaIntermediateAudioAudit{uuid.uuid4().hex}"
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
    add_field("language_code", "en")
    add_field("tag_audio_events", "false")
    add_field("diarize", "false")
    add_field("num_speakers", "1")
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
            "User-Agent": "JaraLingua-Intermediate-Audio-Audit/1.0",
        },
    )
    with urllib.request.urlopen(request, timeout=240) as response:
        payload = json.loads(response.read().decode("utf-8"))
    return str(payload.get("text", "")).strip()


def normalize(text: str) -> str:
    return re.sub(r"\s+", " ", text.lower()).strip()


def suspicious_hits(transcript: str, speakers: list[str]) -> list[str]:
    text = normalize(transcript)
    hits: list[str] = []
    ignored = {"file"}
    for speaker in speakers:
        clean = speaker.strip()
        if clean.lower() in ignored:
            continue
        if clean.lower() == "narrator":
            if re.search(r"\bnarrator\b", text):
                hits.append("Narrator")
            continue
        # Character names can naturally appear in dialogue, so only flag the
        # strongest patterns that resemble read-aloud labels.
        first = clean.split()[0].strip(".")
        patterns = [
            rf"\b{re.escape(clean.lower())}\s+(says|said)\b",
            rf"\b{re.escape(first.lower())}\s+(says|said)\b",
            rf"\b{re.escape(clean.lower())}\s*:\s*",
        ]
        if any(re.search(pattern, text) for pattern in patterns):
            hits.append(clean)
    return hits


def excerpt(text: str, needle: str, radius: int = 90) -> str:
    index = normalize(text).find(needle.lower())
    if index == -1:
        return ""
    start = max(0, index - radius)
    end = min(len(text), index + radius)
    return text[start:end].replace("\n", " ").strip()


def write_report(results: list[dict[str, object]], output_path: Path) -> None:
    lines = [
        "# Auditoria de audios - Ingles intermedio",
        "",
        "Objetivo: detectar si algun audio de ingles intermedio pronuncia etiquetas de guion como `Narrator`, `Sara`, `Maya`, etc.",
        "",
        f"Metodo: transcripcion con ElevenLabs Scribe sobre {len(results)} MP3 con guiones estructurados o etiquetas de hablante, y busqueda de patrones de etiquetas habladas.",
        "",
        "Resultado general: no se detectaron etiquetas de hablante pronunciadas en los audios auditados."
        if not any(item["hits"] for item in results)
        else "Resultado general: hay audios marcados para revision.",
        "",
        "| Audio | Source | Speakers | Estado | Evidencia |",
        "|---|---|---:|---|---|",
    ]
    for item in results:
        hits = item["hits"]
        status = "Revisar" if hits else "OK"
        evidence = "; ".join(str(hit) for hit in hits) if hits else "No se detectaron etiquetas habladas por STT."
        lines.append(
            f"| `{item['file']}` | `{item.get('source', '')}` | {item['speaker_count']} | {status} | {evidence} |"
        )
    lines.extend(
        [
            "",
            "## Recomendacion permanente",
            "",
            "Todo listening con dos o mas personajes debe generarse con `tools/elevenlabs_generate_listenings.py --mode dialogue --dry-run --verbose`.",
            "Nunca se debe enviar un transcript completo con etiquetas a una sola voz TTS.",
        ]
    )
    output_path.write_text("\n".join(lines) + "\n", encoding="utf-8")


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--output", default=str(DEFAULT_OUTPUT))
    parser.add_argument("--source", action="append", dest="sources")
    parser.add_argument("--only", default="")
    parser.add_argument("--no-write", action="store_true")
    args = parser.parse_args()

    load_local_env()
    api_key = os.environ.get("ELEVENLABS_API_KEY")
    if not api_key:
        print("Missing ELEVENLABS_API_KEY", file=sys.stderr)
        return 2

    source_paths = [Path(item) for item in args.sources] if args.sources else DEFAULT_SCRIPT_PATHS
    blocks: list[dict[str, object]] = []
    for source_path in source_paths:
        resolved = source_path if source_path.is_absolute() else ROOT / source_path
        if not resolved.exists():
            print(f"warning: missing script source {resolved}", file=sys.stderr)
            continue
        blocks.extend(parse_listening_blocks(resolved.read_text(encoding="utf-8-sig"), resolved))
    if args.only:
        needle = args.only.lower()
        blocks = [
            block
            for block in blocks
            if needle in str(block["file"]).lower() or needle in str(block["title"]).lower()
        ]
    if not blocks:
        print("No matching audio blocks found.", file=sys.stderr)
        return 1

    results: list[dict[str, object]] = []
    for block in blocks:
        rel_file = str(block["file"])
        source_path = Path(str(block["source_path"]))
        audio_path = AUDIO_ROOT / rel_file
        if not audio_path.exists():
            audio_path = source_path.parent / rel_file
        speakers = list(block["speakers"])  # type: ignore[arg-type]
        if not audio_path.exists():
            results.append(
                {
                    "file": rel_file,
                    "source": block.get("source", ""),
                    "speaker_count": len(speakers),
                    "hits": [f"missing audio file: {audio_path}"],
                }
            )
            continue
        transcript = transcribe(audio_path, api_key)
        hits = suspicious_hits(transcript, speakers)
        results.append(
            {
                "file": rel_file,
                "source": block.get("source", ""),
                "speaker_count": len(speakers),
                "hits": hits,
                "transcript_excerpt": transcript[:500],
            }
        )
        status = "REVIEW" if hits else "OK"
        print(f"{status} {rel_file} speakers={len(speakers)} hits={hits}")

    if not args.no_write:
        write_report(results, Path(args.output))
        print(f"WROTE {args.output}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
