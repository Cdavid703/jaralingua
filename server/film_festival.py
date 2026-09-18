"""Private, class-scoped image submissions and teacher reviews for the film festival."""
import base64
import binascii
import io
import json
import os
import re
import secrets
import sqlite3
from contextlib import contextmanager
from datetime import datetime, timezone

PHRASAL = ("come out", "put on", "turn up", "turn down", "find out", "stand out")
IDIOMS = ("steal the show", "on the edge of your seat", "music to my ears")
IMAGE_CRITERIA = ("Meaning and connection to the film", "Visual storytelling without text", "Composition and readability", "Detailed description and intentional choices")
ORAL_CRITERIA = ("At least 60 seconds and clear structure", "Plot and opinion supported with reasons", "Grammar and vocabulary", "Pronunciation and fluency", "Correct phrasal verb and idiom in context")


class FestivalError(Exception):
    def __init__(self, status, message):
        self.status, self.message = status, message
        super().__init__(message)


def fail(condition, status, message):
    if condition:
        raise FestivalError(status, message)


def text(value, minimum=0, maximum=200):
    fail(not isinstance(value, str), 400, "invalid_text")
    value = value.strip()
    fail(len(value) < minimum or len(value) > maximum or any(ord(c) < 32 and c not in "\n\t" for c in value), 400, "invalid_text")
    return value


def now():
    return datetime.now(timezone.utc).isoformat()


def normalize_image(data):
    from PIL import Image, ImageOps, UnidentifiedImageError
    fail(not isinstance(data, str) or len(data) > 12_000_000, 400, "image_too_large")
    match = re.fullmatch(r"data:image/(?:png|jpeg|webp);base64,([A-Za-z0-9+/=]+)", data)
    fail(not match, 400, "use_png_jpeg_or_webp")
    try:
        raw = base64.b64decode(match.group(1), validate=True)
        fail(len(raw) > 8 * 1024 * 1024, 400, "image_too_large")
        with Image.open(io.BytesIO(raw)) as source:
            fail(source.format not in ("PNG", "JPEG", "WEBP") or source.width < 320 or source.height < 240, 400, "image_too_small_or_invalid")
            fail(source.width * source.height > 20_000_000, 400, "image_dimensions_too_large")
            source.load()
            image = ImageOps.exif_transpose(source).convert("RGBA")
            canvas = Image.new("RGB", image.size, "white")
            canvas.paste(image, mask=image.getchannel("A"))
            canvas.thumbnail((1920, 1920))
            out = io.BytesIO()
            canvas.save(out, "JPEG", quality=90, optimize=True)
            return out.getvalue()
    except FestivalError:
        raise
    except (UnidentifiedImageError, OSError, ValueError, Image.DecompressionBombError):
        raise FestivalError(400, "invalid_image")


class FilmFestival:
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
            CREATE TABLE IF NOT EXISTS classes (
              id TEXT PRIMARY KEY, code TEXT UNIQUE NOT NULL, name TEXT NOT NULL,
              owner TEXT NOT NULL, created TEXT NOT NULL, closed INTEGER NOT NULL DEFAULT 0);
            CREATE TABLE IF NOT EXISTS entries (
              id TEXT PRIMARY KEY, class_id TEXT NOT NULL REFERENCES classes(id),
              student TEXT NOT NULL, student_name TEXT NOT NULL, title TEXT NOT NULL,
              description TEXT NOT NULL, origin TEXT NOT NULL, phrasal TEXT NOT NULL, idiom TEXT NOT NULL,
              image BLOB NOT NULL, revision INTEGER NOT NULL, request_id TEXT NOT NULL,
              submitted TEXT NOT NULL, review TEXT,
              UNIQUE(class_id, student));
            """)
            yield con
            con.commit()
        except Exception:
            con.rollback()
            raise
        finally:
            con.close()

    def staff(self, actor):
        return actor["role"] in ("admin", "teacher")

    def allowed(self, actor, row):
        return actor["role"] == "admin" or (actor["role"] == "teacher" and row["owner"] == actor["key"])

    def classroom(self, con, actor, class_id):
        row = con.execute("SELECT * FROM classes WHERE id=?", (class_id,)).fetchone()
        fail(not row or not self.allowed(actor, row), 404, "class_not_found")
        return row

    def public_entry(self, row):
        if not row:
            return None
        return {
            "id": row["id"], "classId": row["class_id"], "studentName": row["student_name"],
            "movieTitle": row["title"], "description": row["description"], "origin": row["origin"],
            "phrasalVerb": row["phrasal"], "idiom": row["idiom"], "revision": row["revision"],
            "submittedAt": row["submitted"], "receiptId": row["id"],
            "imageUrl": "/api/intermediate2/film-festival/image?id=" + row["id"] + "&v=" + str(row["revision"]),
            "review": json.loads(row["review"]) if row["review"] else None
        }

    def state(self, actor, query):
        with self.db() as con:
            result = {"role": actor["role"], "name": actor["name"], "classes": [], "entries": [],
                      "imageCriteria": IMAGE_CRITERIA, "oralCriteria": ORAL_CRITERIA,
                      "gradebookProjected": False, "affectsAverage": False}
            if self.staff(actor):
                rows = con.execute("SELECT c.*, (SELECT COUNT(*) FROM entries e WHERE e.class_id=c.id) AS count FROM classes c ORDER BY created DESC").fetchall()
                result["classes"] = [dict(id=r["id"], code=r["code"], name=r["name"], closed=bool(r["closed"]), count=r["count"]) for r in rows if self.allowed(actor, r)]
                if query.get("classId"):
                    row = self.classroom(con, actor, query["classId"])
                    result["class"] = dict(id=row["id"], name=row["name"], code=row["code"], closed=bool(row["closed"]))
                    result["entries"] = [self.public_entry(r) for r in con.execute("SELECT id,class_id,student_name,title,description,origin,phrasal,idiom,revision,submitted,review FROM entries WHERE class_id=? ORDER BY student_name COLLATE NOCASE", (row["id"],))]
            elif query.get("code"):
                code = text(query["code"], 8, 8).upper()
                row = con.execute("SELECT * FROM classes WHERE code=?", (code,)).fetchone()
                fail(not row, 404, "class_not_found")
                result["class"] = dict(id=row["id"], name=row["name"], closed=bool(row["closed"]))
                result["entry"] = self.public_entry(con.execute("SELECT * FROM entries WHERE class_id=? AND student=?", (row["id"], actor["key"])).fetchone())
            return result

    def image(self, actor, entry_id):
        with self.db() as con:
            row = con.execute("SELECT e.*, c.owner FROM entries e JOIN classes c ON c.id=e.class_id WHERE e.id=?", (entry_id,)).fetchone()
            fail(not row or not (row["student"] == actor["key"] or self.allowed(actor, row)), 404, "image_not_found")
            return bytes(row["image"])

    def action(self, actor, action, payload):
        fail(not isinstance(payload, dict), 400, "invalid_payload")
        if action == "submit":
            return self.submit(actor, payload)
        fail(not self.staff(actor), 403, "teacher_required")
        with self.db() as con:
            con.execute("BEGIN IMMEDIATE")
            if action == "classes":
                name = text(payload.get("name"), 3, 100)
                existing = con.execute("SELECT id FROM classes WHERE owner=? AND name=?", (actor["key"], name)).fetchone()
                if existing:
                    return {"ok": True, "classId": existing["id"]}
                ident, code = secrets.token_hex(12), "".join(secrets.choice("ABCDEFGHJKLMNPQRSTUVWXYZ23456789") for _ in range(8))
                con.execute("INSERT INTO classes(id,code,name,owner,created) VALUES(?,?,?,?,?)", (ident, code, name, actor["key"], now()))
                return {"ok": True, "classId": ident}
            if action == "class-status":
                row = self.classroom(con, actor, text(payload.get("classId"), 1, 80))
                fail(type(payload.get("closed")) is not bool, 400, "invalid_class_status")
                con.execute("UPDATE classes SET closed=? WHERE id=?", (int(payload["closed"]), row["id"]))
                return {"ok": True}
            if action == "review":
                row = con.execute("SELECT * FROM entries WHERE id=?", (text(payload.get("entryId"), 1, 80),)).fetchone()
                fail(not row, 404, "entry_not_found")
                self.classroom(con, actor, row["class_id"])
                fail(type(payload.get("revision")) is not int or payload["revision"] != row["revision"], 409, "entry_changed_refresh")
                score_sets = []
                for key, count in (("imageScores", 4), ("oralScores", 5)):
                    values = payload.get(key)
                    fail(not isinstance(values, list) or len(values) != count or any(type(v) is not int or not 0 <= v <= 5 for v in values), 400, "invalid_scores")
                    score_sets.append(values)
                seconds = payload.get("seconds")
                fail(type(seconds) is not int or not 0 <= seconds <= 3600, 400, "invalid_duration")
                fail(any(type(payload.get(k)) is not bool for k in ("phrasalObserved", "idiomObserved", "textFreeImage")), 400, "invalid_observation")
                image, oral = score_sets
                review = dict(imageScores=image, oralScores=oral, imageGrade=round(sum(image)/4, 2), oralGrade=round(sum(oral)/5, 2),
                              seconds=seconds, minimumMet=seconds >= 60, phrasalObserved=payload["phrasalObserved"],
                              idiomObserved=payload["idiomObserved"], textFreeImage=payload["textFreeImage"],
                              feedback=text(payload.get("feedback", ""), 0, 2000), reviewedAt=now(), reviewedBy=actor["name"])
                con.execute("UPDATE entries SET review=? WHERE id=?", (json.dumps(review), row["id"]))
                return {"ok": True, "review": review}
            raise FestivalError(404, "unknown_action")

    def submit(self, actor, payload):
        fail(self.staff(actor), 403, "student_submission_only")
        code = text(payload.get("code"), 8, 8).upper()
        request_id = text(payload.get("clientSubmissionId"), 8, 100)
        title = text(payload.get("movieTitle"), 1, 140)
        description = text(payload.get("description"), 40, 2400)
        fail(payload.get("origin") not in ("ai", "own"), 400, "invalid_origin")
        fail(payload.get("phrasalVerb") not in PHRASAL or payload.get("idiom") not in IDIOMS, 400, "choose_required_expressions")
        fail(payload.get("textFreeConfirmed") is not True, 400, "confirm_no_text")
        with self.db() as con:
            con.execute("BEGIN IMMEDIATE")
            room = con.execute("SELECT * FROM classes WHERE code=?", (code,)).fetchone()
            fail(not room, 404, "class_not_found")
            old = con.execute("SELECT * FROM entries WHERE class_id=? AND student=?", (room["id"], actor["key"])).fetchone()
            if old and old["request_id"] == request_id:
                return {"ok": True, "entry": self.public_entry(old)}
            fail(room["closed"], 409, "submissions_closed")
            fail(old and old["review"], 409, "entry_already_reviewed")
            if old:
                fail(type(payload.get("revision")) is not int or payload["revision"] != old["revision"], 409, "entry_changed_refresh")
            else:
                fail(payload.get("revision", 0) != 0, 409, "entry_changed_refresh")
            image = normalize_image(payload.get("imageDataUrl"))
            ident = old["id"] if old else secrets.token_hex(16)
            revision = old["revision"] + 1 if old else 1
            values = (actor["name"], title, description, payload["origin"], payload["phrasalVerb"], payload["idiom"], image, revision, request_id, now())
            if old:
                con.execute("UPDATE entries SET student_name=?,title=?,description=?,origin=?,phrasal=?,idiom=?,image=?,revision=?,request_id=?,submitted=? WHERE id=?", values+(ident,))
            else:
                con.execute("INSERT INTO entries(student_name,title,description,origin,phrasal,idiom,image,revision,request_id,submitted,id,class_id,student) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?)", values+(ident,room["id"],actor["key"]))
            return {"ok": True, "entry": self.public_entry(con.execute("SELECT * FROM entries WHERE id=?", (ident,)).fetchone())}
