const {chromium}=require('C:/Users/USER/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),assert=require('node:assert/strict');
const root=process.cwd(),route='/ingles/basico-2/pronunciation-unit-4-past-verbs-step-by-step.html';
const data=JSON.parse(fs.readFileSync('assets/data/basic2-unit4-past-verbs-pronunciation.json','utf8'));
assert.equal(data.stages.length,39);assert.equal(new Set(data.stages.map(s=>s.id)).size,39);
assert.ok(data.groups[0].rule.includes('SH (/ʃ/)')&&data.groups[0].rule.includes('CH (/tʃ/)'));
assert.equal(data.groups[0].soundKey.length,6);assert.ok(data.groups.every(g=>g.soundName&&g.soundKey.length));
assert.equal(data.groups[1].endingExamples.length,6);
const overview=fs.readFileSync('ingles/basico-2/unit-4-busy-lives.html','utf8');
for(const entry of data.groups[1].endingExamples){assert.ok(overview.includes(entry.label));assert.ok(overview.includes(entry.note));}
for(const g of data.groups){const s=data.stages.filter(s=>s.group===g.id);assert.equal(s.length,13);assert.ok(s.slice(0,10).every(s=>s.kind==='word'));assert.ok(s.slice(10).every(s=>s.kind==='sentence'));}
const urls=[...new Set([...data.stages.map(s=>s.audio),...Object.values(data.wordAudio)])];
for(const u of urls)assert.ok(fs.statSync(path.join(root,u)).size>1000,u);
assert.equal(data.newAudio.length,31);
const server=http.createServer((req,res)=>{const p=path.resolve(root,'.'+decodeURIComponent(new URL(req.url,'http://localhost').pathname));if(!p.startsWith(root+path.sep)){res.writeHead(403).end();return;}fs.readFile(p,(e,b)=>{if(e){res.writeHead(404).end();return;}res.writeHead(200,{'Content-Type':{'.html':'text/html','.js':'text/javascript','.json':'application/json','.css':'text/css','.png':'image/png','.mp3':'audio/mpeg','.svg':'image/svg+xml'}[path.extname(p)]||'application/octet-stream'});res.end(b);});});
(async()=>{
 await new Promise(r=>server.listen(0,'127.0.0.1',r));const base=process.env.PAST_VERBS_TEST_BASE_URL||'http://127.0.0.1:'+server.address().port;
 const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'});
 try{
  const page=await browser.newPage({viewport:{width:1440,height:900}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.route('**/google-auth.js*',r=>r.fulfill({contentType:'text/javascript',body:''}));await page.route('https://accounts.google.com/**',r=>r.abort());
  await page.addInitScript(()=>{
   window.qaUser={email:'qa-only@example.invalid',credential:'qa-not-a-real-token',provider:'google'};window.JaraLinguaAuth={getUser:()=>window.qaUser,openPanel:()=>{}};
   Object.defineProperty(navigator,'mediaDevices',{value:{getUserMedia:async()=>({getTracks:()=>[{stop(){}}]}),enumerateDevices:async()=>[]}});
   window.MediaRecorder=class{static isTypeSupported(){return true}constructor(){this.state='inactive';this.mimeType='audio/webm'}start(){this.state='recording'}stop(){this.state='inactive';this.ondataavailable?.({data:new Blob([new Uint8Array(2000)],{type:this.mimeType})});this.onstop?.()}};
  });
  let answer='wrong',language='en',failAnalysis=false,submitCalls=[];
  await page.route('**/api/english-basic/pronunciation-assessment',r=>r.fulfill({status:failAnalysis?503:200,contentType:'application/json',body:JSON.stringify({text:answer,language_code:language})}));
  await page.route('**/api/basic2/unit4-past-verbs-step-by-step/submit',r=>{submitCalls.push(r.request().postDataJSON());return r.fulfill({status:submitCalls.length===1?503:200,contentType:'application/json',body:JSON.stringify(submitCalls.length===1?{error:'temporary'}:{ok:true,submittedAt:'2026-09-12T12:00:00Z',grade:null})});});
  await page.goto(base+route,{waitUntil:'networkidle'});await page.waitForFunction(()=>document.querySelector('#stageSelect').options.length===39);
  assert.match(await page.locator('#ruleText').innerText(),/SH \(\/ʃ\/\)/);
  await page.locator('.past-sound-key summary').click();assert.ok(await page.locator('#soundKey').isVisible());assert.match(await page.locator('#soundKey').innerText(),/ch de chico/);await page.locator('.past-sound-key summary').click();
  await page.locator('#stageSelect').selectOption('13');assert.equal(await page.locator('#endingExamples p').count(),6);assert.match(await page.locator('#endingExamples').innerText(),/love → loved/);assert.match(await page.locator('#ruleTip').innerText(),/Exception/);await page.locator('#stageSelect').selectOption('0');assert.ok(await page.locator('#endingExamples').isHidden());
  const out=path.join(process.env.TEMP,'jaralingua-past-verbs-qa');fs.mkdirSync(out,{recursive:true});
  for(const width of [1440,1024,768,390,320]){await page.setViewportSize({width,height:900});await page.evaluate(()=>scrollTo(0,0));const d=await page.evaluate(()=>({scroll:document.documentElement.scrollWidth,shell:document.querySelector('.past-shell').getBoundingClientRect().width,hero:getComputedStyle(document.querySelector('.pron-library-hero')).position,header:getComputedStyle(document.querySelector('.site-header')).position}));assert.ok(d.scroll<=width+2,JSON.stringify(d));assert.ok(d.shell>=width-46);assert.ok(!['fixed','sticky'].includes(d.hero));assert.ok(!['fixed','sticky'].includes(d.header));assert.equal(await page.locator('details[open]').count(),0);await page.locator('.jl-page-qr-open').click();const q=await page.locator('.jl-page-qr-dialog').boundingBox();assert.ok(Math.abs(q.x+q.width/2-width/2)<2);await page.locator('.jl-page-qr-close').click();if([1440,390].includes(width))await page.screenshot({path:path.join(out,'page-'+width+'.png'),fullPage:true});}
  await page.setViewportSize({width:1440,height:900});
  for(const u of urls){const response=await page.request.get(base+u);assert.equal(response.status(),200,u);}
  assert.equal(await page.locator('#modelButton').count(),0);
  await page.setViewportSize({width:390,height:900});
  const wordBox=await page.locator('#readingText').boundingBox(),speedBox=await page.locator('.past-inline-speed').boundingBox();
  assert.ok(Math.abs(wordBox.y+wordBox.height/2-speedBox.y-speedBox.height/2)<2,'Word and speed should share a row');
  await page.setViewportSize({width:1440,height:900});
  await page.locator('.reading-word').first().click();await page.waitForFunction(()=>document.querySelector('#modelAudio').currentTime>0);assert.equal(await page.locator('#modelAudio').evaluate(a=>a.playbackRate),.75);
  await page.locator('[data-speed="1"]').click();assert.equal(await page.locator('#modelAudio').evaluate(a=>a.playbackRate),1);
  assert.ok((await page.locator('#modelAudio').getAttribute('src')).endsWith('/worked.mp3'));
  await page.waitForFunction(()=>document.querySelector('.reading-word').getAttribute('aria-pressed')==='true');
  assert.equal(await page.locator('.reading-word').first().evaluate(b=>getComputedStyle(b).borderBottomStyle),'dotted');
  await page.locator('.reading-word').first().click();assert.ok(await page.locator('#modelAudio').evaluate(a=>a.paused));assert.equal(await page.locator('.reading-word').first().getAttribute('aria-pressed'),'false');
  await page.locator('#stageSelect').selectOption('10');await page.locator('.sentence-model-text').click();await page.waitForFunction(()=>document.querySelector('#modelAudio').currentTime>0);assert.ok((await page.locator('#modelAudio').getAttribute('src')).endsWith('/t-sentence-1.mp3'));await page.locator('#stageSelect').selectOption('0');
  assert.equal(await page.locator('#recordButton .bi-mic-fill').count(),1);
  const mic=await page.locator('#recordButton').boundingBox();assert.equal(mic.width,86);assert.equal(mic.height,86);assert.equal(await page.locator('#recordButton').getAttribute('aria-label'),'Start recording');
  const attempt=async()=>{await page.locator('#recordButton').click();await page.waitForFunction(()=>!document.querySelector('#stopButton').disabled);assert.equal(await page.locator('#recordButton').getAttribute('aria-pressed'),'true');await page.locator('#stopButton').click();await page.waitForFunction(()=>!document.querySelector('#recordButton').disabled);assert.equal(await page.locator('#recordButton').getAttribute('aria-pressed'),'false');};
  assert.ok(await page.locator('#nextButton').isDisabled());await attempt();assert.ok(!(await page.locator('#nextButton').isDisabled()));assert.match(await page.locator('#attemptScore').innerText(),/This attempt: 0/);
  answer='worked';await attempt();answer='wrong';await attempt();assert.match(await page.locator('#attemptScore').innerText(),/This attempt: 0.*Best: 100/);
  await page.locator('#nextButton').click();failAnalysis=true;await attempt();assert.ok(await page.locator('#nextButton').isDisabled());assert.ok(await page.locator('#retryAnalysis').isVisible());failAnalysis=false;language='fr';await attempt();assert.ok(await page.locator('#nextButton').isDisabled());language='en';
  for(let i=1;i<39;i++){answer=data.stages[i].text;await attempt();assert.match(await page.locator('#attemptScore').innerText(),/This attempt: 100/);if(i<38)await page.locator('#nextButton').click();}
  assert.match(await page.locator('#overallScore').innerText(),/100\/100/);await page.reload({waitUntil:'networkidle'});assert.match(await page.locator('#completionCount').innerText(),/39 of 39/);
  await page.locator('#submitButton').click();await page.waitForFunction(()=>!document.querySelector('#submitButton').disabled);assert.match(await page.locator('#submitStatus').innerText(),/No confirmed receipt/);
  await page.reload({waitUntil:'networkidle'});await page.locator('#submitButton').click();await page.waitForFunction(()=>document.querySelector('#submitStatus').textContent.startsWith('Submitted to teacher'));
  assert.equal(submitCalls.length,2);assert.equal(submitCalls[0].clientSubmissionId,submitCalls[1].clientSubmissionId);assert.equal(submitCalls[1].stageScores.length,39);
  await page.evaluate(()=>{window.qaUser={email:'second-qa@example.invalid',credential:'qa'};dispatchEvent(new Event('jaralingua:auth-changed'));});assert.match(await page.locator('#completionCount').innerText(),/0 of 39/);
  const authPage=await browser.newPage();await authPage.route('https://accounts.google.com/**',r=>r.abort());
  await authPage.goto(base+route,{waitUntil:'networkidle'});
  for(const width of [1440,768,320]){await authPage.setViewportSize({width,height:900});assert.ok(await authPage.locator('.site-header .auth-trigger').isVisible(),'Actual top sign-in must be visible');}
  await page.locator('#stageSelect').selectOption('13');
  for(const width of [1440,390,320]){await page.setViewportSize({width,height:900});assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+2),'D-rule activity overflow');await page.locator('.past-rule').screenshot({path:path.join(out,'d-rule-'+width+'.png')});}
  await authPage.goto(base+'/ingles/basico-2/unit-4-busy-lives.html',{waitUntil:'networkidle'});
  assert.equal(await authPage.locator('.busy-topic[open]').count(),0);
  await authPage.locator('#regular-verbs > summary').click();
  for(const width of [1440,768,390,320]){await authPage.setViewportSize({width,height:900});assert.equal(await authPage.locator('#ed-d-ending .ed-ending-examples p').count(),6);const overflow=await authPage.evaluate(()=>({width:innerWidth,scroll:document.documentElement.scrollWidth,nodes:[...document.querySelectorAll('body *')].filter(e=>e.getBoundingClientRect().right>innerWidth+2).slice(0,12).map(e=>e.tagName+'.'+e.className)}));assert.ok(overflow.scroll<=width+2,'D-rule overview overflow '+JSON.stringify(overflow));if([1440,390].includes(width))await authPage.locator('#ed-d-ending').screenshot({path:path.join(out,'overview-d-'+width+'.png')});}
  await authPage.close();
  assert.deepEqual(errors,[]);console.log('PASS: 39 simulated recordings, audio playback/speeds, zero-score advance, best attempt, error recovery, account isolation, persisted delivery retry, top sign-in, 5 widths. '+out);
 }finally{await browser.close();await new Promise(r=>server.close(r));}
})().catch(e=>{console.error(e);process.exit(1)});
