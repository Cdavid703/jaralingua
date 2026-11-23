"""Approved Unit 4 vocabulary: five meanings and five contextual expression gaps."""
TITLE = 'Celebration Expressions'
AUDIO_ROOT = '/ingles/preintermedio-1/audio/unit4/celebration-expressions/'
LESSON_ROOT = '/ingles/preintermedio-1/audio/unit4/lesson/'
WORDS = ['set up', 'put up', 'get together', 'in full swing', 'have a ball']
TYPES = {'set up':'Phrasal verb', 'put up':'Phrasal verb', 'get together':'Phrasal verb', 'in full swing':'Idiom', 'have a ball':'Idiom'}
INSTRUCTIONS = {
    'definitions': 'Match each meaning to one expression from the word bank. Use each expression once.',
    'sentences': 'Complete each gap with one expression from the word bank. Use each expression once and keep its form. The meaning clues in brackets help you choose. Write only the missing expression.',
}
TASKS = {'definitions': [], 'sentences': []}
DEFINITION_ROWS = [
    ('To enjoy yourself very much. This is an informal expression.', 'have a ball', 'Have a ball means enjoy yourself very much.', 'Have a ball is an informal idiom for having a very good time; it does not refer to a physical ball here.'),
    ('To arrange or prepare something so it is ready to use, such as equipment for an event.', 'set up', 'Set up means arrange or prepare something so it is ready to use.', 'Set up is a phrasal verb. Here it describes preparing equipment or furniture for use.'),
    ('Happening with a lot of activity, as when an event is already busy and lively.', 'in full swing', 'In full swing means happening with a lot of activity.', 'In full swing is an idiom for an event that is already very active. It often follows be.'),
    ('To place or hang something in position, such as decorations on a wall.', 'put up', 'Put up means place or hang something in position.', 'Put up is a phrasal verb. In this context, the object is something placed or hung in position.'),
    ('To meet and spend time with other people.', 'get together', 'Get together means meet and spend time with other people.', 'Get together is a phrasal verb for meeting socially; it does not mean preparing equipment.'),
]
SENTENCE_ROWS = [
    ('Before the celebration, we need to ___ the sound system. (prepare it so it is ready to use)', 'set up', 'Before the celebration, we need to set up the sound system.', 'Set up matches the clue about preparing the sound system for use.'),
    ('By eight, the celebration is ___: people are dancing and every stall is busy. (already very active)', 'in full swing', 'By eight, the celebration is in full swing: people are dancing and every stall is busy.', 'After is, in full swing describes the event as already busy and active.'),
    ('Our cousins live in different towns, but we ___ every December. (meet and spend time with each other)', 'get together', 'Our cousins live in different towns, but we get together every December.', 'Get together matches the clue about meeting the cousins. Use the verb as two words; a get-together with a hyphen is a noun.'),
    ('I hope you ___ at the party! (enjoy yourself very much)', 'have a ball', 'I hope you have a ball at the party!', 'Have a ball is the informal idiom that matches enjoying yourself very much.'),
    ('Please ___ these paper decorations on the wall. (hang them in position)', 'put up', 'Please put up these paper decorations on the wall.', 'Put up matches the clue about hanging the decorations in position.'),
]
for group,rows in [('definitions',DEFINITION_ROWS),('sentences',SENTENCE_ROWS)]:
    for n,(prompt,answer,model,explanation) in enumerate(rows,1):
        TASKS[group].append(dict(id=f'{group}-{n}',number=n,prompt=prompt,answer=answer,accepted=[answer],model=model,explanation=explanation))

VOCABULARY = [dict(term=t,spanish=s,audio=LESSON_ROOT+'u4-'+slug+'.mp3') for t,s,slug in [
    ('set up','preparar o disponer algo para usarlo','set-up'),
    ('put up','colocar o colgar algo; aquí, decoraciones','put-up'),
    ('get together','reunirse y pasar tiempo con otras personas','get-together'),
    ('in full swing','en pleno desarrollo o apogeo; con mucha actividad','full-swing'),
    ('have a ball','pasarlo muy bien; expresión informal','have-ball'),
]]
VOCABULARY += [dict(term=t,spanish=s,audio=AUDIO_ROOT+'word-'+slug+'.mp3') for t,s,slug in [
    ('sound system','equipo o sistema de sonido','sound-system'),
    ('equipment','equipo; conjunto de objetos o aparatos para una tarea','equipment'),
    ('hang','colgar','hang'),
    ('lively','animado; lleno de actividad','lively'),
    ('stall','puesto de venta o de una actividad en un evento','stall'),
    ('stalls','puestos de venta o de actividades en un evento','stalls'),
    ('enjoy yourself','disfrutar; pasarlo bien','enjoy-yourself'),
]]
VOCABULARY += [dict(term='decorations',spanish='decoraciones',audio=LESSON_ROOT+'u4-word-decorations.mp3')]

AUDIO = {}
for key,text in INSTRUCTIONS.items(): AUDIO['instruction-'+key] = dict(text=text,path=AUDIO_ROOT+'instruction-'+key+'.mp3',kind='instruction')
for items in TASKS.values():
    for item in items: AUDIO[item['id']] = dict(text=item['model'],path=AUDIO_ROOT+item['id']+'.mp3',kind='gated-model')
for value in VOCABULARY:
    AUDIO['word-'+value['term'].replace(' ','-')] = dict(text=value['term'],path=value['audio'],kind='vocabulary')
NEW_AUDIO = {key:value for key,value in AUDIO.items() if value['path'].startswith(AUDIO_ROOT)}
