import fs from 'node:fs';
import path from 'node:path';

const page = 'ingles/intermediate-2/unit-3-technology-digital-safety.html';
const html = fs.readFileSync(page, 'utf8');
const audioReferences = [...html.matchAll(/audio\/unit-3-explanation\/([^" ]+\.mp3)/g)].map((match) => match[1]);
const uniqueAudios = [...new Set(audioReferences)];
const missingAudios = uniqueAudios.filter((name) => !fs.existsSync(path.join('ingles', 'intermediate-2', 'audio', 'unit-3-explanation', name)));
const result = {
  topics: (html.match(/class="ie2-theory-topic ie2-search-item"/g) || []).length,
  checks: (html.match(/class="ie2-unit3-check"/g) || []).length,
  audioReferences: audioReferences.length,
  uniqueAudios: uniqueAudios.length,
  missingAudios,
  courseOverviewLinked: fs.readFileSync('ingles/intermediate-2/course-overview.html', 'utf8').includes('./unit-3-technology-digital-safety.html'),
  noMalformedCss: !/^\+/m.test(fs.readFileSync('assets/css/english-intermediate-2.css', 'utf8')),
  feedbackLogic: fs.readFileSync('assets/js/english-intermediate2-unit3-explanation.js', 'utf8').includes('private and has no score')
};

if (result.topics !== 9 || result.checks !== 8 || result.audioReferences !== 9 || result.uniqueAudios !== 9 || result.missingAudios.length || !result.courseOverviewLinked || !result.noMalformedCss || !result.feedbackLogic) {
  throw new Error(`Unit 3 explanation validation failed: ${JSON.stringify(result)}`);
}
console.log(`PASS ${JSON.stringify(result)}`);
