const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");
const exists = (file) => fs.existsSync(path.join(root, file));

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

const requiredFiles = [
  "ingles/intermediate/game-decision-room.html",
  "assets/css/intermediate-decision-room.css",
  "assets/js/english-intermediate-decision-room.js",
  "assets/img/english-intermediate/games/decision-room/decision-room-hero-v1.webp"
];

for (const file of requiredFiles) {
  assert(exists(file), `Missing required file: ${file}`);
}

const page = read("ingles/intermediate/game-decision-room.html");
const css = read("assets/css/intermediate-decision-room.css");
const js = read("assets/js/english-intermediate-decision-room.js");
const server = read("server/progress_api.py");
const games = read("ingles/intermediate/games.html");
const lab = read("ingles/intermediate/practice-lab.html");
const overview = read("ingles/intermediate/course-overview.html");
const unit6 = read("ingles/intermediate/unit-6-future-plans-advice.html");

assert(page.includes("The Decision Room"), "Game page title missing.");
assert(page.includes("../../assets/css/intermediate-decision-room.css"), "Game page CSS not linked.");
assert(page.includes("../../assets/js/english-intermediate-decision-room.js"), "Game page JS not linked.");
assert(page.includes("Create room"), "Teacher create-room button missing.");
assert(page.includes("> Join</button>"), "Student join button missing.");
assert(page.includes("Send decision"), "Student submit button missing.");
assert(page.includes("Open class vote"), "Teacher vote button missing.");
assert(page.includes("Reset all rooms"), "Teacher reset-all button missing.");

assert(css.includes("decision-room-hero-v1.webp"), "Professional hero image not used in CSS.");
assert(/@media\s*\(max-width:\s*680px\)/.test(css), "Mobile media query missing.");
assert(/@media\s*\(max-width:\s*1020px\)/.test(css), "Tablet media query missing.");

assert(js.includes("/api/intermediate/decision-room"), "Decision Room API path missing.");
assert(js.includes("open-vote"), "Open vote action missing.");
assert(js.includes("You can choose another finalist while voting remains open."), "Vote-change feedback missing.");
assert(!js.includes("speechSynthesis"), "Browser speech synthesis should not be used.");
assert(!js.includes("webkitSpeechRecognition"), "Speech recognition should not be used in this game.");

assert(server.includes("INTERMEDIATE_DECISION_ROOM_PATH"), "Decision Room store path missing.");
assert(server.includes("/api/intermediate/decision-room/state"), "GET state route missing.");
assert(server.includes("/api/intermediate/decision-room"), "POST route missing.");
assert(server.includes("overbooked-saturday"), "Unit 6 scenarios missing.");
assert(server.includes("reset-all"), "Reset-all action missing.");
assert(server.includes("responseId"), "Response tracking missing.");

assert(games.includes("game-decision-room.html"), "Games hub missing Decision Room link.");
assert(lab.includes("48 activities"), "Practice Lab total count not updated.");
assert(lab.includes("Unit 6 - 10 activities"), "Practice Lab Unit 6 quick count not updated.");
assert(lab.includes("The Decision Room"), "Practice Lab missing Decision Room card.");
assert(overview.includes("Game: The Decision Room"), "Course Overview missing Decision Room link.");
assert(unit6.includes("Open live game"), "Unit 6 explanation missing live-game bridge.");

console.log("Intermediate Decision Room static checks passed.");
