from pathlib import Path
import sys


ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

from server import progress_api  # noqa: E402


evaluation = progress_api.FRENCH8_PRONUNCIATION_EVALUATIONS["pronunciation04d"]
assert evaluation["id"] == "pronunciation04d"
assert evaluation["weight"] == 5
assert evaluation["type"] == "Prononciation"
assert "pronunciation04d" in progress_api.FRENCH8_PRONUNCIATION_AUDIO_REQUIRED

for score100, expected_grade in ((0, 0.0), (20, 1.0), (60, 3.0), (86, 4.3), (100, 5.0)):
    evaluation_id, normalized_score, grade = progress_api.french8_pronunciation_grade_from_payload({
        "evaluationId": "pronunciation04d",
        "score100": score100,
    })
    assert evaluation_id == "pronunciation04d"
    assert normalized_score == score100
    assert grade == expected_grade

details = progress_api.clean_pronunciation_submission_details({
    "activityTitle": "Prononciation 04D - Discours rapporte",
    "details": {
        "overall": 86,
        "accuracy": 88,
        "completeness": 84,
        "fluency": 83,
        "uncertain": True,
        "uncertaintyReasons": [{"reason": "weak_signal"}],
        "uncertaintyMessage": "Resultat calcule avec reserve.",
        "transcript": "La ministre a declare qu'elle presenterait son projet.",
        "referenceText": "La ministre a declare qu'elle presenterait son projet le lendemain.",
        "final": True,
    },
}, "pronunciation04d", 86, 4.3)

assert details["evaluationId"] == "pronunciation04d"
assert details["score100"] == 86
assert details["grade"] == 4.3
assert details["uncertain"] is True
assert details["uncertaintyReasons"] == ["weak_signal"]

server_source = (ROOT / "server" / "progress_api.py").read_text(encoding="utf-8")
endpoint_source = server_source.split('if parsed.path == "/api/french8/pronunciation-grade":', 1)[1]
endpoint_source = endpoint_source.split('if parsed.path == "/api/french8/hypotheses-submission":', 1)[0]
audio_guard_position = endpoint_source.index("evaluation_id in FRENCH8_PRONUNCIATION_AUDIO_REQUIRED")
grade_write_position = endpoint_source.index('student.setdefault("grades", {})[evaluation_id] = grade')
assert audio_guard_position < grade_write_position

print("French 8 pronunciation 04D backend contract checks passed.")
