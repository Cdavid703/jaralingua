"""Activity 7: page 8, original homework writing prompt and word box."""
from preintermediate1_unit1_speaking_content import VOCABULARY as SPEAKING_VOCABULARY

INSTRUCTION = 'Write about your own personality. Use words from the box. Say as much as you can!'
WORDS = ['smart', 'friendly', 'rude', 'grumpy', 'creative', 'shy', 'silly', 'lazy', 'talkative']
VOCABULARY = [next(dict(v) for v in SPEAKING_VOCABULARY if v['term'] == word) for word in WORDS]
SELF_CHECK = [
    'I wrote about my own personality.',
    'I used personality adjectives that fit me.',
    'I checked I am / I’m and I am not / I’m not.',
    'I added a reason or an example.',
    'I checked capital letters and punctuation.',
]
STARTERS = ['I’m …', 'I’m not …', 'Sometimes I’m … because …', 'For example, …']
