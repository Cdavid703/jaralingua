/* Isolated account fixture: no real sign-in, cloud writes or academic submissions. */
const fs = require('fs');
const path = require('path');
const assert = require('node:assert/strict');
const { chromium } = require('playwright');
const pages = ['index.html', 'ingles/basico/index.html', 'ingles/basico-2/adventure-unit-1.html',
  'ingles/intermediate-2/index.html', 'frances/Niveau 1/index.html', 'frances/Niveau 8/index.html'];
(async () => {
  const browser = await chromium.launch({headless:true, executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'});
  let checks = 0;
  try {
    for (const name of pages) for (const [width,height] of [[360,800],[844,390],[1024,768]]) {
      const context = await browser.newContext({viewport:{width,height}, hasTouch:true});
      await context.addInitScript(() => sessionStorage.setItem('jaralingua_local_user', JSON.stringify({
        sub:'design-fixture', email:'design@example.invalid', name:'Estudiante de prueba con nombre largo',
        exp:Date.now()/1000+3600, credential:'isolated-fixture'
      })));
      const page = await context.newPage();
      await page.route('**/*', route => {
        const request=route.request(), url=new URL(request.url());
        if (url.origin!=='https://www.jaralingua.com' || request.method()!=='GET' || /^\/(api|data)\//.test(url.pathname))
          return route.fulfill({status:401,json:{error:'Isolated fixture'}});
        const file=path.join(process.cwd(),decodeURIComponent(url.pathname));
        return fs.existsSync(file)&&fs.statSync(file).isFile()?route.fulfill({path:file}):route.abort();
      });
      await page.goto('https://www.jaralingua.com/'+name,{waitUntil:'load'});
      const trigger=page.locator('[data-auth-nav-toggle], [data-auth-toggle]').filter({visible:true}).first();
      await trigger.waitFor();
      assert((await trigger.innerText()).includes("Estudiante"), name+" fixture remains signed in");
      assert(await trigger.evaluate(el => !!el.closest('.navbar')), name+' account belongs in navigation');
      const box=await trigger.boundingBox();
      assert(box.x>=0&&box.x+box.width<=width+1&&box.height>=40, name+' accessible account control '+JSON.stringify(box));
      await trigger.click();
      const panel=page.locator('[data-auth-panel]');
      await panel.waitFor({state:'visible'});
      const bounds=await panel.boundingBox();
      assert(bounds.x>=0&&bounds.y>=0&&bounds.x+bounds.width<=width+1&&bounds.y+bounds.height<=height+1, name+' account panel fits');
      assert(!/Progress synced|Progreso sincronizado|Progrès synchronisé/.test(await panel.innerText()), 'Must not claim an unconfirmed cloud save');
      await page.keyboard.press('Escape');
      await panel.waitFor({state:'hidden'});
      await context.close(); checks++; console.log(name, width, "passed");
    }
    console.log('PASS '+checks+' signed-in fixture checks: navigation, long names, panel bounds and Escape; no real account or submission.');
  } finally { await browser.close(); }
})().catch(error=>{console.error(error);process.exit(1)});
