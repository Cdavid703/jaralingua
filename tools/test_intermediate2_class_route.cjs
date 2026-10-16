/* Follow the actual class links; check existing activities and projection still open. */
const assert=require('node:assert/strict');
const {chromium}=require('playwright');
const origin=process.env.CLASS_ORIGIN||'http://127.0.0.1:8139';
const base=origin+'/ingles/intermediate-2/';
(async()=>{
 const browser=await chromium.launch({headless:true,channel:'chrome'});
 try{
  for(const width of [320,390,768,1024,1440]){
   const page=await browser.newPage({viewport:{width,height:900}}),errors=[];
   page.on('pageerror',e=>errors.push(e.message));
   async function layout(){assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'overflow '+width);}
   async function qr(){await page.locator('.jl-page-qr-open').click();await page.locator('.jl-page-qr-dialog').waitFor({state:'visible'});await page.keyboard.press('Escape');await page.locator('.jl-page-qr-dialog').waitFor({state:'hidden'});}
   await page.goto(base+'course-overview.html');
   assert.equal(await page.locator('#class-september-17').evaluate(d=>d.open),false);
   await page.locator('.ie2-overview-hero a[href="#class-september-17"]').click();
   await page.waitForFunction(()=>document.querySelector('#class-september-17').open);
   assert.equal(await page.locator('#class-september-17 li').count(),4);await layout();
   if([390,1440].includes(width))await page.screenshot({path:'/private/tmp/class-september17-'+width+'.png'});
   await qr();await page.locator('#class-september-17 .ie2-class-next').click();
   await page.waitForFunction(()=>document.querySelector('#verb-prepositions').open);
   assert.equal(new URL(page.url()).origin,origin);await layout();
   assert.equal(await page.locator('#class-step-1').count(),1);
   await page.locator('#class-step-1 [data-class-next]').click();
   await page.waitForURL('**/reading-unit-6-after-the-storm.html#class-step-2');await layout();await qr();
   await page.locator('#stOpen').click();await page.locator('#stReader').waitFor({state:'visible'});
   await page.locator('#stNext').click();await page.waitForFunction(()=>document.querySelector('#stPage').selectedIndex===1);
   await page.locator('#stReader [data-action="close"]').click();
   await page.locator('#class-step-2 [data-class-next]').click();
   await page.waitForFunction(()=>document.querySelector('#direct-reported').open);await layout();
   await page.locator('#class-step-3 a[href="#say-tell"]').click();
   await page.waitForFunction(()=>document.querySelector('#say-tell').open);
   await page.locator('#class-step-3 a[href="#changes"]').click();
   await page.waitForFunction(()=>document.querySelector('#changes').open);
   // Lesson navigation must not be duplicated in projected teaching content.
   await page.locator('#direct-reported > .ie2-theory-body > .u6-project-section').click();
   await page.locator('.u6-projector').waitFor({state:'visible'});
   assert.equal(await page.locator('.u6-projector .ie2-class-step').count(),0);
   await page.locator('.u6-projector [data-u6-close]').click();
   await page.locator('#changes > .ie2-theory-body > p > a[href*="speaking-unit-6"]').click();
   await page.waitForURL('**/speaking-unit-6-what-did-they-say.html#class-step-4');await layout();await qr();
   await page.locator('[data-project="guide"]').click();
   await page.locator('dialog[open]').waitFor({state:'visible'});await page.keyboard.press('Escape');
   await page.locator('#class-step-4 [data-class-next]').click();
   await page.waitForFunction(()=>document.querySelector('#class-september-17').open);
   assert.equal(new URL(page.url()).origin,origin);assert.deepEqual(errors,[]);
   // Clicking the hero link again also reopens a manually closed route.
   await page.locator('#class-september-17 > summary').click();
   await page.locator('.ie2-overview-hero a[href="#class-september-17"]').click();
   await page.waitForFunction(()=>document.querySelector('#class-september-17').open);
   console.log('PASS four-step class route, activities, projection and QR at',width);await page.close();
  }
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exit(1);});
