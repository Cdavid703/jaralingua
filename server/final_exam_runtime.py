"""Pure runtime helpers shared by JaraLingua final examinations.

This module deliberately performs no file, network, HTTP, or clock I/O.  Callers
provide the current time and persisted objects, which keeps the security-sensitive
behaviour deterministic and straightforward to test.

The public draft helpers never return a question's ``answer`` field.  Answer keys
are used internally only when aggregate statistics are calculated for teachers.
"""

from __future__ import annotations

import base64
import hashlib
import hmac
import json
import math
import statistics
from datetime import datetime, timedelta, timezone
from typing import Any, Dict, Iterable, Mapping, Optional, Sequence, Tuple, Union


Timestamp = Union[int, float, str, datetime]


def _secret_bytes(secret: Union[str, bytes]) -> bytes:
    if isinstance(secret, str):
        encoded = secret.encode("utf-8")
    elif isinstance(secret, bytes):
        encoded = secret
    else:
        raise TypeError("secret must be str or bytes")
    if not encoded:
        raise ValueError("secret must not be empty")
    return encoded


def _required_text(value: Any, field: str) -> str:
    text = str(value or "").strip()
    if not text:
        raise ValueError("%s must not be empty" % field)
    return text


def _canonical_payload(payload: Mapping[str, Any]) -> bytes:
    return json.dumps(
        payload,
        ensure_ascii=False,
        sort_keys=True,
        separators=(",", ":"),
    ).encode("utf-8")


def deterministic_exam_seed(
    secret: Union[str, bytes],
    student_id: str,
    exam_id: str,
    exam_version: str = "",
) -> int:
    """Return a stable 128-bit integer seed scoped to one student and exam.

    The HMAC prevents students from predicting another student's order even when
    student and exam identifiers are public.  ``exam_version`` changes the order
    when a genuinely new bank is published, while page reloads retain it.
    """

    message = _canonical_payload(
        {
            "purpose": "final-exam-order-v1",
            "studentId": _required_text(student_id, "student_id").casefold(),
            "examId": _required_text(exam_id, "exam_id"),
            "examVersion": str(exam_version or "").strip(),
        }
    )
    digest = hmac.new(_secret_bytes(secret), message, hashlib.sha256).digest()
    return int.from_bytes(digest[:16], "big", signed=False)


def _as_utc_datetime(value: Timestamp, field: str) -> datetime:
    if isinstance(value, bool):
        raise ValueError("%s must be a timestamp" % field)
    if isinstance(value, (int, float)):
        if not math.isfinite(float(value)):
            raise ValueError("%s must be finite" % field)
        return datetime.fromtimestamp(float(value), tz=timezone.utc)
    if isinstance(value, datetime):
        parsed = value
    elif isinstance(value, str):
        text = value.strip()
        if not text:
            raise ValueError("%s must not be empty" % field)
        if text.endswith("Z"):
            text = text[:-1] + "+00:00"
        try:
            parsed = datetime.fromisoformat(text)
        except ValueError as error:
            raise ValueError("%s must be an ISO-8601 timestamp" % field) from error
    else:
        raise TypeError("%s has an unsupported type" % field)
    if parsed.tzinfo is None:
        parsed = parsed.replace(tzinfo=timezone.utc)
    return parsed.astimezone(timezone.utc)


def _iso_utc(value: datetime) -> str:
    return value.astimezone(timezone.utc).isoformat(timespec="seconds").replace("+00:00", "Z")


def exam_timing(
    opened_at: Timestamp,
    duration_minutes: Union[int, float],
    student_id: str,
    extra_minutes_by_student: Optional[Mapping[str, Union[int, float]]] = None,
    now: Optional[Timestamp] = None,
) -> Dict[str, Any]:
    """Calculate the server-authoritative deadline and remaining time.

    ``opened_at`` starts the common examination window.  A non-negative extension
    may be assigned per student.  Missing students receive zero extra minutes.
    The returned remaining seconds are clamped at zero.
    """

    student_key = _required_text(student_id, "student_id")
    try:
        duration = float(duration_minutes)
    except (TypeError, ValueError) as error:
        raise ValueError("duration_minutes must be numeric") from error
    if not math.isfinite(duration) or duration <= 0:
        raise ValueError("duration_minutes must be greater than zero")

    extras = extra_minutes_by_student or {}
    raw_extra: Union[int, float] = extras.get(student_key, 0)
    if raw_extra == 0:
        # Email identifiers and aliases are commonly stored with mixed casing.
        folded = student_key.casefold()
        raw_extra = next(
            (value for key, value in extras.items() if str(key).strip().casefold() == folded),
            0,
        )
    try:
        extra = float(raw_extra)
    except (TypeError, ValueError) as error:
        raise ValueError("student extra minutes must be numeric") from error
    if not math.isfinite(extra) or extra < 0:
        raise ValueError("student extra minutes must not be negative")

    opened = _as_utc_datetime(opened_at, "opened_at")
    current = _as_utc_datetime(now, "now") if now is not None else opened
    total_seconds = int(round((duration + extra) * 60))
    deadline = opened + timedelta(seconds=total_seconds)
    remaining = max(0, int(math.ceil(deadline.timestamp() - current.timestamp())))
    return {
        "openedAt": _iso_utc(opened),
        "deadlineAt": _iso_utc(deadline),
        "durationMinutes": _clean_number(duration),
        "extraMinutes": _clean_number(extra),
        "totalMinutes": _clean_number(duration + extra),
        "remainingSeconds": remaining,
        "expired": current >= deadline,
    }


def _question_index(exam: Mapping[str, Any]) -> Dict[str, Mapping[str, Any]]:
    result: Dict[str, Mapping[str, Any]] = {}
    sections = exam.get("sections", []) if isinstance(exam, Mapping) else []
    if not isinstance(sections, Sequence) or isinstance(sections, (str, bytes)):
        return result
    for section in sections:
        if not isinstance(section, Mapping):
            continue
        questions = section.get("questions", [])
        if not isinstance(questions, Sequence) or isinstance(questions, (str, bytes)):
            continue
        for question in questions:
            if not isinstance(question, Mapping):
                continue
            question_id = str(question.get("id") or "").strip()
            if question_id:
                result[question_id] = question
    return result


def _normalize_draft_answer(question: Mapping[str, Any], value: Any) -> Tuple[bool, Any]:
    question_type = str(question.get("type") or "mcq").strip().lower()
    options = question.get("options", [])
    option_count = len(options) if isinstance(options, Sequence) and not isinstance(options, (str, bytes)) else 0

    if question_type == "truefalse":
        if isinstance(value, bool):
            return True, value
        if isinstance(value, str) and value.strip().lower() in ("true", "false"):
            return True, value.strip().lower() == "true"
        return False, None

    if question_type in ("multiselect", "multiple", "checkbox"):
        if not isinstance(value, Sequence) or isinstance(value, (str, bytes)):
            return False, None
        normalized = []
        for item in value:
            if isinstance(item, bool):
                return False, None
            try:
                option = int(item)
            except (TypeError, ValueError):
                return False, None
            if option < 0 or option >= option_count:
                return False, None
            if option not in normalized:
                normalized.append(option)
        return (bool(normalized), sorted(normalized) if normalized else None)

    if question_type in ("text", "textarea", "shortanswer"):
        if not isinstance(value, str):
            return False, None
        text = value.strip()
        return (bool(text), text[:2000] if text else None)

    if isinstance(value, bool):
        return False, None
    try:
        option = int(value)
    except (TypeError, ValueError):
        return False, None
    if option < 0 or option >= option_count:
        return False, None
    return True, option


def validate_partial_draft(exam: Mapping[str, Any], draft: Any) -> Dict[str, Any]:
    """Return a safe, normalized partial draft and non-sensitive validation data.

    Unknown question IDs and invalid values are omitted.  The result contains no
    prompts, options, correctness flags, or answer keys, so it can be returned to
    an authenticated student without leaking exam solutions.
    """

    questions = _question_index(exam)
    raw_answers = draft.get("answers", {}) if isinstance(draft, Mapping) and "answers" in draft else draft
    if not isinstance(raw_answers, Mapping):
        raw_answers = {}

    answers: Dict[str, Any] = {}
    unknown_ids = []
    invalid_ids = []
    for raw_id, value in raw_answers.items():
        question_id = str(raw_id or "").strip()
        question = questions.get(question_id)
        if question is None:
            if question_id:
                unknown_ids.append(question_id[:80])
            continue
        valid, normalized = _normalize_draft_answer(question, value)
        if valid:
            answers[question_id] = normalized
        else:
            invalid_ids.append(question_id)

    total = len(questions)
    return {
        "answers": answers,
        "answeredCount": len(answers),
        "totalQuestions": total,
        "complete": total > 0 and len(answers) == total,
        "unknownQuestionIds": sorted(set(unknown_ids)),
        "invalidAnswerIds": sorted(set(invalid_ids)),
    }


def sanitize_partial_draft(exam: Mapping[str, Any], draft: Any) -> Dict[str, Any]:
    """Return only the normalized answer mapping from ``validate_partial_draft``."""

    return validate_partial_draft(exam, draft)["answers"]


def submission_receipt_code(
    secret: Union[str, bytes],
    exam_id: str,
    exam_version: str,
    student_id: str,
    submitted_at: Timestamp,
    attempt_id: str = "",
) -> str:
    """Create a compact, tamper-evident receipt code for one submission."""

    submitted = _as_utc_datetime(submitted_at, "submitted_at")
    payload = {
        "purpose": "final-exam-receipt-v1",
        "examId": _required_text(exam_id, "exam_id"),
        "examVersion": str(exam_version or "").strip(),
        "studentId": _required_text(student_id, "student_id").casefold(),
        "submittedAt": _iso_utc(submitted),
        "attemptId": str(attempt_id or "").strip(),
    }
    digest = hmac.new(_secret_bytes(secret), _canonical_payload(payload), hashlib.sha256).digest()[:15]
    token = base64.b32encode(digest).decode("ascii").rstrip("=")
    return "JLF-" + "-".join(token[index:index + 6] for index in range(0, len(token), 6))


def verify_submission_receipt(
    receipt_code: str,
    secret: Union[str, bytes],
    exam_id: str,
    exam_version: str,
    student_id: str,
    submitted_at: Timestamp,
    attempt_id: str = "",
) -> bool:
    """Verify a receipt in constant time using its original submission fields."""

    expected = submission_receipt_code(
        secret, exam_id, exam_version, student_id, submitted_at, attempt_id
    )
    return hmac.compare_digest(str(receipt_code or "").upper(), expected)


def _clean_number(value: float) -> Union[int, float]:
    return int(value) if float(value).is_integer() else round(float(value), 2)


def _numeric(value: Any) -> Optional[float]:
    if isinstance(value, bool):
        return None
    try:
        result = float(value)
    except (TypeError, ValueError):
        return None
    return result if math.isfinite(result) else None


def _submission_list(submissions: Any) -> Iterable[Mapping[str, Any]]:
    if isinstance(submissions, Mapping) and isinstance(submissions.get("submissions"), Mapping):
        values = submissions["submissions"].values()
    elif isinstance(submissions, Mapping):
        values = submissions.values()
    elif isinstance(submissions, Sequence) and not isinstance(submissions, (str, bytes)):
        values = submissions
    else:
        values = []
    return (item for item in values if isinstance(item, Mapping))


def aggregate_exam_statistics(
    exam: Mapping[str, Any],
    submissions: Any,
    pass_grade: float = 3.0,
) -> Dict[str, Any]:
    """Aggregate teacher-facing results without returning answer-key indices.

    Accepted submissions may be a list, a student-id mapping, or the persisted
    ``{"submissions": {...}}`` wrapper.  Question responses can be stored as raw
    values or as the current ``{"answer": value, "correct": bool}`` details.
    Distractor rows include only incorrect selected options; the correct option is
    never emitted by this helper.
    """

    records = list(_submission_list(submissions))
    grades = [value for value in (_numeric(item.get("grade")) for item in records) if value is not None]
    grade_frequency: Dict[str, int] = {}
    for grade in grades:
        key = ("%.2f" % grade).rstrip("0").rstrip(".")
        grade_frequency[key] = grade_frequency.get(key, 0) + 1

    sections_out: Dict[str, Any] = {}
    questions_out: Dict[str, Any] = {}
    sections = exam.get("sections", []) if isinstance(exam, Mapping) else []
    for section in sections if isinstance(sections, Sequence) else []:
        if not isinstance(section, Mapping):
            continue
        section_id = str(section.get("id") or "").strip()
        if not section_id:
            continue
        questions = [item for item in section.get("questions", []) if isinstance(item, Mapping)]
        section_total = sum(_numeric(item.get("points")) or 1 for item in questions)
        section_values = []
        for record in records:
            persisted = record.get("sectionScores", {})
            value = persisted.get(section_id) if isinstance(persisted, Mapping) else None
            score = _numeric(value.get("score")) if isinstance(value, Mapping) else _numeric(value)
            if score is None:
                score = _score_section_from_answers(questions, record.get("answers", {}))
            section_values.append(score)
        average_points = statistics.fmean(section_values) if section_values else 0.0
        sections_out[section_id] = {
            "title": str(section.get("title") or section_id),
            "submissionCount": len(section_values),
            "averagePoints": round(average_points, 2),
            "totalPoints": _clean_number(section_total),
            "averagePercent": round((average_points / section_total) * 100, 2) if section_total else 0,
        }

        for question in questions:
            question_id = str(question.get("id") or "").strip()
            if not question_id:
                continue
            expected = question.get("answer")
            response_count = 0
            correct_count = 0
            selected: Dict[Any, int] = {}
            for record in records:
                answer_map = record.get("answers", {})
                if not isinstance(answer_map, Mapping) or question_id not in answer_map:
                    continue
                stored = answer_map[question_id]
                value = stored.get("answer") if isinstance(stored, Mapping) else stored
                response_count += 1
                stored_correct = stored.get("correct") if isinstance(stored, Mapping) else None
                is_correct = stored_correct if isinstance(stored_correct, bool) else value == expected
                if is_correct is True:
                    correct_count += 1
                else:
                    key = _hashable_answer(value)
                    selected[key] = selected.get(key, 0) + 1
            distractors = []
            options = question.get("options", [])
            for value, count in sorted(selected.items(), key=lambda item: (-item[1], str(item[0]))):
                label = None
                if isinstance(value, int) and isinstance(options, Sequence) and not isinstance(options, (str, bytes)):
                    if 0 <= value < len(options):
                        label = str(options[value])
                distractors.append(
                    {
                        "value": value,
                        "label": label,
                        "count": count,
                        "percentOfResponses": round((count / response_count) * 100, 2) if response_count else 0,
                    }
                )
            questions_out[question_id] = {
                "sectionId": section_id,
                "prompt": str(question.get("prompt") or ""),
                "responseCount": response_count,
                "missingCount": len(records) - response_count,
                "correctCount": correct_count,
                "incorrectCount": response_count - correct_count,
                "correctPercent": round((correct_count / response_count) * 100, 2) if response_count else 0,
                "distractors": distractors,
            }

    grade_summary = {
        "submissionCount": len(records),
        "gradedCount": len(grades),
        "average": round(statistics.fmean(grades), 2) if grades else 0,
        "median": round(statistics.median(grades), 2) if grades else 0,
        "minimum": round(min(grades), 2) if grades else 0,
        "maximum": round(max(grades), 2) if grades else 0,
        "passGrade": pass_grade,
        "passed": sum(1 for grade in grades if grade >= pass_grade),
        "failed": sum(1 for grade in grades if grade < pass_grade),
        "frequency": dict(sorted(grade_frequency.items(), key=lambda item: float(item[0]))),
    }
    return {"grades": grade_summary, "sections": sections_out, "questions": questions_out}


def _hashable_answer(value: Any) -> Any:
    if isinstance(value, list):
        return ",".join(str(item) for item in value)
    if isinstance(value, (str, int, float, bool)) or value is None:
        return value
    return str(value)


def _score_section_from_answers(
    questions: Sequence[Mapping[str, Any]], answers: Any
) -> float:
    if not isinstance(answers, Mapping):
        return 0.0
    score = 0.0
    for question in questions:
        question_id = str(question.get("id") or "").strip()
        if question_id not in answers:
            continue
        stored = answers[question_id]
        value = stored.get("answer") if isinstance(stored, Mapping) else stored
        stored_correct = stored.get("correct") if isinstance(stored, Mapping) else None
        is_correct = stored_correct if isinstance(stored_correct, bool) else value == question.get("answer")
        if is_correct is True:
            score += _numeric(question.get("points")) or 1
    return score


__all__ = [
    "aggregate_exam_statistics",
    "deterministic_exam_seed",
    "exam_timing",
    "sanitize_partial_draft",
    "submission_receipt_code",
    "validate_partial_draft",
    "verify_submission_receipt",
]
