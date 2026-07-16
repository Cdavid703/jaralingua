"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const root = path.resolve(__dirname, "..");
const htmlPath = path.join(root, "ingles", "basico", "final-oral-interview-mock.html");
const jsPath = path.join(root, "assets", "js", "english-basic-final-oral-task-mock.js");
const audioRoot = path.join(root, "ingles", "basico", "audio", "final-oral-task-mock");
const html = fs.readFileSync(htmlPath, "utf8");
const source = fs.readFileSync(jsPath, "utf8");
const css = fs.readFileSync(path.join(root, "assets", "css", "english-basic-final-oral-task-mock.css"), "utf8");

class MockClassList {
  constructor() { this.values = new Set(); }
  toggle(name, force) {
    if (force === undefined) force = !this.values.has(name);
    if (force) this.values.add(name); else this.values.delete(name);
    return force;
  }
  add(name) { this.values.add(name); }
  remove(name) { this.values.delete(name); }
  contains(name) { return this.values.has(name); }
}

class MockElement {
  constructor(id = "") {
    this.id = id;
    this.hidden = false;
    this.disabled = false;
    this.paused = true;
    this.ended = false;
    this.checked = false;
    this.value = "";
    this.options = [];
    this.dataset = {};
    this.style = { width: "", setProperty() {} };
    this.className = "";
    this.classList = new MockClassList();
    this.listeners = new Map();
    this.childrenBySelector = new Map([
      ["i", { className: "" }],
      ["span", { textContent: "" }]
    ]);
    this.textContent = "";
    this.innerHTML = "";
    this.src = "";
    this.playbackRate = 1;
    this.currentTime = 0;
  }

  addEventListener(name, handler) {
    if (!this.listeners.has(name)) this.listeners.set(name, []);
    this.listeners.get(name).push(handler);
  }

  dispatch(name) {
    return Promise.all((this.listeners.get(name) || []).map((handler) => handler({ target: this })));
  }

  querySelector(selector) { return this.childrenBySelector.get(selector) || new MockElement(); }
  querySelectorAll() { return []; }
  pause() { this.paused = true; this.dispatch("pause"); }
  play() { this.paused = false; this.ended = false; this.dispatch("play"); return Promise.resolve(); }
  load() {}
  focus() {}
  scrollIntoView() {}
  removeAttribute(name) { if (name === "src") this.src = ""; }
}

const ids = [...html.matchAll(/id="([^"]+)"/g)].map((match) => match[1]);
const duplicateIds = ids.filter((id, index) => ids.indexOf(id) !== index);
assert.deepEqual(duplicateIds, [], "The official mock must not contain duplicate element IDs");

const elements = new Map(ids.map((id) => [id, new MockElement(id)]));
elements.get("guidedMode").checked = true;
elements.get("realisticMode").checked = false;

const speedButtons = [...html.matchAll(/data-(?:global-)?speed="([^"]+)"/g)].map((match, index) => {
  const button = new MockElement(`speed-${index}`);
  if (html.slice(Math.max(0, match.index - 40), match.index + 30).includes("global-speed")) button.dataset.globalSpeed = match[1];
  else button.dataset.speed = match[1];
  return button;
});

const places = ["park", "school", "supermarket", "home", "restaurant", "library", "church"];
const mapLabels = places.map((place) => { const label = new MockElement(`map-${place}`); label.dataset.place = place; return label; });
const guidedCard = new MockElement("guided-card");
guidedCard.childrenBySelector.set("input", elements.get("guidedMode"));
const realisticCard = new MockElement("realistic-card");
realisticCard.childrenBySelector.set("input", elements.get("realisticMode"));

global.document = {
  hidden: false,
  listeners: new Map(),
  getElementById(id) { return elements.get(id) || null; },
  querySelectorAll(selector) {
    if (selector === "[data-speed], [data-global-speed]") return speedButtons;
    if (selector === ".map-label") return mapLabels;
    if (selector === ".practice-mode-card") return [guidedCard, realisticCard];
    return [];
  },
  addEventListener(name, handler) { this.listeners.set(name, handler); }
};
global.window = global;
global.window.isSecureContext = true;
global.window.addEventListener = () => {};
global.window.__JARA_ORAL_MOCK_TEST__ = true;
global.location = { protocol: "http:" };
Object.defineProperty(global, "navigator", { value: {}, configurable: true });
global.localStorage = {
  values: new Map(),
  getItem(key) { return this.values.has(key) ? this.values.get(key) : null; },
  setItem(key, value) { this.values.set(key, value); },
  removeItem(key) { this.values.delete(key); }
};

assert.match(html, /itm-final-oral-task-header\.jpg/, "The exact Final Oral Task institutional header must be present");
assert.match(html, /itm-integrated-task-footer\.jpg/, "The exact institutional footer must be present");
assert.match(html, /My Neighborhood/, "The official topic must be visible");
assert.match(html, /No teacher submission/i, "The page must state that nothing is sent to the teacher");
assert.match(html, /class="question-navigation" hidden/, "The normal conversation must not require a Continue button");
assert.match(html, /id="floatingNextButton"[^>]+hidden/, "The floating Continue control must remain hidden in the automatic flow");
assert.deepEqual([...new Set(speedButtons.map((button) => Number(button.dataset.speed || button.dataset.globalSpeed)))].sort(), [0.75, 1], "Only 0.75x and 1x may be available");
assert.equal(/data-(?:global-)?speed="(?:1\.25|1\.5|2)"/.test(html), false, "No faster playback control may exist");
assert.equal(source.includes("/api/french8/pronunciation-assessment"), false, "The English mock must never use the French pronunciation endpoint");
assert.match(source, /\/api\/english-basic\/pronunciation-assessment/, "The English pronunciation endpoint must be used");
assert.equal(/\/api\/(?:activity|.*grade|.*submit)/i.test(source), false, "The mock must not call Grades or submission endpoints");
assert.match(css, /@media \(max-width: 1060px\)/, "The layout must include a tablet breakpoint");
assert.match(css, /@media \(max-width: 760px\)/, "The layout must include a phone/tablet breakpoint");
assert.match(css, /@media \(max-width: 520px\)/, "The layout must include a narrow-phone breakpoint");
assert.match(css, /prefers-reduced-motion: reduce/, "Motion must respect the user's accessibility preference");
assert.match(css, /\.floating-mic-dock\s*\{[\s\S]*?position:\s*fixed/, "The answer dock must remain reachable while the student reads the question");
assert.match(css, /safe-area-inset-bottom/, "The floating microphone must respect the iPhone safe area");

const referencedMp3 = [...source.matchAll(/"([a-z0-9-]+\.mp3)"/g)].map((match) => match[1]);
referencedMp3.forEach((fileName) => assert.ok(fs.existsSync(path.join(audioRoot, fileName)), `Missing referenced ElevenLabs audio: ${fileName}`));
const generatedMp3 = fs.readdirSync(audioRoot).filter((fileName) => fileName.endsWith(".mp3"));
assert.equal(generatedMp3.length, 40, "The professional ElevenLabs package must contain 40 MP3 clips");
generatedMp3.forEach((fileName) => {
  const bytes = fs.readFileSync(path.join(audioRoot, fileName));
  const hasId3 = bytes.subarray(0, 3).toString("ascii") === "ID3";
  const hasFrameSync = bytes[0] === 0xff && (bytes[1] & 0xe0) === 0xe0;
  assert.ok(bytes.length > 1024 && (hasId3 || hasFrameSync), `Invalid MP3 file: ${fileName}`);
});

for (const match of html.matchAll(/(?:src|href)="([^"]+)"/g)) {
  const reference = decodeURIComponent(match[1].split(/[?#]/)[0]);
  if (!reference || reference.startsWith("#") || /^https?:/i.test(reference)) continue;
  const resolved = reference.startsWith("/") ? path.join(root, reference.slice(1)) : path.resolve(path.dirname(htmlPath), reference);
  assert.ok(fs.existsSync(resolved), `Missing local page asset: ${reference}`);
}

vm.runInThisContext(source, { filename: "english-basic-final-oral-task-mock.js" });

const hooks = global.__JaraFinalOralTaskMockTest;
assert.ok(hooks, "The official mock test hooks must be exposed");
assert.equal(hooks.QUESTIONS.length, 8, "The conversation must contain eight student turns");
assert.equal(hooks.QUESTIONS.filter((question) => question.assessed !== false).length, 7, "The opening warm-up must be excluded from the seven assessed turns");
assert.equal(hooks.QUESTIONS.filter((question) => question.interaction).length, 2, "The student must ask Emma two questions");
assert.equal(hooks.REPORT_CRITERIA.length, 5, "The report must use the five official criteria");
hooks.QUESTIONS.forEach((question) => {
  assert.equal(question.frames.length, 2, `${question.id} must provide two guided answer structures`);
  assert.ok(question.vocabulary.length >= 5, `${question.id} must provide contextual vocabulary`);
  assert.ok(question.grammar, `${question.id} must provide a grammar clue`);
  assert.ok(fs.existsSync(path.join(audioRoot, question.audio)), `Missing ElevenLabs question audio: ${question.audio}`);
});

(async () => {
  await elements.get("startInterviewButton").dispatch("click");
  assert.equal(elements.get("onboardingPanel").hidden, true, "Onboarding should close when the mock starts");
  assert.equal(elements.get("interviewPanel").hidden, false, "The conversation panel should open");
  assert.equal(elements.get("questionCounter").textContent, "Turn 1 of 8");
  assert.match(elements.get("interviewerAudio").src, /turn-01-name-neighborhood\.mp3$/);
  assert.equal(elements.get("answerSupport").hidden, false, "Guided Rehearsal should show support");
  assert.equal(elements.get("floatingMicDock").hidden, false, "The floating microphone should appear before the lower recorder enters view");
  assert.equal(elements.get("floatingMicButton").listeners.has("click"), true, "The floating microphone must start the same recording flow");
  assert.equal(elements.get("floatingStopButton").listeners.has("click"), true, "The floating dock must be able to finish a recording");
  assert.equal(elements.get("floatingNextButton").listeners.has("click"), true, "The hidden recovery control should remain wired without appearing in the normal flow");
  assert.equal(mapLabels.find((label) => label.dataset.place === "home").classList.contains("is-active"), true, "The map should highlight the relevant place");

  const slowButton = speedButtons.find((button) => Number(button.dataset.speed || button.dataset.globalSpeed) === 0.75);
  await slowButton.dispatch("click");
  assert.equal(elements.get("interviewerAudio").playbackRate, 0.75, "Question audio must support 0.75x");
  assert.equal(elements.get("reactionAudio").playbackRate, 0.75, "Emma's responses must also support 0.75x");

  const flowState = hooks.getState();
  const openingTranscript = "My name is Laura and I live in the Laureles neighborhood.";
  const openingWords = openingTranscript.split(/\s+/).map((text) => ({ text, probability: 0.93 }));
  const openingAnswer = { questionId: hooks.QUESTIONS[0].id, transcript: openingTranscript, durationMs: 8000, whisperWords: openingWords, analysis: hooks.analyzeAnswer(openingTranscript, 8000, openingWords, hooks.QUESTIONS[0]) };
  flowState.answers[0] = openingAnswer;
  await hooks.playReaction(openingAnswer);
  await elements.get("reactionAudio").dispatch("ended");
  await new Promise((resolve) => setTimeout(resolve, 720));
  assert.equal(flowState.currentIndex, 1, "The next turn must open automatically after Emma finishes responding");
  assert.equal(elements.get("questionCounter").textContent, "Turn 2 of 8", "Automatic flow must render the next question without Continue");

  const samples = [
    "My name is Laura and I live in the Laureles neighborhood.",
    "My neighborhood is quiet. There is a park near my home and a library next to the school.",
    "Yes, there is a supermarket next to the bank. It is large and convenient.",
    "The park is across from the school. People can walk and relax there.",
    "There is a restaurant near the library. I recommend it because the food is delicious.",
    "Where is the library in your neighborhood?",
    "Do you like the park in your neighborhood?",
    "You should visit the park first because it is beautiful and people can relax there."
  ];
  const testState = hooks.getState();
  testState.questionIds = hooks.QUESTIONS.map((question) => question.id);
  testState.answers = samples.map((transcript, index) => {
    const words = transcript.split(/\s+/).map((text, wordIndex) => ({ text, probability: index === 2 && wordIndex === 6 ? 0.44 : 0.93 }));
    const question = hooks.QUESTIONS[index];
    return { questionId: question.id, transcript, durationMs: 9000, whisperWords: words, analysis: hooks.analyzeAnswer(transcript, 9000, words, question) };
  });
  const report = hooks.buildReport();
  assert.ok(report.score >= 38 && report.score <= 50, "Complete sample answers should produce a strong /50 formative result");
  assert.deepEqual(Object.keys(report.criteria).sort(), ["communication", "fluency", "interaction", "language", "pronunciation"], "All official criteria must be scored");
  assert.ok(report.unclearWords.length > 0, "Lower-confidence words should reach the pronunciation review");
  assert.match(hooks.responseFor(hooks.QUESTIONS[3], "The park is near my school").file, /reaction-park\.mp3/);
  assert.match(hooks.responseFor(hooks.QUESTIONS[5], "Where is the library?").file, /emma-answer-where-is\.mp3/);
  assert.equal(hooks.readinessLabel(46), "Very ready for the Final Oral Task");
  assert.equal(hooks.rubricBand(10), "Exemplary");
  assert.equal(hooks.rubricBand(7), "Fair");
  console.log("Final Oral Task Mock smoke test passed.");
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
