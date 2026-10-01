const {chromium,webkit}=require('C:/Users/USER/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const base=process.env.MAPLE_BASE_URL||'http://127.0.0.1:8046',qa=path.resolve(__dirname,'../qa/maple-cafe');fs.mkdirSync(qa,{recursive:true});
(async()=>{for(const [name,engine] of [['webkit',webkit],['chromium',chromium]]){
 const browser=await engine.launch({headless:true,...(name==='chromium'?{channel:'chrome'}:{})});
 const page=await browser.newPage({hasTouch:true}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.route('https://accounts.google.com/**',r=>r.fulfill({body:''}));
 await page.goto(base+'/ingles/basico-2/audio-listening-unit-6-maple-cafe.html',{waitUntil:'networkidle'});
 assert.equal(await page.locator('.maple-question').count(),10);assert(!await page.locator('#teacherTools').isVisible());
 assert(!await page.locator('.maple-focus details').getAttribute('open'));
 for(const [w,h] of [[360,800],[390,844],[768,1024],[820,1180],[1024,768],[1440,1000],[1920,1080]]){
  await page.setViewportSize({width:w,height:h});await page.evaluate(()=>scrollTo(0,0));await page.waitForTimeout(150);
  const issues=await page.evaluate(()=>{const bad=[],r=e=>e.getBoundingClientRect();if(document.documentElement.scrollWidth>innerWidth+1)bad.push('overflow');
   for(const e of document.querySelectorAll('.lesson-hero,.site-header'))if(['fixed','sticky'].includes(getComputedStyle(e).position))bad.push('fixed banner');
   if(r(document.querySelector('.maple-shell')).width<innerWidth*.95)bad.push('narrow shell');
   const qr=r(document.querySelector('.jl-page-qr-card'));for(const e of document.querySelectorAll('.lesson-hero-content h1,.hero-copy,.hero-actions')){const x=r(e);if(x.left<qr.right&&x.right>qr.left&&x.top<qr.bottom&&x.bottom>qr.top)bad.push('QR overlaps text');}
   for(const q of document.querySelectorAll('.maple-question')){const box=r(q),legend=r(q.querySelector('legend')),choices=r(q.querySelector('.maple-choices'));if(choices.top<legend.bottom-1||choices.right>box.right-10||choices.width<200)bad.push('collapsed question');for(const label of q.querySelectorAll('label')){const a=r(label),s=r(label.querySelector('span'));if(a.height<44||s.right>a.right-6||s.bottom>a.bottom-5)bad.push('label bounds');}}
   return bad;
  });assert.deepEqual(issues,[],name+' '+w);
  const columns=await page.locator('#mapleQuestions').evaluate(e=>getComputedStyle(e).gridTemplateColumns.split(' ').length);assert.equal(columns,w<=620?1:2);
  if([390,820,1440].includes(w)){await page.screenshot({path:path.join(qa,name+'-'+w+'-hero.png')});await page.locator('#quizTitle').scrollIntoViewIfNeeded();await page.screenshot({path:path.join(qa,name+'-'+w+'-questions.png')});}
 }
 await page.locator('.jl-page-qr-open').click();const box=await page.locator('.jl-page-qr-dialog').boundingBox();assert(Math.abs(box.x+box.width/2-960)<3);await page.locator('.jl-page-qr-close').click();
 const audio=page.locator('#mapleAudio');await audio.evaluate(a=>a.play());await page.waitForFunction(()=>document.querySelector('#mapleAudio').currentTime>0);
 assert(await audio.evaluate(a=>a.duration>10&&a.duration<=75));await page.locator('[data-speed="0.75"]').click();assert.equal(await audio.evaluate(a=>a.playbackRate),.75);await page.locator('[data-speed="1"]').click();assert.equal(await audio.evaluate(a=>a.playbackRate),1);await audio.evaluate(a=>a.pause());
 await page.setViewportSize({width:390,height:844});
 await page.locator('input[name="maple-q-0"][value="1"]').tap();await page.locator('input[name="maple-q-0"][value="2"]').tap();assert(await page.locator('input[name="maple-q-0"][value="2"]').isChecked());
 await page.locator('#mapleCheck').click();await page.locator('input[name="maple-q-0"][value="0"]').tap();assert.match(await page.locator('#quizScore').innerText(),/Not checked/);
 for(let i=1;i<10;i++)await page.locator('input[name="maple-q-'+i+'"][value="0"]').check();
 await page.locator('#mapleCheckBottom').click();assert.match(await page.locator('#quizScore').innerText(),/10 \/ 10/);await page.reload({waitUntil:'networkidle'});assert.match(await page.locator('#quizScore').innerText(),/10 \/ 10/);
 let previous='';for(let attempt=0;attempt<25;attempt++){
  await page.locator('#mapleReset').click();assert.equal(await page.locator('input:checked').count(),0);
  const keys=await page.locator('.maple-question').evaluateAll(cards=>cards.map(c=>[...c.querySelectorAll('input')].findIndex(e=>e.value==='0')));
  assert.deepEqual([0,1,2].map(n=>keys.filter(k=>k===n).length).sort(),[3,3,4]);assert(!keys.some((v,i)=>i>1&&v===keys[i-1]&&v===keys[i-2]));assert(!keys.slice(0,7).every((v,i)=>v===keys[i+3]));assert.notEqual(keys.join(''),previous);previous=keys.join('');
 }
 let role='student';await page.route('**/api/basic2/unit6-maple-cafe/transcript',r=>r.fulfill({status:role==='student'?403:200,contentType:'application/json',body:JSON.stringify(role==='student'?{error:'teacher_only'}:{title:'Synthetic teacher response',transcript:'Synthetic transcript for authorization UI test.'})}));
 const auth=async value=>page.evaluate(value=>{window.JaraLinguaAuth={getUser:()=>value?{credential:value,provider:'local',email:'qa@example.test'}:null};window.JaraLinguaCurrentUser=null;window.dispatchEvent(new Event('jaralingua:auth-changed'));},value);
 await auth('student-test');await page.waitForTimeout(200);assert(!await page.locator('#teacherTools').isVisible());
 for(const staff of ['teacher','admin']){role=staff;await auth(staff+'-test');await page.locator('#teacherTools').waitFor({state:'visible'});await page.locator('#transcriptToggle').click();assert(await page.locator('#teacherTranscript').isVisible());await auth(null);assert(!await page.locator('#teacherTools').isVisible());assert.equal(await page.locator('#transcriptText').innerText(),'');}
 await audio.evaluate(a=>a.dispatchEvent(new Event('error')));assert(await page.locator('#audioError').isVisible());await page.locator('#retryAudio').click();assert(!await page.locator('#audioError').isVisible());
 await page.goto(base+'/ingles/basico-2/practice-lab.html',{waitUntil:'networkidle'});assert(!await page.locator('#unit-6-folder').getAttribute('open'));await page.locator('#unit-6-folder summary').click();assert.equal(await page.locator('#unit-6-folder .course-section-card').count(),9);assert.equal(await page.locator('#unit-6-folder a[href="audio-listening-unit-6-maple-cafe.html"]').count(),1);
 await page.goto(base+'/ingles/basico-2/listening-library.html',{waitUntil:'networkidle'});assert.equal(await page.locator('#unit-6-listenings a[href="audio-listening-unit-6-maple-cafe.html"]').count(),1);
 assert.deepEqual(errors,[]);console.log('PASS '+name+': 7 viewports, QR, audio and speed, mutable touch choices, scoring/persistence, 25 balanced shuffles, staff-only UI, retry and both index links.');await browser.close();
}})().catch(e=>{console.error(e);process.exit(1)});
