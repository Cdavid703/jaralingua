"""Unit 1 Practice Lab content from the approved 64-hour course plan.

The reading is the exact 157-word text preserved in the teacher's plan.
Only activity 01 is built in this first increment.
"""
READING = [
    'It is the first day of a new English course. Laura arrives a few minutes early and sits near Mateo. “Hi, I’m Laura. What’s your name?” she asks. Mateo introduces himself and spells his last name because Laura wants to write it correctly on her class card.',
    'They talk about their routines. Laura works in a bakery and studies English in the evening. Mateo works in a small shop. He usually reads after work, but Laura prefers listening to music. On weekends, they both like walking in the park.',
    'Their teacher asks everyone to find two shared interests. Laura and Mateo also like cooking, so they write that on their cards. They do not have the same daily routine, but they have something in common.',
    'Before class begins, Laura asks, “What do you usually cook?” Mateo gives an example and asks, “What about you?” Their first conversation is short, but both students ask questions and listen carefully.',
]

ACTIVITIES = [
    ('First Connections Reading', 'Reading', '157 words · 8 questions · about 15 minutes'),
    ('Ask and Connect', 'Contextual practice', '15 questions about be, do/does, preferences and follow-up questions.'),
    ('Making Friends Pronunciation', 'Pronunciation', 'Six sections and a final speaking challenge.'),
    ('A Second Conversation', 'Listening', 'Laura and Mateo continue their conversation.'),
    ('Personality and Preferences Survey', 'Survey', 'Describe yourself with examples and learn about a classmate.'),
    ('Meet Alex', 'Conversation Coach', 'An eight-turn conversation with connected questions and responses.'),
    ('Meet My Classmate', 'Speaking', 'Interview a classmate and introduce them to others.'),
    ('My Personality Journal', 'Writing', 'Describe your personality, preferences and ideal activity partner.'),
]

SUPPORT = [
    ('Names', 'last name', 'family name', 'spell'),
    ('Daily life', 'routine', 'what you usually do', 'routine'),
    ('Frequency', 'usually', 'on most days or occasions', 'frequency'),
    ('Preferences', 'prefer', 'like one thing more than another', 'difference'),
    ('Similarities', 'both', 'the two people together', 'both'),
    ('Expression', 'have something in common', 'share an interest or another feature', 'common-example'),
]

QUESTIONS = [
    dict(id='q1', question='What is the story mainly about?',
         options={'A': 'A teacher explaining the final English exam.', 'B': 'Two new classmates getting to know each other.', 'C': 'Two friends choosing a new place to work.'},
         answer='B', paragraph=1,
         explanation='The story follows a first conversation about names, routines and shared interests. It is not about an exam or changing jobs.',
         evidence='It is the first day of a new English course.'),
    dict(id='q2', question='Why does Mateo spell his last name?',
         options={'A': 'Laura wants to write it correctly on her class card.', 'B': 'He wants to explain the history of his family name.', 'C': 'His teacher asks him to read every name in the class.'},
         answer='A', paragraph=1,
         explanation='The text gives a practical reason for spelling: Laura wants to write his name correctly. It gives no information about the name’s history.',
         evidence='Mateo introduces himself and spells his last name because Laura wants to write it correctly on her class card.'),
    dict(id='q3', question='When does Laura study English?',
         options={'A': 'Before work in the morning.', 'B': 'Only on Sundays.', 'C': 'In the evening.'},
         answer='C', paragraph=2,
         explanation='Evening is the time stated in the story. The text does not say that she studies only on Sundays.',
         evidence='Laura works in a bakery and studies English in the evening.'),
    dict(id='q4', question='What does Mateo usually do after work?',
         options={'A': 'He listens to music.', 'B': 'He reads.', 'C': 'He takes a walk in the park every day.'},
         answer='B', paragraph=2,
         explanation='He refers to Mateo in this sentence. Listening to music is Laura’s preference; walking in the park is a shared weekend interest.',
         evidence='He usually reads after work, but Laura prefers listening to music.'),
    dict(id='q5', question='What does Laura prefer doing after work?',
         options={'A': 'Reading, like Mateo.', 'B': 'Working in the small shop.', 'C': 'Listening to music.'},
         answer='C', paragraph=2,
         explanation='But contrasts their preferences: Mateo reads, while Laura prefers listening to music. The small shop is Mateo’s workplace.',
         evidence='He usually reads after work, but Laura prefers listening to music.'),
    dict(id='q6', question='Which two interests do Laura and Mateo share?',
         options={'A': 'Cooking and walking in the park.', 'B': 'Reading and listening to music.', 'C': 'Working in a bakery and studying in the morning.'},
         answer='A', paragraph=3,
         explanation='Paragraph 2 gives walking in the park as a shared interest. Paragraph 3 adds cooking. Their after-work preferences are different.',
         evidence='Laura and Mateo also like cooking, so they write that on their cards.'),
    dict(id='q7', question='What does “have something in common” mean here?',
         options={'A': 'Have the same job and daily routine.', 'B': 'Share some interests, even with different routines.', 'C': 'Dislike the same people in their class.'},
         answer='B', paragraph=3,
         explanation='They share cooking and walking. Having something in common does not mean that every part of their lives is the same.',
         evidence='They do not have the same daily routine, but they have something in common.'),
    dict(id='q8', question='What can we reasonably infer from their conversation?',
         options={'A': 'Both students are interested in learning about each other.', 'B': 'Their jobs and daily routines are identical.', 'C': 'Mateo’s preference for reading proves that he is shy.'},
         answer='A', paragraph=4,
         explanation='Their questions and careful listening support an interest in each other. Different routines are stated directly, and a reading preference does not prove a personality trait.',
         evidence='Their first conversation is short, but both students ask questions and listen carefully.'),
]
