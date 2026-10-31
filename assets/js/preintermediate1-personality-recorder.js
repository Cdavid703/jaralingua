/* A single local recording at a time. No upload, transcription or grading. */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory;
  else root.createPersonalityRecorder = factory;
})(typeof globalThis !== 'undefined' ? globalThis : this, function createPersonalityRecorder(options) {
  'use strict';
  options = options || {};
  const Recorder = options.Recorder || globalThis.MediaRecorder;
  const getStream = options.getStream || (() => globalThis.navigator?.mediaDevices?.getUserMedia({audio: {echoCancellation: true, noiseSuppression: true}, video: false}));
  const now = options.now || Date.now;
  const later = options.setTimeout || globalThis.setTimeout;
  const clear = options.clearTimeout || globalThis.clearTimeout;
  const makeBlob = options.makeBlob || ((chunks, type) => new Blob(chunks, {type}));
  const onState = options.onState || (() => {}), onClip = options.onClip || (() => {});
  let active = null;
  function release(stream) { stream?.getTracks().forEach(track => track.stop()); }
  function clean(job) {
    [job.permissionTimer, job.tickTimer, job.limitTimer, job.finishTimer].forEach(timer => clear(timer));
    release(job.stream);
  }
  function notify(job, message = '') {
    onState({id: job.id, phase: job.phase, elapsedMs: job.started === undefined ? 0 : Math.max(0, now() - job.started), message});
  }
  function idle(job, message) { job.phase = 'idle'; notify(job, message); }
  function fail(job, message) {
    if (active !== job) return;
    active = null;
    clean(job);
    try { if (job.recorder?.state !== 'inactive') job.recorder?.stop(); } catch (_) {}
    idle(job, message);
  }
  function finish(job) {
    if (active !== job) return;
    const elapsed = Math.max(0, now() - job.started);
    const blob = makeBlob(job.chunks, job.recorder.mimeType || job.chunks[0]?.type || job.mime || '');
    active = null;
    clean(job);
    if (!blob.size) { idle(job, 'No audio was captured. Your previous recording is still available. Try again.'); return; }
    if (elapsed < 400) { idle(job, 'The recording was too short. Your previous recording is still available. Try again.'); return; }
    onClip(job.id, blob, elapsed);
    idle(job, 'Recording ready. Listen to yourself or record again.');
  }
  function stop() {
    const job = active;
    if (!job) return;
    if (job.phase === 'requesting') {
      active = null; clean(job);
      idle(job, 'Microphone request cancelled. You can try again or speak in class.');
    } else if (job.phase === 'recording') {
      job.phase = 'stopping'; notify(job, 'Finishing your recording…');
      clear(job.tickTimer); clear(job.limitTimer);
      job.finishTimer = later(() => fail(job, 'The recording could not finish. Your previous recording is still available. Try again.'), 3000);
      try { job.recorder.stop(); release(job.stream); }
      catch (_) { fail(job, 'The recording could not finish. Your previous recording is still available. Try again.'); }
    }
  }
  async function start(id) {
    if (active) return false;
    const job = {id, phase: 'requesting', chunks: []};
    active = job;
    if (!Recorder || (!options.getStream && !globalThis.navigator?.mediaDevices?.getUserMedia)) {
      fail(job, 'Recording is not supported in this browser. You can still listen and join the class discussion.'); return false;
    }
    notify(job, 'Allow microphone access to record, or choose Cancel.');
    job.permissionTimer = later(() => {
      if (active === job && job.phase === 'requesting') {
        active = null; clean(job);
        idle(job, 'Microphone access took too long. Try again when you are ready, or speak in class.');
      }
    }, 20000);
    try {
      const stream = await getStream();
      if (active !== job) { release(stream); return false; }
      job.stream = stream;
      clear(job.permissionTimer);
      job.mime = ['audio/webm;codecs=opus', 'audio/mp4', 'audio/ogg;codecs=opus', 'audio/webm'].find(type => Recorder.isTypeSupported?.(type)) || '';
      job.recorder = job.mime ? new Recorder(stream, {mimeType: job.mime}) : new Recorder(stream);
      job.recorder.ondataavailable = event => { if (event.data?.size && active === job) job.chunks.push(event.data); };
      job.recorder.onstop = () => finish(job);
      job.recorder.onerror = () => fail(job, 'The microphone stopped working. Your previous recording is still available. Check it and try again.');
      job.recorder.start(250);
      job.started = now(); job.phase = 'recording';
      notify(job, 'Recording…');
      const tick = () => {
        if (active !== job || job.phase !== 'recording') return;
        notify(job); job.tickTimer = later(tick, 500);
      };
      job.tickTimer = later(tick, 500);
      job.limitTimer = later(stop, 120000);
      return true;
    } catch (error) {
      const message = error?.name === 'NotAllowedError' || error?.name === 'SecurityError'
        ? 'Microphone access was not allowed. You can try again or join the discussion without recording.'
        : error?.name === 'NotFoundError'
          ? 'No microphone was found. Connect one and try again, or join the discussion without recording.'
          : 'The microphone could not start. Check that it is available and try again. Your previous recording is still available.';
      fail(job, message); return false;
    }
  }
  function cancel() {
    const job = active;
    if (!job) return;
    active = null; clean(job);
    try { if (job.recorder?.state !== 'inactive') job.recorder?.stop(); } catch (_) {}
    idle(job, 'Recording cancelled. Your previous recording is still available.');
  }
  return {start, stop, cancel, get active() { return active ? {id: active.id, phase: active.phase} : null; }};
});
