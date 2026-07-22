import json
import re
import sys
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from tools.test_french_final_exams import parse_mp3_frames


EXAM_PATH = ROOT / "data" / "french8-final-exam.local.json"
AUDIO_PATH = ROOT / "server" / "private_assets" / "french8-final-exam-audio.mp3"
HERO_PATH = (
    ROOT
    / "frances"
    / "Niveau 8"
    / "img"
    / "examen-final"
    / "examen-final-niveau8-ville-intelligente-hero-v1.png"
)


class French8FinalExamContentTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.bundle = json.loads(EXAM_PATH.read_text(encoding="utf-8"))
        cls.exam = cls.bundle["exam"]
        cls.sections = {section["id"]: section for section in cls.exam["sections"]}

    def test_exam_is_closed_by_default(self):
        state = self.bundle["state"]
        self.assertIs(state["isOpen"], False)
        self.assertIsNone(state["opensAt"])
        self.assertIsNone(state["closesAt"])
        self.assertIs(state["releaseResults"], False)

    def test_blueprint_is_exactly_15_15_10_10(self):
        expected = {"vocabulaire": 15, "grammaire": 15, "lecture": 10, "ecoute": 10}
        self.assertEqual(set(self.sections), set(expected))
        self.assertEqual(
            {key: len(self.sections[key]["questions"]) for key in expected},
            expected,
        )
        questions = [
            question
            for section in self.exam["sections"]
            for question in section["questions"]
        ]
        self.assertEqual(len(questions), 50)
        self.assertEqual(sum(question["points"] for question in questions), 50)
        self.assertEqual(self.exam["totalPoints"], 50)
        self.assertEqual(len({question["id"] for question in questions}), 50)

    def test_all_responses_are_closed_and_autogradable(self):
        allowed = {"mcq", "truefalse"}
        for section in self.exam["sections"]:
            for question in section["questions"]:
                self.assertIn(question["type"], allowed)
                if question["type"] == "mcq":
                    self.assertEqual(len(question["options"]), 3)
                    self.assertIn(question["answer"], range(3))
                else:
                    self.assertIsInstance(question["answer"], bool)

    def test_grammar_is_balanced_across_only_the_first_three_themes(self):
        blocks = [question["block"] for question in self.sections["grammaire"]["questions"]]
        for theme in (1, 2, 3):
            self.assertEqual(sum(block.startswith(f"Thème {theme} ·") for block in blocks), 5)
        self.assertFalse(any(re.search(r"Thème\s+[4-9]", block) for block in blocks))

    def test_subjunctive_past_distractors_test_auxiliaries_and_agreement(self):
        questions = {
            question["id"]: question
            for question in self.sections["grammaire"]["questions"]
        }
        expected = {
            "g11": (["aient transmis", "aient transmises", "soient transmises"], 0),
            "g12": (["aient arrivé", "soient arrivées", "soient arrivés"], 1),
            "g13": (["aient été installés", "soient été installés", "aient été installées"], 0),
            "g14": (["ait complètement effacées", "ait complètement effacé", "ait complètement effacés"], 0),
            "g15": (["se soient parlé", "se soient parlés", "s’aient parlé"], 0),
        }
        for question_id, (options, answer) in expected.items():
            self.assertEqual(questions[question_id]["options"], options)
            self.assertEqual(questions[question_id]["answer"], answer)

        combined = " ".join(
            option
            for question_id in expected
            for option in questions[question_id]["options"]
        )
        self.assertNotIn("a consulté", combined)
        self.assertNotIn("ait consulter", combined)

    def test_revised_items_are_unambiguous_and_semantically_close(self):
        questions = {
            question["id"]: question
            for section in self.exam["sections"]
            for question in section["questions"]
        }
        self.assertIn("reconnaît son erreur", questions["g1"]["prompt"])
        self.assertNotIn("avait dû consulter", questions["g1"]["options"])
        self.assertEqual(
            questions["g8"]["options"],
            [
                "Si nous aurions consulté les riverains, nous aurions évité le conflit.",
                "Si nous avions consulté les riverains, nous aurions évité le conflit.",
                "Si nous avions consulté les riverains, nous avions évité le conflit.",
            ],
        )
        self.assertEqual(
            questions["v5"]["options"][questions["v5"]["answer"]],
            "le droit au respect de la vie privée",
        )
        self.assertEqual(
            questions["l7"]["options"][questions["l7"]["answer"]],
            "Qu’ils aient été lancés sans que les usagers comprennent clairement l’usage de leurs données",
        )
        self.assertNotIn("parce que", questions["r8"]["prompt"])

    def test_reading_true_false_is_balanced(self):
        answers = [question["answer"] for question in self.sections["lecture"]["questions"]]
        self.assertEqual(answers.count(True), 5)
        self.assertEqual(answers.count(False), 5)

    def test_listening_is_natural_and_attributed(self):
        transcript = self.exam["transcript"]
        words = re.findall(r"\b[\wÀ-ÿ’'-]+\b", transcript, flags=re.UNICODE)
        self.assertGreaterEqual(len(words), 190)
        self.assertLessEqual(len(words), 250)
        self.assertEqual(transcript.count("aient été lancés"), 1)
        self.assertEqual(transcript.count("auraient pu renforcer"), 1)
        audio_text = self.sections["ecoute"]["audioText"]
        self.assertIn("Claire Legros", audio_text)
        self.assertIn("Le Monde", audio_text)
        self.assertEqual(
            self.sections["ecoute"]["audioSrc"],
            "/api/french8/final-exam/audio",
        )

    def test_private_audio_and_original_hero_are_present(self):
        self.assertTrue(AUDIO_PATH.is_file())
        self.assertGreater(AUDIO_PATH.stat().st_size, 100_000)
        frames, duration = parse_mp3_frames(AUDIO_PATH.read_bytes())
        self.assertGreater(frames, 2_500)
        self.assertGreaterEqual(duration, 75.0)
        self.assertLessEqual(duration, 100.0)
        self.assertTrue(HERO_PATH.is_file())
        self.assertGreater(HERO_PATH.stat().st_size, 250_000)

    def test_forbidden_later_theme_content_is_absent(self):
        content = json.dumps(self.exam, ensure_ascii=False).casefold()
        forbidden = (
            "passé simple",
            "discours rapporté",
            "mise en relief",
            "désinformation",
            "reconnaissance faciale",
            "verlan",
            "francophonie",
        )
        for term in forbidden:
            self.assertNotIn(term, content)


if __name__ == "__main__":
    unittest.main()
