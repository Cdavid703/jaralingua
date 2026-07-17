#!/usr/bin/env python3
import os
import pathlib
import sys
import tempfile

sys.path.insert(0, str(pathlib.Path(__file__).resolve().parents[1]))

from server import progress_api as api


answers = {item["id"]: item["answer"] for item in api.INTERMEDIATE_MOCK_QUESTION_BLUEPRINT}
writing = (
    "This traditional dish is from Colombia and works as both everyday and special food. "
    "It is made with some rice, a little salt, a few vegetables, and a cup of broth. "
    "The outside is crisp, while the inside is soft, creamy, and savory. "
    "Compared with a sandwich, it is warmer and more filling. "
    "My family tried it at a cultural festival last year, and everyone enjoyed the texture. "
    "I would give it four out of five because the ingredients are simple but balanced. "
    "I recommend it to people who want a comforting meal with clear flavor and a practical portion. "
    "It should be served warm with a small slice of bread and some fresh fruit on the side."
)

attempt = api.intermediate_mock_score_attempt({"answers": answers, "writing": writing, "audioPlays": 2})
assert attempt["listeningPoints"] == 25
assert attempt["correctAnswers"] == 10
assert attempt["incorrectQuestions"] == []
assert attempt["writingSignalCount"] == 5
assert attempt["audioPlays"] == 2
assert len(attempt["skills"]) == 5
assert all(item["correct"] == item["total"] == 2 for item in attempt["skills"].values())

wrong_answers = dict(answers)
wrong_answers["m1"] = 0
wrong_answers["m4"] = 0
wrong_attempt = api.intermediate_mock_score_attempt({"answers": wrong_answers, "writing": writing, "audioPlays": 9})
assert wrong_attempt["listeningPoints"] == 20
assert wrong_attempt["incorrectQuestions"] == [1, 4]
assert wrong_attempt["audioPlays"] == 3
assert wrong_attempt["skills"]["mainIdea"]["correct"] == 1
assert wrong_attempt["skills"]["quantities"]["correct"] == 1

with tempfile.TemporaryDirectory() as directory:
    original_path = api.INTERMEDIATE_MOCK_INTEGRATED_TASK_PATH
    try:
        api.INTERMEDIATE_MOCK_INTEGRATED_TASK_PATH = os.path.join(directory, "mock-support.json")
        data = api.default_intermediate_mock_integrated_task_data()
        data["attempts"]["S001"] = [attempt, wrong_attempt]
        data["state"]["feedbackOpen"] = True
        api.write_intermediate_mock_integrated_task_data(data)
        restored = api.read_intermediate_mock_integrated_task_data()
        assert restored["state"]["feedbackOpen"] is True
        assert len(restored["attempts"]["S001"]) == 2
        grades = {
            "adminEmails": [],
            "teacherEmails": ["teacher@test.local"],
            "students": [{"id": "S001", "fullName": "Test Student", "email": "student@test.local"}]
        }
        student_state = api.intermediate_mock_state_payload({"email": "student@test.local"}, grades, restored)
        assert student_state["role"] == "student"
        assert student_state["feedbackAvailable"] is True
        assert len(student_state["attempts"]) == 2
        teacher_state = api.intermediate_mock_state_payload({"email": "teacher@test.local"}, grades, restored)
        assert teacher_state["role"] == "teacher"
        assert teacher_state["feedbackAvailable"] is True
        assert teacher_state["totalAttempts"] == 2
    finally:
        api.INTERMEDIATE_MOCK_INTEGRATED_TASK_PATH = original_path

print("PASS intermediate mock support: scoring, diagnostics, persistence, history, and release state")
