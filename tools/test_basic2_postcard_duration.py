"""Verify the 48-hour duration and idempotent migration of ongoing writing."""
import copy
from datetime import datetime, timedelta
import json
from pathlib import Path
import sqlite3
import sys
import tempfile
sys.path.insert(0, str(Path(__file__).resolve().parents[1] / 'server'))
from basic2_final_postcard import PostcardExam

with tempfile.TemporaryDirectory() as tmp:
    path = str(Path(tmp)/'exam.sqlite3')
    exam = PostcardExam(path)
    roster = [dict(id=str(i),fullName='Test '+str(i)) for i in range(1,3)]
    teacher = dict(role='teacher',key='test-teacher')
    student = dict(role='student',key='test-student',student=roster[0])
    team = exam.action(teacher,'create-team',dict(name='Test',courseCode='QA',members=['1','2']),roster)['team']
    exam.action(teacher,'availability',dict(isOpen=True),roster)
    team = exam.action(student,'start',dict(teamId=team['id']),roster)['team']
    seconds = (datetime.fromisoformat(team['deadline'])-datetime.fromisoformat(team['startedAt'])).total_seconds()
    assert abs(seconds-172800)<2
    legacy = copy.deepcopy(team)
    legacy.pop('durationHours')
    legacy['deadline']=(datetime.fromisoformat(team['startedAt'])+timedelta(minutes=50)).isoformat()
    legacy['parts'][0]['text']='Saved work must survive.'
    legacy['ready']=['1']
    with sqlite3.connect(path) as con:
        con.execute('UPDATE teams SET record=? WHERE id=?',(json.dumps(legacy),team['id']))
    con.close()
    migrated=exam.view(student,roster)['team']
    assert migrated['durationHours']==48
    assert datetime.fromisoformat(migrated['deadline'])==datetime.fromisoformat(legacy['startedAt'])+timedelta(hours=48)
    for key in ('parts','revision','ready','status','startedAt','reviews','receiptId'):
        assert migrated[key]==legacy[key],key
    assert exam.view(student,roster)['team']==migrated
    with sqlite3.connect(path) as con:
        assert con.execute("SELECT count(*) FROM audit WHERE action='extend-time-48-hours'").fetchone()[0]==1
    con.close()
print('PASS: new periods last 48 hours; existing writing extended once; text, revisions, confirmations and status preserved.')
