import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
const {chromium}=require('C:/Users/USER/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const origin=process.env.PRONUNCIATION_ORIGIN||'http://127.0.0.1:8024';
const browser=await chromium.launch({channel:'chrome',headless:true});
try{
 for(const width of [320,390,820,1440]){
  const page=await browser.newPage({viewport:{width,height:950}});
  await page.goto(origin+'/ingles/intermediate-2/pronunciation-unit-4-make-your-movie-review-clear.html',{waitUntil:'networkidle'});
  await page.locator('.jl-page-qr-open').waitFor({state:'visible'});
  assert(await page.locator('.jl-page-qr-open img').evaluate(i=>i.complete&&i.naturalWidth>0));
  await page.locator('.jl-page-qr-open').click();await page.locator('.jl-page-qr-dialog').waitFor({state:'visible'});
  await page.locator('.jl-page-qr-close').click();
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
  if(width===1440)await page.screenshot({path:'tmp/unit4-pronunciation/hero-desktop.jpg',type:'jpeg',quality:75});
  await page.locator('[data-auth-toggle]').click();
  const panel=page.locator('[data-auth-panel]');await panel.waitFor({state:'visible'});
  assert(await panel.evaluate(el=>{
   const b=el.getBoundingClientRect();return b.left>=0&&b.right<=innerWidth&&b.top>=0&&b.bottom<=innerHeight&&
    [[b.left+20,b.top+20],[b.right-20,b.bottom-20],[b.left+b.width/2,b.top+b.height/2]].every(([x,y])=>el.contains(document.elementFromPoint(x,y)));
  }),'Clipped auth panel at '+width);
  await page.mouse.click(3,945);await panel.waitFor({state:'hidden'});
  await page.locator('#pronunciation-activity').scrollIntoViewIfNeeded();
  for(const sel of ['#readingText','.record-zone','.model-player']){
   const b=await page.locator(sel).boundingBox();assert(b.x>=0&&b.x+b.width<=width+1,sel+' overflow '+width);
  }
  if(width===1440){
   const selectors=['.pronunciation-panel','.reading-text','.mic-button','.shadow-mode-panel','.stage-panel'];
   const collect=selectors=>selectors.map(sel=>{const s=getComputedStyle(document.querySelector(sel));return {background:s.backgroundColor,radius:s.borderRadius,font:s.fontFamily};});
   const current=await page.evaluate(collect,selectors);
   await page.goto(origin+'/ingles/intermediate-2/pronunciation-unit-3-sound-clear-tech-support.html');
   assert.deepEqual(current,await page.evaluate(collect,selectors),'Shared visual style differs');
  }
  await page.close();
 }
 console.log('PASS: actual Unit 3 component styles match, full-width responsive controls and unobscured Sign in at 320/390/820/1440.');
}finally{await browser.close();}
