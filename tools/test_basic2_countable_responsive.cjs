const {chromium,webkit}=require('C:/Users/USER/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const base=process.env.COUNTABLE_BASE_URL||'https://www.jaralingua.com';
const out=path.resolve(__dirname,'../tmp/countable-responsive');fs.mkdirSync(out,{recursive:true});
(async()=>{
 const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
 try{for(const [width,height] of [[320,740],[390,844],[600,960],[768,1024],[820,1180],[1024,768],[1440,900]]){
  const page=await browser.newPage({viewport:{width,height},hasTouch:width<1100});
  await page.goto(base+'/ingles/basico-2/practice-unit-6-countable-uncountable-food.html',{waitUntil:'networkidle'});
  await page.locator('.fp-question').first().waitFor();
  const metrics=await page.evaluate(()=>{const sels=['.lesson-hero','.lesson-hero-content','.lesson-hero h1','.food-hero-image','.food-shell','.fp-question','.fp-choices','.jl-page-qr-card'];return {width:innerWidth,scroll:document.documentElement.scrollWidth,boxes:sels.map(s=>{const e=document.querySelector(s),r=e?.getBoundingClientRect();return {s,x:r?.x,w:r?.width,h:r?.height,scroll:e?.scrollWidth}}),overflow:[...document.querySelectorAll('main *')].filter(e=>e.getBoundingClientRect().right>innerWidth+2).slice(0,12).map(e=>({tag:e.tagName,c:e.className,text:e.textContent.slice(0,45),r:e.getBoundingClientRect().right}))};});
  console.log(JSON.stringify(metrics));
  await page.screenshot({path:path.join(out,`hero-${width}.png`)});await page.locator('#foodPractice').scrollIntoViewIfNeeded();await page.screenshot({path:path.join(out,`questions-${width}.png`)});
  if(process.env.COUNTABLE_ASSERT){
   assert.ok(metrics.scroll<=width+1);assert.equal(metrics.overflow.length,0);
   const first=page.locator('.fp-question').first();
   assert.ok(await first.evaluate(e=>{const css=getComputedStyle(e),inner=e.clientWidth-parseFloat(css.paddingLeft)-parseFloat(css.paddingRight);return e.querySelector('.fp-choices').getBoundingClientRect().width>=inner-2;}),'Options fill the card');
   await first.locator('label').nth(0).click();await first.locator('label').nth(1).click();assert.ok(await first.locator('input').nth(1).isChecked());await page.locator('#fpCheck').click();await first.locator('label').nth(2).click();assert.ok(await first.locator('input').nth(2).isChecked());
   await page.locator('.jl-page-qr-open').click();const qr=await page.locator('#jlPageQrDialog').boundingBox();assert.ok(Math.abs(qr.x+qr.width/2-width/2)<3);await page.locator('.jl-page-qr-close').click();
   await page.evaluate(()=>scrollTo(0,800));assert.ok(await page.locator('.lesson-hero').evaluate(e=>e.getBoundingClientRect().top<0));assert.ok(await page.locator('.site-header').evaluate(e=>!['fixed','sticky'].includes(getComputedStyle(e).position)));
   assert.equal(await page.locator('details[open]').count(),0);
  }
  await page.close();
 }}finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
