// Student-facing discovery and shared submission with disposable accounts only.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const {chromium,webkit}=require('C:/Users/USER/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const fixture=JSON.parse(fs.readFileSync('tmp/unit5-group-stories/session.json','utf8'));
const host='https://www.jaralingua.com',prefix='/api/intermediate2/group-stories/',pathname='/ingles/intermediate-2/speaking-unit-5-our-picture-stories.html';
(async()=>{const engine=process.env.WEBKIT?'webkit':'chrome',browser=await(process.env.WEBKIT?webkit:chromium).launch(process.env.WEBKIT?{headless:true}:{channel:'chrome',headless:true});try{
 const probe=await browser.newPage();
 async function api(action,body,who='teacher'){
  const response=await probe.request.post(fixture.base+prefix+action,{headers:{Authorization:'Bearer '+fixture.tokens[who],'X-Jaralingua-Auth-Provider':'local'},data:{...body,requestId:crypto.randomUUID()}});assert.equal(response.status(),200,await response.text());return response.json();
 }
 const room=(await api('create',{name:'Automatic student workspace '+engine+' '+Date.now()})).sessionId;
 await api('assign',{sessionId:room,revision:0,assignments:[{picture:2,studentIds:['9903','9904']},{picture:5,studentIds:['9905']}]});
 const errors=[];
 async function student(who,width){
  const page=await browser.newPage({viewport:{width,height:900}});page.on('pageerror',e=>errors.push(e.message));
  await page.route(host+'/**',async r=>{const p=new URL(r.request().url());if(p.pathname.startsWith('/api/')){
   if(!p.pathname.startsWith(prefix)&&p.pathname!=='/api/intermediate2/grades/login')return r.fulfill({status:401,json:{error:'isolated QA'}});
   const response=await r.fetch({url:fixture.base+p.pathname+p.search});return r.fulfill({response});}
   if(!process.env.PUBLIC_ASSETS&&(p.pathname===pathname||p.pathname.includes('english-intermediate2-group-stories.')))return r.fulfill({path:path.resolve('.'+p.pathname)});return r.continue();});
  await page.goto(host+pathname,{waitUntil:'networkidle'});await page.locator('[data-auth-toggle]').click();await page.locator('[data-local-login-form] input[name=email]').fill(who+'@stories.example');await page.locator('[data-local-login-form] input[name=password]').fill('QA-only-password');await page.locator('[data-local-login-form] button').click();await page.locator('#gsAccount').waitFor({state:'visible'});return page;
 }
 const ana=await student('ana',390);
 // Existing older sessions may be present; an explicit empty selection returns to discovery.
 // Verify waiting on a fresh fixture, then automatic assignment discovery without choosing a class.
 if(!await ana.locator('#gsMyTeam').isVisible())assert.match(await ana.locator('#gsStatus').textContent(),/Waiting for your teacher/);
 await api('finalize',{sessionId:room,revision:1});
 await ana.waitForFunction(id=>document.querySelector('#gsSession').value===id,room,{timeout:22000});
 assert(await ana.locator('#gsOpenMyStory').isVisible());assert.match(await ana.locator('#gsMyTeamInfo').textContent(),/Picture 2/);
 const bea=await student('bea',768),leo=await student('leo',320);
 for(const p of [ana,bea,leo])assert.equal(await p.locator('#gsSession').inputValue(),room,'Assigned class opens without using the selector');
 assert.match(await bea.locator('#gsMyTeamInfo').textContent(),/Picture 2/);assert.match(await leo.locator('#gsMyTeamInfo').textContent(),/Picture 5/);
 assert(!(await leo.locator('#gsMyTeamInfo').textContent()).includes('Ana'));
 await ana.locator('#gsOpenMyStory').scrollIntoViewIfNeeded();assert(await ana.locator('#gsOpenMyStory').evaluate(e=>{const r=e.getBoundingClientRect();return r.width>200&&r.height>=44&&r.left>=0&&r.right<=innerWidth}));
 await ana.screenshot({path:'tmp/unit5-stories-student-access/'+engine+'-student-390.png'});
 await ana.locator('#gsOpenMyStory').click();await ana.locator('#gsEditor').waitFor({state:'visible'});
 const first='Ana Test: They look surprised. Bea Test: Perhaps they will cheer up.';
 await ana.locator('#gsText').fill(first);await ana.locator('#gsPhrasal').fill('cheer up');await ana.locator('#gsDraft').click();await ana.waitForFunction(()=>document.querySelector('#gsSaveStatus').textContent.startsWith('Draft saved'));
 await bea.locator('#gsOpenMyStory').click();await bea.locator('#gsEditor').waitFor({state:'visible'});assert.equal(await bea.locator('#gsText').inputValue(),first);
 await bea.locator('#gsText').fill(first+' Bea Test: The surprise is exciting.');await bea.locator('#gsEveryone').check();await bea.locator('#gsSend').click();await bea.waitForFunction(()=>document.querySelector('#gsSaveStatus').textContent.startsWith('Submitted to teacher'));
 assert.match(await bea.locator('#gsSaveStatus').textContent(),/Receipt/);
 await ana.locator('[data-close="gsEditor"]').click();await ana.locator('#gsOpenMyStory').click();await ana.locator('#gsEditor').waitFor({state:'visible'});assert.match(await ana.locator('#gsText').inputValue(),/surprise is exciting/);assert.match(await ana.locator('#gsSaveStatus').textContent(),/Submitted to teacher/);
 await leo.locator('#gsOpenMyStory').click();await leo.locator('#gsEditor').waitFor({state:'visible'});assert.equal(await leo.locator('#gsText').inputValue(),'');
 assert.deepEqual(errors,[]);console.log(engine,'PASS: automatic class selection, live discovery after finalize, correct assigned picture, any teammate edits/submits shared work, receipt visible to all members, other-team privacy, mobile CTA.');
}finally{await browser.close()}})().catch(e=>{console.error(e);process.exit(1)});
