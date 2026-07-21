#!/usr/bin/env python3
"""Contrôles de cohérence des examens finaux de français A1.1 et A1.2.

Cette suite ne démarre aucun serveur et n'appelle aucun service externe. Elle
valide les banques JSON livrées avec le site, le lien entre les questions
d'écoute et leur transcription canonique, ainsi que l'asset audio privé A1.2.
"""

from __future__ import annotations

import hashlib
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
PREFLIGHT_AUDIO_PATH = ROOT / "server" / "private_assets" / "french-final-exam-preflight-audio.mp3"
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

EXPECTED_EXAM_VERSION = "2026-07-20-final-audit-v2"

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

# Empreinte du contenu intégral (consigne, choix et réponse) des 15 questions
# remises par la professeure. Elle empêche qu'une correction apportée ailleurs
# dans l'examen modifie silencieusement cette banque validée.
EXPECTED_VOCABULARY_FINGERPRINTS = {
    "Niveau 1": "378571fe1e6fdd6c02545d80e706a8b3970e89717f70b75d9c68797505abb622",
    "Niveau 2": "57f50447665fcef1b0f97fafe4137244f217c6138f421b95cd6cb086a8e216a0",
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


def section_by_id(exam: dict[str, Any], section_id: str) -> dict[str, Any]:
    return next(section for section in exam["sections"] if section["id"] == section_id)


def question_by_id(exam: dict[str, Any], question_id: str) -> dict[str, Any]:
    return next(
        question
        for section in exam["sections"]
        for question in section["questions"]
        if question["id"] == question_id
    )


def canonical_fingerprint(value: Any) -> str:
    payload = json.dumps(
        value,
        ensure_ascii=False,
        sort_keys=True,
        separators=(",", ":"),
    ).encode("utf-8")
    return hashlib.sha256(payload).hexdigest()


def word_ngrams(value: str, size: int) -> set[tuple[str, ...]]:
    words = normalized_words(value).split()
    return {
        tuple(words[index : index + size])
        for index in range(max(0, len(words) - size + 1))
    }


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

    def test_exam_versions_match_the_final_audit_release(self) -> None:
        versions = {
            level: bundle["exam"].get("version")
            for level, bundle in self.bundles.items()
        }
        self.assertEqual(
            set(versions.values()),
            {EXPECTED_EXAM_VERSION},
            f"Les deux niveaux doivent partager la version {EXPECTED_EXAM_VERSION}: {versions}",
        )

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
                self.assertEqual(
                    canonical_fingerprint(section["questions"]),
                    EXPECTED_VOCABULARY_FINGERPRINTS[level],
                    "La banque de 15 questions de vocabulaire validée par la professeure a changé",
                )

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

    def test_niveau_two_reading_is_distinct_from_listening_scenario(self) -> None:
        exam = self.bundles["Niveau 2"]["exam"]
        reading = section_by_id(exam, "lecture")
        listening = listening_section(exam)
        reading_text = " ".join(reading.get("readingText", []))
        transcript = exam.get("transcript", "")

        self.assertGreaterEqual(len(normalized_words(reading_text).split()), 120)
        self.assertNotEqual(normalized_words(reading_text), normalized_words(transcript))

        # Des expressions ordinaires du niveau A1 peuvent naturellement se
        # répéter. En revanche, deux scénarios indépendants ne doivent pas
        # partager une part importante de suites de six mots consécutifs.
        reading_ngrams = word_ngrams(reading_text, 6)
        listening_ngrams = word_ngrams(transcript, 6)
        shared = reading_ngrams & listening_ngrams
        overlap = len(shared) / max(1, min(len(reading_ngrams), len(listening_ngrams)))
        self.assertLessEqual(
            overlap,
            0.05,
            f"La lecture A1.2 recycle trop l'écoute ({overlap:.1%} de suites partagées)",
        )

        reading_prompts = {normalized_words(question["prompt"]) for question in reading["questions"]}
        listening_prompts = {normalized_words(question["prompt"]) for question in listening["questions"]}
        self.assertTrue(
            reading_prompts.isdisjoint(listening_prompts),
            "Une question de lecture A1.2 duplique exactement une question d'écoute",
        )

    def test_listening_options_have_reasonably_balanced_lengths(self) -> None:
        for level, bundle in self.bundles.items():
            questions = listening_section(bundle["exam"])["questions"]
            sole_longest_correct = 0
            sole_shortest_correct = 0

            for question in questions:
                with self.subTest(level=level, question=question["id"]):
                    normalized_options = [normalized_words(option) for option in question["options"]]
                    self.assertEqual(
                        len(normalized_options),
                        len(set(normalized_options)),
                        "Deux options d'écoute sont identiques après normalisation",
                    )
                    word_counts = [len(option.split()) for option in normalized_options]
                    compact_lengths = [len(option.replace(" ", "")) for option in normalized_options]
                    shortest_words = min(word_counts)
                    longest_words = max(word_counts)
                    shortest_chars = min(compact_lengths)
                    longest_chars = max(compact_lengths)

                    # Tolère les formulations françaises naturelles (articles,
                    # prépositions, nombres composés), mais détecte une option
                    # d'un mot opposée à une phrase manifestement beaucoup plus longue.
                    self.assertLessEqual(longest_words, shortest_words * 2 + 2)
                    self.assertLessEqual(longest_chars, shortest_chars * 3 + 5)
                    if longest_words >= 7:
                        self.assertGreaterEqual(shortest_words, 3)

                    correct_length = word_counts[question["answer"]]
                    sole_longest_correct += int(
                        correct_length == longest_words and word_counts.count(correct_length) == 1
                    )
                    sole_shortest_correct += int(
                        correct_length == shortest_words and word_counts.count(correct_length) == 1
                    )

            # La longueur ne doit pas devenir un indice systématique de réponse.
            maximum_pattern = max(1, int(len(questions) * 0.60))
            self.assertLessEqual(sole_longest_correct, maximum_pattern, level)
            self.assertLessEqual(sole_shortest_correct, maximum_pattern, level)

    def test_targeted_grammar_and_vocabulary_questions_are_unambiguous(self) -> None:
        n1 = self.bundles["Niveau 1"]["exam"]
        n1_g12 = question_by_id(n1, "g12")
        self.assertEqual(n1_g12["options"][n1_g12["answer"]], "sur")
        self.assertEqual(
            {normalized_words(option) for option in n1_g12["options"]},
            {"sur", "sous", "derriere"},
            "Les distracteurs de g12 A1.1 doivent tous être des prépositions de lieu",
        )

        n2 = self.bundles["Niveau 2"]["exam"]
        n2_v12 = question_by_id(n2, "v12")
        # On conserve mot pour mot la question fournie par la professeure :
        # le cadre saisonnier et la construction « il fait » appellent
        # « chaud », tandis que les distracteurs décrivent plutôt un objet
        # ou le ciel avec une autre construction.
        self.assertEqual(n2_v12["prompt"], "En été, il fait souvent…")
        self.assertEqual(n2_v12["options"], ["chaud", "gris", "mouillé"])
        self.assertEqual(n2_v12["options"][n2_v12["answer"]], "chaud")

        n2_g12 = question_by_id(n2, "g12")
        self.assertIn("impératif", n2_g12["prompt"].casefold())
        self.assertIn("instruction", n2_g12["prompt"].casefold())
        self.assertEqual(n2_g12["options"], ["Vous allez", "Allez", "Aller"])
        self.assertEqual(n2_g12["options"][n2_g12["answer"]], "Allez")

        n2_g15 = question_by_id(n2, "g15")
        self.assertIn("il faut + infinitif", n2_g15["prompt"].casefold())
        self.assertEqual(n2_g15["options"], ["faut", "fait", "va"])
        self.assertEqual(n2_g15["options"][n2_g15["answer"]], "faut")

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

    def test_niveau_one_listening_uses_a1_pedagogical_tempo(self) -> None:
        html = EXAM_HTML_PATHS["Niveau 1"].read_text(encoding="utf-8")
        self.assertIn("audio.defaultPlaybackRate = 0.8", html)
        self.assertIn("audio.playbackRate = 0.8", html)
        self.assertIn("audio.preservesPitch = true", html)

    def test_shared_preflight_mp3_is_complete_and_plausible(self) -> None:
        self.assertTrue(PREFLIGHT_AUDIO_PATH.is_file(), "L’audio du test technique est absent")
        payload = PREFLIGHT_AUDIO_PATH.read_bytes()
        self.assertGreater(len(payload), 20_000, "L’audio du test technique est anormalement petit")
        frames, duration = parse_mp3_frames(payload)
        self.assertGreater(frames, 100, "Nombre de trames MP3 insuffisant pour le test technique")
        self.assertGreaterEqual(duration, 3.0, "Le test technique est trop court")
        self.assertLessEqual(duration, 15.0, "Le test technique est anormalement long")

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
            "version envoyée au serveur": 'examVersion: currentExam?.version || ""',
            "identifiant d’intention envoyé": "attemptId: currentAttemptId",
            "envoi automatique signalé": "autoSubmit })",
            "clé de brouillon versionnée": "const DRAFT_PREFIX =",
            "restauration du brouillon": "function restoreDraft()",
            "brouillon serveur": "async function saveServerDraft(answers)",
            "test technique préalable": "function preflightHtml()",
            "ordre stable individualisé": "attemptSeed",
            "temporisateur serveur": "function startTimer(timing = {}",
            "confirmation de fermeture active": "confirmClose: true",
            "publication irréversible": "Publication définitive des notes",
            "reçu de remise": "Reçu de remise",
            "suivi professeur": "function startMonitor()",
            "analyse pédagogique": "async function loadAnalytics()",
            "verrou audio à l’envoi": "if (!audioReady)",
            "contrôle audio du bouton": '|| !audioReady || submitting',
            "bouton de réessai audio": "data-audio-retry",
            "réessai relié au chargeur": 'addEventListener("click", loadProtectedAudio)',
            "questions manquantes signalées": 'card.classList.add("is-missing")',
            "gestion explicite du retour de fenêtre": 'window.addEventListener("focus"',
        }
        for level, path in EXAM_HTML_PATHS.items():
            html = path.read_text(encoding="utf-8")
            with self.subTest(level=level):
                for feature, fragment in required_fragments.items():
                    self.assertIn(fragment, html, f"Fonction technique absente: {feature}")
                self.assertTrue(
                    "sessionStorage.setItem(draftKey()" in html or "function writeLocalDraft(answers)" in html,
                    "La page doit conserver un brouillon local avant la synchronisation serveur",
                )
                self.assertRegex(
                    html,
                    r"function loadState\(options = \{\}\) \{\s*if \(loading \|\| \(examInProgress && options\.force !== true\)\) return;",
                    "loadState doit refuser une recharge silencieuse pendant l'examen",
                )

    def test_exam_pages_include_scoped_long_session_auth_contract(self) -> None:
        """Le token du fournisseur ne doit pas être un point unique de panne."""

        for level, path in EXAM_HTML_PATHS.items():
            html = path.read_text(encoding="utf-8")
            with self.subTest(level=level):
                for fragment in (
                    "const EXAM_AUTH_KEY =",
                    "examAccessToken",
                    "examAccessExp",
                    "examAccessUser",
                    "sessionStorage.setItem(EXAM_AUTH_KEY",
                    "sessionStorage.removeItem(EXAM_AUTH_KEY",
                    "showReconnectNotice",
                    "confirmedReceipt",
                    "clearExamAccess",
                    "data-auth-signout",
                ):
                    self.assertIn(fragment, html, f"Contrat de session longue absent: {fragment}")

                self.assertRegex(
                    html,
                    r"\$\{DRAFT_PREFIX\}:\$\{(?:identity\.examVersion|version)\}:\$\{(?:identity\.studentId|studentId)\}:\$\{(?:identity\.attemptId|attemptId)\}",
                    "La clé locale doit être immuable par niveau/version/étudiant/tentative",
                )
                self.assertIn(
                    "draftPendingAnswers = Object.assign({}, nextAnswers, draftPendingAnswers || {})",
                    html,
                    "Un 401 ou une panne ne doit pas jeter le lot en attente",
                )
                self.assertRegex(
                    html,
                    r"Object\.assign\(\{\}, (?:serverAnswers|result\.data\.answers), localAnswers\)",
                    "À la reprise, le serveur se fusionne d'abord et le brouillon local plus récent gagne",
                )

                audio_block = re.search(
                    r"async function loadProtectedAudio\(\) \{(?P<body>[\s\S]+?)\n\s*function formatTime",
                    html,
                )
                self.assertIsNotNone(audio_block)
                self.assertIn("401", audio_block.group("body"))
                self.assertIn(
                    "showReconnectNotice",
                    audio_block.group("body"),
                    "Le 401 du MP3 protégé doit activer une récupération non destructive",
                )
                self.assertIn(
                    '"exam"',
                    audio_block.group("body"),
                    "L’audio étudiant doit utiliser la crédential limitée à la tentative",
                )

                submitted_block = re.search(
                    r"function renderSubmitted\(result\) \{(?P<body>[\s\S]+?)\n\s*function renderStartGate",
                    html,
                )
                self.assertIsNotNone(submitted_block)
                submitted_body = submitted_block.group("body")
                self.assertIn("confirmedReceipt", submitted_body)
                self.assertIn("exactDraftKey", submitted_body)
                self.assertIn("clearExamAccess", submitted_body)
                self.assertIn("resultStudentId", submitted_body)
                self.assertIn("resultAttemptId", submitted_body)
                receipt_assignment = re.search(
                    r"const confirmedReceipt\s*=\s*(?P<expr>[^;]+);",
                    submitted_body,
                )
                self.assertIsNotNone(receipt_assignment)
                self.assertNotIn(
                    "submittedAt",
                    receipt_assignment.group("expr"),
                    "Une date de soumission seule ne constitue pas un reçu vérifiable",
                )

                for endpoint in ("API.monitor", "API.analytics", "API.transcript"):
                    self.assertRegex(
                        html,
                        re.escape(endpoint) + r"[^\n]{0,180}\"external\"",
                        f"La ruta docente {endpoint} nunca debe usar el bridge estudiantil",
                    )
                self.assertRegex(
                    html,
                    r"request\(API\.submit,[\s\S]{0,260}?\"exam\"\)",
                    "La entrega debe usar la credencial limitada a la tentativa",
                )
                self.assertRegex(
                    html,
                    r"request\(API\.draft,[\s\S]{0,360}?\"exam\"\)",
                    "Le brouillon serveur doit utiliser la crédential limitée à la tentative",
                )
                self.assertRegex(
                    html,
                    r"request\(API\.session,[\s\S]{0,420}?\"exam\"\)",
                    "Les événements d’une tentative active doivent utiliser le bridge",
                )
                self.assertRegex(
                    html,
                    r"request\(API\.preflight,[^\n]+\"external\"\)",
                    "El preflight debe exigir la identidad primaria",
                )

    def test_exam_pages_do_not_embed_answer_keys_or_question_banks(self) -> None:
        forbidden_key_patterns = (
            r"[\"']answer[\"']\s*:",
            r"\banswer\s*:",
            r"\b(?:correctAnswer|answerKey|solutionKey)\b",
            r"data-(?:correct-)?answer\s*=",
        )
        for level, path in EXAM_HTML_PATHS.items():
            html = path.read_text(encoding="utf-8")
            with self.subTest(level=level):
                for pattern in forbidden_key_patterns:
                    self.assertIsNone(
                        re.search(pattern, html, flags=re.IGNORECASE),
                        f"Clé de correction potentiellement exposée dans le HTML: {pattern}",
                    )

                # Les pages ne doivent pas embarquer une copie statique du
                # questionnaire : l'énoncé n'arrive que par l'API protégée.
                normalized_html = normalized_words(html)
                for section in self.bundles[level]["exam"]["sections"]:
                    for question in section["questions"]:
                        prompt = normalized_words(question["prompt"])
                        if len(prompt.split()) >= 5:
                            self.assertNotIn(
                                prompt,
                                normalized_html,
                                f"Question {question['id']} embarquée dans la page publique",
                            )


if __name__ == "__main__":
    unittest.main(verbosity=2)
