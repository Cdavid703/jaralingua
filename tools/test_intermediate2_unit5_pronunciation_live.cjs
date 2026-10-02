const assert=require('node:assert/strict');
const {chromium}=require('C:/Users/USER/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
(async()=>{const browser=await chromium.launch({channel:'chrome',headless:true});try{
 const page=await browser.newPage({viewport:{width:390,height:844}}),host='https://www.jaralingua.com',href='/ingles/intermediate-2/pronunciation-unit-5-first-impressions-clear-words.html';
 await page.addInitScript(()=>{const A=window.Audio;window.Audio=function(...args){const a=new A(...args);window.__wordAudio=a;return a};window.Audio.prototype=A.prototype;});
 await page.goto(host+'/ingles/intermediate-2/practice-lab.html#unit-5-folder',{waitUntil:'networkidle'});
 await page.locator('#practiceLabSearch').fill('First Impressions, Clear Words');await page.locator('[data-lab-filter="pronunciation"]').click();
 const cards=page.locator('.ie2-lab-card:visible');assert.equal(await cards.count(),1);assert.equal(await cards.first().getAttribute('href'),href);
 await cards.first().locator('img').evaluate(e=>e.decode());await cards.first().click();await page.waitForURL(host+href);await page.waitForLoadState('networkidle');
 await page.locator('[data-speed="0.75"]').click();await page.locator('#modelButton').click();
 await page.waitForFunction(()=>document.getElementById('modelAudio').currentTime>0&&!document.getElementById('modelAudio').paused);assert.equal(await page.locator('#modelAudio').evaluate(e=>e.playbackRate),.75);
 await page.locator('#modelButton').click();await page.locator('.reading-word').filter({hasText:/^worried,$/}).click();
 await page.waitForFunction(()=>__wordAudio.currentTime>0&&!__wordAudio.paused&&__wordAudio.currentSrc.endsWith('/worried.mp3'));
 await page.locator('.word-model-replay').click();assert.match(await page.locator('#wordHelp').textContent(),/Stress WOR/);
 await page.locator('.jl-page-qr-open').click();await page.locator('.jl-page-qr-dialog').waitFor({state:'visible'});await page.locator('.jl-page-qr-dialog img').screenshot({path:'tmp/unit5-pronunciation/qr-live.png'});await page.keyboard.press('Escape');
 for(const suffix of ['submissions','audio?receipt=not-a-student']){const r=await page.request.get(host+'/api/intermediate2/unit5-pronunciation/'+suffix);assert.equal(r.status(),401);}
 const r=await page.request.post(host+'/api/intermediate2/unit5-pronunciation/submit',{data:{}});assert.equal(r.status(),401);
 console.log('PASS: published pronunciation catalog card, real narration at 0.75x, word audio/replay, enlarged QR and anonymous submission/audio denial.');
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exit(1)});
