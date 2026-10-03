(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const reader = $('fvReader'), projector = $('fvProjector'), audio = $('fvAudio');
  const audioBase = '/ingles/intermediate-2/audio/unit-5-first-visit/';
  let pages = [], pageIndex = 0, step = 0, questionIndex = 0, zoom = 1;
  let projection = 'picture', sound = true, playToken = 0, ownsFullscreen = false;
  let oldOverflow = '', lastFocus = null, projectionFocus = null, turnTimer;
  const labels = ['Describe what you can see', 'Interpret feelings with evidence', 'Discover the story', 'Predict the next page'];
  const starters = [
    ['In the picture, I can see…', 'There is… / There are…', 'On the left… / In the background…', 'He is holding… / They are talking…'],
    ['He looks… / She seems… + adjective', 'It looks like… + noun or a complete idea', 'I think he feels… because…', 'She might be… / Although he looks…, he…', 'I feel interested. The story is interesting.'],
    ['First,… Then,… Also,… However,…', 'I thought…, but now…', 'My first impression was… Now he seems… because…'],
    ['I think he will…', 'She might… / Maybe they will…', 'He might say, “…”', 'My prediction is… because…']
  ];
  const page = () => pages[pageIndex];
  function questions() {
    return page().questions.filter(q => q.stage === (step === 0 ? 'describe' : step === 1 ? 'feel' : pageIndex === pages.length - 1 ? 'reflect' : 'predict'));
  }
  function currentText() { return step === 2 ? page().text : questions()[questionIndex].text; }
  function stopAudio() {
    playToken++;
    audio.pause(); audio.removeAttribute('src'); audio.load();
    $('fvAudioStatus').textContent = '';
  }
  function listen() {
    stopAudio();
    const token = ++playToken;
    audio.src = audioBase + (step === 2 ? page().audio : questions()[questionIndex].audio);
    audio.playbackRate = Number($('fvSpeed').value);
    $('fvAudioStatus').textContent = 'Loading recording…';
    audio.play().then(() => {
      if (token === playToken) $('fvAudioStatus').textContent = 'ElevenLabs · Sarah';
    }).catch(() => {
      if (token === playToken) $('fvAudioStatus').textContent = 'Press play on the audio player to try again.';
    });
  }
  audio.addEventListener('error', () => {
    if (audio.getAttribute('src')) $('fvAudioStatus').textContent = 'Recording unavailable. Please try again.';
  });
  function renderQuestion() {
    const isStory = step === 2, qs = questions(), last = pageIndex === pages.length - 1;
    $('fvStepLabel').textContent = isStory ? 'Story · page ' + page().number : (step === 3 && last ? 'Reflect and connect to writing' : labels[step]);
    $('fvPrompt').textContent = currentText();
    $('fvQuestionCount').textContent = isStory ? '' : `${questionIndex + 1} / ${qs.length}`;
    $('fvQuestionPrev').hidden = isStory; $('fvQuestionNext').hidden = isStory;
    $('fvQuestionPrev').disabled = questionIndex === 0;
    $('fvQuestionNext').disabled = questionIndex >= qs.length - 1;
    $('fvListen').textContent = isStory ? '▶ Listen to this page' : '▶ Listen to the question';
    $('fvProject').textContent = isStory ? 'Project story ↗' : 'Project question ↗';
    $('fvTeacherCue').textContent = step === 0 ? (pageIndex ? 'Before describing: I thought…, but now… Add a new detail with each speaker.' : 'Look at the image first. Invite different students to add details.') : step === 1 ? 'An expression is a clue, not proof. Invite another possible interpretation.' : step === 2 ? 'After listening, choose step 4 before turning the page.' : last ? 'The End · Use the ideas to prepare your own informal email.' : 'Hear several predictions. Then turn the page and compare.';
    $('fvStarters').replaceChildren();
    const phrases = step === 3 && last ? ['Hi… / How are you?', 'First,… Then,… Also,… However,…', 'I felt… because… / I decided to…', 'Write soon! / Best wishes,…'] : starters[step];
    phrases.forEach(text => {const p = document.createElement('p'); p.textContent = text; $('fvStarters').append(p);});
    document.querySelectorAll('[data-stage]').forEach(btn => {
      btn.setAttribute('aria-pressed', String(Number(btn.dataset.stage) === step));
      if (btn.dataset.stage === '3') btn.textContent = last ? '4 · Reflect' : '4 · Predict';
    });
    if (projector.open) renderProjection();
  }
  function renderPage() {
    $('fvImage').src = page().image; $('fvImage').alt = page().alt;
    $('fvPage').value = String(pageIndex);
    $('fvPrev').disabled = pageIndex === 0;
    $('fvNext').disabled = pageIndex === pages.length - 1;
    $('fvHelp').open = false;
    $('fvStage').scrollTop = 0;
    document.querySelector('.fv-copy').scrollTop = 0;
    renderQuestion();
    // Only preload the next illustration; never reveal its text or thumbnail.
    if (pages[pageIndex + 1]) {const img = new Image(); img.src = pages[pageIndex + 1].image;}
  }
  function turnTo(index) {
    index = Math.max(0, Math.min(pages.length - 1, index));
    if (index === pageIndex) return;
    stopAudio();
    clearTimeout(turnTimer);
    const leaf = $('fvLeaf'); leaf.className = 'fv-leaf';
    const old = document.createElement('img'); old.src = page().image; old.alt = '';
    leaf.replaceChildren(old);
    void leaf.offsetWidth;
    leaf.classList.add(index > pageIndex ? 'forward' : 'backward');
    if (sound) {const paper = $('fvPaper'); paper.currentTime = 0; paper.play().catch(() => {});}
    turnTimer = setTimeout(() => {leaf.className = 'fv-leaf'; leaf.replaceChildren();}, 650);
    pageIndex = index; step = 0; questionIndex = 0; renderPage();
  }
  function changeQuestion(delta) {
    if (step === 2) return;
    const next = Math.max(0, Math.min(questions().length - 1, questionIndex + delta));
    if (next === questionIndex) return;
    stopAudio(); questionIndex = next; renderQuestion();
  }
  async function fullscreen() {
    if (document.fullscreenElement || !document.documentElement.requestFullscreen) return;
    try {await document.documentElement.requestFullscreen(); ownsFullscreen = true;} catch (_) { /* Viewport dialog remains available. */ }
  }
  $('fvOpen').addEventListener('click', async () => {
    if (!pages.length || reader.open) return;
    lastFocus = document.activeElement; oldOverflow = document.body.style.overflow;
    await fullscreen();
    document.body.style.overflow = 'hidden'; renderPage(); reader.showModal(); $('fvClose').focus();
  });
  $('fvFull').addEventListener('click', fullscreen);
  $('fvClose').addEventListener('click', () => reader.close());
  reader.addEventListener('close', () => {
    if (projector.open) projector.close();
    stopAudio(); $('fvPaper').pause(); clearTimeout(turnTimer); $('fvLeaf').className = 'fv-leaf';
    document.body.style.overflow = oldOverflow;
    if (ownsFullscreen && document.fullscreenElement) document.exitFullscreen().catch(() => {});
    ownsFullscreen = false; lastFocus?.focus();
  });
  document.querySelectorAll('[data-stage]').forEach(btn => btn.addEventListener('click', () => {
    stopAudio(); step = Number(btn.dataset.stage); questionIndex = 0; $('fvHelp').open = false; renderQuestion();
  }));
  $('fvPrev').addEventListener('click', () => turnTo(pageIndex - 1));
  $('fvNext').addEventListener('click', () => turnTo(pageIndex + 1));
  $('fvPage').addEventListener('change', e => turnTo(Number(e.target.value)));
  $('fvQuestionPrev').addEventListener('click', () => changeQuestion(-1));
  $('fvQuestionNext').addEventListener('click', () => changeQuestion(1));
  $('fvListen').addEventListener('click', listen);
  $('fvSpeed').addEventListener('change', e => {audio.playbackRate = Number(e.target.value);});
  $('fvSound').addEventListener('click', () => {sound = !sound; $('fvSound').setAttribute('aria-pressed', String(sound)); $('fvSound').textContent = 'Page sound: ' + (sound ? 'on' : 'off'); if (!sound) $('fvPaper').pause();});
  function resize(delta) {zoom = Math.min(1.6, Math.max(.8, Math.round((zoom + delta) * 10) / 10)); reader.style.setProperty('--fv-text-scale', zoom);}
  $('fvFontDown').addEventListener('click', () => resize(-.1));
  $('fvFontUp').addEventListener('click', () => resize(.1));
  function renderProjection() {
    const picture = projection === 'picture', story = step === 2;
    projector.classList.toggle('picture-mode', picture);
    $('fvProjectTitle').textContent = `Page ${page().number} · ` + (picture ? 'Describe the picture' : story ? 'Story' : step === 3 && pageIndex === pages.length - 1 ? 'Reflect' : labels[step]);
    $('fvProjectedImage').hidden = !picture; $('fvProjectedText').hidden = picture;
    $('fvProjectListen').hidden = picture; $('fvProjectStop').hidden = picture;
    if (picture) {$('fvProjectedImage').src = page().image; $('fvProjectedImage').alt = page().alt;}
    else {$('fvProjectedText').textContent = currentText();}
    $('fvProjectPrev').hidden = story; $('fvProjectNext').hidden = story;
    $('fvProjectPrev').disabled = questionIndex === 0;
    $('fvProjectNext').disabled = questionIndex >= questions().length - 1;
    $('fvProjectCount').textContent = story ? 'Listen, then predict.' : `${questionIndex + 1} / ${questions().length}`;
  }
  function project(mode) {stopAudio(); projectionFocus = document.activeElement; projection = mode; renderProjection(); projector.showModal(); $('fvProjectClose').focus();}
  $('fvPicture').addEventListener('click', () => project('picture'));
  $('fvProject').addEventListener('click', () => project('text'));
  $('fvProjectClose').addEventListener('click', () => projector.close());
  projector.addEventListener('close', () => {stopAudio(); projectionFocus?.focus();});
  $('fvProjectPrev').addEventListener('click', () => changeQuestion(-1));
  $('fvProjectNext').addEventListener('click', () => changeQuestion(1));
  $('fvProjectListen').addEventListener('click', listen);
  $('fvProjectStop').addEventListener('click', stopAudio);
  document.addEventListener('keydown', event => {
    if (!reader.open || event.altKey || event.ctrlKey || event.metaKey || /^(SELECT|INPUT|TEXTAREA)$/.test(event.target.tagName)) return;
    if (!['ArrowLeft','ArrowRight'].includes(event.key)) return;
    event.preventDefault(); const delta = event.key === 'ArrowRight' ? 1 : -1;
    if (projector.open) {if (projection === 'text') changeQuestion(delta);}
    else turnTo(pageIndex + delta);
  });
  let touch = null;
  $('fvPicture').addEventListener('touchstart', e => {const t=e.touches[0]; touch={x:t.clientX,y:t.clientY};}, {passive:true});
  $('fvPicture').addEventListener('touchend', e => {if (!touch) return; const t=e.changedTouches[0],dx=t.clientX-touch.x,dy=t.clientY-touch.y; touch=null; if (Math.abs(dx)>80 && Math.abs(dy)<50) {e.preventDefault();turnTo(pageIndex+(dx<0?1:-1));}}, {passive:false});
  fetch('/assets/data/english-intermediate2-first-visit.json?v=20261002-1').then(response => {
    if (!response.ok) throw new Error('Story unavailable'); return response.json();
  }).then(data => {
    if (!Array.isArray(data.pages) || data.pages.length !== 17) throw new Error('Incomplete story');
    pages = data.pages;
    pages.forEach((p,i) => {const option=document.createElement('option');option.value=String(i);option.textContent=`Page ${p.number} of ${pages.length}`;$('fvPage').append(option);});
    $('fvOpen').disabled = false; $('fvLoadStatus').textContent = 'Ready · 17 pages. The teacher controls the pace.';
  }).catch(() => {$('fvLoadStatus').textContent = 'The story could not load. Refresh the page to try again.';});
})();
