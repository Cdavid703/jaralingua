// Actual shared local sign-in against disposable accounts; never writes production data.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {chromium,webkit}=require('C:/Users/USER/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const fixture=JSON.parse(fs.readFileSync('tmp/unit5-group-stories/session.json','utf8'));
const host='https://www.jaralingua.com',prefix='/api/intermediate2/group-stories/';
const pathname='/ingles/intermediate-2/speaking-unit-5-our-picture-stories.html';
(async()=>{
 const engine=process.env.WEBKIT?'webkit':'chrome',browser=await(process.env.WEBKIT?webkit:chromium).launch(process.env.WEBKIT?{headless:true}:{channel:'chrome',headless:true});
 try{
 const page=await browser.newPage({viewport:{width:Number(process.env.WIDTH)||390,height:900}}),errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 const posts=[],failed=new Map();let rejectAction='';
 await page.route(host+'/**',async route=>{
  const u=new URL(route.request().url()),p=u.pathname;
  if(p.startsWith('/api/')){
   if(!p.startsWith(prefix)&&p!=='/api/intermediate2/grades/login')return route.fulfill({status:401,json:{error:'QA isolation'}});
   if(p.startsWith(prefix)&&route.request().method()==='POST'){
    posts.push({action:p.split('/').at(-1),body:route.request().postDataJSON()});
    if(p===prefix+rejectAction){failed.set(rejectAction,posts.at(-1).body);rejectAction='';return route.fulfill({status:401,json:{error:'invalid_token',message:'Could not validate Google token.'}});}
   }
   const response=await route.fetch({url:fixture.base+p+u.search});return route.fulfill({response});
  }
  if(!process.env.PUBLIC_ASSETS&&(p===pathname||p.includes('english-intermediate2-group-stories.')))return route.fulfill({path:path.resolve('.'+p)});
  return route.continue();
 });
 await page.goto(host+pathname,{waitUntil:'networkidle'});
 async function login(who){
  if(!(await page.locator('[data-local-login-form]').isVisible()))await page.locator('[data-auth-toggle]').click();
  await page.locator('[data-local-login-form] input[name=email]').fill(who+'@stories.example');
  await page.locator('[data-local-login-form] input[name=password]').fill('QA-only-password');
  await page.locator('[data-local-login-form] button').click();
  await page.locator('#gsAccount').waitFor({state:'visible'});
 }
 async function signOut(){await page.locator('[data-auth-toggle]').click();await page.locator('[data-auth-signout]').click();await page.locator('#gsAccount').waitFor({state:'hidden'});}
 async function rejected(action,button,status){rejectAction=action;await page.locator(button).click();await page.waitForFunction(id=>document.getElementById(id).textContent.includes('session is no longer valid'),status);assert(!(await page.locator('#'+status).textContent()).includes('token'));}
 async function recover(dialog,who){
  const b=page.locator('#'+dialog+' [data-gs-reauth]');assert(await b.isVisible());assert(await b.evaluate(e=>{const r=e.getBoundingClientRect();return r.width>40&&r.height>=44&&r.left>=0&&r.right<=innerWidth&&r.top>=0&&r.bottom<=innerHeight&&e.contains(document.elementFromPoint(r.x+r.width/2,r.y+r.height/2))}));
  await b.click();await page.locator('[data-local-login-form]').waitFor({state:'visible'});await login(who);
 }
 await login('teacher');
 await page.locator('#gsName').fill('Session recovery '+engine+' '+Date.now());await page.locator('#gsCreate button').click();await page.locator('#gsRoom').waitFor({state:'visible'});
 const room=await page.locator('#gsSession').inputValue();
 await page.locator('[data-assign="1"]').click();await page.locator('#gsRoster input[value="9903"]').check();await page.locator('#gsRoster input[value="9904"]').check();
 await rejected('assign','#gsApply','gsAssignStatus');const count=posts.length;
 await page.screenshot({path:'tmp/unit5-stories-auth-fix/'+engine+'-assign-error.png'});
 await recover('gsAssign','teacher');await page.waitForFunction(()=>document.querySelector('#gsAssignStatus').textContent.startsWith('Session restored'));
 assert.equal(await page.locator('#gsRoster input:checked').count(),2);assert.equal(posts.length,count,'No automatic write after reauthentication');
 await page.locator('#gsApply').click();await page.locator('#gsAssign').waitFor({state:'hidden'});
 assert.equal(posts.at(-1).body.requestId,failed.get('assign').requestId,'Retry must retain its request ID');
 console.log(engine,'team recovery PASS');
 await page.locator('#gsFinalize').click();await page.locator('#gsStart').waitFor({state:'visible'});
 await signOut();await login('ana');await page.locator('#gsSession').selectOption(room);await page.locator('#gsOpenMyStory').click();await page.locator('#gsEditor').waitFor({state:'visible'});
 const story='Ana Test: She looks worried. Bea Test: Perhaps they can cheer up.';
 await page.locator('#gsText').fill(story);await page.locator('#gsPhrasal').fill('cheer up');await page.locator('#gsEveryone').check();
 await rejected('save','#gsDraft','gsSaveStatus');const beforeSave=posts.length;
 await page.screenshot({path:'tmp/unit5-stories-auth-fix/'+engine+'-editor-error.png'});
 await recover('gsEditor','ana');await page.waitForFunction(()=>document.querySelector('#gsSaveStatus').textContent.startsWith('Session restored'));
 assert.equal(await page.locator('#gsText').inputValue(),story);assert.equal(await page.locator('#gsPhrasal').inputValue(),'cheer up');assert(await page.locator('#gsEveryone').isChecked());assert.equal(posts.length,beforeSave);
 await page.locator('#gsDraft').click();await page.waitForFunction(()=>document.querySelector('#gsSaveStatus').textContent.startsWith('Draft saved'));
 assert.equal(posts.at(-1).body.requestId,failed.get('save').requestId);
 console.log(engine,'draft recovery PASS');
 await rejected('submit','#gsSend','gsSaveStatus');
 // A teammate can save during reauthentication: keep the old revision for conflict detection.
 const concurrent={...failed.get('submit'),requestId:'concurrent-'+Date.now(),story:'Bea Test: A teammate changed this while Ana signed in.'};
 const other=await page.request.post(fixture.base+prefix+'save',{headers:{Authorization:'Bearer '+fixture.tokens.bea,'X-Jaralingua-Auth-Provider':'local'},data:concurrent});assert.equal(other.status(),200);
 await recover('gsEditor','ana');await page.waitForFunction(()=>document.querySelector('#gsSaveStatus').textContent.startsWith('Session restored'));
 await page.locator('#gsSend').click();await page.locator('#gsConflict').waitFor({state:'visible'});assert.equal(await page.locator('#gsText').inputValue(),story);
 assert.equal(posts.at(-1).body.requestId,failed.get('submit').requestId);
 assert.match(await page.locator('#gsLatestText').textContent(),/teammate changed/);await page.locator('#gsKeepMine').click();await page.locator('#gsSend').click();await page.waitForFunction(()=>document.querySelector('#gsSaveStatus').textContent.startsWith('Submitted to teacher'));
 // A different account must never receive the previous account's unsent text.
 await page.locator('#gsText').fill('PRIVATE UNSENT RECOVERY TEXT');await rejected('save','#gsDraft','gsSaveStatus');await recover('gsEditor','bea');
 assert(await page.locator('#gsEditor').isHidden());assert.equal(await page.locator('#gsText').inputValue(),'');assert(!(await page.locator('body').textContent()).includes('PRIVATE UNSENT'));
 assert.equal(await page.locator('#gsSession').inputValue(),room);
 assert(await page.locator('#gsText').evaluate(e=>!!e.closest('[data-jaralingua-managed-draft]')),'Shared autosave must not own the team editor');
 assert(await page.evaluate(()=>![localStorage,sessionStorage].some(store=>Object.keys(store).some(key=>String(store.getItem(key)).includes('PRIVATE UNSENT RECOVERY TEXT')))),'Recovery text must remain memory-only');
 // Known expiry is detected before any request, without needing to wait for a server rejection.
 await page.locator('#gsSession').selectOption(room);await page.locator('#gsOpenMyStory').click();
 await page.evaluate(()=>{const get=window.JaraLinguaAuth.getUser;window.JaraLinguaAuth.getUser=()=>({...get(),exp:1});window.dispatchEvent(new Event('jaralingua:auth-changed'));});
 await page.waitForFunction(()=>document.querySelector('#gsStatus').textContent.includes('session is no longer valid'));
 assert(await page.locator('#gsSignIn').isVisible());
 assert.deepEqual(errors,[]);
 console.log(engine,'PASS: real sign-in recovery; team selection; draft/submit; same request IDs; no automatic sends; different-account privacy; preflight expiry; mobile recovery buttons.');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exit(1)});
