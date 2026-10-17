(() => {
'use strict';
const $=s=>document.querySelector(s), esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const imgRoot='../../assets/img/english-intermediate-2/unit-6/final-oral-news/';
const roles={anchor:'David · Presenter',desk:'Mia · Studio journalist',field:'Leo · Field reporter',witness:'Ana · Witness'};
const actors={anchor:'David',desk:'',field:'',witness:''};
const videoRoot='../../assets/video/english-intermediate-2/final-oral-news/';
const publishedClips=[
 {url:videoRoot+'01-studio-heygen-v1.mp4',name:'Studio introduction · Chris'},
 {url:videoRoot+'02-field-heygen-v1.mp4',name:'Field reporter · Chris'},
 {url:videoRoot+'03-flood-heygen-v1.mp4',name:'The flood · ambient sound'}
];
const clips=[null,null,null]; const clipNames=['Studio introduction · scene 1','Field reporter · scene 3','Flood footage · scene 2'];
function selectedClip(scene){return Number.isInteger(scene.clip)?clips[scene.clip]||publishedClips[scene.clip]:null;}
function poster(scene){return scene.poster?imgRoot+scene.poster:imgRoot+scene.image+'-v1.webp';}
function videoMarkup(scene,projection){const clip=selectedClip(scene);return '<video controls playsinline preload="'+(projection?'metadata':'none')+'" poster="'+poster(scene)+'" src="'+esc(clip.url)+'" aria-label="'+esc(clip.name)+'"></video>';}
function cardVisual(scene,index){return selectedClip(scene)?'<div class="news-card-video">'+videoMarkup(scene,false)+'</div>':'<button class="news-card-visual" data-scene="'+index+'" aria-label="Project scene '+(index+1)+': '+esc(scene.title)+'"><img src="'+poster(scene)+'" width="1672" height="941" alt="'+esc(scene.title)+'" loading="lazy"></button>';}

let scenes=[],revealed=-1,current=0,showDialogue=false,rehearsal=false,returnFocus=null,sectionMode=false;
const dialog=$('#newsProjector');
function actorLabel(role){return roles[role]+(actors[role]?' — played by '+actors[role]:'');}
function lines(scene){return '<div class="news-lines">'+scene.lines.map(([role,text])=>'<p><b>'+esc(actorLabel(role))+'</b>'+esc(text)+'</p>').join('')+'</div>';}
function stopVideos(){document.querySelectorAll('.news-card video, #newsProjector video').forEach(v=>v.pause());}
document.addEventListener('play',e=>{if(e.target.tagName==='VIDEO')document.querySelectorAll('video').forEach(v=>{if(v!==e.target)v.pause();});},true);
function words(scene){return '<div class="news-words" aria-label="Useful vocabulary">'+scene.words.map(([w,m])=>'<span class="news-word" tabindex="0" data-meaning="'+esc(m)+'" aria-label="'+esc(w+': '+m)+'">'+esc(w)+'</span>').join('')+'</div>';}
function renderCards(){
 $('#newsProgress').textContent=(revealed+1)+' / '+scenes.length+' scenes revealed';
 $('#newsCards').innerHTML=scenes.map((s,i)=>i>revealed?'<article class="news-card"><button class="news-card-back" data-reveal="'+i+'" '+(i>revealed+1?'disabled':'')+' aria-label="Reveal scene '+(i+1)+': '+esc(s.title)+'"><span class="news-number">0'+(i+1)+'</span><span class="news-role">'+esc(roles[s.role])+'</span><strong>'+esc(s.title)+'</strong><small>'+(i>revealed+1?'Reveal the previous scene first':'Turn over this card ↗')+'</small></button></article>':'<article class="news-card revealed" id="newsCard'+i+'">'+cardVisual(s,i)+'<div class="news-card-copy"><p class="news-eyebrow">Scene 0'+(i+1)+' · '+esc(roles[s.role])+'</p><h3>'+esc(s.title)+'</h3><p>'+esc(s.goal)+'</p><button data-scene="'+i+'" type="button">Project scene ↗</button></div>'+(!rehearsal?'<details class="news-card-model"><summary>Classroom dialogue</summary>'+lines(s)+'</details>':'')+'</article>').join('');
}
function media(scene){
 const clip=selectedClip(scene),src=poster(scene);
 return '<div class="news-media"><figure>'+(clip?videoMarkup(scene,true):'<img src="'+src+'" width="1672" height="941" alt="'+esc(scene.title)+'">')+'<figcaption>'+(clip?'Fictional classroom model · '+esc(clip.name)+'. Press Play when ready.':'Still image · Perform this part live with your classmates.')+'</figcaption></figure>'+(clip?'<button type="button" data-still-image>Show still image</button>':'')+'</div>';
}
function showStill(message){const s=scenes[current];stopVideos();const media=dialog.querySelector('.news-media');if(media){media.querySelector('video')?.replaceWith(Object.assign(document.createElement('img'),{src:poster(s),alt:s.title}));media.querySelector('[data-still-image]')?.remove();}$('#newsProjectStatus').textContent=message;}
dialog.addEventListener('click',e=>{if(e.target.closest('[data-still-image]'))showStill('Still image for live classroom speech. Reopen the scene to play the video again.');});
document.addEventListener('error',e=>{if(e.target.matches?.('.news-card video')){const v=e.target;v.replaceWith(Object.assign(document.createElement('img'),{src:v.poster,alt:'Video unavailable. Use this image for the live classroom model.'}));}},true);
function renderProjection(){
 stopVideos();sectionMode=false;
 const s=scenes[current];
 $('#newsProjectTitle').textContent=(current+1)+' / '+scenes.length+' · '+s.title;
 $('#newsProjectRole').textContent=actorLabel(s.role);
 $('#newsProjection').innerHTML='<div class="news-projection-grid '+(!showDialogue?'picture-only':'')+'">'+media(s)+(showDialogue?'<section class="news-projection-copy"><h3>Classroom model</h3>'+lines(s)+'<p class="news-small">'+esc(s.cue)+'</p>'+words(s)+'</section>':'')+'</div>';
 $('#newsProjectControls').hidden=false;
 $('#newsPrev').disabled=current===0;$('#newsNext').disabled=current===scenes.length-1;
 $('#newsNext').textContent=current<revealed?'Next scene →':'Reveal next scene →';
 $('#newsShowDialogue').textContent=showDialogue?'Picture / video only':'Show dialogue';
 $('#newsShowDialogue').setAttribute('aria-pressed',String(showDialogue));$('#newsShowDialogue').disabled=rehearsal;
 $('#newsProjectStatus').textContent='';
 const video=dialog.querySelector('video');if(video){video.addEventListener('error',()=>{showStill('This video could not play. Use the still image, or choose a local video in Teacher setup.');});}
}
function openScene(i,opener){current=i;returnFocus=opener||document.activeElement;showDialogue=false;renderProjection();if(!dialog.open)dialog.showModal();}
function navigate(delta){const next=current+delta;if(next<0||next>=scenes.length)return;current=next;if(next>revealed){revealed=next;renderCards();}renderProjection();}
$('#newsCards').addEventListener('click',e=>{const reveal=e.target.closest('[data-reveal]'),project=e.target.closest('[data-scene]');if(reveal){const i=Number(reveal.dataset.reveal);if(i!==revealed+1)return;revealed=i;renderCards();$('#newsCard'+i+' [data-scene]').focus();$('#newsStatus').textContent='Scene '+(i+1)+' revealed. Open the projector or continue to the next card.';}else if(project)openScene(Number(project.dataset.scene),project);});
$('#newsRehearsal').addEventListener('change',e=>{rehearsal=e.target.checked;showDialogue=false;renderCards();$('#newsStatus').textContent=rehearsal?'Rehearsal: dialogue hidden. Speak in your own words.':'Classroom model: dialogue available.';});
$('#newsReset').addEventListener('click',()=>{if(dialog.open)dialog.close();revealed=-1;current=0;showDialogue=false;renderCards();$('#newsCards [data-reveal="0"]').focus();$('#newsStatus').textContent='All six cards are face down. Roles and chosen videos have been kept.';});
$('#newsPrev').addEventListener('click',()=>navigate(-1));$('#newsNext').addEventListener('click',()=>navigate(1));
$('#newsShowDialogue').addEventListener('click',()=>{if(rehearsal)return;showDialogue=!showDialogue;renderProjection();});
$('#newsClose').addEventListener('click',()=>dialog.close());
dialog.addEventListener('close',()=>{dialog.querySelectorAll('video').forEach(v=>v.pause());if(document.fullscreenElement===dialog)document.exitFullscreen().catch(()=>{});if(returnFocus?.isConnected)returnFocus.focus();else $('#newsCard'+current+' [data-scene]')?.focus();});
dialog.addEventListener('keydown',e=>{if(sectionMode||/INPUT|TEXTAREA|SELECT|VIDEO/.test(e.target.tagName))return;if(e.key==='ArrowRight'){e.preventDefault();navigate(1);}if(e.key==='ArrowLeft'){e.preventDefault();navigate(-1);}});
$('#newsFullscreen').addEventListener('click',async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else if(dialog.requestFullscreen)await dialog.requestFullscreen();else $('#newsProjectStatus').textContent='Your browser does not support full screen. The projector already fills the available window.';}catch{$('#newsProjectStatus').textContent='Full screen is unavailable. You can keep using the projector.';}});
document.querySelectorAll('[data-project-section]').forEach(b=>b.addEventListener('click',()=>{returnFocus=b;stopVideos();sectionMode=true;const section=document.getElementById(b.dataset.projectSection).cloneNode(true);section.removeAttribute('id');section.querySelectorAll('[id]').forEach(el=>el.removeAttribute('id'));section.querySelectorAll('[data-project-section]').forEach(el=>el.remove());$('#newsProjectRole').textContent='Classroom guide';$('#newsProjectTitle').textContent=section.querySelector('h2').textContent;$('#newsProjection').replaceChildren(section);section.className='news-projected-section';$('#newsProjectControls').hidden=true;$('#newsProjectStatus').textContent='';dialog.showModal();}));
$('#newsCast').innerHTML=Object.entries(roles).map(([role,label])=>'<label>'+esc(label)+'<input maxlength="60" data-role="'+role+'" value="'+esc(actors[role])+'" placeholder="Student’s first name" autocomplete="off"></label>').join('');
$('#newsCast').addEventListener('input',e=>{if(e.target.dataset.role){actors[e.target.dataset.role]=e.target.value.trim();if(scenes.length)renderCards();}});
$('#newsFiles').innerHTML=clipNames.map((n,i)=>'<div class="news-file"><label>Clip '+(i+1)+' · '+n+'<input type="file" accept="video/mp4,video/webm,video/ogg" data-clip="'+i+'"></label><p id="newsClipStatus'+i+'" role="status">Published video ready.</p><button type="button" data-remove-clip="'+i+'" hidden>Use published clip</button></div>').join('');
$('#newsFiles').addEventListener('change',async e=>{
 if(!e.target.matches('[data-clip]'))return;const i=Number(e.target.dataset.clip),file=e.target.files[0],status=$('#newsClipStatus'+i);if(!file)return;
 if(!(/\.(mp4|webm|og[gv])$/i.test(file.name)&&(!file.type||file.type.startsWith('video/')))){status.textContent='Choose an MP4, WebM or Ogg video file.';e.target.value='';return;}
 if(file.size>300*1024*1024){status.textContent='Choose a video smaller than 300 MB.';e.target.value='';return;}
 if(clips[i])URL.revokeObjectURL(clips[i].url);clips[i]={url:URL.createObjectURL(file),name:file.name};status.textContent='Ready on this device: '+file.name;$('#newsFiles [data-remove-clip="'+i+'"]').hidden=false;renderCards();
});
$('#newsFiles').addEventListener('click',e=>{const b=e.target.closest('[data-remove-clip]');if(!b)return;const i=Number(b.dataset.removeClip);if(clips[i])URL.revokeObjectURL(clips[i].url);clips[i]=null;$('#newsFiles [data-clip="'+i+'"]').value='';$('#newsClipStatus'+i).textContent='Published video ready.';b.hidden=true;renderCards();});
$('#newsCopyImagePrompt').addEventListener('click',async()=>{const text=$('#newsImagePrompt').textContent;try{await navigator.clipboard.writeText(text);$('#newsStatus').textContent='Image prompt copied.';$('#newsCopyImagePrompt').textContent='Copied';}catch{const range=document.createRange();range.selectNodeContents($('#newsImagePrompt'));const selection=getSelection();selection.removeAllRanges();selection.addRange(range);$('#newsCopyImagePrompt').textContent='Text selected · copy it';}});
addEventListener('beforeunload',()=>clips.forEach(c=>{if(c)URL.revokeObjectURL(c.url);}));
fetch('../../assets/data/english-intermediate2-final-oral-news.json?v=20261016-hosted-videos').then(r=>{if(!r.ok)throw Error();return r.json();}).then(data=>{scenes=data.scenes;renderCards();}).catch(()=>{$('#newsStatus').className='news-error';$('#newsStatus').textContent='The scenes could not load. Reload this page to try again. The assessment brief is still available below.';});
})();
