/* Browser regressions for independent practice, draft recovery, audio and layout. */
const {test,before,after}=require('node:test');
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {chromium}=require('playwright');
const base=process.env.CELEBRATION_TEST_BASE||'http://127.0.0.1:8765';
const url=base+'/ingles/preintermedio-1/vocabulary-unit-4-celebration-words.html';
const key='jl-pi1-unit4-celebration-words-v1',out=path.resolve(process.env.CELEBRATION_TEST_OUTPUT||'tmp/preintermediate1-celebration-words-qa');
let browser;before(async()=>{fs.mkdirSync(out,{recursive:true});browser=await chromium.launch({channel:'chrome',headless:true});});after(async()=>browser?.close());
async function page(init){const p=await browser.newPage({viewport:{width:1440,height:900}});if(init)await p.addInitScript(init);await p.goto(url);await p.waitForSelector('.jl-page-qr-open');return p;}
const section=(p,id)=>p.locator(`[data-cw-task="${id}"]`);
async function open(p,id){await section(p,id).evaluate(el=>el.closest('details').open=true);}
async function fill(p,id,values){await open(p,id);const fields=section(p,id).locator('select');for(let i=0;i<values.length;i++)await fields.nth(i).selectOption(values[i]);}
async function action(p,id,kind){await open(p,id);await section(p,id).locator(`[data-cw-${kind}]`).click();}
async function answers(p,id){return p.evaluate(id=>JSON.parse(document.getElementById('cw-data').textContent).tasks[id].map(x=>x.answer),id);}
async function state(p){return p.evaluate(k=>JSON.parse(sessionStorage.getItem(k)),key);}
async function hidden(p,id){return section(p,id).locator('.cw-feedback').evaluateAll(els=>els.every(el=>el.hidden));}

test('incomplete checks keep drafts without counting attempts; exercises are independent',async()=>{
 const p=await page();try{await fill(p,'concepts',['tradition']);await fill(p,'pictures',['Christmas cards']);await action(p,'concepts','check');assert.equal((await state(p)).states.concepts.attempts.length,0);assert.equal(await p.locator('#cw-answer-concept-2').getAttribute('aria-invalid'),'true');assert.equal(await p.locator('#cw-answer-picture-1').inputValue(),'Christmas cards');assert.equal(await hidden(p,'concepts'),true);}finally{await p.close();}
});
test('repeating and reloading do not unlock; a different complete attempt unlocks only its exercise',async()=>{
 const p=await page();try{await fill(p,'concepts',Array(4).fill('holiday'));await action(p,'concepts','check');await action(p,'concepts','check');await p.reload();assert.equal(await hidden(p,'concepts'),true);await fill(p,'concepts',['tradition','holiday','holiday','holiday']);await action(p,'concepts','check');assert.equal(await hidden(p,'concepts'),false);assert.equal(await hidden(p,'pictures'),true);assert.equal((await state(p)).states.concepts.attempts.length,2);assert.equal((await state(p)).states.pictures.attempts.length,0);}finally{await p.close();}
});
test('perfect first attempts reveal all models; editing stops audio and hides only its own review',async()=>{
 const p=await page();try{for(const id of ['concepts','pictures','combinations']){await fill(p,id,await answers(p,id));await action(p,id,'check');assert.equal(await hidden(p,id),false);}
 await section(p,'combinations').locator('[data-cw-model]').first().click();await p.waitForFunction(()=>{const a=document.getElementById('cw-audio');return a.readyState>=2&&!a.paused;});
 await fill(p,'combinations',['invite']);assert.equal(await p.locator('#cw-audio').evaluate(a=>a.paused),true);assert.equal(await hidden(p,'combinations'),true);assert.equal(await hidden(p,'concepts'),false);assert.equal(await hidden(p,'pictures'),false);assert.equal(await section(p,'combinations').locator('[data-cw-model]').first().isVisible(),false);
 }finally{await p.close();}
});
test('double reset, reload and undo restore each independent draft and review',async()=>{
 const p=await page();try{for(const id of ['concepts','pictures','combinations']){await fill(p,id,await answers(p,id));await action(p,id,'check');await action(p,id,'reset');await action(p,id,'reset');}await p.reload();for(const id of ['concepts','pictures','combinations']){await action(p,id,'undo');assert.deepEqual(await section(p,id).locator('select').evaluateAll(els=>els.map(e=>e.value)),await answers(p,id));assert.equal(await hidden(p,id),false);}await action(p,'pictures','reset');await fill(p,'pictures',['tinsel']);assert.equal(await section(p,'pictures').locator('[data-cw-undo]').isVisible(),false);}finally{await p.close();}
});
test('corrupt drafts cannot reveal answers and other activity storage is untouched',async()=>{
 const p=await page(()=>{sessionStorage.setItem('jl-pi1-unit3-healthy-vocabulary-v1','untouched');sessionStorage.setItem('jl-pi1-unit4-celebration-words-v1',JSON.stringify({states:{concepts:{answers:['holiday'],attempts:['fake'],checked:'fake'}},backups:{pictures:{answers:[]}}}));});try{assert.equal(await hidden(p,'concepts'),true);assert.equal(await p.locator('#cw-answer-concept-1').inputValue(),'');await fill(p,'pictures',['tinsel']);assert.equal(await p.evaluate(()=>sessionStorage.getItem('jl-pi1-unit3-healthy-vocabulary-v1')),'untouched');}finally{await p.close();}
});
test('blocked storage still permits checking, reset and undo in the open page',async()=>{
 const p=await page(()=>{Storage.prototype.getItem=function(){throw new Error('Blocked');};Storage.prototype.setItem=function(){throw new Error('Blocked');};});try{await fill(p,'concepts',await answers(p,'concepts'));await action(p,'concepts','check');await action(p,'concepts','reset');await action(p,'concepts','undo');assert.equal(await hidden(p,'concepts'),false);assert.equal(await p.locator('#cw-storage-status').isVisible(),true);}finally{await p.close();}
});
test('glossary supports keyboard meaning, correct audio, speed and mutual audio pause',async()=>{
 const p=await page();try{await open(p,'pictures');const word=p.locator('#celebration-pictures .fv-vocab-word').filter({hasText:/^mistletoe$/});await word.focus();assert.match(await p.locator('#fvVocabularyTooltip').textContent(),/muérdago/);assert.equal(await p.locator('#cw-audio').evaluate(a=>a.paused),true);await word.click();await p.waitForFunction(()=>{const a=document.getElementById('cw-audio');return a.readyState>=2&&!a.paused;});assert.match(await p.locator('#cw-audio').getAttribute('src'),/mistletoe.mp3$/);await p.locator('[data-cw-speed="0.75"]').click();assert.equal(await p.locator('#cw-audio').evaluate(a=>a.playbackRate),0.75);await p.locator('[data-cw-stop]').click();assert.equal(await p.locator('#cw-audio').evaluate(a=>a.paused),true);}finally{await p.close();}
});
test('eight viewport sizes: closed/open/review/source layout, loaded images, QR and Basic 2 palette',{timeout:180000},async()=>{
 const p=await page(),results=[];try{for(const [width,height] of [[320,740],[390,844],[844,390],[820,1180],[1180,820],[1366,768],[1440,900],[1920,1080]]){
  await p.setViewportSize({width,height});await p.reload();await p.waitForSelector('.jl-page-qr-open');assert.equal(await p.locator('details[open]').count(),0);
  const covered=await p.evaluate(()=>{const host=document.querySelector('.pi-hero-copy'),qr=host.querySelector('.jl-page-qr-card').getBoundingClientRect(),walker=document.createTreeWalker(host,NodeFilter.SHOW_TEXT);let node,hits=[];while(node=walker.nextNode()){if(!node.textContent.trim()||node.parentElement.closest('.jl-page-qr-card'))continue;const range=document.createRange();range.selectNodeContents(node);for(const r of range.getClientRects())if(r.width&&r.height&&r.left<qr.right&&r.right>qr.left&&r.top<qr.bottom&&r.bottom>qr.top)hits.push(node.textContent.trim());}return hits;});assert.deepEqual(covered,[],`QR covers text at ${width}×${height}`);
  for(const mode of ['closed','open','review','source']){
   if(mode==='open')await p.locator('details').evaluateAll(ds=>ds.filter(d=>d.id!=='original-page').forEach(d=>d.open=true));
   if(mode==='review')for(const id of ['concepts','pictures','combinations']){await fill(p,id,await answers(p,id));await action(p,id,'check');}
   if(mode==='source'){await p.locator('#original-page').evaluate(el=>el.open=true);await p.locator('#original-page img').scrollIntoViewIfNeeded();}
   await p.evaluate(async()=>{const imgs=[...document.images].filter(i=>i.checkVisibility());imgs.forEach(i=>i.loading='eager');await Promise.all(imgs.map(i=>i.decode().catch(()=>{})));});
   const layout=await p.evaluate(()=>({width:innerWidth,overflow:document.documentElement.scrollWidth>innerWidth+1,broken:[...document.images].filter(i=>i.checkVisibility()&&(!i.complete||!i.naturalWidth)).map(i=>i.src),font:getComputedStyle(document.body).fontFamily,blue:getComputedStyle(document.querySelector('.pi-hero-copy')).backgroundColor,red:getComputedStyle(document.querySelector('.hero-actions .btn-primary')).backgroundColor}));
   assert.equal(layout.overflow,false,JSON.stringify({width,height,mode,layout}));assert.deepEqual(layout.broken,[]);assert.match(layout.font,/Arial/);assert.equal(layout.blue,'rgba(7, 31, 79, 0.72)');assert.equal(layout.red,'rgb(215, 25, 63)');results.push({width,height,mode,...layout});
  }
  await p.locator('.jl-page-qr-open').click();await p.locator('#jlPageQrDialog img').evaluate(i=>i.decode());
  const qr=await p.locator('#jlPageQrDialog').evaluate(el=>{const r=el.getBoundingClientRect();return {left:r.left,top:r.top,right:r.right,bottom:r.bottom,width:innerWidth,height:innerHeight};});
  assert.ok(qr.left>=-1&&qr.top>=-1&&qr.right<=width+1&&qr.bottom<=height+1,JSON.stringify(qr));
  await p.locator('.jl-page-qr-close').click();
  if(width===390){await p.locator('#original-page').evaluate(el=>el.open=false);await p.screenshot({path:path.join(out,'mobile-reviewed.png'),fullPage:true});}
 }
 fs.writeFileSync(path.join(out,'layout.json'),JSON.stringify(results,null,2));
 }finally{await p.close();}
});
