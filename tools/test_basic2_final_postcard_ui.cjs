const assert = require('node:assert/strict');
const fs = require('node:fs');
const {spawn} = require('node:child_process');
const {chromium} = require('playwright');
const base = 'http://127.0.0.1:8798', route = '/ingles/basico-2/basic-course-2-final-writing-task.html';
const output = process.env.POSTCARD_QA_OUTPUT || 'tmp/basic2-final-postcard';
const text = [
  'Last July we traveled to a small town near the coast. We went with our classmates and stayed in a comfortable house. The weather was warm, and we were excited about our first holiday together.',
  'First we walked along the beach and took pictures. Then we visited a market and ate delicious fish. After that we played volleyball. The water was cold, but we went swimming anyway and had fun.',
  'On our last day Ben wore two different shoes by mistake. He did not notice until we arrived at the restaurant. We laughed together and took a funny picture. Finally we returned home with wonderful memories.'
];
(async () => {
 fs.mkdirSync(output,{recursive:true});
 const server=spawn(process.env.POSTCARD_QA_PYTHON || 'python3',['-B','tools/test_basic2_final_postcard.py','--serve','8798'],{windowsHide:true,stdio:['ignore','pipe','pipe']});
 process.on('exit',()=>server.kill());
 await new Promise((resolve,reject)=>{server.stdout.once('data',resolve);server.once('error',reject);server.once('exit',code=>reject(new Error('QA server exited: '+code)));});
 const browser=await chromium.launch({headless:true});
 const context=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
 context.setDefaultTimeout(15000);
 const errors=[];
 await context.route('**/assets/js/google-auth.js*',r=>r.fulfill({contentType:'application/javascript',body:'window.JaraLinguaAuth={getUser:()=>JSON.parse(sessionStorage.getItem("qaUser")||"null"),openPanel:()=>{}};'}));
 await context.route('https://accounts.google.com/**',r=>r.fulfill({body:''}));
 const setup=async who=>{const p=await context.newPage();p.on('pageerror',e=>errors.push(e.message));p.on('dialog',d=>d.accept());await p.addInitScript(who=>sessionStorage.setItem('qaUser',JSON.stringify({email:who+'@test.invalid',provider:'local',credential:'qa-'+who})),who);await p.goto(base+route);return p;};
 const api=async(who,action,payload)=>{const r=await fetch(base+'/api/basic2/final-postcard/'+action,{method:payload?'POST':'GET',headers:{Authorization:'Bearer qa-'+who,'Content-Type':'application/json'},...(payload?{body:JSON.stringify(payload)}:{})});const d=await r.json();assert.equal(r.status,200,JSON.stringify(d));return d;};
 try {
  if(!process.argv.includes('--auth-only')){
  const teacher=await setup('teacher');await teacher.locator('#pc-admin').waitFor({state:'visible'});
  const a=await setup('1'),b=await setup('2');
  await a.locator('#pc-start').waitFor();assert(await a.locator('#pc-start').isDisabled());
  await teacher.locator('#pc-open').click();await a.locator('#pc-refresh').click();await a.locator('#pc-start').click();await a.locator('#pc-part-0').waitFor();
  assert.equal(await a.locator('#pc-parts textarea').count(),3);
  for(let i=0;i<3;i++)await a.locator('#pc-part-'+i).fill(text[i]);
  await a.locator('#pc-save-button').click();await a.waitForFunction(()=>document.getElementById('pc-save').textContent.includes('saved on the server'));
  assert.equal((await api('1','state')).team.members.length,1);
  assert.equal((await api('2','state')).team,null);
  console.log('Individual start and complete postcard saved');
  // Every viewport must use the available width and keep the QR inside the title.
  for(const width of [320,390,600,768,820,1024,1440,1920]){
   await a.setViewportSize({width,height:900});await a.waitForTimeout(80);
   const metrics=await a.evaluate(()=>{const shell=document.querySelector('.pc-shell').getBoundingClientRect(),hero=document.querySelector('.pc-hero').getBoundingClientRect(),host=document.querySelector('.lesson-hero-content').getBoundingClientRect(),qr=document.querySelector('.jl-page-qr-card').getBoundingClientRect();return {overflow:document.documentElement.scrollWidth-innerWidth,shellWidth:shell.width,heroWidth:hero.width,qrFits:qr.right<=host.right+1&&qr.bottom<=host.bottom+1,position:getComputedStyle(document.querySelector('.site-header')).position};});
   assert(metrics.overflow<=1,JSON.stringify({width,...metrics}));assert(metrics.shellWidth>=width*.98);assert(metrics.heroWidth>=width*.89);assert(metrics.qrFits);assert(!['fixed','sticky'].includes(metrics.position));
   if([390,820,1440].includes(width))await a.screenshot({path:output+'/writing-'+width+'.png',fullPage:true});
  }
  await a.setViewportSize({width:390,height:844});await a.locator('.jl-page-qr-open').click();
  const dialog=await a.locator('.jl-page-qr-dialog').boundingBox();assert(Math.abs(dialog.x+dialog.width/2-195)<2);await a.locator('.jl-page-qr-close').click();
  console.log('Responsive and QR passed');
  // Explicit conflict between tabs with same author; server copy is not silently overwritten.
  const a2=await setup('1');await a2.locator('#pc-part-0').waitFor();
  await a2.route('**/api/basic2/final-postcard/state',r=>r.abort('failed'));
  await a.locator('#pc-part-0').fill(text[0]+' We loved it.');await a.locator('#pc-save-button').click();await a.waitForFunction(()=>document.getElementById('pc-save').textContent.includes('saved on the server'));
  await a2.locator('#pc-part-0').fill(text[0]+' The beach was quiet.');await a2.locator('#pc-save-button').click();await a2.locator('#pc-conflict').waitFor({state:'visible'});await a2.locator('#pc-local').click();await a2.waitForFunction(()=>document.getElementById('pc-save').textContent.includes('saved on the server'));await a2.close();
  await a.locator('#pc-refresh').click();
  await a.waitForFunction(()=>document.getElementById('pc-part-0').value.endsWith('The beach was quiet.'));
  console.log('Conflicts passed');
  // Offline draft stays visible and is delivered on a retry.
  await a.route('**/api/basic2/final-postcard/draft',r=>r.abort('failed'));
  await a.locator('#pc-part-0').fill(text[0]+' The beach was peaceful.');await a.locator('#pc-save-button').click();await a.waitForFunction(()=>document.getElementById('pc-save').textContent.includes('fetch'));
  await a.unroute('**/api/basic2/final-postcard/draft');await a.locator('#pc-save-button').click();await a.waitForFunction(()=>document.getElementById('pc-save').textContent.includes('saved on the server'));
  console.log('Offline retry passed');
  // Expired token preserves writing and offers recovery.
  await a.route('**/api/basic2/final-postcard/draft',r=>r.fulfill({status:401,contentType:'application/json',body:'{"error":"invalid_token"}'}));
  await a.locator('#pc-part-0').fill(text[0]+' We enjoyed the beach.');await a.locator('#pc-save-button').click();await a.locator('#pc-reconnect').waitFor({state:'visible'});
  await a.unroute('**/api/basic2/final-postcard/draft');await a.evaluate(()=>window.dispatchEvent(new Event('jaralingua:auth-changed')));await a.waitForFunction(()=>document.getElementById('pc-save').textContent.includes('saved on the server'));
  assert((await api('1','state')).team.parts[0].text.endsWith('We enjoyed the beach.'));
  for(const p of [a]){await p.locator('#pc-refresh').click();await p.locator('#pc-ready').click();await p.waitForFunction(()=>document.getElementById('pc-delivery-status').textContent.includes('confirmed'));}
  // Lost delivery response: retry retrieves the same persisted receipt.
  let lost=false;
  await a.route('**/api/basic2/final-postcard/state',r=>r.abort('failed'));
  await a.route('**/api/basic2/final-postcard/submit',async r=>{if(!lost){lost=true;await r.fetch();await r.abort('failed');}else await r.continue();});
  await a.locator('#pc-submit').click();await a.waitForFunction(()=>document.getElementById('pc-submit').textContent.includes('Retry')||!document.getElementById('pc-receipt').hidden);
  if(await a.locator('#pc-submit').isVisible()){
   try {await a.locator('#pc-submit').click({timeout:3000});}
   catch(error){if(!await a.locator('#pc-receipt').isVisible())throw error;}
  }
  await a.locator('#pc-receipt').waitFor({state:'visible'});
  console.log('Lost-response receipt verified');
  await a.unroute('**/api/basic2/final-postcard/state');
  const receipt=(await api('1','state')).team.receiptId;assert(receipt.startsWith('B2FW-'));assert.equal((await api('2','state')).team,null);
  await teacher.locator('#pc-refresh').click();await teacher.locator('#pc-teams summary').click();
  const gradeForm=teacher.locator('#pc-teams form').first();for(const s of await gradeForm.locator('select').all())await s.selectOption('8');await gradeForm.locator('textarea').fill('Your message is clear. Use went instead of goed in past narratives.');await gradeForm.locator('button').click();await gradeForm.getByText(/Grade saved: 4.0/).waitFor();
  await a.locator('#pc-refresh').click();await a.getByText('Your grade: 4.0 / 5',{exact:true}).waitFor();assert.equal((await api('2','state')).team,null);
  console.log('Individual grades verified');
  }
  const real=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
  await real.route('https://accounts.google.com/**',r=>r.abort());
  const guest=await real.newPage();guest.on('pageerror',e=>errors.push(e.message));await guest.goto(base+route);await guest.waitForTimeout(1200);
  assert(await guest.locator('#pc-login:visible,.jaralingua-auth-nav .auth-trigger:visible').count()>=1);
  assert.equal(await guest.locator('.jaralingua-auth-nav .auth-trigger').evaluate(e=>getComputedStyle(e).color),'rgb(18, 51, 74)');
  assert(await guest.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
  await guest.screenshot({path:output+'/real-auth-mobile.png',fullPage:true});await real.close();
  assert.deepEqual(errors,[]);const success=process.argv.includes('--auth-only')?'PASS: actual sign-in integration, mobile overflow and readable sign-in contrast.':'PASS: responsive 320–1920, QR modal, individual writing and account isolation, stale tabs, offline save, expired auth recovery, lost-response receipt and private individual grades.';fs.writeFileSync(output+(process.argv.includes('--auth-only')?'/auth-result.txt':'/result.txt'),success);console.log(success);
 } finally {server.kill();await Promise.race([browser.close(),new Promise(resolve=>setTimeout(resolve,5000))]);}
})().then(()=>process.exit(0)).catch(e=>{console.error(e);process.exit(1);});
