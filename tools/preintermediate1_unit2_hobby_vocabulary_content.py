"""Original page 1 of ESL Pals Hobbies: Can / Can't; image order is visual, not resource order."""
WARMUP_INSTRUCTION = 'Task: Choose the correct definition for the word hobby.'
WARMUP_OPTIONS = ['A task you do for work.', 'An activity that you do outside of work for fun.', 'Something that you can’t do.']
INSTRUCTION = 'Match the hobbies from the box to the correct pictures. Then, divide them in the table.'
WORDS = ['fishing', 'cooking', 'playing chess', 'dancing', 'sailing', 'baking', 'playing football', 'cycling']
PICTURES = [
    dict(number=1, source='X18.png', answer='playing football', alt='A ball on the grass inside a stadium', width=510, height=340, explanation='The ball and stadium connect this picture with playing football.'),
    dict(number=2, source='X19.png', answer='sailing', alt='A small boat with a raised sail on the water', width=502, height=340, explanation='The boat uses a sail, so sailing fits the picture.'),
    dict(number=3, source='X20.png', answer='playing chess', alt='Black and white pieces on a board', width=510, height=340, explanation='The board and its black and white pieces are used for playing chess.'),
    dict(number=4, source='X16.png', answer='cycling', alt='A bicycle on a woodland path', width=511, height=340, explanation='The bicycle connects this picture with cycling.'),
    dict(number=5, source='X23.png', answer='fishing', alt='A rod, reel, landing net and a box of lures', width=510, height=340, explanation='The rod, reel, landing net and lures are fishing equipment.'),
    dict(number=6, source='X22.png', answer='cooking', alt='Vegetables being prepared on a cutting board', width=604, height=340, explanation='Preparing vegetables for a meal connects this picture with cooking.'),
    dict(number=7, source='X21.png', answer='baking', alt='Pieces of dough beside a rolling pin', width=520, height=340, explanation='The dough and rolling pin are used when baking.'),
    dict(number=8, source='X24.png', answer='dancing', alt='A person making a dance movement on a beach', width=509, height=340, explanation='The person’s movement and pose connect this picture with dancing.'),
]
VOCABULARY = [
    dict(term=term,spanish=spanish,audio='/ingles/preintermedio-1/audio/unit2/hobby-vocabulary/'+term.replace(' ','-')+'.mp3')
    for term,spanish in [
        ('fishing','pescar; actividad de capturar peces'),
        ('cooking','cocinar; preparar alimentos'),
        ('playing chess','jugar al ajedrez'),
        ('dancing','bailar'),
        ('sailing','navegar en un velero'),
        ('baking','hornear; preparar pan, pasteles u otros alimentos en el horno'),
        ('playing football','jugar al fútbol'),
        ('cycling','montar en bicicleta; practicar ciclismo'),
        ('hobby','pasatiempo; actividad que se realiza por gusto en el tiempo libre'),
    ]
]
PLAN = [
    ('Hobby Vocabulary','Vocabulary','Page 1'),
    ('Hobbies with Can and Can’t','Grammar','Page 2 and the top of page 3'),
    ('People and Their Hobbies','Video Listening','Lower part of page 3'),
    ('Why Hobbies Are Good','Reading','Pages 4–5'),
    ('Let’s Talk About Hobbies','Speaking','Page 6'),
    ('Who Can Do It?','Case Study','Page 7'),
    ('Can and Can’t: More Practice','Grammar','Page 8 and the top of page 9'),
    ('My Hobbies','Writing','Lower part of page 9 and page 10'),
]
