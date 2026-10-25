"""Approved Healthy Living listening followed by Laura's weekly class post."""
DIALOGUE = [
    ('Mateo', 'Hi, Laura. Class is over. How are you feeling today?'),
    ('Laura', "Tired and stressed. The bakery is busy this week, and I'm staying late three evenings."),
    ('Mateo', 'Is that your usual routine?'),
    ('Laura', "No. I usually finish at five and have breakfast at home. This week I'm skipping breakfast and eating lunch late."),
    ('Mateo', 'You should take a break. What makes the evenings difficult?'),
    ('Laura', 'I have a deadline for my English project, and I often check work messages while I study.'),
    ('Mateo', 'You could try making a short list before you start. I do that when I feel under pressure.'),
    ('Laura', 'How long does your lunch break last?'),
    ('Mateo', "Thirty minutes. I bring a packed lunch, so I don't need to buy food."),
    ('Laura', 'What do you do after work to wind down?'),
    ('Mateo', "I sometimes go for a short walk. You could join me, or prepare tomorrow's lunch at home."),
    ('Laura', "I like both ideas, but I can't change everything at once."),
    ('Mateo', "You shouldn't try to. Choose a few small changes."),
    ('Laura', "I'm going to make a plan tonight. On Friday, I can tell you how it's going."),
]

READING = [
    "I usually buy lunch near the bakery, but this week I'm bringing a packed lunch from home. I prepare it in the evening, so I have more time during my break.",
    'At twelve thirty, I meet Mateo near the school. We walk for ten minutes, then sit in the park. Our whole break lasts thirty minutes. When I feel under pressure, I take a break instead of checking work messages.',
    "My English project still has a deadline. Before studying, I write three tasks in my notebook and do one at a time. I'm trying to cut down on checking my phone.",
    "At home, I listen to quiet music to wind down. Next week, I'm going to keep the lunch plan and the short walks. I'm not going to change every habit at once.",
]

VOCAB = [
    dict(term='tired', spanish='cansado; con necesidad de descansar', existing='u3-word-tired', pages=['listening']),
    dict(term='stressed', spanish='estresado; que siente presión o preocupación', existing='u3-word-stressed', pages=['listening']),
    dict(term='routine', spanish='rutina; forma habitual de organizar el día', new=True, file='routine.mp3', pages=['listening']),
    dict(term='skipping breakfast', spanish='saltarse el desayuno; no desayunar', new=True, file='skipping-breakfast.mp3', pages=['listening']),
    dict(term='take a break', spanish='hacer una pausa en una actividad', existing='u3-word-take-break', pages=['listening', 'reading']),
    dict(term='a deadline', spanish='una fecha o un plazo límite para terminar algo', existing='u3-word-deadline', pages=['listening', 'reading']),
    dict(term='under pressure', spanish='bajo presión; con muchas exigencias', new=True, file='under-pressure.mp3', pages=['listening', 'reading']),
    dict(term='lunch break', spanish='pausa del trabajo para almorzar', new=True, file='lunch-break.mp3', pages=['listening']),
    dict(term='packed lunch', spanish='almuerzo preparado en casa para llevar', new=True, file='packed-lunch.mp3', pages=['listening', 'reading']),
    dict(term='wind down', spanish='relajarse gradualmente después de las actividades del día', existing='u3-wind-down', pages=['listening', 'reading']),
    dict(term='at once', spanish='al mismo tiempo; todo de una vez', new=True, file='at-once.mp3', pages=['listening', 'reading']),
    dict(term='prepare', spanish='preparar; dejar algo listo para usarlo', new=True, file='prepare.mp3', pages=['reading']),
    dict(term='whole', spanish='completo; aquí, toda la duración de la pausa', new=True, file='whole.mp3', pages=['reading']),
    dict(term='instead of', spanish='en vez de; en lugar de otra acción', new=True, file='instead-of.mp3', pages=['reading']),
    dict(term='tasks', spanish='tareas o acciones concretas por hacer', new=True, file='tasks.mp3', pages=['reading']),
    dict(term='one at a time', spanish='de una en una; una tarea antes de pasar a otra', new=True, file='one-at-a-time.mp3', pages=['reading']),
    dict(term='cut down on', spanish='reducir la frecuencia o cantidad de algo', existing='u3-cut-down', pages=['reading']),
    dict(term='habit', spanish='hábito; algo que se hace regularmente', new=True, file='habit.mp3', pages=['reading']),
]

LISTENING_QUESTIONS = [
    dict(id='q1', question='How does Laura say she feels?', options={'A':'Relaxed and ready for a holiday.', 'B':'Tired and stressed.', 'C':'Excited about a new job.'}, answer='B', explanation='Laura directly names tiredness and stress when Mateo asks how she feels.', evidence='Tired and stressed.'),
    dict(id='q2', question='How many evenings is Laura staying late this week?', options={'A':'One evening.', 'B':'Five evenings.', 'C':'Three evenings.'}, answer='C', explanation='Three evenings describes the temporary situation this week.', evidence="The bakery is busy this week, and I'm staying late three evenings."),
    dict(id='q3', question='What is Laura’s usual breakfast habit?', options={'A':'Have breakfast at home.', 'B':'Skip breakfast.', 'C':'Buy lunch with Mateo.'}, answer='A', explanation='Having breakfast at home is her normal habit. Skipping it is happening this week.', evidence='I usually finish at five and have breakfast at home.'),
    dict(id='q4', question='What change does Laura describe this week?', options={'A':'She is finishing work earlier.', 'B':'She is skipping breakfast and eating lunch late.', 'C':'She is studying only at the bakery.'}, answer='B', explanation='The present continuous describes these temporary changes, rather than her usual routine.', evidence="This week I'm skipping breakfast and eating lunch late."),
    dict(id='q5', question='What has a deadline?', options={'A':'Mateo’s craft project.', 'B':'Laura’s lunch order.', 'C':'Laura’s English project.'}, answer='C', explanation='Laura names her English project when explaining her difficult evenings.', evidence='I have a deadline for my English project'),
    dict(id='q6', question='What does Mateo suggest Laura could try before starting?', options={'A':'Making a short list.', 'B':'Checking every work message.', 'C':'Buying tomorrow’s lunch.'}, answer='A', explanation='Could try making introduces an option for organizing her tasks.', evidence='You could try making a short list before you start.'),
    dict(id='q7', question='How long does Mateo’s lunch break last?', options={'A':'Ten minutes.', 'B':'Fifteen minutes.', 'C':'Thirty minutes.'}, answer='C', explanation='Mateo answers the question about duration with thirty minutes.', evidence='Thirty minutes. I bring a packed lunch'),
    dict(id='q8', question='Why doesn’t Mateo need to buy food during his break?', options={'A':'He eats at the English school.', 'B':'He brings a packed lunch.', 'C':'Laura buys food for him.'}, answer='B', explanation='He brings food from home, so buying food is unnecessary.', evidence="I bring a packed lunch, so I don't need to buy food."),
    dict(id='q9', question='What does Mateo sometimes do after work to wind down?', options={'A':'Go for a short walk.', 'B':'Answer work messages.', 'C':'Finish Laura’s project.'}, answer='A', explanation='Mateo gives a short walk as one way he relaxes after work.', evidence='I sometimes go for a short walk.'),
    dict(id='q10', question='What is Laura going to do tonight?', options={'A':'Change every habit immediately.', 'B':'Make a plan.', 'C':'Join another English class.'}, answer='B', explanation='She states an intention to make a plan. The reading reveals her choices.', evidence="I'm going to make a plan tonight."),
]

READING_QUESTIONS = [
    dict(id='q1', question='What is Laura doing differently about lunch this week?', options={'A':'Buying it near the bakery every day.', 'B':'Asking Mateo to buy it.', 'C':'Bringing a packed lunch from home.'}, answer='C', paragraph=1, explanation='The post contrasts her usual purchase with the lunch she is bringing this week.', evidence="I usually buy lunch near the bakery, but this week I'm bringing a packed lunch from home."),
    dict(id='q2', question='Why does Laura prepare her lunch in the evening?', options={'A':'To have more time during her break.', 'B':'To finish her English project at work.', 'C':'To change Mateo’s work schedule.'}, answer='A', paragraph=1, explanation='Preparing it in advance leaves more time during the break.', evidence='I prepare it in the evening, so I have more time during my break.'),
    dict(id='q3', question='When and where does Laura meet Mateo?', options={'A':'At twelve, inside the bakery.', 'B':'At twelve thirty, near the school.', 'C':'At one thirty, inside the classroom.'}, answer='B', paragraph=2, explanation='The reading adds a specific meeting time and place.', evidence='At twelve thirty, I meet Mateo near the school.'),
    dict(id='q4', question='How long do they walk?', options={'A':'Ten minutes.', 'B':'Thirty minutes.', 'C':'Twelve minutes.'}, answer='A', paragraph=2, explanation='The walk lasts ten minutes; the whole break lasts thirty.', evidence='We walk for ten minutes, then sit in the park.'),
    dict(id='q5', question='What does Laura do when she feels under pressure?', options={'A':'She checks more work messages.', 'B':'She stops bringing lunch.', 'C':'She takes a break instead of checking messages.'}, answer='C', paragraph=2, explanation='When introduces a situation and her response to it.', evidence='When I feel under pressure, I take a break instead of checking work messages.'),
    dict(id='q6', question='How does Laura organize her English project tasks?', options={'A':'She asks Mateo to do all of them.', 'B':'She writes three tasks and does one at a time.', 'C':'She works on every task at once.'}, answer='B', paragraph=3, explanation='Her list contains three tasks, and she works through them individually.', evidence='Before studying, I write three tasks in my notebook and do one at a time.'),
    dict(id='q7', question='What is Laura trying to cut down on?', options={'A':'Preparing lunch at home.', 'B':'Walking with Mateo.', 'C':'Checking her phone.'}, answer='C', paragraph=3, explanation='Cut down on means reduce an activity; here the activity is checking her phone.', evidence="I'm trying to cut down on checking my phone."),
    dict(id='q8', question='What helps Laura wind down at home?', options={'A':'Listening to quiet music.', 'B':'Checking work messages.', 'C':'Writing longer task lists.'}, answer='A', paragraph=4, explanation='Laura adds quiet music as her way of relaxing at home.', evidence='At home, I listen to quiet music to wind down.'),
    dict(id='q9', question='What is Laura going to keep next week?', options={'A':'Late lunches and longer work evenings.', 'B':'The lunch plan and the short walks.', 'C':'Buying lunch and checking every message.'}, answer='B', paragraph=4, explanation='Going to expresses her intention to continue these two changes.', evidence="Next week, I'm going to keep the lunch plan and the short walks."),
    dict(id='q10', question='Which sentence best describes Laura’s approach?', options={'A':'She changes every habit on the same day.', 'B':'She waits for Mateo to make all her decisions.', 'C':'She chooses a few small changes.'}, answer='C', paragraph=4, explanation='Her negative intention shows that she is taking gradual steps, rather than changing everything immediately.', evidence="I'm not going to change every habit at once."),
]
