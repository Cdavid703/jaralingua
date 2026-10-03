/* Run against a local static preview, or set QR_ORIGIN for the published site. */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require('playwright');

const root = path.resolve(__dirname, '..');
const games = [
  'ingles/intermediate/games.html', 'ingles/intermediate/game-decision-room.html',
  'ingles/intermediate/game-hangman.html', 'ingles/intermediate/game-unit-4-family-impostor.html',
  'ingles/intermediate/game-unit-5-food-vocabulary-memory.html',
  'ingles/intermediate/stereotype-guessing-game.html',
  'ingles/basico/practice-unit-3-favorite-people.html'
];
const pages = process.argv.includes('--games') ? games : [
  ...fs.readdirSync(path.join(root, 'ingles/intermediate')).filter(x => x.endsWith('.html')).map(x => 'ingles/intermediate/' + x),
  games.at(-1)
];
const origin = process.env.QR_ORIGIN || 'http://127.0.0.1:8137';
const shots = process.env.QR_SCREENSHOTS;
if (shots) fs.mkdirSync(shots, { recursive: true });

(async () => {
  const browser = await chromium.launch({ headless: true });
  let checks = 0;
  try {
    for (const width of [390, 768, 1440]) {
      const page = await browser.newPage({ viewport: { width, height: 1000 } });
      // Test only the public QR: no authentication, recording or academic writes.
      await page.route('**/*', route => {
        const request = route.request();
        if (!request.url().startsWith(origin + '/') || /\/api\//.test(request.url())) return route.abort();
        return route.continue();
      });
      for (const name of pages) {
        const label = `${name} @ ${width}`;
        const html = fs.readFileSync(path.join(root, name), 'utf8');
        assert.equal((html.match(/<script[^>]+page-qr-access\.js/g) || []).length, 1, label + ': script count');
        const asset = '/assets/img/page-qr/' + name.replace(/\.html$/, '').replaceAll('/', '-') + '.svg';
        assert.ok(fs.existsSync(path.join(root, asset)), label + ': missing SVG');
        const response = await page.goto(origin + '/' + name, { waitUntil: 'domcontentloaded' });
        assert.equal(response.status(), 200, label);
        await page.locator('.jl-page-qr-card img').waitFor();
        await page.waitForFunction(() => document.querySelector('.jl-page-qr-card img')?.naturalWidth > 0);
        assert.equal(await page.locator('.jl-page-qr-card').count(), 1, label + ': duplicate card');
        assert.equal(await page.locator('.jl-page-qr-card img').getAttribute('src'), asset, label + ': wrong URL');
        const layout = await page.evaluate(() => {
          const card = document.querySelector('.jl-page-qr-card');
          const host = card.parentElement;
          const r = card.getBoundingClientRect();
          const overlap = Array.from(host.children).filter(x => x !== card).some(x => {
            const a = x.getBoundingClientRect();
            return a.width && a.height && a.left < r.right - 1 && a.right > r.left + 1 && a.top < r.bottom - 1 && a.bottom > r.top + 1;
          });
          return { left: r.left, right: r.right, overlap, width: innerWidth };
        });
        assert.ok(layout.left >= 0 && layout.right <= layout.width + 1, label + ': QR outside viewport');
        assert.equal(layout.overlap, false, label + ': QR overlaps hero content');
        await page.locator('.jl-page-qr-open').click();
        assert.equal(await page.locator('#jlPageQrDialog').evaluate(x => x.open), true, label + ': dialog did not open');
        const box = await page.locator('#jlPageQrDialog').boundingBox();
        assert.ok(box.x >= -1 && box.x + box.width <= width + 1 && box.y >= -1, label + ': dialog outside viewport');
        if (shots && name.endsWith('/games.html')) await page.screenshot({ path: path.join(shots, `games-dialog-${width}.png`) });
        await page.keyboard.press('Escape');
        assert.equal(await page.locator('#jlPageQrDialog').evaluate(x => x.open), false, label + ': Escape did not close');
        await page.locator('.jl-page-qr-open').click();
        await page.locator('.jl-page-qr-close').click();
        assert.equal(await page.locator('#jlPageQrDialog').evaluate(x => x.open), false, label + ': close button failed');
        if (shots && (name.endsWith('/games.html') || name.endsWith('/game-unit-4-family-impostor.html'))) {
          await page.screenshot({ path: path.join(shots, `${path.basename(name, '.html')}-${width}.png`) });
        }
        checks++;
      }
      await page.close();
    }
    console.log(`Page QR checks passed: ${pages.length} pages, ${checks} responsive/modal checks at ${origin}.`);
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
