import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import crypto from 'node:crypto';
const root=path.resolve(import.meta.dirname,'..');
const pagePath=path.join(root,'ingles/intermediate-2/pronunciation-unit-6-report-the-news-clearly.html');
const html=fs.readFileSync(pagePath,'utf8');
assert(fs.existsSync(path.join(root,'assets/img/page-qr/ingles-intermediate-2-pronunciation-unit-6-report-the-news-clearly.svg')),'Missing page QR');
const context={window:{}};
vm.runInNewContext(fs.readFileSync(path.join(root,'assets/js/english-intermediate2-pronunciation-unit6.js'),'utf8'),context);
const c=context.window.JaraIntermediate2PronunciationConfig;
assert.equal(c.stages.length,5);
assert.equal(c.stages[4].text,c.stages.slice(0,4).map(x=>x.text).join(' '));
const source=fs.readFileSync(path.join(root,'ingles/intermediate-2/audio/pronunciation/unit-6-report-the-news-clearly-script.md'),'utf8');
c.stages.forEach(s=>assert(source.includes('> '+s.text)));
for(const id of ['readingText','micButton','modelAudio','studentAudio','recordStatus','results','overallScore','accuracyScore','completenessScore','fluencyScore','shadowModeButton'])assert(html.includes('id="'+id+'"'));
for(const value of ['ie2-pronunciation-control-deck','ie2-pronunciation-workspace','english-intermediate2-pronunciation-unit1.js','data-pronunciation-submit-mount'])assert(html.includes(value));
for(const ref of html.matchAll(/(?:href|src)="([^"]+)"/g)){
 const value=ref[1].split(/[?#]/)[0];if(!value||/^https?:/.test(value))continue;
 assert(fs.existsSync(value.startsWith('/')?path.join(root,value.slice(1)):path.resolve(path.dirname(pagePath),value)),value);
}
const base=path.join(root,'ingles/intermediate-2/audio/pronunciation/unit-6-intermediate2');
const inventory=JSON.parse(fs.readFileSync(path.join(base,'models.json'),'utf8'));
assert.equal(inventory.items.length,64);
const words=new Set(c.stages[4].text.toLowerCase().match(/[a-z]+(?:'[a-z]+)?/g));
assert.equal(words.size,59);
for(const word of words)assert(inventory.items.some(x=>x.kind==='word'&&x.text===word));
for(const item of inventory.items){
 const bytes=fs.readFileSync(path.join(base,item.file));
 assert(bytes.length>(item.kind==='section'?10000:1000));
 assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'),item.sha256);
}
const audit=JSON.parse(fs.readFileSync(path.join(base,'audio-audit.json'),'utf8'));assert.equal(audit.length,64);assert(audit.every(x=>x.matched&&x.sha256===inventory.items.find(i=>i.file===x.file).sha256));
const engine=fs.readFileSync(path.join(root,'assets/js/english-intermediate2-pronunciation-unit1.js'),'utf8');
assert(!/speechSynthesis|SpeechSynthesisUtterance/.test(html+engine));
const catalog=JSON.parse(fs.readFileSync(path.join(root,'assets/data/english-intermediate-2-content.json'),'utf8'));
const item=catalog.items.find(x=>x.id==='unit-6-report-the-news-pronunciation');
assert(item&&item.unit===6&&item.type==='pronunciation'&&item.teacherSubmission&&!item.gradebookProjected&&!item.affectsAverage);
console.log('PASS: Unit 3 template, shared engine, canonical texts, all 64 audio hashes, word coverage, verified models and independent-inbox catalog flags.');
