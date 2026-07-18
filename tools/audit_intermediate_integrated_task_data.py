#!/usr/bin/env python3
"""Audit Intermediate Integrated Task data without exposing student records."""

import argparse
import collections
import json
from pathlib import Path


EVALUATION_ID = "intermediateIntegratedTask20"


def read_json(path, fallback=None):
    if not path.exists():
        return fallback
    with path.open("r", encoding="utf-8-sig") as handle:
        return json.load(handle)


def normalized(value):
    return str(value or "").strip().lower()


def duplicate_count(values):
    return sum(count > 1 for count in collections.Counter(values).values())


def audit(grades_path, exam_path, submissions_path):
    grades = read_json(grades_path, {}) or {}
    bundle = read_json(exam_path, {}) or {}
    submissions_data = read_json(submissions_path, {"submissions": {}, "attempts": {}, "events": []}) or {}

    students = [item for item in grades.get("students", []) if isinstance(item, dict)]
    student_ids = [str(item.get("id") or "").strip() for item in students]
    primary_emails = [normalized(item.get("email")) for item in students if normalized(item.get("email"))]
    known_ids = set(student_ids)

    def alternate_login(student):
        values = [student.get("username"), student.get("login"), student.get("localUsername")]
        aliases = student.get("emailAliases")
        if isinstance(aliases, list):
            values.extend(aliases)
        return any(normalized(value) for value in values)

    login_owners = collections.defaultdict(set)
    for student in students:
        values = [student.get("email"), student.get("username"), student.get("login"), student.get("localUsername")]
        aliases = student.get("emailAliases")
        if isinstance(aliases, list):
            values.extend(aliases)
        for value in values:
            login = normalized(value)
            if login:
                login_owners[login].add(str(student.get("id") or "").strip())

    evaluations = [
        item for item in grades.get("evaluations", [])
        if isinstance(item, dict) and item.get("id") == EVALUATION_ID
    ]
    exam = bundle.get("exam", {}) if isinstance(bundle.get("exam"), dict) else {}
    questions = [item for item in exam.get("questions", []) if isinstance(item, dict)]
    invalid_questions = []
    duplicate_option_questions = []
    for question in questions:
        options = question.get("options")
        answer = question.get("answer")
        if (
            not str(question.get("id") or "").strip()
            or not str(question.get("prompt") or "").strip()
            or not isinstance(options, list)
            or len(options) != 4
            or not isinstance(answer, int)
            or answer < 0
            or answer >= len(options or [])
            or float(question.get("points") or 0) <= 0
        ):
            invalid_questions.append(str(question.get("id") or "missing-id"))
        if isinstance(options, list) and len({normalized(option) for option in options}) != len(options):
            duplicate_option_questions.append(str(question.get("id") or "missing-id"))

    submissions = submissions_data.get("submissions", {})
    if not isinstance(submissions, dict):
        submissions = {}
    attempt_history = submissions_data.get("attempts", {})
    if not isinstance(attempt_history, dict):
        attempt_history = {}
    orphan_submissions = [student_id for student_id in submissions if student_id not in known_ids]
    orphan_histories = [student_id for student_id in attempt_history if student_id not in known_ids]
    archived_attempts = sum(len(items) for items in attempt_history.values() if isinstance(items, list))
    pending_submissions = sum(
        isinstance(item, dict) and item.get("status") != "graded"
        for item in submissions.values()
    )
    graded_submissions = sum(
        isinstance(item, dict) and item.get("status") == "graded"
        for item in submissions.values()
    )

    gradebook_numeric = 0
    gradebook_details = 0
    missing_detail_for_submission = 0
    grade_submission_mismatches = 0
    for student in students:
        student_id = str(student.get("id") or "").strip()
        grade = (student.get("grades") or {}).get(EVALUATION_ID)
        detail = (student.get("gradeDetails") or {}).get(EVALUATION_ID)
        submission = submissions.get(student_id)
        if isinstance(grade, (int, float)):
            gradebook_numeric += 1
        if isinstance(detail, dict):
            gradebook_details += 1
        if isinstance(submission, dict) and not isinstance(detail, dict):
            missing_detail_for_submission += 1
        if isinstance(submission, dict) and submission.get("status") == "graded":
            if not isinstance(grade, (int, float)) or float(grade) != float(submission.get("grade") or 0):
                grade_submission_mismatches += 1

    answer_distribution = collections.Counter(str(item.get("answer")) for item in questions)
    report = {
        "roster": {
            "students": len(students),
            "missingPrimaryEmail": sum(not normalized(item.get("email")) for item in students),
            "missingEmailWithoutAlternateLogin": sum(
                not normalized(item.get("email")) and not alternate_login(item) for item in students
            ),
            "duplicateStudentIds": duplicate_count(student_ids),
            "duplicatePrimaryEmails": duplicate_count(primary_emails),
            "ambiguousLoginTokens": sum(len(owners) > 1 for owners in login_owners.values()),
            "allowStudentIdClaim": grades.get("allowStudentIdClaim") is True,
        },
        "gradebook": {
            "evaluationCount": len(evaluations),
            "weight": evaluations[0].get("weight") if evaluations else None,
            "numericGrades": gradebook_numeric,
            "submissionDetails": gradebook_details,
            "missingDetailForSubmission": missing_detail_for_submission,
            "gradeSubmissionMismatches": grade_submission_mismatches,
        },
        "exam": {
            "isOpen": (bundle.get("state") or {}).get("isOpen"),
            "questionCount": len(questions),
            "questionPoints": sum(float(item.get("points") or 0) for item in questions),
            "answerDistribution": dict(sorted(answer_distribution.items())),
            "invalidQuestions": invalid_questions,
            "duplicateOptionQuestions": duplicate_option_questions,
            "duplicateQuestionIds": duplicate_count([str(item.get("id") or "") for item in questions]),
        },
        "submissions": {
            "count": len(submissions),
            "pending": pending_submissions,
            "graded": graded_submissions,
            "orphaned": len(orphan_submissions),
            "orphanedHistories": len(orphan_histories),
            "archivedAttempts": archived_attempts,
            "events": len(submissions_data.get("events", [])) if isinstance(submissions_data.get("events"), list) else 0,
        },
    }
    report["roster"]["accountCoverageGap"] = (
        report["roster"]["missingEmailWithoutAlternateLogin"] > 0
        and report["roster"]["allowStudentIdClaim"] is not True
    )
    report["ok"] = all((
        report["roster"]["students"] > 0,
        report["roster"]["duplicateStudentIds"] == 0,
        report["roster"]["duplicatePrimaryEmails"] == 0,
        report["roster"]["ambiguousLoginTokens"] == 0,
        report["roster"]["accountCoverageGap"] is False,
        report["gradebook"]["evaluationCount"] == 1,
        report["gradebook"]["weight"] == 20,
        report["gradebook"]["missingDetailForSubmission"] == 0,
        report["gradebook"]["gradeSubmissionMismatches"] == 0,
        report["exam"]["questionCount"] == 10,
        report["exam"]["questionPoints"] == 25,
        not report["exam"]["invalidQuestions"],
        not report["exam"]["duplicateOptionQuestions"],
        report["exam"]["duplicateQuestionIds"] == 0,
        report["submissions"]["orphaned"] == 0,
        report["submissions"]["orphanedHistories"] == 0,
    ))
    return report


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--grades", type=Path, required=True)
    parser.add_argument("--exam", type=Path, required=True)
    parser.add_argument("--submissions", type=Path, required=True)
    args = parser.parse_args()
    report = audit(args.grades, args.exam, args.submissions)
    print(json.dumps(report, indent=2, sort_keys=True))
    raise SystemExit(0 if report["ok"] else 1)


if __name__ == "__main__":
    main()
