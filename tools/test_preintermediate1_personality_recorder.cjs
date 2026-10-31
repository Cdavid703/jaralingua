/* Deterministic recording lifecycle tests: no physical microphone or browser automation. */
const test = require('node:test');
const assert = require('node:assert/strict');
const createRecorder = require('../assets/js/preintermediate1-personality-recorder.js');

function harness(config = {}) {
  let clock = 0, sequence = 0, requests = 0;
  const timers = new Map(), states = [], clips = [], instances = [], streams = [];
  function stream() {
    const track = {stopped: false, stop() { this.stopped = true; }};
    const value = {track, getTracks: () => [track]}; streams.push(value); return value;
  }
  class FakeRecorder {
    static isTypeSupported(type) { return (config.types || ['audio/webm;codecs=opus']).includes(type); }
    constructor(input, options) {
      if (config.constructorError) throw new Error('Recorder unavailable');
      this.stream = input; this.mimeType = options?.mimeType || 'audio/webm'; this.state = 'inactive'; instances.push(this);
    }
    start() { if (config.startError) throw new Error('Start failed'); this.state = 'recording'; }
    stop() {
      this.state = 'inactive';
      if (config.stopError) throw new Error('Stop failed');
      if (config.noStopEvent) return;
      this.ondataavailable?.({data: new Blob(config.empty ? [] : ['synthetic audio'], {type: this.mimeType})});
      this.onstop?.();
    }
  }
  const controller = createRecorder({
    Recorder: config.unsupported ? undefined : FakeRecorder,
    getStream: () => { requests++; return config.getStream ? config.getStream(stream) : Promise.resolve(stream()); },
    now: () => clock,
    setTimeout(fn, ms) { const id = ++sequence; timers.set(id, {fn, at: clock + ms}); return id; },
    clearTimeout(id) { timers.delete(id); },
    onState: state => states.push(state),
    onClip: (id, blob, elapsed) => clips.push({id, blob, elapsed})
  });
  function advance(ms) {
    const end = clock + ms;
    while (true) {
      const next = [...timers].filter(([, t]) => t.at <= end).sort((a, b) => a[1].at - b[1].at)[0];
      if (!next) break;
      clock = next[1].at; timers.delete(next[0]); next[1].fn();
    }
    clock = end;
  }
  return {controller, states, clips, instances, streams, stream, advance, timers, config, get requests() { return requests; }};
}

test('recording uses one question, returns its clip and releases microphone/timers', async () => {
  const h = harness(); assert.equal(await h.controller.start(3), true);
  assert.equal(await h.controller.start(5), false); assert.equal(h.requests, 1);
  h.advance(1800); h.controller.stop();
  assert.equal(h.clips.length, 1); assert.equal(h.clips[0].id, 3); assert.equal(h.clips[0].elapsed, 1800);
  assert.equal(h.clips[0].blob.type, 'audio/webm;codecs=opus'); assert.ok(h.clips[0].blob.size);
  assert.equal(h.streams[0].track.stopped, true); assert.equal(h.timers.size, 0); assert.equal(h.controller.active, null);
});

for (const name of ['NotAllowedError', 'SecurityError', 'NotFoundError', 'NotReadableError']) {
  test(name + ' leaves discussion available and allows retry', async () => {
    let reject = true;
    const h = harness({getStream: stream => reject ? Promise.reject(Object.assign(new Error(name), {name})) : Promise.resolve(stream())});
    assert.equal(await h.controller.start(1), false); assert.equal(h.controller.active, null); assert.equal(h.timers.size, 0);
    assert.equal(h.clips.length, 0); assert.match(h.states.at(-1).message, /try again|Try again/);
    reject = false; assert.equal(await h.controller.start(2), true); h.advance(1000); h.controller.stop(); assert.equal(h.clips[0].id, 2);
  });
}

test('cancelling permission releases a late stream and does not disturb another recording', async () => {
  let grant;
  const h = harness({getStream: stream => new Promise(resolve => { grant = () => resolve(stream()); })});
  const first = h.controller.start(1); h.controller.stop(); const lateGrant = grant;
  const second = h.controller.start(2); grant(); assert.equal(await second, true);
  lateGrant(); assert.equal(await first, false);
  assert.equal(h.streams[1].track.stopped, true); assert.equal(h.streams[0].track.stopped, false);
  h.advance(1000); h.controller.stop(); assert.equal(h.clips[0].id, 2);
});

test('permission timeout cannot start a late recording', async () => {
  let grant;
  const h = harness({getStream: stream => new Promise(resolve => { grant = () => resolve(stream()); })});
  const pending = h.controller.start(1); h.advance(20000);
  assert.equal(h.controller.active, null); assert.match(h.states.at(-1).message, /too long/);
  grant(); assert.equal(await pending, false); assert.equal(h.instances.length, 0); assert.equal(h.streams[0].track.stopped, true);
});

test('empty and too-short replacements do not replace the previous valid clip', async () => {
  const h = harness(); await h.controller.start(1); h.advance(1200); h.controller.stop();
  const previous = h.clips[0]; h.config.empty = true;
  await h.controller.start(1); h.advance(1200); h.controller.stop(); assert.equal(h.clips.length, 1); assert.match(h.states.at(-1).message, /No audio/);
  h.config.empty = false; await h.controller.start(1); h.advance(100); h.controller.stop();
  assert.equal(h.clips.length, 1); assert.equal(h.clips[0], previous); assert.match(h.states.at(-1).message, /too short/);
});

test('auto-stop after two minutes produces a clip and releases all resources', async () => {
  const h = harness(); await h.controller.start(8); h.advance(120000);
  assert.equal(h.clips.length, 1); assert.equal(h.clips[0].elapsed, 120000); assert.equal(h.timers.size, 0); assert.equal(h.streams[0].track.stopped, true);
});

for (const failure of ['constructorError', 'startError', 'stopError', 'noStopEvent']) {
  test(failure + ' releases resources without losing earlier clips', async () => {
    const h = harness(); await h.controller.start(1); h.advance(1000); h.controller.stop();
    h.config[failure] = true; await h.controller.start(1); h.advance(1000); h.controller.stop(); h.advance(3000);
    assert.equal(h.controller.active, null); assert.equal(h.clips.length, 1); assert.equal(h.timers.size, 0);
    assert.ok(h.streams.every(s => s.track.stopped));
  });
}

test('runtime recorder errors stop capture and allow another attempt', async () => {
  const h = harness(); await h.controller.start(4); h.instances[0].onerror();
  assert.equal(h.controller.active, null); assert.equal(h.clips.length, 0); assert.equal(h.timers.size, 0);
  assert.equal(h.streams[0].track.stopped, true); assert.equal(await h.controller.start(4), true); h.controller.cancel();
});

test('mp4 and default MIME fallbacks work; cancelling active capture emits no partial clip', async () => {
  for (const types of [['audio/mp4'], []]) {
    const h = harness({types}); await h.controller.start(1); h.advance(1000); h.controller.stop();
    assert.equal(h.clips[0].blob.type, types.length ? 'audio/mp4' : 'audio/webm');
    await h.controller.start(2); h.controller.cancel(); assert.equal(h.clips.length, 1); assert.equal(h.timers.size, 0);
  }
});

test('unsupported recording is reported without asking for the microphone', async () => {
  const h = harness({unsupported: true}); assert.equal(await h.controller.start(1), false);
  assert.equal(h.requests, 0); assert.equal(h.controller.active, null); assert.match(h.states.at(-1).message, /not supported/);
});
