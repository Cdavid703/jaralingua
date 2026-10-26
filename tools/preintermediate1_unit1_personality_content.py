"""Transcription and teaching feedback for ESL Pals 22, pages 1–2 only."""
WORDS = ['smart', 'friendly', 'rude', 'grumpy', 'creative', 'shy', 'silly', 'lazy', 'talkative']
MATCHES = [
    ('impolite', 'rude', 'Rude means impolite: showing little respect for other people.'),
    ('intelligent', 'smart', 'Smart means intelligent: able to understand and learn things.'),
    ('artistic', 'creative', 'Creative describes someone who has original ideas; artistic is the related word in this worksheet.'),
    ('goofy', 'silly', 'Silly can mean goofy: playful or funny in a slightly foolish way.'),
    ('kind', 'friendly', 'Friendly describes a kind, welcoming way of treating people.'),
    ('outgoing', 'talkative', 'Talkative is the worksheet match for outgoing. Talkative means speaking a lot; outgoing means sociable. They are related, but not identical.'),
    ('moody', 'grumpy', 'Grumpy is the worksheet match for moody. Grumpy means easily annoyed or bad-tempered; moody can describe changing moods.'),
    ('reserved', 'shy', 'Shy is the worksheet match for reserved. Shy can mean nervous around people; reserved can also mean choosing not to share much.'),
    ('inactive', 'lazy', 'Lazy is the worksheet match for inactive. Lazy means unwilling to make an effort; being inactive does not always mean someone is lazy.'),
]
# Picture order follows the numbered grid on the original PDF, not PDF object order.
# The PDF has no answer key. Accept plausible readings of the ambiguous cartoons.
PICTURES = [
    ('A green frog sitting with crossed arms and a downturned mouth.', 'grumpy', ['grumpy'], 'The crossed arms and downturned mouth suggest grumpy in this cartoon.'),
    ('A child sticking out their tongue with both hands beside their head.', 'silly', ['silly', 'rude'], 'Silly fits the playful face. Rude is also possible if you interpret the gesture as insulting.'),
    ('A white rabbit holding a paintbrush and an artist’s palette.', 'creative', ['creative'], 'The rabbit is painting: an example of a creative activity.'),
    ('A child looking down, wearing a scarf, with hands in pockets.', 'shy', ['shy'], 'The lowered gaze and inward pose are the worksheet’s visual cues for shy.'),
    ('A cartoon fly reclining in an armchair with its hands behind its head.', 'lazy', ['lazy'], 'The reclining fly suggests lazy in this cartoon. Resting alone does not tell us someone’s personality.'),
    ('A yellow face with a large smile.', 'friendly', ['friendly'], 'The welcoming smile suggests friendly.'),
    ('A cat wearing glasses and a tie, raising one finger.', 'smart', ['smart'], 'The raised finger suggests that the cat has an answer: smart is the intended visual association. Glasses alone do not show intelligence.'),
    ('A person speaking through a red megaphone.', 'talkative', ['talkative'], 'Speaking through a megaphone is the worksheet’s visual cue for talkative.'),
    ('A green face with sharply lowered eyebrows and an open mouth showing teeth.', 'rude', ['rude', 'grumpy'], 'Rude fits an unfriendly or hostile expression. Grumpy is also a reasonable reading of the angry face.'),
]
PLAN = [
    ('Personality Vocabulary', 'Vocabulary'),
    ('Describing Personality with Be', 'Grammar'),
    ('Case Study: Meet the Characters', 'Reading'),
    ('Describing People', 'Writing'),
    ('Describing Pictures', 'Visual Vocabulary'),
    ('Let’s Talk About Personality', 'Speaking'),
    ('My Personality', 'Writing'),
    ('Case Study: More Personalities', 'Reading Extension'),
]
