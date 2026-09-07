"""Offline asset and report contract checks; never touches student records."""
import ast
import json
import re
from pathlib import Path

root = Path(__file__).resolve().parents[1]
js = (root / "assets/js/english-basic2-pronunciation-unit5.js").read_text(encoding="utf-8")
stages = json.loads(re.search(r"const STAGES = (\[[\s\S]*?\]);", js).group(1))
assert len(stages) == 7
assert stages[-1]["text"] == " ".join(s["text"] for s in stages[:-1])
words = set()
for stage in stages:
    assert (root / "ingles/basico-2" / stage["audio"]).stat().st_size > 1000
    for word in stage["text"].lower().split():
        slug = re.sub(r"[^a-z]", "", word)
        words.add(slug)
        assert (root / "ingles/basico-2/audio/unit5/pronunciation/words" / (slug + ".mp3")).stat().st_size > 1000, slug
source = ast.parse((root / "server/progress_api.py").read_text(encoding="utf-8"))
names = {"clean_text", "clean_text_list", "clean_score_metric", "basic2_unit1_pronunciation_report_from_payload"}
subset = ast.Module(body=[n for n in source.body if isinstance(n, ast.FunctionDef) and n.name in names], type_ignores=[])
scope = {}
exec(compile(subset, "<report-contract>", "exec"), scope)
reporter = scope["basic2_unit1_pronunciation_report_from_payload"]
payload = {"clientSubmissionId": "offline-test", "stageScores": [
    {"overall": 80, "transcript": s["text"], "referenceText": s["text"], "stage": s["label"]} for s in stages
]}
report = reporter(payload)
assert report["score100"] == 80 and report["grade"] == 4
assert report["finalReferenceText"] == stages[-1]["text"]
try:
    reporter({"stageScores": payload["stageScores"][:-1]})
    raise AssertionError("Incomplete report accepted")
except ValueError:
    pass
print(f"PASS: seven stages, concatenated final, {len(words)} word audios, average and incomplete-report rejection.")
