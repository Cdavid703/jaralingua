const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const origin=process.env.NEWS_ORIGIN||'http://127.0.0.1:8139';
(async()=>{
 const browser=await chromium.launch({headless:true,channel:'chrome'});
 try{
 for(const width of (process.env.NEWS_WIDTHS||'320,390,768,1024,1440').split(',').map(Number)){
  const page=await browser.newPage({viewport:{width,height:950}}),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.goto(origin+'/ingles/intermediate-2/evaluations.html');
  assert.match(await page.locator('#finalOralNews h3').innerText(),/Final Oral Assessment/);
  await page.locator('#finalOralNews a').click();
  await page.waitForURL('**/final-oral-live-news-report.html');
  assert.equal(await page.locator('h1').innerText(),'Final Oral Assessment');
  assert.match(await page.locator('.news-hero').innerText(),/20% of your course grade/);
  assert.equal(await page.locator('a[download],a[href*="video-prompts"],input[type="file"]').count(),0);
  assert.equal(await page.locator('.news-shell > section').first().getAttribute('id'),'exam');

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
  await page.locator('#newsClassroomSetup summary').click();
  await page.locator('[data-role="desk"]').fill('Learner <img src=x>');
  await page.locator('#newsCard1 [data-scene]').first().click();await page.locator('#newsShowDialogue').click();
  assert.match(await page.locator('#newsProjection').innerText(),/Learner <img src=x>/);
  assert.equal(await page.locator('#newsProjection .news-lines img').count(),0);await page.keyboard.press('Escape');
  await page.locator('[data-project-section="language"]').click();
  assert.equal(await page.locator('#newsProjection [id]').count(),0);await page.keyboard.press('Escape');
  await page.locator('#newsReset').click();assert.equal(await page.locator('[data-reveal]').count(),6);assert.equal(await page.locator('[data-reveal]:disabled').count(),5);
  assert.deepEqual(errors,[]);
  console.log('PASS hosted videos and news model '+width+': ordered cards, projection, vocabulary, roles, rehearsal, QR, official exam entry and hosted video playback');await page.close();
 }
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exit(1);});
