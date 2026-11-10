"""ESL Pals Healthy Lifestyle p.7 Tasks 1-2, original photos and questions."""
INSTRUCTIONS={'pictures':'Study the pictures below. What can you see?','questions':'Discuss the pictures using the questions below:'}
MEDIA='/assets/img/english-preintermediate-1/unit-3/practice/picture-round/'
PICTURES=[
 dict(id='picture-1',label='picture 1',number='1',group='pictures',source='X70.png',image='picture-1.webp',width=626,height=418,alt='People talking with drinks in an indoor social setting',guidance='Describe the people, place and visible actions in picture 1.'),
 dict(id='picture-2',label='picture 2',number='2',group='pictures',source='X72.png',image='picture-2.webp',width=626,height=417,alt='Four people walking outdoors with a dog',guidance='Describe the people, place and visible actions in picture 2.'),
 dict(id='picture-3',label='picture 3',number='3',group='pictures',source='X73.png',image='picture-3.webp',width=626,height=417,alt='Two people eating burgers with fries and drinks at a table',guidance='Describe the people, place and visible actions in picture 3.'),
 dict(id='picture-4',label='picture 4',number='4',group='pictures',source='X74.png',image='picture-4.webp',width=626,height=418,alt='Three people jogging outdoors with towels and water',guidance='Describe the people, place and visible actions in picture 4.'),
]
QUESTIONS=[dict(id='question-'+letter,label='question '+letter,number=letter,group='questions',text=text,guidance=guidance) for letter,text,guidance in [
 ('a','Give each picture a title based on what is happening.','Give a title for each of the four pictures. Choose your own words.'),
 ('b','Do you think the pictures show healthy or unhealthy lifestyles?','Explain your own view of the pictures and give a reason.'),
 ('c','Do you think it is healthy to eat junk food once in a while?','State your own opinion and explain your reason.'),
 ('d','Do you think it is healthy to drink alcohol occasionally?','State your own opinion and explain your reason.'),
 ('e','In your opinion, which picture looks the most fun?','Choose a picture and explain your preference.'),
 ('f','Which of the activities pictured do you do most in your free time?','Talk about your own free-time activities.'),
 ('g','Which of the activities do you want to do more of?','Say which activities you would like to do more often.'),
 ('h','Give a summary of the key things you have learned in today’s class.','Summarise the main things you learned in this class, using your own words.'),
]]
SELF_CHECK={'pictures':['I described what I can see aloud.','I mentioned an action or a detail.'],'questions':['I answered the question aloud.','I added a reason, detail or example.']}
REUSED={'alcohol':'/ingles/preintermedio-1/audio/unit3/healthy-vocabulary/alcohol.mp3','junk food':'/ingles/preintermedio-1/audio/unit3/healthy-vocabulary/junk-food.mp3'}
AUDIO_ROOT='/ingles/preintermedio-1/audio/unit3/picture-round/'
VOCABULARY=[dict(term=t,spanish=s,audio=REUSED.get(t,AUDIO_ROOT+t.replace(' ','-')+'.mp3')) for t,s in [
 ('title','título'),('based on','basado en'),('happening','ocurriendo; sucediendo'),('healthy','saludable'),('unhealthy','poco saludable'),('lifestyles','estilos de vida'),('junk food','comida chatarra'),('once in a while','de vez en cuando'),('alcohol','alcohol'),('occasionally','ocasionalmente; de vez en cuando'),('in your opinion','en tu opinión'),('pictured','que aparece en las imágenes'),('free time','tiempo libre'),('summary','resumen'),('key things','aspectos principales; cosas más importantes'),('learned','aprendido'),
]]
AUDIO_ITEMS=[dict(name=v['term'].replace(' ','-'),text=v['term'],kind='vocabulary') for v in VOCABULARY if v['term'] not in REUSED]
AUDIO_ITEMS += [dict(name='instruction-'+k,text=v,kind='instruction') for k,v in INSTRUCTIONS.items()]
AUDIO_ITEMS += [dict(name=q['id'],text=q['text'],kind='discussion question') for q in QUESTIONS]
ITEMS=PICTURES+QUESTIONS
