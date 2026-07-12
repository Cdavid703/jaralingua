from pathlib import Path
import re


ROOT = Path(__file__).resolve().parents[1]
INTERMEDIATE = ROOT / "ingles" / "intermediate"
ASSETS_JS = ROOT / "assets" / "js"
REPORT = ROOT / "docs" / "auditoria-audio-profesional-ingles-intermedio.md"

DANGEROUS_PATTERNS = [
    "speechSynthesis",
    "SpeechSynthesisUtterance",
    "webkitSpeechSynthesis",
    "responsiveVoice",
]

PRONUNCIATION_JS = [
    ASSETS_JS / f"english-intermediate-pronunciation-unit{unit}.js"
    for unit in range(1, 6)
]

PRONUNCIATION_PAGES = sorted(INTERMEDIATE.glob("pronunciation-unit-*.html"))
INTERMEDIATE_HTML = sorted(INTERMEDIATE.glob("*.html"))


def read_text(path: Path) -> str:
    return path.read_text(encoding="utf-8", errors="replace")


def relative(path: Path) -> str:
    return path.relative_to(ROOT).as_posix()


def dangerous_hits(paths):
    hits = []
    for path in paths:
        text = read_text(path)
        for pattern in DANGEROUS_PATTERNS:
            if pattern in text:
                for number, line in enumerate(text.splitlines(), start=1):
                    if pattern in line:
                        hits.append((path, number, pattern, line.strip()))
    return hits


def pronunciation_audio_refs():
    refs = []
    for js_path in PRONUNCIATION_JS:
        text = read_text(js_path)
        unit_match = re.search(r"unit(\d+)\.js$", js_path.name)
        unit = unit_match.group(1) if unit_match else "?"
        for audio in re.findall(r'audio:\s*"([^"]+\.mp3)"', text):
            refs.append((f"Unit {unit} pronunciation", audio, INTERMEDIATE / audio))
    return refs


def food_memory_audio_refs():
    page = INTERMEDIATE / "game-unit-5-food-vocabulary-memory.html"
    text = read_text(page)
    refs = []
    for slug in re.findall(r'\{slug:"([^"]+)"', text):
        refs.append(("Unit 5 food memory word", f"audio/unit-5-food-memory/{slug}-word.mp3", INTERMEDIATE / "audio" / "unit-5-food-memory" / f"{slug}-word.mp3"))
        refs.append(("Unit 5 food memory sentence", f"audio/unit-5-food-memory/{slug}-sentence.mp3", INTERMEDIATE / "audio" / "unit-5-food-memory" / f"{slug}-sentence.mp3"))
    return refs


def audio_status(refs):
    rows = []
    for area, ref, path in refs:
        exists = path.exists()
        size = path.stat().st_size if exists else 0
        status = "OK" if exists and size > 1000 else "MISSING_OR_SMALL"
        rows.append((area, ref, status, size))
    return rows


def main():
    checked_for_browser_voice = INTERMEDIATE_HTML + PRONUNCIATION_JS
    hits = dangerous_hits(checked_for_browser_voice)
    rows = audio_status(pronunciation_audio_refs() + food_memory_audio_refs())
    missing = [row for row in rows if row[2] != "OK"]

    lines = [
        "# Auditoria de audio profesional - Ingles intermedio",
        "",
        "Fecha: 2026-07-12",
        "",
        "## Objetivo",
        "",
        "Verificar que las actividades de ingles intermedio no dependan de voces del navegador para modelos de audio del estudiante. Los modelos deben usar MP3 locales generados profesionalmente, principalmente ElevenLabs.",
        "",
        "## Resultado ejecutivo",
        "",
        f"- Archivos revisados contra voz del navegador: {len(checked_for_browser_voice)}.",
        f"- Referencias MP3 revisadas: {len(rows)}.",
        f"- Patrones prohibidos encontrados: {len(hits)}.",
        f"- MP3 faltantes o sospechosamente pequenos: {len(missing)}.",
        "",
        "## Patrones prohibidos",
        "",
    ]

    if hits:
        lines.append("| Archivo | Linea | Patron | Fragmento |")
        lines.append("| --- | ---: | --- | --- |")
        for path, number, pattern, line in hits:
            safe_line = line.replace("|", "\\|")
            lines.append(f"| `{relative(path)}` | {number} | `{pattern}` | `{safe_line}` |")
    else:
        lines.append("OK. No se encontro `speechSynthesis`, `SpeechSynthesisUtterance`, `webkitSpeechSynthesis` ni `responsiveVoice` en ingles intermedio ni en los JS de pronunciacion intermedia.")

    lines.extend([
        "",
        "## MP3 revisados",
        "",
        "| Area | Archivo | Estado | Bytes |",
        "| --- | --- | --- | ---: |",
    ])
    for area, ref, status, size in rows:
        lines.append(f"| {area} | `{ref}` | {status} | {size} |")

    lines.extend([
        "",
        "## Decision tecnica aplicada",
        "",
        "- En las paginas de pronunciacion, las palabras resaltadas ya no reproducen audio del navegador; ahora abren una nota de pronunciacion y remiten al modelo profesional de la seccion.",
        "- En el juego Unit 5 Food Vocabulary Memory, si un MP3 profesional no carga, la pagina muestra aviso tecnico en lugar de improvisar con voz del navegador.",
        "- Esta auditoria debe ejecutarse antes de publicar nuevas actividades con audio en ingles intermedio.",
        "",
        "Comando:",
        "",
        "```powershell",
        "python tools/audit_intermediate_professional_audio_sources.py",
        "```",
    ])

    REPORT.write_text("\n".join(lines) + "\n", encoding="utf-8")
    print(f"checked_files={len(checked_for_browser_voice)} mp3_refs={len(rows)} forbidden_hits={len(hits)} missing_or_small={len(missing)}")
    print(f"report={REPORT}")
    if hits or missing:
        raise SystemExit(1)


if __name__ == "__main__":
    main()
