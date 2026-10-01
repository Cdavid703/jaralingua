const {chromium,webkit}=require(process.env.PLAYWRIGHT_MODULE||'C:/Users/USER/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict'),path=require('node:path'),fs=require('node:fs');
const base=process.env.FOOD_QUANTITIES_BASE_URL||'http://127.0.0.1:8046';
const sizes=[[360,800],[390,844],[768,1024],[820,1180],[834,1194],[1024,768],[1180,820],[1194,834],[1440,1000]];
const qa=path.resolve(__dirname,'../qa/food-quantities');fs.mkdirSync(qa,{recursive:true});
(async()=>{
 for(const [name,engine] of [['webkit',webkit],['chromium',chromium]]){
  const browser=await engine.launch({headless:true,...(name==='chromium'?{channel:'chrome'}:{})});
  const page=await browser.newPage({hasTouch:true,isMobile:true});const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.route('https://accounts.google.com/**',r=>r.fulfill({body:''}));
  await page.goto(base+'/ingles/basico-2/practice-unit-6-food-quantities.html',{waitUntil:'networkidle'});
  assert.equal(await page.locator('.fp-question').count(),15);
  async function imagesLoaded(){
   assert.equal(await page.locator('.fp-question img').count(),15,'Every question needs its food image');
   await page.locator('.fp-question img').evaluateAll(imgs=>Promise.all(imgs.map(img=>{img.loading='eager';return Promise.race([img.decode(),new Promise((_,reject)=>setTimeout(()=>reject(new Error('Image timed out: '+img.src)),15000))]);})));
   assert(await page.locator('.fp-question img').evaluateAll(imgs=>imgs.every(img=>img.naturalWidth>0&&img.naturalHeight>0)));
   assert((await page.locator('.fp-question').nth(5).locator('img').getAttribute('src')).endsWith('/butter.png'));
   assert((await page.locator('.fp-question').nth(9).locator('img').getAttribute('src')).endsWith('/vegetable-soup.webp'));
  }
  await imagesLoaded();
  for(const [width,height] of sizes){
   await page.setViewportSize({width,height});await page.evaluate(()=>scrollTo(0,0));
   async function geometry(){
    const result=await page.evaluate(()=>{
     const failures=[],rect=e=>e.getBoundingClientRect();
     if(document.documentElement.scrollWidth>innerWidth+1)failures.push('horizontal overflow');
     for(const field of document.querySelectorAll('.fp-question')){
      const id=field.dataset.question,f=rect(field),l=rect(field.querySelector('legend')),choices=field.querySelector('.fp-choices'),c=rect(choices),img=field.querySelector('img');
      if(c.width<140)failures.push(id+': collapsed choices '+c.width);
      if(c.top<l.bottom-1)failures.push(id+': options overlap question');
      if(c.right>f.right-5||c.bottom>f.bottom-5)failures.push(id+': options outside card');
      if(img&&c.right>rect(img).left-4)failures.push(id+': options overlap picture');
      for(const label of choices.querySelectorAll('label')){
       const a=rect(label),s=rect(label.querySelector('span')),r=rect(label.querySelector('input'));
       if(a.height<44||s.left<r.right||s.right>a.right-3||s.bottom>a.bottom-3)failures.push(id+': label layout');
      }
      const feedback=field.querySelector('.fp-feedback');if(!feedback.hidden&&rect(feedback).top<c.bottom)failures.push(id+': feedback overlap');
     }
     const hero=document.querySelector('.lesson-hero');if(['fixed','sticky'].includes(getComputedStyle(hero).position))failures.push('fixed hero');
     const qr=document.querySelector('.jl-page-qr-card');if(qr){const q=rect(qr);for(const el of document.querySelectorAll('.lesson-hero-content h1,.lesson-hero-content .hero-copy,.hero-actions')){const r=rect(el);if(r.left<q.right&&r.right>q.left&&r.top<q.bottom&&r.bottom>q.top)failures.push('QR text overlap');}}
     return failures;
    });assert.deepEqual(result,[],`${name} ${width}x${height}`);
   }
   await geometry();await page.locator('#fpCheck').click();await geometry();
   const radios=page.locator('input[name="question-0"]');await radios.nth(0).tap();await radios.nth(2).tap();assert(await radios.nth(2).isChecked());
   await page.locator('#fpCheck').click();await radios.nth(1).tap();assert(await radios.nth(1).isChecked());
   await page.locator('#fpReset').click();assert.equal(await page.locator('input:checked').count(),0);await imagesLoaded();await geometry();
   if([390,820,1180].includes(width)){await page.evaluate(()=>scrollTo(0,0));await page.screenshot({path:path.join(qa,`${name}-${width}-hero.png`)});await page.locator('#foodPractice').scrollIntoViewIfNeeded();await page.screenshot({path:path.join(qa,`${name}-${width}-questions.png`)});}
  }
  await page.locator('.fp-question').nth(5).screenshot({path:path.join(qa,`${name}-butter.png`)});
  await page.locator('.fp-question').nth(9).screenshot({path:path.join(qa,`${name}-soup.png`)});
  assert.deepEqual(errors,[]);console.log('PASS '+name+': all 15 food images decoded (including after reset), nine viewports, card bounds, heading/image/options/feedback separation, touch answer changes, check/reset, QR and scrolling hero.');await browser.close();
 }
})().catch(e=>{console.error(e);process.exit(1)});
