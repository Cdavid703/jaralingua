/* Exercise real media, paired projection, touch/hover help and responsive geometry. */
const assert=require('node:assert/strict'),fs=require('node:fs'),crypto=require('node:crypto');
const {chromium}=require('playwright');
const origin=process.env.UNIT6_ORIGIN||'http://127.0.0.1:8139';
const route='/ingles/intermediate-2/unit-6-news-and-natural-disasters.html';
const content=JSON.parse(fs.readFileSync('assets/data/english-intermediate2-unit6-prepositions.json'));
const models=JSON.parse(fs.readFileSync('ingles/intermediate-2/audio/unit-6-explanation/models.json')).items.filter(x=>x.id.startsWith('prep-'));
const audit=JSON.parse(fs.readFileSync('ingles/intermediate-2/audio/unit-6-explanation/audio-audit.json'));
const images=JSON.parse(fs.readFileSync('docs/english-intermediate2-unit6-prepositions-resources.json')).images;
(async()=>{
 const browser=await chromium.launch({headless:true,channel:'chrome'});
 try{
  for(const m of models){const a=audit.find(x=>x.file===m.file);assert(a&&a.matched&&a.sha256===m.sha256,'audio audit '+m.file);}
  assert.equal(content.pairs.length,10);assert.equal(models.length,71);assert.equal(images.length,20);
  for(const viewport of [{width:320,height:740},{width:390,height:844},{width:844,height:390},{width:768,height:1024},{width:1024,height:768},{width:1440,height:900},{width:1920,height:1080}]){
   const page=await browser.newPage({viewport}),errors=[];page.on('pageerror',e=>errors.push(e.message));
   await page.goto(origin+route+'#prep-pair-look',{waitUntil:'domcontentloaded'});
   await page.waitForFunction(()=>document.querySelector('#prep-pair-look').open);
   assert(await page.locator('#verb-prepositions').evaluate(e=>e.open));
   const source=page.locator('#prep-pair-look');
   await source.locator('img').evaluateAll(imgs=>Promise.all(imgs.map(i=>i.decode())));
   const boxes=await source.locator('img').evaluateAll(imgs=>imgs.map(i=>({r:i.getBoundingClientRect().toJSON(),fit:getComputedStyle(i).objectFit})));
   assert(boxes.every(x=>x.fit==='contain'&&x.r.height<=321));
   if(viewport.width>760)assert(Math.abs(boxes[0].r.top-boxes[1].r.top)<2&&boxes[1].r.left>=boxes[0].r.right,'pairs must share a row');
   assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
   const phrase=source.locator('h3 [data-u6-meaning]').first();
   await phrase.hover();await page.locator('#u6-tooltip').waitFor({state:'visible'});
   assert.match(await page.locator('#u6-tooltip').innerText(),/buscar/);
   assert(await page.locator('#u6-player').evaluate(a=>a.paused));
   await phrase.click();await page.waitForFunction(()=>document.querySelector('#u6-player').currentTime>0);
   await page.keyboard.press('Escape');
   await source.locator('.u6-project-pair').click();
   const dialog=page.locator('.u6-projector');await dialog.waitFor({state:'visible'});
   assert(await page.locator('#u6-player').evaluate(a=>a.paused));
   assert.equal(await dialog.locator('.u6-section-image img').count(),2);
   assert.equal(await dialog.locator('.u4-project-open,.u6-project-pair').count(),0);
   for(let i=0;i<10;i++){
    assert.equal(await dialog.locator('#u6-project-count').innerText(),`Pair ${i+1} / 10`);
    assert.match(await dialog.locator('#u6-project-title').innerText(),new RegExp(content.pairs[i].verb.toUpperCase()));
    await dialog.locator('.u6-section-image img').evaluateAll(imgs=>Promise.all(imgs.map(i=>i.decode())));
    assert(await dialog.evaluate(d=>d.scrollWidth<=innerWidth+1));
    if(i===0){
     await dialog.locator('h3 [data-u6-meaning]').first().hover();
     await page.locator('#u6-tooltip').waitFor({state:'visible'});
     assert.match(await page.locator('#u6-tooltip').innerText(),/buscar/);
     await page.keyboard.press('Escape');
     await dialog.locator('.u6-prep-question [data-u6-say]').click();
     await page.waitForFunction(()=>document.querySelector('#u6-player').currentTime>0);
     assert.match(await page.locator('#u6-player').getAttribute('src'),/prep-look-question/);
     await dialog.locator('[data-u6-speed="1"]').click();
     assert.equal(await page.locator('#u6-player').evaluate(a=>a.playbackRate),1);
     if(viewport.width===1440)await page.screenshot({path:'/private/tmp/unit6-prep-pair-desktop.png'});
     if(viewport.width===390)await page.screenshot({path:'/private/tmp/unit6-prep-pair-mobile.png'});
    }
    if(i<9){await dialog.locator('[data-u6-next]').click();assert(await page.locator('#u6-player').evaluate(a=>a.paused));}
   }
   assert(await dialog.locator('[data-u6-next]').isDisabled());
   await dialog.locator('[data-u6-prev]').click();assert.match(await dialog.locator('#u6-project-title').innerText(),/LEARN/);
   await page.keyboard.press('Escape');await dialog.waitFor({state:'hidden'});
   assert.equal(await page.locator('main .u6-prep-pair[open]').count(),1,'projection must preserve source accordions');
   assert(await source.locator('.u6-project-pair').evaluate(e=>e===document.activeElement));
   await source.locator('.u4-project-open').first().click();await dialog.waitFor({state:'visible'});
   assert.equal(await dialog.locator('#u6-project-count').innerText(),'1 / 2');
   await dialog.locator('.u4-project-visual img').evaluate(i=>i.decode());
   assert.equal(await dialog.locator('.u4-project-visual img').evaluate(i=>getComputedStyle(i).objectFit),'contain');
   await dialog.locator('details > summary').click();
   await dialog.locator('[data-u6-say="prep-look-for-past.mp3"]').click();
   await page.waitForFunction(()=>document.querySelector('#u6-player').currentTime>0);
   await dialog.locator('[data-u6-next]').click();assert.match(await dialog.locator('#u6-project-title').innerText(),/look at/);
   await dialog.locator('[data-u6-close]').click();
   await page.locator('#u6-search').fill('prepositions');assert(await page.locator('#verb-prepositions').isVisible());
   await page.locator('[data-course-search-clear]').click();
   await page.locator('.jl-page-qr-open').click();await page.locator('.jl-page-qr-dialog').waitFor({state:'visible'});await page.keyboard.press('Escape');
   assert.deepEqual(errors,[]);console.log('PASS pairs, projection, media controls and QR',viewport);await page.close();
  }
  const page=await browser.newPage({viewport:{width:390,height:844},hasTouch:true,isMobile:true});
  await page.goto(origin+route+'#prep-pair-listen');
  await page.locator('#prep-pair-listen h3 [data-u6-meaning]').first().tap();
  await page.locator('#u6-tooltip').waitFor({state:'visible'});await page.waitForFunction(()=>document.querySelector('#u6-player').currentTime>0);
  // Decode every new audio and verify bytes from the served site against the saved manifest.
  let seconds=0;
  for(const item of models){
   const url=origin+'/ingles/intermediate-2/audio/unit-6-explanation/'+item.file;
   const response=await page.request.get(url);assert.equal(response.status(),200,item.file);
   assert.equal(crypto.createHash('sha256').update(await response.body()).digest('hex'),item.sha256,item.file);
   seconds+=await page.evaluate(async url=>{const c=new AudioContext();try{const b=await c.decodeAudioData(await(await fetch(url)).arrayBuffer());return b.duration;}finally{await c.close();}},url);
  }
  for(const item of images){const r=await page.request.get(origin+'/'+item.file);assert.equal(r.status(),200);assert.equal(crypto.createHash('sha256').update(await r.body()).digest('hex'),item.sha256);}
  console.log('PASS touch, 20 image hashes and 71 decoded audios;',Math.round(seconds),'seconds');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exit(1);});
