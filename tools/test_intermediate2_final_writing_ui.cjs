const { chromium, webkit } = require('C:/Users/USER/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const base = process.env.FINAL_WRITING_TEST_BASE || 'http://127.0.0.1:8879';
const pagePath='/ingles/intermediate-2/intermediate-course-2-final-writing-task.html';
const out='tmp/ie2-final-writing/screenshots';fs.mkdirSync(out,{recursive:true});
const {execFileSync}=require('node:child_process');
const exam=JSON.parse(execFileSync('python',['-c','import json; from server.progress_api import default_intermediate2_final_writing_bundle; print(json.dumps(default_intermediate2_final_writing_bundle()["exam"]))'],{encoding:'utf8'}));
(async()=>{
 const browser=await chromium.launch({channel:'chrome',headless:true});
 for(const width of [375,768,1024,1440]){
  for(const role of ['student','teacher']){
   const ctx=await browser.newContext({viewport:{width,height:900}});const page=await ctx.newPage();let saves=0,submits=0,attempt=null,submission=null;
   await ctx.addInitScript(({role})=>localStorage.setItem('jaralingua_local_user',JSON.stringify({credential:'isolated-fixture',name:'Fixture '+role,email:role+'@example.com',exp:9999999999})),{role});
   await ctx.route('https://accounts.google.com/**',r=>r.abort());
   await ctx.route('**/api/**',async route=>{
    const path=new URL(route.request().url()).pathname,method=route.request().method();let result={};
    if(path.endsWith('/final-writing/state')) result={role,state:{isOpen:true},exam:role==='teacher'?exam:null,student:role==='student'?{id:'S1',fullName:'Fixture Student'}:null,canStart:!attempt,canResume:!!attempt,attempt,submission};
    else if(path.endsWith('/final-writing/start')){attempt=attempt||{attemptId:'I2FW-TEST',studentId:'S1',studentName:'Fixture Student',expiresAt:new Date(Date.now()+3000000).toISOString(),draft:{}};result={attempt,exam};}
    else if(path.endsWith('/final-writing/draft')){saves++;attempt.draft=route.request().postDataJSON();result={attempt};}
    else if(path.endsWith('/final-writing/submit')){submits++;submission={...route.request().postDataJSON(),studentId:'S1',studentName:'Fixture Student',receiptId:'I2FW-RECEIPT',status:'pending_teacher_review',wordCount:25};result={submission};}
    else if(path.endsWith('/final-writing/submissions'))result={health:{counts:{total:1},students:[]},submissions:[],rubricCriteria:[],sourceRubric:['CONTENT: Original document criterion.']};
    await route.fulfill({status:200,contentType:'application/json',body:JSON.stringify(result)});
   });
   page.on('dialog',d=>d.accept());
   const errors=[];page.on('pageerror',e=>errors.push(e.message));
   await page.goto(base+pagePath,{waitUntil:'networkidle'});
   await page.locator('.jl-page-qr-open').click();assert.equal(await page.locator('#jlPageQrDialog').evaluate(n=>n.open),true);await page.locator('.jl-page-qr-close').click();
   if(role==='teacher') {await page.locator('#previewWritingButton').click();assert.equal(await page.locator('#submitButton').isDisabled(),true);}
   else {await page.locator('#integrityCheck').check();await page.locator('#beginButton').click();assert.equal(await page.locator('#backToAdminButton').isVisible(),false);}
   await page.locator('#taskPrompt').waitFor({state:'visible'});
   assert.equal(await page.locator('#taskInstructions li').count(),7);
   assert.match(await page.locator('#taskInstructions').innerText(),/200 words/);
   assert.equal(await page.locator('#sourceRubricPanel').isVisible(),false);
   const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1);assert.equal(overflow,false,`${width} ${role} overflow`);
   const missing=await page.locator('img').evaluateAll(ns=>ns.filter(n=>!n.complete||!n.naturalWidth).map(n=>n.src));assert.deepEqual(missing,[]);
   await page.screenshot({path:`${out}/${width}-${role}.png`,fullPage:true});
   await page.locator('#emailBody').fill('Hi Sam, I am nervous about meeting the family. First, I will choose comfortable clothes. I hope we have a good time. See you soon!');
   await page.locator('#emailSubject').fill('First Impression');
   if(role==='student'){
    await page.waitForTimeout(1400);assert.ok(saves>0);await page.locator('#submitButton').click();await page.locator('#submittedPanel').waitFor({state:'visible'});assert.equal(submits,1);assert.match(await page.locator('#submittedContent').innerText(),/I2FW-RECEIPT/);
   } else {await page.waitForTimeout(1400);assert.equal(saves,0);assert.equal(submits,0);}
   assert.deepEqual(errors,[]);await ctx.close();console.log('PASS',width,role);
  }
 }
 await browser.close();
 const safari=await webkit.launch({headless:true});const page=await safari.newPage({viewport:{width:390,height:844}});
 await page.goto(base+pagePath,{waitUntil:'networkidle'});await page.locator('.jl-page-qr-open').click();assert.equal(await page.locator('#jlPageQrDialog').evaluate(n=>n.open),true);await safari.close();console.log('PASS WebKit mobile QR');
})().catch(e=>{console.error(e);process.exit(1)});
