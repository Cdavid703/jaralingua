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
const pages = process.argv.includes('--basic1') ? fs.readdirSync(path.join(root, 'ingles/basico')).filter(x => x.endsWith('.html')).map(x => 'ingles/basico/' + x) : process.argv.includes('--games') ? games : [
  ...fs.readdirSync(path.join(root, 'ingles/intermediate')).filter(x => x.endsWith('.html')).map(x => 'ingles/intermediate/' + x),
  games.at(-1)
];
const origin = process.env.QR_ORIGIN || 'http://127.0.0.1:8137';
// This legacy route already redirects to the Unit 5 activity. Preserve that route.
const redirects = {
  'ingles/intermediate/pair-showcase-unit-6-colombian-food.html': 'ingles/intermediate/pair-showcase-unit-5-colombian-food.html'
};
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
        assert.match(html.split('</head>')[0], /<script[^>]+page-qr-access\.js[^>]+fetchpriority="high"/, label + ': QR script must load ahead of gallery images');
        const qrAsset = name => '/assets/img/page-qr/' + name.replace(/\.html$/, '').replaceAll('/', '-') + '.svg';
        assert.ok(fs.existsSync(path.join(root, qrAsset(name))), label + ': missing SVG');
        const destination = redirects[name] || name;
        const asset = qrAsset(destination);
        const legacyQr = name.endsWith('/practice-unit-5-countable-uncountable-food.html');
        const card = legacyQr ? '.mb-qr' : '.jl-page-qr-card';
        const open = legacyQr ? '#marketQrOpen' : '.jl-page-qr-open';
        const dialog = legacyQr ? '#marketQrDialog' : '#jlPageQrDialog';
        const close = legacyQr ? '#marketQrClose' : '.jl-page-qr-close';
        const response = await page.goto(origin + '/' + name, { waitUntil: 'domcontentloaded' });
        assert.equal(response.status(), 200, label);
        if (redirects[name]) await page.waitForURL(origin + '/' + destination);
        await page.locator(card + ' img').waitFor();
        await page.waitForFunction(selector => document.querySelector(selector + ' img')?.naturalWidth > 0, card);
        assert.equal(await page.locator('.jl-page-qr-card, .mb-qr').count(), 1, label + ': duplicate card');
        assert.equal(await page.locator(card + ' img').getAttribute('src'), asset, label + ': wrong URL');
        const layout = await page.evaluate(selector => {
          const card = document.querySelector(selector);
          const host = card.parentElement;
          const r = card.getBoundingClientRect();
          const intersects = a => a.width && a.height && a.left < r.right - 1 && a.right > r.left + 1 && a.top < r.bottom - 1 && a.bottom > r.top + 1;
          // Inspect visible text/controls, not container padding reserved for a QR.
          let overlap = false;
          const walker = document.createTreeWalker(host, NodeFilter.SHOW_TEXT);
          while (walker.nextNode()) {
            const node = walker.currentNode;
            if (!node.textContent.trim() || card.contains(node)) continue;
            const range = document.createRange(); range.selectNodeContents(node);
            if (Array.from(range.getClientRects()).some(intersects)) overlap = true;
          }
          if (Array.from(host.querySelectorAll('a,button,input,select')).filter(x => !card.contains(x)).some(x => intersects(x.getBoundingClientRect()))) overlap = true;
          return { left: r.left, right: r.right, overlap, width: innerWidth };
        }, card);
        assert.ok(layout.left >= 0 && layout.right <= layout.width + 1, label + ': QR outside viewport');
        assert.equal(layout.overlap, false, label + ': QR overlaps hero content');
        await page.locator(open).click();
        assert.equal(await page.locator(dialog).evaluate(x => x.open), true, label + ': dialog did not open');
        const box = await page.locator(dialog).boundingBox();
        assert.ok(box.x >= -1 && box.x + box.width <= width + 1 && box.y >= -1, label + ': dialog outside viewport');
        if (shots && name.endsWith('/games.html')) await page.screenshot({ path: path.join(shots, `games-dialog-${width}.png`) });
        await page.keyboard.press('Escape');
        assert.equal(await page.locator(dialog).evaluate(x => x.open), false, label + ': Escape did not close');
        await page.locator(open).click();
        await page.locator(close).click();
        assert.equal(await page.locator(dialog).evaluate(x => x.open), false, label + ': close button failed');
        if (shots && (name.endsWith('/games.html') || name.endsWith('/game-unit-4-family-impostor.html'))) {
          await page.screenshot({ path: path.join(shots, `${path.basename(name, '.html')}-${width}.png`) });
        }
        checks++;
      }
      console.log(`Verified ${pages.length} QR pages at ${width}px.`);
      await page.close();
    }
    console.log(`Page QR checks passed: ${pages.length} pages, ${checks} responsive/modal checks at ${origin}.`);
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
