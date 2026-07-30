from pathlib import Path
import json
import re

ROOT = Path(__file__).resolve().parents[1]
SERVER = ROOT / "server" / "progress_api.py"
BASIC_EXAMPLE = ROOT / "data" / "basic-english-grades.example.json"
UNIT1_CLIENT = ROOT / "assets" / "js" / "english-basic2-pronunciation-unit1.js"
UNIT2_CLIENT = ROOT / "assets" / "js" / "english-basic2-pronunciation-unit2.js"

server = SERVER.read_text(encoding="utf-8")
basic_example = json.loads(BASIC_EXAMPLE.read_text(encoding="utf-8-sig"))
unit1_client = UNIT1_CLIENT.read_text(encoding="utf-8")
unit2_client = UNIT2_CLIENT.read_text(encoding="utf-8")

basic_ensure = re.search(
    r"def ensure_basic_gradebook_structure\(grades_data\):(?P<body>.*?)\n\n\ndef ensure_basic2_gradebook_structure",
    server,
    re.S,
)
assert basic_ensure, "Could not locate ensure_basic_gradebook_structure"
assert "BASIC2_UNIT" not in basic_ensure.group("body"), "Basic English Course 1 gradebook must not install Basic 2 evaluations"

for evaluation in basic_example.get("evaluations", []):
    assert not str(evaluation.get("id", "")).startswith("basic2"), "Basic Course 1 example data contains a Basic 2 evaluation"
    assert "Basic 2" not in str(evaluation.get("title", "")), "Basic Course 1 example data contains a Basic 2 title"

assert '"/api/basic2/unit1-pronunciation-weather/submit"' in unit1_client, "Unit 1 Basic 2 pronunciation must submit to /api/basic2"
assert '"/api/basic2/unit2-pronunciation-shopping-concert/submit"' in unit2_client, "Unit 2 Basic 2 pronunciation must submit to /api/basic2"

unit1_block = re.search(
    r'if parsed\.path in \("/api/basic2/unit1-pronunciation-weather/submit".*?write_json_file\(BASIC2_ENGLISH_GRADES_PATH',
    server,
    re.S,
)
unit2_block = re.search(
    r'if parsed\.path in \("/api/basic2/unit2-pronunciation-shopping-concert/submit".*?write_json_file\(BASIC2_ENGLISH_GRADES_PATH',
    server,
    re.S,
)
assert unit1_block, "Unit 1 Basic 2 pronunciation endpoint must write to BASIC2_ENGLISH_GRADES_PATH"
assert unit2_block, "Unit 2 Basic 2 pronunciation endpoint must write to BASIC2_ENGLISH_GRADES_PATH"

print("PASS Basic 2 gradebook isolation")
