const assert=require('node:assert/strict');
const {chromium,devices}=require('C:/Users/USER/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
(async()=>{const browser=await chromium.launch({channel:'chrome',headless:true});try{for(const width of [320,390,844,1440]){
 const page=await browser.newPage({...devices['iPhone 13'],viewport:{width,height:width===844?390:844},deviceScaleFactor:1});let attempts=0;
 if(!process.env.LIVE)await page.route('**/assets/js/google-auth.js*',r=>r.fulfill({path:'assets/js/google-auth.js'}));
 await page.route('**/api/**',async r=>{const path=new URL(r.request().url()).pathname;
 if(path==='/api/intermediate2/grades/login'){attempts++;assert.deepEqual(r.request().postDataJSON(),{email:'qa-user',password:'qa-password'});return r.fulfill(attempts===1?{status:401,json:{error:'invalid_credentials'}}:{json:{token:'qa-token',exp:Math.floor(Date.now()/1000)+3600,user:{sub:'qa-user',email:'qa@example.invalid',name:'QA Local Student'}}})}
 if(path==='/api/intermediate2/film-festival/state'){assert.equal(r.request().headers().authorization,'Bearer qa-token');assert.equal(r.request().headers()['x-jaralingua-auth-provider'],'local');return r.fulfill({json:{role:'student',name:'QA Local Student',classes:[],entries:[]}})}
 return r.fulfill({json:{}})});
 await page.goto('https://www.jaralingua.com/ingles/intermediate-2/speaking-unit-4-film-festival.html',{waitUntil:'networkidle'});
 await page.locator('#ff-signin').tap();const form=page.locator('[data-local-login-form]');await form.waitFor({state:'visible'});
 await form.locator('[name=email]').fill('qa-user');await form.locator('[name=password]').fill('qa-password');assert.equal(await form.locator('[name=password]').getAttribute('type'),'password');
 await form.locator('button').tap();await page.locator('[data-local-status]:not([hidden])').waitFor();await page.waitForFunction(()=>!document.querySelector('[data-local-login-form] button').disabled);assert.equal(attempts,1);
 await form.locator('button').tap();await page.waitForFunction(()=>document.getElementById('ff-message').textContent.includes('Signed in as QA Local Student'));assert.equal(attempts,2);assert.equal(await page.evaluate(()=>window.JaraLinguaAuth.getUser().provider),'local');
 console.log('PASS',width,'visible username/password, error/retry, local session, authenticated festival request');await page.close();
}}finally{await browser.close()}})().catch(e=>{console.error(e);process.exit(1)});
