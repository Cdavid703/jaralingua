"""Original ESL Pals page 3 Listening Practice; evidence checked against the linked video."""
VIDEO_ID='9mu_-_wfZEY'
VIDEO_URL='https://www.youtube.com/watch?v='+VIDEO_ID
INSTRUCTION='Task 1: Watch the video, then decide if the following statements are true or false.'
OPINION_INSTRUCTION='Task 2: Which of the people’s hobbies sound most and least interesting?'
# Wording and sequence are unchanged, including the worksheet spellings of names.
ITEMS=[
 dict(statement='Matthew is talking to his aunt.',answer='True',start=4,end=14,explanation='The opening identifies the conversation as one between Matthew and his aunt.'),
 dict(statement='Christine loves snowboarding.',answer='True',start=18,end=27,explanation='His classmate is in the mountains enjoying snowboarding.'),
 dict(statement='Jason prefers drawing cartoons.',answer='False',start=27,end=42,explanation='Jason now prefers cooking to his earlier cartoon-drawing hobby.'),
 dict(statement='Jason enjoys making strange biscuits.',answer='True',start=32,end=42,explanation='His current hobby involves baking unusual biscuits.'),
 dict(statement='Tanya played guitar at Matthew’s party.',answer='True',start=43,end=49,explanation='The aunt recognises Tanya from her guitar performance at the party.'),
 dict(statement='Tanya wants to be a musician.',answer='True',start=49,end=55,explanation='Her frequent practice supports her ambition to become a musician.'),
 dict(statement='Steven is not good at volleyball.',answer='True',start=55,end=68,explanation='Matthew rejects the aunt’s suggestion about Steven’s volleyball ability.'),
 dict(statement='Steven loves sending messages on the computer.',answer='True',start=60,end=68,explanation='Computer messaging is the interest Matthew associates with Steven.'),
 dict(statement='Molly is always out driving her car.',answer='False',start=68,end=78,explanation='Molly’s outings involve bicycles rather than a car.'),
 dict(statement='Molly repairs bikes.',answer='True',start=71,end=78,explanation='She can help when a bicycle needs fixing.'),
 dict(statement='Ivan loves difficult English questions.',answer='False',start=78,end=90,explanation='His favourite challenging questions concern science, not English.'),
 dict(statement='Ivan reads different science magazines online.',answer='True',start=82,end=90,explanation='He uses online science publications to support that interest.'),
]
VOCABULARY=[dict(term=t,spanish=s,audio='/ingles/preintermedio-1/audio/unit2/people-hobbies/'+t.replace(' ','-')+'.mp3') for t,s in [
 ('aunt','tía'),
 ('snowboarding','deporte de deslizarse sobre la nieve en una tabla'),
 ('drawing cartoons','dibujar caricaturas o dibujos animados'),
 ('strange','extraño; poco habitual'),
 ('biscuits','galletas; aquí se usa el término británico'),
 ('musician','músico o música; persona que toca o compone música'),
 ('volleyball','voleibol'),
 ('sending messages','enviar mensajes'),
 ('repairs','repara; arregla algo que no funciona bien'),
 ('science','ciencia; estudio del mundo natural'),
 ('magazines','revistas'),
 ('online','en línea; a través de internet'),
 ('most','más; aquí, lo que resulta más interesante'),
 ('least','menos; aquí, lo que resulta menos interesante'),
]]
AUDIO={v['term'].replace(' ','-'):dict(text=v['term'],path=v['audio'],kind='vocabulary') for v in VOCABULARY}
for slug,text in [('listening-instruction',INSTRUCTION),('opinion-instruction',OPINION_INSTRUCTION)]:AUDIO[slug]=dict(text=text,path='/ingles/preintermedio-1/audio/unit2/people-hobbies/'+slug+'.mp3',kind='instruction')
