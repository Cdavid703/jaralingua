/* Public UI and synthetic microphone tests. No real login, student audio or grading calls. */
const {chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs');
const origin=process.env.QUEST_ORIGIN||'http://127.0.0.1:8139',url=origin+'/ingles/intermediate-2/practice-unit-6-news-quest.html';
const {words}=JSON.parse(fs.readFileSync('assets/data/english-intermediate2-news-quest.json'));
const attempts=[];
async function open(browser,width=1440,setup){
 const p=await browser.newPage({viewport:{width,height:900}});p.setDefaultTimeout(12000);
 p.on('request',r=>{if(r.method()==='POST'&&r.url().startsWith(origin+'/'))attempts.push(r.url());});
 await p.route('**/*',r=>r.request().url().startsWith(origin+'/')?r.continue():r.abort());
 if(setup)await p.addInitScript(setup);
 await p.goto(url,{waitUntil:'domcontentloaded'});await p.locator('#quest-app').waitFor({state:'visible'});return p;
}
async function targetWord(p){
 const label=await p.locator('#quest-type').innerText();
 if(label.startsWith('Listen')){await p.locator('#quest-listen').click();await p.waitForFunction(()=>document.querySelector('#quest-model-audio').currentTime>0);const src=await p.locator('#quest-model-audio').getAttribute('src');return words.find(w=>w.audio===src);}
 const cloze=await p.locator('.quest-cloze').innerText();return words.find(w=>w.cloze===cloze);
}
async function answer(p,wrong=false){
 const label=await p.locator('#quest-type').innerText();let w;
 if(label==='Picture → word'){const src=await p.locator('#quest-stimulus img').getAttribute('src');w=words.find(w=>w.image===src);}else w=await targetWord(p);
 assert(w,'challenge must have a canonical word');
 const choice=p.locator('#quest-choices input'+(wrong?':not([value="'+w.id+'"])':'[value="'+w.id+'"]')).first();await choice.check();await p.locator('#quest-check').click();return w;
}
async function nextSpeaking(p){
 for(let i=0;i<3;i++){if(await p.locator('#quest-speaking').isVisible())return;await answer(p);await p.locator('#quest-next').click();}
 assert(await p.locator('#quest-speaking').isVisible());
}
(async()=>{const b=await chromium.launch({headless:true,args:['--use-fake-ui-for-media-stream','--use-fake-device-for-media-stream']});try{
 for(const width of [320,390,768,1024,1440,1920]){
  const p=await open(b,width),errors=[];p.on('pageerror',e=>errors.push(e.message));
  assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'overflow '+width);
  await p.locator('.jl-page-qr-open').click();await p.locator('.jl-page-qr-dialog').waitFor({state:'visible'});await p.keyboard.press('Escape');
  await p.locator('#quest-preview').click();assert.equal(await p.locator('.quest-card').count(),12);const word=p.locator('[data-word=headline]');await word.hover();assert.equal(await p.locator('#quest-translation').innerText(),words[0].spanish);assert(await p.locator('#quest-model-audio').evaluate(a=>a.paused));await word.click();await p.waitForFunction(()=>document.querySelector('#quest-model-audio').currentTime>0);await p.locator('#quest-review-close').click();
  await p.locator('#quest-start').click();assert.match(await p.locator('#quest-count').innerText(),/\/ 36/);assert(await p.locator('#quest-check').isDisabled());
  await p.locator('#quest-listen').click();await p.waitForFunction(()=>document.querySelector('#quest-model-audio').currentTime>0);await p.locator('#quest-slow').click();assert.equal(await p.locator('#quest-model-audio').evaluate(a=>a.playbackRate),.75);
  await p.locator('#quest-voice').uncheck();assert(await p.locator('#quest-model-audio').evaluate(a=>a.paused));await p.locator('#quest-listen').click();assert.match(await p.locator('#quest-audio-status').innerText(),/Voice is off/);await p.locator('#quest-voice').check();
  assert.equal(await p.locator('#quest-choices [data-word]').count(),0,'no translation answer spoilers');
  if(width===390||width===1440){
   await p.screenshot({path:'/private/tmp/news-quest-'+width+'.png'});
   const wrong=width===390;let count=0,oral=0,seen=new Map(),wrongId=null;
   while(await p.locator('#quest-game').isVisible()){
    assert(++count<=48,'bounded review queue');
    if(await p.locator('#quest-speaking').isVisible()){
     oral++;await p.locator('#quest-aloud').click();await p.locator('[data-self=ready]').click();
    }else{
     const w=await answer(p,wrong&&count===1);seen.set(w.id,(seen.get(w.id)||0)+1);
     if(wrong&&count===1){wrongId=w.id;assert(await p.locator('#quest-retry').isVisible());await p.locator('#quest-retry').click();await answer(p,true);assert.match(await p.locator('#quest-feedback').innerText(),/Let’s learn/);assert.equal(await p.locator('#quest-choices .is-correct').count(),1);}
    }
    await p.locator('#quest-next').click();
   }
   assert.equal(oral,12);assert.equal(count,wrong?37:36);assert.equal(seen.size,12);assert([...seen.values()].every(n=>n>=2));
   assert.match(await p.locator('#quest-summary').innerText(),wrong?/23 \/ 24/:/24 \/ 24/);
   if(wrong){assert(await p.locator('#quest-difficult [data-word="'+wrongId+'"]').isVisible());await p.locator('#quest-practise-difficult').click();assert.match(await p.locator('#quest-count').innerText(),/\/ 3/);}
   else {await p.locator('#quest-phrases').click();assert.match(await p.locator('#quest-count').innerText(),/\/ 12/);const text=await p.locator('#quest-speech-model').innerText();assert(words.some(w=>w.sentence===text));assert.match(await p.locator('#quest-prompt').innerText(),/say the sentence/);}
  }
  assert.deepEqual(errors,[]);console.log('PASS layout, QR, vocabulary help and audio settings',width);await p.close();
 }
 // Synthetic device: real MediaRecorder, local Blob playback, and released tracks.
 const mic=await open(b,390,()=>{const original=navigator.mediaDevices.getUserMedia.bind(navigator.mediaDevices);window.testStreams=[];navigator.mediaDevices.getUserMedia=async c=>{const s=await original(c);window.testStreams.push(s);return s;};});
 await mic.locator('#quest-start').click();await nextSpeaking(mic);await mic.locator('#quest-record').click();await mic.waitForFunction(()=>!document.querySelector('#quest-record-stop').disabled);await mic.waitForFunction(()=>document.querySelector('#quest-timer').textContent.startsWith('1 /'));
 await mic.locator('#quest-record-stop').click();await mic.locator('#quest-recording').waitFor({state:'visible'});assert(await mic.locator('#quest-recording').getAttribute('src').then(s=>s.startsWith('blob:')));assert(await mic.evaluate(()=>testStreams.every(s=>s.getTracks().every(t=>t.readyState==='ended'))));assert(await mic.locator('[data-self=ready]').isDisabled());
 await mic.locator('#quest-recording').click({position:{x:25,y:27}});await mic.waitForFunction(()=>!document.querySelector('[data-self=ready]').disabled);await mic.locator('[data-self=practice]').click();await mic.locator('#quest-next').click();assert.equal(await mic.locator('#quest-recording').getAttribute('src'),null);console.log('PASS real recorder with synthetic input, self reflection and microphone cleanup');await mic.close();
 const denied=await open(b,1440,()=>{navigator.mediaDevices.getUserMedia=async()=>{throw new DOMException('Denied test','NotAllowedError');};});await denied.locator('#quest-start').click();await nextSpeaking(denied);await denied.locator('#quest-record').click();await denied.waitForFunction(()=>document.querySelector('#quest-mic-status').textContent.includes('permission was not granted'));await denied.locator('#quest-aloud').click();await denied.locator('[data-self=ready]').click();await denied.locator('#quest-next').click();console.log('PASS microphone denial and no-microphone path');await denied.close();
 const silent=await open(b,1440,()=>{navigator.mediaDevices.getUserMedia=async()=>{const ctx=new AudioContext();window.silentCtx=ctx;return ctx.createMediaStreamDestination().stream;};});await silent.locator('#quest-start').click();await nextSpeaking(silent);await silent.locator('#quest-record').click();await silent.waitForFunction(()=>document.querySelector('#quest-timer').textContent.startsWith('1 /'));await silent.locator('#quest-record-stop').click();await silent.waitForFunction(()=>document.querySelector('#quest-mic-status').textContent.includes('too quiet'));assert(await silent.locator('#quest-self-check').isHidden());console.log('PASS quiet recording is not treated as pronunciation failure');await silent.close();
 const late=await open(b,1440,()=>{const orig=navigator.mediaDevices.getUserMedia.bind(navigator.mediaDevices);window.testStreams=[];navigator.mediaDevices.getUserMedia=async c=>{const s=await orig(c);window.testStreams.push(s);await new Promise(r=>window.releaseMic=r);return s;};});await late.locator('#quest-start').click();await nextSpeaking(late);await late.locator('#quest-record').click();await late.waitForFunction(()=>!!window.releaseMic);await late.locator('#quest-skip').click();await late.locator('#quest-next').click();await late.evaluate(()=>window.releaseMic());await late.waitForFunction(()=>testStreams.every(s=>s.getTracks().every(t=>t.readyState==='ended')));console.log('PASS late microphone permission safely cancelled');await late.close();
 const touch=await b.newPage({viewport:{width:390,height:844},hasTouch:true,isMobile:true});await touch.goto(url);await touch.locator('#quest-preview').tap();await touch.locator('[data-word=headline]').tap();await touch.locator('#quest-translation').waitFor({state:'visible'});await touch.waitForFunction(()=>document.querySelector('#quest-model-audio').currentTime>0);console.log('PASS touch meaning and pronunciation');await touch.close();
 const catalog=await open(b);await catalog.goto(origin+'/ingles/intermediate-2/practice-lab.html#unit-6-folder');await catalog.locator('#practiceLabSearch').fill('News Quest');const link=catalog.locator('#unit6ActivityGrid a[href$="practice-unit-6-news-quest.html"]');await link.waitFor({state:'visible'});assert.equal(await catalog.locator('#unit6ActivityGrid a:visible').count(),1);await catalog.locator('[data-lab-filter=pronunciation]').click();assert(await link.isVisible());
 for(const path of new Set(words.flatMap(w=>[w.audio,w.sentenceAudio,w.image]))){const r=await catalog.request.get(origin+path);assert.equal(r.status(),200,path);}
 console.log('PASS catalog, skill filter, all images and all word/sentence audio');await catalog.close();
 const fail=await b.newPage();await fail.route('**/english-intermediate2-news-quest.json*',r=>r.abort());await fail.goto(url);await fail.locator('#quest-load-retry').waitFor({state:'visible'});assert(await fail.locator('#quest-app').isHidden());await fail.close();
 const audioFail=await open(b);await audioFail.route('**/*.mp3',r=>r.abort());await audioFail.locator('#quest-start').click();await audioFail.locator('#quest-listen').click();await audioFail.waitForFunction(()=>/Audio (could not|is unavailable)/.test(document.querySelector('#quest-audio-status').textContent));await audioFail.close();
 assert.deepEqual(attempts,[],'No recording or grade requests may leave the browser');console.log('PASS data/audio errors and no student uploads or grading requests');
}finally{await b.close();}})().catch(e=>{console.error(e);process.exit(1);});
