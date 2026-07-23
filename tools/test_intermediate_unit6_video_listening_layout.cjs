"use strict";

const assert = require("node:assert/strict");
const childProcess = require("node:child_process");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");

const BASE_URL = process.env.JARALINGUA_TEST_URL || "http://127.0.0.1:8034/ingles/intermediate/video-listening-unit-6-olivias-week.html";
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
  const port = 9560 + Math.floor(Math.random() * 250);
  const userDataDir = fs.mkdtempSync(path.join(os.tmpdir(), "unit6-video-listening-chrome-"));
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
  await client.send("Network.setBlockedURLs", { urls: ["https://accounts.google.com/*", "https://login.microsoftonline.com/*", "https://www.youtube.com/*"] });
  await client.send("Emulation.setDeviceMetricsOverride", {
    width: viewport.width,
    height: viewport.height,
    deviceScaleFactor: 1,
    mobile: viewport.width < 700
  });
  const load = client.once("Page.loadEventFired");
  await client.send("Page.navigate", { url: BASE_URL });
  await load;
  await waitFor(() => evaluate(client, "document.querySelectorAll('[data-question-card]').length === 10"), 8000, "rendered video quiz");
}

async function assertLayout(client, viewport) {
  const layout = await evaluate(client, `(() => {
    const root = document.documentElement;
    const visible = element => {
      const style = getComputedStyle(element);
      const rect = element.getBoundingClientRect();
      return style.display !== "none" && style.visibility !== "hidden" && rect.width > 0 && rect.height > 0;
    };
    const outside = Array.from(document.querySelectorAll("main button, main a, main img, .u6v-panel, .u6v-question-card, .u6v-hero, .u6v-video-frame"))
      .filter(visible)
      .map(element => ({ element, rect: element.getBoundingClientRect() }))
      .filter(item => item.rect.left < -1 || item.rect.right > root.clientWidth + 1)
      .map(item => ({
        tag: item.element.tagName,
        text: (item.element.textContent || item.element.alt || "").trim().slice(0, 80),
        left: Math.round(item.rect.left),
        right: Math.round(item.rect.right)
      }));
    const hero = document.querySelector(".u6v-hero").getBoundingClientRect();
    const video = document.querySelector(".u6v-video-frame").getBoundingClientRect();
    return {
      overflow: root.scrollWidth - root.clientWidth,
      clientWidth: root.clientWidth,
      outside,
      heroWidth: Math.round(hero.width),
      heroHeight: Math.round(hero.height),
      videoWidth: Math.round(video.width),
      videoHeight: Math.round(video.height),
      buttons: document.querySelectorAll("button").length,
      links: document.querySelectorAll("a").length,
      questions: document.querySelectorAll("[data-question-card]").length,
      textareas: document.querySelectorAll("textarea").length,
      audios: document.querySelectorAll("audio").length,
      speedButtons: Array.from(document.querySelectorAll("[data-youtube-speed]")).map(button => button.dataset.youtubeSpeed).join(","),
      teacherTranscript: document.querySelector("[data-video-script-box]").textContent.trim()
    };
  })()`);
  assert.ok(layout.overflow <= 1, `${viewport.label}: horizontal overflow ${layout.overflow}px`);
  assert.deepEqual(layout.outside, [], `${viewport.label}: visible elements exceed the viewport`);
  assert.ok(layout.heroWidth >= layout.clientWidth - 2, `${viewport.label}: hero should span the viewport`);
  assert.ok(layout.heroHeight > 260, `${viewport.label}: hero image area too short`);
  assert.ok(layout.videoWidth > 300, `${viewport.label}: video frame too narrow`);
  assert.ok(layout.videoHeight > 160, `${viewport.label}: video frame too short`);
  assert.ok(layout.buttons >= 6, `${viewport.label}: expected speed, quiz, delivery, and transcript buttons`);
  assert.ok(layout.links >= 6, `${viewport.label}: expected navigation and support links`);
  assert.equal(layout.questions, 10, `${viewport.label}: expected ten questions`);
  assert.equal(layout.textareas, 0, `${viewport.label}: video listening should not include a writing box`);
  assert.equal(layout.audios, 0, `${viewport.label}: video listening should not include browser audio elements`);
  assert.equal(layout.speedButtons, "0.75,1,1.25", `${viewport.label}: speed buttons mismatch`);
  assert.equal(layout.teacherTranscript, "", `${viewport.label}: transcript should not be exposed`);
}

async function assertControls(client) {
  await evaluate(client, "document.querySelector('[data-youtube-speed=\"1.25\"]').click()");
  await waitFor(() => evaluate(client, "document.querySelector('[data-youtube-speed=\"1.25\"]').classList.contains('is-active')"), 3000, "1.25 speed active");
  const speedFeedback = await evaluate(client, "document.querySelector('#youtubeSpeedStatus').textContent");
  assert.ok(speedFeedback.includes("1.25x"), "speed feedback should confirm 1.25x selection");

  await evaluate(client, `(() => {
    window.JaraLinguaUnit6VideoListeningData.answers.forEach((answer, index) => {
      const input = document.querySelector('input[name="q' + index + '"][value="' + answer + '"]');
      input.checked = true;
      input.dispatchEvent(new Event('change', { bubbles: true }));
    });
    return true;
  })()`);
  await evaluate(client, "document.querySelector('[data-check-video-answers]').click()");
  await waitFor(() => evaluate(client, "document.querySelector('[data-video-quiz-feedback]').textContent.includes('5.00 / 5.0')"), 4000, "perfect video score");
  await waitFor(() => evaluate(client, "!document.querySelector('[data-send-video-teacher]').disabled"), 4000, "send button enabled");

  await evaluate(client, `(() => {
    const wrong = document.querySelector('input[name="q0"][value="0"]');
    wrong.checked = true;
    wrong.dispatchEvent(new Event('change', { bubbles: true }));
    return true;
  })()`);
  await waitFor(() => evaluate(client, "document.querySelector('[data-send-video-teacher]').disabled"), 4000, "send disabled after answer change");

  await evaluate(client, `(() => {
    window.JaraLinguaUnit6VideoListeningData.answers.forEach((answer, index) => {
      const input = document.querySelector('input[name="q' + index + '"][value="' + answer + '"]');
      input.checked = true;
      input.dispatchEvent(new Event('change', { bubbles: true }));
    });
    return true;
  })()`);
  await evaluate(client, "document.querySelector('[data-check-video-answers]').click()");

  await evaluate(client, `(() => {
    const originalFetch = window.fetch.bind(window);
    window.fetch = function(input, init) {
      if (String(input).includes('/api/intermediate/unit6-video-listening/submit')) {
        return Promise.resolve(new Response(JSON.stringify({
          ok: true,
          evaluationId: 'unit6OliviasWeekVideoListening',
          score: 10,
          total: 10,
          grade: 5,
          incorrectQuestions: [],
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
  await waitFor(() => evaluate(client, "!document.querySelector('[data-send-video-teacher]').disabled"), 4000, "send re-enabled");
  await evaluate(client, "document.querySelector('[data-send-video-teacher]').click()");
  await waitFor(() => evaluate(client, "document.querySelector('[data-video-delivery-status]').textContent.includes('Submitted to teacher')"), 4000, "submission confirmation");
  await waitFor(() => evaluate(client, "document.querySelector('[data-video-delivery-status]').textContent.includes('Gradebook weight: 0%')"), 4000, "0 percent confirmation");
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
  const file = path.join(os.tmpdir(), `unit6-video-listening-${viewport.label}.png`);
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
        await assertControls(client);
      }
      const file = await screenshot(client, viewport);
      console.log(`PASS ${viewport.label} screenshot=${file}`);
      client.close();
    }
  } finally {
    chrome.processHandle.kill();
  }
})();
