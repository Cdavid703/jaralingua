import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
const {chromium}=require('C:/Users/USER/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const origin=process.env.INTEGRATED_EXAM_ORIGIN||'http://127.0.0.1:8024';
const browser=await chromium.launch({channel:'chrome',headless:true});
try{
 for(const width of [320,390,768,1440]){
  const page=await browser.newPage({viewport:{width,height:900}});
  await page.goto(origin+'/ingles/intermediate-2/integrated-task-intermediate-c2-andres-vanegas-2026-1.html',{waitUntil:'networkidle'});
  await page.locator('.jl-page-qr-open').waitFor({state:'visible'});
  assert(await page.locator('.jl-page-qr-open img').evaluate(i=>i.complete&&i.naturalWidth>0));
  await page.locator('.jl-page-qr-open').click();
  const qrDialog=page.locator('.jl-page-qr-dialog');await qrDialog.waitFor({state:'visible'});
  assert(await qrDialog.evaluate(el=>{const b=el.getBoundingClientRect();return b.left>=0&&b.right<=innerWidth+1&&b.top>=0&&b.bottom<=innerHeight+1;}));
  await page.locator('.jl-page-qr-close').click();await qrDialog.waitFor({state:'hidden'});
  for(const trigger of ['[data-auth-toggle]','#ix-login']){
   if(trigger==='[data-auth-toggle]')await page.evaluate(()=>scrollTo(0,0));
   await page.locator(trigger).click();
   const panel=page.locator('[data-auth-panel]');
   await panel.waitFor({state:'visible'});
   const result=await panel.evaluate(el=>{
    const b=el.getBoundingClientRect();
    const points=[[b.left+24,b.top+24],[b.right-24,b.top+24],[b.left+24,b.bottom-24],[b.right-24,b.bottom-24],[b.left+b.width/2,b.top+b.height/2]];
    return {inViewport:b.left>=0&&b.top>=0&&b.right<=innerWidth&&b.bottom<=innerHeight,
      uncovered:points.every(([x,y])=>el.contains(document.elementFromPoint(x,y))),
      noOverflow:document.documentElement.scrollWidth<=innerWidth+1};
   });
   assert.deepEqual(result,{inViewport:true,uncovered:true,noOverflow:true},width+' '+trigger);
   if(trigger==='#ix-login')await page.screenshot({path:'tmp/intermediate2-integrated-qa/auth-layer-'+width+'.jpg',type:'jpeg',quality:80});
   await page.mouse.click(4,890);
   await panel.waitFor({state:'hidden'});
  }
  await page.evaluate(()=>scrollTo(0,0));
  if(width===1440)await page.screenshot({path:'tmp/intermediate2-integrated-qa/exam-hero.jpg',type:'jpeg',quality:85});
  await page.close();
 }
 console.log('PASS: sign-in panel is inside viewport, above hero, unclipped and clickable from both entry points at 320, 390, 768 and 1440 pixels.');
}finally{await browser.close();}
