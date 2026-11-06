"""Approved Unit 2 Activity 5: original ESL Pals page 6, Speaking Exercise."""
DISCUSSION_INSTRUCTION='Task 1: Discuss the questions as a class.'
QUESTIONS=[
 ('Do you think everyone should have a hobby?', 'I think everyone should / does not need to have a hobby because …'),
 ('Do you think that some hobbies are too expensive?', 'I think … can be expensive because …'),
 ('What hobby would you never like to do?', 'I would never like to … because …'),
 ('What hobbies do your family do?', 'People in my family enjoy …'),
 ('What hobbies do your friends do?', 'My friends enjoy …'),
]
TALK_INSTRUCTION='Task 2: Use the words in the box to talk about your hobby. In your answer:'
POINTS=['Describe your hobby.','State when you started your hobby.','Describe why you do it.']
STARTERS=['My hobby is … I usually …','I started this hobby …','I do it because …']
BANK=['relaxing','fun','creative','good exercise','outdoors','challenging']
LIST_INSTRUCTION='Task 3: Make a list of the hobbies you want to try in the future.'
SELF_CHECK=['I described my hobby.','I said when I started it.','I explained why I do it.']
ROOT='/ingles/preintermedio-1/audio/unit2/talk-hobbies/'
REUSED={
 'relaxing':'/ingles/preintermedio-1/audio/unit2/why-hobbies/relaxing.mp3',
 'creative':'/ingles/preintermedio-1/audio/unit1/lesson/creative.mp3',
 'outdoors':'/ingles/preintermedio-1/audio/unit2/why-hobbies/outdoors.mp3',
 'challenging':'/ingles/preintermedio-1/audio/unit2/why-hobbies/challenging.mp3',
}
VOCABULARY=[dict(term=t,spanish=s,audio=REUSED.get(t,ROOT+t.replace(' ','-')+'.mp3')) for t,s in [
 ('relaxing','relajante; que ayuda a sentirse tranquilo'),('fun','divertido; agradable de hacer'),('creative','creativo; que permite imaginar y crear cosas'),('good exercise','buen ejercicio; actividad física beneficiosa'),('outdoors','al aire libre; fuera de un edificio'),('challenging','que supone un reto o requiere esfuerzo'),('everyone','todos; cada persona'),('should','debería; se usa para expresar una recomendación u opinión'),('expensive','caro; que cuesta mucho dinero'),('hobbies','pasatiempos; actividades que se realizan por gusto'),('started','comenzó o empezaste; pasado de start, según el sujeto'),('state','indicar o decir claramente, en esta consigna'),('try','probar; hacer algo para conocer la experiencia'),('future','futuro; tiempo que está por venir'),
]]
AUDIO={v['term'].replace(' ','-'):dict(text=v['term'],path=v['audio'],kind='vocabulary',reused=v['term'] in REUSED) for v in VOCABULARY}
for i,(q,_) in enumerate(QUESTIONS,1):AUDIO['question-'+str(i)]=dict(text=q,path=ROOT+'question-'+str(i)+'.mp3',kind='question')
for slug,text in [('discussion-instruction',DISCUSSION_INSTRUCTION),('talk-instruction',TALK_INSTRUCTION+' '+' '.join(POINTS)),('list-instruction',LIST_INSTRUCTION)]:AUDIO[slug]=dict(text=text,path=ROOT+slug+'.mp3',kind='instruction')
