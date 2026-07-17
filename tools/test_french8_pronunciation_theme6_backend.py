from pathlib import Path
import sys


ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

from server import progress_api  # noqa: E402


assert "pronunciation06d" not in progress_api.FRENCH8_PRONUNCIATION_EVALUATIONS
assert "pronunciation06d" not in progress_api.FRENCH8_PRONUNCIATION_AUDIO_REQUIRED

try:
    progress_api.french8_pronunciation_grade_from_payload({
        "evaluationId": "pronunciation06d",
        "score100": 100,
    })
except ValueError as error:
    assert str(error) == "invalid_evaluation"
else:
    raise AssertionError("06D must remain outside the grade submission contract")

print("French 8 pronunciation 06D formative backend contract checks passed.")
