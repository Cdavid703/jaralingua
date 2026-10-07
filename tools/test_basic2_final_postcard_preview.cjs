const assert=require('node:assert/strict');
const fs=require('node:fs');
const {spawn}=require('node:child_process');
const {chromium}=require('playwright');
const base='http://127.0.0.1:8798',path='/ingles/basico-2/basic-course-2-final-writing-task.html';
(async()=>{
 const server=spawn(process.env.POSTCARD_QA_PYTHON || 'python3',['-B','tools/test_basic2_final_postcard.py','--serve','8798'],{windowsHide:true,stdio:['ignore','pipe','pipe']});
 process.on('exit',()=>server.kill());
 await new Promise((resolve,reject)=>{server.stdout.once('data',resolve);server.once('error',reject);});
 const browser=await chromium.launch({headless:true});
 let writes=0;const errors=[];
 fs.mkdirSync('tmp/basic2-final-postcard',{recursive:true});
 try{
  for(const role of ['teacher','admin','student']){
   const context=await browser.newContext({viewport:{width:390,height:844}});context.setDefaultTimeout(10000);
   await context.route('**/assets/js/google-auth.js*',r=>r.fulfill({contentType:'application/javascript',body:`window.JaraLinguaAuth={getUser:()=>window.qaLoggedOut?null:({email:'${role}@test.invalid',credential:'qa-${role}'}),openPanel:()=>{}};`}));
   await context.route('https://accounts.google.com/**',r=>r.abort());
   await context.route('**/api/basic2/final-postcard/**',r=>{
    if(r.request().method()==='POST'){writes++;return r.fulfill({status:500,contentType:'application/json',body:'{}'});}
    return r.fulfill({contentType:'application/json',body:JSON.stringify({role,isOpen:false,teams:[],roster:[],student:role==='student'?{id:'student',fullName:'QA Student'}:null,team:null,pictures:{coast:'/assets/img/english-basic-2/yesterday-pictures/beach.png',town:'/assets/img/english-basic-2/exams/midterm-writing-city-weather.png',holiday:'/assets/img/english-basic-2/unit-5-my-holidays-hero.png'},rubric:{content:'Content'}})});
   });
   const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));await page.goto(base+path);
   if(role==='student'){
    await page.waitForFunction(()=>document.getElementById('pc-status').textContent.includes('closed'));
    assert(!await page.locator('#pc-preview').isVisible());await page.evaluate(()=>document.getElementById('pc-preview').click());assert(!await page.locator('#pc-preview-controls').isVisible());
   }else{
    await page.locator('#pc-admin').waitFor({state:'visible'});
    const storageBefore=await page.evaluate(()=>JSON.stringify(localStorage));
    await page.locator('#pc-preview').click();await page.locator('#pc-part-0').waitFor();
    assert.match(await page.locator('#pc-status').textContent(),/remains closed/);
    assert.equal(await page.locator('#pc-parts textarea').count(),3);
    assert.match(await page.locator('#pc-time').textContent(),/timer paused/);
    await page.locator('#pc-part-0').fill('Last year we went to the coast.');await page.locator('#pc-save-button').click();
    assert.match(await page.locator('#pc-save').textContent(),/no real draft/);
    await page.locator('#pc-part-1').fill('We visited a market and ate fish.');
    await page.locator('#pc-part-2').fill('Finally we returned home.');
    assert.match(await page.locator('#pc-preview-text').textContent(),/Last year.*market.*returned/s);
    await page.locator('#pc-picture').selectOption('town');assert.match(await page.locator('#pc-preview-image').getAttribute('src'),/city-weather/);
    await page.locator('#pc-ready').click();await page.locator('#pc-submit').click();assert.match(await page.locator('#pc-delivery-status').textContent(),/No exam was sent/);
    assert.equal(await page.locator('#pc-part-0').inputValue(),'Last year we went to the coast.');
    for(const width of [320,820,1440]){await page.setViewportSize({width,height:900});assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));}
    if(role==='teacher')await page.screenshot({path:'tmp/basic2-final-postcard/teacher-preview.png',fullPage:true});
    assert.equal(await page.evaluate(()=>JSON.stringify(localStorage)),storageBefore);
    await page.locator('#pc-preview-exit').click();assert(await page.locator('#pc-admin').isVisible());assert.match(await page.locator('#pc-status').textContent(),/Closed.*0 submissions/);
    await page.locator('#pc-preview').click();assert.equal(await page.locator('#pc-part-0').inputValue(),'');
    await page.evaluate(()=>{window.qaLoggedOut=true;window.dispatchEvent(new Event('jaralingua:auth-changed'));});
    assert(!await page.locator('#pc-preview-controls').isVisible());assert(!await page.locator('#pc-admin').isVisible());
   }
   await context.close();
  }
  assert.equal(writes,0);assert.deepEqual(errors,[]);
  console.log('PASS: teacher/admin preview while closed, complete individual writing, editing/count/pictures, simulated buttons, no POST or storage, no student access, responsive layout and logout reset.');
 }finally{server.kill();await browser.close();}
})().then(()=>process.exit(0)).catch(e=>{console.error(e);process.exit(1);});
