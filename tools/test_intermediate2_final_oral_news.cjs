const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const origin=process.env.NEWS_ORIGIN||'http://127.0.0.1:8139';
(async()=>{
 const browser=await chromium.launch({headless:true,channel:'chrome'});
 try{
 let fixture;
 for(const width of (process.env.NEWS_WIDTHS||'320,390,768,1024,1440').split(',').map(Number)){
  const page=await browser.newPage({viewport:{width,height:950}}),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.goto(origin+'/ingles/intermediate-2/final-oral-live-news-report.html');
  await page.locator('[data-reveal="0"]').waitFor();
  assert.equal(await page.locator('[data-reveal]').count(),6);
  assert.equal(await page.locator('[data-reveal]:disabled').count(),5);
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'page overflow '+width);
  assert(await page.locator('.news-hero > figure img').evaluate(i=>i.complete&&i.naturalWidth>0));
  await page.locator('.jl-page-qr-open').click();await page.locator('.jl-page-qr-dialog').waitFor({state:'visible'});await page.keyboard.press('Escape');
  if(width===1440)await page.screenshot({path:'/private/tmp/news-desktop-hero.png'});
  if(width===390)await page.screenshot({path:'/private/tmp/news-mobile-hero.png'});
  await page.locator('[data-reveal="0"]').click();
  assert.equal(await page.locator('[data-reveal="1"]').isEnabled(),true);
  assert.match(await page.locator('#newsCard0 video').getAttribute('src'),/01-studio-heygen-v1/);
  assert.equal(await page.locator('#newsCard0 video').getAttribute('autoplay'),null);
  await page.locator('#newsCard0 video').evaluate(v=>v.play());
  await page.waitForFunction(()=>document.querySelector('#newsCard0 video').currentTime>0);

  await page.locator('#newsCard0 [data-scene]').first().click();
  await page.locator('#newsProjector').waitFor({state:'visible'});
  assert(await page.locator('#newsCard0 video').evaluate(v=>v.paused));

  assert.equal(await page.locator('#newsProjection .news-lines').count(),0);
  await page.locator('#newsShowDialogue').click();
  assert.match(await page.locator('#newsProjection').innerText(),/Good evening/);
  const word=page.locator('#newsProjection .news-word').first();await word.focus();
  assert.equal(await word.evaluate(el=>getComputedStyle(el,'::after').display),'block');
  if(width===1440)await page.screenshot({path:'/private/tmp/news-desktop-model.png'});
  if(width===390)await page.screenshot({path:'/private/tmp/news-mobile-model.png'});
  for(let i=1;i<6;i++){await page.locator('#newsNext').click();assert.match(await page.locator('#newsProjectTitle').innerText(),new RegExp('^'+(i+1)+' / 6'));}
  assert(await page.locator('#newsNext').isDisabled());
  await page.locator('#newsShowDialogue').click(); // hide at final scene
  await page.keyboard.press('ArrowLeft');assert.match(await page.locator('#newsProjectTitle').innerText(),/^5 \/ 6/);
  await page.keyboard.press('Escape');
  for(const [scene,file] of [[0,'01-studio'],[1,'03-flood'],[2,'02-field']]){
   const card=page.locator('#newsCard'+scene+' video');assert.match(await card.getAttribute('src'),new RegExp(file));
   await card.evaluate(v=>v.play());await page.waitForFunction(i=>document.querySelector('#newsCard'+i+' video').currentTime>0,scene);
   await page.locator('#newsCard'+scene+' [data-scene]').first().click();
   assert(await card.evaluate(v=>v.paused));
   const projected=page.locator('#newsProjection video');assert.match(await projected.getAttribute('src'),new RegExp(file));
   await projected.evaluate(v=>v.play());await page.waitForFunction(()=>document.querySelector('#newsProjection video').currentTime>0);
   await page.locator('[data-still-image]').click();assert.equal(await page.locator('#newsProjection video').count(),0);
   assert(await page.locator('#newsProjection img').evaluate(i=>i.complete&&i.naturalWidth>0));
   await page.locator('#newsClose').click();
  }
  for(const scene of [3,4,5]){await page.locator('#newsCard'+scene+' [data-scene]').first().click();assert.equal(await page.locator('#newsProjection video').count(),0);await page.locator('#newsClose').click();}
  await page.locator('#newsRehearsal').check();
  assert.equal(await page.locator('.news-card-model').count(),0);
  assert.equal(await page.locator('.news-card video').count(),0);
  await page.locator('#newsCard3 [data-scene]').first().click();assert(await page.locator('#newsShowDialogue').isDisabled());
  assert.equal(await page.locator('#newsProjection .news-lines').count(),0);
  await page.locator('#newsClose').click();
  await page.locator('#newsRehearsal').uncheck();
  await page.locator('.news-details').first().locator('summary').click();
  await page.locator('[data-role="desk"]').fill('Learner <img src=x>');
  await page.locator('[data-clip="0"]').setInputFiles({name:'bad.txt',mimeType:'text/plain',buffer:Buffer.from('invalid')});
  assert.match(await page.locator('#newsClipStatus0').innerText(),/Choose an MP4/);
  if(!fixture){
   const bytes=await page.evaluate(async()=>{
    const c=document.createElement('canvas');c.width=320;c.height=180;const ctx=c.getContext('2d');ctx.fillStyle='#0f766e';ctx.fillRect(0,0,320,180);
    const stream=c.captureStream(10),rec=new MediaRecorder(stream,{mimeType:'video/webm'}),chunks=[];
    rec.ondataavailable=e=>chunks.push(e.data);
    const result=new Promise(resolve=>rec.onstop=async()=>resolve(Array.from(new Uint8Array(await new Blob(chunks,{type:'video/webm'}).arrayBuffer()))));
    rec.start();const timer=setInterval(()=>{ctx.fillRect(0,0,320,180);},80);await new Promise(r=>setTimeout(r,900));rec.stop();clearInterval(timer);stream.getTracks().forEach(t=>t.stop());return result;
   });fixture=Buffer.from(bytes);fs.writeFileSync('/private/tmp/news-video-fixture.webm',fixture);
  }
  for(let slot=0;slot<3;slot++)await page.locator('[data-clip="'+slot+'"]').setInputFiles({name:'test-'+slot+'.webm',mimeType:'video/webm',buffer:fixture});
  assert.match(await page.locator('#newsClipStatus0').innerText(),/Ready on this device/);
  await page.locator('#newsCard0 [data-scene]').first().click();
  await page.locator('#newsProjection video').evaluate(v=>v.play());
  await page.waitForFunction(()=>document.querySelector('#newsProjection video').currentTime>0);
  await page.locator('#newsClose').click();
  for(const [scene,slot] of [[1,2],[2,1]]){await page.locator('#newsCard'+scene+' [data-scene]').first().click();assert.match(await page.locator('#newsProjection figcaption').innerText(),new RegExp('test-'+slot));await page.locator('#newsProjection video').evaluate(v=>v.play());await page.waitForFunction(()=>document.querySelector('#newsProjection video').currentTime>0);await page.locator('#newsClose').click();}
  await page.locator('[data-remove-clip="0"]').click();
  await page.locator('#newsCard0 [data-scene]').first().click();assert.match(await page.locator('#newsProjection video').getAttribute('src'),/01-studio-heygen-v1/);await page.keyboard.press('Escape');
  await page.locator('[data-project-section="language"]').click();
  assert.equal(await page.locator('#newsProjection [id]').count(),0);await page.keyboard.press('Escape');
  await page.locator('#newsReset').click();assert.equal(await page.locator('[data-reveal]').count(),6);assert.equal(await page.locator('[data-reveal]:disabled').count(),5);
  assert.deepEqual(errors,[]);
  const md=await page.request.get(origin+'/ingles/intermediate-2/downloads/live-news-report-video-prompts.txt');assert.equal(md.status(),200);assert.equal(((await md.text()).match(/```text/g)||[]).length,3);
  assert.equal(await page.locator('a[download="live-news-report-video-prompts.md"]').first().getAttribute('download'),'live-news-report-video-prompts.md');await page.locator('a[download="live-news-report-video-prompts.md"]').first().click();await page.locator('[data-auth-panel]').waitFor({state:'visible'});await page.keyboard.press('Escape');assert.equal(await md.text(),fs.readFileSync(require('node:path').join(__dirname,'../ingles/intermediate-2/downloads/live-news-report-video-prompts.md'),'utf8'));
  console.log('PASS hosted videos and news model '+width+': ordered cards, projection, vocabulary, roles, rehearsal, QR and real local video playback');await page.close();
 }
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exit(1);});
