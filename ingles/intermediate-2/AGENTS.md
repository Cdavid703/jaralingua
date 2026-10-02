# Required checks for Intermediate English Course 2 pages

Read `../../docs/english-intermediate2-page-standard.md` before creating or changing a page in this course.

Every new page, including official exams, must ship with its page-access QR:

- Load `/assets/js/page-qr-access.js`.
- Create the corresponding SVG under `/assets/img/page-qr/`, using the existing filename convention and the page's canonical production URL.
- Include the SVG in the deployment; adding the script alone is incomplete.
- Verify that the QR appears in the hero and opens its enlarged dialog on phones and computers.
- Run `node tools/test_intermediate2_page_contract.mjs` from the repository root. The check must cover the QR script and SVG for every course page.

Use the existing page template, shared authentication and QR component. The QR must not cover the title or controls. Linking to an exam does not authorize opening it: preserve its configured access state.
