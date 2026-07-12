"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const root = path.resolve(__dirname, "..");
const html = fs.readFileSync(path.join(root, "ingles", "basico", "final-oral-interview-mock.html"), "utf8");
const source = fs.readFileSync(path.join(root, "assets", "js", "english-basic-final-oral-mock.js"), "utf8");

class MockElement {
  constructor(id = "") {
    this.id = id;
    this.hidden = false;
    this.disabled = false;
    this.paused = true;
    this.ended = false;
    this.value = "";
    this.options = [];
    this.dataset = {};
    this.style = { width: "", setProperty() {} };
    this.className = "";
    this.classList = { toggle() {}, add() {}, remove() {} };
    this.listeners = new Map();
    this.childrenBySelector = new Map([
      ["i", { className: "" }],
      ["span", { textContent: "" }]
    ]);
    this.textContent = "";
    this.innerHTML = "";
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
  play() { this.paused = false; this.dispatch("play"); return Promise.resolve(); }
  load() {}
  focus() {}
  scrollIntoView() {}
  removeAttribute(name) { if (name === "src") this.src = ""; }
}

const ids = [...html.matchAll(/id="([^"]+)"/g)].map((match) => match[1]);
const elements = new Map(ids.map((id) => [id, new MockElement(id)]));
const speedSlow = new MockElement("speedSlow");
speedSlow.dataset.speed = "0.75";
const speedNormal = new MockElement("speedNormal");
speedNormal.dataset.speed = "1";
const speedButtons = [speedSlow, speedNormal];

global.document = {
  getElementById(id) { return elements.get(id) || null; },
  querySelectorAll(selector) { return selector === "[data-speed]" ? speedButtons : []; }
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
  setItem(key, value) { this.values.set(key, value); }
};

vm.runInThisContext(source, { filename: "english-basic-final-oral-mock.js" });

const start = elements.get("startInterviewButton");
assert.equal(start.listeners.has("click"), true, "Start button must be wired");

(async () => {
  await start.dispatch("click");
  assert.equal(elements.get("onboardingPanel").hidden, true, "Onboarding should close");
  assert.equal(elements.get("interviewPanel").hidden, false, "Interview should open");
  assert.equal(elements.get("questionCounter").textContent, "Question 1 of 7");
  assert.match(elements.get("interviewerAudio").src, /question-0[1-3]\.mp3$/);
  assert.equal(elements.get("answerSupport").hidden, false, "First practice must show answer support");
  assert.equal(elements.get("vocabularyBank").innerHTML.length > 0, true, "Every question should provide vocabulary");
  assert.equal(elements.get("grammarClue").textContent.length > 0, true, "Every question should provide a grammar clue");

  await speedSlow.dispatch("click");
  assert.equal(elements.get("interviewerAudio").playbackRate, 0.75, "Slow speed should be available");
  assert.equal(elements.get("nextQuestionButton").disabled, true, "A student cannot continue before transcription");
  assert.equal(elements.get("weakPracticeButton").listeners.has("click"), true, "The weakest-question practice button must be wired");

  const hooks = global.__JaraOralMockTest;
  assert.equal(hooks.QUESTIONS.length, 15, "The interview bank should contain fifteen questions");
  assert.equal(new Set(hooks.QUESTIONS.map((question) => question.audio)).size, 15, "Every question should use a different audio file");
  hooks.QUESTIONS.forEach((question) => {
    assert.equal(question.frames.length, 2, `${question.id} should provide two answer structures`);
    assert.equal(question.vocabulary.length >= 6, true, `${question.id} should provide useful vocabulary`);
    assert.equal(Boolean(question.grammar), true, `${question.id} should provide a grammar clue`);
    assert.equal(question.checks.length >= 2, true, `${question.id} should have question-specific feedback rules`);
  });
  for (let attempt = 0; attempt < 30; attempt += 1) {
    const selected = hooks.chooseQuestionIds();
    assert.equal(selected.length, 7, "Each complete attempt should select seven questions");
    assert.equal(new Set(selected).size, 7, "Questions cannot repeat in one attempt");
    assert.equal(hooks.QUESTIONS.find((question) => question.id === selected[0]).unit, 1, "The warm-up should come from Unit 1");
    const representedUnits = new Set(selected.map((id) => hooks.QUESTIONS.find((question) => question.id === id).unit));
    assert.equal(representedUnits.size, 6, "Every complete attempt should represent all six units");
  }
  const adaptiveSelection = hooks.chooseQuestionIds({ unitScores: { 1: 88, 2: 82, 3: 79, 4: 55, 5: 84, 6: 80 } });
  assert.equal(adaptiveSelection.filter((id) => hooks.QUESTIONS.find((question) => question.id === id).unit === 4).length, 2, "The bonus question should reinforce the weakest unit");
  const backpackQuestion = hooks.QUESTIONS.find((question) => question.id === "u2q1");
  const oneObject = hooks.analyzeAnswer("In my backpack I have a notebook.", 6000, [], backpackQuestion);
  assert.equal(oneObject.targetChecks[1].met, false, "A two-object question should not pass with only one object");

  const questionIds = ["u1q1", "u2q1", "u3q1", "u4q1", "u5q1", "u6q1", "u6q3"];
  const samples = [
    "My name is Laura and I'm from Medellin.",
    "In my backpack I have a notebook and a laptop.",
    "My sister is friendly and she likes to cook.",
    "I usually get up at six in the morning. Then I have breakfast.",
    "In my free time I like to listen to music.",
    "In my neighborhood there is a park near my house and a library next to the school.",
    "The library is next to the school. Go straight and turn left."
  ];
  const answers = samples.map((transcript, index) => {
    const words = transcript.split(/\s+/).map((text, wordIndex) => ({ text, probability: index === 0 && wordIndex === 4 ? 0.42 : 0.91 }));
    const question = hooks.QUESTIONS.find((item) => item.id === questionIds[index]);
    return { questionId: question.id, transcript, durationMs: 8000, whisperWords: words, analysis: hooks.analyzeAnswer(transcript, 8000, words, question) };
  });
  const report = hooks.buildReport(answers, [], questionIds);
  assert.equal(report.score > 70, true, "Complete sample answers should produce a useful readiness result");
  assert.equal(report.metrics.task, 100, "All task targets should be detected");
  assert.equal(report.unclearWords.length > 0, true, "Low-confidence words should appear in clarity practice");
  assert.equal(Object.keys(report.unitScores).length, 6, "The report should calculate results for all six units");
  assert.equal(report.weakestQuestionIds.length, 2, "The report should identify two weak questions");
  assert.equal(report.attemptNumber, 1, "The first report should be attempt one");
  const secondReport = hooks.buildReport(answers, [{ score: report.score - 5, completedAt: new Date().toISOString() }], questionIds);
  assert.equal(secondReport.change, 5, "A later attempt should compare with the previous result");
  assert.equal(secondReport.attemptNumber, 2, "History should increment the attempt number");
  const targetedReport = hooks.buildReport(answers.slice(0, 2), [{ score: report.score, completedAt: new Date().toISOString() }], questionIds.slice(0, 2), true);
  assert.equal(targetedReport.targeted, true, "Weak-question practice should be marked as targeted");
  assert.match(targetedReport.comparison, /does not replace/i, "Targeted practice must not alter full interview history");
  console.log("Final oral mock smoke test passed.");
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
