"""Approved Unit 4 grammar: eight customs/frequency gaps and eight description gaps."""
TITLE = 'Customs and Celebration Descriptions'
AUDIO_ROOT = '/ingles/preintermedio-1/audio/unit4/customs-descriptions/'
LESSON_ROOT = '/ingles/preintermedio-1/audio/unit4/lesson/'
INSTRUCTIONS = {
    'customs': 'Complete each gap with the present simple form. Use all the words in brackets. Include the subject when it appears in brackets. Put frequency adverbs before the main verb or after be. Write only the missing words.',
    'descriptions': 'Complete each gap with the missing words. Choose between the alternatives in brackets, or use the word in brackets to build the required expression. Write only the missing words.',
}
TASKS = {'customs': [], 'descriptions': []}
CUSTOM_ROWS = [
    ('Every year, my sister ___ her cousins to our family celebration. (invite)', 'invites', 'Every year, my sister invites her cousins to our family celebration.', 'This is a repeated custom. With my sister, add -s to invite.'),
    ('On special occasions, we ___ a meal together. (usually / share)', 'usually share', 'On special occasions, we usually share a meal together.', 'Put usually before the main verb share. With we, the verb stays in its base form.'),
    ('The annual dinner ___ at my aunt’s home. (often / be)', 'is often', 'The annual dinner is often at my aunt’s home.', 'The subject dinner is singular, so use is. Put often after be.'),
    ('My brother ___ a costume for this family dinner. (not / wear)', 'does not wear', 'My brother does not wear a costume for this family dinner.', 'Use does not or doesn’t with my brother, followed by the base verb wear.'),
    ('___ your aunt usually prepare the main dish? (do)', 'does', 'Does your aunt usually prepare the main dish?', 'Use does to ask about your aunt’s usual routine. Prepare stays in its base form after does.'),
    ('My parents ___ gifts at this celebration. (not / exchange)', 'do not exchange', 'My parents do not exchange gifts at this celebration.', 'The plural subject my parents uses do not or don’t, followed by the base verb exchange.'),
    ('What ___ for the family celebration? (you / usually / cook)', 'do you usually cook', 'What do you usually cook for the family celebration?', 'In a present simple question, use do + you + usually + the base verb cook.'),
    ('My grandparents ___ late for this dinner. (never / be)', 'are never', 'My grandparents are never late for this dinner.', 'Grandparents is plural, so use are. Never goes after be and already gives a negative meaning.'),
]
DESCRIPTION_ROWS = [
    ('There ___ some invitations on the table. (is / are)', 'are', 'There are some invitations on the table.', 'Invitations is a plural countable noun, so use there are.'),
    ('There ___ a lot of food in the kitchen. (is / are)', 'is', 'There is a lot of food in the kitchen.', 'Food is uncountable in this general use, so use there is.'),
    ('There are ___ guests in the hall. (many / much)', 'many', 'There are many guests in the hall.', 'Guests is plural and countable. Of the two options, many is correct.'),
    ('There is ___ music in the room. (some / many)', 'some', 'There is some music in the room.', 'Music is uncountable here. Some works with music; many does not.'),
    ('There ___ a lot of ornaments on the tree. (is / are)', 'are', 'There are a lot of ornaments on the tree.', 'Ornaments is a plural countable noun. A lot of does not make it singular.'),
    ('There is a ___ food for all the guests. (lot)', 'lot of', 'There is a lot of food for all the guests.', 'The complete quantity expression is a lot of. The word a is already outside the gap.'),
    ('___ a gift beside the door. (there / be)', 'there is', 'There is a gift beside the door.', 'A gift is one countable item. Use there is or the contraction there’s.'),
    ('There are ___ guests in the garden. (some / much)', 'some', 'There are some guests in the garden.', 'Guests is plural and countable. Some works with plural countable nouns; much does not.'),
]
for group, rows in [('customs', CUSTOM_ROWS), ('descriptions', DESCRIPTION_ROWS)]:
    for n,(prompt,answer,model,explanation) in enumerate(rows,1):
        TASKS[group].append(dict(id=f'{group}-{n}', number=n, prompt=prompt, answer=answer, accepted=[answer], model=model, explanation=explanation))

EXAMPLES = {
    'customs': dict(id='example-customs', text='Our family usually shares a meal. The celebration is often at home.'),
    'descriptions': dict(id='example-descriptions', text='There are some plates on the table. There is a lot of rice in the bowl.'),
}
VOCABULARY = [dict(term=t,spanish=s,audio=LESSON_ROOT+'u4-word-'+slug+'.mp3') for t,s,slug in [
    ('tradition','tradición; costumbre transmitida dentro de una familia o comunidad','tradition'),
    ('decorations','decoraciones','decorations'),
    ('guests','invitados','guests'),
    ('gifts','regalos','gifts'),
    ('ornaments','adornos; objetos decorativos','ornaments'),
]]
VOCABULARY += [dict(term=t,spanish=s,audio=AUDIO_ROOT+'word-'+slug+'.mp3') for t,s,slug in [
    ('customs','costumbres; prácticas habituales de una familia o comunidad','customs'),
    ('annual','anual; que sucede cada año','annual'),
    ('relatives','familiares; parientes','relatives'),
    ('share a meal','compartir una comida','share-a-meal'),
    ('exchange gifts','intercambiar regalos','exchange-gifts'),
    ('main dish','plato principal','main-dish'),
    ('invitations','invitaciones','invitations'),
    ('beside','al lado de','beside'),
]]
AUDIO = {}
for key,text in INSTRUCTIONS.items(): AUDIO['instruction-'+key] = dict(text=text,path=AUDIO_ROOT+'instruction-'+key+'.mp3',kind='instruction')
for item in EXAMPLES.values(): AUDIO[item['id']] = dict(text=item['text'],path=AUDIO_ROOT+item['id']+'.mp3',kind='worked-example')
for items in TASKS.values():
    for item in items: AUDIO[item['id']] = dict(text=item['model'],path=AUDIO_ROOT+item['id']+'.mp3',kind='gated-model')
# This complete model already exists, with the exact wording and purpose.
AUDIO['descriptions-8']['path'] = LESSON_ROOT+'u4-some.mp3'
for value in VOCABULARY:
    key='word-'+value['term'].replace(' ','-')
    AUDIO[key] = dict(text=value['term'],path=value['audio'],kind='vocabulary')
NEW_AUDIO = {key:value for key,value in AUDIO.items() if value['path'].startswith(AUDIO_ROOT)}
