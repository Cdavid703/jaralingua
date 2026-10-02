// Regression: page turns must be reachable without scrolling to the audio/footer.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {chromium,webkit}=require('C:/Users/USER/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const host='https://www.jaralingua.com',url='/ingles/intermediate-2/reading-unit-5-little-red-riding-hood.html';
async function visibleTurns(page){
 for(const selector of ['[data-prev]','[data-next]'])assert(await page.locator(selector).evaluate(e=>{
  const r=e.getBoundingClientRect();return r.top>=0&&r.bottom<=innerHeight&&r.left>=0&&r.right<=innerWidth&&e.contains(document.elementFromPoint(r.x+r.width/2,r.y+r.height/2));
 }),`${selector} must be visible and unobstructed without automatic scrolling`);
}
(async()=>{
 const engine=process.env.WEBKIT?'webkit':'chrome',browser=await(process.env.WEBKIT?webkit:chromium).launch(process.env.WEBKIT?{headless:true}:{channel:'chrome',headless:true});
 try{
  fs.mkdirSync('tmp/unit5-red-riding-hood-navigation',{recursive:true});
  for(const [width,height] of [[320,700],[390,844],[430,932],[768,1024],[844,390],[1440,900],[1920,1080]]){
   const page=await browser.newPage({viewport:{width,height},reducedMotion:'reduce'}),errors=[];page.on('pageerror',e=>errors.push(e.message));
   if(!process.env.LIVE)await page.route(host+'/**',async route=>{
    const p=new URL(route.request().url()).pathname;
    if(p===url||p==='/assets/css/english-intermediate2-red-riding-hood.css')return route.fulfill({path:path.resolve('.'+p)});
    return route.continue();
   });
   await page.goto(host+url,{waitUntil:'networkidle'});
   await page.locator('#rrHeroOpen').click();await visibleTurns(page);
   // Physical clicks after geometry checks: Playwright must not rescue an offscreen control.
   for(const selector of ['[data-next]','[data-next]','[data-prev]']){
    const r=await page.locator(selector).boundingBox();await page.mouse.click(r.x+r.width/2,r.y+r.height/2);await visibleTurns(page);
   }
   assert.equal(await page.locator('#rrJump').inputValue(),'1');
   for(const large of [false,true]){
    if(large)await page.locator('#rrTextSize').click();
    await page.locator('#rrImage').evaluate(e=>e.decode());
    for(const fraction of [0,.45,.9]){
     await page.locator('#rrBook').evaluate((e,f)=>window.scrollTo({top:scrollY+e.getBoundingClientRect().top+e.clientHeight*f,behavior:'instant'}),fraction);
     await visibleTurns(page);
     assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
     if(!large&&fraction===.45&&[390,1440].includes(width))await page.screenshot({path:`tmp/unit5-red-riding-hood-navigation/${engine}-${width}.png`});
    }
    const r=await page.locator('[data-next]').boundingBox();await page.mouse.click(r.x+r.width/2,r.y+r.height/2);
    assert.equal(await page.locator('#rrJump').inputValue(),large?'3':'2');await visibleTurns(page);
   }
   await page.locator('#rrJump').selectOption('7');assert(await page.locator('[data-next]').isDisabled());await visibleTurns(page);
   await page.locator('#rrEnlarge').click();await page.locator('#rrReadingDialog').waitFor({state:'visible'});await visibleTurns(page);
   await page.locator('#rrPageScroll').evaluate(e=>e.scrollTop=e.scrollHeight);await visibleTurns(page);
   await page.locator('[data-prev]').click();assert.equal(await page.locator('#rrJump').inputValue(),'6');await visibleTurns(page);
   await page.locator('#rrCloseReading').click();await page.locator('#rrHome #rrReader').waitFor({state:'visible'});await visibleTurns(page);
   await page.locator('#rrJump').selectOption('-1');assert(await page.locator('[data-prev]').isDisabled());await visibleTurns(page);
   assert.deepEqual(errors,[]);await page.close();console.log(engine,width,height,'PASS: navigation stays visible, turns, large text, enlarged view and boundaries');
  }
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exit(1)});
