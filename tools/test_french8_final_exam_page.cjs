#!/usr/bin/env node

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const pagePath = path.join(root, "frances", "Niveau 8", "examen-final.html");
const indexPath = path.join(root, "frances", "Niveau 8", "index.html");
const page = fs.readFileSync(pagePath, "utf8");
const index = fs.readFileSync(indexPath, "utf8");

assert.match(page, /<html lang="fr">/);
assert.match(page, /<meta name="viewport"/);
assert.match(page, /Aller à l’accès à l’examen/);
assert.match(page, /prefers-reduced-motion:reduce/);
assert.match(page, /@media\(max-width:900px\)/);
assert.match(page, /@media\(max-width:575px\)/);
assert.match(page, /min-height:4[6-9]px/);
assert.match(page, /examen-final-niveau8-ville-intelligente-hero-v1\.png/);
assert.match(page, /iue-header\.png/);
assert.match(page, /iue-footer\.png/);

for (const endpoint of [
  "/api/french8/final-exam/state",
  "/api/french8/final-exam/preflight",
  "/api/french8/final-exam/session",
  "/api/french8/final-exam/draft",
  "/api/french8/final-exam/audio",
  "/api/french8/final-exam/submit",
  "/api/french8/final-exam/monitor",
  "/api/french8/final-exam/analytics",
  "/api/french8/final-exam/simulation",
  "/api/french8/final-exam/events",
  "/api/french8/final-exam/health",
  "/api/french8/final-exam/audit",
  "/api/french8/final-exam/alerts/ack",
  "/api/french8/final-exam/audio-grant",
]) {
  assert.ok(page.includes(endpoint), `missing secure runtime endpoint: ${endpoint}`);
}

assert.match(page, /authenticatedFetch\(API\.audio[\s\S]*?"external"/);
assert.doesNotMatch(page, /(?<!authenticated)fetch\(API\.audio/);
assert.match(page, /API\.audioGrant[\s\S]*?purpose=[\s\S]*?examVersion=/);
assert.match(page, /audio\.src = parsedAudioUrl\.pathname \+ parsedAudioUrl\.search/);
assert.match(page, /rangeReady[\s\S]*?authenticatedFetch\(API\.audio/, "audio grant must retain the authenticated Blob compatibility fallback");

assert.match(page, /let runtimeMode = "student-gate"/);
assert.match(page, /let simulationMode = false/);
assert.match(page, /function startStaffSimulation\(\)/);
assert.match(page, /function finishStaffSimulation\(\)/);
assert.match(page, /SIMULATION PROFESSEUR/);
assert.match(page, /Aucune tentative, aucun brouillon et aucune note ne seront créés/);
assert.match(page, /API\.simulation\}\?variant=\$\{encodeURIComponent\(variant\)\}/);
const submitProcessor = page.match(/async function performSubmit\(autoSubmit = false\) \{([\s\S]*?)\n      \}\n\n      function renderSubmitted/);
assert.ok(submitProcessor, "could not isolate final submission processor");
assert.ok(submitProcessor[1].indexOf("if (simulationMode)") < submitProcessor[1].indexOf("request(API.submit"), "simulation must exit locally before the official submission request");
assert.match(page, /function saveDraft\(\) \{\s*if \(!examInProgress/);
assert.match(page, /async function saveServerDraft\(answers\) \{\s*if \(!examInProgress/);
assert.match(page, /async function recordSession[\s\S]*?if \(!examInProgress\) return null/);

assert.match(page, /authenticatedFetch\(API\.events/);
assert.match(page, /Accept: "text\/event-stream"/);
assert.match(page, /eventHeaders\["Last-Event-ID"\] = realtimeLastEventId/);
assert.match(page, /response\.body\.getReader\(\)/);
assert.match(page, /function parseSseFrame\(frame\)/);
assert.match(page, /function handleRealtimeEvent\(event\)/);
assert.match(page, /if \(realtimeConnected\) return;[\s\S]*?refreshMonitor\(\)/, "polling must remain a degraded-mode fallback");
assert.match(page, /data-realtime-status/);
const sseParserSource = page.match(/function parseSseFrame\(frame\) \{([\s\S]*?)\n      \}\n\n      function rememberRealtimeEventId/);
assert.ok(sseParserSource, "could not isolate authenticated SSE parser");
const parseSseFrame = new Function(`return function parseSseFrame(frame) {${sseParserSource[1]}\n}`)();
assert.deepStrictEqual(
  parseSseFrame('id: 42\nevent: attempt.progress\ndata: {"payload":{"studentId":"008","answeredCount":12}}'),
  { type: "attempt.progress", id: "42", data: { payload: { studentId: "008", answeredCount: 12 } } },
  "SSE parser must preserve event type, resume id and JSON payload",
);
assert.strictEqual(parseSseFrame(": heartbeat"), null, "SSE heartbeat comments must not become application events");

assert.match(page, /function loadOperationalHealth\(\)/);
assert.match(page, /function loadAuditEvents\(\)/);
assert.match(page, /\$\{API\.audit\}\?format=csv/);
assert.match(page, /request\(API\.alertsAck,[\s\S]*?requestId: createClientId\("f8-alert-ack"\)/);
assert.match(page, /\["database","SQLite"\]/);
assert.match(page, /data-health-check="\$\{key\}"/);
assert.match(page, /data-alert-list/);
assert.match(page, /data-audit-list/);

assert.match(page, /function stableClientSubmissionId\(\)/);
assert.match(page, /sessionStorage\.getItem\(key\)/);
assert.match(page, /sessionStorage\.setItem\(key, identifier\)/);
assert.match(page, /clientSubmissionId: stableClientSubmissionId\(\)/);
assert.match(page, /sessionStorage\.removeItem\(submissionIdStorageKey\(key\)\)/, "idempotency key must only be cleared with the confirmed attempt draft");

assert.match(page, /data-program-window/);
assert.match(page, /Ouvrir maintenant/);
assert.match(page, /Fermer maintenant/);
assert.match(page, /opensAt\.toISOString\(\)/);
assert.match(page, /closesAt\.toISOString\(\)/);
assert.match(page, /accessEffective/);
assert.match(page, /serverTime/);
assert.match(page, /question\.type === "truefalse"/);
assert.match(page, /section\.readingText\.map/);

assert.doesNotMatch(page, /<textarea\b/i);
assert.doesNotMatch(page, /contenteditable\s*=/i);
assert.doesNotMatch(page, /"answer"\s*:/);
assert.doesNotMatch(page, /data\/french8-final-exam/i);

const inlineScripts = [];
for (const match of page.matchAll(/<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/gi)) {
  if (match[1].trim()) inlineScripts.push(match[1]);
}
assert.ok(inlineScripts.length >= 2, "expected inline configuration and runtime scripts");
for (const script of inlineScripts) new Function(script);

assert.match(index, /href="examen-final\.html"/);
assert.match(index, /Examen final — Ville intelligente/);
assert.match(index, /50 questions fermées sur les thèmes 01 à 03/);

const refs = [];
for (const match of page.matchAll(/\b(?:src|href)="([^"]+)"/gi)) refs.push(match[1]);
refs.push("img/examen-final/examen-final-niveau8-ville-intelligente-hero-v1.png");
for (const rawRef of refs) {
  if (/^(?:https?:|#|mailto:|tel:|javascript:)/i.test(rawRef)) continue;
  const cleanRef = decodeURIComponent(rawRef.split(/[?#]/, 1)[0]);
  if (!cleanRef || cleanRef.startsWith("/api/")) continue;
  const resolved = cleanRef.startsWith("/")
    ? path.join(root, cleanRef.replace(/^\/+/, ""))
    : path.resolve(path.dirname(pagePath), cleanRef);
  assert.ok(fs.existsSync(resolved), `missing local page asset: ${rawRef}`);
}

console.log("French 8 final-exam page contract: OK");
