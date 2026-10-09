/* Illustrated public vocabulary lesson. Answers stay in this browser; no grading API. */
(()=>{'use strict';
const $=s=>document.querySelector(s),tv=$('#news-tv'),dialog=$('#news-projector'),audio=$('#news-audio');
const wordAudio=document.createElement('audio');wordAudio.id='news-word-audio';wordAudio.preload='none';document.body.append(wordAudio);
let data,index=0,question=0,mode='story',answers=[],graded=false,continuous=false,rate=.75,sequence=0,caption=true,opener=null,ownsFullscreen=false,activeWord=null;
const tip=document.createElement('div');tip.className='news-tooltip';tip.id='news-tooltip';tip.role='tooltip';tip.lang='es';tip.hidden=true;let target=null,timer;
function hideTip(){clearTimeout(timer);target?.removeAttribute('aria-describedby');target=null;tip.hidden=true;}
function positionTip(){if(!target?.isConnected)return hideTip();const r=target.getBoundingClientRect(),t=tip.getBoundingClientRect();tip.style.left=Math.max(12,Math.min(innerWidth-t.width-12,r.left))+'px';tip.style.top=Math.max(12,r.top-t.height-8>=12?r.top-t.height-8:Math.min(innerHeight-t.height-12,r.bottom+8))+'px';}
function showTip(el){const word=data?.glossary.find(w=>w.term===el?.dataset.word);if(!word)return;hideTip();target=el;(dialog.open?dialog:document.body).append(tip);tip.textContent=word.spanish;tip.hidden=false;el.setAttribute('aria-describedby',tip.id);positionTip();}
function leaveTip(){clearTimeout(timer);timer=setTimeout(()=>{if(!tip.matches(':hover')&&document.activeElement!==target)hideTip();},150);}
tip.addEventListener('pointerenter',()=>clearTimeout(timer));tip.addEventListener('pointerleave',leaveTip);
document.addEventListener('pointerover',e=>{if(e.pointerType!=='touch')showTip(e.target.closest('[data-word]'));});document.addEventListener('pointerout',e=>{if(e.target.closest('[data-word]'))leaveTip();});document.addEventListener('focusin',e=>showTip(e.target.closest('[data-word]')));document.addEventListener('focusout',leaveTip);document.addEventListener('pointerdown',e=>{if(!e.target.closest('[data-word],.news-tooltip'))hideTip();},true);document.addEventListener('scroll',()=>{if(!tip.hidden)positionTip();},true);window.addEventListener('resize',hideTip);
const status=text=>$('#news-status').textContent=text;
function stop(){sequence++;continuous=false;activeWord=null;audio.pause();wordAudio.pause();tv.querySelector('[data-news-action=continuous]').setAttribute('aria-pressed','false');syncAudio();}
function syncAudio(){const playing=!audio.paused&&!audio.ended,wordPlaying=!wordAudio.paused&&!wordAudio.ended;tv.querySelectorAll('[data-word]').forEach(e=>e.setAttribute('aria-pressed',String(wordPlaying&&e.dataset.word===activeWord)));tv.querySelector('[data-news-action=play]').setAttribute('aria-pressed',String(playing));}
function prepareNarration(){
 const file=mode==='quiz'?data.questions[question].audio:data.scenes[index].audio;
 if(audio.getAttribute('src')!==file){audio.src=file;audio.load();}
 audio.playbackRate=rate;audio.hidden=mode==='vocabulary';
 audio.setAttribute('aria-label',mode==='quiz'?'Question '+(question+1)+' audio':'Scene '+(index+1)+' audio');
}
async function playFile(file,word=null,keepContinuous=false){
 if(!keepContinuous)continuous=false;
 activeWord=word;const ticket=++sequence,player=word?wordAudio:audio;
 audio.pause();wordAudio.pause();
 if(player.getAttribute('src')!==file||player.error){player.src=file;player.load();}else player.currentTime=0;
 player.playbackRate=rate;status('');tv.querySelector('[data-news-action=continuous]').setAttribute('aria-pressed',String(continuous));
 try{await player.play();if(ticket===sequence)syncAudio();}catch(e){if(ticket===sequence&&e.name!=='AbortError'){continuous=false;tv.querySelector('[data-news-action=continuous]').setAttribute('aria-pressed','false');status(word?'Pronunciation could not play. Tap the word to retry.':'Audio could not play. Check your connection and press Listen again.');syncAudio();}}
}
for(const player of [audio,wordAudio]){
 ['play','pause','ended'].forEach(e=>player.addEventListener(e,syncAudio));
 player.addEventListener('error',()=>{continuous=false;tv.querySelector('[data-news-action=continuous]').setAttribute('aria-pressed','false');status(player===wordAudio?'Pronunciation could not load. Tap the word to retry.':'Audio could not load. Press Listen to retry.');});
}
// Native Play must also stop a word clip and retain the selected lesson speed.
audio.addEventListener('play',()=>{wordAudio.pause();activeWord=null;audio.playbackRate=rate;status('');syncAudio();});
audio.addEventListener('ended',()=>{if(continuous&&mode==='story'&&index<data.scenes.length-1){index++;render(false);playFile(data.scenes[index].audio,null,true);}else if(continuous){continuous=false;tv.querySelector('[data-news-action=continuous]').setAttribute('aria-pressed','false');status('End of the report. You can now answer the ten questions.');}});
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function wordButton(term,label=term){return '<button type="button" class="news-word" data-word="'+esc(term)+'" aria-pressed="false">'+esc(label)+'</button>';}
function annotate(text){const terms=[...data.glossary].sort((a,b)=>b.term.length-a.term.length);const pattern=new RegExp('\\b('+terms.map(w=>w.term.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')).join('|')+')\\b','gi');let result='',last=0;for(const m of text.matchAll(pattern)){result+=esc(text.slice(last,m.index));result+=wordButton(terms.find(w=>w.term.toLowerCase()===m[0].toLowerCase()).term,m[0]);last=m.index+m[0].length;}return result+esc(text.slice(last));}
function render(halt=true){if(halt)stop();hideTip();status('');const story=mode==='story',quiz=mode==='quiz';$('#news-story').hidden=!story;$('#news-vocabulary').hidden=mode!=='vocabulary';$('#news-quiz').hidden=!quiz;tv.querySelectorAll('.news-modes button').forEach(e=>e.setAttribute('aria-pressed',String(e.dataset.newsAction===mode)));
const scene=data.scenes[index];$('#news-progress').textContent=story?'Scene '+(index+1)+' / 12':quiz?'Question '+(question+1)+' / 10':'12 vocabulary cards';
for(const act of ['play','previous','next'])tv.querySelector('[data-news-action='+act+']').hidden=mode==='vocabulary';
for(const act of ['captions','continuous'])tv.querySelector('[data-news-action='+act+']').hidden=!story;
$('#news-jump').parentElement.querySelector('label').textContent=quiz?'Question':'Scene';$('#news-jump').hidden=mode==='vocabulary';
$('#news-jump').innerHTML=(quiz?data.questions:data.scenes).map((s,i)=>'<option value="'+i+'">'+(i+1)+'. '+esc(quiz?'Question '+(i+1):s.word)+'</option>').join('');$('#news-jump').value=String(quiz?question:index);
const prev=tv.querySelector('[data-news-action=previous]'),next=tv.querySelector('[data-news-action=next]');prev.disabled=(quiz?question:index)===0;next.disabled=quiz&&question===9;next.textContent=story&&index===11?'Answer 10 questions →':'Next →';
if(story){$('#news-image').src=scene.image;$('#news-image').alt=scene.alt;$('#news-headline').hidden=index!==0;$('#news-scene-title').textContent=scene.title;$('#news-caption').innerHTML=annotate(scene.text);$('#news-caption').hidden=!caption;$('#news-word-help').open=false;$('#news-word-card').innerHTML='<h3>'+wordButton(scene.word)+'</h3><p>'+annotate(scene.definition)+'</p><p>'+annotate(scene.prompt)+'</p>';}
if(quiz){const q=data.questions[question];$('#news-question-title').innerHTML=annotate(q.question);$('#news-choices').innerHTML=q.options.map((s,i)=>'<label><input type="radio" name="news-answer" value="'+i+'" '+(answers[question]===i?'checked ':'')+(graded?'disabled':'')+'/><span><b>'+String.fromCharCode(65+i)+'.</b> '+annotate(s)+'</span></label>').join('');$('#news-feedback').textContent=graded?(answers[question]===q.answer?'Correct. ':'Review this answer. ')+'Answer '+String.fromCharCode(65+q.answer)+': '+q.feedback:'';$('#news-score').textContent=graded?'Result: '+data.questions.filter((q,i)=>q.answer===answers[i]).length+' / 10. Review each question to see the explanation.':'';tv.querySelector('[data-news-action=grade]').hidden=graded||question!==9;tv.querySelector('[data-news-action=retry-quiz]').hidden=!graded;tv.querySelector('[data-news-action=review-scene]').hidden=!graded;}
prepareNarration();syncAudio();}
function setMode(m){mode=m;render();}
$('#news-image').addEventListener('error',()=>status('This picture could not load. Check your connection and select the scene again.'));
$('#news-speed').addEventListener('change',e=>{rate=Number(e.target.value);audio.playbackRate=rate;wordAudio.playbackRate=rate;});$('#news-jump').addEventListener('change',e=>{if(mode==='quiz')question=Number(e.target.value);else index=Number(e.target.value);render();});$('#news-choices').addEventListener('change',e=>{if(!graded&&e.target.name==='news-answer')answers[question]=Number(e.target.value);});
document.addEventListener('click',e=>{const word=e.target.closest('[data-word]');if(word){showTip(word);playFile(data.glossary.find(w=>w.term===word.dataset.word).audio,word.dataset.word);return;}const scene=e.target.closest('[data-news-scene]');if(scene){index=Number(scene.dataset.newsScene);setMode('story');return;}const button=e.target.closest('[data-news-action]');if(!button||!data)return;const a=button.dataset.newsAction;
if(['story','vocabulary','quiz'].includes(a))return setMode(a);
if(a==='play')playFile(mode==='quiz'?data.questions[question].audio:data.scenes[index].audio);
if(a==='stop')stop();
if(a==='previous'||a==='next'){const delta=a==='next'?1:-1;if(mode==='story'&&index===11&&delta===1)return setMode('quiz');if(mode==='quiz')question=Math.max(0,Math.min(9,question+delta));else index=Math.max(0,Math.min(11,index+delta));render();}
if(a==='captions'){caption=!caption;$('#news-caption').hidden=!caption;button.setAttribute('aria-pressed',String(caption));button.textContent='Captions: '+(caption?'on':'off');}
if(a==='continuous'){stop();index=0;mode='story';render();continuous=true;playFile(data.scenes[0].audio,null,true);}
if(a==='grade'){const missing=data.questions.findIndex((_,i)=>answers[i]===undefined);if(missing>=0){question=missing;render();status('Please answer all ten questions. Question '+(missing+1)+' needs an answer.');$('#news-question-title').focus();}else{graded=true;render();}}
if(a==='retry-quiz'){answers=[];graded=false;question=0;render();}
if(a==='review-scene'){index=data.questions[question].scene;setMode('story');}
if(a==='project'){opener=button;hideTip();$('#news-project-slot').append(tv);dialog.showModal();document.documentElement.classList.add('news-projecting');}
if(a==='close-project')dialog.close();
if(a==='fullscreen'){if(document.fullscreenElement)document.exitFullscreen().catch(()=>{});else document.documentElement.requestFullscreen?.().then(()=>ownsFullscreen=true).catch(()=>status('Full screen is unavailable; the enlarged view is ready.'));}
});
dialog.addEventListener('close',()=>{stop();hideTip();$('#news-home').append(tv);document.documentElement.classList.remove('news-projecting');if(ownsFullscreen&&document.fullscreenElement)document.exitFullscreen().catch(()=>{});ownsFullscreen=false;opener?.focus({preventScroll:true});});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!tip.hidden){hideTip();e.preventDefault();e.stopPropagation();}},true);
document.addEventListener('fullscreenchange',()=>{dialog.querySelector('[data-news-action=fullscreen]').textContent=document.fullscreenElement?'Exit full screen':'Full screen';});
window.addEventListener('pagehide',stop);$('#news-retry-load').addEventListener('click',()=>location.reload());
async function init(){try{const r=await fetch('/assets/data/english-intermediate2-unit6-newsroom.json?v=20261009-1');if(!r.ok)throw Error('Data unavailable');data=await r.json();if(data.scenes.length!==12||data.questions.length!==10)throw Error('Incomplete activity');$('#news-word-grid').innerHTML=data.scenes.map((s,i)=>'<article class="news-vocab-card"><img src="'+esc(s.image)+'" alt="'+esc(s.alt)+'" loading="lazy" width="1536" height="1024"/><div><h3>'+wordButton(s.word)+'</h3><p>'+annotate(s.definition)+'</p><button type="button" data-news-scene="'+i+'">View scene '+(i+1)+'</button></div></article>').join('');$('#news-load').hidden=true;tv.hidden=false;if(!document.documentElement.requestFullscreen)dialog.querySelector('[data-news-action=fullscreen]').hidden=true;render();}catch{ $('#news-load').textContent='The newsroom could not load. Check your connection and try again.';$('#news-retry-load').hidden=false;}}
init();
 // Keep the established authentication panel inside the visible viewport.
 let authPanel=null,authObserver=null,authEvents=null;
 function prepareAuth(){
  const panel=document.querySelector('[data-auth-panel]');if(panel===authPanel)return;
  authObserver?.disconnect();authEvents?.abort();authPanel=panel;if(!panel)return;authEvents=new AbortController();
  const place=()=>{const v=window.visualViewport;panel.style.setProperty('--u6-auth-top',((v?.offsetTop||0)+12)+'px');panel.style.setProperty('--u6-auth-height',Math.max(120,(v?.height||innerHeight)-24)+'px');if(typeof panel.showPopover==='function'){if(!panel.hasAttribute('popover'))panel.setAttribute('popover','manual');if(panel.hidden){if(panel.matches(':popover-open'))panel.hidePopover();}else if(!panel.matches(':popover-open'))panel.showPopover();}};
  authObserver=new MutationObserver(place);authObserver.observe(panel,{attributes:true,attributeFilter:['hidden']});window.visualViewport?.addEventListener('resize',place,{signal:authEvents.signal});window.visualViewport?.addEventListener('scroll',place,{signal:authEvents.signal});place();
 }
 new MutationObserver(prepareAuth).observe(document.body,{childList:true,subtree:true});prepareAuth();
 document.addEventListener('keydown',e=>{if(e.key==='Escape'&&authPanel&&!authPanel.hidden)authPanel.hidden=true;});

})();
