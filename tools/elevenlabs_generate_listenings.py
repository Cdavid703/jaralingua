"""Generate and audit JaraLingua listening audio with ElevenLabs.

This script is intentionally dependency-free. It supports the official
ElevenLabs text-to-dialogue endpoint for multi-character scenes, plus the
standard text-to-speech endpoint for true monologues.
"""

from __future__ import annotations

import argparse
import ast
import glob
import hashlib
import html
import json
import os
import re
import subprocess
import sys
import unicodedata
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any
from urllib.error import HTTPError, URLError
from urllib.parse import urlencode
from urllib.request import Request, urlopen


ROOT = Path(__file__).resolve().parents[1]
LOCAL_ENV_FILE = ROOT / "elevenlabs.local.env"
API_BASE = "https://api.elevenlabs.io/v1"
DEFAULT_OUTPUT_FORMAT = "mp3_44100_128"
DEFAULT_DIALOGUE_MODEL = "eleven_v3"
DEFAULT_TTS_MODEL = "eleven_multilingual_v2"
DEFAULT_MAX_DIALOGUE_CHARS = 1900
MAX_DIALOGUE_VOICES = 10
HTTP_TRANSPORT = "python"
NODE_BIN = "node"
NODE_USE_SYSTEM_CA = False

NODE_FETCH_CODE = r"""
const req = JSON.parse(process.env.ELEVENLABS_NODE_REQUEST || "{}");
const headers = {
  "xi-api-key": process.env.ELEVENLABS_API_KEY || "",
  "Accept": req.binary ? "audio/mpeg" : "application/json",
};
const options = { method: req.method || "GET", headers };
if (req.body !== undefined && req.body !== null) {
  headers["Content-Type"] = "application/json";
  options.body = JSON.stringify(req.body);
}
const response = await fetch(req.url, options);
if (!response.ok) {
  const text = await response.text();
  console.error(`ElevenLabs API error ${response.status}: ${response.statusText}`);
  if (text) console.error(text);
  process.exit(2);
}
if (req.binary) {
  const buffer = Buffer.from(await response.arrayBuffer());
  process.stdout.write(buffer);
} else {
  process.stdout.write(await response.text());
}
"""

DEFAULT_SOURCE_PATTERNS = [
    "ingles/basico/listening*.html",
    "ingles/basico/audio/*.md",
    "ingles/basico/audio/alphabet/*.md",
    "ingles/basico/audio/phonetics/*.md",
    "ingles/basico/audio/professions/*.md",
    "ingles/intermediate/listening*.html",
    "ingles/intermediate/audio/*.md",
    "ingles/intermediate/audio/vocab/*.md",
    "frances/Niveau 7/audio/*.md",
    "frances/Niveau 7/audio/caperucita-roja-scripts.md",
    "frances/Niveau 7/audio/phonetics/*.md",
    "frances/Niveau 7/audio/professions/*.md",
    "frances/Niveau 7/audio/vocab/*.md",
    "frances/Niveau 7/ateliers/ecoute-cultures-b1.html",
    "frances/Niveau 8/audio/*.md",
]

LANGUAGE_PROFILES = {
    "english-us": {
        "language_code": "en",
        "voice_pool_key": "en_us",
        "label": "American English",
    },
    "french-france": {
        "language_code": "fr",
        "voice_pool_key": "fr_fr",
        "label": "French from France",
    },
}

FEMALE_HINTS = {
    "ana",
    "camila",
    "emma",
    "karla",
    "laura",
    "maya",
    "mia",
    "mme",
    "madame",
    "mother",
    "nina",
    "partner_female",
    "sara",
    "sarah",
    "sofia",
    "sophie",
    "teacher_female",
    "valentina",
}

MALE_HINTS = {
    "alex",
    "andres",
    "andr_s",
    "carlos",
    "daniel",
    "father",
    "leo",
    "luis",
    "mateo",
    "narrateur",
    "narrator",
    "nicolas",
    "teacher_male",
}

GENERIC_FEMALE_WORDS = {"mme", "madame", "woman", "mother", "girl", "female"}
GENERIC_MALE_WORDS = {"mr", "monsieur", "man", "father", "boy", "male"}


@dataclass(frozen=True)
class VoiceChoice:
    voice_id: str
    name: str = ""
    profile: str = ""
    gender: str = "neutral"
    source: str = "env"


@dataclass
class AudioItem:
    title: str
    file_name: str
    script: str
    source_path: Path
    output_path: Path
    language_profile: str
    source_kind: str


@dataclass
class Turn:
    speaker: str
    text: str


@dataclass
class GenerationPlan:
    item: AudioItem
    turns: list[Turn]
    speaker_to_voice: dict[str, VoiceChoice] = field(default_factory=dict)
    warnings: list[str] = field(default_factory=list)


def load_local_env(path: Path = LOCAL_ENV_FILE) -> None:
    if not path.exists():
        return

    for raw_line in path.read_text(encoding="utf-8").splitlines():
        line = raw_line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, value = line.split("=", 1)
        key = key.strip()
        value = value.strip().strip('"').strip("'")
        if key and key not in os.environ:
            os.environ[key] = value


def resolve_path(value: str | Path, base: Path = ROOT) -> Path:
    path = Path(value)
    if not path.is_absolute():
        path = base / path
    return path.resolve()


def normalize_key(value: str) -> str:
    ascii_value = unicodedata.normalize("NFKD", value).encode("ascii", "ignore").decode("ascii")
    key = re.sub(r"[^a-zA-Z0-9]+", "_", ascii_value).strip("_").lower()
    return key or "speaker"


def split_csv(value: str | None) -> list[str]:
    if not value:
        return []
    return [part.strip() for part in value.split(",") if part.strip()]


def env_voice_choice(env_key: str, profile: str = "", gender: str = "neutral") -> VoiceChoice | None:
    voice_id = os.environ.get(env_key)
    if not voice_id:
        return None
    return VoiceChoice(voice_id=voice_id.strip(), profile=profile, gender=gender, source=env_key)


def request_json(path: str, api_key: str) -> dict[str, Any]:
    if HTTP_TRANSPORT == "node":
        return json.loads(node_request(path, api_key, binary=False).decode("utf-8"))

    request = Request(
        f"{API_BASE}{path}",
        headers={
            "Accept": "application/json",
            "xi-api-key": api_key,
        },
    )
    with urlopen(request, timeout=45) as response:
        return json.loads(response.read().decode("utf-8"))


def request_audio(path: str, api_key: str, body: dict[str, Any], output_format: str, timeout: int) -> bytes:
    params = urlencode({"output_format": output_format})
    if HTTP_TRANSPORT == "node":
        return node_request(f"{path}?{params}", api_key, body=body, binary=True, timeout=timeout)

    request = Request(
        f"{API_BASE}{path}?{params}",
        data=json.dumps(body, ensure_ascii=False).encode("utf-8"),
        method="POST",
        headers={
            "Accept": "audio/mpeg",
            "Content-Type": "application/json",
            "xi-api-key": api_key,
        },
    )
    with urlopen(request, timeout=timeout) as response:
        return response.read()


def node_request(
    path: str,
    api_key: str,
    body: dict[str, Any] | None = None,
    binary: bool = False,
    timeout: int = 120,
) -> bytes:
    env = os.environ.copy()
    env["ELEVENLABS_API_KEY"] = api_key
    env["ELEVENLABS_NODE_REQUEST"] = json.dumps(
        {
            "url": f"{API_BASE}{path}",
            "method": "POST" if body is not None else "GET",
            "body": body,
            "binary": binary,
        },
        ensure_ascii=False,
    )
    command = [NODE_BIN]
    if NODE_USE_SYSTEM_CA:
        command.append("--use-system-ca")
    command.extend(["--input-type=module", "-e", NODE_FETCH_CODE])
    completed = subprocess.run(command, env=env, capture_output=True, timeout=timeout + 30)
    if completed.returncode != 0:
        message = completed.stderr.decode("utf-8", errors="replace") or completed.stdout.decode("utf-8", errors="replace")
        raise RuntimeError(message.strip() or "Node transport failed.")
    return completed.stdout


def fail_from_http(error: HTTPError) -> RuntimeError:
    try:
        body = error.read().decode("utf-8", errors="replace")
    except Exception:
        body = ""
    message = f"ElevenLabs API error {error.code}: {error.reason}"
    if body:
        message += f"\n{body}"
    return RuntimeError(message)


def list_voices(api_key: str, filter_text: str = "") -> None:
    payload = request_json("/voices", api_key)
    voices = payload.get("voices", [])
    needle = filter_text.lower().strip()
    for voice in voices:
        name = voice.get("name", "Unnamed voice")
        voice_id = voice.get("voice_id", "")
        category = voice.get("category", "")
        labels = voice.get("labels") or {}
        label_text = " ".join(str(value) for value in labels.values())
        searchable = f"{name} {voice_id} {category} {label_text}".lower()
        if needle and needle not in searchable:
            continue
        accent = labels.get("accent") or labels.get("descriptive") or ""
        gender = labels.get("gender") or ""
        language = labels.get("language") or labels.get("languages") or ""
        extra = " | ".join(part for part in [category, gender, language, accent] if part)
        print(f"{name}  {voice_id}" + (f"  ({extra})" if extra else ""))


def list_models(api_key: str) -> None:
    payload = request_json("/models", api_key)
    for model in payload if isinstance(payload, list) else payload.get("models", []):
        model_id = model.get("model_id", "")
        name = model.get("name", "")
        can_tts = model.get("can_do_text_to_speech", "")
        print(f"{model_id}  {name}  text_to_speech={can_tts}")


def infer_language_profile(path: Path, explicit: str | None = None) -> str:
    if explicit:
        return explicit
    normalized = str(path).replace("\\", "/").lower()
    if "/frances/" in normalized or "frances/" in normalized:
        return "french-france"
    return "english-us"


def strip_markdown_noise(script: str) -> str:
    lines: list[str] = []
    in_script = "## script" not in script.lower()
    for raw_line in script.splitlines():
        line = raw_line.strip()
        lower = line.lower()
        if not line:
            if lines and lines[-1] != "":
                lines.append("")
            continue
        if lower.startswith("file:"):
            continue
        if lower.startswith("## script"):
            in_script = True
            continue
        if line.startswith("#") and not in_script:
            continue
        if lower.startswith("## distribution") or lower.startswith("## répartition"):
            in_script = False
            continue
        if not in_script:
            continue
        if line.startswith("- ") and ":" in line and "voix" in lower:
            continue
        lines.append(raw_line.rstrip())
    return "\n".join(lines).strip()


def parse_markdown(path: Path, out_dir: Path | None = None, language_profile: str | None = None) -> list[AudioItem]:
    text = path.read_text(encoding="utf-8")
    items: list[AudioItem] = []

    section_pattern = re.compile(
        r"^##\s+(?P<title>.+?)\s*$\s*^File:\s+`(?P<file>[^`]+)`\s*$\s*(?P<script>.*?)(?=^##\s+|\Z)",
        re.MULTILINE | re.DOTALL,
    )
    for match in section_pattern.finditer(text):
        script = strip_markdown_noise(match.group("script"))
        if not script:
            continue
        profile = infer_language_profile(path, language_profile)
        output_dir = out_dir or path.parent
        file_name = match.group("file").strip()
        items.append(
            AudioItem(
                title=match.group("title").strip(),
                file_name=file_name,
                script=script,
                source_path=path,
                output_path=(output_dir / file_name).resolve(),
                language_profile=profile,
                source_kind="markdown",
            )
        )

    if items:
        return items

    file_match = re.search(r"^File:\s+`(?P<file>[^`]+)`\s*$", text, re.MULTILINE)
    if not file_match:
        return []

    title_match = re.search(r"^#\s+(?P<title>.+?)\s*$", text, re.MULTILINE)
    script_match = re.search(r"^##\s+Script[^\n]*\s*$\s*(?P<script>.*)\Z", text, re.MULTILINE | re.DOTALL)
    script = script_match.group("script") if script_match else text[file_match.end() :]
    script = strip_markdown_noise(script)
    if not script:
        return []

    file_name = file_match.group("file").strip()
    output_dir = out_dir or path.parent
    items.append(
        AudioItem(
            title=title_match.group("title").strip() if title_match else path.stem,
            file_name=file_name,
            script=script,
            source_path=path,
            output_path=(output_dir / file_name).resolve(),
            language_profile=infer_language_profile(path, language_profile),
            source_kind="markdown",
        )
    )
    return items


def decode_js_string(value: str) -> str:
    try:
        return ast.literal_eval(value)
    except Exception:
        return bytes(value.strip("\"'"), "utf-8").decode("unicode_escape")


def parse_html_audio(path: Path, language_profile: str | None = None) -> list[AudioItem]:
    text = path.read_text(encoding="utf-8")
    script_match = re.search(
        r"\bconst\s+(?:dialogueText|listeningText|transcriptText)\s*=\s*(?P<literal>\"(?:\\.|[^\"\\])*\"|'(?:\\.|[^'\\])*')\s*;",
        text,
        re.DOTALL,
    )
    audio_match = re.search(r"<audio\b[^>]*\bsrc=[\"'](?P<src>[^\"']+\.mp3)[\"']", text, re.IGNORECASE)
    if script_match and audio_match:
        title_match = re.search(r"<h2[^>]*>(?P<title>.*?)</h2>", text, re.IGNORECASE | re.DOTALL)
        page_title_match = re.search(r"<title[^>]*>(?P<title>.*?)</title>", text, re.IGNORECASE | re.DOTALL)
        title = title_match or page_title_match
        src = html.unescape(audio_match.group("src"))
        output_path = (path.parent / src).resolve()
        script = decode_js_string(script_match.group("literal")).strip()
        return [
            AudioItem(
                title=html.unescape(re.sub(r"<[^>]+>", "", title.group("title")).strip()) if title else path.stem,
                file_name=Path(src).name,
                script=script,
                source_path=path,
                output_path=output_path,
                language_profile=infer_language_profile(path, language_profile),
                source_kind="html",
            )
        ]

    source_matches = list(re.finditer(r"<source\b[^>]*\bsrc=[\"'](?P<src>[^\"']+\.mp3)[\"']", text, re.IGNORECASE))
    if not source_matches:
        return []

    consts: dict[str, str] = {}
    const_pattern = re.compile(
        r"\bconst\s+(?P<name>[A-Za-z_][A-Za-z0-9_]*Transcript[A-Za-z0-9_]*)\s*=\s*(?P<literal>\"(?:\\.|[^\"\\])*\"|'(?:\\.|[^'\\])*'|`(?:\\.|[^`\\])*`)\s*;",
        re.DOTALL,
    )
    for match in const_pattern.finditer(text):
        literal = match.group("literal")
        if literal.startswith("`"):
            value = literal[1:-1]
        else:
            value = decode_js_string(literal)
        consts[match.group("name")] = value.strip()

    downloads: dict[str, str] = {}
    download_pattern = re.compile(
        r"downloadTranscriptPdf\(\s*['\"](?P<title>[^'\"]+)['\"]\s*,\s*(?P<var>[A-Za-z_][A-Za-z0-9_]*)",
        re.DOTALL,
    )
    for match in download_pattern.finditer(text):
        downloads[match.group("var")] = html.unescape(match.group("title").strip())

    if len(consts) < len(source_matches):
        return []

    items: list[AudioItem] = []
    transcript_names = list(consts)
    for index, source_match in enumerate(source_matches):
        var_name = transcript_names[index]
        src = html.unescape(source_match.group("src"))
        output_path = (path.parent / src).resolve()
        title = downloads.get(var_name) or Path(src).stem.replace("-", " ").title()
        items.append(
            AudioItem(
                title=title,
                file_name=Path(src).name,
                script=consts[var_name],
                source_path=path,
                output_path=output_path,
                language_profile=infer_language_profile(path, language_profile),
                source_kind="html",
            )
        )
    return items


def expand_source_patterns(patterns: list[str]) -> list[Path]:
    paths: list[Path] = []
    for pattern in patterns:
        full_pattern = str(resolve_path(pattern))
        matches = sorted(glob.glob(full_pattern))
        if matches:
            paths.extend(Path(match).resolve() for match in matches)
            continue
        path = resolve_path(pattern)
        if path.exists():
            paths.append(path)
    return sorted(set(paths))


def parse_sources(patterns: list[str], out_dir: Path | None, language_profile: str | None) -> list[AudioItem]:
    items: list[AudioItem] = []
    for path in expand_source_patterns(patterns):
        if path.suffix.lower() in {".md", ".markdown"}:
            items.extend(parse_markdown(path, out_dir, language_profile))
        elif path.suffix.lower() in {".html", ".htm"}:
            items.extend(parse_html_audio(path, language_profile))
    return dedupe_items(items)


def dedupe_items(items: list[AudioItem]) -> list[AudioItem]:
    by_output: dict[Path, AudioItem] = {}
    for item in items:
        previous = by_output.get(item.output_path)
        if previous is None:
            by_output[item.output_path] = item
            continue
        previous_score = (previous.source_kind == "html", len(previous.script))
        current_score = (item.source_kind == "html", len(item.script))
        if current_score > previous_score:
            by_output[item.output_path] = item
    return sorted(by_output.values(), key=lambda item: str(item.output_path).lower())


def parse_dialogue(script: str) -> list[Turn]:
    turns: list[Turn] = []
    for raw_line in script.splitlines():
        line = raw_line.strip()
        if not line:
            continue
        match = re.match(r"^(?P<speaker>[^:]{1,80}):\s*(?P<text>.+)$", line)
        if not match:
            return []
        speaker = match.group("speaker").strip()
        text = match.group("text").strip()
        if not speaker or not text:
            return []
        turns.append(Turn(speaker=speaker, text=text))

    unique_speakers = {turn.speaker for turn in turns}
    if len(unique_speakers) == 1 and turns:
        speaker = turns[0].speaker
        return [Turn(speaker=speaker, text=" ".join(turn.text for turn in turns))]
    return turns if len(unique_speakers) >= 2 else []


def infer_gender(speaker: str) -> str:
    key = normalize_key(speaker)
    parts = set(key.split("_"))
    if key in FEMALE_HINTS or parts & FEMALE_HINTS or parts & GENERIC_FEMALE_WORDS:
        return "female"
    if key in MALE_HINTS or parts & MALE_HINTS or parts & GENERIC_MALE_WORDS:
        return "male"
    if key.endswith("_a") or key == "voix_a":
        return "female"
    if key.endswith("_b") or key == "voix_b":
        return "male"
    return "neutral"


def load_voice_cast(path: Path | None) -> dict[str, Any]:
    if path and path.exists():
        return json.loads(path.read_text(encoding="utf-8"))
    raw_json = os.environ.get("ELEVENLABS_VOICE_CAST_JSON") or os.environ.get("ELEVENLABS_VOICE_CAST")
    if raw_json:
        stripped = raw_json.strip()
        maybe_path = resolve_path(stripped) if not stripped.startswith("{") else None
        if maybe_path and maybe_path.exists():
            return json.loads(maybe_path.read_text(encoding="utf-8"))
        return json.loads(stripped)
    return {}


def make_choice(value: Any, profile: str, gender: str, source: str) -> VoiceChoice | None:
    if not value:
        return None
    if isinstance(value, str):
        return VoiceChoice(voice_id=value.strip(), profile=profile, gender=gender, source=source)
    if isinstance(value, dict):
        voice_id = str(value.get("voice_id", "")).strip()
        if not voice_id:
            return None
        return VoiceChoice(
            voice_id=voice_id,
            name=str(value.get("name", "")),
            profile=str(value.get("profile", profile)),
            gender=str(value.get("gender", gender)),
            source=source,
        )
    return None


class VoiceCatalog:
    def __init__(self, config: dict[str, Any]):
        self.speaker_map: dict[str, VoiceChoice] = {}
        self.pools: dict[tuple[str, str], list[VoiceChoice]] = {}
        self._load_env()
        # An explicitly selected --voice-cast must win over generic values
        # from elevenlabs.local.env (which may contain example placeholders).
        self._load_config(config)

    def _add_to_pool(self, profile: str, gender: str, choices: list[VoiceChoice]) -> None:
        clean = [choice for choice in choices if choice.voice_id]
        if not clean:
            return
        self.pools.setdefault((profile, gender), []).extend(clean)

    def _load_config(self, config: dict[str, Any]) -> None:
        speakers = config.get("speakers") or config.get("speaker_map") or {}
        for speaker, value in speakers.items():
            key = normalize_key(str(speaker))
            gender = infer_gender(str(speaker))
            profile = str(value.get("profile", "")) if isinstance(value, dict) else ""
            choice = make_choice(value, profile=profile, gender=gender, source="voice_cast")
            if choice:
                self.speaker_map[key] = choice

        pools = config.get("pools") or {}
        for profile, value in pools.items():
            if isinstance(value, list):
                choices = [make_choice(item, str(profile), "neutral", "voice_cast") for item in value]
                self._add_to_pool(str(profile), "neutral", [choice for choice in choices if choice])
                continue
            if not isinstance(value, dict):
                continue
            for gender, items in value.items():
                item_list = items if isinstance(items, list) else [items]
                choices = [make_choice(item, str(profile), str(gender), "voice_cast") for item in item_list]
                self._add_to_pool(str(profile), str(gender), [choice for choice in choices if choice])

    def _load_env(self) -> None:
        direct_json = os.environ.get("ELEVENLABS_SPEAKER_VOICE_MAP")
        if direct_json:
            for speaker, value in json.loads(direct_json).items():
                key = normalize_key(str(speaker))
                choice = make_choice(value, "", infer_gender(str(speaker)), "ELEVENLABS_SPEAKER_VOICE_MAP")
                if choice:
                    self.speaker_map[key] = choice

        direct_pairs = os.environ.get("ELEVENLABS_SPEAKER_VOICE_IDS")
        for item in split_csv(direct_pairs):
            if "=" not in item:
                continue
            speaker, voice_id = item.split("=", 1)
            voice_id = voice_id.strip()
            if voice_id:
                self.speaker_map[normalize_key(speaker)] = VoiceChoice(
                    voice_id=voice_id,
                    gender=infer_gender(speaker),
                    source="ELEVENLABS_SPEAKER_VOICE_IDS",
                )

        for env_key, value in os.environ.items():
            if not env_key.startswith("ELEVENLABS_VOICE_"):
                continue
            if env_key.startswith("ELEVENLABS_VOICE_POOL_"):
                continue
            if env_key in {"ELEVENLABS_VOICE_ID", "ELEVENLABS_VOICE_ID_2", "ELEVENLABS_VOICE_CAST_JSON"}:
                continue
            speaker = env_key.removeprefix("ELEVENLABS_VOICE_")
            self.speaker_map[normalize_key(speaker)] = VoiceChoice(
                voice_id=value.strip(),
                gender=infer_gender(speaker),
                source=env_key,
            )

        for profile_name, profile in LANGUAGE_PROFILES.items():
            pool_key = profile["voice_pool_key"].upper()
            for gender in ("female", "male", "neutral"):
                env_key = f"ELEVENLABS_VOICE_POOL_{pool_key}_{gender.upper()}"
                choices = [
                    VoiceChoice(voice_id=voice_id, profile=profile_name, gender=gender, source=env_key)
                    for voice_id in split_csv(os.environ.get(env_key))
                ]
                self._add_to_pool(profile_name, gender, choices)

            env_key = f"ELEVENLABS_VOICE_POOL_{pool_key}"
            choices = [
                VoiceChoice(voice_id=voice_id, profile=profile_name, gender="neutral", source=env_key)
                for voice_id in split_csv(os.environ.get(env_key))
            ]
            self._add_to_pool(profile_name, "neutral", choices)

        legacy_one = env_voice_choice("ELEVENLABS_VOICE_ID", gender="neutral")
        legacy_two = env_voice_choice("ELEVENLABS_VOICE_ID_2", gender="neutral")
        legacy = [choice for choice in [legacy_one, legacy_two] if choice]
        for profile_name in LANGUAGE_PROFILES:
            if legacy and not self.pools.get((profile_name, "neutral")):
                self._add_to_pool(profile_name, "neutral", legacy)
            if legacy_one and not self.pools.get((profile_name, "female")):
                self._add_to_pool(profile_name, "female", [legacy_one])
            if legacy_two and not self.pools.get((profile_name, "male")):
                self._add_to_pool(profile_name, "male", [legacy_two])

    def resolve(self, speaker: str, language_profile: str, index: int, used: set[str]) -> VoiceChoice:
        direct = self.speaker_map.get(normalize_key(speaker))
        if direct:
            return direct

        gender = infer_gender(speaker)
        for key in [
            (language_profile, gender),
            (language_profile, "neutral"),
            ("", gender),
            ("", "neutral"),
        ]:
            candidates = self.pools.get(key, [])
            if candidates:
                available = [choice for choice in candidates if choice.voice_id not in used]
                pool = available or candidates
                stable_index = int(hashlib.sha1(normalize_key(speaker).encode("utf-8")).hexdigest(), 16)
                return pool[(stable_index + index) % len(pool)]

        raise RuntimeError(
            f"No voice configured for speaker '{speaker}'. Add ELEVENLABS_VOICE_{normalize_key(speaker).upper()} "
            f"or ELEVENLABS_VOICE_POOL_{LANGUAGE_PROFILES[language_profile]['voice_pool_key'].upper()}."
        )


def build_generation_plan(item: AudioItem, catalog: VoiceCatalog) -> GenerationPlan:
    turns = parse_dialogue(item.script)
    if not turns:
        speaker = "Narrateur" if item.language_profile == "french-france" else "Narrator"
        turns = [Turn(speaker=speaker, text=item.script)]

    speaker_to_voice: dict[str, VoiceChoice] = {}
    used: set[str] = set()
    warnings: list[str] = []
    for turn in turns:
        if turn.speaker in speaker_to_voice:
            continue
        choice = catalog.resolve(turn.speaker, item.language_profile, len(speaker_to_voice), used)
        speaker_to_voice[turn.speaker] = choice
        used.add(choice.voice_id)

    if len(set(choice.voice_id for choice in speaker_to_voice.values())) > MAX_DIALOGUE_VOICES:
        raise RuntimeError(
            f"{item.file_name} uses more than {MAX_DIALOGUE_VOICES} unique voices; "
            "reduce the cast or split the script."
        )

    if item.language_profile == "french-france":
        suspicious = re.search(r"qu[eé]bec|canad", f"{item.file_name} {item.title}", re.IGNORECASE)
        if suspicious:
            warnings.append(
                "French item mentions Quebec/Canada in the title or file name. "
                "The script will still enforce the French-from-France profile; verify the selected voices."
            )

    reused = len(set(choice.voice_id for choice in speaker_to_voice.values())) < len(speaker_to_voice)
    if reused:
        warnings.append(
            "Some speakers share a voice because the configured pool is too small. "
            "Add more voice IDs for a richer cast."
        )

    return GenerationPlan(item=item, turns=turns, speaker_to_voice=speaker_to_voice, warnings=warnings)


def chunk_turns(turns: list[Turn], max_chars: int) -> list[list[Turn]]:
    chunks: list[list[Turn]] = []
    current: list[Turn] = []
    current_len = 0
    for turn in turns:
        turn_len = len(turn.text)
        if turn_len > max_chars:
            raise RuntimeError(f"One dialogue turn is longer than {max_chars} characters: {turn.speaker}")
        if current and current_len + turn_len > max_chars:
            chunks.append(current)
            current = []
            current_len = 0
        current.append(turn)
        current_len += turn_len
    if current:
        chunks.append(current)
    return chunks


def synthesize_dialogue(
    plan: GenerationPlan,
    api_key: str,
    model_id: str,
    output_format: str,
    max_chars: int,
    seed: int | None,
    apply_text_normalization: str,
    language_code: str | None,
) -> bytes:
    audio_chunks: list[bytes] = []
    for chunk in chunk_turns(plan.turns, max_chars):
        body: dict[str, Any] = {
            "model_id": model_id,
            "inputs": [
                {
                    "text": turn.text,
                    "voice_id": plan.speaker_to_voice[turn.speaker].voice_id,
                }
                for turn in chunk
            ],
            "apply_text_normalization": apply_text_normalization,
        }
        if seed is not None:
            body["seed"] = seed
        if language_code:
            body["language_code"] = language_code
        audio_chunks.append(request_audio("/text-to-dialogue", api_key, body, output_format, timeout=180))
    return b"".join(audio_chunks)


def synthesize_tts(
    plan: GenerationPlan,
    api_key: str,
    model_id: str,
    output_format: str,
    stability: float,
    similarity_boost: float,
    language_code: str | None,
) -> bytes:
    speaker = plan.turns[0].speaker
    voice_id = plan.speaker_to_voice[speaker].voice_id
    body: dict[str, Any] = {
        "text": plan.turns[0].text,
        "model_id": model_id,
        "voice_settings": {
            "stability": stability,
            "similarity_boost": similarity_boost,
        },
    }
    if language_code:
        body["language_code"] = language_code
    return request_audio(f"/text-to-speech/{voice_id}", api_key, body, output_format, timeout=120)


def voice_label_blob(voice: dict[str, Any]) -> str:
    labels = voice.get("labels") or {}
    parts = [
        voice.get("name", ""),
        voice.get("category", ""),
        *(str(value) for value in labels.values()),
    ]
    return " ".join(parts).lower()


def validate_french_voice_accents(plans: list[GenerationPlan], api_key: str, strict: bool) -> list[str]:
    payload = request_json("/voices", api_key)
    voices = {voice.get("voice_id"): voice for voice in payload.get("voices", [])}
    warnings: list[str] = []
    forbidden = re.compile(r"qu[eé]bec|canadian|canada|fr-ca|québécois", re.IGNORECASE)
    france_positive = re.compile(r"france|paris|french", re.IGNORECASE)

    for plan in plans:
        if plan.item.language_profile != "french-france":
            continue
        for speaker, choice in plan.speaker_to_voice.items():
            voice = voices.get(choice.voice_id)
            if not voice:
                warnings.append(f"{plan.item.file_name}: voice {choice.voice_id} for {speaker} was not returned by /voices.")
                continue
            blob = voice_label_blob(voice)
            if forbidden.search(blob):
                message = f"{plan.item.file_name}: {speaker} uses a French voice that looks Canadian/Quebec ({choice.voice_id})."
                if strict:
                    raise RuntimeError(message)
                warnings.append(message)
            else:
                labels = voice.get("labels") or {}
                language = str(labels.get("language", "")).lower()
                accent = str(labels.get("accent", "")).lower()
                verified_france = language == "fr" and accent in {"standard", "parisian", "france", "french"}
                if verified_france or france_positive.search(blob):
                    continue
                warnings.append(
                    f"{plan.item.file_name}: verify {speaker}'s French-from-France accent manually "
                    f"({voice.get('name', choice.voice_id)})."
                )
    return warnings


def print_plan(plan: GenerationPlan, verbose: bool = False) -> None:
    voices_used = len(set(choice.voice_id for choice in plan.speaker_to_voice.values()))
    print(f"{plan.item.file_name} [{plan.item.language_profile}]")
    print(f"  source: {plan.item.source_path.relative_to(ROOT)}")
    print(f"  output: {plan.item.output_path.relative_to(ROOT)}")
    print(f"  turns: {len(plan.turns)} | speakers: {len(plan.speaker_to_voice)} | voices: {voices_used}")
    for warning in plan.warnings:
        print(f"  warning: {warning}")
    if verbose:
        for speaker, choice in plan.speaker_to_voice.items():
            label = f"{choice.name} " if choice.name else ""
            print(f"    {speaker} -> {label}{choice.voice_id} ({choice.source})")


def main() -> int:
    global HTTP_TRANSPORT, NODE_BIN, NODE_USE_SYSTEM_CA

    load_local_env()

    parser = argparse.ArgumentParser(description="Generate JaraLingua listening MP3 files with ElevenLabs.")
    parser.add_argument(
        "--source",
        action="append",
        dest="sources",
        help="Script source file or glob. Supports Markdown with File lines and listening HTML pages.",
    )
    parser.add_argument("--out-dir", help="Override output directory for Markdown sources.")
    parser.add_argument("--language-profile", choices=sorted(LANGUAGE_PROFILES), help="Force one language/accent profile.")
    parser.add_argument("--voice-cast", help="JSON file with speaker voices and voice pools.")
    parser.add_argument("--only", help="Generate only matching title, file name, or source path substring.")
    parser.add_argument("--overwrite", action="store_true", help="Overwrite existing MP3 files.")
    parser.add_argument("--dry-run", action="store_true", help="Print the plan without calling ElevenLabs.")
    parser.add_argument("--audit", action="store_true", help="Alias for --dry-run --verbose.")
    parser.add_argument("--verbose", action="store_true", help="Show speaker-to-voice assignments.")
    parser.add_argument("--list-voices", action="store_true", help="List available ElevenLabs voices and exit.")
    parser.add_argument("--voice-filter", default="", help="Filter --list-voices output.")
    parser.add_argument("--list-models", action="store_true", help="List available ElevenLabs models and exit.")
    parser.add_argument("--transport", choices=["python", "node"], default=os.environ.get("ELEVENLABS_TRANSPORT", "python"), help="HTTP transport. Use node if Python SSL is unavailable.")
    parser.add_argument("--node-bin", default=os.environ.get("ELEVENLABS_NODE_BIN", "node"), help="Node executable used by --transport node.")
    parser.add_argument("--node-use-system-ca", action="store_true", default=os.environ.get("ELEVENLABS_NODE_USE_SYSTEM_CA") == "1", help="Pass --use-system-ca to Node.")
    parser.add_argument("--validate-voices", action="store_true", help="Call /voices and warn about suspicious accent labels.")
    parser.add_argument("--strict-french-accent", action="store_true", help="Fail if a French voice looks Canadian/Quebec.")
    parser.add_argument("--mode", choices=["auto", "dialogue", "tts"], default="auto", help="Generation endpoint strategy.")
    parser.add_argument("--dialogue-model-id", default=os.environ.get("ELEVENLABS_DIALOGUE_MODEL_ID", DEFAULT_DIALOGUE_MODEL))
    parser.add_argument("--tts-model-id", default=os.environ.get("ELEVENLABS_MODEL_ID", DEFAULT_TTS_MODEL))
    parser.add_argument("--output-format", default=os.environ.get("ELEVENLABS_OUTPUT_FORMAT", DEFAULT_OUTPUT_FORMAT))
    parser.add_argument("--max-dialogue-chars", type=int, default=int(os.environ.get("ELEVENLABS_MAX_DIALOGUE_CHARS", DEFAULT_MAX_DIALOGUE_CHARS)))
    parser.add_argument("--seed", type=int, default=None)
    parser.add_argument("--apply-text-normalization", choices=["auto", "on", "off"], default=os.environ.get("ELEVENLABS_TEXT_NORMALIZATION", "auto"))
    parser.add_argument("--stability", type=float, default=float(os.environ.get("ELEVENLABS_STABILITY", "0.55")))
    parser.add_argument("--similarity-boost", type=float, default=float(os.environ.get("ELEVENLABS_SIMILARITY_BOOST", "0.80")))
    parser.add_argument("--language-code", help="Override ElevenLabs language_code. Defaults to profile language code.")
    args = parser.parse_args()

    if args.audit:
        args.dry_run = True
        args.verbose = True

    HTTP_TRANSPORT = args.transport
    NODE_BIN = args.node_bin
    NODE_USE_SYSTEM_CA = args.node_use_system_ca

    api_key = os.environ.get("ELEVENLABS_API_KEY")
    if (args.list_voices or args.list_models or not args.dry_run) and not api_key:
        print(
            "Missing ELEVENLABS_API_KEY. Create elevenlabs.local.env from elevenlabs.example.env "
            "or set the variable before running this script.",
            file=sys.stderr,
        )
        return 2

    try:
        if args.list_voices:
            list_voices(api_key, args.voice_filter)  # type: ignore[arg-type]
            return 0
        if args.list_models:
            list_models(api_key)  # type: ignore[arg-type]
            return 0

        sources = args.sources or DEFAULT_SOURCE_PATTERNS
        out_dir = resolve_path(args.out_dir) if args.out_dir else None
        items = parse_sources(sources, out_dir, args.language_profile)
        if args.only:
            needle = args.only.lower()
            items = [
                item
                for item in items
                if needle in item.file_name.lower()
                or needle in item.title.lower()
                or needle in str(item.source_path).lower()
            ]
        if not items:
            print("No listening scripts found.", file=sys.stderr)
            return 1

        catalog = VoiceCatalog(load_voice_cast(resolve_path(args.voice_cast) if args.voice_cast else None))
        plans = [build_generation_plan(item, catalog) for item in items]

        if args.validate_voices:
            for warning in validate_french_voice_accents(plans, api_key, args.strict_french_accent):  # type: ignore[arg-type]
                print(f"voice warning: {warning}")

        for plan in plans:
            print_plan(plan, verbose=args.verbose)
            if args.dry_run:
                continue

            output_path = plan.item.output_path
            if output_path.exists() and not args.overwrite:
                print(f"  skipped: existing file (use --overwrite)")
                continue

            output_path.parent.mkdir(parents=True, exist_ok=True)
            profile_default_code = LANGUAGE_PROFILES[plan.item.language_profile]["language_code"]
            language_code = args.language_code if args.language_code is not None else profile_default_code

            use_dialogue = args.mode == "dialogue" or (args.mode == "auto" and len(plan.speaker_to_voice) > 1)
            if use_dialogue:
                audio = synthesize_dialogue(
                    plan,
                    api_key,  # type: ignore[arg-type]
                    args.dialogue_model_id,
                    args.output_format,
                    args.max_dialogue_chars,
                    args.seed,
                    args.apply_text_normalization,
                    language_code,
                )
            else:
                audio = synthesize_tts(
                    plan,
                    api_key,  # type: ignore[arg-type]
                    args.tts_model_id,
                    args.output_format,
                    args.stability,
                    args.similarity_boost,
                    language_code,
                )

            output_path.write_bytes(audio)
            print(f"  generated: {len(audio):,} bytes")

    except HTTPError as error:
        raise fail_from_http(error)
    except URLError as error:
        raise RuntimeError(f"Network error: {error}") from error

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
