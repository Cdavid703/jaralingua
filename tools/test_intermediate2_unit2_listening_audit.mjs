import { readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

const root = process.cwd();
const pagePath = join(root, 'ingles', 'intermediate-2', 'listening-unit-2-the-call-before-midnight.html');
const scriptPath = join(root, 'assets', 'js', 'intermediate2-listening-call-before-midnight.js');
const stylePath = join(root, 'assets', 'css', 'english-intermediate-2.css');
const audioPath = join(root, 'ingles', 'intermediate-2', 'audio', 'unit-2', 'the-call-before-midnight.mp3');
const metadataPath = join(root, 'ingles', 'intermediate-2', 'audio', 'unit-2', 'the-call-before-midnight.elevenlabs.json');
const page = readFileSync(pagePath, 'utf8');
const script = readFileSync(scriptPath, 'utf8');
const styles = readFileSync(stylePath, 'utf8');
const metadata = JSON.parse(readFileSync(metadataPath, 'utf8'));
const answers = [...page.matchAll(/class="ie2-reading-question" data-answer="([abc])"/g)].map((match) => match[1]);

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

assert(answers.length === 10, `Expected 10 listening questions, found ${answers.length}.`);
assert(new Set(answers).size === 3, 'The answer key must use A, B and C.');
const answerCounts = Object.fromEntries(['a', 'b', 'c'].map((answer) => [answer, answers.filter((value) => value === answer).length]));
assert(Math.max(...Object.values(answerCounts)) - Math.min(...Object.values(answerCounts)) <= 1, 'Answer key distribution must stay balanced.');
for (let index = 0; index <= answers.length - 6; index += 1) {
  assert(answers.slice(index, index + 3).join('') !== answers.slice(index + 3, index + 6).join(''), 'Answer key contains a repeated three-answer pattern.');
}

assert(page.includes('Transcript support'), 'Transcript must be presented as support, not as a locked stage.');
assert(page.includes('whenever you need access support'), 'Transcript instructions must preserve access support.');
assert(page.includes('Listening self-check: 0 of 3 passes marked.'), 'Listening-pass state must be clearly self-reported.');
assert(script.includes('Listening self-check:'), 'JavaScript must preserve the honest listening self-check label.');
assert(page.includes('include one <em>would</em> idea, one <em>if</em> clause'), 'Speaking close must state its success checklist.');
assert(!page.includes('What does “at a crossroads” mean in this conversation?'), 'Idiom question must use the listening context, not a memorized definition.');
assert(!page.includes('After three listens'), 'Transcript copy must not imply an inaccessible hard gate.');
assert(statSync(audioPath).size === metadata.fileBytes, 'MP3 byte size does not match approved metadata.');
assert(metadata.durationSeconds === 83.52 && metadata.qualityStatus === 'approved', 'Approved audio metadata is incomplete.');
assert(styles.includes('@media (max-width: 900px)') && styles.includes('.ie2-midnight-listening-page .ie2-listen-pass-grid {\n    grid-template-columns: repeat(2, minmax(0, 1fr));'), 'Tablet listening-pass grid must use two columns.');

console.log(`Unit 2 listening audit check passed: ${answers.join('').toUpperCase()} (${JSON.stringify(answerCounts)}).`);
