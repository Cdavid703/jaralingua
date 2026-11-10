"""Healthy Lifestyle p.6: four attributed opinions and the original phrase table."""
INSTRUCTION='Study the statements, then decide if you agree or disagree with them. Use the language in the table at the bottom of the page to help structure your answer.'
PEOPLE=[
 dict(number=1,name='John',text='Plant-based diets are the only truly ethical and healthy way to eat, and all other diets harm the environment and animals.',image='john.webp',width=64,height=85,source='X58.png'),
 dict(number=2,name='Oli',text='Parents should stop their children from eating any sugary or processed foods to protect their long-term health.',image='oli.webp',width=64,height=88,source='X60.png'),
 dict(number=3,name='Beth',text="If the government really cared about people's health, they would ban cigarettes and alcohol completely.",image='beth.webp',width=64,height=88,source='X62.png'),
 dict(number=4,name='Amy',text='Aerobic exercise is a waste of time. I think that people should only focus on strength training.',image='amy.webp',width=64,height=86,source='X64.png'),
]
GROUPS=[
 dict(id='opinion',heading='Express an opinion',phrases=[('It seems to me that…','It seems to me that.'),('I feel that…','I feel that.'),('I’m absolutely convinced that…',"I'm absolutely convinced that."),('In my opinion,…','In my opinion.'),('I believe / suppose / feel (that)…','I believe or suppose or feel that.')]),
 dict(id='disagreement',heading='Express disagreement',phrases=[('I don’t agree with you about…',"I don't agree with you about."),('I can’t accept your view that…',"I can't accept your view that."),('I have a different opinion…','I have a different opinion.'),('I’m not sure if…',"I'm not sure if."),('I’m not convinced that…',"I'm not convinced that.")]),
 dict(id='pros-cons',heading='Express pro’s and con’s',phrases=[('There are two sides to this point...','There are two sides to this point.'),('On the one hand…,on the other hand…','On the one hand, on the other hand.'),('An argument for / against is…','An argument for or against is.'),('Some people think that…,others say that…','Some people think that, others say that.'),('The advantages / disadvantages are...','The advantages or disadvantages are.')]),
 dict(id='summary',heading='Summarise',phrases=[('So, in conclusion…','So, in conclusion.'),('To summarise..','To summarise.'),('Overall, it is clear that…','Overall, it is clear that.'),('As a result..','As a result.'),('The bottom line is...','The bottom line is.')]),
]
SELF_CHECK=['I can state my view clearly.','I can give a reason or an example.']
AUDIO_ROOT='/ingles/preintermedio-1/audio/unit3/healthy-opinions/'
REUSED={'plant-based':'/ingles/preintermedio-1/audio/unit3/food-fitness/plant-based.mp3','aerobic exercise':'/ingles/preintermedio-1/audio/unit3/food-fitness/aerobic-exercise.mp3'}
VOCABULARY=[dict(term=t,spanish=s,audio=REUSED.get(t,AUDIO_ROOT+t.replace(' ','-')+'.mp3')) for t,s in [
 ('plant-based','basado en alimentos de origen vegetal'),('ethical','ético; relacionado con lo que se considera correcto'),('harm','dañar; perjudicar'),('environment','medio ambiente'),('sugary','azucarado; con mucho azúcar'),('processed foods','alimentos procesados'),('protect','proteger'),('long-term health','salud a largo plazo'),('government','gobierno'),('ban','prohibir'),('aerobic exercise','ejercicio aeróbico'),('waste of time','pérdida de tiempo'),('focus on','centrarse en'),('strength training','entrenamiento de fuerza'),('absolutely convinced','totalmente convencido'),('view','opinión; punto de vista'),('advantages','ventajas'),('disadvantages','desventajas'),('summarise','resumir'),('overall','en general; considerando el conjunto'),
]]
AUDIO_ITEMS=[dict(name=v['term'].replace(' ','-'),text=v['term'],kind='vocabulary') for v in VOCABULARY if v['term'] not in REUSED]
AUDIO_ITEMS += [dict(name='instruction',text=INSTRUCTION,kind='instruction')]
AUDIO_ITEMS += [dict(name='statement-'+str(p['number']),text=p['text'],kind='attributed opinion') for p in PEOPLE]
for group in GROUPS:
 group['items']=[dict(text=printed,audio='phrase-'+group['id']+'-'+str(i),spoken=spoken) for i,(printed,spoken) in enumerate(group.pop('phrases'),1)]
 AUDIO_ITEMS += [dict(name=p['audio'],text=p['spoken'],kind='phrase bank') for p in group['items']]
