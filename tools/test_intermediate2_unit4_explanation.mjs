import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
const {chromium}=require('C:/Users/USER/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const ROOT=path.resolve(import.meta.dirname,'..');
const route='/ingles/intermediate-2/unit-4-movies-music-and-reviews.html';
const base=process.env.U4_BASE_URL || 'http://127.0.0.1:8024';
const dest=path.join(ROOT,'tmp/unit4-qa');fs.mkdirSync(dest,{recursive:true});
const browser=await chromium.launch({channel:'chrome',headless:true});
const page=await browser.newPage();
const failures=[];
page.on('pageerror',e=>failures.push(e.message));
const response=await page.goto(base+route,{waitUntil:'networkidle'});
assert.equal(response.status(),200);
await page.addStyleTag({content:'* {scroll-behavior:auto!important}'});
assert.equal(await page.locator('#unit4-content > details').count(),11);
assert.equal(await page.locator('details[open]').count(),0);
assert.equal(await page.locator('audio').count(),42);
await page.locator('.jl-page-qr-open').click();
assert.equal(await page.locator('#jlPageQrDialog').evaluate(e=>e.open),true);
await page.keyboard.press('Escape');
assert.equal(await page.locator('#jlPageQrDialog').evaluate(e=>e.open),false);
await page.locator('#u4-search').fill('zzzznoresult');
assert.equal(await page.locator('.course-search-empty').isVisible(),true);
await page.locator('[data-course-search-clear]').click();
await page.locator('#u4-search').fill('participle');
assert.ok(await page.locator('#unit4-content > details:not([hidden])').count()>0);
assert.equal(await page.locator('details[open]').count(),0);
await page.locator('[data-course-search-clear]').click();
assert.equal(await page.locator('.u4-check,.u4-use,.u4-can-do,input[type=radio],input[type=checkbox]').count(),0);
assert.equal(await page.locator('.u4-inline-audio').count(),15);
const dimensions=[];
for(const width of [320,390,768,1200,1440,1920]){
  await page.setViewportSize({width,height:900});
  await page.evaluate(()=>document.querySelectorAll('details').forEach(d=>d.open=false));
  await page.evaluate(()=>window.scrollTo(0,0));
  await page.screenshot({quality:65,path:path.join(dest,'hero-'+width+'.jpg')});
  const closed=await page.evaluate(()=>({scroll:document.documentElement.scrollWidth,client:document.documentElement.clientWidth}));
  assert.ok(closed.scroll<=width+1,'closed overflow '+width+' '+JSON.stringify(closed));
  await page.evaluate(()=>document.querySelectorAll('#unit4-content details').forEach(d=>d.open=true));
  const open=await page.evaluate(()=>({scroll:document.documentElement.scrollWidth,client:document.documentElement.clientWidth}));
  assert.ok(open.scroll<=width+1,'open overflow '+width+' '+JSON.stringify(open));
  const columns=await page.evaluate(()=>({
genres:getComputedStyle(document.querySelector('.u4-genre-grid')).gridTemplateColumns.split(' ').length,
vocab:getComputedStyle(document.querySelector('.u4-vocab-grid')).gridTemplateColumns.split(' ').length,
shell:document.querySelector('.ie2-unit-theory-shell').getBoundingClientRect().width}));
assert.equal(columns.genres,width>1100?3:width>700?2:1);
assert.equal(columns.vocab,width>=1400?4:width>=1100?3:width>700?2:1);
assert.ok(columns.shell>width*.9,'Full-width shell');
dimensions.push({width,closed,open,columns});
}
await page.setViewportSize({width:1440,height:1000});
await page.locator('img').evaluateAll(async images=>{await Promise.all(images.map(async i=>{i.loading='eager';try {await i.decode()} catch {}}))});
await page.locator('#movies-and-genres').evaluate(e=>e.scrollIntoView({block:'start'}));
await page.screenshot({quality:65,path:path.join(dest,'genres-desktop.jpg')});
await page.locator('#tell-the-plot').evaluate(e=>e.scrollIntoView({block:'start'}));
await page.screenshot({quality:65,path:path.join(dest,'storyboard-desktop.jpg')});
await page.setViewportSize({width:390,height:844});
await page.locator('#expressions .u4-expressions').first().evaluate(e=>e.scrollIntoView({block:'start'}));
await page.screenshot({quality:65,path:path.join(dest,'expressions-mobile.jpg')});
const imageResult=await page.locator('img').evaluateAll(images=>images.map(i=>({src:i.getAttribute('src'),ok:i.complete&&i.naturalWidth>0})));
assert.deepEqual(imageResult.filter(i=>!i.ok),[]);
assert.ok(await page.getByText('Sign in',{exact:true}).count()>0,'Sign in must exist');
const missing=[];
for(const src of await page.locator('audio').evaluateAll(a=>a.map(x=>x.getAttribute('src')))){
  const r=await page.request.get(new URL(src,base+route).href);
  if(r.status()!==200 || (await r.body()).length<1000)missing.push(src);
}
assert.deepEqual(missing,[],'Missing audios');
// A native control and a model button must enforce the same single-player policy.
await page.locator('#audio-present-perfect').evaluate(async a=>{a.muted=true;await a.play()});
await page.locator('#audio-plot-model').evaluate(async a=>{a.muted=true;await a.play()});
assert.equal(await page.locator('#audio-present-perfect').evaluate(a=>a.paused),true);
assert.equal(await page.locator('#audio-plot-model').evaluate(a=>a.paused),false);
await page.locator('#audio-plot-model').evaluate(a=>a.pause());
await page.locator('[data-u4-audio="audio-plot-model"][data-rate="0.75"]').click();
assert.equal(await page.locator('#audio-plot-model').evaluate(a=>a.playbackRate),.75);
await page.waitForFunction(()=>document.querySelector('[data-u4-audio="audio-plot-model"][data-rate="0.75"]').getAttribute('aria-pressed')==='true');
await page.locator('#audio-plot-model').evaluate(a=>a.pause());
await page.waitForFunction(()=>document.querySelector('[data-u4-audio="audio-plot-model"][data-rate="0.75"]').getAttribute('aria-pressed')==='false');
for(const slug of ['word-prequel','word-original','word-sequel','already-watched','yet-question','yet-negative','just-released']){
const audio=page.locator('#audio-'+slug);
await audio.evaluate(a=>a.muted=true);
await page.locator('[data-u4-audio="audio-'+slug+'"]').click();
await page.waitForFunction(id=>!document.getElementById(id).paused,'audio-'+slug);
assert.equal(await audio.evaluate(a=>a.playbackRate),.75);
await audio.evaluate(a=>a.pause());
}
assert.deepEqual(failures,[]);
fs.writeFileSync(path.join(dest,'results.json'),JSON.stringify({topics:11,checks:0,audios:42,dimensions,images:imageResult.length,qr:true,search:true,auth:true,audioExclusivity:true,failures},null,2));
await browser.close();
console.log('PASS: Unit 4 checks, assets, auth, QR, audio playback and 6 responsive widths.');

