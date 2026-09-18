
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
const {chromium}=require('C:/Users/USER/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const base=process.env.U4_BASE_URL||'http://127.0.0.1:8024';
const route='/ingles/intermediate-2/game-unit-4-movies-music-memory.html';
fs.mkdirSync('tmp/unit4-memory-qa',{recursive:true});
const browser=await chromium.launch({channel:'chrome',headless:true});
const page=await browser.newPage({viewport:{width:1440,height:1000}});
const errors=[];page.on('pageerror',e=>errors.push(e.message));
await page.goto(base+route,{waitUntil:'networkidle'});
await page.waitForSelector('.mm-card');
await page.addStyleTag({content:'*{scroll-behavior:auto!important}'});
assert.equal(await page.locator('.mm-card').count(),16);
assert.equal(await page.locator('.mm-face:visible').count(),0);
assert.equal(await page.locator('#memory-size option[value="12"]').evaluate(e=>e.disabled),true);
await page.locator('.jl-page-qr-open').click();
assert.equal(await page.locator('#jlPageQrDialog').evaluate(e=>e.open),true);
await page.keyboard.press('Escape');
assert.ok(await page.getByText('Sign in',{exact:true}).count()>0);
const cards=page.locator('.mm-card');
const first=await cards.first().getAttribute('data-pair');
const otherIndex=await cards.evaluateAll((es,id)=>es.findIndex(e=>e.dataset.pair!==id),first);
await cards.first().locator('.mm-cover').focus();await page.keyboard.press('Enter');
assert.equal(await page.locator('.mm-face:visible').count(),1);
await cards.nth(otherIndex).locator('.mm-cover').click();
assert.equal(await page.locator('#memory-attempts').innerText(),'1');
assert.equal(await page.locator('.mm-face:visible').count(),2);
await cards.filter({has:page.locator('.mm-cover:visible')}).last().locator('.mm-cover').click();
assert.equal(await page.locator('.mm-face:visible').count(),2,'Third card locked');
await page.locator('#memory-next').click();
assert.equal(await page.locator('.mm-face:visible').count(),0);
const ids=await cards.evaluateAll(es=>[...new Set(es.map(e=>e.dataset.pair))]);
for(const id of ids){
 const pair=page.locator('.mm-card[data-pair="'+id+'"]');
 assert.equal(await pair.count(),2);
 await pair.nth(0).locator('.mm-cover').click();
 await pair.nth(1).locator('.mm-cover').click();
 assert.equal(await pair.locator('.mm-cover:visible').count(),0);
 assert.equal(await pair.nth(0).getAttribute('class'),'mm-card is-matched');
}
assert.equal(await page.locator('#memory-matches').innerText(),'8 / 8');
assert.equal(await page.locator('#memory-attempts').innerText(),'9');
assert.equal(await page.locator('#memory-complete').isVisible(),true);
assert.equal(await page.locator('.mm-review-card').count(),8);
const listen=page.locator('.mm-review-card .mm-listen').first();
await listen.click();await page.waitForFunction(()=>document.querySelector('.mm-review-card .mm-listen').getAttribute('aria-pressed')==='true');
await listen.click();
for(const theme of ['music','mixed','film','genres']){
 await page.locator('#memory-topic').selectOption(theme);
 if(['music','mixed'].includes(theme))await page.locator('#memory-size').selectOption('12');
 await page.locator('#memory-start').click();
 const count=['music','mixed'].includes(theme)?24:16;
 assert.equal(await page.locator('.mm-card').count(),count);
 assert.equal(await page.locator('#memory-attempts').innerText(),'0');
 assert.equal(await page.locator('.mm-review-card').count(),0);
 assert.equal(await page.locator('#memory-complete').isVisible(),false);
 const pairs=await page.locator('.mm-card').evaluateAll(es=>es.map(e=>({id:e.dataset.pair,kind:e.dataset.kind})));
 assert.equal(new Set(pairs.map(e=>e.id)).size,count/2);
 for(const id of new Set(pairs.map(e=>e.id)))assert.deepEqual(pairs.filter(e=>e.id===id).map(e=>e.kind).sort(),['picture','word']);
}
await page.locator('#memory-topic').selectOption('mixed');await page.locator('#memory-size').selectOption('6');await page.locator('#memory-start').click();
assert.equal(await page.locator('.mm-card').count(),12);
const widths=[];
for(const width of [320,390,768,1024,1440,1920]){
 await page.setViewportSize({width,height:1000});
 await page.locator('.mm-card').first().locator('.mm-cover').click();
 const layout=await page.evaluate(()=>({scroll:document.documentElement.scrollWidth,shell:document.querySelector('.mm-shell').getBoundingClientRect().width,cols:getComputedStyle(document.querySelector('.mm-board')).gridTemplateColumns.split(' ').length}));
 assert.ok(layout.scroll<=width+1,'Overflow '+width);
 assert.ok(layout.shell>width*.9);
 widths.push({width,...layout});
 await page.locator('#memory-board').evaluate(e=>e.scrollIntoView());
 await page.screenshot({path:'tmp/unit4-memory-qa/board-'+width+'.jpg',quality:65});
 await page.locator('#memory-start').click();
}
await page.locator('img').evaluateAll(async es=>await Promise.all(es.map(e=>{e.loading='eager';return e.decode()})));
const data=await (await page.request.get(base+'/assets/data/english-intermediate2-unit4-memory.json')).json();
assert.equal(data.length,28);
for(const item of data){
 const r=await page.request.get(base+'/ingles/intermediate-2/audio/unit-4-explanation/'+item.audio);
 assert.equal(r.status(),200);assert.ok((await r.body()).length>1000);
}
await page.goto(base+'/ingles/intermediate-2/practice-lab.html');
await page.waitForSelector('#unit4ActivityGrid .ie2-lab-card',{state:'attached'});
await page.locator('#practiceLabSearch').fill('Movies & Music Memory');
assert.equal(await page.locator('#unit4ActivityGrid .ie2-lab-card:visible').count(),1);
await page.locator('#unit4ActivityGrid .ie2-lab-card').click();
assert.ok(page.url().endsWith(route));
assert.deepEqual(errors,[]);
fs.writeFileSync('tmp/unit4-memory-qa/results.json',JSON.stringify({words:28,mismatch:true,locked:true,complete:true,restart:true,keyboard:true,audio:true,qr:true,catalog:true,widths},null,2));
await browser.close();console.log('PASS memory: matching, lock, completion, topic sizes, restart, keyboard, audio, QR, catalog and six widths');
