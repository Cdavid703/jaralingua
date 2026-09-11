
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
const {chromium}=require('C:/Users/USER/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const b=await chromium.launch({channel:'chrome',headless:true});const p=await b.newPage({viewport:{width:1440,height:1100}});
const base=process.env.U4_BASE_URL||'http://127.0.0.1:8024';
const errors=[];p.on('pageerror',e=>errors.push(e.message));
await p.goto(base+'/ingles/intermediate-2/unit-4-movies-music-and-reviews.html');
await p.addStyleTag({content:'*{scroll-behavior:auto!important}'});
await p.locator('#unit4-content>details').evaluateAll(es=>es.forEach(e=>e.open=true));
for(const btn of await p.locator('.u4-inline-audio button').all()){
const id=await btn.getAttribute('data-u4-audio');
await p.locator('#'+id).evaluate(a=>a.muted=true);
await btn.click();
await p.waitForFunction(id=>!document.getElementById(id).paused && document.getElementById(id).currentTime > 0,id);
assert.equal(await p.locator('#'+id).evaluate(a=>a.playbackRate),.75);
await p.locator('#'+id).evaluate(a=>a.pause());
}
assert.equal(await p.locator('.u4-audio-status:not(:empty)').count(),0);
await p.locator('.u4-music-vocab img').evaluateAll(async es=>await Promise.all(es.map(e=>{e.loading='eager';return e.decode()})));
await p.locator('.u4-music-vocab').evaluate(e=>e.scrollIntoView());
await p.screenshot({path:'tmp/unit4-qa/music-v3.jpg',quality:65});
await p.locator('.u4-expressions').evaluate(e=>e.scrollIntoView());
await p.screenshot({path:'tmp/unit4-qa/expressions-v3.jpg',quality:65});
await p.goto(base+'/ingles/intermediate/idioms.html');
for(const name of ['come out','put on','turn up','turn down','find out','stand out','steal the show','on the edge of your seat','music to my ears']){
const btn=p.locator('.idiom-btn').filter({has:p.getByText(name,{exact:true})});
assert.equal(await btn.count(),1);
await btn.click();
const title=p.locator('.expression-pronunciation');await title.click();
await p.waitForFunction(()=>document.querySelector('.expression-pronunciation').getAttribute('aria-pressed')==='true');
await title.click();
}
assert.deepEqual(errors,[]);await b.close();
console.log('PASS all 52 inline audio controls and 9 library entries');
