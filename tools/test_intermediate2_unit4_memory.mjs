
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
await page.waitForSelector('.tg-card');
await page.addStyleTag({content:'*{scroll-behavior:auto!important}'});
assert.equal(await page.locator('.tg-card').count(),16);
assert.equal(await page.locator('.tg-card svg image').count(),16,'Every card must contain its picture');
assert.equal(await page.locator('.tg-front[aria-hidden=false]').count(),0);
assert.equal(await page.locator('#memory-size option[value="12"]').evaluate(e=>e.disabled),true);
await page.locator('#memoryTeam0').fill('Film fans');await page.locator('#memoryTeam1').fill('Music fans');
const firstId=await page.locator('.tg-card').first().getAttribute('data-pair');
const wrong=page.locator('.tg-card:not([data-pair="'+firstId+'"])').first();
await page.locator('.tg-card').first().focus();await page.keyboard.press('Enter');await wrong.click();
assert.equal(await page.locator('.tg-card.flip').count(),2);
await page.locator('.tg-card:not(.flip)').first().click();
assert.equal(await page.locator('.tg-card.flip').count(),2,'No third card while locked');
await page.waitForFunction(()=>document.getElementById('memoryTurn').textContent==='Music fans');
assert.equal(await page.locator('.tg-card.flip').count(),0);
const pair=page.locator('.tg-card[data-pair="'+firstId+'"]');
await pair.nth(0).click();await pair.nth(1).click();
assert.equal(await page.locator('#memory-gate').evaluate(e=>e.open),true);
assert.equal(await page.locator('#memoryScore1').innerText(),'0','Point requires teacher approval');
assert.equal(await page.locator('#memory-gate-image svg image').count(),1);
await page.screenshot({path:'tmp/unit4-memory-qa/team-match-dialog.jpg',quality:65});
await page.keyboard.press('Escape');
assert.equal(await page.locator('.tg-card.matched').count(),0);
assert.equal(await page.locator('.tg-card.flip').count(),0);
assert.equal(await page.locator('#memoryTurn').innerText(),'Music fans');
const ids=await page.locator('.tg-card').evaluateAll(es=>[...new Set(es.map(e=>e.dataset.pair))]);
for(const id of ids){
 const pair=page.locator('.tg-card[data-pair="'+id+'"]');
 await pair.nth(0).click();await pair.nth(1).click();
 await page.locator('#memory-award').click();
 assert.equal(await pair.evaluateAll(es=>es.every(e=>e.classList.contains('matched'))),true);
}
assert.equal(await page.locator('#memoryScore1').innerText(),'8');
assert.equal(await page.locator('#memory-complete').isVisible(),true);
assert.equal(await page.locator('#memory-history li').count(),8);
for(const width of [320,390,768,1024,1440,1920]){
 await page.setViewportSize({width,height:1000});
 assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth)<=width+1,'Overflow '+width);
 assert.ok(await page.locator('.mm-shell').evaluate(e=>e.getBoundingClientRect().width)>width*.9);
 await page.locator('#memory-board').evaluate(e=>e.scrollIntoView());
 await page.screenshot({path:'tmp/unit4-memory-qa/teams-board-'+width+'.jpg',quality:65});
}
await page.setViewportSize({width:1440,height:1000});
const audioBtn=page.locator('#memory-history .mm-listen').first();await audioBtn.click();
await page.waitForFunction(()=>document.querySelector('#memory-history .mm-listen').getAttribute('aria-pressed')==='true');await audioBtn.click();
for(const theme of ['music','mixed','film','genres']){
 await page.locator('#memory-topic').selectOption(theme);
 if(['music','mixed'].includes(theme))await page.locator('#memory-size').selectOption('12');
 await page.locator('#memory-start').click();
 const count=['music','mixed'].includes(theme)?24:16;
 assert.equal(await page.locator('.tg-card').count(),count);
 assert.equal(await page.locator('.tg-card svg image').count(),count);
 assert.equal(await page.locator('#memoryScore1').innerText(),'0');
 assert.equal(await page.locator('#memoryTurn').innerText(),'Film fans');
}
// A restart during the mismatch delay must not change the new game's turn.
const id=await page.locator('.tg-card').first().getAttribute('data-pair');
await page.locator('.tg-card').first().click();await page.locator('.tg-card:not([data-pair="'+id+'"])').first().click();
await page.locator('#memory-start').click();await page.waitForTimeout(1800);
assert.equal(await page.locator('#memoryTurn').innerText(),'Film fans');
assert.equal(await page.locator('.tg-card.flip').count(),0);
await page.locator('.jl-page-qr-open').click();assert.equal(await page.locator('#jlPageQrDialog').evaluate(e=>e.open),true);await page.keyboard.press('Escape');
assert.ok(await page.getByText('Sign in',{exact:true}).count()>0);
await page.goto(base+'/ingles/intermediate-2/practice-lab.html');
await page.locator('#practiceLabSearch').fill('Movies & Music Memory');
await page.waitForSelector('#unit4ActivityGrid .ie2-lab-card');
await page.locator('#unit4ActivityGrid .ie2-lab-card').click();assert.ok(page.url().endsWith(route));
assert.deepEqual(errors,[]);
await browser.close();console.log('PASS team memory: images on every card, team switching, teacher approval, retry, all pairs, audio, reset race, six widths, catalog and QR');
