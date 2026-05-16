import argparse
import json
import os
import re
import sys
from pathlib import Path
from urllib.error import HTTPError, URLError
from urllib.parse import urlencode
from urllib.request import Request, urlopen


ROOT = Path(__file__).resolve().parents[1]
DEFAULT_SCRIPT_FILE = ROOT / "ingles" / "basico" / "audio" / "listening-scripts-basic-course-1.md"
DEFAULT_OUTPUT_DIR = ROOT / "ingles" / "basico" / "audio"
LOCAL_ENV_FILE = ROOT / "elevenlabs.local.env"
API_BASE = "https://api.elevenlabs.io/v1"
DEFAULT_FEMALE_SPEAKERS = {
    "ana",
    "karla",
    "maya",
    "nina",
    "sara",
    "sarah",
    "teacher",
    "partner",
}
DEFAULT_MALE_SPEAKERS = {
    "alex",
    "daniel",
    "luis",
    "mateo",
}


def load_local_env():
    if not LOCAL_ENV_FILE.exists():
        return

    for raw_line in LOCAL_ENV_FILE.read_text(encoding="utf-8").splitlines():
        line = raw_line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, value = line.split("=", 1)
        key = key.strip()
        value = value.strip().strip('"').strip("'")
        if key and key not in os.environ:
            os.environ[key] = value


def request_json(path, api_key):
    request = Request(
        f"{API_BASE}{path}",
        headers={
            "Accept": "application/json",
            "xi-api-key": api_key,
        },
    )
    with urlopen(request, timeout=45) as response:
        return json.loads(response.read().decode("utf-8"))


def list_voices(api_key):
    payload = request_json("/voices", api_key)
    voices = payload.get("voices", [])
    if not voices:
        print("No voices returned by ElevenLabs.")
        return

    for voice in voices:
        name = voice.get("name", "Unnamed voice")
        voice_id = voice.get("voice_id", "")
        category = voice.get("category", "")
        labels = voice.get("labels") or {}
        accent = labels.get("accent") or labels.get("descriptive") or ""
        extra = " | ".join(part for part in [category, accent] if part)
        print(f"{name}  {voice_id}" + (f"  ({extra})" if extra else ""))


def parse_scripts(path):
    text = path.read_text(encoding="utf-8")
    pattern = re.compile(
        r"^##\s+(?P<title>.+?)\s*$\s*^File:\s+`(?P<file>[^`]+)`\s*$\s*(?P<script>.*?)(?=^##\s+|\Z)",
        re.MULTILINE | re.DOTALL,
    )
    items = []
    for match in pattern.finditer(text):
        script = match.group("script").strip()
        if script:
            items.append(
                {
                    "title": match.group("title").strip(),
                    "file": match.group("file").strip(),
                    "script": script,
                }
            )
    return items


def synthesize(script, output_path, api_key, voice_id, model_id, output_format, stability, similarity_boost):
    output_path.write_bytes(
        synthesize_bytes(script, api_key, voice_id, model_id, output_format, stability, similarity_boost)
    )


def synthesize_bytes(script, api_key, voice_id, model_id, output_format, stability, similarity_boost):
    params = urlencode({"output_format": output_format})
    url = f"{API_BASE}/text-to-speech/{voice_id}?{params}"
    body = json.dumps(
        {
            "text": script,
            "model_id": model_id,
            "voice_settings": {
                "stability": stability,
                "similarity_boost": similarity_boost,
            },
        }
    ).encode("utf-8")
    request = Request(
        url,
        data=body,
        method="POST",
        headers={
            "Accept": "audio/mpeg",
            "Content-Type": "application/json",
            "xi-api-key": api_key,
        },
    )
    with urlopen(request, timeout=120) as response:
        return response.read()


def parse_dialogue(script):
    turns = []
    speaker_pattern = re.compile(r"^([A-Za-z][A-Za-z .'-]{0,40}):\s+(.+)$")
    for raw_line in script.splitlines():
        line = raw_line.strip()
        if not line:
            continue
        match = speaker_pattern.match(line)
        if not match:
            return []
        turns.append({"speaker": match.group(1).strip(), "text": match.group(2).strip()})
    unique_speakers = []
    for turn in turns:
        if turn["speaker"] not in unique_speakers:
            unique_speakers.append(turn["speaker"])
    if len(unique_speakers) < 2:
        return []
    return turns


def parse_name_set(value, defaults):
    names = {name.lower() for name in defaults}
    if value:
        names.update(name.strip().lower() for name in value.split(",") if name.strip())
    return names


def parse_speaker_voice_map(value):
    speaker_map = {}
    if not value:
        return speaker_map

    for raw_item in value.split(","):
        item = raw_item.strip()
        if not item or "=" not in item:
            continue
        speaker, voice_id = item.split("=", 1)
        speaker = speaker.strip().lower()
        voice_id = voice_id.strip()
        if speaker and voice_id:
            speaker_map[speaker] = voice_id

    return speaker_map


def build_speaker_voice_map(turns, female_voice_id, male_voice_id, female_speakers, male_speakers):
    speaker_to_voice = {}
    explicit_voice_map = parse_speaker_voice_map(os.environ.get("ELEVENLABS_SPEAKER_VOICE_IDS"))
    fallback_index = 0
    fallback_voices = [female_voice_id, male_voice_id]

    for turn in turns:
        speaker = turn["speaker"]
        key = speaker.lower()
        if speaker in speaker_to_voice:
            continue
        if key in explicit_voice_map:
            speaker_to_voice[speaker] = explicit_voice_map[key]
        elif key in female_speakers:
            speaker_to_voice[speaker] = female_voice_id
        elif key in male_speakers:
            speaker_to_voice[speaker] = male_voice_id
        else:
            speaker_to_voice[speaker] = fallback_voices[fallback_index % len(fallback_voices)]
            fallback_index += 1

    return speaker_to_voice


def synthesize_dialogue(script, output_path, api_key, voice_ids, model_id, output_format):
    turns = parse_dialogue(script)
    if not turns:
        raise RuntimeError("Dialogue synthesis requires at least two speaker-labeled lines.")

    speaker_to_voice = build_speaker_voice_map(
        turns,
        voice_ids[0],
        voice_ids[1] if len(voice_ids) > 1 else voice_ids[0],
        parse_name_set(os.environ.get("ELEVENLABS_FEMALE_SPEAKERS"), DEFAULT_FEMALE_SPEAKERS),
        parse_name_set(os.environ.get("ELEVENLABS_MALE_SPEAKERS"), DEFAULT_MALE_SPEAKERS),
    )

    params = urlencode({"output_format": output_format})
    url = f"{API_BASE}/text-to-dialogue?{params}"
    body = json.dumps(
        {
            "model_id": model_id,
            "inputs": [
                {
                    "text": turn["text"],
                    "voice_id": speaker_to_voice[turn["speaker"]],
                }
                for turn in turns
            ],
        }
    ).encode("utf-8")
    request = Request(
        url,
        data=body,
        method="POST",
        headers={
            "Accept": "audio/mpeg",
            "Content-Type": "application/json",
            "xi-api-key": api_key,
        },
    )
    with urlopen(request, timeout=180) as response:
        output_path.write_bytes(response.read())


def synthesize_dialogue_with_tts_segments(
    script,
    output_path,
    api_key,
    voice_ids,
    model_id,
    output_format,
    stability,
    similarity_boost,
):
    turns = parse_dialogue(script)
    if not turns:
        raise RuntimeError("Segmented dialogue synthesis requires speaker-labeled lines.")

    female_speakers = parse_name_set(os.environ.get("ELEVENLABS_FEMALE_SPEAKERS"), DEFAULT_FEMALE_SPEAKERS)
    male_speakers = parse_name_set(os.environ.get("ELEVENLABS_MALE_SPEAKERS"), DEFAULT_MALE_SPEAKERS)
    speaker_to_voice = build_speaker_voice_map(
        turns,
        voice_ids[0],
        voice_ids[1] if len(voice_ids) > 1 else voice_ids[0],
        female_speakers,
        male_speakers,
    )
    chunks = []
    for turn in turns:
        speaker = turn["speaker"]
        chunks.append(
            synthesize_bytes(
                turn["text"],
                api_key,
                speaker_to_voice[speaker],
                model_id,
                output_format,
                stability,
                similarity_boost,
            )
        )

    output_path.write_bytes(b"".join(chunks))


def fail_from_http(error):
    try:
        body = error.read().decode("utf-8", errors="replace")
    except Exception:
        body = ""
    message = f"ElevenLabs API error {error.code}: {error.reason}"
    if body:
        message += f"\n{body}"
    raise RuntimeError(message)


def main():
    load_local_env()

    parser = argparse.ArgumentParser(description="Generate JaraLingua listening MP3 files with ElevenLabs.")
    parser.add_argument("--scripts", default=str(DEFAULT_SCRIPT_FILE), help="Markdown file with listening scripts.")
    parser.add_argument("--out-dir", default=str(DEFAULT_OUTPUT_DIR), help="Folder where MP3 files will be saved.")
    parser.add_argument("--voice-id", default=os.environ.get("ELEVENLABS_VOICE_ID"), help="ElevenLabs voice ID.")
    parser.add_argument("--voice-id-2", default=os.environ.get("ELEVENLABS_VOICE_ID_2"), help="Second ElevenLabs voice ID for dialogue scripts.")
    parser.add_argument("--model-id", default=os.environ.get("ELEVENLABS_MODEL_ID", "eleven_multilingual_v2"), help="ElevenLabs model ID.")
    parser.add_argument("--dialogue-model-id", default=os.environ.get("ELEVENLABS_DIALOGUE_MODEL_ID", "eleven_v3"), help="ElevenLabs model ID for the text-to-dialogue endpoint.")
    parser.add_argument(
        "--dialogue-mode",
        choices=["tts-stitch", "text-to-dialogue"],
        default=os.environ.get("ELEVENLABS_DIALOGUE_MODE", "tts-stitch"),
        help="Use tts-stitch for free-plan-friendly multi-voice audio, or text-to-dialogue for ElevenLabs dialogue endpoint.",
    )
    parser.add_argument("--output-format", default=os.environ.get("ELEVENLABS_OUTPUT_FORMAT", "mp3_44100_128"), help="Output format, for example mp3_44100_128.")
    parser.add_argument("--stability", type=float, default=float(os.environ.get("ELEVENLABS_STABILITY", "0.55")), help="Voice stability from 0 to 1.")
    parser.add_argument("--similarity-boost", type=float, default=float(os.environ.get("ELEVENLABS_SIMILARITY_BOOST", "0.80")), help="Voice similarity boost from 0 to 1.")
    parser.add_argument("--list-voices", action="store_true", help="List available voices and exit.")
    parser.add_argument("--only", help="Generate only one file name from the scripts file.")
    parser.add_argument("--overwrite", action="store_true", help="Overwrite existing MP3 files.")
    parser.add_argument("--dry-run", action="store_true", help="Show what would be generated without calling the API.")
    args = parser.parse_args()

    api_key = os.environ.get("ELEVENLABS_API_KEY")
    if not api_key:
        print(
            "Missing ELEVENLABS_API_KEY. Create elevenlabs.local.env from elevenlabs.example.env "
            "or set the variable in Windows before running this script.",
            file=sys.stderr,
        )
        return 2

    if args.list_voices:
        try:
            list_voices(api_key)
        except HTTPError as error:
            fail_from_http(error)
        except URLError as error:
            raise RuntimeError(f"Network error: {error}") from error
        return 0

    if not args.voice_id:
        print(
            "Missing ELEVENLABS_VOICE_ID. Run this script with --list-voices, choose a voice_id, "
            "then add it to elevenlabs.local.env.",
            file=sys.stderr,
        )
        return 2

    scripts_path = Path(args.scripts)
    output_dir = Path(args.out_dir)
    output_dir.mkdir(parents=True, exist_ok=True)
    items = parse_scripts(scripts_path)
    if args.only:
        items = [item for item in items if item["file"] == args.only]

    if not items:
        print("No listening scripts found.")
        return 1

    for item in items:
        output_path = output_dir / item["file"]
        if output_path.exists() and not args.overwrite:
            print(f"Skipping existing file: {output_path}")
            continue

        dialogue_turns = parse_dialogue(item["script"])
        mode = "dialogue" if dialogue_turns else "single voice"
        print(f"Generating {output_path.name}: {item['title']} ({mode})")
        if args.dry_run:
            continue

        try:
            if dialogue_turns:
                voice_ids = [args.voice_id]
                if args.voice_id_2 and args.voice_id_2 != args.voice_id:
                    voice_ids.append(args.voice_id_2)
                if len(voice_ids) < 2:
                    print(
                        "Dialogue script detected, but ELEVENLABS_VOICE_ID_2 is missing. "
                        "Using one voice for all speakers.",
                        file=sys.stderr,
                    )
                if args.dialogue_mode == "text-to-dialogue":
                    synthesize_dialogue(
                        item["script"],
                        output_path,
                        api_key,
                        voice_ids,
                        args.dialogue_model_id,
                        args.output_format,
                    )
                else:
                    synthesize_dialogue_with_tts_segments(
                        item["script"],
                        output_path,
                        api_key,
                        voice_ids,
                        args.model_id,
                        args.output_format,
                        args.stability,
                        args.similarity_boost,
                    )
            else:
                synthesize(
                    item["script"],
                    output_path,
                    api_key,
                    args.voice_id,
                    args.model_id,
                    args.output_format,
                    args.stability,
                    args.similarity_boost,
                )
        except HTTPError as error:
            fail_from_http(error)
        except URLError as error:
            raise RuntimeError(f"Network error: {error}") from error

    print("Done.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
