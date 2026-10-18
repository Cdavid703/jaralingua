const {chromium}=require('playwright'),fs=require('fs'),assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',args:['--use-fake-device-for-media-stream','--use-fake-ui-for-media-stream']});
 try {
 const context=await browser.newContext({permissions:['microphone'],viewport:{width:390,height:844}});
 const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));let mode='ok',requests=0;
 if(!process.env.PUBLIC_ONLY)await page.route('**/ingles/basico-2/pronunciation-unit-1-weather-going-out.html',r=>r.fulfill({contentType:'text/html',body:fs.readFileSync('ingles/basico-2/pronunciation-unit-1-weather-going-out.html','utf8')}));
 if(!process.env.PUBLIC_ONLY)await page.route('**/assets/js/english-basic2-pronunciation-unit1.js*',r=>r.fulfill({contentType:'text/javascript',body:fs.readFileSync('assets/js/english-basic2-pronunciation-unit1.js','utf8')}));
 await page.route('https://accounts.google.com/**',r=>r.fulfill({body:''}));
 await page.route('**/api/**',async r=>{
  if(r.request().url().includes('pronunciation-assessment')){
   requests++;if(mode==='error')return r.fulfill({status:503,json:{error:'Synthetic outage'}});
   return r.fulfill({json:{text:mode==='wrong'?'hello':await page.locator('#readingText').innerText(),audio:{rms:.1}}});
  }
  return r.fulfill({json:{}});
 });
 await page.goto('https://www.jaralingua.com/ingles/basico-2/pronunciation-unit-1-weather-going-out.html');
 await page.waitForSelector('[data-resume-practice]');
 const record=async()=>{await page.locator('#micButton').click();await page.waitForFunction(()=>document.querySelector('#stopButton').disabled===false);await page.waitForTimeout(350);await page.locator('#stopButton').click();await page.waitForFunction(()=>document.querySelector('#micButton').disabled===false);};
 await record();assert(await page.locator('.next-stage').isVisible());assert.match(await page.locator('[data-submit-score]').innerText(),/\d+\/100/);assert.match(await page.locator('[data-completion-count]').innerText(),/1\/7/);
 const score=await page.locator('#overallScore').innerText();await page.reload();await page.waitForSelector('.next-stage:visible');assert.equal(await page.locator('#overallScore').innerText(),score);
 await page.locator('[data-resume-practice]').click();assert(await page.locator('.next-stage').isVisible());await page.locator('.next-stage').click();assert.match(await page.locator('#stageTitle').innerText(),/Section 2/);
 mode='error';await record();await page.getByRole('button',{name:'Retry analysis of this recording'}).waitFor({state:'visible'});assert.equal(await page.locator('.next-stage').isVisible(),false);
 mode='wrong';await page.getByRole('button',{name:'Retry analysis of this recording'}).click();await page.waitForSelector('.next-stage:visible');assert(await page.locator('#overallScore').innerText()!=='--');
 await page.evaluate(()=>{const set=Storage.prototype.setItem;Storage.prototype.setItem=function(k,v){if(k.includes('pronunciation-unit1-weather-going-out:v1'))throw new DOMException('Full','QuotaExceededError');return set.call(this,k,v);};});
 mode='ok';await page.locator('.next-stage').click();await record();assert(await page.locator('.next-stage').isVisible());assert.match(await page.locator('#recordStatus').innerText(),/storage is unavailable/);
 for(let i=3;i<7;i++){await page.locator('.next-stage').click();await record();}
 assert(await page.locator('[data-submit-teacher]').isEnabled());assert.match(await page.locator('[data-completion-count]').innerText(),/7\/7/);
 for(const width of [390,844,820,1180,1440]){await page.setViewportSize({width,height:900});if(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1))console.log(await page.evaluate(()=>[...document.querySelectorAll('body *')].filter(e=>e.getBoundingClientRect().right>innerWidth+1).map(e=>[e.tagName,e.id,e.className,e.getBoundingClientRect().width]).slice(0,20)));assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'overflow '+width);}
 await page.setViewportSize({width:390,height:844});await page.locator('[data-submit-score]').scrollIntoViewIfNeeded();await page.screenshot({path:'/tmp/basic2-unit1-pronunciation-fixed.png'});
 assert.deepEqual(errors,[]);console.log('PASS score, partial summary, reload restoration, next section, low-score progression, service retry, storage failure and seven-part completion; '+requests+' synthetic analyses; no submissions.');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exit(1)});
