"""Authenticated Basic 2 oral pairs, private materials and teacher-only assessment."""
import copy
import hashlib
import json
import os
from pathlib import Path
import secrets
import sqlite3
from contextlib import contextmanager
import unicodedata

from basic2_integrated_exam import ExamError, need, clean, stamp
from basic2_oral_media import decode_upload, render_upload

PREFIX = '/api/basic2/final-oral/'
EVALUATION_ID = 'basic2FinalOralTask20'
DESTINATIONS = ('paris','cartagena','london','new-york','rio','rome','machu-picchu','giza','venice','sydney')
RUBRIC = {
    'task': {'title':'Task completion','description':'Understands and completes the travel information exchange with relevant statements.'},
    'interaction': {'title':'Interaction and discourse','description':'Asks and answers relevant questions; responds to the partner and uses repetition or rephrasing when needed.'},
    'fluency': {'title':'Fluency','description':'Sustains the conversation, allowing pauses to find expressions and repair communication.'},
    'language': {'title':'Vocabulary and structure','description':'Uses appropriate travel vocabulary, phrases and grammatical patterns for the task.'},
    'pronunciation': {'title':'Pronunciation','description':'Words and phrases are understandable; sounds, stress and phrasing support the message.'}
}
SCALE = [{'range':'1–3','label':'Weak'},{'range':'4–5','label':'Low'},
         {'range':'6–7','label':'Fair'},{'range':'8–9','label':'Proficient'},{'range':'10','label':'Exemplary'}]
# Teacher decisions, 6 October 2026. Exclusions apply only to this exam.
POLICY = {'confirmPartner':False,'sharedGrade':False,'includeExcluded':False,'weight':20}


def staff(actor):
    return actor.get('role') in ('teacher','admin')


class OralExam:
    def __init__(self, path, policy=None):
        self.path = path
        self.policy = dict(POLICY if policy is None else policy)

    @contextmanager
    def db(self):
        Path(self.path).parent.mkdir(parents=True,exist_ok=True)
        con = sqlite3.connect(self.path,timeout=20)
        os.chmod(self.path,0o600)
        con.row_factory = sqlite3.Row
        try:
            con.execute('PRAGMA foreign_keys=ON')
            con.executescript('''
              CREATE TABLE IF NOT EXISTS settings(key TEXT PRIMARY KEY,value TEXT NOT NULL);
              INSERT OR IGNORE INTO settings VALUES('isOpen','true');
              CREATE TABLE IF NOT EXISTS identities(sid TEXT PRIMARY KEY, token TEXT UNIQUE NOT NULL);
              CREATE TABLE IF NOT EXISTS teams(id TEXT PRIMARY KEY,record TEXT NOT NULL);
              CREATE TABLE IF NOT EXISTS members(token TEXT PRIMARY KEY,team TEXT NOT NULL REFERENCES teams(id));
              CREATE TABLE IF NOT EXISTS operations(actor TEXT NOT NULL,request TEXT NOT NULL,fingerprint TEXT NOT NULL,result TEXT NOT NULL,PRIMARY KEY(actor,request));
              CREATE TABLE IF NOT EXISTS files(id TEXT PRIMARY KEY,team TEXT NOT NULL REFERENCES teams(id),name TEXT NOT NULL,size INTEGER NOT NULL,pages INTEGER NOT NULL,original BLOB NOT NULL,deleted INTEGER NOT NULL DEFAULT 0);
              CREATE TABLE IF NOT EXISTS pages(file TEXT NOT NULL REFERENCES files(id),number INTEGER NOT NULL,image BLOB NOT NULL,PRIMARY KEY(file,number));
              CREATE TABLE IF NOT EXISTS audit(id INTEGER PRIMARY KEY,actor TEXT NOT NULL,action TEXT NOT NULL,at TEXT NOT NULL,detail TEXT NOT NULL);
            ''')
            con.execute('BEGIN IMMEDIATE')
            yield con
            con.commit()
        except Exception:
            con.rollback()
            raise
        finally:
            con.close()

    def allowed(self, student):
        if self.policy['includeExcluded'] is not False:
            return True
        normalized = ''.join(c for c in unicodedata.normalize('NFD',student['fullName']) if not unicodedata.combining(c)).lower().split()
        return not any(n in normalized for n in ('cesar','santiago','gabriela'))

    def context(self, con, actor, roster):
        need(staff(actor) or actor.get('student'),403,'account_not_linked')
        sid = str((actor.get('student') or {}).get('id',''))
        valid = {str(s['id']):s for s in roster if self.allowed(s)}
        need(staff(actor) or sid in valid,403,'not_registered_for_exam')
        members = {}
        for student_id, student in valid.items():
            con.execute('INSERT OR IGNORE INTO identities VALUES(?,?)',(student_id,secrets.token_hex(12)))
            key = con.execute('SELECT token FROM identities WHERE sid=?',(student_id,)).fetchone()[0]
            members[key] = {'key':key,'name':student['fullName']}
        row = con.execute('SELECT token FROM identities WHERE sid=?',(sid,)).fetchone()
        return (row[0] if row else None),members

    def team(self, con, tid):
        row=con.execute('SELECT record FROM teams WHERE id=?',(tid,)).fetchone()
        need(row,404,'pair_not_found')
        return json.loads(row[0])

    def authorized_team(self, con, actor, key, tid):
        team=self.team(con,tid)
        need(staff(actor) or key in team['members'],403,'wrong_pair')
        need(team['status']!='cancelled',409,'pair_cancelled')
        return team

    def save(self, con, actor, team, action):
        team['updatedAt']=stamp()
        con.execute('UPDATE teams SET record=? WHERE id=?',(json.dumps(team),team['id']))
        con.execute('INSERT INTO audit(actor,action,at,detail) VALUES(?,?,?,?)',(actor['key'],action,stamp(),team['id']))

    def public(self, con, actor, key, team, roster):
        out={k:copy.deepcopy(team[k]) for k in ('id','status','revision','destination','decision','assistant','confirmed','createdBy','updatedAt','receipt','timer')}
        out['members']=[roster.get(k,{'key':k,'name':'Former class member'}) for k in team['members']]
        out['files']=[dict(r) for r in con.execute('SELECT id,name,size,pages FROM files WHERE team=? AND deleted=0 ORDER BY rowid',(team['id'],))]
        out['locked']=any(r.get('published') for r in team['reviews'].values())
        if staff(actor):
            out['reviews']=copy.deepcopy(team['reviews'])
        # Student responses never contain the rubric, marks, teacher notes, drafts or partner grades.
        return out

    def view(self,actor,roster):
        with self.db() as con:
            key,people=self.context(con,actor,roster)
            result={'role':actor['role'],'myKey':key,'isOpen':json.loads(con.execute("SELECT value FROM settings WHERE key='isOpen'").fetchone()[0]),
                    'policy':{k:self.policy[k] for k in ('confirmPartner',)},'team':None}
            busy={r['token'] for r in con.execute('SELECT token FROM members')}
            result['roster']=[dict(p,available=k not in busy) for k,p in people.items() if k!=key]
            if staff(actor):
                result.update(rubric=RUBRIC,scale=SCALE,weight=self.policy['weight'],sharedGrade=self.policy['sharedGrade'],
                    teams=[self.public(con,actor,key,json.loads(r[0]),people) for r in con.execute('SELECT record FROM teams') if json.loads(r[0])['status']!='cancelled'])
            else:
                row=con.execute('SELECT team FROM members WHERE token=?',(key,)).fetchone()
                if row:result['team']=self.public(con,actor,key,self.team(con,row[0]),people)
            return result

    def presentation(self,actor,roster,tid):
        with self.db() as con:
            key,people=self.context(con,actor,roster)
            team=self.authorized_team(con,actor,key,tid)
            result=self.public(con,actor,key,team,people)
            result.pop('reviews',None)
            return result

    def file(self,actor,roster,fid,number):
        with self.db() as con:
            key,_=self.context(con,actor,roster)
            record=con.execute('SELECT team,pages FROM files WHERE id=? AND deleted=0',(fid,)).fetchone()
            need(record,404,'file_not_found')
            self.authorized_team(con,actor,key,record['team'])
            need(1 <= number <= record['pages'],404,'page_not_found')
            return con.execute('SELECT image FROM pages WHERE file=? AND number=?',(fid,number)).fetchone()[0]

    def action(self,actor,action,payload,roster):
        need(isinstance(payload,dict),400,'invalid_payload')
        request=clean(payload.get('requestId'),100,8)
        fingerprint=hashlib.sha256(json.dumps([action,payload],sort_keys=True).encode()).hexdigest()
        # Convert only after a cheap authorization check, outside both DB and gradebook locks.
        rendered=None
        if action=='upload':
            with self.db() as con:
                key,_=self.context(con,actor,roster)
                team=self.authorized_team(con,actor,key,clean(payload.get('teamId'),40,1))
                need(team['status']=='confirmed',409,'confirm_pair_first')
                old=con.execute('SELECT fingerprint FROM operations WHERE actor=? AND request=?',(actor['key'],request)).fetchone()
                if not old:
                    count,total=con.execute('SELECT count(*),coalesce(sum(size),0) FROM files WHERE team=? AND deleted=0',(team['id'],)).fetchone()
                    need(count<6 and total<40*1024*1024,413,'pair_storage_limit')
            if not old:
                name,suffix,raw=decode_upload(payload)
                rendered=render_upload(suffix,raw)
        with self.db() as con:
            key,people=self.context(con,actor,roster)
            old=con.execute('SELECT fingerprint,result FROM operations WHERE actor=? AND request=?',(actor['key'],request)).fetchone()
            if old:
                need(old['fingerprint']==fingerprint,409,'request_reused')
                result=json.loads(old['result'])
                # Revalidate current membership rather than replaying an obsolete private response.
                if result.get('teamId') and action not in ('cancel','decline'):
                    team=self.authorized_team(con,actor,key,result['teamId'])
                return dict(result,idempotent=True)
            result=self.mutate(con,actor,key,people,action,payload,rendered)
            con.execute('INSERT INTO operations VALUES(?,?,?,?)',(actor['key'],request,fingerprint,json.dumps(result)))
            return result

    def mutate(self,con,actor,key,people,action,p,rendered):
        if action=='availability':
            need(staff(actor),403,'teacher_required')
            need(type(p.get('isOpen')) is bool,400,'invalid_state')
            con.execute("UPDATE settings SET value=? WHERE key='isOpen'",(json.dumps(p['isOpen']),))
            con.execute('INSERT INTO audit(actor,action,at,detail) VALUES(?,?,?,?)',(actor['key'],action,stamp(),str(p['isOpen'])))
            return {'ok':True}
        if action=='invite':
            need(not staff(actor),403,'student_required')
            need(type(self.policy['confirmPartner']) is bool and type(self.policy['includeExcluded']) is bool,409,'configuration_pending')
            need(json.loads(con.execute("SELECT value FROM settings WHERE key='isOpen'").fetchone()[0]),403,'registration_closed')
            partner=clean(p.get('partner'),40,1)
            need(partner!=key and partner in people,400,'invalid_partner')
            need(not any(con.execute('SELECT 1 FROM members WHERE token=?',(s,)).fetchone() for s in (key,partner)),409,'student_already_paired')
            team=dict(id=secrets.token_hex(12),members=[key,partner],createdBy=key,
                status='pending' if self.policy['confirmPartner'] else 'confirmed',
                confirmed=[key] if self.policy['confirmPartner'] else [key,partner],destination='',decision='',assistant='',
                revision=0,reviews={},updatedAt=stamp(),receipt='B2OR-'+secrets.token_hex(6).upper(),timer={'startedAt':None,'elapsed':0,'running':False})
            con.execute('INSERT INTO teams VALUES(?,?)',(team['id'],json.dumps(team)))
            con.executemany('INSERT INTO members VALUES(?,?)',[(s,team['id']) for s in team['members']])
            self.save(con,actor,team,action)
            return {'ok':True,'teamId':team['id'],'receipt':team['receipt']}
        tid=clean(p.get('teamId'),40,1)
        team=self.authorized_team(con,actor,key,tid)
        if action in ('review','publish','timer'):
            need(staff(actor),403,'teacher_required')
        if action in ('cancel','decline'):
            need(not team['reviews'] or staff(actor),409,'teacher_must_change_pair')
            need(not team['reviews'],409,'graded_pair_locked')
            team['status']='cancelled'
            con.execute('DELETE FROM members WHERE team=?',(tid,))
        elif action=='confirm':
            need(not staff(actor) and key in team['members'],403,'student_required')
            need(team['status'] in ('pending','confirmed'),409,'pair_changed')
            if key not in team['confirmed']:team['confirmed'].append(key)
            if set(team['confirmed'])==set(team['members']):team['status']='confirmed'
        elif action=='plan':
            need(team['status']=='confirmed',409,'confirm_pair_first')
            need(type(p.get('revision')) is int and p['revision']==team['revision'],409,'plan_changed')
            need(not any(r.get('published') for r in team['reviews'].values()),409,'exam_graded')
            destination=clean(p.get('destination'),40)
            need(destination in DESTINATIONS or destination=='',400,'invalid_destination')
            assistant=clean(p.get('assistant'),40)
            need(assistant in team['members'] or assistant=='',400,'invalid_role')
            team.update(destination=destination,decision=clean(p.get('decision'),600),assistant=assistant,revision=team['revision']+1)
        elif action=='upload':
            need(team['status']=='confirmed',409,'confirm_pair_first')
            need(not any(r.get('published') for r in team['reviews'].values()),409,'exam_graded')
            name,suffix,raw=decode_upload(p)
            count,total=con.execute('SELECT count(*),coalesce(sum(size),0) FROM files WHERE team=? AND deleted=0',(tid,)).fetchone()
            need(count<6 and total+len(raw)<=40*1024*1024,413,'pair_storage_limit')
            need(rendered,422,'conversion_failed')
            fid=secrets.token_hex(16)
            con.execute('INSERT INTO files(id,team,name,size,pages,original) VALUES(?,?,?,?,?,?)',(fid,tid,name,len(raw),len(rendered),raw))
            con.executemany('INSERT INTO pages VALUES(?,?,?)',[(fid,i,b) for i,b in enumerate(rendered,1)])
        elif action=='remove-file':
            need(not any(r.get('published') for r in team['reviews'].values()),409,'exam_graded')
            fid=clean(p.get('fileId'),40,1)
            need(con.execute('SELECT 1 FROM files WHERE id=? AND team=? AND deleted=0',(fid,tid)).fetchone(),404,'file_not_found')
            # Keep metadata in the audit; release the student's removed binary storage.
            con.execute('UPDATE files SET deleted=1,original=? WHERE id=?',(b'',fid))
            con.execute('DELETE FROM pages WHERE file=?',(fid,))
        elif action=='timer':
            command=p.get('command');need(command in ('start','stop','reset'),400,'invalid_state')
            from datetime import datetime,timezone
            timer=team['timer']
            if timer['running']:
                timer['elapsed']+=max(0,(datetime.now(timezone.utc)-datetime.fromisoformat(timer['startedAt'])).total_seconds())
            timer.update(running=command=='start',startedAt=stamp() if command=='start' else None)
            if command=='reset':timer['elapsed']=0
        elif action in ('review','publish'):
            need(team['status']=='confirmed',409,'confirm_pair_first')
            need(type(self.policy['sharedGrade']) is bool,409,'configuration_pending')
            target=clean(p.get('member'),40,1)
            need(target in team['members'],400,'invalid_partner')
            target=team['members'][0] if self.policy['sharedGrade'] else target
            old=team['reviews'].get(target,{'revision':0,'rubric':{},'feedback':'','published':None})
            need(type(p.get('revision')) is int and p['revision']==old['revision'],409,'review_changed')
            if action=='review':
                rubric=p.get('rubric')
                need(isinstance(rubric,dict) and set(rubric).issubset(RUBRIC) and all(type(v) is int and 1<=v<=10 for v in rubric.values()),400,'invalid_rubric')
                review=dict(old,rubric=rubric,feedback=clean(p.get('feedback'),4000),revision=old['revision']+1)
            else:
                need(set(old['rubric'])==set(RUBRIC),422,'complete_rubric')
                need(type(self.policy['weight']) in (int,float),409,'weight_pending')
                review=dict(old,revision=old['revision']+1,published=dict(grade=round(sum(old['rubric'].values())/10,2),
                    feedback=old['feedback'],version=secrets.token_hex(8),at=stamp()))
            team['reviews'][target]=review
        else:
            raise ExamError(404,'unknown_action')
        self.save(con,actor,team,action)
        return {'ok':True,'teamId':tid,'receipt':team['receipt']}

    def project_grades(self,grades):
        if type(self.policy['weight']) not in (int,float):return False
        before=json.dumps(grades,sort_keys=True)
        weight=self.policy['weight']
        evaluation={'id':EVALUATION_ID,'title':f'Basic Course 2 - Final Oral Task ({weight}%)','weight':weight}
        existing=next((e for e in grades.setdefault('evaluations',[]) if e.get('id')==EVALUATION_ID),None)
        if existing is None:grades['evaluations'].append(evaluation)
        else:existing.update(evaluation)
        with self.db() as con:
            for student in grades.get('students',[]):
                row=con.execute('SELECT token FROM identities WHERE sid=?',(str(student['id']),)).fetchone()
                if not row:continue
                member=row[0]
                row=con.execute('SELECT team FROM members WHERE token=?',(member,)).fetchone()
                if not row:continue
                team=self.team(con,row[0]);target=team['members'][0] if self.policy['sharedGrade'] else member
                review=team['reviews'].get(target,{}).get('published')
                if not review:continue
                detail=student.setdefault('gradeDetails',{}).get(EVALUATION_ID,{})
                if detail.get('reviewVersion')==review['version']:continue
                student['gradeDetails'][EVALUATION_ID]=dict(evaluationId=EVALUATION_ID,activityTitle=evaluation['title'],status='graded',
                    officialAssessment=True,grade=review['grade'],feedback=review['feedback'],weight=weight,teamId=team['id'],
                    receiptId=team['receipt'],reviewVersion=review['version'],gradedAt=review['at'])
                student.setdefault('grades',{})[EVALUATION_ID]=review['grade']
        return before!=json.dumps(grades,sort_keys=True)


def service():
    return OralExam(os.environ.get('JARALINGUA_BASIC2_ORAL_DB','/var/lib/jaralingua/basic2-final-oral.sqlite3'))


def reconcile(api,grades):
    return service().project_grades(grades)


def handle(handler,profile,parsed,api,payload=None):
    if not parsed.path.startswith(PREFIX):return False
    try:
        with api['data_lock']:
            grades=api['read_grades_data'](api['BASIC2_ENGLISH_GRADES_PATH'])
            trusted={k:v for k,v in profile.items() if k!='_studentIdClaim'}
            email=api['normalize_email'](trusted.get('email'))
            student=next((s for s in grades.get('students',[]) if email and api['email_matches_student'](s,email)),None)
            actor=dict(role=api['grade_user_role'](trusted,grades),key=str(trusted.get('sub') or trusted.get('email') or ''),
                student={'id':str(student['id'])} if student else None)
            roster=[{'id':str(s['id']),'fullName':s['fullName']} for s in grades.get('students',[])]
        exam=service();route=parsed.path[len(PREFIX):]
        if handler.command=='GET' and route=='state':result=exam.view(actor,roster)
        elif handler.command=='GET' and route.startswith('presentation/'):
            result=exam.presentation(actor,roster,route.split('/')[-1])
        elif handler.command=='GET' and route.startswith('file/'):
            parts=route.split('/');need(len(parts)==3 and parts[2].isdigit(),404,'file_not_found')
            data=exam.file(actor,roster,parts[1],int(parts[2]))
            handler.send_response(200)
            for k,v in {'Content-Type':'image/jpeg','Content-Length':str(len(data)),'Cache-Control':'private, no-store',
                        'X-Content-Type-Options':'nosniff','Content-Disposition':'inline; filename="slide.jpg"'}.items():handler.send_header(k,v)
            handler.end_headers();handler.wfile.write(data);return True
        elif handler.command=='POST':
            result=exam.action(actor,route,payload,roster)
            if route=='publish':
                try:
                    with api['data_lock']:
                        current=api['read_grades_data'](api['BASIC2_ENGLISH_GRADES_PATH'])
                        if exam.project_grades(current):api['write_json_file'](api['BASIC2_ENGLISH_GRADES_PATH'],current,'.basic2-grades-')
                    result['gradebookSynced']=True
                except Exception as error:
                    print('Basic2 oral grade projection:',type(error).__name__,flush=True);result['gradebookSynced']=False
        else:raise ExamError(404,'unknown_route')
        api['json_response'](handler,200,result)
    except ExamError as error:api['json_response'](handler,error.status,{'error':error.message})
    except Exception as error:
        print('Basic2 oral exam:',type(error).__name__,flush=True)
        api['json_response'](handler,503,{'error':'exam_temporarily_unavailable'})
    return True
