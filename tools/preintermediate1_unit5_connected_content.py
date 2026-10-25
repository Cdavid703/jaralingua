"""Approved school photograph and a specific childhood memory."""
DIALOGUE = [
    ('Laura', 'Mateo, are these the photos from our neighborhood celebration? We can put them in the group album.'),
    ('Mateo', "Yes, but look at this older one. It's from my childhood, at primary school."),
    ('Laura', 'Are you the boy with curly hair? How old were you?'),
    ('Mateo', 'I was nine. I grew up in Bello. We lived near the school, so I walked there with my friends.'),
    ('Laura', 'What did you use to do after school?'),
    ('Mateo', "I used to play outside and make paper things. We didn't have a big garden, but we had a small table for our projects."),
    ('Laura', 'Did you use to show your work to other people?'),
    ('Mateo', "Not often. I didn't use to speak much in front of visitors. I was shy."),
    ('Laura', 'You seem more confident with the craft group now.'),
    ('Mateo', "Yes, I'm more confident showing my work in a small group. I still like making things with friends."),
    ('Laura', 'What special memory does the photo bring back?'),
    ('Mateo', 'Our school fair. Something went wrong with my project that day, and a classmate helped me.'),
    ('Laura', 'What happened? I want to hear that story.'),
    ('Mateo', "It's a memory I like to look back on. Let me tell you about that Saturday."),
]

READING = [
    'When I was nine, our primary school held a fair on a Saturday. I used to make paper things after school, but that day I wanted to show my work to visitors.',
    "I made a blue and yellow kite. Before the fair opened, the string broke. I felt nervous because I didn't know how to fix it.",
    'A classmate named Sara came to my table. She found another piece of string and helped me tie a new knot. Then we checked the kite together and put it on the display table.',
    "Later, we showed our work to the visitors. I was proud of the kite and grateful for Sara's help. I don't make kites now, but I still enjoy making things with other people. I look back on that childhood memory with a smile.",
]

VOCAB = [
    dict(term='childhood', spanish='infancia; etapa de la vida en la que se es niño', existing='u5-word-childhood', pages=['listening', 'reading']),
    dict(term='primary school', spanish='escuela primaria', existing='u5-word-primary-school', pages=['listening', 'reading']),
    dict(term='curly hair', spanish='cabello rizado', existing='u5-word-curly-hair', pages=['listening']),
    dict(term='grew up', spanish='creció; pasó su infancia en un lugar', new=True, file='grew-up.mp3', pages=['listening']),
    dict(term='after school', spanish='después de las clases escolares', new=True, file='after-school.mp3', pages=['listening', 'reading']),
    dict(term='shy', spanish='tímido; aquí, al hablar delante de visitantes', existing='u5-word-shy', pages=['listening']),
    dict(term='more confident', spanish='con más confianza o seguridad en sí mismo', new=True, file='more-confident.mp3', pages=['listening']),
    dict(term='bring back', spanish='hacer que vuelva a la mente un recuerdo', existing='u5-bring-back', pages=['listening']),
    dict(term='school fair', spanish='feria escolar; evento con trabajos o actividades de la escuela', new=True, file='school-fair.mp3', pages=['listening']),
    dict(term='a classmate', spanish='un compañero o una compañera de clase', existing='u5-word-classmate', pages=['listening', 'reading']),
    dict(term='look back on', spanish='recordar o pensar en una etapa o experiencia pasada', existing='u5-look-back', pages=['listening', 'reading']),
    dict(term='kite', spanish='cometa de papel que puede elevarse con el viento', new=True, file='kite.mp3', pages=['reading']),
    dict(term='string', spanish='cuerda o cordel; aquí, el de la cometa', new=True, file='string.mp3', pages=['reading']),
    dict(term='broke', spanish='se rompió; pasado de break', new=True, file='broke.mp3', pages=['reading']),
    dict(term='nervous', spanish='nervioso o preocupado por una situación', new=True, file='nervous.mp3', pages=['reading']),
    dict(term='fix', spanish='arreglar o reparar algo', new=True, file='fix.mp3', pages=['reading']),
    dict(term='a new knot', spanish='un nuevo nudo para unir o sujetar el cordel', new=True, file='a-new-knot.mp3', pages=['reading']),
    dict(term='display table', spanish='mesa donde se muestran los trabajos al público', new=True, file='display-table.mp3', pages=['reading']),
    dict(term='showed', spanish='mostramos; pasado de show en este contexto', new=True, file='showed.mp3', pages=['reading']),
    dict(term='proud', spanish='orgulloso o satisfecho por algo que se hizo', new=True, file='proud.mp3', pages=['reading']),
    dict(term='grateful', spanish='agradecido por la ayuda recibida', new=True, file='grateful.mp3', pages=['reading']),
]

LISTENING_QUESTIONS = [
    dict(id='q1', question='Where is the older photograph from?', options={'A':'The recent neighborhood celebration.', 'B':'Mateo’s first day at his shop.', 'C':'Mateo’s childhood at primary school.'}, answer='C', explanation='They are sorting celebration photos, but Mateo introduces an older school photograph.', evidence="It's from my childhood, at primary school."),
    dict(id='q2', question='How old was Mateo in the school photograph?', options={'A':'Nine.', 'B':'Ten.', 'C':'Thirteen.'}, answer='A', explanation='Mateo states his age; the answer does not depend on guessing from a picture.', evidence='I was nine.'),
    dict(id='q3', question='Where did Mateo grow up?', options={'A':'Envigado.', 'B':'Bello.', 'C':'Valencia.'}, answer='B', explanation='Mateo names Bello as the place where he grew up.', evidence='I grew up in Bello.'),
    dict(id='q4', question='How did Mateo get to school?', options={'A':'He took a bus with his cousins.', 'B':'He rode a bicycle alone.', 'C':'He walked with his friends.'}, answer='C', explanation='He lived near the school and walked there with friends.', evidence='We lived near the school, so I walked there with my friends.'),
    dict(id='q5', question='What did Mateo use to do after school?', options={'A':'Prepare bread at the bakery.', 'B':'Play outside and make paper things.', 'C':'Take photographs at community events.'}, answer='B', explanation='Used to introduces two activities from his childhood.', evidence='I used to play outside and make paper things.'),
    dict(id='q6', question='What did Mateo and his friends have for their projects?', options={'A':'A small table.', 'B':'A big garden.', 'C':'A community hall.'}, answer='A', explanation='He contrasts not having a big garden with having a small table.', evidence="We didn't have a big garden, but we had a small table for our projects."),
    dict(id='q7', question='What didn’t Mateo use to do often?', options={'A':'Walk to school with friends.', 'B':'Speak in front of visitors.', 'C':'Make things from paper.'}, answer='B', explanation='He describes speaking in front of visitors as unusual for him at that time.', evidence="I didn't use to speak much in front of visitors."),
    dict(id='q8', question='How does Mateo describe himself now?', options={'A':'Less interested in making things.', 'B':'More nervous in every situation.', 'C':'More confident showing his work in a small group.'}, answer='C', explanation='Mateo states this present comparison himself; it is not a conclusion drawn from the photograph.', evidence="I'm more confident showing my work in a small group."),
    dict(id='q9', question='What event does the photograph bring back?', options={'A':'A school fair.', 'B':'A family wedding.', 'C':'A music class.'}, answer='A', explanation='Mateo names the school fair as the event connected with his memory.', evidence='Our school fair. Something went wrong with my project that day'),
    dict(id='q10', question='What story is Mateo about to tell?', options={'A':'How he organized the recent celebration.', 'B':'What went wrong at the fair and how a classmate helped.', 'C':'Why he moved to a different neighborhood.'}, answer='B', explanation='The conversation introduces the problem and a classmate’s help; the reading gives the details.', evidence='Something went wrong with my project that day, and a classmate helped me.'),
]

READING_QUESTIONS = [
    dict(id='q1', question='When did the school fair take place?', options={'A':'On a Sunday when Mateo was ten.', 'B':'On a Saturday when Mateo was nine.', 'C':'On a Friday when Mateo was thirteen.'}, answer='B', paragraph=1, explanation='The opening gives both the day and Mateo’s age.', evidence='When I was nine, our primary school held a fair on a Saturday.'),
    dict(id='q2', question='What did Mateo use to do after school?', options={'A':'Welcome visitors at the community hall.', 'B':'Make photo albums for his class.', 'C':'Make paper things.'}, answer='C', paragraph=1, explanation='Used to provides a background habit before the text moves to one particular day.', evidence='I used to make paper things after school'),
    dict(id='q3', question='What did Mateo make for the fair?', options={'A':'A blue and yellow kite.', 'B':'A pair of blue bracelets.', 'C':'A paper photo album.'}, answer='A', paragraph=2, explanation='The reading reveals the project that the listening left unnamed.', evidence='I made a blue and yellow kite.'),
    dict(id='q4', question='What went wrong before the fair opened?', options={'A':'Mateo lost his photograph.', 'B':'The display table broke.', 'C':'The kite’s string broke.'}, answer='C', paragraph=2, explanation='The problem concerns the string, rather than the paper kite or the table.', evidence='Before the fair opened, the string broke.'),
    dict(id='q5', question='Why did Mateo feel nervous?', options={'A':'He didn’t know how to fix the problem.', 'B':'He didn’t like the colors of his kite.', 'C':'He had to leave before the visitors arrived.'}, answer='A', paragraph=2, explanation='Because introduces the reason for his feeling.', evidence="I felt nervous because I didn't know how to fix it."),
    dict(id='q6', question='Who helped Mateo?', options={'A':'His grandmother.', 'B':'A classmate named Sara.', 'C':'His friend Laura.'}, answer='B', paragraph=3, explanation='Sara is introduced as a classmate from that childhood event.', evidence='A classmate named Sara came to my table.'),
    dict(id='q7', question='How did Sara help with the kite?', options={'A':'She replaced it with a photograph.', 'B':'She bought a new display table.', 'C':'She found string and helped tie a new knot.'}, answer='C', paragraph=3, explanation='The new piece of string and knot solve the problem.', evidence='She found another piece of string and helped me tie a new knot.'),
    dict(id='q8', question='What did they do after checking the kite?', options={'A':'They took it home immediately.', 'B':'They put it on the display table.', 'C':'They put it in the group album.'}, answer='B', paragraph=3, explanation='Then orders checking the kite before placing it on display.', evidence='Then we checked the kite together and put it on the display table.'),
    dict(id='q9', question='How did Mateo feel at the end?', options={'A':'Proud of the kite and grateful for Sara’s help.', 'B':'Nervous because the string was still broken.', 'C':'Angry that Sara showed her own work.'}, answer='A', paragraph=4, explanation='The final paragraph states his feelings after they solve the problem and show the work.', evidence="I was proud of the kite and grateful for Sara's help."),
    dict(id='q10', question='What connects Mateo’s childhood with his life now?', options={'A':'He still makes kites every Saturday.', 'B':'He no longer enjoys working with other people.', 'C':'He still enjoys making things with other people.'}, answer='C', paragraph=4, explanation='He no longer makes kites, but the interest in making things together continues.', evidence="I don't make kites now, but I still enjoy making things with other people."),
]
