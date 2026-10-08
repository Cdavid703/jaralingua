const assert=require('node:assert/strict'),fs=require('node:fs');
const {chromium}=require('playwright');
const base=process.env.UNIT6_ORIGIN||'http://127.0.0.1:8137';
const url=base+'/ingles/intermediate-2/unit-6-news-and-natural-disasters.html';
const models=JSON.parse(fs.readFileSync('ingles/intermediate-2/audio/unit-6-explanation/models.json')).items;
(async()=>{
 const browser=await chromium.launch({headless:true, ...(process.env.UNIT6_CHROME ? {channel:'chrome'} : {})});
 try{
  for(const width of [320,390,768,1024,1440]){
   const page=await browser.newPage({viewport:{width,height:900}}),errors=[];
   page.on('pageerror',e=>errors.push(e.message));await page.goto(url,{waitUntil:'domcontentloaded'});
   await page.locator('.jl-page-qr-open').waitFor();
   assert(await page.locator('.u4-hero .intermediate2-button,.u4-hero .ie2-overview-chips span').evaluateAll(es=>es.every(e=>{const r=e.getBoundingClientRect();return r.left>=0&&r.right<=innerWidth+1})), 'clipped hero controls '+width);
   assert.equal(await page.locator('.ie2-theory-topic').count(),10);assert.equal(await page.locator('details[open]').count(),0);
   assert(await page.locator('.jl-page-qr-card img').evaluate(e=>e.complete&&e.naturalWidth>0));
   await page.locator('.jl-page-qr-open').click();await page.locator('.jl-page-qr-dialog').waitFor({state:'visible'});await page.keyboard.press('Escape');
   await page.evaluate(()=>document.querySelectorAll('.ie2-theory-topic').forEach(e=>e.open=true));
   assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'overflow '+width);
   const files=await page.locator('[data-u6-say]').evaluateAll(els=>[...new Set(els.map(e=>e.dataset.u6Say))]);
   for(const m of models)assert(files.includes(m.file),'missing audio '+m.file);
   const word=page.locator('#news [data-u6-meaning]').first();await word.hover();
   await page.locator('#u6-tooltip').waitFor({state:'visible'});assert.equal(await page.locator('#u6-tooltip').innerText(),'titular');
   assert(await page.locator('#u6-player').evaluate(a=>a.paused));await word.click();
   await page.waitForFunction(()=>document.querySelector('#u6-player').currentTime>0);
   assert.equal(await page.locator('#u6-player').evaluate(a=>a.playbackRate),.75);await page.keyboard.press('Escape');
   await page.locator('#direct-reported .u4-project-open').first().click();const dialog=page.locator('.u6-projector');await dialog.waitFor({state:'visible'});
   await page.waitForFunction(()=>document.querySelector('.u6-projector img').naturalWidth>0);
   assert.equal(await dialog.locator('img').first().evaluate(e=>getComputedStyle(e).objectFit),'contain');
   await dialog.locator('[data-u6-next]').click();assert.match(await dialog.locator('#u6-project-title').innerText(),/editor/);
   await dialog.locator('[data-u6-say]').first().click();await page.waitForFunction(()=>!document.querySelector('#u6-player').paused);
   await dialog.locator('[data-u6-speed="1"]').click();assert.equal(await page.locator('#u6-player').evaluate(a=>a.playbackRate),1);
   await page.keyboard.press('Escape');await dialog.waitFor({state:'hidden'});await page.waitForFunction(()=>document.querySelector('#u6-player').paused);
   await page.locator('#say-tell .u6-project-section').click();await dialog.waitFor({state:'visible'});
   assert(await dialog.evaluate(e=>e.classList.contains('u6-text-only')));assert(await dialog.locator('table').count()>0);
   assert(await dialog.evaluate(e=>e.scrollWidth<=innerWidth+1),'projector overflow '+width);await page.keyboard.press('Escape');
   await page.locator('#u6-search').fill('drought');assert(await page.locator('#disasters').isVisible());assert.equal(await page.locator('#say-tell').isVisible(),false);
   await page.locator('[data-course-search-clear]').click();
   await page.evaluate(()=>{document.querySelectorAll('.ie2-theory-topic').forEach(e=>e.open=false);scrollTo(0,0);});
   if(width===390||width===1440)await page.screenshot({path:'/private/tmp/unit6-top-'+width+'.png'});
   if(width===1440){await page.evaluate(()=>document.querySelector('#disasters').open=true);await page.locator('#disasters').scrollIntoViewIfNeeded();await page.screenshot({path:'/private/tmp/unit6-content.png'});for(const m of models){const r=await page.request.get(base+'/ingles/intermediate-2/audio/unit-6-explanation/'+m.file);assert.equal(r.status(),200);}}
   assert.deepEqual(errors,[]);console.log('PASS Unit 6 at',width);await page.close();
  }
  const page=await browser.newPage({viewport:{width:390,height:844},hasTouch:true,isMobile:true});
  await page.goto(url);await page.locator('#news > summary').click();await page.locator('#news [data-u6-meaning]').first().tap();
  await page.locator('#u6-tooltip').waitFor({state:'visible'});await page.waitForFunction(()=>!document.querySelector('#u6-player').paused);console.log('PASS touch translation and audio');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exit(1);});
