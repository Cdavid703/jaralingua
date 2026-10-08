'use strict';
const assert=require('node:assert/strict'),{chromium}=require('playwright'),{spawn}=require('node:child_process');
const base=process.env.ORAL_QA_URL||'http://127.0.0.1:8816',path='/ingles/basico-2/basic-course-2-final-oral-task.html';
const errors=[];
async function setup(browser,who){
 const context=await browser.newContext({viewport:{width:1366,height:900}});
 await context.route('**/assets/js/google-auth.js*',r=>r.fulfill({contentType:'application/javascript',body:`window.qaUser={credential:'qa-${who}',email:'${who}@qa.invalid',provider:'google'};window.JaraLinguaAuth={getUser:()=>window.qaUser,openPanel:()=>{}};`}));
 await context.route('**/ingles/basico-2/*.html*',async route=>{const response=await route.fetch();await route.fulfill({response,headers:{...response.headers(),'content-security-policy':"img-src 'self' data: https://accounts.google.com https://*.googleusercontent.com"}});});
 const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));await page.goto(base+path,{waitUntil:'load'});return {page,context};
}
const state=async(page)=>page.evaluate(async()=>{const r=await fetch('/api/basic2/final-oral/state',{headers:{Authorization:'Bearer '+qaUser.credential}});return r.json();});
(async()=>{let server;if(!process.env.ORAL_QA_URL){server=spawn(process.env.PYTHON_PATH||'python3',['-B','tools/test_basic2_oral_exam.py','--serve','8816']);await new Promise((resolve,reject)=>{server.stdout.on('data',d=>{if(d.toString().includes('Synthetic oral QA server'))resolve();});server.stderr.on('data',d=>reject(Error(d.toString())));server.on('exit',code=>reject(Error('QA server exited '+code)));});}
const browser=await chromium.launch({headless:true,executablePath:process.env.BROWSER_PATH||'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'});try{
 const a=await setup(browser,'1'),b=await setup(browser,'2'),teacher=await setup(browser,'teacher');
 await a.page.waitForFunction(()=>document.querySelectorAll('#ot-partner option').length>1);
 assert.ok(!/César|Santiago|Gabriela/.test(await a.page.locator('#ot-partner').textContent()));
 const sam=await a.page.locator('#ot-partner option').evaluateAll(es=>es.find(e=>e.textContent==='Sam Example').value);
 await a.page.locator('#ot-partner').selectOption(sam);await a.page.locator('#ot-invite').click();await a.page.locator('#ot-plan-form').waitFor();
 await b.page.locator('#ot-refresh').click();await b.page.locator('#ot-plan-form').waitFor();
 assert.match(await b.page.locator('#ot-my-pair').textContent(),/Pair registered/);
 const own=(await state(a.page)).myKey;
 await a.page.locator('#ot-plan-image').selectOption('cartagena');await a.page.locator('#ot-plan-role').selectOption(own);await a.page.locator('#ot-plan-decision').fill('I choose Cartagena because I like the sea.');
 await a.page.locator('#ot-plan-save').click();await a.page.waitForFunction(()=>document.getElementById('ot-plan-status').textContent.startsWith('Saved for both'));
 await b.page.locator('#ot-refresh').click();await b.page.waitForFunction(()=>document.getElementById('ot-plan-decision').value.includes('Cartagena'));
 assert.equal(await a.page.locator('.ot-review').count(),0);
 const as=await state(a.page);assert.ok(!('rubric' in as)&&!('reviews' in as.team));
 // Failed saves survive reload; the student explicitly resolves a newer partner plan.
 await a.context.route('**/api/basic2/final-oral/plan',r=>r.abort('failed'));
 await a.page.locator('#ot-plan-decision').fill('Our local draft survives a connection failure.');
 await a.page.locator('#ot-plan-save').click();await a.page.waitForFunction(()=>!document.getElementById('ot-plan-save').disabled);
 await a.page.reload();await a.page.waitForFunction(()=>document.getElementById('ot-plan-status')?.textContent.includes('Recovered'));
 assert.equal(await a.page.locator('#ot-plan-decision').inputValue(),'Our local draft survives a connection failure.');
 await a.context.unroute('**/api/basic2/final-oral/plan');
 await b.page.locator('#ot-plan-decision').fill('I choose Paris because I like museums.');await b.page.locator('#ot-plan-save').click();
 await b.page.waitForFunction(()=>document.getElementById('ot-plan-status').textContent.startsWith('Saved for both'));
 await a.page.locator('#ot-plan-save').click();await a.page.locator('#ot-plan-reload:visible').waitFor();
 assert.equal((await state(a.page)).team.decision,'I choose Paris because I like museums.');
 await a.page.locator('#ot-plan-reload').click();await a.page.waitForFunction(()=>document.getElementById('ot-plan-decision').value.includes('Paris'));
 // Lose the response after a real upload succeeded; retry must not duplicate the file.
 await a.context.route('**/api/basic2/final-oral/upload',async r=>{await r.fetch();await r.abort('failed');});
 await a.page.locator('.ot-upload').setInputFiles('assets/img/english-basic-2/final-oral-travel/hero.webp');await a.page.locator('.ot-upload-button').click();
 await a.page.waitForFunction(()=>document.querySelector('.ot-upload-status').textContent.includes('retry the same file'));
 await a.context.unroute('**/api/basic2/final-oral/upload');await a.page.locator('.ot-upload-button').click();
 await a.page.waitForFunction(()=>document.querySelector('.ot-upload-status').textContent.includes('File saved'),{timeout:30000});
 assert.equal((await state(a.page)).team.files.length,1);
 await teacher.page.locator('#ot-refresh').click();await teacher.page.locator('#ot-teacher-select').selectOption(as.team.id);
 await teacher.page.locator('.ot-review').first().waitFor();
 const review=teacher.page.locator('.ot-review').first();
 for(const select of await review.locator('[data-criterion]').all())await select.selectOption('8');
 await review.locator('textarea').fill('Clear interaction. Continue practising final sounds.');
 await review.locator('button[type="submit"]').click();await teacher.page.waitForFunction(()=>document.querySelector('.ot-review-status').textContent.includes('draft saved'));
 assert.match(await review.locator('.ot-grade-total').textContent(),/40 \/ 50/);
 await review.locator('.ot-publish').click();await teacher.page.waitForFunction(()=>document.querySelector('.ot-review-status').textContent.includes('Published to Grades'));
 const ts=await state(teacher.page);assert.equal(ts.teams[0].reviews[own].published.grade,4);assert.ok(!ts.teams[0].reviews[sam]?.published);
 const popupPromise=teacher.page.waitForEvent('popup');await teacher.page.locator('#ot-teacher-project').click();const popup=await popupPromise;
 await popup.locator('#op-image:visible').waitFor();assert.equal(await popup.locator('.ot-review').count(),0);assert.ok(!/Pronunciation|rubric|40 \/ 50/.test(await popup.locator('body').textContent()));
 await popup.locator('#op-source').selectOption('1');await popup.waitForFunction(()=>document.querySelector('#op-image').src.startsWith('data:image/')&&!document.querySelector('#op-image').hidden);
 await popup.evaluate(()=>{window.qaUser=null;window.dispatchEvent(new Event('jaralingua:auth-changed'));});assert.ok(!(await popup.locator('#op-image').isVisible()));
 await teacher.page.locator('#ot-preview').click();const requests=[];teacher.page.on('request',r=>{if(r.method()==='POST')requests.push(r.url());});
 await teacher.page.locator('#ot-plan-decision').fill('Preview choice.');await teacher.page.locator('#ot-plan-save').click();await teacher.page.waitForTimeout(1100);assert.equal(requests.length,0);await teacher.page.locator('#ot-exit-preview').click();
 for(const [width,height] of [[390,844],[844,390],[820,1180],[1180,820],[1366,900],[1920,1080]]){
  await teacher.page.setViewportSize({width,height});assert.ok(await teacher.page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'teacher viewport '+width);
  await b.page.setViewportSize({width,height});assert.ok(await b.page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'student viewport '+width);
 }
 await teacher.page.setViewportSize({width:1366,height:900});await teacher.page.locator('#ot-workspace').scrollIntoViewIfNeeded();await teacher.page.screenshot({path:'/tmp/basic2-oral-teacher.png',fullPage:false});
 await b.page.setViewportSize({width:390,height:844});await b.page.locator('#ot-workspace').scrollIntoViewIfNeeded();await b.page.screenshot({path:'/tmp/basic2-oral-student-mobile.png',fullPage:false});
 await b.page.evaluate(()=>{window.qaUser=null;window.dispatchEvent(new Event('jaralingua:auth-changed'));});assert.ok(!(await b.page.locator('#ot-student').isVisible()));assert.equal(await b.page.locator('#ot-my-pair').textContent(),'');
 const excluded=await setup(browser,'7');await excluded.page.waitForFunction(()=>document.getElementById('ot-status').textContent.includes('not registered'));assert.ok(!(await excluded.page.locator('#ot-student').isVisible()));
 assert.deepEqual(errors,[]);console.log('PASS: two-account immediate registration, exclusions, shared plan, image upload, private individual rubric, grade publication, separate projector, logout, teacher preview without writes and responsive workspaces.');
}finally{await browser.close();server?.kill();}})().catch(e=>{console.error(e);process.exit(1);});
