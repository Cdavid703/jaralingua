"use strict";

const assert = require("node:assert/strict");
const { chromium } = require("playwright");

const BASE_URL = process.env.JARALINGUA_TEST_URL || "http://127.0.0.1:8022/ingles/intermediate/mock-integrated-task.html";
const CHROME_PATH = process.env.JARALINGUA_CHROME_PATH || "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";

const viewports = [
  { label: "mobile 390x844", width: 390, height: 844 },
  { label: "tablet 768x1024", width: 768, height: 1024 },
  { label: "laptop 1366x768", width: 1366, height: 768 }
];

function testUser(provider) {
  return {
    credential: provider + "-test-token",
    provider,
    email: provider + "@test.local",
    name: provider === "microsoft" ? "Microsoft Test Student" : "Course Test Student",
    exp: Math.floor(Date.now() / 1000) + 3600
  };
}

async function createPage(browser, viewport) {
  const context = await browser.newContext({ viewport });
  await context.addInitScript(() => {
    window.__googleClicked = false;
    window.__msalConfig = null;
    window.google = {
      accounts: {
        id: {
          initialize() {},
          disableAutoSelect() {},
          renderButton(target) {
            const button = document.createElement("button");
            button.type = "button";
            button.setAttribute("data-google-test-button", "");
            button.textContent = "Sign in with Google";
            button.addEventListener("click", () => { window.__googleClicked = true; });
            target.appendChild(button);
          }
        }
      }
    };
    window.msal = {
      PublicClientApplication: class {
        constructor(config) {
          window.__msalConfig = config;
        }
        loginPopup() {
          return Promise.resolve({
            account: {
              username: "microsoft@test.local",
              name: "Microsoft Test Student",
              homeAccountId: "microsoft-test-student"
            }
          });
        }
        setActiveAccount() {}
        acquireTokenSilent() {
          return Promise.resolve({
            accessToken: "microsoft-test-token",
            expiresOn: new Date(Date.now() + 3600000)
          });
        }
      }
    };
  });

  const page = await context.newPage();
  await page.route("https://accounts.google.com/**", route => route.abort());
  await page.route("https://alcdn.msauth.net/**", route => route.abort());
  await page.route("**/api/**", async route => {
    const request = route.request();
    const url = new URL(request.url());
    if (url.pathname === "/api/intermediate/grades/login" && request.method() === "POST") {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ token: "local-test-token", exp: Math.floor(Date.now() / 1000) + 3600, user: testUser("local") })
      });
      return;
    }
    if (url.pathname === "/api/intermediate/grades") {
      const provider = request.headers()["x-jaralingua-auth-provider"] || "local";
      const identity = testUser(provider);
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ role: "student", student: { id: "AUTH-001", fullName: identity.name, email: identity.email } })
      });
      return;
    }
    await route.fulfill({ status: 200, contentType: "application/json", body: "{}" });
  });
  return { context, page };
}

async function openCentralSignIn(page) {
  await page.goto(BASE_URL, { waitUntil: "load" });
  await page.locator("[data-open-login]").click();
  await page.waitForTimeout(150);
  const panel = page.locator("[data-auth-panel]");
  await panel.waitFor({ state: "visible" });
  assert.match(await page.locator(".toast").innerText(), /Google, Microsoft, and course account/);
  return panel;
}

async function assertVisibleAuthControls(page, panel, label) {
  const google = panel.locator("[data-google-test-button]");
  const microsoft = panel.locator("[data-microsoft-login]");
  const email = panel.locator('[data-local-login-form] input[name="email"]');
  const password = panel.locator('[data-local-login-form] input[name="password"]');
  await google.waitFor({ state: "visible" });
  await microsoft.waitFor({ state: "visible" });
  await email.waitFor({ state: "visible" });
  await password.waitFor({ state: "visible" });

  const layout = await page.evaluate(() => {
    const width = document.documentElement.clientWidth;
    const panelRect = document.querySelector("[data-auth-panel]").getBoundingClientRect();
    return {
      width,
      scrollWidth: document.documentElement.scrollWidth,
      panel: { left: panelRect.left, right: panelRect.right, width: panelRect.width },
      fields: Array.from(document.querySelectorAll("[data-auth-panel] button, [data-auth-panel] input")).map(element => {
        const rect = element.getBoundingClientRect();
        return { left: rect.left, right: rect.right, width: rect.width };
      })
    };
  });
  assert.ok(layout.scrollWidth <= layout.width + 1, label + " has horizontal page overflow");
  assert.ok(layout.panel.left >= -1 && layout.panel.right <= layout.width + 1, label + " auth panel is outside the viewport: " + JSON.stringify(layout));
  assert.ok(layout.fields.every(field => field.left >= -1 && field.right <= layout.width + 1), label + " has an auth control outside the viewport: " + JSON.stringify(layout));
}

async function testResponsiveProviderPanel(browser) {
  for (const viewport of viewports) {
    const { context, page } = await createPage(browser, viewport);
    const panel = await openCentralSignIn(page);
    await assertVisibleAuthControls(page, panel, viewport.label);
    await panel.locator("[data-google-test-button]").click();
    assert.equal(await page.evaluate(() => window.__googleClicked), true, viewport.label + " Google button did not receive the click");
    await context.close();
  }
}

async function testMicrosoftSignIn(browser) {
  const { context, page } = await createPage(browser, viewports[0]);
  const panel = await openCentralSignIn(page);
  await panel.locator("[data-microsoft-login]").click();
  await page.waitForFunction(() => !!sessionStorage.getItem("jaralingua_microsoft_user"));
  const result = await page.evaluate(() => ({
    user: JSON.parse(sessionStorage.getItem("jaralingua_microsoft_user")),
    redirectUri: window.__msalConfig && window.__msalConfig.auth && window.__msalConfig.auth.redirectUri
  }));
  assert.equal(result.user.email, "microsoft@test.local");
  assert.equal(result.redirectUri, new URL("/ingles/intermediate/notas.html", BASE_URL).href);
  await context.close();
}

async function testCourseAccountSignIn(browser) {
  const { context, page } = await createPage(browser, viewports[0]);
  const panel = await openCentralSignIn(page);
  await panel.locator('[data-local-login-form] input[name="email"]').fill("local@test.local");
  await panel.locator('[data-local-login-form] input[name="password"]').fill("course-password");
  await panel.locator('[data-local-login-form] button[type="submit"]').click();
  await page.waitForFunction(() => !!sessionStorage.getItem("jaralingua_local_user"));
  const user = await page.evaluate(() => JSON.parse(sessionStorage.getItem("jaralingua_local_user")));
  assert.equal(user.email, "local@test.local");
  await page.locator("#examContent:not([hidden])").waitFor({ state: "visible" });
  await context.close();
}

(async () => {
  const browser = await chromium.launch({ headless: true, executablePath: CHROME_PATH });
  try {
    await testResponsiveProviderPanel(browser);
    await testMicrosoftSignIn(browser);
    await testCourseAccountSignIn(browser);
    console.log("PASS intermediate mock auth: central sign-in, Google, Microsoft, course account, and responsive layouts");
  } finally {
    await browser.close();
  }
})().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
