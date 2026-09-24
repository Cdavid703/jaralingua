const {chromium}=require('C:/Users/USER/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..'),ctx={window:{}};
vm.runInNewContext(fs.readFileSync(path.join(root,'assets/js/basic2-unit6-practice-data.js'),'utf8'),ctx);
const activities=ctx.window.Basic2FoodPractice,base=process.env.UNIT6_BASE_URL||'http://127.0.0.1:8025';
const out=path.join(root,'tmp/unit6-practice-qa');fs.mkdirSync(out,{recursive:true});
(async()=>{
 const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});const errors=[];
 try{
  for(const [key,a]of Object.entries(activities)){
   for(const width of [390,820,1440]){
    const page=await browser.newPage({viewport:{width,height:900},hasTouch:width===390});page.on('pageerror',e=>errors.push(e.message));
    await page.goto(base+'/ingles/basico-2/'+a.file,{waitUntil:'networkidle'});await page.locator('.jl-page-qr-open').waitFor();
    assert.equal(await page.locator('details[open]').count(),0);
    const layout=await page.evaluate(()=>({w:innerWidth,sw:document.documentElement.scrollWidth,shell:document.querySelector('.food-shell').getBoundingClientRect().width,hero:getComputedStyle(document.querySelector('.lesson-hero')).position,header:getComputedStyle(document.querySelector('.site-header')).position}));
    assert.ok(layout.sw<=width+1,`${key} ${width}: ${JSON.stringify(layout)}`);assert.ok(layout.shell>=width*.95);assert.ok(!['sticky','fixed'].includes(layout.hero));assert.ok(!['sticky','fixed'].includes(layout.header));
    await page.locator('.jl-page-qr-open').click();const qr=await page.locator('#jlPageQrDialog').boundingBox();assert.ok(Math.abs(qr.x+qr.width/2-width/2)<3);await page.locator('.jl-page-qr-close').click();
    if(a.questions){
     assert.equal(await page.locator('fieldset').count(),a.questions.length);
     await page.locator('[data-question="0"] input').nth(0).check();await page.locator('[data-question="0"] input').nth(1).check();assert.ok(await page.locator('[data-question="0"] input').nth(1).isChecked());
     await page.locator('#fpCheck').click();await page.locator('[data-question="0"] input').nth(2).check();assert.ok(await page.locator('[data-question="0"] input').nth(2).isChecked());assert.ok(await page.locator('#feedback-0').isHidden());
     const counts=[0,0,0];for(let i=0;i<a.questions.length;i++){const options=await page.locator(`[data-question="${i}"] label span`).allTextContents();const index=options.findIndex(s=>s.slice(3)===a.questions[i].answer);assert.ok(index>=0);counts[index]++;await page.locator(`[data-question="${i}"] input`).nth(index).check();}
     assert.ok(Math.max(...counts)-Math.min(...counts)<=1,'Balanced A/B/C');await page.locator('#fpCheckBottom').click();assert.match(await page.locator('#fpScore').innerText(),new RegExp(`Score: ${a.questions.length} / ${a.questions.length}`));assert.equal(await page.locator('[data-result=correct]').count(),a.questions.length);
     await page.locator('#foodPractice').scrollIntoViewIfNeeded();await page.screenshot({path:path.join(out,`${key}-${width}.png`)});
     await page.locator('#fpReset').click();assert.equal(await page.locator('input:checked').count(),0);
    }else{
     assert.equal(await page.locator('.fp-memory-card').count(),24);
     const words=await page.locator('.fp-front strong').allTextContents();const other=words.findIndex(w=>w!==words[0]);await page.locator('[data-card="0"]').click();await page.locator(`[data-card="${other}"]`).click();await page.waitForFunction(()=>document.querySelector('#fpTeam').textContent.startsWith('Team 2'));assert.equal(await page.locator('.fp-memory-card.is-open').count(),0);
     for(const word of new Set(words)){const indices=words.map((w,i)=>w===word?i:-1).filter(i=>i>=0);for(const i of indices)await page.locator(`[data-card="${i}"]`).click();await page.locator('#fpContinue').waitFor();assert.equal(await page.locator('#fpPairWord').innerText(),word);await page.locator('#fpContinue').click();}
     assert.match(await page.locator('#fpMemoryStatus').innerText(),/Team 2 wins/);assert.match(await page.locator('#fpPoints').innerText(),/Team 2: 12/);
     await page.locator('#foodPractice').scrollIntoViewIfNeeded();await page.screenshot({path:path.join(out,`${key}-${width}.png`)});
    }
    await page.evaluate(async()=>{await Promise.all([...document.images].map(i=>{i.loading='eager';return i.decode().catch(()=>{});}));});assert.deepEqual(await page.evaluate(()=>[...document.images].filter(i=>!i.naturalWidth).map(i=>i.src)),[]);
    console.log(`PASS ${key} at ${width}px`);await page.close();
   }
  }
  const page=await browser.newPage();await page.goto(base+'/ingles/basico-2/practice-lab.html');assert.equal(await page.locator('#unit-6-folder').getAttribute('open'),null);assert.equal(await page.locator('#unit-6-folder .course-section-card').count(),5);assert.deepEqual(errors,[]);console.log('PASS five compact cards in closed Unit 6 folder');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
