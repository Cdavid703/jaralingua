import assert from "node:assert/strict";
import fs from "node:fs";
import http from "node:http";
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const { chromium } = require("C:/Users/USER/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright");

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const mime = { ".css": "text/css", ".html": "text/html", ".js": "text/javascript", ".png": "image/png", ".svg": "image/svg+xml" };
const server = http.createServer((request, response) => {
  const pathname = decodeURIComponent(new URL(request.url, "http://127.0.0.1").pathname);
  const target = path.resolve(root, "." + pathname);
  if (!target.startsWith(root + path.sep) || !fs.existsSync(target) || !fs.statSync(target).isFile()) {
    response.writeHead(404).end("Not found");
    return;
  }
  response.writeHead(200, { "Content-Type": mime[path.extname(target)] || "application/octet-stream" });
  fs.createReadStream(target).pipe(response);
});

await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
const { port } = server.address();
const browser = await chromium.launch({ executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe", headless: true });
const page = await browser.newPage({ viewport: { width: 390, height: 844 } });

try {
  await page.addInitScript(() => {
    sessionStorage.setItem("jaralingua_local_user", JSON.stringify({ credential: "test-token", email: "andres@example.test", name: "Andrés Orrego" }));
  });
  await page.route("**/assets/js/google-auth.js*", (route) => route.fulfill({ contentType: "text/javascript", body: "" }));
  await page.route("https://accounts.google.com/**", (route) => route.abort());
  await page.route("**/api/intermediate2/midterm-writing/state", async (route) => {
    await route.fulfill({
      contentType: "application/json",
      body: JSON.stringify({
        role: "student",
        student: { id: "1032018999", fullName: "ANDRES ORREGO ALVAREZ" },
        state: { isOpen: false },
        submission: {
          studentId: "1032018999",
          studentName: "ANDRES ORREGO ALVAREZ",
          receiptId: "I2MW-TEST",
          submittedAt: "2026-08-22T16:42:16Z",
          wordCount: 291,
          grade: 3,
          status: "graded",
          body: "Student text",
          teacherComments: "[[I get kicked of my dream job]] → {{I was fired from my dream job.}}\n<img src=x onerror=alert(1)>"
        }
      })
    });
  });
  await page.goto(`http://127.0.0.1:${port}/ingles/intermediate-2/intermediate-course-2-midterm-writing-task.html`, { waitUntil: "domcontentloaded" });
  await page.locator(".teacher-feedback-card").waitFor();
  assert.equal(await page.locator("mark.feedback-error").textContent(), "I get kicked of my dream job");
  assert.equal(await page.locator(".feedback-correction").textContent(), "I was fired from my dream job.");
  assert.equal(await page.locator(".teacher-feedback-card img").count(), 0, "Teacher feedback must not render arbitrary HTML.");
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
  assert.equal(overflow, false, "Highlighted feedback must not create horizontal overflow at 390px.");
  console.log("Intermediate 2 midterm highlighted feedback UI passed.");
} finally {
  await browser.close();
  await new Promise((resolve) => server.close(resolve));
}
