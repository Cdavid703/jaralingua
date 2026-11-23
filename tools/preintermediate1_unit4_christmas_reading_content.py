"""Complete ESL Pals p.5 story; eight adapted, text-supported comprehension questions."""
TITLE = 'Getting Ready for Christmas'
ORIGINAL_TITLE = 'CHRISTMAS STORY'
AUDIO_ROOT = '/ingles/preintermedio-1/audio/unit4/christmas-reading/'
WORD_AUDIO = '/ingles/preintermedio-1/audio/unit4/celebration-words/'
INSTRUCTION = 'Read the complete story, then choose one answer for each of the eight comprehension questions. Use only the information in the story.'
PARAGRAPHS = [
    "It's Christmas time, and the Smith family are getting ready. They live in a small house in the country, and they love Christmas. There is snow on the ground outside, but it isn't snowing now.",
    'In the living room, Mrs. Smith is writing Christmas cards. Mr. Smith is putting up the Christmas tree. The children, Lucy and Peter, are helping him. First, they put all the lights on the tree. Then they put all the decorations on the tree. Finally, they put the star on top of the tree.',
    'In the kitchen, Grandma is making a big Christmas dinner. The smell is delicious. In the dining room, Grandpa is sleeping. He always goes to sleep after lunch!',
    "In the children's bedroom, Lucy and Peter are looking at their stockings. Their stockings are at the end of their beds. They want to open them now, but it's only 2 o'clock in the afternoon. They have to wait until tomorrow morning!",
    "There are also Christmas decorations in the rest of the house. On the front door, there is a Christmas wreath. It's green and red. There is tinsel on the walls and the windows. There are some reindeer and a snowman on the table. And there is mistletoe on the ceiling. Mistletoe is for kissing, but Lucy and Peter don't like kissing! They think it's yuck!",
    "On Christmas Eve, the Smith family always go carolling. They walk around the village and sing Christmas songs. Then they go to the pub and drink hot chocolate with their friends. It's always a very special day.",
    "Lucy and Peter are excited. They love Christmas, but they can't sleep. They want to open their presents now! But they have to wait until tomorrow morning.",
]
QUESTIONS = [
    dict(id='q1',number=1,question='How are Mr. Smith, Lucy and Peter getting ready for Christmas?',options={'A':'They are writing Christmas cards in the living room.','B':'They are putting up the Christmas tree and decorating it.','C':'They are making a big Christmas dinner in the kitchen.'},answer='B',paragraph=2,evidence='Mr. Smith is putting up the Christmas tree. The children, Lucy and Peter, are helping him.',explanation='Mr. Smith puts up the tree and the children help. Mrs. Smith writes cards; Grandma makes dinner.'),
    dict(id='q2',number=2,question='Where is Grandma, and what is she doing?',options={'A':'She is in the kitchen, making a big Christmas dinner.','B':'She is in the dining room, sleeping after lunch.','C':'She is in the living room, writing Christmas cards.'},answer='A',paragraph=3,evidence='In the kitchen, Grandma is making a big Christmas dinner.',explanation='The story gives both her location and her activity. Grandpa is the person sleeping in the dining room.'),
    dict(id='q3',number=3,question='When does Grandpa usually go to sleep?',options={'A':'Before breakfast.','B':'After the family goes carolling.','C':'After lunch.'},answer='C',paragraph=3,evidence='He always goes to sleep after lunch!',explanation='After lunch tells us when Grandpa usually sleeps. The story does not explain why.'),
    dict(id='q4',number=4,question='Where are Lucy and Peter’s stockings?',options={'A':'On the front door.','B':'At the end of their beds.','C':'On the table.'},answer='B',paragraph=4,evidence='Their stockings are at the end of their beds.',explanation='The stockings are in the children’s bedroom, at the end of their beds. The wreath is on the front door.'),
    dict(id='q5',number=5,question='Which description matches the decorations outside the living room?',options={'A':'There is a wreath on the table and tinsel on the ceiling.','B':'There is a wreath on the front door and tinsel on the walls and windows.','C':'There is mistletoe on the front door and a snowman on the ceiling.'},answer='B',paragraph=5,evidence="On the front door, there is a Christmas wreath. It's green and red. There is tinsel on the walls and the windows.",explanation='The wreath is on the front door; tinsel is on the walls and windows. The snowman is on the table and mistletoe is on the ceiling.'),
    dict(id='q6',number=6,question='What do the Smith family usually do on Christmas Eve?',options={'A':'They open their presents at two in the afternoon, then write cards.','B':'They stay home and sleep after lunch instead of meeting friends.','C':'They walk around the village singing, then drink hot chocolate with friends.'},answer='C',paragraph=6,evidence='They walk around the village and sing Christmas songs. Then they go to the pub and drink hot chocolate with their friends.',explanation='Carolling and hot chocolate with friends form the Christmas Eve routine described in the story. The children must wait to open presents.'),
    dict(id='q7',number=7,question='How do Lucy and Peter feel about kissing under the mistletoe?',options={'A':'They do not like it.','B':'They are excited about it.','C':'They have no opinion about it.'},answer='A',paragraph=5,evidence="Mistletoe is for kissing, but Lucy and Peter don't like kissing! They think it's yuck!",explanation='They say they do not like kissing. Their excitement elsewhere in the story is about Christmas and presents.'),
    dict(id='q8',number=8,question='What do they put on the Christmas tree last?',options={'A':'The star.','B':'The lights.','C':'The decorations.'},answer='A',paragraph=2,evidence='First, they put all the lights on the tree. Then they put all the decorations on the tree. Finally, they put the star on top of the tree.',explanation='Finally marks the last step: they put the star on top, after the lights and decorations.'),
]
VOCABULARY = [dict(term=t,spanish=s,audio=WORD_AUDIO+slug+'.mp3') for t,s,slug in [
    ('Christmas cards','tarjetas de Navidad','christmas-cards'),('Christmas tree','árbol de Navidad','christmas-tree'),
    ('wreath','corona decorativa','wreath'),('tinsel','espumillón; tira brillante para decorar','tinsel'),
    ('reindeer','renos; animales de la ilustración navideña','reindeer'),('snowman','muñeco de nieve','snowman'),
    ('mistletoe','muérdago','mistletoe'),('carolling','cantar villancicos','carolling'),
]]
VOCABULARY.append(dict(term='decorations',spanish='decoraciones',audio='/ingles/preintermedio-1/audio/unit4/lesson/u4-word-decorations.mp3'))
VOCABULARY += [dict(term=t,spanish=s,audio=AUDIO_ROOT+'word-'+slug+'.mp3') for t,s,slug in [
    ('getting ready','preparándose','getting-ready'),('in the country','en el campo; en una zona rural','in-the-country'),
    ('ground','suelo; aquí, el suelo del exterior','ground'),('delicious','delicioso; con buen olor o sabor','delicious'),
    ('dining room','comedor','dining-room'),('stockings','calcetines decorativos navideños','stockings'),
    ('at the end of','al final de; aquí, en el extremo de','at-the-end-of'),('ceiling','techo interior','ceiling'),
    ('Christmas Eve','Nochebuena','christmas-eve'),('village','pueblo; aldea','village'),
    ('pub','pub; establecimiento donde también pueden servirse otras bebidas y comida','pub'),
    ('hot chocolate','chocolate caliente','hot-chocolate'),('excited','emocionados; ilusionados en este contexto','excited'),
    ('presents','regalos','presents'),
]]
AUDIO = {'instruction':dict(text=INSTRUCTION,path=AUDIO_ROOT+'instruction.mp3',label='Reading instruction',kind='instruction')}
for n,text in enumerate(PARAGRAPHS,1): AUDIO['paragraph-'+str(n)] = dict(text=text,path=AUDIO_ROOT+f'paragraph-{n}.mp3',label=f'Paragraph {n}',kind='paragraph')
AUDIO['story'] = dict(text='Christmas Story. '+' '.join(PARAGRAPHS),path=AUDIO_ROOT+'story.mp3',label='Complete story',kind='complete-story')
for question in QUESTIONS: AUDIO['question-'+str(question['number'])] = dict(text=question['question'],path=AUDIO_ROOT+'question-'+str(question['number'])+'.mp3',label='Question '+str(question['number']),kind='question')
for value in VOCABULARY: AUDIO['word-'+value['term'].replace(' ','-')] = dict(text=value['term'],path=value['audio'],label=value['term'],kind='vocabulary')
NEW_AUDIO = {key:value for key,value in AUDIO.items() if value['path'].startswith(AUDIO_ROOT)}
