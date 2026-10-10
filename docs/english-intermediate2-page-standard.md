# Intermediate 2 · Required page-access QR

Applies to every course page, including explanations, Practice Lab activities, pronunciation and official exams.

1. Reuse the shared `/assets/js/page-qr-access.js` component. It places the QR in the hero and expands it in a dialog when clicked.
2. Generate an SVG encoding the exact canonical URL beginning with `https://www.jaralingua.com/ingles/intermediate-2/`.
3. Asset convention: for `/ingles/intermediate-2/example.html`, provide `/assets/img/page-qr/ingles-intermediate-2-example.svg`.
4. Include both page and SVG in the release. The component hides itself if the SVG fails to load, so script presence alone is not sufficient.
5. Check image loading, opening/closing the enlarged QR, mobile layout and lack of overlap with the title, login and controls.
6. Run `node tools/test_intermediate2_page_contract.mjs` before publishing. It checks the QR script and actual SVG file on all 51 current pages. Update the page count when adding a new page; do not remove QR checks.
7. Repeat the visibility and enlargement check on the published page. Preserve exam access restrictions and never include private exam content in the QR.

This requirement is also recorded in `ingles/intermediate-2/AGENTS.md` so it is visible when working on future pages.

## Final written assessment

The official **First Impression · Final Writing Task (20%)** follows [the documented final-writing contract](intermediate2-final-writing-first-impression.md): original DOCX wording and ITM assets, QR, shared authentication, teacher preview/review, individual student delivery and the existing reserved `intermediate2FinalWritingTask20` column. Publication must leave the exam closed until the teacher activates it.

## Expression explanations

In Unit 5 and future expression sections, identify each entry visibly as a Phrasal verb or Idiom and briefly explain the difference. Keep the English definition and inline pronunciation, with an approximate Spanish meaning where requested for this expression support. Keep the shared expression library consistent; do not duplicate entries. Speaker-marked words remain the clickable pronunciation control, with the established 0.75× model.

## Listening controls and teacher transcripts

- Label every multiple-choice option visibly A, B, C (and D when applicable); do not rely only on radio-button values. Keep the entire labelled answer clickable, and identify the correct letter in feedback.
- Put the Teacher transcript control next to the audio player, following the authenticated transcript pattern used by other course listenings. Validate teacher/admin access on the server using this course's grade roles; hiding public transcript markup is not access control.
- Keep the full transcript out of student-facing static HTML/JS/data. Clear it on sign-out or account change and ignore stale authorization responses. Verify anonymous/student denial and teacher/admin access, including mobile layout. Preserve any explicit accessibility accommodation requested for a particular activity.
