import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
const {chromium}=require('C:/Users/USER/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const exam=JSON.parse(fs.readFileSync('server/private_assets/basic2-integrated-task/exam.json','utf8'));
const browser=await chromium.launch({channel:'chrome',headless:true});
const out='tmp/basic2-integrated-qa';fs.mkdirSync(out,{recursive:true});
try{
 for(const width of [360,390,820,1440]){
  const page=await browser.newPage({viewport:{width,height:900},hasTouch:width<1000,isMobile:width<600});
  await page.route('https://accounts.google.com/**',r=>r.fulfill({body:''}));
  await page.route('**/api/basic2/integrated-task/state',r=>r.fulfill({json:{role:'teacher',isOpen:false,audioReady:true,entries:[],exam,transcript:exam.transcript,rubric:exam.rubric,answerKey:exam.questions}}));
  await page.goto('http://127.0.0.1:8025/ingles/basico-2/basic-course-2-integrated-task.html');
  await page.locator('.site-header [data-jaralingua-auth-nav]').waitFor();
  assert.equal(await page.locator('body > .jaralingua-auth').count(),0);
  await page.evaluate(()=>{window.JaraLinguaAuth={getUser:()=>({credential:'test',provider:'local',email:'teacher@exam.example'})};window.dispatchEvent(new Event('jaralingua:auth-changed'));});
  await page.locator('#ix-preview').click();
  await page.locator('.ix-question').last().waitFor();
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'Horizontal overflow '+width);
  for(const selector of ['.site-header','.ix-hero'])assert(!['fixed','sticky'].includes(await page.locator(selector).evaluate(e=>getComputedStyle(e).position)));
  assert(await page.locator('.ix-shell').evaluate(e=>e.getBoundingClientRect().width>=innerWidth-2));
  const title=await page.locator('.ix-hero h1').boundingBox(),qr=await page.locator('.jl-page-qr-card').boundingBox();
  assert(title.x+title.width<qr.x,'QR overlaps title '+width);
  assert((await page.locator('.site-header').boundingBox()).height<120,'Header too tall '+width);
  assert.equal(await page.locator('img').evaluateAll(imgs=>imgs.every(i=>i.complete&&i.naturalWidth>0)),true);
  await page.evaluate(()=>scrollTo(0,0));
  await page.screenshot({path:out+'/exam-'+width+'.jpg',type:'jpeg',quality:85,fullPage:true});
  await page.screenshot({path:out+'/top-'+width+'.jpg',type:'jpeg',quality:85});
  await page.locator('#ix-writing').fill('Last weekend I stayed home with my family.');
  assert.match(await page.locator('#ix-word-count').textContent(),/8 \/ 30/);
  await page.locator('#ix-transcript').click();
  const dialog=await page.locator('#ix-transcript-dialog').boundingBox();
  assert(dialog.x>=0&&dialog.x+dialog.width<=width+1);
  await page.close();
 }
 console.log('PASS: real top sign-in, institutional images, QR, full-width layout, scrolling hero, writing preview count and transcript at 360/390/820/1440.');
}finally{await browser.close();}
