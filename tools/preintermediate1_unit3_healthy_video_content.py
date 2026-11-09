"""Original PDF pp.3-4, Tasks 1-2. Keys checked against original English video."""
VIDEO_ID='Cg_GW7yhq20'
VIDEO_URL='https://www.youtube.com/watch?v='+VIDEO_ID
INSTRUCTIONS={'quotes':'Complete the quotes from the video, using the words from the box.','statements':'Decide if the statements based on the video are true or false:'}
WORDS=['depression','cycling','smoking','better','mental','quitting','money','calories','problems','endorphins']
QUOTES=[
 dict(number='1',before='Physical activity releases feel-good hormones called ',after=', which help us sleep and feel better. It also improves our physical fitness, which tends to make people feel better in general.',answer='endorphins',start=18,end=29,explanation='The activity section names the hormones associated with exercise.'),
 dict(number='2',before='Even small amounts of regular physical activity can improve your mental wellbeing, especially if it’s doing something you enjoy. Physical activity is even a recommended treatment for some types of ',after='.',answer='depression',start=29,end=41,explanation='The video names this condition in its discussion of exercise.'),
 dict(number='3',before='You can get active at your own pace, in your own way. There’s no need to join a gym or even spend any ',after='.',answer='money',start=41,end=48,explanation='The speaker explains that being active need not cost anything.'),
 dict(number='4',before='Taking a brisk walk at lunchtime or walking to get where we’re going, getting active in the garden, or ',after=' once or twice a week are great options.',answer='cycling',start=52,end=60,explanation='A bicycle-based activity completes this list of examples.'),
 dict(number='5',before='Eating better can play a big role in our health and wellbeing. It won’t come as a surprise to learn that what we eat, and how much, plays a big part in our physical health, which can impact our ',after=' health too.',answer='mental',start=93,end=105,explanation='The speaker connects physical health with another aspect of wellbeing.'),
 dict(number='6',before='Ideally, we should aim to eat a healthy, balanced diet with plenty of fruit and veg. It’s important to keep an eye on your ',after=', and minimise foods that are high in sugar, fat and salt.',answer='calories',start=105,end=116,explanation='The food section refers to the energy measure named in the word box.'),
 dict(number='7',before='Alcohol, caffeine, tobacco, and even drugs may seem tempting when we’re stressed or tired. But they can cause more ',after=' than they solve.',answer='problems',start=120,end=138,explanation='The speaker contrasts short-term appeal with possible difficulties.'),
 dict(number='8',before='All these habits can complicate our sleep patterns, and affect how anxious and depressed we feel. So try cutting down (or even ',after=').',answer='quitting',start=138,end=149,explanation='The next word goes beyond reducing a habit to stopping it.'),
 dict(number='9',before='Alcohol in particular can worsen our moods, so cutting down can really help us feel ',after='.',answer='better',start=149,end=155,explanation='The missing comparative describes a change in how someone feels.'),
 dict(number='10',before='As for cigarettes, stopping ',after=' is one of the best things you can do for your body and brain. You’ll breathe easier, feel better, and save money!',answer='smoking',start=164,end=174,explanation='The final section identifies the habit connected with cigarettes.'),
]
STATEMENTS=[
 dict(number='1',statement='Physical activity, diet, alcohol, smoking and drugs can all improve our mental health.',answer='False',start=9,end=18,explanation='The introduction says these factors affect wellbeing in different ways.'),
 dict(number='2',statement='Physical activity negatively affects our sleep.',answer='False',start=18,end=29,explanation='The activity section connects exercise with improved sleep.'),
 dict(number='3',statement='Physical activity is even a recommended treatment for some types of depression.',answer='True',start=29,end=41,explanation='The video explicitly makes this connection during the activity section.'),
 dict(number='4',statement='To get fit and healthy, you need to join a gym.',answer='False',start=41,end=48,explanation='Gym membership is presented as unnecessary for getting active.'),
 dict(number='5',statement='We should aim to eat a healthy, balanced diet with plenty of fruit and veg.',answer='True',start=105,end=116,explanation='This matches the approach to food described in that section.'),
 dict(number='6',statement='The video recommends eating foods that are high in sugar, fat and salt.',answer='False',start=105,end=116,explanation='The speaker instead suggests reducing foods high in those ingredients.'),
 dict(number='7',statement='Alcohol improves people’s moods, helping people feel better.',answer='False',start=149,end=155,explanation='The alcohol section describes a potentially negative effect on mood.'),
 dict(number='8',statement='Stopping smoking makes people breathe easier, feel better, and save money.',answer='True',start=164,end=174,explanation='These are the three benefits listed in the smoking section.'),
]
AUDIO_ROOT='/ingles/preintermedio-1/audio/unit3/healthy-video/'
VOCABULARY=[]
for term,spanish in [
 ('depression','depresión'),('cycling','montar en bicicleta; practicar ciclismo'),('smoking','fumar; consumo de tabaco'),('better','mejor'),('mental','mental; relacionado con la mente'),('quitting','dejar de hacer algo; abandonar un hábito'),('money','dinero'),('calories','calorías; unidades de energía'),('problems','problemas'),('endorphins','endorfinas'),
 ('feel-good hormones','hormonas asociadas a sensaciones de bienestar'),('physical fitness','condición física'),('wellbeing','bienestar'),('at your own pace','a tu propio ritmo'),('brisk walk','caminata a paso ligero'),('balanced diet','dieta equilibrada; alimentación variada'),('caffeine','cafeína'),('tobacco','tabaco'),('tempting','tentador; que atrae o resulta apetecible'),('cutting down','reducir la cantidad o la frecuencia'),('worsen','empeorar'),('moods','estados de ánimo'),('breathe easier','respirar con más facilidad'),('stressed','estresado; con tensión o preocupaciones'),('anxious','ansioso; inquieto o preocupado'),('quotes','citas; fragmentos de lo que dice alguien'),('statements','afirmaciones; enunciados')]:
 VOCABULARY.append(dict(term=term,spanish=spanish,audio=AUDIO_ROOT+term.replace(' ','-')+'.mp3'))
REUSED={'cycling':'/ingles/preintermedio-1/audio/unit2/hobby-vocabulary/cycling.mp3','calories':'/ingles/preintermedio-1/audio/unit3/food-fitness/calories.mp3','balanced diet':'/ingles/preintermedio-1/audio/unit3/healthy-vocabulary/balanced-diet.mp3'}
for v in VOCABULARY:
 if v['term'] in REUSED:v['audio']=REUSED[v['term']]
AUDIO_ITEMS=[dict(name=v['term'].replace(' ','-'),text=v['term']) for v in VOCABULARY if v['term'] not in REUSED]
AUDIO_ITEMS += [dict(name='instruction-'+key,text=value) for key,value in INSTRUCTIONS.items()]
