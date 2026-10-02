from pathlib import Path
import json,hashlib,html,sys
ROOT=Path.cwd(); E=html.escape
stem='grammar-unit-5-read-the-clues'
base='/assets/img/english-intermediate-2/unit-5/'
rows=[
('The night shift','explanation/tired.webp','A volunteer yawning beside boxes of donated food.','Leo worked all night and has not slept. He is yawning.','strong positive deduction','He ___ be tired.','must',
 {'must':'The lack of sleep and his yawning strongly support this deduction. Here, must means almost sure, not an obligation.','might':'This sentence is possible, but might expresses uncertainty. The task asks for a strong deduction.','can’t':'This means you are almost sure he is not tired. The clues point in the opposite direction.'}),
('At the bus stop','explanation/waiting.webp','A woman checks her watch at a bus stop.','Sara is looking at her watch at a bus stop. You do not know her plans. Perhaps she is meeting a friend, or perhaps she is waiting for a bus.','possibility, without being sure','She ___ be waiting for a friend.','might',
 {'must':'Checking a watch does not tell us who she is waiting for. Must would express more certainty than these clues support.','might':'Meeting a friend is one possible explanation. We do not have enough information to be sure.','can’t':'Nothing rules out meeting a friend. Can’t would express a strong negative deduction.'}),
('A locked library','grammar/closed-library.webp','Two students check a locked library entrance with a dark interior.','It is 9 p.m. The library closes at 6 p.m. today. The entrance is locked, the lights are off, and no special event is scheduled.','strong negative deduction','The library ___ be open to visitors now.','can’t',
 {'must':'Must be open means you are almost sure it is open. The closing time, locked door and dark interior support the opposite.','might':'Might be open leaves this possibility open. The task asks for a strong negative deduction from the clues.','can’t':'The closing time, locked door and dark interior strongly suggest it is not open to visitors now. This is a deduction, not a rule.'}),
('The result is in','explanation/relieved.webp','A student smiles with relaxed shoulders after a presentation.','Mia was afraid she had failed her presentation. She has just learned that she passed. Now she smiles and her shoulders relax.','strong positive deduction','She ___ be relieved.','must',
 {'must':'The good result and her change in expression strongly suggest relief. We are making a deduction from several clues.','might':'Might is possible English, but it is less certain. The instruction asks for a strong deduction.','can’t':'Can’t be relieved means almost sure she is not relieved. Her reaction and the good news support the opposite.'}),
('Before the presentation','explanation/presentation.webp','A student holds note cards before speaking to classmates.','Ana is holding her notes tightly before speaking. You have not asked how she feels. She could be nervous, or she could simply be concentrating.','possibility, without being sure','She ___ be nervous.','might',
 {'must':'Holding notes tightly does not prove nervousness. The situation gives another possible explanation.','might':'Nervousness is a possible explanation, but we are not sure. Might leaves room for another explanation.','can’t':'The clues do not rule out nervousness. Can’t would express much stronger certainty that she is not nervous.'}),
('A call from London','grammar/video-call.webp','A classroom laptop shows a friend on a video call from London.','You are in a classroom in Medellín. Your friend Emma is speaking to you on a live video call from London right now.','strong negative deduction','Emma ___ be in your classroom now.','can’t',
 {'must':'Must be in your classroom conflicts with the clue that she is in London right now.','might':'Might would leave the classroom as a possible location. The live call from London rules that out in this situation.','can’t':'She is in London at this moment, so you can rule out her being in your classroom in Medellín at the same time.'}),
('At the museum','explanation/interested.webp','Museum visitors lean forward and watch a guide demonstrate a model.','The visitors lean forward, ask many questions and ask the guide to continue. They have stayed much longer than planned.','strong positive deduction','They ___ be interested in the exhibition.','must',
 {'must':'Their attention, questions and wish to stay longer strongly support interest. Must expresses this strong deduction.','might':'Might expresses only a possibility. The task asks for the stronger deduction supported by several clues.','can’t':'Can’t be interested means almost sure they are not interested. Their actions strongly suggest the opposite.'}),
('During the talk','explanation/bored.webp','A learner rests his cheek on his hand during a talk.','Ben rests his cheek on his hand during a talk. You do not know whether he is bored, tired or thinking carefully.','possibility, without being sure','He ___ be bored.','might',
 {'must':'His posture alone is not enough for this strong conclusion. He could also be tired or thinking.','might':'Boredom is one possible explanation. The other possibilities mean we should not sound certain.','can’t':'Nothing here rules out boredom. Can’t would express certainty that he is not bored.'}),
('The empty backpack','grammar/empty-bag.webp','Two students check an empty backpack with open pockets.','Nora has emptied her backpack and checked every pocket twice. Nothing is left inside, but her keys are still missing.','strong negative deduction','The keys ___ be in the backpack.','can’t',
 {'must':'Must be in the backpack conflicts with the evidence: the bag and all its pockets are empty.','might':'Might leaves the bag as a possible location. The task asks you to rule it out using the completed search.','can’t':'The bag and every pocket have been checked and are empty. The clues let us rule out that location.'}),
('A wet arrival','grammar/rain.webp','A volunteer arrives with a wet jacket and a dripping umbrella.','Luis has just come in from outside. His jacket is wet, water is dripping from his umbrella, and you hear heavy rain on the roof.','strong positive deduction','It ___ be raining outside.','must',
 {'must':'The wet jacket, dripping umbrella and sound on the roof give strong evidence of rain.','might':'Might expresses a possibility, but the task asks for a strong deduction supported by several clues.','can’t':'Can’t be raining means almost sure it is not raining. That conflicts with the clues.'})
]
# Mix meanings and answer positions instead of repeating must / might / can't.
# Keep each scene, explanation and audio model together; IDs follow display order.
question_order=[1,9,6,4,5,8,10,3,2,7]
assert sorted(question_order)==list(range(1,11))
rows=[rows[i-1] for i in question_order]
option_orders=[
 ['might','must','can’t'], ['must','might','can’t'],
 ['can’t','must','might'], ['can’t','might','must'],
 ['might','can’t','must'], ['can’t','might','must'],
 ['might','must','can’t'], ['can’t','must','might'],
 ['must','can’t','might'], ['can’t','must','might']
]
questions=[]; audio=[]
existing=json.loads((ROOT/'ingles/intermediate-2/audio/unit-5-explanation/models.json').read_text(encoding='utf-8'))
bytext={i['text']:i for i in existing['items']}
for i,(title,image,alt,clues,goal,sentence,answer,why) in enumerate(rows,1):
 model=sentence.replace('___',answer); key=hashlib.sha256(model.encode()).hexdigest()[:14]
 if model in bytext: src='audio/unit-5-explanation/'+bytext[model]['file']
 else:
  src='audio/unit-5-grammar/'+key+'.mp3'; audio.append(dict(id=key,file=key+'.mp3',text=model,kind='phrase'))
 questions.append(dict(id=i,options=option_orders[i-1],title=title,image=base+image,alt=alt,clues=clues,goal=goal,sentence=sentence,answer=answer,why=why,model=model,audio=src))
dest=ROOT/'ingles/intermediate-2/audio/unit-5-grammar';dest.mkdir(parents=True,exist_ok=True)
prior=json.loads((dest/'models.json').read_text(encoding='utf-8')) if (dest/'models.json').exists() else {'items':[]}
prior_by_id={x['id']:x for x in prior['items']}
for item in audio:
 old=prior_by_id.get(item['id'],{})
 if old.get('text')==item['text']:
  item.update({k:old[k] for k in ('bytes','sha256') if k in old})
manifest=dict(voiceId=existing['voiceId'],modelId=existing['modelId'],items=audio)
(dest/'models.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
(ROOT/'assets/data/english-intermediate2-unit5-grammar.json').write_text(json.dumps(dict(title='Read the Clues',questions=questions),ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
source=(ROOT/'ingles/intermediate-2/grammar-unit-2-wishes-dreams-goals.html').read_text(encoding='utf-8')
head=source.split('  <main>')[0].replace('Choose the Pattern | Unit 2 Grammar Practice','Read the Clues | Unit 5 Grammar Practice').replace('A 15-question Unit 2 grammar practice on hope, dream, wish, goal, would like and make a wish.','Ten illustrated questions on must, might and can’t, with clues, explanations and pronunciation.').replace('ie2-grammar-page','ie2-grammar-page ie2-u5-grammar').replace('#unit-2-folder','#unit-5-folder').replace('./unit-2-wishes-dilemmas-advice.html#wish-hope-dream','./unit-5-impressions-feelings-and-satire.html#modals').replace('Unit 2 theory','Unit 5 theory').replace('#patternMap','#quickGuide').replace('Pattern map','Quick guide')
head=head.replace('</head>','<link rel="canonical" href="https://www.jaralingua.com/ingles/intermediate-2/'+stem+'.html"/>\n<link rel="stylesheet" href="../../assets/css/english-intermediate2-unit5-grammar.css?v=20260925-2"/>\n</head>')
main='''<main>
<section class="ie2-grammar-hero" aria-labelledby="pageTitle"><div class="ie2-grammar-hero-copy"><p class="intermediate2-kicker">Practice Lab · Unit 5 Grammar</p><h1 id="pageTitle">Read the Clues</h1><p>Look closely. Read the evidence.<br>Choose <strong>must</strong>, <strong>might</strong> or <strong>can’t</strong>.</p><div class="ie2-grammar-meta"><span>10 picture questions</span><span>3 choices each</span><span>Listen at 0.75×</span></div><div class="intermediate2-actions"><a class="intermediate2-button primary" href="#grammarChallenge">Start workshop</a><a class="intermediate2-button ghost" href="./unit-5-impressions-feelings-and-satire.html#modals">Review the explanation</a></div></div><figure><img src="/assets/img/english-intermediate-2/unit-5/grammar/rain.webp" width="1536" height="1024" alt="A volunteer arrives with a wet umbrella: what do the clues suggest?" fetchpriority="high"/></figure></section>
<section class="ie2-grammar-shell">
<section class="ie2-grammar-intro"><div><p class="intermediate2-kicker">How it works</p><h2>Choose. Compare. Listen.</h2><p>Read the clues and the requested meaning. Choose one answer, then compare all three explanations. Tap a picture to enlarge it.</p></div><aside><strong>Match the level of certainty</strong><span>A sentence can be grammatical but express a different level of certainty.</span></aside></section>
<details id="quickGuide" class="u5g-guide"><summary>Quick guide · must / might / can’t</summary><div class="u5g-guide-grid"><p><strong>must</strong><br>I am almost sure it is true.<br>Strong positive deduction.</p><p><strong>might</strong><br>It is possible. I am not sure.<br>Other explanations are possible.</p><p><strong>can’t</strong><br>I am almost sure it is not true.<br>Strong negative deduction.</p></div><p>Use <b>subject + modal + base verb</b>: He must <b>be</b> tired. Here, <b>must</b> is a deduction, not an obligation; <b>can’t</b> is a deduction, not a rule or lack of ability.</p></details>
<section class="ie2-grammar-challenge" id="grammarChallenge" aria-labelledby="challengeTitle"><header><div><p class="intermediate2-kicker">Grammar workshop</p><h2 id="challengeTitle">What do the clues suggest?</h2></div><div class="ie2-grammar-progress"><span id="grammarProgress" role="status">0 / 10 answered</span><i aria-hidden="true"><b id="grammarProgressBar"></b></i></div></header>
<div class="u5g-audio-toolbar" role="group" aria-label="Pronunciation speed"><span>Model audio</span><button type="button" data-speed="0.75" aria-pressed="true">0.75×</button><button type="button" data-speed="1" aria-pressed="false">1×</button><button type="button" id="audioStop">Stop audio</button></div><p id="audioStatus" role="status"></p>
<div id="grammarQuestion" class="ie2-grammar-question-list"></div><noscript><p>Enable JavaScript to answer these questions and play the audio.</p></noscript>
<div class="ie2-grammar-actions"><button class="intermediate2-button ghost" id="grammarRestart" type="button">Restart all</button><button class="intermediate2-button primary" id="grammarCheckAll" type="button">See my results</button></div><div id="grammarResult" class="ie2-grammar-result" hidden tabindex="-1" role="status"></div>
<p class="u5g-note">Practice only · Your first choices and corrections stay on this page. Reloading starts a new round.</p></section>
<div class="intermediate2-actions"><a class="intermediate2-button primary" href="./practice-lab.html#unit-5-folder">Back to Practice Lab</a><a class="intermediate2-button ghost" href="./unit-5-impressions-feelings-and-satire.html#modals">Review Unit 5</a></div></section></main>
<dialog id="pictureProjector" aria-labelledby="projectorTitle"><header><span>Picture and clues</span><button type="button" id="projectorClose" autofocus>Close ×</button></header><div class="u5g-project-stage"><img alt=""/><div><h2 id="projectorTitle"></h2><p id="projectorClues"></p><p id="projectorGoal"></p><p id="projectorSentence"></p></div></div></dialog>
<footer class="site-footer"><p>&copy; 2026 JaraLingua. Intermediate English Course 2 Practice Lab.</p></footer>
<script src="../../assets/js/google-auth-config.js"></script><script src="https://accounts.google.com/gsi/client" async defer></script><script src="../../assets/js/google-auth.js?v=20260919-local-login"></script><script src="../../assets/js/english-intermediate2-unit5-grammar.js?v=20260925-order2"></script><script src="/assets/js/course-switcher.js"></script><script src="/assets/js/page-qr-access.js"></script></body></html>
'''
# Static cards stay readable before scripts initialize.
cards=[]
for q in questions:
 i=q['id']; opts=''.join('<label><input type="radio" name="answer'+str(i)+'" value="'+E(o)+'" aria-describedby="feedback'+str(i)+'"/><span><b>'+chr(65+j)+'</b>'+E(o)+'</span></label>' for j,o in enumerate(q['options']))
 cards.append(f'''<article class="ie2-grammar-question-card" data-question="{i}" id="question{i}"><div class="ie2-grammar-question-head"><span>{E(q['title'])}</span><strong>{i}</strong></div><button class="u5g-picture" type="button" data-project="{i}" aria-label="Enlarge picture and clues: {E(q['title'])}"><img src="{q['image']}" alt="{E(q['alt'])}" width="1536" height="1024" loading="lazy"/><span>Enlarge image ↗</span></button><p class="u5g-clues">{E(q['clues'])}</p><p class="u5g-goal">Express a <strong>{E(q['goal'])}</strong>.</p><h3>{E(q['sentence'])}</h3><fieldset><legend>Choose the modal that matches the requested meaning</legend>{opts}</fieldset><div id="feedback{i}" class="ie2-grammar-feedback" aria-live="polite"></div></article>''')
main=main.replace('<div id="grammarQuestion" class="ie2-grammar-question-list"></div>','<div id="grammarQuestion" class="ie2-grammar-question-list">'+''.join(cards)+'</div>')
(ROOT/'ingles/intermediate-2'/f'{stem}.html').write_text(head+main,encoding='utf-8')
sys.path.insert(0,str(ROOT/'tmp/unit5-explanation/python-deps'))
import qrcode,qrcode.image.svg
qrcode.make('https://www.jaralingua.com/ingles/intermediate-2/'+stem+'.html',image_factory=qrcode.image.svg.SvgPathImage,box_size=10,border=4).save(ROOT/'assets/img/page-qr'/('ingles-intermediate-2-'+stem+'.svg'))
print('Built 10 illustrated questions; new audio models:',len(audio))

js_path=ROOT/'assets/js/english-intermediate2-unit5-grammar.js'
if js_path.exists():
 js=js_path.read_text(encoding='utf-8');begin=js.index('const questions=');end=js.index('\nconst $=',begin)
 js=js[:begin]+'const questions='+json.dumps(questions,ensure_ascii=False)+';'+js[end:]
 js_path.write_text(js,encoding='utf-8')
