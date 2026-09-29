"""Exercise final delivery against temporary files; never touch real students."""
import copy
import json
import pathlib
import tempfile
import unittest
from unittest.mock import patch
from test_french_final_exam_backend import API, FinalExamBackendTests


class DeliveryTests(unittest.TestCase):
    def scenario(self, folder):
        config = FinalExamBackendTests().runtime_config(folder, 'french1')
        bundle = config['readBundle']()
        bundle['exam'] = json.loads((pathlib.Path(__file__).resolve().parents[1]/'data/french1-final-exam.local.json').read_text(encoding='utf-8'))['exam']
        config['writeBundle'](bundle)
        profile = {'email':'ana@example.com', 'name':'Test Student'}
        status, session = API.final_exam_session_action(config,profile,{'audioReady':True})
        self.assertEqual(status,200)
        answers = {q['id']:q['answer'] for s in bundle['exam']['sections'] for q in s['questions']}
        payload = dict(attemptId=session['attemptId'], examVersion=bundle['exam']['version'], answers=answers)
        return config, profile, payload

    def grade(self, config):
        return json.loads(pathlib.Path(config['gradesPath']).read_text(encoding='utf-8'))['students'][0]['grades'].get('finalExam')

    def test_full_real_bank_grades_immediately_without_release_and_duplicate_keeps_receipt(self):
        with tempfile.TemporaryDirectory() as folder:
            c,u,p = self.scenario(folder)
            status,result=API.final_exam_submit_action(c,u,p)
            self.assertEqual(status,200)
            self.assertEqual(self.grade(c),5)
            self.assertNotIn('grade',result['result'])
            receipt=result['result']['receiptCode']
            status,repeat=API.final_exam_submit_action(c,u,p)
            self.assertEqual(status,409)
            self.assertEqual(repeat['error'],'already_submitted')
            self.assertEqual(repeat['result']['receiptCode'],receipt)
            self.assertEqual(len(c['readStore']()['submissions']),1)

    def test_latest_answers_override_saved_draft_and_score_four(self):
        with tempfile.TemporaryDirectory() as folder:
            c,u,p=self.scenario(folder)
            status,_=API.final_exam_put_draft(c,u,dict(p,revision=0))
            self.assertEqual(status,200)
            p=copy.deepcopy(p)
            questions=[q for s in c['readBundle']()['exam']['sections'] for q in s['questions']]
            for q in questions[:10]:
                p['answers'][q['id']]=(q['answer']+1)%len(q['options'])
            status,result=API.final_exam_submit_action(c,u,p)
            self.assertEqual(status,200)
            self.assertEqual(self.grade(c),4)
            self.assertEqual(c['readStore']()['submissions']['001']['grade'],4)

    def test_retry_repairs_grade_if_disk_write_failed_after_receipt_was_saved(self):
        with tempfile.TemporaryDirectory() as folder:
            c,u,p=self.scenario(folder)
            real_write=API.write_json_file
            def fail_grade(path,*args,**kwargs):
                if str(path)==c['gradesPath']:
                    raise OSError('simulated gradebook write failure')
                return real_write(path,*args,**kwargs)
            with patch.object(API,'write_json_file',side_effect=fail_grade):
                with self.assertRaises(OSError): API.final_exam_submit_action(c,u,p)
            receipt=c['readStore']()['submissions']['001']['receiptCode']
            status,retry=API.final_exam_submit_action(c,u,p)
            self.assertEqual(status,409)
            self.assertEqual(retry['result']['receiptCode'],receipt)
            self.assertEqual(self.grade(c),5)

    def test_missing_answer_never_creates_receipt_or_grade(self):
        with tempfile.TemporaryDirectory() as folder:
            c,u,p=self.scenario(folder)
            p['answers'].pop(next(iter(p['answers'])))
            status,_=API.final_exam_submit_action(c,u,p)
            self.assertEqual(status,400)
            self.assertFalse(c['readStore']()['submissions'])
            self.assertIsNone(self.grade(c))


if __name__=='__main__': unittest.main(verbosity=2)
