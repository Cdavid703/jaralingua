import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
const {chromium}=require('C:/Users/USER/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const session=JSON.parse(fs.readFileSync('tmp/unit5-pronunciation/session.json','utf8'));
const browser=await chromium.launch({channel:'chrome',headless:true,args:['--use-fake-ui-for-media-stream','--use-fake-device-for-media-stream']});
const context=await browser.newContext({permissions:['microphone'],viewport:{width:1440,height:1000}});
const page=await context.newPage(),errors=[];let heard='';
page.on('pageerror',e=>errors.push(e.message));
await page.addInitScript(()=>{
 const NativeAudio=window.Audio;
 window.Audio=function(source){const player=new NativeAudio(source);window.__wordPlayer=player;return player;};
 window.Audio.prototype=NativeAudio.prototype;
});
await page.route('**/assets/js/google-auth.js*',r=>r.fulfill({body:''}));
await page.route('https://accounts.google.com/**',r=>r.fulfill({body:''}));
await page.route('**/api/english-intermediate/pronunciation-assessment',r=>r.fulfill({json:{text:heard,audio:{rms:0.1}}}));
await page.route('**/api/intermediate2/unit5-pronunciation/**',async r=>{
 const url=new URL(r.request().url());const response=await r.fetch({url:session.base+url.pathname+url.search});await r.fulfill({response});
});
async function sign(who){await page.evaluate(({who,token})=>{
 sessionStorage.setItem('jaralingua_local_user',JSON.stringify({email:who+'@exam.example',name:who,credential:token,exp:Date.now()/1000+3600}));
 dispatchEvent(new Event('jaralingua:auth-changed'));
},{who,token:session.tokens[who]});}
async function record(text){
 heard=text;await page.locator('#micButton').click();
 await page.waitForFunction(()=>document.getElementById('recordStatus').textContent.startsWith('Recording -'));
 await page.waitForTimeout(850);await page.locator('#stopButton').click();
 await page.waitForFunction(()=>document.getElementById('recordStatus').textContent.includes('evaluated'));
}
try{
 await page.goto('http://127.0.0.1:8025/ingles/intermediate-2/pronunciation-unit-5-first-impressions-clear-words.html');
 await sign('ana');
 const config=await page.evaluate(()=>window.JaraIntermediate2PronunciationConfig);
 assert.equal(await page.locator('.next-stage').isVisible(),false);
 assert.equal(await page.locator('[data-submit-teacher]').isDisabled(),true);
 await page.locator('[data-speed="0.75"]').click();await page.locator('#modelButton').click();
 await page.waitForFunction(()=>!document.getElementById('modelAudio').paused);
 assert.equal(await page.locator('#modelAudio').evaluate(a=>a.playbackRate),0.75);
 await page.locator('#modelButton').click();
 await page.locator('#shadowModeButton').click();assert.match(await page.locator('#shadowModeStatus').textContent(),/On/);
 await page.locator('#shadowModeButton').click();await page.locator('#modelAudio').evaluate(a=>a.pause());
 const seen=new Set();
 for(let stage=0;stage<4;stage++){
  const words=await page.locator('.reading-word').evaluateAll(nodes=>nodes.map(n=>({index:n.dataset.word,word:n.dataset.spoken})));
  for(const {index,word} of words){
   const slug=word.toLowerCase().replace(/[^a-z0-9]/g,'');if(seen.has(slug))continue;
   await page.locator('.reading-word[data-word="'+index+'"]').click();
   await page.waitForFunction(slug=>window.__wordPlayer?.currentSrc.endsWith('/'+slug+'.mp3')&&window.__wordPlayer.readyState>=2&&!window.__wordPlayer.paused,slug);
   assert.equal(await page.locator('.reading-word[data-word="'+index+'"]').getAttribute('aria-pressed'),'true');seen.add(slug);
  }
  if(stage===0){
   await record(config.stages[0].text.replace('worried,',''));
   const missed=page.locator('.reading-word.is-missed').filter({hasText:'worried'});assert.equal(await missed.count(),1);
   await missed.click();await page.waitForFunction(()=>window.__wordPlayer.currentSrc.endsWith('/worried.mp3')&&!window.__wordPlayer.paused);
   assert.equal(await missed.getAttribute('aria-pressed'),'true');
   await page.locator('.word-model-replay').click();
   assert((await page.locator('#wordHelp').textContent()).includes('worried'));
   await page.screenshot({path:'tmp/unit5-pronunciation/missed-word-desktop.jpg',type:'jpeg',quality:75});
   await page.locator('.retry-stage').click();assert.equal(await page.locator('.reading-word.is-missed').count(),0);
  }
  await record(config.stages[stage].text);
  assert.equal(await page.locator('.reading-word.is-missed').count(),0);
  await page.locator('.next-stage').click();
 }
 assert.equal(seen.size,60);
 assert.equal(await page.locator('#stageCounter').textContent(),'Final challenge');
 await record(config.stages[4].text);
 assert.equal(await page.locator('[data-submit-teacher]').isDisabled(),false);
 for(const width of [390,820,1440]){
  await page.setViewportSize({width,height:1000});await page.locator('#readingText').scrollIntoViewIfNeeded();
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'Overflow at '+width);
  await page.screenshot({path:'tmp/unit5-pronunciation/final-'+width+'.jpg',type:'jpeg',quality:75});
 }
 await page.locator('[data-submit-teacher]').click();await page.locator('.ie2-receipt').waitFor();
 assert.match(await page.locator('.ie2-receipt code').textContent(),/^JLF-/);
 await sign('teacher');await page.locator('.teacher-inbox-item').waitFor();
 assert.match(await page.locator('.teacher-inbox-item').first().textContent(),/Ana Test/);
 await page.locator('.teacher-audio-button').first().click();
 await page.locator('.teacher-inbox-item audio').first().waitFor();
 assert.deepEqual(errors,[]);
 console.log('PASS: 60 real word MP3s, red-word click after controlled assessment, replay, retry, five recordings, speed, shadowing, responsive layout, real delivery and teacher audio.');
}finally{await browser.close();}
