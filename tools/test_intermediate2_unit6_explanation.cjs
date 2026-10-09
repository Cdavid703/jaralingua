const assert=require('node:assert/strict'),fs=require('node:fs');
const {chromium}=require('playwright');
const base=process.env.UNIT6_ORIGIN||'http://127.0.0.1:8137';
const url=base+'/ingles/intermediate-2/unit-6-news-and-natural-disasters.html';
const models=JSON.parse(fs.readFileSync('ingles/intermediate-2/audio/unit-6-explanation/models.json')).items;
(async()=>{
 const browser=await chromium.launch({headless:true, ...(process.env.UNIT6_CHROME ? {channel:'chrome'} : {})});
 try{
  for(const width of [320,390,768,1024,1440,1920]){
   const page=await browser.newPage({viewport:{width,height:900}}),errors=[];
   page.on('pageerror',e=>errors.push(e.message));await page.goto(url,{waitUntil:'domcontentloaded'});
   await page.locator('.jl-page-qr-open').waitFor();
   await page.waitForFunction(()=>{const img=document.querySelector('.jl-page-qr-card img');return img&&img.complete&&img.naturalWidth>0;});
   assert(await page.locator('.u4-hero .intermediate2-button,.u4-hero .ie2-overview-chips span').evaluateAll(es=>es.every(e=>{const r=e.getBoundingClientRect();return r.left>=0&&r.right<=innerWidth+1})), 'clipped hero controls '+width);
   assert.equal(await page.locator('.ie2-theory-topic').count(),10);assert.equal(await page.locator('details[open]').count(),0);
   assert(await page.locator('.jl-page-qr-card img').evaluate(e=>e.complete&&e.naturalWidth>0));
   await page.locator('.jl-page-qr-open').click();await page.locator('.jl-page-qr-dialog').waitFor({state:'visible'});await page.keyboard.press('Escape');
   await page.evaluate(()=>document.querySelectorAll('.ie2-theory-topic').forEach(e=>e.open=true));
   assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'overflow '+width);
   assert.equal(await page.locator('.u6-topic-group[open]').count(),0);
   if(width===390){
    assert(await page.locator('#disasters').evaluate(e=>e.getBoundingClientRect().height<1800),'disasters too long with groups closed');
    assert(await page.locator('#bulletin').evaluate(e=>e.getBoundingClientRect().height<3500),'bulletin too long with groups closed');
   }
   await page.evaluate(()=>document.querySelectorAll('main .u6-topic-group').forEach(d=>d.open=true));
   const previews=await page.locator('main .u6-scene img').evaluateAll(imgs=>imgs.map(i=>({height:i.getBoundingClientRect().height,fit:getComputedStyle(i).objectFit})));
   assert.equal(previews.length,13);assert(previews.every(i=>i.height>0&&i.height<=(width<=760?261:321)&&i.fit==='contain'),'oversized or cropped reading images '+width);
   if(width>=900)assert(await page.locator('#news .u6-scene').evaluate(e=>{const i=e.querySelector('img').getBoundingClientRect(),c=e.querySelector('.u4-card-copy').getBoundingClientRect();return c.left>=i.right-1&&Math.abs(c.top-i.top)<3;}),'scene explanation must sit next to image');
   await page.evaluate(()=>document.querySelectorAll('main .u6-topic-group').forEach(d=>d.open=false));

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
   assert.equal(await dialog.locator('.u4-project-description h3').count(),0,'duplicate scene title');
   await dialog.locator('[data-u6-next]').click();assert.match(await dialog.locator('#u6-project-title').innerText(),/editor/);
   await dialog.locator('[data-u6-say]').first().click();await page.waitForFunction(()=>!document.querySelector('#u6-player').paused);
   await dialog.locator('[data-u6-speed="1"]').click();assert.equal(await page.locator('#u6-player').evaluate(a=>a.playbackRate),1);
   await page.keyboard.press('Escape');await dialog.waitFor({state:'hidden'});await page.waitForFunction(()=>document.querySelector('#u6-player').paused);
   await page.locator('#say-tell .u6-project-section').click();await dialog.waitFor({state:'visible'});
   assert(await dialog.evaluate(e=>e.classList.contains('u6-text-only')));assert(await dialog.locator('table').count()>0);
   assert(await dialog.evaluate(e=>e.scrollWidth<=innerWidth+1),'projector overflow '+width);await page.keyboard.press('Escape');
   await page.locator('#disasters .u6-project-section').click();await dialog.waitFor({state:'visible'});
   const illustrated=dialog.locator('.u6-section-image img');assert.equal(await illustrated.count(),6);
   await illustrated.evaluateAll(imgs=>Promise.all(imgs.map(i=>i.decode())));
   assert(await illustrated.evaluateAll(imgs=>imgs.every(i=>i.getClientRects().length&&i.getBoundingClientRect().height>0&&i.getBoundingClientRect().height<=361)),'section projection must retain six compact images');
   assert.equal(await dialog.locator('.u4-project-open').count(),0,'inert enlargement controls in section projection');
   assert.equal(await dialog.locator('.u6-topic-group[open]').count(),4);
   assert(await dialog.evaluate(e=>e.scrollWidth<=innerWidth+1),'illustrated section overflow');
   await page.keyboard.press('Escape');assert.equal(await page.locator('main .u6-topic-group[open]').count(),0,'projection changed source groups');
   await page.locator('#disasters .u6-topic-group > summary').first().click();
   await page.locator('#disasters .u4-project-open').first().click();await dialog.waitFor({state:'visible'});
   assert.equal(await dialog.locator('#u6-project-title [data-u6-say]').count(),1,'word pronunciation lost from single title');
   await dialog.locator('#u6-project-title [data-u6-say]').click();await page.waitForFunction(()=>document.querySelector('#u6-player').currentTime>0);
   await page.keyboard.press('Escape');await page.keyboard.press('Escape');await dialog.waitFor({state:'hidden'});
   await page.locator('#u6-search').fill('drought');assert(await page.locator('#disasters').isVisible());assert.equal(await page.locator('#say-tell').isVisible(),false);
   await page.locator('[data-course-search-clear]').click();
   await page.evaluate(()=>{document.querySelectorAll('.ie2-theory-topic').forEach(e=>e.open=false);scrollTo(0,0);});
   if(width===390||width===1440)await page.screenshot({path:'/private/tmp/unit6-top-'+width+'.png'});
   if(width===1440){await page.evaluate(()=>{document.querySelector('#disasters').open=true;document.querySelector('#disasters .u6-topic-group').open=true;});await page.locator('#disasters').scrollIntoViewIfNeeded();await page.screenshot({path:'/private/tmp/unit6-content.png'});for(const m of models){const r=await page.request.get(base+'/ingles/intermediate-2/audio/unit-6-explanation/'+m.file);assert.equal(r.status(),200);}}
   assert.deepEqual(errors,[]);console.log('PASS Unit 6 at',width);await page.close();
  }
  const page=await browser.newPage({viewport:{width:390,height:844},hasTouch:true,isMobile:true});
  await page.goto(url);await page.locator('#news > summary').click();await page.locator('#news [data-u6-meaning]').first().tap();
  await page.locator('#u6-tooltip').waitFor({state:'visible'});await page.waitForFunction(()=>!document.querySelector('#u6-player').paused);console.log('PASS touch translation and audio');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exit(1);});
