// Real animation and real audio playback: do not mock play() or shorten spins.
const {chromium}=require('C:/Users/USER/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const base=process.env.ROULETTE_TEST_BASE_URL||'https://www.jaralingua.com';
(async()=>{
  const browser=await chromium.launch({channel:'chrome',headless:true});
  try {
    for(const mode of ['no-preference','reduce']){
      const page=await browser.newPage({viewport:{width:mode==='reduce'?390:1440,height:1000},reducedMotion:mode});
      await page.route('**/assets/js/google-auth.js*',r=>r.fulfill({contentType:'text/javascript',body:''}));
      await page.route('https://accounts.google.com/**',r=>r.abort());
      if(!process.env.ROULETTE_TEST_LIVE){
        for(const file of ['assets/js/basic2-vacation-roulette.js','assets/css/basic2-vacation-roulette.css']){
          await page.route('**/'+file+'*',r=>r.fulfill({contentType:file.endsWith('.js')?'text/javascript':'text/css',body:fs.readFileSync(path.join(__dirname,'..',file))}));
        }
      }
      await page.route('**/api/basic2/grades',r=>r.fulfill({contentType:'application/json',body:JSON.stringify({role:'teacher',students:[1,2,3,4].map(n=>({id:String(n),fullName:'Test Student '+n}))})}));
      await page.addInitScript(()=>{
        window.JaraLinguaAuth={getUser:()=>({credential:'test-only',provider:'google'})};
        window.testAudio=[];const NativeAudio=window.Audio;
        window.Audio=function(...args){const audio=new NativeAudio(...args);window.testAudio.push(audio);return audio;};
        window.Audio.prototype=NativeAudio.prototype;
      });
      await page.goto(base+'/ingles/basico-2/practice-unit-5-vacation-roulette.html',{waitUntil:'networkidle'});
      await page.locator('#hr-load').click();await page.waitForFunction(()=>!document.querySelector('#hr-spin-student').disabled);
      for(const type of ['student','question']){
        await page.locator('#hr-spin-'+type).click();
        await page.waitForTimeout(250);
        const first=await page.locator('#hr-'+type+'-wheel').evaluate(el=>getComputedStyle(el).transform);
        await page.waitForTimeout(600);
        const second=await page.locator('#hr-'+type+'-wheel').evaluate(el=>getComputedStyle(el).transform);
        assert.notEqual(first,second,mode+': wheel must visibly move, not jump straight to the answer');
        const sound=await page.evaluate(()=>{const a=window.testAudio.find(a=>a.src.endsWith('roulette.wav'));return {paused:a.paused,time:a.currentTime,duration:a.duration,error:a.error?.code,muted:a.muted,volume:a.volume};});
        assert.equal(sound.paused,false,mode+': wheel sound must not be cut off');
        assert.ok(sound.time>.2 && sound.time<sound.duration,JSON.stringify(sound));assert.ok(sound.volume>0&&!sound.muted);assert.ok(!sound.error);
        assert.equal(await page.locator('#hr-spin-'+type).isDisabled(),true);
        await page.waitForFunction(type=>type==='student'?!document.querySelector('#hr-spin-question').disabled:!document.querySelector('#hr-next').disabled,type);
        const end=await page.evaluate(()=>window.testAudio.find(a=>a.src.endsWith('roulette.wav')).currentTime);
        assert.ok(end>=3,mode+': complete tick sequence and final chime must play');
        console.log('PASS',mode,type,'visible rotation and real decoded audio',sound);
      }
      await page.close();
    }
  } finally {await browser.close();}
})().catch(e=>{console.error(e);process.exit(1);});
