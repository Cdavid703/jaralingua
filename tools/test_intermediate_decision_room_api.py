import importlib
import os
import sys
import tempfile
from pathlib import Path


def assert_true(condition, message):
    if not condition:
        raise AssertionError(message)


with tempfile.TemporaryDirectory() as tempdir:
    sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
    os.environ["JARALINGUA_INTERMEDIATE_DECISION_ROOM_DATA"] = os.path.join(
        tempdir, "decision-room.json"
    )
    api = importlib.import_module("server.progress_api")

    status, created = api.intermediate_decision_room_action({"action": "create"})
    assert_true(status == 200, f"create failed: {created}")
    room_code = created["roomCode"]
    teacher_token = created["teacherToken"]

    status, joined_1 = api.intermediate_decision_room_action(
        {
            "action": "join",
            "roomCode": room_code,
            "name": "Student One",
        }
    )
    assert_true(status == 200, f"join 1 failed: {joined_1}")
    token_1 = joined_1["playerToken"]

    status, joined_2 = api.intermediate_decision_room_action(
        {
            "action": "join",
            "roomCode": room_code,
            "name": "Student Two",
        }
    )
    assert_true(status == 200, f"join 2 failed: {joined_2}")
    token_2 = joined_2["playerToken"]

    status, launched = api.intermediate_decision_room_action(
        {
            "action": "launch",
            "roomCode": room_code,
            "teacherToken": teacher_token,
            "scenarioId": "overbooked-saturday",
        }
    )
    assert_true(status == 200, f"launch failed: {launched}")
    assert_true(launched["state"]["room"]["status"] == "writing", "room should be writing")

    response_1 = (
        "Olivia should protect the confirmed rehearsal because the musicians are already coming. "
        "She could put off the interview, and she will call her mother before lunch."
    )
    response_2 = (
        "Olivia is going to visit her mother, but she should free up the evening by moving the "
        "producer meeting. She will send the new agenda tonight."
    )

    status, submitted_1 = api.intermediate_decision_room_action(
        {
            "action": "submit-response",
            "roomCode": room_code,
            "playerToken": token_1,
            "text": response_1,
        }
    )
    assert_true(status == 200, f"submit 1 failed: {submitted_1}")
    response_id_1 = submitted_1["responseId"]

    status, submitted_2 = api.intermediate_decision_room_action(
        {
            "action": "submit-response",
            "roomCode": room_code,
            "playerToken": token_2,
            "text": response_2,
        }
    )
    assert_true(status == 200, f"submit 2 failed: {submitted_2}")
    response_id_2 = submitted_2["responseId"]

    for response_id in (response_id_1, response_id_2):
        status, nominated = api.intermediate_decision_room_action(
            {
                "action": "nominate",
                "roomCode": room_code,
                "teacherToken": teacher_token,
                "responseId": response_id,
            }
        )
        assert_true(status == 200, f"nominate failed: {nominated}")

    status, voting = api.intermediate_decision_room_action(
        {
            "action": "open-vote",
            "roomCode": room_code,
            "teacherToken": teacher_token,
        }
    )
    assert_true(status == 200, f"open vote failed: {voting}")
    assert_true(voting["state"]["room"]["status"] == "voting", "room should be voting")

    status, vote_first = api.intermediate_decision_room_action(
        {
            "action": "vote",
            "roomCode": room_code,
            "playerToken": token_1,
            "responseId": response_id_2,
        }
    )
    assert_true(status == 200, f"first vote failed: {vote_first}")

    status, vote_changed = api.intermediate_decision_room_action(
        {
            "action": "vote",
            "roomCode": room_code,
            "playerToken": token_1,
            "responseId": response_id_1,
        }
    )
    assert_true(status == 200, f"changed vote failed: {vote_changed}")
    assert_true(vote_changed["state"]["currentVote"] == response_id_1, "vote should be editable")

    status, vote_second = api.intermediate_decision_room_action(
        {
            "action": "vote",
            "roomCode": room_code,
            "playerToken": token_2,
            "responseId": response_id_1,
        }
    )
    assert_true(status == 200, f"second vote failed: {vote_second}")

    status, revealed = api.intermediate_decision_room_action(
        {
            "action": "reveal",
            "roomCode": room_code,
            "teacherToken": teacher_token,
        }
    )
    assert_true(status == 200, f"reveal failed: {revealed}")
    assert_true(revealed["state"]["room"]["status"] == "revealed", "room should be revealed")
    assert_true(
        revealed["state"]["result"]["winningResponseId"] == response_id_1,
        "winner should reflect changed vote",
    )
    assert_true(
        revealed["state"]["result"]["votes"][0]["votes"] == 2,
        "winning response should have two votes",
    )

    status, reset = api.intermediate_decision_room_action(
        {
            "action": "reset",
            "roomCode": room_code,
            "teacherToken": teacher_token,
        }
    )
    assert_true(status == 200, f"reset failed: {reset}")
    assert_true(reset["state"]["room"]["status"] == "waiting", "room should reset to waiting")
    assert_true(reset["state"]["room"]["round"] == 2, "round should advance after reset")

print("Intermediate Decision Room API checks passed.")
