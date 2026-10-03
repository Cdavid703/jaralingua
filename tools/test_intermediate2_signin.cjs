/* Visibility/interaction audit only: no real login or academic requests. */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require('playwright');
const root = path.resolve(__dirname, '..');
const pages = process.env.AUTH_PAGES ? process.env.AUTH_PAGES.split(',') : fs.readdirSync(path.join(root, 'ingles/intermediate-2')).filter(x => x.endsWith('.html')).sort();
const widths = (process.env.AUTH_WIDTHS || '360,390,768,1024,1440').split(',').map(Number);
const origin = process.env.AUTH_ORIGIN || 'http://127.0.0.1:8137';
const failures = [];
const staticCache = new Map();
async function reachable(locator, label) {
  assert.equal(await locator.count(), 1, label + ': must have one control');
  const result = await locator.evaluate(el => {
    const r = el.getBoundingClientRect();
    const x=(r.left+r.right)/2,y=(r.top+r.bottom)/2;
    const points = [[x,r.top+4],[x,r.bottom-4],[r.left+4,y],[r.right-4,y],[x,y]];
    return {rect:r.toJSON(),vw:innerWidth,vh:innerHeight,hit:points.every(([x,y])=>el.contains(document.elementFromPoint(x,y)))};
  });
  const r = result.rect;
  assert(r.width > 0 && r.height > 0 && r.left >= 0 && r.right <= result.vw+1 && r.top >= 0 && r.bottom <= result.vh+1 && result.hit, label+': clipped, off-screen or covered '+JSON.stringify(result));
}
(async()=>{
 const browser=await chromium.launch({headless:true});
 try {
  for(const width of widths){
   const page=await browser.newPage({viewport:{width,height:900}});
   if(process.env.AUTH_NO_POPOVER)await page.addInitScript(()=>{HTMLElement.prototype.showPopover=undefined;HTMLElement.prototype.hidePopover=undefined;});
   await page.route('**/*',async route=>{
    const url=route.request().url();
    if(!url.startsWith(origin+'/'))return route.abort();
    if(url.includes('/api/'))return route.fulfill({status:401,json:{error:'Anonymous UI test'}});
    const type=route.request().resourceType();
    // Public audits may skip lesson media; keep the logo and all actual page code/styles.
    if(process.env.AUTH_LIGHT && (type==='media' || (type==='image' && !/logo|favicon/i.test(url))))return route.abort();
    if(process.env.AUTH_STATIC_CACHE && ['script','stylesheet','font'].includes(type)){
     if(!staticCache.has(url))staticCache.set(url,(async()=>{
      const response=await route.fetch();const headers=response.headers();
      delete headers['content-encoding'];delete headers['content-length'];delete headers['transfer-encoding'];
      return {status:response.status(),headers,body:await response.body()};
     })());
     return route.fulfill(await staticCache.get(url));
    }
    return route.continue();
   });
   page.setDefaultTimeout(5000);
   for(const name of pages){
    const label=name+' @ '+width;
    try{
     await page.goto(origin+'/ingles/intermediate-2/'+name,{waitUntil:'domcontentloaded',timeout:45000});
     const toggle=page.locator('[data-auth-toggle]'),panel=page.locator('[data-auth-panel]');
     await toggle.waitFor({state:'attached'});
     if(await panel.isVisible())await toggle.click();
     await reachable(toggle,label+' Sign in');
     if(!process.env.AUTH_BASELINE){
      // Scroll with the form closed: an open panel alone did not cover a disappearing trigger.
      await page.evaluate(()=>window.scrollTo(0,Math.min(1200,document.body.scrollHeight-innerHeight)));
      await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
      await reachable(toggle,label+' Sign in after page scroll');
     }
     await toggle.click();
     await panel.waitFor({state:'visible'});
     await reachable(panel,label+' panel');
     const email=panel.locator('input[name=email]'),password=panel.locator('input[name=password]');
     await reachable(email,label+' email');await email.fill('visibility-test@example.invalid');
     await reachable(password,label+' password');await password.fill('UI-test-only');
     await reachable(panel.locator('[data-local-login-form] button[type=submit]'),label+' submit');
     assert.equal(await email.inputValue(),'visibility-test@example.invalid');
     if(!process.env.AUTH_BASELINE){
      await page.evaluate(()=>window.scrollTo(0,Math.min(1200,document.body.scrollHeight-innerHeight)));
      await reachable(panel,label+' after page scroll');
      await page.setViewportSize({width,height:420});
      await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
      await reachable(panel,label+' short screen');
      await password.scrollIntoViewIfNeeded();await password.click();
      await panel.locator('.jl-auth-panel-dismiss').click();
      assert(await panel.isHidden(),label+' close failed');
      await page.setViewportSize({width,height:900});await page.evaluate(()=>scrollTo(0,0));
      await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
      await reachable(toggle,label+' Sign in after returning to top');
      assert(!await toggle.evaluate(el=>el.closest('.jl-auth-floating')),label+' control did not return to header');
      await toggle.click();await panel.waitFor({state:'visible'});await page.keyboard.press('Escape');
      assert(await panel.isHidden(),label+' Escape failed');
      assert.equal(await toggle.getAttribute('aria-expanded'),'false');
     }
     if(process.env.AUTH_SHOTS && ['index.html','speaking-unit-5-the-first-visit.html'].includes(name)){
      await page.evaluate(()=>scrollTo(0,0));if(await panel.isHidden())await toggle.click();
      fs.mkdirSync(process.env.AUTH_SHOTS,{recursive:true});await page.screenshot({path:path.join(process.env.AUTH_SHOTS,name+'-'+width+'.png')});
     }
    }catch(error){failures.push(label+': '+error.message);console.log('FAIL '+failures.at(-1));}
    await page.setViewportSize({width,height:900});
   }
   console.log('Audited '+pages.length+' pages at '+width+'px');await page.close();
  }
 }finally{await browser.close();}
 assert.equal(failures.length,0,failures.join('\n'));
 console.log('PASS: '+pages.length+' pages × '+widths.length+' widths; visible Sign in, usable form, scroll, short viewport and close controls.');
})().catch(error=>{console.error(error.message);process.exitCode=1;});
