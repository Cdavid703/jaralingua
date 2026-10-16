/* Real-browser checks for the story's teaching interactions, media and responsive projection. */
const assert=require('node:assert/strict'),fs=require('node:fs'),crypto=require('node:crypto');
const {chromium}=require('playwright');
const origin=process.env.STORM_ORIGIN||'http://127.0.0.1:8139', route='/ingles/intermediate-2/reading-unit-6-after-the-storm.html';
const data=JSON.parse(fs.readFileSync('assets/data/english-intermediate2-after-the-storm.json'));
const modelDir='ingles/intermediate-2/audio/unit-6-after-the-storm/';
const models=JSON.parse(fs.readFileSync(modelDir+'models.json')).items;
const audit=JSON.parse(fs.readFileSync(modelDir+'audio-audit.json'));
const all=data.pages.flatMap(p=>p.challenges);
const open=async p=>{await p.goto(origin+route);await p.locator('#stOpen').click();};
const step=async(p,n)=>p.locator(`[data-stage="${n}"]`).click();
const closeProject=async p=>p.locator('[data-action=project-close]').click();
(async()=>{
 const browser=await chromium.launch({channel:'chrome',headless:true});
 try {
  assert.equal(data.pages.length,10);assert.equal(all.length,20);assert.equal(models.length,92);
  assert.equal(new Set(data.pages.flatMap(p=>p.scenes.map(s=>s.image))).size,20);
  for(const p of data.pages){assert.equal(p.vocabulary.length,5);for(const c of p.challenges){assert(c.options.includes(c.answer));for(const v of c.options.filter(x=>x!==c.answer))assert(c.feedback[v]?.length>35);}}
  const p=await browser.newPage({viewport:{width:1440,height:900}}),errors=[];p.on('pageerror',e=>errors.push(e.message));
  await open(p);await step(p,1);
  const word=p.locator('#stCopy [data-vocabulary=overnight]').first();await word.hover();await p.locator('#fvVocabularyTooltip').waitFor({state:'visible'});assert.match(await p.locator('#fvVocabularyTooltip').innerText(),/noche/);assert(await p.locator('#stAudio').evaluate(a=>a.paused));await word.click();await p.waitForFunction(()=>document.querySelector('#stAudio').currentTime>0);await step(p,2);assert(await p.locator('#stAudio').evaluate(a=>a.paused));
  // Test BOTH distractors and recovery for every challenge, then review the original mistakes.
  for(let i=0;i<10;i++){
   if(i)await p.locator('#stPage').selectOption(String(i));await step(p,2);
   for(const c of data.pages[i].challenges){
    let card=p.locator(`#stCopy [data-card="${c.id}"]`);
    assert.equal(await card.locator('[data-action=answer-audio]').count(),0);
    for(const wrong of c.options.filter(v=>v!==c.answer)){
     await card.locator(`[data-option="${wrong}"]`).click();await card.locator('[data-action=check]').click();assert.match(await card.locator('.st-feedback').innerText(),/Aún no/);assert((await card.locator('.st-feedback').innerText()).includes(c.feedback[wrong]));assert(await p.locator('#stAudio').evaluate(a=>a.paused));
    }
    await card.locator('[data-action=hint]').click();assert.equal(await card.locator('.st-hint').innerText(),c.hint);
    await card.locator(`[data-option="${c.answer}"]`).click();await card.locator('[data-action=check]').click();assert.match(await card.locator('.st-feedback').innerText(),/Correcto/);await p.waitForFunction(()=>document.querySelector('#stAudio').currentTime>0);assert.equal(await p.locator('#stAudio').getAttribute('src'),c.audio);
   }
  }
  await p.locator('#stNext').click();assert.match(await p.locator('#stCopy').innerText(),/0\/20 correct on the first attempt/);assert.match(await p.locator('#stCopy').innerText(),/20\/20 challenges completed/);
  await p.locator('[data-action=review]').click();assert.equal(await p.locator('#stCopy .is-solved').count(),0);
  const first=all[0];await p.locator(`#stCopy [data-card="${first.id}"] [data-action=challenge-project]`).click();
  await p.locator(`#stProjectionBody [data-option="${first.answer}"]`).click();await p.locator('#stProjectionBody [data-action=check]').click();assert.match(await p.locator('#stProjectionBody .st-feedback').innerText(),/Correcto/);await closeProject(p);assert(await p.locator(`#stCopy [data-card="${first.id}"]`).evaluate(e=>e.classList.contains('is-solved')));
  await p.locator('#stPage').selectOption('9');await p.locator('#stNext').click();assert.match(await p.locator('#stCopy').innerText(),/0\/20 correct on the first attempt/);
  await p.locator('[data-action=return]').click();await p.locator('#stPrev').click();await p.waitForTimeout(700);assert.equal(await p.locator('#stLeaf').getAttribute('class'),'fv-leaf');
  // Every MP3 must match its declared hash and decode in a real audio context.
  for(const m of models){const buf=fs.readFileSync(modelDir+m.file);assert.equal(crypto.createHash('sha256').update(buf).digest('hex'),m.sha256);assert(audit.some(x=>x.file===m.file && x.sha256===m.sha256 && x.matched),'Scribe audit '+m.file);}
  const media=await p.evaluate(async paths=>{const ac=new AudioContext();const out=[];for(const path of paths){const r=await fetch(path);if(!r.ok)throw Error(path);const b=await ac.decodeAudioData(await r.arrayBuffer());out.push(b.duration);}await ac.close();return out;},models.map(m=>'/'+modelDir+m.file));assert(media.every(d=>d>.15));
  await p.evaluate(async urls=>{for(const url of urls){const i=new Image();i.src=url;await i.decode();if(!i.naturalWidth)throw Error(url);}},data.pages.flatMap(x=>x.scenes.map(s=>s.image)));
  assert.deepEqual(errors,[]);await p.close();
  for(const viewport of [{width:320,height:740},{width:390,height:844},{width:844,height:390},{width:768,height:1024},{width:1024,height:768},{width:1440,height:900},{width:1920,height:1080}]){
   const p=await browser.newPage({viewport});await p.goto(origin+route);assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
   await p.locator('.jl-page-qr-open').click();await p.locator('dialog[open]').waitFor();await p.keyboard.press('Escape');
   await p.locator('#stOpen').click();assert(await p.locator('#stReader').evaluate(e=>e.scrollWidth<=innerWidth+1));await p.locator('#stPicture').click();await p.locator('#stProjectionBody img').evaluate(i=>i.decode());assert.equal(await p.locator('#stProjectionBody img').evaluate(i=>getComputedStyle(i).objectFit),'contain');await closeProject(p);
   await step(p,1);await p.locator('#stCopy [data-action=text-project]').click();assert(await p.locator('#stProjector').evaluate(e=>e.scrollWidth<=innerWidth+1));await p.locator('#stProjectionBody [data-vocabulary=overnight]').first().hover();assert.match(await p.locator('#fvVocabularyTooltip').innerText(),/noche/);await closeProject(p);
   await step(p,2);await p.locator('#stCopy [data-action=challenge-project]').first().click();const c=all[0];await p.locator(`#stProjectionBody [data-option="${c.answer}"]`).click();await p.locator('#stProjectionBody [data-action=check]').click();assert.match(await p.locator('#stProjectionBody .st-feedback').innerText(),/Correcto/);assert(await p.locator('#stProjector').evaluate(e=>e.scrollWidth<=innerWidth+1));await closeProject(p);
   if([390,1440].includes(viewport.width)){await step(p,1);await p.screenshot({path:'/private/tmp/storm-'+viewport.width+'.png'});}
   await p.close();console.log('PASS responsive',viewport.width,viewport.height);
  }
  const p2=await browser.newPage();await open(p2);await step(p2,2);
  const c=all[0];await p2.locator('#stCopy [data-card="'+c.id+'"] .st-gap').evaluate((el,c)=>{const transfer=new DataTransfer();transfer.setData('text/plain',JSON.stringify({id:c.id,option:c.answer}));el.dispatchEvent(new DragEvent('drop',{bubbles:true,dataTransfer:transfer}));},c);await p2.locator('#stCopy [data-card="'+c.id+'"] [data-action=check]').click();assert.match(await p2.locator('#stCopy .st-feedback.correct').innerText(),/Correcto/);
  await p2.locator('#stPage').selectOption('9');await p2.locator('#stNext').click();assert.match(await p2.locator('#stCopy').innerText(),/1\/20 correct on the first attempt/);assert.match(await p2.locator('#stCopy').innerText(),/19 challenges/);await p2.close();
  const p3=await browser.newPage();await p3.route('**/english-intermediate2-after-the-storm.json*',r=>r.abort());await p3.goto(origin+route);await p3.locator('#stRetry').waitFor({state:'visible'});assert(await p3.locator('#stOpen').isDisabled());await p3.unroute('**/english-intermediate2-after-the-storm.json*');await p3.locator('#stRetry').click();await p3.locator('#stOpen').click();await step(p3,1);await p3.route('**/unit-6-after-the-storm/*.mp3',r=>r.abort());await p3.locator('[data-action=story-audio]').click();await p3.waitForFunction(()=>document.querySelector('#stAudioStatus').textContent.includes('unavailable'));await p3.unroute('**/unit-6-after-the-storm/*.mp3');await p3.locator('[data-action=story-audio]').click();await p3.waitForFunction(()=>document.querySelector('#stAudio').currentTime>0);await p3.locator('[data-action=close]').click();assert(await p3.locator('#stAudio').evaluate(a=>a.paused));await p3.goto(origin+'/ingles/intermediate-2/practice-lab.html');await p3.locator('a[href="'+route+'"]').first().waitFor({state:'attached'});await p3.close();
  const p4=await browser.newPage({reducedMotion:'reduce'});await open(p4);
  await p4.locator('[data-scene="1"]').click();assert.equal(await p4.locator('#stImage').getAttribute('src'),data.pages[0].scenes[1].image);
  await step(p4,3);await p4.locator('[data-action=prediction-audio]').click();await p4.waitForFunction(()=>document.querySelector('#stAudio').currentTime>0);assert.equal(await p4.locator('#stAudio').getAttribute('src'),data.pages[0].predictionAudio);
  await p4.locator('#stNext').click();assert.equal(await p4.locator('#stLeaf').getAttribute('class'),'fv-leaf');assert(await p4.locator('#stAudio').evaluate(a=>a.paused));await step(p4,2);
  const keyCard=p4.locator('#stCopy [data-card="hear-about"]');await keyCard.locator('[data-option=heard]').focus();await p4.keyboard.press('Enter');assert.equal(await keyCard.locator('.st-gap').innerText(),'heard');await keyCard.locator('[data-action=check]').focus();await p4.keyboard.press('Enter');assert.match(await keyCard.locator('.st-feedback').innerText(),/Correcto/);await p4.close();
  console.log('PASS 20 challenges, 40 wrong-answer explanations, retry/review, keyboard, reduced motion, projected controls, 92 decoded/audited MP3s, 20 images, 7 layouts, QR, hover/audio, load/media recovery and catalog.');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exit(1);});
