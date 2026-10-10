const assert=require('node:assert/strict'),fs=require('node:fs');
const {chromium}=require('playwright');
const origin=process.env.PRONUNCIATION_ORIGIN||'http://127.0.0.1:8139';
const items=JSON.parse(fs.readFileSync('assets/data/english-intermediate-2-content.json')).items.filter(x=>x.type==='pronunciation'&&x.status==='published');
const expected=items.map(x=>x.workshopHref).sort();
const inventory=fs.readdirSync('ingles/intermediate-2').filter(x=>/^pronunciation-unit-.*\.html$/.test(x));
for(const name of inventory)assert(expected.includes('/ingles/intermediate-2/'+name),'Activity missing from library: '+name);
assert.equal(items.length,7);
(async()=>{const b=await chromium.launch({headless:true});try{
 for(const width of [320,390,768,1024,1440,1920]){
  const p=await b.newPage({viewport:{width,height:950}});const errors=[];p.on('pageerror',e=>errors.push(e.message));await p.route('https://accounts.google.com/**',r=>r.abort());
  await p.goto(origin+'/ingles/intermediate-2/pronunciation-library.html',{waitUntil:'networkidle'});
  assert.deepEqual((await p.locator('.pron-library-card a').evaluateAll(ns=>ns.map(n=>n.getAttribute('href')))).sort(),expected);
  assert(await p.locator('.pron-library-card img, .pron-library-hero figure img').evaluateAll(ns=>ns.every(i=>i.complete&&i.naturalWidth>0)));
  const columns=await p.locator('.pron-library-grid').evaluate(e=>getComputedStyle(e).gridTemplateColumns.split(' ').length);assert.equal(columns,width>=1200?4:width>900?3:width>=480?2:1);
  assert(await p.locator('.pron-library-hero figure img').evaluate(e=>getComputedStyle(e).objectFit==='contain'));
  await p.locator('.jl-page-qr-open').click();assert(await p.locator('.jl-page-qr-dialog').isVisible());await p.keyboard.press('Escape');
  assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'overflow '+width);
  assert.equal(await p.locator('details[open]').count(),0);
  if([390,1440].includes(width))await p.screenshot({path:'/private/tmp/pronunciation-library-'+width+'.png'});
  const old=await p.locator('.pron-library-hero').boundingBox();await p.evaluate(()=>scrollTo(0,400));assert((await p.locator('.pron-library-hero').boundingBox()).y<old.y);
  assert.deepEqual(errors,[]);
  if(width===1440){await p.goto(origin+'/ingles/intermediate-2/practice-lab.html',{waitUntil:'networkidle'});for(const x of items){await p.locator('a.ie2-lab-card[href="'+x.workshopHref+'"]').waitFor({state:'attached'});}
   await p.goto(origin+'/ingles/intermediate-2/index.html',{waitUntil:'networkidle'});assert.equal(await p.locator('a.intermediate2-card-action[href="pronunciation-library.html"]').count(),1);
  }
  console.log('PASS library',width,'seven original links, complete images, grid, QR and navigation');await p.close();
 }
}finally{await b.close()}})().catch(e=>{console.error(e);process.exit(1)});
