"""Roster-assigned, shared picture stories. Private storage; no gradebook writes."""
import hashlib
import json
import os
import secrets
import sqlite3
from contextlib import contextmanager
from datetime import datetime, timezone


class StoryError(Exception):
    def __init__(self, status, message, **extra):
        self.status, self.message, self.extra = status, message, extra
        super().__init__(message)


def require(condition, status, message, **extra):
    if not condition:
        raise StoryError(status, message, **extra)


def clean(value, minimum=0, maximum=10000):
    require(isinstance(value, str), 400, "invalid_text")
    value = value.strip()
    require(minimum <= len(value) <= maximum and not any(ord(c) < 32 and c not in "\n\t" for c in value), 400, "invalid_text")
    return value


def now():
    return datetime.now(timezone.utc).isoformat()


def staff(actor):
    return actor.get("role") in ("teacher", "admin")


class GroupStories:
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
                CREATE TABLE IF NOT EXISTS sessions (
                    id TEXT PRIMARY KEY, owner TEXT NOT NULL, name TEXT NOT NULL,
                    phase TEXT NOT NULL DEFAULT 'assigning', revision INTEGER NOT NULL DEFAULT 0,
                    created TEXT NOT NULL, finalized TEXT, started TEXT,
                    UNIQUE(owner, name));
                CREATE TABLE IF NOT EXISTS teams (
                    id TEXT PRIMARY KEY, session_id TEXT NOT NULL REFERENCES sessions(id),
                    picture INTEGER NOT NULL CHECK(picture BETWEEN 1 AND 10),
                    UNIQUE(session_id, picture));
                CREATE TABLE IF NOT EXISTS members (
                    team_id TEXT NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
                    session_id TEXT NOT NULL REFERENCES sessions(id),
                    student_id TEXT NOT NULL, name TEXT NOT NULL,
                    PRIMARY KEY(session_id, student_id));
                CREATE TABLE IF NOT EXISTS stories (
                    team_id TEXT PRIMARY KEY REFERENCES teams(id) ON DELETE CASCADE,
                    story TEXT NOT NULL DEFAULT '', phrasal TEXT NOT NULL DEFAULT '',
                    revision INTEGER NOT NULL DEFAULT 0, status TEXT NOT NULL DEFAULT 'draft',
                    updated TEXT NOT NULL, updated_by TEXT NOT NULL, submitted TEXT,
                    receipt TEXT);
                CREATE TABLE IF NOT EXISTS requests (
                    actor TEXT NOT NULL, request_id TEXT NOT NULL, digest TEXT NOT NULL,
                    response TEXT NOT NULL, created TEXT NOT NULL,
                    PRIMARY KEY(actor, request_id));
                CREATE INDEX IF NOT EXISTS members_team ON members(team_id);
            """)
            yield con
            con.commit()
        except Exception:
            con.rollback()
            raise
        finally:
            con.close()

    def session(self, con, actor, session_id, teacher=False):
        row = con.execute("SELECT * FROM sessions WHERE id=?", (session_id,)).fetchone()
        allowed = row and (actor.get("role") == "admin" or (staff(actor) and row["owner"] == actor["key"]))
        if teacher:
            require(staff(actor), 403, "teacher_required")
        if not allowed and not teacher and not staff(actor):
            student = actor.get("student") or {}
            allowed = row and row["phase"] != "assigning" and con.execute(
                "SELECT 1 FROM members WHERE session_id=? AND student_id=?", (session_id, student.get("id", ""))).fetchone()
        require(allowed, 404, "session_not_found")
        return row

    def member(self, con, actor, team_id):
        require(not staff(actor), 403, "student_submission_only")
        require(actor.get("student"), 403, "registered_student_required")
        row = con.execute("""SELECT t.*, s.phase FROM teams t JOIN sessions s ON s.id=t.session_id
            JOIN members m ON m.team_id=t.id WHERE t.id=? AND m.student_id=?""",
            (team_id, actor["student"]["id"])).fetchone()
        require(row and row["phase"] != "assigning", 404, "team_not_found")
        return row

    def story_view(self, row):
        if row is None:
            return dict(story="", phrasalVerb="", revision=0, status="empty", updatedAt=None,
                        updatedBy=None, submittedAt=None, receiptId=None)
        return dict(story=row["story"], phrasalVerb=row["phrasal"], revision=row["revision"], status=row["status"],
                    updatedAt=row["updated"], updatedBy=row["updated_by"], submittedAt=row["submitted"], receiptId=row["receipt"])

    def team_view(self, con, row):
        return dict(id=row["id"], picture=row["picture"],
                    members=[dict(id=m["student_id"], name=m["name"]) for m in con.execute(
                        "SELECT * FROM members WHERE team_id=? ORDER BY name COLLATE NOCASE", (row["id"],))],
                    entry=self.story_view(con.execute("SELECT * FROM stories WHERE team_id=?", (row["id"],)).fetchone()))

    def room_view(self, con, row):
        total = con.execute("SELECT COUNT(*) FROM teams WHERE session_id=?", (row["id"],)).fetchone()[0]
        submitted = con.execute("""SELECT COUNT(*) FROM stories e JOIN teams t ON t.id=e.team_id
            WHERE t.session_id=? AND e.status='submitted'""", (row["id"],)).fetchone()[0]
        return dict(id=row["id"], name=row["name"], phase=row["phase"], revision=row["revision"],
                    teamCount=total, submittedCount=submitted,
                    readyToPresent=row["phase"] == "writing" and total > 0 and submitted == total)

    def state(self, actor, session_id="", roster=()):
        result = dict(role=actor["role"], name=actor["name"], sessions=[], teams=[],
                      gradebookProjected=False, affectsAverage=False)
        with self.db() as con:
            if staff(actor):
                rows = con.execute("SELECT * FROM sessions ORDER BY created DESC").fetchall()
                rows = [r for r in rows if actor["role"] == "admin" or r["owner"] == actor["key"]]
                result["roster"] = list(roster)
            else:
                require(actor.get("student"), 403, "registered_student_required")
                rows = con.execute("""SELECT DISTINCT s.* FROM sessions s JOIN members m ON m.session_id=s.id
                    WHERE m.student_id=? AND s.phase!='assigning' ORDER BY s.created DESC""",
                    (actor["student"]["id"],)).fetchall()
            result["sessions"] = [self.room_view(con, r) for r in rows]
            if session_id:
                room = self.session(con, actor, session_id)
                result["session"] = self.room_view(con, room)
                if staff(actor):
                    teams = con.execute("SELECT * FROM teams WHERE session_id=? ORDER BY picture", (session_id,)).fetchall()
                else:
                    teams = con.execute("""SELECT t.* FROM teams t JOIN members m ON m.team_id=t.id
                        WHERE t.session_id=? AND m.student_id=?""", (session_id, actor["student"]["id"])).fetchall()
                result["teams"] = [self.team_view(con, t) for t in teams]
            return result

    def action(self, actor, action, payload, roster=()):
        require(isinstance(payload, dict), 400, "invalid_payload")
        require(action in ("create", "assign", "finalize", "return-to-assignments", "save", "submit", "start"), 404, "unknown_action")
        request_id = clean(payload.get("requestId"), 8, 100)
        digest = hashlib.sha256(json.dumps([action, payload], sort_keys=True, ensure_ascii=False).encode()).hexdigest()
        with self.db() as con:
            con.execute("BEGIN IMMEDIATE")
            previous = con.execute("SELECT * FROM requests WHERE actor=? AND request_id=?", (actor["key"], request_id)).fetchone()
            if previous:
                require(previous["digest"] == digest, 409, "request_id_reused")
                return json.loads(previous["response"])
            if action in ("save", "submit"):
                result = self.write_story(con, actor, action, payload)
            else:
                require(staff(actor), 403, "teacher_required")
                result = self.teacher_action(con, actor, action, payload, roster)
            con.execute("INSERT INTO requests VALUES(?,?,?,?,?)", (actor["key"], request_id, digest, json.dumps(result), now()))
            return result

    def teacher_action(self, con, actor, action, payload, roster):
        if action == "create":
            name = clean(payload.get("name"), 1, 120)
            old = con.execute("SELECT id FROM sessions WHERE owner=? AND name=?", (actor["key"], name)).fetchone()
            if old:
                return dict(ok=True, sessionId=old["id"])
            ident = secrets.token_hex(12)
            con.execute("INSERT INTO sessions(id,owner,name,created) VALUES(?,?,?,?)", (ident, actor["key"], name, now()))
            return dict(ok=True, sessionId=ident)
        room = self.session(con, actor, clean(payload.get("sessionId"), 1, 80), teacher=True)
        require(type(payload.get("revision")) is int and payload["revision"] == room["revision"], 409, "assignments_changed")
        if action == "assign":
            require(room["phase"] == "assigning", 409, "assignments_finished")
            raw = payload.get("assignments")
            require(isinstance(raw, list) and len(raw) <= 10, 400, "invalid_assignments")
            people = {str(s["id"]): s["name"] for s in roster}
            used, pictures, normalized = set(), set(), []
            for assignment in raw:
                require(isinstance(assignment, dict), 400, "invalid_assignments")
                picture, members = assignment.get("picture"), assignment.get("studentIds")
                require(type(picture) is int and 1 <= picture <= 10 and picture not in pictures, 400, "invalid_picture")
                require(isinstance(members, list) and len(members) <= 100, 400, "invalid_members")
                pictures.add(picture)
                for sid in members:
                    require(isinstance(sid, str) and sid in people, 400, "student_not_in_roster")
                    require(sid not in used, 400, "student_assigned_twice")
                    used.add(sid)
                if members:
                    normalized.append((picture, members))
            con.execute("DELETE FROM teams WHERE session_id=?", (room["id"],))
            for picture, members in normalized:
                ident = secrets.token_hex(12)
                con.execute("INSERT INTO teams VALUES(?,?,?)", (ident, room["id"], picture))
                con.executemany("INSERT INTO members VALUES(?,?,?,?)", [(ident, room["id"], sid, people[sid]) for sid in members])
        elif action == "finalize":
            require(room["phase"] == "assigning", 409, "assignments_finished")
            members = con.execute("SELECT student_id FROM members WHERE session_id=?", (room["id"],)).fetchall()
            require(members, 400, "assign_at_least_one_team")
            active = {str(s["id"]) for s in roster}
            require(all(m["student_id"] in active for m in members), 409, "roster_changed")
            con.execute("UPDATE sessions SET phase='writing',finalized=? WHERE id=?", (now(), room["id"]))
        elif action == "return-to-assignments":
            require(room["phase"] == "writing", 409, "wrong_phase")
            count = con.execute("SELECT COUNT(*) FROM stories e JOIN teams t ON t.id=e.team_id WHERE t.session_id=?", (room["id"],)).fetchone()[0]
            require(count == 0, 409, "teams_have_started")
            con.execute("UPDATE sessions SET phase='assigning',finalized=NULL WHERE id=?", (room["id"],))
        elif action == "start":
            require(room["phase"] == "writing", 409, "wrong_phase")
            view = self.room_view(con, room)
            require(view["readyToPresent"], 409, "waiting_for_submissions", submitted=view["submittedCount"], total=view["teamCount"])
            con.execute("UPDATE sessions SET phase='presenting',started=? WHERE id=?", (now(), room["id"]))
        con.execute("UPDATE sessions SET revision=revision+1 WHERE id=?", (room["id"],))
        return dict(ok=True, sessionId=room["id"], revision=room["revision"] + 1)

    def write_story(self, con, actor, action, payload):
        team = self.member(con, actor, clean(payload.get("teamId"), 1, 80))
        require(team["phase"] == "writing", 409, "presentations_started")
        old = con.execute("SELECT * FROM stories WHERE team_id=?", (team["id"],)).fetchone()
        version = old["revision"] if old else 0
        require(type(payload.get("revision")) is int and payload["revision"] == version,
                409, "story_changed", latest=self.story_view(old))
        story = clean(payload.get("story", ""), 0, 16000)
        phrasal = clean(payload.get("phrasalVerb", ""), 0, 160)
        if action == "submit":
            require(story, 400, "write_your_story")
            require(phrasal, 400, "include_a_phrasal_verb")
            require(payload.get("everyoneIncluded") is True, 400, "include_every_speaker")
        stamp = now()
        receipt = secrets.token_hex(12) if action == "submit" else None
        status = "submitted" if action == "submit" else "draft"
        con.execute("""INSERT INTO stories(team_id,story,phrasal,revision,status,updated,updated_by,submitted,receipt)
            VALUES(?,?,?,?,?,?,?,?,?) ON CONFLICT(team_id) DO UPDATE SET story=excluded.story,phrasal=excluded.phrasal,
            revision=excluded.revision,status=excluded.status,updated=excluded.updated,updated_by=excluded.updated_by,
            submitted=excluded.submitted,receipt=excluded.receipt""",
            (team["id"], story, phrasal, version + 1, status, stamp, actor["name"], stamp if receipt else None, receipt))
        return dict(ok=True, teamId=team["id"], entry=self.story_view(con.execute("SELECT * FROM stories WHERE team_id=?", (team["id"],)).fetchone()))


def handle(handler, profile, parsed, api, payload=None):
    if not parsed.path.startswith("/api/intermediate2/group-stories/"):
        return False
    try:
        with api["data_lock"]:
            grades = api["read_grades_data"](api["INTERMEDIATE2_ENGLISH_GRADES_PATH"])
            trusted = {k: v for k, v in profile.items() if k != "_studentIdClaim"}
            person = api["registered_student_for_profile"](trusted, grades)
            role = api["grade_user_role"](trusted, grades)
            key = api["intermediate2_pronunciation_student_key"](trusted)
            actor = dict(role=role, key=key, name=(person or {}).get("fullName") or trusted.get("name") or "Student",
                         student=dict(id=str(person["id"])) if person else None)
            require(key, 403, "identity_required")
            roster = []
            if staff(actor):
                for s in grades.get("students", []):
                    if not isinstance(s, dict) or not s.get("id") or not s.get("fullName"):
                        continue
                    if api["grade_user_role"]({"email": s.get("email", "")}, grades) in ("teacher", "admin"):
                        continue
                    roster.append(dict(id=str(s["id"]), name=s["fullName"]))
                roster.sort(key=lambda s: s["name"].casefold())
        service = GroupStories(os.environ.get("JARALINGUA_INTERMEDIATE2_GROUP_STORIES_DB", "/var/lib/jaralingua/intermediate2-group-stories.sqlite3"))
        action = parsed.path.rsplit("/", 1)[-1]
        if handler.command == "GET" and action == "state":
            import urllib.parse
            query = urllib.parse.parse_qs(parsed.query)
            result = service.state(actor, (query.get("sessionId") or [""])[0], roster)
        elif handler.command == "POST":
            result = service.action(actor, action, payload, roster)
        else:
            raise StoryError(404, "unknown_route")
        api["json_response"](handler, 200, result)
    except StoryError as error:
        api["json_response"](handler, error.status, dict(error=error.message, **error.extra))
    except Exception as error:
        print("Group story storage:", type(error).__name__, flush=True)
        api["json_response"](handler, 503, dict(error="stories_temporarily_unavailable"))
    return True
