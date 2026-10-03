// Export exactly the utterances used by the activity; preserve hashes for unchanged scripts.
import fs from 'node:fs';
import vm from 'node:vm';
import path from 'node:path';
const root=path.resolve(import.meta.dirname,'..');
const sandbox={window:{}};
vm.runInNewContext(fs.readFileSync(path.join(root,'assets/js/conversation-coach-data/english-intermediate-2-unit-5-david.js'),'utf8'),sandbox);
const c=sandbox.window.JaraLinguaConversationCoachConfig;
const dest=path.join(root,'ingles/intermediate-2/audio/unit-5-david-coach/models.json');
const old=fs.existsSync(dest)?JSON.parse(fs.readFileSync(dest,'utf8')):{items:[]};
const items=Object.entries(c.audioScripts).map(([file,text])=>{
 const prior=old.items.find(item=>item.file===file&&item.text===text);
 return {...(prior||{}),file,text};
});
fs.writeFileSync(dest,JSON.stringify({voiceId:c.voice.id,voiceName:c.voice.name,category:c.voice.category,modelId:c.voice.modelId,authorization:'Teacher authorized the second David voice on 2026-10-02 after the professional voice returned voice_not_fine_tuned.',items},null,2)+'\n');
console.log(`Exported ${items.length} David utterances.`);
