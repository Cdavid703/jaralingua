/* Unit 4: clickable pronunciation and mutually exclusive audio models. */
(() => {
  'use strict';
  const audios = [...document.querySelectorAll('.u4-audio audio')];
  const buttons = [...document.querySelectorAll('[data-u4-audio]')];
  const sync = (audio) => {
    buttons.filter((button) => button.dataset.u4Audio === audio.id).forEach((button) => {
      const playing = !audio.paused && !audio.ended && audio.playbackRate === Number(button.dataset.rate);
      button.setAttribute('aria-pressed', String(playing));
    });
  };
  for (const audio of audios) {
    audio.addEventListener('play', () => {
      audios.filter((other) => other !== audio).forEach((other) => other.pause());
      audio.closest('.u4-audio').querySelector('.u4-audio-status').textContent = '';
      sync(audio);
    });
    ['pause', 'ended', 'ratechange'].forEach((event) => audio.addEventListener(event, () => sync(audio)));
    audio.addEventListener('error', () => {
      sync(audio);
      audio.closest('.u4-audio').querySelector('.u4-audio-status').textContent = 'Audio could not load. You can read the audio text below and try again.';
    });
  }
  buttons.forEach((button) => button.addEventListener('click', async () => {
    const audio = document.getElementById(button.dataset.u4Audio);
    if (!(audio instanceof HTMLAudioElement)) return;
    audios.forEach((other) => { if (other !== audio) other.pause(); });
    if (!audio.paused && audio.playbackRate === Number(button.dataset.rate)) {
      audio.pause();
      return;
    }
    audio.playbackRate = Number(button.dataset.rate);
    audio.currentTime = 0;
    try { await audio.play(); }
    catch {
      audio.closest('.u4-audio').querySelector('.u4-audio-status').textContent = 'Playback did not start. Try the audio player, or read the audio text.';
      sync(audio);
    }
  }));
  document.querySelectorAll('.ie2-theory-topic').forEach((topic) => topic.addEventListener('toggle', () => {
    if (!topic.open) topic.querySelectorAll('audio').forEach((audio) => audio.pause());
  }));
})();
