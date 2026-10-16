/* Verify independently projectable grammar scaffolds, real new media and reference links. */
const assert=require('node:assert/strict'),fs=require('node:fs'),crypto=require('node:crypto');
const {chromium}=require('playwright');
const origin=process.env.UNIT6_ORIGIN||'http://127.0.0.1:8139';
const route='/ingles/intermediate-2/unit-6-news-and-natural-disasters.html';
const dir='ingles/intermediate-2/audio/unit-6-explanation/';
const models=JSON.parse(fs.readFileSync(dir+'models.json')).items.filter(x=>x.id.startsWith('rs-'));
const audit=JSON.parse(fs.readFileSync(dir+'audio-audit.json'));
(async()=>{const browser=await chromium.launch({headless:true,channel:'chrome'});try{
 assert.equal(models.length,18);for(const m of models){assert.equal(crypto.createHash('sha256').update(fs.readFileSync(dir+m.file)).digest('hex'),m.sha256);assert(audit.some(a=>a.file===m.file&&a.sha256===m.sha256&&a.matched));}
 for(const viewport of [{width:320,height:740},{width:390,height:844},{width:844,height:390},{width:768,height:1024},{width:1024,height:768},{width:1440,height:900},{width:1920,height:1080}]){
  const page=await browser.newPage({viewport}),errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto(origin+route+'#rs-build-report',{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>document.querySelector('#rs-build-report').open&&document.querySelector('#direct-reported').open);
  assert.equal(await page.locator('main .u6-explainer').count(),9);assert.equal(await page.locator('#rs-build-report .u6-report-steps li').count(),4);
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
  await page.locator('#rs-build-report .u6-project-explainer').click();const dialog=page.locator('.u6-projector');await dialog.waitFor({state:'visible'});
  assert.match(await dialog.locator('#u6-project-title').innerText(),/four steps/);assert.equal(await dialog.locator('.u6-report-steps li').count(),4);assert.equal(await dialog.locator('.u6-project-explainer').count(),0);assert(await dialog.evaluate(e=>e.scrollWidth<=innerWidth+1));
  await dialog.locator('[data-u6-say="rs-four-steps.mp3"]').click();await page.waitForFunction(()=>document.querySelector('#u6-player').currentTime>0);assert.equal(await page.locator('#u6-player').evaluate(a=>a.playbackRate),.75);
  if([390,1440].includes(viewport.width))await page.screenshot({path:'/private/tmp/reported-support-'+viewport.width+'.png'});
  await dialog.locator('[data-u6-prev]').click();assert.match(await dialog.locator('#u6-project-title').innerText(),/Same person/);assert(await page.locator('#u6-player').evaluate(a=>a.paused));await dialog.locator('[data-u6-close]').click();
  await page.evaluate(()=>{document.querySelector('#changes').open=true;document.querySelectorAll('#changes .u6-explainer').forEach(d=>d.open=true);});
  const ids=await page.locator('#changes .u6-explainer').evaluateAll(ds=>ds.map(d=>d.id));
  for(const id of ids){await page.locator('#'+id+' .u6-project-explainer').click();assert(await dialog.evaluate(e=>e.scrollWidth<=innerWidth+1));assert.equal(await dialog.locator('.u6-project-explainer').count(),0);assert((await dialog.locator('.u4-project-description').innerText()).length>300);await dialog.locator('[data-u6-close]').click();}
  await page.locator('#rs-message-types .u6-project-explainer').click();await dialog.locator('a[href="#instructions"]').click();await dialog.waitFor({state:'hidden'});await page.waitForFunction(()=>document.querySelector('#instructions').open);
  await page.evaluate(()=>{document.querySelector('#changes').open=true;});await page.locator('#changes > .ie2-theory-body > .u6-project-section').click();assert.equal(await dialog.locator('.u6-explainer[open]').count(),5);assert.equal(await dialog.locator('.u6-project-explainer').count(),0);await dialog.locator('[data-u6-close]').click();
  assert.deepEqual(errors,[]);await page.close();console.log('PASS reported support',viewport.width,viewport.height);
 }
 const page=await browser.newPage();await page.goto(origin+route);await page.evaluate(async files=>{const ctx=new AudioContext();for(const file of files){const r=await fetch('/ingles/intermediate-2/audio/unit-6-explanation/'+file);if(!r.ok)throw Error(file);const a=await ctx.decodeAudioData(await r.arrayBuffer());if(a.duration<=0)throw Error(file);}await ctx.close();},models.map(m=>m.file));
 await page.evaluate(()=>{document.querySelector('#say-tell').open=true;document.querySelector('#rs-negative-message').open=true;});await page.locator('#rs-negative-message .u6-project-explainer').click();await page.route('**/rs-negative-direct.mp3',r=>r.abort());await page.locator('.u6-projector [data-u6-say="rs-negative-direct.mp3"]').click();await page.waitForFunction(()=>document.querySelector('.u6-projector [data-u6-status]').textContent.includes('could not'));await page.unroute('**/rs-negative-direct.mp3');await page.locator('.u6-projector [data-u6-say="rs-negative-direct.mp3"]').click();await page.waitForFunction(()=>document.querySelector('#u6-player').currentTime>0);
 await page.keyboard.press('Escape');await page.waitForFunction(()=>document.querySelector('#u6-player').paused);console.log('PASS 18 audited/decoded recordings, nine projectable explanations, seven layouts, deep links, transitions and audio recovery.');
 }finally{await browser.close();}})().catch(e=>{console.error(e);process.exit(1);});
