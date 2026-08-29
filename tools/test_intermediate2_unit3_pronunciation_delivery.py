import base64
import json
import os
import tempfile
import unittest

os.environ.setdefault("JARALINGUA_LOCAL_AUTH_SECRET", "intermediate2-unit3-pronunciation-test-secret")

from server import progress_api


class Intermediate2Unit3PronunciationDeliveryTests(unittest.TestCase):
    def setUp(self):
        self.temp_dir = tempfile.TemporaryDirectory()
        progress_api.INTERMEDIATE2_UNIT3_PRONUNCIATION_SUBMISSIONS_PATH = os.path.join(
            self.temp_dir.name, "submissions.json"
        )
        progress_api.INTERMEDIATE2_PRONUNCIATION_AUDIO_DIR = os.path.join(
            self.temp_dir.name, "audio"
        )
        self.profile = {"email": "student@example.com", "name": "Student Example", "sub": "test-student"}
        self.payload = {
            "clientSubmissionId": "unit3-delivery-test-0001",
            "details": {
                "overall": 88,
                "accuracy": 90,
                "completeness": 92,
                "fluency": 78,
                "wpm": 112,
                "transcript": progress_api.INTERMEDIATE2_UNIT3_PRONUNCIATION_REFERENCE,
                "referenceText": progress_api.INTERMEDIATE2_UNIT3_PRONUNCIATION_REFERENCE,
                "missedWords": ["suspicious"],
                "stageLabel": "Final challenge",
                "audioDataUrl": "data:audio/webm;base64," + base64.b64encode(b"webm-unit3-test-audio").decode("ascii"),
            },
        }

    def tearDown(self):
        self.temp_dir.cleanup()

    def test_delivery_is_idempotent_and_never_projects_to_grades(self):
        status, first = progress_api.submit_intermediate2_unit3_pronunciation(self.profile, self.payload)
        self.assertEqual(status, 200)
        self.assertTrue(first["receiptId"].startswith("JLF-"))
        self.assertFalse(first["gradebookProjected"])
        self.assertFalse(first["affectsAverage"])

        status, replay = progress_api.submit_intermediate2_unit3_pronunciation(self.profile, self.payload)
        self.assertEqual(status, 200)
        self.assertTrue(replay["idempotentReplay"])
        self.assertEqual(first["receiptId"], replay["receiptId"])

        with open(progress_api.INTERMEDIATE2_UNIT3_PRONUNCIATION_SUBMISSIONS_PATH, encoding="utf-8") as handle:
            stored = json.load(handle)
        self.assertEqual(len(stored["submissions"]), 1)
        submission = stored["submissions"][0]
        for forbidden in ("grade", "weight", "percentage", "evaluationId", "gradeDetails"):
            self.assertNotIn(forbidden, submission)
        self.assertEqual(len(os.listdir(progress_api.INTERMEDIATE2_PRONUNCIATION_AUDIO_DIR)), 1)

    def test_modified_reference_is_rejected_before_audio_storage(self):
        self.payload["details"]["referenceText"] = "A different text."
        status, response = progress_api.submit_intermediate2_unit3_pronunciation(self.profile, self.payload)
        self.assertEqual(status, 400)
        self.assertEqual(response["error"], "reference_text_mismatch")
        self.assertFalse(os.path.exists(progress_api.INTERMEDIATE2_PRONUNCIATION_AUDIO_DIR))


if __name__ == "__main__":
    unittest.main()

