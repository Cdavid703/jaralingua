"""Build the Unit 6 configuration and page on the existing pronunciation engine."""
from pathlib import Path
import json,re,html,hashlib,shutil,sys
ROOT=Path(__file__).resolve().parents[1]
sys.path.insert(0,str(ROOT/'tmp/unit5-explanation/python-deps'))
import qrcode,qrcode.image.svg
STEM='report-the-news-clearly';TITLE='Report the News Clearly';PAGE='pronunciation-unit-6-'+STEM
HERO='/assets/img/english-intermediate-2/unit-6/pronunciation/report-the-news-hero.webp'
BASE=ROOT/'ingles/intermediate-2/audio/pronunciation/unit-6-intermediate2'
TEXTS=[
'Heavy rain flooded the town last night. A reporter said that rescue workers were helping residents near the river.',
'The mayor told us that the bridge was closed. She said that the storm had damaged the road.',
'Volunteers delivered food and checked the shelter. They wanted warm blankets and clean water for the families.',
'Before sharing a headline, check the source and the evidence. The latest report seems reliable, but we should avoid spreading rumors.'
]
LABELS=['News vocabulary and word stress','Reported speech and linking','Three clear past endings','Reliable sources and thought groups']
TIPS={
'heavy':'Stress HEA in HEA-vy. Keep the second syllable light.',
'flooded':'Two syllables: FLOOD-ed. The -ed ending adds /id/ after /d/.',
'reporter':'Stress the middle syllable: re-POR-ter.',
'said':'One syllable. Its vowel sounds like the vowel in bed, not paid.',
'rescue':'Stress RES in RES-cue. Two syllables.',
'workers':'Stress WORK and keep the final /z/.',
'residents':'Stress RES in RES-i-dents. Keep the final /nts/.',
'river':'Stress RIV in RIV-er. Keep the second syllable light.',
'mayor':'Listen to the American model and keep the first part strong.',
'told':'Keep the final /ld/. Link told_us without adding a vowel.',
'bridge':'One syllable. Finish with /dʒ/, the sound at the start of job.',
'closed':'One syllable, ending in /zd/. Do not add an extra syllable for -ed.',
'damaged':'Stress DAM in DAM-aged. The final -ed is /d/, with no extra syllable.',
'volunteers':'Stress the final syllable: vol-un-TEERS. Keep final /z/.',
'delivered':'Stress LIV in de-LIV-ered. The final -ed is /d/.',
'checked':'One syllable. Finish with /kt/; the -ed ending sounds /t/.',
'shelter':'Stress SHEL in SHEL-ter. Begin with the sh sound.',
'wanted':'Two syllables: WANT-ed. The -ed ending adds /id/ after /t/.',
'blankets':'Stress BLAN in BLAN-kets. Keep final /ts/.',
'families':'Stress FAM. Listen to the model’s light middle vowel and final /z/.',
'headline':'Stress HEAD in HEAD-line. Two syllables.',
'source':'One syllable. Finish with /s/.',
'evidence':'Stress EV in EV-i-dence. Three syllables; keep final /ns/.',
'latest':'Stress LA in LA-test. Keep final /st/.',
'report':'Stress PORT in re-PORT. Keep the final /t/.',
'reliable':'Stress LI in re-LI-a-ble; keep the other syllables light.',
'avoid':'Stress VOID in a-VOID. Keep the final /d/.',
'spreading':'Stress SPREAD. Start with /spr/ without an extra vowel before s.',
'rumors':'Stress RU in RU-mors. Keep the final /z/.'
}

TIPS.update({'a': 'A is usually weak /ə/ before a consonant, as in a_reporter. Its strong form is /eɪ/.', 'and': 'Keep and light when linking food_and_checked; avoid a long pause.', 'before': 'Stress FORE in be-FORE.', 'but': 'One syllable. Keep it light before we and retain the contrast.', 'check': 'Begin with ch and finish with /k/. One syllable.', 'clean': 'One syllable with a long ee vowel; start with /kl/.', 'food': 'One syllable with a long oo vowel; finish with /d/.', 'for': 'Keep for light in water_for_the_families; copy the American r.', 'had': 'Start with a light /h/ and finish with /d/. Link had_damaged.', 'helping': 'Stress HELP. Finish -ing with /ŋ/, without a separate hard g.', 'last': 'Keep the final /st/. Connect last_night as a short group.', 'near': 'One syllable with a smooth American r. Link near_the_river.', 'night': 'One syllable with the vowel in my; finish with /t/.', 'rain': 'One syllable with the vowel in day; finish with /n/.', 'road': 'One syllable with the vowel in go; finish with /d/.', 'seems': 'Use a long ee vowel and finish with /mz/.', 'sharing': 'Stress SHARE. Begin with sh and finish -ing without a hard g.', 'she': 'Begin with sh and keep the long ee vowel clear.', 'should': 'The l is silent. Use the vowel in good and keep final /d/.', 'storm': 'Start with /st/ without an extra vowel; finish with /rm/.', 'that': 'Begin with voiced th /ð/. Keep that light in said_that.', 'the': 'Begin with voiced th /ð/. Use a light vowel before town or bridge.', 'they': 'Begin with voiced th /ð/ and use the vowel in day.', 'town': 'One syllable with the vowel in now; finish with /n/.', 'us': 'One short syllable with the vowel in cup; finish with /s/. Link told_us.', 'warm': 'One syllable. Start with /w/ and finish with /rm/.', 'was': 'Finish with voiced /z/. Keep was light before closed.', 'water': 'Stress WA in WA-ter. Copy the light American middle t in the model.', 'we': 'Start with rounded lips for /w/ and use a long ee vowel.', 'were': 'One syllable. Keep it light in were_helping and copy the American r.'})

def main():
 BASE.mkdir(parents=True,exist_ok=True);(BASE/'words').mkdir(exist_ok=True)
 source=(ROOT/'assets/js/english-intermediate2-pronunciation-unit5.js').read_text()
 c=json.loads(source.split(' = ',1)[1].rsplit(';',2)[0]);c=json.loads(json.dumps(c).replace('unit5','unit6').replace('unit-5','unit-6').replace('ie2-u5','ie2-u6'))
 c.update(activityTitle='Unit 6 Pronunciation - '+TITLE,product='complete fictional news bulletin',speechEquivalences=[],tips=TIPS)
 c['stages']=[dict(label=label,shortLabel=str(i),text=text,audio=f'audio/pronunciation/unit-6-intermediate2/section-{i}.mp3') for i,(label,text) in enumerate(zip(LABELS,TEXTS),1)]
 c['stages'].append(dict(label='Final challenge',shortLabel='Final',final=True,text=' '.join(TEXTS),audio=f'audio/pronunciation/unit-6-intermediate2/{STEM}-model-us.mp3'))
 (ROOT/'assets/js/english-intermediate2-pronunciation-unit6.js').write_text('(()=>{"use strict";window.JaraIntermediate2PronunciationConfig = '+json.dumps(c,indent=2,ensure_ascii=False)+';})();\n')
 page=(ROOT/'ingles/intermediate-2/pronunciation-unit-5-first-impressions-clear-words.html').read_text()
 pairs={'unit-5':'unit-6','unit5':'unit6','Unit 5':'Unit 6','first-impressions-clear-words':STEM,'First Impressions, Clear Words':TITLE,'/pronunciation/first-impressions-hero-v1.png':'/pronunciation/report-the-news-hero.webp','width="1672" height="941"':'width="1536" height="1024"','Two adult classmates discussing a first impression beside a microphone':'Adult student practicing a news report at a desktop microphone','Describe appearances, feelings and clues with clear final sounds, word stress and connected expressions.':'Practice news vocabulary, reported speech, past endings and thought groups.','Describe what you see, explain your first impression and offer support with clear pronunciation.':'Report a fictional news story with clear word stress, past endings and connected speech.','Search looks, might, tired, tiring, cheer up...':'Search flooded, said, checked, wanted, reliable...','Try: seems, must, might, tired, tiring, heart of gold.':'Try: reporter, evidence, past endings, linking, recording.','first impressions looks seems like must might cannot tired tiring think guess perhaps cheer up calm down heart gold recording':'news reporter flood reported speech said told past endings checked delivered wanted reliable sources recording','Describe a first impression, section by section':'Build a clear news bulletin, section by section','20260926-1':'20261009-pron6','<span>Accuracy</span>':'<span>Word match</span>','<span>Rhythm</span>':'<span>Pace estimate</span>'}
 for a,b in pairs.items():page=page.replace(a,b)
 page=page.replace('<li><a href="#pronunciation-activity">Practice</a></li>','<li><a href="./pronunciation-library.html">Pronunciation Library</a></li><li><a href="#pronunciation-activity">Practice</a></li>')
 page=page.replace('<p class="record-help">Allow microphone access when your browser asks.</p>','<p class="record-help">Allow microphone access. Your recording is processed for transcription; only a final recording you choose to send is saved to the teacher inbox.</p>')
 page=page.replace('<div class="feedback" id="feedback"></div>','<div class="feedback" id="feedback"></div><p class="record-help">These practice scores estimate recognized words, completeness and pace. They do not measure individual sounds or your accent. Listen to your recording and compare it with the model.</p>')
 focus=[('re-POR-ter · RES-i-dents','Stress the strong syllable and keep other syllables lighter.'),('said_that · told_us','Join short reporting phrases. Said has the vowel in bed.'),('checked /t/ · delivered /d/','Keep the past ending audible without adding an extra syllable.'),('wanted /id/ · flooded /id/','After /t/ or /d/, -ed adds a syllable. Copy the model.'),('EV-i-dence · re-LI-a-ble','Use clear word stress when discussing trustworthy news.'),('Pause between ideas','Group the event, the reported statement, the response and the source. Do not pause after every word.')]
 guide=[('Meaning first','Can a listener follow the event and the response?'),('Reporting phrases','Are said that and told us connected and intelligible?'),('Past endings','Can the listener distinguish checked, delivered and wanted?'),('Word stress','Are reporter, residents, evidence and reliable clear?'),('A complete bulletin','Four meaning groups, natural pauses and audible final sounds.')]
 def cards(items,cls):return ''.join('<div class="'+cls+'-card"><strong>'+html.escape(a)+'</strong><span>'+html.escape(b)+'</span></div>' for a,b in items)
 support='<div class="ie2-pronunciation-support" aria-label="Pronunciation support"><section class="pronunciation-panel ie2-search-item" data-search-keywords="word stress past endings linking reporter evidence"><p class="eyebrow">Pronunciation focus</p><h3>Make the news easy to understand</h3><div class="phrase-focus-grid">'+cards(focus,'phrase-focus')+'</div></section><section class="pronunciation-panel ie2-search-item"><p class="eyebrow">Teacher listening guide</p><h3>What the teacher will notice</h3><div class="rubric-focus-grid">'+cards(guide,'rubric-focus')+'</div></section></div>\n'
 start=page.index('<div class="ie2-pronunciation-support"');end=page.index('            <section class="ie2-pronunciation-delivery-zone"',start);page=page[:start]+support+page[end:]
 (ROOT/'ingles/intermediate-2'/f'{PAGE}.html').write_text(page)
 css=(ROOT/'assets/css/english-intermediate2-pronunciation-unit5.css').read_text().replace('unit5','unit6').replace('Unit 5','Unit 6').replace('unit-5/pronunciation/first-impressions-hero-v1.png','unit-6/pronunciation/report-the-news-hero.webp')
 css+='\n.ie2-pronunciation-unit6-page .lesson-hero-image{height:320px!important;min-height:0!important;background:#e7edf3}.ie2-pronunciation-unit6-page .lesson-hero-image img{width:100%!important;height:100%!important;min-height:0!important;max-height:320px!important;object-fit:contain!important;aspect-ratio:auto!important}@media(max-width:640px){.ie2-pronunciation-unit6-page .lesson-hero-image{height:240px!important}.ie2-pronunciation-unit6-page .lesson-hero-image img{max-height:240px!important}}\n'
 (ROOT/'assets/css/english-intermediate2-pronunciation-unit6.css').write_text(css)
 qrcode.make('https://www.jaralingua.com/ingles/intermediate-2/'+PAGE+'.html',image_factory=qrcode.image.svg.SvgPathImage).save(ROOT/'assets/img/page-qr'/f'ingles-intermediate-2-{PAGE}.svg')
 words=sorted(set(re.findall(r"[a-z]+(?:'[a-z]+)?",' '.join(TEXTS).lower())))
 reuse={}
 for unit in (4,5):
  folder=ROOT/f'ingles/intermediate-2/audio/pronunciation/unit-{unit}-intermediate2';data=json.loads((folder/'models.json').read_text())
  for x in data['items']:
   if x['kind']=='word':reuse[x['text']]=(folder/x['file'],x)
 old=json.loads((BASE/'models.json').read_text()) if (BASE/'models.json').exists() else {'items':[]};cache={x['file']:x for x in old['items']}
 items=[dict(file=Path(x['audio']).name,text=x['text'],kind='section') for x in c['stages']]
 items += [dict(file='words/'+re.sub('[^a-z0-9]','',w)+'.mp3',text=w,kind='word') for w in words]
 for x in items:
  target=BASE/x['file']
  if x['kind']=='word' and not target.exists() and x['text'] in reuse:
   src,prior=reuse[x['text']];assert hashlib.sha256(src.read_bytes()).hexdigest()==prior['sha256'];shutil.copy2(src,target);x['reusedFrom']=src.relative_to(ROOT).as_posix()
  if cache.get(x['file'],{}).get('text')==x['text']:x.update(cache[x['file']])
  if target.exists():x.update(bytes=target.stat().st_size,sha256=hashlib.sha256(target.read_bytes()).hexdigest())
 (BASE/'models.json').write_text(json.dumps(dict(activityId='intermediate2Unit6NewsPronunciation',voiceId='EXAVITQu4vr4xnSDxMaL',modelId='eleven_multilingual_v2',provider='elevenlabs',items=items),indent=2)+'\n')
 (ROOT/'ingles/intermediate-2/audio/pronunciation'/f'unit-6-{STEM}-script.md').write_text('# '+TITLE+'\n\nPublic teaching script. Sarah · General American English · ElevenLabs. Fictional news.\n\n'+'\n\n'.join('## '+s['label']+'\n\n> '+s['text'] for s in c['stages'])+'\n')
 print('Built 5 stages and',len(words),'word models;',sum('reusedFrom' in x for x in items),'reused.')
if __name__=='__main__':main()
