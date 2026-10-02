const assert=require('node:assert/strict');
const fs=require('node:fs');
const {chromium,webkit,devices}=require('C:/Users/USER/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
(async()=>{
 const browser=await (process.env.WEBKIT?webkit:chromium).launch(process.env.WEBKIT?{headless:true}:{channel:'chrome',headless:true});
 try{for(const width of [320,390,430,844,1440]){
 const page=await browser.newPage({...devices['iPhone 13'],viewport:{width,height:width===844?390:844},deviceScaleFactor:1});
 if(!process.env.LIVE)await page.route('https://www.jaralingua.com/**',route=>{const p=new URL(route.request().url()).pathname.slice(1);if(['assets/js/english-intermediate2-film-festival.js','assets/css/english-intermediate2-film-festival.css','ingles/intermediate-2/speaking-unit-4-film-festival.html'].includes(p))return route.fulfill({path:p});return route.continue()});
 await page.goto('https://www.jaralingua.com/ingles/intermediate-2/speaking-unit-4-film-festival.html',{waitUntil:'networkidle'});
 for(const selector of ['[data-auth-toggle]','#ff-signin']){
 await page.locator(selector).tap();
 const panel=page.locator('[data-auth-panel]');await panel.waitFor({state:'visible'});
 await page.locator('[data-google-button] iframe').waitFor({state:'visible'});
 assert(await panel.evaluate(el=>{const r=el.getBoundingClientRect();const g=el.querySelector('iframe').getBoundingClientRect();return r.top>=0&&r.bottom<=innerHeight+1&&r.left>=0&&r.right<=innerWidth+1&&g.width>0&&g.height>0&&g.top>=r.top&&g.bottom<=r.bottom&&el.contains(document.elementFromPoint(g.x+g.width/2,g.y+g.height/2))&&el.matches(':popover-open')}),String(width)+selector);
 if(selector==='#ff-signin')await page.screenshot({path:'tmp/film-festival-ios/'+(process.env.WEBKIT?'webkit':'chrome')+'-'+width+'.jpg'});
 await page.keyboard.press('Escape');await panel.waitFor({state:'hidden'});
 }
 await page.locator('.jl-page-qr-open').tap();await page.locator('.jl-page-qr-dialog').waitFor({state:'visible'});await page.keyboard.press('Escape');
 console.log('PASS',process.env.WEBKIT?'WebKit':'Chrome',width,'touch, Google iframe, top layer, scrolled opening, closing and QR');
 await page.close();
 }}finally{await browser.close()}
})().catch(e=>{console.error(e);process.exit(1)});
