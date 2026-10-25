/* QR-only browser audit. No authentication or academic requests. */
const fs=require('fs'),path=require('path'),assert=require('assert/strict'),{chromium}=require('playwright');
const root=process.cwd(),manifest=JSON.parse(fs.readFileSync(process.env.QR_MANIFEST||'/tmp/all-course-qr-manifest.json'));
const changed=new Set(manifest.changed),base='https://www.jaralingua.com';
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'});
 const results=[],failures=[],httpCache=new Map();let cursor=0;
 const names=process.env.QR_SAMPLE?JSON.parse(process.env.QR_SAMPLE):manifest.pages.filter(p=>p.startsWith('frances/')||/\/(index|course-overview|games|practice-lab)\.html$/.test(p)||p.includes('projector'));
 const tasks=names.flatMap(name=>(process.env.QR_SAMPLE?[390,844,820,1180,1440]:[390,1440]).map(width=>({name,width})));
 async function worker(){
  const context=await browser.newContext({reducedMotion:'reduce'});const p=await context.newPage();
  await p.route('**/*',async r=>{
   const req=r.request(),url=new URL(req.url());if(url.origin!==base||url.pathname.startsWith('/api/'))return r.abort();
   const name=decodeURIComponent(url.pathname).slice(1),local=path.join(root,name);
   if(req.resourceType()==='script'&&!name.endsWith('page-qr-access.js'))return r.abort();
   if(req.resourceType()==='image'&&!name.startsWith('assets/img/page-qr/'))return r.abort();
   if(name.endsWith('.html')&&!process.env.PUBLIC_ONLY){const f=changed.has(name)?local:path.join(process.env.QR_SNAPSHOT||'/tmp/qr-public-pages',name);return r.fulfill({contentType:'text/html',body:fs.readFileSync(f)});}
   if((name.endsWith('page-qr-access.js')||name.startsWith('assets/img/page-qr/'))&&!process.env.PUBLIC_ONLY)return r.fulfill({contentType:name.endsWith('.js')?'text/javascript':'image/svg+xml',body:fs.readFileSync(local)});
   try{if(!httpCache.has(req.url()))httpCache.set(req.url(),context.request.get(req.url()).then(async v=>({status:v.status(),headers:v.headers(),body:await v.body()})));return r.fulfill(await httpCache.get(req.url()));}catch{return r.abort();}
  });
  while(cursor<tasks.length){const t=tasks[cursor++];try{
   await p.setViewportSize({width:t.width,height:900});await p.goto(base+'/'+t.name,{waitUntil:'domcontentloaded'});
   await p.waitForFunction(()=>document.querySelector('.jl-page-qr-card img,.mb-qr img,.page-qr-card img')?.naturalWidth>0,{},{timeout:7000});
   assert.equal(await p.locator('.jl-page-qr-card,.mb-qr,.page-qr-card').count(),1);
   const card=p.locator('.jl-page-qr-card');if(await card.count()){
    const layout=await card.evaluate(el=>{const r=el.getBoundingClientRect(),host=el.parentElement;let overlap=false;const w=document.createTreeWalker(host,NodeFilter.SHOW_TEXT);while(w.nextNode()){const n=w.currentNode;if(!n.textContent.trim()||el.contains(n)||['SCRIPT','STYLE'].includes(n.parentElement.tagName))continue;const range=document.createRange();range.selectNodeContents(n);if([...range.getClientRects()].some(a=>a.width&&a.height&&a.left<r.right-1&&a.right>r.left+1&&a.top<r.bottom-1&&a.bottom>r.top+1))overlap=true;}return{left:r.left,right:r.right,overlap,width:innerWidth};});
    assert(layout.left>=-1&&layout.right<=t.width+1,'QR outside viewport '+JSON.stringify(layout));assert(!layout.overlap,'QR overlaps text');
    if(t.name.startsWith('frances/'))assert.match(await card.innerText(),/Scannez/);
    if(process.env.QR_SCREENSHOTS)await p.screenshot({path:'/tmp/qr-hero-'+t.name.replace(/[^a-z0-9]/gi,'-')+'-'+t.width+'.png'});await p.locator('.jl-page-qr-open').click({timeout:5000});assert(await p.locator('#jlPageQrDialog').evaluate(d=>d.open));
    if(process.env.QR_SCREENSHOTS)await p.screenshot({path:'/tmp/qr-'+t.name.replace(/[^a-z0-9]/gi,'-')+'-'+t.width+'.png'});const box=await p.locator('#jlPageQrDialog').boundingBox();assert(Math.abs(box.x+box.width/2-t.width/2)<2,'dialog off center');await p.locator('.jl-page-qr-close').click();
   }
   results.push(t);
  }catch(e){failures.push({...t,error:e.message.split('\n')[0]});console.log('FAIL',t.name,t.width,e.message);if(process.env.QR_SCREENSHOTS)await p.screenshot({path:'/tmp/qr-fail-'+t.name.replace(/[^a-z0-9]/gi,'-')+'-'+t.width+'.png'});}
  if((results.length+failures.length)%50===0)console.log('Checked',results.length+failures.length,'/',tasks.length,'failures',failures.length);
  }
  await context.close();
 }
 try{await Promise.all([worker(),worker(),worker()]);}finally{await browser.close();}
 fs.writeFileSync('/tmp/all-course-qr-ui-results.json',JSON.stringify({results,failures},null,2));console.log('PASS',results.length,'FAIL',failures.length);console.log(JSON.stringify(failures));if(failures.length)process.exitCode=1;
})().catch(e=>{console.error(e);process.exit(1)});
