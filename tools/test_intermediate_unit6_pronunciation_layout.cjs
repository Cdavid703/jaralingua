"use strict";

const assert = require("node:assert/strict");
const childProcess = require("node:child_process");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");

const BASE_URL = process.env.JARALINGUA_TEST_URL || "http://127.0.0.1:8026/ingles/intermediate/pronunciation-unit-6-future-plans-advice.html";
const CHROME_PATH = process.env.JARALINGUA_CHROME_PATH || "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const viewports = [
  { label: "mobile-390x844", width: 390, height: 844 },
  { label: "tablet-768x1024", width: 768, height: 1024 },
  { label: "laptop-1366x768", width: 1366, height: 768 },
  { label: "desktop-1920x1080", width: 1920, height: 1080 }
];

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function waitFor(fn, timeoutMs = 8000, label = "condition") {
  const start = Date.now();
  let lastError;
  while (Date.now() - start < timeoutMs) {
    try {
      const result = await fn();
      if (result) return result;
    } catch (error) {
      lastError = error;
    }
    await delay(100);
  }
  throw lastError || new Error("Timed out waiting for " + label);
}

function chromeArgs(port, userDataDir) {
  return [
    "--headless=new",
    "--disable-gpu",
    "--no-sandbox",
    "--disable-dev-shm-usage",
    "--disable-background-networking",
    "--disable-sync",
    "--remote-debugging-address=127.0.0.1",
    "--remote-debugging-port=" + port,
    "--user-data-dir=" + userDataDir,
    "about:blank"
  ];
}

async function launchChrome() {
  assert.ok(fs.existsSync(CHROME_PATH), "Chrome executable not found at " + CHROME_PATH);
  const port = 9460 + Math.floor(Math.random() * 250);
  const userDataDir = fs.mkdtempSync(path.join(os.tmpdir(), "unit6-pron-chrome-"));
  const processHandle = childProcess.spawn(CHROME_PATH, chromeArgs(port, userDataDir), {
    stdio: "ignore",
    windowsHide: true
  });
  await waitFor(async () => {
    try {
      const response = await fetch(`http://127.0.0.1:${port}/json/version`);
      return response.ok;
    } catch (_error) {
      return false;
    }
  }, 10000, "Chrome debugging port");
  return { port, processHandle };
}

async function newPageTarget(port) {
  const response = await fetch(`http://127.0.0.1:${port}/json/new?about:blank`, { method: "PUT" });
  assert.equal(response.ok, true, "Chrome target creation failed");
  const target = await response.json();
  assert.ok(target.webSocketDebuggerUrl, "Chrome target WebSocket missing");
  return target.webSocketDebuggerUrl;
}

function createCdpClient(webSocketUrl) {
  let nextId = 1;
  const pending = new Map();
  const events = new Map();
  const socket = new WebSocket(webSocketUrl);

  socket.addEventListener("message", event => {
    const message = JSON.parse(event.data);
    if (message.id && pending.has(message.id)) {
      const item = pending.get(message.id);
      pending.delete(message.id);
      if (message.error) item.reject(new Error(message.error.message || JSON.stringify(message.error)));
      else item.resolve(message.result || {});
      return;
    }
    if (message.method && events.has(message.method)) {
      events.get(message.method).forEach(listener => listener(message.params || {}));
    }
  });

  function send(method, params = {}) {
    const id = nextId++;
    const payload = JSON.stringify({ id, method, params });
    return new Promise((resolve, reject) => {
      pending.set(id, { resolve, reject });
      socket.send(payload);
    });
  }

  function once(method) {
    return new Promise(resolve => {
      const listeners = events.get(method) || [];
      const listener = params => {
        events.set(method, (events.get(method) || []).filter(item => item !== listener));
        resolve(params);
      };
      listeners.push(listener);
      events.set(method, listeners);
    });
  }

  return {
    ready: new Promise((resolve, reject) => {
      socket.addEventListener("open", resolve, { once: true });
      socket.addEventListener("error", reject, { once: true });
    }),
    send,
    once,
    close: () => socket.close()
  };
}

async function evaluate(client, expression) {
  const result = await client.send("Runtime.evaluate", {
    expression,
    awaitPromise: true,
    returnByValue: true
  });
  if (result.exceptionDetails) {
    throw new Error("Runtime evaluation failed: " + JSON.stringify(result.exceptionDetails));
  }
  return result.result ? result.result.value : undefined;
}

async function openPage(client, viewport) {
  await client.ready;
  await client.send("Page.enable");
  await client.send("Runtime.enable");
  await client.send("Network.enable");
  await client.send("Network.setBlockedURLs", { urls: ["https://accounts.google.com/*", "https://login.microsoftonline.com/*"] });
  await client.send("Emulation.setDeviceMetricsOverride", {
    width: viewport.width,
    height: viewport.height,
    deviceScaleFactor: 1,
    mobile: viewport.width < 700
  });
  const load = client.once("Page.loadEventFired");
  await client.send("Page.navigate", { url: BASE_URL });
  await load;
  await waitFor(() => evaluate(client, "document.querySelectorAll('.stage-dot').length === 5 && document.querySelectorAll('#readingText .reading-word').length > 0"), 8000, "rendered pronunciation lab");
}

async function assertLayout(client, viewport) {
  const layout = await evaluate(client, `(() => {
    const root = document.documentElement;
    const visible = element => {
      const style = getComputedStyle(element);
      const rect = element.getBoundingClientRect();
      return style.display !== "none" && style.visibility !== "hidden" && rect.width > 0 && rect.height > 0;
    };
    const outside = Array.from(document.querySelectorAll("button, a, img, audio, .pronunciation-panel, .lesson-hero, .reading-text, .record-zone"))
      .filter(visible)
      .map(element => ({ element, rect: element.getBoundingClientRect() }))
      .filter(item => item.rect.left < -1 || item.rect.right > root.clientWidth + 1)
      .map(item => ({
        tag: item.element.tagName,
        text: (item.element.textContent || item.element.alt || "").trim().slice(0, 90),
        left: Math.round(item.rect.left),
        right: Math.round(item.rect.right)
      }));
    const hero = document.querySelector(".lesson-hero").getBoundingClientRect();
    const panel = document.querySelector(".pronunciation-panel").getBoundingClientRect();
    const reading = document.querySelector(".reading-text").getBoundingClientRect();
    return {
      overflow: root.scrollWidth - root.clientWidth,
      clientWidth: root.clientWidth,
      outside,
      heroWidth: Math.round(hero.width),
      heroHeight: Math.round(hero.height),
      panelWidth: Math.round(panel.width),
      readingWidth: Math.round(reading.width),
      buttons: document.querySelectorAll("button").length,
      speedButtons: document.querySelectorAll("[data-speed]").length,
      stageDots: document.querySelectorAll(".stage-dot").length,
      audios: document.querySelectorAll("audio").length,
      visibleWords: document.querySelectorAll("#readingText .reading-word").length,
      submitText: document.querySelector("[data-submit-status]")?.textContent || ""
    };
  })()`);
  assert.ok(layout.overflow <= 1, `${viewport.label}: horizontal overflow ${layout.overflow}px`);
  assert.deepEqual(layout.outside, [], `${viewport.label}: visible elements exceed the viewport`);
  assert.ok(layout.heroWidth >= layout.clientWidth - 2, `${viewport.label}: hero should span the viewport`);
  assert.ok(layout.heroHeight > 260, `${viewport.label}: hero area too short`);
  assert.ok(layout.panelWidth > 280, `${viewport.label}: pronunciation panel too narrow`);
  assert.ok(layout.readingWidth > 250, `${viewport.label}: reading text too narrow`);
  assert.ok(layout.buttons >= 8, `${viewport.label}: expected model, speed, shadow, mic, reset and submit buttons`);
  assert.equal(layout.speedButtons, 3, `${viewport.label}: expected exactly three speed buttons`);
  assert.equal(layout.stageDots, 5, `${viewport.label}: expected five stage dots`);
  assert.equal(layout.audios, 2, `${viewport.label}: expected model and student audio elements`);
  assert.ok(layout.visibleWords >= 12, `${viewport.label}: expected rendered reading words`);
  assert.ok(layout.submitText.includes("Complete the 4 sections"), `${viewport.label}: submit guidance missing`);
}

async function assertButtons(client, viewport) {
  const result = await evaluate(client, `(() => {
    document.querySelector('[data-speed="0.75"]').click();
    const speedOk = document.querySelector('[data-speed="0.75"]').classList.contains('is-active') && document.getElementById('modelAudio').playbackRate === 0.75;
    document.getElementById('shadowModeButton').click();
    const shadowOk = document.getElementById('shadowModeButton').classList.contains('is-active') && document.getElementById('shadowModeStatus').textContent.includes('On');
    document.getElementById('resetButton').click();
    const resetOk = document.getElementById('recordStatus').textContent.includes('Ready');
    return { speedOk, shadowOk, resetOk };
  })()`);
  assert.equal(result.speedOk, true, `${viewport.label}: speed button did not update playback rate`);
  assert.equal(result.shadowOk, true, `${viewport.label}: shadow mode button did not toggle`);
  assert.equal(result.resetOk, true, `${viewport.label}: reset button did not provide ready state`);
}

(async () => {
  const chrome = await launchChrome();
  try {
    for (const viewport of viewports) {
      const webSocketUrl = await newPageTarget(chrome.port);
      const client = createCdpClient(webSocketUrl);
      try {
        await openPage(client, viewport);
        await assertLayout(client, viewport);
        await assertButtons(client, viewport);
      } finally {
        client.close();
      }
    }
    console.log("PASS Unit 6 pronunciation responsive layout audit");
  } finally {
    chrome.processHandle.kill();
  }
})().catch(error => {
  console.error(error);
  process.exit(1);
});
