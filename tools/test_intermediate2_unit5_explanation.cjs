const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {chromium,webkit,devices}=require('C:/Users/USER/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const host='https://www.jaralingua.com',pathname='/ingles/intermediate-2/unit-5-impressions-feelings-and-satire.html';
const models=JSON.parse(fs.readFileSync('ingles/intermediate-2/audio/unit-5-explanation/models.json','utf8')).items;
const localPaths=p=>p===pathname||p.includes('english-intermediate2-unit5-explanation.')||p.startsWith('/assets/img/english-intermediate-2/unit-5/explanation/')||p.startsWith('/ingles/intermediate-2/audio/unit-5-explanation/')||p==='/assets/img/page-qr/ingles-intermediate-2-unit-5-impressions-feelings-and-satire.svg';
(async()=>{
 const engine=process.env.WEBKIT?'webkit':'chrome';
 const browser=await (process.env.WEBKIT?webkit:chromium).launch(process.env.WEBKIT?{headless:true}:{channel:'chrome',headless:true});
 try{
 for(const width of (process.env.WIDTH?[Number(process.env.WIDTH)]:process.env.QUICK?[390,1440]:[320,390,430,768,1024,1440,1920])){
  const page=await browser.newPage({...width<1100?devices['iPhone 13']:{},viewport:{width,height:process.env.LANDSCAPE?390:900},deviceScaleFactor:1});
  if(process.env.DEBUG_MEDIA){page.on('response',r=>{if(r.url().endsWith('.mp3'))console.log('MEDIA RESPONSE',r.status(),r.url())});page.on('requestfailed',r=>console.log('FAILED',r.url(),r.failure()));}
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  const reference=await page.request.get(host+'/ingles/intermediate-2/unit-4-movies-music-and-reviews.html');
  const csp=reference.headers()['content-security-policy'];assert(csp);
  if(!process.env.LIVE)await page.route(host+'/**',async r=>{
   const p=new URL(r.request().url()).pathname;if(!localPaths(p))return r.continue();
   const file=path.resolve('.'+p);assert(fs.existsSync(file),file);
   if(p.endsWith('.mp3')){if(process.env.DEBUG_MEDIA)console.log('ROUTED',p,r.request().headers().range);
    const body=fs.readFileSync(file),range=r.request().headers().range;
    if(range){const m=range.match(/bytes=(\d+)-(\d*)/);if(m){const start=Number(m[1]),end=Math.min(m[2]?Number(m[2]):body.length-1,body.length-1);return r.fulfill({status:206,body:body.subarray(start,end+1),headers:{'Content-Type':'audio/mpeg','Accept-Ranges':'bytes','Content-Range':'bytes '+start+'-'+end+'/'+body.length}})}}
    return r.fulfill({body,headers:{'Content-Type':'audio/mpeg','Accept-Ranges':'bytes'}});
   }
   return r.fulfill({path:file,headers:p.endsWith('.html')?{'Content-Security-Policy':csp}:{}});
  });
  await page.addInitScript(()=>{const Original=window.Audio;window.__testAudio=[];window.Audio=function(...args){const a=new Original(...args);window.__testAudio.push(a);if(!window.__audioTrace)window.__audioTrace=[];for(const method of ['play','pause']){const fn=a[method].bind(a);a[method]=function(){window.__audioTrace.push({method,stack:new Error().stack});return fn();}}return a;};window.Audio.prototype=Original.prototype;});
  await page.goto(host+pathname,{waitUntil:'networkidle'});
  assert.equal(await page.locator('html').getAttribute('lang'),'en');
  assert.equal(await page.locator('.ie2-theory-topic').count(),10);
  await page.locator('.jl-page-qr-card img').waitFor({state:'visible'});
  assert(await page.locator('.jl-page-qr-card img').evaluate(e=>e.complete&&e.naturalWidth>0));
  await page.locator('.jl-page-qr-open').click();await page.locator('.jl-page-qr-dialog').waitFor({state:'visible'});if(width===1440)await page.locator('.jl-page-qr-dialog img').screenshot({path:'tmp/unit5-explanation/qr-expanded.png'});await page.keyboard.press('Escape');
  await page.locator('[data-auth-toggle]').click();await page.locator('[data-local-login-form]').waitFor({state:'visible'});
  const auth=await page.locator('[data-auth-panel]').evaluate(e=>{const r=e.getBoundingClientRect();return r.top>=0&&r.left>=0&&r.bottom<=innerHeight+1&&r.right<=innerWidth+1&&e.contains(document.elementFromPoint(r.left+20,r.top+20));});
  assert(auth,engine+' auth '+width);await page.keyboard.press('Escape');
  await page.evaluate(()=>document.querySelectorAll('.ie2-theory-topic').forEach(e=>e.open=true));
  const overflow=await page.evaluate(()=>({page:document.documentElement.scrollWidth,width:innerWidth}));assert(overflow.page<=overflow.width+1,JSON.stringify({engine,width,overflow}));
  for(const id of ['modals','looks-seems','ed-ing','opinions','connections'])assert(await page.locator('#'+id+' table, #'+id+' .u5-grid').count()>0);
  assert.equal(await page.locator('#unit5-content form,#unit5-content input[type=radio],#unit5-content textarea').count(),0);
  const word=page.locator('#evidence [data-u5-say]').first();await word.click();
  await page.waitForFunction(()=>window.__testAudio[0].currentTime>0&&!window.__testAudio[0].paused,{},{timeout:10000}).catch(async e=>{console.log(await page.evaluate(()=>({audio:window.__testAudio.map(a=>({src:a.src,time:a.currentTime,paused:a.paused,ready:a.readyState,error:a.error?.message,code:a.error?.code,network:a.networkState})),status:document.querySelector('.u5-local-status')?.textContent})));throw e;});
  assert.equal(await page.evaluate(()=>window.__testAudio[0].playbackRate),.75);
  assert.equal(await page.locator('.u5-projector').evaluate(e=>e.open),false);
  await page.locator('[data-u5-speed="1"]').first().click();assert.equal(await page.evaluate(()=>window.__testAudio[0].playbackRate),1);
  await page.locator('#evidence .u4-project-open').first().click();const dialog=page.locator('.u5-projector');await dialog.waitFor({state:'visible'});
  await page.waitForFunction(()=>{const e=document.querySelector('.u5-projector img');return e.complete&&e.naturalWidth>0});
  assert.equal(await dialog.locator('img').evaluate(e=>getComputedStyle(e).objectFit),'contain');
  await page.evaluate(()=>{window.__audioTrace=[];window.__clicked=[];document.addEventListener('click',e=>window.__clicked.push({tag:e.target.tagName,key:e.target.closest('[data-u5-say]')?.dataset.u5Say}),{capture:true})});await dialog.locator('[data-u5-say]').first().click();await page.waitForFunction(()=>!window.__testAudio[0].paused,{},{timeout:10000}).catch(async e=>{console.log('PROJECT AUDIO',await page.evaluate(()=>({audio:window.__testAudio.map(a=>({src:a.src,time:a.currentTime,paused:a.paused,ready:a.readyState,code:a.error?.code,duration:a.duration})),status:[...document.querySelectorAll('.u5-local-status')].map(e=>e.textContent),dialog:document.querySelector('.u5-projector').open,trace:window.__audioTrace,clicks:window.__clicked})));throw e;});
  await dialog.locator('[data-u5-next]').click();assert.equal(await dialog.locator('h2').textContent(),'Add information before you decide');
  await dialog.locator('[data-u5-prev]').click();assert.equal(await dialog.locator('[data-u5-prev]').isDisabled(),true);
  if(width===390||width===1440)await page.screenshot({path:'tmp/unit5-explanation/'+engine+'-project-'+width+'.jpg',type:'jpeg',quality:75});
  await page.keyboard.press('Escape');assert.equal(await dialog.evaluate(e=>e.open),false);
  assert.equal(await page.evaluate(()=>document.activeElement===document.querySelector('#evidence .u4-project-open')),true);
  if(width===1440)assert.equal(await page.locator('#expressions .u5-grid').evaluate(e=>getComputedStyle(e).gridTemplateColumns.split(' ').length),4);
  await page.locator('#u5-search').fill('mustn');await page.waitForTimeout(350);
  assert(await page.locator('#modals').isVisible());assert.equal(await page.locator('#ed-ing').isVisible(),false);
  await page.locator('[data-course-search-clear]').click();
  await page.evaluate(()=>document.querySelectorAll('.ie2-theory-topic').forEach((e,i)=>e.open=i===0));
  await page.evaluate(()=>scrollTo(0,0));
  if(width===390||width===1440){await page.screenshot({path:'tmp/unit5-explanation/'+engine+'-top-'+width+'.jpg',type:'jpeg',quality:80});await page.locator('.jl-page-qr-card img').screenshot({path:'tmp/unit5-explanation/qr.png'});}
  if(width===1440&&!process.env.QUICK){
   await page.evaluate(()=>document.querySelectorAll('.ie2-theory-topic').forEach(e=>e.open=true));
   for(const item of models){
    const target=page.locator('#unit5-content [data-u5-say="'+item.id+'"]').first();assert.equal(await target.count(),1);
    await target.click();await page.waitForFunction(id=>{const a=window.__testAudio[0];return a.src.includes(id)&&!a.paused&&a.currentTime>0},item.id);
   }
   await page.locator('[data-u5-stop]').first().click();
   await page.locator('#looks-seems').screenshot({path:'tmp/unit5-explanation/'+engine+'-comparison.jpg',type:'jpeg',quality:75});
  }
  assert.deepEqual(errors,[]);
  console.log('PASS',engine,width,'layout, QR, local login, audio, projection and search');await page.close();
 }
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exit(1)});

