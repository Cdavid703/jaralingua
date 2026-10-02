"""Build Unit 5 teaching page and its exact audio scripts. No exercises here."""
from pathlib import Path
import hashlib,html,json
ROOT=Path(__file__).resolve().parents[1]
PAGE='unit-5-impressions-feelings-and-satire.html'
DEST=ROOT/'ingles/intermediate-2/audio/unit-5-explanation'
DEST.mkdir(parents=True,exist_ok=True)
audio={}
def esc(x):return html.escape(str(x),quote=True)
def say(text):
 key=hashlib.sha256(text.encode()).hexdigest()[:14]
 audio.setdefault(key,dict(id=key,file=key+'.mp3',text=text,kind='phrase'))
 return f'<button type="button" class="u5-say" data-u5-say="{key}" aria-pressed="false" aria-label="Listen: {esc(text)}">{esc(text)}<span class="u4-listen-mark" aria-hidden="true"> ◖))</span></button>'
def model(t):return '<p class="u4-model">'+say(t)+'</p>'
def card(t,b):return '<article class="u4-card"><h3>'+t+'</h3>'+b+'</article>'
def grid(*cards,cols=3):return f'<div class="u5-grid u5-cols-{cols}">'+''.join(cards)+'</div>'
def note(t,b):return f'<aside class="u4-note"><strong>{t}</strong><p>{b}</p></aside>'
def error(w,r,why):return f'<article class="u4-card u5-error"><p><b class="u5-error-label">Avoid</b> <s>{esc(w)}</s></p><p><b class="u5-correct-label">Use</b> {say(r)}</p><p>{why}</p></article>'
def formula(parts):return '<div class="u4-formula">'+'<span aria-hidden="true">+</span>'.join(f'<span class="{("u4-aux" if i==1 else "u4-part" if i==2 else "")}"><small>{esc(a)}</small><b>{esc(b)}</b></span>' for i,(a,b) in enumerate(parts))+'</div>'
def table(headers,rows):return '<div class="u5-table"><table><thead><tr>'+''.join('<th scope="col">'+h+'</th>' for h in headers)+'</tr></thead><tbody>'+''.join('<tr>'+''.join(f'<td data-label="{esc(headers[i])}">{v}</td>' for i,v in enumerate(row))+'</tr>' for row in rows)+'</tbody></table></div>'
scenes={'waiting':'A woman at a bus stop checks her watch while holding her phone.','tired':'A volunteer yawns beside boxes of donated food.','presentation':'A student holds her notes before speaking to a small group.','relieved':'A student smiles after a presentation while a friend supports her.','bored':'A learner rests his cheek on his hand during a talk.','interested':'Visitors lean forward while a guide explains a windmill model.'}
def scene(key,title,body,label=None):
 return f'<article class="u4-card u5-scene" data-project-title="{esc(label or title)}"><button type="button" class="u4-project-open" aria-label="Enlarge: {esc(label or title)}" aria-haspopup="dialog"><img src="../../assets/img/english-intermediate-2/unit-5/explanation/{key}.webp" width="1536" height="1024" alt="{esc(scenes[key])}" loading="lazy" decoding="async"/><span class="u4-project-hint">Enlarge ↗</span></button><div class="u4-card-copy"><h3>{title}</h3>{body}</div></article>'
topics=[]
def topic(id,title,intro,body,keys=''):
 n=len(topics)+1
 topics.append(f'<details class="ie2-theory-topic ie2-search-item" id="{id}" data-search-keywords="{esc(keys)}"'+(' open' if n==1 else '')+f'><summary><span class="ie2-topic-index">{n:02}</span><span class="ie2-topic-summary"><strong>{title}</strong><small>{intro}</small></span><span class="ie2-topic-toggle" aria-hidden="true">+</span></summary><div class="ie2-theory-body"><div class="ie2-key-answer"><span>Understand the meaning</span><h2>{title}</h2><p>{intro}</p></div>{body}</div></details>')
topic('evidence','Start with what you can see','An observation is something visible. A deduction is your explanation of it.',
grid(scene('waiting','One scene, several explanations','<p><b>Observation:</b> She is checking the time.</p>'+model('She might be waiting for someone.')+'<p><b>Another possibility:</b> She could be worried about being late. The picture does not tell us who she is waiting for.</p>'),
scene('tired','Add information before you decide','<p><b>Observation:</b> He is yawning.</p><p><b>Extra information:</b> He has worked all night.</p>'+model('He must be tired. He has worked all night.')+'<p>The extra information supports a strong deduction.</p>'),
scene('presentation','Keep another explanation open','<p><b>Observation:</b> She is holding her notes.</p>'+model('She looks nervous, but she might simply be concentrating.')+'<p>A gesture can have more than one explanation.</p>'))+
'<ol class="u4-flow"><li><strong>1 · Observe</strong><span>Say what you can actually see or hear.</span></li><li><strong>2 · Interpret</strong><span>Choose a level of certainty.</span></li><li><strong>3 · Support</strong><span>Give evidence and consider another explanation.</span></li></ol>'+
note('A picture is a clue, not proof','Do not decide someone’s job, personality or background from their clothes or face alone. Ask for information when you can.'),'evidence fact observation deduction guess interpretation')
topic('modals','Must, might and can’t','Choose a modal to show how strongly the evidence supports your idea.',
'<div class="u5-certainty" aria-label="Three ways to express certainty"><div><b>Strong negative deduction</b><span>can’t be</span><small>I am almost sure this is not true. Can’t means cannot.</small></div><div><b>Possible explanation</b><span>might · may · could</span><small>Perhaps it is true. I am not sure; another explanation is possible.</small></div><div><b>Strong positive deduction</b><span>must be</span><small>I am almost sure this is true because of the clues. This is a conclusion, not an order.</small></div></div>'+
note('What does be mean here?','Be is the base form of am, is and are. After a modal, use be: <b>She is tired → She might be tired.</b> Might be means perhaps she is; must be means I am almost sure she is; can’t be means I am almost sure she is not.')+
note('These are not exact percentages','These words express your judgement. Even a strong deduction can turn out to be wrong when new information appears.')+
table(['Meaning','Example','Why this word?'],[
['must be · strong deduction',say('The lights are on, and I can hear voices. Someone must be inside.'),'I am almost sure someone is inside. The lights and voices give strong evidence.'],
['might be · possibility',say('The lights are on. Someone might be inside.'),'Perhaps someone is inside, but I am not sure. The lights could be on even when nobody is there.'],
['can’t be · strong negative deduction',say('That can’t be Leo. Leo is in another country today.'),'I am almost sure that person is not Leo. His location is evidence against the idea.'],
['Other possibilities',say('The lights may be on a timer. They could switch on automatically.'),'May, might and could all introduce possibilities here.']])+
'<h3>Might, may and could: what is the difference?</h3>'+table(['Word','How it sounds here','Example'],[
['might','A tentative guess: it is possible, but I am not sure.',say('She might be tired.')],
['may','Also means perhaps. It can sound a little more formal than might.',say('She may be tired.')],
['could','Presents a possible explanation or alternative. It also works in a question about a possibility now.',say('Could she be waiting for us?')]])+
note('Often, all three work','<b>She might / may / could be tired</b> all mean that tiredness is possible. There is no fixed certainty order. Here, may is not permission and could is not past ability. For a question about a possibility, <b>Could she be…?</b> is a natural choice.')+
'<h3>Build it in three useful ways</h3>'+formula([('Subject','She'),('Modal','might'),('Base verb','know'),('More information','the answer.')])+
grid(card('A state or description',model('She might be tired.')+'<p><b>Meaning:</b> Perhaps she is tired. We are describing how she feels, not an action.</p><p><b>modal + be + adjective</b><br><b>might</b> = possible · <b>be</b> = base form of is · <b>tired</b> = a description.</p><p><b>She is tired → She might be tired.</b><br>Tired is an adjective, so it needs be here. Do not say “She might tired” or “She might is tired.”</p>'),
card('An action happening now',model('She might be waiting for a friend.')+'<p><b>Meaning:</b> Perhaps she is waiting for a friend right now. Other explanations are possible.</p><p><b>modal + be + verb-ing</b><br><b>might</b> = possible · <b>be waiting</b> = an action in progress.</p><p><b>She is waiting → She might be waiting.</b><br>Use be before waiting. Do not say “She might waiting.”</p>'),
card('Another verb',model('She might know the answer.')+'<p><b>Meaning:</b> Perhaps she knows the answer. We are not sure.</p><p><b>modal + base verb</b><br><b>might</b> = possible · <b>know</b> = the main verb in its base form.</p><p><b>She knows → She might know.</b><br>Know is already a verb, so do not add be, to or -s: not “might be know,” “might to know” or “might knows.”</p>'))+
note('The same forms work with must and can’t','Change the modal to change certainty, while keeping the verb form: <b>must be tired / can’t be tired</b>; <b>must be waiting / can’t be waiting</b>; <b>must know / can’t know</b>. Choose the modal only when the clues support that meaning.')+
'<h3>One word, a different job: must</h3>'+grid(card('Deduction: what I conclude',model('He must be tired.')+'<p>I have evidence. I strongly believe that he is tired.</p>'),card('Obligation: what a rule requires',model('You must wear a visitor badge.')+'<p>This is a requirement. It does not describe how certain I feel.</p>'),cols=2)+
'<h3>Can’t, mustn’t and might not are different</h3>'+
table(['Expression','Example','Meaning'],[
['can’t + verb',say('This can’t be the right room. The room number is different.'),'Strong negative deduction in this context.'],
['mustn’t + verb',say('You mustn’t enter this room.'),'A rule forbids entry. This is prohibition.'],
['might not + verb',say('She might not be ready yet.'),'Perhaps she is not ready. We are not sure.'],
['don’t have to + verb',say('You don’t have to bring any food.'),'It is not necessary. It is allowed, but optional.']])+
note('Context changes the meaning','“I can’t swim” describes ability. “You can’t park here” can express a rule. “That can’t be true” expresses a deduction. Read the complete situation.')+
'<h3>Ask about a possibility</h3>'+model('Could she be waiting for us?')+'<p>Put the modal before the subject. You can answer: “Yes, she might be.” Here, could describes a present possibility; it is not automatically about the past.</p>'+
'<h3>Common errors, explained</h3>'+grid(error('She must to be tired.','She must be tired.','Use the base verb after a modal, without to.'),error('He might is nervous.','He might be nervous.','The base form of is is be.'),error('She must knows him.','She must know him.','The modal does not take -s, and the next verb stays in its base form.')),'modals must might may could cannot cant obligation prohibition certainty base verb')


topic('looks-seems','Looks, seems and looks like','Describe an impression without presenting it as a confirmed fact.',
grid(scene('presentation','What her appearance suggests',model('She looks nervous.')+'<p>You are using visible clues, such as her expression or posture.</p>'),
scene('relieved','What the situation suggests',model('She seems relieved.')+'<p>Your impression may come from her words, actions or the situation, not only her face.</p>'),
scene('interested','A person can seem interesting',model('The guide seems interesting.')+'<p>This is your impression of the guide. It does not describe the guide’s own feeling.</p>'))+
table(['Pattern','Example','How it works'],[
['look + adjective',say('She looks confident.'),'Looks describes her appearance. Confident is an adjective.'],
['seem + adjective',say('She seems confident.'),'Seems gives a general impression.'],
['look like + noun phrase',say('He looks like a volunteer.'),'A volunteer is a noun phrase. The appearance is only a clue.'],
['look like + complete idea',say('It looks like he needs help.'),'He needs help has its own subject and verb.'],
['seem + to + base verb',say('He seems to know everyone.'),'Use to when another verb follows seems.'],
['be + adjective',say('She is nervous.'),'You present the feeling as a fact, perhaps because she told you.']])+
'<h3>Follow the word after look</h3>'+formula([('Subject','She'),('Appearance verb','looks'),('Adjective','tired.')])+formula([('Subject','She'),('Appearance verb','looks'),('Link','like'),('Noun phrase','a tired student.')])+
note('Compare look like and look at','“Look like” describes a resemblance or impression. “Look at the picture” asks someone to direct their eyes towards something.')+
'<h3>Questions, negatives and subject agreement</h3>'+grid(
card('One person / several people',model('He looks worried. They look worried.')+'<p>Use looks/seems with he, she or it. Use look/seem with I, you, we or they.</p>'),
card('Ask',model('Does she seem upset?')+'<p>Does already marks the subject: use seem, not seems.</p>'),
card('Make it negative',model('She doesn’t look worried.')+'<p>This describes the appearance. It does not prove how she feels inside.</p>'))+
'<h3>Common errors, explained</h3>'+grid(error('She looks like tired.','She looks tired.','Use an adjective directly after looks.'),error('He seems know everyone.','He seems to know everyone.','Use seems to before another base verb.'),error('Does she looks nervous?','Does she look nervous?','After does, use the base form look.')),'looks seems look like adjective noun appearance fact does doesnt')
pairs=[
('bored','boring','I feel bored.','The talk is boring.','Bored describes a feeling. Boring describes something or someone that causes that feeling.'),
('interested','interesting','The visitors are interested.','The guide is interesting.','The visitors feel interest. The guide holds their attention. A person can be interesting.'),
('excited','exciting','The students are excited.','The project is exciting.','Excited describes their feeling. Exciting describes what creates excitement.'),
('confused','confusing','I am confused about the instructions.','The instructions are confusing.','A person may not understand because the information is difficult to follow.'),
('surprised','surprising','We were surprised by the result.','The result was surprising.','The first sentence describes our reaction. The second describes its cause.'),
('embarrassed','embarrassing','He felt embarrassed about the mistake.','The mistake was embarrassing.','Embarrassed is an uncomfortable social feeling. Embarrassing describes its cause.')]
pair_meanings={
'bored':('I feel little interest. I want something more interesting to happen.','The talk does not hold my attention. It makes me feel bored.'),
'interested':('The visitors want to listen, learn or know more.','The guide holds their attention and makes them want to learn more.'),
'excited':('The students feel happy and full of energy about the project.','The project creates that happy, energetic feeling.'),
'confused':('I do not understand clearly. I am not sure what to do.','The instructions are difficult to understand. They cause the confusion.'),
'surprised':('We did not expect the result. This describes our reaction.','The result was unexpected. It caused our surprise.'),
'embarrassed':('He feels uncomfortable or shy because of the mistake, especially in front of others.','The mistake creates that uncomfortable feeling.')
}

topic('ed-ing','Bored or boring? The feeling and its cause','The ending changes the meaning. Both endings can describe people.',
grid(card('-ed: how someone feels','<p>Use these <b>-ed adjectives</b> for the person who experiences the feeling. Ask: <b>How does this person feel?</b></p>'+model('I feel bored.')+'<p>I am not interested in what is happening. This describes my feeling.</p>'),
card('-ing: what causes the feeling','<p>Use these <b>-ing adjectives</b> for the person, thing or situation that produces the feeling. Ask: <b>What is it like? How does it make someone feel?</b></p>'+model('The talk is boring.')+'<p>The talk makes me feel bored. This describes the cause.</p>'),cols=2)+
note('A person can have either ending','<b>I am bored</b> means I feel little interest. <b>I am boring</b> means I make other people feel bored. Both are possible English, but they say different things. The rule is about <b>feeling versus cause</b>, not people versus things.')+
'<h3>Compare each feeling with its cause</h3>'+grid(*(card(say(a)+' / '+say(b),'<p><b>Feeling · '+a+'</b></p>'+model(x)+'<p>'+pair_meanings[a][0]+'</p><p><b>Cause · '+b+'</b></p>'+model(y)+'<p>'+pair_meanings[a][1]+'</p>') for a,b,x,y,why in pairs))+
grid(scene('bored','He looks bored','<p><b>The person feels it.</b> His expression suggests that he is not interested.</p>'+model('He looks bored. The talk might be boring.')),
scene('interested','The guide is interesting','<p><b>A person can cause the feeling.</b> The visitors want to hear more.</p>'+model('The guide is interesting, and the visitors look interested.')),cols=2)+
'<ol class="u4-flow"><li><strong>Cause</strong><span>The instructions are confusing.</span></li><li><strong>Effect</strong><span>I do not understand them.</span></li><li><strong>Feeling</strong><span>I am confused.</span></li></ol>'+
'<h3>Combine the feeling and the reason</h3>'+formula([('Feeling','I am confused'),('Reason link','because'),('Cause','the instructions are confusing.')])+
note('Why do we use am, is or are?','In these examples, bored and boring are <b>adjectives</b>: they describe a feeling or a quality. Use <b>be + adjective</b>: I am bored; the talk is boring. You can also use feel or look to describe a feeling: I feel bored; he looks bored.')+
note('The ending does not tell you the time','<b>I am bored</b> describes a feeling now; <b>I was bored</b> describes it in the past. The -ed ending does not make these sentences past tense. In <b>The talk is boring</b>, boring is a description; in <b>She is waiting</b>, waiting is an action in progress.')+
'<h3>Listen to the endings</h3>'+grid(card('One syllable, two syllables',say('Bored. Boring.')+'<p>Bored ends with /d/. Boring has two syllables. Do not add a new syllable to bored.</p>'),
card('The final sound',say('Confused. Confusing.')+'<p>Keep the /d/ in confused. In confusing, the final sound is /ŋ/, as in sing.</p>'),
card('Not every -ed sounds the same',say('Excited. Surprised. Embarrassed.')+'<p>Excited ends with /ɪd/, surprised with /d/, and embarrassed with /t/. Hear the model rather than saying every ending the same way.</p>'))+
note('Two useful limits','Not all emotion adjectives have an -ed/-ing pair: happy and sad do not. Also, an -ing word after be can describe an action: “She is waiting.” In “The talk is boring,” boring describes the talk.')+
grid(error('I am boring. (when I mean that I feel no interest)','I am bored.','I am boring means other people find me uninteresting. Both sentences are grammatical, but their meanings differ.'),error('The instructions are confused. (when I mean difficult to follow)','The instructions are confusing.','Use confusing for the cause. Use confused for the person who does not understand.'),cols=2),'bored boring interested interesting excited confusing ed ing feelings cause pronunciation')
topic('opinions','I think, I guess and perhaps','Tell the listener that you are giving an opinion or a possible explanation.',
table(['Expression','Example','Use'],[
['I think + complete idea',say('I think she is worried.'),'<b>Meaning:</b> This is what I believe. Here, I believe she is worried, but I am presenting my opinion rather than a confirmed fact. Use it to share an impression and add a reason when you can.'],
['I guess + complete idea',say('I guess he is waiting for a friend.'),'<b>Meaning:</b> This is my best guess. I do not have enough information to be sure. Here, waiting for a friend is one explanation I can imagine. I guess is common in informal conversation.'],
['Perhaps / Maybe + complete idea',say('Perhaps she needs more time.'),'<b>Meaning:</b> It is possible that she needs more time. Perhaps and maybe both mean that something is possible. Maybe is common in conversation; perhaps can sound a little more formal.'],
['I don’t think + complete idea',say('I don’t think he is angry.'),'<b>Meaning:</b> In this everyday use, I believe he is probably not angry. Put don’t before think: <b>I don’t think + he is angry.</b> This is a negative opinion, not proof of how he feels.']])+
note('Choose the expression for your message','<b>I think</b> introduces a belief or opinion. <b>I guess</b> presents a tentative, informal answer. <b>Perhaps / Maybe</b> presents a possibility. These meanings overlap: they are not fixed percentages of certainty. Your reason and tone also matter.')+
'<h3>What is a complete idea?</h3>'+formula([('Opinion starter','I think'),('Subject','she'),('Verb','is'),('Description','worried.')])+
'<p><b>She is worried</b> has its own subject and verb. Put <b>I think</b> or <b>I guess</b> before a complete idea. Perhaps and maybe can also introduce one: <b>Perhaps + she needs more time.</b> Do not leave out she or the verb.</p>'+
'<h3>Maybe and may be: similar sound, different structure</h3>'+grid(
card('Maybe: one word',model('Maybe she is tired.')+'<p><b>Meaning:</b> Perhaps she is tired.</p><p><b>Maybe + subject + verb + description</b><br>Maybe introduces the whole idea. <b>She is tired</b> still needs is.</p><p><b>Maybe</b> is one word meaning perhaps; it is not the verb.</p>'),
card('May be: two words',model('She may be tired.')+'<p><b>Meaning:</b> It is possible that she is tired.</p><p><b>Subject + may + be + description</b><br>May expresses possibility. Be is the base form of is after the modal.</p><p><b>May be</b> is two words: a modal and a verb. Do not write “She maybe tired.”</p>'),cols=2)+
'<h3>Hear a respectful disagreement</h3><div class="u4-dialogue"><p><strong>Alex</strong><span>'+say('I think she is upset because she is very quiet.')+'</span></p><p><strong>Sam</strong><span>'+say('That is possible, but she might just be tired.')+'</span></p><p><strong>Alex</strong><span>'+say('You may be right. We could ask her.')+'</span></p></div>'+
'<ol class="u4-flow"><li><strong>1 · Give an impression</strong><span>Alex thinks she is upset and gives a clue: she is quiet.</span></li><li><strong>2 · Offer another possibility</strong><span>Sam accepts that idea as possible, then suggests tiredness. He does not claim Alex is wrong.</span></li><li><strong>3 · Check the idea</strong><span>Alex accepts that Sam may be right and suggests asking her. Asking gives better information than guessing.</span></li></ol>'+
note('An opinion is not evidence','“I think” does not make a claim true. Add what you saw, heard or checked. Avoid assuming that a quiet person is unfriendly.')+
grid(error('I think is tired.','I think she is tired.','The idea after I think needs its own subject.'),error('She maybe tired.','She may be tired.','After the subject, use the modal may and the verb be. Alternatively: Maybe she is tired.'),cols=2),'opinion guess think perhaps maybe may be disagree respectful')
topic('connections','Because, so, but, although and though','Connect the same ideas in different ways: reason, result or contrast.',
grid(scene('tired','Reason and result','<p><b>Known information:</b> He worked all night.</p>'+model('He must be tired because he worked all night.')+model('He worked all night, so he must be tired.')),
scene('presentation','Contrast','<p>Feeling nervous does not always stop someone from speaking clearly.</p>'+model('Although she feels nervous, she speaks clearly.')+model('She feels nervous, but she speaks clearly.')),cols=2)+
table(['Link','What follows it','Example'],[
['because','A reason with a subject and verb.',say('She seems relieved because the presentation is over.')],
['because of','A noun phrase.',say('The trip was delayed because of the rain.')],
['so','A result or conclusion.',say('The presentation is over, so she seems relieved.')],
['but','An idea that contrasts with the first.',say('He seems shy, but he is very friendly.')],
['although','An idea that contrasts with the main message.',say('Although he seems shy, he is very friendly.')],
['though at the end','An informal contrast with the previous idea.',say('He seems shy. He is very friendly, though.')]])+
'<h3>Two positions for although</h3>'+model('Although she is nervous, she speaks clearly.')+model('She speaks clearly although she is nervous.')+
'<p>When the although part comes first, separate it with a comma. When it comes after the main message, a comma is usually unnecessary in these simple examples.</p>'+
'<ol class="u4-flow"><li><strong>Reason → conclusion</strong><span>He worked all night → so he must be tired.</span></li><li><strong>Conclusion → reason</strong><span>He must be tired → because he worked all night.</span></li><li><strong>Unexpected contrast</strong><span>Although she is nervous → she speaks clearly.</span></li></ol>'+
grid(error('Although she is nervous, but she speaks clearly.','Although she is nervous, she speaks clearly.','Choose although or but for this connection. Do not use both together.'),
error('Because he worked all night, so he is tired.','Because he worked all night, he is tired.','Use because for the reason, or so for the result. One connector is enough here.'),
error('Because of she is tired, she is resting.','Because she is tired, she is resting.','Use because before a subject and verb. Use because of before a noun phrase.'))+
note('Sound: though and thought','Though ends with the vowel /oʊ/. Thought ends with /t/. Although and though share the voiced /ð/ sound of this. Listen to the complete models.')+model('Though. Thought. Although she is nervous, she speaks clearly.'),'because because of so but although though thought reason result contrast comma')


feelings=[
('nervous','presentation','Worried or tense before something important.','She feels nervous before the presentation.'),
('relieved','relieved','Glad that a worry or difficulty is over.','She feels relieved after the presentation.'),
('worried','waiting','Thinking that something bad might happen.','He is worried about missing the bus.'),
('confident','presentation','Feeling sure about your ability.','She sounds confident when she explains her idea.'),
('bored','bored','Feeling little interest in what is happening.','He looks bored during the talk.'),
('interested','interested','Wanting to know or learn more.','The visitors are interested in the model.'),
('tired','tired','Needing rest.','He feels tired after a long day.'),
('proud','relieved','Pleased about something you or another person achieved.','She is proud of her progress.'),
('embarrassed','presentation','Uncomfortable because of a social mistake or unwanted attention.','He felt embarrassed when he forgot her name.'),
('frustrated','waiting','Upset because something stops you from doing what you want.','She is frustrated because the bus is late.'),
('disappointed','bored','Sad because something was not as good as you hoped.','He was disappointed with the result.'),
('grateful','relieved','Feeling thankful for help or kindness.','She is grateful for her friend’s support.')]
topic('feelings','Feelings in context','Learn the word with a situation and a useful phrase.',
'<p>The same scene can suggest different feelings. These are example contexts, not certain descriptions of the people in the photographs.</p>'+
grid(*(scene(img,say(word),'<p>'+meaning+'</p>'+model(example),label=word) for word,img,meaning,example in feelings),cols=4)+
'<h3>Close meanings, different focus</h3>'+grid(
card('Worried or nervous?','<p><b>Worried:</b> you think about a possible problem.</p><p><b>Nervous:</b> you feel tense, often before an event. You can feel both.</p>'),
card('Frustrated or disappointed?','<p><b>Frustrated:</b> an obstacle stops your progress.</p><p><b>Disappointed:</b> a result does not meet your hopes.</p>'),
card('A mood or a personality?','<p><b>She feels nervous today:</b> a current feeling.</p><p><b>She is usually confident:</b> a more general description. One moment does not tell you everything about a person.</p>')),'feelings mood nervous relieved worried confident proud embarrassed frustrated disappointed grateful')
expressions=[
('cheer up','Feel happier, or help someone feel happier.','Her friend cheered her up.','With a pronoun: cheer her up, not cheer up her.'),
('calm down','Become less tense or upset.','He took a slow breath to calm down.','A direct order like Calm down! can sound impatient. Try a supportive suggestion.'),
('open up','Talk more openly about your feelings.','She opened up to a close friend.','Use to before the person you talk to. Do not pressure someone to share.'),
('fit in','Feel accepted as part of a group.','He wants to fit in with his new team.','Use with to name the group.'),
('get along with','Have a friendly relationship with someone.','She gets along with her classmates.','Keep with before the person. Get on with is also common.'),
('reach out to','Contact someone to offer or ask for help.','They reached out to a local charity.','Keep to before the person or organization.'),
('stand up for','Defend or support someone or something.','She stands up for people who need help.','Keep the complete expression together.'),
('look up to','Admire and respect someone.','I look up to my community teacher.','Look like describes resemblance. Look up to expresses admiration.'),
('break the ice','Make a first meeting feel more comfortable.','A friendly question can break the ice.','Informal; no real ice is involved.'),
('feel under the weather','Feel a little ill.','He feels under the weather today.','This is about health, not simply feeling sad.'),
('be on cloud nine','Be extremely happy.','She is on cloud nine after hearing the news.','Informal; often a reaction to very good news.'),
('have a heart of gold','Be very kind and generous.','Our neighbor has a heart of gold.','A warm compliment supported by the person’s actions.')]
expression_info={'cheer up': {'kind': 'Phrasal verb', 'spanish': 'Animarse / animar a alguien'}, 'calm down': {'kind': 'Phrasal verb', 'spanish': 'Calmarse'}, 'open up': {'kind': 'Phrasal verb', 'spanish': 'Abrirse y hablar de los sentimientos'}, 'fit in': {'kind': 'Phrasal verb', 'spanish': 'Encajar / sentirse integrado'}, 'get along with': {'kind': 'Phrasal verb', 'spanish': 'Llevarse bien con'}, 'reach out to': {'kind': 'Phrasal verb', 'spanish': 'Contactar para ofrecer o pedir ayuda'}, 'stand up for': {'kind': 'Phrasal verb', 'spanish': 'Defender / apoyar'}, 'look up to': {'kind': 'Phrasal verb', 'spanish': 'Admirar / respetar'}, 'break the ice': {'kind': 'Idiom', 'spanish': 'Romper el hielo'}, 'feel under the weather': {'kind': 'Idiom', 'spanish': 'Sentirse indispuesto / un poco enfermo'}, 'be on cloud nine': {'kind': 'Idiom', 'spanish': 'Estar feliz de la vida'}, 'have a heart of gold': {'kind': 'Idiom', 'spanish': 'Tener un corazón de oro'}}

topic('expressions','Phrasal verbs and idioms','Use expressions to describe support, relationships and reactions.',
grid(card('What is a phrasal verb?','<p>A verb with a small word such as <b>up, down or out</b>. Together, they have a particular meaning. Some expressions also need a word such as <b>with, for or to</b>.</p><p><b>Cheer up</b> means feel happier or help someone feel happier.</p>'),card('What is an idiom?','<p>An expression whose meaning is different from the literal meaning of its words.</p><p><b>Break the ice</b> means make a first meeting feel more comfortable. There is no real ice.</p>'),cols=2)+
'<p>The Spanish meanings below are approximate equivalents for these situations, not word-for-word translations.</p>'+
grid(*(card(say(term),'<p class="u5-expression-type">'+expression_info[term]['kind']+'</p><p>'+meaning+'</p><p class="u5-expression-spanish"><b>Approximate meaning in Spanish</b><br><span lang="es">'+expression_info[term]['spanish']+'</span></p>'+model(example)+'<p class="u5-use-note">'+usage+'</p>') for term,meaning,example,usage in expressions),cols=4)+
note('Use the complete expression','The small words matter: open up to someone, stand up for someone and look up to someone. Listen to the whole phrase as one group.'),'phrasal verbs idioms cheer up calm down fit in open up stand up for reach out heart gold ice cloud weather')
topic('community-media','Use the grammar: people, community and media','Read complete models that separate facts, impressions and interpretations.',
'<h3>Making a good impression</h3>'+grid(
card('Describe a helpful action','<p>Listen without interrupting. Ask a friendly question. Offer help rather than assuming someone needs it.</p>'+model('She seems considerate because she listens carefully.')),
card('Describe a contribution','<p>Use a concrete action to explain a positive opinion.</p>'+model('He organizes free classes, so I think he makes a difference.')),
card('Keep the opinion fair','<p>Someone can be quiet and friendly at the same time.</p>'+model('Although he is quiet, he makes new students feel welcome.')))+
'<h3>Community model · a fictional example</h3>'+
model('Maya organizes a free reading group in her neighborhood. She welcomes new members and listens to their ideas. I think she is considerate because she makes time for everyone. At first, some people seem nervous, but a friendly question helps break the ice. Although Maya must be busy, she always prepares carefully. The members look interested, and several have said that they feel more confident. Her work seems simple, but it makes a difference.')+
'<p><b>Facts in the story:</b> she organizes a group and welcomes members. <b>Opinions:</b> I think she is considerate; her work makes a difference. <b>Deduction:</b> she must be busy.</p>'+
'<h3>News and satire: check the source before you conclude</h3>'+
table(['Type','What it does','What to look for'],[
['Fact-based report','Reports information supported by a source.','Who said it? When? What evidence is available?'],
['Opinion','Gives a person’s judgement.','Reasons, values and language such as I think.'],
['Satire','Uses humor, exaggeration or irony to comment on something.','A satirical context, an impossible exaggeration or a clear humorous target.'],
['False claim','Presents inaccurate information as true.','Check evidence. False information is not automatically satire.']])+
grid(card('Fictional teaching example · plain report','<p>The community library has extended its evening opening hours.</p>'),card('Fictional teaching example · SATIRE','<p>Library books demand overtime pay after the building stays open late.</p>'),cols=2)+model('This must be satire because books cannot demand pay.')+
'<p>The second example gives books a human action to create humor. It comments on the longer hours. In real news, check the source and context too: an unusual headline alone is not proof of satire.</p>','community impression polite considerate news satire fact opinion source evidence')
topic('sound-models','Hear the contrast and bring it together','Listen slowly first, then hear the same language at natural speed.',
grid(card('Make the key word clear',model('She must be tired. She might be tired. She can’t be tired.')+'<p>The modal changes the meaning. These are sound contrasts; choose one only when the situation supports it.</p>'),
card('Keep the final consonant',model('She looks worried. She seems relieved.')+'<p>Hear the /s/ in looks, /z/ in seems, and the final /d/ in worried and relieved.</p>'),
card('Pause between meaningful groups',model('Although she looks nervous, she might simply be concentrating.')+'<p>A short pause after nervous helps the listener follow the contrast.</p>'))+
'<h3>Complete model · an impression can change</h3>'+
model('I think the new student looks nervous because she is holding her notes. She might be worried about the presentation. Although she seems quiet, she could be very friendly. The other students look interested, so the topic must be engaging. After the talk, she seems relieved. My first impression was only a guess. Now I can ask her how she feels.')+
'<div class="intermediate2-actions"><a class="intermediate2-button primary" href="./course-overview.html#unit-5">Back to Course Overview</a><a class="intermediate2-button" href="./practice-lab.html">Practice Lab</a></div>','pronunciation sound stress thought groups models')
base=(ROOT/'ingles/intermediate-2/unit-4-movies-music-and-reviews.html').read_text(encoding='utf-8')
head=base.split('<main>')[0].replace('Unit 4: Movies, Reviews, Music Videos and Trends','Unit 5: Impressions, Feelings and Satire').replace('ie2-unit4-theory-page','ie2-unit4-theory-page ie2-unit5-theory-page').replace('#unit4-content','#unit5-content').replace('#unit-4','#unit-5')
start=head.index('<meta name="description"');end=head.index('/>',start)+2
head=head[:start]+'<meta name="description" content="Understand must, might, can’t, looks, seems, -ed and -ing adjectives, opinions and connectors through visual comparisons and clickable pronunciation."/>'+head[end:]
head=head.replace('</head>','<link rel="stylesheet" href="../../assets/css/english-intermediate2-unit5-explanation.css?v=20260925-2"/></head>')
hero='''<main><section class="u4-hero" aria-labelledby="unit5-title"><img class="u4-hero-image" src="../../assets/img/english-intermediate-2/units/unit-5-impressions-satire-v1.webp" alt="Adult learners discussing community stories and evidence" width="1280" height="720" fetchpriority="high"/><div class="u4-hero-inner"><div class="ie2-unit4-hero-copy"><p class="intermediate2-kicker">Unit 5 · Sessions 11–14</p><h1 id="unit5-title">Impressions, Feelings<br>and Satirical News</h1><p>Read the clues. Explain your impression.<br>Leave room for another possibility.</p><div class="ie2-overview-chips"><span>Deductions</span><span>Feelings &amp; impressions</span><span>Reasons &amp; contrasts</span></div><div class="intermediate2-actions"><a class="intermediate2-button primary" href="#unit5-content">Explore the lesson</a><a class="intermediate2-button ghost" href="./course-overview.html#unit-5">Course map</a></div></div></div></section>
<div class="u4-shell"><section class="u4-opening"><div><p class="intermediate2-kicker">Meaning, form and sound</p><h2>One scene. More than one explanation.</h2><p>Compare what the words mean before you choose them. Tap a sentence or a word with the small speaker mark to hear it. Enlarge a photo to read its card with the class.</p></div><ol class="u4-route"><li><b>01 · Notice</b>Separate a clue from an interpretation.</li><li><b>02 · Compare</b>See how a word changes the message.</li><li><b>03 · Understand</b>Build the sentence and explain why.</li><li><b>04 · Listen</b>Hear the exact model at your pace.</li></ol></section>
<div class="u5-audio-settings" role="group" aria-label="Pronunciation speed"><span>Pronunciation speed</span><button type="button" data-u5-speed="0.75" aria-pressed="true">0.75×</button><button type="button" data-u5-speed="1" aria-pressed="false">1×</button><button type="button" data-u5-stop>Stop audio</button><span id="u5-audio-status" role="status" aria-live="polite"></span></div>'''
nav='<nav class="u4-topic-nav" aria-label="Lesson topics">'+''.join(f'<a href="#{id}">{name}</a>' for id,name in [('evidence','Evidence'),('modals','Must / might / can’t'),('looks-seems','Looks / seems'),('ed-ing','-ed / -ing'),('opinions','Opinions'),('connections','Because / although'),('feelings','Feelings'),('expressions','Expressions'),('community-media','Community & media'),('sound-models','Sound')])+'</nav>'
search='''<section class="intermediate2-search course-search-panel" data-course-search-panel data-search-target="#unit5-content" data-search-items=".ie2-search-item" aria-label="Search Unit 5"><label class="course-search-label" for="u5-search">Find a topic or expression</label><div class="course-search-row"><input id="u5-search" type="search" data-course-search-input placeholder="Try: might, looks like, bored, although…" autocomplete="off"/><button type="button" class="course-search-clear" data-course-search-clear hidden>Clear</button></div><p class="course-search-meta"><span data-course-search-count></span><span>Open a section to see its explanation.</span></p></section><p class="course-search-empty" data-course-search-empty hidden>No matching topic. Try another word.</p></div>'''
foot='''</section></main><footer class="site-footer"><p>&copy; 2026 JaraLingua. English and French for step-by-step learning.</p></footer>
<script src="../../assets/js/google-auth-config.js"></script><script src="https://accounts.google.com/gsi/client" async defer></script><script src="../../assets/js/google-auth.js?v=20260919-local-login"></script><script src="../../assets/js/course-search.js?v=20260918-unit4-projector"></script><script src="../../assets/js/english-intermediate2-unit5-explanation.js?v=20260925-2"></script><script src="/assets/js/course-switcher.js"></script><script src="/assets/js/page-qr-access.js"></script></body></html>'''
(ROOT/'ingles/intermediate-2'/PAGE).write_text(head+hero+nav+search+'<section class="ie2-unit-theory-shell" id="unit5-content" aria-label="Unit 5 explanation">'+''.join(topics)+foot,encoding='utf-8')
manifest={'voiceId':'EXAVITQu4vr4xnSDxMaL','modelId':'eleven_multilingual_v2','accent':'General American','provider':'ElevenLabs','items':list(audio.values())}
# Retain verified audio provenance when rebuilding unchanged teaching text.
if (DEST/'models.json').exists():
 previous={i['id']:i for i in json.loads((DEST/'models.json').read_text(encoding='utf-8'))['items']}
 for item in manifest['items']:
  old=previous.get(item['id'],{})
  if old.get('text')==item['text']:
   for field in ('bytes','sha256'):
    if field in old:item[field]=old[field]
(DEST/'models.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
(DEST/'scripts.md').write_text('# Unit 5 explanation audio scripts\n\nAll models are original teaching text. Default playback 0.75x; natural model 1x.\n\n'+'\n\n'.join('## '+a['id']+'\n\n'+a['text'] for a in audio.values())+'\n',encoding='utf-8')
(ROOT/'tmp/unit5-explanation/expressions.json').write_text(json.dumps(expressions,ensure_ascii=False,indent=2),encoding='utf-8')
print('Built',len(topics),'teaching sections and',len(audio),'unique audio models;',sum(len(i['text']) for i in audio.values()),'characters.')

