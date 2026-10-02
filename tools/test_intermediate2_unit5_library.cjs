const assert=require('node:assert/strict'),fs=require('node:fs');
const {chromium}=require('C:/Users/USER/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
(async()=>{const b=await chromium.launch({channel:'chrome',headless:true});try{
 const p=await b.newPage({viewport:{width:1440,height:900}});
 if(!process.env.LIVE)await p.route('https://www.jaralingua.com/ingles/intermediate/idioms.html',async r=>{const response=await r.fetch();await r.fulfill({response,body:fs.readFileSync('ingles/intermediate/idioms.html','utf8')})});
 await p.goto('https://www.jaralingua.com/ingles/intermediate/idioms.html',{waitUntil:'networkidle'});
 const terms=JSON.parse(fs.readFileSync('tmp/unit5-explanation/expressions.json','utf8'));
 const names=await p.locator('.idiom-btn-title').allTextContents();assert.equal(names.filter(x=>/under the weather/i.test(x)).length,1);
 for(const [term] of terms){await p.locator('.idiom-btn-title').getByText(term,{exact:true}).click().catch(async()=>{await p.getByText(term,{exact:true}).first().click()});const button=p.locator('#expression-title .expression-pronunciation');assert((await button.textContent()).includes(term));await button.click();await p.waitForFunction(()=>document.querySelector('.expression-pronunciation')?.getAttribute('aria-pressed')==='true');}
 console.log('PASS: all 12 expressions render and play; no duplicate Under the weather entry.');
}finally{await b.close()}})().catch(e=>{console.error(e);process.exit(1)});

