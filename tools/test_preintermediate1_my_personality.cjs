/* Draft lifecycle checks without a browser or real student data. */
const {test} = require('node:test');
const assert = require('node:assert/strict');
const {readFileSync} = require('node:fs');
const {runInNewContext} = require('node:vm');
const {resolve} = require('node:path');
const code = readFileSync(resolve(__dirname, '../assets/js/preintermediate1-my-personality.js'), 'utf8');
const key = 'jl-pi1-my-personality-writing-v1';

function page(options = {}) {
  class Element {
    constructor() { this.value = ''; this.textContent = ''; this.hidden = true; this.checked = false; this.events = {}; this.dataset = {}; }
    addEventListener(name, fn) { (this.events[name] ||= []).push(fn); }
    async fire(name) { for (const fn of this.events[name] || []) await fn({preventDefault() {}}); }
    focus() { this.focused = true; }
    select() { this.selected = true; }
    setAttribute() {}
    pause() { this.paused = true; }
    play() { this.paused = false; return Promise.resolve(); }
  }
  const ids = new Map();
  const el = id => { if (!ids.has(id)) ids.set(id, new Element()); return ids.get(id); };
  const checks = Array.from({length: 5}, () => new Element());
  const speeds = ['0.75', '1', '1.25'].map(value => { const e = new Element(); e.dataset.mpSpeed = value; return e; });
  const store = options.store || new Map();
  const sessionStorage = {
    getItem(k) { if (options.failRead) throw new Error('Blocked'); return store.get(k) || null; },
    setItem(k, v) { if (options.failWrite) throw new Error('Quota'); store.set(k, v); }
  };
  el('mp-data').textContent = JSON.stringify({instruction: 'Original instruction', instructionAudio: '/instruction.mp3', vocabulary: []});
  const doc = new Element(); doc.getElementById = el;
  doc.querySelectorAll = selector => selector === '[data-mp-check]' ? checks : selector === '[data-mp-speed]' ? speeds : [];
  doc.querySelector = () => el('stop');
  const win = new Element();
  runInNewContext(code, {document: doc, window: win, sessionStorage, navigator: options.navigator || {}, location: {hash: ''}});
  return {el, checks, store, window: win, speeds,
    async write(text) { el('mp-writing').value = text; await el('mp-writing').fire('input'); },
    async click(id) { await el(id).fire('click'); },
    async check(i) { checks[i].checked = true; await checks[i].fire('change'); }
  };
}

test('reload preserves exact free text and self-check without touching another activity', async () => {
  const store = new Map([['another-activity', 'untouched']]), a = page({store});
  const text = 'I’m shy, but friendly.\nSometimes I’m creative because I draw. <script>example</script>';
  await a.write(text); await a.check(0); await a.check(3);
  const b = page({store});
  assert.equal(b.el('mp-writing').value, text);
  assert.deepEqual(b.checks.map(c => c.checked), [true, false, false, true, false]);
  assert.equal(store.get('another-activity'), 'untouched');
});
test('reset twice and reload still allow recovery of writing and marks', async () => {
  const a = page(); await a.write('I am friendly.'); await a.check(1);
  await a.click('mp-reset'); await a.click('mp-reset');
  const b = page({store: a.store});
  assert.equal(b.el('mp-writing').value, ''); assert.equal(b.el('mp-undo').hidden, false);
  await b.click('mp-undo');
  assert.equal(b.el('mp-writing').value, 'I am friendly.'); assert.equal(b.checks[1].checked, true);
  assert.equal(b.el('mp-undo').hidden, true);
});
test('new work after reset retires the previous reset backup', async () => {
  const a = page(); await a.write('Old text'); await a.click('mp-reset'); await a.write('New text');
  const b = page({store: a.store}); await b.click('mp-undo');
  assert.equal(b.el('mp-writing').value, 'New text'); assert.equal(b.el('mp-undo').hidden, true);
});
test('review is personal guidance and an edit withdraws the previous result', async () => {
  const a = page(); await a.click('mp-review');
  assert.match(a.el('mp-result').textContent, /Write about your personality first/);
  await a.write('I’m creative.'); await a.check(1); await a.click('mp-review');
  assert.match(a.el('mp-result').textContent, /1 of 5/);
  assert.match(a.el('mp-result').textContent, /not an automatic correction or a grade/);
  await a.write('I’m creative because I draw.'); assert.equal(a.el('mp-result').hidden, true);
  for (let i = 0; i < 5; i++) await a.check(i);
  await a.click('mp-review'); assert.match(a.el('mp-result').textContent, /all five/);
  assert.equal(a.el('mp-writing').value, 'I’m creative because I draw.');
});
test('clipboard success copies exact writing; denied access offers manual copy without losing it', async () => {
  let copied;
  const a = page({navigator: {clipboard: {async writeText(text) {copied = text;}}}});
  await a.write('I’m friendly.\nMy example.'); await a.click('mp-copy');
  assert.equal(copied, a.el('mp-writing').value); assert.match(a.el('mp-copy-status').textContent, /was copied/);
  const b = page({navigator: {clipboard: {async writeText() {throw new Error('Denied');}}}});
  await b.write('Keep this text'); await b.click('mp-copy');
  assert.equal(b.el('mp-writing').value, 'Keep this text'); assert.equal(b.el('mp-writing').selected, true);
  assert.match(b.el('mp-copy-status').textContent, /device’s Copy command/);
});
test('blocked, full or malformed storage leaves writing and undo usable with a clear notice', async () => {
  for (const options of [{failRead: true}, {failWrite: true}, {store: new Map([[key, '{broken']])}]) {
    const a = page(options); await a.write('Keep my work'); await a.click('mp-reset'); await a.click('mp-undo');
    assert.equal(a.el('mp-writing').value, 'Keep my work');
    assert.equal(a.el('mp-storage-status').hidden, false);
    assert.match(a.el('mp-storage-status').textContent, /cannot save your draft/);
  }
});
test('counter handles contractions and punctuation without imposing a length requirement', async () => {
  const a = page(); await a.write('I’m friendly. ---');
  assert.equal(a.el('mp-count').textContent, '2 words · no minimum or target');
  await a.write('Creative!'); assert.match(a.el('mp-count').textContent, /^1 word ·/);
});
test('instruction controls use one player, support speed, and stop playback', async () => {
  const a = page(); await a.click('mp-listen');
  assert.equal(a.el('mp-audio').src, '/instruction.mp3'); assert.equal(a.el('mp-audio').paused, false);
  await a.speeds[0].fire('click'); assert.equal(a.el('mp-audio').playbackRate, .75);
  await a.click('stop'); assert.equal(a.el('mp-audio').paused, true);
});
