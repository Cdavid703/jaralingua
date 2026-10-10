const assert=require('node:assert/strict');const {chromium}=require('playwright');
const origin=process.env.PRONUNCIATION_ORIGIN||'https://www.jaralingua.com';
(async()=>{const b=await chromium.launch({headless:true});try{
 const p=await b.newPage({viewport:{width:390,height:900}});const errors=[];p.on('pageerror',e=>errors.push(e.message));await p.route('https://accounts.google.com/**',r=>r.abort());
 await p.goto(origin+'/ingles/intermediate-2/pronunciation-unit-6-report-the-news-clearly.html',{waitUntil:'networkidle'});
 await p.locator('#modelButton').click();await p.waitForFunction(()=>!document.querySelector('#modelAudio').paused&&document.querySelector('#modelAudio').currentTime>.1);
 await p.locator('[data-speed="0.75"]').click();assert.equal(await p.locator('#modelAudio').evaluate(a=>a.playbackRate),.75);await p.locator('#modelButton').click();
 await p.locator('.reading-word').first().click();assert.match(await p.locator('#wordHelp').textContent(),/HEA-vy/);await p.locator('.word-model-replay').click();
 const config=await p.evaluate(()=>window.JaraIntermediate2PronunciationConfig);
 // Play the complete models and the four corrected word clips through real browser decoding.
 const clips=[...config.stages.map(s=>s.audio),...['a','seems','told','us'].map(w=>config.wordAudioBase+'/'+w+'.mp3')];
 for(const src of clips){const result=await p.evaluate(async src=>{const a=new Audio(src);await a.play();await new Promise(r=>setTimeout(r,130));const ok=a.currentTime>0&&a.duration>0;a.pause();return ok;},src);assert(result,src);}
 for(const w of config.stages[4].text.toLowerCase().match(/[a-z]+(?:'[a-z]+)?/g))assert(config.tips[w],'Missing tip '+w);
 await p.locator('.jl-page-qr-open').click();assert(await p.locator('.jl-page-qr-dialog').isVisible());await p.keyboard.press('Escape');
 assert.equal(await p.locator('[data-submit-teacher]').isDisabled(),true);
 if(origin.startsWith('https:'))for(const action of ['submissions','audio','submit']){const r=await p.request[action==='submit'?'post':'get'](origin+'/api/intermediate2/unit6-pronunciation/'+action,action==='submit'?{data:{}}:{});assert.equal(r.status(),401,'anonymous '+action);}
 assert.deepEqual(errors,[]);console.log('PASS live: models, speed, word help/replay, corrected words, 59 tips, QR and protected routes');
}finally{await b.close()}})().catch(e=>{console.error(e);process.exit(1)});
