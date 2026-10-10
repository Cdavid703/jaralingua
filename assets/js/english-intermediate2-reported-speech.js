/* Teacher-led pair speaking. No student data, recording or scores. */
(()=>{'use strict';
const c=window.ReportedSpeechLesson,$=id=>document.getElementById(id),esc=s=>String(s).replace(/[&<>"']/g,x=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[x]));
let index=0,mode='image',audioToken=0,opener=null;const dialog=$('rsProjector'),audio=$('rsAudio');
const glossary=new Map(c.glossary.map(w=>[w.term.toLowerCase(),w]));
const wordPattern=new RegExp('\\b('+[...glossary.keys()].sort((a,b)=>b.length-a.length).map(t=>t.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')).join('|')+')\\b','gi');
let wordTarget=null,tipTimer=null,activeWord=null;
const tip=document.createElement('div');tip.id='rsTooltip';tip.role='tooltip';tip.lang='es';tip.hidden=true;document.body.append(tip);
function wordButton(term,label=term){return '<button type="button" class="rs-word" data-word="'+esc(term)+'" aria-pressed="false">'+esc(label)+'</button>';}
function wordText(text){let html='',last=0;for(const match of String(text).matchAll(wordPattern)){html+=esc(text.slice(last,match.index))+wordButton(match[0].toLowerCase(),match[0]);last=match.index+match[0].length;}return html+esc(text.slice(last));}
function highlight(root){const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT),nodes=[];while(walker.nextNode()){const n=walker.currentNode;if(n.parentElement.closest('button,a,summary,script,style,select,textarea,[hidden],.rs-word-guide'))continue;if(n.textContent.trim())nodes.push(n);}for(const node of nodes){const html=wordText(node.textContent);if(!html.includes('data-word='))continue;const template=document.createElement('template');template.innerHTML=html;node.replaceWith(template.content);}}
function words(){return '<h3>Words for this picture</h3><div class="rs-word-list">'+c.scenes[index].vocabulary.map(t=>wordButton(t)).join('')+'</div><button type="button" data-project="words">Project these words ↗</button>';}
function hideTip(){clearTimeout(tipTimer);wordTarget?.removeAttribute('aria-describedby');wordTarget=null;tip.hidden=true;}
function positionTip(){if(!wordTarget?.isConnected)return hideTip();const r=wordTarget.getBoundingClientRect(),t=tip.getBoundingClientRect();tip.style.left=Math.max(12,Math.min(innerWidth-t.width-12,r.left))+'px';tip.style.top=Math.max(12,r.top-t.height-8>=12?r.top-t.height-8:Math.min(innerHeight-t.height-12,r.bottom+8))+'px';}
function showTip(button){const word=glossary.get(button?.dataset.word);if(!word)return;hideTip();wordTarget=button;(dialog.open?dialog:document.body).append(tip);tip.textContent=word.spanish;tip.hidden=false;button.setAttribute('aria-describedby',tip.id);positionTip();}
function leaveTip(){clearTimeout(tipTimer);tipTimer=setTimeout(()=>{if(!tip.matches(':hover')&&document.activeElement!==wordTarget)hideTip();},160);}
function syncWords(){document.querySelectorAll('.rs-word').forEach(b=>b.setAttribute('aria-pressed',String(activeWord===b.dataset.word&&!audio.paused&&!audio.ended)));}
tip.addEventListener('pointerenter',()=>clearTimeout(tipTimer));tip.addEventListener('pointerleave',leaveTip);
document.addEventListener('pointerover',e=>{if(e.pointerType!=='touch'){const b=e.target.closest('.rs-word');if(b)showTip(b);}});
document.addEventListener('pointerout',e=>{if(e.target.closest('.rs-word'))leaveTip();});
document.addEventListener('focusin',e=>{const b=e.target.closest('.rs-word');if(b)showTip(b);});document.addEventListener('focusout',leaveTip);
document.addEventListener('pointerdown',e=>{if(!e.target.closest('.rs-word,#rsTooltip'))hideTip();},true);
document.addEventListener('scroll',()=>{if(!tip.hidden)positionTip();},true);window.addEventListener('resize',hideTip);
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!tip.hidden){hideTip();e.preventDefault();e.stopPropagation();}},true);
for(const event of ['play','pause','ended','error'])audio.addEventListener(event,syncWords);

function stop(){activeWord=null;audioToken++;audio.pause();audio.removeAttribute('src');audio.load();syncWords();$('rsAudioStatus').textContent='';$('rsProjectionStatus').textContent='';}
async function play(file,word=null){stop();activeWord=word;const token=audioToken;audio.src=file.startsWith('/')?file:c.audioRoot+file;audio.playbackRate=Number($('rsSpeed').value);try{await audio.play();if(token===audioToken){$('rsAudioStatus').textContent=(word?'Playing: '+word:'Playing model');$('rsProjectionStatus').textContent=(word?'Playing: '+word:'Playing model');}}catch(e){if(token===audioToken){$('rsAudioStatus').textContent='Audio could not play. Try Listen again.';$('rsProjectionStatus').textContent=$('rsAudioStatus').textContent;}}}
audio.addEventListener('ended',()=>{$('rsAudioStatus').textContent='';$('rsProjectionStatus').textContent='';});audio.addEventListener('error',()=>{if(audio.getAttribute('src')){$('rsAudioStatus').textContent='Audio could not load. Try Listen again.';$('rsProjectionStatus').textContent=$('rsAudioStatus').textContent;}});
$('rsSpeed').addEventListener('change',()=>audio.playbackRate=Number($('rsSpeed').value));
function models(){const s=c.scenes[index];return '<div class="rs-model-pair">'+['a','b'].map(role=>'<section><h3>'+ (role==='a'?'A · Ana describes':'B · Her partner reports')+'</h3>'+s[role].map(t=>'<p>'+wordText(t)+'</p>').join('')+'<button type="button" data-audio="'+s.slug+'-'+role+'.mp3">Listen to '+role.toUpperCase()+'</button></section>').join('')+'</div><ul class="rs-change-chips" aria-label="Verb and pronoun changes">'+s.changes.map(t=>'<li>'+esc(t)+'</li>').join('')+'</ul>';}
function copy(id){const node=$(id).cloneNode(true);node.removeAttribute('id');node.querySelectorAll('[aria-describedby]').forEach(e=>e.removeAttribute('aria-describedby'));node.querySelectorAll('[id]').forEach(e=>e.removeAttribute('id'));node.querySelectorAll('[data-project]').forEach(e=>e.remove());return node.outerHTML;}
function updateNav(){document.querySelectorAll('[data-nav]').forEach(b=>b.disabled=b.dataset.nav==='prev'?index===0:index===10);document.querySelectorAll('[data-select]').forEach(b=>b.setAttribute('aria-current',String(Number(b.dataset.select)===index)));}
function render(focus=false){stop();hideTip();const s=c.scenes[index];$('rsNumber').textContent=index===0?'Guided example · Watch both speakers':`Practice ${index} of 10 · Swap roles`;$('rsTitle').textContent=s.title;$('rsImageError').hidden=true;$('rsImage').src=s.image;$('rsImage').alt=s.alt;$('rsModelBody').innerHTML=models();$('rsWords').innerHTML=words();highlight($('practice'));$('rsModels').open=index===0;$('rsModelLabel').textContent=index===0?'Our guided example · Read and listen':'Possible answer · Reveal after both students speak';updateNav();if(dialog.open)project(mode,false);else if(focus){$('rsTitle').focus({preventScroll:true});$('practice').scrollIntoView({block:'start'});}}
function project(next,open=true){mode=next;stop();hideTip();const s=c.scenes[index];$('rsProjectTitle').textContent=(index===0?'Example':'Picture '+index+' / 10')+' · '+s.title;let html='';
if(mode==='image')html='<img class="rs-project-image" src="'+s.image+'" alt="'+esc(s.alt)+'">';
else if(mode==='words')html=copy('rsWords');
else if(mode==='a'||mode==='b')html=copy(mode==='a'?'rsRoleA':'rsRoleB');
else if(mode==='model')html='<p>Possible answer · Replace Ana with your partner’s name. Report your partner’s actual words.</p>'+models();
else if(mode==='grammar'){html='<div class="rs-steps">'+copy('rsGrammar')+'</div>';$('rsProjectTitle').textContent='How to report your partner’s words';}
else if(mode==='changes'){html=copy('rsChanges');$('rsProjectTitle').textContent='From present to reported speech';}
else if(mode==='guide'){$('rsProjectTitle').textContent='How to practise';html='<div class="rs-steps"><ol><li>The teacher chooses two students.</li><li>A describes three picture details in the present.</li><li>B reports A’s words: <strong>My partner said that…</strong></li><li>The class checks meaning, verbs and pronouns.</li><li>Swap roles for the next picture.</li></ol><button type="button" data-audio="guide.mp3">Listen to the steps</button></div>';}
else html='<div class="rs-round"><figure class="rs-scene"><img src="'+s.image+'" alt="'+esc(s.alt)+'">'+copy('rsWords')+'</figure>'+copy('rsRoleA')+copy('rsRoleB')+'</div>';
$('rsProjected').innerHTML=html;highlight($('rsProjected'));if(open&&!dialog.open){opener=document.activeElement;dialog.showModal();}updateNav();}
function select(n,focus=true){index=Math.max(0,Math.min(10,n));render(focus);}
$('rsGallery').innerHTML=c.scenes.slice(1).map(s=>'<button type="button" data-select="'+s.id+'" data-search="'+esc((s.title+' '+s.slug).toLowerCase())+'"><img loading="lazy" src="'+s.image+'" alt="'+esc(s.alt)+'" width="1536" height="1024"><span>'+s.id+' · '+esc(s.title)+'</span></button>').join('');
$('rsSearch').addEventListener('input',e=>{const query=e.target.value.trim().toLowerCase();let count=0;$('rsGallery').querySelectorAll('button').forEach(b=>{b.hidden=!b.dataset.search.includes(query);if(!b.hidden)count++;});$('rsEmpty').hidden=count>0;});
document.addEventListener('click',e=>{const b=e.target.closest('button');if(!b||b.disabled)return;if(b.dataset.word){showTip(b);play(glossary.get(b.dataset.word).audio,b.dataset.word);return;}if(b.dataset.project)project(b.dataset.project);else if(b.dataset.nav)select(index+(b.dataset.nav==='next'?1:-1));else if(b.dataset.select!==undefined)select(Number(b.dataset.select));else if(b.dataset.audio)play(b.dataset.audio);else if(b.hasAttribute('data-stop'))stop();});
$('rsImage').addEventListener('error',()=>$('rsImageError').hidden=false);$('rsRetryImage').addEventListener('click',()=>{$('rsImage').src=c.scenes[index].image+'?retry='+Date.now();$('rsImageError').hidden=true;});
$('rsClose').addEventListener('click',()=>dialog.close());dialog.addEventListener('close',()=>{stop();hideTip();if(document.fullscreenElement===dialog)document.exitFullscreen().catch(()=>{});opener?.focus({preventScroll:true});});
$('rsFullscreen').addEventListener('click',async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else if(dialog.requestFullscreen)await dialog.requestFullscreen();else throw Error();}catch{$('rsProjectionStatus').textContent='Full screen is unavailable. This large projection view is still ready to use.';}});
dialog.addEventListener('keydown',e=>{if(['INPUT','SELECT','TEXTAREA'].includes(e.target.tagName))return;if(e.key==='ArrowRight'||e.key==='ArrowLeft'){e.preventDefault();select(index+(e.key==='ArrowRight'?1:-1));}});
window.addEventListener('pagehide',stop);highlight(document.querySelector('main'));render();
})();
