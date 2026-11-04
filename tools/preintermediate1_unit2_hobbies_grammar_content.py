"""ESL Pals Hobbies: Can / Can't, page 2 and Task 3 at the top of page 3."""
THEORY_INSTRUCTION = 'Read the theory about the grammar point and then complete the exercises.'
THEORY = [
    dict(title='Can', definition='Used to express something we know how to do.', models=[('can-cook','I can cook.'),('can-sing','I can sing.')]),
    dict(title='Can’t', definition='Used to express something we DON’T know how to do.', models=[('cant-cook','I can’t cook.'),('cant-sing','I can’t sing.')]),
]
INSTRUCTIONS = {
    '1':'Task 1: Complete the sentences for you.',
    '2':'Task 2: Correct the mistakes in the sentences.',
    '3':'Task 3: Make sentences for yourself.',
}
GAPS = [('My mom','cook.'),('I','drive.'),('My partner','dance.'),('My grandmother','sew.'),('I','run a race.'),('I','sail a boat.'),('My partner','fish.')]
FIXES = [
    dict(original='I can’t swimming.', model='I can’t swim.', accepted=['I can’t swim.','I cannot swim.','I can not swim.'], explanation='After can’t, use the base verb swim, without -ing.'),
    dict(original='They not can speak Spanish.', model='They can’t speak Spanish.', accepted=['They can’t speak Spanish.','They cannot speak Spanish.','They can not speak Spanish.'], explanation='Put the negative after can: can’t or cannot. Keep speak in its base form.'),
    dict(original='Can you to drive?', model='Can you drive?', accepted=['Can you drive?'], explanation='A question uses Can + subject + base verb. Do not add to before drive.'),
    dict(original='I can’t drinks wine.', model='I can’t drink wine.', accepted=['I can’t drink wine.','I cannot drink wine.','I can not drink wine.'], explanation='After can’t, use drink, without -s. Keep the negative meaning.'),
    dict(original='He cans cook.', model='He can cook.', accepted=['He can cook.'], explanation='Can stays the same with he: do not add -s. Cook is the base verb.'),
    dict(original='She can to run fast.', model='She can run fast.', accepted=['She can run fast.'], explanation='Use the base verb run after can, without to.'),
    dict(original='We not can dance.', model='We can’t dance.', accepted=['We can’t dance.','We cannot dance.','We can not dance.'], explanation='Use can’t or cannot after we. Do not put not before can.'),
]
PROMPTS = ['Bake a cake:', 'Ride a bike:', 'Swim:', 'Sew clothing:', 'Play chess:', 'Play football:']
VOCABULARY = [dict(term=t,spanish=s,audio='/ingles/preintermedio-1/audio/unit2/hobbies-grammar/'+t.replace(' ','-')+'.mp3') for t,s in [
    ('know how to','saber cómo hacer algo; tener la habilidad de hacerlo'),
    ('partner','pareja o compañero, según el contexto'),
    ('grandmother','abuela'),
    ('sew','coser; unir tela con aguja e hilo'),
    ('run a race','correr una carrera'),
    ('sail a boat','navegar en un barco de vela'),
    ('bake a cake','hornear un pastel o una torta'),
    ('ride a bike','montar en bicicleta'),
    ('swim','nadar'),
    ('sew clothing','coser ropa'),
    ('play chess','jugar al ajedrez'),
    ('play football','jugar al fútbol'),
    ('wine','vino'),
]]
AUDIO = {v['term'].replace(' ','-'):dict(text=v['term'],path=v['audio'],kind='vocabulary') for v in VOCABULARY}
ROOT_AUDIO='/ingles/preintermedio-1/audio/unit2/hobbies-grammar/'
AUDIO['theory-instruction']=dict(text=THEORY_INSTRUCTION,path=ROOT_AUDIO+'theory-instruction.mp3',kind='instruction')
for i,txt in INSTRUCTIONS.items():AUDIO['task-'+i+'-instruction']=dict(text=txt,path=ROOT_AUDIO+'task-'+i+'-instruction.mp3',kind='instruction')
for column in THEORY:
    for slug,txt in column['models']:AUDIO[slug]=dict(text=txt,path=ROOT_AUDIO+slug+'.mp3',kind='model')
for i,item in enumerate(FIXES,1):AUDIO['correction-'+str(i)]=dict(text=item['model'],path=ROOT_AUDIO+'correction-'+str(i)+'.mp3',kind='gated-model')
