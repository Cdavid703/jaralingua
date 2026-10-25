"""Approved listening → reading story, with contextual pronunciation support."""
DIALOGUE = [
    ('Laura', 'Hi, I’m Laura. Is this your first English class here?'),
    ('Mateo', 'Yes. I’m Mateo Rios. Nice to meet you.'),
    ('Laura', 'Nice to meet you, too. How do you spell your last name? I want to write it on my class card.'),
    ('Mateo', 'R, I, O, S. What do you usually do during the week?'),
    ('Laura', 'I work in a bakery and study English in the evening. What about you?'),
    ('Mateo', 'I work in a small shop. I usually read after work. Do you like reading?'),
    ('Laura', 'Sometimes, but I prefer listening to music on weekdays. What do you enjoy doing on weekends?'),
    ('Mateo', 'I like cooking. I often make vegetable soup on Sundays. And you?'),
    ('Laura', 'I enjoy cooking, too. I make bread at home. We have something in common.'),
    ('Mateo', 'That helps break the ice. What does the teacher want us to do?'),
    ('Laura', 'Find two shared interests and choose one activity together. We have cooking, but we need another idea.'),
    ('Mateo', 'Let’s talk about our personalities first. What are you like?'),
    ('Laura', 'Good question. I have an example, and I want to hear yours.'),
    ('Mateo', 'Great. Then we can choose an activity that we both enjoy.'),
]

READING = [
    'After the conversation, Laura and Mateo finish their class cards. Laura describes her personality as talkative and creative. She likes sharing ideas and making bread. Mateo says he is quiet and patient. He listens carefully before speaking, and he does not interrupt other people.',
    'They notice a difference: Laura enjoys lively conversations, but Mateo prefers small groups. They take turns asking questions, so both have time to speak. Laura says she is organized because she prepares her bag every evening.',
    'Their second shared interest appears when Mateo talks about walking in the park on weekends. Laura enjoys that, too. They choose a short weekend walk as their activity. Cooking is still another interest they share.',
    'On their cards, they write two shared interests and one difference. Laura introduces Mateo to another classmate. They get along with each other because both listen and show respect.',
]

VOCAB = [
    dict(term='last name', spanish='apellido', new=True, file='last-name.mp3', pages=['listening']),
    dict(term='spell', spanish='deletrear: decir las letras de una palabra', new=True, file='spell.mp3', pages=['listening']),
    dict(term='bakery', spanish='panadería', new=True, file='bakery.mp3', pages=['listening']),
    dict(term='usually', spanish='normalmente; lo que sucede con frecuencia', new=True, file='usually.mp3', pages=['listening']),
    dict(term='prefer', spanish='preferir: gustar más una opción que otra', new=True, file='prefer.mp3', pages=['listening']),
    dict(term='weekdays', spanish='días de semana, de lunes a viernes', new=True, file='weekdays.mp3', pages=['listening']),
    dict(term='break the ice', spanish='romper el hielo; iniciar una interacción con menos tensión', existing='break-ice', pages=['listening']),
    dict(term='have something in common', spanish='tener algo en común, como un interés compartido', existing='common', pages=['listening']),
    dict(term='quiet', spanish='callado o de pocas palabras en este contexto', existing='quiet', pages=['reading']),
    dict(term='talkative', spanish='conversador; que habla bastante', existing='talkative', pages=['reading']),
    dict(term='patient', spanish='paciente; capaz de esperar con calma', existing='patient', pages=['reading']),
    dict(term='organized', spanish='organizado; que prepara y ordena sus cosas', existing='organized', pages=['reading']),
    dict(term='lively', spanish='animado; con energía', new=True, file='lively.mp3', pages=['reading']),
    dict(term='take turns', spanish='turnarse; hacer algo uno después del otro', new=True, file='take-turns.mp3', pages=['reading']),
    dict(term='interrupt', spanish='interrumpir a alguien mientras habla', new=True, file='interrupt.mp3', pages=['reading']),
    dict(term='shared interest', spanish='interés compartido por dos o más personas', new=True, file='shared-interest.mp3', pages=['reading']),
    dict(term='choose', spanish='elegir una opción', new=True, file='choose.mp3', pages=['reading']),
    dict(term='get along with', spanish='llevarse bien con alguien', existing='get-along', pages=['reading']),
    dict(term='respect', spanish='respeto; consideración por otra persona', new=True, file='respect.mp3', pages=['reading']),
]

LISTENING_QUESTIONS = [
    dict(id='q1', question='What is the main situation in the conversation?', options={'A':'Two colleagues organizing a work shift.', 'B':'Two new classmates getting to know each other.', 'C':'A teacher explaining the final exam.'}, answer='B', explanation='Laura and Mateo introduce themselves and talk about their lives before class.', evidence='Is this your first English class here?'),
    dict(id='q2', question='How does Mateo spell his last name?', options={'A':'R-I-O-S.', 'B':'R-O-I-S.', 'C':'R-I-S-O.'}, answer='A', explanation='Mateo gives the letters in the order R, I, O, S.', evidence='R, I, O, S.'),
    dict(id='q3', question='Where does Laura work?', options={'A':'In a small shop.', 'B':'In a music school.', 'C':'In a bakery.'}, answer='C', explanation='Laura mentions the bakery. The small shop is Mateo’s workplace.', evidence='I work in a bakery and study English in the evening.'),
    dict(id='q4', question='When does Laura study English?', options={'A':'Before work in the morning.', 'B':'In the evening.', 'C':'Only on Sundays.'}, answer='B', explanation='She states that she studies in the evening.', evidence='I work in a bakery and study English in the evening.'),
    dict(id='q5', question='What does Mateo usually do after work?', options={'A':'He makes bread.', 'B':'He listens to music.', 'C':'He reads.'}, answer='C', explanation='Reading is Mateo’s after-work routine. Music is Laura’s preference.', evidence='I usually read after work.'),
    dict(id='q6', question='What does Laura prefer doing on weekdays?', options={'A':'Listening to music.', 'B':'Reading every evening.', 'C':'Making vegetable soup.'}, answer='A', explanation='Laura contrasts reading with her preference for music on weekdays.', evidence='I prefer listening to music on weekdays.'),
    dict(id='q7', question='What does Mateo often cook on Sundays?', options={'A':'Bread.', 'B':'Pasta.', 'C':'Vegetable soup.'}, answer='C', explanation='Mateo names vegetable soup; Laura mentions making bread.', evidence='I often make vegetable soup on Sundays.'),
    dict(id='q8', question='Which interest do they discover that they share?', options={'A':'Working in the same shop.', 'B':'Cooking.', 'C':'Reading after work.'}, answer='B', explanation='Both say they enjoy cooking. Their jobs and after-work preferences differ.', evidence='I enjoy cooking, too. I make bread at home. We have something in common.'),
    dict(id='q9', question='What does the teacher ask them to do?', options={'A':'Find two shared interests and choose one activity.', 'B':'Find a new job together.', 'C':'Write the same daily routine on both cards.'}, answer='A', explanation='The task requires two interests and one activity, rather than identical routines.', evidence='Find two shared interests and choose one activity together.'),
    dict(id='q10', question='What do they decide to discuss next?', options={'A':'Their work schedules.', 'B':'Their personalities.', 'C':'Their favorite music groups.'}, answer='B', explanation='Mateo proposes discussing personality before choosing an activity. The reading continues from this point.', evidence='Let’s talk about our personalities first. What are you like?'),
]

READING_QUESTIONS = [
    dict(id='q1', question='What do Laura and Mateo finish after their conversation?', options={'A':'A recipe book.', 'B':'Their final exam.', 'C':'Their class cards.'}, answer='C', paragraph=1, explanation='The continuation begins with them finishing their class cards.', evidence='After the conversation, Laura and Mateo finish their class cards.'),
    dict(id='q2', question='How does Laura describe her personality?', options={'A':'Quiet and patient.', 'B':'Talkative and creative.', 'C':'Shy and unfriendly.'}, answer='B', paragraph=1, explanation='Laura describes herself as talkative and creative. Quiet and patient are Mateo’s own description.', evidence='Laura describes her personality as talkative and creative.'),
    dict(id='q3', question='Which behavior supports Mateo’s description of being patient?', options={'A':'He listens before speaking and does not interrupt.', 'B':'He always speaks before Laura.', 'C':'He prepares Laura’s bag.'}, answer='A', paragraph=1, explanation='The text gives listening without interruption as his behavior; it does not infer personality from a hobby.', evidence='He listens carefully before speaking, and he does not interrupt other people.'),
    dict(id='q4', question='Why does Laura say she is organized?', options={'A':'She likes walking in the park.', 'B':'She prefers small groups.', 'C':'She prepares her bag every evening.'}, answer='C', paragraph=2, explanation='Laura supports her adjective with a concrete routine.', evidence='Laura says she is organized because she prepares her bag every evening.'),
    dict(id='q5', question='What difference do they notice?', options={'A':'Laura enjoys lively conversations, while Mateo prefers small groups.', 'B':'Laura dislikes cooking, while Mateo enjoys it.', 'C':'Mateo likes speaking all the time, while Laura never speaks.'}, answer='A', paragraph=2, explanation='Their preferred conversation settings differ. Both can still ask questions and listen.', evidence='Laura enjoys lively conversations, but Mateo prefers small groups.'),
    dict(id='q6', question='Why do they take turns asking questions?', options={'A':'To finish without listening.', 'B':'So both have time to speak.', 'C':'To make their personalities identical.'}, answer='B', paragraph=2, explanation='Taking turns gives each person speaking time; it does not change their personalities.', evidence='They take turns asking questions, so both have time to speak.'),
    dict(id='q7', question='What second shared interest do they discover?', options={'A':'Walking in the park.', 'B':'Working in a bakery.', 'C':'Reading after work.'}, answer='A', paragraph=3, explanation='The reading adds walking as their second shared interest, beyond cooking.', evidence='Their second shared interest appears when Mateo talks about walking in the park on weekends.'),
    dict(id='q8', question='Which activity do they choose?', options={'A':'A large cooking competition.', 'B':'A weekday music class.', 'C':'A short weekend walk.'}, answer='C', paragraph=3, explanation='Their final choice is a short walk at the weekend.', evidence='They choose a short weekend walk as their activity.'),
    dict(id='q9', question='What do they write on their cards?', options={'A':'One shared interest and two jobs.', 'B':'Two shared interests and one difference.', 'C':'Two identical personalities.'}, answer='B', paragraph=4, explanation='Their cards show both similarities and a difference; the task does not require them to be identical.', evidence='On their cards, they write two shared interests and one difference.'),
    dict(id='q10', question='What helps Laura and Mateo get along?', options={'A':'Having exactly the same routine.', 'B':'Never asking each other questions.', 'C':'Listening and showing respect.'}, answer='C', paragraph=4, explanation='The final sentence gives listening and respect as the reason they get along.', evidence='They get along with each other because both listen and show respect.'),
]

ACTIVITIES = [
    ('A New Classmate', 'Listening', 'Part 1 · two voices · 10 questions'),
    ('Something in Common', 'Reading', 'Part 2 · a new decision · 10 questions'),
    ('Ask and Connect', 'Contextual practice', '15 questions about be, do/does, preferences and follow-up questions.'),
    ('Making Friends Pronunciation', 'Pronunciation', 'Six sections and a final speaking challenge.'),
    ('Personality and Preferences Survey', 'Survey', 'Describe yourself with examples and learn about a classmate.'),
    ('Meet Alex', 'Conversation Coach', 'An eight-turn conversation with connected questions and responses.'),
    ('Meet My Classmate', 'Speaking', 'Interview a classmate and introduce them to others.'),
    ('My Personality Journal', 'Writing', 'Describe your personality, preferences and ideal activity partner.'),
]
