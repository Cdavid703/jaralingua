"""Childhood Memories: explanations and complete fictional catalog-voice models."""
from html import escape

AUDIO = '/ingles/preintermedio-1/audio/unit5/lesson/'
audios = {}
topics = []


def say(key, text, voice='Narrator'):
    key = 'u5-' + key
    item = dict(text=text, voice=voice, path=AUDIO+key+'.mp3')
    assert key not in audios or audios[key] == item
    audios[key] = item
    return f'<button type="button" class="pi-say" data-audio="{key}" aria-label="Listen: {escape(text, quote=True)}">{escape(text)}<span aria-hidden="true"> ♪</span></button>'


def card(title, body):
    return f'<article class="basic2-info-card pi-card"><h4>{title}</h4>{body}</article>'


def grid(*parts):
    return '<div class="pi-grid">'+''.join(parts)+'</div>'


def note(text):
    return '<p class="pi-note">'+text+'</p>'


def ex(key, text, why='', voice='Narrator'):
    return '<p class="pi-example">'+say(key, text, voice)+'</p>'+('<p class="pi-small">'+why+'</p>' if why else '')


def topic(group, id, title, goal, body):
    topics.append(dict(group=group, id=id, title=title, goal=goal, body=body))


def vocab(items):
    return grid(*(card(say('word-'+key, word), '<p>'+meaning+'</p>') for key, word, meaning in items))


topic(1, 'memory-vocabulary', 'Childhood and memory words',
      'Understand words for life stages, people, places and memories.',
      vocab([('childhood', 'childhood', 'The period of someone’s life when they are a child.'),
             ('teenager', 'a teenager', 'A person aged thirteen to nineteen.'),
             ('adult', 'an adult', 'A grown person, contrasted here with a child.'),
             ('memory', 'a memory', 'Something a person remembers from the past.'),
             ('classmate', 'a classmate', 'Someone in the same class.'),
             ('neighbourhood', 'a neighbourhood', 'An area of a town or city where people live.'),
             ('primary-school', 'primary school', 'A school for children in the early years of formal education.'),
             ('grandparents', 'grandparents', 'The parents of someone’s parent.')])+
      grid(card('A memory has a context', ex('memory-context', 'One of my favourite childhood memories is a family lunch.')+
                '<p><b>One of my favourite memories</b> identifies a particular memory. <b>Childhood</b> places it in a period of life.</p>'),
           card('Remember and memory', '<p><b>Remember</b> is a verb: “I remember my first school.”</p><p><b>A memory</b> is a noun: “That is a happy memory.”</p><p>A memory description can concern family, friends, school or a fictional character.</p>')))

topic(1, 'was-were', 'Past descriptions with was and were',
      'Recognise past states and descriptions and understand the fixed expression be born.',
      grid(card('Past forms of be', ex('was-were', 'I was quiet at school. My classmates were friendly.')+
                '<p><b>I/he/she/it was</b><br><b>you/we/they were</b></p><p>Was and were connect a subject to a past description, location or state.</p>'),
           card('Negatives and questions', ex('be-question', 'Were you shy at school? Yes, I was.')+
                '<p>I <b>wasn’t</b> very talkative. My friends <b>weren’t</b> quiet.</p><p><b>Was she</b> in the school band?<br>Yes, she was. / No, she wasn’t.</p><p>Be forms its own questions; there is no did here.</p>'),
           card('Where were you born?', ex('born-question', 'Where were you born?')+ex('born-answer', 'I was born in Medellín in nineteen ninety-five.')+
                '<p><b>Be born</b> is the expression: “She was born in Colombia.” Avoid “I born” and “Where did you born?”</p>'))+
      note('“I was shy at school” describes a past state. It does not, by itself, explain why someone felt that way or establish their personality now.'))

past_verbs = [('live', 'lived'), ('move', 'moved'), ('play', 'played'), ('visit', 'visited'),
              ('study', 'studied'), ('go', 'went'), ('have', 'had'), ('meet', 'met')]
topic(1, 'past-actions', 'Completed actions in the past',
      'Recognise regular and irregular past forms in a completed event or period.',
      '<p>The past simple connects an action to a finished time or a clearly established past context.</p>'+
      grid(*(card(base+' → '+past, ex('verb-'+base, 'I live here. I lived there.' if base == 'live' else base+'. '+past+'.')) for base, past in past_verbs))+
      grid(card('A completed period', ex('lived', 'I lived in Bello until I was ten years old.')+
                '<p><b>Until</b> marks the end of that period. <b>Was ten</b> expresses the age within the past context.</p>'),
           card('An event', ex('moved', 'I moved to Envigado in two thousand and five.')+
                '<p><b>Moved</b> is a completed action. <b>In 2005</b> locates the event.</p>'),
           card('Regular endings in speech', ex('regular-endings', 'Played. Lived. Visited.')+
                '<p>Regular -ed does not always add a syllable. <b>Played</b> and <b>lived</b> end in /d/; <b>visited</b> has an extra /ɪd/ syllable.</p>'))+
      note('A past-simple statement can also describe repeated actions in a finished period: “We visited our uncle every Sunday when I was a child.” A repeated meaning is not exclusive to used to.'))

topic(1, 'past-questions-time', 'Past questions, negatives and time',
      'Understand did + base verb and distinguish dates, ages and periods of time.',
      grid(card('Questions with action verbs', ex('did-question', 'When did you move to Envigado?')+
                '<p><b>Did + subject + base verb?</b><br>Did you play in the school band?<br>Yes, I did. / No, I didn’t.</p><p>Use <b>move</b> after did, not moved.</p>'),
           card('A negative action', ex('past-negative', 'I didn’t live near my school.')+
                '<p><b>didn’t + base verb</b><br>She didn’t go, not “She didn’t went”.</p>'),
           card('Dates and ages', ex('age', 'When I was ten, I moved to a different neighbourhood.')+
                '<p><b>In 2005:</b> a year.<br><b>At the age of ten / when I was ten:</b> an age.<br><b>Two years ago:</b> two years before now.<br><b>Until I was ten:</b> the end of a period.</p>'))+
      '<p>A complete fictional timeline for Mateo:</p><div class="pi-process"><div><b>1995</b><p>Born in Medellín.</p></div><span aria-hidden="true">→</span><div><b>2005</b><p>Moved from Bello to Envigado.</p></div><span aria-hidden="true">→</span><div><b>2013</b><p>Finished school.</p></div><span aria-hidden="true">→</span><div><b>Now</b><p>Lives in Envigado.</p></div></div>'+
      note('Compare <b>Were you…?</b> with <b>Did you live…?</b> The main verb determines the question pattern. The timeline is a completed example, not a personal-history task.'))

topic(2, 'used-to-meaning', 'Past habits and states with used to',
      'Understand used to + base verb for a past habit or state contrasted with the present.',
      grid(card('A repeated action', ex('used-to-action', 'We used to visit my uncle every Sunday.')+
                '<p>The visits happened regularly in an earlier period. Used to commonly presents that habit as different from the present.</p>'),
           card('A past state', ex('used-to-state', 'I used to live in Bello, but now I live in Envigado.')+
                '<p><b>Live</b> describes a past situation. The second clause makes the present contrast explicit.</p>'),
           card('One form for every subject', ex('used-to-form', 'I used to play outside. She used to play outside.')+
                '<p><b>subject + used to + base verb</b><br>They used to be neighbours.</p><p>The affirmative form used to does not change with the subject.</p>'))+
      note('Correct: <b>She used to play.</b> Avoid “She used to played” and “She used to playing”. In connected speech, used to often sounds like /ˈjuːstə/; the audio models show it inside complete sentences.'))

topic(2, 'used-to-questions', 'Questions and negatives with used to',
      'Recognise the base spelling use to after did and didn’t.',
      grid(card('A question', ex('used-to-question', 'Did you use to play in the school band?')+
                '<p><b>Did + subject + use to + base verb?</b><br>What games did you use to play?</p><p>The past marking is already carried by <b>did</b>.</p>'),
           card('A negative', ex('used-to-negative', 'I didn’t use to enjoy speaking in front of a group.')+
                '<p><b>subject + didn’t + use to + base verb</b></p><p>This describes the absence of a habit or state in that past period.</p>'),
           card('Short answers', ex('used-to-short', 'Did she use to live near you? Yes, she did. No, she didn’t.')+
                '<p>Use <b>did/didn’t</b> in the short answer. The subject follows the person being discussed.</p>'))+
      '<div class="pi-compare"><div><b>Affirmative</b><p>She <b>used to live</b> here.</p></div><div><b>Question</b><p><b>Did</b> she <b>use to live</b> here?</p></div><div><b>Negative</b><p>She <b>didn’t use to live</b> here.</p></div></div>'+
      note('The standard written forms taught here are <b>did you use to</b> and <b>didn’t use to</b>. Avoid adding an -s to use or the main verb.'))

topic(2, 'habit-or-event', 'A past habit or one completed event?',
      'Distinguish an earlier habit from a single event without treating the past simple as limited to one-off actions.',
      grid(card('A past habit', ex('habit', 'I used to play football after school.')+
                '<p>A regular activity in an earlier period. The statement commonly implies a change.</p>'),
           card('One event', ex('one-event', 'I played football with my cousins last Saturday.')+
                '<p>One completed occasion. Used to does not describe this single event.</p>'))+
      grid(card('The past simple can also express repetition', ex('repeated-past', 'When I was a child, I visited my uncle every Sunday.')+
                '<p>The time phrase and <b>every Sunday</b> make the repeated past meaning clear.</p>'),
           card('A useful choice of emphasis', '<p><b>We used to visit him every Sunday.</b><br>Highlights an earlier habit, commonly contrasted with now.</p><p><b>We visited him every Sunday that summer.</b><br>Reports repetition within a finished period.</p>'))+
      note('A past description alone does not explain the cause of a change. A clear then-and-now account supplies the current situation rather than asking the reader to guess it.'))

topic(2, 'then-now', 'Connecting then and now',
      'Understand how but, now and still connect an earlier situation with the present.',
      grid(card('An explicit change', ex('then-now', 'I used to have short hair, but now I have long hair.')+
                '<p><b>Used to have</b> describes the earlier state. <b>Now I have</b> states the current one.</p><p>Use <b>have long hair</b>, not “take it long”.</p>'),
           card('A habit that continues', ex('still', 'I played football as a child, and I still play it now.')+
                '<p><b>Still</b> shows that the activity continues. This example states continuity directly.</p>'),
           card('Then and now refer to different times', '<p><b>Then:</b> I lived near my grandparents.<br><b>Now:</b> I live in a different neighbourhood.</p><p>The present simple describes the current situation. <b>But</b> introduces a contrast; <b>and</b> can add a continuing feature.</p>'))+
      note('The used to construction in this unit concerns the past. Present habits use expressions such as <b>usually</b>: “I usually read after work.”'))

topic(3, 'appearance', 'Describing appearance over time',
      'Recognise be and have in descriptions of height and hair at two different times.',
      vocab([('short-hair', 'short hair', 'Hair with little length; hair is uncountable in this general use.'),
             ('long-hair', 'long hair', 'Hair with greater length.'),
             ('curly-hair', 'curly hair', 'Hair with curls.'),
             ('straight-hair', 'straight hair', 'Hair without curls in the description.'),
             ('tall', 'tall', 'Having a greater height in the comparison.'),
             ('short', 'short', 'Having a smaller height in the comparison.')])+
      grid(card('Be + adjective', ex('height', 'I was short when I was a child. I’m taller now.')+
                '<p><b>Was / am</b> connect the person to a height description.</p>'),
           card('Have + hair description', ex('hair', 'She had short hair then. She has long hair now.')+
                '<p><b>Had</b> describes the past; <b>has</b> describes the present.</p><p>Also possible: “Her hair was short then.”</p>'))+
      note('A photograph can show features such as hair length in that picture. It does not establish someone’s habits, personality or life story. The comparisons here describe fictional profiles with stated information.'))

topic(3, 'personality-context', 'Personality with stated context',
      'Understand descriptions of personality as a person’s own account in a particular situation.',
      vocab([('shy', 'shy', 'Sometimes uncomfortable when meeting or speaking to people.'),
             ('outgoing', 'outgoing', 'Comfortable meeting and talking to people.'),
             ('patient', 'patient', 'Able to wait or help without becoming annoyed quickly.'),
             ('polite', 'polite', 'Showing consideration for others in words and behaviour.'),
             ('impolite', 'impolite', 'Not showing expected consideration in a situation.')])+
      grid(card('A self-description', ex('personality', 'I used to be shy in class, but now I feel more confident speaking in small groups.')+
                '<p>The speaker identifies the situation: <b>in class</b> and <b>in small groups</b>. This is a stated personal account.</p>'),
           card('A description with an example', ex('polite', 'I try to be more polite now. I listen and let other people finish speaking.')+
                '<p>The second sentence illustrates the description with a behaviour.</p>'))+
      note('An appearance change does not prove an attitude change. A quieter child does not automatically become an outgoing adult. The examples report information supplied by the fictional speaker.'))

topic(3, 'comparatives', 'Comparatives for then and now',
      'Recognise comparative forms and understand what is being compared.',
      grid(card('Short adjective + -er', ex('longer', 'My hair is longer now than it was two years ago.')+
                '<p>Long → <b>longer</b>.<br>Short → <b>shorter</b>.<br>Tall → <b>taller</b>.</p><p><b>Than</b> introduces the other side of the comparison.</p>'),
           card('More + longer adjective', ex('more-outgoing', 'I’m more outgoing now than I was at school.')+
                '<p>More outgoing · more patient · more confident.</p><p>Use <b>more outgoing</b>, not “outgoinger”.</p>'),
           card('Spelling and irregular forms', ex('happier', 'I feel happier in small groups now.')+
                '<p>Happy → <b>happier</b>.<br>Good → <b>better</b>.<br>Bad → <b>worse</b>.</p><p>The form depends on the adjective; not every adjective takes more.</p>'))+
      '<div class="pi-compare"><div><b>Correct</b><p>Longer than.<br>More patient than.<br>Better than.</p></div><div><b>Common corrections</b><p>“More longer” → <b>longer</b>.<br>“More better” → <b>better</b>.<br>“Longer that” → <b>longer than</b>.</p></div></div>'+
      note('A comparison can concern the same person at different times. “More outgoing now” is a comparison, not proof of why a person changed. These forms apply familiar comparison language to the unit topic.'))

topic(3, 'explained-profile', 'A complete then-and-now profile',
      'Notice how a stated profile combines past states, habits and a present comparison.',
      '<p>Mateo’s fictional profile supplies all the information used in this comparison.</p><div class="pi-compare"><div><p class="pi-label">Then</p><p>He lived in Bello.<br>He had short hair.<br>He played outside after school.<br>He described himself as quiet in class.</p></div><div><p class="pi-label">Now</p><p>He lives in Envigado.<br>His hair is longer.<br>He enjoys reading and walking.<br>He says he feels more confident in small groups.</p></div></div>'+
      ex('profile', 'I used to live in Bello, but now I live in Envigado. I had short hair at school. My hair is longer now. I used to play outside after school. These days, I enjoy reading and walking. I still enjoy spending time with my friends.')+
      note('<b>Used to live</b> presents a past state; <b>had</b> reports an earlier feature; <b>longer</b> compares two times; <b>still</b> identifies continuity. The account includes both changes and something that continues.'))

topic(4, 'story-structure', 'How a short memory is organised',
      'Recognise the context, event sequence and ending of a short past narrative.',
      '<div class="pi-process"><div><b>Context</b><p>When, where and who.</p></div><span aria-hidden="true">→</span><div><b>Events</b><p>What happened, in order.</p></div><span aria-hidden="true">→</span><div><b>Ending</b><p>What happened last and why the memory matters to the speaker.</p></div></div>'+
      grid(card('An opening', ex('story-opening', 'When I was eight, I visited my uncle with my family.')+
                '<p><b>When I was eight</b> establishes a past time. The rest identifies the action and people.</p>'),
           card('A sequence', ex('story-sequence', 'First, we prepared lunch. Then, we played cards. After that, we looked at old photos.')+
                '<p><b>First, then, after that, finally</b> organise events. Past verbs show that the actions belong to the past context.</p>'),
           card('An ending and a reason', ex('story-ending', 'Finally, we went home. I remember that day because we had time to talk.')+
                '<p><b>Went</b> closes the sequence. <b>I remember</b> is present because it describes remembering now.</p>'))+
      note('Used to can establish the background habit. The past simple can then describe one particular occasion. Not every sentence in a memory needs used to.'))

dialogue = [
    ('Laura', 'Hi, Mateo. Where were you born?'),
    ('Mateo', 'I was born in Medellín, but I grew up in Bello.'),
    ('Laura', 'When did you move to Envigado?'),
    ('Mateo', 'In two thousand and five, when I was ten.'),
    ('Laura', 'What did you use to do after school?'),
    ('Mateo', 'I used to play outside with my friends. We often visited my grandparents too.'),
    ('Laura', 'Do you still enjoy spending time with your friends?'),
    ('Mateo', 'Yes, I do. We live in different places now, but we still get together.')
]
dialogue_html = '<div class="pi-dialogue">'+''.join('<article class="pi-dialogue-line"><span class="pi-label">'+role+'</span>'+say('dialogue-'+str(i), text, role)+'</article>' for i, (role, text) in enumerate(dialogue, 1))+'</div>'
memory = 'When I was a child, I lived with my parents and my grandmother. We used to visit my uncle every Sunday. One Sunday, we took the bus and arrived a little late. My uncle welcomed us, and we helped him prepare lunch. After lunch, we played cards and looked at old photographs. Finally, we went home together. I remember that day because everyone had time to talk and laugh.'
school = 'When I was thirteen, I was in the school band. One afternoon, we played at a small school event. I forgot part of the song, but my friend helped me. We finished together, and the audience clapped. I felt nervous at first, but I was happy at the end. It is a memory that makes me smile now.'
topic(4, 'complete-models', 'Complete explained memory models',
      'Notice how a conversation and two complete narratives connect the unit language.',
      '<p>The characters and memories are fictional worked examples. Speaker names identify the dialogue turns and are not spoken in the audio.</p><button type="button" class="btn btn-primary pi-button" data-playlist="'+','.join('u5-dialogue-'+str(i) for i in range(1, len(dialogue)+1))+'">Listen to the conversation</button>'+dialogue_html+
      grid(card('A family memory', ex('family-model', memory)),
           card('How the family memory works', '<ol><li><b>When I was a child</b> introduces the past context.</li><li><b>We used to visit</b> establishes a repeated habit.</li><li><b>One Sunday</b> introduces one occasion.</li><li><b>Took, arrived, helped, played, looked, went</b> narrate completed actions.</li><li><b>I remember… because</b> explains the present meaning of that memory.</li></ol>'),
           card('A school memory', ex('school-model', school)))+
      note('In the school model, <b>was</b> describes the past situation; <b>played, forgot, helped, finished, clapped</b> narrate events; <b>felt</b> describes a past feeling. <b>It is a memory</b> returns to the speaker’s present view.'))

expressions = [
    ('grow-up', 'Phrasal verb', 'grow up', 'crecer o pasar la infancia', 'Develop from a child into an adult; with a place, describe where someone spent childhood.', 'Everyday, neutral. Past form: grew up. Grow up in a place.', 'I grew up in Bello, near my grandparents.'),
    ('look-back', 'Phrasal verb', 'look back on', 'recordar o reflexionar sobre una etapa pasada', 'Think about something that happened in the past.', 'Everyday, neutral. Keep on before the period or experience.', 'I look back on my school days with a smile.'),
    ('bring-back', 'Phrasal verb', 'bring back', 'hacer que vuelvan recuerdos', 'Make someone remember a past feeling or experience; here, bring back memories.', 'Everyday, neutral in this use. Bring back happy memories / bring happy memories back; with a pronoun: bring them back.', 'This song brings back happy memories.'),
    ('good-old-days', 'Idiomatic expression', 'the good old days', 'los viejos tiempos recordados con nostalgia', 'An earlier period remembered fondly, often with nostalgia.', 'Conversational. It expresses a positive view of the past, not proof that everything was better then.', 'My uncle often talks about the good old days.'),
    ('memory-lane', 'Idiom', 'a trip down memory lane', 'un recorrido por los recuerdos', 'An occasion for remembering experiences from the past.', 'Conversational, figurative. It does not describe a literal road or journey.', 'These photos take us on a trip down memory lane.')
]
expressions_html = grid(*(card('<span class="pi-label">'+kind+'</span>'+say(key, phrase), '<p class="pi-spanish">'+spanish+'</p><p>'+meaning+'</p><p class="pi-small"><b>Use:</b> '+register+'</p>'+ex(key+'-example', sample)) for key, kind, phrase, spanish, meaning, register, sample in expressions))
topic(4, 'memory-expressions', 'Expressions for remembering',
      'Distinguish phrasal verbs and figurative expressions and recognise their meaning and use.',
      expressions_html+note('<b>Grow up</b> describes growing or spending childhood somewhere. <b>Look back on</b> describes thinking about the past from the present. The same expressions are included in the expression library.'))

topic(4, 'unit-5-summary', 'Unit summary',
      'Recognise how past states, actions, habits and comparisons connect in the unit models.',
      '<ul class="pi-checklist">'+''.join('<li>'+item+'</li>' for item in [
          'I can understand childhood and memory vocabulary.',
          'I can describe past states with was and were and understand be born.',
          'I can recognise completed actions with regular and irregular past forms.',
          'I can understand past questions and negatives with did + base verb.',
          'I can describe earlier habits and states with used to.',
          'I can distinguish used to in statements from use to after did and didn’t.',
          'I can distinguish a past habit, a completed event and a continuing habit.',
          'I can describe a stated change using present forms and comparatives.',
          'I can understand the structure of a short family or school memory.'
      ])+'</ul>')

clusters = [
    (1, 'childhood-past', 'Childhood and Past Memories', 'Memory vocabulary, past states, completed actions and time expressions.'),
    (2, 'past-habits', 'Past Habits with Used To', 'Earlier habits and states, questions, negatives and then-and-now meanings.'),
    (3, 'changes-comparisons', 'Changes and Comparisons', 'Appearance, personality in context, comparatives and an explained profile.'),
    (4, 'language-context', 'Language in Context', 'Narrative structure, complete memory models, expressions and the unit summary.')
]
