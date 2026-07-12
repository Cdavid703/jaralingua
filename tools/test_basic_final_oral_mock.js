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
  assert.equal(elements.get("questionCounter").textContent, "Question 1 of 5");
  assert.match(elements.get("questionText").textContent, /name/i);
  assert.match(elements.get("interviewerAudio").src, /question-1\.mp3$/);
  assert.equal(elements.get("answerSupport").hidden, false, "First practice must show answer support");

  await speedSlow.dispatch("click");
  assert.equal(elements.get("interviewerAudio").playbackRate, 0.75, "Slow speed should be available");
  assert.equal(elements.get("nextQuestionButton").disabled, true, "A student cannot continue before transcription");
  console.log("Final oral mock smoke test passed.");
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
