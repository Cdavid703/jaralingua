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
MICROSOFT_CLIENT_ID = os.environ.get("JARALINGUA_MICROSOFT_CLIENT_ID", "4e729f8a-d101-4c5d-af68-609d749bc95a").strip()
MICROSOFT_TENANT_ID = os.environ.get("JARALINGUA_MICROSOFT_TENANT_ID", "e1664f47-3c02-4a23-a559-0f33d25d8f86").strip()
DATA_PATH = os.environ.get("JARALINGUA_PROGRESS_DATA", "/var/lib/jaralingua/progress.json")
FRENCH7_GRADES_PATH = os.environ.get("JARALINGUA_FRENCH7_GRADES_DATA", "/var/lib/jaralingua/french7-grades.json")
BASIC_ENGLISH_GRADES_PATH = os.environ.get("JARALINGUA_BASIC_ENGLISH_GRADES_DATA", "/var/lib/jaralingua/basic-english-grades.json")
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


def write_json_file(path, data, prefix):
    directory = os.path.dirname(path)
    os.makedirs(directory, exist_ok=True)
    fd, temp_path = tempfile.mkstemp(prefix=prefix, suffix=".json", dir=directory)
    try:
        with os.fdopen(fd, "w", encoding="utf-8") as handle:
            json.dump(data, handle, ensure_ascii=False, indent=2)
            handle.write("\n")
        os.replace(temp_path, path)
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


def validate_microsoft_token(token):
    if not MICROSOFT_CLIENT_ID or not MICROSOFT_TENANT_ID:
        raise ValueError("Microsoft sign-in is not configured.")
    cache_key = "microsoft:" + token
    cached = token_cache.get(cache_key)
    if cached and cached.get("exp", 0) > time.time() + 30:
        return cached["profile"]

    url = "https://graph.microsoft.com/v1.0/me?" + urllib.parse.urlencode({
        "$select": "id,displayName,mail,userPrincipalName"
    })
    request = urllib.request.Request(url, headers={
        "Authorization": "Bearer " + token,
        "Accept": "application/json"
    })
    try:
        with urllib.request.urlopen(request, timeout=8) as response:
            payload = json.loads(response.read().decode("utf-8"))
    except (urllib.error.URLError, json.JSONDecodeError) as error:
        raise ValueError("Could not validate Microsoft token.") from error

    subject = payload.get("id", "")
    email = payload.get("mail") or payload.get("userPrincipalName") or ""
    if not subject:
        raise ValueError("Microsoft token has no subject.")
    if not email:
        raise ValueError("Microsoft account has no email.")

    profile = {
        "sub": "microsoft:" + subject,
        "email": email,
        "name": payload.get("displayName") or email,
        "picture": ""
    }
    token_cache[cache_key] = {"exp": time.time() + 300, "profile": profile}
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


def normalize_name(value):
    return " ".join(str(value or "").strip().lower().split())


def email_matches_student(student, email):
    if normalize_email(student.get("email")) == email:
        return True
    aliases = student.get("emailAliases", [])
    if not isinstance(aliases, list):
        return False
    return email in {normalize_email(item) for item in aliases}


def name_matches_student(student, profile):
    email = normalize_email(profile.get("email"))
    if not email.endswith("@gmail.com"):
        return False
    profile_name = normalize_name(profile.get("name"))
    if not profile_name:
        return False
    aliases = student.get("nameAliases", [])
    if not isinstance(aliases, list):
        return False
    for alias in aliases:
        normalized_alias = normalize_name(alias)
        if normalized_alias and (profile_name == normalized_alias or normalized_alias in profile_name):
            return True
    return False


def read_grades_data(path):
    if not os.path.exists(path):
        return {
            "adminEmails": [],
            "teacherEmails": [],
            "students": [],
            "evaluations": [],
            "bonusEvent": None,
            "allowStudentIdClaim": False
        }
    with open(path, "r", encoding="utf-8-sig") as handle:
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


def clean_text(value, limit=200):
    return " ".join(str(value or "").strip().split())[:limit]


def clean_email(value):
    email = normalize_email(value)
    if "@" not in email or len(email) > 200:
        return ""
    return email


def clean_grade(value):
    if value in (None, ""):
        return None
    try:
        grade = float(value)
    except (TypeError, ValueError):
        return None
    if grade < 0 or grade > 5:
        return None
    return round(grade, 2)


def clean_weight(value):
    try:
        weight = float(value)
    except (TypeError, ValueError):
        return 0
    if weight < 0:
        weight = 0
    if weight > 100:
        weight = 100
    return int(weight) if weight.is_integer() else round(weight, 2)


def clean_gradebook_payload(payload, existing):
    if not isinstance(payload, dict):
        raise ValueError("invalid_payload")
    evaluations = payload.get("evaluations")
    students = payload.get("students")
    if not isinstance(evaluations, list) or not isinstance(students, list):
        raise ValueError("invalid_gradebook")

    clean_evaluations = []
    seen_ids = set()
    for item in evaluations[:80]:
        if not isinstance(item, dict):
            continue
        raw_id = clean_text(item.get("id"), 80)
        eval_id = "".join(ch for ch in raw_id if ch.isalnum() or ch in ("-", "_"))
        title = clean_text(item.get("title"), 160)
        if not eval_id or not title or eval_id in seen_ids:
            continue
        seen_ids.add(eval_id)
        clean_evaluations.append({
            "id": eval_id,
            "title": title,
            "weight": clean_weight(item.get("weight")),
            "type": clean_text(item.get("type") or "Assessment", 80),
            "description": clean_text(item.get("description"), 300)
        })

    clean_students = []
    for item in students[:300]:
        if not isinstance(item, dict):
            continue
        student_id = clean_text(item.get("id"), 40)
        full_name = clean_text(item.get("fullName"), 160)
        if not student_id or not full_name:
            continue
        grades = {}
        raw_grades = item.get("grades", {})
        if isinstance(raw_grades, dict):
            for evaluation in clean_evaluations:
                grade = clean_grade(raw_grades.get(evaluation["id"]))
                if grade is not None:
                    grades[evaluation["id"]] = grade
        clean_students.append({
            "id": student_id,
            "fullName": full_name,
            "level": clean_text(item.get("level") or "Basic English Course 1", 100),
            "email": clean_email(item.get("email")),
            "emailAliases": [clean_email(email) for email in item.get("emailAliases", []) if clean_email(email)] if isinstance(item.get("emailAliases"), list) else [],
            "contact": clean_text(item.get("contact"), 100),
            "bookDate": clean_text(item.get("bookDate"), 40) or None,
            "grades": grades
        })

    return {
        "adminEmails": existing.get("adminEmails", []),
        "teacherEmails": existing.get("teacherEmails", []),
        "allowStudentIdClaim": existing.get("allowStudentIdClaim") is True,
        "students": clean_students,
        "evaluations": clean_evaluations,
        "bonusEvent": existing.get("bonusEvent")
    }


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
        "emailAliases": student.get("emailAliases", []),
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
        (item for item in students if isinstance(item, dict) and email_matches_student(item, email)),
        None
    )
    if direct_match:
        response["student"] = student_public_view(direct_match)
        return response

    name_match = next(
        (item for item in students if isinstance(item, dict) and name_matches_student(item, profile)),
        None
    )
    if name_match:
        response["student"] = student_public_view(name_match)
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
        self.send_header("Access-Control-Allow-Headers", "Authorization, Content-Type, X-Jaralingua-Auth-Provider")
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
            grades_data = read_grades_data(FRENCH7_GRADES_PATH)
            query = urllib.parse.parse_qs(parsed.query)
            json_response(self, 200, grade_payload_for(profile, grades_data, query))
            return

        if parsed.path == "/api/basic/grades":
            grades_data = read_grades_data(BASIC_ENGLISH_GRADES_PATH)
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

        if parsed.path == "/api/basic/grades":
            with data_lock:
                grades_data = read_grades_data(BASIC_ENGLISH_GRADES_PATH)
                if grade_user_role(profile, grades_data) != "admin":
                    json_response(self, 403, {"error": "forbidden"})
                    return
                try:
                    next_data = clean_gradebook_payload(payload, grades_data)
                except ValueError as error:
                    json_response(self, 400, {"error": str(error)})
                    return
                write_json_file(BASIC_ENGLISH_GRADES_PATH, next_data, ".basic-grades-")
                json_response(self, 200, {"ok": True, "updatedAt": now_iso()})
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
        provider = normalize_email(self.headers.get("X-Jaralingua-Auth-Provider"))
        try:
            if provider == "microsoft":
                return validate_microsoft_token(token)
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
