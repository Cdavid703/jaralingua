"""Healthy Lifestyle p.2 Tasks 1-2 only, original wording and word box."""
WORDS=['carbohydrate','plant-based','calories','aerobic exercise','processed food']
AUDIO_ROOT='/ingles/preintermedio-1/audio/unit3/food-fitness/'
INSTRUCTIONS={'definitions':'Match the words from the box to their definitions.','sentences':'Complete the sentences using the words.'}
DEFINITIONS=[
 dict(number='1',text='Food that is changed from its natural form, like packaged snacks.',answer='processed food',explanation='This definition describes food changed from its natural form.'),
 dict(number='2',text='Units that show how much energy is in the food we eat.',answer='calories',explanation='Calories are the units of energy described in this definition.'),
 dict(number='3',text='A type of nutrient in foods like bread, rice, and fruits that give us energy.',answer='carbohydrate',explanation='Carbohydrate is the nutrient named by this definition.'),
 dict(number='4',text='Eating foods from plants, such as fruits, veggies, and nuts, and less meat and dairy.',answer='plant-based',explanation='Plant-based describes the pattern of eating in this definition.'),
 dict(number='5',text='Active activities that make your heart rate and breathing faster, like swimming or running, for better heart health.',answer='aerobic exercise',explanation='Aerobic exercise is the type of activity described here.'),
]
SENTENCES=[
 dict(number='a',before='She follows a ',after=" diet, which means she doesn't eat meat or dairy products.",answer='plant-based',accepted=['plant-based','plant based'],explanation='Plant-based describes the kind of diet in this sentence.',model="She follows a plant-based diet, which means she doesn't eat meat or dairy products."),
 dict(number='b',before='Eating a lot of ',after=', like pasta and bread, can give you energy for your daily activities.',answer='carbohydrate',accepted=['carbohydrate','carbohydrates'],explanation='Carbohydrate and carbohydrates are both accepted here.',model='Eating a lot of carbohydrates, like pasta and bread, can give you energy for your daily activities.'),
 dict(number='c',before='The label on this can of soda tells you that it has a lot of ',after=', so you might want to choose a healthier drink.',answer='calories',accepted=['calories'],explanation='The label shows an amount of energy, measured in calories.',model='The label on this can of soda tells you that it has a lot of calories, so you might want to choose a healthier drink.'),
 dict(number='d',before='Doing regular ',after=', like running or swimming, can strengthen your heart and lungs.',answer='aerobic exercise',accepted=['aerobic exercise','aerobic exercises'],explanation='Aerobic exercise and aerobic exercises are both accepted here.',model='Doing regular aerobic exercise, like running or swimming, can strengthen your heart and lungs.'),
 dict(number='e',before='Many schools are replacing ',after=' in their cafeterias with healthier, homemade options.',answer='processed food',accepted=['processed food','processed foods'],explanation='Processed food and processed foods are both accepted here.',model='Many schools are replacing processed food in their cafeterias with healthier, homemade options.'),
]
VOCABULARY=[dict(term=t,spanish=s,audio=AUDIO_ROOT+slug+'.mp3') for t,s,slug in [
 ('carbohydrate','carbohidrato','carbohydrate'),('carbohydrates','carbohidratos','carbohydrates'),
 ('plant-based','basado principalmente en alimentos de origen vegetal','plant-based'),
 ('calories','calorías; unidades de energía','calories'),('aerobic exercise','ejercicio aeróbico','aerobic-exercise'),('processed food','comida procesada','processed-food'),
 ('packaged snacks','aperitivos o pasabocas envasados','packaged-snacks'),('nutrient','nutriente','nutrient'),
 ('dairy','lácteos; productos derivados de la leche','dairy'),('heart rate','frecuencia cardíaca','heart-rate'),
 ('breathing','respiración','breathing'),('soda','gaseosa; refresco','soda'),('strengthen','fortalecer','strengthen'),
 ('cafeterias','cafeterías; comedores','cafeterias'),('homemade','hecho en casa; casero','homemade'),
]]
AUDIO_ITEMS=[dict(name=v['audio'].rsplit('/',1)[1].removesuffix('.mp3'),text=v['term']) for v in VOCABULARY]
AUDIO_ITEMS += [dict(name='instruction-'+k,text=v) for k,v in INSTRUCTIONS.items()]
AUDIO_ITEMS += [dict(name='definition-'+str(i+1),text=v['text']) for i,v in enumerate(DEFINITIONS)]
AUDIO_ITEMS += [dict(name='model-'+v['number'],text=v['model']) for v in SENTENCES]
