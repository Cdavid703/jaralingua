const {webkit,chromium}=require(process.env.PLAYWRIGHT_MODULE||'C:/Users/USER/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict'),base=process.env.UNIT6_BASE_URL||'http://127.0.0.1:8046';
(async()=>{for(const [name,engine] of [['webkit',webkit],['chromium',chromium]]){
 const b=await engine.launch({headless:true,...(name==='chromium'?{channel:'chrome'}:{})});
 const p=await b.newPage({hasTouch:true,isMobile:true,viewport:{width:390,height:844}});
 await p.goto(base+'/ingles/basico-2/practice-unit-6-containers-portions.html',{waitUntil:'networkidle'});
 assert.equal(await p.locator('.fp-question').count(),12);
 const first=p.locator('[data-question="0"] input');await first.nth(0).tap();await first.nth(1).tap();assert(await first.nth(1).isChecked());await p.locator('#fpCheck').click();await first.nth(2).tap();assert(await first.nth(2).isChecked());
 const answers=await p.evaluate(()=>window.Basic2FoodPractice.portions.questions.map(q=>q.answer));
 for(let i=0;i<answers.length;i++){const texts=await p.locator(`[data-question="${i}"] label span`).allTextContents();const j=texts.findIndex(t=>t.slice(3)===answers[i]);assert(j>=0);await p.locator(`[data-question="${i}"] input`).nth(j).check();}
 await p.locator('#fpCheckBottom').click();assert.match(await p.locator('#fpScore').innerText(),/Score: 12 \/ 12/);
 assert(await p.locator('.fp-feedback').evaluateAll(els=>els.every(e=>{const f=e.closest('.fp-question'),c=f.querySelector('.fp-choices');return e.getBoundingClientRect().top>=c.getBoundingClientRect().bottom})));await p.locator('#fpReset').click();assert.equal(await p.locator('input:checked').count(),0);
 await p.goto(base+'/ingles/basico-2/practice-unit-6-food-vocabulary-memory.html',{waitUntil:'networkidle'});const words=await p.locator('.fp-front strong').allTextContents();assert.equal(words.length,24);
 const other=words.findIndex(w=>w!==words[0]);await p.locator('[data-card="0"]').tap();await p.locator(`[data-card="${other}"]`).tap();await p.waitForFunction(()=>document.querySelector('#fpTeam').textContent.startsWith('Team 2'));
 for(const word of new Set(words)){for(let i=0;i<words.length;i++)if(words[i]===word)await p.locator(`[data-card="${i}"]`).tap();await p.locator('#fpContinue').waitFor({state:'visible'});assert.equal(await p.locator('#fpPairWord').innerText(),word);await p.locator('#fpContinue').tap();}
 assert.match(await p.locator('#fpPoints').innerText(),/Team 2: 12/);assert.match(await p.locator('#fpMemoryStatus').innerText(),/Team 2 wins/);console.log('PASS '+name+': mutable answers, complete correct score, feedback/reset, two-team memory including all 12 pairs.');await b.close();
}})().catch(e=>{console.error(e);process.exit(1)});
