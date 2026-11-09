"""Healthy Lifestyle p.5 Tasks 1-2, original wording; discussion remains Speaking."""
WORDS=['give up','cut down on','stick to','work out']
AUDIO_ROOT='/ingles/preintermedio-1/audio/unit3/healthy-phrasals/'
INSTRUCTIONS={'definitions':'Match the phrasal verbs from the box to their definitions.','sentences':'Complete the sentences using the words, you may need to change the tense.'}
DEFINITIONS=[
 dict(number='1',text='to consume less of something, like unhealthy foods, for a healthier lifestyle.',answer='cut down on',explanation='Cut down on means reduce the amount or frequency of something.'),
 dict(number='2',text='to exercise for better health.',answer='work out',explanation='Work out means exercise in this context.'),
 dict(number='3',text='to consistently follow a plan, like a diet or exercise routine, for a healthier lifestyle.',answer='stick to',explanation='Stick to means continue following a plan or routine.'),
 dict(number='4',text='to quit a harmful habit, like smoking, to live healthier.',answer='give up',explanation='Give up means stop doing something, such as a habit.'),
]
SENTENCES=[
 dict(number='a',before='We should ',after=' every day to improve our fitness.',answer='work out',accepted=['work out'],explanation='Use work out after should to mean exercise.'),
 dict(number='b',before="I'm trying to lose weight, so I need to ",after=' eating sweets..',answer='cut down on',accepted=['cut down on','give up'],explanation='Cut down on means reduce; give up means stop completely. Both fit this sentence.'),
 dict(number='c',before='He decided to ',after=" drinking soda because it's not good for his teeth.",answer='give up',accepted=['give up','cut down on'],explanation='Give up means stop completely; cut down on means reduce. Both fit this sentence.'),
 dict(number='d',before="It's important to ",after=" a regular sleep schedule for a good night's rest.",answer='stick to',accepted=['stick to'],explanation='Use stick to for continuing to follow the sleep schedule.'),
]
for s in SENTENCES:
 s['models']={phrase:dict(text=s['before']+phrase+s['after'],audio='model-'+s['number']+('-alternative' if phrase!=s['answer'] else '')) for phrase in s['accepted']}
 s['model']=s['models'][s['answer']]['text']
REUSED={'soda':'/ingles/preintermedio-1/audio/unit3/food-fitness/soda.mp3','smoking':'/ingles/preintermedio-1/audio/unit3/healthy-video/smoking.mp3'}
VOCABULARY=[dict(term=t,spanish=meaning,audio=REUSED.get(t,AUDIO_ROOT+t.replace(' ','-')+'.mp3')) for t,meaning in [
 ('give up','dejar un hábito; abandonar una actividad'),('cut down on','reducir el consumo o la frecuencia de algo'),('stick to','seguir o mantener un plan o una rutina'),('work out','hacer ejercicio'),
 ('consume','consumir'),('consistently','de manera constante; con regularidad'),('quit','dejar; abandonar'),('harmful habit','hábito perjudicial'),('fitness','condición física'),('lose weight','bajar de peso'),('sweets','dulces'),('soda','gaseosa; refresco'),('teeth','dientes'),('sleep schedule','horario de sueño'),('rest','descanso'),('smoking','fumar; consumo de tabaco'),
]]
AUDIO_ITEMS=[dict(name=v['term'].replace(' ','-'),text=v['term']) for v in VOCABULARY if v['term'] not in REUSED]
AUDIO_ITEMS += [dict(name='instruction-'+k,text=v) for k,v in INSTRUCTIONS.items()]
AUDIO_ITEMS += [dict(name='definition-'+d['number'],text=d['text']) for d in DEFINITIONS]
AUDIO_ITEMS += [dict(name=m['audio'],text=m['text']) for s in SENTENCES for m in s['models'].values()]
