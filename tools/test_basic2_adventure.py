"""Synthetic-only persistence, ownership, validation, conflict and retry tests."""
import base64
import json
from pathlib import Path
import sys
import tempfile
import threading
import unittest
from urllib.parse import urlparse
sys.path.insert(0, str(Path(__file__).resolve().parents[1] / 'server'))
import basic2_adventure as game

class PracticeTests(unittest.TestCase):
 def setUp(self):
  self.tmp=tempfile.TemporaryDirectory();self.svc=game.Adventure(Path(self.tmp.name)/'test.db')
 def tearDown(self):self.tmp.cleanup()
 def payload(self, stage='grammar-1', revision=0, operation='operation-00000001', **data):
  return dict(stage=stage,revision=revision,operation=operation,data=data or {'answers':{'1':'plays'},'done':False})
 def test_private_resume_and_idempotent_retry(self):
  p=self.payload();code,r=self.svc.save('student-A',p)
  self.assertEqual(code,200);self.assertEqual(r['record']['revision'],1)
  self.assertEqual(self.svc.save('student-A',p),(code,r))
  self.assertEqual(self.svc.state('student-B'),{'records':{}})
  self.assertEqual(game.Adventure(self.svc.path).state('student-A')['records']['grammar-1'],r['record'])
 def test_stale_device_never_overwrites(self):
  self.svc.save('A',self.payload())
  code,r=self.svc.save('A',self.payload(operation='operation-00000002'))
  self.assertEqual(code,409);self.assertEqual(r['record']['revision'],1)
 def test_operation_cannot_be_reused_for_other_content(self):
  self.svc.save('A',self.payload())
  with self.assertRaises(game.AdventureError):self.svc.save('A',self.payload(answers={'1':'run'}))
 def test_quiz_completed_and_scored_from_answers(self):
  s=game.catalog()['grammar-1'];a={q['id']:q['answers'][0] for q in s['questions']}
  _,r=self.svc.save('A',self.payload(answers=a,text="word "*25,done=True,attempts=1))
  self.assertEqual(r['record']['data']['score'],8)
  with self.assertRaises(game.AdventureError):self.svc.save('B',self.payload(answers={},done=True))
 def test_listening_requires_listening(self):
  s=game.catalog()['listening-1'];a={q['id']:q['answers'][0] for q in s['questions']}
  with self.assertRaises(game.AdventureError):self.svc.save('A',self.payload('listening-1',answers=a,done=True))
 def test_writing_and_audio_validation(self):
  with self.assertRaises(game.AdventureError):self.svc.save('A',self.payload('writing-1',text='Short',done=True,checks=[True,True]))
  with self.assertRaises(game.AdventureError):self.svc.save('A',self.payload('speaking-1',audio='data:text/html;base64,AAAA'))
  raw=b'\x1aE\xdf\xa3'+b'0'*200
  audio='data:audio/webm;base64,'+base64.b64encode(raw).decode()
  _,r=self.svc.save('A',self.payload('speaking-1',audio=audio,seconds=15,checks=[True]*3,done=True))
  self.assertEqual(r['record']['data']['audio'],audio)
 def test_auth_route_ignores_claims_and_blocks_other_courses(self):
  output=[]
  api={'data_lock':threading.Lock(),'read_grades_data':lambda p:{'students':[{'id':'A','email':'a@test.invalid'}]},'BASIC2_ENGLISH_GRADES_PATH':'unused','normalize_email':lambda e:str(e or '').lower(),'email_matches_student':lambda s,e:s['email']==e,'grade_user_role':lambda p,g:'student','json_response':lambda h,c,r:output.append((c,r))}
  handler=type('Handler',(),{'command':'GET'})()
  game.handle(handler,{'email':'outsider@test.invalid','_studentIdClaim':'A'},urlparse(game.PREFIX+'state'),api)
  self.assertEqual(output[-1][0],403)
 def test_content_structure_and_models(self):
  data=json.loads(game.CONTENT.read_text());self.assertEqual(len(data['challenges']),6)
  self.assertEqual(len(game.catalog()),24)
  for c in data['challenges']:
   self.assertEqual(len(c['stages']),4)
   for s in c['stages']:
    for q in s['questions']:
     if q.get('options'):self.assertIn(q['answers'][0],q['options']);self.assertEqual(len(set(q['options'])),len(q['options']))

if __name__=='__main__':unittest.main()
