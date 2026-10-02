const {chromium}=require('C:/Users/USER/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict'),fs=require('node:fs');
const base=process.env.UNIT6_BASE_URL||'http://127.0.0.1:8025';
const files=['practice-unit-6-countable-uncountable-food','practice-unit-6-food-quantities','practice-unit-6-containers-portions','practice-unit-6-food-vocabulary-memory','conversation-coach-unit-6-restaurant','audio-listening-unit-6-lunch-at-maple-cafe'];
fs.mkdirSync('tmp/unit6-responsive',{recursive:true});
(async()=>{const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
try{for(const file of files){const p=await browser.newPage({hasTouch:true});
 await p.goto(base+'/ingles/basico-2/'+file+'.html',{waitUntil:'networkidle'});await p.locator('.jl-page-qr-open').waitFor();
 for(const width of [320,390,600,768,820,1024,1440]){
  await p.setViewportSize({width,height:900});await p.evaluate(()=>scrollTo(0,0));
  assert.ok(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),file+' overflow '+width);
  const hero=p.locator('.lesson-hero,.coach-hero').first();assert.ok(!['sticky','fixed'].includes(await hero.evaluate(e=>getComputedStyle(e).position)));
  const title=await p.locator('h1').boundingBox(),qr=await p.locator('.jl-page-qr-card').boundingBox();assert.ok(title.x+title.width<=qr.x+2||title.y>=qr.y+qr.height-2||title.y+title.height<=qr.y,file+' title overlaps QR '+width);
  assert.equal(await p.locator('details[open]').count(),0);
  for(const el of await p.locator('.fp-choices').all())assert.ok(await el.evaluate(e=>{const f=e.closest('fieldset'),s=getComputedStyle(f);return e.getBoundingClientRect().width>=f.clientWidth-parseFloat(s.paddingLeft)-parseFloat(s.paddingRight)-2;}),file+' narrow choices');
  if(width===390||width===820)await p.screenshot({path:`tmp/unit6-responsive/${file}-${width}.png`});
  await p.locator('.jl-page-qr-open').click();const modal=await p.locator('#jlPageQrDialog').boundingBox();assert.ok(Math.abs(modal.x+modal.width/2-width/2)<3);await p.locator('.jl-page-qr-close').click();
  await p.evaluate(()=>scrollTo(0,700));assert.ok(await hero.evaluate(e=>e.getBoundingClientRect().top<0));
 }
 if(await p.locator('.fp-question').count()){const first=p.locator('.fp-question').first();await first.locator('label').nth(0).click();await first.locator('label').nth(1).click();assert.ok(await first.locator('input').nth(1).isChecked());await p.locator('#fpCheck').click();await first.locator('label').nth(2).click();assert.ok(await first.locator('input').nth(2).isChecked());}
 console.log('PASS seven widths, QR, scroll and controls: '+file);await p.close();
} }finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
