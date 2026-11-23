/* Browser regressions for the complete source story and recoverable reading practice. */
const {test,before,after}=require('node:test');
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {chromium}=require('playwright');
const base=process.env.READING_TEST_BASE||'http://127.0.0.1:8765';
const name='reading-unit-4-getting-ready-for-christmas.html',url=base+'/ingles/preintermedio-1/'+name;
const key='jl-pi1-unit4-christmas-reading-v1',out=path.resolve(process.env.READING_TEST_OUTPUT||'tmp/preintermediate1-christmas-reading-qa');
let browser;before(async()=>{fs.mkdirSync(out,{recursive:true});browser=await chromium.launch({channel:'chrome',headless:true});});after(async()=>browser?.close());
async function page(init){const p=await browser.newPage({viewport:{width:1440,height:900}});if(init)await p.addInitScript(init);await p.goto(url);await p.waitForSelector('.jl-page-qr-open');return p;}
async function open(p,id='comprehension-check'){await p.locator('#'+id).evaluate(e=>e.open=true);}
async function fill(p,values){await open(p);for(let i=0;i<values.length;i++)await p.locator(`#cr-q${i+1}-${values[i]}`).check();}
async function check(p){await open(p);await p.locator('#cr-check').click();}
async function correct(p){return p.evaluate(()=>JSON.parse(document.getElementById('cr-data').textContent).questions.map(q=>q.answer));}
async function state(p){return p.evaluate(k=>JSON.parse(sessionStorage.getItem(k)),key);}
async function hidden(p){return p.locator('.cr-feedback').evaluateAll(es=>es.every(e=>e.hidden));}

test('complete story, exact evidence and one radio choice per question',async()=>{const p=await page();try{
 const data=await p.evaluate(()=>JSON.parse(document.getElementById('cr-data').textContent));
 assert.equal(data.paragraphs.length,7);assert.equal(data.paragraphs.join(' ').split(/\s+/).length,288);
 assert.deepEqual(await p.locator('.cr-original-paragraph').allTextContents(),data.paragraphs);
 assert.deepEqual(data.questions.map(q=>q.answer),['B','A','C','B','B','C','A','A']);
 data.questions.forEach(q=>assert.ok(data.paragraphs[q.paragraph-1].includes(q.evidence)));
 assert.match(data.questions[2].question,/When/);assert.match(data.questions[7].question,/last/);
 await fill(p,['A']);await p.locator('#cr-q1-C').check();assert.equal(await p.locator('[name=q1]:checked').count(),1);assert.equal((await state(p)).state.answers[0],'C');
 await check(p);assert.equal((await state(p)).state.attempts.length,0);assert.equal(await p.locator('#cr-q2-A').evaluate(e=>e===document.activeElement),true);
 }finally{await p.close();}});
test('repeated choices and reload do not unlock; different complete attempts reveal evidence',async()=>{const p=await page();try{
 await fill(p,Array(8).fill('A'));await check(p);await check(p);assert.equal((await state(p)).state.attempts.length,1);assert.equal(await hidden(p),true);
 await p.reload();assert.equal(await hidden(p),true);await fill(p,Array(8).fill('B'));await check(p);assert.equal((await state(p)).state.attempts.length,2);assert.equal(await hidden(p),false);
 await p.locator('#reading-story').evaluate(e=>e.open=false);await p.locator('.cr-feedback a').first().click();assert.equal(await p.locator('#reading-story').evaluate(e=>e.open),true);assert.match(p.url(),/#reading-paragraph-2$/);assert.deepEqual((await state(p)).state.answers,Array(8).fill('B'));
 await fill(p,['C']);assert.equal(await hidden(p),true);assert.equal(await p.locator('#cr-result').isVisible(),false);
 }finally{await p.close();}});
test('perfect first attempt; double reset and reload undo preserve exact review',async()=>{const p=await page();try{
 const answers=await correct(p);await fill(p,answers);await check(p);assert.equal(await hidden(p),false);assert.match(await p.locator('#cr-result').textContent(),/8 of 8/);
 await p.locator('#cr-reset').click();await p.locator('#cr-reset').click();await p.reload();await open(p);await p.locator('#cr-undo').click();assert.deepEqual((await state(p)).state.answers,answers);assert.equal(await hidden(p),false);
 await p.locator('#cr-reset').click();await fill(p,['A']);assert.equal(await p.locator('#cr-undo').isVisible(),false);
 }finally{await p.close();}});
test('invalid drafts cannot reveal models and existing activity drafts remain intact',async()=>{const p=await page(()=>{
 sessionStorage.setItem('jl-pi1-unit4-celebration-expressions-v1','untouched');sessionStorage.setItem('jl-pi1-unit4-christmas-reading-v1',JSON.stringify({state:{answers:Array(8).fill(['A']),attempts:[],checked:''}}));
 });try{assert.equal(await p.locator('input:checked').count(),0);assert.equal(await hidden(p),true);await fill(p,['B']);assert.equal(await p.evaluate(()=>sessionStorage.getItem('jl-pi1-unit4-celebration-expressions-v1')),'untouched');}finally{await p.close();}});
test('blocked storage retains live practice and undo',async()=>{const p=await page(()=>{Storage.prototype.getItem=function(){throw Error('Blocked');};Storage.prototype.setItem=function(){throw Error('Blocked');};});try{
 await fill(p,await correct(p));await check(p);await p.locator('#cr-reset').click();await p.locator('#cr-undo').click();assert.equal(await hidden(p),false);assert.equal(await p.locator('#cr-storage-status').isVisible(),true);
 }finally{await p.close();}});
test('one player coordinates story, paragraph and glossary; pause, speed, stop and retry preserve work',async()=>{const p=await page();try{
 await fill(p,['B']);await p.locator('[data-cr-audio=story]').click();await p.waitForFunction(()=>{const a=document.getElementById('cr-audio');return a.readyState>=2&&!a.paused;});assert.match(await p.locator('#cr-audio').getAttribute('src'),/story.mp3$/);
 await p.locator('#cr-pause-resume').click();assert.equal(await p.locator('#cr-audio').evaluate(a=>a.paused),true);await p.locator('#cr-pause-resume').click();await p.waitForFunction(()=>!document.getElementById('cr-audio').paused);
 await open(p,'reading-story');await p.locator('[data-cr-audio=paragraph-2]').click();await p.waitForFunction(()=>document.getElementById('cr-audio').readyState>=2);assert.match(await p.locator('#cr-audio').getAttribute('src'),/paragraph-2.mp3$/);assert.equal(await p.locator('audio').count(),1);
 await open(p,'vocabulary-support');const word=p.locator('#vocabulary-support .fv-vocab-word').filter({hasText:/^stockings$/});await word.focus();assert.match(await p.locator('#fvVocabularyTooltip').textContent(),/medias|calcetines/);await word.click();await p.waitForFunction(()=>{const a=document.getElementById('cr-audio');return a.readyState>=2&&!a.paused;});assert.match(await p.locator('#cr-audio').getAttribute('src'),/word-stockings.mp3$/);
 await p.locator('[data-cr-speed="0.75"]').click();assert.equal(await p.locator('#cr-audio').evaluate(a=>a.playbackRate),0.75);await p.locator('#cr-stop').click();assert.equal(await p.locator('#cr-audio').evaluate(a=>a.paused&&a.currentTime===0),true);
 await p.route('**/question-1.mp3',r=>r.abort());await p.locator('[data-cr-audio=question-1]').click();await p.locator('#cr-retry').waitFor({state:'visible'});await p.unroute('**/question-1.mp3');await p.locator('#cr-retry').click();await p.waitForFunction(()=>{const a=document.getElementById('cr-audio');return a.readyState>=2&&!a.paused;});assert.equal((await state(p)).state.answers[0],'B');await fill(p,['A']);assert.equal(await p.locator('#cr-audio').evaluate(a=>a.paused),true);
 }finally{await p.close();}});
test('six Unit 4 activities stay categorized and navigation reaches Reading',async()=>{const p=await page();try{
 await p.goto(base+'/ingles/preintermedio-1/practice-lab.html');assert.equal(await p.locator('details[open]').count(),0);
 for(const [id,count] of [['unit-4-reading',2],['unit-4-vocabulary',2],['unit-4-grammar',1]])assert.equal(await p.locator('#'+id+' .card-link').count(),count);
 for(const [n,count] of [[1,11],[2,10],[3,16],[4,6],[5,2],[6,2]])assert.equal(await p.locator('#unit-'+n+' article.course-section-card').count(),count);
 await p.goto(base+'/ingles/preintermedio-1/practice-lab.html#unit-4-reading');await p.locator('#unit-4-reading a[href="'+name+'"]').click();assert.equal(p.url(),url);
 await p.goto(base+'/ingles/preintermedio-1/listening-library.html#unit-4-christmas-reading-audio');await p.locator('#unit-4-christmas-reading-audio .card-link').click();assert.equal(p.url(),url);
 await p.goto(base+'/ingles/preintermedio-1/vocabulary-unit-4-celebration-expressions.html');await p.locator('.ce-footer a[href="'+name+'"]').click();assert.equal(p.url(),url);
 }finally{await p.close();}});
test('eight viewports: readable story, feedback, original page and expanded QR',{timeout:180000},async()=>{const p=await page(),results=[];try{
 for(const [width,height] of [[320,740],[390,844],[844,390],[820,1180],[1180,820],[1366,768],[1440,900],[1920,1080]]){
 await p.setViewportSize({width,height});await p.goto(url);await p.evaluate(()=>sessionStorage.clear());await p.reload();await p.waitForSelector('.jl-page-qr-open');assert.equal(await p.locator('details[open]').count(),0);
 const hits=await p.evaluate(()=>{const host=document.querySelector('.pi-hero-copy'),qr=host.querySelector('.jl-page-qr-card').getBoundingClientRect(),walker=document.createTreeWalker(host,NodeFilter.SHOW_TEXT);let node,hits=[];while(node=walker.nextNode()){if(!node.textContent.trim()||node.parentElement.closest('.jl-page-qr-card'))continue;const r=document.createRange();r.selectNodeContents(node);for(const b of r.getClientRects())if(b.width&&b.height&&b.left<qr.right&&b.right>qr.left&&b.top<qr.bottom&&b.bottom>qr.top)hits.push(node.textContent);}return hits;});assert.deepEqual(hits,[],`QR overlaps at ${width}`);
 for(const mode of ['closed','story','feedback','original']){
 if(mode==='story')await open(p,'reading-story');if(mode==='feedback'){await fill(p,await correct(p));await check(p);}if(mode==='original')await open(p,'original-page');
 await p.evaluate(async()=>{const imgs=[...document.images].filter(i=>i.checkVisibility());imgs.forEach(i=>i.loading='eager');await Promise.all(imgs.map(i=>i.decode().catch(()=>{})));});
 const layout=await p.evaluate(()=>({overflow:document.documentElement.scrollWidth>innerWidth+1,broken:[...document.images].filter(i=>i.checkVisibility()&&(!i.complete||!i.naturalWidth)).map(i=>i.src),font:getComputedStyle(document.body).fontFamily,blue:getComputedStyle(document.querySelector('.pi-hero-copy')).backgroundColor,red:getComputedStyle(document.querySelector('.hero-actions .btn-primary')).backgroundColor}));
 assert.equal(layout.overflow,false,JSON.stringify({width,height,mode,layout}));assert.deepEqual(layout.broken,[]);assert.match(layout.font,/Arial/);assert.equal(layout.blue,'rgba(7, 31, 79, 0.72)');assert.equal(layout.red,'rgb(215, 25, 63)');results.push({width,height,mode,...layout});
 if(width===390&&mode==='story')await p.screenshot({path:path.join(out,'mobile-story.png'),fullPage:true});
 }
 await p.locator('.jl-page-qr-open').click();await p.locator('#jlPageQrDialog img').evaluate(i=>i.decode());assert.ok(await p.locator('#jlPageQrDialog').evaluate(e=>{const r=e.getBoundingClientRect();return r.left>=-1&&r.top>=-1&&r.right<=innerWidth+1&&r.bottom<=innerHeight+1;}));await p.locator('.jl-page-qr-close').click();
 if(width===1440){await p.locator('details').evaluateAll(ds=>ds.forEach(d=>d.open=false));await p.screenshot({path:path.join(out,'desktop.png'),fullPage:true});}
 }
 fs.writeFileSync(path.join(out,'layout.json'),JSON.stringify(results,null,2));
 }finally{await p.close();}});
