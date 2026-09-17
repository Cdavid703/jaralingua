(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const audio = $('holidayAudio');
  const letters = 'ABCD';
  let questions = [], checked = false, accessRequest = 0;
  const escapeHtml = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  function render() {
    $('questionGrid').innerHTML = questions.map((q,i) => `<fieldset class="question-card" data-index="${i}"><legend>${i+1}. ${escapeHtml(q.question)}</legend><div class="answer-options">${q.options.map((text,n) => `<label class="answer-option"><input type="radio" name="q${i}" value="${n}"><span><b>${letters[n]}.</b> ${escapeHtml(text)}</span></label>`).join('')}</div><p class="feedback" hidden></p></fieldset>`).join('');
    updateProgress();
  }
  function updateProgress() {
    const done = $('questionGrid').querySelectorAll('input:checked').length;
    $('answerProgress').textContent = `${done} of ${questions.length} answered`;
  }
  function clearFeedback() {
    checked = false; $('quizScore').textContent = 'Not checked yet'; $('quizResult').hidden = true;
    document.querySelectorAll('.feedback').forEach(el => el.hidden = true);
    document.querySelectorAll('.answer-option').forEach(el => el.classList.remove('is-correct','is-wrong'));
  }
  $('questionGrid').addEventListener('change', () => { if(checked) clearFeedback(); updateProgress(); });
  $('quizCheck').addEventListener('click', () => {
    let score = 0, missing = 0; checked = true;
    questions.forEach((q,i) => {
      const card = document.querySelector(`[data-index="${i}"]`), selected = card.querySelector('input:checked'), feedback = card.querySelector('.feedback');
      card.querySelectorAll('.answer-option').forEach(el => el.classList.remove('is-correct','is-wrong'));
      feedback.hidden = false;
      if(!selected){missing++; feedback.textContent = 'Choose an answer, then check again.'; return;}
      const ok = Number(selected.value) === q.answer; if(ok)score++;
      selected.closest('label').classList.add(ok?'is-correct':'is-wrong');
      card.querySelector(`input[value="${q.answer}"]`).closest('label').classList.add('is-correct');
      feedback.textContent = `${ok?'Correct.':`Correct answer: ${letters[q.answer]}.`} ${q.feedback}`;
    });
    $('quizScore').textContent = `Score: ${score} / 10`;
    $('quizResult').hidden = false;
    $('quizResult').textContent = `${score} of 10 correct.${missing?` ${missing} unanswered.`:''} Review the explanations and replay the conversation to improve. This practice does not change your course grade.`;
  });
  $('quizReset').addEventListener('click', () => { clearFeedback(); render(); });
  document.querySelectorAll('[data-speed]').forEach(button => button.addEventListener('click', () => {
    audio.playbackRate = Number(button.dataset.speed);
    document.querySelectorAll('[data-speed]').forEach(el => el.setAttribute('aria-pressed',String(el===button)));
    $('speedStatus').textContent = audio.playbackRate===1?'Normal speed':'Slower playback';
  }));
  audio.addEventListener('error', () => $('audioError').hidden = false);
  $('retryAudio').addEventListener('click', () => { $('audioError').hidden = true; audio.load(); });
  function user(){return window.JaraLinguaAuth?.getUser?.() || window.JaraLinguaCurrentUser;}
  async function updateTranscriptAccess(){
    const request = ++accessRequest;
    $('teacherTools').hidden = true; $('teacherTranscript').hidden = true; $('transcriptText').textContent = '';
    $('transcriptToggle').setAttribute('aria-expanded','false');
    const account = user(); if(!account?.credential)return;
    try {
      const response = await fetch('/api/basic2/unit5-my-holidays/transcript',{cache:'no-store',headers:{Authorization:'Bearer '+account.credential,'X-Jaralingua-Auth-Provider':account.provider||'google'},signal:AbortSignal.timeout(12000)});
      if(!response.ok)return;
      const data = await response.json();
      if(request!==accessRequest || user()?.credential!==account.credential)return;
      if(typeof data.transcript==='string' && data.transcript){$('transcriptText').textContent = data.transcript; $('teacherTools').hidden = false;}
    }catch(_){ /* Fail closed: students and unauthenticated visitors never receive a transcript. */ }
  }
  $('transcriptToggle').addEventListener('click', () => {
    if(!user()?.credential){updateTranscriptAccess();return;}
    const open = $('teacherTranscript').hidden;
    $('teacherTranscript').hidden = !open; $('transcriptToggle').setAttribute('aria-expanded',String(open));
  });
  window.addEventListener('jaralingua:auth-changed',updateTranscriptAccess);
  window.addEventListener('focus',updateTranscriptAccess);
  updateTranscriptAccess();
  fetch('/assets/data/basic2-unit5-holidays-questions.json?v=20260915-1').then(r=>{if(!r.ok)throw Error('load');return r.json();}).then(data=>{
    if(data.length!==10 || data.some(q=>q.options.length!==4 || !Number.isInteger(q.answer) || q.answer<0 || q.answer>3))throw Error('questions');
    questions = data; render(); $('loadStatus').hidden = true; $('quizCheck').disabled = false;
  }).catch(()=>{$('loadStatus').textContent='The questions could not load. Check your connection and reload the page.';});
})();
