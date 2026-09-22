import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
const {chromium}=require('C:/Users/USER/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const session=JSON.parse(fs.readFileSync('tmp/basic2-integrated-qa/session.json','utf8'));
const b=await chromium.launch({channel:'chrome',headless:true});
const p=await b.newPage({viewport:{width:390,height:844}});p.on('dialog',d=>d.accept());
let expired=false,failSubmit=false;
await p.route('**/assets/js/google-auth.js*',r=>r.fulfill({contentType:'application/javascript',body:`window.JaraLinguaAuth={getUser:()=>JSON.parse(sessionStorage.getItem('qaUser')||'null'),openPanel:()=>{}};const out=document.createElement('button');out.dataset.authSignout='';out.onclick=()=>{sessionStorage.removeItem('qaUser');window.dispatchEvent(new Event('jaralingua:auth-changed'))};document.body.append(out);`}));
await p.route('https://accounts.google.com/**',r=>r.fulfill({body:''}));
await p.route('**/api/basic2/integrated-task/**',async r=>{
 const path=new URL(r.request().url()).pathname;
 if(expired||(failSubmit&&path.endsWith('/submit')))return r.fulfill({status:401,json:{error:'invalid_token',message:'Google token expired.'}});
 const response=await r.fetch({url:session.base+path});await r.fulfill({response});
});
const sign=()=>p.evaluate(token=>{sessionStorage.setItem('qaUser',JSON.stringify({email:'ana@exam.example',credential:token,provider:'local'}));window.dispatchEvent(new Event('jaralingua:auth-changed'));},session.tokens.ana);
const article='Last vacation I stayed with my family in a small house in the country. We played games and cooked together. It was sunny, but our car broke down. My brother fixed it and we were happy.';
try{
 await fetch(session.base+'/api/basic2/integrated-task/availability',{method:'POST',headers:{Authorization:'Bearer '+session.tokens.teacher,'X-Jaralingua-Auth-Provider':'local','Content-Type':'application/json'},body:JSON.stringify({isOpen:true})});
 await p.goto('http://127.0.0.1:8025/ingles/basico-2/basic-course-2-integrated-task.html');await sign();
 await p.locator('#ix-course').fill('QA');await p.locator('#ix-start').click();await p.locator('#ix-writing-start').click();
 expired=true;await p.locator('#ix-writing').fill(article);await p.locator('input[name="ix-q1"][value="2"]').check();
 await p.getByRole('button',{name:'Reconnect and keep my exam'}).waitFor();
 await p.getByRole('button',{name:'Reconnect and keep my exam'}).click();
 expired=false;await sign();await p.locator('#ix-writing').waitFor();
 assert.equal(await p.locator('#ix-writing').inputValue(),article);
 assert.equal(await p.locator('input[name="ix-q1"]:checked').inputValue(),'2');
 await p.waitForFunction(()=>document.getElementById('ix-save-status').textContent==='Draft saved.');
 failSubmit=true;await p.locator('#ix-submit').click();await p.getByRole('button',{name:'Reconnect and keep my exam'}).waitFor();
 await p.getByRole('button',{name:'Reconnect and keep my exam'}).click();failSubmit=false;await sign();
 await p.locator('#ix-submit').waitFor();assert.equal(await p.locator('#ix-writing').inputValue(),article);
 await p.locator('#ix-submit').click();await p.locator('#ix-receipt').waitFor();
 assert.match(await p.locator('#ix-receipt-summary').textContent(),/B2IT-/);
 console.log('PASS: expired session during draft and submit; reconnect preserves writing, radio selection, pending delivery ID and receipt.');
}finally{await b.close();}
