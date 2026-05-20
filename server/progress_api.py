#!/usr/bin/env python3
import json
import os
import tempfile
import threading
import time
import urllib.error
import urllib.parse
import urllib.request
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer


CLIENT_ID = os.environ.get("JARALINGUA_GOOGLE_CLIENT_ID", "").strip()
DATA_PATH = os.environ.get("JARALINGUA_PROGRESS_DATA", "/var/lib/jaralingua/progress.json")
GRADES_PATH = os.environ.get("JARALINGUA_FRENCH7_GRADES_DATA", "/var/lib/jaralingua/french7-grades.json")
HOST = os.environ.get("JARALINGUA_PROGRESS_HOST", "127.0.0.1")
PORT = int(os.environ.get("JARALINGUA_PROGRESS_PORT", "8787"))
MAX_BODY_BYTES = 1024 * 1024

data_lock = threading.Lock()
token_cache = {}


def now_iso():
    return time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())


def json_response(handler, status, payload):
    body = json.dumps(payload, ensure_ascii=False).encode("utf-8")
    handler.send_response(status)
    handler.send_header("Content-Type", "application/json; charset=utf-8")
    handler.send_header("Cache-Control", "no-store")
    handler.send_header("Content-Length", str(len(body)))
    handler.end_headers()
    handler.wfile.write(body)


def read_store():
    if not os.path.exists(DATA_PATH):
        return {"users": {}}
    with open(DATA_PATH, "r", encoding="utf-8") as handle:
        try:
            data = json.load(handle)
        except json.JSONDecodeError:
            return {"users": {}}
    if not isinstance(data, dict):
        return {"users": {}}
    users = data.get("users")
    if not isinstance(users, dict):
        data["users"] = {}
    return data


def write_store(data):
    directory = os.path.dirname(DATA_PATH)
    os.makedirs(directory, exist_ok=True)
    fd, temp_path = tempfile.mkstemp(prefix=".progress-", suffix=".json", dir=directory)
    try:
        with os.fdopen(fd, "w", encoding="utf-8") as handle:
            json.dump(data, handle, ensure_ascii=False, indent=2, sort_keys=True)
            handle.write("\n")
        os.replace(temp_path, DATA_PATH)
    finally:
        if os.path.exists(temp_path):
            os.unlink(temp_path)


def user_record(store, profile):
    users = store.setdefault("users", {})
    subject = profile["sub"]
    record = users.setdefault(subject, {})
    record["sub"] = subject
    record["email"] = profile.get("email", "")
    record["name"] = profile.get("name", "")
    record["picture"] = profile.get("picture", "")
    record.setdefault("progress", {"pages": {}, "lastPage": None})
    record.setdefault("activities", {})
    record["lastSeenAt"] = now_iso()
    return record


def bearer_token(headers):
    value = headers.get("Authorization", "")
    if not value.lower().startswith("bearer "):
        return ""
    return value.split(" ", 1)[1].strip()


def validate_google_token(token):
    if not CLIENT_ID:
        raise ValueError("Google client id is not configured.")
    cached = token_cache.get(token)
    if cached and cached.get("exp", 0) > time.time() + 30:
        return cached["profile"]

    url = "https://oauth2.googleapis.com/tokeninfo?id_token=" + urllib.parse.quote(token)
    try:
        with urllib.request.urlopen(url, timeout=8) as response:
            payload = json.loads(response.read().decode("utf-8"))
    except (urllib.error.URLError, json.JSONDecodeError) as error:
        raise ValueError("Could not validate Google token.") from error

    if payload.get("aud") != CLIENT_ID:
        raise ValueError("Google token audience does not match.")
    if str(payload.get("email_verified", "")).lower() not in ("true", "1"):
        raise ValueError("Google email is not verified.")

    exp = int(payload.get("exp", "0"))
    if exp <= int(time.time()):
        raise ValueError("Google token expired.")

    profile = {
        "sub": payload.get("sub", ""),
        "email": payload.get("email", ""),
        "name": payload.get("name") or payload.get("email", ""),
        "picture": payload.get("picture", "")
    }
    if not profile["sub"]:
        raise ValueError("Google token has no subject.")

    token_cache[token] = {"exp": exp, "profile": profile}
    return profile


def sanitize_progress(value):
    if not isinstance(value, dict):
        return {"pages": {}, "lastPage": None}
    pages = value.get("pages")
    if not isinstance(pages, dict):
        pages = {}
    clean_pages = {}
    for key, page in pages.items():
        if isinstance(key, str) and isinstance(page, dict):
            clean_pages[key[:500]] = page
    last_page = value.get("lastPage")
    if last_page is not None and not isinstance(last_page, dict):
        last_page = None
    return {"pages": clean_pages, "lastPage": last_page}


def sanitize_activity(value):
    if not isinstance(value, dict):
        return {"fields": {}, "updatedAt": None}
    fields = value.get("fields")
    if not isinstance(fields, dict):
        fields = {}
    return {
        "fields": fields,
        "updatedAt": value.get("updatedAt") if isinstance(value.get("updatedAt"), str) else None
    }


def normalize_email(value):
    return str(value or "").strip().lower()


def read_grades_data():
    if not os.path.exists(GRADES_PATH):
        return {
            "adminEmails": [],
            "teacherEmails": [],
            "students": [],
            "evaluations": [],
            "bonusEvent": None,
            "allowStudentIdClaim": False
        }
    with open(GRADES_PATH, "r", encoding="utf-8-sig") as handle:
        try:
            data = json.load(handle)
        except json.JSONDecodeError:
            return {
                "adminEmails": [],
                "teacherEmails": [],
                "students": [],
                "evaluations": [],
                "bonusEvent": None,
                "allowStudentIdClaim": False
            }
    if not isinstance(data, dict):
        return {
            "adminEmails": [],
            "teacherEmails": [],
            "students": [],
            "evaluations": [],
            "bonusEvent": None,
            "allowStudentIdClaim": False
        }
    data.setdefault("adminEmails", [])
    data.setdefault("teacherEmails", [])
    data.setdefault("students", [])
    data.setdefault("evaluations", [])
    data.setdefault("bonusEvent", None)
    data.setdefault("allowStudentIdClaim", False)
    return data


def grade_user_role(profile, grades_data):
    email = normalize_email(profile.get("email"))
    admin_emails = {normalize_email(item) for item in grades_data.get("adminEmails", [])}
    teacher_emails = {normalize_email(item) for item in grades_data.get("teacherEmails", [])}
    if email in admin_emails:
        return "admin"
    if email in teacher_emails:
        return "teacher"
    return "student"


def student_public_view(student):
    return {
        "id": student.get("id", ""),
        "level": student.get("level", ""),
        "bookDate": student.get("bookDate"),
        "grades": student.get("grades", {})
    }


def staff_student_view(student):
    return {
        "id": student.get("id", ""),
        "fullName": student.get("fullName", ""),
        "level": student.get("level", ""),
        "email": student.get("email", ""),
        "contact": student.get("contact", ""),
        "bookDate": student.get("bookDate"),
        "grades": student.get("grades", {})
    }


def grade_payload_for(profile, grades_data, query):
    role = grade_user_role(profile, grades_data)
    students = grades_data.get("students", [])
    email = normalize_email(profile.get("email"))
    response = {
        "role": role,
        "allowStudentIdClaim": grades_data.get("allowStudentIdClaim") is True,
        "evaluations": grades_data.get("evaluations", []),
        "bonusEvent": grades_data.get("bonusEvent"),
        "students": [],
        "student": None
    }

    if role in ("admin", "teacher"):
        response["students"] = [staff_student_view(item) for item in students if isinstance(item, dict)]
        return response

    direct_match = next(
        (item for item in students if isinstance(item, dict) and normalize_email(item.get("email")) == email),
        None
    )
    if direct_match:
        response["student"] = student_public_view(direct_match)
        return response

    requested_id = (query.get("studentId") or [""])[0]
    clean_id = "".join(ch for ch in requested_id if ch.isdigit())
    if clean_id and grades_data.get("allowStudentIdClaim") is True:
        id_match = next(
            (item for item in students if isinstance(item, dict) and str(item.get("id", "")) == clean_id),
            None
        )
        if id_match:
            response["student"] = student_public_view(id_match)
            return response

    return response


class ProgressHandler(BaseHTTPRequestHandler):
    server_version = "JaraLinguaProgress/1.0"

    def log_message(self, fmt, *args):
        print("%s - - [%s] %s" % (self.client_address[0], self.log_date_time_string(), fmt % args))

    def do_OPTIONS(self):
        self.send_response(204)
        self.send_header("Access-Control-Allow-Origin", "https://www.jaralingua.com")
        self.send_header("Access-Control-Allow-Headers", "Authorization, Content-Type")
        self.send_header("Access-Control-Allow-Methods", "GET, PUT, DELETE, OPTIONS")
        self.end_headers()

    def do_GET(self):
        parsed = urllib.parse.urlparse(self.path)
        if parsed.path == "/api/health":
            json_response(self, 200, {"ok": True})
            return

        profile = self.require_user()
        if not profile:
            return

        if parsed.path == "/api/progress":
            with data_lock:
                store = read_store()
                record = user_record(store, profile)
                write_store(store)
                json_response(self, 200, {
                    "progress": record.get("progress", {"pages": {}, "lastPage": None}),
                    "activities": record.get("activities", {})
                })
            return

        if parsed.path == "/api/activity":
            query = urllib.parse.parse_qs(parsed.query)
            page_path = (query.get("path") or [""])[0]
            with data_lock:
                store = read_store()
                record = user_record(store, profile)
                write_store(store)
                json_response(self, 200, {
                    "draft": record.get("activities", {}).get(page_path, {"fields": {}, "updatedAt": None})
                })
            return

        if parsed.path == "/api/french7/grades":
            grades_data = read_grades_data()
            query = urllib.parse.parse_qs(parsed.query)
            json_response(self, 200, grade_payload_for(profile, grades_data, query))
            return

        json_response(self, 404, {"error": "not_found"})

    def do_PUT(self):
        parsed = urllib.parse.urlparse(self.path)
        profile = self.require_user()
        if not profile:
            return
        payload = self.read_json_body()
        if payload is None:
            return

        if parsed.path == "/api/progress":
            progress = sanitize_progress(payload.get("progress"))
            with data_lock:
                store = read_store()
                record = user_record(store, profile)
                record["progress"] = progress
                record["updatedAt"] = now_iso()
                write_store(store)
            json_response(self, 200, {"ok": True})
            return

        if parsed.path == "/api/activity":
            page_path = str(payload.get("path") or "")[:500]
            if not page_path:
                json_response(self, 400, {"error": "missing_path"})
                return
            draft = sanitize_activity(payload.get("draft"))
            with data_lock:
                store = read_store()
                record = user_record(store, profile)
                record.setdefault("activities", {})[page_path] = draft
                record["updatedAt"] = now_iso()
                write_store(store)
            json_response(self, 200, {"ok": True})
            return

        json_response(self, 404, {"error": "not_found"})

    def do_DELETE(self):
        parsed = urllib.parse.urlparse(self.path)
        profile = self.require_user()
        if not profile:
            return

        if parsed.path == "/api/activity":
            query = urllib.parse.parse_qs(parsed.query)
            page_path = (query.get("path") or [""])[0]
            with data_lock:
                store = read_store()
                record = user_record(store, profile)
                record.setdefault("activities", {}).pop(page_path, None)
                record["updatedAt"] = now_iso()
                write_store(store)
            json_response(self, 200, {"ok": True})
            return

        json_response(self, 404, {"error": "not_found"})

    def require_user(self):
        token = bearer_token(self.headers)
        if not token:
            json_response(self, 401, {"error": "missing_token"})
            return None
        try:
            return validate_google_token(token)
        except ValueError as error:
            json_response(self, 401, {"error": "invalid_token", "message": str(error)})
            return None

    def read_json_body(self):
        try:
            length = int(self.headers.get("Content-Length", "0"))
        except ValueError:
            length = 0
        if length > MAX_BODY_BYTES:
            json_response(self, 413, {"error": "body_too_large"})
            return None
        try:
            return json.loads(self.rfile.read(length).decode("utf-8") or "{}")
        except json.JSONDecodeError:
            json_response(self, 400, {"error": "invalid_json"})
            return None


def main():
    if not CLIENT_ID:
        raise SystemExit("JARALINGUA_GOOGLE_CLIENT_ID is required")
    server = ThreadingHTTPServer((HOST, PORT), ProgressHandler)
    print(f"JaraLingua progress API listening on {HOST}:{PORT}")
    server.serve_forever()


if __name__ == "__main__":
    main()
