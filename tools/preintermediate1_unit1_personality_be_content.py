"""ESL Pals Describing Personality, pages 3–4, transcribed in source order."""
TABLE = [
    ('am', ['I'], [('i-am-creative', 'I am creative.')]),
    ('is', ['He', 'She', 'It'], [('he-is-grumpy', 'He is grumpy.'), ('she-is-silly', 'She is silly.'), ('it-is-lazy', 'It is lazy.')]),
    ('are', ['We', 'They', 'You'], [('we-are-friendly', 'We are friendly.'), ('they-are-neat', 'They are neat.'), ('you-are-talkative', 'You are talkative.')]),
]
GAPS = [
    ('The dog', 'friendly.', 'is', 'The dog is one animal: use is.'),
    ('Her husband', 'talkative.', 'is', 'Her husband refers to one person: use is.'),
    ('You', 'lazy.', 'are', 'You takes are.'),
    ('We', 'grumpy.', 'are', 'We takes are.'),
    ('The men', 'grumpy.', 'are', 'Men is the plural of man: use are.'),
    ('His daughter', 'creative.', 'is', 'His daughter refers to one person: use is.'),
    ('My friends', 'shy.', 'are', 'Friends is plural: use are.'),
    ('The class', 'very smart.', 'is', 'The class is treated as one group in this worksheet: use is.'),
    ('I', 'talkative.', 'am', 'I takes am.'),
    ('The ladies', 'rude.', 'are', 'Ladies is plural: use are.'),
]
FIXES = [
    ('He am a nice man. He always smiles.', 'He is a nice man. He always smiles.', 'He is a nice man.', 'He takes is, not am.'),
    ('They is friendly children.', 'They are friendly children.', 'They are friendly children.', 'They takes are, not is.'),
    ('We is creative - we love to paint!', 'We are creative - we love to paint!', 'We are creative.', 'We takes are, not is.'),
    ('He are very lazy. He doesn’t want to work!', 'He is very lazy. He doesn’t want to work!', 'He is very lazy.', 'He takes is, not are.'),
    ('Her grandmother am grumpy. She never greets me!', 'Her grandmother is grumpy. She never greets me!', 'Her grandmother is grumpy.', 'Her grandmother refers to one person: use is.'),
    ('The man are rude. He shouted at the waiter!', 'The man is rude. He shouted at the waiter!', 'The man is rude.', 'The man is singular: use is.'),
    ('My son am shy. He doesn’t like meeting new people.', 'My son is shy. He doesn’t like meeting new people.', 'My son is shy.', 'My son is singular: use is.'),
    ('He are very smart. He has the best grades in class!', 'He is very smart. He has the best grades in class!', 'He is very smart.', 'He takes is, not are.'),
    ('The children is silly. They always giggle and make jokes!', 'The children are silly. They always giggle and make jokes!', 'The children are silly.', 'Children is a plural noun: use are.'),
]
PERSONAL = [
    'My friends are friendly.',
    'I am creative.',
    'My family is very talkative.',
    'My partner is rude.',
    'I am shy.',
    'My colleagues / classmates are silly.',
    'My mother is grumpy.',
    'I am smart.',
    'My brother / sister is lazy',
]
