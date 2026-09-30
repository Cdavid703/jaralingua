const {chromium,webkit}=require(process.env.PLAYWRIGHT_MODULE||'C:/Users/USER/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict'),path=require('node:path'),fs=require('node:fs');
const base=process.env.COUNTABLE_BASE_URL||'http://127.0.0.1:8046',qa=path.resolve(__dirname,'../qa/countable-pictures');fs.mkdirSync(qa,{recursive:true});
(async()=>{
 for(const [name,engine] of [['webkit',webkit],['chromium',chromium]]){
  const browser=await engine.launch({headless:true,...(name==='chromium'?{channel:'chrome'}:{})});
  const page=await browser.newPage({hasTouch:true,isMobile:true});const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.route('https://accounts.google.com/**',r=>r.fulfill({body:''}));
  await page.goto(base+'/ingles/basico-2/practice-unit-6-countable-uncountable-food.html',{waitUntil:'networkidle'});
  assert.equal(await page.locator('.cq-picture').count(),15);
  const urls=await page.locator('.cq-food-image').evaluateAll(images=>images.map(i=>i.src));
  for(const url of new Set(urls)){const response=await page.request.get(url);assert(response.ok(),url);assert((await response.body()).length>1000,url);}
  for(const [width,height] of [[360,800],[390,844],[768,1024],[820,1180],[834,1194],[1024,768],[1180,820],[1440,1000]]){
   await page.setViewportSize({width,height});
   const failures=await page.evaluate(()=>{
    const out=[],rect=e=>e.getBoundingClientRect();if(document.documentElement.scrollWidth>innerWidth+1)out.push('page overflow');
    for(const field of document.querySelectorAll('.fp-question')){
     const id=field.dataset.question,f=rect(field),l=rect(field.querySelector('legend')),p=rect(field.querySelector('.cq-picture')),c=rect(field.querySelector('.fp-choices'));
     if(p.width<185||p.height<195)out.push(id+': picture too small');
     if(p.top<l.bottom-1||c.top<l.bottom-1)out.push(id+': heading overlap');
     if(c.width<145||p.left<f.left||p.right>f.right||c.right>f.right||Math.max(p.bottom,c.bottom)>f.bottom)out.push(id+': invalid card bounds');
     if(p.left<c.right-1&&p.right>c.left+1&&p.top<c.bottom-1&&p.bottom>c.top+1)out.push(id+': image overlaps options');
    }
    if(['sticky','fixed'].includes(getComputedStyle(document.querySelector('.lesson-hero')).position))out.push('fixed hero');return out;
   });assert.deepEqual(failures,[],name+' '+width);
   await page.locator('.cq-picture').first().tap();await page.locator('.cq-image-dialog').waitFor({state:'visible'});
   const box=await page.locator('.cq-image-dialog').boundingBox();assert(Math.abs(box.x+box.width/2-width/2)<2);assert(Math.abs(box.y+box.height/2-height/2)<2);
   await page.waitForFunction(()=>{const i=document.querySelector('.cq-image-dialog img');return i.complete&&i.naturalWidth>0});
   if(width===820)await page.screenshot({path:path.join(qa,name+'-ipad-enlarged.png')});
   await page.locator('.cq-close').tap();await page.waitForFunction(()=>document.body.style.overflow==='');assert.equal(await page.evaluate(()=>document.body.style.overflow),'');
   const radios=page.locator('input[name="question-0"]');await radios.nth(0).tap();await radios.nth(2).tap();assert(await radios.nth(2).isChecked());await page.locator('#fpCheck').click();await radios.nth(1).tap();assert(await radios.nth(1).isChecked());
   await page.locator('#fpReset').click();await page.waitForFunction(()=>document.querySelectorAll('.cq-picture').length===15);assert.equal(await page.locator('input:checked').count(),0);
   await page.locator('.cq-picture').nth(11).click();assert.match(await page.locator('.cq-image-dialog img').getAttribute('src'),/two-coffees/);await page.keyboard.press('Escape');assert(!await page.locator('.cq-image-dialog').isVisible());
   if([390,820,1440].includes(width)){await page.locator('.fp-question').first().scrollIntoViewIfNeeded();await page.screenshot({path:path.join(qa,name+'-'+width+'.png')});}
  }
  assert.deepEqual(errors,[]);console.log('PASS '+name+': 15 relevant pictures, resources, 8 viewports, image sizing, no overlap, centered enlargement, close/Escape/focus, answer changes/check/reset.');await browser.close();
 }
})().catch(e=>{console.error(e);process.exit(1)});
