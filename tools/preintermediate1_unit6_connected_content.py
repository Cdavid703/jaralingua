"""Approved fictional-town visit: directions followed by a complete morning plan."""
DIALOGUE = [
    ('Laura', "Mateo, is there a museum near here? I'd like to see the craft exhibition on Saturday."),
    ('Mateo', "Yes. It's opposite the station. This leaflet gives a walking route from the tourist office."),
    ('Laura', "We're beside the tourist office now. Which way should we face?"),
    ('Mateo', 'Face north and go straight along Oak Street. Go past Central Street. The park is on your left.'),
    ('Laura', 'Do we turn at Central Street?'),
    ('Mateo', 'No. Keep going to Hill Street, then turn left. The museum entrance is on your right.'),
    ('Laura', 'How far is it from here?'),
    ('Mateo', "About five hundred meters by this route. The map isn't to scale."),
    ('Laura', 'What time does the museum open?'),
    ('Mateo', "At nine. There's also a guided walk from the tourist office at ten. It lasts ninety minutes and costs five dollars."),
    ('Laura', 'Does the walk finish at the museum?'),
    ('Mateo', 'No, it continues through the park and ends at the market. We can look around there afterwards.'),
    ('Laura', 'That sounds good. What should we do after the tour?'),
    ('Mateo', "Let's check the opening times and make our Saturday plan. The leaflet also shows the market stalls and some places for lunch. We can choose one together. I can send you the details tonight."),
]

MESSAGE_GREETING = 'Hi Laura,'
READING = [
    "Here's our Saturday plan. Our meeting point is the tourist office at nine thirty. We're joining the guided walk at ten. It costs five dollars per person and lasts ninety minutes.",
    'First, the group visits the museum to see the craft exhibition. Then, we walk through the park. The tour ends at the market at eleven thirty.',
    "We can look around the stalls before lunch at noon. The market is open until six, so there's time to explore. I recommend bringing a camera and comfortable shoes.",
    'We can get around on foot. I checked the opening times: the museum is closed on Monday, but it is open from nine to five on Saturday. Keep the leaflet for the return trip. It also has the town map.',
]
MESSAGE_CLOSING = 'See you on Saturday!'
MESSAGE_AUTHOR = 'Mateo'

VOCAB = [
    dict(term='craft exhibition', spanish='exposición de manualidades o trabajos artesanales', new=True, file='craft-exhibition.mp3', pages=['listening', 'reading']),
    dict(term='tourist office', spanish='oficina de turismo; lugar con información para visitantes', new=True, file='tourist-office.mp3', pages=['listening', 'reading']),
    dict(term='leaflet', spanish='folleto; hoja con información de una visita o servicio', new=True, file='leaflet.mp3', pages=['listening', 'reading']),
    dict(term='opposite', spanish='enfrente de; al otro lado de la calle', new=True, file='opposite.mp3', pages=['listening']),
    dict(term='route', spanish='ruta; camino para llegar a un lugar', new=True, file='route.mp3', pages=['listening']),
    dict(term='face north', spanish='ponerse mirando hacia el norte', new=True, file='face-north.mp3', pages=['listening']),
    dict(term='go straight', spanish='seguir recto', new=True, file='go-straight.mp3', pages=['listening']),
    dict(term='go past', spanish='pasar de largo un punto y continuar', new=True, file='go-past.mp3', pages=['listening']),
    dict(term='turn left', spanish='girar a la izquierda según la dirección en la que se avanza', new=True, file='turn-left.mp3', pages=['listening']),
    dict(term='entrance', spanish='entrada; lugar por donde se accede al museo', existing_path='/ingles/preintermedio-1/audio/unit4/connected/entrance.mp3', pages=['listening']),
    dict(term='on your right', spanish='a tu derecha, según hacia dónde estás mirando', new=True, file='on-your-right.mp3', pages=['listening']),
    dict(term='to scale', spanish='a escala; con distancias que guardan una proporción real', new=True, file='to-scale.mp3', pages=['listening']),
    dict(term='guided walk', spanish='recorrido a pie acompañado por un guía', new=True, file='guided-walk.mp3', pages=['listening', 'reading']),
    dict(term='look around', spanish='mirar o explorar un lugar', existing='u6-look-around', pages=['listening', 'reading']),
    dict(term='afterwards', spanish='después; a continuación de lo mencionado', new=True, file='afterwards.mp3', pages=['listening']),
    dict(term='meeting point', spanish='punto de encuentro acordado', new=True, file='meeting-point.mp3', pages=['reading']),
    dict(term='per person', spanish='por persona; precio individual', new=True, file='per-person.mp3', pages=['reading']),
    dict(term='stalls', spanish='puestos de venta de un mercado', new=True, file='stalls.mp3', pages=['reading']),
    dict(term='get around', spanish='desplazarse de un lugar a otro dentro del pueblo', existing='u6-get-around', pages=['reading']),
    dict(term='on foot', spanish='a pie; caminando', new=True, file='on-foot.mp3', pages=['reading']),
    dict(term='opening times', spanish='horarios en los que un lugar está abierto', new=True, file='opening-times.mp3', pages=['listening', 'reading']),
    dict(term='closed', spanish='cerrado; sin atención a visitantes en ese momento', new=True, file='closed.mp3', pages=['reading']),
]

LISTENING_QUESTIONS = [
    dict(id='q1', question='Why does Laura want to visit the museum?', options={'A':'To buy lunch at the market.', 'B':'To see the craft exhibition.', 'C':'To meet the school-fair visitors.'}, answer='B', explanation='Laura names the craft exhibition as the reason for her museum visit.', evidence="I'd like to see the craft exhibition on Saturday."),
    dict(id='q2', question='What is opposite the museum?', options={'A':'The station.', 'B':'The tourist office.', 'C':'The café.'}, answer='A', explanation='Mateo locates the museum opposite the station, which also matches the map.', evidence="It's opposite the station."),
    dict(id='q3', question='Where are Laura and Mateo at the start?', options={'A':'Inside the museum.', 'B':'At the market entrance.', 'C':'Beside the tourist office.'}, answer='C', explanation='Laura states their starting position before asking which way to face.', evidence="We're beside the tourist office now."),
    dict(id='q4', question='At which street should they turn left?', options={'A':'Central Street.', 'B':'Hill Street.', 'C':'River Street.'}, answer='B', explanation='They go past Central Street and keep going until Hill Street.', evidence='Keep going to Hill Street, then turn left.'),
    dict(id='q5', question='After the left turn, where is the museum entrance?', options={'A':'On their right.', 'B':'On their left.', 'C':'Behind the tourist office.'}, answer='A', explanation='The direction is relative to the traveler after turning west along Hill Street.', evidence='The museum entrance is on your right.'),
    dict(id='q6', question='How far is the museum by this walking route?', options={'A':'About ninety meters.', 'B':'About five hundred meters.', 'C':'About five kilometers.'}, answer='B', explanation='Five hundred meters is a distance. Ninety minutes is the tour’s duration.', evidence='About five hundred meters by this route.'),
    dict(id='q7', question='What time does the museum open?', options={'A':'At ten.', 'B':'At eleven thirty.', 'C':'At nine.'}, answer='C', explanation='Mateo answers nine for the museum; ten is the guided walk’s departure time.', evidence="At nine. There's also a guided walk from the tourist office at ten."),
    dict(id='q8', question='When does the guided walk leave the tourist office?', options={'A':'At nine thirty.', 'B':'At ten.', 'C':'At noon.'}, answer='B', explanation='The departure time is ten. The reading later adds the classmates’ earlier meeting.', evidence="There's also a guided walk from the tourist office at ten."),
    dict(id='q9', question='How long does the guided walk last?', options={'A':'Ninety minutes.', 'B':'Five minutes.', 'C':'Five hundred minutes.'}, answer='A', explanation='The duration is ninety minutes; five dollars is its price.', evidence='It lasts ninety minutes and costs five dollars.'),
    dict(id='q10', question='Where does the guided walk end?', options={'A':'At the museum.', 'B':'At the station.', 'C':'At the market.'}, answer='C', explanation='The museum is an earlier stop; the market is the end of the walk.', evidence='it continues through the park and ends at the market.'),
]

READING_QUESTIONS = [
    dict(id='q1', question='When and where are Laura and Mateo meeting?', options={'A':'At ten inside the museum.', 'B':'At noon beside the market.', 'C':'At nine thirty at the tourist office.'}, answer='C', paragraph=1, explanation='The message adds their meeting point and time before the tour starts.', evidence='Our meeting point is the tourist office at nine thirty.'),
    dict(id='q2', question='How much does the guided walk cost per person?', options={'A':'Five dollars.', 'B':'Nine dollars.', 'C':'Ten dollars.'}, answer='A', paragraph=1, explanation='The five-dollar amount is the individual price of the guided walk.', evidence='It costs five dollars per person and lasts ninety minutes.'),
    dict(id='q3', question='Which place do they visit first on the tour?', options={'A':'The market.', 'B':'The museum.', 'C':'The café.'}, answer='B', paragraph=2, explanation='First introduces the museum visit, followed by the park and market.', evidence='First, the group visits the museum to see the craft exhibition.'),
    dict(id='q4', question='What time does the tour end at the market?', options={'A':'At eleven thirty.', 'B':'At ten thirty.', 'C':'At twelve thirty.'}, answer='A', paragraph=2, explanation='A ten o’clock departure and a ninety-minute walk lead to an eleven-thirty finish.', evidence='The tour ends at the market at eleven thirty.'),
    dict(id='q5', question='What can they do before lunch at noon?', options={'A':'Wait for the museum to open.', 'B':'Take a bus to another town.', 'C':'Look around the market stalls.'}, answer='C', paragraph=3, explanation='The free time after the tour is for exploring the market stalls.', evidence='We can look around the stalls before lunch at noon.'),
    dict(id='q6', question='Until what time is the market open?', options={'A':'Five.', 'B':'Six.', 'C':'Seven.'}, answer='B', paragraph=3, explanation='Six is the market’s closing time, so their noon lunch fits its hours.', evidence="The market is open until six, so there's time to explore."),
    dict(id='q7', question='What does Mateo recommend bringing?', options={'A':'Craft tools and paper.', 'B':'A school photograph and a kite.', 'C':'A camera and comfortable shoes.'}, answer='C', paragraph=3, explanation='Recommend bringing introduces two suggestions for the outing.', evidence='I recommend bringing a camera and comfortable shoes.'),
    dict(id='q8', question='How can they get around town?', options={'A':'On foot.', 'B':'Only by bus.', 'C':'By train between every stop.'}, answer='A', paragraph=4, explanation='On foot means walking from one place to another.', evidence='We can get around on foot.'),
    dict(id='q9', question='Why does Saturday work for their museum visit?', options={'A':'The museum is closed all weekend.', 'B':'It is open from nine to five that day.', 'C':'It opens only after the market closes.'}, answer='B', paragraph=4, explanation='The Saturday opening hours include their morning tour; Monday is the closed day.', evidence='the museum is closed on Monday, but it is open from nine to five on Saturday.'),
    dict(id='q10', question='Why should Laura keep the leaflet?', options={'A':'To change the tour’s price.', 'B':'To replace her camera.', 'C':'For the return trip.'}, answer='C', paragraph=4, explanation='Mateo gives the return trip as the reason to keep it.', evidence='Keep the leaflet for the return trip.'),
]
