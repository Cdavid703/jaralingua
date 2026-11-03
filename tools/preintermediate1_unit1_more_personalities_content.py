"""Original ESL Pals case study, pages 9–10. Spelling variants are intentional."""
from preintermediate1_unit1_speaking_content import VOCABULARY as PREVIOUS_VOCABULARY

INSTRUCTION = 'Read the text and complete the last table with describing words from the lesson.'
PROFILES = [
    dict(id='ingrid-ray', name='Ingrid and Ray', text='Ingrid and Ray like to sleep late. They don’t like to go to school. They never do their homework. The teachers don’t like them, because they are impolite.', words='lazy, rude', explanation='In this fictional worksheet, not doing homework supports lazy, and impolite supports rude. These are descriptions of the characters, not a rule for judging real students.', evidence='They never do their homework. The teachers don’t like them, because they are impolite.'),
    dict(id='janet', name='Janet', text='Janet is 45 years old. She is from South Africa. She is moody. People don’t like to work with Janet.', words='grumpy', explanation='The later Who is it? clue explicitly calls Janet grumpy. Moody can describe changing moods; grumpy describes someone who is irritable. They are related descriptions here, not exact synonyms.', evidence='She is moody. People don’t like to work with Janet.'),
    dict(id='you', name='You', text='You are intelligent. You are learning English. In class, you are outgoing!', words='smart, talkative', explanation='Intelligent supports smart. Outgoing means sociable and willing to meet people; talkative means speaking a lot. The later clue explicitly calls this character talkative. This fictional profile is not an assessment of you.', evidence='You are intelligent. You are learning English. In class, you are outgoing!'),
    dict(id='claire-ashley', name='Claire and Ashely', option='Claire and Ashley', text='Claire and Ahsley have a podcast. They are very artistic. They are kind and goofy! They like to make jokes and make people laugh.', words='creative, friendly, silly', explanation='Artistic supports creative, kind supports friendly, and goofy and making jokes support silly in this worksheet.', evidence='They are very artistic. They are kind and goofy! They like to make jokes and make people laugh.'),
    dict(id='lily', name='Lily', text='Lily is 6 years old. She is very kind and goofy. Lily likes to laugh and play games. She always smiles and people like to be friends with her.', words='friendly, silly', explanation='Kind, smiling and making friends support friendly. Goofy, laughing and playing support silly in this fictional description.', evidence='She is very kind and goofy. Lily likes to laugh and play games.'),
]
TRUE_FALSE = [
    dict(text='Ingrid and Ray are rude and lazy.', answer='T', profile='ingrid-ray', explanation='The worksheet connects impolite with rude, and never doing homework with lazy.', evidence='They never do their homework. The teachers don’t like them, because they are impolite.'),
    dict(text='Ingrid and Ray always do their homework.', answer='F', profile='ingrid-ray', explanation='The text says never, which contradicts always.', evidence='They never do their homework.'),
    dict(text='Janet is 30 years old.', answer='F', profile='janet', explanation='Janet is 45, not 30.', evidence='Janet is 45 years old.'),
    dict(text='Janet is from South Africa.', answer='T', profile='janet', explanation='Her country is stated directly.', evidence='She is from South Africa.'),
    dict(text='You are not outgoing.', answer='F', profile='you', explanation='The fictional You profile explicitly says outgoing. Answer from the reading, regardless of your own personality.', evidence='In class, you are outgoing!'),
    dict(text='You are smart.', answer='T', profile='you', explanation='Smart and intelligent have the same relevant meaning here. This statement refers to the fictional profile.', evidence='You are intelligent.'),
    dict(text='Claire and Ashley have a TV show.', answer='F', profile='claire-ashley', explanation='They have a podcast, not a TV show. Ashley has spelling variants in the original worksheet.', evidence='Claire and Ahsley have a podcast.'),
    dict(text='Claire and Ashley are rude and lazy.', answer='F', profile='claire-ashley', explanation='Their profile describes them as artistic, kind and goofy; rude and lazy do not fit this description.', evidence='They are very artistic. They are kind and goofy!'),
    dict(text='Lily is 10 years old.', answer='F', profile='lily', explanation='Lily is six, not ten.', evidence='Lily is 6 years old.'),
    dict(text='Lily is silly and friendly.', answer='T', profile='lily', explanation='Goofy and laughing support silly; kindness, smiles and friendships support friendly.', evidence='She always smiles and people like to be friends with her.'),
]
WHO = [
    dict(text='These people are impolite and lazy. They never do their homework!', answer='ingrid-ray', profile='ingrid-ray', explanation='The clue repeats the details about Ingrid and Ray’s homework and impolite behaviour.', evidence='They never do their homework. The teachers don’t like them, because they are impolite.'),
    dict(text='This person is young and silly. She likes to smile and play games!', answer='lily', profile='lily', explanation='Lily is six and her profile mentions games, smiles and being goofy.', evidence='Lily likes to laugh and play games. She always smiles and people like to be friends with her.'),
    dict(text='This person is smart and talkative. This person is learning English!', answer='you', profile='you', explanation='Learning English identifies the fictional You profile. Intelligent supports smart. The clue supplies talkative; outgoing in the profile means sociable, not necessarily speaking a lot.', evidence='You are intelligent. You are learning English. In class, you are outgoing!'),
    dict(text='These people are creative and funny! They have a podcast.', answer='claire-ashley', profile='claire-ashley', explanation='Claire and Ashley are the characters with a podcast, artistic interests and jokes.', evidence='Claire and Ahsley have a podcast. They are very artistic.'),
    dict(text='This person is 45 years old and she is grumpy.', answer='janet', profile='janet', explanation='The age identifies Janet. The clue calls her grumpy; her original profile says moody.', evidence='Janet is 45 years old. She is from South Africa. She is moody.'),
]
NEW_VOCABULARY = [
    ('impolite', 'descortés o maleducado; que trata a otros sin cortesía'),
    ('moody', 'de humor cambiante; puede pasar de un estado de ánimo a otro'),
    ('intelligent', 'inteligente; que comprende y aprende con facilidad'),
    ('outgoing', 'sociable y dispuesto a relacionarse con otros; no implica hablar mucho'),
    ('artistic', 'artístico; con interés o habilidad para las artes'),
    ('kind', 'amable y considerado con otras personas'),
    ('goofy', 'juguetón o cómicamente disparatado; aquí, alguien que hace reír'),
    ('podcast', 'programa de audio que se puede escuchar por internet'),
    ('sleep late', 'levantarse tarde; seguir durmiendo hasta una hora avanzada'),
    ('homework', 'tarea o deberes para realizar fuera de clase'),
    ('make jokes', 'hacer bromas o contar chistes'),
]
VOCABULARY = [dict(v) for v in PREVIOUS_VOCABULARY[:9]] + [
    dict(term=term, spanish=spanish, audio='/ingles/preintermedio-1/audio/unit1/' + ('lesson/outgoing.mp3' if term == 'outgoing' else 'more-personalities/' + term.replace(' ', '-') + '.mp3'))
    for term, spanish in NEW_VOCABULARY
]
