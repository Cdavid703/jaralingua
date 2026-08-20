import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const pageDir = path.join(root, "ingles", "basico-2");
const pages = fs.readdirSync(pageDir).filter((file) => file.endsWith(".html")).sort();

const mainCss = fs.readFileSync(path.join(root, "assets", "css", "english-basic-2.css"), "utf8");
const pronunciationCss = fs.readFileSync(path.join(root, "assets", "css", "english-basic-pronunciation.css"), "utf8");
const coachCss = fs.readFileSync(path.join(root, "assets", "css", "english-basic2-conversation-coach.css"), "utf8");
const standard = fs.readFileSync(path.join(root, "docs", "basic-english-2-page-activity-standard.md"), "utf8");

assert.ok(pages.length >= 29, "The Basic 2 full-width audit must cover every published Basic 2 page.");

assert.match(mainCss, /Shared application-width standard for Basic English Course 2/);
assert.match(mainCss, /--basic2-app-max:\s*1760px/);
assert.match(mainCss, /repeat\(auto-fit, minmax\(min\(100%, 250px\), 1fr\)\)/);
assert.match(mainCss, /\.basic2-page :is\(\.premium-lesson-container, \.lesson-outcome, \.quick-access-panel, \.basic-intro-section, \.course-dashboard/);
assert.match(mainCss, /\.basic2-page\.hangman-page :is\(\.container, \.games-section > \.container\)/);
assert.match(pronunciationCss, /Shared application-width standard for Basic English Course 2 pronunciation pages/);
assert.match(pronunciationCss, /\.pronunciation-main\{width:min\(1760px,calc\(100% - 2rem\)\);max-width:none/);
assert.match(coachCss, /Shared application-width standard for Basic English Course 2 conversation coach pages/);
assert.match(standard, /pantalla aprovechada de Intermediate English Course 2/);
assert.match(standard, /no significa estirar cada parrafo/);

const version = "20260820-basic2-full-width-compact";
const mainCssPages = [
  "index.html",
  "games.html",
  "course-overview.html",
  "practice-lab.html",
  "listening-library.html",
  "idioms-phrasal-verbs.html",
  "evaluations.html",
  "unit-1-going-out.html",
  "unit-2-shopping-experiences.html",
  "unit-3-around-the-world.html",
  "practice-unit-1-weather-callout-cards.html",
  "practice-unit-1-ing-spelling-rules.html",
  "practice-unit-1-simple-present-vs-present-continuous.html",
  "practice-unit-1-weather-action-roulette.html",
  "practice-unit-2-shopping-memory.html",
  "practice-unit-2-shopping-demonstratives.html",
  "practice-unit-2-how-much-is-it.html",
  "practice-unit-2-store-role-play.html",
  "audio-listening-unit-1-weather-plan-change.html",
  "audio-listening-unit-2-concert-entrance.html",
  "video-listening-unit-1-weather-going-out.html",
  "reading-unit-1-rainy-afternoon-plan.html",
  "reading-unit-2-jacket-for-the-concert.html",
  "game-impostor.html",
  "game-hangman.html"
];

for (const page of mainCssPages) {
  const markup = fs.readFileSync(path.join(pageDir, page), "utf8");
  assert.match(markup, new RegExp(`english-basic-2\\.css\\?v=${version}`), `${page} must load the shared Basic 2 compact full-width CSS version.`);
}

for (const page of ["pronunciation-unit-1-weather-going-out.html", "pronunciation-unit-2-shopping-concert.html"]) {
  const markup = fs.readFileSync(path.join(pageDir, page), "utf8");
  assert.match(markup, new RegExp(`english-basic-pronunciation\\.css\\?v=${version}`), `${page} must load the full-width pronunciation CSS version.`);
}

for (const page of ["conversation-coach-unit-1-weather-going-out.html", "conversation-coach-unit-2-shopping-ella.html"]) {
  const markup = fs.readFileSync(path.join(pageDir, page), "utf8");
  assert.match(markup, new RegExp(`english-basic2-conversation-coach\\.css\\?v=${version}`), `${page} must load the full-width coach CSS version.`);
}

const index = fs.readFileSync(path.join(pageDir, "index.html"), "utf8");
const games = fs.readFileSync(path.join(pageDir, "games.html"), "utf8");
const hangman = fs.readFileSync(path.join(pageDir, "game-hangman.html"), "utf8");
assert.match(index, /english-basic-2\.css/, "The Basic 2 home must load the Basic 2 layout layer.");
assert.match(games, /english-basic-2\.css/, "The Basic 2 games page must load the Basic 2 layout layer.");
assert.match(hangman, /basic2-page/, "Basic 2 Hangman must opt into the Basic 2 layout layer.");

const grades = fs.readFileSync(path.join(pageDir, "notas.html"), "utf8");
assert.match(grades, /\.grades-shell\s*\{\s*width:\s*min\(1760px, calc\(100% - 1rem\)\)/, "Basic 2 grades must use the expanded gradebook width.");

console.log("Basic 2 full-width compact-layout contract passed.");
