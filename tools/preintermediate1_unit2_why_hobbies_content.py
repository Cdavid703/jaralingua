"""Original ESL Pals Hobbies: Can / Can't, pages 4–5; profiles transcribed from the source artwork."""
READING_INSTRUCTION='Read about the people and their hobbies and then complete the exercises.'
TABLE_INSTRUCTION='Task 1: Complete the table with the correct name.'
CONTINUATION='Now, use the same text as a guide to complete task 2 and task 3 below.'
TF_INSTRUCTION='Task 2: True or False.'
QUESTIONS_INSTRUCTION='Task 3: Answer the questions.'
PROFILES=[
 dict(id='olivia',name='Olivia',text='I love painting! It is creative and fun! I like painting flowers and trees. Painting is very relaxing. I paint every day!'),
 dict(id='benji',name='Benji',text='My hobby is playing tennis. It’s great! It is good exercise and I can be outdoors. I play tennis every week.'),
 dict(id='isabelle',name='Isabelle',text='I love running - it is my hobby! Running is challenging - but it is good exercise! I run three times a week.'),
 dict(id='liam',name='Liam',text='I love hiking because I can be outdoors. I love hiking in the forest and the mountains - it is beautiful. I hike every Sunday.'),
]
TABLE=[
 dict(number=1,source='X46.png',photo='tennis',width=509,height=340,alt='Original photo of tennis rackets and balls',when='Every week',answer='benji',profile='benji',explanation='Benji names tennis and says that he plays every week.',evidence='I play tennis every week.'),
 dict(number=2,source='X47.png',photo='painting',width=604,height=340,alt='Original photo of paints and paintbrushes',when='Every day',answer='olivia',profile='olivia',explanation='Olivia describes painting and says that she paints every day.',evidence='I paint every day!'),
 dict(number=3,source='X48.png',photo='hiking',width=453,height=340,alt='Original photo of a hiker standing on a rocky hill',when='Every Sunday',answer='liam',profile='liam',explanation='Liam describes hiking and says that he hikes every Sunday.',evidence='I hike every Sunday.'),
 dict(number=4,source='X49.png',photo='running',width=510,height=340,alt='Original photo of a runner on a park path',when='Three times a week',answer='isabelle',profile='isabelle',explanation='Isabelle describes running and gives a frequency of three times a week.',evidence='I run three times a week.'),
]
TF=[
 dict(statement='Olivia paints two times a week.',answer='False',profile='olivia',explanation='Olivia paints every day, rather than two times a week.',evidence='I paint every day!'),
 dict(statement='Olivia likes painting fruit.',answer='False',profile='olivia',explanation='Olivia names flowers and trees. Fruit is not mentioned in her profile.',evidence='I like painting flowers and trees.'),
 dict(statement='Benji’s hobby is playing football.',answer='False',profile='benji',explanation='Benji names tennis as his hobby.',evidence='My hobby is playing tennis.'),
 dict(statement='Tennis is good exercise.',answer='True',profile='benji',explanation='Benji describes tennis as good exercise.',evidence='It is good exercise and I can be outdoors.'),
 dict(statement='Running is challenging.',answer='True',profile='isabelle',explanation='Isabelle explicitly describes running as challenging.',evidence='Running is challenging - but it is good exercise!'),
 dict(statement='Hiking is great because it is outdoors.',answer='True',profile='liam',explanation='Liam gives being outdoors as a reason for enjoying hiking.',evidence='I love hiking because I can be outdoors.'),
]
QUESTIONS=[
 dict(text='Why does Olivia like painting?',kind='text',profile='olivia',model='She likes painting because it is creative, fun and very relaxing.',guidance='These are the reasons in Olivia’s profile. You can express the same ideas in your own words.',evidence='It is creative and fun! … Painting is very relaxing.'),
 dict(text='Why does Liam like hiking?',kind='text',profile='liam',model='He likes hiking because he can be outdoors and enjoy the beautiful forest and mountains.',guidance='Use Liam’s reasons from the reading. Your wording can be different.',evidence='I love hiking because I can be outdoors. I love hiking in the forest and the mountains - it is beautiful.'),
 dict(text='Which of these hobbies do you want to do? (Painting, running, tennis or hiking…)',kind='personal',guidance='Name a hobby you want to do. You can explain why you chose it. Your choice is personal.'),
 dict(text='Is it common to go hiking in your country?',kind='personal',guidance='Answer about your country or a place you know. You can give an example. The reading does not provide one answer for everyone.'),
 dict(text='Do you think that running is good exercise?',kind='personal',guidance='Give your opinion and a reason. Isabelle describes running as good exercise; you may refer to her profile.'),
 dict(text='Which of these hobbies is the most creative?',kind='personal',guidance='Name a hobby and explain your choice. Olivia describes painting as creative; another choice can be supported by your own reason.'),
]
REUSED={'creative':'/ingles/preintermedio-1/audio/unit1/lesson/creative.mp3','hobby':'/ingles/preintermedio-1/audio/unit2/hobby-vocabulary/hobby.mp3'}
VOCABULARY=[dict(term=t,spanish=s,audio=REUSED.get(t,'/ingles/preintermedio-1/audio/unit2/why-hobbies/'+t.replace(' ','-')+'.mp3')) for t,s in [
 ('creative','creativo; que permite imaginar y crear cosas'),('relaxing','relajante; que ayuda a sentirse tranquilo'),('flowers','flores'),('trees','árboles'),('exercise','ejercicio; actividad física'),('outdoors','al aire libre; fuera de un edificio'),('challenging','que supone un reto o requiere esfuerzo'),('hiking','senderismo; caminar por rutas naturales'),('forest','bosque'),('mountains','montañas'),('three times a week','tres veces por semana'),('fruit','fruta'),('common','común o frecuente'),('country','país'),('hobby','pasatiempo; actividad que se realiza por gusto'),('painting','pintar; la actividad artística de crear imágenes con pintura'),('running','correr; practicar carrera a pie'),('tennis','tenis'),
]]
AUDIO={v['term'].replace(' ','-'):dict(text=v['term'],path=v['audio'],kind='vocabulary',reused=v['term'] in REUSED) for v in VOCABULARY}
AUDIO_ROOT='/ingles/preintermedio-1/audio/unit2/why-hobbies/'
for p in PROFILES:AUDIO[p['id']+'-profile']=dict(text=p['text'],path=AUDIO_ROOT+p['id']+'-profile.mp3',kind='profile')
for slug,text in [('reading-instruction',READING_INSTRUCTION),('table-instruction',TABLE_INSTRUCTION),('continuation-instruction',CONTINUATION),('tf-instruction',TF_INSTRUCTION),('questions-instruction',QUESTIONS_INSTRUCTION)]:AUDIO[slug]=dict(text=text,path=AUDIO_ROOT+slug+'.mp3',kind='instruction')
for i,q in enumerate(QUESTIONS,1):AUDIO['question-'+str(i)]=dict(text=q['text'],path=AUDIO_ROOT+'question-'+str(i)+'.mp3',kind='question')
