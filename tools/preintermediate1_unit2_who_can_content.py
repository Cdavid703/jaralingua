"""ESL Pals original page 7: Who Can Do It? Case Study."""
INSTRUCTION='Look at the table below and then answer the questions.'
COLUMNS=[
 dict(id='chess',label='Play chess',source='X20.png',photo='/assets/img/english-preintermediate-1/unit-2/practice/hobby-vocabulary/picture-03.webp',width=510,height=340,alt='Original worksheet photo of chess pieces'),
 dict(id='bake',label='Bake',source='X21.png',photo='/assets/img/english-preintermediate-1/unit-2/practice/hobby-vocabulary/picture-07.webp',width=520,height=340,alt='Original worksheet photo of dough and a rolling pin'),
 dict(id='run',label='Run',source='X49.png',photo='/assets/img/english-preintermediate-1/unit-2/practice/why-hobbies/running.webp',width=510,height=340,alt='Original worksheet photo of a runner on a path'),
 dict(id='sail',label='Sail',source='X19.png',photo='/assets/img/english-preintermediate-1/unit-2/practice/hobby-vocabulary/picture-02.webp',width=502,height=340,alt='Original worksheet photo of a sailing boat'),
 dict(id='dance',label='Dance',source='X24.png',photo='/assets/img/english-preintermediate-1/unit-2/practice/hobby-vocabulary/picture-08.webp',width=509,height=340,alt='Original worksheet photo of a dancer at the beach'),
]
PEOPLE=[dict(id=id,name=name,skills=dict(zip([c['id'] for c in COLUMNS],values))) for id,name,values in [
 ('amber','Amber',[False,True,True,False,True]),
 ('sam','Sam',[True,False,True,False,False]),
 ('nina','Nina',[False,True,False,True,True]),
 ('josh','Josh',[True,False,True,False,True]),
]]
QUESTIONS=[
 dict(text='Who can bake, but can’t sail?',criteria=[('bake',True),('sail',False)],explanation='Find someone who can bake and cannot sail. Both conditions must match.'),
 dict(text='Who can play chess, but can’t dance?',criteria=[('chess',True),('dance',False)],explanation='Find someone who can play chess and cannot dance. Both conditions must match.'),
 dict(text='Who can sail and bake?',criteria=[('sail',True),('bake',True)],explanation='Both sailing and baking must be marked Can.'),
 dict(text='Who can bake, run and dance?',criteria=[('bake',True),('run',True),('dance',True)],explanation='All three abilities must be marked Can: baking, running and dancing.'),
 dict(text='Who can’t sail or dance?',criteria=[('sail',False),('dance',False)],explanation='Here, can’t sail or dance means the person cannot do either activity. Both must be marked Can’t.'),
 dict(text='Who can play chess and run?',criteria=[('chess',True),('run',True)],explanation='Both chess and running must be marked Can. Include every matching person.'),
 dict(text='Who can’t play chess or run?',criteria=[('chess',False),('run',False)],explanation='The person cannot do either activity: chess and running must both be marked Can’t.'),
 dict(text='Who can’t bake or sail?',criteria=[('bake',False),('sail',False)],explanation='The people cannot do either activity: baking and sailing must both be marked Can’t. Include every matching person.'),
]
for q in QUESTIONS:
 q['answers']=[p['id'] for p in PEOPLE if all(p['skills'][skill]==can for skill,can in q['criteria'])]
 q['evidence']=[dict(person=p['id'],name=p['name'],facts=[dict(skill=next(c['label'] for c in COLUMNS if c['id']==skill),can=can) for skill,can in q['criteria']]) for p in PEOPLE if p['id'] in q['answers']]
ROOT='/ingles/preintermedio-1/audio/unit2/who-can/'
REUSED={'play chess':'/ingles/preintermedio-1/audio/unit2/hobbies-grammar/play-chess.mp3','both':'/ingles/preintermedio-1/audio/unit1/lesson/both.mp3'}
VOCABULARY=[dict(term=t,spanish=s,audio=REUSED.get(t,ROOT+t.replace(' ','-')+'.mp3')) for t,s in [
 ('play chess','jugar al ajedrez'),('bake','hornear; preparar pan, pasteles u otros alimentos en el horno'),('run','correr'),('sail','navegar a vela'),('dance','bailar'),('table','tabla; información organizada en filas y columnas'),('both','ambos; las dos cosas o partes mencionadas'),('either','cualquiera de las dos; con una negación, ninguna de las dos'),
]]
AUDIO={v['term'].replace(' ','-'):dict(text=v['term'],path=v['audio'],kind='vocabulary',reused=v['term'] in REUSED) for v in VOCABULARY}
AUDIO['instruction']=dict(text=INSTRUCTION,path=ROOT+'instruction.mp3',kind='instruction')
for i,q in enumerate(QUESTIONS,1):AUDIO['question-'+str(i)]=dict(text=q['text'],path=ROOT+'question-'+str(i)+'.mp3',kind='question')
