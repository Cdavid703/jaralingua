"use strict";

const assert = require("node:assert/strict");
const childProcess = require("node:child_process");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");

const BASE_URL = process.env.JARALINGUA_TEST_URL || "http://127.0.0.1:8026/ingles/intermediate/reading-unit-6-olivias-overloaded-week.html";
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
  const port = 9390 + Math.floor(Math.random() * 250);
  const userDataDir = fs.mkdtempSync(path.join(os.tmpdir(), "unit6-reading-chrome-"));
  const processHandle = childProcess.spawn(CHROME_PATH, chromeArgs(port, userDataDir), {
    stdio: "ignore",
    windowsHide: true
  });
  await waitFor(async () => {
    try {
      const response = await fetch(`http://127.0.0.1:${port}/json/version`);
      return response.ok;
    } catch (error) {
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
  await waitFor(() => evaluate(client, "document.querySelectorAll('[data-question-card]').length === 10"), 8000, "rendered reading quiz");
}

async function assertLayout(client, viewport) {
  const layout = await evaluate(client, `(() => {
    const root = document.documentElement;
    const visible = element => {
      const style = getComputedStyle(element);
      const rect = element.getBoundingClientRect();
      return style.display !== "none" && style.visibility !== "hidden" && rect.width > 0 && rect.height > 0;
    };
    const outside = Array.from(document.querySelectorAll("button, a, img, textarea, .u6r-panel, .q-card, .u6r-hero, .article-card"))
      .filter(visible)
      .map(element => ({ element, rect: element.getBoundingClientRect() }))
      .filter(item => item.rect.left < -1 || item.rect.right > root.clientWidth + 1)
      .map(item => ({
        tag: item.element.tagName,
        text: (item.element.textContent || item.element.alt || "").trim().slice(0, 80),
        left: Math.round(item.rect.left),
        right: Math.round(item.rect.right)
      }));
    const hero = document.querySelector(".u6r-hero").getBoundingClientRect();
    const article = document.querySelector(".article-card").getBoundingClientRect();
    return {
      overflow: root.scrollWidth - root.clientWidth,
      clientWidth: root.clientWidth,
      outside,
      heroWidth: Math.round(hero.width),
      heroHeight: Math.round(hero.height),
      articleWidth: Math.round(article.width),
      articleHeight: Math.round(article.height),
      buttons: document.querySelectorAll("button").length,
      questions: document.querySelectorAll("[data-question-card]").length,
      textareas: document.querySelectorAll("textarea").length,
      audios: document.querySelectorAll("audio").length
    };
  })()`);
  assert.ok(layout.overflow <= 1, `${viewport.label}: horizontal overflow ${layout.overflow}px`);
  assert.deepEqual(layout.outside, [], `${viewport.label}: visible elements exceed the viewport`);
  assert.ok(layout.heroWidth >= layout.clientWidth - 2, `${viewport.label}: hero should span the viewport`);
  assert.ok(layout.heroHeight > 260, `${viewport.label}: hero image area too short`);
  assert.ok(layout.articleWidth > 280, `${viewport.label}: article too narrow`);
  assert.ok(layout.articleHeight > 850, `${viewport.label}: article too short for a detailed reading`);
  assert.ok(layout.buttons >= 3, `${viewport.label}: expected quiz and delivery buttons`);
  assert.equal(layout.questions, 10, `${viewport.label}: expected ten questions`);
  assert.equal(layout.textareas, 0, `${viewport.label}: reading activity should not include a writing box`);
  assert.equal(layout.audios, 0, `${viewport.label}: reading activity should not include audio`);
}

async function completeAndSubmitMocked(client) {
  await evaluate(client, `(() => {
    window.JaraLinguaUnit6ReadingArticleData.answers.forEach((answer, index) => {
      const input = document.querySelector('input[name="q' + index + '"][value="' + answer + '"]');
      input.checked = true;
      input.dispatchEvent(new Event('change', { bubbles: true }));
    });
    return true;
  })()`);
  await evaluate(client, "document.querySelector('[data-check-answers]').click()");
  await waitFor(() => evaluate(client, "document.querySelector('[data-quiz-feedback]').textContent.includes('5.00 / 5.0')"), 4000, "perfect reading score");

  await evaluate(client, `(() => {
    const originalFetch = window.fetch.bind(window);
    window.fetch = function(input, init) {
      if (String(input).includes('/api/intermediate/unit6-reading-overloaded-week/submit')) {
        return Promise.resolve(new Response(JSON.stringify({
          ok: true,
          evaluationId: 'unit6OliviaOverloadedWeekReading',
          score: 10,
          total: 10,
          grade: 5,
          incorrectQuestions: [],
          wordCount: 0,
          attemptCount: 1,
          followUpOnly: true,
          weight: 0
        }), { status: 200, headers: { 'Content-Type': 'application/json' } }));
      }
      return originalFetch(input, init);
    };
    sessionStorage.setItem('jaralingua_local_user', JSON.stringify({
      credential: 'layout-test-token',
      exp: Math.floor(Date.now() / 1000) + 3600
    }));
    return true;
  })()`);
  await waitFor(() => evaluate(client, "!document.querySelector('[data-send-teacher]').disabled"), 4000, "send button enabled");
  await evaluate(client, "document.querySelector('[data-send-teacher]').click()");
  await waitFor(() => evaluate(client, "document.querySelector('[data-delivery-status]').textContent.includes('Submitted to teacher')"), 4000, "submission confirmation");
  await waitFor(() => evaluate(client, "document.querySelector('[data-delivery-status]').textContent.includes('Gradebook weight: 0%')"), 4000, "0 percent confirmation");
}

async function screenshot(client, viewport) {
  const metrics = await client.send("Page.getLayoutMetrics");
  const contentSize = metrics.contentSize;
  const capture = await client.send("Page.captureScreenshot", {
    format: "png",
    captureBeyondViewport: true,
    clip: {
      x: 0,
      y: 0,
      width: Math.min(contentSize.width, viewport.width),
      height: Math.min(contentSize.height, 3200),
      scale: 1
    }
  });
  const file = path.join(os.tmpdir(), `unit6-reading-article-${viewport.label}.png`);
  fs.writeFileSync(file, Buffer.from(capture.data, "base64"));
  return file;
}

(async () => {
  const chrome = await launchChrome();
  try {
    for (const viewport of viewports) {
      const webSocketUrl = await newPageTarget(chrome.port);
      const client = createCdpClient(webSocketUrl);
      await openPage(client, viewport);
      await assertLayout(client, viewport);
      if (viewport.label.startsWith("laptop")) {
        await completeAndSubmitMocked(client);
      }
      const file = await screenshot(client, viewport);
      console.log(`PASS ${viewport.label} screenshot=${file}`);
      client.close();
    }
  } finally {
    chrome.processHandle.kill();
  }
})();
