"""HTTP tests use a synthetic exam, disposable accounts and isolated storage."""
import argparse
import importlib.util
import json
import os
import shutil
import sys
import tempfile
import threading
import urllib.error
import urllib.request
from concurrent.futures import ThreadPoolExecutor
from http.server import ThreadingHTTPServer
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
QA = ROOT/"tmp"/"basic2-integrated-qa"
PREFIX = "/api/basic2/integrated-task/"


def request(base, path, token="", payload=None, method=None):
    headers = {"X-Jaralingua-Auth-Provider": "local"}
    if token:
        headers["Authorization"] = "Bearer "+token
    data = None
    if payload is not None:
        data = json.dumps(payload).encode()
        headers["Content-Type"] = "application/json"
    req = urllib.request.Request(base+path, data=data, headers=headers, method=method)
    try:
        res = urllib.request.urlopen(req, timeout=20)
    except urllib.error.HTTPError as error:
        res = error
    with res:
        body = res.read()
        return res.status, json.loads(body) if "json" in res.headers.get("Content-Type", "") else body


def fixture(folder):
    grades = folder/"grades.json"
    profiles = [("teacher", "Test Teacher"), ("admin", "Test Admin"), ("ana", "Ana Test"), ("leo", "Leo Test")]
    grades.write_text(json.dumps({"adminEmails":["admin@exam.example"],"teacherEmails":["teacher@exam.example"],
        "evaluations":[{"id":"otherAssessment","title":"Other assessment","weight":30}],
        "students":[dict(id=str(9100+i),fullName=name,email=key+"@exam.example",level="Basic English Course 2",
                         localPassword="QA-only-password",grades={"otherAssessment":4.1},gradeDetails={}) for i,(key,name) in enumerate(profiles)]}),encoding="utf-8")
    private=folder/"content";private.mkdir()
    synthetic={"version":"synthetic-test","title":"Synthetic exam","subtitle":"Test content",
        "questions":[dict(id=str(i+1),prompt="Test listening question "+str(i+1),options=["Alpha","Beta","Gamma","Delta"],
                          speaker="Test Speaker",answer=i%4,evidence="Private evidence") for i in range(10)],
        "writing":{"task":"Write a community newsletter article.","requirements":["Describe a problem.","Suggest two solutions."],"minutes":40,"minimumWords":30},
        "rubric":[dict(id=key,label=key.title(),description="Private rubric descriptor") for key in ["content","composing","vocabulary","structure","mechanics"]],
        "transcript":"PRIVATE TEACHER TRANSCRIPT"}
    (private/"exam.json").write_text(json.dumps(synthetic),encoding="utf-8")
    audio = ROOT/"server/private_assets/basic2-integrated-task/listening.mp3"
    if not audio.is_file():
        audio = ROOT/"ingles/basico-2/audio/unit1/weather/weather-windy.mp3"
    shutil.copy2(audio,private/"listening.mp3")
    os.environ.update(JARALINGUA_GOOGLE_CLIENT_ID="test-client",JARALINGUA_LOCAL_AUTH_SECRET="isolated-integrated-exam-test-secret",
                      JARALINGUA_BASIC2_ENGLISH_GRADES_DATA=str(grades),
                      JARALINGUA_BASIC2_INTEGRATED_DB=str(folder/"exam.sqlite3"),
                      JARALINGUA_BASIC2_INTEGRATED_CONTENT_DIR=str(private),
                      JARALINGUA_PROGRESS_DATA=str(folder/"progress.json"))
    spec=importlib.util.spec_from_file_location("integrated_exam_api",ROOT/"server/progress_api.py")
    api=importlib.util.module_from_spec(spec);sys.modules[spec.name]=api;spec.loader.exec_module(api)
    api.ProgressHandler.log_message=lambda *args:None
    return api,profiles,grades


def run(base,tokens,grades,api):
    def call(who,action,payload=None,status=200):
        actual,result=request(base,PREFIX+action,tokens.get(who,""),payload)
        assert actual==status,(who,action,actual,result)
        return result
    call("","state",status=401);call("","audio",status=401)
    closed=call("ana","state")
    assert closed["isOpen"] is False and "exam" not in closed and "transcript" not in closed
    call("ana","start",{"courseCode":"QA"},403)
    call("ana","audio",status=403)
    call("ana","availability",{"isOpen":True},403)
    teacher=call("teacher","state")
    assert teacher["transcript"]=="PRIVATE TEACHER TRANSCRIPT" and len(teacher["answerKey"])==10
    call("teacher","availability",{"isOpen":True})
    first=call("ana","start",{"courseCode":"QA"})["attempt"]
    assert call("ana","start",{"courseCode":"ignored"})["attempt"]["id"]==first["id"]
    public=call("ana","state")
    assert "answerKey" not in public and "rubric" not in public
    assert all(set(q)=={"id","prompt","options","speaker"} for q in public["exam"]["questions"])
    call("leo","draft",{"attemptId":first["id"]},409)
    for i in range(10):
        payload={"attemptId":first["id"],"requestId":"play-id-"+str(i)}
        assert call("ana","play",payload)["attempt"]["plays"]==i+1
        assert call("ana","play",payload)["attempt"]["plays"]==i+1
    assert isinstance(call("ana","audio"),bytes)
    writing=call("ana","writing-start",{"attemptId":first["id"]})["attempt"]
    assert call("ana","writing-start",{"attemptId":first["id"]})["attempt"]["writingDeadline"]==writing["writingDeadline"]
    payload=dict(attemptId=first["id"],revision=0,answers={str(i+1):i%4 for i in range(10)},writing="Community improvement matters. "*50,courseCode="QA")
    draft=call("ana","draft",payload)["attempt"]
    assert draft["revision"]==1 and draft["name"]=="Ana Test"
    call("ana","draft",payload,409)
    call("ana","draft",dict(payload,revision=1,answers={"1":False}),400)
    call("teacher","availability",{"isOpen":False})
    call("leo","start",{"courseCode":"QA"},403)
    assert call("ana","state")["attempt"]["writing"]==payload["writing"].strip()
    send=dict(payload,revision=1,clientSubmissionId="stable-delivery")
    with ThreadPoolExecutor(2) as pool:
        responses=list(pool.map(lambda _:request(base,PREFIX+"submit",tokens["ana"],send),range(2)))
    assert all(s==200 for s,r in responses),responses
    receipt=responses[0][1]["submission"]["receiptId"]
    assert responses[1][1]["submission"]["receiptId"]==receipt
    sub=call("ana","state")["submission"]
    assert "listeningPoints" not in sub and "grade" not in sub
    call("ana","audio",status=403)
    call("ana","submit",dict(send,clientSubmissionId="different-id"),409)
    call("ana","grade",{},403)
    with urllib.request.urlopen(urllib.request.Request(base+"/api/basic2/grades",headers={"Authorization":"Bearer "+tokens["ana"],"X-Jaralingua-Auth-Provider":"local"})) as res:
        grade_view=json.load(res)
    saved=json.loads(grades.read_text(encoding="utf-8"));student=next(x for x in saved["students"] if x["id"]=="9102")
    assert student["gradeDetails"]["basic2IntegratedTask20"]["pendingTeacherReview"] is True
    assert "basic2IntegratedTask20" not in student["grades"]
    assert next(e for e in saved["evaluations"] if e["id"]=="basic2IntegratedTask20")["weight"]==20
    review=dict(studentId="9102",receiptId=receipt,reviewRevision=0,rubric={key:4 for key in ("content","composing","vocabulary","structure","mechanics")},feedback="Clear community article.")
    call("teacher","grade",dict(review,rubric={"content":99}),400)
    graded=call("teacher","grade",review)["submission"]
    assert graded["grade"]==4.5 and graded["listeningPoints"]==25 and graded["writingPoints"]==20
    call("teacher","grade",review,409)
    assert call("ana","state")["submission"]["feedback"]=="Clear community article."
    assert call("leo","state")["submission"] is None
    saved=json.loads(grades.read_text(encoding="utf-8"));student=next(x for x in saved["students"] if x["id"]=="9102")
    assert student["grades"]["basic2IntegratedTask20"]==4.5 and student["grades"]["otherAssessment"]==4.1
    # Later gradebook corrections are not erased by replaying the same projection.
    student["grades"]["basic2IntegratedTask20"]=4.7
    grades.write_text(json.dumps(saved),encoding="utf-8")
    request(base,"/api/basic2/grades",tokens["teacher"])
    assert next(x for x in json.loads(grades.read_text())["students"] if x["id"]=="9102")["grades"]["basic2IntegratedTask20"]==4.7
    # Prove receipts survive a failed gradebook projection, with reconciliation on read.
    call("teacher","availability",{"isOpen":True})
    leo=call("leo","start",{"courseCode":"QA"})["attempt"]
    call("leo","writing-start",{"attemptId":leo["id"]})
    import basic2_integrated_exam as module
    method=module.IntegratedExam.project_grades
    module.IntegratedExam.project_grades=lambda *args:(_ for _ in ()).throw(OSError("simulated"))
    try:
        response=call("leo","submit",dict(send,attemptId=leo["id"],revision=0,clientSubmissionId="leo-receipt"))
        assert response["gradebookSynced"] is False and response["submission"]["receiptId"]
    finally:
        module.IntegratedExam.project_grades=method
    request(base,"/api/basic2/grades",tokens["leo"])
    saved=json.loads(grades.read_text());leo_grade=next(x for x in saved["students"] if x["id"]=="9103")
    assert leo_grade["gradeDetails"]["basic2IntegratedTask20"]["pendingTeacherReview"] is True
    print("PASS: closed access, authentication, private content, plays, timer, draft conflicts, cross-account isolation, concurrent/idempotent submission, teacher grading, 20% projection and failure recovery.")


def main():
    parser=argparse.ArgumentParser();parser.add_argument("--serve",type=int,default=0);options=parser.parse_args()
    with tempfile.TemporaryDirectory(prefix="integrated-exam-qa-") as folder:
        api,profiles,grades=fixture(Path(folder));server=ThreadingHTTPServer(("127.0.0.1",options.serve),api.ProgressHandler)
        thread=threading.Thread(target=server.serve_forever,daemon=True);thread.start();base="http://127.0.0.1:"+str(server.server_port)
        tokens={}
        try:
            for key,name in profiles:
                status,data=request(base,"/api/basic2/grades/login",payload={"email":key+"@exam.example","password":"QA-only-password"})
                assert status==200,data;tokens[key]=data["token"]
            if options.serve:
                QA.mkdir(parents=True,exist_ok=True);(QA/"session.json").write_text(json.dumps(dict(base=base,tokens=tokens)),encoding="utf-8")
                print("Disposable integrated exam server ready: "+base,flush=True);thread.join()
            else:
                run(base,tokens,grades,api)
        finally:
            server.shutdown();server.server_close()


if __name__=="__main__":
    main()

