const {chromium,webkit}=require('C:/Users/USER/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict');
(async()=>{
 for(const mobile of [false,true]){
 const browser=await chromium.launch({channel:'msedge',headless:true});
 const page=await browser.newPage({viewport:{width:mobile?390:1440,height:900},hasTouch:mobile,isMobile:mobile});
 await page.route('**/api/**',r=>r.fulfill({status:200,contentType:'application/json',body:'{}'}));
 await page.route('https://accounts.google.com/**',r=>r.abort());
 await page.addInitScript(()=>localStorage.setItem('jaralingua_google_user',JSON.stringify({sub:'offline-radio-qa',email:'radio-qa@example.invalid',name:'Offline QA',credential:'mock-only',exp:Date.now()/1000+3600})));
 await page.goto((process.env.HOLIDAYS_TEST_BASE_URL||'https://www.jaralingua.com')+'/ingles/basico-2/audio-listening-unit-5-my-holidays.html',{waitUntil:'networkidle'});
 await page.waitForSelector('.question-card');
 for(const checkFirst of [false,true]){
 if(checkFirst)await page.locator('#quizCheck').click();
 for(let q=0;q<10;q++)for(const n of [0,2,1,3]){
 const label=page.locator(`[data-index="${q}"] .answer-option`).nth(n);
 if(mobile)await label.tap();else await label.click();
 await page.waitForTimeout(350);
 const selected=await page.locator(`input[name=q${q}]:checked`).getAttribute('value');
 assert.equal(selected,String(n),JSON.stringify({mobile,checkFirst,q,n,selected}));
 }
 }
 console.log('PASS label changes',mobile?'touch':'mouse');await browser.close();
 }
})().catch(e=>{console.error(e);process.exit(1)});
