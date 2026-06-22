#!/usr/bin/env python3
import json
import os
import re
import secrets
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
FRENCH8_GRADES_PATH = os.environ.get("JARALINGUA_FRENCH8_GRADES_DATA", "/var/lib/jaralingua/french8-grades.json")
FRENCH7_FINAL_EXAM_PATH = os.environ.get("JARALINGUA_FRENCH7_FINAL_EXAM_DATA", "/var/lib/jaralingua/french7-final-exam.json")
FRENCH7_FINAL_EXAM_SUBMISSIONS_PATH = os.environ.get("JARALINGUA_FRENCH7_FINAL_EXAM_SUBMISSIONS", "/var/lib/jaralingua/french7-final-exam-submissions.json")
FRENCH7_FINAL_EXAM_AUDIO_PATH = os.environ.get("JARALINGUA_FRENCH7_FINAL_EXAM_AUDIO", "/var/lib/jaralingua/french7-final-exam-audio.mp3")
BASIC_ENGLISH_GRADES_PATH = os.environ.get("JARALINGUA_BASIC_ENGLISH_GRADES_DATA", "/var/lib/jaralingua/basic-english-grades.json")
BASIC_INTEGRATED_TASK_PATH = os.environ.get("JARALINGUA_BASIC_INTEGRATED_TASK_DATA", "/var/lib/jaralingua/basic-integrated-task.json")
BASIC_INTEGRATED_TASK_SUBMISSIONS_PATH = os.environ.get("JARALINGUA_BASIC_INTEGRATED_TASK_SUBMISSIONS", "/var/lib/jaralingua/basic-integrated-task-submissions.json")
BASIC_INTEGRATED_TASK_AUDIO_PATH = os.environ.get("JARALINGUA_BASIC_INTEGRATED_TASK_AUDIO", "/var/lib/jaralingua/basic-integrated-task-real.mp3")
INTERMEDIATE_ENGLISH_GRADES_PATH = os.environ.get("JARALINGUA_INTERMEDIATE_ENGLISH_GRADES_DATA", "/var/lib/jaralingua/intermediate-english-grades.json")
REPO_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
BUNDLED_FRENCH7_FINAL_EXAM_PATH = os.path.join(REPO_ROOT, "data", "french7-final-exam.local.json")
BUNDLED_FRENCH7_FINAL_EXAM_AUDIO_PATH = os.path.join(REPO_ROOT, "frances", "Niveau 7", "audio", "examen-final-refuge-universitaire-b1.mp3")
BUNDLED_BASIC_INTEGRATED_TASK_PATH = os.path.join(REPO_ROOT, "data", "basic-integrated-task.local.json")
BUNDLED_BASIC_INTEGRATED_TASK_AUDIO_PATH = os.path.join(REPO_ROOT, "data", "basic-integrated-task-real.local.mp3")
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


def binary_response(handler, status, body, content_type):
    handler.send_response(status)
    handler.send_header("Content-Type", content_type)
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


def read_json_file(path, default):
    if not os.path.exists(path):
        return default
    with open(path, "r", encoding="utf-8-sig") as handle:
        try:
            data = json.load(handle)
        except json.JSONDecodeError:
            return default
    return data if isinstance(data, dict) else default


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
        clean_evaluation = {
            "id": eval_id,
            "title": title,
            "weight": clean_weight(item.get("weight")),
            "type": clean_text(item.get("type") or "Assessment", 80),
            "description": clean_text(item.get("description"), 300)
        }
        if "date" in item:
            clean_evaluation["date"] = clean_text(item.get("date"), 40) or None
        if "displayDate" in item:
            clean_evaluation["displayDate"] = clean_text(item.get("displayDate"), 80)
        clean_evaluations.append(clean_evaluation)

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


def matched_student_for_profile(profile, grades_data):
    students = grades_data.get("students", [])
    email = normalize_email(profile.get("email"))
    direct_match = next(
        (item for item in students if isinstance(item, dict) and email_matches_student(item, email)),
        None
    )
    if direct_match:
        return direct_match
    return next(
        (item for item in students if isinstance(item, dict) and name_matches_student(item, profile)),
        None
    )


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


def default_final_exam_bundle():
    return {
        "state": {
            "isOpen": False,
            "openedAt": None,
            "closedAt": None,
            "openedBy": None,
            "updatedAt": None
        },
        "exam": {
            "id": "french7-final-exam",
            "title": "Examen final",
            "totalPoints": 50,
            "sections": []
        }
    }


def read_final_exam_bundle():
    source_path = FRENCH7_FINAL_EXAM_PATH if os.path.exists(FRENCH7_FINAL_EXAM_PATH) else BUNDLED_FRENCH7_FINAL_EXAM_PATH
    data = read_json_file(source_path, default_final_exam_bundle())
    if not isinstance(data.get("state"), dict):
        data["state"] = default_final_exam_bundle()["state"]
    if not isinstance(data.get("exam"), dict):
        data["exam"] = default_final_exam_bundle()["exam"]
    data["state"].setdefault("isOpen", False)
    data["state"].setdefault("openedAt", None)
    data["state"].setdefault("closedAt", None)
    data["state"].setdefault("openedBy", None)
    data["state"].setdefault("updatedAt", None)
    data["exam"].setdefault("sections", [])
    data["exam"].setdefault("totalPoints", 50)
    return data


def write_final_exam_bundle(data):
    write_json_file(FRENCH7_FINAL_EXAM_PATH, data, ".french7-final-exam-")


def read_final_exam_submissions():
    data = read_json_file(FRENCH7_FINAL_EXAM_SUBMISSIONS_PATH, {"submissions": {}})
    if not isinstance(data.get("submissions"), dict):
        data["submissions"] = {}
    return data


def write_final_exam_submissions(data):
    write_json_file(FRENCH7_FINAL_EXAM_SUBMISSIONS_PATH, data, ".french7-final-submissions-")


def final_exam_public_question(question):
    public = {
        "id": clean_text(question.get("id"), 80),
        "type": clean_text(question.get("type"), 40),
        "prompt": clean_text(question.get("prompt"), 1000),
        "points": question.get("points", 1)
    }
    for optional in ("block", "title"):
        if question.get(optional):
            public[optional] = clean_text(question.get(optional), 300)
    if isinstance(question.get("options"), list):
        public["options"] = [clean_text(item, 500) for item in question.get("options", [])[:8]]
    if isinstance(question.get("bank"), list):
        public["bank"] = [clean_text(item, 800) for item in question.get("bank", [])[:10]]
    return public


def final_exam_public_payload(bundle):
    exam = bundle.get("exam", {})
    sections = []
    for section in exam.get("sections", []):
        if not isinstance(section, dict):
            continue
        questions = section.get("questions", [])
        sections.append({
            "id": clean_text(section.get("id"), 80),
            "title": clean_text(section.get("title"), 200),
            "subtitle": clean_text(section.get("subtitle"), 300),
            "points": section.get("points", 0),
            "instructions": clean_text(section.get("instructions"), 500),
            "readingTitle": clean_text(section.get("readingTitle"), 200),
            "readingText": [clean_text(item, 1400) for item in section.get("readingText", [])] if isinstance(section.get("readingText"), list) else [],
            "audioTitle": clean_text(section.get("audioTitle"), 200),
            "audioText": clean_text(section.get("audioText"), 500),
            "audioSrc": clean_text(section.get("audioSrc"), 300),
            "questions": [final_exam_public_question(item) for item in questions if isinstance(item, dict)]
        })
    return {
        "id": clean_text(exam.get("id") or "french7-final-exam", 80),
        "title": clean_text(exam.get("title") or "Examen final", 200),
        "totalPoints": exam.get("totalPoints", 50),
        "sections": sections
    }


def final_exam_state_payload(profile, grades_data, bundle, submissions):
    role = grade_user_role(profile, grades_data)
    student = matched_student_for_profile(profile, grades_data)
    student_id = clean_text(student.get("id"), 40) if isinstance(student, dict) else ""
    return {
        "role": role,
        "state": bundle.get("state", {}),
        "student": student_public_view(student) if isinstance(student, dict) else None,
        "submitted": submissions.get("submissions", {}).get(student_id) if student_id else None
    }


def final_exam_allowed_student(profile, grades_data):
    email = normalize_email(profile.get("email"))
    if not email.endswith("@gmail.com"):
        return None
    return matched_student_for_profile(profile, grades_data)


def normalize_answer(value):
    if isinstance(value, bool):
        return value
    if isinstance(value, int):
        return value
    if isinstance(value, list):
        normalized = []
        for item in value[:20]:
            try:
                normalized.append(int(item))
            except (TypeError, ValueError):
                normalized.append(item)
        return normalized
    if isinstance(value, str):
        stripped = value.strip().lower()
        if stripped == "true":
            return True
        if stripped == "false":
            return False
        try:
            return int(stripped)
        except ValueError:
            return stripped[:500]
    return None


def score_final_exam(exam, answers):
    if not isinstance(answers, dict):
        answers = {}
    score = 0
    total = 0
    section_scores = {}
    details = {}
    for section in exam.get("sections", []):
        if not isinstance(section, dict):
            continue
        section_id = clean_text(section.get("id"), 80)
        section_score = 0
        section_total = 0
        for question in section.get("questions", []):
            if not isinstance(question, dict):
                continue
            question_id = clean_text(question.get("id"), 80)
            points = question.get("points", 1)
            try:
                points = float(points)
            except (TypeError, ValueError):
                points = 1
            normalized = normalize_answer(answers.get(question_id))
            expected = normalize_answer(question.get("answer"))
            is_correct = normalized == expected
            if is_correct:
                score += points
                section_score += points
            total += points
            section_total += points
            details[question_id] = {
                "answer": normalized,
                "correct": is_correct,
                "points": points if is_correct else 0
            }
        section_scores[section_id] = {
            "score": clean_exam_number(section_score),
            "total": clean_exam_number(section_total)
        }
    grade = round((score / total) * 5, 2) if total else 0
    return {
        "scorePoints": clean_exam_number(score),
        "totalPoints": clean_exam_number(total),
        "grade": grade,
        "sectionScores": section_scores,
        "details": details
    }


def clean_exam_number(value):
    try:
        numeric = float(value)
    except (TypeError, ValueError):
        return 0
    return int(numeric) if numeric.is_integer() else round(numeric, 2)


def ensure_final_exam_evaluation(grades_data):
    evaluations = grades_data.setdefault("evaluations", [])
    if any(isinstance(item, dict) and item.get("id") == "finalExam" for item in evaluations):
        return
    evaluations.insert(0, {
        "id": "finalExam",
        "title": "Examen final",
        "weight": 20,
        "type": "Examen",
        "date": "2026-06-05",
        "displayDate": "Vendredi 5 juin",
        "description": "Evaluation finale sur les themes principaux du cours."
    })



def default_basic_integrated_task_bundle():
    return {
        "state": {"isOpen": False, "openedAt": None, "closedAt": None, "updatedAt": None, "openedBy": None},
        "exam": {
            "id": "basic-course-1-integrated-task",
            "title": "BASIC COURSE 1 – INTEGRATED TASK (20%)",
            "totalPoints": 50,
            "listeningPoints": 25,
            "writingPoints": 25,
            "maxAudioPlays": 3,
            "questions": []
        }
    }


def read_basic_integrated_task_bundle():
    source = BASIC_INTEGRATED_TASK_PATH if os.path.exists(BASIC_INTEGRATED_TASK_PATH) else BUNDLED_BASIC_INTEGRATED_TASK_PATH
    data = read_json_file(source, default_basic_integrated_task_bundle())
    if not isinstance(data.get("state"), dict):
        data["state"] = default_basic_integrated_task_bundle()["state"]
    if not isinstance(data.get("exam"), dict):
        data["exam"] = default_basic_integrated_task_bundle()["exam"]
    for key, value in default_basic_integrated_task_bundle()["state"].items():
        data["state"].setdefault(key, value)
    data["exam"].setdefault("questions", [])
    data["exam"].setdefault("totalPoints", 50)
    data["exam"].setdefault("listeningPoints", 25)
    data["exam"].setdefault("writingPoints", 25)
    return data


def write_basic_integrated_task_bundle(data):
    write_json_file(BASIC_INTEGRATED_TASK_PATH, data, ".basic-integrated-task-")


def read_basic_integrated_task_submissions():
    data = read_json_file(BASIC_INTEGRATED_TASK_SUBMISSIONS_PATH, {"submissions": {}})
    if not isinstance(data.get("submissions"), dict):
        data["submissions"] = {}
    return data


def write_basic_integrated_task_submissions(data):
    write_json_file(BASIC_INTEGRATED_TASK_SUBMISSIONS_PATH, data, ".basic-integrated-submissions-")


def basic_integrated_student_identity(student):
    if not isinstance(student, dict):
        return None
    return {
        "id": clean_text(student.get("id"), 40),
        "fullName": clean_text(student.get("fullName"), 200),
        "level": clean_text(student.get("level"), 120)
    }


def basic_integrated_public_question(question):
    return {
        "id": clean_text(question.get("id"), 80),
        "prompt": clean_text(question.get("prompt"), 500),
        "options": [clean_text(item, 300) for item in question.get("options", [])[:6]],
        "points": clean_exam_number(question.get("points", 2.5))
    }


def basic_integrated_public_exam(bundle):
    exam = bundle.get("exam", {})
    return {
        "id": clean_text(exam.get("id") or "basic-course-1-integrated-task", 80),
        "title": clean_text(exam.get("title") or "BASIC COURSE 1 – INTEGRATED TASK (20%)", 200),
        "totalPoints": clean_exam_number(exam.get("totalPoints", 50)),
        "listeningPoints": clean_exam_number(exam.get("listeningPoints", 25)),
        "writingPoints": clean_exam_number(exam.get("writingPoints", 25)),
        "maxAudioPlays": 3,
        "questions": [basic_integrated_public_question(item) for item in exam.get("questions", []) if isinstance(item, dict)]
    }


def basic_integrated_submission_public(submission):
    if not isinstance(submission, dict):
        return None
    keys = (
        "receiptId", "studentId", "studentName", "email", "courseCode", "clientDate",
        "submittedAt", "audioPlays", "listeningPoints", "writingPoints", "finalPoints",
        "grade", "status", "writing", "rubric", "teacherComments", "gradedAt", "gradedBy"
    )
    return {key: submission.get(key) for key in keys}


def basic_integrated_state_payload(profile, grades_data, bundle, submissions):
    role = grade_user_role(profile, grades_data)
    student = matched_student_for_profile(profile, grades_data)
    student_id = clean_text(student.get("id"), 40) if isinstance(student, dict) else ""
    submitted = submissions.get("submissions", {}).get(student_id) if student_id else None
    return {
        "role": role,
        "state": bundle.get("state", {}),
        "student": basic_integrated_student_identity(student),
        "submitted": basic_integrated_submission_public(submitted)
    }


def basic_integrated_score(exam, answers):
    if not isinstance(answers, dict):
        answers = {}
    score = 0.0
    details = {}
    for question in exam.get("questions", []):
        if not isinstance(question, dict):
            continue
        question_id = clean_text(question.get("id"), 80)
        try:
            points = float(question.get("points", 2.5))
        except (TypeError, ValueError):
            points = 2.5
        supplied = normalize_answer(answers.get(question_id))
        expected = normalize_answer(question.get("answer"))
        correct = supplied == expected
        if correct:
            score += points
        details[question_id] = {
            "answer": supplied,
            "correct": correct,
            "points": clean_exam_number(points if correct else 0)
        }
    return {"score": clean_exam_number(score), "details": details}


def clean_basic_writing(value):
    return str(value or "").replace("\r\n", "\n").replace("\r", "\n").strip()[:6000]


def basic_word_count(value):
    return len(re.findall(r"\b[\w'-]+\b", value or "", flags=re.UNICODE))


def ensure_basic_integrated_task_evaluation(grades_data):
    evaluations = grades_data.setdefault("evaluations", [])
    if any(isinstance(item, dict) and item.get("id") == "integratedTask20" for item in evaluations):
        return False
    evaluations.append({
        "id": "integratedTask20",
        "title": "BASIC COURSE 1 – INTEGRATED TASK (20%)",
        "weight": 20,
        "type": "Integrated task",
        "description": "Listening and integrated writing assessment. Writing is reviewed with the institutional rubric."
    })
    return True


def clean_basic_rubric(value):
    if not isinstance(value, dict):
        return None
    rubric = {}
    for key in ("content", "composing", "vocabulary", "structure", "mechanics"):
        try:
            score = int(value.get(key))
        except (TypeError, ValueError):
            return None
        if score < 1 or score > 5:
            return None
        rubric[key] = score
    return rubric


class ProgressHandler(BaseHTTPRequestHandler):
    server_version = "JaraLinguaProgress/1.0"

    def log_message(self, fmt, *args):
        print("%s - - [%s] %s" % (self.client_address[0], self.log_date_time_string(), fmt % args))

    def do_OPTIONS(self):
        self.send_response(204)
        self.send_header("Access-Control-Allow-Origin", "https://www.jaralingua.com")
        self.send_header("Access-Control-Allow-Headers", "Authorization, Content-Type, X-Jaralingua-Auth-Provider")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
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

        if parsed.path == "/api/french8/grades":
            grades_data = read_grades_data(FRENCH8_GRADES_PATH)
            query = urllib.parse.parse_qs(parsed.query)
            json_response(self, 200, grade_payload_for(profile, grades_data, query))
            return

        if parsed.path == "/api/french7/final-exam/state":
            with data_lock:
                grades_data = read_grades_data(FRENCH7_GRADES_PATH)
                bundle = read_final_exam_bundle()
                submissions = read_final_exam_submissions()
                json_response(self, 200, final_exam_state_payload(profile, grades_data, bundle, submissions))
            return

        if parsed.path == "/api/french7/final-exam":
            with data_lock:
                grades_data = read_grades_data(FRENCH7_GRADES_PATH)
                role = grade_user_role(profile, grades_data)
                student = final_exam_allowed_student(profile, grades_data)
                bundle = read_final_exam_bundle()
                submissions = read_final_exam_submissions()
                state = bundle.get("state", {})
                student_id = clean_text(student.get("id"), 40) if isinstance(student, dict) else ""
                submitted = submissions.get("submissions", {}).get(student_id) if student_id else None

                if role not in ("admin", "teacher") and not student:
                    json_response(self, 403, {"error": "not_authorized"})
                    return
                if submitted:
                    json_response(self, 200, {"status": "submitted", "state": state, "result": submitted})
                    return
                if role not in ("admin", "teacher") and state.get("isOpen") is not True:
                    json_response(self, 403, {"error": "exam_closed", "state": state})
                    return

                json_response(self, 200, {
                    "status": "open" if state.get("isOpen") is True else "admin-preview",
                    "role": role,
                    "state": state,
                    "student": student_public_view(student) if isinstance(student, dict) else None,
                    "exam": final_exam_public_payload(bundle)
                })
            return

        if parsed.path == "/api/french7/final-exam/audio":
            with data_lock:
                grades_data = read_grades_data(FRENCH7_GRADES_PATH)
                role = grade_user_role(profile, grades_data)
                student = final_exam_allowed_student(profile, grades_data)
                bundle = read_final_exam_bundle()
                state = bundle.get("state", {})
                if role not in ("admin", "teacher") and not student:
                    json_response(self, 403, {"error": "not_authorized"})
                    return
                if role not in ("admin", "teacher") and state.get("isOpen") is not True:
                    json_response(self, 403, {"error": "exam_closed"})
                    return
                audio_path = FRENCH7_FINAL_EXAM_AUDIO_PATH
                if not os.path.exists(audio_path):
                    audio_path = BUNDLED_FRENCH7_FINAL_EXAM_AUDIO_PATH
            if not os.path.exists(audio_path):
                json_response(self, 404, {"error": "audio_not_found"})
                return
            with open(audio_path, "rb") as handle:
                binary_response(self, 200, handle.read(), "audio/mpeg")
            return


        if parsed.path == "/api/basic/integrated-task/state":
            with data_lock:
                grades_data = read_grades_data(BASIC_ENGLISH_GRADES_PATH)
                bundle = read_basic_integrated_task_bundle()
                submissions = read_basic_integrated_task_submissions()
                json_response(self, 200, basic_integrated_state_payload(profile, grades_data, bundle, submissions))
            return

        if parsed.path == "/api/basic/integrated-task":
            with data_lock:
                grades_data = read_grades_data(BASIC_ENGLISH_GRADES_PATH)
                role = grade_user_role(profile, grades_data)
                student = matched_student_for_profile(profile, grades_data)
                bundle = read_basic_integrated_task_bundle()
                submissions = read_basic_integrated_task_submissions()
                state = bundle.get("state", {})
                student_id = clean_text(student.get("id"), 40) if isinstance(student, dict) else ""
                submitted = submissions.get("submissions", {}).get(student_id) if student_id else None
                if role not in ("admin", "teacher") and not isinstance(student, dict):
                    json_response(self, 403, {"error": "not_authorized"})
                    return
                if submitted:
                    json_response(self, 200, {"status": "submitted", "state": state, "result": basic_integrated_submission_public(submitted)})
                    return
                if role not in ("admin", "teacher") and state.get("isOpen") is not True:
                    json_response(self, 403, {"error": "exam_closed", "state": state})
                    return
                json_response(self, 200, {
                    "status": "open" if state.get("isOpen") is True else "staff-preview",
                    "role": role,
                    "state": state,
                    "student": basic_integrated_student_identity(student),
                    "exam": basic_integrated_public_exam(bundle)
                })
            return

        if parsed.path == "/api/basic/integrated-task/audio":
            with data_lock:
                grades_data = read_grades_data(BASIC_ENGLISH_GRADES_PATH)
                role = grade_user_role(profile, grades_data)
                student = matched_student_for_profile(profile, grades_data)
                bundle = read_basic_integrated_task_bundle()
                state = bundle.get("state", {})
                if role not in ("admin", "teacher") and not isinstance(student, dict):
                    json_response(self, 403, {"error": "not_authorized"})
                    return
                if role not in ("admin", "teacher") and state.get("isOpen") is not True:
                    json_response(self, 403, {"error": "exam_closed"})
                    return
                audio_path = BASIC_INTEGRATED_TASK_AUDIO_PATH
                if not os.path.exists(audio_path):
                    audio_path = BUNDLED_BASIC_INTEGRATED_TASK_AUDIO_PATH
            if not os.path.exists(audio_path):
                json_response(self, 404, {"error": "audio_not_found"})
                return
            with open(audio_path, "rb") as handle:
                binary_response(self, 200, handle.read(), "audio/mpeg")
            return

        if parsed.path == "/api/basic/integrated-task/submissions":
            with data_lock:
                grades_data = read_grades_data(BASIC_ENGLISH_GRADES_PATH)
                role = grade_user_role(profile, grades_data)
                if role not in ("admin", "teacher"):
                    json_response(self, 403, {"error": "forbidden"})
                    return
                submissions = read_basic_integrated_task_submissions().get("submissions", {})
                items = [basic_integrated_submission_public(item) for item in submissions.values() if isinstance(item, dict)]
                items.sort(key=lambda item: item.get("submittedAt") or "", reverse=True)
                json_response(self, 200, {"role": role, "submissions": items})
            return

        if parsed.path == "/api/basic/grades":
            grades_data = read_grades_data(BASIC_ENGLISH_GRADES_PATH)
            query = urllib.parse.parse_qs(parsed.query)
            json_response(self, 200, grade_payload_for(profile, grades_data, query))
            return

        if parsed.path == "/api/intermediate/grades":
            grades_data = read_grades_data(INTERMEDIATE_ENGLISH_GRADES_PATH)
            query = urllib.parse.parse_qs(parsed.query)
            json_response(self, 200, grade_payload_for(profile, grades_data, query))
            return

        json_response(self, 404, {"error": "not_found"})

    def do_POST(self):
        parsed = urllib.parse.urlparse(self.path)
        profile = self.require_user()
        if not profile:
            return
        payload = self.read_json_body()
        if payload is None:
            return


        if parsed.path == "/api/basic/integrated-task/submit":
            with data_lock:
                grades_data = read_grades_data(BASIC_ENGLISH_GRADES_PATH)
                student = matched_student_for_profile(profile, grades_data)
                if not isinstance(student, dict):
                    json_response(self, 403, {"error": "student_not_authorized"})
                    return
                bundle = read_basic_integrated_task_bundle()
                state = bundle.get("state", {})
                if state.get("isOpen") is not True:
                    json_response(self, 403, {"error": "exam_closed", "state": state})
                    return
                submissions = read_basic_integrated_task_submissions()
                student_id = clean_text(student.get("id"), 40)
                existing = submissions.get("submissions", {}).get(student_id)
                if existing:
                    json_response(self, 409, {"error": "already_submitted", "result": basic_integrated_submission_public(existing)})
                    return
                writing = clean_basic_writing(payload.get("writing"))
                if basic_word_count(writing) < 60:
                    json_response(self, 400, {"error": "writing_too_short", "wordCount": basic_word_count(writing)})
                    return
                result = basic_integrated_score(bundle.get("exam", {}), payload.get("answers"))
                try:
                    audio_plays = max(0, min(3, int(payload.get("audioPlays", 0))))
                except (TypeError, ValueError):
                    audio_plays = 0
                submitted_at = now_iso()
                submission = {
                    "receiptId": "BIT-" + secrets.token_hex(5).upper(),
                    "studentId": student_id,
                    "studentName": clean_text(student.get("fullName"), 200),
                    "email": normalize_email(profile.get("email")),
                    "courseCode": clean_text(payload.get("courseCode"), 40),
                    "clientDate": clean_text(payload.get("clientDate"), 30),
                    "submittedAt": submitted_at,
                    "audioPlays": audio_plays,
                    "listeningPoints": result["score"],
                    "writingPoints": None,
                    "finalPoints": None,
                    "grade": None,
                    "status": "pending-writing",
                    "writing": writing,
                    "answers": result["details"],
                    "rubric": None,
                    "teacherComments": "",
                    "gradedAt": None,
                    "gradedBy": ""
                }
                submissions.setdefault("submissions", {})[student_id] = submission
                gradebook_changed = ensure_basic_integrated_task_evaluation(grades_data)
                write_basic_integrated_task_submissions(submissions)
                if gradebook_changed:
                    write_json_file(BASIC_ENGLISH_GRADES_PATH, grades_data, ".basic-grades-")
                json_response(self, 200, {"ok": True, "result": basic_integrated_submission_public(submission)})
            return

        if parsed.path == "/api/french7/final-exam/submit":
            provider = normalize_email(self.headers.get("X-Jaralingua-Auth-Provider"))
            if provider != "google":
                json_response(self, 403, {"error": "google_required"})
                return

            with data_lock:
                grades_data = read_grades_data(FRENCH7_GRADES_PATH)
                student = final_exam_allowed_student(profile, grades_data)
                if not isinstance(student, dict):
                    json_response(self, 403, {"error": "student_not_authorized"})
                    return

                bundle = read_final_exam_bundle()
                state = bundle.get("state", {})
                if state.get("isOpen") is not True:
                    json_response(self, 403, {"error": "exam_closed", "state": state})
                    return

                submissions = read_final_exam_submissions()
                student_id = clean_text(student.get("id"), 40)
                if submissions.get("submissions", {}).get(student_id):
                    json_response(self, 409, {
                        "error": "already_submitted",
                        "result": submissions["submissions"][student_id]
                    })
                    return

                result = score_final_exam(bundle.get("exam", {}), payload.get("answers"))
                submitted_at = now_iso()
                submission = {
                    "studentId": student_id,
                    "studentName": student.get("fullName", ""),
                    "email": normalize_email(profile.get("email")),
                    "scorePoints": result["scorePoints"],
                    "totalPoints": result["totalPoints"],
                    "grade": result["grade"],
                    "sectionScores": result["sectionScores"],
                    "submittedAt": submitted_at,
                    "answers": result["details"]
                }
                submissions.setdefault("submissions", {})[student_id] = submission

                ensure_final_exam_evaluation(grades_data)
                student.setdefault("grades", {})["finalExam"] = result["grade"]
                write_final_exam_submissions(submissions)
                write_json_file(FRENCH7_GRADES_PATH, grades_data, ".french7-grades-")
                json_response(self, 200, {"ok": True, "result": submission})
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

        if parsed.path == "/api/french7/grades":
            with data_lock:
                grades_data = read_grades_data(FRENCH7_GRADES_PATH)
                if grade_user_role(profile, grades_data) != "admin":
                    json_response(self, 403, {"error": "forbidden"})
                    return
                try:
                    next_data = clean_gradebook_payload(payload, grades_data)
                except ValueError as error:
                    json_response(self, 400, {"error": str(error)})
                    return
                write_json_file(FRENCH7_GRADES_PATH, next_data, ".french7-grades-")
                json_response(self, 200, {"ok": True, "updatedAt": now_iso()})
            return

        if parsed.path == "/api/french8/grades":
            with data_lock:
                grades_data = read_grades_data(FRENCH8_GRADES_PATH)
                if grade_user_role(profile, grades_data) != "admin":
                    json_response(self, 403, {"error": "forbidden"})
                    return
                try:
                    payload = read_json_body(self)
                    next_data = clean_gradebook_payload(payload, grades_data)
                except ValueError as error:
                    json_response(self, 400, {"error": str(error)})
                    return
                write_json_file(FRENCH8_GRADES_PATH, next_data, ".french8-grades-")
                json_response(self, 200, {"ok": True, "updatedAt": now_iso()})
            return


        if parsed.path == "/api/basic/integrated-task/state":
            with data_lock:
                grades_data = read_grades_data(BASIC_ENGLISH_GRADES_PATH)
                if grade_user_role(profile, grades_data) != "admin":
                    json_response(self, 403, {"error": "forbidden"})
                    return
                bundle = read_basic_integrated_task_bundle()
                state = bundle.setdefault("state", {})
                desired_open = payload.get("isOpen") is True
                timestamp = now_iso()
                state["isOpen"] = desired_open
                state["updatedAt"] = timestamp
                if desired_open:
                    state["openedAt"] = timestamp
                    state["openedBy"] = normalize_email(profile.get("email"))
                    state["closedAt"] = None
                else:
                    state["closedAt"] = timestamp
                write_basic_integrated_task_bundle(bundle)
                json_response(self, 200, {"ok": True, "state": state})
            return

        if parsed.path == "/api/basic/integrated-task/submissions/grade":
            with data_lock:
                grades_data = read_grades_data(BASIC_ENGLISH_GRADES_PATH)
                role = grade_user_role(profile, grades_data)
                if role not in ("admin", "teacher"):
                    json_response(self, 403, {"error": "forbidden"})
                    return
                rubric = clean_basic_rubric(payload.get("rubric"))
                if rubric is None:
                    json_response(self, 400, {"error": "invalid_rubric"})
                    return
                student_id = clean_text(payload.get("studentId"), 40)
                submissions = read_basic_integrated_task_submissions()
                submission = submissions.get("submissions", {}).get(student_id)
                if not isinstance(submission, dict):
                    json_response(self, 404, {"error": "submission_not_found"})
                    return
                student = next((item for item in grades_data.get("students", []) if isinstance(item, dict) and clean_text(item.get("id"), 40) == student_id), None)
                if not isinstance(student, dict):
                    json_response(self, 404, {"error": "student_not_found"})
                    return
                writing_points = sum(rubric.values())
                listening_points = float(submission.get("listeningPoints", 0))
                final_points = clean_exam_number(listening_points + writing_points)
                grade = round(float(final_points) / 10.0, 2)
                submission["rubric"] = rubric
                submission["writingPoints"] = writing_points
                submission["finalPoints"] = final_points
                submission["grade"] = grade
                submission["status"] = "graded"
                submission["teacherComments"] = str(payload.get("teacherComments") or "").strip()[:2000]
                submission["gradedAt"] = now_iso()
                submission["gradedBy"] = normalize_email(profile.get("email"))
                ensure_basic_integrated_task_evaluation(grades_data)
                student.setdefault("grades", {})["integratedTask20"] = grade
                write_basic_integrated_task_submissions(submissions)
                write_json_file(BASIC_ENGLISH_GRADES_PATH, grades_data, ".basic-grades-")
                json_response(self, 200, {"ok": True, "result": basic_integrated_submission_public(submission)})
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

        if parsed.path == "/api/intermediate/grades":
            with data_lock:
                grades_data = read_grades_data(INTERMEDIATE_ENGLISH_GRADES_PATH)
                if grade_user_role(profile, grades_data) != "admin":
                    json_response(self, 403, {"error": "forbidden"})
                    return
                try:
                    next_data = clean_gradebook_payload(payload, grades_data)
                except ValueError as error:
                    json_response(self, 400, {"error": str(error)})
                    return
                write_json_file(INTERMEDIATE_ENGLISH_GRADES_PATH, next_data, ".intermediate-grades-")
                json_response(self, 200, {"ok": True, "updatedAt": now_iso()})
            return

        if parsed.path == "/api/french7/final-exam/state":
            with data_lock:
                grades_data = read_grades_data(FRENCH7_GRADES_PATH)
                if grade_user_role(profile, grades_data) != "admin":
                    json_response(self, 403, {"error": "forbidden"})
                    return
                bundle = read_final_exam_bundle()
                state = bundle.setdefault("state", {})
                desired_open = payload.get("isOpen") is True
                timestamp = now_iso()
                state["isOpen"] = desired_open
                state["updatedAt"] = timestamp
                if desired_open:
                    state["openedAt"] = timestamp
                    state["openedBy"] = profile.get("email", "")
                    state["closedAt"] = None
                else:
                    state["closedAt"] = timestamp
                write_final_exam_bundle(bundle)
                json_response(self, 200, {"ok": True, "state": state})
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
