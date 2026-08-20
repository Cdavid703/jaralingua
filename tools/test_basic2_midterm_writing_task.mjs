import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const assert = (condition, message) => {
  if (!condition) {
    throw new Error(message);
  }
};

const page = read('ingles/basico-2/basic-course-2-midterm-writing-task.html');
const evaluations = read('ingles/basico-2/evaluations.html');
const js = read('assets/js/basic2-midterm-writing-task.js');
const server = read('server/progress_api.py');

assert(page.includes('COURSE: Basic Course 2- PP – MIDTERM WRITING TASK (20%)'), 'Official Basic 2 midterm title is missing.');
assert(page.includes('itm-integrated-task-header.jpg'), 'Institutional ITM header is missing.');
assert(page.includes('itm-integrated-task-footer.jpg'), 'Institutional ITM footer is missing.');
assert(page.includes('itm-logo-oficial.jpg'), 'Official ITM logo is missing.');
assert(page.includes('itm-plurilingue-logo.svg'), 'ITM Plurilingüe logo is missing.');
assert(page.includes('id="adminPanel"'), 'Teacher/admin panel is missing.');
assert(page.includes('id="activateWritingButton"'), 'Activation button is missing.');
assert(!/writing-hero\s*\{[^}]*position\s*:\s*fixed/i.test(page), 'Hero must not be fixed in the page.');
assert(page.includes('.exam-topbar{position:relative!important;top:auto!important'), 'Official exam topbar must scroll with the exam content.');
assert(page.includes('20260820-submit-hardening-v1'), 'Official exam page must load the hardened submission JS version.');
assert(page.includes('width:min(1760px,calc(100% - 2rem));max-width:none'), 'Official exam must use wide fluid desktop containers.');
assert(page.includes('#writingForm{grid-template-columns:minmax(0,1fr) minmax(300px,360px)}'), 'Official exam form must prioritize the writing area on large screens.');

assert(evaluations.includes('basic-course-2-midterm-writing-task.html'), 'Official exam is not linked from Basic 2 evaluations.');
assert(evaluations.includes('Official / Teacher activation'), 'Evaluations page must show teacher activation status.');

assert(js.includes('/api/basic2/midterm-writing/state'), 'JS state endpoint is missing.');
assert(js.includes('/api/basic2/midterm-writing/submit'), 'JS submit endpoint is missing.');
assert(js.includes('AbortController'), 'Submission/request timeout protection is missing.');
assert(js.includes('clientSubmissionId'), 'Client idempotency token is missing.');
assert(js.includes('localDraft'), 'Local emergency draft is missing.');
assert(js.includes('submitInFlight'), 'Double-submit guard is missing.');
assert(js.includes('finally{if(!delivered){setSubmitBusy(false);refreshSubmitAvailability()}}'), 'Submit button recovery guard is missing.');
assert(js.includes('Your text is preserved locally'), 'Student-facing retry message is missing.');
assert(js.includes('Write at least 100 words'), 'Minimum word feedback is missing.');

assert(server.includes('BASIC2_MIDTERM_WRITING_EVALUATION_ID = "basic2MidtermWritingTask20"'), 'Basic 2 midterm evaluation id is missing.');
assert(server.includes('BASIC2_MIDTERM_WRITING_EVALUATION'), 'Basic 2 midterm evaluation template is missing.');
assert(server.includes('"isOpen": False'), 'Exam must be closed by default in backend defaults.');
assert(server.includes('"/api/basic2/midterm-writing/state"'), 'Backend state route is missing.');
assert(server.includes('"/api/basic2/midterm-writing/submit"'), 'Backend submit route is missing.');
assert(server.includes('minimum_words_required'), 'Backend minimum word validation is missing.');
assert(server.includes('idempotency_key'), 'Backend idempotency handling is missing.');
assert(server.includes('not in ("admin", "teacher")'), 'Teacher activation permission is missing.');

console.log('Basic 2 official midterm writing task checks passed.');
