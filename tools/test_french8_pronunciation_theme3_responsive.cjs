"use strict";

const assert = require("node:assert/strict");
const os = require("node:os");
const path = require("node:path");
const { pathToFileURL } = require("node:url");
const { chromium } = require("playwright");

const ROOT = path.resolve(__dirname, "..");
const PAGE_PATH = path.join(ROOT, "frances", "Niveau 8", "ateliers", "prononciation-03d-subjonctif-passe.html");
const AUDIO_DIR = path.join(ROOT, "frances", "Niveau 8", "audio", "pronunciation", "theme-03");
const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const VIEWPORTS = [
  { label: "laptop", width: 1366, height: 768 },
  { label: "tablet-landscape", width: 1024, height: 768 },
  { label: "tablet-portrait", width: 768, height: 1024 },
  { label: "mobile", width: 390, height: 844 },
  { label: "mobile-small", width: 320, height: 568 }
];

async function audioDuration(page, file) {
  const url = pathToFileURL(path.join(AUDIO_DIR, file)).href;
  return page.evaluate((src) => new Promise((resolve, reject) => {
    const audio = new Audio();
    const timeout = setTimeout(() => reject(new Error(`Audio metadata timeout: ${src}`)), 8000);
    audio.addEventListener("loadedmetadata", () => {
      clearTimeout(timeout);
      resolve(audio.duration);
    }, { once: true });
    audio.addEventListener("error", () => {
      clearTimeout(timeout);
      reject(new Error(`Audio decoding failed: ${src}`));
    }, { once: true });
    audio.src = src;
    audio.load();
  }), url);
}

(async () => {
  const browser = await chromium.launch({
    headless: true,
    executablePath: CHROME_PATH,
    args: ["--allow-file-access-from-files", "--autoplay-policy=no-user-gesture-required"]
  });

  try {
    const pageUrl = pathToFileURL(PAGE_PATH).href;
    for (const viewport of VIEWPORTS) {
      const page = await browser.newPage({ viewport });
      await page.route(/^https?:\/\//, (route) => route.abort());
      await page.goto(pageUrl, { waitUntil: "load" });
      await page.waitForTimeout(250);

      if (viewport.width < 992) {
        const toggler = page.locator(".navbar-toggler");
        assert.equal(await toggler.isVisible(), true, `${viewport.label}: mobile menu button must be visible`);
        await toggler.click();
        await page.waitForTimeout(450);
        assert.equal(await toggler.getAttribute("aria-expanded"), "true", `${viewport.label}: mobile menu must open`);
        assert.equal(await page.locator("#menuPrincipal").evaluate((node) => node.classList.contains("show")), true, `${viewport.label}: menu content must be shown`);
        await toggler.click();
        await page.waitForTimeout(450);
        assert.equal(await toggler.getAttribute("aria-expanded"), "false", `${viewport.label}: mobile menu must close`);
      }

      if (viewport.label === "laptop") {
        await page.locator('.speed-btn[data-speed="0.75"]').click();
        assert.equal(await page.locator("#modelAudio").evaluate((audio) => audio.playbackRate), 0.75, "Speed control must update model audio");
        await page.locator("#modelButton").click();
        await page.waitForTimeout(120);
        assert.equal(await page.locator("#modelAudio").evaluate((audio) => audio.paused), false, "Model button must start playback");
        await page.locator("#modelButton").click();
        assert.equal(await page.locator("#modelAudio").evaluate((audio) => audio.paused), true, "Model button must pause playback");
        await page.locator(".reset-challenge").click();
        assert.ok((await page.locator("#readingText").textContent()).includes("Je suis soulagée"), "Full reset must return to section 1");
      }

      await page.evaluate(() => {
        const results = document.getElementById("results");
        const studentAudio = document.getElementById("studentAudio");
        const finalSummary = document.querySelector(".final-summary");
        if (results) results.hidden = false;
        if (studentAudio) studentAudio.hidden = false;
        if (finalSummary) {
          finalSummary.hidden = false;
          finalSummary.innerHTML = "<h3>Bilan du défi</h3><div><p><span>Fidélité</span><strong>86/100</strong></p><p><span>Note provisoire</span><strong>4,30/5</strong></p></div>";
        }
      });

      const layout = await page.evaluate(() => {
        const selectors = [
          ".navbar", ".hero", ".nav-pills-panel", ".panel", ".reading-text",
          ".record-zone", ".mic-calibration", ".metrics", ".actions",
          ".pronunciation-submit-panel", ".final-summary"
        ];
        const overflow = [];
        for (const selector of selectors) {
          document.querySelectorAll(selector).forEach((node, index) => {
            const rect = node.getBoundingClientRect();
            if (rect.width > 0 && (rect.left < -1 || rect.right > window.innerWidth + 1)) {
              overflow.push(`${selector}[${index}] left=${rect.left.toFixed(1)} right=${rect.right.toFixed(1)}`);
            }
          });
        }
        const crampedControls = Array.from(document.querySelectorAll("button, select, audio"))
          .filter((node) => node.getBoundingClientRect().width > 0 && node.scrollWidth > node.clientWidth + 2)
          .map((node) => `${node.tagName.toLowerCase()}#${node.id || "-"}.${node.className || "-"}`);
        return {
          viewportWidth: window.innerWidth,
          documentWidth: document.documentElement.scrollWidth,
          bodyWidth: document.body.scrollWidth,
          overflow,
          crampedControls,
          calibrationVisible: Boolean(document.querySelector(".mic-calibration")),
          submitPanelVisible: Boolean(document.querySelector(".pronunciation-submit-panel"))
        };
      });

      assert.ok(layout.documentWidth <= layout.viewportWidth + 1, `${viewport.label}: document overflow ${JSON.stringify(layout)}`);
      assert.ok(layout.bodyWidth <= layout.viewportWidth + 1, `${viewport.label}: body overflow ${JSON.stringify(layout)}`);
      assert.deepEqual(layout.overflow, [], `${viewport.label}: elements leave the viewport`);
      assert.deepEqual(layout.crampedControls, [], `${viewport.label}: control content is clipped`);
      assert.equal(layout.calibrationVisible, true, `${viewport.label}: microphone calibration must exist`);
      assert.equal(layout.submitPanelVisible, true, `${viewport.label}: grade submission panel must exist`);

      const screenshot = path.join(os.tmpdir(), `jaralingua-03d-${viewport.width}x${viewport.height}.png`);
      await page.screenshot({ path: screenshot, fullPage: true });
      await page.close();
    }

    const audioPage = await browser.newPage();
    await audioPage.route(/^https?:\/\//, (route) => route.abort());
    await audioPage.goto(pageUrl, { waitUntil: "load" });
    const durations = {};
    for (const file of ["section-1.mp3", "section-2.mp3", "section-3.mp3", "section-4.mp3", "n8-03d-subjonctif-passe-modele-france.mp3"]) {
      durations[file] = await audioDuration(audioPage, file);
      assert.ok(Number.isFinite(durations[file]) && durations[file] > 2, `${file} must expose valid browser metadata`);
    }
    assert.ok(durations["n8-03d-subjonctif-passe-modele-france.mp3"] > 20, "The final model must contain the full paragraph");
    await audioPage.close();

    console.log(`French 8 pronunciation 03D responsive QA passed. Audio durations: ${JSON.stringify(durations)}`);
  } finally {
    await browser.close();
  }
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
