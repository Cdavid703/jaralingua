'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const {chromium} = require('playwright');
const base = process.env.JARALINGUA_TEST_URL || 'http://127.0.0.1:8022';
const key = 'english-basic-2-hangman-game-v1';
const sandbox = {window:{}};
vm.runInNewContext(fs.readFileSync('assets/js/english-basic-2-hangman-data.js','utf8'),sandbox);
const data = sandbox.window.JaraLinguaEnglishBasic2Hangman;
const entries = data.categories.flatMap(c=>c.entries.map((e,i)=>({...e,id:c.id+'-'+(i+1),unit:c.unit})));
assert.equal(entries.length,457);
for (const c of data.categories) {
 assert.ok(fs.existsSync(c.source));
 const answers = new Set();
 for (const e of c.entries) {
  assert.ok(e.answer && e.meaning && e.example && e.usage && e.hints.length===3);
  assert.ok(!e.hints[1].startsWith('Think about this meaning:'), 'Context clue must add information');
  assert.match(e.answer,/^[a-zA-Z ',\-]+$/);
  assert.ok(!answers.has(e.answer.toLowerCase()), 'duplicate '+e.answer);
  answers.add(e.answer.toLowerCase());
 }
}
for (let u=1;u<=6;u++) assert.ok(entries.filter(e=>e.unit===`Unit ${u}`).length>=30);
for(const letter of 'abcdefghijklmnopqrstuvwxyz') assert.ok(fs.existsSync(`ingles/basico/audio/alphabet/${letter}.mp3`));
for(const name of ['game-start','correct-letter','wrong-letter','turn-change','round-complete','match-win']) assert.ok(fs.existsSync(`ingles/intermediate/audio/sfx/hangman/${name}.mp3`));
async function setup(browser, viewport, role='teacher', reducedMotion='no-preference') {
 const context=await browser.newContext({viewport,reducedMotion});
 await context.addInitScript(role=>{
  if(role==='guest')return;
  const user={credential:'synthetic-local-test',sub:'hangman-qa',email:'hangman-qa@test.local',name:'QA Teacher',exp:Date.now()/1000+3600};
  sessionStorage.setItem('jaralingua_local_user',JSON.stringify(user));
  localStorage.setItem('jaralingua_role_requests',JSON.stringify([{id:user.sub,email:user.email,role,status:'approved'}]));
 },role);
 const page=await context.newPage();
 await page.route('https://accounts.google.com/**',r=>r.abort());
 await page.route('**/api/**',r=>r.fulfill({status:200,contentType:'application/json',body:'{"ok":true,"pages":{}}'}));
 await page.route('**/csp-report',r=>r.fulfill({status:204,body:''}));
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 page.on('response',r=>{if(r.status()>=400 && /\.(mp3|js|css|png|svg|webp)(\?|$)/.test(r.url())) errors.push(r.status()+' '+r.url());});
 await page.goto(base+'/ingles/basico-2/game-hangman.html',{waitUntil:'load'});
 page.on('dialog',d=>d.accept());
 return {context,page,errors};
}
async function state(page){return page.evaluate(key=>JSON.parse(localStorage.getItem(key)),key);}
async function start(page,u='Unit 1',format='all'){
 await page.locator('#studentNamesInput').fill('Team A\nTeam B');
 await page.selectOption('#unitSelect',u);await page.selectOption('#answerTypeSelect',format);
 await page.fill('#targetScoreInput','100');await page.click('#startGameButton');
 await page.locator('#gameConsole').waitFor({state:'visible'});
}
async function solve(page,answer){await page.click('#solveButton');await page.fill('#solutionInput',answer);await page.click('#solveForm button[type=submit]');}
async function responsive(page,label){
 const result=await page.evaluate(()=>{
  const width=document.documentElement.clientWidth;
  return {width,scroll:document.documentElement.scrollWidth,broken:[...document.images].filter(i=>i.complete&&!i.naturalWidth).map(i=>i.src),outside:[...document.querySelectorAll('button,input,select,textarea,.word-board,.word-token,.clue-panel')].filter(e=>{const r=e.getBoundingClientRect();return r.width>0&&r.height>0&&(r.left< -1||r.right>width+1)}).map(e=>e.id||e.className)};
 });
 assert.ok(result.scroll<=result.width+1,label+JSON.stringify(result));assert.deepEqual(result.outside,[],label);assert.deepEqual(result.broken,[]);
}
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:process.env.JARALINGUA_CHROME_PATH||'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'});
 try {
  const {context,page,errors}=await setup(browser,{width:1366,height:900});
  assert.equal(await page.locator('#unitSelect option').count(),7);
  await page.screenshot({path:'/tmp/basic2-hangman-hero.png',fullPage:true});
  assert.ok(await page.locator('.hangman-hero').evaluate(e=>e.getBoundingClientRect().top>=document.querySelector('.site-header').getBoundingClientRect().bottom),'Hero must begin below the navigation');
  assert.equal(await page.evaluate(()=>window.JaraLinguaEnglishHangmanDiagnostics.incompleteEntries),0);
  for(let u=1;u<=6;u++){
   await start(page,`Unit ${u}`,u%2?'word':'expression');
   let s=await state(page);assert.equal(entries.find(e=>e.id===s.current.entryId).unit,`Unit ${u}`);
   assert.match(await page.locator('#cluePanel').innerText(),/Clue 1/i);
   assert.ok(await page.locator('#cluePanel li p').innerText());
   await page.click('#resetMatchButton');
   assert.equal(await page.inputValue('#unitSelect'),`Unit ${u}`);
   assert.equal(await page.inputValue('#studentNamesInput'),'Team A\nTeam B');
  }
  await start(page,'Unit 6');
  let s=await state(page);const first=s.current.entryId;
  let answer=entries.find(e=>e.id===first).answer;
  await page.click('#hintButton');await page.click('#hintButton');assert.ok(await page.isDisabled('#hintButton'));
  await page.click('#soundToggleButton');
  await page.click(`[data-letter="${answer.match(/[a-z]/i)[0].toUpperCase()}"]`);
  s=await state(page);assert.equal(Object.values(s.scores).reduce((a,b)=>a+b,0),1);
  await solve(page,answer);s=await state(page);assert.equal(s.current.success,true);assert.equal(Object.values(s.scores).reduce((a,b)=>a+b,0),2);
  assert.match(await page.locator('#roundResult').innerText(),/Meaning[\s\S]*Example[\s\S]*Usage/i);
  await page.click('#nextRoundButton');s=await state(page);assert.notEqual(s.current.entryId,first);assert.equal(s.current.hintLevel,1);
  await page.reload({waitUntil:'load'});assert.equal((await state(page)).current.entryId,s.current.entryId);
  assert.equal(await page.locator('#soundToggleButton').getAttribute('aria-pressed'),'true');
  answer=entries.find(e=>e.id===s.current.entryId).answer;
  const misses=[...'ABCDEFGHIJKLMNOPQRSTUVWXYZ'].filter(l=>!answer.toUpperCase().includes(l)).slice(0,6);
  for(const l of misses)await page.click(`[data-letter="${l}"]`);
  assert.equal((await state(page)).current.success,false);assert.equal(await page.locator('[data-part].visible').count(),6);
  assert.equal(await page.locator('#gallows').getAttribute('data-state'),'lost');
  await page.locator('.gallows-wrap').screenshot({path:'/tmp/basic2-hangman-character.png'});
  await page.click('#resetMatchButton');
  await start(page,'Unit 2');s=await state(page);answer=entries.find(e=>e.id===s.current.entryId).answer;
  await page.evaluate(key=>{const s=JSON.parse(localStorage.getItem(key));s.targetScore=3;localStorage.setItem(key,JSON.stringify(s));},key);await page.reload({waitUntil:'load'});
  await solve(page,answer);assert.equal((await state(page)).status,'match-complete');assert.ok(await page.isVisible('#winnerPanel'));
  // Legacy Unit 1 sessions must infer their unit and preserve participants.
  await page.evaluate(key=>{const s=JSON.parse(localStorage.getItem(key));delete s.unit;s.category='basic2-unit1-weather-words';s.status='setup';s.current=null;localStorage.setItem(key,JSON.stringify(s));},key);await page.reload({waitUntil:'load'});
  assert.equal(await page.inputValue('#unitSelect'),'Unit 1');
  await page.click('#clearSavedButton');assert.equal(await page.inputValue('#studentNamesInput'),'');
  assert.deepEqual(errors,[]);await context.close();
  const longest=entries.reduce((a,b)=>Math.max(...b.answer.split(' ').map(w=>w.length))>Math.max(...a.answer.split(' ').map(w=>w.length))?b:a);
  for(const [width,height] of [[360,800],[844,390],[768,1024],[1024,768],[1366,768],[1920,1080]]){
   const {context,page,errors}=await setup(browser,{width,height});
   await page.locator('.site-header [data-jaralingua-auth-nav]').waitFor();
   assert.equal(await page.locator('body > .jaralingua-auth').count(),0);
   assert.ok(await page.locator('.site-header').evaluate(e=>e.getBoundingClientRect().height<=92));
   const top=await page.locator('.hangman-hero').evaluate(e=>e.getBoundingClientRect().top);await page.evaluate(()=>scrollTo(0,260));
   assert.ok(await page.locator('.hangman-hero').evaluate(e=>e.getBoundingClientRect().top)<top-100);
   await start(page,longest.unit);
   await page.evaluate(({key,id})=>{const s=JSON.parse(localStorage.getItem(key));s.current.entryId=id;localStorage.setItem(key,JSON.stringify(s));},{key,id:longest.id});await page.reload({waitUntil:'load'});
   await responsive(page,`${width}x${height}`);
   assert.ok(await page.locator('#baseKeyboard').evaluate(e=>e.getBoundingClientRect().height<250),'Keyboard should fit in a compact grid');
   await page.locator('#gameConsole').screenshot({path:`/tmp/basic2-hangman-${width}.png`});
   await page.click('#solveButton');await responsive(page,`${width} solve dialog`);await page.click('#cancelSolveButton');
   assert.deepEqual(errors,[]);await context.close();
  }
  for(const role of ['guest','student']){
   const {context,page}=await setup(browser,{width:390,height:844},role);assert.ok(await page.isHidden('#teacherSetup'));assert.ok(await page.isHidden('#gameConsole'));await context.close();
  }
  const reduced=await setup(browser,{width:768,height:1024},'teacher','reduce');await start(reduced.page);let rs=await state(reduced.page);await solve(reduced.page,entries.find(e=>e.id===rs.current.entryId).answer);assert.equal(await reduced.page.locator('.confetti-piece').count(),0);await reduced.context.close();
  console.log('PASS: 457 entries; 6 units; formats; English clues; scores; correct/wrong guesses; loss/win; saved/legacy matches; reset; mute; guest/student gates; six viewports; longest word; dialog; top-nav auth; hero scroll; reduced motion.');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1});
