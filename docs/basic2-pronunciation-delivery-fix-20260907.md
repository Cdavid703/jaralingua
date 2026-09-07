# Pronunciation delivery correction — Units 3, 4 and 5

- Unit 4 was rejected because a shared validator required seven stages, although that activity has three guided stages and one final stage. Its route now explicitly validates four; Units 3 and 5 keep seven.
- All three routes save the transcript, recognition scores, missed words and completion receipt as an ungraded teacher deliverable: grade null, weight 0, status submitted. Practice scores remain learning feedback.
- Duplicate client IDs return the original receipt. The clients retain the ID for retries, use bounded submission waits and explain session-expiry errors.
- Authentication first reads the shared current-user API used by the top navigation; the shared login panel opens when needed. Existing stage-progress keys are preserved.
- The three HTML pages carry updated script versions so phones load the corrected delivery code.
- Regression test: tools/test_basic2_pronunciation_deliveries.py executes the actual route branches against in-memory records. It verifies each stage count, ungraded persistence, duplicate retries and incomplete-report rejection without touching real student records.
