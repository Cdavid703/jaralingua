const assert=require('node:assert/strict');
const {chromium}=require('C:/Users/USER/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
(async()=>{const b=await chromium.launch({channel:'chrome',headless:true});try{
for(const width of [390,1440]){const page=await b.newPage({viewport:{width,height:844}});let role='teacher';const blocked=[];page.on('console',m=>{if(m.text().includes('violates')&&m.text().includes('img-src'))blocked.push(m.text())});
const entry={id:'test',movieTitle:'Test film',studentName:'Test student',imageUrl:'/api/intermediate2/film-festival/image?id=test',submittedAt:new Date().toISOString(),receiptId:'test',origin:'ai',phrasalVerb:'stand out',idiom:'steal the show'};
const room={id:'test',name:'Test class',code:'TESTCODE',count:1,closed:false};
await page.route('**/assets/js/google-auth.js*',r=>r.fulfill({contentType:'application/javascript',body:'window.JaraLinguaAuth={getUser:()=>({credential:"test",provider:"local"})};'}));
await page.route('**/api/intermediate2/film-festival/**',r=>{if(r.request().url().includes('/image?'))return r.fulfill({contentType:'image/png',path:'tmp/film-festival-qa/test-image.png'});return r.fulfill({json:{role,name:'Test',classes:[room],class:room,entries:[entry],entry}})});
if(!process.env.LIVE)await page.route('**/assets/js/english-intermediate2-film-festival.js*',r=>r.fulfill({path:process.env.BASELINE?'tmp/film-festival-ios/before.js':'assets/js/english-intermediate2-film-festival.js'}));
const response=await page.goto('https://www.jaralingua.com/ingles/intermediate-2/speaking-unit-4-film-festival.html',{waitUntil:'networkidle'});assert(response.headers()['content-security-policy'].includes("img-src 'self' data:"));
const decoded=selector=>page.waitForFunction(s=>{const e=document.querySelector(s);return e&&!e.hidden&&e.complete&&e.naturalWidth>0},selector,{timeout:5000});
await decoded('.ff-entry img');await page.locator('.ff-entry-project').click();await decoded('#ff-project-image');await page.locator('#ff-project-close').click();await page.locator('#ff-refresh').click();await decoded('.ff-entry img');
role='student';await page.evaluate(()=>window.dispatchEvent(new Event('jaralingua:auth-changed')));await decoded('#ff-preview');assert.equal(blocked.length,0,blocked.join('\n'));
console.log('PASS',width,'gallery, projection, refresh and student receipt image under production CSP');await page.close();}
}finally{await b.close()}})().catch(e=>{console.error(e);process.exit(1)});
