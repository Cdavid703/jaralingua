const {chromium}=require('C:/Users/USER/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const base=process.env.UNIT6_BASE_URL||'http://127.0.0.1:8025';
(async()=>{
  const browser=await chromium.launch({executablePath:process.env.UNIT6_BROWSER||'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
  const errors=[];
  fs.mkdirSync(path.join(root,'tmp/unit6-qa'),{recursive:true});
  try{
    for(const width of [360,390,820,1440,1920]){
      const page=await browser.newPage({viewport:{width,height:900}});
      await page.addInitScript(()=>{const NativeAudio=window.Audio;window.__foodAudio=[];window.Audio=function(...args){const audio=new NativeAudio(...args);window.__foodAudio.push(audio);return audio;};});
      page.on('pageerror',e=>errors.push(e.message));
      await page.goto(base+'/ingles/basico-2/unit-6-fabulous-food.html',{waitUntil:'networkidle'});
      await page.locator('.jl-page-qr-open').waitFor();
      assert.equal(await page.locator('.food-topic').count(),14);
      assert.equal(await page.locator('details[open]').count(),0,'All sections initially closed');
      let metrics=await page.evaluate(()=>{
        const hero=document.querySelector('.lesson-hero'), copy=document.querySelector('.lesson-hero-content'), qr=document.querySelector('.jl-page-qr-card');
        return {width:document.documentElement.scrollWidth,viewport:innerWidth,hero:hero.getBoundingClientRect().toJSON(),shell:document.querySelector('.food-shell').getBoundingClientRect().width,position:getComputedStyle(hero).position,header:getComputedStyle(document.querySelector('.site-header')).position,copy:copy.getBoundingClientRect().toJSON(),qr:qr.getBoundingClientRect().toJSON(),textRight:Math.max(...[...copy.children].filter(c=>!c.classList.contains('jl-page-qr-card')).map(c=>c.getBoundingClientRect().right))};
      });
      assert.ok(metrics.width<=width+1,`No overflow at ${width}: ${JSON.stringify(metrics)}`);
      assert.ok(metrics.shell>=width*.95,'Full-width main shell');
      assert.ok(!['sticky','fixed'].includes(metrics.position));assert.ok(!['sticky','fixed'].includes(metrics.header));
      const overlaps=await page.evaluate(()=>{const q=document.querySelector('.jl-page-qr-card').getBoundingClientRect();return [...document.querySelector('.lesson-hero-content').children].filter(c=>!c.classList.contains('jl-page-qr-card')).some(c=>{const r=c.getBoundingClientRect();return r.top<q.bottom&&r.bottom>q.top&&r.left<q.right&&r.right>q.left;});});
      assert.ok(!overlaps,`QR must not overlap text at ${width}`);
      await page.screenshot({path:path.join(root,`tmp/unit6-qa/hero-${width}.png`)});
      await page.locator('.jl-page-qr-open').click();
      const qrDialog=await page.locator('#jlPageQrDialog').boundingBox();
      assert.ok(Math.abs(qrDialog.x+qrDialog.width/2-width/2)<3,'QR centered');
      await page.locator('.jl-page-qr-close').click();
      await page.locator('#food-words>summary').click();
      await page.locator('#food-words [data-food-speed="0.75"]').click();
      assert.equal(await page.locator('#food-words [data-food-speed="0.75"]').getAttribute('aria-pressed'),'true');
      await page.locator('#food-words .food-say').first().click();
      await page.waitForFunction(()=>[...document.querySelectorAll('[data-food-status]')].some(x=>/Playing: cucumber/.test(x.textContent)));
      await page.waitForFunction(()=>window.__foodAudio.some(a=>a.currentTime>0&&!a.paused&&a.playbackRate===0.75));
      await page.locator('#food-words [data-food-stop]').click();
      await page.evaluate(()=>document.querySelectorAll('details').forEach(d=>d.open=true));
      await page.evaluate(async()=>{await Promise.all([...document.images].map(i=>{i.loading='eager';return i.decode().catch(()=>{});}));});
      const overflow=await page.evaluate(()=>({width:document.documentElement.scrollWidth,badImages:[...document.images].filter(i=>!i.naturalWidth).map(i=>i.src)}));
      assert.ok(overflow.width<=width+1,`Expanded content overflow ${width}: ${overflow.width}`);
      assert.deepEqual(overflow.badImages,[],'All images load');
      await page.locator('#countable-food').scrollIntoViewIfNeeded();
      await page.screenshot({path:path.join(root,`tmp/unit6-qa/content-${width}.png`)});
      await page.locator('#countable-food [data-food-zoom]').click();
      assert.ok(await page.locator('#food-image-dialog').isVisible());
      await page.locator('#food-image-dialog button').click();
      await page.evaluate(()=>scrollTo(0,600));
      assert.ok((await page.locator('.lesson-hero').boundingBox()).y<metrics.hero.y-400,'Hero scrolls away');
      console.log(`PASS layout, accordion, QR, image zoom, audio controls: ${width}px`);
      await page.close();
    }
    const page=await browser.newPage();
    await page.goto(base+'/ingles/basico-2/idioms-phrasal-verbs.html');
    assert.equal(await page.locator('[data-food-library] .food-card').count(),10);
    assert.equal(await page.locator('#unit-6-expressions').getAttribute('open'),null);
    await page.goto(base+'/ingles/basico-2/course-overview.html');
    assert.equal(await page.locator('#unit-6-food a[href="unit-6-fabulous-food.html"]').count(),1);
    assert.equal(await page.locator('#unit-6-food').getAttribute('open'),null);
    assert.deepEqual(errors,[]);
    if(!process.env.UNIT6_SKIP_AUDIO_FILES){
      const manifest=JSON.parse(fs.readFileSync(path.join(root,'ingles/basico-2/audio/unit6/fabulous-food/audio-manifest.json')));
      for(const entry of Object.values(manifest)){const file=path.join(root,entry.path);assert.ok(fs.existsSync(file),'Missing '+entry.path);assert.ok(fs.statSync(file).size>1000,'Empty '+entry.path);}
      console.log(`PASS ${Object.keys(manifest).length} individual audio assets`);
    }
    console.log('PASS Unit 6 library and overview integration');
  }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
