/* Three separate challenges; mocked recognition uses synthetic audio, never student data. */
const {chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs');
const {words}=JSON.parse(fs.readFileSync('assets/data/english-intermediate2-news-quest.json'));
const origin=process.env.QUEST_ORIGIN||'http://127.0.0.1:8139',url=origin+'/ingles/intermediate-2/practice-unit-6-news-quest.html';
async function open(b,width=1440,setup){const p=await b.newPage({viewport:{width,height:900}});p.setDefaultTimeout(15000);p.errors=[];p.on('pageerror',e=>p.errors.push(e.message));await p.route('**/*',r=>r.request().url().startsWith(origin+'/')?r.continue():r.abort());if(setup)await p.addInitScript(setup);await p.goto(url);await p.locator('#quest-app').waitFor({state:'visible'});return p;}
async function target(p){const label=await p.locator('#quest-type').innerText();if(label.startsWith('Listen')){const src=await p.locator('#quest-model-audio').getAttribute('src');return words.find(w=>w.audio===src);}if(label==='Complete the news')return words.find(w=>w.cloze===p._cloze);const src=await p.locator('#quest-stimulus img').getAttribute('src');return words.find(w=>w.image===src);}
async function answer(p,wrong=false){if(await p.locator('.quest-cloze').count())p._cloze=await p.locator('.quest-cloze').innerText();const w=await target(p);assert(w);await p.locator('#quest-choices input'+(wrong?':not([value="'+w.id+'"])':'[value="'+w.id+'"]')).first().check();await p.locator('#quest-check').click();return w;}
async function record(p){await p.locator('#quest-record').click();await p.waitForFunction(()=>document.querySelector('#quest-timer').textContent.startsWith('1 /'));await p.locator('#quest-record-stop').click();}
async function speechText(p){return p.locator('#quest-speech-model').textContent();}
(async()=>{const b=await chromium.launch({args:['--use-fake-ui-for-media-stream','--use-fake-device-for-media-stream']});try{
for(const width of [320,390,768,1024,1440,1920]){
 const p=await open(b,width);assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));assert.equal(await p.locator('[data-stage]').count(),3);
 await p.locator('.jl-page-qr-open').click();await p.locator('.jl-page-qr-dialog').waitFor({state:'visible'});await p.keyboard.press('Escape');
 await p.locator('#quest-preview').click();assert.equal(await p.locator('.quest-card').count(),12);await p.locator('[data-word=headline]').hover();assert.equal(await p.locator('#quest-translation').innerText(),words[0].spanish);await p.locator('[data-word=headline]').click();await p.waitForFunction(()=>document.querySelector('#quest-model-audio').currentTime>0);await p.locator('#quest-review-close').click();
 await p.locator('#quest-start').click();assert.match(await p.locator('#quest-count').innerText(),/Vocabulary.*\/ 12/);assert(await p.locator('#quest-speaking').isHidden());await p.locator('#quest-map').click();
 if(width===390||width===1440){
 for(const stage of ['vocabulary','listening']){
  await p.locator('[data-stage='+stage+']').click();let count=0;const seen=new Set();
  while(await p.locator('#quest-game').isVisible()){
   assert(++count<=24);const type=await p.locator('#quest-type').innerText();assert(stage==='listening'?type.startsWith('Listen'):['Picture → word','Complete the news'].includes(type));assert(await p.locator('#quest-speaking').isHidden());
   const wrong=width===390&&count===1;const w=await answer(p,wrong);seen.add(w.id);
   if(wrong){await p.locator('#quest-retry').click();await answer(p,true);assert.match(await p.locator('#quest-feedback').innerText(),/Let’s learn/);}
   await p.locator('#quest-next').click();
  }
  assert.equal(count,width===390?13:12);assert.equal(seen.size,12);assert.match(await p.locator('#quest-finish-title').innerText(),/trophy earned/);assert.match(await p.locator('#quest-summary').innerText(),width===390?/11 \/ 12/:/12 \/ 12/);await p.locator('#quest-restart').click();assert(await p.locator('[data-stage='+stage+'].is-earned').isVisible());
 }
 await p.screenshot({path:'/private/tmp/news-quest-trophies-'+width+'.png'});
 }
 assert.deepEqual(p.errors,[]);await p.close();console.log('PASS responsive trophy map, QR, cards and separated skill rounds',width);
}
const mic=await open(b,390,()=>{const original=navigator.mediaDevices.getUserMedia.bind(navigator.mediaDevices);window.testStreams=[];navigator.mediaDevices.getUserMedia=async c=>{const s=await original(c);window.testStreams.push(s);return s;};});
let recognized='',calls=0,status=200;
await mic.route('**/api/english-intermediate/pronunciation-assessment',async r=>{calls++;assert.equal(r.request().method(),'POST');assert(r.request().postDataBuffer().length>0);await r.fulfill({status,contentType:'application/json',body:JSON.stringify(status===200?{text:recognized,audio:{rms:.08}}:{error:'Busy'})});});
await mic.locator('[data-stage=pronunciation]').click();
// An unrelated answer cannot pass, even with confidence-like output.
recognized='Completely unrelated words';await record(mic);await mic.waitForFunction(()=>document.querySelector('#quest-assessment').textContent.includes('Let’s try again'));assert(await mic.locator('#quest-next').isHidden());assert(await mic.locator('#quest-recording').isVisible());
// Transport failures retain the same recording for explicit retry.
status=503;await record(mic);await mic.locator('#quest-assess-retry').waitFor({state:'visible'});status=200;recognized=await speechText(mic);await mic.locator('#quest-assess-retry').click();await mic.locator('#quest-next').waitFor({state:'visible'});await mic.locator('#quest-next').click();
for(let i=1;i<12;i++){assert.equal(await mic.locator('#quest-type').innerText(),'Speaking practice');recognized=await speechText(mic);await record(mic);await mic.locator('#quest-next').waitFor({state:'visible'});assert.match(await mic.locator('#quest-assessment').innerText(),/Words recognized/);await mic.locator('#quest-next').click();}
assert.equal(calls,14);assert.match(await mic.locator('#quest-finish-title').innerText(),/Pronunciation trophy earned/);assert.match(await mic.locator('#quest-summary').innerText(),/12 \/ 12/);assert(await mic.evaluate(()=>testStreams.every(s=>s.getTracks().every(t=>t.readyState==='ended'))));assert.deepEqual(mic.errors,[]);await mic.close();console.log('PASS recognition errors, retained retry, automatic results, trophy and microphone cleanup');
const skipped=await open(b);await skipped.locator('[data-stage=pronunciation]').click();for(let i=0;i<12;i++){await skipped.locator('#quest-skip').click();await skipped.locator('#quest-next').click();}assert.doesNotMatch(await skipped.locator('#quest-finish-title').innerText(),/earned/);await skipped.locator('#quest-restart').click();assert.equal(await skipped.locator('[data-stage=pronunciation].is-earned').count(),0);await skipped.close();console.log('PASS unverified speaking cannot earn a trophy');
for(const kind of ['denied','silent','late']){
 const p=await open(b,1440,kind==='denied'?()=>{navigator.mediaDevices.getUserMedia=async()=>{throw new DOMException('Denied','NotAllowedError');};}:kind==='silent'?()=>{navigator.mediaDevices.getUserMedia=async()=>{window.testCtx=new AudioContext();return testCtx.createMediaStreamDestination().stream;};}:()=>{const original=navigator.mediaDevices.getUserMedia.bind(navigator.mediaDevices);window.testStreams=[];navigator.mediaDevices.getUserMedia=async c=>{const s=await original(c);testStreams.push(s);await new Promise(r=>window.releaseMic=r);return s;};});let sent=0;await p.route('**/api/english-intermediate/pronunciation-assessment',r=>{sent++;r.abort();});await p.locator('[data-stage=pronunciation]').click();
 if(kind==='silent'){await record(p);await p.waitForFunction(()=>document.querySelector('#quest-mic-status').textContent.includes('too quiet'));}
 else {await p.locator('#quest-record').click();if(kind==='denied')await p.waitForFunction(()=>document.querySelector('#quest-mic-status').textContent.includes('permission was not granted'));else{await p.waitForFunction(()=>!!window.releaseMic);await p.locator('#quest-map').click();await p.evaluate(()=>releaseMic());await p.waitForFunction(()=>testStreams.every(s=>s.getTracks().every(t=>t.readyState==='ended')));}}
 assert.equal(sent,0);await p.close();console.log('PASS microphone',kind);
}
const pending=await open(b);let release;await pending.route('**/api/english-intermediate/pronunciation-assessment',async r=>{await new Promise(resolve=>release=resolve);try{await r.fulfill({contentType:'application/json',body:JSON.stringify({text:'headline',audio:{rms:.08}})});}catch{}});await pending.locator('[data-stage=pronunciation]').click();await record(pending);await pending.waitForFunction(()=>document.querySelector('#quest-mic-status').textContent.includes('Checking'));await pending.locator('#quest-map').click();release();await pending.locator('[data-stage=vocabulary]').click();assert(await pending.locator('#quest-speaking').isHidden());assert(await pending.locator('#quest-next').isHidden());assert.deepEqual(pending.errors,[]);await pending.close();console.log('PASS navigation cancels pending recognition without awarding stale credit');
const reduced=await open(b);await reduced.emulateMedia({reducedMotion:'reduce'});await reduced.locator('#quest-effects').uncheck();await reduced.locator('#quest-start').click();for(let i=0;i<12;i++){await answer(reduced);await reduced.locator('#quest-next').click();}assert.equal(await reduced.locator('#quest-celebration i').count(),0);assert.equal(await reduced.locator('.quest-cup').evaluate(e=>getComputedStyle(e).animationName),'none');await reduced.close();console.log('PASS reduced motion and effects off');
const fail=await b.newPage();await fail.route('**/english-intermediate2-news-quest.json*',r=>r.abort());await fail.goto(url);await fail.locator('#quest-load-retry').waitFor({state:'visible'});await fail.close();
}finally{await b.close();}})().catch(e=>{console.error(e);process.exit(1)});
