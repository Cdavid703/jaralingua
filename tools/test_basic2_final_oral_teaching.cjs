'use strict';
const assert=require('node:assert/strict');
const {chromium}=require('playwright');
const base=process.env.JARALINGUA_TEST_URL||'http://127.0.0.1:8022';
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:process.env.BROWSER_PATH||'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'});
 try {
  const page=await browser.newPage({viewport:{width:1440,height:900}}),errors=[];
  await page.addInitScript(()=>{const NativeAudio=window.Audio;window.qaClips=[];window.Audio=class extends NativeAudio{constructor(...args){super(...args);window.qaClips.push(this);}};});
  page.on('pageerror',e=>errors.push(e.message));
  await page.goto(base+'/ingles/basico-2/basic-course-2-final-oral-task.html',{waitUntil:'load'});
  assert.equal(await page.locator('[data-destination]').count(),10);
  assert.equal(await page.locator('#ot-dialogue article').count(),22);
  for(const [width,height] of [[390,844],[844,390],[820,1180],[1180,820],[1440,900],[1920,1080]]) {
   await page.setViewportSize({width,height});await page.evaluate(()=>scrollTo(0,0));await page.waitForTimeout(100);
   assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'no overflow '+width);
   assert.ok(await page.locator('.site-header').evaluate(e=>e.getBoundingClientRect().height<=92),'compact header');
   assert.equal(await page.locator('[data-jaralingua-auth-nav]').count(),1);
   assert.ok(!(await page.locator('#ot-login').isVisible()),'one sign-in control');
   assert.ok(await page.locator('.ot-destination img').first().evaluate(e=>e.getBoundingClientRect().height<e.getBoundingClientRect().width),'landscape cards');
   const y=await page.locator('.ot-hero').evaluate(e=>e.getBoundingClientRect().top);
   await page.evaluate(()=>scrollTo(0,300));assert.ok(await page.locator('.ot-hero').evaluate(e=>e.getBoundingClientRect().top)<y-150);
   await page.locator('[data-destination="cartagena"]').click();await page.locator('#ot-project-image').evaluate(e=>e.decode());
   assert.ok(await page.locator('#ot-projector').evaluate(e=>e.scrollWidth<=e.clientWidth+1));
   await page.keyboard.press('Escape');
  }
  await page.locator('#ot-pronunciation-speed').selectOption('0.75');await page.locator('[data-audio="phrase-cant"]').click();
  await page.waitForFunction(()=>qaClips.some(a=>a.currentTime>.1&&!a.paused&&!a.error)); // Real audio playback.
  assert.equal(await page.evaluate(()=>qaClips.at(-1).playbackRate),.75);
  await page.locator('#ot-stop-audio').click();
  const model=await page.locator('#ot-model-audio').evaluate(async e=>{e.load();await new Promise((r,j)=>{e.addEventListener('loadedmetadata',r,{once:true});e.addEventListener('error',j,{once:true});});return {duration:e.duration,error:e.error?.code};});
  assert.ok(model.duration>=120&&model.duration<240&&!model.error,'complete model audio, at least two minutes');
  await page.locator('#ot-example-speed').selectOption('0.75');assert.equal(await page.locator('#ot-model-audio').evaluate(e=>e.playbackRate),.75);
  assert.equal((await page.request.get(base+'/assets/img/page-qr/ingles-basico-2-basic-course-2-final-oral-task.svg')).status(),200);
  await page.setViewportSize({width:1440,height:900});await page.evaluate(()=>scrollTo(0,0));await page.screenshot({path:'/tmp/basic2-oral-draft-desktop.png',fullPage:true});
  await page.setViewportSize({width:390,height:844});await page.screenshot({path:'/tmp/basic2-oral-draft-mobile.png',fullPage:true});
  assert.deepEqual(errors,[]);console.log('PASS: ten destinations, model, pronunciation controls, real auth navigation, QR, projector and six viewport sizes. Model duration:',model.duration);
 } finally {await browser.close();}
})().catch(e=>{console.error(e);process.exit(1);});
