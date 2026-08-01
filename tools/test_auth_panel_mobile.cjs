const { chromium } = require("playwright");

const chromePath = process.env.PLAYWRIGHT_CHROME_PATH || "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const baseUrl = process.env.JARALINGUA_TEST_BASE || "http://127.0.0.1:8031";

const pages = [
  "/ingles/intermediate/notas.html",
  "/ingles/basico/notas.html"
];

async function checkPage(browser, path) {
  const page = await browser.newPage({ viewport: { width: 390, height: 844 }, isMobile: true });
  await page.goto(baseUrl + path, { waitUntil: "networkidle", timeout: 30000 });
  await page.waitForSelector("[data-jaralingua-auth-nav] [data-auth-toggle]", { timeout: 10000 });
  await page.click("[data-jaralingua-auth-nav] [data-auth-toggle]");

  const result = await page.evaluate(() => {
    const navTrigger = document.querySelector("[data-jaralingua-auth-nav] [data-auth-toggle]");
    const panel = document.querySelector("[data-auth-panel]");
    const floating = Array.from(document.querySelectorAll(".jaralingua-auth"))
      .filter((element) => element.offsetParent !== null);
    const rect = panel ? panel.getBoundingClientRect() : null;
    return {
      hasNavTrigger: Boolean(navTrigger),
      panelHidden: panel ? panel.hidden : true,
      panelHeight: rect ? rect.height : 0,
      panelWidth: rect ? rect.width : 0,
      panelTop: rect ? rect.top : 0,
      panelBottom: rect ? rect.bottom : 0,
      visibleFloatingAuthCount: floating.length,
      viewportHeight: window.innerHeight
    };
  });

  await page.close();

  if (!result.hasNavTrigger) throw new Error(`${path}: missing top auth trigger`);
  if (result.panelHidden) throw new Error(`${path}: auth panel stayed hidden after click`);
  if (result.visibleFloatingAuthCount !== 0) {
    throw new Error(`${path}: floating auth button is visible`);
  }
  if (result.panelHeight < 300) {
    throw new Error(`${path}: auth panel is collapsed (${Math.round(result.panelHeight)}px)`);
  }
  if (result.panelBottom > result.viewportHeight + 1) {
    throw new Error(`${path}: auth panel overflows the viewport`);
  }
  if (result.panelWidth < 300) {
    throw new Error(`${path}: auth panel is too narrow (${Math.round(result.panelWidth)}px)`);
  }
  console.log(`OK ${path} panel=${Math.round(result.panelWidth)}x${Math.round(result.panelHeight)}`);
}

(async () => {
  const browser = await chromium.launch({ headless: true, executablePath: chromePath });
  try {
    for (const path of pages) {
      await checkPage(browser, path);
    }
  } finally {
    await browser.close();
  }
})().catch((error) => {
  console.error(error.message || error);
  process.exit(1);
});
