"""Approved neighborhood celebration: an invitation and Ana's follow-up email."""
DIALOGUE = [
    ('Laura', "Hi, Mateo. We're organizing a neighborhood celebration. Can you help us?"),
    ('Mateo', 'Of course. I enjoy helping with events like this. The neighbors can spend time together. What do you usually do for a celebration?'),
    ('Laura', 'My family usually gets together at home. We share food and listen to music. We often invite our cousins and a few neighbors.'),
    ('Mateo', 'We do that too. Where is this celebration?'),
    ('Laura', "At the community hall on Saturday. I'm going to prepare some bread at the bakery."),
    ('Mateo', 'What about the craft group? Are they joining us?'),
    ('Laura', "Yes. They're going to put up paper decorations. Ana is coordinating the volunteers."),
    ('Mateo', 'When are we meeting? I can help set up the tables.'),
    ('Laura', "We're meeting at the hall at four. Ana confirms four o'clock for our team."),
    ('Mateo', 'Do I need to bring anything?'),
    ('Laura', 'Just your notebook. There are tools and decorations at the hall already. We can use it to remember our jobs before the guests arrive.'),
    ('Mateo', 'When are the guests arriving, and what happens first?'),
    ('Laura', 'Ana is sending the full program on Friday. We can check the details then.'),
    ('Mateo', 'Great. We can get together, meet new people and make it a celebration for everyone.'),
]

EMAIL_GREETING = 'Hi Laura and Mateo,'
READING = [
    "Here is our final plan for Saturday's neighborhood celebration. We're meeting at the community hall at four to set up the tables. Laura is bringing bread from the bakery. Mateo and the craft group are putting up the decorations. Everyone agrees on these jobs and times.",
    'The guests are arriving at five. First, we welcome them at the door. Then, we share the food. There is some juice on the drinks table, and there are handmade cards beside the entrance.',
    "After the meal, the craft group is showing its work. Music starts at six, and everyone can join in. We're not using fireworks; this is a small indoor celebration.",
    "Please bring your notebook to check the tasks. We're going to take some photos for our group album.",
]
EMAIL_CLOSING = 'See you on Saturday!'
EMAIL_AUTHOR = 'Ana'

VOCAB = [
    dict(term='neighborhood', spanish='barrio; zona donde vive una comunidad', new=True, file='neighborhood.mp3', pages=['listening', 'reading']),
    dict(term='community hall', spanish='salón comunitario para reuniones y actividades del barrio', new=True, file='community-hall.mp3', pages=['listening', 'reading']),
    dict(term='get together', spanish='reunirse para compartir tiempo con otras personas', existing='u4-get-together', pages=['listening']),
    dict(term='set up', spanish='preparar o disponer algo; aquí, colocar las mesas', existing='u4-set-up', pages=['listening', 'reading']),
    dict(term='put up', spanish='colocar o colgar decoraciones', existing='u4-put-up', pages=['listening']),
    dict(term='decorations', spanish='decoraciones; objetos para adornar un lugar', existing='u4-word-decorations', pages=['listening', 'reading']),
    dict(term='coordinating', spanish='coordinando; organizando el trabajo de varias personas', new=True, file='coordinating.mp3', pages=['listening']),
    dict(term='volunteers', spanish='voluntarios; personas que ofrecen su ayuda', new=True, file='volunteers.mp3', pages=['listening']),
    dict(term='confirms', spanish='confirma; indica que algo está acordado', new=True, file='confirms.mp3', pages=['listening']),
    dict(term='program', spanish='programa; lista y orden de las actividades del evento', new=True, file='program.mp3', pages=['listening']),
    dict(term='guests', spanish='invitados; personas que asisten a una celebración', existing='u4-word-guests', pages=['listening', 'reading']),
    dict(term='putting up', spanish='colocando o colgando; aquí, las decoraciones acordadas', new=True, file='putting-up.mp3', pages=['reading']),
    dict(term='handmade', spanish='hecho a mano, de forma artesanal', new=True, file='handmade.mp3', pages=['reading']),
    dict(term='entrance', spanish='entrada; lugar por donde se accede al salón', new=True, file='entrance.mp3', pages=['reading']),
    dict(term='meal', spanish='comida; ocasión en la que se come, como almuerzo o cena', new=True, file='meal.mp3', pages=['reading']),
    dict(term='join in', spanish='participar en una actividad con otras personas', existing_path='/ingles/preintermedio-1/audio/unit2/lesson/u2-join-in.mp3', pages=['reading']),
    dict(term='fireworks', spanish='fuegos artificiales', existing='u4-word-fireworks', pages=['reading']),
    dict(term='indoor', spanish='que se realiza dentro de un edificio', new=True, file='indoor.mp3', pages=['reading']),
    dict(term='group album', spanish='álbum de fotos del grupo', new=True, file='group-album.mp3', pages=['reading']),
]

LISTENING_QUESTIONS = [
    dict(id='q1', question='Why does Laura talk to Mateo?', options={'A':'To ask him to teach a music class.', 'B':'To invite him to help with a celebration.', 'C':'To buy decorations from his shop.'}, answer='B', explanation='Laura introduces the neighborhood celebration and asks for Mateo’s help.', evidence="We're organizing a neighborhood celebration. Can you help us?"),
    dict(id='q2', question='What does Laura’s family usually do for a celebration?', options={'A':'Watch fireworks at the school.', 'B':'Eat at the bakery with volunteers.', 'C':'Get together at home and share food.'}, answer='C', explanation='Laura describes a repeated family custom, rather than the plan for this event.', evidence='My family usually gets together at home. We share food and listen to music.'),
    dict(id='q3', question='Where is the neighborhood celebration?', options={'A':'At the community hall.', 'B':'At the English school.', 'C':'At Mateo’s shop.'}, answer='A', explanation='Laura gives the community hall as the location for Saturday’s event.', evidence='At the community hall on Saturday.'),
    dict(id='q4', question='What is Laura going to prepare?', options={'A':'Paper cards at home.', 'B':'Some bread at the bakery.', 'C':'A music program at school.'}, answer='B', explanation='Going to introduces her intention to prepare bread.', evidence="I'm going to prepare some bread at the bakery."),
    dict(id='q5', question='Who is coordinating the volunteers?', options={'A':'Mateo.', 'B':'Laura’s English teacher.', 'C':'Ana.'}, answer='C', explanation='Laura names Ana as the person organizing the volunteers.', evidence='Ana is coordinating the volunteers.'),
    dict(id='q6', question='What does Mateo offer to help do?', options={'A':'Set up the tables.', 'B':'Make the bread.', 'C':'Write the full program.'}, answer='A', explanation='Mateo offers to arrange the tables, while Ana sends the program.', evidence='I can help set up the tables.'),
    dict(id='q7', question='What time is the team meeting at the hall?', options={'A':'At six.', 'B':'At five.', 'C':'At four.'}, answer='C', explanation='Laura gives four o’clock and says Ana confirms the time for the team.', evidence="We're meeting at the hall at four. Ana confirms four o'clock for our team."),
    dict(id='q8', question='What does Laura ask Mateo to bring?', options={'A':'All the decorations.', 'B':'His notebook.', 'C':'The craft tools.'}, answer='B', explanation='Mateo only needs his notebook; tools and decorations are already at the hall.', evidence='Just your notebook. There are tools and decorations at the hall already.'),
    dict(id='q9', question='When is Ana sending the full program?', options={'A':'On Friday.', 'B':'On Saturday during the celebration.', 'C':'On Sunday after the celebration.'}, answer='A', explanation='Laura says the program is coming on Friday. The reading contains that follow-up.', evidence='Ana is sending the full program on Friday.'),
    dict(id='q10', question='What detail is still missing at the end of the conversation?', options={'A':'The team’s meeting place.', 'B':'The guests’ arrival time and the order of activities.', 'C':'What Mateo needs to bring.'}, answer='B', explanation='Mateo asks about the guests and first activity, but Laura refers him to Ana’s coming program.', evidence='When are the guests arriving, and what happens first?'),
]

READING_QUESTIONS = [
    dict(id='q1', question='What is the purpose of Ana’s email?', options={'A':'To cancel the neighborhood celebration.', 'B':'To describe last year’s party.', 'C':'To share the final plan for Saturday.'}, answer='C', paragraph=1, explanation='Ana supplies the final plan promised in the conversation.', evidence="Here is our final plan for Saturday's neighborhood celebration."),
    dict(id='q2', question='What are Mateo and the craft group doing for the celebration?', options={'A':'Putting up the decorations.', 'B':'Bringing bread from the bakery.', 'C':'Buying fireworks for the guests.'}, answer='A', paragraph=1, explanation='The email assigns the decorations to Mateo and the craft group; Laura brings the bread.', evidence='Mateo and the craft group are putting up the decorations.'),
    dict(id='q3', question='When are the guests arriving?', options={'A':'At four, with the team.', 'B':'At five.', 'C':'At six, when the music starts.'}, answer='B', paragraph=2, explanation='The guests arrive at five. Four is the team’s preparation time.', evidence='The guests are arriving at five.'),
    dict(id='q4', question='What is the first activity when the guests arrive?', options={'A':'Welcoming them at the door.', 'B':'Showing the craft group’s work.', 'C':'Taking the tables outside.'}, answer='A', paragraph=2, explanation='First marks welcoming the guests as the opening activity.', evidence='First, we welcome them at the door.'),
    dict(id='q5', question='What is on the drinks table?', options={'A':'Handmade cards.', 'B':'Craft tools.', 'C':'Some juice.'}, answer='C', paragraph=2, explanation='There is introduces the uncountable noun juice and locates it on the drinks table.', evidence='There is some juice on the drinks table'),
    dict(id='q6', question='Where are the handmade cards?', options={'A':'Inside Laura’s notebook.', 'B':'Beside the entrance.', 'C':'On the drinks table.'}, answer='B', paragraph=2, explanation='Ana locates the handmade cards beside the entrance, separately from the juice.', evidence='there are handmade cards beside the entrance.'),
    dict(id='q7', question='What happens after the meal?', options={'A':'The guests watch fireworks.', 'B':'Laura starts baking the bread.', 'C':'The craft group shows its work.'}, answer='C', paragraph=3, explanation='After the meal places the craft presentation after sharing food.', evidence='After the meal, the craft group is showing its work.'),
    dict(id='q8', question='What time does the music start?', options={'A':'At six.', 'B':'At five.', 'C':'At four.'}, answer='A', paragraph=3, explanation='The music starts at six, after the arrival and meal.', evidence='Music starts at six, and everyone can join in.'),
    dict(id='q9', question='Which statement matches the plan?', options={'A':'The celebration takes place outside with fireworks.', 'B':'It is a small indoor celebration without fireworks.', 'C':'Only the craft group can join the music.'}, answer='B', paragraph=3, explanation='Ana explicitly describes the indoor setting and says they are not using fireworks.', evidence="We're not using fireworks; this is a small indoor celebration."),
    dict(id='q10', question='Why are they going to take photos?', options={'A':'To change the guests’ arrival time.', 'B':'To replace the handmade cards.', 'C':'For their group album.'}, answer='C', paragraph=4, explanation='Going to states the intention; the group album gives its purpose.', evidence="We're going to take some photos for our group album."),
]
