/* Verify automatic spoken prompts and the word-only listening exception. */
const {chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs');
const {words,prompts}=JSON.parse(fs.readFileSync('assets/data/english-intermediate2-news-quest.json'));
const origin=process.env.QUEST_ORIGIN||'http://127.0.0.1:8139',url=origin+'/ingles/intermediate-2/practice-unit-6-news-quest.html';
async function end(p){await p.waitForFunction(()=>{const a=document.querySelector('#quest-model-audio');return a.currentTime>0&&isFinite(a.duration);});await p.locator('#quest-model-audio').evaluate(a=>a.currentTime=a.duration-.02);}
async function playing(p,src){await p.waitForFunction(s=>{const a=document.querySelector('#quest-model-audio');return a.getAttribute('src')===s&&!a.paused&&a.currentTime>0;},src);}
(async()=>{const browser=await chromium.launch();try{
 for(const width of [390,1440]){
 const p=await browser.newPage({viewport:{width,height:900}});const errors=[];p.on('pageerror',e=>errors.push(e.message));
 await p.addInitScript(()=>{window.played=[];document.addEventListener('play',e=>{if(e.target.id==='quest-model-audio')window.played.push(e.target.getAttribute('src'));},true);});
 await p.goto(url);await p.locator('#quest-start').click();
 const visited=new Set();let count=0;
 while(visited.size<7&&count++<36){
  const type=await p.locator('#quest-type').innerText();let w,key;
  if(type.startsWith('Listen')){
   await p.waitForFunction(()=>document.querySelector('#quest-model-audio').currentTime>0);const src=await p.locator('#quest-model-audio').getAttribute('src');w=words.find(w=>w.audio===src);assert(w,'listening must autoplay only a vocabulary word');key=type==='Listen → picture'?'listen-picture':'listen-word';assert(await p.locator('#quest-repeat-question').isHidden());
   assert.equal(await p.locator('#quest-choices [data-word]').count(),0);assert(!(await p.evaluate(()=>played)).some(s=>s.includes('prompt-listen-')));
  }else if(type==='Picture → word'){
   key='picture-word';const src=await p.locator('#quest-stimulus img').getAttribute('src');w=words.find(w=>w.image===src);await playing(p,prompts[key].audio);await end(p);await p.waitForFunction(()=>document.querySelector('#quest-model-audio').ended);assert.equal(await p.locator('#quest-model-audio').getAttribute('src'),prompts[key].audio,'picture recognition must not hear the answer');
  }else if(type==='Complete the news'){
   key='cloze';const text=await p.locator('.quest-cloze').innerText();w=words.find(w=>w.cloze===text);await playing(p,prompts[key].audio);await end(p);await playing(p,w.clozeAudio);
  }else{
   const text=await p.locator('#quest-prompt').innerText();key=Object.keys(prompts).find(k=>k.startsWith('speak-')&&prompts[k].text===text);const src=await p.locator('#quest-stimulus img').getAttribute('src');w=words.find(w=>w.image===src);await playing(p,prompts[key].audio);
   await end(p);
   if(key==='speak-image'){await p.waitForFunction(()=>document.querySelector('#quest-model-audio').ended);assert(await p.locator('#quest-speech-model').isHidden());assert.equal(await p.locator('#quest-model-audio').getAttribute('src'),prompts[key].audio);}
   else await playing(p,key==='speak-word'?w.audio:w.sentenceAudio);
  }
  visited.add(key);
  if(key==='speak-word'){
   await p.locator('#quest-repeat-question').click();await playing(p,prompts[key].audio);await p.locator('#quest-stop-audio').click();await p.locator('#quest-model-audio').evaluate(a=>a.dispatchEvent(new Event('ended')));assert(await p.locator('#quest-model-audio').evaluate(a=>a.paused));assert.equal(await p.locator('#quest-model-audio').getAttribute('src'),prompts[key].audio);
   await p.locator('#quest-repeat-question').click();await playing(p,prompts[key].audio);await p.locator('#quest-voice').uncheck();await p.locator('#quest-model-audio').evaluate(a=>a.dispatchEvent(new Event('ended')));assert(await p.locator('#quest-model-audio').evaluate(a=>a.paused));await p.locator('#quest-voice').check();
  }
  if(key.startsWith('speak-'))await p.locator('#quest-skip').click();else{await p.locator('#quest-choices input[value="'+w.id+'"]').check();await p.locator('#quest-check').click();}
  await p.locator('#quest-next').click();
 }
 assert.equal(visited.size,7);assert.deepEqual(errors,[]);assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));console.log('PASS all seven task modes autoplay correctly; listening reads only the word; stop/mute cancel queued clips at',width);await p.close();
 }
 const blocked=await browser.newPage();await blocked.addInitScript(()=>{const original=HTMLMediaElement.prototype.play;let first=true;HTMLMediaElement.prototype.play=function(){if(first&&this.id==='quest-model-audio'){first=false;return Promise.reject(new DOMException('Test autoplay restriction','NotAllowedError'));}return original.call(this);};});await blocked.goto(url);await blocked.locator('#quest-start').click();await blocked.waitForFunction(()=>document.querySelector('#quest-audio-status').textContent.includes('Press Repeat question or Listen'));await blocked.locator('#quest-listen').click();await blocked.waitForFunction(()=>document.querySelector('#quest-model-audio').currentTime>0);console.log('PASS blocked autoplay has manual retry');await blocked.close();
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exit(1)});
