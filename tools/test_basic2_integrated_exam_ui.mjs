import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
const {chromium}=require('C:/Users/USER/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const qa='tmp/basic2-integrated-qa',session=JSON.parse(fs.readFileSync(qa+'/session.json','utf8'));
const route='/ingles/basico-2/basic-course-2-integrated-task.html';
const browser=await chromium.launch({channel:'chrome',headless:true});
const page=await browser.newPage({viewport:{width:390,height:844}});
const errors=[];page.on('pageerror',error=>errors.push(error.message));page.on('dialog',dialog=>dialog.accept());
let dropSubmit=false;
await page.route('**/assets/js/google-auth.js*',r=>r.fulfill({contentType:'application/javascript',body:'window.JaraLinguaAuth={getUser:()=>JSON.parse(sessionStorage.getItem("qaExamUser")||"null"),openPanel:()=>{}};'}));
await page.route('https://accounts.google.com/**',r=>r.fulfill({body:''}));
await page.route('**/api/basic2/integrated-task/**',async r=>{
 const url=new URL(r.request().url()),response=await r.fetch({url:session.base+url.pathname+url.search});
 if(dropSubmit&&url.pathname.endsWith('/submit')){dropSubmit=false;await r.abort('failed');return;}
 await r.fulfill({response});
});
const api=async(key,action,payload)=>{
 const response=await fetch(session.base+'/api/basic2/integrated-task/'+action,{method:payload?'POST':'GET',headers:{Authorization:'Bearer '+session.tokens[key],'X-Jaralingua-Auth-Provider':'local','Content-Type':'application/json'},...(payload?{body:JSON.stringify(payload)}:{})});
 const data=await response.json();assert.equal(response.status,200,JSON.stringify(data));return data;
};
const sign=async key=>{
 await page.evaluate(user=>{sessionStorage.setItem('qaExamUser',JSON.stringify(user));window.dispatchEvent(new Event('jaralingua:auth-changed'));},key?{credential:session.tokens[key],provider:'local',email:key+'@exam.example',name:key}:null);
};
const visible=selector=>page.locator(selector).waitFor({state:'visible'});
const waitDraft=async text=>{for(let n=0;n<40;n++){if((await api('ana','state')).attempt.writing===text.trim())return;await page.waitForTimeout(150);}throw Error('Draft not saved');};
const article='Our community needs safer and more reliable transport. Many people cannot reach their workplaces on time. In my opinion, the town should improve the buses and make walking safer. We could add better lighting near the bus stops. We could also ask local employers to offer flexible working hours. I believe that improving bus services is the most effective solution because it helps students, workers and older people. For example, a regular morning bus would let my neighbors reach their appointments without paying for a taxi. The town should listen to residents before deciding which routes to change. These solutions would make daily life easier and support local businesses. Everyone deserves a safe journey, and working together can help our community become a better place to live and study every day.';
try{
 await page.goto('http://127.0.0.1:8025'+route);
 await visible('#ix-login');assert.equal(await page.locator('.ix-question').count(),0);
 await sign('ana');await page.waitForFunction(()=>document.getElementById('ix-status').textContent.includes('closed'));
 assert.equal(await page.locator('#ix-ready').isVisible(),false);
 await page.screenshot({path:qa+'/closed-mobile.jpg',type:'jpeg',quality:80,fullPage:true});
 await sign('teacher');await visible('#ix-admin');
 await page.locator('#ix-admin-transcript').click();await visible('#ix-transcript-dialog');
 assert((await page.locator('#ix-transcript-content').textContent()).length>0);
 await page.locator('#ix-transcript-close').click();
 await page.locator('#ix-preview').click();await visible('#ix-exam');
 assert.equal(await page.locator('.ix-question').count(),10);
 assert.equal(await page.locator('#ix-submit').isVisible(),true);
 assert.equal(await page.locator('#ix-submit').isDisabled(),false);
 await page.locator('#ix-submit').click();
 assert.match(await page.locator('#ix-submit-status').textContent(),/Teacher preview/);
 await page.locator('#ix-transcript').click();await visible('#ix-transcript-dialog');await page.locator('#ix-transcript-close').click();
 await page.locator('[data-ix-rate="0.75"]').click();
 await page.locator('#ix-play').click();await page.waitForFunction(()=>document.getElementById('ix-audio').readyState>=2);
 assert.equal(await page.locator('#ix-audio').evaluate(a=>a.playbackRate),0.75);
 await page.locator('[data-ix-rate="1"]').click();
 assert.equal(await page.locator('#ix-audio').evaluate(a=>a.playbackRate),1);
 await page.locator('#ix-back').click();await visible('#ix-admin');
 await page.locator('#ix-open').click();await page.waitForFunction(()=>document.getElementById('ix-admin-status').textContent.startsWith('Open'));
 await sign('ana');await visible('#ix-ready');await page.locator('#ix-course').fill('QA-Friday');await page.locator('#ix-start').click();await visible('#ix-exam');
 assert.equal(await page.locator('#ix-transcript').isVisible(),false);
 assert.equal(await page.locator('#ix-transcript-content').textContent(),'');
 await page.locator('.ix-submit-shortcut').click();
 await page.locator('#ix-submit').waitFor({state:'visible'});
 for(let i=1;i<=10;i++)await page.locator('input[name="ix-q'+i+'"][value="'+((i-1)%4)+'"]').check();
 // Repeated mobile answer changes must persist, including after autosave.
 for(const value of ['1','3','2','0']){
  await page.locator('input[name="ix-q1"][value="'+value+'"]').check();
  await page.waitForTimeout(1100);
  assert.equal(await page.locator('input[name="ix-q1"]:checked').inputValue(),value);
 }
 for(let play=1;play<=5;play++){
  await page.locator('#ix-play').click();
  await page.waitForFunction(()=>!document.getElementById('ix-play').disabled&&!document.getElementById('ix-audio').paused&&document.getElementById('ix-audio').readyState>=2);
  await page.locator('#ix-audio').evaluate(async a=>{a.playbackRate=16;await a.play();});
  try{await page.waitForFunction(()=>document.getElementById('ix-audio').ended,null,{timeout:10000});}
  catch(error){console.log('audio state',play,await page.locator('#ix-audio').evaluate(a=>({time:a.currentTime,duration:a.duration,paused:a.paused,ended:a.ended,ready:a.readyState,error:a.error?.message})));throw error;}
 }
 assert.equal(await page.locator('#ix-play').isDisabled(),false);
 await page.locator('#ix-writing-start').click();await page.locator('#ix-writing').fill(article);await waitDraft(article);
 await page.reload();await visible('#ix-exam');assert.equal(await page.locator('#ix-writing').inputValue(),article);
 assert.equal(await page.locator('input:checked').count(),10);assert.equal(await page.locator('#ix-play').isDisabled(),false);
 // An outdated tab must not silently overwrite the newer saved draft.
 let current=(await api('ana','state')).attempt;
 await api('ana','draft',{attemptId:current.id,revision:current.revision,answers:current.answers,writing:article+' Remote revision.',courseCode:current.courseCode});
 const own=article+' My local revision.';await page.locator('#ix-writing').fill(own);await visible('#ix-conflict');
 await page.locator('#ix-use-local').click();await waitDraft(own);
 current=(await api('ana','state')).attempt;
 const remote=article+' Final saved version.';
 await api('ana','draft',{attemptId:current.id,revision:current.revision,answers:current.answers,writing:remote,courseCode:current.courseCode});
 await page.locator('#ix-writing').fill(article+' Another edit.');await visible('#ix-conflict');await page.locator('#ix-use-server').click();
 assert.equal(await page.locator('#ix-writing').inputValue(),remote);
 // A network failure leaves a recoverable device copy.
 await page.route('**/api/basic2/integrated-task/draft',r=>r.abort('failed'));
 const offline=article+' Recovered after a connection problem.';
 await page.locator('#ix-writing').fill(offline);
 await page.waitForFunction(()=>document.getElementById('ix-save-status').textContent.includes('device'));
 await page.unroute('**/api/basic2/integrated-task/draft');
 await page.reload();await visible('#ix-exam');await waitDraft(offline);
 for(const width of [390,820,1440]){
  await page.setViewportSize({width,height:900});
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'Overflow '+width);
  await page.locator('#ix-submit').scrollIntoViewIfNeeded();
  const b=await page.locator('#ix-submit').boundingBox();assert(b.height>=64&&b.width>=width-100);
  await page.screenshot({path:qa+'/submit-'+width+'.jpg',type:'jpeg',quality:80});
 }
 dropSubmit=true;await page.locator('#ix-submit').click();
 await page.waitForFunction(()=>document.getElementById('ix-submit-status').textContent.includes('Retry'));
 assert.equal(await page.locator('#ix-writing').isDisabled(),true);
 await page.locator('#ix-submit').click();await visible('#ix-receipt');
 const receipt=await page.locator('#ix-receipt-summary').textContent();assert.match(receipt,/B2IT-/);
 await page.reload();await visible('#ix-receipt');assert.equal(await page.locator('#ix-receipt-summary').textContent(),receipt);
 await sign('teacher');await visible('#ix-admin');
 const review=page.locator('.ix-review').filter({hasText:'Ana Test'});
 await review.locator('summary').click();
 assert.match(await review.locator('pre').textContent(),/Recovered after a connection problem/);
 for(const select of await review.locator('select').all())await select.selectOption('4');
 await review.locator('textarea').fill('Clear suggestions and supporting reasons.');
 await review.getByRole('button',{name:'Save grade to Grades'}).click();
 await page.waitForFunction(()=>document.getElementById('ix-monitor').textContent.includes('Graded: 4.50'));
 await page.locator('#ix-close').click();await page.waitForFunction(()=>document.getElementById('ix-admin-status').textContent.startsWith('Closed'));
 await sign('ana');await visible('#ix-receipt');assert.match(await page.locator('#ix-result').textContent(),/4.50/);
 await sign(null);await visible('#ix-login');
 assert.equal(await page.locator('#ix-private-materials').textContent(),'');assert.equal(await page.locator('.ix-question').count(),0);
 assert.equal(await page.locator('#ix-writing').inputValue(),'');assert.deepEqual(errors,[]);
 console.log('PASS: closed student view, teacher preview, unlimited audio replay and editable mobile answers, timer start, draft reload/conflict/offline recovery, large responsive submit, lost-response retry, receipt, grading and logout.');
}finally{await browser.close();}
