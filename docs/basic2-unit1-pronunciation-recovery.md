# Unit 1 pronunciation: score and continuation recovery

Reported 18 October 2026 via a screenshot of the Weather and Going Out pronunciation page (not Final Adventure). The screenshot alone does not show the recording error or establish whether analysis completed.

Confirmed client defects: saved attempts were loaded but their result/Next button were hidden on startup; report summary showed no average until all seven parts were complete; a localStorage write failure interrupted result rendering; failed analysis offered no way to retry the existing recording. The live assessment endpoint successfully transcribed an existing synthetic catalogue-voice phrase using local Whisper, without student data.

Fix scoped to Unit 1: render saved results without adding duplicate attempts; partial average and completion count; return-to-current-section button; bounded analysis with retry of the in-memory recording; guard controls while analyzing; show results even when browser storage is unavailable. Existing progress keys and scoring formula remain unchanged. Low scores permit continuation, while sending still requires six sections plus the final challenge and sign-in. Practice averages are recognition-based estimates, not phonetic assessment. No grade records or backend files changed.

Regression: tools/test_basic2_unit1_pronunciation_recovery.cjs uses synthetic microphone input and intercepted API responses. Covers score display, partial summary, restored result/Next, low-score continuation, service outage/retry, blocked storage, all seven stages, and responsive widths. No student recordings or teacher submissions are sent. Set PUBLIC_ONLY=1 to check the published script.
