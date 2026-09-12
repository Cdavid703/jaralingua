const {chromium}=require('C:/Users/USER/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),http=require('node:http');
const root=process.cwd(),folder=path.join(root,'ingles/basico-2');
const inventory=fs.readdirSync(folder).filter(f=>/^pronunciation-unit-.*\.html$/.test(f)).sort();
const source=fs.readFileSync(path.join(folder,'pronunciation-library.html'),'utf8');
const lab=fs.readFileSync(path.join(folder,'practice-lab.html'),'utf8');
const linked=[...source.matchAll(/href="(pronunciation-unit-[^"]+\.html)"/g)].map(m=>m[1]).sort();
assert.deepEqual(linked,inventory,'Library must include every pronunciation activity exactly once');
for(const file of inventory)assert.ok(lab.includes('href="'+file+'"'),'Practice Lab entry must remain: '+file);
assert.doesNotMatch(source,/0%|<details[^>]*\bopen\b|reserved/i);
for(const m of source.matchAll(/(?:src|href)="([^"?#]+)(?:[?#][^"]*)?"/g))if(!/^https?:/.test(m[1])&&!m[1].startsWith('#'))assert.ok(fs.existsSync(m[1].startsWith('/')?path.join(root,m[1]):path.resolve(folder,m[1])),m[1]);

(async()=>{
 let server;
 let base=process.env.PRON_LIBRARY_TEST_BASE_URL;
 if(!base){server=http.createServer((req,res)=>{const name=decodeURIComponent(new URL(req.url,'http://localhost').pathname);const p=path.resolve(root,'.'+name);if(!p.startsWith(root+path.sep)){res.writeHead(403).end();return;}fs.readFile(p,(e,b)=>{if(e){res.writeHead(404).end();return;}const type={'.html':'text/html','.js':'text/javascript','.css':'text/css','.png':'image/png','.webp':'image/webp','.svg':'image/svg+xml','.woff2':'font/woff2'}[path.extname(p)]||'application/octet-stream';res.writeHead(200,{'Content-Type':type});res.end(b);});});await new Promise(r=>server.listen(0,'127.0.0.1',r));base='http://127.0.0.1:'+server.address().port;}
 const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'});
 try{
  const page=await browser.newPage({viewport:{width:1440,height:900}}),errors=[];
  page.on('pageerror',e=>errors.push(e.message));await page.route('https://accounts.google.com/**',r=>r.abort());
  await page.goto(base+'/ingles/basico-2/pronunciation-library.html',{waitUntil:'networkidle'});
  const out=path.join(process.env.TEMP||'.','jaralingua-pronunciation-library-qa');fs.mkdirSync(out,{recursive:true});
  for(const [width,columns] of [[1440,4],[1024,3],[768,2],[500,2],[390,1],[320,1]]){
   await page.setViewportSize({width,height:900});
   await page.locator('.pron-library-card').last().scrollIntoViewIfNeeded();await page.evaluate(()=>scrollTo(0,0));
   await page.waitForFunction(()=>[...document.images].every(i=>i.complete&&i.naturalWidth>0));
   const d=await page.evaluate(()=>({width:innerWidth,scroll:document.documentElement.scrollWidth,shell:document.querySelector('.pron-library-shell').getBoundingClientRect().width,columns:getComputedStyle(document.querySelector('.pron-library-grid')).gridTemplateColumns.split(' ').length,hero:getComputedStyle(document.querySelector('.pron-library-hero')).position,header:getComputedStyle(document.querySelector('.site-header')).position,qr:document.querySelector('.hero-text .jl-page-qr-card')!==null}));
   assert.ok(d.scroll<=width+2,JSON.stringify(d));assert.ok(d.shell>=width-46);assert.equal(d.columns,columns);assert.ok(!['fixed','sticky'].includes(d.hero));assert.ok(!['fixed','sticky'].includes(d.header));assert.ok(d.qr);
   assert.equal(await page.locator('details[open]').count(),0);
   assert.ok(await page.locator('.site-header .auth-trigger').isVisible(),'Top sign-in must be visible');
   if([1440,390].includes(width))await page.screenshot({path:path.join(out,'library-'+width+'.png'),fullPage:true});
   await page.locator('.jl-page-qr-open').click();const qr=await page.locator('.jl-page-qr-dialog').boundingBox();assert.ok(Math.abs(qr.x+qr.width/2-width/2)<2);await page.locator('.jl-page-qr-close').click();
  }
  for(const file of inventory){const r=await page.request.get(base+'/ingles/basico-2/'+file);assert.equal(r.status(),200,file);}
  await page.setViewportSize({width:1440,height:900});await page.goto(base+'/ingles/basico-2/index.html',{waitUntil:'networkidle'});
  assert.equal(await page.locator('#pronunciation-library-card').count(),1);assert.equal(await page.locator('#listening-library-card + #pronunciation-library-card').count(),1);
  const numbers=await page.locator('.course-dashboard .section-number').allTextContents();assert.deepEqual(numbers,Array.from({length:10},(_,i)=>String(i+1).padStart(2,'0')));
  await page.locator('#pronunciation-library-card').scrollIntoViewIfNeeded();await page.screenshot({path:path.join(out,'home-card.png')});
  await page.locator('#pronunciation-library-card a').click();assert.ok(page.url().endsWith('/pronunciation-library.html'));
  assert.deepEqual(errors,[]);console.log('PASS: catalog matches all '+inventory.length+' activities; original Practice Lab links preserved; 6 widths; images; scrolling hero/header; top auth; centered QR; home card and numbering. Screenshots: '+out);
 }finally{await browser.close();if(server)await new Promise(r=>server.close(r));}
})().catch(e=>{console.error(e);process.exit(1);});
