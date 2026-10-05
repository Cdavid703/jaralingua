'use strict';
const assert=require('node:assert/strict');
const {chromium}=require('playwright');
const base=process.env.JARALINGUA_TEST_URL||'http://127.0.0.1:8022';
const path='/ingles/basico-2/final-oral-destination-detectives.html';
const students=[{id:1,fullName:'Ada Example'},{id:2,fullName:'Ben Example'},{id:3,fullName:'Dina Example'},{id:4,fullName:'César Example'},{id:5,fullName:'Santiago Example'},{id:6,fullName:'CESAR Test'},{id:7,fullName:'Eva Example'},{id:1,fullName:'Duplicate Example'}];
async function setup(browser,reducedMotion='no-preference',realAuth=false){
 const context=await browser.newContext({viewport:{width:1366,height:900},reducedMotion});
 if(!realAuth){
 await context.route('**/assets/js/google-auth.js*',route=>route.fulfill({contentType:'application/javascript',body:'window.testUser={credential:"synthetic-test",provider:"google"};window.JaraLinguaAuth={getUser:()=>window.testUser};'}));
 await context.route('**/api/basic2/grades',route=>route.fulfill({json:{role:'teacher',students}}));
 }
 await context.addInitScript(()=>{const Native=window.Audio;window.qaAudio=[];window.Audio=function(...args){const a=new Native(...args);window.qaAudio.push(a);return a;};window.Audio.prototype=Native.prototype;});
 const page=await context.newPage();page.on('pageerror',err=>{throw err;});await page.goto(base+path,{waitUntil:'load'});return {context,page};
}
async function spin(page){await page.locator('#dd-spin').click();await page.waitForTimeout(350);const before=await page.locator('#dd-wheel').evaluate(el=>el.style.transform);await page.waitForTimeout(500);const after=await page.locator('#dd-wheel').evaluate(el=>el.style.transform);assert.notEqual(before,after,'wheel must visibly rotate');const audio=await page.evaluate(()=>({time:qaAudio[0].currentTime,paused:qaAudio[0].paused,error:qaAudio[0].error?.code,duration:qaAudio[0].duration}));assert.ok(audio.time>.1&&!audio.paused&&!audio.error&&audio.duration>3,'real roulette sound plays');await page.waitForTimeout(2800);}
async function finishCard(page,index=0){await page.locator(`[data-card="${index}"]`).click();assert.ok(await page.locator('#dd-cover').isVisible());assert.ok(!(await page.locator('#dd-picture-area').isVisible()));await page.locator('#dd-show').click();await page.locator('#dd-picture').evaluate(el=>el.decode());assert.ok(!(await page.locator('#dd-answer').isVisible()));await page.locator('#dd-reveal').click();assert.ok(await page.locator('#dd-answer').isVisible());await page.locator('#dd-finish').click();}
(async()=>{const browser=await chromium.launch({headless:true,executablePath:process.env.BROWSER_PATH||'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'});try{
 for(const reduced of ['no-preference','reduce']){
 const {context,page}=await setup(browser,reduced);page.on('dialog',d=>d.accept());
 assert.equal(await page.locator('#dd-deck button').count(),10);
 assert.ok(await page.locator('#dd-spin').isDisabled());
 await page.locator('#dd-example').click();await page.locator('#dd-show').click();assert.ok(await page.locator('#dd-model').isVisible());await page.locator('#dd-picture').evaluate(el=>el.decode());await page.locator('#dd-reveal').click();assert.equal(await page.locator('#dd-answer-name').textContent(),'Paris, France');await page.locator('#dd-finish').click();
 await page.locator('#dd-load').click();await page.waitForFunction(()=>document.getElementById('dd-roster-status').textContent.includes('4 eligible'));
 const roster=await page.locator('#dd-roster').textContent();assert.ok(!/César|Santiago|CESAR|Duplicate/.test(roster));
 await page.locator('#dd-attendance summary').click();await page.locator('#dd-roster input').last().uncheck();
 await spin(page);const a=await page.locator('#dd-describer').textContent();assert.ok(a!=='Eva Example');await spin(page);const b=await page.locator('#dd-guesser').textContent();assert.notEqual(a,b);assert.ok(b!=='Eva Example');assert.ok(await page.locator('#dd-load').isDisabled());
 await page.locator('[data-card="0"]').click();await page.locator('#dd-show').click();await page.locator('#dd-picture').evaluate(el=>el.decode());await page.locator('#dd-enlarge').click();assert.ok(await page.locator('#dd-zoom').isVisible());await page.keyboard.press('Escape');await page.locator('#dd-hide').click();assert.ok(!(await page.locator('#dd-picture-area').isVisible()));await page.locator('#dd-close').click();assert.equal(await page.locator('#dd-deck button:enabled').count(),1,'resume only current card');
 await finishCard(page,0);assert.equal(await page.locator('[data-used="true"]').count(),1);
 await spin(page);const c=await page.locator('#dd-describer').textContent();assert.ok(c!==a&&c!==b);assert.match(await page.locator('#dd-spin').textContent(),/returning/);await spin(page);assert.notEqual(c,await page.locator('#dd-guesser').textContent());await finishCard(page,1);assert.ok(await page.locator('#dd-spin').isDisabled());
 await page.locator('#dd-reset').click();await spin(page);await page.evaluate(()=>{window.testUser=null;window.dispatchEvent(new Event('jaralingua:auth-changed'));});assert.equal(await page.locator('#dd-roster input').count(),0);assert.ok(await page.locator('#dd-spin').isDisabled());assert.ok(!(await page.locator('#dd-card').isVisible()));
 await context.close();console.log('PASS pair selection, exclusion, attendance, odd roster, sound and privacy: '+reduced);
 }
 const {context,page}=await setup(browser,'no-preference',true);
 for(const [width,height] of [[390,844],[844,390],[820,1180],[1180,820],[1366,768],[1920,1080]]){
 await page.setViewportSize({width,height});await page.evaluate(()=>scrollTo(0,0));await page.waitForTimeout(150);
 assert.ok(await page.locator('.site-header [data-jaralingua-auth-nav]').count()===1,'real top-nav sign in');assert.equal(await page.locator('body > .jaralingua-auth').count(),0);
 assert.ok(await page.locator('.site-header').evaluate(e=>e.getBoundingClientRect().height<=92),'compact header');
 assert.ok(await page.locator('.dd-hero h1').evaluate(e=>e.scrollWidth<=e.clientWidth+1),'title fits');
 assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'no horizontal overflow');
 const y=await page.locator('.dd-hero').evaluate(e=>e.getBoundingClientRect().top);await page.evaluate(()=>scrollTo(0,300));assert.ok((await page.locator('.dd-hero').evaluate(e=>e.getBoundingClientRect().top))<y-150,'hero scrolls');
 await page.locator('#dd-example').click();await page.locator('#dd-show').click();assert.ok(await page.locator('#dd-picture').evaluate(e=>e.naturalWidth>1000));
 assert.ok(await page.locator('#dd-card').evaluate(e=>e.scrollWidth<=e.clientWidth+1),'dialog fits');
 if(width===1366)await page.screenshot({path:'/tmp/destination-dialog.png'});
 await page.locator('#dd-close').click();
 }
 await page.setViewportSize({width:1366,height:900});await page.evaluate(()=>scrollTo(0,0));await page.screenshot({path:'/tmp/destination-desktop.png',fullPage:true});
 const images=['paris','cartagena','london','new-york','rio','rome','machu-picchu','giza','venice','sydney'];
 for(const id of images){const response=await context.request.get(base+'/assets/img/english-basic-2/destination-detectives/'+id+'.webp');assert.equal(response.status(),200);assert.ok((await response.body()).length>100000);}
 const qr=await context.request.get(base+'/assets/img/page-qr/ingles-basico-2-final-oral-destination-detectives.svg');assert.equal(qr.status(),200);
 await page.goto(base+'/ingles/basico-2/evaluations.html',{waitUntil:'load'});assert.equal(await page.locator('a[href="final-oral-destination-detectives.html"]').count(),1);
 await context.close();console.log('PASS six viewport sizes, real auth, scrolling hero, 10 images, QR and exam-center link');
 const auth=await setup(browser);await auth.context.route('**/api/basic2/grades',r=>r.fulfill({status:403,json:{error:'Forbidden'}}));await auth.page.locator('#dd-load').click();await auth.page.waitForFunction(()=>document.getElementById('dd-roster-status').textContent.includes('Only a teacher'));assert.ok(await auth.page.locator('#dd-spin').isDisabled());await auth.context.close();console.log('PASS denied roster access');
 }finally{await browser.close();}})().catch(err=>{console.error(err);process.exitCode=1;});
