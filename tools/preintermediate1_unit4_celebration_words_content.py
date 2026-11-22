"""Approved Unit 4 vocabulary: four concepts, nine picture matches, four collocations."""
TITLE = 'Celebration Words and Objects'
AUDIO_ROOT = '/ingles/preintermedio-1/audio/unit4/celebration-words/'
LESSON_AUDIO = '/ingles/preintermedio-1/audio/unit4/lesson/'
INSTRUCTIONS = {
    'concepts': 'Match each definition to the most suitable word from the box. Use each word once.',
    'pictures': 'Match the words from the box to the correct pictures.',
    'combinations': 'Choose the verb or phrase that completes each celebration expression. Use each option once.',
}
BANKS = {
    'concepts': ['celebration', 'festival', 'holiday', 'tradition'],
    'pictures': ['Christmas cards', 'Christmas tree', 'stocking', 'wreath', 'tinsel', 'reindeer', 'snowman', 'mistletoe', 'carolling'],
    'combinations': ['invite', 'share', 'wear', 'put up'],
}
TASKS = {
    'concepts': [
        dict(id='concept-1', number=1, prompt='A custom that a family or community passes on to the next generation.', answer='tradition', explanation='A tradition is a custom passed on within a family or community.', model='A tradition is a custom passed on within a family or community.'),
        dict(id='concept-2', number=2, prompt='An organised event or series of events about music, art or a community culture.', answer='festival', explanation='Festival is the most specific word for this organised event or series of events.', model='A festival is an organised event or series of events connected with a theme or community.'),
        dict(id='concept-3', number=3, prompt='An occasion that marks something special, such as a birthday party or an anniversary dinner.', answer='celebration', explanation='A celebration marks a special occasion. A festival can include celebrations too.', model='A celebration marks a special occasion, such as a birthday or an anniversary.'),
        dict(id='concept-4', number=4, prompt='A recognised special day, or a period away from work or study, depending on the context.', answer='holiday', explanation='Holiday can refer to a special day or to time away from work or study.', model='A holiday can be a recognised special day or a period away from work or study.'),
    ],
    'pictures': [
        dict(id='picture-1', number=1, answer='Christmas cards', source='X26.png', width=197, height=148, alt='An illustrated seasonal greeting card beside an open envelope', explanation='The greeting card and envelope represent Christmas cards.'),
        dict(id='picture-2', number=2, answer='tinsel', source='X27.png', width=329, height=153, alt='A long curved strip of shiny green festive decoration', explanation='The long shiny decorative strip is tinsel.'),
        dict(id='picture-3', number=3, answer='mistletoe', source='authored-correction', width=640, height=640, alt='A branching green sprig with smooth oval leaves and clusters of white berries', explanation='The smooth oval leaves and white berries identify mistletoe in this corrected picture.'),
        dict(id='picture-4', number=4, answer='wreath', source='X30.png', width=225, height=225, alt='A ring of green foliage decorated with a red bow', explanation='The decorative ring of foliage is a wreath.'),
        dict(id='picture-5', number=5, answer='carolling', source='X29.png', width=254, height=198, alt='Three people singing together while holding song sheets', explanation='Singing Christmas songs together is carolling. Caroling is the American spelling.'),
        dict(id='picture-6', number=6, answer='snowman', source='X31.png', width=213, height=237, alt='A figure made from rounded snow shapes with a scarf, hat and carrot nose', explanation='The figure made of snow is a snowman.'),
        dict(id='picture-7', number=7, answer='Christmas tree', source='X33.png', width=597, height=640, alt='A decorated green tree with a star on top', explanation='The decorated tree is a Christmas tree.'),
        dict(id='picture-8', number=8, answer='reindeer', source='X35.png', width=221, height=228, alt='A brown deer with large antlers and a festive collar', explanation='The deer shown in the picture is a reindeer.'),
        dict(id='picture-9', number=9, answer='stocking', source='X32.png', width=225, height=225, alt='A large red and green decorative sock with a white cuff', explanation='The decorative sock is a stocking.'),
    ],
    'combinations': [
        dict(id='combination-1', number=1, prompt='We ___ paper decorations on the walls before the guests arrive.', answer='put up', explanation='Put up decorations means place or hang them in position.', model='We put up paper decorations on the walls before the guests arrive.'),
        dict(id='combination-2', number=2, prompt='We ___ guests by sending them an invitation with the time and place.', answer='invite', explanation='Invite guests means ask people to come to an event.', model='We invite guests by sending them an invitation with the time and place.'),
        dict(id='combination-3', number=3, prompt='For the parade, I ___ a costume instead of my everyday clothes.', answer='wear', explanation='Wear a costume means have special clothes on your body for an occasion or performance.', model='For the parade, I wear a costume instead of my everyday clothes.'),
        dict(id='combination-4', number=4, prompt='At our community dinner, we ___ food so everyone can try the dishes.', answer='share', explanation='Share food means let other people have some of the food too.', model='At our community dinner, we share food so everyone can try the dishes.'),
    ],
}
for key, items in TASKS.items():
    for item in items:
        item['accepted'] = [item['answer']]

VOCABULARY = [
    dict(term=t, spanish=s, audio=LESSON_AUDIO+'u4-word-'+t+'.mp3')
    for t, s in [('celebration', 'celebración; ocasión que marca algo especial'), ('festival', 'festival; evento o conjunto de eventos sobre un tema o una comunidad'), ('holiday', 'festivo o período de vacaciones, según el contexto'), ('tradition', 'tradición; costumbre transmitida dentro de una familia o comunidad')]
]
VOCABULARY += [dict(term=t, spanish=s, audio=AUDIO_ROOT+slug+'.mp3') for t,s,slug in [
    ('Christmas cards', 'tarjetas de Navidad', 'christmas-cards'),
    ('Christmas tree', 'árbol de Navidad', 'christmas-tree'),
    ('stocking', 'calcetín decorativo navideño', 'stocking'),
    ('wreath', 'corona decorativa', 'wreath'),
    ('tinsel', 'espumillón; tira brillante para decorar', 'tinsel'),
    ('reindeer', 'reno', 'reindeer'),
    ('snowman', 'muñeco de nieve', 'snowman'),
    ('mistletoe', 'muérdago', 'mistletoe'),
    ('carolling', 'cantar villancicos; caroling en inglés estadounidense', 'carolling'),
    ('put up decorations', 'colocar o colgar decoraciones', 'put-up-decorations'),
    ('invite guests', 'invitar personas a una celebración', 'invite-guests'),
    ('wear a costume', 'llevar un disfraz o vestuario especial', 'wear-a-costume'),
    ('share food', 'compartir comida', 'share-food'),
]]

AUDIO = {v['audio'].rsplit('/', 1)[1][:-4]: dict(text=v['term'], path=v['audio']) for v in VOCABULARY}
# A short noun context avoids confusing the isolated word with "stalking".
AUDIO['stocking']['text'] = 'a stocking'
AUDIO['instruction-pictures'] = dict(text=INSTRUCTIONS['pictures'], path='/ingles/preintermedio-1/audio/unit3/healthy-vocabulary/instruction.mp3')
for key in ['concepts', 'combinations']:
    AUDIO['instruction-'+key] = dict(text=INSTRUCTIONS[key], path=AUDIO_ROOT+'instruction-'+key+'.mp3')
    for item in TASKS[key]:
        AUDIO[item['id']] = dict(text=item['model'], path=AUDIO_ROOT+item['id']+'.mp3')
for item in TASKS['pictures']:
    item['model_audio'] = next(v['audio'].rsplit('/', 1)[1][:-4] for v in VOCABULARY if v['term'] == item['answer'])
NEW_AUDIO = {key:value for key,value in AUDIO.items() if value['path'].startswith(AUDIO_ROOT)}
