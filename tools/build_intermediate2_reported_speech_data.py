from pathlib import Path
import json
R=Path(__file__).resolve().parents[1]
base='/assets/img/english-intermediate-2/unit-6/reported-speech/'
rows=[
('example','A witness speaks','A reporter interviews a woman in a yellow raincoat beside fallen branches.', ['A woman is talking to a reporter.','There are fallen branches.','I can see a microphone.'],['a woman was talking to a reporter','there were fallen branches','she could see a microphone'],['is talking → was talking','are → were','I can → she could']),
('flood','A flooded street','A rescue boat moves through a flooded street while residents watch from a bridge.', ['The street is flooded.','The rescue workers are helping people.','I can see a red boat.'],['the street was flooded','the rescue workers were helping people','she could see a red boat'],['is → was','are helping → were helping','I can → she could']),
('earthquake','After the earthquake','Inspectors examine a damaged stone building and rubble behind safety tape.', ['The buildings are damaged.','The inspectors are checking the damage.','There is rubble on the ground.'],['the buildings were damaged','the inspectors were checking the damage','there was rubble on the ground'],['are → were','are checking → were checking','there is → there was']),
('wildfire','Smoke over the hills','Firefighters study a map beside a truck with a distant forest fire behind them.', ['Smoke covers the hills.','The firefighters are looking at a map.','I can see a fire truck.'],['smoke covered the hills','the firefighters were looking at a map','she could see a fire truck'],['covers → covered','are looking → were looking','I can → she could']),
('drought','A dry reservoir','A farmer looks at a nearly empty reservoir surrounded by cracked ground.', ['The ground is dry.','The farmer is looking at the water.','The reservoir needs more rain.'],['the ground was dry','the farmer was looking at the water','the reservoir needed more rain'],['is → was','is looking → was looking','needs → needed']),
('landslide','The blocked road','Rocks and soil cover a mountain road near workers and an excavator.', ['Rocks block the road.','An excavator is waiting near the road.','The workers are checking the blockage.'],['rocks blocked the road','an excavator was waiting near the road','the workers were checking the blockage'],['block → blocked','is waiting → was waiting','are checking → were checking']),
('hurricane','A coastal storm','A view through a sheltered window shows bending palm trees and large waves.', ['The wind is strong.','The palm trees are bending.','There are large waves.'],['the wind was strong','the palm trees were bending','there were large waves'],['is → was','are bending → were bending','there are → there were']),
('interview','An entertainment interview','A musician and a journalist talk while a camera operator films in a studio.', ['The musician is talking.','The journalist holds a microphone.','The camera operator is recording the interview.'],['the musician was talking','the journalist held a microphone','the camera operator was recording the interview'],['is talking → was talking','holds → held','is recording → was recording']),
('sources','Check the story','Two journalists compare a flood photograph, a laptop and notes.', ['The journalists are checking a photograph.','The woman is pointing at the laptop.','There is a notebook on the desk.'],['the journalists were checking a photograph','the woman was pointing at the laptop','there was a notebook on the desk'],['are checking → were checking','is pointing → was pointing','there is → there was']),
('briefing','At the press briefing','A spokesperson speaks at a lectern while a journalist raises his hand.', ['The woman is speaking.','A reporter has a question.','The man is raising his hand.'],['the woman was speaking','a reporter had a question','the man was raising his hand'],['is speaking → was speaking','has → had','is raising → was raising']),
('shelter','Help at the shelter','Volunteers distribute water and blankets with temporary beds in a gym.', ['The volunteers are giving people water.','The families need blankets.','There are beds in the shelter.'],['the volunteers were giving people water','the families needed blankets','there were beds in the shelter'],['are giving → were giving','need → needed','there are → there were'])
]
scenes=[];items=[]
for i,(slug,title,alt,a,b,changes) in enumerate(rows):
 b=['Ana said that '+b[0]+'.']+['She said that '+v+'.' for v in b[1:]]
 scene=dict(id=i,slug=slug,title=title,alt=alt,image=base+slug+'-v1.webp',a=a,b=b,changes=changes)
 scenes.append(scene)
 for role in ['a','b']:items.append(dict(file=f'{slug}-{role}.mp3',text=' '.join(scene[role])))
instructions={
 'a':'Student A. Look carefully. Describe three details in the present. Say who or what you can see, what is happening, and one more detail. Speak slowly. Pause so your partner can remember.',
 'b':'Student B. Listen to your partner. Begin with your partner’s name and said that. Report the same three ideas. Change the verbs to the past for this practice. Change I to he, she, or they when it refers to your partner. Keep the original meaning.',
 'guide':'What did they say? Your teacher chooses two students. Student A describes the picture in the present. Student B reports what student A said. The class checks the meaning, the verbs and the pronouns. Then change roles for the next picture.'}
for id,text in instructions.items():items.append(dict(file=id+'.mp3',text=text))
# Five concrete vocabulary prompts per image; also used as inline word help.
vocabulary_rows=[
 [('witness','testigo'),('reporter','reportero/a'),('raincoat','impermeable'),('fallen branches','ramas caídas'),('microphone','micrófono')],
 [('flooded','inundado/a'),('rescue workers','rescatistas'),('boat','bote'),('residents','residentes'),('bridge','puente')],
 [('earthquake','terremoto'),('damaged','dañado/a'),('rubble','escombros'),('inspectors','inspectores'),('safety tape','cinta de seguridad')],
 [('wildfire','incendio forestal'),('smoke','humo'),('firefighters','bomberos'),('fire truck','camión de bomberos'),('hills','colinas')],
 [('drought','sequía'),('reservoir','embalse'),('cracked ground','suelo agrietado'),('farmer','agricultor/a'),('dry','seco/a')],
 [('landslide','deslizamiento de tierra'),('rocks','rocas'),('excavator','excavadora'),('blockage','obstrucción'),('road','carretera')],
 [('hurricane','huracán'),('palm trees','palmeras'),('strong wind','viento fuerte'),('waves','olas'),('bending','doblándose / inclinándose')],
 [('musician','músico/a'),('journalist','periodista'),('microphone','micrófono'),('guitar','guitarra'),('camera operator','camarógrafo/a')],
 [('journalists','periodistas'),('photograph','fotografía'),('notebook','cuaderno'),('laptop','computadora portátil'),('checking sources','verificando las fuentes')],
 [('press briefing','rueda de prensa informativa'),('spokesperson','portavoz'),('lectern','atril'),('raising his hand','levantando la mano'),('notebooks','cuadernos')],
 [('shelter','refugio'),('volunteers','voluntarios'),('blankets','mantas / cobijas'),('bottled water','agua embotellada'),('temporary beds','camas provisionales')]
]
# Reuse an existing word recording only when its exact spoken text matches.
existing={}
for folder in ['unit-6-explanation','unit-6-newsroom']:
 path=R/'ingles/intermediate-2/audio'/folder/'models.json'
 if path.exists():
  for item in json.loads(path.read_text())['items']:
   if item['file'].startswith('word-'):
    existing[item['text'].strip().rstrip('.').lower()]='/ingles/intermediate-2/audio/'+folder+'/'+item['file']
glossary={}
for scene,words in zip(scenes,vocabulary_rows):
 scene['vocabulary']=[word for word,_ in words]
 for term,spanish in words:glossary[term]=dict(term=term,spanish=spanish)
for term,spanish in [('reported speech','discurso indirecto'),('swap roles','intercambiar los papeles'),('partner','compañero/a'),('meaning','significado / sentido'),('pronouns','pronombres')]:
 glossary[term]=dict(term=term,spanish=spanish)
for term,word in glossary.items():
 file='word-'+term.replace(' ','-')+'.mp3'
 word['audio']=existing.get(term,'/ingles/intermediate-2/audio/unit-6-reported-speech/'+file)
 if term not in existing:items.append(dict(file=file,text=term))
config=dict(scenes=scenes,instructions=instructions,glossary=list(glossary.values()),audioRoot='/ingles/intermediate-2/audio/unit-6-reported-speech/')
(R/'assets/js/english-intermediate2-reported-speech-data.js').write_text('window.ReportedSpeechLesson = '+json.dumps(config,ensure_ascii=False,indent=2)+';\n')
audio=R/'ingles/intermediate-2/audio/unit-6-reported-speech';audio.mkdir(parents=True,exist_ok=True)
old=json.loads((audio/'models.json').read_text()) if (audio/'models.json').exists() else {'items':[]}
for item in items:
 for prior in old['items']:
  if prior['file']==item['file'] and prior['text']==item['text']:
   item.update({k:prior[k] for k in ['bytes','sha256','voiceSettings','generationText'] if k in prior})
(audio/'models.json').write_text(json.dumps(dict(provider='ElevenLabs',voiceId='pv8WYYW60prEkDbDXyC0',voiceName='David',modelId='eleven_multilingual_v2',items=items),ensure_ascii=False,indent=2)+'\n')
print(len(scenes),'scenes;',len(items),'recordings')
