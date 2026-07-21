#!/usr/bin/env python3
"""Contrôles de cohérence des examens finaux de français A1.1 et A1.2.

Cette suite ne démarre aucun serveur et n'appelle aucun service externe. Elle
valide les banques JSON livrées avec le site, le lien entre les questions
d'écoute et leur transcription canonique, ainsi que l'asset audio privé A1.2.
"""

from __future__ import annotations

import json
import importlib.util
import re
import unicodedata
import unittest
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parents[1]
EXAM_PATHS = {
    "Niveau 1": ROOT / "data" / "french1-final-exam.local.json",
    "Niveau 2": ROOT / "data" / "french2-final-exam.local.json",
}
N2_SCRIPT_PATH = ROOT / "server" / "private_assets" / "french2-final-exam-audio-script.md"
N2_AUDIO_PATH = ROOT / "server" / "private_assets" / "french2-final-exam-audio.mp3"
PROGRESS_API_PATH = ROOT / "server" / "progress_api.py"
EXAM_HTML_PATHS = {
    "Niveau 1": ROOT / "frances" / "Niveau 1" / "examen-final.html",
    "Niveau 2": ROOT / "frances" / "Niveau 2" / "examen-final.html",
}

EXPECTED_SECTION_POINTS = {
    "vocabulaire": 15,
    "grammaire": 15,
    "lecture": 10,
    "ecoute": 10,
}

EXPECTED_VOCABULARY_ANSWERS = {
    "Niveau 1": [
        "grand-mère", "cinéma", "serveur / serveuse", "professeur / professeure",
        "salle de bains", "frère", "four", "pharmacie", "boulanger / boulangère",
        "salle à manger", "oncle", "fenêtre", "hôpital", "réfrigérateur", "lit",
    ],
    "Niveau 2": [
        "manteau", "prend une douche", "eau", "se brosse les dents", "bus", "arrêt",
        "lit", "boulangerie", "cinéma", "petit déjeuner", "veste", "chaud", "banane",
        "chaussures", "casquette",
    ],
}

# Fragments entendus qui justifient sans ambiguïté chaque bonne réponse.
# Ils sont comparés après normalisation des accents, apostrophes et signes.
LISTENING_EVIDENCE = {
    "Niveau 1": {
        "l1": ("vingt-deux ans",),
        "l2": ("j’habite à Envigado",),
        "l3": ("avec mon père, ma sœur et mon petit frère",),
        "l4": ("petit, mais confortable",),
        "l5": ("ma chambre est près de la salle de bains",),
        "l6": ("mon cahier de français, mon téléphone et une petite lampe",),
        "l7": ("ma sœur est infirmière",),
        "l8": ("j’étudie le soir",),
        "l9": ("je viens de rentrer à la maison",),
        "l10": (
            "les nombres, les professions, la famille, la description physique",
            "les pièces de la maison",
        ),
    },
    "Niveau 2": {
        "l1": ("j’ai mal à la gorge",),
        "l2": ("une soupe, du riz et de l’eau",),
        "l3": ("il n’a pas très faim",),
        "l4": ("du vent et quelques nuages",),
        "l5": ("un pantalon noir et une chemise blanche",),
        "l6": ("il a souvent froid quand il y a du vent",),
        "l7": ("plus grand que son studio", "il coûte plus cher"),
        "l8": ("le bureau est près de la fenêtre",),
        "l9": ("continuer tout droit", "tourner à gauche", "traverser la rue"),
        "l10": ("nous allons demander notre chemin à quelqu’un",),
    },
}

MOJIBAKE_MARKERS = (
    "Ã",
    "Â",
    "â€™",
    "â€œ",
    "â€",
    "ðŸ",
    "ï¿½",
    "�",
)


def load_bundle(path: Path) -> dict[str, Any]:
    with path.open("r", encoding="utf-8") as source:
        return json.load(source)


def load_progress_api():
    """Importe le module sans lancer son serveur HTTP (protégé par __main__)."""

    spec = importlib.util.spec_from_file_location("jaralingua_progress_api_exam_tests", PROGRESS_API_PATH)
    if spec is None or spec.loader is None:
        raise RuntimeError(f"Impossible de charger {PROGRESS_API_PATH}")
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def iter_strings(value: Any, location: str = "root"):
    if isinstance(value, str):
        yield location, value
    elif isinstance(value, dict):
        for key, child in value.items():
            yield from iter_strings(child, f"{location}.{key}")
    elif isinstance(value, list):
        for index, child in enumerate(value):
            yield from iter_strings(child, f"{location}[{index}]")


def normalized_words(value: str) -> str:
    decomposed = unicodedata.normalize("NFKD", value.casefold())
    without_marks = "".join(char for char in decomposed if not unicodedata.combining(char))
    return " ".join(re.findall(r"[a-z0-9]+", without_marks))


def listening_section(exam: dict[str, Any]) -> dict[str, Any]:
    return next(section for section in exam["sections"] if section["id"] == "ecoute")


def script_spoken_text(markdown: str) -> str:
    paragraphs: list[str] = []
    for line in markdown.splitlines():
        stripped = line.strip()
        if not stripped.startswith("Narratrice:"):
            continue
        spoken = stripped.removeprefix("Narratrice:").strip()
        spoken = re.sub(r"<break\s+time=[\"']\d+(?:\.\d+)?s[\"']\s*/>", " ", spoken)
        paragraphs.append(spoken.strip())
    return " ".join(paragraphs)


def parse_mp3_frames(payload: bytes) -> tuple[int, float]:
    """Parse suffisamment de MPEG audio pour détecter troncature/corruption.

    Retourne (nombre de trames, durée estimée). L'asset attendu est du MPEG-1
    Layer III; le parseur accepte aussi MPEG-2/2.5 Layer III.
    """

    position = 0
    if payload.startswith(b"ID3"):
        if len(payload) < 10:
            raise AssertionError("En-tête ID3 tronqué")
        if any(byte & 0x80 for byte in payload[6:10]):
            raise AssertionError("Taille ID3 synchsafe invalide")
        tag_size = (
            (payload[6] << 21)
            | (payload[7] << 14)
            | (payload[8] << 7)
            | payload[9]
        )
        position = 10 + tag_size

    bitrate_mpeg1_l3 = (0, 32, 40, 48, 56, 64, 80, 96, 112, 128, 160, 192, 224, 256, 320, 0)
    bitrate_mpeg2_l3 = (0, 8, 16, 24, 32, 40, 48, 56, 64, 80, 96, 112, 128, 144, 160, 0)
    sample_rates = {
        3: (44100, 48000, 32000),  # MPEG-1
        2: (22050, 24000, 16000),  # MPEG-2
        0: (11025, 12000, 8000),   # MPEG-2.5
    }
    frames = 0
    seconds = 0.0

    while position < len(payload):
        if position + 4 > len(payload):
            raise AssertionError(f"Dernière trame MP3 tronquée à l’octet {position}")
        header = int.from_bytes(payload[position : position + 4], "big")
        if (header >> 21) & 0x7FF != 0x7FF:
            raise AssertionError(f"Synchronisation MP3 perdue à l’octet {position}")

        version = (header >> 19) & 0b11
        layer = (header >> 17) & 0b11
        bitrate_index = (header >> 12) & 0b1111
        sample_rate_index = (header >> 10) & 0b11
        padding = (header >> 9) & 0b1
        if version == 1 or layer != 1 or bitrate_index in (0, 15) or sample_rate_index == 3:
            raise AssertionError(f"En-tête MPEG Layer III invalide à l’octet {position}")

        sample_rate = sample_rates[version][sample_rate_index]
        bitrate_table = bitrate_mpeg1_l3 if version == 3 else bitrate_mpeg2_l3
        bitrate = bitrate_table[bitrate_index] * 1000
        samples_per_frame = 1152 if version == 3 else 576
        coefficient = 144 if version == 3 else 72
        frame_size = (coefficient * bitrate // sample_rate) + padding
        if position + frame_size > len(payload):
            raise AssertionError(f"Trame MP3 incomplète à l’octet {position}")

        position += frame_size
        frames += 1
        seconds += samples_per_frame / sample_rate

    return frames, seconds


class FrenchFinalExamTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls) -> None:
        cls.bundles = {name: load_bundle(path) for name, path in EXAM_PATHS.items()}
        cls.progress_api = load_progress_api()

    def test_exam_versions_and_point_structure(self) -> None:
        for level, bundle in self.bundles.items():
            with self.subTest(level=level):
                exam = bundle["exam"]
                self.assertIsInstance(exam.get("version"), str)
                self.assertTrue(exam["version"].strip(), "La version de l’examen est obligatoire")
                self.assertEqual(exam.get("totalPoints"), 50)

                sections = {section["id"]: section for section in exam["sections"]}
                self.assertEqual(set(sections), set(EXPECTED_SECTION_POINTS))
                for section_id, expected_points in EXPECTED_SECTION_POINTS.items():
                    section = sections[section_id]
                    self.assertEqual(section["points"], expected_points)
                    self.assertEqual(
                        sum(question["points"] for question in section["questions"]),
                        expected_points,
                        f"Somme incorrecte dans {section_id}",
                    )

    def test_exactly_fifteen_vocabulary_questions(self) -> None:
        for level, bundle in self.bundles.items():
            with self.subTest(level=level):
                section = next(item for item in bundle["exam"]["sections"] if item["id"] == "vocabulaire")
                self.assertEqual(len(section["questions"]), 15)
                self.assertTrue(all(question["points"] == 1 for question in section["questions"]))
                correct_answers = [
                    question["options"][question["answer"]]
                    for question in section["questions"]
                ]
                self.assertEqual(correct_answers, EXPECTED_VOCABULARY_ANSWERS[level])

    def test_question_ids_and_answers_are_valid(self) -> None:
        for level, bundle in self.bundles.items():
            with self.subTest(level=level):
                questions = [
                    question
                    for section in bundle["exam"]["sections"]
                    for question in section["questions"]
                ]
                ids = [question["id"] for question in questions]
                self.assertEqual(len(ids), len(set(ids)), "Les identifiants doivent être uniques")
                for question in questions:
                    if question["type"] == "mcq":
                        self.assertIs(type(question["answer"]), int)
                        self.assertGreaterEqual(question["answer"], 0)
                        self.assertLess(question["answer"], len(question["options"]))
                        self.assertGreaterEqual(len(question["options"]), 2)
                    elif question["type"] == "truefalse":
                        self.assertIs(type(question["answer"]), bool)
                    else:
                        self.fail(f"Type de question non pris en charge: {question['type']}")

    def test_niveau_two_has_no_mojibake_or_replacement_question_marks(self) -> None:
        bundle = self.bundles["Niveau 2"]
        for location, value in iter_strings(bundle):
            with self.subTest(location=location):
                for marker in MOJIBAKE_MARKERS:
                    self.assertNotIn(marker, value, f"Mojibake {marker!r} dans {location}")
                # Un point d'interrogation n'est légitime ici qu'en fin de question.
                without_terminal_question = value.strip().removesuffix("?")
                self.assertNotIn("?", without_terminal_question, f"Signe de remplacement suspect dans {location}")
                self.assertFalse(
                    any(0x80 <= ord(character) <= 0x9F for character in value),
                    f"Caractère de contrôle C1 dans {location}",
                )

    def test_exam_grammar_stays_inside_the_taught_scope(self) -> None:
        n1_exam = self.bundles["Niveau 1"]["exam"]
        n1_blocks = {
            question.get("block")
            for section in n1_exam["sections"]
            if section["id"] == "grammaire"
            for question in section["questions"]
        }
        self.assertIn("Futur proche", n1_blocks)

        n2_exam = self.bundles["Niveau 2"]["exam"]
        n2_serialized = json.dumps(n2_exam, ensure_ascii=False).casefold()
        self.assertNotIn("il y aura", n2_serialized)
        self.assertNotIn("demanderons", n2_serialized)
        n2_blocks = {
            question.get("block")
            for section in n2_exam["sections"]
            if section["id"] == "grammaire"
            for question in section["questions"]
        }
        for expected in {
            "Futur proche",
            "Accord de l’adjectif",
            "Négation élargie",
            "Verbes pronominaux",
            "Il faut + infinitif",
        }:
            self.assertIn(expected, n2_blocks)

    def test_listening_questions_are_supported_by_canonical_transcript(self) -> None:
        for level, bundle in self.bundles.items():
            with self.subTest(level=level):
                exam = bundle["exam"]
                transcript = exam.get("transcript", "")
                normalized_transcript = normalized_words(transcript)
                self.assertGreaterEqual(len(normalized_transcript.split()), 100)

                questions = listening_section(exam)["questions"]
                question_ids = {question["id"] for question in questions}
                self.assertEqual(question_ids, set(LISTENING_EVIDENCE[level]))
                for question_id, fragments in LISTENING_EVIDENCE[level].items():
                    for fragment in fragments:
                        self.assertIn(
                            normalized_words(fragment),
                            normalized_transcript,
                            f"{level} {question_id}: preuve absente de la transcription",
                        )

    def test_niveau_two_script_matches_canonical_transcript(self) -> None:
        script = N2_SCRIPT_PATH.read_text(encoding="utf-8")
        spoken = script_spoken_text(script)
        self.assertGreaterEqual(len(re.findall(r"\b[\w’'-]+\b", spoken)), 100)
        self.assertEqual(
            normalized_words(spoken),
            normalized_words(self.bundles["Niveau 2"]["exam"]["transcript"]),
        )
        self.assertEqual(len(re.findall(r"<break\s+time=[\"']1\.5s[\"']\s*/>", script)), 4)

    def test_niveau_two_mp3_is_complete_and_plausible(self) -> None:
        self.assertTrue(N2_AUDIO_PATH.is_file(), "L’audio privé A1.2 est absent")
        payload = N2_AUDIO_PATH.read_bytes()
        self.assertGreater(len(payload), 100_000, "L’audio A1.2 est anormalement petit")
        frames, duration = parse_mp3_frames(payload)
        self.assertGreater(frames, 1_000, "Nombre de trames MP3 insuffisant")
        self.assertGreaterEqual(duration, 60.0, "L’audio A1.2 est trop court pour la transcription")
        self.assertLessEqual(duration, 120.0, "L’audio A1.2 est anormalement long")

    def test_server_rejects_incomplete_or_invalid_final_exam_answers(self) -> None:
        validate = self.progress_api.validate_final_exam_answers
        for level, bundle in self.bundles.items():
            with self.subTest(level=level):
                exam = bundle["exam"]
                questions = [
                    question
                    for section in exam["sections"]
                    for question in section["questions"]
                ]
                complete = {question["id"]: question["answer"] for question in questions}
                validate(exam, complete)

                incomplete = dict(complete)
                incomplete.pop(questions[0]["id"])
                with self.assertRaisesRegex(ValueError, "^incomplete_answers$"):
                    validate(exam, incomplete)

                mcq = next(question for question in questions if question["type"] == "mcq")
                invalid_index = dict(complete)
                invalid_index[mcq["id"]] = len(mcq["options"])
                with self.assertRaisesRegex(ValueError, "^invalid_answer$"):
                    validate(exam, invalid_index)

                invalid_boolean = dict(complete)
                invalid_boolean[mcq["id"]] = True
                with self.assertRaisesRegex(ValueError, "^invalid_answer$"):
                    validate(exam, invalid_boolean)

        with self.assertRaisesRegex(ValueError, "^invalid_answers$"):
            validate(self.bundles["Niveau 1"]["exam"], [])

    def test_high_stakes_student_matcher_uses_only_registered_login(self) -> None:
        match = self.progress_api.registered_student_for_profile
        student = {
            "id": "1001",
            "fullName": "Ana Ramírez",
            "email": "ana@correo.iue.edu.co",
            "emailAliases": ["geovo28@gmail.com"],
            "nameAliases": ["Ana Ramírez", "Ana Ramirez"],
            "username": "ana.local",
        }
        grades = {"students": [student]}

        self.assertIs(match({"email": "  ANA@CORREO.IUE.EDU.CO  ", "name": "Autre nom"}, grades), student)
        self.assertIs(match({"email": "GEOVO28@GMAIL.COM", "name": "Autre nom"}, grades), student)
        self.assertIs(match({"email": "ANA.LOCAL", "name": "Autre nom"}, grades), student)
        self.assertIsNone(
            match({"email": "inconnue@gmail.com", "name": "Ana Ramírez"}, grades),
            "Un nom ressemblant ne doit jamais autoriser un examen à enjeu élevé",
        )
        self.assertIsNone(match({"name": "Ana Ramírez"}, grades))

    def test_evaluation_defaults_preserve_teacher_title_and_weight(self) -> None:
        ensure = self.progress_api.ensure_evaluation_defaults
        grades = {
            "evaluations": [
                {
                    "id": "finalExam",
                    "title": "Titre personnalisé par la professeure",
                    "weight": 17,
                }
            ]
        }
        template = {
            "id": "finalExam",
            "title": "Examen final par défaut",
            "weight": 20,
            "kind": "exam",
            "editable": True,
        }

        changed = ensure(grades, template)
        evaluation = grades["evaluations"][0]
        self.assertTrue(changed, "Les champs manquants du modèle doivent être ajoutés")
        self.assertEqual(evaluation["title"], "Titre personnalisé par la professeure")
        self.assertEqual(evaluation["weight"], 17)
        self.assertEqual(evaluation["kind"], "exam")
        self.assertIs(evaluation["editable"], True)
        self.assertFalse(ensure(grades, template), "Un second passage ne doit rien écraser")

    def test_exam_pages_include_submission_resilience_contract(self) -> None:
        required_fragments = {
            "version envoyée au serveur": 'JSON.stringify({ answers, examVersion: currentExam?.version || "" })',
            "clé de brouillon versionnée": "const DRAFT_PREFIX =",
            "sauvegarde du brouillon": "sessionStorage.setItem(draftKey()",
            "restauration du brouillon": "function restoreDraft()",
            "verrou audio à l’envoi": "if (!audioReady)",
            "contrôle audio du bouton": '|| !audioReady || submitting',
            "bouton de réessai audio": "data-audio-retry",
            "réessai relié au chargeur": 'addEventListener("click", loadProtectedAudio)',
            "questions manquantes signalées": 'card.classList.add("is-missing")',
            "protection contre focus pendant examen": "if (examInProgress || stateUpdating) return;",
            "absence de recharge différée pendant examen": "if (!examInProgress && !stateUpdating) loadState();",
        }
        for level, path in EXAM_HTML_PATHS.items():
            html = path.read_text(encoding="utf-8")
            with self.subTest(level=level):
                for feature, fragment in required_fragments.items():
                    self.assertIn(fragment, html, f"Fonction technique absente: {feature}")
                self.assertRegex(
                    html,
                    r"function loadState\(options = \{\}\) \{\s*if \(loading \|\| \(examInProgress && options\.force !== true\)\) return;",
                    "loadState doit refuser une recharge silencieuse pendant l’examen",
                )


if __name__ == "__main__":
    unittest.main(verbosity=2)
