"""Authored complementary grammar for pacing guide Unit 3, session 6; not an ESL Pals exercise."""
TITLE='Healthy Routines'
AUDIO_ROOT='/ingles/preintermedio-1/audio/unit3/healthy-routines/'
INSTRUCTIONS={
 'tenses':'Complete each gap with the verb form only. Use the present simple for a repeated routine, or the present continuous for an action happening now or a temporary change. Use the words in brackets.',
 'frequency':'Rewrite each sentence with the expression in brackets. Keep all the original words. Put a frequency adverb in its usual middle position: before the main verb, or after am, is or are. Put twice a week at the end.'}
TENSES=[]
rows=[
 ('Every weekday, Lara ___ to work. (walk)','walks','Every weekday, Lara walks to work.','Every weekday describes a repeated routine. With Lara, use the third-person form walks.'),
 ('Look at Lara now: she ___ a fruit salad. (prepare)','is preparing','Look at Lara now: she is preparing a fruit salad.','Look and now establish an action in progress. Use is + preparing with she.'),
 ('As a regular habit, we ___ breakfast. (not / skip)','do not skip','As a regular habit, we do not skip breakfast.','A regular habit uses the present simple. With we, use do not + the base verb skip.'),
 ('At this moment, Ben ___; he is taking a break. (not / work)','is not working','At this moment, Ben is not working; he is taking a break.','At this moment describes now. Use is not + working with Ben.'),
 ('How often ___? (he / exercise)','does he exercise','How often does he exercise?','This asks about a routine. Use does + he + the base verb exercise.'),
 ('What ___ right now? (you / cook)','are you cooking','What are you cooking right now?','This question asks about an action now. Use are + you + cooking.'),
 ('Mia is making a temporary change this month: she ___ swimming lessons. (take)','is taking','Mia is making a temporary change this month: she is taking swimming lessons.','The speaker explicitly describes a temporary change around now. Use is + taking.'),
 ('Every evening, my friends ___ water with dinner. (drink)','drink','Every evening, my friends drink water with dinner.','Every evening describes a repeated routine. The plural subject my friends uses drink.'),
 ('Watch us now: we ___ before our walk. (stretch)','are stretching','Watch us now: we are stretching before our walk.','Watch us now describes an action in progress. Use are + stretching with we.'),
 ('As a usual routine, Alex ___ snacks at work. (not / buy)','does not buy','As a usual routine, Alex does not buy snacks at work.','A usual routine uses the present simple. With Alex, use does not + the base verb buy.')]
for n,(prompt,answer,model,explanation) in enumerate(rows,1):
 TENSES.append(dict(id=f'tenses-{n}',number=n,prompt=prompt,accepted=[answer],answer=answer,model=model,explanation=explanation))
FREQUENCY=[]
rows=[
 ('I drink water with lunch. (always)','I always drink water with lunch.','Put always before the main verb drink.'),
 ('She is tired after work. (often)','She is often tired after work.','Put often after is. Other positions are possible in English; this task practises the usual middle position.'),
 ('We cook at home. (usually)','We usually cook at home.','Put usually before the main verb cook.'),
 ('He skips breakfast. (never)','He never skips breakfast.','Put never before skips. Never already expresses a negative meaning, so do not add does not.'),
 ('They are busy in the morning. (sometimes)','They are sometimes busy in the morning.','Put sometimes after are for this task. Sometimes can also go at the start or end in other contexts.'),
 ('I eat snacks late at night. (hardly ever)','I hardly ever eat snacks late at night.','Keep hardly ever together before the main verb eat. It means almost never.'),
 ('We go for a walk. (twice a week)','We go for a walk twice a week.','Twice a week is a frequency phrase. Put it at the end, as requested.'),
 ('I am calm after a walk. (usually)','I am usually calm after a walk.','Put usually after am. I’m usually calm after a walk is also accepted.')]
for n,(prompt,answer,explanation) in enumerate(rows,1):FREQUENCY.append(dict(id=f'frequency-{n}',number=n,prompt=prompt,accepted=[answer],answer=answer,model=answer,explanation=explanation))
EXAMPLES=[dict(id='example-tenses',text='Every morning, I walk to work. Today, I am taking the bus.'),dict(id='example-frequency',text='I usually cook at home. I am often hungry after work.')]
VOCABULARY=[dict(term=t,spanish=s,audio=AUDIO_ROOT+'word-'+slug+'.mp3') for t,s,slug in [
 ('routine','rutina; una acción o patrón habitual','routine'),('temporary change','cambio temporal; una situación que dura un periodo limitado','temporary-change'),('repeated','repetido; que ocurre varias veces','repeated'),('skip breakfast','saltarse el desayuno; no desayunar','skip-breakfast'),('taking a break','tomando un descanso','taking-a-break'),('stretch','estirar el cuerpo o los músculos','stretch'),('snacks','refrigerios; alimentos pequeños entre comidas','snacks'),('hardly ever','casi nunca','hardly-ever'),('twice a week','dos veces por semana','twice-a-week'),('hungry','con hambre','hungry'),('calm','tranquilo o tranquila','calm'),('weekday','día entre semana, de lunes a viernes','weekday')]]
AUDIO={}
for k,text in INSTRUCTIONS.items():AUDIO['instruction-'+k]=dict(text=text,path=AUDIO_ROOT+'instruction-'+k+'.mp3',kind='instruction')
for e in EXAMPLES:AUDIO[e['id']]=dict(text=e['text'],path=AUDIO_ROOT+e['id']+'.mp3',kind='worked-example')
for i in TENSES+FREQUENCY:AUDIO[i['id']]=dict(text=i['model'],path=AUDIO_ROOT+i['id']+'.mp3',kind='gated-model')
for v in VOCABULARY:AUDIO['word-'+v['audio'].rsplit('word-',1)[1].removesuffix('.mp3')]=dict(text=v['term'],path=v['audio'],kind='vocabulary')
