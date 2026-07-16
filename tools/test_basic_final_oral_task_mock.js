"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const root = path.resolve(__dirname, "..");
const htmlPath = path.join(root, "ingles", "basico", "final-oral-interview-mock.html");
const jsPath = path.join(root, "assets", "js", "english-basic-final-oral-task-mock.js");
const audioRoot = path.join(root, "ingles", "basico", "audio", "final-oral-task-mock");
const scriptsPath = path.join(audioRoot, "scripts.md");
const html = fs.readFileSync(htmlPath, "utf8");
const source = fs.readFileSync(jsPath, "utf8");
const css = fs.readFileSync(path.join(root, "assets", "css", "english-basic-final-oral-task-mock.css"), "utf8");
const audioScripts = fs.readFileSync(scriptsPath, "utf8");

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
    this.open = false;
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
const responsiveDisclosures = ["identityDisclosure", "taskDisclosure", "rubricDisclosure", "privacyDisclosure"].map((id) => elements.get(id));

global.document = {
  hidden: false,
  listeners: new Map(),
  getElementById(id) { return elements.get(id) || null; },
  querySelectorAll(selector) {
    if (selector === "[data-speed], [data-global-speed]") return speedButtons;
    if (selector === ".map-label") return mapLabels;
    if (selector === ".practice-mode-card") return [guidedCard, realisticCard];
    if (selector === "[data-responsive-disclosure]") return responsiveDisclosures;
    return [];
  },
  addEventListener(name, handler) { this.listeners.set(name, handler); }
};
global.window = global;
global.window.isSecureContext = true;
global.window.addEventListener = () => {};
global.window.matchMedia = () => ({ matches: true, addEventListener() {}, addListener() {} });
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
assert.match(html, /href="#oralMockApp"[^>]*>[\s\S]*?Start with Emma/, "Mobile learners need a direct, clearly named jump to Emma");
assert.match(html, /id="questionPlayButton"[\s\S]{0,350}id="nextQuestionButton"/, "Continue must sit immediately after Play Emma in the same control group");
assert.equal(html.includes('id="floatingNextButton"'), false, "Continue must not be duplicated inside the floating microphone dock");
assert.match(html, /id="answerFeedback"[^>]+aria-live="polite"/, "Turn feedback must be announced accessibly");
assert.equal((html.match(/data-responsive-disclosure/g) || []).length, 4, "The four long information areas must become responsive disclosures");
assert.match(html, /id="identityDisclosure"[\s\S]*Optional exam-day fields/, "Institutional information must have a compact mobile summary");
assert.match(html, /id="taskDisclosure"[\s\S]*4 steps · 2–3 minutes/, "Know the task must have a compact mobile summary");
assert.match(html, /id="rubricDisclosure"[\s\S]*5 criteria · 10 points each/, "The official rubric must have a compact mobile summary");
assert.match(html, /id="privacyDisclosure"[\s\S]*Temporary processing · never stored/, "Privacy must have a compact mobile summary");
assert.deepEqual([...new Set(speedButtons.map((button) => Number(button.dataset.speed || button.dataset.globalSpeed)))].sort(), [0.75, 1], "Only 0.75x and 1x may be available");
assert.equal(/data-(?:global-)?speed="(?:1\.25|1\.5|2)"/.test(html), false, "No faster playback control may exist");
assert.equal(source.includes("/api/french8/pronunciation-assessment"), false, "The English mock must never use the French pronunciation endpoint");
assert.match(source, /\/api\/english-basic\/pronunciation-assessment/, "The English pronunciation endpoint must be used");
assert.equal(/\/api\/(?:activity|.*grade|.*submit)/i.test(source), false, "The mock must not call Grades or submission endpoints");
assert.match(css, /@media \(max-width: 1060px\)/, "The layout must include a tablet breakpoint");
assert.match(css, /@media \(max-width: 980px\)[\s\S]*\.responsive-disclosure > summary/, "The four disclosures must compact on phones and tablets");
assert.match(css, /@media \(max-width: 760px\)/, "The layout must include a phone/tablet breakpoint");
assert.match(css, /@media \(max-width: 520px\)/, "The layout must include a narrow-phone breakpoint");
assert.match(css, /prefers-reduced-motion: reduce/, "Motion must respect the user's accessibility preference");
assert.match(css, /\.floating-mic-dock\s*\{[\s\S]*?position:\s*fixed/, "The answer dock must remain reachable while the student reads the question");
assert.match(css, /safe-area-inset-bottom/, "The floating microphone must respect the iPhone safe area");
assert.match(css, /\.final-task-hero-image img\s*\{[\s\S]*?height:\s*auto/, "The professional hero image must not retain its 1024px HTML height on mobile");
assert.match(css, /\.final-oral-task-page \.site-header \.nav-links\s*\{\s*display:\s*none !important/, "The redundant link grid must collapse on phones while Courses remains available");
assert.match(css, /\.final-task-interviewer-card \.interviewer-audio-controls\s*\{\s*grid-template-columns:\s*repeat\(2, minmax\(0, 1fr\)\)/, "Play Emma and Continue must remain side by side on phones and tablets");
assert.equal(/scheduleConversationAdvance|reactionAdvancesConversation|autoAdvanceTimer/.test(source), false, "No automatic turn-advance mechanism may remain");

const referencedMp3 = [...source.matchAll(/"([a-z0-9-]+\.mp3)"/g)].map((match) => match[1]);
referencedMp3.forEach((fileName) => assert.ok(fs.existsSync(path.join(audioRoot, fileName)), `Missing referenced ElevenLabs audio: ${fileName}`));
const generatedMp3 = fs.readdirSync(audioRoot).filter((fileName) => fileName.endsWith(".mp3"));
const scriptedMp3 = [...audioScripts.matchAll(/^File:\s+`([^`]+\.mp3)`\s*$/gm)].map((match) => match[1]);
const scriptedSpeech = new Map();
audioScripts.split(/\r?\n(?=##\s)/).forEach((section) => {
  const fileMatch = section.match(/^File:\s+`([^`]+\.mp3)`\s*$/m);
  if (!fileMatch) return;
  const spokenText = section.slice(fileMatch.index + fileMatch[0].length).split(/\r?\n/).map((line) => line.trim()).filter(Boolean).join(" ");
  scriptedSpeech.set(fileMatch[1], spokenText);
});
assert.equal(new Set(scriptedMp3).size, scriptedMp3.length, "The ElevenLabs production script must not contain duplicate file names");
assert.deepEqual(generatedMp3.sort(), [...scriptedMp3].sort(), "Every scripted ElevenLabs clip must exist and no unplanned MP3 may remain");
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
Object.values({ ...hooks.TURN_RESPONSES, ...hooks.STUDENT_QUESTION_RESPONSES }).forEach((response) => {
  assert.equal(scriptedSpeech.get(response.file), response.text, `Visible Emma text must exactly match the ElevenLabs script for ${response.file}`);
});
responsiveDisclosures.forEach((disclosure) => assert.equal(disclosure.open, false, `${disclosure.id} must start collapsed on a compact viewport`));
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
  hooks.renderTurnFeedback(openingAnswer);
  elements.get("interviewerAudio").paused = true;
  elements.get("interviewerAudio").ended = true;
  await hooks.playReaction(openingAnswer);
  assert.equal(elements.get("nextQuestionButton").disabled, true, "Continue must stay disabled while Emma is responding");
  elements.get("reactionAudio").paused = true;
  elements.get("reactionAudio").ended = true;
  await elements.get("reactionAudio").dispatch("ended");
  await new Promise((resolve) => setTimeout(resolve, 720));
  assert.equal(flowState.currentIndex, 0, "Emma's response must not advance before the learner reads the feedback");
  assert.equal(elements.get("answerFeedback").hidden, false, "Guided feedback must remain visible after Emma responds");
  assert.equal(elements.get("nextQuestionButton").disabled, false, "Continue must unlock after Emma finishes responding");
  assert.equal(elements.get("nextQuestionButton").classList.contains("is-ready"), true, "Continue must receive a clear ready state");
  await elements.get("nextQuestionButton").dispatch("click");
  assert.equal(flowState.currentIndex, 1, "The next turn must open only after the learner chooses Continue");
  assert.equal(elements.get("questionCounter").textContent, "Turn 2 of 8", "Continue must render the next Emma question");

  flowState.answers[1] = { questionId: hooks.QUESTIONS[1].id, transcript: "", durationMs: 5000, unavailable: true, analysis: null };
  elements.get("interviewerAudio").paused = true;
  elements.get("interviewerAudio").ended = true;
  elements.get("reactionAudio").paused = true;
  const recoveryPlayback = hooks.playRecoveryBridge();
  assert.equal(elements.get("nextQuestionButton").disabled, true, "Recovery must not expose Continue before Emma's bridge starts");
  await recoveryPlayback;
  assert.equal(elements.get("nextQuestionButton").disabled, true, "Continue must remain blocked while Emma's recovery message is playing");
  elements.get("reactionAudio").paused = true;
  elements.get("reactionAudio").ended = true;
  await elements.get("reactionAudio").dispatch("ended");
  assert.equal(elements.get("nextQuestionButton").disabled, false, "Continue must unlock after the recovery message ends");

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
  assert.equal(hooks.responseFor(hooks.QUESTIONS[0], "I'm David and I live in Robledo.").file, "response-opening.mp3", "The opening must acknowledge identity and residence, not call the neighborhood a place inside itself");
  assert.equal(hooks.responseFor(hooks.QUESTIONS[1], "There is a park and a school near my home.").file, "response-overview.mp3", "The overview must not choose an arbitrary place keyword");
  assert.equal(hooks.responseFor(hooks.QUESTIONS[2], "No, there isn't a supermarket near my home.").file, "response-no-supermarket.mp3", "A negative supermarket answer must receive a negative-aware response");
  assert.equal(hooks.responseFor(hooks.QUESTIONS[2], "There is no supermarket near my home.").file, "response-no-supermarket.mp3");
  assert.equal(hooks.responseFor(hooks.QUESTIONS[2], "There is a supermarket, but it isn't near my home.").file, "response-no-supermarket.mp3");
  assert.equal(hooks.responseFor(hooks.QUESTIONS[2], "The supermarket is far from my home.").file, "response-no-supermarket.mp3");
  assert.equal(hooks.responseFor(hooks.QUESTIONS[2], "There is a supermarket, but it is not nearby.").file, "response-no-supermarket.mp3");
  assert.equal(hooks.responseFor(hooks.QUESTIONS[2], "There are not any supermarkets near my home.").file, "response-no-supermarket.mp3");
  assert.equal(hooks.responseFor(hooks.QUESTIONS[2], "Yes, the supermarket is across from the park.").file, "reaction-supermarket.mp3", "The supermarket turn must stay focused on the supermarket even when another place is mentioned");
  assert.equal(hooks.responseFor(hooks.QUESTIONS[3], "The park is near my school. People can exercise there.").file, "response-park-or-school.mp3", "The park-or-school turn must acknowledge the requested evidence without inventing details");
  assert.equal(hooks.responseFor(hooks.QUESTIONS[4], "No, there is not a restaurant nearby.").file, "response-no-restaurant.mp3", "No nearby restaurant must receive an existence-aware response");
  assert.equal(hooks.responseFor(hooks.QUESTIONS[4], "There is a restaurant, but I don't recommend it.").file, "response-not-recommended.mp3", "A negative recommendation must not trigger a positive restaurant reaction");
  assert.equal(hooks.responseFor(hooks.QUESTIONS[4], "There is a restaurant, but I can't recommend it.").file, "response-not-recommended.mp3");
  assert.equal(hooks.responseFor(hooks.QUESTIONS[4], "No, I wouldn't. It is expensive.").file, "response-not-recommended.mp3");
  assert.equal(hooks.responseFor(hooks.QUESTIONS[4], "No, I don't.").file, "response-not-recommended.mp3");
  assert.equal(hooks.responseFor(hooks.QUESTIONS[4], "It is bad, so I prefer another restaurant.").file, "response-not-recommended.mp3");
  assert.equal(hooks.responseFor(hooks.QUESTIONS[5], "Where is the library?").file, "emma-answer-where-is.mp3");
  assert.equal(hooks.responseFor(hooks.QUESTIONS[5], "Where is the supermarket?").file, "emma-answer-where-is-other-place.mp3", "A supermarket location question must not receive the library answer");
  assert.equal(hooks.responseFor(hooks.QUESTIONS[5], "Where is Central Park?").file, "emma-answer-where-is-park.mp3", "Central Park must never be described as near itself");
  assert.equal(hooks.responseFor(hooks.QUESTIONS[5], "Where are the restaurants?").file, "emma-answer-where-are-other-places.mp3");
  assert.equal(hooks.responseFor(hooks.QUESTIONS[5], "Is there a hospital?").file, "emma-answer-is-there-other-place.mp3", "An existence question must preserve the requested entity");
  assert.equal(hooks.responseFor(hooks.QUESTIONS[5], "Is there a park?").file, "emma-answer-is-there-park.mp3");
  assert.equal(hooks.responseFor(hooks.QUESTIONS[5], "Is there an airport?").file, "emma-answer-unknown-place.mp3", "Emma must not invent places outside the supported neighborhood map");
  assert.equal(hooks.responseFor(hooks.QUESTIONS[5], "Is there a museum near the park?").file, "emma-answer-unknown-place.mp3", "A known reference point must not replace an unknown target place");
  assert.equal(hooks.responseFor(hooks.QUESTIONS[5], "Where is the airport near the bus stop?").file, "emma-answer-unknown-place.mp3");
  assert.equal(hooks.responseFor(hooks.QUESTIONS[5], "Is there a library, and what can people do there?").file, "emma-answer-library-exists-activities.mp3", "The guided compound model must receive a complete two-part answer");
  assert.equal(hooks.responseFor(hooks.QUESTIONS[5], "Where is the library, and what can people do there?").file, "emma-answer-library-location-activities.mp3");
  assert.equal(hooks.responseFor(hooks.QUESTIONS[5], "Is there a park, and what can people do there?").file, "emma-answer-park-exists-activities.mp3");
  assert.equal(hooks.responseFor(hooks.QUESTIONS[5], "Where is Central Park, and what can people do there?").file, "emma-answer-park-location-activities.mp3");
  assert.equal(hooks.responseFor(hooks.QUESTIONS[5], "Are there parks, and what can people do there?").file, "emma-answer-parks-exist-activities.mp3");
  assert.equal(hooks.responseFor(hooks.QUESTIONS[5], "Where are the restaurants, and what can people do there?").file, "emma-answer-places-location-activities.mp3");
  assert.equal(hooks.responseFor(hooks.QUESTIONS[6], "Are there any schools?").file, "emma-answer-are-there-other-places.mp3");
  assert.equal(hooks.responseFor(hooks.QUESTIONS[6], "What can people do at the restaurant?").file, "emma-answer-what-can-do-food.mp3");
  assert.equal(hooks.responseFor(hooks.QUESTIONS[6], "What can people do at the hospital?").file, "emma-answer-what-can-do-hospital.mp3");
  [
    ["What can people do at the supermarket?", "emma-answer-what-can-do-shopping.mp3"],
    ["What can people do at the library?", "emma-answer-what-can-do-study.mp3"],
    ["What can people do at the park?", "emma-answer-what-can-do-park.mp3"],
    ["What can people do at the bank?", "emma-answer-what-can-do-bank.mp3"],
    ["What can people do at the church?", "emma-answer-what-can-do-church.mp3"],
    ["What can people do at the bus stop?", "emma-answer-what-can-do-bus-stop.mp3"],
    ["What can people do at the gym?", "emma-answer-what-can-do-gym.mp3"],
    ["What can people do at the pharmacy?", "emma-answer-what-can-do-pharmacy.mp3"]
  ].forEach(([question, expectedFile]) => assert.equal(hooks.responseFor(hooks.QUESTIONS[6], question).file, expectedFile, `Wrong entity-aware activity response for: ${question}`));
  assert.equal(hooks.responseFor(hooks.QUESTIONS[6], "What do you do in your neighborhood?").file, "emma-answer-what-i-do-neighborhood.mp3");
  assert.equal(hooks.responseFor(hooks.QUESTIONS[6], "What do you do at the park?").file, "emma-answer-what-i-do-place.mp3");
  assert.equal(hooks.responseFor(hooks.QUESTIONS[6], "What can people do at the museum near the park?").file, "emma-answer-unknown-place.mp3");
  assert.equal(hooks.responseFor(hooks.QUESTIONS[6], "Do you like the cafe?").file, "emma-answer-do-you-like-place.mp3", "A place opinion must not be answered as a general neighborhood opinion");
  assert.equal(hooks.responseFor(hooks.QUESTIONS[6], "Do you recommend the restaurant?").file, "emma-answer-do-you-recommend-place.mp3");
  assert.equal(hooks.responseFor(hooks.QUESTIONS[6], "Which place do you recommend?").file, "emma-answer-favorite-place.mp3", "An open recommendation question must name Emma's favorite place");
  assert.equal(hooks.responseFor(hooks.QUESTIONS[6], "Which restaurant do you recommend?").file, "emma-answer-recommend-food-place.mp3");
  assert.equal(hooks.responseFor(hooks.QUESTIONS[6], "Can you recommend a restaurant?").file, "emma-answer-recommend-food-place.mp3");
  assert.equal(hooks.responseFor(hooks.QUESTIONS[6], "What is your favorite restaurant?").file, "emma-answer-favorite-food-place.mp3", "A favorite category question must name a matching place");
  assert.equal(hooks.responseFor(hooks.QUESTIONS[6], "Which cafe is your favorite?").file, "emma-answer-favorite-food-place.mp3");
  assert.equal(hooks.responseFor(hooks.QUESTIONS[6], "What is your neighborhood like?").file, "emma-answer-neighborhood-like.mp3");
  assert.equal(hooks.responseFor(hooks.QUESTIONS[6], "How far is the school?").file, "emma-answer-how-far.mp3");
  assert.equal(hooks.responseFor(hooks.QUESTIONS[6], "How far is the park from the library?").file, "emma-answer-distance-between-places.mp3");
  assert.equal(hooks.responseFor(hooks.QUESTIONS[6], "How far is the airport from your home?").file, "emma-answer-unknown-place.mp3");
  assert.equal(hooks.responseFor(hooks.QUESTIONS[6], "Where are the park and the library?").file, "emma-answer-where-park-library.mp3");
  assert.equal(hooks.responseFor(hooks.QUESTIONS[6], "Where is the library?", "Where is the library?").file, "emma-answer-different-question.mp3", "The second role-reversal turn must reject a repeated first question");
  assert.equal(hooks.responseFor(hooks.QUESTIONS[6], "Are there parks?", "Is there a park?").file, "emma-answer-different-question.mp3", "Singular and plural versions of the same question must count as repetition");
  assert.equal(hooks.responseFor(hooks.QUESTIONS[6], "Which place do you recommend?", "What is your favorite place?").file, "emma-answer-different-question.mp3", "Equivalent generic favorite questions must count as repetition");
  assert.equal(hooks.responseFor(hooks.QUESTIONS[6], "The park is beautiful.").file, "emma-answer-question-retry.mp3", "A statement in the role-reversal turn must not be praised as a question");
  assert.equal(hooks.responseFor(hooks.QUESTIONS[7], "You should visit the library first.").file, "response-final-recommendation.mp3");
  assert.equal(hooks.readinessLabel(46), "Very ready for the Final Oral Task");
  assert.equal(hooks.rubricBand(10), "Exemplary");
  assert.equal(hooks.rubricBand(7), "Fair");
  console.log("Final Oral Task Mock smoke test passed.");
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
