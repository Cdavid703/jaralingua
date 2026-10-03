const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const root=path.resolve(__dirname,'..'),base=process.env.FIRST_VISIT_BASE_URL||'http://127.0.0.1:8073';
const data=JSON.parse(fs.readFileSync(path.join(root,'assets/data/english-intermediate2-first-visit.json')));
const mediaDir=path.join(root,'ingles/intermediate-2/audio/unit-5-first-visit');
const media=JSON.parse(fs.readFileSync(path.join(mediaDir,'models.json')));
assert.equal(data.pages.length,17);assert.equal(media.items.length,102);
const hashes=new Set();
for(const [i,p] of data.pages.entries()){
 assert.equal(p.number,i+1);assert.equal(p.questions.length,5);
 assert.deepEqual(p.questions.map(q=>q.stage),['describe','describe','feel',i===16?'reflect':'predict',i===16?'reflect':'predict']);
 const bytes=fs.readFileSync(path.join(root,p.image));assert(bytes.length>10000);hashes.add(crypto.createHash('sha256').update(bytes).digest('hex'));
 for(const q of [{text:p.text,audio:p.audio},...p.questions]){
  const item=media.items.find(x=>x.file===q.audio);assert.equal(item.text,q.text);
  const bytes=fs.readFileSync(path.join(mediaDir,item.file));assert(bytes.length>1000);assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'),item.sha256);
 }
}assert.equal(hashes.size,17,'Each page needs a distinct illustration');
(async()=>{
 const browser=await chromium.launch({headless:true});
 try {
 const context=await browser.newContext({hasTouch:true});const page=await context.newPage(),errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 await page.route('https://accounts.google.com/**',r=>r.fulfill({body:''}));
 await page.goto(base+'/ingles/intermediate-2/speaking-unit-5-the-first-visit.html');
 await page.waitForFunction(()=>!document.querySelector('#fvOpen').disabled);
 const shots=process.env.FIRST_VISIT_SHOTS||'/private/tmp/jaralingua-first-visit-qa';fs.mkdirSync(shots,{recursive:true});
 for(const [width,height] of [[360,800],[390,844],[844,390],[820,1180],[1440,1000],[1920,1080]]){
  await page.setViewportSize({width,height});
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'Landing overflow '+width);
  await page.screenshot({path:path.join(shots,`landing-${width}.png`)});
  await page.locator('.jl-page-qr-open').click();await page.locator('#jlPageQrDialog').waitFor({state:'visible'});
  assert(await page.locator('#jlPageQrDialog img').evaluate(e=>e.complete&&e.naturalWidth>0));
  assert(await page.locator('.jl-page-qr-open img').evaluate(e=>Math.abs(e.getBoundingClientRect().width-e.getBoundingClientRect().height)<2),'QR must stay square');
  await page.locator('.jl-page-qr-close').click();
  await page.locator('#fvOpen').click();await page.locator('#fvReader').waitFor({state:'visible'});
  const box=await page.locator('#fvReader').boundingBox();assert(box.width>=width-2&&box.height>=height-2);
  assert(await page.locator('#fvImage').evaluate(e=>e.complete&&e.naturalWidth>0));
  assert(await page.locator('#fvReader').evaluate(e=>e.scrollWidth<=innerWidth+1),'Reader overflow '+width);
  assert(!await page.locator('#fvReader').innerText().then(t=>t.includes(data.pages[0].text)),'Narration revealed too early');
  await page.locator('#fvPicture').click();await page.locator('#fvProjector').waitFor({state:'visible'});
  assert(await page.locator('#fvProjectedImage').isVisible());assert(!await page.locator('#fvProjectedText').isVisible());
  await page.screenshot({path:path.join(shots,`picture-${width}.png`)});await page.locator('#fvProjectClose').click();
  await page.locator('#fvProject').click();assert.equal(await page.locator('#fvProjectedText').innerText(),data.pages[0].questions[0].text);
  await page.locator('#fvProjectNext').click();assert.equal(await page.locator('#fvProjectedText').innerText(),data.pages[0].questions[1].text);
  await page.screenshot({path:path.join(shots,`question-${width}.png`)});await page.locator('#fvProjectClose').click();
  await page.locator('[data-stage="2"]').click();assert.equal(await page.locator('#fvPrompt').innerText(),data.pages[0].text);
  await page.screenshot({path:path.join(shots,`reader-${width}.png`)});
  await page.locator('[data-stage="0"]').click();await page.locator('#fvClose').click();
  await page.waitForFunction(()=>document.body.style.overflow==='');
 }
 await page.setViewportSize({width:1440,height:1000});await page.locator('#fvOpen').click();
 for(let i=0;i<17;i++){
  if(i) await page.locator('#fvNext').click();
  assert.equal(await page.locator('#fvPage').inputValue(),String(i));
  assert.equal(await page.locator('[data-stage="0"]').getAttribute('aria-pressed'),'true');
  await page.waitForFunction(()=>{const e=document.querySelector('#fvImage');return e.complete&&e.naturalWidth>0;});
  assert.equal(await page.locator('#fvPrompt').innerText(),data.pages[i].questions[0].text);
  await page.locator('[data-stage="1"]').click();assert.equal(await page.locator('#fvPrompt').innerText(),data.pages[i].questions[2].text);
  await page.locator('[data-stage="2"]').click();assert.equal(await page.locator('#fvPrompt').innerText(),data.pages[i].text);
  await page.locator('[data-stage="3"]').click();assert.equal(await page.locator('#fvPrompt').innerText(),data.pages[i].questions[3].text);
 }
 assert(await page.locator('#fvNext').isDisabled());assert.equal(await page.locator('[data-stage="3"]').innerText(),'4 · Reflect');
 await page.locator('#fvPage').selectOption('0');await page.locator('#fvListen').click();
 await page.waitForFunction(()=>{const a=document.querySelector('#fvAudio');return !a.paused&&a.currentTime>0;});
 assert.equal(await page.locator('#fvAudio').evaluate(a=>a.playbackRate),.75);
 await page.locator('#fvSpeed').selectOption('1');assert.equal(await page.locator('#fvAudio').evaluate(a=>a.playbackRate),1);
 await page.locator('[data-stage="2"]').click();assert(await page.locator('#fvAudio').evaluate(a=>a.paused&&!a.getAttribute('src')));
 await page.locator('#fvListen').click();await page.waitForFunction(()=>!document.querySelector('#fvAudio').paused);
 assert.match(await page.locator('#fvAudio').getAttribute('src'),/page-01.mp3$/);
 await page.locator('#fvNext').click();assert(await page.locator('#fvAudio').evaluate(a=>a.paused));
 await page.locator('#fvFontUp').click();assert.equal(await page.locator('#fvReader').evaluate(e=>e.style.getPropertyValue('--fv-text-scale')),'1.1');
 await page.keyboard.press('ArrowRight');assert.equal(await page.locator('#fvPage').inputValue(),'2');
 await page.locator('#fvPicture').click();await page.keyboard.press('ArrowRight');assert.equal(await page.locator('#fvPage').inputValue(),'2');
 await page.keyboard.press('Escape');assert(!await page.locator('#fvProjector').isVisible());assert(await page.locator('#fvReader').isVisible());
 await page.locator('#fvClose').click();assert(await page.locator('#fvAudio').evaluate(a=>a.paused));
 await context.close();
 // Verify the viewport fallback when fullscreen permission is refused.
 const fallback=await browser.newContext({reducedMotion:'reduce'});const fp=await fallback.newPage();fp.on('pageerror',e=>errors.push(e.message));
 await fp.addInitScript(()=>{Element.prototype.requestFullscreen=()=>Promise.reject(new Error('denied'));});
 await fp.route('https://accounts.google.com/**',r=>r.fulfill({body:''}));
 await fp.goto(base+'/ingles/intermediate-2/speaking-unit-5-the-first-visit.html');await fp.waitForFunction(()=>!document.querySelector('#fvOpen').disabled);
 await fp.locator('#fvOpen').click();await fp.locator('#fvReader').waitFor({state:'visible'});assert(await fp.locator('#fvReader').isVisible());await fp.locator('#fvClose').click();
 assert.deepEqual(errors,[]);console.log('PASS: 17 distinct images, 102 audio hashes, all pages/stages, hidden narration, image/question projection, QR, responsive layouts, real audio, cleanup and fullscreen fallback.');
 } finally {await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
