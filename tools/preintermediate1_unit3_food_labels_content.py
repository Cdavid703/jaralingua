"""Complementary session-6 label reading; all amounts are fictional and match Course Overview."""
TITLE='Food Labels'
AUDIO_ROOT='/ingles/preintermedio-1/audio/unit3/food-labels/'
LABEL={'serving_g':'30','servings':'2','bag_g':'60','rows':[
 {'name':'Energy','serving':'120','bag':'240','unit':'kcal'},
 {'name':'Fat','serving':'4','bag':'8','unit':'g'},
 {'name':'Sugars','serving':'3','bag':'6','unit':'g'},
 {'name':'Salt','serving':'0.2','bag':'0.4','unit':'g'}]}
WORD_BANK=['serving','servings per bag','sugar','fat','salt','grams','calories','per serving']
INSTRUCTIONS={
 'words':'Read each definition and write the matching word or phrase from the word bank. Use each entry once. Write only the word or phrase.',
 'label':'Use the fictional snack label. Read the correct column for one serving or the whole bag. Write a number and its unit for each answer. Use grams, kilocalories or servings as appropriate. Numbers can be written as words or numerals.',
 'questions':'For items one to four, complete each question with much or many. For items five to eight, use the fictional label to complete the answer with a number and its unit. Write only the missing word or amount.'}
WORDS=[]
for n,(prompt,answer,model,explanation) in enumerate([
 ('A portion used as the basis for the values on a food label.','serving','A serving is the portion used for the values on a food label.','Serving names one portion. One serving on our label is 30 g.'),
 ('The number of these portions inside one bag.','servings per bag','Servings per bag tells you how many portions the bag contains.','Our bag contains two servings. This is a count of portions, not a weight.'),
 ('The word for the sweet substance listed as Sugars on this label.','sugar','Sugar is listed in the Sugars row of this label.','Use sugar from the word bank. The row title uses the plural Sugars.'),
 ('The nutrient named in the row showing four grams in one serving.','fat','The label shows four grams of fat in one serving.','Fat is the row name. Grams is the unit used for its amount.'),
 ('The word in the row showing zero point two grams in one serving.','salt','The label shows zero point two grams of salt in one serving.','Read the Salt row and the Per serving column: 0.2 g.'),
 ('The unit of mass abbreviated as g.','grams','The letter g stands for grams.','Grams measures mass. It is different from kcal, the energy unit on this label.'),
 ('The word often used for food-label energy information; this label gives energy in kcal.','calories','The word calories is often used for energy information on food labels.','Choose calories from the word bank. In this practice, the energy values are written in kcal.'),
 ('The phrase meaning for one portion, rather than the whole bag.','per serving','Per serving means for one portion.','The Per serving and Per bag columns describe different amounts of the same fictional snack.')],1):
 WORDS.append(dict(id=f'words-{n}',number=n,prompt=prompt,answer=answer,accepted=[answer],model=model,explanation=explanation,kind='word'))
READING=[]
for n,(prompt,answer,model,explanation) in enumerate([
 ('What is the serving size? Write the amount in grams.','30 g','One serving is thirty grams.','The serving-size information gives 30 g for one serving.'),
 ('How many servings are in the whole bag? Include servings.','2 servings','There are two servings in the bag.','The label states two servings per bag. This is not the 60 g bag weight.'),
 ('What is the whole bag’s mass? Write the amount in grams.','60 g','The whole bag is sixty grams.','Two servings of 30 g make 60 g for the whole bag.'),
 ('How much fat is in one serving? Write the amount in grams.','4 g','There are four grams of fat in one serving.','Read Fat under Per serving: 4 g. The bag column gives 8 g.'),
 ('How much sugar is in the whole bag? Write the amount in grams.','6 g','There are six grams of sugar in the whole bag.','Read Sugars under Per bag: 6 g. One serving has 3 g.'),
 ('How much salt is in one serving? Write the amount in grams.','0.2 g','There are zero point two grams of salt in one serving.','Read Salt under Per serving: 0.2 g. Keep the decimal point; 2 g is a different amount.'),
 ('How much salt is in the whole bag? Write the amount in grams.','0.4 g','There are zero point four grams of salt in the whole bag.','Two servings of 0.2 g make 0.4 g. Do not use the one-serving amount.'),
 ('What is the whole bag’s energy value? Include kcal or kilocalories.','240 kcal','The whole bag contains two hundred and forty kilocalories.','Read Energy under Per bag: 240 kcal. The per-serving value is 120 kcal.')],1):
 READING.append(dict(id=f'label-{n}',number=n,prompt=prompt,answer=answer,accepted=[answer],model=model,explanation=explanation,kind='quantity'))
QUESTIONS=[]
for n,(prompt,answer,model,explanation,kind) in enumerate([
 ('How ___ sugar is there in one serving?','much','How much sugar is there in one serving?','Use much with the uncountable noun sugar.','word'),
 ('How ___ servings are there in the bag?','many','How many servings are there in the bag?','Use many with the plural countable noun servings.','word'),
 ('How ___ grams of fat are there in one serving?','many','How many grams of fat are there in one serving?','Use many because grams is a plural countable unit, even though fat names a substance.','word'),
 ('How ___ salt is there in the whole bag?','much','How much salt is there in the whole bag?','Use much with the uncountable noun salt.','word'),
 ('How much sugar is there in one serving? There are ___. Include grams.','3 g','There are three grams of sugar in one serving.','The Per serving column gives 3 g in the Sugars row.','quantity'),
 ('How many servings are there in the bag? There are ___. Include servings.','2 servings','There are two servings in the bag.','The bag contains two servings. Count portions, not grams.','quantity'),
 ('How much fat is there in the whole bag? There are ___. Include grams.','8 g','There are eight grams of fat in the whole bag.','Read Fat under Per bag: 8 g. One serving contains 4 g.','quantity'),
 ('How much salt is there in one serving? There are ___. Include grams.','0.2 g','There are zero point two grams of salt in one serving.','Read Salt under Per serving: 0.2 g. Both the number and the unit are needed.','quantity')],1):
 QUESTIONS.append(dict(id=f'questions-{n}',number=n,prompt=prompt,answer=answer,accepted=[answer],model=model,explanation=explanation,kind=kind))
TASKS={'words':WORDS,'label':READING,'questions':QUESTIONS}
EXAMPLES={
 'words':dict(id='example-words',text='A portion is a serving. Per serving means for one portion.'),
 'label':dict(id='example-label',text='The bag contains two servings. One serving is thirty grams, so the whole bag is sixty grams.'),
 'questions':dict(id='example-questions',text='How much fat is there? How many grams are there? Use much with fat and many with grams.')}
VOCABULARY=[dict(term=t,spanish=s,audio=AUDIO_ROOT+'word-'+slug+'.mp3') for t,s,slug in [
 ('serving','porción; cantidad usada como referencia en la etiqueta','serving'),('servings per bag','porciones por bolsa o paquete','servings-per-bag'),('sugar','azúcar; en esta etiqueta se consulta la fila Sugars','sugar'),('fat','grasa; nutriente indicado en la etiqueta','fat'),('salt','sal','salt'),('grams','gramos; unidad de masa abreviada g','grams'),('calories','calorías; aquí, vocabulario de energía expresada en kcal','calories'),('per serving','por porción','per-serving'),('per bag','por bolsa o paquete completo','per-bag'),('serving size','tamaño de la porción; aquí, su masa en gramos','serving-size'),('whole bag','bolsa o paquete completo','whole-bag'),('amount','cantidad','amount'),('column','columna de la tabla','column'),('row','fila de la tabla','row'),('kilocalories','kilocalorías; unidad de energía abreviada kcal','kilocalories'),('decimal point','punto decimal; distingue 0.2 de 2','decimal-point')]]
AUDIO={}
for k,text in INSTRUCTIONS.items():AUDIO['instruction-'+k]=dict(text=text,path=AUDIO_ROOT+'instruction-'+k+'.mp3',kind='instruction')
for e in EXAMPLES.values():AUDIO[e['id']]=dict(text=e['text'],path=AUDIO_ROOT+e['id']+'.mp3',kind='worked-example')
for items in TASKS.values():
 for i in items:AUDIO[i['id']]=dict(text=i['model'],path=AUDIO_ROOT+i['id']+'.mp3',kind='gated-model')
for v in VOCABULARY:AUDIO['word-'+v['audio'].rsplit('word-',1)[1].removesuffix('.mp3')]=dict(text=v['term'],path=v['audio'],kind='vocabulary')
LABEL_NARRATION='Fictional practice label. One serving is thirty grams. There are two servings per bag, so the whole bag is sixty grams. Energy: one hundred and twenty kilocalories per serving, and two hundred and forty per bag. Fat: four grams per serving, and eight grams per bag. Sugars: three grams per serving, and six grams per bag. Salt: zero point two grams per serving, and zero point four grams per bag.'
AUDIO['label-guide']=dict(text=LABEL_NARRATION,path=AUDIO_ROOT+'label-guide.mp3',kind='reference')
