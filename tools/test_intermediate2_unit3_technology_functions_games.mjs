import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const read = (...parts) => fs.readFileSync(path.join(root, ...parts), "utf8");
const memoryPage = read(
  "ingles",
  "intermediate-2",
  "game-unit-3-technology-functions-memory.html",
);
const roulettePage = read(
  "ingles",
  "intermediate-2",
  "speaking-unit-3-what-is-it-for-device-roulette.html",
);
const practiceLab = read("ingles", "intermediate-2", "practice-lab.html");
const practiceLabScript = read(
  "assets",
  "js",
  "english-intermediate2-practice-lab.js",
);
const practiceLabCss = read(
  "assets",
  "css",
  "english-intermediate2-practice-lab.css",
);
const gameCss = read(
  "assets",
  "css",
  "english-intermediate2-technology-functions-games.css",
);
const dataScript = read(
  "assets",
  "js",
  "english-intermediate2-technology-functions-data.js",
);
const memoryScript = read(
  "assets",
  "js",
  "english-intermediate2-technology-functions-memory.js",
);
const rouletteScript = read(
  "assets",
  "js",
  "english-intermediate2-device-roulette.js",
);
const catalog = JSON.parse(
  read("assets", "data", "english-intermediate-2-content.json"),
);
const sitemap = read("sitemap.xml");
const imageDir = path.join(
  root,
  "assets",
  "img",
  "english-intermediate-2",
  "unit-3",
  "technology-functions-device-roulette",
);
const audioDir = path.join(
  root,
  "ingles",
  "intermediate-2",
  "audio",
  "unit-3-technology-functions",
);

for (const [name, markup, title] of [
  ["memory", memoryPage, "Technology Functions Memory"],
  ["roulette", roulettePage, "What Is It For?"],
]) {
  assert.ok(markup.includes(title), `${name} title is missing.`);
  assert.ok(
    markup.includes('class="brand"'),
    `${name} needs the visible JaraLingua logo.`,
  );
  assert.ok(
    markup.includes("jaralingua-logo.png"),
    `${name} logo image is missing.`,
  );
  assert.ok(
    markup.includes("english-intermediate2-technology-functions-games.css"),
    `${name} shared game styles are missing.`,
  );
  assert.ok(
    markup.includes("page-qr-access.js"),
    `${name} needs the standard expandable QR.`,
  );
  assert.equal(
    /<details\b[^>]*\bopen\b/i.test(markup),
    false,
    `${name} support must start closed.`,
  );
  const hero = markup.match(/<figure class="tg-hero-art">([\s\S]*?)<\/figure>/);
  assert.ok(hero, `${name} needs the standard single-image banner.`);
  assert.equal(
    (hero[1].match(/<img\b/g) || []).length,
    1,
    `${name} banner must use one professional image, not a collage.`,
  );
}

assert.ok(memoryPage.includes('id="memoryBoard"'));
assert.ok(memoryPage.includes("Teacher: award point"));
assert.ok(roulettePage.includes('id="rouletteRoster"'));
assert.ok(roulettePage.includes("Choose a device manually"));
assert.ok(roulettePage.includes("What is it for?"));
assert.ok(roulettePage.includes('class="tg-wheel-card"'));
assert.ok(roulettePage.includes('class="tg-wheel-zone"'));
assert.ok(roulettePage.includes('class="tg-pointer"'));
assert.ok(memoryScript.includes("devices.flatMap"));
assert.ok(memoryScript.includes("modelAudio"));
assert.ok(rouletteScript.includes("function names(value)"));
assert.ok(rouletteScript.includes("function selectDevice"));
assert.ok(gameCss.includes("min-height: min(610px, 65vh)"));
assert.ok(gameCss.includes(".tg-wheel-card"));
assert.ok(gameCss.includes("width: min(360px, 100%)"));
assert.ok(practiceLabCss.includes("repeat(auto-fill, minmax(250px, 1fr))"));
assert.equal(
  practiceLabCss.includes("#unit3ActivityGrid"),
  false,
  "Unit 3 cards must use the same grid rule as every other unit.",
);

const deviceIds = [...dataScript.matchAll(/\[\s*"([a-z-]+)",/g)].map(
  (match) => match[1],
);
assert.equal(
  deviceIds.length,
  12,
  "The game set needs exactly twelve devices.",
);
assert.equal(new Set(deviceIds).size, 12, "Each device ID must be unique.");
for (const id of deviceIds) {
  assert.ok(
    fs.existsSync(path.join(imageDir, `${id}-v1.png`)),
    `Missing device image: ${id}.`,
  );
  for (const clip of ["word", "model"]) {
    const audioFile = path.join(audioDir, `${id}-${clip}.mp3`);
    assert.ok(
      fs.existsSync(audioFile),
      `Missing pronunciation audio: ${id}-${clip}.mp3.`,
    );
    assert.ok(
      fs.statSync(audioFile).size > 10_000,
      `Pronunciation audio is unexpectedly small: ${id}-${clip}.mp3.`,
    );
  }
}

for (const expected of [
  [
    "unit-3-technology-functions-memory",
    2,
    "vocabulary-game",
    "/ingles/intermediate-2/game-unit-3-technology-functions-memory.html",
  ],
  [
    "unit-3-what-is-it-for-device-roulette",
    3,
    "speaking-game",
    "/ingles/intermediate-2/speaking-unit-3-what-is-it-for-device-roulette.html",
  ],
]) {
  const [id, order, type, href] = expected;
  const item = catalog.items.find((entry) => entry.id === id);
  assert.ok(item, `Catalog item missing: ${id}.`);
  assert.equal(item.unit, 3);
  assert.equal(item.order, order);
  assert.equal(item.type, type);
  assert.equal(item.status, "published");
  assert.equal(item.workshopHref, href);
  assert.ok(
    practiceLab.includes('id="unit3ActivityGrid"'),
    "Practice Lab needs the Unit 3 catalog target.",
  );
  assert.ok(
    practiceLabScript.includes("unit3ActivityGrid"),
    "Practice Lab must render Unit 3 catalog items.",
  );
  assert.ok(
    sitemap.includes(`https://www.jaralingua.com${href}`),
    `Sitemap is missing ${id}.`,
  );
}
assert.ok(practiceLab.includes('id="unit3ActivityCount">3 activities'));

console.log(
  "Intermediate 2 Unit 3 technology-functions games contract passed.",
);
