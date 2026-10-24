"""Build the initial Preintermediate 1 teaching route and exact audio inventory."""
import html
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
COURSE = ROOT / 'ingles/preintermedio-1'
VERSION = '20261024-basic2-fidelity-qr'
AUDIO = '/ingles/preintermedio-1/audio/unit1/lesson/'
IMAGE = '/assets/img/english-preintermediate-1/unit-1/making-friends-hero.webp'
audios = {}
def esc(text): return html.escape(text, quote=True)
def say(key,text,voice='Narrator'):
    if key in audios: assert audios[key]['text']==text
    audios[key]={'text':text,'voice':voice,'path':AUDIO+key+'.mp3'}
    return f'<button type="button" class="pi-say" data-audio="{key}" aria-label="Listen: {esc(text)}">{esc(text)}<span aria-hidden="true"> ♪</span></button>'
def card(title,body): return f'<article class="basic2-info-card pi-card"><h3>{title}</h3>{body}</article>'
def grid(*cards):return '<div class="pi-grid">'+''.join(cards)+'</div>'
def note(text):return f'<p class="pi-note">{text}</p>'
def example(key,text,explanation=''):
    return f'<p class="pi-example">{say(key,text)}'+(f'<span class="pi-explanation">{explanation}</span>' if explanation else '')+'</p>'
def controls():
    return '<div class="pi-audio-controls" aria-label="Model audio controls"><span>Speed</span><button type="button" data-speed="0.75" aria-pressed="false">0.75×</button><button type="button" data-speed="1" aria-pressed="true">1.0×</button><button type="button" data-stop>Stop audio</button><span data-audio-status role="status" aria-live="polite">Tap a word or sentence to listen.</span></div>'
sections=[]
def section(id,title,goal,body):
    sections.append({'id':id,'title':title,'goal':goal,'body':body})

section('first-connection','Making a first connection','Open a conversation, share a little information and leave space for the other person.',
 grid(card('A real purpose','<p>You are meeting a new classmate. Learn enough to introduce each other later: a name, a routine, a preference and something you share.</p>'),card('A conversation has turns','<ol><li>Greet and introduce yourself.</li><li>Ask one clear question.</li><li>Listen and respond to the answer.</li><li>Ask for a little more detail.</li><li>Close politely.</li></ol>'))+
 grid(card('Open',example('greeting',"Hi, I’m Laura. What’s your name?")),card('Keep the exchange going',example('follow-up','That sounds interesting. What about you?')),card('Close',example('closing','It was nice talking to you. See you in class.')))+
 note('A good conversation is more than a list of questions. If someone says “I like cooking,” respond to that idea: “What do you usually cook?” You do not need to share every interest.'))

section('names-identities','Names and identities','Use the name someone prefers and confirm exact information when you need it.',
 grid(card('Given and family names','<p><b>First name:</b> Laura. <b>Last name:</b> Torres. <b>Full name:</b> Laura Torres.</p><p>People may have more than one given name or family name. Ask what name they prefer to use.</p>'),card('Confirm the spelling',example('spell','How do you spell your last name?')+'<p>Say the letters clearly. Ask again if you are unsure: <b>Could you repeat that, please?</b> Spelling helps confirm identity; you do not need to recite the whole alphabet.</p>'))+
 grid(card('A preferred name',example('preferred-name','My name is Carolina, but please call me Caro.')),card('The story of a name','<p><b>Where does your name come from?</b> asks about its origin or story.</p><p>You can say: <b>My parents like this name.</b> You can also say: <b>I’m not sure.</b> You do not need to know its history.</p>'))+
 note('Use fictional contact details in classroom examples. A first conversation can focus on interests and everyday life.'))

section('personal-routines','Personal information and routines','Choose useful information about your everyday life and answer with one extra detail.',
 grid(card('Identity and origin','<p><b>be + information</b></p><p>I am a student. I’m from Colombia. My classmate is from Medellín.</p>'),card('Everyday routines','<p><b>subject + present simple</b></p>'+example('routine','I work in a bakery and study English in the evening.')),card('Add frequency','<p>Use <b>usually, often, sometimes</b> or a time phrase when it adds useful information.</p>'+example('frequency','I usually read after work. On weekends, I go for a walk.')))+
 grid(card('What do you do?','<p>In a first conversation, this often asks about your <b>job or main activity</b>: “I work in a shop.” “I’m a student.”</p>'),card('What do you do in your free time?','<p>This asks about <b>activities you choose outside work or class</b>: “I read and listen to music.” The extra words change the purpose of the question.</p>'))+
 note('A useful answer has a direct response and one detail: “I live in Envigado, near a park.” Avoid turning every answer into a long prepared speech.'))

section('asking-questions','Asking and extending questions','Choose be or do/does according to the main verb, then ask a question connected to the answer.',
 grid(card('Questions with be','<p><b>Be + subject + information?</b></p>'+example('be-question','Are you from Medellín?')+'<p><b>Question word + be + subject?</b><br>Where are you from? What is your last name?</p><p>Yes, I am. / No, I’m not. I’m from Bello.</p>'),card('Questions with other verbs','<p><b>Do + you + base verb?</b></p>'+example('do-question','Do you like cooking?')+'<p><b>Question word + do + you + base verb?</b><br>Where do you live? What do you usually cook?</p><p>Yes, I do. I usually cook soup.</p>'),card('Talking about a classmate','<p><b>Does + he/she + base verb?</b></p><p>Does she like music? Yes, she does.</p><p>Statement: She <b>likes</b> music.<br>Question: Does she <b>like</b> music?</p>'))+
 '<div class="pi-compare"><p><span class="pi-label">Notice the difference</span><br>Where <b>are</b> you from? → be<br>Where <b>do</b> you live? → live</p><p><span class="pi-label">Common corrections</span><br>“Where you live?” → <b>Where do you live?</b><br>“Are you like music?” → <b>Do you like music?</b><br>“Does she likes music?” → <b>Does she like music?</b></p></div>'+
 grid(card('Follow the answer','<p>A: I enjoy cooking.<br>B: <b>What do you usually cook?</b><br>A: Vegetable soup.</p>'),card('Return the turn','<p>A: I usually walk after work. <b>What about you?</b><br>B: I prefer reading at home.</p><p>Ask for a detail before moving to a different topic.</p>')))

section('likes-preferences','Likes and favorite activities','Say what you enjoy, express a preference and give a clear reason.',
 grid(card('An activity or a thing','<p><b>like / love / enjoy + noun</b><br>I like music. I enjoy group activities.</p><p><b>like / love / enjoy + verb-ing</b><br>I like listening to music. I enjoy cooking.</p><p>Like and love can also take <b>to + verb</b>; this unit practises the -ing pattern. After <b>enjoy</b>, use -ing, not “to cook”.</p>'),card('A stronger choice',example('prefer','I like going out, but I prefer staying in on weekdays.')+'<p>Prefer shows a choice between alternatives. Add the context so the listener understands your preference.</p>'),card('A reason',example('reason','I enjoy walking because it helps me relax.')+'<p><b>because + a reason</b><br>My classmate likes group activities because she enjoys meeting people.</p>'))+
 grid(card('A preference is not an identity','<p><b>I don’t like noisy places.</b> = a preference.<br><b>I’m quiet.</b> = a description of personality.</p><p>Use <b>don’t/doesn’t like</b> for dislikes and <b>am/is/are + adjective</b> for descriptions.</p>'),card('Find a favourite','<p><b>What is your favourite activity?</b><br>My favourite activity is cooking.</p><p><b>What do you like doing after class?</b><br>I like listening to music.</p>')))

personalities=[('shy','Sometimes uncomfortable when meeting new people.','I’m shy at first, but I enjoy talking in small groups.'),('outgoing','Comfortable meeting and talking to people.','I’m outgoing. I often start conversations.'),('quiet','Not talking very much in a particular situation.','I’m quiet in class, but I ask questions when I need help.'),('talkative','Often talking a lot.','I’m talkative when I’m with my friends.'),('active','Enjoying movement or doing many things.','I’m active on weekends. I like walking.'),('calm','Usually relaxed in a situation.','I’m calm when plans change.'),('friendly','Kind and pleasant towards other people.','I’m friendly. I welcome new classmates.'),('creative','Enjoying new ideas or making things.','I’m creative. I enjoy drawing.'),('patient','Able to wait or help without becoming annoyed quickly.','I’m patient when I explain things.'),('organized','Planning things and keeping them in order.','I’m organized. I write my plans in a notebook.')]
section('personality','Personality in context','Describe yourself with an adjective and an example, and listen to how another person describes themselves.',
 '<div class="pi-grid pi-vocabulary">'+''.join(card(say(word,word),'<p>'+meaning+'</p><p class="pi-small">'+sample+'</p>') for word,meaning,sample in personalities)+'</div>'+
 grid(card('Build a description',example('personality-model','I’m friendly and creative. I enjoy meeting people and drawing.')+'<p><b>be + adjective</b>, then add an example.</p>'),card('Ask instead of guessing','<p>A person who plays video games may be outgoing. A person who plays sports may be quiet.</p><p><b>Quiet</b> and <b>shy</b> are different ideas. <b>Active</b> and <b>outgoing</b> are different ideas. Preferences alone do not define a personality.</p>'))+
 note('Your description may change with the situation. “I’m quiet at work, but I’m talkative with my friends” is a useful, complete answer.'))

section('similarities','Similarities and differences','Report what you share and what is different without needing identical answers.',
 grid(card('A shared interest',example('both','We both like cooking.')+'<p><b>both</b> refers to the two people. It comes before the main verb here: <b>We both enjoy walking.</b></p>'),card('A difference',example('difference','I prefer reading, but my classmate prefers listening to music.')+'<p>Use <b>but</b> to connect different preferences. Remember <b>prefers / likes / enjoys</b> with he or she.</p>'),card('A short report','<p>This is my classmate Laura. She is friendly and creative. She works in a bakery. We both like cooking, but we have different routines.</p>'))+
 note('If you have no shared interest yet, ask about another activity. You can also report a real difference: “We like different activities.” Do not invent a similarity just to complete a sentence.'))

expressions=[
 ('get-along','Phrasal verb','get along with','llevarse bien con','Have a friendly relationship with someone.','Everyday, neutral. Keep with before the person.','I get along with my classmates.'),
 ('open-up','Phrasal verb','open up','abrirse o hablar con más confianza','Start talking more openly about your thoughts or feelings.','Conversational. People can take time to open up.','I open up when I know people.'),
 ('break-ice','Idiom','break the ice','romper el hielo','Help people feel more comfortable at the start of an interaction.','Common in social and classroom situations.','A simple question can break the ice.'),
 ('common','Idiomatic expression','have something in common','tener algo en común','Share an interest, characteristic or experience.','Everyday, neutral. Name the shared interest when possible.','We have something in common: we both enjoy cooking.')
]
expression_cards=[]
for key,kind,phrase,spanish,meaning,register,sample in expressions:
    expression_cards.append(card(f'<span class="pi-label">{kind}</span>{say(key,phrase)}',f'<p class="pi-spanish">{spanish}</p><p>{meaning}</p><p class="pi-small"><b>Use:</b> {register}</p>'+example(key+'-example',sample)))
expression_html=grid(*expression_cards)
section('social-expressions','Natural social expressions','Distinguish phrasal verbs, idiomatic language and ordinary social phrases, and use them for a real purpose.',
 expression_html+note('<b>Nice to meet you</b>, <b>That sounds interesting</b> and <b>What about you?</b> are useful social phrases. They are not presented as phrasal verbs. Learn an expression as a complete idea, then notice how it works in the example.'))

dialogue=[('Laura',"Hi, I’m Laura. What name do you prefer to use?"),('Mateo',"Hi, Laura. My name is Mateo. Nice to meet you."),('Laura','Nice to meet you too. What do you usually do after work?'),('Mateo','I usually read at home. What about you?'),('Laura','I prefer listening to music. What do you enjoy doing on weekends?'),('Mateo','I like cooking and walking in the park.'),('Laura','We both like cooking. What do you usually cook?'),('Mateo','Vegetable soup. How do you describe your personality?'),('Laura',"I’m friendly and creative. I enjoy drawing. What about you?"),('Mateo',"I’m quiet and patient. I like listening before I speak.")]
lines=[]
for i,(role,text) in enumerate(dialogue):
    lines.append(f'<article class="pi-dialogue-line"><span class="pi-label">{role}</span>{say("dialogue-"+str(i+1),text,role)}</article>')
model='This is my classmate Mateo. He works in a small shop and usually reads after work. He is quiet and patient. He likes cooking and walking in the park. We both enjoy cooking, but we have different routines. I prefer listening to music after work. We have something in common, and we ask questions to learn more about each other.'
section('models','Conversation and pronunciation models','Notice the order of a complete exchange and hear how to introduce a classmate clearly.',
 '<p>Read the conversation first. Listen to individual turns, or play the full exchange. Speaker names identify the turns; they are not spoken in the audio.</p><button type="button" class="pi-button" data-playlist="'+','.join('dialogue-'+str(i+1) for i in range(len(dialogue)))+'">Listen to the conversation</button><div class="pi-dialogue">'+''.join(lines)+'</div>'+
 grid(card('Introduce a classmate',example('presentation',model)),card('What to notice','<ul><li><b>I’m</b> connects I and am; <b>What’s</b> connects what and is.</li><li>Stress the main syllable: <b>FRIEND</b>-ly, cre-<b>A</b>-tive, out-<b>GO</b>-ing.</li><li>Finish the third-person verb: she <b>likes</b>, he <b>enjoys</b>.</li><li>Pause between ideas. Clear speech matters more than speed.</li></ul>')))

section('summary','Unit summary','Check what you understand before applying the language with a classmate.',
 '<ul class="pi-checklist"><li>I can start and close a conversation.</li><li>I can confirm a name and ask useful personal questions.</li><li>I can distinguish questions with be from questions with do/does.</li><li>I can explain a preference with a reason.</li><li>I can describe personality with an example.</li><li>I can ask a follow-up question and listen to the answer.</li><li>I can report shared interests and introduce my classmate.</li></ul>'+
 note('Your classroom task is to interview a classmate and introduce each other. Use short notes, listen to your partner and improve one part after feedback. The unit explanation prepares that task.'))

def header(active=''):
    return '<header class="site-header"><nav class="navbar" aria-label="Main navigation"><a class="brand" href="/index.html"><img src="/assets/img/jaralingua-logo.png" alt="JaraLingua" width="125" height="42"></a><ul class="nav-links"><li><a href="/ingles/index.html">English</a></li><li><a href="index.html"'+(' aria-current="page"' if active=='home' else '')+'>Preintermediate 1</a></li><li><a href="course-overview.html"'+(' aria-current="page"' if active=='overview' else '')+'>Course Overview</a></li><li><a href="expressions.html"'+(' aria-current="page"' if active=='expressions' else '')+'>Expressions</a></li></ul><div data-auth-nav-slot></div></nav></header>'
def hero(eyebrow,title,description,actions):
    return f'<section class="lesson-hero immersive-basic-hero pi-hero" style="--hero-image:url({IMAGE})"><div class="lesson-hero-content pi-hero-copy"><p class="eyebrow">{eyebrow}</p><h1>{title}</h1><p>{description}</p><div class="hero-actions pi-actions">{actions}</div></div><figure class="lesson-hero-image"><img src="{IMAGE}" alt="Adult English learners exchanging names and interests in a bright classroom" width="1536" height="1024" fetchpriority="high"></figure></section>'
def link(href,text,secondary=False):return f'<a class="btn pi-button '+('btn-secondary' if secondary else 'btn-primary')+f'" href="{href}">{text}</a>'
def shell(title,description,body,active=''):
    return '<!doctype html>\n<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="description" content="'+esc(description)+'"><title>'+esc(title)+' | JaraLingua</title><link rel="icon" href="/favicon.ico"><link rel="stylesheet" href="/assets/css/style.css?v=20260727-basic2-top-nav-auth"><link rel="stylesheet" href="/assets/css/english-basic-responsive.css?v=20260727-basic2-compact-header"><link rel="stylesheet" href="/assets/css/english-basic-2.css?v=20260830-basic2-horizontal-hero"><link rel="stylesheet" href="/assets/css/english-preintermediate-1.css?v='+VERSION+'"></head><body class="english-basic-page basic2-page preinter-page">'+header(active)+'<main id="main-content">'+body+'</main><footer class="site-footer"><p>JaraLingua · Preintermediate English Course 1</p></footer><script src="/assets/js/preintermediate1-unit1-audio-data.js?v='+VERSION+'"></script><script src="/assets/js/preintermediate1-lesson.js?v='+VERSION+'"></script><script src="/assets/js/google-auth-config.js"></script><script src="https://accounts.google.com/gsi/client" async defer></script><script src="/assets/js/google-auth.js?v=20260922-auth-expiry-recovery"></script><script src="/assets/js/course-switcher.js?v='+VERSION+'"></script><script src="/assets/js/page-qr-access.js?v='+VERSION+'"></script></body></html>\n'

topics=''.join(f'<details class="pi-topic" id="{s["id"]}"><summary><span class="pi-number">{i+1:02}</span><h2>{s["title"]}</h2></summary><div class="pi-topic-body"><p class="pi-goal"><b>What we will learn:</b> {s["goal"]}</p>{controls() if s["id"] not in ["summary"] else ""}{s["body"]}</div></details>' for i,s in enumerate(sections))
unitbody=hero('Preintermediate English Course 1 · Unit 1','Making Friends','Meet people, ask better questions and discover shared interests. Build a conversation that helps you introduce a new classmate.',link('#first-connection','Start the explanation')+link('course-overview.html','Course Overview',True))+'<div class="pi-shell"><section class="pi-objective"><h2>What you will be able to do</h2><p>Exchange personal information, explain preferences, describe personality with examples, and introduce a classmate using what you learn in an interview.</p><div class="pi-route"><span>01 · Connect</span><span>02 · Ask and listen</span><span>03 · Find common ground</span><span>04 · Introduce a classmate</span></div></section><details class="pi-quick"><summary>Explore the unit topics</summary><nav aria-label="Unit topics">'+''.join(f'<a href="#{s["id"]}">{i+1:02} · {s["title"]}</a>' for i,s in enumerate(sections))+'</nav></details><p class="pi-intro">Open a topic to explore its explanation. Tap the highlighted words and sentences for professional American English models.</p>'+topics+'</div>'
(COURSE/'unit-1-making-friends.html').write_text(shell('Unit 1 Making Friends','Learn to meet people, ask questions, describe personality and explain shared interests with visual explanations and professional audio.',unitbody))

unitmap=[('1','Making Friends','Meet people, describe personality and explain shared interests.','Sessions 1–2 · 6 hours'),('2','Interests and Hobbies','Explore music, sports, handmade projects and the natural world.','Sessions 3–5 · 9 hours'),('3','Healthy Living','Discuss habits, everyday problems, advice and relaxation.','Sessions 6–8 · 9 hours'),('4','Celebrations and Festivals','Describe traditions and organise plans for special occasions.','Sessions 9–10 · 6 hours'),('5','Childhood Memories','Tell memories and compare life now with past habits.','Sessions 11–13 · 9 hours'),('6','Around Town','Give tourist information, directions and recommendations.','Sessions 14–16 · 9 hours')]
overview=hero('Course Overview','Your learning route','Explore the course through people, interests, healthy living, celebrations, memories and city life.',link('unit-1-making-friends.html','Explore Unit 1')+link('index.html','Course home',True))+'<div class="pi-shell"><p class="pi-intro">Six units lead to classroom tasks. Unit 1 explanations are available. The remaining units appear here as the course route and will open as their materials are developed.</p>'
for n,title,desc,timing in unitmap:
    if n=='1':
        overview+='<details class="pi-topic" id="unit-1"><summary><span class="pi-number">01</span><h2>Making Friends</h2></summary><div class="pi-topic-body"><p class="pi-goal">'+timing+'</p><p>'+desc+'</p><div class="pi-grid">'+''.join(card(s['title'],'<p>'+s['goal']+'</p>') for s in sections[:8])+'</div><div class="pi-actions">'+link('unit-1-making-friends.html','Open the full unit')+link('expressions.html','Explore expressions',True)+'</div></div></details>'
    else:overview+=f'<article class="pi-planned"><span class="pi-number">{int(n):02}</span><div><h2>{title}</h2><p>{desc}</p><p class="pi-small">{timing} · Materials in development</p></div></article>'
overview+='<section class="pi-objective"><h2>Review and assessment</h2><p>Sessions 17–20 revisit the six units. Session 21 and one additional hour complete the 64-hour route. The five official tasks each carry 20%: writing in session 5, speaking in session 8, an integrated task in session 13, final writing in session 17 and final speaking in session 21.</p></section></div>'
(COURSE/'course-overview.html').write_text(shell('Course Overview Preintermediate 1','Six-unit learning route for the 64-hour Preintermediate English Course 1.',overview,'overview'))
home=hero('English learning path','Preintermediate English Course 1','Connect with people and communicate more clearly about everyday life. Start with Making Friends and move from explanations to real conversations.',link('unit-1-making-friends.html','Start Making Friends')+link('course-overview.html','Explore the course',True))+'<div class="pi-shell"><section class="pi-objective"><h2>Start with Unit 1</h2><p>Learn how to ask useful questions, talk about preferences, describe personality and introduce someone you have just met.</p></section><div class="pi-grid">'+card('Course Overview','<p>See the six-unit route and explore the explanation of Making Friends.</p>'+link('course-overview.html','Open Course Overview'))+card('Unit 1 Making Friends','<p>Visual explanations, complete examples and individual audio models.</p>'+link('unit-1-making-friends.html','Open Unit 1'))+card('Expressions in context','<p>Learn the meaning, use and pronunciation of the expressions taught in Unit 1.</p>'+link('expressions.html','Open expressions'))+'</div></div>'
(COURSE/'index.html').write_text(shell('Preintermediate English Course 1','Preintermediate English Course 1 learning route, starting with Making Friends.',home,'home'))
library=hero('Unit 1 · Expression library','Expressions for making friends','Understand the complete expression, listen to a model and notice how it helps a real conversation.',link('unit-1-making-friends.html#social-expressions','Study the unit explanation')+link('index.html','Course home',True))+'<div class="pi-shell"><section class="pi-objective"><h2>Meaning before memorising</h2><p>A phrasal verb combines a verb with a particle. An idiom or idiomatic expression has a conventional meaning that you learn as a complete phrase. The Spanish line explains the general idea; the English example shows how to use it.</p></section>'+controls()+expression_html+'</div>'
(COURSE/'expressions.html').write_text(shell('Making Friends Expressions','Phrasal verbs and idiomatic expressions from Making Friends with professional individual audio.',library,'expressions'))

(ROOT/'assets/js/preintermediate1-unit1-audio-data.js').write_text('window.Preintermediate1Audio = '+json.dumps(audios,ensure_ascii=False,indent=2)+';\n')
audio_dir=COURSE/'audio/unit1/lesson'
(audio_dir/'audio-manifest.json').write_text(json.dumps(audios,ensure_ascii=False,indent=2)+'\n')
(audio_dir/'scripts.md').write_text('# Preintermediate 1 Unit 1 exact teaching audio\n\n'+ '\n\n'.join(f'## {key}\nFile: `{key}.mp3`\n\n{item["voice"]}: {item["text"]}' for key,item in audios.items())+'\n')
print('Built four pages,',len(sections),'topics and',len(audios),'exact audio models.')

# The same SVG QR assets and shared classroom enlargement as Basic 2.
import sys
try:
    import qrcode
except ModuleNotFoundError:
    # Existing project dependency used by Basic 2's QR builders.
    sys.path.insert(0, str(ROOT / 'tmp/unit5-explanation/python-deps'))
    import qrcode
import qrcode.image.svg
for page in COURSE.glob('*.html'):
    relative=page.relative_to(ROOT).as_posix()
    target='https://www.jaralingua.com/'+relative
    slug=relative.removesuffix('.html').replace('/','-')
    qrcode.make(target,image_factory=qrcode.image.svg.SvgPathImage,box_size=10,border=4).save(ROOT/'assets/img/page-qr'/(slug+'.svg'))
print('Built four production URL QR codes using the shared Basic 2 component.')
