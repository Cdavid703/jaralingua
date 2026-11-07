"""Approved Vocabulary only: ESL Pals Healthy Lifestyle, page 1, Task 2."""
INSTRUCTION = 'Match the words from the box to the correct pictures.'
WORDS = ['meditation','alcohol','blueberries','junk food','cigarettes','hiking','smoothies','stress','balanced diet']
AUDIO_ROOT = '/ingles/preintermedio-1/audio/unit3/healthy-vocabulary/'
VOCABULARY = [dict(term=t,spanish=s,audio=AUDIO_ROOT+t.replace(' ','-')+'.mp3') for t,s in [
 ('meditation','meditación; práctica de atención y calma'),
 ('alcohol','alcohol; bebidas alcohólicas'),
 ('blueberries','arándanos'),
 ('junk food','comida chatarra'),
 ('cigarettes','cigarrillos'),
 ('hiking','senderismo; caminar por rutas naturales'),
 ('smoothies','batidos de frutas u otros ingredientes'),
 ('stress','estrés; tensión por exigencias o preocupaciones'),
 ('balanced diet','dieta equilibrada; alimentación variada'),
]]
PICTURES = [
 dict(number=1,source='X20.png',answer='stress',width=338,height=338,alt='A person at a laptop with a worried expression and a hand on their forehead',explanation='The worried expression, laptop and marks around the head represent stress.'),
 dict(number=2,source='X18.png',answer='blueberries',width=640,height=423,alt='Small round blue berries with green leaves',explanation='These small blue berries are blueberries.'),
 dict(number=3,source='X21.png',answer='junk food',width=626,height=335,alt='A group of fast-food items, including a burger, pizza and fries',explanation='The group of fast-food items represents junk food.'),
 dict(number=4,source='X22.png',answer='balanced diet',width=224,height=224,alt='A round chart showing a variety of food groups',explanation='The variety of food groups represents a balanced diet.'),
 dict(number=5,source='X25.png',answer='alcohol',width=397,height=640,alt='A bottle beside a glass with a red drink',explanation='The bottle and wine glass represent alcohol.'),
 dict(number=6,source='X23.png',answer='smoothies',width=878,height=1280,alt='Two pink fruit drinks with strawberries and straws',explanation='The blended fruit drinks are smoothies.'),
 dict(number=7,source='X30.png',answer='meditation',width=601,height=640,alt='A person sitting cross-legged with closed eyes and relaxed hands',explanation='The still seated position and closed eyes represent meditation.'),
 dict(number=8,source='X28.png',answer='hiking',width=320,height=640,alt='A walker carrying a backpack and using walking poles',explanation='The backpack and walking poles connect the picture with hiking.'),
 dict(number=9,source='X27.png',answer='cigarettes',width=2000,height=2000,alt='An open packet containing thin white items with brown filters',explanation='The packet contains cigarettes.'),
]
