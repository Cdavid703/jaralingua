import json
import os
import tempfile
import unittest

os.environ.setdefault("JARALINGUA_LOCAL_AUTH_SECRET", "intermediate2-unit2-reading-test-secret")

from server import progress_api


class Intermediate2Unit2ReadingDeliveryTests(unittest.TestCase):
    def setUp(self):
        self.temp_dir = tempfile.TemporaryDirectory()
        progress_api.INTERMEDIATE2_UNIT2_READING_SUBMISSIONS_PATH = os.path.join(self.temp_dir.name, "reading.json")
        self.profile = {"email": "student@example.com", "name": "Student Example", "sub": "test-student"}
        self.payload = {"clientSubmissionId": "unit2-reading-delivery-0001", "details": {"answers": dict(progress_api.INTERMEDIATE2_UNIT2_READING_ANSWERS)}}

    def tearDown(self):
        self.temp_dir.cleanup()

    def test_delivery_is_idempotent_and_never_projects_to_grades(self):
        status, first = progress_api.submit_intermediate2_unit2_reading(self.profile, self.payload)
        self.assertEqual(status, 200)
        self.assertTrue(first["receiptId"].startswith("JLF-"))
        self.assertFalse(first["gradebookProjected"])
        self.assertFalse(first["affectsAverage"])
        self.assertEqual(first["completedAnswers"], 10)

        status, replay = progress_api.submit_intermediate2_unit2_reading(self.profile, self.payload)
        self.assertEqual(status, 200)
        self.assertTrue(replay["idempotentReplay"])
        self.assertEqual(replay["receiptId"], first["receiptId"])

        with open(progress_api.INTERMEDIATE2_UNIT2_READING_SUBMISSIONS_PATH, encoding="utf-8") as handle:
            stored = json.load(handle)["submissions"]
        self.assertEqual(len(stored), 1)
        self.assertNotIn("gradeDetails", stored[0])
        self.assertNotIn("percentage", stored[0])

    def test_incomplete_answers_are_rejected(self):
        self.payload["details"]["answers"].pop("q10")
        status, response = progress_api.submit_intermediate2_unit2_reading(self.profile, self.payload)
        self.assertEqual(status, 400)
        self.assertEqual(response["error"], "all_answers_required")


if __name__ == "__main__":
    unittest.main()
