"""Healthy Lifestyle p.9 Task 1 only: original terms, own definitions and examples."""
TITLE='Healthy Lifestyle: Words in Context'
INSTRUCTION='Task 1: Define the words below, then use them in your own example sentences.'
READING='reading-unit-3-benefits-of-a-healthy-lifestyle.html'
AUDIO_ROOT='/ingles/preintermedio-1/audio/unit3/reading-vocabulary/'
ITEMS=[dict(id=str(i),term=t,printed=t+('.' if i<8 else ''),paragraph=p) for i,(t,p) in enumerate([('energised',2),('endorphins',3),('anxiety',3),('cognitive function',4),('mental well-being',5),('chronic diseases',6),('self-esteem',7),('substantial',8)],1)]
REUSED={t:'/ingles/preintermedio-1/audio/unit3/healthy-reading/'+t.replace(' ','-')+'.mp3' for t in ['energised','anxiety','cognitive function','chronic diseases','self-esteem','substantial']}
REUSED['endorphins']='/ingles/preintermedio-1/audio/unit3/healthy-video/endorphins.mp3'
VOCABULARY=[dict(term=t,spanish=s,audio=REUSED.get(t,AUDIO_ROOT+t.replace(' ','-')+'.mp3')) for t,s in [('energised','con energía; lleno de energía'),('endorphins','endorfinas'),('anxiety','ansiedad'),('cognitive function','función cognitiva; capacidades mentales'),('mental well-being','bienestar mental'),('chronic diseases','enfermedades crónicas'),('self-esteem','autoestima'),('substantial','considerable; importante'),('define','definir; explicar el significado'),('example sentences','oraciones de ejemplo')]]
AUDIO_ITEMS=[dict(name='instruction',text=INSTRUCTION)]+[dict(name=v['term'].replace(' ','-'),text=v['term']) for v in VOCABULARY if v['term'] not in REUSED]
AUDIO={a['name']:dict(text=a['text'],path=AUDIO_ROOT+a['name']+'.mp3') for a in AUDIO_ITEMS}
SELF_CHECK=['I checked the meaning in the article.','I checked how the expression works in my own sentence.']
