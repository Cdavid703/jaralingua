"""Server-free reset, delivery evidence and enrollment regression checks."""
import copy
import json
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch
import sys
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from tools.reset_french1_cohort import prepare
from server import progress_api as api

ROOT = Path(__file__).resolve().parents[1]


class CohortTests(unittest.TestCase):
    def test_reset_preserves_staff_and_content_but_clears_results(self):
        grades = json.loads((ROOT/'data/french1-grades.example.json').read_text(encoding='utf-8'))
        grades['students'] = [dict(id='old', grades={'finalExam': 4}, gradeDetails={'old': {}})]
        grades['evaluations'].append(dict(id='pronunciationTheme1', weight=5))
        exam = json.loads((ROOT/'data/french1-final-exam.local.json').read_text(encoding='utf-8'))
        exam['state'].update(isOpen=True, releaseResults=True, extraMinutesByStudent={'old':20})
        roster = [dict(id='123456', email='NEW@example.com', fullName='Test Student')]
        before = copy.deepcopy(grades)
        g, b, s = prepare(grades, exam, roster)
        self.assertEqual(grades, before)
        self.assertEqual(g['teacherEmails'], before['teacherEmails'])
        self.assertEqual(g['adminEmails'], before['adminEmails'])
        self.assertEqual(g['students'][0]['grades'], {})
        self.assertEqual(g['students'][0]['gradeDetails'], {})
        self.assertEqual(g['students'][0]['email'], 'new@example.com')
        self.assertFalse(b['state']['isOpen'])
        self.assertFalse(b['state']['releaseResults'])
        self.assertTrue(all(not v for v in s.values()))
        self.assertEqual(sum(e['weight'] for e in g['evaluations']), 100)
        api.ensure_french1_gradebook_structure(g)
        self.assertNotIn('pronunciationTheme1', [e['id'] for e in g['evaluations']])
        with patch.object(api, 'sign_local_profile', return_value=('test-token', 123)):
            login = api.local_gradebook_login({'email':'new@example.com','password':'123456*'}, g, 'french1','Français Niveau 1')
        self.assertEqual(login['user']['email'], 'new@example.com')

    def test_only_three_deliveries_and_zero_is_valid(self):
        self.assertEqual(set(api.FRENCH1_PRONUNCIATION_EVALUATIONS), {'pronunciationTheme3','pronunciationTheme5','pronunciationTheme7'})
        for key in api.FRENCH1_PRONUNCIATION_EVALUATIONS:
            self.assertEqual(api.french1_pronunciation_grade_from_payload(dict(evaluationId=key, score100=0)), (key, 0, 0))

    def test_missing_evidence_cannot_replace_previous_delivery(self):
        student = {'id':'test','gradeDetails':{'pronunciationTheme3':{'score100':80,'audio':{'file':'previous.mp3'}}}}
        before = copy.deepcopy(student)
        with tempfile.TemporaryDirectory() as folder:
            with self.assertRaisesRegex(ValueError, 'audio_required'):
                api.attach_pronunciation_submission(student,'pronunciationTheme3',{'details':{}},20,1,folder,require_audio=True)
        self.assertEqual(student, before)

    def test_real_audio_evidence_keeps_reference_and_transcript(self):
        import base64
        audio = (ROOT/'frances/Niveau 1/audio/prononciation/stages/theme-2-stage-1.mp3').read_bytes()
        details = dict(audioDataUrl='data:audio/mpeg;base64,'+base64.b64encode(audio).decode(),
                       transcript='Je parle français.', referenceText='Je parle français.', uncertain=True)
        with tempfile.TemporaryDirectory() as folder:
            student={'id':'test'}
            api.attach_pronunciation_submission(student,'pronunciationTheme3',{'details':details},80,4,folder,require_audio=True)
            saved=student['gradeDetails']['pronunciationTheme3']
            self.assertEqual((Path(folder)/saved['audio']['file']).read_bytes(),audio)
            self.assertEqual(saved['transcript'],details['transcript'])
            self.assertEqual(saved['referenceText'],details['referenceText'])


if __name__ == '__main__':
    unittest.main()
