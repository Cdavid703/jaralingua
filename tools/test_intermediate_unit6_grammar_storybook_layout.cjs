"use strict";

const assert = require("node:assert/strict");
const childProcess = require("node:child_process");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");

const BASE_URL = process.env.JARALINGUA_TEST_URL || "http://127.0.0.1:8026/ingles/intermediate/practice-unit-6-olivias-schedule-gap-fill.html";
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
  const port = 9330 + Math.floor(Math.random() * 250);
  const userDataDir = fs.mkdtempSync(path.join(os.tmpdir(), "unit6-grammar-chrome-"));
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
  await waitFor(() => evaluate(client, "Boolean(document.querySelector('[data-storybook-card] img') && document.querySelector('[data-storybook-card] img').complete)"), 8000, "storybook image");
}

async function assertLayout(client, viewport) {
  const layout = await evaluate(client, `(() => {
    const root = document.documentElement;
    const visible = element => {
      const style = getComputedStyle(element);
      const rect = element.getBoundingClientRect();
      return style.display !== "none" && style.visibility !== "hidden" && rect.width > 0 && rect.height > 0;
    };
    const outside = Array.from(document.querySelectorAll("button, a, img, select, textarea, .u6g-panel, .storybook-card"))
      .filter(visible)
      .map(element => ({ element, rect: element.getBoundingClientRect() }))
      .filter(item => item.rect.left < -1 || item.rect.right > root.clientWidth + 1)
      .map(item => ({
        tag: item.element.tagName,
        text: (item.element.textContent || item.element.alt || "").trim().slice(0, 80),
        left: Math.round(item.rect.left),
        right: Math.round(item.rect.right)
      }));
    const visuals = Array.from(document.querySelectorAll(".storybook-figure img, .u6g-hero"))
      .map(element => {
        const rect = element.getBoundingClientRect();
        return { width: Math.round(rect.width), height: Math.round(rect.height) };
      });
    return {
      overflow: root.scrollWidth - root.clientWidth,
      outside,
      visuals,
      buttons: document.querySelectorAll("button").length,
      selects: document.querySelectorAll("select").length
    };
  })()`);
  assert.ok(layout.overflow <= 1, `${viewport.label}: horizontal overflow ${layout.overflow}px`);
  assert.deepEqual(layout.outside, [], `${viewport.label}: visible elements exceed the viewport`);
  assert.ok(layout.buttons >= 6, `${viewport.label}: expected activity buttons`);
  assert.ok(layout.selects >= 2, `${viewport.label}: expected visible dropdown blanks`);
  layout.visuals.forEach((visual, index) => {
    assert.ok(visual.width > 250, `${viewport.label}: visual ${index} too narrow`);
    assert.ok(visual.height > 160, `${viewport.label}: visual ${index} too short`);
  });
}

async function fillVisiblePage(client) {
  const blankIds = await evaluate(client, "Array.from(document.querySelectorAll('[data-blank]')).map(select => Number(select.dataset.blank))");
  for (const blankId of blankIds) {
    await evaluate(client, `(() => {
      const select = document.querySelector('[data-blank="${blankId}"]');
      select.value = String(window.JaraLinguaUnit6GrammarStorybookData.blanks[${blankId}].correct);
      select.dispatchEvent(new Event('change', { bubbles: true }));
      return true;
    })()`);
    await delay(40);
  }
}

async function completeStory(client) {
  for (let pageIndex = 0; pageIndex < 4; pageIndex += 1) {
    await fillVisiblePage(client);
    if (pageIndex < 3) {
      await evaluate(client, "document.querySelector('[data-next-page]').click()");
      await delay(120);
    }
  }
  await evaluate(client, "document.querySelector('[data-check-story]').click()");
  await waitFor(() => evaluate(client, "document.querySelector('[data-score-text]').textContent.includes('5.00 / 5.0')"), 4000, "perfect score");
}

async function submitMocked(client) {
  await evaluate(client, `(() => {
    const originalFetch = window.fetch.bind(window);
    window.fetch = function(input, init) {
      if (String(input).includes('/api/intermediate/unit6-grammar-storybook/submit')) {
        return Promise.resolve(new Response(JSON.stringify({
          ok: true,
          evaluationId: 'unit6OliviaScheduleGrammar',
          score: 17,
          total: 17,
          grade: 5,
          incorrectQuestions: [],
          wordCount: 39,
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
    const reflection = document.querySelector('[data-reflection]');
    reflection.value = "Olivia is meeting the producer at ten, so Thursday already has a confirmed arrangement. She will call the radio host now because the interview creates a travel problem. Marcus thinks she should protect the recording day and free up Thursday afternoon.";
    reflection.dispatchEvent(new Event('input', { bubbles: true }));
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
      height: Math.min(contentSize.height, 3000),
      scale: 1
    }
  });
  const file = path.join(os.tmpdir(), `unit6-grammar-storybook-${viewport.label}.png`);
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
        await completeStory(client);
        await submitMocked(client);
      }
      const file = await screenshot(client, viewport);
      console.log(`PASS ${viewport.label} screenshot=${file}`);
      client.close();
    }
  } finally {
    chrome.processHandle.kill();
  }
})();
