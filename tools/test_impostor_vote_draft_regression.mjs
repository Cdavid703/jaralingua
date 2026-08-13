import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

function read(relPath) {
  return fs.readFileSync(path.join(root, relPath), "utf8");
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function lastBlock(source, startNeedle, endNeedle) {
  const start = source.lastIndexOf(startNeedle);
  assert(start >= 0, `Missing block start: ${startNeedle}`);
  const end = source.indexOf(endNeedle, start + startNeedle.length);
  assert(end > start, `Missing block end after: ${startNeedle}`);
  return source.slice(start, end);
}

const scripts = [
  "assets/js/english-basic2-impostor.js",
  "assets/js/english-intermediate-unit4-impostor.js",
  "assets/js/french1-imposteur.js",
  "assets/js/french2-imposteur.js",
  "assets/js/french7-imposteur.js",
  "assets/js/french8-imposteur.js",
];

for (const relPath of scripts) {
  const source = read(relPath);
  assert(source.includes("var voteDraft = { round: 0, suspectId: \"\" };"), `${relPath}: missing voteDraft state`);
  assert(source.includes("function cleanPlayerId(value)"), `${relPath}: missing cleanPlayerId helper`);

  const renderVote = lastBlock(source, "function renderVote(payload) {", "function renderResult(payload)");
  assert(renderVote.includes("voteDraft.suspectId || savedSuspectId"), `${relPath}: renderVote must prefer the student's current draft over the saved vote`);
  assert(renderVote.includes("data-suspect-option"), `${relPath}: vote radios must use data-suspect-option`);
  assert(renderVote.includes("autocomplete=\"off\""), `${relPath}: vote radios/form must disable browser autocomplete`);
  assert(!renderVote.includes("return '<label><input type=\"radio\" name=\"suspect\""), `${relPath}: renderVote still uses the legacy fixed suspect radio group`);
  assert(!renderVote.includes("if (player.hasVoted)"), `${relPath}: renderVote must not hide the vote form after a saved vote`);

  const submitVote = lastBlock(source, "async function submitVote(event) {", "function bindEvents()");
  assert(submitVote.includes("input[data-suspect-option]:checked"), `${relPath}: submitVote must read the editable vote option`);
  assert(submitVote.includes("voteDraft = {"), `${relPath}: submitVote must save the draft before sending`);

  const bindEvents = source.slice(source.indexOf("function bindEvents()"));
  assert(bindEvents.includes("[data-suspect-option]"), `${relPath}: bindEvents must listen for vote option changes`);
}

const pages = [
  "ingles/basico-2/game-impostor.html",
  "ingles/intermediate/game-unit-4-family-impostor.html",
  "frances/Niveau 1/jeux/l-imposteur-a1.html",
  "frances/Niveau 2/jeux/l-imposteur-a2.html",
  "frances/Niveau 7/jeux/l-imposteur-b1.html",
  "frances/Niveau 8/ateliers/jeu-imposteur-ville-intelligente.html",
];

for (const relPath of pages) {
  const source = read(relPath);
  if (relPath.includes("basico-2")) {
    assert(source.includes("english-basic2-impostor.js"), `${relPath}: missing Basic English 2 impostor script`);
  } else {
    assert(source.includes("v=20260813-vote-draft"), `${relPath}: page must bust cache for the vote draft fix`);
  }
}

console.log("Impostor vote draft regression checks passed.");
