"""Basic 2 final writing: individual attempts, legacy team receipts and durable receipts."""
import json
import os
import secrets
import sqlite3
from contextlib import contextmanager
from datetime import datetime, timezone, timedelta

from basic2_integrated_exam import ExamError, need, clean, words, stamp

EVALUATION = {"id": "basic2FinalWritingTask20", "title": "Basic Course 2 - Final Writing Task (20%)", "weight": 20}
WRITING_HOURS = 48
RUBRIC = {"content": "Content", "composing": "Organization", "vocabulary": "Vocabulary", "structure": "Structure", "mechanics": "Spelling, punctuation and layout"}
PICTURES = {
    "coast": "/assets/img/english-basic-2/yesterday-pictures/beach.png",
    "town": "/assets/img/english-basic-2/exams/midterm-writing-city-weather.png",
    "holiday": "/assets/img/english-basic-2/unit-5-my-holidays-hero.png",
}


def staff(actor):
    return actor.get("role") in ("teacher", "admin")


class PostcardExam:
    def __init__(self, path):
        self.path = path

    @contextmanager
    def db(self):
        os.makedirs(os.path.dirname(os.path.abspath(self.path)), exist_ok=True)
        con = sqlite3.connect(self.path, timeout=20)
        con.row_factory = sqlite3.Row
        try:
            con.execute("PRAGMA foreign_keys=ON")
            con.executescript("""
                CREATE TABLE IF NOT EXISTS settings (key TEXT PRIMARY KEY, value TEXT NOT NULL);
                INSERT OR IGNORE INTO settings VALUES ('isOpen','false');
                CREATE TABLE IF NOT EXISTS teams (id TEXT PRIMARY KEY, record TEXT NOT NULL);
                CREATE TABLE IF NOT EXISTS members (student TEXT PRIMARY KEY, team TEXT NOT NULL REFERENCES teams(id));
                CREATE TABLE IF NOT EXISTS audit (id INTEGER PRIMARY KEY, actor TEXT NOT NULL, action TEXT NOT NULL, at TEXT NOT NULL, detail TEXT NOT NULL);
            """)
            con.execute("BEGIN IMMEDIATE")
            # Teacher-authorized extension, including teams already writing.
            # Preserve reopened periods, text, revision counters and confirmations.
            for row in con.execute("SELECT id, record FROM teams").fetchall():
                team = json.loads(row["record"])
                if team.get("status") == "writing" and team.get("deadline") and team.get("durationHours") != WRITING_HOURS:
                    previous = datetime.fromisoformat(team["deadline"])
                    team["deadline"] = (previous + timedelta(hours=WRITING_HOURS, minutes=-50)).isoformat()
                    team["durationHours"] = WRITING_HOURS
                    con.execute("UPDATE teams SET record=? WHERE id=?", (json.dumps(team), row["id"]))
                    con.execute("INSERT INTO audit(actor,action,at,detail) VALUES(?,?,?,?)",
                                ("teacher-authorized-duration-extension", "extend-time-48-hours", stamp(), row["id"]))
            yield con
            con.commit()
        except Exception:
            con.rollback()
            raise
        finally:
            con.close()

    def team(self, con, tid):
        row = con.execute("SELECT record FROM teams WHERE id=?", (tid,)).fetchone()
        need(row, 404, "team_not_found")
        return json.loads(row[0])

    def own(self, con, actor):
        need(actor.get("student"), 403, "account_not_linked")
        sid = actor["student"]["id"]
        row = con.execute("SELECT team FROM members WHERE student=?", (sid,)).fetchone()
        need(row, 403, "team_not_assigned")
        return sid, self.team(con, row[0])

    def save(self, con, team, actor, action):
        team["updatedAt"] = stamp()
        con.execute("UPDATE teams SET record=? WHERE id=?", (json.dumps(team), team["id"]))
        con.execute("INSERT INTO audit(actor,action,at,detail) VALUES(?,?,?,?)", (actor["key"], action, stamp(), team["id"]))

    def public(self, team, actor):
        result = json.loads(json.dumps(team))
        if not staff(actor):
            sid = actor["student"]["id"]
            result["reviews"] = {sid: result["reviews"][sid]} if sid in result["reviews"] else {}
            result.pop("history", None)
            result.pop("lastSubmissionKey", None)
        return result

    def eligible(self, actor, roster):
        student = actor.get("student")
        record = next((s for s in roster if student and str(s["id"]) == student["id"]), None)
        return record is not None and not isinstance(record.get("grades", {}).get(EVALUATION["id"]), (int, float))

    def create(self, con, actor, student, name, course):
        sid = str(student["id"])
        team = dict(id=secrets.token_hex(12), mode="individual", name=name, courseCode=course,
                    members=[dict(id=sid, name=student["fullName"])],
                    parts=[dict(author=sid, text="", revision=0) for _ in range(3)],
                    picture="coast", revision=0, ready=[], status="assigned", startedAt=None, deadline=None,
                    reviews={}, history=[], receiptId=None, submittedAt=None, updatedAt=stamp())
        con.execute("INSERT INTO teams VALUES(?,?)", (team["id"], json.dumps(team)))
        con.execute("INSERT INTO members VALUES(?,?)", (sid, team["id"]))
        self.save(con, team, actor, "create-individual")
        return team

    def view(self, actor, roster):
        with self.db() as con:
            result = dict(role=actor["role"], student=actor.get("student"),
                          isOpen=json.loads(con.execute("SELECT value FROM settings WHERE key='isOpen'").fetchone()[0]),
                          pictures=PICTURES, rubric=RUBRIC, submissionMode="individual")
            if staff(actor):
                assigned = {r[0] for r in con.execute("SELECT student FROM members")}
                result["roster"] = [dict(id=str(s["id"]), name=s["fullName"], assigned=str(s["id"]) in assigned) for s in roster]
                result["teams"] = [self.public(json.loads(r[0]), actor) for r in con.execute("SELECT record FROM teams")]
            elif actor.get("student"):
                row = con.execute("SELECT team FROM members WHERE student=?", (actor["student"]["id"],)).fetchone()
                result["team"] = self.public(self.team(con, row[0]), actor) if row else None
                result["canStart"] = not row and result["isOpen"] and self.eligible(actor, roster)
                result["assessmentComplete"] = not row and not self.eligible(actor, roster)
            return result

    def action(self, actor, action, payload, roster):
        need(isinstance(payload, dict), 400, "invalid_payload")
        with self.db() as con:
            if action == "availability":
                need(staff(actor), 403, "teacher_required")
                need(type(payload.get("isOpen")) is bool, 400, "invalid_state")
                con.execute("UPDATE settings SET value=? WHERE key='isOpen'", (json.dumps(payload["isOpen"]),))
                con.execute("INSERT INTO audit(actor,action,at,detail) VALUES(?,?,?,?)", (actor["key"], action, stamp(), str(payload["isOpen"])))
                return {"ok": True}
            if action == "create-team":
                need(staff(actor), 403, "teacher_required")
                ids = payload.get("members")
                need(isinstance(ids, list) and len(ids) == 1 and isinstance(ids[0], str), 400, "choose_one_student")
                student = next((s for s in roster if str(s["id"]) == ids[0]), None)
                need(student, 400, "student_not_in_course")
                need(not con.execute("SELECT 1 FROM members WHERE student=?", (ids[0],)).fetchone(), 409, "student_already_assigned")
                need(self.eligible(dict(student=dict(id=ids[0])), roster), 409, "assessment_complete")
                team = self.create(con, actor, student, clean(payload.get("name"), 80, 1), clean(payload.get("courseCode"), 60, 1))
                return {"ok": True, "team": self.public(team, actor)}
            if action in ("grade", "reopen", "delete-team"):
                need(staff(actor), 403, "teacher_required")
                team = self.team(con, clean(payload.get("teamId"), 40, 1))
                if action == "delete-team":
                    need(team["status"] == "assigned", 409, "team_already_started")
                    con.execute("DELETE FROM members WHERE team=?", (team["id"],))
                    con.execute("DELETE FROM teams WHERE id=?", (team["id"],))
                    con.execute("INSERT INTO audit(actor,action,at,detail) VALUES(?,?,?,?)", (actor["key"], action, stamp(), team["id"]))
                    return {"ok": True}
                need(team["status"] == "submitted", 409, "not_submitted")
                need(payload.get("receiptId") == team["receiptId"], 409, "submission_changed")
                if action == "grade":
                    sid = clean(payload.get("studentId"), 80, 1)
                    need(sid in [m["id"] for m in team["members"]], 400, "student_not_in_team")
                    old = team["reviews"].get(sid, {})
                    need(type(payload.get("reviewRevision")) is int and payload["reviewRevision"] == old.get("revision", 0), 409, "review_changed")
                    rubric = payload.get("rubric")
                    need(isinstance(rubric, dict) and set(rubric) == set(RUBRIC) and all(type(v) is int and 1 <= v <= 10 for v in rubric.values()), 400, "invalid_rubric")
                    team["reviews"][sid] = dict(rubric=rubric, grade=round(sum(rubric.values()) / 10, 2),
                                               feedback=clean(payload.get("feedback", ""), 6000, 1), revision=old.get("revision", 0)+1,
                                               gradedAt=stamp(), gradedBy=actor["key"])
                else:
                    need(not team["reviews"], 409, "graded_team_cannot_reopen")
                    team["history"].append({k:team[k] for k in ("receiptId", "submittedAt", "parts")})
                    team.update(status="writing", ready=[], receiptId=None, submittedAt=None, revision=team["revision"]+1,
                                deadline=(datetime.now(timezone.utc)+timedelta(hours=WRITING_HOURS)).isoformat(), durationHours=WRITING_HOURS)
                    team.pop("lastSubmissionKey", None)
                self.save(con, team, actor, action)
                return {"ok": True, "team": self.public(team, actor)}
            need(not staff(actor), 403, "use_teacher_preview")
            need(actor.get("student"), 403, "account_not_linked")
            sid = actor["student"]["id"]
            if action == "start" and not con.execute("SELECT 1 FROM members WHERE student=?", (sid,)).fetchone():
                need(not payload.get("teamId"), 403, "wrong_team")
                need(self.eligible(actor, roster), 409, "assessment_complete")
                need(json.loads(con.execute("SELECT value FROM settings WHERE key='isOpen'").fetchone()[0]), 403, "exam_closed")
                self.create(con, actor, actor["student"], actor["student"]["fullName"], "Basic English 2")
            sid, team = self.own(con, actor)
            need(payload.get("teamId") == team["id"] or (action == "start" and not payload.get("teamId")), 403, "wrong_team")
            if action == "submit" and team["status"] == "submitted":
                return {"ok": True, "idempotent": True, "team": self.public(team, actor)}
            need(team["status"] != "submitted", 409, "already_submitted")
            if action == "start":
                if team["status"] == "assigned":
                    need(json.loads(con.execute("SELECT value FROM settings WHERE key='isOpen'").fetchone()[0]), 403, "exam_closed")
                    team.update(status="writing", startedAt=stamp(), deadline=(datetime.now(timezone.utc)+timedelta(hours=WRITING_HOURS)).isoformat(), durationHours=WRITING_HOURS)
                    self.save(con, team, actor, action)
                return {"ok": True, "team": self.public(team, actor)}
            need(team["status"] == "writing", 409, "start_first")
            if action == "draft":
                parts = payload.get("parts")
                own_indices = {str(i) for i, p in enumerate(team["parts"]) if p["author"] == sid}
                need(isinstance(parts, dict) and set(parts) == own_indices, 403, "edit_own_parts_only")
                for i, value in parts.items():
                    need(isinstance(value, dict), 400, "invalid_text")
                    part = team["parts"][int(i)]
                    text = clean(value.get("text"), 5000)
                    need(type(value.get("revision")) is int and (value["revision"] == part["revision"] or text == part["text"]),
                         409, "draft_conflict", team=self.public(team, actor))
                changed = False
                for i, value in parts.items():
                    part = team["parts"][int(i)]
                    text = value["text"].strip()
                    if part["text"] != text:
                        part.update(text=text, revision=part["revision"]+1)
                        changed = True
                if changed:
                    team.update(revision=team["revision"]+1, ready=[])
                    self.save(con, team, actor, action)
                return {"ok": True, "team": self.public(team, actor)}
            need(action in ("picture", "ready", "submit"), 404, "unknown_action")
            need(type(payload.get("revision")) is int and payload["revision"] == team["revision"], 409, "team_changed", team=self.public(team, actor))
            if action == "picture":
                need(payload.get("picture") in PICTURES, 400, "invalid_picture")
                if payload["picture"] != team["picture"]:
                    team.update(picture=payload["picture"], revision=team["revision"]+1, ready=[])
            elif action == "ready":
                need(all(p["text"].strip() for p in team["parts"]), 422, "complete_all_parts")
                if sid not in team["ready"]:
                    team["ready"].append(sid)
            else:
                need(all(p["text"].strip() for p in team["parts"]), 422, "complete_all_parts")
                need(set(team["ready"]) == {m["id"] for m in team["members"]}, 422, "everyone_must_confirm")
                count = words(" ".join(p["text"] for p in team["parts"]))
                need(100 <= count <= 150 or payload.get("allowLength") is True, 422, "check_word_count")
                team.update(status="submitted", receiptId="B2FW-"+secrets.token_hex(8).upper(), submittedAt=stamp(),
                            wordCount=count, late=datetime.now(timezone.utc)>datetime.fromisoformat(team["deadline"]),
                            lastSubmissionKey=clean(payload.get("requestId"), 100, 8))
            self.save(con, team, actor, action)
            return {"ok": True, "team": self.public(team, actor)}

    def project_grades(self, grades):
        before = json.dumps(grades, sort_keys=True)
        evaluations = grades.setdefault("evaluations", [])
        existing = next((e for e in evaluations if e.get("id") == EVALUATION["id"]), None)
        if existing is None:
            evaluations.append(dict(EVALUATION))
        else:
            existing.update(EVALUATION)
        with self.db() as con:
            for student in grades.get("students", []):
                sid = str(student.get("id", ""))
                membership = con.execute("SELECT team FROM members WHERE student=?", (sid,)).fetchone()
                if not membership:
                    continue
                team = self.team(con, membership[0])
                details = student.setdefault("gradeDetails", {})
                old = details.get(EVALUATION["id"], {})
                if team["status"] != "submitted":
                    if old.get("receiptId") and not team["reviews"]:
                        details[EVALUATION["id"]] = dict(evaluationId=EVALUATION["id"], status="reopened", weight=20, officialAssessment=True)
                    continue
                review = team["reviews"].get(sid)
                revision = review["revision"] if review else 0
                if old.get("receiptId") == team["receiptId"] and old.get("reviewRevision") == revision:
                    continue
                details[EVALUATION["id"]] = dict(evaluationId=EVALUATION["id"], activityTitle=EVALUATION["title"],
                    status="graded" if review else "pending_teacher_review", submittedAt=team["submittedAt"],
                    receiptId=team["receiptId"], reviewRevision=revision, pendingTeacherReview=not bool(review),
                    officialAssessment=True, weight=20, grade=review["grade"] if review else None,
                    feedback=review["feedback"] if review else "", teamId=team["id"])
                if review:
                    student.setdefault("grades", {})[EVALUATION["id"]] = review["grade"]
        return before != json.dumps(grades, sort_keys=True)


def service():
    return PostcardExam(os.environ.get("JARALINGUA_BASIC2_FINAL_POSTCARD_DB", "/var/lib/jaralingua/basic2-final-postcard.sqlite3"))


def reconcile(api, grades):
    return service().project_grades(grades)


def handle(handler, profile, parsed, api, payload=None):
    if not parsed.path.startswith("/api/basic2/final-postcard/"):
        return False
    try:
        with api["data_lock"]:
            grades = api["read_grades_data"](api["BASIC2_ENGLISH_GRADES_PATH"])
            trusted = {k:v for k,v in profile.items() if k != "_studentIdClaim"}
            student = api["matched_student_for_profile"](trusted, grades)
            actor = dict(role=api["grade_user_role"](trusted, grades), key=str(trusted.get("sub") or trusted.get("email") or ""),
                         student=dict(id=str(student["id"]), fullName=student["fullName"]) if student else None)
            exam = service()
            action = parsed.path.rsplit("/", 1)[-1]
            if handler.command == "GET" and action == "state":
                result = exam.view(actor, grades.get("students", []))
            elif handler.command == "POST":
                result = exam.action(actor, action, payload, grades.get("students", []))
                if action in ("submit", "grade", "reopen"):
                    try:
                        if exam.project_grades(grades):
                            api["write_json_file"](api["BASIC2_ENGLISH_GRADES_PATH"], grades, ".basic2-grades-")
                        result["gradebookSynced"] = True
                    except Exception as error:
                        print("Basic 2 postcard grade projection:", type(error).__name__, flush=True)
                        result["gradebookSynced"] = False
            else:
                raise ExamError(404, "unknown_route")
            api["json_response"](handler, 200, result)
    except ExamError as error:
        api["json_response"](handler, error.status, {"error":error.message, **error.extra})
    except Exception as error:
        print("Basic 2 postcard:", type(error).__name__, flush=True)
        api["json_response"](handler, 503, {"error":"exam_temporarily_unavailable"})
    return True
