"use strict";

const assert = require("node:assert/strict");
const os = require("node:os");
const path = require("node:path");
const { chromium } = require("playwright");

const BASE_URL = process.env.JARALINGUA_TEST_URL || "http://127.0.0.1:8022/ingles/basico-2/game-impostor.html";
const CHROME_PATH = process.env.JARALINGUA_CHROME_PATH || "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const viewports = [
  { label: "mobile-390x844", width: 390, height: 844 },
  { label: "tablet-768x1024", width: 768, height: 1024 },
  { label: "laptop-1366x768", width: 1366, height: 768 }
];

const players = ["Alex", "Bailey", "Casey", "Drew"].map((name, index) => ({
  id: "p" + (index + 1),
  name,
  ready: false,
  hasVoted: false,
  voteSuspectId: ""
}));

const card = {
  id: "jacket",
  term: "jacket",
  type: "Clothing item",
  category: "Unit 2 clothes",
  image: "/assets/img/english-basic-2/unit-2-shopping-experiences/cards/jacket.webp",
  brief: "A piece of clothing for the upper body, often used when the weather is cool or cold.",
  contextLabel: "Unit 2 context",
  familyContext: "A student may ask how much this item costs or say that it is too small or too big.",
  speakingHelp: "Use it when describing what someone is wearing or buying.",
  clues: ["upper body", "cold weather", "over a shirt"],
  taboo: ["jacket", "coat", "wear", "cold"]
};

function roomState(status, round = 1) {
  return {
    code: "TST2",
    status,
    round,
    deck: "unit2",
    deckLabel: "Unit 2: clothes and shopping",
    deckShortLabel: "Unit 2 vocabulary",
    playerCount: players.length,
    minPlayers: 4,
    maxPlayers: 24,
    readyCount: status === "briefing" ? 1 : status === "waiting" ? 0 : players.length,
    allReady: status !== "waiting" && status !== "briefing",
    voteCount: players.filter(player => player.hasVoted).length,
    category: card.category
  };
}

function teacherPayload(status, round = 1) {
  return {
    room: roomState(status, round),
    players: players.map(player => ({ ...player })),
    currentPlayer: null,
    teacher: { ok: true, card: status === "waiting" ? null : card, impostors: [{ id: "p4", name: "Drew" }] },
    result: status === "revealed" ? { card, impostors: [{ id: "p4", name: "Drew" }], votes: [{ playerId: "p4", name: "Drew", votes: 3 }] } : null
  };
}

function studentPayload(status = "voting", round = 1) {
  const current = { ...players[0], role: "citizen", card };
  return {
    room: roomState(status, round),
    players: players.map(player => ({ ...player })),
    currentPlayer: current,
    teacher: null,
    result: null
  };
}

function storedUser(role) {
  return {
    credential: role + "-test-token",
    provider: "local",
    sub: role + "-test-user",
    email: role + "@test.local",
    name: role === "teacher" ? "Test Teacher" : "Test Student",
    exp: Math.floor(Date.now() / 1000) + 3600
  };
}

async function preparePage(browser, role, viewport) {
  const context = await browser.newContext({ viewport });
  await context.addInitScript(({ role, user }) => {
    sessionStorage.setItem("jaralingua_local_user", JSON.stringify(user));
    if (role === "teacher") {
      localStorage.setItem("jaralingua_role_requests", JSON.stringify([{
        id: user.sub,
        email: user.email,
        name: user.name,
        role: "teacher",
        status: "approved"
      }]));
    } else {
      localStorage.setItem("english-basic2-impostor-live-state", JSON.stringify({
        roomCode: "TST2",
        playerToken: "student-player-token"
      }));
    }
  }, { role, user: storedUser(role) });
  const page = await context.newPage();
  await page.route("https://accounts.google.com/**", route => route.abort());
  return { context, page };
}

async function installTeacherApi(page) {
  let status = "waiting";
  let round = 1;
  await page.route("**/api/basic2/impostor**", async route => {
    const request = route.request();
    const url = new URL(request.url());
    if (request.method() === "GET" && url.pathname.endsWith("/state")) {
      await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(teacherPayload(status, round)) });
      return;
    }
    const body = request.postDataJSON();
    if (body.action === "create") {
      status = "waiting";
      await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ ok: true, roomCode: "TST2", teacherToken: "teacher-room-token", state: teacherPayload(status, round) }) });
      return;
    }
    if (body.action === "distribute") status = "briefing";
    if (body.action === "force-discussion") status = "discussion";
    if (body.action === "open-vote") status = "voting";
    if (body.action === "reveal") status = "revealed";
    if (body.action === "reset") {
      status = "waiting";
      round += 1;
      players.forEach(player => {
        player.hasVoted = false;
        player.voteSuspectId = "";
      });
    }
    if (body.action === "reset-all") {
      await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ ok: true, resetAll: true, clearedRooms: body.rooms.length, ignoredRooms: 0 }) });
      return;
    }
    if (body.action === "close-room") {
      await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ ok: true, closed: true }) });
      return;
    }
    await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ ok: true, state: teacherPayload(status, round) }) });
  });
}

async function installStudentApi(page) {
  await page.route("**/api/basic2/impostor**", async route => {
    const request = route.request();
    if (request.method() === "GET") {
      await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(studentPayload()) });
      return;
    }
    const body = request.postDataJSON();
    if (body.action === "vote") {
      players[0].hasVoted = true;
      players[0].voteSuspectId = body.suspectId;
      await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ ok: true, state: studentPayload() }) });
      return;
    }
    await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ ok: true, state: studentPayload() }) });
  });
}

async function assertResponsive(page, label) {
  const result = await page.evaluate(() => {
    const viewportWidth = document.documentElement.clientWidth;
    const visible = element => {
      const style = getComputedStyle(element);
      const rect = element.getBoundingClientRect();
      return style.display !== "none" && style.visibility !== "hidden" && rect.width > 0 && rect.height > 0;
    };
    const overflow = Array.from(document.querySelectorAll("button, a, input, .private-card, .vote-box, .game-panel"))
      .filter(visible)
      .map(element => {
        const rect = element.getBoundingClientRect();
        return { tag: element.tagName, text: (element.textContent || element.getAttribute("aria-label") || "").trim().slice(0, 50), left: rect.left, right: rect.right, width: rect.width };
      })
      .filter(item => item.left < -1 || item.right > viewportWidth + 1 || item.width > viewportWidth + 1);
    return {
      viewportWidth,
      scrollWidth: document.documentElement.scrollWidth,
      overflow,
      brokenImages: Array.from(document.images).filter(image => image.complete && image.naturalWidth === 0).map(image => image.src)
    };
  });
  assert.ok(result.scrollWidth <= result.viewportWidth + 1, label + " has horizontal overflow: " + JSON.stringify(result));
  assert.deepEqual(result.overflow, [], label + " has controls outside the viewport");
  assert.deepEqual(result.brokenImages, [], label + " has broken images");
  await page.screenshot({ path: path.join(os.tmpdir(), "jaralingua-basic2-impostor-" + label + ".png"), fullPage: true });
}

async function waitForStatus(page, fragment) {
  await page.waitForFunction(value => (document.querySelector("#statusMessage")?.textContent || "").includes(value), fragment);
  return page.locator("#statusMessage").innerText();
}

async function testTeacherFlow(browser) {
  const { context, page } = await preparePage(browser, "teacher", viewports[2]);
  await installTeacherApi(page);
  page.on("dialog", dialog => dialog.accept());
  await page.goto(BASE_URL, { waitUntil: "domcontentloaded" });
  await page.locator("#teacherPanel:not([hidden])").waitFor({ state: "visible" });
  await page.locator("#createRoomBtn").click();
  await page.waitForFunction(() => document.querySelector("#roomCodeDisplay")?.textContent.trim() === "TST2");
  assert.equal((await page.locator("#roomCodeDisplay").innerText()).trim(), "TST2");
  assert.match(await page.locator("#statusMessage").innerText(), /Room created/);
  assert.match(await page.locator("#teacherActionGuide").innerText(), /Ready: choose the vocabulary deck/);

  await page.locator('[data-vocab-deck="unit2"]').click();
  assert.match(await page.locator("#selectedDeckNote").innerText(), /Unit 2 clothes and shopping/);
  await page.locator("#distributeBtn").click();
  assert.match(await waitForStatus(page, "Roles distributed"), /Roles distributed with Unit 2 clothes and shopping/);
  await page.locator("#openVoteBtn").click();
  assert.match(await waitForStatus(page, "Vote opened"), /Vote opened/);
  await page.locator("#revealBtn").click();
  assert.match(await waitForStatus(page, "Result revealed"), /Result revealed/);
  await page.locator("#resetBtn").click();
  assert.match(await waitForStatus(page, "New round ready"), /New round ready/);
  await assertResponsive(page, viewports[2].label);
  await context.close();
}

async function testStudentVoteAndResponsive(browser) {
  for (const viewport of viewports) {
    players[0].hasVoted = false;
    players[0].voteSuspectId = "";
    const { context, page } = await preparePage(browser, "student", viewport);
    await installStudentApi(page);
    await page.goto(BASE_URL, { waitUntil: "domcontentloaded" });
    await page.locator("#voteForm").waitFor({ state: "visible" });
    assert.equal(await page.locator("#joinForm").isHidden(), true, "Join form must disappear after the student connects");
    assert.equal(await page.locator("#studentConnectionStatus").isVisible(), true, "Connected student status must be visible");
    assert.match(await page.locator("#studentConnectionText").innerText(), /Connected as Alex.*Room TST2/);
    await assertResponsive(page, viewport.label);
    if (viewport.label === "mobile-390x844") {
      await page.locator('[data-suspect-option][value="p2"]').check();
      await page.locator('#voteForm button[type="submit"]').click();
      assert.match(await waitForStatus(page, "Vote recorded"), /Vote recorded/);
      assert.match(await page.locator("#votePanel").innerText(), /Your vote is saved/);

      await page.locator('[data-suspect-option][value="p3"]').check();
      await page.waitForTimeout(2100);
      assert.equal(await page.locator('[data-suspect-option][value="p3"]').isChecked(), true, "Draft vote must survive polling with an older saved vote");
      await page.locator('#voteForm button[type="submit"]').click();
      await waitForStatus(page, "Vote recorded");
      assert.equal(await page.locator('[data-suspect-option][value="p3"]').isChecked(), true);
      assert.match(await page.locator("#statusMessage").innerText(), /still change it/);
    }
    await context.close();
  }
}

(async () => {
  const browser = await chromium.launch({ headless: true, executablePath: CHROME_PATH });
  try {
    await testTeacherFlow(browser);
    await testStudentVoteAndResponsive(browser);
    console.log("PASS Basic 2 Vocabulary Impostor UI: teacher flow, vote update, images, and responsive layouts");
  } finally {
    await browser.close();
  }
})().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
