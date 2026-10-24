"""Around Town: complete explanations and fictional map-based audio models."""
from html import escape

AUDIO = '/ingles/preintermedio-1/audio/unit6/lesson/'
audios = {}
topics = []


def say(key, text, voice='Narrator'):
    key = 'u6-' + key
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


topic(1, 'places-shops', 'Places and shops around town',
      'Understand the places and services named in a location description.',
      vocab([('tourist-office', 'a tourist office', 'A place where visitors can ask for information about a town or area.'),
             ('museum', 'a museum', 'A place that displays objects connected with subjects such as art or history.'),
             ('station', 'a station', 'A place where passengers arrive or leave on a transport service.'),
             ('market', 'a market', 'A place where sellers offer goods, often at separate stalls.'),
             ('cafe', 'a café', 'A place that serves drinks and often light meals.'),
             ('park', 'a park', 'A public outdoor area used for walking, resting or recreation.'),
             ('pharmacy', 'a pharmacy', 'A shop where people can obtain medicines and related products.'),
             ('bookshop', 'a bookshop', 'A shop that sells books.'),
             ('bank', 'a bank', 'A place where customers can use financial services.'),
             ('square', 'a town square', 'An open public space in a town, often with buildings around it.')])+
      grid(card('Useful place combinations', ex('place-combinations', 'Visit a museum, buy a book, ask at the tourist office and have lunch at a café.')+
                '<p>The verbs describe different purposes. <b>At</b> often introduces the place where an activity happens.</p>'),
           card('A place and its purpose', '<p><b>Where can I buy a book?</b><br>At a bookshop.</p><p><b>Where can I ask about a tour?</b><br>At the tourist office.</p><p>Can connects the question with an available option.</p>'))+
      note('The vocabulary includes more places than the example map. The map and all local information in this unit describe a fictional town.'))

topic(1, 'existence', 'Is there…? and Are there…?',
      'Distinguish asking whether a place exists from asking where an identified place is.',
      grid(card('One place', ex('is-there', 'Is there a museum in this town? Yes, there is.')+
                '<p><b>Is there + a/an + singular noun?</b><br>There is a museum. There isn’t a bank on the example map.</p>'),
           card('Plural places', ex('are-there', 'Are there any banks on this map? No, there aren’t.')+
                '<p><b>Are there + any + plural noun?</b><br>There are some places to eat. There aren’t any banks on the map.</p>'),
           card('Existence and location', '<p><b>Is there a museum?</b><br>Asks whether one exists in the area.</p><p><b>Where is the museum?</b><br>Asks for its location once the place is identified.</p>'))+
      note('Use <b>is</b> with a singular place and <b>are</b> with plural places. The statement about banks refers to this map, not to every town or a real city.'))

topic(1, 'location', 'Where is it? Location expressions',
      'Understand static location relationships and distinguish them from movement instructions.',
      grid(card('Opposite / across from', ex('opposite', 'The museum is opposite the station. The market is across from the park.')+
                '<p>These examples refer to the main map. The places are on different sides of Oak Street.</p>'),
           card('Between and next to', ex('between', 'The park is between the museum and the tourist office.')+
                '<p>Between identifies a position relative to two places.</p><p>A separate mini-example: <b>café — bookshop — pharmacy</b>.<br>The bookshop is <b>next to</b> the café and <b>between</b> the café and pharmacy.</p>'),
           card('To the right / left of', ex('right-left', 'On this map, the station is to the right of the museum.')+
                '<p>The map is viewed with north at the top. The viewer’s right is east; the viewer’s left is west.</p>'))+
      '<p>A separate side-view example, looking from a street towards the back of a museum:</p><div class="pi-process"><div><b>Street</b><p>Viewer</p></div><span aria-hidden="true">→</span><div><b>Bus stop</b><p>In front of the museum</p></div><span aria-hidden="true">→</span><div><b>Museum</b><p>Building</p></div><span aria-hidden="true">→</span><div><b>Garden</b><p>Behind the museum</p></div></div>'+
      ex('front-behind', 'The bus stop is in front of the museum. The garden is behind it.')+
      note('<b>In front of</b> includes of. <b>Behind</b> does not: “behind the museum”, not “behind of the museum”. In the side-view example, <b>it</b> refers to the museum.'))

town_map = '''<figure class="pi-teaching-map"><svg viewBox="0 0 700 650" role="img" aria-labelledby="town-map-title town-map-description"><title id="town-map-title">Fictional town map with a worked route to the museum</title><desc id="town-map-description">North is at the top. Oak Street runs north to south. Hill Street, Central Street and River Street run west to east, from top to bottom. On the west side are the museum, park and tourist office, from north to south. On the east side are the station, market and café. The route starts on Oak Street beside the tourist office, travels north past Central Street, then turns west along Hill Street to the museum entrance.</desc><defs><marker id="town-route-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path d="M0 0L10 5L0 10z" fill="#d7193f"/></marker></defs><rect x="5" y="5" width="690" height="640" rx="20" fill="#eef4ff" stroke="#b4c9e8"/><g fill="#d6e2f2"><rect x="335" y="45" width="30" height="565"/><rect x="25" y="185" width="650" height="30"/><rect x="25" y="385" width="650" height="30"/><rect x="25" y="585" width="650" height="30"/></g><g stroke="#123b8f" stroke-width="2"><rect x="40" y="55" width="220" height="95" rx="14" fill="white"/><rect x="440" y="55" width="220" height="95" rx="14" fill="white"/><rect x="40" y="255" width="220" height="95" rx="14" fill="#fff1d6"/><rect x="440" y="255" width="220" height="95" rx="14" fill="white"/><rect x="40" y="455" width="220" height="95" rx="14" fill="white"/><rect x="440" y="455" width="220" height="95" rx="14" fill="#fff1d6"/></g><g fill="#071f4f" font-family="Arial, sans-serif" font-size="29" font-weight="700" text-anchor="middle"><text x="150" y="115">Museum</text><text x="550" y="115">Station</text><text x="150" y="315">Park</text><text x="550" y="315">Market</text><text x="150" y="493"><tspan x="150">Tourist</tspan><tspan x="150" dy="34">Office</tspan></text><text x="550" y="515">Café</text></g><g fill="#071f4f" font-family="Arial, sans-serif" font-size="23"><text x="30" y="178">Hill Street</text><text x="30" y="378">Central Street</text><text x="30" y="578">River Street</text><text x="380" y="636">Oak Street</text><text x="565" y="37">North ↑</text></g><path d="M350 500V200H150" fill="none" stroke="#d7193f" stroke-width="6" stroke-dasharray="12 7" marker-end="url(#town-route-arrow)"/><circle cx="350" cy="500" r="9" fill="#d7193f"/><text x="375" y="510" fill="#d7193f" font-family="Arial, sans-serif" font-size="24" font-weight="700">Start</text></svg><figcaption><b>Fictional town, not to scale.</b> Oak Street runs north–south. Hill Street, Central Street and River Street run west–east. The red line is a complete route from the start beside the Tourist Office to the Museum entrance on Hill Street. North is at the top.</figcaption></figure>'''
topic(1, 'town-map', 'Understanding the example map',
      'Connect map labels, a stated starting point and a complete route without guessing a real location.',
      town_map+
      grid(card('What the map provides', '<p><b>West of Oak Street:</b> museum, park, tourist office.</p><p><b>East of Oak Street:</b> station, market, café.</p><p><b>From north to south:</b> Hill Street, Central Street, River Street.</p>'),
           card('A complete location description', ex('map-description', 'The tourist office is opposite the café. The park is north of the tourist office, and the museum is north of the park.')+
                '<p>The description follows the labels and orientation shown in the diagram.</p>'))+
      note('The red route is explained step by step below. The side-view museum example and the café–bookshop–pharmacy mini-example in the previous topic are separate diagrams, rather than extra places on this map.'))

topic(2, 'asking-directions', 'Asking for directions politely',
      'Recognise useful questions for location, a route and clarification.',
      grid(card('Ask for a location', ex('where-question', 'Excuse me, where is the museum?')+
                '<p>Excuse me politely opens the exchange. The main question asks for a location.</p>'),
           card('Ask for a route', ex('get-to-question', 'How can I get to the museum from here?')+
                '<p><b>How + can + subject + base verb?</b><br><b>From here</b> identifies the starting point in the conversation.</p>'),
           card('Clarify information', ex('repeat', 'Could you repeat that, please?')+ex('confirm-turn', 'Do I turn left at Hill Street?')+
                '<p>The first asks to hear the information again. The second checks a particular step.</p>'))+
      note('A useful directions exchange makes the destination and starting point clear. The examples are complete language models, rather than role-play instructions.'))

topic(2, 'movement', 'Movement and direction words',
      'Understand the actions expressed by short direction instructions.',
      grid(card('Go straight and turn', ex('straight-turn', 'Go straight ahead. Turn left at Hill Street.')+
                '<p><b>Go straight ahead:</b> continue in the direction you face.<br><b>Turn left / turn right:</b> change direction.<br><b>At Hill Street:</b> the place where the turn happens.</p>'),
           card('Along and past', ex('along-past', 'Walk along Oak Street. Go past Central Street.')+
                '<p><b>Along:</b> follow the street.<br><b>Past:</b> continue beyond a place or junction.</p>'),
           card('Across and opposite', ex('across', 'Walk across the street.')+
                '<p><b>Across</b> here describes movement from one side to the other.</p><p><b>The museum is across from the station.</b><br>Across from describes a location.</p>'))+
      note('These instructions usually begin with a base verb: <b>go, walk, turn</b>. The subject you is understood. They illustrate the language used to explain a route.'))

topic(2, 'orientation', 'Starting point and viewpoint',
      'Distinguish the fixed orientation of a map from a traveller’s changing left and right.',
      grid(card('A stated starting position', ex('start-position', 'Start on Oak Street beside the tourist office, facing north.')+
                '<p>This is the starting position of the worked route. The traveller faces towards the top of the map.</p>'),
           card('The traveller’s left and right', ex('facing-north', 'Facing north, the park is on your left and the market is on your right.')+
                '<p>The places lie ahead along the route, on those sides of Oak Street.</p><p>Facing south, those left/right relationships reverse.</p>'),
           card('A turn changes the viewpoint', ex('facing-west', 'After you turn left onto Hill Street, you face west. The museum is on your right.')+
                '<p>West points towards the left edge of this map. The museum is north of Hill Street, which is the traveller’s right when facing west.</p>'))+
      note('<b>To the right of the museum on the map</b> uses the map viewer’s perspective. <b>On your right</b> in a route uses the traveller’s current facing direction.'))

topic(2, 'worked-route', 'A complete route to the museum',
      'Follow the explanation of the red route and recognise its sequence and landmarks.',
      '<div class="pi-process"><div><b>Starting point</b><p>On Oak Street beside the Tourist Office, facing north.</p></div><span aria-hidden="true">→</span><div><b>Straight ahead</b><p>Go north past Central Street.</p></div><span aria-hidden="true">→</span><div><b>At Hill Street</b><p>Turn left and walk west.</p></div><span aria-hidden="true">→</span><div><b>Destination</b><p>The Museum entrance is on your right.</p></div></div>'+
      ex('route-model', 'From the start beside the tourist office, face north and walk along Oak Street. Go past Central Street. The park is on your left and the market is on your right. At Hill Street, turn left. Walk along Hill Street. The museum entrance is on your right.')+
      grid(card('How the route is organised', '<p><b>From the start</b> fixes the starting position.<br><b>Go past</b> identifies a junction to continue beyond.<br><b>At Hill Street</b> identifies the turn.<br><b>On your right</b> locates the destination after the turn.</p>'),
           card('Location and movement together', '<p><b>The museum is opposite the station.</b><br>A static relationship.</p><p><b>Walk along Oak Street and turn left at Hill Street.</b><br>Actions that describe how to reach it from the stated start.</p>'))+
      note('The route corresponds to the red line in the map. It contains no missing steps or destination to guess.'))

topic(3, 'visitor-questions', 'Useful visitor information questions',
      'Distinguish opening times, duration, distance and price in fully answered examples.',
      grid(card('Opening times', ex('opening-question', 'What time does the museum open?')+
                '<p>“It opens at nine in the morning.”<br><b>What time does it close?</b><br>“It closes at five in the afternoon.”</p>'),
           card('Duration', ex('duration-question', 'How long does the guided walk last?')+
                '<p>“It lasts ninety minutes.” This asks about time, not distance.</p>'),
           card('Distance', ex('distance-question', 'How far is the museum from the tourist office?')+
                '<p>“About five hundred metres by the walking route.” This is fictional example information; the diagram is not to scale.</p>'),
           card('Price', ex('price-question', 'How much does the guided walk cost?')+
                '<p>“It costs five dollars.” <b>Does + cost</b> in the question; <b>costs</b> in the answer.</p>'))+
      note('All hours, distances, durations and prices are invented language examples. They describe the fictional information supplied here, not live services or travel offers.'))

topic(3, 'recommendations', 'Recommendations and options',
      'Understand recommend + noun or -ing and distinguish an option from a recommendation.',
      grid(card('Recommend + a place or thing', ex('recommend-place', 'I can recommend the town museum.')+
                '<p>A noun phrase names the recommendation. <b>Can</b> introduces what the speaker is able to suggest.</p>'),
           card('Recommend + an activity', ex('recommend-ing', 'I can recommend visiting the museum and walking through the park.')+
                '<p>After recommend, <b>visiting</b> and <b>walking</b> name the activities.</p><p>Use <b>I recommend visiting</b> or <b>You can visit</b>, rather than “I recommend you to visit”.</p>'),
           card('You can… and You should…', ex('can-should', 'You can have lunch at the market. You should allow time for the museum.')+
                '<p><b>Can:</b> an available option.<br><b>Should:</b> a recommendation about the visit.<br>Both are followed by a base verb.</p>'))+
      note('A reason makes a recommendation clearer: <b>You can visit the market because there are places to eat there.</b> These examples apply language from earlier units to visitor information.'))

topic(3, 'guided-tours', 'Understanding a guided tour',
      'Recognise the meeting point, duration, stops and closing in a tour description.',
      '<div class="pi-compare"><div><p class="pi-label">Fictional walking tour</p><p><b>Meeting point:</b> Tourist Office.<br><b>Departure:</b> 10:00 a.m.<br><b>Duration:</b> 90 minutes.<br><b>Price:</b> five dollars.</p></div><div><p class="pi-label">Information a visitor needs</p><p>Where the group meets, what the tour includes, how long it lasts and where it ends.</p></div></div>'+
      ex('guide-model', 'Welcome to our town. We meet at the tourist office at ten. First, we walk to the museum. Then, we walk through the park. Finally, we visit the market, where the walk ends. The tour lasts ninety minutes.')+
      grid(card('A clear opening', '<p><b>Welcome to our town.</b> identifies the guide’s role.<br><b>We meet at…</b> gives a place and time.</p>'),
           card('A clear sequence', '<p><b>First, then, finally</b> organise the stops.<br><b>The walk ends at the market</b> identifies the last location.</p><p>A tour description can use the present simple to explain its usual sequence.</p>'))+
      note('The guide model provides a complete description of an invented walking tour. It does not require a booking or ask the learner to lead a tour.'))

topic(3, 'itinerary-language', 'How an itinerary connects places and times',
      'Recognise day, time, place and purpose in an explained weekend itinerary.',
      '<div class="pi-compare"><div><p class="pi-label">Fictional opening information</p><p><b>Museum:</b> Tuesday–Sunday, 9 a.m.–5 p.m.; closed Monday.<br><b>Market:</b> daily, 8 a.m.–6 p.m.<br><b>Park:</b> daily, 6 a.m.–8 p.m.<br><b>Café:</b> daily, 8 a.m.–7 p.m.</p></div><div><p class="pi-label">Complete example itinerary</p><p><b>Saturday, 9:30 a.m.:</b> meet at the Tourist Office.<br><b>Saturday, 10 a.m.:</b> visit the Museum.<br><b>Saturday, 12 noon:</b> have lunch at the Market.<br><b>Sunday, 10 a.m.:</b> walk in the Park.<br><b>Sunday, 12 noon:</b> have lunch at the Café.</p></div></div>'+
      grid(card('A plan and an arrangement', ex('itinerary-plan', 'We’re going to visit the museum. We’re meeting at the tourist office on Saturday at nine thirty.')+
                '<p><b>Going to</b> presents an intention.<br><b>We’re meeting…</b> presents the meeting as arranged in this example, connecting with Unit 4.</p>'),
           card('How the times fit', '<p>The Museum visit is on Saturday during its stated hours. Both lunches take place during the stated opening times. The Sunday walk is during the Park’s stated hours.</p><p>The itinerary combines places and times rather than listing destinations without context.</p>'))+
      note('The timetable is complete and all details are fictional. The map supplies location relationships, while the information panel supplies opening times; the map alone does not supply hours or exact travel times.'))

dialogue = [
    ('Laura', 'Excuse me, is there a museum in this town?'),
    ('Mateo', 'Yes, there is. It’s opposite the station.'),
    ('Laura', 'How can I get there from the tourist office?'),
    ('Mateo', 'Start on Oak Street facing north. Go straight past Central Street. At Hill Street, turn left.'),
    ('Laura', 'Is the museum on my left after the turn?'),
    ('Mateo', 'No, it’s on your right. The entrance is on Hill Street.'),
    ('Laura', 'What time does it open?'),
    ('Mateo', 'At nine in the morning. I can recommend visiting the market afterwards too.')
]
dialogue_html = '<div class="pi-dialogue">'+''.join('<article class="pi-dialogue-line"><span class="pi-label">'+role+'</span>'+say('dialogue-'+str(i), text, role)+'</article>' for i, (role, text) in enumerate(dialogue, 1))+'</div>'
topic(4, 'visitor-dialogue', 'An explained visitor conversation',
      'Notice how a complete exchange connects existence, location, directions and information.',
      '<p>The fictional speakers use the same map and museum information explained above.</p><button type="button" class="btn btn-primary pi-button" data-playlist="'+','.join('u6-dialogue-'+str(i) for i in range(1, len(dialogue)+1))+'">Listen to the conversation</button>'+dialogue_html+
      grid(card('How the exchange develops', '<ol><li><b>Is there…?</b> establishes that a museum exists.</li><li><b>Opposite the station</b> locates it.</li><li><b>From the tourist office</b> establishes the start.</li><li><b>Go straight / turn left</b> explain movement.</li><li><b>On your right</b> corrects a detail after the turn.</li><li><b>What time…?</b> asks for opening information.</li></ol>'),
           card('A clarification with a complete answer', '<p>The visitor checks left versus right. The response identifies both the correct side and the street of the entrance.</p><p>These are supplied turns in a model, rather than questions for the learner to answer.</p>')))

brochure = 'Welcome to our town. The museum is opposite the station, and the park is between the museum and the tourist office. You can visit the museum from Tuesday to Sunday, between nine in the morning and five in the afternoon. The market is across from the park. You can have lunch there and look around the stalls. The café is opposite the tourist office. Ask at the tourist office for details of the guided walk.'
email = 'Hi Laura, We’re going to spend the weekend in town. We’re meeting at the tourist office on Saturday at nine thirty. Then, we’re going to visit the museum. It opens at nine, so we can visit in the morning. At noon, we’re going to have lunch at the market. On Sunday morning, we can walk in the park and have lunch at the café afterwards. I can recommend bringing a camera if you enjoy taking photos. Best wishes, Mateo.'
email_audio = say('email-model', email).replace('>'+escape(email)+'<span', '>Listen to the complete email<span')
email_display = '<p>Hi Laura,</p><p>'+escape(email.removeprefix('Hi Laura, ').removesuffix(' Best wishes, Mateo.'))+'</p><p>Best wishes,<br>Mateo</p>'+email_audio
topic(4, 'brochure-email', 'Complete brochure and email models',
      'Recognise how visitor information and a personal itinerary use the unit language.',
      '<p>These are complete worked models for the fictional town. No information needs to be filled in or submitted.</p>'+
      grid(card('Visitor brochure: complete model', ex('brochure-model', brochure)),
           card('How the brochure works', '<p><b>Location:</b> opposite / between / across from.<br><b>Opening times:</b> days and hours.<br><b>Options:</b> You can visit / have lunch.<br><b>Further information:</b> ask at the tourist office.</p>'),
           card('Weekend email: complete model', email_display),
           card('How the email works', '<p><b>Greeting:</b> Hi Laura.<br><b>Intention:</b> We’re going to spend…<br><b>Arrangement:</b> We’re meeting…<br><b>Sequence:</b> then / at noon / on Sunday.<br><b>Reason:</b> It opens at nine, so…<br><b>Recommendation:</b> I can recommend bringing…<br><b>Closing:</b> Best wishes.</p>')))

expressions = [
    ('get-around', 'Phrasal verb', 'get around', 'desplazarse por una zona', 'Travel from place to place within an area.', 'Everyday, neutral. Get around town by bus or on foot.', 'You can get around this small town on foot.'),
    ('look-around', 'Phrasal verb', 'look around', 'mirar o explorar un lugar', 'Explore a place and see what is there.', 'Everyday, neutral. Look around the market or look around on your own.', 'We’re going to look around the market after lunch.'),
    ('get-on', 'Phrasal verb', 'get on', 'subir a un autobús, tren u otro transporte similar', 'Board a bus, train or similar vehicle.', 'Everyday, neutral. Get on the bus; for a car, get in the car is the usual expression.', 'You can get on the bus near the station.'),
    ('get-off', 'Phrasal verb', 'get off', 'bajar de un autobús, tren u otro transporte similar', 'Leave a bus, train or similar vehicle.', 'Everyday, neutral. Get off the bus; for a car, get out of the car is the usual expression.', 'We get off the bus at the next stop.'),
    ('stone-throw', 'Idiom', 'a stone’s throw', 'a muy poca distancia', 'A very short distance.', 'Conversational, figurative. It gives an approximate sense of closeness, not a precise measurement.', 'The café is a stone’s throw from the tourist office.')
]
expressions_html = grid(*(card('<span class="pi-label">'+kind+'</span>'+say(key, phrase), '<p class="pi-spanish">'+spanish+'</p><p>'+meaning+'</p><p class="pi-small"><b>Use:</b> '+register+'</p>'+ex(key+'-example', sample)) for key, kind, phrase, spanish, meaning, register, sample in expressions))
topic(4, 'town-expressions', 'Useful town and travel expressions',
      'Distinguish phrasal verbs and an idiom and understand their meaning and context.',
      expressions_html+note('The bus examples illustrate transport expressions and do not add a bus service or stop to the map. <b>On foot</b> means walking. <b>Take the bus</b> and <b>travel by bus</b> describe a transport option; <b>get on/off</b> describe boarding and leaving it.'))

topic(4, 'unit-6-summary', 'Unit summary',
      'Recognise the language connected by the location, route and visitor-information models.',
      '<ul class="pi-checklist">'+''.join('<li>'+item+'</li>' for item in [
          'I can understand names of places and shops around town.',
          'I can distinguish asking whether a place exists from asking where it is.',
          'I can describe location relationships using a supplied map.',
          'I can distinguish a static location from a movement instruction.',
          'I can understand a route from a stated starting point and facing direction.',
          'I can ask for opening times, duration, distance and price.',
          'I can understand recommendations with recommend + noun or -ing.',
          'I can recognise the main information in a guided tour.',
          'I can understand a complete brochure and a coherent weekend itinerary.'
      ])+'</ul>')

clusters = [
    (1, 'places-location', 'Places and Location', 'Town vocabulary, existence questions, location expressions and an explained map.'),
    (2, 'directions', 'Giving and Understanding Directions', 'Polite questions, movement, orientation and a complete worked route.'),
    (3, 'tourist-information', 'Tourist Information and Recommendations', 'Visitor questions, recommendations, guided tours and an explained itinerary.'),
    (4, 'language-context', 'Language in Context', 'Complete visitor, brochure and email models, expressions and the unit summary.')
]
