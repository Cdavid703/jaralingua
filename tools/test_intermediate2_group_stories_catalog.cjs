const assert=require('node:assert/strict');
const {chromium}=require('C:/Users/USER/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
(async()=>{const browser=await chromium.launch({channel:'chrome',headless:true});try{
 const p=await browser.newPage({viewport:{width:390,height:844}}),host='https://www.jaralingua.com',href='/ingles/intermediate-2/speaking-unit-5-our-picture-stories.html';
 await p.goto(host+'/ingles/intermediate-2/practice-lab.html#unit-5-folder',{waitUntil:'networkidle'});
 await p.locator('a.ie2-lab-card[href="'+href+'"]').waitFor();assert.equal(await p.locator('#labActivityTotal').textContent(),'25');assert.equal(await p.locator('#unit5ActivityCount').textContent(),'4 activities');
 await p.locator('#practiceLabSearch').fill('Our Picture Stories');await p.locator('[data-lab-filter="speaking-game"]').click();assert.equal(await p.locator('.ie2-lab-card:visible').count(),1);
 const card=p.locator('a.ie2-lab-card[href="'+href+'"]');await card.locator('img').evaluate(e=>e.decode());await card.click();await p.waitForURL(host+href);assert.equal(await p.locator('#gsGallery [data-picture]').count(),10);
 const unauthorized=await p.request.get(host+'/api/intermediate2/group-stories/state');assert.equal(unauthorized.status(),401);
 const module=await p.request.get(host+'/server/intermediate2_group_stories.py');assert([403,404].includes(module.status()));
 console.log('PASS: production Practice Lab card, speaking filter, 25 activities, page navigation and protected backend.');
}finally{await browser.close()}})().catch(e=>{console.error(e);process.exit(1)});
