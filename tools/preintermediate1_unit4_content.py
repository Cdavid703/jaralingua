"""Celebrations and Festivals: explanations, worked models and catalog audio."""
from html import escape

AUDIO = '/ingles/preintermedio-1/audio/unit4/lesson/'
audios = {}
topics = []


def say(key, text, voice='Narrator'):
    key = 'u4-' + key
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


topic(1, 'key-concepts', 'Celebration, festival, holiday and tradition',
      'Distinguish four related words by their meaning and context.',
      vocab([('celebration', 'celebration', 'An occasion or event that marks something special, such as a birthday or an anniversary.'),
             ('festival', 'festival', 'An organised event or series of events connected with a theme, community, culture or art.'),
             ('holiday', 'holiday', 'A recognised special day, or a period away from work or study. The meaning depends on context.'),
             ('tradition', 'tradition', 'A custom or practice passed on within a family or community.')])+
      grid(card('An event and a repeated custom', ex('celebration-tradition', 'Our family celebration includes a tradition: we cook together.')+
                '<p>The <b>celebration</b> is the occasion. Cooking together is the <b>tradition</b> in this fictional family.</p>'),
           card('Holiday and vacation', '<p><b>A public holiday</b> is an officially recognised day. Its name alone does not tell us whether every business closes.</p><p>In British English, <b>on holiday</b> often means <b>on vacation</b>. In American English, vacation commonly expresses that meaning.</p>'),
           card('Words can overlap', '<p>A festival can include several celebrations and traditions. It may take place during a public holiday, but the words do not mean the same thing.</p>'))+
      note('The examples describe a particular occasion or community. A tradition does not have to be shared by everyone in a country.'))

topic(1, 'celebration-vocabulary', 'People, objects and celebration words',
      'Understand words for the people, objects and events in a celebration description.',
      vocab([('decorations', 'decorations', 'Things used to make a place look festive.'),
             ('ornaments', 'ornaments', 'Decorative objects, such as small items hung on a tree.'),
             ('parade', 'parade', 'A public procession of people, performers or vehicles.'),
             ('costume', 'a costume', 'Clothing worn for a performance, character or special tradition.'),
             ('traditional-food', 'traditional food', 'Food associated with a particular community, family or occasion.'),
             ('gifts', 'gifts', 'Things given to other people.'),
             ('guests', 'guests', 'People invited to an event or a home.'),
             ('wedding', 'wedding', 'A marriage ceremony and the associated celebration.'),
             ('honeymoon', 'honeymoon', 'A holiday or trip taken by a couple after their wedding.'),
             ('invitation', 'invitation', 'A request for someone to come to an event.'),
             ('fireworks', 'fireworks', 'Devices used in displays of light and sound.'),
             ('anniversary', 'anniversary', 'A date that marks another year since an event.')])+
      grid(card('Useful combinations', ex('combinations', 'We put up decorations, invite guests and share food.')+
                '<p><b>Put up</b> decorations · <b>wear</b> a costume · <b>watch</b> a parade · <b>give</b> a gift · <b>attend</b> a wedding.</p>'),
           card('Costume and clothes', '<p><b>Clothes</b> is a general word. A <b>costume</b> has a particular performance, character or cultural purpose.</p><p>“People wear costumes” describes the event; it does not mean every person wears one.</p>')))

topic(1, 'time-place', 'Time, place and occasion',
      'Recognise how in, on, at and for locate an event or connect a plan with an occasion.',
      grid(card('In + month or year', ex('in-december', 'We usually get together in December.')+
                '<p>In December · in March · in 2027.<br>In answers a broad time question here.</p>'),
           card('On + day or named date', ex('on-day', 'The dinner is on Saturday. We meet on New Year’s Eve.')+
                '<p><b>New Year’s Eve</b> names the evening before New Year’s Day. <b>On</b> introduces the named day.</p>'),
           card('At + time or event', ex('at-time', 'The guests arrive at seven. We celebrate at midnight.')+
                '<p>At seven · at midnight · at a festival · at a wedding.</p>'),
           card('For + occasion', ex('for-new-year', 'What are you doing for New Year’s?')+
                '<p>For connects the plans with the occasion. Compare <b>on New Year’s Eve</b>, which identifies a day.</p>'))+
      note('Natural questions include <b>What do you usually do at a festival?</b> and <b>Where are you meeting your friends?</b> Time and place phrases make the context clearer.'))

topic(1, 'traditions-context', 'Traditions in context',
      'Understand short cultural descriptions and distinguish them from fictional personal examples.',
      grid(card('Barranquilla, Colombia', ex('barranquilla', 'Barranquilla’s carnival brings together music and dance. Performers use costumes and masks.')+
                '<p>This short description draws on UNESCO’s account of the carnival’s music, dance and handcrafted objects.</p><p class="pi-small"><a href="https://ich.unesco.org/en/RL/carnival-of-barranquilla-00051" target="_blank" rel="noopener">Source: UNESCO · Carnival of Barranquilla</a></p>'),
           card('Valencia, Spain', ex('valencia', 'The Fallas celebration includes large artistic figures. Marching bands and outdoor meals are also part of the festivity.')+
                '<p>UNESCO describes the figures as work by local artists and craftspeople and identifies music and communal meals among the festivities.</p><p class="pi-small"><a href="https://ich.unesco.org/en/RL/fallas-of-valencia-00859" target="_blank" rel="noopener">Source: UNESCO · Valencia Fallas festivity</a></p>'),
           card('One fictional family', ex('family-tradition', 'In our family, we usually cook together for special occasions.')+
                '<p><b>In our family</b> limits the statement to the speaker’s family. It does not describe an entire country.</p>'))+
      '<div class="pi-compare"><div><b>What a description can include</b><p>A place, the people involved, the occasion and examples of what happens.</p></div><div><b>Reasons and categories</b><p>Religious, seasonal, civic and historical meanings can overlap. A public-holiday designation concerns official recognition; it is not a complete explanation of a tradition.</p></div></div>'+
      note('The source links support the cultural descriptions, rather than a current event schedule. The personal examples and plans elsewhere in this unit are fictional.'))

topic(2, 'customs-frequency', 'Customs and frequency',
      'Recognise the present simple and frequency expressions in descriptions of repeated customs.',
      grid(card('A repeated custom', ex('custom', 'We usually share a meal on special occasions.')+
                '<p><b>Present simple</b> describes a repeated pattern. It does not locate one particular event in progress now.</p>'),
           card('Frequency position', ex('frequency', 'They often invite their neighbours. The celebration is usually at home.')+
                '<p>Before the main verb: <b>often invite</b>.<br>After be: <b>is usually</b>.<br>This applies the frequency patterns from Unit 3.</p>'),
           card('Questions and negatives', ex('custom-question', 'What does your family usually do for a celebration?')+
                '<p>“My family usually cooks at home.”</p><p><b>Does</b> your family cook? → base verb.<br>My sister <b>doesn’t wear</b> a costume. → doesn’t + base verb.</p>'))+
      note('<b>Always</b> describes every occasion within the situation stated. “We always have dinner together on this anniversary” is a family example, not a claim about everyone.'))

topic(2, 'there-is-are', 'Describing what there is',
      'Distinguish plural countable nouns from uncountable nouns with there is and there are.',
      grid(card('There are + plural noun', ex('many', 'There are many decorations in the hall.')+ex('some', 'There are some guests in the garden.')+
                '<p><b>Decorations</b> and <b>guests</b> are plural countable nouns. Use <b>are</b>.</p>'),
           card('A lot of + plural noun', ex('a-lot-plural', 'There are a lot of ornaments on the tree.')+
                '<p><b>Many</b> and <b>a lot of</b> both express a large quantity with plural countable nouns. A lot of is especially common in everyday affirmative speech.</p>'),
           card('There is + uncountable noun', ex('food', 'There is a lot of food on the table.')+
                '<p><b>Food</b> is uncountable in this general use. <b>A lot of</b> can come before it; many cannot.</p><p>There is some music.<br>There are some musicians.</p>'))+
      '<div class="pi-compare"><div><b>One countable item</b><p>There is <b>a gift</b> on the table.</p></div><div><b>Several countable items</b><p>There are <b>some gifts</b> on the table.</p></div><div><b>A general amount</b><p>There is <b>some food</b> on the table.</p></div></div>'+
      note('Correct: <b>There are many decorations.</b> Avoid “There is many decorations” and “There are many food”. These are description patterns, rather than expressions of people’s future intentions.'))

topic(2, 'sequence-comparison', 'Sequence, similarities and differences',
      'Understand how sequence words and connectors organise a description.',
      '<p>This fictional family celebration follows a simple sequence:</p><div class="pi-process"><div><b>First</b><p>The guests arrive.</p></div><span aria-hidden="true">→</span><div><b>Then</b><p>Everyone shares a meal.</p></div><span aria-hidden="true">→</span><div><b>After that</b><p>The family listens to music.</p></div><span aria-hidden="true">→</span><div><b>Finally</b><p>The guests say goodbye.</p></div></div>'+
      ex('sequence', 'First, the guests arrive. Then, we share a meal. After that, we listen to music. Finally, we say goodbye.')+
      grid(card('A shared feature', ex('both', 'Both celebrations include music and handmade objects.')+
                '<p><b>Both</b> refers to the two celebrations described in the cultural examples. <b>And</b> adds a second shared feature.</p>'),
           card('A difference', ex('difference', 'Our family usually celebrates at home, but our neighbours prefer the community hall.')+
                '<p><b>But</b> connects a contrast. This fictional comparison reports two choices without ranking them.</p>'))+
      note('The sequence shows the order of events during an occasion. It is not a history of how a festival began.'))

topic(3, 'intentions', 'Celebration plans with going to',
      'Understand an intention with be going to and connect it to the language introduced in Unit 3.',
      grid(card('An intention', '<p><b>subject + am/is/are + going to + base verb</b></p>'+ex('going-to', 'We’re going to decorate the house for the celebration.')+
                '<p>The speaker presents a plan or intention. This sentence does not, by itself, tell us which practical arrangements are confirmed.</p>'),
           card('Other subjects and a negative', ex('going-to-she', 'She’s going to invite her cousins.')+ex('going-to-negative', 'We’re not going to hold the dinner outside.')+
                '<p>I am / he is / they are going to…<br>She isn’t going to travel.</p>'),
           card('An everyday plan', ex('honeymoon-plan', 'They’re going to travel to San Andrés for their honeymoon.')+
                '<p>A fictional example of an intention related to a special occasion. <b>For</b> identifies the purpose or occasion of the trip.</p>'))+
      note('Keep be and the base verb: <b>She is going to travel</b>, not “She going to travel” or “She is going to travelling”. This section applies going to to a new topic rather than introducing it again from the beginning.'))

topic(3, 'arrangements', 'Agreed future arrangements',
      'Understand the present continuous when a speaker presents a future plan as organised.',
      grid(card('An organised meeting', ex('arrangement', 'We’re meeting our cousins on Saturday at six.')+
                '<p>The context is an agreed meeting. <b>On Saturday at six</b> places it in the future; the speaker presents it as arranged.</p>'),
           card('The same form, a future meaning', '<p><b>am/is/are + verb-ing</b></p>'+ex('arranged-travel', 'We’re travelling on Friday. Our tickets are booked.')+
                '<p>The second sentence supplies evidence of an arrangement. <b>Travelling</b> is not describing movement happening right now in this context.</p>'),
           card('A negative arrangement', ex('arrangement-negative', 'We aren’t meeting at the station. We’re meeting at the hotel.')+
                '<p>Be + not makes the negative: <b>am not, isn’t, aren’t</b>. The sentences clarify the agreed location.</p>'))+
      '<div class="pi-compare"><div><b>Happening now</b><p>We’re decorating the hall <b>now</b>.</p></div><div><b>Arranged for later</b><p>We’re decorating the hall <b>on Friday at five</b>. The volunteers have agreed on the time.</p></div></div>'+
      note('The verb form is the same as the continuous used in Units 2 and 3. The future meaning comes from context. A future date alone does not prove that an arrangement is confirmed.'))

meanings = [
    ('A custom', 'meaning-custom', 'We usually visit our cousins in December.', 'A repeated pattern: present simple.'),
    ('An action now', 'meaning-now', 'We’re decorating the house now.', 'An action in progress: present continuous.'),
    ('An intention', 'meaning-intention', 'We’re going to organise a family dinner.', 'A plan or intention: be going to + base verb.'),
    ('An arrangement', 'meaning-arrangement', 'We’re having dinner with our cousins on Saturday at seven.', 'In an agreed-meeting context, the speaker presents this as organised: present continuous.')
]
topic(3, 'choosing-meaning', 'Choosing the intended meaning',
      'Distinguish four meanings and understand where future forms can overlap.',
      grid(*(card(label, ex(key, text)+'<p>'+meaning+'</p>') for label, key, text, meaning in meanings[:2]))+
      grid(*(card(label, ex(key, text)+'<p>'+meaning+'</p>') for label, key, text, meaning in meanings[2:]))+
      grid(card('Two ways to present a plan', '<p><b>We’re going to visit our cousins.</b><br>The speaker foregrounds an intention.</p><p><b>We’re visiting our cousins on Saturday.</b><br>In an agreed-visit context, the speaker presents an arrangement.</p>'),
           card('The forms can overlap', '<p>A confirmed plan can also be described with <b>going to</b>. A present continuous sentence does not need to list every booking or agreement.</p><p>Meaning comes from the situation and how the speaker presents the plan, not from a rigid “unconfirmed versus confirmed” rule.</p>'))+
      note('The comparison connects familiar verb forms with their different uses. Time phrases and the wider situation help establish the meaning.'))

topic(3, 'questions-plans', 'Questions and answers about plans',
      'Recognise question order and short answers for intentions and arrangements.',
      grid(card('Ask about an intention', '<p><b>Question word + be + subject + going to + base verb?</b></p>'+ex('intention-question', 'What are you going to do for the celebration?')+
                '<p>“We’re going to prepare dinner.”</p>'+ex('intention-yes-no', 'Are you going to invite your neighbours? Yes, we are.')+
                '<p>Negative short answer: <b>No, we aren’t.</b></p>'),
           card('Ask about an arrangement', '<p><b>Question word + be + subject + verb-ing?</b></p>'+ex('arrangement-question', 'Who are you meeting on Saturday?')+
                '<p>“We’re meeting our cousins.”</p>'+ex('arrangement-yes-no', 'Are you travelling on Friday? No, we aren’t. We’re travelling on Saturday.')+
                '<p>Positive short answer: <b>Yes, we are.</b></p>'),
           card('Ask for time and place', ex('when-question', 'When are you meeting your cousins?')+
                '<p>“On Saturday at six.”</p>'+ex('where-question', 'Where are you meeting them?')+
                '<p>“At the hotel.” <b>Them</b> refers to the cousins, connecting with the object pronouns from Unit 2.</p>'))+
      note('The subject in an answer follows the situation: <b>Are you…?</b> can have <b>Yes, I am</b> for one person or <b>Yes, we are</b> for a group. Avoid “Do you are meeting…?”; be already forms the question.'))

dialogue = [
    ('Laura', 'Hi, Mateo. What does your family usually do for a special celebration?'),
    ('Mateo', 'We usually share a meal at home. What about your family?'),
    ('Laura', 'We usually do that too, but this year we’re going to organise a dinner at the community hall.'),
    ('Mateo', 'Who are you meeting there?'),
    ('Laura', 'Our cousins. We’re meeting them on Saturday at six. Everyone has agreed on the time.'),
    ('Mateo', 'Are you going to put up decorations?'),
    ('Laura', 'Yes, we are. There are some paper ornaments in the hall already.'),
    ('Mateo', 'That sounds lovely. I hope you have a ball!')
]
dialogue_html = '<div class="pi-dialogue">'+''.join('<article class="pi-dialogue-line"><span class="pi-label">'+role+'</span>'+say('dialogue-'+str(i), text, role)+'</article>' for i, (role, text) in enumerate(dialogue, 1))+'</div>'
description = 'In our family, we usually celebrate birthdays at home. There are some decorations in the living room, and there is a lot of food on the table. First, we welcome the guests. Then, we share a meal. After that, we listen to music. We enjoy spending time together.'
email = 'Hi Laura, We’re going to spend a few days in Valencia in March. We’re travelling on Friday, and our tickets are booked. On Saturday morning, we’re meeting our friend Ana at the hotel. She knows the city. We’re going to see some of the Fallas figures during our visit. I’m going to take my camera because I enjoy photography. Best wishes, Mateo.'
email_audio = say('email-model', email).replace('>'+escape(email)+'<span', '>Listen to the complete email<span')
email_display = '<p>Hi Laura,</p><p>'+escape(email.removeprefix('Hi Laura, ').removesuffix(' Best wishes, Mateo.'))+'</p><p>Best wishes,<br>Mateo</p>'+email_audio
topic(4, 'complete-models', 'Complete explained models',
      'Notice how complete descriptions, a dialogue and an email connect the unit language.',
      '<p>The family, speakers, travel plans and arrangements below are fictional worked examples. The email is not a live itinerary or event timetable.</p>'+
      grid(card('A family tradition', ex('description-model', description)),
           card('How the description works', '<ol><li><b>In our family</b> identifies whose custom this is.</li><li><b>We usually celebrate</b> describes a repeated pattern.</li><li><b>There are / there is</b> describe objects and food.</li><li><b>First / then / after that</b> organise the sequence.</li></ol>'))+
      '<h4 class="pi-model-heading">A conversation about a celebration</h4><button type="button" class="btn btn-primary pi-button" data-playlist="'+','.join('u4-dialogue-'+str(i) for i in range(1, len(dialogue)+1))+'">Listen to the conversation</button>'+dialogue_html+
      grid(card('A travel email: complete model', email_display),
           card('How the plans are presented', '<p><b>We’re going to spend</b> states an intention.<br><b>We’re travelling… tickets are booked</b> presents an arrangement.<br><b>We’re meeting… at the hotel</b> gives an arranged meeting.<br><b>I’m going to take my camera</b> states another intention with a reason.</p><p>In written emails, the greeting, main message and closing normally appear on separate lines.</p>')))

expressions = [
    ('set-up', 'Phrasal verb', 'set up', 'preparar o disponer algo para usarlo', 'Arrange or prepare something so it is ready for use.', 'Everyday, neutral. Set up the tables / set the tables up; with a pronoun: set them up.', 'We’re setting up the tables on Friday afternoon.'),
    ('put-up', 'Phrasal verb', 'put up', 'colocar o colgar decoraciones', 'Place or hang something in position; here, decorations.', 'Everyday, neutral. Put up the decorations / put the decorations up; with a pronoun: put them up.', 'We’re going to put up some paper decorations.'),
    ('get-together', 'Phrasal verb', 'get together', 'reunirse', 'Meet and spend time with other people.', 'Everyday, conversational. Get together with someone. The noun a get-together names a gathering.', 'We usually get together with our cousins in December.'),
    ('full-swing', 'Idiom', 'in full swing', 'en pleno desarrollo o apogeo', 'Happening with a lot of activity.', 'Everyday, conversational. Often follows be and describes an event in progress.', 'The celebration is in full swing.'),
    ('have-ball', 'Idiom', 'have a ball', 'pasarlo muy bien', 'Enjoy yourself very much.', 'Informal, enthusiastic. It is not about a physical ball in this use.', 'We always have a ball at our family celebrations.')
]
expressions_html = grid(*(card('<span class="pi-label">'+kind+'</span>'+say(key, phrase), '<p class="pi-spanish">'+spanish+'</p><p>'+meaning+'</p><p class="pi-small"><b>Use:</b> '+register+'</p>'+ex(key+'-example', sample)) for key, kind, phrase, spanish, meaning, register, sample in expressions))
topic(4, 'celebration-expressions', 'Useful expressions in context',
      'Distinguish phrasal verbs and idioms and recognise their form, meaning and register.',
      expressions_html+note('The object pronoun comes between the parts of these separable verbs: <b>put them up</b>, not “put up them”. <b>Have a good time</b> is another useful expression for enjoyment; the idiom taught here is <b>have a ball</b>.'))

topic(4, 'unit-4-summary', 'Unit summary',
      'Recognise how the unit vocabulary, descriptions and future meanings connect.',
      '<ul class="pi-checklist">'+''.join('<li>'+item+'</li>' for item in [
          'I can distinguish celebration, festival, holiday and tradition.',
          'I can understand celebration vocabulary and time and place expressions.',
          'I can recognise customs described with the present simple and frequency words.',
          'I can describe plural objects and general amounts with there are and there is.',
          'I can understand sequences, similarities and differences in a description.',
          'I can explain an intention with be going to.',
          'I can understand the present continuous for agreed future arrangements.',
          'I can distinguish a custom, an action now, an intention and an arrangement.',
          'I can understand questions and complete models about celebration plans.'
      ])+'</ul>')

clusters = [
    (1, 'celebrations-traditions', 'Celebrations and Traditions', 'Key concepts, vocabulary, time and place, and traditions in context.'),
    (2, 'usual-customs', 'What People Usually Do', 'Repeated customs, quantities, sequences, similarities and differences.'),
    (3, 'future-plans', 'Plans and Future Arrangements', 'Intentions, agreed arrangements, meaning contrasts and questions.'),
    (4, 'language-context', 'Language in Context', 'Complete explained models, useful expressions and the unit summary.')
]
