const {chromium,webkit}=require(process.env.PLAYWRIGHT_MODULE||'C:/Users/USER/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict');
const base=process.env.MARKET_BASE_URL||'http://127.0.0.1:8046';
(async()=>{
 for(const [name,engine] of [['webkit',webkit],['chromium',chromium]]){
  const browser=await engine.launch({headless:true,...(name==='chromium'?{channel:'chrome'}:{})});
  const page=await browser.newPage({hasTouch:true});
  await page.route('https://accounts.google.com/**',r=>r.fulfill({body:''}));
  await page.goto(base+'/ingles/basico-2/practice-lab.html',{waitUntil:'networkidle'});
  const folder=page.locator('#unit-6-folder');
  assert.equal(await folder.getAttribute('open'),null);
  await folder.locator('summary').click();
  assert.equal(await folder.locator('.course-section-card').count(),9);
  const card=folder.locator('.course-section-card').filter({has:page.getByRole('heading',{name:'Market Basket Challenge',exact:true})});
  assert.equal(await card.count(),1);
  assert.equal(await card.locator('a').getAttribute('href'),'/ingles/intermediate/practice-unit-5-countable-uncountable-food.html');
  for(const [width,height] of [[390,844],[820,1180],[1180,820],[1440,900]]){
   await page.setViewportSize({width,height});
   await card.scrollIntoViewIfNeeded();
   await card.locator('img').evaluate(img=>img.decode());
   assert(await card.evaluate(el=>{const r=el.getBoundingClientRect();return r.left>=0&&r.right<=innerWidth+1;}),'New card outside viewport');
   assert(await card.locator('a').isVisible());
  }
  await card.locator('a').click();
  await page.waitForLoadState('networkidle');
  await page.getByRole('heading',{name:'Market Basket Challenge',exact:true}).waitFor();
  assert.equal(await page.locator('[data-food]').count(),12);
  assert.equal(await page.locator('[data-quantity-card]').count(),8);
  for(const [width,height] of [[360,800],[390,844],[820,1180],[1180,820],[1440,900]]){
    await page.setViewportSize({width,height});await page.evaluate(()=>scrollTo(0,0));
    await page.locator('.mb-qr img').evaluate(img=>img.decode());
    const issues=await page.evaluate(()=>{const bad=[],r=e=>e.getBoundingClientRect();if(document.documentElement.scrollWidth>innerWidth+1)bad.push('overflow');const hero=document.querySelector('.market-hero');if(r(hero).height>(innerWidth>900?570:700))bad.push('oversized hero');for(const e of [hero,document.querySelector('.site-header')])if(['fixed','sticky'].includes(getComputedStyle(e).position))bad.push('fixed banner');const q=r(document.querySelector('.mb-qr'));for(const e of document.querySelectorAll('.market-title-block h1,.market-title-block .eyebrow')){const a=r(e);if(a.left<q.right&&a.right>q.left&&a.top<q.bottom&&a.bottom>q.top)bad.push('QR overlap');}return bad;});
    assert.deepEqual(issues,[],name+' '+width);
    await page.locator('#marketQrOpen').click();const box=await page.locator('#marketQrDialog').boundingBox();assert(Math.abs(box.x+box.width/2-width/2)<2);assert(Math.abs(box.y+box.height/2-height/2)<2);await page.locator('#marketQrClose').click();
    if(width===390||width===1440)await page.screenshot({path:require('node:path').resolve(__dirname,'../qa/market-'+name+'-'+width+'.png')});
  }
  await page.locator('[data-food="0"]').click();
  await page.locator('[data-category="countable"]').click();
  assert.equal(await page.locator('#liveSorted').innerText(),'1/12');
  console.log('PASS '+name+': closed Unit 6 folder, nine cards, original link, responsive card and original sorting interaction.');
  await browser.close();
 }
})().catch(e=>{console.error(e);process.exit(1)});
