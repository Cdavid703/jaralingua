"""Original ESL Pals Hobbies page 8 and Exercise 2 at the top of page 9."""
MAIN_INSTRUCTION='Complete the grammar exercises for can / can’t.'
NEGATIVE_INSTRUCTION='Exercise 1: Change the sentence into the negative form. The first one is done for you.'
PERSONAL_INSTRUCTION='Exercise 2: Complete the sentences for you.'
EXAMPLE=dict(original='She can paint well.',model='She can’t paint well.')
FIXES=[]
for number,subject,verb in [(2,'You','write a letter'),(3,'He','sing'),(4,'They','play chess'),(5,'We','drive a bus'),(6,'He','study after school'),(7,'They','bake cakes'),(8,'You','go fishing'),(9,'We','drink alcohol'),(10,'She','drive a motorcycle')]:
 model=subject+' can’t '+verb+'.'
 FIXES.append(dict(number=number,original=subject+' can '+verb+'.',model=model,accepted=[model,subject+' cannot '+verb+'.',subject+' can not '+verb+'.'],explanation='Keep '+subject+' and '+verb+'. Change can to can’t or cannot, followed by the same base verb.'))
ROOT='/ingles/preintermedio-1/audio/unit2/more-grammar/'
EXISTING={'after school':'/ingles/preintermedio-1/audio/unit5/connected/after-school.mp3'}
PERSONAL=[]
for i,verb in enumerate(['read','paint well','create websites','play the guitar','do crossfit','run 10 km in an hour','sing'],1):
 paths={choice:ROOT+'personal-'+str(i)+'-'+slug+'.mp3' for choice,slug in [('can','can'),('can’t','cant')]}
 if i==7:paths={'can':'/ingles/preintermedio-1/audio/unit2/hobbies-grammar/can-sing.mp3','can’t':'/ingles/preintermedio-1/audio/unit2/hobbies-grammar/cant-sing.mp3'}
 PERSONAL.append(dict(number=i,verb=verb,original='I can / can’t '+verb+'.',audio=paths))
VOCABULARY=[dict(term=t,spanish=s,audio=EXISTING.get(t,ROOT+t.replace(' ','-')+'.mp3')) for t,s in [
 ('negative form','forma negativa; expresa que algo no ocurre o no se puede hacer'),('paint well','pintar bien'),('write a letter','escribir una carta'),('drive a bus','conducir un autobús'),('after school','después de la jornada escolar'),('bake cakes','hornear pasteles o tortas'),('go fishing','ir de pesca'),('alcohol','alcohol; en esta frase, bebidas alcohólicas'),('motorcycle','motocicleta'),('create websites','crear sitios web'),('play the guitar','tocar la guitarra'),('crossfit','tipo de entrenamiento físico variado e intenso'),('an hour','una hora'),
]]
AUDIO={v['term'].replace(' ','-'):dict(text=v['term'],path=v['audio'],kind='vocabulary',reused=v['term'] in EXISTING) for v in VOCABULARY}
for slug,text in [('main-instruction',MAIN_INSTRUCTION),('negative-instruction',NEGATIVE_INSTRUCTION),('personal-instruction',PERSONAL_INSTRUCTION),('example-positive',EXAMPLE['original']),('example-negative',EXAMPLE['model'])]:AUDIO[slug]=dict(text=text,path=ROOT+slug+'.mp3',kind='instruction' if slug.endswith('instruction') else 'worked-example')
for item in FIXES:
 for slug,text,kind in [('prompt-'+str(item['number']),item['original'],'prompt'),('negative-'+str(item['number']),item['model'],'gated-model')]:AUDIO[slug]=dict(text=text,path=ROOT+slug+'.mp3',kind=kind)
for item in PERSONAL:
 for choice,path in item['audio'].items():AUDIO['personal-'+str(item['number'])+'-'+('can' if choice=='can' else 'cant')]=dict(text='I '+choice+' '+item['verb']+'.',path=path,kind='personal-model',reused=item['number']==7)
# Expand the unit in narration while preserving the original printed personal sentence.
for choice,slug in [('can','can'),('can’t','cant')]:
 item=AUDIO['personal-6-'+slug];item['source_text']=item['text'];item['text']='I '+choice+' run ten kilometers in an hour.'
