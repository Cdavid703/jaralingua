"""Account-owned, revision-checked formative practice. Never writes grades.

Each stage is independently saved. An operation receipt makes network retries
idempotent; stale writes return the current record instead of overwriting it.
"""
import base64
import hashlib
import json
import os
from pathlib import Path
import re
import sqlite3
from datetime import datetime, timezone

PREFIX = '/api/basic2/adventure/'
CONTENT = Path(__file__).resolve().parents[1] / 'assets/data/basic2-adventure-unit1.json'


class AdventureError(Exception):
    def __init__(self, status, code):
        self.status, self.code = status, code


def need(condition, code='invalid_record'):
    if not condition:
        raise AdventureError(422, code)


def normalized(value):
    return re.sub(r'[^\w\s:]', '', str(value).lower().replace('’', "'")).strip()


def catalog():
    data = json.loads(CONTENT.read_text())
    return {s['id']: s for c in data['challenges'] for s in c['stages']}


def validate(stage, data):
    need(isinstance(data, dict))
    need(set(data) <= {'answers', 'text', 'checks', 'audio', 'seconds', 'done', 'attempts', 'listened'})
    result = dict(data)
    need(type(data.get('done', False)) is bool)
    need(type(data.get('attempts', 0)) is int and 0 <= data.get('attempts', 0) <= 10000)
    checks = data.get('checks', [])
    need(isinstance(checks, list) and len(checks) <= 10 and all(type(v) is bool for v in checks))
    if stage['kind'] == 'quiz':
        need(not (set(data) & {'audio', 'seconds', 'checks'}))
        need(isinstance(data.get('text', ''), str) and len(data.get('text', '')) <= 12000)
        answers = data.get('answers', {})
        need(isinstance(answers, dict) and set(answers) <= {q['id'] for q in stage['questions']})
        need(all(isinstance(a, str) and len(a) <= 1000 for a in answers.values()))
        if data.get('done'):
            need(all(answers.get(q['id'], '').strip() for q in stage['questions']), 'answer_all_questions')
            need(len(data.get('text', '').split()) >= stage.get('applyMinWords', 0), 'complete_application_task')
            if stage.get('audio'):
                need(data.get('listened') is True, 'listen_first')
        result['score'] = sum(normalized(answers.get(q['id'], '')) in [normalized(a) for a in q['answers']] for q in stage['questions'])
    else:
        need('answers' not in data and 'listened' not in data)
        if stage['kind'] == 'writing':
            need('audio' not in data and 'seconds' not in data)
        value = data.get('text', '')
        need(isinstance(value, str) and len(value) <= 12000)
        if stage['kind'] == 'speaking' and data.get('audio'):
            audio = data['audio']
            need(isinstance(audio, str) and len(audio) <= 2800000, 'audio_too_large')
            head, sep, encoded = audio.partition(',')
            need(sep and re.fullmatch(r'data:audio/(webm|ogg|mp4|wav|mpeg|x-m4a)(;codecs=[\w.-]+)?;base64', head), 'invalid_audio')
            try:
                raw = base64.b64decode(encoded, validate=True)
            except (ValueError, TypeError):
                raise AdventureError(422, 'invalid_audio')
            need(len(raw) >= 100 and (raw.startswith((b'\x1aE\xdf\xa3', b'OggS', b'RIFF', b'ID3')) or raw[4:8] == b'ftyp' or raw[:1] == b'\xff'), 'invalid_audio')
            seconds = data.get('seconds')
            need(type(seconds) in (int, float) and 0 < seconds <= 125, 'invalid_duration')
        if data.get('done'):
            need(len(checks) == len(stage['checklist']) and all(checks), 'complete_self_review')
            if stage['kind'] == 'writing':
                need(len(value.split()) >= stage['minWords'], 'write_more')
            else:
                need(data.get('audio') and data.get('seconds', 0) >= stage['minSeconds'], 'record_more')
    return result


class Adventure:
    def __init__(self, path):
        self.path = Path(path)
        self.path.parent.mkdir(parents=True, exist_ok=True)

    def db(self):
        con = sqlite3.connect(self.path, timeout=15)
        con.execute('CREATE TABLE IF NOT EXISTS records (owner TEXT, stage TEXT, revision INTEGER, record TEXT, PRIMARY KEY(owner,stage))')
        con.execute('CREATE TABLE IF NOT EXISTS receipts (owner TEXT, operation TEXT, digest TEXT, result TEXT, PRIMARY KEY(owner,operation))')
        return con

    def state(self, owner):
        with self.db() as con:
            return {'records': {s: json.loads(r) for s, r in con.execute('SELECT stage,record FROM records WHERE owner=?', (owner,))}}

    def save(self, owner, payload):
        need(isinstance(payload, dict))
        stage_id = payload.get('stage')
        stages = catalog()
        need(isinstance(stage_id, str) and stage_id in stages, 'unknown_stage')
        operation = payload.get('operation')
        need(isinstance(operation, str) and re.fullmatch(r'[a-zA-Z0-9-]{16,80}', operation), 'invalid_operation')
        revision = payload.get('revision')
        need(type(revision) is int and revision >= 0)
        data = validate(stages[stage_id], payload.get('data'))
        digest = hashlib.sha256(json.dumps(payload, sort_keys=True).encode()).hexdigest()
        with self.db() as con:
            con.execute('BEGIN IMMEDIATE')
            receipt = con.execute('SELECT digest,result FROM receipts WHERE owner=? AND operation=?', (owner, operation)).fetchone()
            if receipt:
                if receipt[0] != digest:
                    raise AdventureError(409, 'operation_reused')
                return 200, json.loads(receipt[1])
            row = con.execute('SELECT revision,record FROM records WHERE owner=? AND stage=?', (owner, stage_id)).fetchone()
            current_revision = row[0] if row else 0
            if current_revision != revision:
                return 409, {'error': 'stage_changed', 'record': json.loads(row[1]) if row else None}
            record = {'revision': revision + 1, 'data': data, 'updatedAt': datetime.now(timezone.utc).isoformat()}
            result = {'ok': True, 'stage': stage_id, 'record': record}
            con.execute('INSERT OR REPLACE INTO records VALUES (?,?,?,?)', (owner, stage_id, revision + 1, json.dumps(record)))
            con.execute('INSERT INTO receipts VALUES (?,?,?,?)', (owner, operation, digest, json.dumps(result)))
            # Keep bounded retry history; the revision check still protects older retries.
            con.execute('DELETE FROM receipts WHERE owner=? AND rowid NOT IN (SELECT rowid FROM receipts WHERE owner=? ORDER BY rowid DESC LIMIT 200)', (owner, owner))
        return 200, result


def handle(handler, profile, parsed, api, payload=None):
    if not parsed.path.startswith(PREFIX):
        return False
    try:
        with api['data_lock']:
            grades = api['read_grades_data'](api['BASIC2_ENGLISH_GRADES_PATH'])
            trusted = {k: v for k, v in profile.items() if k != '_studentIdClaim'}
            email = api['normalize_email'](trusted.get('email'))
            student = next((s for s in grades.get('students', []) if email and api['email_matches_student'](s, email)), None)
            role = api['grade_user_role'](trusted, grades)
            if not student and role not in ('teacher', 'admin'):
                raise AdventureError(403, 'basic2_account_required')
            owner = 'student:' + str(student['id']) if student else 'preview:' + str(trusted.get('sub') or email)
        service = Adventure(os.environ.get('JARALINGUA_BASIC2_ADVENTURE_DB', '/var/lib/jaralingua/basic2-adventure.sqlite3'))
        route = parsed.path[len(PREFIX):]
        if handler.command == 'GET' and route == 'state':
            status, result = 200, dict(service.state(owner), preview=not bool(student), teacher=role in ('teacher', 'admin'))
        elif handler.command == 'POST' and route == 'save':
            status, result = service.save(owner, payload)
        elif handler.command == 'GET' and route == 'transcript' and role in ('teacher', 'admin'):
            status, result = 200, {'text': (Path(__file__).parent / 'private_assets/basic2-adventure-unit1-audio.md').read_text()}
        else:
            raise AdventureError(404, 'not_found')
        api['json_response'](handler, status, result)
    except AdventureError as error:
        api['json_response'](handler, error.status, {'error': error.code})
    except (OSError, sqlite3.Error, ValueError):
        api['json_response'](handler, 503, {'error': 'practice_temporarily_unavailable'})
    return True
