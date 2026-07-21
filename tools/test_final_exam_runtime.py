#!/usr/bin/env python3
"""Unit tests for the pure final-exam runtime helpers."""

from __future__ import annotations

import json
import pathlib
import sys
import unittest


REPO_ROOT = pathlib.Path(__file__).resolve().parents[1]
if str(REPO_ROOT) not in sys.path:
    sys.path.insert(0, str(REPO_ROOT))

from server.final_exam_runtime import (  # noqa: E402
    aggregate_exam_statistics,
    deterministic_exam_seed,
    exam_timing,
    sanitize_partial_draft,
    submission_receipt_code,
    validate_partial_draft,
    verify_submission_receipt,
)


EXAM = {
    "id": "fr1-final",
    "version": "2026-07-20",
    "sections": [
        {
            "id": "vocabulaire",
            "title": "Vocabulaire",
            "questions": [
                {
                    "id": "v1",
                    "type": "mcq",
                    "prompt": "On dort dans un...",
                    "options": ["lit", "four", "bus"],
                    "answer": 0,
                    "points": 1,
                },
                {
                    "id": "v2",
                    "type": "truefalse",
                    "prompt": "Un oncle est un membre de la famille.",
                    "answer": True,
                    "points": 1,
                },
            ],
        },
        {
            "id": "lecture",
            "title": "Compréhension écrite",
            "questions": [
                {
                    "id": "r1",
                    "type": "mcq",
                    "prompt": "Où habite Camille ?",
                    "options": ["Envigado", "Lyon", "Paris"],
                    "answer": 0,
                    "points": 2,
                }
            ],
        },
    ],
}


class DeterministicSeedTests(unittest.TestCase):
    def test_seed_is_stable_and_scoped(self):
        first = deterministic_exam_seed("server-secret", "Student-01", "exam-1", "v2")
        again = deterministic_exam_seed("server-secret", "student-01", "exam-1", "v2")
        other_student = deterministic_exam_seed("server-secret", "student-02", "exam-1", "v2")
        other_version = deterministic_exam_seed("server-secret", "student-01", "exam-1", "v3")

        self.assertEqual(first, again)
        self.assertNotEqual(first, other_student)
        self.assertNotEqual(first, other_version)
        self.assertGreaterEqual(first, 0)
        self.assertLess(first, 2**128)

    def test_seed_rejects_empty_identity_or_secret(self):
        with self.assertRaises(ValueError):
            deterministic_exam_seed("", "s1", "e1")
        with self.assertRaises(ValueError):
            deterministic_exam_seed("secret", "", "e1")


class ExamTimingTests(unittest.TestCase):
    def test_common_deadline_and_student_extension(self):
        timing = exam_timing(
            "2026-07-20T14:00:00Z",
            60,
            "ANA@example.com",
            {"ana@example.com": 15},
            now="2026-07-20T15:05:00+00:00",
        )
        self.assertEqual(timing["deadlineAt"], "2026-07-20T15:15:00Z")
        self.assertEqual(timing["extraMinutes"], 15)
        self.assertEqual(timing["totalMinutes"], 75)
        self.assertEqual(timing["remainingSeconds"], 600)
        self.assertFalse(timing["expired"])

    def test_expired_is_clamped_and_invalid_times_are_rejected(self):
        timing = exam_timing(
            "2026-07-20T14:00:00Z", 30, "s1", now="2026-07-20T15:00:00Z"
        )
        self.assertTrue(timing["expired"])
        self.assertEqual(timing["remainingSeconds"], 0)
        with self.assertRaises(ValueError):
            exam_timing("2026-07-20T14:00:00Z", 0, "s1")
        with self.assertRaises(ValueError):
            exam_timing("2026-07-20T14:00:00Z", 30, "s1", {"s1": -1})


class DraftValidationTests(unittest.TestCase):
    def test_partial_draft_is_normalized_without_keys(self):
        result = validate_partial_draft(
            EXAM,
            {
                "answers": {
                    "v1": "2",
                    "v2": "true",
                    "r1": 9,
                    "invented": 0,
                }
            },
        )
        self.assertEqual(result["answers"], {"v1": 2, "v2": True})
        self.assertEqual(result["answeredCount"], 2)
        self.assertEqual(result["totalQuestions"], 3)
        self.assertFalse(result["complete"])
        self.assertEqual(result["unknownQuestionIds"], ["invented"])
        self.assertEqual(result["invalidAnswerIds"], ["r1"])

        serialized = json.dumps(result, ensure_ascii=False)
        self.assertNotIn('"answer": 0', serialized)
        self.assertNotIn("On dort", serialized)
        self.assertNotIn("Envigado", serialized)

    def test_sanitize_returns_only_known_valid_answers(self):
        self.assertEqual(
            sanitize_partial_draft(EXAM, {"v1": 0, "v2": False, "bad": "secret"}),
            {"v1": 0, "v2": False},
        )


class ReceiptTests(unittest.TestCase):
    def test_receipt_is_stable_and_tamper_evident(self):
        fields = (
            "receipt-secret",
            "fr1-final",
            "2026-07-20",
            "student-1",
            "2026-07-20T16:30:00Z",
            "attempt-123",
        )
        receipt = submission_receipt_code(*fields)
        self.assertTrue(receipt.startswith("JLF-"))
        self.assertEqual(receipt, submission_receipt_code(*fields))
        self.assertTrue(verify_submission_receipt(receipt, *fields))
        self.assertFalse(
            verify_submission_receipt(
                receipt,
                "receipt-secret",
                "fr1-final",
                "2026-07-20",
                "student-2",
                "2026-07-20T16:30:00Z",
                "attempt-123",
            )
        )


class StatisticsTests(unittest.TestCase):
    def test_aggregates_grade_section_question_and_distractor(self):
        submissions = {
            "submissions": {
                "s1": {
                    "grade": 4.5,
                    "sectionScores": {
                        "vocabulaire": {"score": 2, "total": 2},
                        "lecture": {"score": 2, "total": 2},
                    },
                    "answers": {
                        "v1": {"answer": 0, "correct": True, "points": 1},
                        "v2": {"answer": True, "correct": True, "points": 1},
                        "r1": {"answer": 0, "correct": True, "points": 2},
                    },
                },
                "s2": {
                    "grade": 2.5,
                    "answers": {
                        "v1": {"answer": 2, "correct": False, "points": 0},
                        "v2": {"answer": False, "correct": False, "points": 0},
                    },
                },
                "s3": {
                    "grade": 3.0,
                    "answers": {"v1": 2, "v2": True, "r1": 1},
                },
            }
        }
        result = aggregate_exam_statistics(EXAM, submissions)

        self.assertEqual(result["grades"]["submissionCount"], 3)
        self.assertEqual(result["grades"]["average"], 3.33)
        self.assertEqual(result["grades"]["median"], 3.0)
        self.assertEqual(result["grades"]["passed"], 2)
        self.assertEqual(result["grades"]["failed"], 1)
        self.assertEqual(result["grades"]["frequency"], {"2.5": 1, "3": 1, "4.5": 1})

        vocab = result["sections"]["vocabulaire"]
        self.assertEqual(vocab["averagePoints"], 1.0)
        self.assertEqual(vocab["averagePercent"], 50.0)

        v1 = result["questions"]["v1"]
        self.assertEqual(v1["responseCount"], 3)
        self.assertEqual(v1["correctCount"], 1)
        self.assertEqual(v1["correctPercent"], 33.33)
        self.assertEqual(v1["distractors"][0]["label"], "bus")
        self.assertEqual(v1["distractors"][0]["count"], 2)
        self.assertNotIn("answer", v1)

        r1 = result["questions"]["r1"]
        self.assertEqual(r1["missingCount"], 1)
        self.assertEqual(r1["distractors"][0]["label"], "Lyon")

    def test_empty_statistics_are_well_formed(self):
        result = aggregate_exam_statistics(EXAM, {"submissions": {}})
        self.assertEqual(result["grades"]["submissionCount"], 0)
        self.assertEqual(result["grades"]["average"], 0)
        self.assertEqual(result["sections"]["lecture"]["averagePercent"], 0)
        self.assertEqual(result["questions"]["r1"]["missingCount"], 0)


if __name__ == "__main__":
    unittest.main(verbosity=2)
