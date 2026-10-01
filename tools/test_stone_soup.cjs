const {chromium,webkit}=require(process.env.PLAYWRIGHT_MODULE||'C:/Users/USER/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),base=process.env.STONE_SOUP_BASE_URL||'http://127.0.0.1:8046';
(async()=>{
 const safari=process.env.STONE_SOUP_BROWSER==='webkit';
 const browser=await (safari?webkit:chromium).launch({headless:true,...(safari?{}:{channel:'chrome'})});
 const context=await browser.newContext({hasTouch:true});const page=await context.newPage(),errors=[];
 page.on('pageerror',e=>errors.push(e.message));page.on('dialog',d=>d.accept());
 await page.route('https://accounts.google.com/**',r=>r.fulfill({body:''}));
 await page.goto(base+'/ingles/basico-2/reading-unit-6-stone-soup.html',{waitUntil:'networkidle'});
 fs.mkdirSync(path.join(root,'qa/stone-soup'),{recursive:true});
 for(const [w,h] of [[360,800],[390,844],[844,390],[820,1180],[1180,820],[1440,1000]]){
  await page.setViewportSize({width:w,height:h});
  if(!await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1))console.log(await page.evaluate(()=>[...document.querySelectorAll('body *')].map(e=>({tag:e.tagName,cl:e.className,id:e.id,r:e.getBoundingClientRect().right,w:e.getBoundingClientRect().width})).filter(e=>e.r>innerWidth+1)));
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'Page overflow '+w);
  assert.equal(await page.locator('#stoneVocabulary article').count(),10);
  const columnCount=await page.locator('#stoneVocabulary').evaluate(el=>getComputedStyle(el).gridTemplateColumns.split(' ').length);assert(columnCount>=2);
  const fixed=await page.locator('.lesson-hero').evaluate(el=>['fixed','sticky'].includes(getComputedStyle(el).position));assert(!fixed);
  await page.locator('#openStoneBook').click();
  if(w<900&&h>w){await page.locator('#stoneRotate').waitFor({state:'visible'});await page.locator('#rotateOpen').click();}
  await page.locator('#stoneReader').waitFor({state:'visible'});await page.waitForTimeout(200);
  const bounds=await page.locator('#stoneReader').boundingBox();assert(bounds.width>=w-2&&bounds.height>=h-2,'Not expanded');
  assert(await page.locator('#stoneBookSheet img').evaluate(el=>el.complete&&el.naturalWidth>0),'Page image missing');
  const readGeometry=await page.evaluate(()=>({width:innerWidth,height:innerHeight,scroll:document.querySelector('#stoneReader').scrollWidth,box:document.querySelector('#stoneBookStage').getBoundingClientRect().toJSON(),text:document.querySelector('.stone-page-copy').getBoundingClientRect().toJSON()}));
  assert(readGeometry.scroll<=readGeometry.width+1,'Reader overflow '+w);assert(readGeometry.box.height>100,'Book too small');assert(readGeometry.text.height>90,'Text hidden');
  await page.screenshot({path:path.join(root,`qa/stone-soup/reader-${w}-${h}.png`)});
  await page.locator('#closeStoneBook').click();await page.waitForTimeout(150);
 }
 await page.setViewportSize({width:1440,height:1000});await page.locator('#openStoneBook').click();
 // 1 -> 2 -> 3 ... -> 6, not overlapping pairs of pages.
 await page.locator('#stonePageSelect').selectOption('0');await page.waitForTimeout(750);
 for(let next=1;next<6;next++){
  await page.locator('#stoneNext').click();assert.equal(await page.locator('#stonePageSelect').inputValue(),String(next));
  assert.match(await page.locator('#stoneTurningLeaf').getAttribute('class'),/forward/);
  if(next===1){await page.waitForTimeout(220);await page.screenshot({path:path.join(root,'qa/stone-soup/page-turn.png')});}
  await page.waitForTimeout(760);assert(await page.locator('#stoneBookSheet img').evaluate(e=>e.complete&&e.naturalWidth>0));
 }
 assert(await page.locator('#stoneNext').isDisabled());assert.match(await page.locator('.the-end').innerText(),/The End/);
 await page.locator('#stonePrevious').click();await page.waitForTimeout(750);assert.equal(await page.locator('#stonePageSelect').inputValue(),'4');
 const sound=await page.locator('#stoneTurnAudio').evaluate(e=>({duration:e.duration,error:e.error?.code,time:e.currentTime}));assert(sound.duration>0&&!sound.error&&sound.time>0,'Page sound not decoded/played');
 // Reproduce a pending play promise interrupted by an intentional pause.
 await page.evaluate(()=>{const a=document.querySelector('#stoneNarration'),original=a.play.bind(a);a.play=function(){a.play=original;const actual=original();return new Promise((resolve,reject)=>{actual.then(()=>setTimeout(resolve,1000),reject);a.addEventListener('pause',()=>reject(new DOMException('Paused while loading','AbortError')),{once:true});});};});
 await page.locator('#stoneReadPage').click();await page.waitForFunction(()=>!document.querySelector('#stoneNarration').paused);
 assert.match(await page.locator('#stoneNarration').getAttribute('src'),/page-5.mp3/);
 await page.locator('#stoneReader [data-rate="0.75"]').click();assert.equal(await page.locator('#stoneNarration').evaluate(e=>e.playbackRate),.75);
 await page.locator('#stonePause').click();assert(await page.locator('#stoneNarration').evaluate(e=>e.paused));await page.waitForTimeout(100);assert(await page.locator('#stonePause').isEnabled(),'Pause during loading must keep Resume enabled');await page.locator('#stonePause').click();
 await page.waitForFunction(()=>{const a=document.querySelector('#stoneNarration');return !a.paused&&a.readyState>=2&&a.currentTime>0;});
 await page.locator('#stoneReadAll').click();await page.waitForFunction(()=>{const a=document.querySelector('#stoneNarration');return !a.paused&&a.readyState>=2&&a.currentTime>0;});await page.waitForTimeout(800);
 assert.equal(await page.locator('#stonePageSelect').inputValue(),'0');assert.match(await page.locator('#stoneNarration').getAttribute('src'),/full-story.mp3/);
 for(let i=1;i<6;i++){await page.evaluate(i=>{const e=document.querySelector('#stoneNarration');e.currentTime=window.StoneSoupAudio.pages[i].start+.1;e.dispatchEvent(new Event('timeupdate'));},i);await page.waitForTimeout(750);assert.equal(await page.locator('#stonePageSelect').inputValue(),String(i));}
 await page.locator('#stoneFontUp').click();assert.equal(await page.locator('#stoneReader').evaluate(e=>e.style.getPropertyValue('--story-zoom')),'1.1');
 await page.locator('#closeStoneBook').click();assert(await page.locator('#stoneNarration').evaluate(e=>e.paused));assert.equal(await page.evaluate(()=>document.body.style.overflow),'');
 const media=await page.evaluate(()=>window.StoneSoupAudio);for(const item of [...Object.values(media.words),...media.pages.map(p=>p.audio),media.fullAudio,'/ingles/basico-2/audio/unit6/stone-soup/page-turn.wav']){const r=await context.request.get(base+item);assert(r.ok(),item);assert((await r.body()).length>1000);}
 await page.locator('[data-vocab="ladle"]').click();await page.waitForFunction(()=>!document.querySelector('#stoneWordAudio').paused);
 // Ten balanced keys and changes after checking, including touch input.
 assert.equal(await page.locator('.stone-question').count(),10);
 const positions=await page.locator('.stone-question').evaluateAll(cards=>cards.map(c=>[...c.querySelectorAll('input')].findIndex(i=>i.value==='0')));
 const counts=[0,1,2].map(n=>positions.filter(v=>v===n).length).sort();assert.deepEqual(counts,[3,3,4]);assert(!positions.some((v,i)=>i>1&&v===positions[i-1]&&v===positions[i-2]));
 await page.locator('input[name="stone-q-0"][value="1"]').check();await page.locator('#checkStoneAnswers').click();
 await page.locator('input[name="stone-q-0"][value="0"]').check();assert(await page.locator('input[name="stone-q-0"][value="0"]').isChecked());
 for(let i=1;i<10;i++)await page.locator(`input[name="stone-q-${i}"][value="0"]`).check();
 await page.locator('#checkStoneAnswers').click();assert.match(await page.locator('#stoneScore').innerText(),/10 \/ 10/);
 await page.locator('[data-review-page="3"]').first().click();assert.equal(await page.locator('#stonePageSelect').inputValue(),'3');await page.locator('#closeStoneBook').click();
 await page.reload({waitUntil:'networkidle'});assert.match(await page.locator('#stoneScore').innerText(),/10 \/ 10/);
 await page.locator('#resetStoneQuiz').click();assert.equal(await page.locator('input:checked').count(),0);
 await page.setViewportSize({width:390,height:844});await page.locator('input[name="stone-q-0"][value="1"]').tap();await page.locator('input[name="stone-q-0"][value="2"]').tap();assert(await page.locator('input[name="stone-q-0"][value="2"]').isChecked());
 await page.emulateMedia({reducedMotion:'reduce'});await page.locator('#openStoneBook').click();await page.locator('#rotateOpen').click();await page.locator('#stonePageSelect').selectOption('0');await page.locator('#stoneNext').click();assert.equal(await page.locator('#stonePageSelect').inputValue(),'1');assert(!/forward/.test(await page.locator('#stoneTurningLeaf').getAttribute('class')));await page.locator('#closeStoneBook').click();
 await page.locator('.jl-page-qr-open').click();const qr=await page.locator('.jl-page-qr-dialog').boundingBox();assert(Math.abs(qr.x+qr.width/2-195)<2);await page.locator('.jl-page-qr-close').click();
 // Native fullscreen can be denied or absent on phones: the viewport dialog must still open.
 await page.evaluate(()=>document.documentElement.requestFullscreen=()=>Promise.reject(new Error('Not supported')));
 await page.locator('#openStoneBook').click();await page.locator('#rotateOpen').click();await page.locator('#stoneReader').waitFor({state:'visible'});
 assert((await page.locator('#stoneReader').boundingBox()).height>=842);await page.locator('#closeStoneBook').click();
 await page.goto(base+'/ingles/basico-2/practice-lab.html',{waitUntil:'networkidle'});
 assert.equal(await page.locator('#unit-6-folder[open]').count(),0);await page.locator('#unit-6-folder summary').click();
 assert.equal(await page.locator('#unit-6-folder .course-section-card').count(),8);
 assert.equal(await page.locator('#unit-6-folder a[href="reading-unit-6-stone-soup.html"]').count(),1);
 assert.deepEqual(errors,[]);console.log('PASS: six viewports, fullscreen and fallback, portrait advice, images, page sequence/animation/sound, narration, speed/pause, mutable shuffled quiz, reduced motion, QR, Practice Lab link.');
 await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});
