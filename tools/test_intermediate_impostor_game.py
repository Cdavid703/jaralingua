#!/usr/bin/env python3
"""Regression checks for the Intermediate English Vocabulary Impostor."""

import tempfile
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

from server import progress_api as api  # noqa: E402


PAGE_PATH = ROOT / "ingles" / "intermediate" / "game-unit-4-family-impostor.html"
SCRIPT_PATH = ROOT / "assets" / "js" / "english-intermediate-unit4-impostor.js"


def action(action_name, **payload):
    return api.intermediate_unit4_impostor_action({"action": action_name, **payload})


def assert_decks_and_images():
    expected_sizes = {"unit2": 6, "unit3": 6, "unit4": 6}
    all_images = []
    for deck_name, expected_size in expected_sizes.items():
        cards = api.INTERMEDIATE_IMPOSTOR_DECKS[deck_name]["cards"]
        assert len(cards) == expected_size, (deck_name, len(cards))
        images = [card["image"] for card in cards]
        assert len(set(images)) == expected_size, (deck_name, images)
        for card in cards:
            assert card["term"] and card["brief"] and card["speakingHelp"]
            assert len(card["clues"]) >= 3 and len(card["taboo"]) >= 4
            image_path = ROOT / card["image"].lstrip("/")
            assert image_path.exists(), image_path
            assert image_path.stat().st_size > 100_000, image_path
        all_images.extend(images)
    assert len(set(all_images)) == sum(expected_sizes.values())


def main():
    assert_decks_and_images()
    page_source = PAGE_PATH.read_text(encoding="utf-8")
    script_source = SCRIPT_PATH.read_text(encoding="utf-8")
    assert 'id="teacherActionGuide"' in page_source
    assert 'aria-live="polite"' in page_source
    assert "TEACHER_ROOMS_STORAGE_KEY" in script_source
    assert "speechSynthesis" not in script_source
    assert "hidden phrasal verb or idiom" not in script_source

    with tempfile.TemporaryDirectory(prefix="jaralingua-intermediate-impostor-") as folder:
        api.INTERMEDIATE_UNIT4_IMPOSTOR_PATH = str(Path(folder) / "rooms.json")

        status, first_room = action("create")
        assert status == 200, first_room
        status, second_room = action("create")
        assert status == 200, second_room

        status, unscoped_reset = action("reset-all")
        assert status == 400 and unscoped_reset["error"] == "invalid_room_list", unscoped_reset
        assert len(api.read_intermediate_unit4_impostor_store()["rooms"]) == 2

        status, forged_reset = action("reset-all", rooms=[{
            "roomCode": first_room["roomCode"],
            "teacherToken": "not-the-teacher-token",
        }])
        assert status == 200 and forged_reset["clearedRooms"] == 0, forged_reset
        assert len(api.read_intermediate_unit4_impostor_store()["rooms"]) == 2

        status, scoped_reset = action("reset-all", rooms=[{
            "roomCode": first_room["roomCode"],
            "teacherToken": first_room["teacherToken"],
        }])
        assert status == 200 and scoped_reset["clearedRooms"] == 1, scoped_reset
        assert list(api.read_intermediate_unit4_impostor_store()["rooms"]) == [second_room["roomCode"]]

        room_code = second_room["roomCode"]
        teacher_token = second_room["teacherToken"]
        players = []
        for name in ("Alex", "Bailey", "Casey", "Drew"):
            status, joined = action("join", roomCode=room_code, name=name)
            assert status == 200, joined
            players.append({
                "id": joined["state"]["currentPlayer"]["id"],
                "token": joined["playerToken"],
            })

        status, distributed = action(
            "distribute",
            roomCode=room_code,
            teacherToken=teacher_token,
            deck="unit4",
        )
        assert status == 200 and distributed["state"]["room"]["status"] == "briefing", distributed
        assert distributed["state"]["teacher"]["card"]["image"].startswith(
            "/assets/img/english-intermediate/unit-4/impostor/"
        )

        for player in players:
            status, confirmed = action(
                "confirm",
                roomCode=room_code,
                playerToken=player["token"],
            )
            assert status == 200, confirmed
        assert confirmed["state"]["room"]["status"] == "discussion"

        status, voting = action("open-vote", roomCode=room_code, teacherToken=teacher_token)
        assert status == 200 and voting["state"]["room"]["voteCount"] == 0, voting

        status, first_vote = action(
            "vote",
            roomCode=room_code,
            playerToken=players[0]["token"],
            suspectId=players[1]["id"],
        )
        assert status == 200 and first_vote["state"]["currentPlayer"]["hasVoted"] is True
        status, changed_vote = action(
            "vote",
            roomCode=room_code,
            playerToken=players[0]["token"],
            suspectId=players[2]["id"],
        )
        assert status == 200, changed_vote
        assert changed_vote["state"]["room"]["voteCount"] == 1
        assert changed_vote["state"]["currentPlayer"]["voteSuspectId"] == players[2]["id"]

        status, revealed = action("reveal", roomCode=room_code, teacherToken=teacher_token)
        assert status == 200 and revealed["state"]["result"], revealed
        status, reset = action("reset", roomCode=room_code, teacherToken=teacher_token)
        assert status == 200 and reset["state"]["room"]["round"] == 2, reset
        assert reset["state"]["room"]["voteCount"] == 0
        assert all(not player["hasVoted"] for player in reset["state"]["players"])

        status, second_distribution = action(
            "distribute",
            roomCode=room_code,
            teacherToken=teacher_token,
            deck="unit2",
        )
        assert status == 200, second_distribution
        assert second_distribution["state"]["room"]["deck"] == "unit2"
        assert "/unit-2/impostor/" in second_distribution["state"]["teacher"]["card"]["image"]
        status, second_vote_open = action("open-vote", roomCode=room_code, teacherToken=teacher_token)
        assert status == 200, second_vote_open
        status, second_round_vote = action(
            "vote",
            roomCode=room_code,
            playerToken=players[0]["token"],
            suspectId=players[3]["id"],
        )
        assert status == 200, second_round_vote
        assert second_round_vote["state"]["currentPlayer"]["voteSuspectId"] == players[3]["id"]

        status, final_reset = action("reset-all", rooms=[{
            "roomCode": room_code,
            "teacherToken": teacher_token,
        }])
        assert status == 200 and final_reset["clearedRooms"] == 1, final_reset
        assert api.read_intermediate_unit4_impostor_store()["rooms"] == {}

    print("PASS Vocabulary Impostor: unique images, scoped reset, role flow, vote update, and clean second round")


if __name__ == "__main__":
    main()
