const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const root=path.resolve(__dirname,'..');
const glossary=JSON.parse(fs.readFileSync(path.join(root,'assets/data/english-intermediate2-first-visit-vocabulary.json')));
const story=JSON.parse(fs.readFileSync(path.join(root,'assets/data/english-intermediate2-first-visit.json')));
const dir=path.join(root,'ingles/intermediate-2/audio/unit-5-first-visit/vocabulary');
const manifest=JSON.parse(fs.readFileSync(path.join(dir,'models.json')));
assert.equal(glossary.entries.length,65);
for(const e of glossary.entries){const item=manifest.items.find(i=>i.file===path.basename(e.audio));assert.equal(item.text,e.term);const bytes=fs.readFileSync(path.join(dir,item.file));assert(bytes.length>1000);assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'),item.sha256);}
(async()=>{
 const browser=await chromium.launch({headless:true,args:['--autoplay-policy=no-user-gesture-required']});
 try{
 const page=await browser.newPage({viewport:{width:1366,height:900}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.route('https://accounts.google.com/**',r=>r.fulfill({body:''}));
 const base=process.env.FIRST_VISIT_BASE_URL||'http://127.0.0.1:8073',url=base+'/ingles/intermediate-2/speaking-unit-5-the-first-visit.html';
 await page.goto(url);await page.waitForFunction(()=>!document.querySelector('#fvOpen').disabled);await page.locator('#fvOpen').click();
 assert(!await page.locator('#fvPrompt').innerText().then(t=>t.includes(story.pages[0].text)),'Narration stays hidden before Discover');
 await page.locator('[data-stage="2"]').click();const word=page.locator('#fvPrompt [data-vocabulary="lights up"]');
 await word.hover();await page.locator('#fvVocabularyTooltip').waitFor({state:'visible'});assert.match(await page.locator('#fvVocabularyTooltip').innerText(),/pantalla/);
 assert(await page.locator('#fvAudio').evaluate(a=>a.paused&&!a.getAttribute('src')),'Hover must not play audio');
 await page.locator('#fvVocabularyTooltip').hover();assert(await page.locator('#fvVocabularyTooltip').isVisible(),'Tooltip remains hoverable');
 await page.keyboard.press('Escape');assert(!await page.locator('#fvVocabularyTooltip').isVisible());assert(await page.locator('#fvReader').isVisible(),'Escape dismisses tooltip first');
 await word.focus();assert(await page.locator('#fvVocabularyTooltip').isVisible());assert.equal(await word.getAttribute('aria-describedby'),'fvVocabularyTooltip');
 await word.click();await page.waitForFunction(()=>{const a=document.querySelector('#fvAudio');return !a.paused&&a.currentTime>0;});assert.match(await page.locator('#fvAudio').getAttribute('src'),/vocabulary\/lights-up.mp3$/);assert.equal(await page.locator('#fvAudio').evaluate(a=>a.playbackRate),.75);
 await page.locator('#fvSpeed').selectOption('1');assert.equal(await page.locator('#fvAudio').evaluate(a=>a.playbackRate),1);
 await page.locator('#fvProject').click();const projected=page.locator('#fvProjectedText [data-vocabulary="twice"]');await projected.hover();assert.equal(await page.locator('#fvVocabularyTooltip').evaluate(e=>e.parentElement.id),'fvProjector');assert.equal(await page.locator('#fvVocabularyTooltip').innerText(),'Dos veces.');
 await projected.click();await page.waitForFunction(()=>!document.querySelector('#fvAudio').paused);assert.match(await page.locator('#fvAudio').getAttribute('src'),/twice.mp3$/);await page.locator('#fvProjectStop').click();assert(await page.locator('#fvAudio').evaluate(a=>a.paused));
 await page.locator('#fvProjectClose').click();assert(!await page.locator('#fvVocabularyTooltip').isVisible());
 const covered=new Set();
 for(let i=0;i<17;i++){
  await page.locator('#fvPage').selectOption(String(i));await page.locator('[data-stage="2"]').click();assert.equal(await page.locator('#fvPrompt').textContent(),story.pages[i].text,'Preserve exact narration, punctuation and spaces');
  (await page.locator('#fvPrompt .fv-vocab-word').evaluateAll(es=>es.map(e=>e.dataset.vocabulary))).forEach(v=>covered.add(v));
  assert(await page.locator('#fvPrompt .fv-vocab-word').count()>0,'Vocabulary on every page');
  await page.locator('#fvHelp summary').click();
  (await page.locator('#fvStarters .fv-vocab-word').evaluateAll(es=>es.map(e=>e.dataset.vocabulary))).forEach(v=>covered.add(v));
  await page.locator('#fvHelp summary').click();
  for(const stage of [0,1,3]){
   await page.locator(`[data-stage="${stage}"]`).click();
   const qs=story.pages[i].questions.filter(q=>q.stage===(stage===0?'describe':stage===1?'feel':i===16?'reflect':'predict'));
   for(let j=0;j<qs.length;j++){
    if(j)await page.locator('#fvQuestionNext').click();assert.equal(await page.locator('#fvPrompt').textContent(),qs[j].text);
    (await page.locator('#fvPrompt .fv-vocab-word').evaluateAll(es=>es.map(e=>e.dataset.vocabulary))).forEach(v=>covered.add(v));
   }
   await page.locator('#fvHelp summary').click();
   (await page.locator('#fvStarters .fv-vocab-word').evaluateAll(es=>es.map(e=>e.dataset.vocabulary))).forEach(v=>covered.add(v));
   await page.locator('#fvHelp summary').click();
  }
 }
 assert.equal(covered.size,65,'Every glossary entry is reachable in narration, questions or supports');
 await page.locator('#fvPage').selectOption('10');await page.locator('[data-stage="2"]').click();
 await page.waitForFunction(()=>document.querySelector('#fvLeaf').className==='fv-leaf');
 await page.evaluate(async()=>{if(document.fullscreenElement)await document.exitFullscreen();});
 for(const [width,height] of [[360,800],[390,844],[768,1024],[1366,768],[1920,1080]]){
  await page.setViewportSize({width,height});await page.locator('#fvPrompt [data-vocabulary="reaches across the table"]').hover();
  assert(await page.locator('#fvVocabularyTooltip').evaluate(e=>{const b=e.getBoundingClientRect();return b.x>=0&&b.y>=0&&b.right<=innerWidth+1&&b.bottom<=innerHeight+1;}),'Tooltip within viewport');
  assert(await page.locator('#fvReader').evaluate(e=>e.scrollWidth<=innerWidth+1),'Reader overflow');
  await page.screenshot({path:`/private/tmp/first-visit-vocabulary-${width}.png`});
 }
 await page.locator('#fvNext').click();assert(await page.locator('#fvAudio').evaluate(a=>a.paused&&!a.getAttribute('src')));assert(!await page.locator('#fvVocabularyTooltip').isVisible());
 const decoded=await page.evaluate(async entries=>Promise.all(entries.map(e=>new Promise(resolve=>{const a=new Audio('/ingles/intermediate-2/audio/unit-5-first-visit/'+e.audio);const t=setTimeout(()=>resolve(false),15000);a.onloadedmetadata=()=>{clearTimeout(t);resolve(Number.isFinite(a.duration)&&a.duration>0);};a.onerror=()=>{clearTimeout(t);resolve(false);};a.load();}))),glossary.entries);assert(decoded.every(Boolean),'All vocabulary audio decodes');
 // Touch offers the same meaning and pronunciation without requiring hover.
 const touch=await browser.newContext({hasTouch:true,isMobile:true,viewport:{width:390,height:844}}),tp=await touch.newPage();await tp.route('https://accounts.google.com/**',r=>r.fulfill({body:''}));await tp.goto(url);await tp.waitForFunction(()=>!document.querySelector('#fvOpen').disabled);await tp.locator('#fvOpen').tap();await tp.locator('[data-stage="2"]').tap();await tp.locator('#fvPrompt [data-vocabulary="twice"]').tap();assert.equal(await tp.locator('#fvVocabularyTooltip').innerText(),'Dos veces.');await tp.waitForFunction(()=>!document.querySelector('#fvAudio').paused);await tp.locator('#fvClose').tap();await tp.waitForFunction(()=>!document.querySelector('#fvReader').open&&document.querySelector('#fvAudio').paused);assert(!await tp.locator('#fvVocabularyTooltip').isVisible());
 // Failed audio shows a recovery message while retaining the definition.
 await page.route('**/vocabulary/typing.mp3',r=>r.abort());await page.locator('#fvPage').selectOption('0');await page.locator('[data-stage="2"]').click();await page.locator('#fvPrompt [data-vocabulary="typing"]').click();await page.waitForFunction(()=>/unavailable|could not play/.test(document.querySelector('#fvAudioStatus').textContent));assert(await page.locator('#fvVocabularyTooltip').isVisible());
 assert.deepEqual(errors,[]);console.log('PASS: 65 exact vocabulary audios; hover/focus translation without audio; click/tap playback; modal projection; Escape; all story/question text preserved; coverage on 17 pages; five responsive sizes; page-change cleanup and failure recovery.');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
