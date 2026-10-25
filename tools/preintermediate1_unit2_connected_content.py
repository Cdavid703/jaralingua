"""Approved Unit 2 craft-group story and contextual vocabulary."""
DIALOGUE = [
    ('Laura', "Hi, Mateo. I'm looking for a new hobby. What do you do in your free time?"),
    ('Mateo', 'I enjoy making things. I belong to a small craft group. You can join us.'),
    ('Laura', 'Maybe. What kind of music do you like? I love salsa and listen to it at home.'),
    ('Mateo', "I like salsa, too. We sometimes play it while we work, but music isn't our main activity."),
    ('Laura', "What can you make? I can draw, but I can't make jewelry."),
    ('Mateo', 'I can make bracelets, and I can teach you to make them. We help each other.'),
    ('Laura', 'That sounds interesting. Who leads the group?'),
    ('Mateo', 'Ana. She is patient, and you can ask her for help.'),
    ('Laura', 'When do you meet, and how long does each meeting last?'),
    ('Mateo', 'On Saturdays, from ten until twelve. Materials cost five dollars.'),
    ('Laura', 'What do I need to bring?'),
    ('Mateo', 'Just a small notebook. The group provides the tools and materials.'),
    ('Laura', 'Great. I want to try out a new skill. What project can we make together?'),
    ('Mateo', "Ana explains the project at the meeting. Let's find out on Saturday."),
]

READING = [
    "On Saturday, Laura joins Mateo's craft group. Ana welcomes her and puts two bracelets on the table. She asks Laura and Mateo to make a matching pair. Laura likes the blue one and chooses it as their model.",
    'First, they choose beads and arrange them in a simple pattern. Ana gives them thread and shows them how to begin. Laura listens to her carefully. Mateo can tie a knot, so Laura asks him for help.',
    'They work slowly and take turns using the tools. When the thread is too long, Ana cuts it. Laura writes the steps in her notebook to remember them.',
    'After two hours, their bracelets are ready. The colors match, but each bracelet has a different detail. Laura thanks the group. Making jewelry is new for her, but she is getting the hang of it.',
]

VOCAB = [
    dict(term='craft group', spanish='grupo de manualidades', new=True, file='craft-group.mp3', pages=['listening', 'reading']),
    dict(term='belong to', spanish='pertenecer a un grupo', new=True, file='belong-to.mp3', pages=['listening']),
    dict(term='jewelry', spanish='joyería; aquí, accesorios como pulseras', new=True, file='jewelry.mp3', pages=['listening', 'reading']),
    dict(term='bracelets', spanish='pulseras', new=True, file='bracelets.mp3', pages=['listening', 'reading']),
    dict(term='materials', spanish='materiales para elaborar las manualidades', new=True, file='materials.mp3', pages=['listening']),
    dict(term='tools', spanish='herramientas que se utilizan para trabajar', new=True, file='tools.mp3', pages=['listening', 'reading']),
    dict(term='provides', spanish='proporciona; entrega lo necesario', new=True, file='provides.mp3', pages=['listening']),
    dict(term='skill', spanish='habilidad que se aprende y se practica', new=True, file='skill.mp3', pages=['listening']),
    dict(term='try out', spanish='probar una actividad para conocerla', existing='u2-try-out', pages=['listening']),
    dict(term='matching pair', spanish='par de objetos que combinan entre sí', new=True, file='matching-pair.mp3', pages=['reading']),
    dict(term='model', spanish='modelo que sirve de ejemplo para el proyecto', new=True, file='model.mp3', pages=['reading']),
    dict(term='beads', spanish='cuentas pequeñas para hacer accesorios', existing='u2-beads', pages=['reading']),
    dict(term='arrange', spanish='ordenar o colocar siguiendo una idea', new=True, file='arrange.mp3', pages=['reading']),
    dict(term='pattern', spanish='patrón; orden de colores o formas que se repite', new=True, file='pattern.mp3', pages=['reading']),
    dict(term='thread', spanish='hilo para unir las cuentas', existing='u2-thread', pages=['reading']),
    dict(term='tie a knot', spanish='hacer un nudo', new=True, file='tie-a-knot.mp3', pages=['reading']),
    dict(term='take turns', spanish='turnarse; usar algo uno después del otro', existing_path='/ingles/preintermedio-1/audio/unit1/connected/take-turns.mp3', pages=['reading']),
    dict(term='detail', spanish='detalle; una característica pequeña', new=True, file='detail.mp3', pages=['reading']),
    dict(term='getting the hang of', spanish='estar aprendiendo a hacer algo con la práctica', new=True, file='getting-the-hang-of.mp3', pages=['reading']),
]

LISTENING_QUESTIONS = [
    dict(id='q1', question='Why does Laura talk to Mateo about his free time?', options={'A':'She wants to teach a music class.', 'B':'She is looking for a new hobby.', 'C':'She needs to buy a finished bracelet.'}, answer='B', explanation='Laura explains that she wants a new hobby before asking about Mateo’s interests.', evidence="I'm looking for a new hobby."),
    dict(id='q2', question='What kind of group does Mateo belong to?', options={'A':'A salsa dance group.', 'B':'A drawing group.', 'C':'A craft group.'}, answer='C', explanation='Music and drawing come up in the conversation, but Mateo belongs to a craft group.', evidence='I belong to a small craft group.'),
    dict(id='q3', question='In Laura’s words “listen to it at home,” what does “it” refer to?', options={'A':'Salsa music.', 'B':'An English lesson.', 'C':'A craft podcast.'}, answer='A', explanation='Laura mentions salsa immediately before using the object pronoun it.', evidence='I love salsa and listen to it at home.'),
    dict(id='q4', question='What can Laura already do?', options={'A':'Make bracelets.', 'B':'Draw.', 'C':'Teach jewelry making.'}, answer='B', explanation='Laura can draw, but making jewelry is a new skill for her.', evidence="I can draw, but I can't make jewelry."),
    dict(id='q5', question='When Mateo says “teach you to make them,” what does “them” refer to?', options={'A':'Notebooks.', 'B':'Tools.', 'C':'Bracelets.'}, answer='C', explanation='Them replaces the plural object bracelets in Mateo’s offer to help.', evidence='I can make bracelets, and I can teach you to make them.'),
    dict(id='q6', question='In “you can ask her for help,” who does “her” refer to?', options={'A':'Ana.', 'B':'Laura.', 'C':'A music teacher.'}, answer='A', explanation='Mateo names Ana as the group leader and then uses her to refer to Ana.', evidence='Ana. She is patient, and you can ask her for help.'),
    dict(id='q7', question='On which day does the group meet?', options={'A':'On Fridays.', 'B':'On Sundays.', 'C':'On Saturdays.'}, answer='C', explanation='Mateo gives Saturday as the regular meeting day.', evidence='On Saturdays, from ten until twelve.'),
    dict(id='q8', question='How long does each meeting last?', options={'A':'One hour.', 'B':'Two hours.', 'C':'Three hours.'}, answer='B', explanation='The meeting runs from ten until twelve, a period of two hours.', evidence='On Saturdays, from ten until twelve.'),
    dict(id='q9', question='How much do the materials cost in the story?', options={'A':'Five dollars.', 'B':'Ten dollars.', 'C':'Twelve dollars.'}, answer='A', explanation='Mateo states the price of the materials separately from the meeting time.', evidence='Materials cost five dollars.'),
    dict(id='q10', question='What will Laura find out at the meeting?', options={'A':'Which notebook she needs.', 'B':'Which project they can make together.', 'C':'Which day the group meets.'}, answer='B', explanation='Mateo leaves the project for Ana to explain. The reading reveals it.', evidence='Ana explains the project at the meeting.'),
]

READING_QUESTIONS = [
    dict(id='q1', question='What does Ana ask Laura and Mateo to make?', options={'A':'A necklace and a notebook.', 'B':'Two different drawing tools.', 'C':'A matching pair of bracelets.'}, answer='C', paragraph=1, explanation='Ana shows bracelets and asks them to make a matching pair.', evidence='She asks Laura and Mateo to make a matching pair.'),
    dict(id='q2', question='In “chooses it as their model,” what does “it” refer to?', options={'A':'The blue bracelet.', 'B':'The craft table.', 'C':'The notebook.'}, answer='A', paragraph=1, explanation='The blue one refers to a bracelet, and it replaces that same object.', evidence='Laura likes the blue one and chooses it as their model.'),
    dict(id='q3', question='In “arrange them in a simple pattern,” what does “them” refer to?', options={'A':'The group members.', 'B':'The beads.', 'C':'The tools.'}, answer='B', paragraph=2, explanation='They choose beads and then arrange those beads. Them replaces beads.', evidence='First, they choose beads and arrange them in a simple pattern.'),
    dict(id='q4', question='Who does Laura listen to carefully?', options={'A':'Ana.', 'B':'Another new member.', 'C':'A music teacher.'}, answer='A', paragraph=2, explanation='Ana shows them how to begin; her in the next sentence refers to Ana.', evidence='Ana gives them thread and shows them how to begin. Laura listens to her carefully.'),
    dict(id='q5', question='In “Laura asks him for help,” who does “him” refer to?', options={'A':'A new instructor.', 'B':'Another craft learner.', 'C':'Mateo.'}, answer='C', paragraph=2, explanation='Mateo can tie a knot, so Laura asks Mateo for help.', evidence='Mateo can tie a knot, so Laura asks him for help.'),
    dict(id='q6', question='Why does Ana cut the thread?', options={'A':'It is the wrong color.', 'B':'It is too long.', 'C':'It is already tied.'}, answer='B', paragraph=3, explanation='The text gives the length of the thread as the reason for cutting it.', evidence='When the thread is too long, Ana cuts it.'),
    dict(id='q7', question='Why does Laura write the steps in her notebook?', options={'A':'To change the group’s schedule.', 'B':'To record the price of the beads.', 'C':'To remember how to make the bracelets.'}, answer='C', paragraph=3, explanation='To remember them expresses the purpose; them refers to the steps.', evidence='Laura writes the steps in her notebook to remember them.'),
    dict(id='q8', question='How do Laura and Mateo use the tools?', options={'A':'They take turns.', 'B':'Only Mateo uses them.', 'C':'They wait for Ana to do all the work.'}, answer='A', paragraph=3, explanation='They share the tools by taking turns while working slowly.', evidence='They work slowly and take turns using the tools.'),
    dict(id='q9', question='What is true about their finished bracelets?', options={'A':'They are unfinished after two hours.', 'B':'Their colors match, but a detail is different.', 'C':'They use completely different colors.'}, answer='B', paragraph=4, explanation='The bracelets form a matching pair while keeping a different detail.', evidence='The colors match, but each bracelet has a different detail.'),
    dict(id='q10', question='What does “getting the hang of it” suggest about Laura?', options={'A':'She already knows every jewelry skill.', 'B':'She wants Ana to finish everything.', 'C':'She is learning the skill through practice.'}, answer='C', paragraph=4, explanation='The expression describes gradually learning how to do something new.', evidence='Making jewelry is new for her, but she is getting the hang of it.'),
]
