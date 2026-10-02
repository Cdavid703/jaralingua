const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {chromium,webkit}=require('C:/Users/USER/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const host='https://www.jaralingua.com',pathname='/ingles/intermediate-2/grammar-unit-5-read-the-clues.html';
const questions=JSON.parse(fs.readFileSync('assets/data/english-intermediate2-unit5-grammar.json','utf8')).questions;
const localPaths=p=>p===pathname||p.includes('english-intermediate2-unit5-grammar.')||p.includes('/unit-5/grammar/')||p.includes('/audio/unit-5-grammar/')||p.includes('ingles-intermediate-2-grammar-unit-5-read-the-clues.svg')||p==='/ingles/intermediate-2/practice-lab.html'||p==='/assets/js/english-intermediate2-practice-lab.js'||p==='/assets/data/english-intermediate-2-content.json';
(async()=>{const engine=process.env.WEBKIT?'webkit':'chrome';const browser=await(process.env.WEBKIT?webkit:chromium).launch(process.env.WEBKIT?{headless:true}:{channel:'chrome',headless:true});try{
for(const width of process.env.QUICK?[390,1440]:[320,390,430,768,1024,1440,1920]){
 const page=await browser.newPage({viewport:{width,height:900},deviceScaleFactor:1});const errors=[];page.on('pageerror',e=>errors.push(e.message));
 const ref=await page.request.get(host+'/ingles/intermediate-2/grammar-unit-2-wishes-dreams-goals.html');const csp=ref.headers()['content-security-policy'];assert(csp);
 if(!process.env.LIVE)await page.route(host+'/**',async r=>{const p=new URL(r.request().url()).pathname;if(!localPaths(p))return r.continue();const file=path.resolve('.'+p);assert(fs.existsSync(file),file);return r.fulfill({path:file,headers:p.endsWith('.html')?{'Content-Security-Policy':csp}:{}});});
 await page.addInitScript(()=>{const A=window.Audio;window.__audios=[];window.Audio=function(...args){const a=new A(...args);window.__audios.push(a);return a};window.Audio.prototype=A.prototype;});
 await page.goto(host+pathname,{waitUntil:'networkidle'});
 assert.equal(await page.locator('[data-question]').count(),10);assert.equal(await page.locator('#grammarQuestion input[type=radio]').count(),30);
 assert(await page.locator('.jl-page-qr-card img').evaluate(e=>e.complete&&e.naturalWidth>0));
 assert(await page.locator('.jl-page-qr-card img').evaluate(e=>{const r=e.getBoundingClientRect(),c=e.closest('.jl-page-qr-card').getBoundingClientRect();return Math.abs(r.width-r.height)<1&&r.bottom<c.bottom}),'square contained QR '+width);await page.locator('.jl-page-qr-open').click();await page.locator('.jl-page-qr-dialog').waitFor({state:'visible'});if(width===1440)await page.locator('.jl-page-qr-dialog img').screenshot({path:'tmp/unit5-grammar/qr-expanded.png'});await page.keyboard.press('Escape');
 await page.locator('[data-auth-toggle]').click();await page.locator('[data-local-login-form]').waitFor({state:'visible'});
 assert(await page.locator('[data-auth-panel]').evaluate(e=>{const r=e.getBoundingClientRect();return r.top>=0&&r.bottom<=innerHeight+1&&r.left>=0&&r.right<=innerWidth+1&&e.contains(document.elementFromPoint(r.left+20,r.top+20))}),'auth visibility '+width);await page.keyboard.press('Escape');
 await page.locator('#grammarCheckAll').click();assert.match(await page.locator('#grammarResult').textContent(),/0 \/ 10 answered/);assert.equal(await page.evaluate(()=>document.activeElement.name),'answer1');
 const run=width===1440?questions:[questions[0]];
 for(const q of run){
  const card=page.locator('#question'+q.id);await card.scrollIntoViewIfNeeded();assert.deepEqual(await card.locator('input[type=radio]').evaluateAll(es=>es.map(e=>e.value)),q.options);assert(await card.locator('img').evaluate(async e=>{await e.decode();return e.naturalWidth>0}));
  const order=Object.keys(q.why).filter(o=>o!==q.answer).concat(q.answer);
  for(const choice of order){await card.locator('label').filter({has:page.locator('input[value="'+choice+'"]')}).click();const feedback=await card.locator('.ie2-grammar-feedback').textContent();assert(feedback.includes(q.why[choice]));assert(feedback.includes(q.model));}
  await card.locator('.ie2-grammar-feedback summary').click();assert.equal(await card.locator('.u5g-reasons li').count(),3);
  await card.locator('[data-audio]').click();await page.waitForFunction(()=>__audios[0].currentTime>0&&!__audios[0].paused,null,{timeout:10000});assert.equal(await page.evaluate(()=>__audios[0].playbackRate),.75);
  await page.locator('[data-speed="1"]').click();assert.equal(await page.evaluate(()=>__audios[0].playbackRate),1);await page.locator('[data-speed="0.75"]').click();
  await card.locator('[data-project]').click();await page.locator('#pictureProjector').waitFor({state:'visible'});assert.equal(await page.locator('#pictureProjector img').evaluate(e=>getComputedStyle(e).objectFit),'contain');assert.equal(await page.locator('#projectorClues').textContent(),q.clues);
  await page.locator('#pictureProjector [data-audio]').click();await page.waitForFunction(()=>__audios[0].currentTime>0&&!__audios[0].paused,null,{timeout:10000});
  if(q.id===1&&(width===390||width===1440))await page.screenshot({path:'tmp/unit5-grammar/'+engine+'-project-'+width+'.jpg',type:'jpeg'});
  await page.keyboard.press('Escape');assert.equal(await page.locator('#pictureProjector').evaluate(e=>e.open),false);assert.equal(await page.evaluate(()=>document.activeElement.dataset.project),String(q.id));
 }
 if(width===1440){await page.locator('#grammarCheckAll').click();assert.match(await page.locator('#grammarResult').textContent(),/First choices: 0 \/ 10/);assert.match(await page.locator('#grammarResult').textContent(),/Current answers: 10 \/ 10/);}
 const count=await page.locator('#grammarQuestion').evaluate(e=>getComputedStyle(e).gridTemplateColumns.split(' ').length);assert.equal(count,width>1100?3:width>760?2:1);
 assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'overflow '+width);
 if(width===390||width===1440){await page.locator('#grammarQuestion').evaluate(e=>scrollTo(0,e.getBoundingClientRect().top+scrollY-20));await page.screenshot({path:'tmp/unit5-grammar/'+engine+'-cards-'+width+'.jpg',type:'jpeg'});await page.evaluate(()=>scrollTo(0,0));await page.screenshot({path:'tmp/unit5-grammar/'+engine+'-hero-'+width+'.jpg',type:'jpeg'});}
 await page.locator('#grammarRestart').click();assert.equal(await page.locator('#grammarQuestion input:checked').count(),0);assert.equal(await page.locator('#grammarQuestion [data-audio]').count(),0);assert.equal(await page.locator('#grammarProgress').textContent(),'0 / 10 answered');
 await page.locator('#question1 input').first().focus();await page.keyboard.press('Space');assert.equal(await page.locator('#grammarProgress').textContent(),'1 / 10 answered');await page.locator('#question1 [data-audio]').click();await page.waitForFunction(()=>!__audios[0].paused);await page.locator('#audioStop').click();assert.equal(await page.evaluate(()=>__audios[0].paused),true);
 assert.notEqual(await page.locator('#grammarRestart').evaluate(e=>getComputedStyle(e).color),'rgb(255, 255, 255)');assert.deepEqual(errors,[]);console.log(engine,width,'PASS: choices, feedback, scores, audio, projector, QR, auth, responsive grid');
 if(width===1440&&!process.env.SKIP_CATALOG){await page.goto(host+'/ingles/intermediate-2/practice-lab.html#unit-5-folder',{waitUntil:'networkidle'});await page.locator('#unit5ActivityGrid .ie2-lab-card').waitFor();assert.equal(await page.locator('#labActivityTotal').textContent(),'22');assert.equal(await page.locator('#labActiveUnitTotal').textContent(),'5');assert.equal(await page.locator('#unit-5-folder').evaluate(e=>e.open),true);await page.locator('[data-lab-filter="grammar"]').click();await page.locator('#practiceLabSearch').fill('must');assert.equal(await page.locator('.ie2-lab-card:visible').count(),1);assert((await page.locator('#unit5ActivityGrid a').getAttribute('href')).endsWith('grammar-unit-5-read-the-clues.html'));console.log('Practice Lab catalog/search/filter PASS');}
 await page.close();
}
}finally{await browser.close()}})().catch(e=>{console.error(e);process.exit(1)});
