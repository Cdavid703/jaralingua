const {chromium,webkit}=require(process.env.PLAYWRIGHT_MODULE||'C:/Users/USER/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const fs=require('node:fs'),path=require('node:path');
const base=process.env.UNIT6_BASE_URL||'https://www.jaralingua.com',qa=path.resolve(__dirname,'../qa/unit6-layout');fs.mkdirSync(qa,{recursive:true});
const files=['practice-unit-6-countable-uncountable-food.html','practice-unit-6-food-quantities.html','practice-unit-6-containers-portions.html','practice-unit-6-food-vocabulary-memory.html','conversation-coach-unit-6-restaurant.html','unit-6-fabulous-food.html'];
const sizes=[[360,800],[390,844],[768,1024],[820,1180],[834,1194],[1024,768],[1180,820],[1440,1000]];
(async()=>{const report=[];
 for(const [name,engine] of [['webkit',webkit],['chromium',chromium]]){
  const b=await engine.launch({headless:true,...(name==='chromium'?{channel:'chrome'}:{})});
  for(const file of files){
   const p=await b.newPage({hasTouch:true,isMobile:true});await p.route('https://accounts.google.com/**',r=>r.fulfill({body:''}));await p.route('**/api/**',r=>r.fulfill({status:503,body:'{"error":"layout audit: no live API"}'}));
   await p.goto(base+'/ingles/basico-2/'+file,{waitUntil:'networkidle'});
   if(file.includes('restaurant')){await p.locator('#startConversationButton').click();await p.locator('#interviewPanel').waitFor({state:'visible'});await p.locator('#answerSupport summary').click();await p.locator('.nora-mic-settings summary').click();}
   if(file.includes('memory'))await p.evaluate(()=>document.querySelectorAll('.fp-memory-card').forEach(e=>{e.classList.add('is-open');e.querySelector('.fp-front').hidden=false;e.querySelector('.fp-back').hidden=true}));
   if(file==='unit-6-fabulous-food.html')await p.evaluate(()=>document.querySelectorAll('.food-topic,.food-more').forEach(e=>e.open=true));
   for(const [w,h] of sizes){await p.setViewportSize({width:w,height:h});const failures=await p.evaluate(()=>{
    const failures=[],r=e=>e.getBoundingClientRect(),visible=e=>r(e).width>0&&r(e).height>0;
    if(document.documentElement.scrollWidth>innerWidth+1)failures.push({issue:'page overflow',width:document.documentElement.scrollWidth,elements:[...document.querySelectorAll('main *')].filter(e=>visible(e)&&r(e).right>innerWidth+2).slice(0,8).map(e=>e.id||e.className||e.tagName)});
    for(const e of document.querySelectorAll('.fp-question')){const c=r(e.querySelector('.fp-choices')),l=r(e.querySelector('legend'));if(c.width<140||c.top<l.bottom-1)failures.push({issue:'question overlap/width',id:e.dataset.question,width:c.width});}
    for(const e of document.querySelectorAll('.fp-memory-card')){const t=r(e.querySelector('.fp-front strong')),c=r(e);if(t.right>c.right-2||t.left<c.left+2||t.bottom>c.bottom-2)failures.push({issue:'memory word outside card',text:e.querySelector('strong').textContent});}
    const host=document.querySelector('.jl-page-qr-host'),qr=document.querySelector('.jl-page-qr-card');if(host&&qr){const q=r(qr);for(const e of host.children){if(e===qr||!visible(e))continue;const a=r(e);if(a.left<q.right&&a.right>q.left&&a.top<q.bottom&&a.bottom>q.top)failures.push({issue:'QR overlap',element:e.className||e.tagName});}}
    for(const e of document.querySelectorAll('.coach-speed,.coach-audio-row,.coach-stage,.coach-recorder,.nora-record-row,.coach-feedback-grid'))if(visible(e)&&e.scrollWidth>e.clientWidth+2)failures.push({issue:'coach internal overflow',element:e.className,width:e.clientWidth,scroll:e.scrollWidth});
    for(const e of document.querySelectorAll('.lesson-hero,.coach-hero,.site-header'))if(['fixed','sticky'].includes(getComputedStyle(e).position))failures.push({issue:'fixed hero/header',element:e.className});
    return failures;
   });if(failures.length)report.push({engine:name,file,width:w,height:h,failures});
   if(name==='webkit'&&[360,820,1180].includes(w)){await p.locator(file.includes('restaurant')?'#interviewPanel':file==='unit-6-fabulous-food.html'?'.food-shell':'#foodPractice').scrollIntoViewIfNeeded();await p.screenshot({path:path.join(qa,`${file.replace('.html','')}-${w}.png`)});}
   }
   await p.close();
  }await b.close();
 }
 fs.writeFileSync(path.join(qa,'report.json'),JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));console.log('Audited five activities and teaching page in two engines, eight viewports each.');if(process.env.UNIT6_ASSERT_CLEAN&&report.length)process.exit(1);
})().catch(e=>{console.error(e);process.exit(1)});
