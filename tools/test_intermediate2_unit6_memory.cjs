const assert = require('node:assert/strict'), fs = require('node:fs'), crypto = require('node:crypto'), { chromium } = require('playwright');
const origin = process.env.MEMORY_ORIGIN || 'http://127.0.0.1:8139';
const url = origin + '/ingles/intermediate-2/game-unit-6-disaster-news-memory.html';
const data = JSON.parse(fs.readFileSync('assets/data/english-intermediate2-unit6-memory.json')).items;
assert.equal(data.length, 20); assert.equal(new Set(data.map(x => x.id)).size, 20);
for (const bad of ['ambulance', 'evacuation', 'volunteers', 'volcanic eruption']) assert(!data.some(x => x.term === bad));
assert.deepEqual(['events', 'effects', 'help'].map(g => data.filter(x => x.group === g).length), [7, 8, 5]);
const models = JSON.parse(fs.readFileSync('ingles/intermediate-2/audio/unit-6-disaster-memory/models.json'));
assert.equal(models.items.length, 40);
for (const m of models.items) assert.equal(crypto.createHash('sha256').update(fs.readFileSync('ingles/intermediate-2/audio/unit-6-disaster-memory/' + m.file)).digest('hex'), m.sha256);
(async () => {
  const browser = await chromium.launch({ headless: true, ...(process.env.MEMORY_CHROME ? { channel: 'chrome' } : {}) });
  try {
    const p = await browser.newPage(); p.setDefaultTimeout(10000);
    const errors = []; p.on('pageerror', e => errors.push(e.message));
    await p.route('https://accounts.google.com/**', r => r.abort());
    await p.goto(url); await p.locator('#memoryBoard button').first().waitFor();
    assert.equal(await p.locator('#memoryBoard button').count(), 40);
    assert.equal(await p.locator('.dm-tabs').count(), 0);
    assert.equal(await p.locator('.vocab-word').count(), 20);
    for (const item of data) {
      const pair = p.locator('[data-pair="' + item.id + '"]'); assert.equal(await pair.count(), 2);
      assert.equal(await pair.first().locator('.card-front').innerHTML(), await pair.last().locator('.card-front').innerHTML());
    }
    for (const width of [320, 390, 768, 1024, 1440, 1920]) {
      await p.setViewportSize({ width, height: 900 });
      assert(await p.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), 'overflow ' + width);
      await p.locator('.jl-page-qr-open').click(); assert(await p.locator('.jl-page-qr-dialog').isVisible()); await p.keyboard.press('Escape');
      assert(await p.locator('.dm-hero>img').evaluate(i => i.complete && i.naturalWidth > 0));
      if (width >= 1024) {
        const boxes = await Promise.all(['.team-panel[data-team="0"]', '.turn-center', '.team-panel[data-team="1"]'].map(s => p.locator(s).boundingBox()));
        assert(Math.max(...boxes.map(b => b.y)) - Math.min(...boxes.map(b => b.y)) < 5, 'team row');
      }
      console.log('PASS responsive, team row, hero and QR', width);
    }
    await p.setViewportSize({ width: 1440, height: 1000 });
    await p.locator('.vocab-word').first().hover(); assert(await p.locator('.word-tip').first().isVisible());
    assert(await p.locator('#modelAudio').evaluate(a => a.paused));
    for (const word of await p.locator('.vocab-word').all()) { await word.click(); await p.waitForFunction(() => document.querySelector('#modelAudio').currentTime > 0); }
    await p.locator('#audioSpeed').selectOption('0.75'); assert.equal(await p.locator('#modelAudio').evaluate(a => a.playbackRate), .75);
    await p.locator('#audioSpeed').selectOption('1');
    for (const group of ['events', 'effects', 'help', 'all']) {
      await p.locator('#memoryGroup').selectOption(group);
      assert.equal(await p.locator('#memoryBoard button').count(), (group === 'all' ? 20 : data.filter(x => x.group === group).length) * 2);
    }
    const clickPair = async id => { const pair = p.locator('[data-pair="' + id + '"]'); await pair.first().click(); await pair.last().click(); await p.locator('#readingGate').waitFor({ state: 'visible' }); };
    await p.locator('#memoryGroup').selectOption('help');
    const help = data.filter(x => x.group === 'help'), a = help[0], b = help[1];
    await p.locator('[data-pair="' + a.id + '"]').first().click();
    await p.waitForFunction(() => document.querySelector('#modelAudio').currentTime > 0);
    assert.equal(await p.locator('#modelAudio').getAttribute('src'), a.audio);
    await p.locator('[data-pair="' + b.id + '"]').first().click();
    await p.waitForFunction(() => document.querySelector('#turnName').textContent === 'Team 2');
    assert.equal(await p.locator('.memory-card.is-flipped').count(), 0);
    await clickPair(a.id); assert.equal(await p.locator('#score1').innerText(), '0');
    await p.keyboard.press('Escape'); assert.equal(await p.locator('.memory-card.is-flipped').count(), 0);
    await clickPair(a.id); await p.locator('#gateExample summary').click(); await p.locator('#hearSentence').click();
    await p.waitForFunction(() => document.querySelector('#modelAudio').currentTime > 0);
    assert.equal(await p.locator('#modelAudio').getAttribute('src'), a.sentenceAudio);
    await p.locator('#confirmReading').evaluate(el => { el.click(); el.click(); });
    assert.equal(await p.locator('#score1').innerText(), '1'); assert.equal(await p.locator('#turnName').innerText(), 'Team 2');
    for (const item of help.slice(1)) { await clickPair(item.id); await p.locator('#confirmReading').click(); }
    assert(await p.locator('#winnerOverlay').isVisible()); assert.match(await p.locator('#winnerTitle').innerText(), /Team 2 wins/);
    assert.equal(await p.locator('.memory-card.is-matched').count(), 10);
    await p.locator('#playAgain').click(); assert.equal(await p.locator('.memory-card.is-matched').count(), 0);
    // Reset while a delayed mismatch is pending; its callback must not erase the new turn.
    await p.locator('[data-pair="' + a.id + '"]').first().click(); await p.locator('[data-pair="' + b.id + '"]').first().click();
    await p.locator('#newGame').click(); await p.locator('#memoryBoard button').first().click();
    await p.waitForTimeout(1800); assert.equal(await p.locator('.memory-card.is-flipped').count(), 1); assert.equal(await p.locator('#turnName').innerText(), 'Team 1');
    await p.locator('#newGame').click(); await p.locator('#soundButton').click();
    await p.locator('#memoryBoard button').first().click(); assert(await p.locator('#modelAudio').evaluate(a => a.paused && !a.getAttribute('src')));
    await p.locator('#soundButton').click(); await p.locator('#repeatModel').click(); await p.waitForFunction(() => document.querySelector('#modelAudio').currentTime > 0);
    await p.locator('#newGame').click(); await p.locator('#projectGame').click(); await p.waitForFunction(() => document.fullscreenElement);
    await clickPair(a.id); assert(await p.locator('#readingGate').evaluate(el => document.fullscreenElement.contains(el)));
    await p.locator('#retryPair').click(); await p.locator('#projectGame').click(); await p.waitForFunction(() => !document.fullscreenElement);
    await p.emulateMedia({ reducedMotion: 'reduce' }); await clickPair(a.id); await p.locator('#confirmReading').click(); assert.equal(await p.locator('.confetti-piece').count(), 0);
    await p.emulateMedia({ reducedMotion: 'no-preference' });
    const decoded = await p.evaluate(async files => {
      const context = new AudioContext();
      for (const file of files) { const response = await fetch(file); if (!response.ok) throw Error(file); const a = await context.decodeAudioData(await response.arrayBuffer()); if (!a.duration) throw Error(file); }
      await context.close(); return files.length;
    }, data.flatMap(item => [item.audio, item.sentenceAudio])); assert.equal(decoded, 40);
    await p.locator('#memoryGroup').selectOption('all');
    await p.locator('#memoryBoard').scrollIntoViewIfNeeded(); await p.screenshot({ path: '/private/tmp/memory6-basic2-board.png' });
    await p.locator('#game').scrollIntoViewIfNeeded(); await p.screenshot({ path: '/private/tmp/memory6-basic2-desktop.png', fullPage: true });
    await p.setViewportSize({ width: 390, height: 900 }); await p.screenshot({ path: '/private/tmp/memory6-basic2-mobile.png', fullPage: true });
    await clickPair(data[0].id); assert(await p.locator('#confirmReading').isVisible()); await p.screenshot({ path: '/private/tmp/memory6-basic2-gate.png' }); await p.locator('#retryPair').click();
    assert.deepEqual(errors, []);
    await p.goto(origin + '/ingles/intermediate-2/practice-lab.html');
    await p.locator('#unit6ActivityGrid a[href="/ingles/intermediate-2/game-unit-6-disaster-news-memory.html"]').waitFor();
    assert.equal(await p.locator('#unit6ActivityCount').textContent(), '7 activities');
    const recovery = await browser.newPage(); let fail = true;
    await recovery.route('**/english-intermediate2-unit6-memory.json', r => fail ? r.fulfill({ status: 503, body: 'Unavailable' }) : r.continue());
    await recovery.goto(url); await recovery.locator('#retryLoad').waitFor({ state: 'visible' }); assert(await recovery.locator('#newGame').isDisabled());
    fail = false; await recovery.locator('#retryLoad').click(); await recovery.locator('#memoryBoard button').first().waitFor(); await recovery.close();
    console.log('PASS 20 words, 40 unchanged audio hashes/decodes, every word playback, identical picture pairs, turns, teacher scoring, retry, winner, reset race, mute, projection, reduced motion, catalog and load recovery');
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exit(1); });
