from pathlib import Path
import re


ROOT = Path(__file__).resolve().parents[1]
BASIC = ROOT / "ingles" / "basico"
ASSETS_JS = ROOT / "assets" / "js"
REPORT = ROOT / "docs" / "auditoria-audio-profesional-ingles-basico-pronunciacion.md"

DANGEROUS_PATTERNS = [
    "speechSynthesis",
    "SpeechSynthesisUtterance",
    "webkitSpeechSynthesis",
    "responsiveVoice",
]

PRONUNCIATION_JS = [
    ASSETS_JS / f"english-basic-pronunciation-unit{unit}.js"
    for unit in range(1, 7)
]

PRONUNCIATION_PAGES = sorted(BASIC.glob("pronunciation-unit-*.html"))


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
            refs.append((f"Unit {unit} pronunciation", audio, BASIC / audio))
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
    checked = PRONUNCIATION_PAGES + PRONUNCIATION_JS
    hits = dangerous_hits(checked)
    rows = audio_status(pronunciation_audio_refs())
    missing = [row for row in rows if row[2] != "OK"]

    lines = [
        "# Auditoria de audio profesional - Ingles basico pronunciacion",
        "",
        "Fecha: 2026-07-12",
        "",
        "## Objetivo",
        "",
        "Verificar que las paginas de pronunciacion de ingles basico usen modelos MP3 profesionales y no dependan de voces del navegador para palabras individuales.",
        "",
        "## Resultado ejecutivo",
        "",
        f"- Archivos revisados contra voz del navegador: {len(checked)}.",
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
        lines.append("OK. No se encontro `speechSynthesis`, `SpeechSynthesisUtterance`, `webkitSpeechSynthesis` ni `responsiveVoice` en las paginas o JS de pronunciacion basica.")

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
        "- En pronunciacion basica, las palabras resaltadas ya no reproducen audio del navegador; ahora abren una nota de pronunciacion.",
        "- El modelo de escucha sigue siendo el MP3 profesional de cada seccion o reto final.",
        "- Si se reporta una palabra mal pronunciada en estos labs, el siguiente paso debe ser revisar el MP3 profesional correspondiente, no una voz sintetica del dispositivo.",
        "",
        "Comando:",
        "",
        "```powershell",
        "python tools/audit_basic_pronunciation_professional_audio_sources.py",
        "```",
    ])

    REPORT.write_text("\n".join(lines) + "\n", encoding="utf-8")
    print(f"checked_files={len(checked)} mp3_refs={len(rows)} forbidden_hits={len(hits)} missing_or_small={len(missing)}")
    print(f"report={REPORT}")
    if hits or missing:
        raise SystemExit(1)


if __name__ == "__main__":
    main()
