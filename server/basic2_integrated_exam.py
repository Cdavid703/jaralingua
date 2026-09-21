"""Course 2 integrated exam: private content, durable attempts and teacher grading."""
import copy
import json
import os
import re
import secrets
import sqlite3
from contextlib import contextmanager
from datetime import datetime, timezone, timedelta
from pathlib import Path

EVALUATION = {"id": "basic2IntegratedTask20", "title": "Basic Course 2 - Integrated Task (20%)", "weight": 20}
RUBRIC_IDS = ("content", "composing", "vocabulary", "structure", "mechanics")


class ExamError(Exception):
    def __init__(self, status, message, **extra):
        self.status, self.message, self.extra = status, message, extra
        super().__init__(message)


def need(condition, status, message, **extra):
    if not condition:
        raise ExamError(status, message, **extra)


def stamp():
    return datetime.now(timezone.utc).isoformat()


def clean(value, limit=200, minimum=0):
    need(isinstance(value, str), 400, "invalid_text")
    value = value.strip()
    need(minimum <= len(value) <= limit, 400, "invalid_text")
    return value


def words(text):
    return len(re.findall(r"[\w]+(?:['\u2019-][\w]+)*", text, flags=re.UNICODE))


class IntegratedExam:
    def __init__(self, database, content_dir):
        self.database, self.content_dir = database, Path(content_dir)

    @contextmanager
    def db(self, write=False):
        Path(self.database).parent.mkdir(parents=True, exist_ok=True)
        con = sqlite3.connect(self.database, timeout=20)
        con.row_factory = sqlite3.Row
        try:
            con.executescript("""
            CREATE TABLE IF NOT EXISTS settings (key TEXT PRIMARY KEY, value TEXT NOT NULL);
            INSERT OR IGNORE INTO settings VALUES ('isOpen','false');
            CREATE TABLE IF NOT EXISTS attempts (student TEXT PRIMARY KEY, id TEXT UNIQUE NOT NULL, record TEXT NOT NULL);
            CREATE TABLE IF NOT EXISTS deliveries (student TEXT PRIMARY KEY, record TEXT NOT NULL);
            CREATE TABLE IF NOT EXISTS plays (student TEXT NOT NULL, request TEXT NOT NULL, sequence INTEGER NOT NULL, PRIMARY KEY(student,request));
            CREATE TABLE IF NOT EXISTS audit (id INTEGER PRIMARY KEY, actor TEXT NOT NULL, action TEXT NOT NULL, at TEXT NOT NULL);
            """)
            if write:
                con.execute("BEGIN IMMEDIATE")
            yield con
            con.commit()
        except Exception:
            con.rollback()
            raise
        finally:
            con.close()

    def bundle(self):
        return json.loads((self.content_dir / "exam.json").read_text(encoding="utf-8"))

    def public_exam(self):
        bundle = self.bundle()
        return {key: value for key, value in bundle.items() if key in ("title", "subtitle", "version", "writing")} | {
            "questions": [{k: q[k] for k in ("id", "prompt", "options", "speaker")} for q in bundle["questions"]]}

    def staff(self, actor):
        return actor["role"] in ("teacher", "admin")

    def row(self, con, table, student):
        row = con.execute("SELECT record FROM "+table+" WHERE student=?", (student,)).fetchone()
        return json.loads(row["record"]) if row else None

    def write_attempt(self, con, student, attempt):
        con.execute("UPDATE attempts SET record=? WHERE student=?", (json.dumps(attempt), student))

    def public_attempt(self, attempt):
        return {k: v for k, v in attempt.items() if k != "owner"} if attempt else None

    def public_delivery(self, delivery, staff=False):
        if not delivery:
            return None
        allowed = ("receiptId", "submittedAt", "status", "grade", "feedback", "writingPoints", "listeningPoints",
                   "wordCount", "courseCode", "writing", "answers", "lateWriting")
        # No scores or answer feedback until the teacher has completed the review.
        result = {k: delivery[k] for k in allowed if k in delivery}
        if delivery["status"] != "graded" and not staff:
            for key in ("grade", "listeningPoints", "writingPoints"):
                result.pop(key, None)
        return dict(delivery) if staff else result

    def view(self, actor):
        with self.db() as con:
            opened = json.loads(con.execute("SELECT value FROM settings WHERE key='isOpen'").fetchone()[0])
            result = dict(role=actor["role"], isOpen=opened, student=actor.get("student"),
                          audioReady=(self.content_dir/"listening.mp3").is_file())
            if self.staff(actor):
                bundle = self.bundle()
                result.update(exam=self.public_exam(), rubric=bundle["rubric"], transcript=bundle["transcript"],
                              answerKey=[dict(id=q["id"], answer=q["answer"], evidence=q["evidence"]) for q in bundle["questions"]])
                result["entries"] = []
                for row in con.execute("SELECT student,record FROM attempts ORDER BY student"):
                    attempt = json.loads(row["record"])
                    delivery = self.row(con, "deliveries", row["student"])
                    result["entries"].append(dict(studentId=row["student"], name=attempt["name"], attempt=self.public_attempt(attempt),
                                                  submission=self.public_delivery(delivery, True)))
                return result
            if not actor.get("student"):
                return result
            sid = actor["student"]["id"]
            attempt, delivery = self.row(con, "attempts", sid), self.row(con, "deliveries", sid)
            result.update(attempt=self.public_attempt(attempt), submission=self.public_delivery(delivery))
            if attempt and not delivery:
                result["exam"] = self.public_exam()
            return result

    def active_attempt(self, con, actor, payload):
        need(not self.staff(actor), 403, "use_teacher_preview")
        need(actor.get("student"), 403, "account_not_linked")
        sid = actor["student"]["id"]
        attempt = self.row(con, "attempts", sid)
        need(attempt and attempt["id"] == payload.get("attemptId"), 409, "attempt_not_found")
        need(not self.row(con, "deliveries", sid), 409, "already_submitted")
        return sid, attempt

    def answers(self, payload):
        value = payload.get("answers")
        need(isinstance(value, dict) and set(value).issubset({str(i) for i in range(1, 11)}), 400, "invalid_answers")
        need(all(v is None or type(v) is int and 0 <= v <= 3 for v in value.values()), 400, "invalid_answers")
        return {str(i): value.get(str(i)) for i in range(1, 11)}

    def action(self, actor, action, payload):
        need(isinstance(payload, dict), 400, "invalid_payload")
        with self.db(write=True) as con:
            if action == "availability":
                need(self.staff(actor), 403, "teacher_required")
                need(type(payload.get("isOpen")) is bool, 400, "invalid_state")
                if payload["isOpen"]:
                    need((self.content_dir/"listening.mp3").is_file(), 409, "audio_not_ready")
                con.execute("UPDATE settings SET value=? WHERE key='isOpen'", (json.dumps(payload["isOpen"]),))
                con.execute("INSERT INTO audit(actor,action,at) VALUES(?,?,?)", (actor["key"], "open" if payload["isOpen"] else "close", stamp()))
                return {"ok": True}
            if action == "grade":
                need(self.staff(actor), 403, "teacher_required")
                sid = clean(payload.get("studentId"), 80, 1)
                delivery = self.row(con, "deliveries", sid)
                need(delivery, 404, "submission_not_found")
                need(payload.get("receiptId") == delivery["receiptId"], 409, "submission_changed")
                need(type(payload.get("reviewRevision")) is int and payload["reviewRevision"] == delivery["reviewRevision"], 409, "review_changed")
                scores = payload.get("rubric")
                need(isinstance(scores, dict) and set(scores) == set(RUBRIC_IDS), 400, "invalid_rubric")
                need(all(type(v) is int and 1 <= v <= 5 for v in scores.values()), 400, "invalid_rubric")
                writing_points = sum(scores.values())
                delivery.update(rubric=scores, writingPoints=writing_points, grade=round((delivery["listeningPoints"]+writing_points)/10, 2),
                                feedback=clean(payload.get("feedback", ""), 4000), gradedAt=stamp(), gradedBy=actor["key"],
                                status="graded", reviewRevision=delivery["reviewRevision"]+1)
                con.execute("UPDATE deliveries SET record=? WHERE student=?", (json.dumps(delivery), sid))
                return {"ok": True, "submission": self.public_delivery(delivery, True)}
            need(not self.staff(actor), 403, "use_teacher_preview")
            need(actor.get("student"), 403, "account_not_linked")
            sid = actor["student"]["id"]
            delivery = self.row(con, "deliveries", sid)
            if action == "submit" and delivery and delivery["clientSubmissionId"] == payload.get("clientSubmissionId"):
                return {"ok": True, "idempotent": True, "submission": self.public_delivery(delivery)}
            need(not delivery, 409, "already_submitted")
            if action == "start":
                attempt = self.row(con, "attempts", sid)
                if not attempt:
                    opened = json.loads(con.execute("SELECT value FROM settings WHERE key='isOpen'").fetchone()[0])
                    need(opened, 403, "exam_closed")
                    need((self.content_dir/"listening.mp3").is_file(), 409, "audio_not_ready")
                    attempt = dict(id=secrets.token_hex(16), name=actor["student"]["fullName"], owner=actor["key"],
                                   startedAt=stamp(), updatedAt=stamp(), writingStartedAt=None, writingDeadline=None,
                                   revision=0, plays=0, listenLimit=None, lastPlayRequest=None, answers={}, writing="",
                                   courseCode=clean(payload.get("courseCode", ""), 60, 1), version=self.bundle()["version"])
                    con.execute("INSERT INTO attempts VALUES(?,?,?)", (sid, attempt["id"], json.dumps(attempt)))
                return {"ok": True, "attempt": self.public_attempt(attempt), "exam": self.public_exam()}
            sid, attempt = self.active_attempt(con, actor, payload)
            if action == "play":
                request_id = clean(payload.get("requestId"), 100, 8)
                old = con.execute("SELECT sequence FROM plays WHERE student=? AND request=?", (sid, request_id)).fetchone()
                if old:
                    return {"ok": True, "attempt": self.public_attempt(attempt)}
                attempt["plays"] += 1
                attempt["lastPlayRequest"] = request_id
                con.execute("INSERT INTO plays VALUES(?,?,?)", (sid, request_id, attempt["plays"]))
                self.write_attempt(con, sid, attempt)
                return {"ok": True, "attempt": self.public_attempt(attempt)}
            if action == "writing-start":
                if not attempt["writingStartedAt"]:
                    attempt["writingStartedAt"] = stamp()
                    attempt["writingDeadline"] = (datetime.now(timezone.utc)+timedelta(minutes=40)).isoformat()
                    self.write_attempt(con, sid, attempt)
                return {"ok": True, "attempt": self.public_attempt(attempt)}
            need(action in ("draft", "submit"), 404, "unknown_action")
            need(type(payload.get("revision")) is int and payload["revision"] == attempt["revision"], 409, "draft_conflict",
                 attempt=self.public_attempt(attempt))
            answers, writing = self.answers(payload), clean(payload.get("writing", ""), 20000)
            course_code = clean(payload.get("courseCode", attempt["courseCode"]), 60, 1)
            if action == "submit":
                need(attempt["writingStartedAt"], 409, "start_writing_first")
                need(len(writing) > 0, 400, "writing_empty")
                complete = sum(v is not None for v in answers.values()) == 10 and words(writing) >= 30
                need(complete or payload.get("allowIncomplete") is True, 422, "incomplete_exam")
                request_id = clean(payload.get("clientSubmissionId"), 100, 8)
                points = sum(2.5 for q in self.bundle()["questions"] if answers[q["id"]] == q["answer"])
                delivery = dict(receiptId="B2IT-"+secrets.token_hex(8).upper(), attemptId=attempt["id"], name=attempt["name"],
                                submittedAt=stamp(), clientSubmissionId=request_id, answers=answers, writing=writing, courseCode=course_code,
                                wordCount=words(writing), listeningPoints=points, status="pending_teacher_review", reviewRevision=0,
                                plays=attempt["plays"], lateWriting=datetime.now(timezone.utc)>datetime.fromisoformat(attempt["writingDeadline"]))
                con.execute("INSERT INTO deliveries VALUES(?,?)", (sid, json.dumps(delivery)))
            attempt.update(answers=answers, writing=writing, courseCode=course_code, revision=attempt["revision"]+1, updatedAt=stamp())
            self.write_attempt(con, sid, attempt)
            return {"ok": True, "attempt": self.public_attempt(attempt),
                    **({"submission": self.public_delivery(delivery)} if action == "submit" else {})}

    def audio(self, actor):
        if not self.staff(actor):
            need(actor.get("student"), 403, "account_not_linked")
            with self.db() as con:
                sid = actor["student"]["id"]
                attempt = self.row(con, "attempts", sid)
                need(attempt and attempt["plays"] > 0 and not self.row(con, "deliveries", sid), 403, "audio_not_authorized")
        path = self.content_dir / "listening.mp3"
        need(path.is_file(), 404, "audio_not_ready")
        return path.read_bytes()

    def project_grades(self, grades):
        before = json.dumps(grades, sort_keys=True)
        evaluations = grades.setdefault("evaluations", [])
        existing = next((x for x in evaluations if x.get("id") == EVALUATION["id"]), None)
        if existing is None:
            evaluations.append(dict(EVALUATION))
        else:
            existing.update(EVALUATION)
        with self.db() as con:
            for student in grades.get("students", []):
                delivery = self.row(con, "deliveries", str(student.get("id", "")))
                if not delivery:
                    continue
                details = student.setdefault("gradeDetails", {})
                old = details.get(EVALUATION["id"], {})
                # Project each durable review once; subsequent manual grid corrections survive.
                if old.get("receiptId") == delivery["receiptId"] and old.get("reviewRevision") == delivery["reviewRevision"]:
                    continue
                details[EVALUATION["id"]] = dict(evaluationId=EVALUATION["id"], activityTitle=EVALUATION["title"],
                    status=delivery["status"], submittedAt=delivery["submittedAt"], receiptId=delivery["receiptId"],
                    reviewRevision=delivery["reviewRevision"], pendingTeacherReview=delivery["status"]!="graded",
                    officialAssessment=True, weight=20, grade=delivery.get("grade"), feedback=delivery.get("feedback", ""))
                if delivery["status"] == "graded":
                    student.setdefault("grades", {})[EVALUATION["id"]] = delivery["grade"]
        return before != json.dumps(grades, sort_keys=True)
