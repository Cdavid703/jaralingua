"""Isolated HTTP integration tests; --serve PORT exposes only disposable QA accounts."""
import argparse
import base64
import importlib.util
import io
import json
import os
import sys
import tempfile
import threading
import urllib.request
import urllib.error
from concurrent.futures import ThreadPoolExecutor
from http.server import ThreadingHTTPServer
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
PREFIX = "/api/intermediate2/film-festival/"
QA = ROOT / "tmp" / "film-festival-qa"


def request(base, path, token="", payload=None):
    headers = {"X-Jaralingua-Auth-Provider": "local"}
    if token:
        headers["Authorization"] = "Bearer " + token
    data = None
    if payload is not None:
        headers["Content-Type"] = "application/json"
        data = json.dumps(payload).encode()
    req = urllib.request.Request(base + path, data=data, headers=headers)
    try:
        response = urllib.request.urlopen(req, timeout=20)
    except urllib.error.HTTPError as error:
        response = error
    with response:
        data = response.read()
        return response.status, json.loads(data) if "json" in response.headers.get("Content-Type", "") else data


def fixture(folder):
    grades = folder / "grades.json"
    profiles = [("teacher", "Festival Teacher"), ("other", "Other Teacher"), ("admin", "Festival Admin"),
                ("ana", "Ana Test"), ("leo", "Leo Test")]
    grades.write_text(json.dumps({
        "adminEmails": ["admin@festival.example"],
        "teacherEmails": ["teacher@festival.example", "other@festival.example"],
        "evaluations": [],
        "students": [dict(id=str(9800+i), fullName=name, level="Intermediate English Course 2",
                          email=key+"@festival.example", localPassword="QA-only-password",
                          grades={}, gradeDetails={}) for i, (key, name) in enumerate(profiles)]
    }), encoding="utf-8")
    os.environ.update(JARALINGUA_GOOGLE_CLIENT_ID="test-client",
                      JARALINGUA_LOCAL_AUTH_SECRET="disposable-film-festival-test-secret",
                      JARALINGUA_INTERMEDIATE2_ENGLISH_GRADES_DATA=str(grades),
                      JARALINGUA_FILM_FESTIVAL_DB=str(folder / "festival.sqlite3"),
                      JARALINGUA_PROGRESS_DATA=str(folder / "progress.json"))
    spec = importlib.util.spec_from_file_location("festival_progress_api", ROOT/"server/progress_api.py")
    api = importlib.util.module_from_spec(spec)
    sys.modules[spec.name] = api
    spec.loader.exec_module(api)
    api.ProgressHandler.log_message = lambda *args: None
    return api, profiles, grades


def image_data():
    image = Image.new("RGB", (960, 540), "#193d68")
    from PIL import ImageDraw
    draw = ImageDraw.Draw(image)
    draw.ellipse((320, 100, 640, 420), fill="#d4a548")
    stream = io.BytesIO()
    image.save(stream, "PNG")
    QA.mkdir(parents=True, exist_ok=True)
    (QA / "test-image.png").write_bytes(stream.getvalue())
    return "data:image/png;base64,"+base64.b64encode(stream.getvalue()).decode()


def run(base, tokens, grades):
    original_grades = grades.read_bytes()
    def call(who, action, payload=None, status=200):
        result_status, result = request(base, PREFIX+action, tokens.get(who, ""), payload)
        assert result_status == status, (who, action, result_status, result)
        return result
    call("", "state", status=401)
    call("", "image?id=unknown", status=401)
    call("ana", "classes", {"name": "Not allowed"}, 403)
    room_id = call("teacher", "classes", {"name": "QA class"})["classId"]
    assert call("teacher", "classes", {"name": "QA class"})["classId"] == room_id
    room = call("teacher", "state?classId="+room_id)["class"]
    code = room["code"]
    call("other", "state?classId="+room_id, status=404)
    assert call("admin", "state?classId="+room_id)["class"]["id"] == room_id
    data = dict(code=code, clientSubmissionId="first-request", revision=0,
                movieTitle="The Test Film", description="A warm cinematic image of a moon above a quiet landscape, with dramatic lighting.",
                origin="ai", phrasalVerb="stand out", idiom="steal the show",
                textFreeConfirmed=True, imageDataUrl=image_data(), studentName="Forged name")
    call("ana", "submit", dict(data, textFreeConfirmed=False), 400)
    call("ana", "submit", dict(data, phrasalVerb=""), 400)
    call("ana", "submit", dict(data, imageDataUrl="data:image/svg+xml;base64,PHN2Zz4="), 400)
    call("ana", "submit", dict(data, imageDataUrl="data:image/png;base64,aW52YWxpZA=="), 400)
    small = io.BytesIO()
    Image.new("RGB", (20, 20)).save(small, "PNG")
    call("ana", "submit", dict(data, imageDataUrl="data:image/png;base64,"+base64.b64encode(small.getvalue()).decode()), 400)
    entry = call("ana", "submit", data)["entry"]
    assert entry["studentName"] == "Ana Test"
    assert entry["revision"] == 1
    assert call("ana", "submit", data)["entry"]["id"] == entry["id"]
    assert call("leo", "state?code="+code)["entry"] is None
    assert call("ana", "state?code="+code)["entries"] == []
    for who in ("leo", "other"):
        call(who, "image?id="+entry["id"], status=404)
    for who in ("ana", "teacher", "admin"):
        normalized = call(who, "image?id="+entry["id"])
        assert Image.open(io.BytesIO(normalized)).format == "JPEG"
    review = dict(entryId=entry["id"], revision=1, imageScores=[4]*4, oralScores=[5]*5,
                  seconds=59, phrasalObserved=True, idiomObserved=True, textFreeImage=True, feedback="Clear reasons.")
    call("ana", "review", review, 403)
    call("other", "review", review, 404)
    call("teacher", "review", dict(review, imageScores=[6]*4), 400)
    call("teacher", "review", dict(review, revision=0), 409)
    updated = call("ana", "submit", dict(data, clientSubmissionId="second-request", revision=1))["entry"]
    assert updated["revision"] == 2 and updated["id"] == entry["id"]
    call("teacher", "review", review, 409)
    result = call("teacher", "review", dict(review, revision=2))["review"]
    assert result["imageGrade"] == 4 and result["oralGrade"] == 5 and not result["minimumMet"]
    assert call("ana", "state?code="+code)["entry"]["review"]["feedback"] == "Clear reasons."
    call("ana", "submit", dict(data, clientSubmissionId="third-request", revision=2), 409)
    call("teacher", "class-status", dict(classId=room_id, closed=True))
    call("leo", "submit", data, 409)
    call("teacher", "class-status", dict(classId=room_id, closed=False))
    leo = call("leo", "submit", data)["entry"]
    # Both mutations use a write transaction: either the update wins and the review
    # is stale, or the review wins and replacing an evaluated image is rejected.
    with ThreadPoolExecutor(2) as pool:
        futures = [
            pool.submit(request, base, PREFIX+"submit", tokens["leo"], dict(data, revision=1, clientSubmissionId="race-request")),
            pool.submit(request, base, PREFIX+"review", tokens["teacher"], dict(review, entryId=leo["id"]))
        ]
        statuses = sorted(f.result()[0] for f in futures)
        assert statuses == [200, 409], statuses
    assert len(call("teacher", "state?classId="+room_id)["entries"]) == 2
    assert grades.read_bytes() == original_grades, "Festival marks must not alter the gradebook"
    print("PASS: authentication, role/class isolation, images, receipts, revisions, review, closure and concurrent updates.")


def main():
    args = argparse.ArgumentParser()
    args.add_argument("--serve", type=int, default=0)
    options = args.parse_args()
    with tempfile.TemporaryDirectory(prefix="festival-qa-") as folder:
        api, profiles, grades = fixture(Path(folder))
        server = ThreadingHTTPServer(("127.0.0.1", options.serve), api.ProgressHandler)
        thread = threading.Thread(target=server.serve_forever, daemon=True)
        thread.start()
        base = "http://127.0.0.1:"+str(server.server_address[1])
        try:
            tokens = {}
            for key, name in profiles:
                status, result = request(base, "/api/intermediate2/grades/login", payload=dict(email=key+"@festival.example", password="QA-only-password"))
                assert status == 200, result
                tokens[key] = result["token"]
            if options.serve:
                image_data()
                (QA/"session.json").write_text(json.dumps(dict(base=base, tokens=tokens)), encoding="utf-8")
                print("Disposable QA server ready on "+base, flush=True)
                thread.join()
            else:
                run(base, tokens, grades)
        finally:
            server.shutdown()
            server.server_close()


if __name__ == "__main__":
    main()
