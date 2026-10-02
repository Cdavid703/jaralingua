"""Disposable authenticated HTTP tests and browser fixture for group stories."""
import argparse
import importlib.util
import json
import os
import sys
import tempfile
import threading
import urllib.error
import urllib.request
from concurrent.futures import ThreadPoolExecutor
from http.server import ThreadingHTTPServer
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "server"))
PREFIX = "/api/intermediate2/group-stories/"


def request(base, action, token="", payload=None):
    headers = {"X-Jaralingua-Auth-Provider": "local"}
    if token:
        headers["Authorization"] = "Bearer " + token
    data = None
    if payload is not None:
        headers["Content-Type"] = "application/json"
        data = json.dumps(payload).encode()
    req = urllib.request.Request(base + action, data=data, headers=headers)
    try:
        response = urllib.request.urlopen(req, timeout=20)
    except urllib.error.HTTPError as error:
        response = error
    with response:
        return response.status, json.loads(response.read())


def fixture(folder):
    grades = folder / "grades.json"
    profiles = [("teacher", "Story Teacher"), ("other", "Other Teacher"), ("admin", "Story Admin"),
                ("ana", "Ana Test"), ("bea", "Bea Test"), ("leo", "Leo Test"), ("out", "Unassigned Student")]
    roster = [dict(id=str(9900+i), fullName=name, level="Intermediate English Course 2", email=key+"@stories.example",
                   localPassword="QA-only-password", grades={}, gradeDetails={}) for i, (key, name) in enumerate(profiles)]
    grades.write_text(json.dumps(dict(adminEmails=["admin@stories.example"], teacherEmails=["teacher@stories.example", "other@stories.example"],
                                     evaluations=[], students=roster)), encoding="utf-8")
    os.environ.update(JARALINGUA_GOOGLE_CLIENT_ID="test-client", JARALINGUA_LOCAL_AUTH_SECRET="disposable-group-stories-test-secret",
                      JARALINGUA_INTERMEDIATE2_ENGLISH_GRADES_DATA=str(grades),
                      JARALINGUA_INTERMEDIATE2_GROUP_STORIES_DB=str(folder / "stories.sqlite3"),
                      JARALINGUA_PROGRESS_DATA=str(folder / "progress.json"))
    spec = importlib.util.spec_from_file_location("stories_progress_api", ROOT / "server/progress_api.py")
    api = importlib.util.module_from_spec(spec); sys.modules[spec.name] = api; spec.loader.exec_module(api)
    api.ProgressHandler.log_message = lambda *args: None
    return api, profiles, grades


def run(base, tokens, grades):
    original = grades.read_bytes()
    seq = 0
    def call(who, action, payload=None, status=200):
        nonlocal seq
        if payload is not None and "requestId" not in payload:
            seq += 1; payload = dict(payload, requestId="test-request-" + str(seq))
        code, data = request(base, PREFIX+action, tokens.get(who, ""), payload)
        assert code == status, (who, action, code, data)
        return data
    call("", "state", status=401)
    call("ana", "create", dict(name="Forbidden"), 403)
    roster = call("teacher", "state")["roster"]
    assert len(roster) == 4 and all(set(s) == {"id", "name"} for s in roster)
    room = call("teacher", "create", dict(name="Story QA"))["sessionId"]
    assert call("teacher", "create", dict(name="Story QA"))["sessionId"] == room
    call("other", "state?sessionId="+room, status=404)
    assert call("admin", "state?sessionId="+room)["session"]["id"] == room
    call("teacher", "finalize", dict(sessionId=room, revision=0), 400)
    assignments = [dict(picture=1, studentIds=["9903", "9904"]), dict(picture=2, studentIds=["9905"])]
    call("teacher", "assign", dict(sessionId=room, revision=0, assignments=assignments+[dict(picture=3, studentIds=["9903"])]), 400)
    call("teacher", "assign", dict(sessionId=room, revision=0, assignments=[dict(picture=1, studentIds=["forged"])]), 400)
    call("teacher", "assign", dict(sessionId=room, revision=0, assignments=[dict(picture=True, studentIds=["9903"])]), 400)
    call("teacher", "assign", dict(sessionId=room, revision=0, assignments=assignments))
    assert call("ana", "state")["sessions"] == []
    call("ana", "state?sessionId="+room, status=404)
    call("teacher", "assign", dict(sessionId=room, revision=0, assignments=assignments), 409)
    call("teacher", "finalize", dict(sessionId=room, revision=1))
    ana = call("ana", "state?sessionId="+room)
    assert len(ana["teams"]) == 1 and "roster" not in ana
    assert {m["id"] for m in ana["teams"][0]["members"]} == {"9903", "9904"}
    team = ana["teams"][0]["id"]
    leo = call("leo", "state?sessionId="+room)["teams"][0]["id"]
    call("out", "state?sessionId="+room, status=404)
    call("teacher", "start", dict(sessionId=room, revision=2), 409)
    data = dict(teamId=team, revision=0, story="Ana: They look worried. Bea: They helped each other calm down.", phrasalVerb="calm down", everyoneIncluded=True)
    call("leo", "save", dict(data, studentId="9903"), 404)
    call("teacher", "save", data, 403)
    call("ana", "submit", dict(data, phrasalVerb=""), 400)
    call("ana", "submit", dict(data, everyoneIncluded=False), 400)
    draft = dict(data, requestId="durable-draft-request")
    saved = call("ana", "save", draft)["entry"]
    assert saved["revision"] == 1 and saved["status"] == "draft"
    assert call("bea", "state?sessionId="+room)["teams"][0]["entry"]["story"] == data["story"]
    call("teacher", "return-to-assignments", dict(sessionId=room, revision=2), 409)
    call("bea", "submit", data, 409)
    submitted = call("bea", "submit", dict(data, revision=1))["entry"]
    assert submitted["status"] == "submitted" and submitted["receiptId"] and submitted["updatedBy"] == "Bea Test"
    assert call("ana", "save", draft)["entry"] == saved
    assert call("ana", "state?sessionId="+room)["teams"][0]["entry"]["revision"] == 2
    call("ana", "save", dict(draft, story="Different body"), 409)
    call("teacher", "start", dict(sessionId=room, revision=2), 409)
    call("leo", "submit", dict(data, teamId=leo, story="Leo: The friends cheered up.", phrasalVerb="cheer up"))
    assert call("teacher", "state?sessionId="+room)["session"]["readyToPresent"]
    # Concurrent teammates cannot overwrite one another silently.
    with ThreadPoolExecutor(2) as pool:
        futures = [pool.submit(request, base, PREFIX+"save", tokens[who], dict(data, revision=2, requestId="concurrent-"+who)) for who in ("ana", "bea")]
        assert sorted(f.result()[0] for f in futures) == [200, 409]
    state = call("teacher", "state?sessionId="+room)
    assert not state["session"]["readyToPresent"] and state["session"]["submittedCount"] == 1
    call("ana", "submit", dict(data, revision=3))
    # Starting presentations and saving a new draft serialize: the losing action is rejected.
    with ThreadPoolExecutor(2) as pool:
        futures = [pool.submit(request, base, PREFIX+"start", tokens["teacher"], dict(sessionId=room, revision=2, requestId="start-race")),
                   pool.submit(request, base, PREFIX+"save", tokens["bea"], dict(data, revision=4, requestId="draft-race"))]
        assert sorted(f.result()[0] for f in futures) == [200, 409]
    state = call("teacher", "state?sessionId="+room)
    if state["session"]["phase"] == "writing":
        version = call("ana", "state?sessionId="+room)["teams"][0]["entry"]["revision"]
        call("ana", "submit", dict(data, revision=version))
        call("teacher", "start", dict(sessionId=room, revision=2))
    call("ana", "submit", dict(data, revision=99), 409)
    call("teacher", "assign", dict(sessionId=room, revision=3, assignments=assignments), 409)
    assert call("ana", "state?sessionId="+room)["session"]["phase"] == "presenting"
    assert grades.read_bytes() == original, "No gradebook changes are allowed"
    print("PASS: authenticated roster assignments, team privacy, shared edits, receipts, conflicts, all-team gate, race safety and no grades.")


def main():
    parser = argparse.ArgumentParser(); parser.add_argument("--serve", type=int, default=0); args = parser.parse_args()
    with tempfile.TemporaryDirectory(prefix="group-stories-qa-") as folder:
        api, profiles, grades = fixture(Path(folder))
        server = ThreadingHTTPServer(("127.0.0.1", args.serve), api.ProgressHandler)
        thread = threading.Thread(target=server.serve_forever, daemon=True); thread.start()
        base = "http://127.0.0.1:" + str(server.server_address[1])
        try:
            tokens = {}
            for key, name in profiles:
                code, data = request(base, "/api/intermediate2/grades/login", payload=dict(email=key+"@stories.example", password="QA-only-password"))
                assert code == 200, data; tokens[key] = data["token"]
            if args.serve:
                qa = ROOT / "tmp/unit5-group-stories"; qa.mkdir(exist_ok=True, parents=True)
                (qa / "session.json").write_text(json.dumps(dict(base=base, tokens=tokens)), encoding="utf-8")
                print("Disposable group-stories QA ready on " + base, flush=True); thread.join()
            else:
                run(base, tokens, grades)
        finally:
            server.shutdown(); server.server_close()


if __name__ == "__main__":
    main()
