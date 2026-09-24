/* Build the adapted pages from shared A2 content; never modify original activities. */
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..'),ctx={window:{}};
vm.runInNewContext(fs.readFileSync(path.join(root,'assets/js/basic2-unit6-practice-data.js'),'utf8'),ctx);
const activities=ctx.window.Basic2FoodPractice;
for(const [key,a] of Object.entries(activities)){
  const memory=key==='memory';
  const html=`<!DOCTYPE html>
<html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${a.title} | Basic English Course 2</title><meta name="description" content="${a.description}"><link rel="icon" href="/favicon.ico">
<link rel="stylesheet" href="/assets/css/style.css?v=20260727-basic2-top-nav-auth"><link rel="stylesheet" href="/assets/css/english-basic-responsive.css?v=20260727-basic2-compact-header"><link rel="stylesheet" href="/assets/css/english-basic-2.css?v=20260906-unit5-looking-back"><link rel="stylesheet" href="/assets/css/basic2-unit6-food.css?v=20260923-1"><link rel="stylesheet" href="/assets/css/basic2-unit6-practice.css?v=20260924-1"></head>
<body class="english-basic-page basic2-page food-page" data-food-practice="${key}">
<div class="global-course-switcher" aria-label="Courses"><details><summary>Courses</summary><nav><a href="/index.html">Home</a><a href="/ingles/index.html">English</a><a href="index.html">Basic English 2</a><a href="practice-lab.html">Practice Lab</a></nav></details></div>
<header class="site-header"><nav class="navbar" aria-label="Main navigation"><a class="brand" href="/index.html"><img src="/assets/img/jaralingua-logo.png" alt="JaraLingua"></a><ul class="nav-links"><li><a href="/index.html">Home</a></li><li><a href="/ingles/index.html">English</a></li><li><a href="index.html">Basic English 2</a></li><li><a href="practice-lab.html#unit-6-folder">Practice Lab</a></li><li><a href="unit-6-fabulous-food.html">Unit 6</a></li></ul></nav></header>
<main><section class="lesson-hero"><div class="lesson-hero-content"><p class="eyebrow">Unit 6 · ${a.type}</p><h1>${a.title}</h1><p class="hero-copy">${a.description}</p><div class="hero-actions"><a href="#foodPractice">Start practice</a><a href="unit-6-fabulous-food.html#${a.review}">Review the rule</a></div></div><figure class="food-hero-image"><img src="${a.hero}" alt="Food learning materials for ${a.title}"></figure></section>
<div class="food-shell"><section class="food-objective"><strong>Activity objective:</strong> ${a.objective}</section>
<details class="fp-instructions"><summary>How to play</summary><p>${memory?'Two teams take turns revealing two cards. A matching pair earns one point. Listen to the word, repeat it aloud, and press “We repeated it — continue”. A match keeps the turn; a miss passes it to the other team. The team with more pairs wins.':'Read the sentence and choose A, B, or C. Press Check answers to see your score and an explanation. You can change any answer before or after checking. Try again clears your answers and mixes the positions of the choices. This is independent practice, not a teacher submission.'}</p></details>
<section id="foodPractice" aria-label="${a.title}"></section><noscript>Please enable JavaScript to use this activity.</noscript></div></main><footer class="site-footer"><p>JaraLingua · Basic English Course 2</p></footer>
<script src="/assets/js/basic2-unit6-practice-data.js?v=20260924-1"></script><script src="/assets/js/basic2-unit6-practice.js?v=20260924-1"></script><script src="/assets/js/google-auth-config.js"></script><script src="https://accounts.google.com/gsi/client" async defer></script><script src="/assets/js/google-auth.js?v=20260922-auth-expiry-recovery"></script><script src="/assets/js/course-switcher.js?v=20260724-basic-2"></script><script src="/assets/js/page-qr-access.js?v=20260901-2"></script></body></html>`;
  fs.writeFileSync(path.join(root,'ingles/basico-2',a.file),html+'\n');
}
let coach=fs.readFileSync(path.join(root,'ingles/basico-2/conversation-coach-unit-5-nora-memories.html'),'utf8');
coach=coach.replaceAll('english-basic-2-unit-5-nora-memories.js','english-basic-2-unit-6-restaurant.js').replaceAll('unit-5-looking-back.html','unit-6-fabulous-food.html').replaceAll('#unit-5-folder','#unit-6-folder').replaceAll('A Memory with Nora','At the Restaurant with Ethan').replaceAll('Nora Bennett','Ethan Cole').replaceAll('Nora','Ethan').replaceAll('Unit 5','Unit 6').replaceAll('unit-5-nora-coach.png','UNIT6_PORTRAIT');
coach=coach.replaceAll('../../assets/img/english-basic-2/UNIT6_PORTRAIT','/assets/img/english-intermediate/unit-5/restaurant-coach/ethan-cole-portrait-v1.webp');
coach=coach.replace('src="/assets/img/english-intermediate/unit-5/restaurant-coach/ethan-cole-portrait-v1.webp" alt="Ethan Cole sharing a photo album at a café"','src="/assets/img/english-intermediate/unit-5/restaurant-coach/cedar-stone-hero-v1.webp" alt="Ethan welcoming a customer to a restaurant"');
coach=coach.replace('A short English conversation about a memory. Practice was, were and past actions with Ethan, one question at a time.','Practice a restaurant conversation with Ethan, one question at a time, with a microphone and transcript.').replace('Share a real or imagined memory using <strong>was, were</strong> and past actions.','Order food, ask about ingredients, and give an opinion — one question at a time.');
coach=coach.replace('</head>','<link rel="stylesheet" href="/assets/css/basic2-unit6-restaurant.css?v=20260924-1"></head>').replace('nora-coach-page"','nora-coach-page food-restaurant-page"');
coach=coach.replaceAll('<button type="button" data-coach-speed="1.25">1.25x</button>','');
const menu='<details class="u6-menu"><summary>Garden Table · menu and ingredients</summary><div class="u6-menu-grid"><article><h3>Vegetable soup · COP 12,000</h3><p>Potatoes, carrots, onions, water, and a little salt. Vegetable stock; no chili.</p></article><article><h3>Chicken with rice · COP 25,000</h3><p>Chicken, rice, and a small salad. Ask the kitchen about changes.</p></article><article><h3>Salad · COP 15,000</h3><p>Lettuce, tomatoes, cheese, and a little oil. Contains dairy.</p></article><article><h3>Drinks</h3><p>Water · COP 3,000<br>Juice · COP 5,000<br>Coffee · COP 5,000</p></article></div><p>This is a practice menu. For an allergy, ask staff to check ingredients and cross-contact; removing an ingredient is not a safety guarantee.</p></details>';
coach=coach.replace('<div class="nora-mode">',menu+'<div class="nora-mode">').replace('<details class="coach-support" id="answerSupport">',menu+'<details class="coach-support" id="answerSupport">');
fs.writeFileSync(path.join(root,'ingles/basico-2/conversation-coach-unit-6-restaurant.html'),coach);
const configBox={window:{}};
vm.runInNewContext(fs.readFileSync(path.join(root,'assets/js/conversation-coach-data/english-basic-2-unit-6-restaurant.js'),'utf8'),configBox);
const config=configBox.window.JaraLinguaConversationCoachConfig;
const audioFolder=path.join(root,'ingles/basico-2/audio/unit6/restaurant-coach');fs.mkdirSync(audioFolder,{recursive:true});
let script='# Basic 2 Unit 6 — Ethan individual turns\n\n';
for(const [file,text]of Object.entries({...config.audioScripts,'chicken.mp3':'chicken'}))script+=`## ${file.slice(0,-4)}\nFile: \`${file}\`\n\nEthan: ${text}\n\n`;
fs.writeFileSync(path.join(audioFolder,'audio-scripts.md'),script);
for(const file of ['recovery-no-speech.mp3','recovery-service.mp3'])fs.copyFileSync(path.join(root,'ingles/intermediate/audio/conversation-coach/unit-5-restaurant',file),path.join(audioFolder,file));
console.log(`Built ${Object.keys(activities).length} practice pages, one coach, and ${Object.keys(config.audioScripts).length+1} new audio scripts.`);
