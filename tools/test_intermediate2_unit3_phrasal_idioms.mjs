import fs from 'node:fs';
import path from 'node:path';

const html = fs.readFileSync('ingles/intermediate-2/unit-3-technology-digital-safety.html', 'utf8');
const css = fs.readFileSync('assets/css/english-intermediate-2.css', 'utf8');
const js = fs.readFileSync('assets/js/english-intermediate2-unit3-explanation.js', 'utf8');
const scripts = fs.readFileSync('ingles/intermediate-2/audio/unit-3-explanation/scripts.md', 'utf8');
const guide = fs.readFileSync('docs/guia-construccion-ingles-intermedio-2.md', 'utf8');
const folder = path.join('ingles', 'intermediate-2', 'audio', 'unit-3-explanation', 'phrasal-verbs-and-idioms');
const names = ['hook-up', 'look-up', 'pick-up', 'put-off', 'turn-down', 'take-apart'];
const idioms = ['up-and-running', 'at-the-touch-of-a-button', 'not-rocket-science'];
const audioFiles = [...names, ...idioms].map((name) => path.join(folder, `${name}.mp3`));

const section = html.match(/<details[\s\S]*?id="phrasal-verbs"[\s\S]*?<\/details>/)?.[0] || '';
const result = {
  hasDefinition: section.includes('What is a phrasal verb?') && section.includes('main verb with a'),
  hasCategoryComparison: ['Phrasal verb', 'Fixed expression', 'Idiom'].every((label) => section.includes(label)),
  allPhrasals: names.every((name) => section.includes(`<h3>${name.replaceAll('-', ' ')}</h3>`)),
  allIdioms: ['up and running', 'at the touch of a button', 'not rocket science'].every((name) => section.includes(`<h3>${name}</h3>`)),
  cards: (section.match(/class="ie2-unit3-expression-card/g) || []).length,
  audioButtons: (section.match(/data-expression-audio=/g) || []).length,
  audioFilesReady: audioFiles.every((file) => fs.existsSync(file) && fs.statSync(file).size > 1000),
  noLegacyCombinedAudio: !section.includes('technology-phrasal-verbs.mp3'),
  twoColumnWideCards: css.includes('.ie2-unit3-expression-grid,') && css.includes('grid-template-columns: repeat(2, minmax(0, 1fr))'),
  mobileSingleColumn: css.includes('grid-template-columns: minmax(0, 1fr);'),
  playbackRates: js.includes('audio.playbackRate') && js.includes("aria-pressed"),
  scriptsMapped: scripts.includes('Individual phrasal-verb and idiom pronunciation models'),
  guideMapped: guide.includes('Patrón obligatorio para phrasal verbs e idioms'),
  noStrayPlusLine: !/^\s*\+\s*$/m.test(html)
};

if (!Object.values(result).every(Boolean) || result.cards !== 9 || result.audioButtons !== 18) {
  throw new Error(`Unit 3 phrasal verbs and idioms validation failed: ${JSON.stringify(result)}`);
}
console.log(`PASS ${JSON.stringify(result)}`);
