"""Build the canonical public teaching content; reuse Greenford images and word models."""
from pathlib import Path
import json
ROOT=Path(__file__).resolve().parents[1]
news=json.loads((ROOT/'assets/data/english-intermediate2-unit6-newsroom.json').read_text())
# Cloze alternatives are curated so only one answer fits the sentence's meaning.
rows=[
('headline','The headline tells us the main news.','The ___ is the title at the top of a news report.',['supplies','shelter'],'HEAD-line','Make HEAD stronger. Link the two parts without adding a syllable.'),
('reporter','The reporter asks questions.','The ___ interviews people and presents the news.',['flood','shelter'],'re-POR-ter','Make the middle syllable stronger. Keep the first and last syllables light.'),
('witness','A witness saw the tree fall.','A ___ saw the tree fall and described what happened.',['headline','warning'],'WIT-ness','Use two syllables. Make WIT stronger and keep the final s audible.'),
('flood','The flood covered the road.','River water covered the road during the ___.',['statement','source'],'FLOOD','Use one syllable. This word does not rhyme with food. Listen to the short vowel and final d.'),
('damage','The storm caused damage.','The broken windows show physical ___ to the library.',['supplies','reporter'],'DAM-age','Make the first syllable stronger. Keep the final sound; do not add a third syllable.'),
('warning','The council sent a warning.','The council sent a ___ about danger near the river.',['shelter','rescue crew'],'WAR-ning','Use two syllables. Finish with the nasal sound in -ing, without adding a separate g syllable.'),
('rescue crew','The rescue crew arrived by boat.','The ___ used a boat to bring people to dry ground.',['headline','damage'],'RES-cue CREW','Say rescue in two syllables, then crew in one. Keep the words connected.'),
('shelter','The school became a shelter.','Families stayed in a temporary ___ with beds and blankets.',['witness','headline'],'SHEL-ter','Start with the quiet sh sound. Make SHEL stronger and the last syllable lighter.'),
('supplies','Volunteers brought supplies.','Volunteers brought ___ such as water, food and blankets.',['evidence','damage'],'sup-PLIES','Make the second syllable stronger. Keep the final voiced z sound.'),
('source','Check the source of the news.','The editor checked the original ___ of the information.',['flood','shelter'],'SOURCE','Use one syllable. Keep the final s audible without adding a vowel after it.'),
('statement','The council released a statement.','The council released an official ___ explaining its decision.',['witness','flood'],'STATE-ment','Start directly with st, without adding a vowel before it. Make STATE stronger.'),
('evidence','The photos provide evidence.','The before-and-after photos provide ___ of the damage.',['supplies','shelter'],'EV-i-dence','Use three syllables. Make the first one stronger and keep the others light.')]
words=[]
for term,sentence,cloze,distractors,stress,tip in rows:
 scene=next(s for s in news['scenes'] if s['word']==term)
 gloss=next(s for s in news['glossary'] if s['term']==term)
 words.append(dict(id=scene['id'],term=term,spanish=gloss['spanish'],image=scene['image'],alt=scene['alt'],definition=scene['definition'],audio=gloss['audio'],sentence=sentence,sentenceAudio='/ingles/intermediate-2/audio/unit-6-news-quest/'+scene['id']+'-sentence.mp3',cloze=cloze,distractors=distractors,stress=stress,tip=tip))
(ROOT/'assets/data/english-intermediate2-news-quest.json').write_text(json.dumps(dict(title='News Quest',words=words),ensure_ascii=False,indent=2)+'\n')
folder=ROOT/'ingles/intermediate-2/audio/unit-6-news-quest';folder.mkdir(parents=True,exist_ok=True)
manifest=folder/'models.json'
old=json.loads(manifest.read_text()) if manifest.exists() else {}
cached={i['id']:i for i in old.get('items',[])}
items=[]
for w in words:
 item=dict(id=w['id'],file=w['id']+'-sentence.mp3',text=w['sentence'],kind='section')
 if cached.get(w['id'],{}).get('text')==item['text']:item.update(cached[w['id']])
 items.append(item)
manifest.write_text(json.dumps(dict(provider='ElevenLabs',voiceId='EXAVITQu4vr4xnSDxMaL',voiceName='Sarah',modelId='eleven_multilingual_v2',context='One voice models twelve public practice sentences, without speaker labels.',items=items),ensure_ascii=False,indent=2)+'\n')
print('Built 12 words and canonical sentence models.')
