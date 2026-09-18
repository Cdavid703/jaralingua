import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
const {chromium}=require('C:/Users/USER/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const origin=process.env.FESTIVAL_ORIGIN||'http://127.0.0.1:8024';
const browser=await chromium.launch({channel:'chrome',headless:true});
try{
 for(const width of [320,390,768,1440]){
  const page=await browser.newPage({viewport:{width,height:900}});
  await page.goto(origin+'/ingles/intermediate-2/speaking-unit-4-film-festival.html',{waitUntil:'networkidle'});
  for(const trigger of ['[data-auth-toggle]','#ff-signin']){
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
   if(trigger==='#ff-signin')await page.screenshot({path:'tmp/film-festival-qa/auth-layer-'+width+'.jpg',type:'jpeg',quality:80});
   await page.mouse.click(4,890);
   await panel.waitFor({state:'hidden'});
  }
  await page.evaluate(()=>scrollTo(0,0));
  if(width===1440)await page.screenshot({path:'tmp/film-festival-qa/festival-new-hero.jpg',type:'jpeg',quality:85});
  await page.close();
 }
 console.log('PASS: sign-in panel is inside viewport, above hero, unclipped and clickable from both entry points at 320, 390, 768 and 1440 pixels.');
}finally{await browser.close();}
