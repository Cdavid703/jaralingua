/* Basic 2 memory format: identical pictures, two teams and teacher-confirmed past-tense headlines.
   Session-only game points; no automatic pronunciation grade or submission. */
(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const audio = $('modelAudio'), gate = $('readingGate'), winner = $('winnerOverlay');
  let vocabulary = [], pool = [], cards = [], selected = [], pending = null;
  let scores = [0, 0], team = 0, pairs = 0, locked = false, loading = false;
  let sound = true, lastModel = null, timer = null, confettiTimer = null, audioTicket = 0, context = null;
  const teamName = i => $('teamName' + i).value.trim() || 'Team ' + (i + 1);
  const shuffle = items => {
    const result = [...items];
    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  };
  function stopAudio() {
    audioTicket++;
    audio.pause();
    audio.removeAttribute('src');
    audio.load();
    $('audioStatus').textContent = '';
  }
  async function play(src) {
    stopAudio();
    lastModel = src;
    $('repeatModel').disabled = false;
    if (!sound) return;
    const ticket = audioTicket;
    audio.src = src;
    audio.playbackRate = Number($('audioSpeed').value);
    try { await audio.play(); }
    catch (error) {
      if (ticket === audioTicket && error.name !== 'AbortError')
        $('audioStatus').textContent = 'Audio could not play. Choose Listen again or Repeat model to retry.';
    }
  }
  audio.addEventListener('error', () => {
    if (audio.getAttribute('src') && audio.error)
      $('audioStatus').textContent = 'Audio unavailable. Choose Listen again or Repeat model to retry.';
  });
  function chime() {
    if (!sound) return;
    try {
      context ??= new (window.AudioContext || window.webkitAudioContext)();
      context.resume().catch(() => {});
      [523, 659, 784].forEach((frequency, i) => {
        const osc = context.createOscillator(), gain = context.createGain();
        const start = context.currentTime + i * .09;
        osc.connect(gain); gain.connect(context.destination);
        osc.frequency.value = frequency;
        gain.gain.setValueAtTime(.04, start);
        gain.gain.exponentialRampToValueAtTime(.001, start + .2);
        osc.start(start); osc.stop(start + .21);
      });
    } catch { /* Sound effects are optional; recorded models remain available. */ }
  }
  function clearConfetti() {
    clearTimeout(confettiTimer);
    document.querySelectorAll('.confetti-piece').forEach(el => el.remove());
  }
  function celebrate() {
    clearConfetti(); chime();
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const host = winner.open ? winner : $('game');
    for (let i = 0; i < 36; i++) {
      const bit = document.createElement('i');
      bit.className = 'confetti-piece'; bit.setAttribute('aria-hidden', 'true');
      bit.style.left = Math.random() * 100 + '%';
      bit.style.setProperty('--color', ['#2563eb', '#0f9f6e', '#f4c95d', '#f472b6'][i % 4]);
      bit.style.setProperty('--duration', (1.3 + Math.random()) + 's');
      bit.style.setProperty('--rotation', Math.random() * 360 + 'deg');
      bit.style.setProperty('--drift', (Math.random() - .5) * 280 + 'px');
      host.append(bit);
    }
    confettiTimer = setTimeout(clearConfetti, 2500);
  }
  function art(item, className) {
    const el = document.createElement('span');
    el.className = className;
    if (item.image) {
      el.style.backgroundImage = 'url("' + item.image + '")';
      el.style.backgroundSize = 'contain';
      el.style.backgroundPosition = 'center';
    } else {
      el.style.backgroundPosition = (item.tile % 5) * 25 + '% ' + Math.floor(item.tile / 5) * (100 / 3) + '%';
    }
    return el;
  }
  function renderVocabulary() {
    const names = { events: 'What happened?', effects: 'Consequences', help: 'Help' };
    $('vocabGroups').replaceChildren(...Object.entries(names).map(([group, title]) => {
      const row = document.createElement('div'), heading = document.createElement('strong');
      row.className = 'vocab-line'; heading.textContent = title;
      const words = document.createElement('span'); words.className = 'vocab-words';
      vocabulary.filter(item => item.group === group).forEach(item => {
        const wrap = document.createElement('span'), button = document.createElement('button'), tip = document.createElement('span');
        wrap.className = 'vocab-word-wrap'; button.className = 'vocab-word'; button.type = 'button';
        button.textContent = item.term; button.addEventListener('click', () => play(item.audio));
        tip.className = 'word-tip'; tip.id = 'meaning-' + item.id; tip.lang = 'es'; tip.textContent = item.spanish;
        button.setAttribute('aria-describedby', tip.id);
        wrap.append(button, tip); words.append(wrap);
      });
      row.append(heading, words); return row;
    }));
  }
  function updateScores() {
    for (let i = 0; i < 2; i++) {
      $('score' + i).textContent = scores[i];
      document.querySelector('.team-panel[data-team="' + i + '"]').classList.toggle('active', i === team);
    }
    $('turnName').textContent = teamName(team);
    $('pairCount').textContent = pairs + ' / ' + pool.length + ' pairs';
  }
  function updateCard(card, index) {
    const revealed = card.open || card.matched;
    card.button.classList.toggle('is-flipped', card.open);
    card.button.classList.toggle('is-matched', card.matched);
    card.button.setAttribute('aria-pressed', String(revealed));
    card.button.setAttribute('aria-label', revealed ? card.item.term + '. Listen again.' : 'Hidden memory card ' + (index + 1));
    card.button.querySelector('.card-front').setAttribute('aria-hidden', String(!revealed));
    card.button.querySelector('.card-back').setAttribute('aria-hidden', String(revealed));
  }
  function focusCard() { (cards.find(card => !card.matched)?.button || $('newGame')).focus({ preventScroll: true }); }
  function cancelPair() {
    clearTimeout(timer); timer = null;
    selected.forEach(index => { cards[index].open = false; updateCard(cards[index], index); });
    selected = []; pending = null; locked = false;
    if (gate.open) gate.close();
    stopAudio();
  }
  function newGame() {
    if (!vocabulary.length) return;
    cancelPair(); clearConfetti();
    if (winner.open) winner.close();
    pool = $('memoryGroup').value === 'all' ? vocabulary : vocabulary.filter(item => item.group === $('memoryGroup').value);
    cards = shuffle(pool.flatMap(item => [{ item, open: false, matched: false }, { item, open: false, matched: false }]));
    scores = [0, 0]; team = 0; pairs = 0; lastModel = null; $('repeatModel').disabled = true;
    $('memoryBoard').replaceChildren(...cards.map((card, index) => {
      const button = document.createElement('button'); button.type = 'button'; button.className = 'memory-card';
      button.dataset.pair = card.item.id; button.dataset.index = index;
      const back = document.createElement('span'); back.className = 'card-face card-back';
      const number = document.createElement('strong'), mark = document.createElement('i');
      number.textContent = index + 1; mark.textContent = '?'; back.append(mark, number);
      const front = document.createElement('span'); front.className = 'card-face card-front';
      const caption = document.createElement('strong'); caption.textContent = card.item.term;
      front.append(art(card.item, 'card-art'), caption); button.append(back, front);
      card.button = button; updateCard(card, index); button.addEventListener('click', () => choose(index));
      return button;
    }));
    updateScores(); $('gameStatus').textContent = teamName(team) + ': choose the first card.';
  }
  function choose(index) {
    if (locked) return;
    const card = cards[index];
    play(card.item.audio);
    if (card.open || card.matched) return;
    card.open = true; selected.push(index); updateCard(card, index);
    if (selected.length < 2) { $('gameStatus').textContent = 'Choose a second card with the same picture.'; return; }
    locked = true;
    timer = setTimeout(() => {
      timer = null;
      const [a, b] = selected.map(i => cards[i]);
      if (a.item.id === b.item.id) {
        pending = a.item;
        $('gateImage').replaceChildren(art(pending, 'gate-art'));
        $('gateImage').setAttribute('aria-label', pending.imageDescription || 'News picture: ' + pending.term);
        $('gatePhrase').textContent = pending.term; $('gateMeaning').textContent = pending.spanish;
        $('gateSentence').textContent = pending.sentence; $('gateExample').open = pairs === 0;
        $('gameStatus').textContent = 'Match found! Give your own news headline in the past before collecting your point.';
        gate.showModal(); play(pending.audio);
      } else {
        $('gameStatus').textContent = 'Different pictures. The other team plays next.';
        timer = setTimeout(() => {
          cancelPair(); team = 1 - team; updateScores(); focusCard();
          $('gameStatus').textContent = teamName(team) + ': choose the first card.';
        }, 1050);
      }
    }, 650);
  }
  function award() {
    if (!pending) return;
    selected.forEach(index => { cards[index].matched = true; updateCard(cards[index], index); });
    selected = []; pending = null; locked = false; pairs++; scores[team]++;
    gate.close(); stopAudio(); updateScores();
    $('gameStatus').textContent = teamName(team) + ' earns a point for the headline and plays again.';
    if (pairs === pool.length) {
      $('winnerTitle').textContent = scores[0] === scores[1] ? 'It is a tie!' : teamName(scores[0] > scores[1] ? 0 : 1) + ' wins!';
      $('winnerMessage').textContent = teamName(0) + ': ' + scores[0] + ' points · ' + teamName(1) + ': ' + scores[1] + ' points. You practised ' + pool.length + ' news headlines!';
      winner.showModal();
    } else focusCard();
    celebrate();
  }
  function retryPair() {
    cancelPair(); focusCard();
    $('gameStatus').textContent = teamName(team) + ': try again. No point awarded yet.';
  }
  $('newGame').addEventListener('click', newGame);
  $('memoryGroup').addEventListener('change', newGame);
  $('repeatModel').addEventListener('click', () => lastModel && play(lastModel));
  $('audioSpeed').addEventListener('change', () => { audio.playbackRate = Number($('audioSpeed').value); });
  $('soundButton').addEventListener('click', () => {
    sound = !sound; stopAudio();
    if (!sound && context) { context.close().catch(() => {}); context = null; }
    $('soundButton').textContent = 'Sound: ' + (sound ? 'on' : 'off');
    $('soundButton').setAttribute('aria-pressed', String(sound));
  });
  for (let i = 0; i < 2; i++) $('teamName' + i).addEventListener('input', updateScores);
  $('hearWord').addEventListener('click', () => pending && play(pending.audio));
  $('hearFirstExample').addEventListener('click', () => {
    const example = vocabulary.find(item => item.id === 'flood');
    if (example) play(example.sentenceAudio);
  });
  $('hearSentence').addEventListener('click', () => pending && play(pending.sentenceAudio));
  $('confirmReading').addEventListener('click', award);
  $('retryPair').addEventListener('click', retryPair);
  gate.addEventListener('cancel', event => { event.preventDefault(); retryPair(); });
  $('playAgain').addEventListener('click', newGame);
  $('closeWinner').addEventListener('click', () => { winner.close(); clearConfetti(); $('newGame').focus(); });
  winner.addEventListener('cancel', clearConfetti);
  $('projectGame').addEventListener('click', async () => {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else await $('game').requestFullscreen();
    } catch { $('gameStatus').textContent = 'Full screen is unavailable. You can still enlarge the browser window.'; }
  });
  document.addEventListener('fullscreenchange', () => { $('projectGame').textContent = document.fullscreenElement ? 'Exit projection ⛶' : 'Project game ⛶'; });
  document.addEventListener('visibilitychange', () => { if (document.hidden) stopAudio(); });
  window.addEventListener('pagehide', stopAudio);
  async function load() {
    if (loading) return;
    loading = true; $('retryLoad').hidden = true;
    try {
      const response = await fetch('/assets/data/english-intermediate2-unit6-memory.json?v=20261014-headlines-1');
      if (!response.ok) throw Error('Vocabulary unavailable');
      const data = await response.json();
      if (data.items.length !== 20 || new Set(data.items.map(item => item.id)).size !== 20) throw Error('Incomplete vocabulary');
      const sources = ['/assets/img/english-intermediate-2/unit-6/memory/cards.webp', ...data.items.filter(item => item.image).map(item => item.image)];
      await Promise.all(sources.map(async src => { const image = new Image(); image.src = src; await image.decode(); }));
      vocabulary = data.items;
      const example = vocabulary.find(item => item.id === 'flood');
      $('firstExampleImage').replaceChildren(art(example, 'gate-art'));
      $('firstExampleSentence').textContent = example.sentence;
      $('hearFirstExample').disabled = false;
      renderVocabulary(); newGame(); $('newGame').disabled = false;
    } catch {
      $('gameStatus').textContent = 'The vocabulary could not load. Check your connection and retry.'; $('retryLoad').hidden = false;
    } finally { loading = false; }
  }
  $('retryLoad').addEventListener('click', load);
  load();
})();
