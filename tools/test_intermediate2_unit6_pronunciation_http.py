"""Isolated real HTTP tests; never uses a production account or gradebook."""
import argparse
import base64
import json
import tempfile
import threading
from pathlib import Path
from http.server import ThreadingHTTPServer
from test_intermediate2_integrated_exam_backend import fixture, request


def main():
    parser = argparse.ArgumentParser(); parser.add_argument('--serve', type=int, default=0)
    args = parser.parse_args()
    with tempfile.TemporaryDirectory(prefix='unit6-pronunciation-') as temp:
        folder = Path(temp)
        api, profiles, grades = fixture(folder)
        api.INTERMEDIATE2_UNIT6_PRONUNCIATION_SUBMISSIONS_PATH = str(folder / 'pronunciation.json')
        api.INTERMEDIATE2_PRONUNCIATION_AUDIO_DIR = str(folder / 'audio')
        other = folder / 'other-course.json'; other.write_text('{"students": [], "teacherEmails": []}')
        api.INTERMEDIATE_ENGLISH_GRADES_PATH = str(other)
        server = ThreadingHTTPServer(('127.0.0.1', args.serve), api.ProgressHandler)
        thread = threading.Thread(target=server.serve_forever, daemon=True); thread.start()
        base = 'http://127.0.0.1:' + str(server.server_port)
        prefix = '/api/intermediate2/unit6-pronunciation/'
        try:
            tokens = {}
            for key, _ in profiles:
                status, data = request(base, '/api/intermediate2/grades/login', payload={'email':key+'@exam.example','password':'QA-only-password'})
                assert status == 200; tokens[key] = data['token']
            if args.serve:
                p=Path('tmp/unit6-pronunciation/session.json'); p.parent.mkdir(parents=True,exist_ok=True)
                p.write_text(json.dumps(dict(base=base,tokens=tokens)))
                print('Isolated pronunciation server: '+base,flush=True);thread.join();return
            before=grades.read_bytes()
            assert request(base,prefix+'submissions')[0]==401
            payload=dict(clientSubmissionId='unit6-http-delivery', details=dict(
                overall=80,accuracy=85,completeness=90,fluency=70,wpm=120,
                referenceText=api.INTERMEDIATE2_UNIT6_PRONUNCIATION_REFERENCE,
                transcript=api.INTERMEDIATE2_UNIT6_PRONUNCIATION_REFERENCE,
                missedWords=['flooded'],stageLabel='Final challenge',
                audioDataUrl='data:audio/webm;base64,'+base64.b64encode(b'unit6-isolated-audio').decode()))
            code,receipt=request(base,prefix+'submit',tokens['ana'],payload)
            assert code==200 and receipt['teacherInboxOnly'] and not receipt['gradebookProjected']
            assert request(base,prefix+'submit',tokens['ana'],payload)[1]['receiptId']==receipt['receiptId']
            assert len(request(base,prefix+'submissions',tokens['ana'])[1]['items'])==1
            assert request(base,prefix+'submissions',tokens['leo'])[1]['items']==[]
            teacher=request(base,prefix+'submissions',tokens['teacher'])[1]
            assert teacher['teacherInbox'] and len(teacher['items'])==1
            audio=prefix+'audio?receipt='+receipt['receiptId']
            assert request(base,audio,tokens['leo'])[0]==403
            assert request(base,audio,tokens['ana'])[0]==200
            assert request(base,audio,tokens['teacher'])[0]==200
            assert grades.read_bytes()==before
            assert not other.read_text().find('pronunciation')>=0
            print('PASS: authenticated delivery, idempotency, Course 2 teacher inbox, own-recording privacy and unchanged gradebooks.')
        finally:
            server.shutdown();server.server_close()


if __name__=='__main__':main()
