"""Original ESL Pals Hobbies writing questions, lower page 9 and page 10."""
INSTRUCTION='Write answers to the following questions.'
QUESTIONS=[
 dict(number=1,text='Can you play the guitar? If not, would you like to?',starter='I can / can’t play the guitar. If not: I would / wouldn’t like to learn because …',guidance='Say whether you can play the guitar. If you cannot, also say whether you would like to learn. Use your own experience.'),
 dict(number=2,text='Can you cook? What do you like cooking?',starter='I can / can’t cook. I like cooking … / I would like to learn to cook …',guidance='Say whether you can cook and explain what you like cooking. If you cannot cook, you can explain that and say what you would like to learn.'),
 dict(number=3,text='Can you bake cakes? Do you think it is difficult?',starter='I can / can’t bake cakes. I think it is / isn’t difficult because …',guidance='Answer both parts: your ability to bake cakes and your view of how difficult it is. You may explain your opinion.'),
 dict(number=4,text='What hobbies do your family members have?',starter='My family members enjoy … My … likes …',guidance='Describe hobbies that members of your family have. You can give an example for one or more people.'),
 dict(number=5,text='Why are hobbies important?',starter='Hobbies are important because … For example, …',guidance='Explain why hobbies matter in your view. You can support your ideas with a reason or an example.'),
]
SELF_CHECK=['I answered the parts of the question that apply to me.','I checked my sentences, capital letters and punctuation.']
ROOT='/ingles/preintermedio-1/audio/unit2/my-hobbies/'
REUSED={
 'play the guitar':'/ingles/preintermedio-1/audio/unit2/more-grammar/play-the-guitar.mp3',
 'bake cakes':'/ingles/preintermedio-1/audio/unit2/more-grammar/bake-cakes.mp3',
 'hobbies':'/ingles/preintermedio-1/audio/unit2/talk-hobbies/hobbies.mp3',
 'cooking':'/ingles/preintermedio-1/audio/unit2/hobby-vocabulary/cooking.mp3',
}
VOCABULARY=[dict(term=t,spanish=s,audio=REUSED.get(t,ROOT+t.replace(' ','-')+'.mp3')) for t,s in [
 ('play the guitar','tocar la guitarra'),('if not','si no; en caso de que la respuesta anterior sea negativa'),('would you like to','te gustaría; se usa para preguntar por un deseo o interés'),('cooking','cocinar; la preparación de comida'),('bake cakes','hornear pasteles o tortas'),('difficult','difícil; que requiere esfuerzo o habilidad'),('family members','miembros de la familia'),('hobbies','pasatiempos; actividades que se realizan por gusto'),('important','importante; que tiene valor o relevancia'),
]]
AUDIO={v['term'].replace(' ','-'):dict(text=v['term'],path=v['audio'],kind='vocabulary',reused=v['term'] in REUSED) for v in VOCABULARY}
AUDIO['instruction']=dict(text=INSTRUCTION,path=ROOT+'instruction.mp3',kind='instruction')
for q in QUESTIONS:AUDIO['question-'+str(q['number'])]=dict(text=q['text'],path=ROOT+'question-'+str(q['number'])+'.mp3',kind='question')
