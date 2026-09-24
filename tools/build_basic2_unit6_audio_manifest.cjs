/* Deterministic build: audio scripts are derived from the teaching content. */
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const root=path.resolve(__dirname,'..');
const context={window:{}};
vm.runInNewContext(fs.readFileSync(path.join(root,'assets/js/basic2-unit6-food-content.js'),'utf8'),context);
const entries=Object.entries(context.window.Basic2FoodLesson.audios);
const folder=path.join(root,'ingles/basico-2/audio/unit6/fabulous-food');
fs.mkdirSync(folder,{recursive:true});
let script='# Basic 2 Unit 6: individual professional models\n\nGenerated from basic2-unit6-food-content.js. Labels are voice metadata, never spoken.\n\n';
for(const [id,a] of entries){
  if(a.reused){if(!fs.existsSync(path.join(root,a.path)))throw Error('Missing reused audio: '+a.path);continue;}
  const turn=/^restaurant-(\d+)$/.exec(id);
  const speaker=turn ? (Number(turn[1])%2 ? 'Customer':'Server') : 'Narrator';
  script+=`## ${id}\nFile: \`${id}.mp3\`\n\n${speaker}: ${a.text}\n\n`;
}
fs.writeFileSync(path.join(folder,'audio-scripts.md'),script);
fs.writeFileSync(path.join(folder,'audio-manifest.json'),JSON.stringify(Object.fromEntries(entries),null,2)+'\n');
console.log(JSON.stringify({total:entries.length,reused:entries.filter(([,a])=>a.reused).length,new:entries.filter(([,a])=>!a.reused).length}));
