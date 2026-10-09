const {chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs');
const origin=process.env.NEWS_ORIGIN||'http://127.0.0.1:8139';
const data=JSON.parse(fs.readFileSync('assets/data/english-intermediate2-unit6-newsroom.json'));
(async()=>{const browser=await chromium.launch({headless:true});try{
 for(const width of [390,1440]){
  const page=await browser.newPage({viewport:{width,height:900}}),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.goto(origin+'/ingles/intermediate-2/vocabulary-unit-6-greenford-news.html');
  const audio=page.locator('#news-audio');
  async function nativePlay(expected){
   assert.equal(await audio.getAttribute('src'),expected);
   await page.waitForFunction(()=>document.querySelector('#news-audio').readyState>=1);
   // Exercise Chromium's actual built-in Play button, without Listen or audio.play().
   await audio.click({position:{x:25,y:27}});
   await page.waitForFunction(()=>{const a=document.querySelector('#news-audio');return !a.paused&&a.currentTime>0;});
   assert.equal(await audio.evaluate(a=>a.playbackRate),.75);
  }
  await nativePlay(data.scenes[0].audio);
  await audio.click({position:{x:25,y:27}});
  assert(await audio.evaluate(a=>a.paused));
  const pausedAt=await audio.evaluate(a=>a.currentTime);
  await nativePlay(data.scenes[0].audio);
  assert(await audio.evaluate((a,t)=>a.currentTime>=t,pausedAt));
  await page.locator('[data-news-action=stop]').click();
  await page.locator('[data-news-action=next]').click();
  await nativePlay(data.scenes[1].audio);
  await page.locator('#news-caption [data-word=reporter]').click();
  await page.waitForFunction(()=>document.querySelector('#news-word-audio').currentTime>0);
  assert(await audio.evaluate(a=>a.paused));
  assert.equal(await audio.getAttribute('src'),data.scenes[1].audio);
  await nativePlay(data.scenes[1].audio);
  await page.waitForFunction(()=>document.querySelector('#news-word-audio').paused);
  await page.locator('[data-news-action=quiz]').click();
  await nativePlay(data.questions[0].audio);
  await page.locator('#news-jump').selectOption('8');
  await nativePlay(data.questions[8].audio);
  await page.locator('[data-news-action=stop]').click();
  await page.locator('[data-news-action=project]').click();
  await nativePlay(data.questions[8].audio);
  await page.locator('[data-news-action=close-project]').click();
  await page.locator('#news-home #news-tv').waitFor({state:'visible'});
  await page.locator('[data-news-action=story]').click();
  await page.locator('[data-news-action=continuous]').click();
  await page.waitForFunction(()=>document.querySelector('#news-audio').currentTime>0);
  await audio.evaluate(a=>a.currentTime=a.duration-.05);
  await page.waitForFunction(()=>document.querySelector('#news-progress').textContent==='Scene 2 / 12');
  await page.waitForFunction(()=>document.querySelector('#news-audio').currentTime>0);
  assert.equal(await audio.getAttribute('src'),data.scenes[1].audio);
  await page.locator('[data-news-action=stop]').click();
  assert.deepEqual(errors,[]);console.log('PASS native Play, pause/resume, navigation, pronunciation isolation, questions, projection and full report at',width);await page.close();
 }
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exit(1)});
