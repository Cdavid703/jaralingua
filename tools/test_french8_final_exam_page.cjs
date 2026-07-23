#!/usr/bin/env node

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const pagePath = path.join(root, "frances", "Niveau 8", "examen-final.html");
const indexPath = path.join(root, "frances", "Niveau 8", "index.html");
const authScriptPath = path.join(root, "assets", "js", "google-auth.js");
const page = fs.readFileSync(pagePath, "utf8");
const index = fs.readFileSync(indexPath, "utf8");
const authScript = fs.readFileSync(authScriptPath, "utf8");

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
assert.match(
  page,
  /const draft = storedExamAuth\(\)\s*\?\s*await request\(API\.draft, \{\}, 10000, "exam"\)\s*:\s*await request\(API\.draft, \{\}, 10000, "external"\)/,
  "the start gate must read a pre-attempt draft with the primary account instead of a missing exam bridge"
);
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
assert.match(page, /function saveDraft\(sourceInput = null\) \{\s*if \(!examInProgress/);
assert.match(page, /async function saveServerDraft\(answers, options = \{\}\) \{\s*if \(!examInProgress/);
assert.match(page, /async function recordSession[\s\S]*?if \(!examInProgress\) return null/);

assert.doesNotMatch(page, /id="accessPanel"[^>]*aria-live/, "the large access container must not duplicate its nested live-region announcements");
assert.match(page, /data-student-save-status data-state="saving"/);
assert.match(page, /data-student-save-announcer role="status" aria-live="polite" aria-atomic="true"/);
assert.match(page, /data-student-save-retry hidden/);
assert.match(page, /Enregistré sur le serveur ·/);
assert.match(page, /Enregistré uniquement sur cet appareil \/ hors connexion/);
assert.match(page, /setStudentSaveState\("saving", `\$\{selectedQuestionLabel\(sourceInput\)\} · Enregistrement…`\)/, "a radio choice must immediately receive visible local/saving feedback");
assert.match(page, /Réponse \$\{number\} sélectionnée/, "selection feedback must not claim local persistence before it has been verified");
assert.match(page, /second: "2-digit"/, "server-save confirmations must expose second-level precision");
assert.match(page, /if \(safeState !== "saving"\) \{[\s\S]*?announcer\.textContent = "";[\s\S]*?studentSaveAnnounceHandle = window\.setTimeout/, "settled saves must be re-announced even when their visible text repeats");
assert.doesNotMatch(page, /safeState !== "saving" &&/, "transient saving paints must never enter the live region");
assert.match(page, /let localDraftPersisted = false/);
assert.match(page, /function persistDraftLocally\(answers\)[\s\S]*?sessionStorage\.setItem\(key, serialized\)[\s\S]*?sessionStorage\.getItem\(key\) === serialized/, "local persistence must be verified by read-back");
assert.match(page, /if \(!navigator\.onLine\)[\s\S]*?draftPendingAnswers = Object\.assign\(\{\}, answers\)[\s\S]*?setStudentDraftFallback\("offline"\)/, "offline answers must remain queued with truthful retention feedback");
assert.match(page, /Votre réponse reste dans ce formulaire; ne rechargez pas la page/, "failed local and server storage must warn the student not to reload");
assert.doesNotMatch(page, /Impossible d’enregistrer sur le serveur\. Vos réponses restent sur cet appareil/, "server failure must not claim an unverified browser copy");
assert.match(page, /reason === "auth" && navigator\.onLine[\s\S]*?Authentification requise pour enregistrer sur le serveur/, "online 401/403 feedback must identify authentication rather than connectivity");
assert.match(page, /\[401, 403\]\.includes\(result\.status\)\) setStudentDraftFallback\(navigator\.onLine \? "auth" : "offline"\)/);
assert.match(page, /let serverVerified = false[\s\S]*?compatibleVersion[\s\S]*?compatibleAttempt[\s\S]*?serverVerified = true/, "a GET draft must be identity-compatible before being reported as server-verified");
assert.match(page, /serverSavedAt = result\.data\?\.draft\?\.updatedAt \|\| result\.data\?\.updatedAt/, "restored server confirmation should use the server timestamp when available");
assert.match(page, /else if \(serverVerified && examInProgress\)/);
assert.doesNotMatch(page, /serverReached/, "mere server reachability must not be presented as a verified save");
assert.match(page, /window\.addEventListener\("online", \(\) => \{[\s\S]*?saveServerDraft\(selectedAnswerMap\(\)\)/, "reconnection must immediately synchronize the current answer set");
assert.match(page, /data-student-save-retry[^]*?addEventListener\("click", retryStudentDraft\)/);

assert.match(page, /courseLoginStatus"[^>]*role="status" aria-live="polite" aria-atomic="true"/);
assert.match(page, /error\?\.name === "AbortError"[\s\S]*?responseStatus >= 500/, "technical login failures must not be mislabeled as bad credentials");
assert.match(page, /data-open-login[\s\S]*?Ouverture du panneau Google \/ Microsoft/);
assert.ok(page.includes("google-auth.js?v=20260722-exam-auth-sync"), "the exam must invalidate the cached sign-in and access synchronization logic");
assert.doesNotMatch(page, /<script src="https:\/\/alcdn\.msauth\.net\/browser\/2\.37\.0\/js\/msal-browser\.min\.js"><\/script>/, "Microsoft must load on demand instead of blocking the exam and its login control");
assert.match(authScript, /DOMContentLoaded", renderAuthEntryPoint/, "the floating sign-in control must render before slow external resources finish loading");
assert.match(authScript, /document\.readyState === "complete"[\s\S]*?startAuthRuntime\(\)/, "dynamically loaded auth must still initialize after the load event");
assert.match(authScript, /function notifyAuthChange\(authenticated\)[\s\S]*?CustomEvent\("jaralingua:auth-changed"/, "successful provider login must notify the active page without exposing the credential");
assert.match(authScript, /updateDownloadLocks\(\);\s*notifyAuthChange\(true\);/, "the login event must fire after the account is persisted and rendered");
assert.match(page, /window\.addEventListener\("jaralingua:auth-changed"[\s\S]*?Compte détecté\. Vérification et ouverture de l’examen…[\s\S]*?loadState\(\{ force: true \}\)/, "the exam must automatically recheck access as soon as login succeeds");
assert.match(page, /function recheckStudentAccess\(event\)[\s\S]*?aria-busy[\s\S]*?Vérification de votre accès auprès du serveur/);
assert.match(page, /data-run-preflight[\s\S]*?Vérification en cours/);
assert.match(page, /data-play-preflight[\s\S]*?Lecture du son test en cours/);
assert.match(page, /data-heard-preflight[\s\S]*?Votre appareil est prêt pour l’examen/);
assert.match(page, /async function startExamAttempt\(\)[\s\S]*?Création sécurisée de votre tentative/);
assert.match(page, /data-audio-retry[^]*?addEventListener\("click", loadExamAudio\)/);
assert.match(page, /examAudio\?\.addEventListener\("play"[\s\S]*?addEventListener\("pause"[\s\S]*?addEventListener\("ended"/);
assert.match(page, /confirmationDialog\?\.addEventListener\("cancel"[\s\S]*?event\.preventDefault\(\)[\s\S]*?cancelConfirmation\(\)/);
assert.match(page, /Envoi annulé\. Vos réponses restent modifiables/);
assert.match(page, /data-confirm-submit[^]*?Confirmation reçue\. Enregistrement définitif en cours/);
assert.match(page, /data-reconnect-exam[^]*?Reconnexion et synchronisation en cours/);

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
assert.match(page, /const blockLabel = String\(question\.block \|\| ""\)\.match\(\/\^Thème\\s\+\\d\+\/u\)\?\.\[0\] \|\| "";/, "student question labels must expose the theme number without revealing the exact grammar rule");

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
