const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const origin=process.env.NEWS_ORIGIN||'http://127.0.0.1:8139';
(async()=>{const browser=await chromium.launch({headless:true,channel:'chrome'});try{
for(const [width,height] of [[390,844],[768,1024],[1366,768],[1920,1080]]){
 const page=await browser.newPage({viewport:{width,height}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(origin+'/ingles/intermediate-2/final-oral-live-news-report.html');await page.locator('[data-reveal="0"]').waitFor();
 assert.equal(await page.locator('#topics [data-guide-slide]').count(),8);
 for(const topic of ['Flood','Earthquake','Hurricane','Drought','Wildfire','Landslide','A council repair announcement','A concert announcement'])assert((await page.locator('#topics').innerText()).includes(topic));
 assert.match(await page.locator('#exam').innerText(),/one natural disaster or news event/);
 for(const [section,count] of [['language',4],['topics',8],['exam',5]]){
  const opener=page.locator('[data-project-section="'+section+'"]');await opener.click();
  assert(await page.locator('#newsPrev').isDisabled());assert(await page.locator('#newsShowDialogue').isHidden());
  for(let i=0;i<count;i++){
   assert.equal(await page.locator('#newsProjection .news-guide-slide').count(),1);
   assert.match(await page.locator('#newsProjectRole').innerText(),new RegExp((i+1)+' / '+count+'$'));
   assert.equal(await page.locator('#newsProjection [id]').count(),0);
   const geometry=await page.locator('#newsProjection').evaluate(el=>({scroll:el.scrollHeight,height:el.clientHeight,width:el.scrollWidth,client:el.clientWidth,font:parseFloat(getComputedStyle(el.firstElementChild).fontSize)}));
   assert(geometry.width<=geometry.client+1,section+' horizontal overflow at '+width);
   if(width>=1366){assert(geometry.font>=32,section+' font too small');assert(geometry.scroll<=geometry.height+2,section+' slide '+i+' requires scrolling at '+width+': '+JSON.stringify(geometry));}
   if(section==='language'&&i===2){await page.locator('#newsProjection summary').click();assert.match(await page.locator('#newsProjection details[open]').innerText(),/they were asking for/);}
   if(section==='language'&&i===1)await page.screenshot({path:'/tmp/news-guide-'+width+'.png'});
   if(i<count-1)await page.locator('#newsNext').click();
  }
  assert(await page.locator('#newsNext').isDisabled());await page.keyboard.press('ArrowLeft');assert.match(await page.locator('#newsProjectRole').innerText(),new RegExp((count-1)+' / '+count+'$'));
  await page.keyboard.press('Escape');await page.waitForFunction(()=>!document.querySelector('#newsProjector').open);
  assert(await opener.evaluate(el=>document.activeElement===el));
 }
 assert.equal(await page.locator('[data-reveal]:disabled').count(),5,'guide navigation must not reveal story cards');
 await page.locator('[data-reveal="0"]').click();await page.locator('#newsCard0 [data-scene]').click();assert(await page.locator('#newsShowDialogue').isVisible());assert.equal(await page.locator('#newsProjection video').count(),1);assert(!(await page.locator('#newsProjector').getAttribute('class')||'').includes('news-guide-mode'));
 assert.deepEqual(errors,[]);assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));console.log('PASS guide projection and 8 topic choices '+width+'x'+height);await page.close();
}
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exit(1)});
