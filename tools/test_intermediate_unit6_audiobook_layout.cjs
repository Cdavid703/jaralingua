const assert = require("assert");
const { spawn } = require("child_process");
const fs = require("fs");
const path = require("path");
const { chromium } = require("playwright");

const root = path.resolve(__dirname, "..");
const port = 8036;
const chromePath = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE || "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const server = spawn(process.execPath, ["-e", `
  const http = require("http");
  const fs = require("fs");
  const path = require("path");
  const root = ${JSON.stringify(root)};
  const mime = { ".html": "text/html; charset=utf-8", ".css": "text/css", ".js": "application/javascript", ".webp": "image/webp", ".png": "image/png", ".mp3": "audio/mpeg", ".ico": "image/x-icon" };
  http.createServer((req, res) => {
    const urlPath = decodeURIComponent(req.url.split("?")[0]).replace(/^\\/+/, "");
    const filePath = path.join(root, urlPath || "index.html");
    if (!filePath.startsWith(root)) { res.writeHead(403); res.end("Forbidden"); return; }
    fs.readFile(filePath, (err, data) => {
      if (err) { res.writeHead(404); res.end("Not found"); return; }
      res.writeHead(200, { "Content-Type": mime[path.extname(filePath).toLowerCase()] || "application/octet-stream" });
      res.end(data);
    });
  }).listen(${port}, "127.0.0.1");
`], { stdio: "ignore" });

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

let browser;

(async () => {
  await delay(700);
  browser = await chromium.launch({
    headless: true,
    executablePath: fs.existsSync(chromePath) ? chromePath : undefined,
  });
  const page = await browser.newPage();
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });

  const viewports = [
    { width: 390, height: 844, label: "mobile" },
    { width: 768, height: 1024, label: "tablet" },
    { width: 1366, height: 768, label: "laptop" },
    { width: 1920, height: 1080, label: "desktop" },
  ];

  for (const viewport of viewports) {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    await page.goto(`http://127.0.0.1:${port}/ingles/intermediate/audiobook-unit-6-little-red-riding-hood.html`, { waitUntil: "networkidle" });
    await page.evaluate(async () => {
      const steps = Math.ceil(document.documentElement.scrollHeight / 500);
      for (let index = 0; index <= steps; index += 1) {
        window.scrollTo(0, index * 500);
        await new Promise((resolve) => setTimeout(resolve, 30));
      }
      window.scrollTo(0, 0);
    });
    const metrics = await page.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
      imageBroken: Array.from(document.images).filter((img) => !img.complete || img.naturalWidth < 100).map((img) => img.src),
      audioCount: document.querySelectorAll("[data-audiobook-audio]").length,
      speedCount: document.querySelectorAll("[data-audiobook-speed]").length,
      sceneCount: document.querySelectorAll(".scene-card").length,
      heroHeight: document.querySelector(".u6a-hero").getBoundingClientRect().height,
    }));
    assert.ok(metrics.scrollWidth <= metrics.clientWidth + 2, `${viewport.label} has horizontal overflow: ${metrics.scrollWidth} > ${metrics.clientWidth}`);
    assert.deepStrictEqual(metrics.imageBroken, [], `${viewport.label} has broken images`);
    assert.strictEqual(metrics.audioCount, 6, `${viewport.label} should have 6 audio elements`);
    assert.strictEqual(metrics.speedCount, 3, `${viewport.label} should have exactly 3 speed buttons`);
    assert.strictEqual(metrics.sceneCount, 5, `${viewport.label} should have 5 scenes`);
    assert.ok(metrics.heroHeight >= 480, `${viewport.label} hero is unexpectedly short`);
  }

  assert.deepStrictEqual(errors, [], "Browser errors detected: " + errors.join(" | "));
  await browser.close();
  server.kill();
  console.log("Unit 6 audiobook layout checks passed.");
})().catch(async (error) => {
  try { if (browser) await browser.close(); } catch (_) {}
  server.kill();
  console.error(error);
  process.exit(1);
});
