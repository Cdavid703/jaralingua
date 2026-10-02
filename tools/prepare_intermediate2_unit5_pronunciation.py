"""Build Unit 5 from the existing pronunciation template and shared engine."""
from pathlib import Path
import hashlib, html, json, re, shutil, sys
sys.path.insert(0,str(Path(__file__).resolve().parents[1]/'tmp/unit5-explanation/python-deps'))
import qrcode
import qrcode.image.svg

ROOT = Path(__file__).resolve().parents[1]
STEM = 'first-impressions-clear-words'
TITLE = 'First Impressions, Clear Words'
PAGE = 'pronunciation-unit-5-' + STEM
HERO = '/assets/img/english-intermediate-2/unit-5/pronunciation/first-impressions-hero-v1.png'
BASE = ROOT/'ingles/intermediate-2/audio/pronunciation/unit-5-intermediate2'
TEXTS = [
    'The man looks worried, and his friend seems calm. He looks like a student waiting for an important result.',
    "He must be nervous because his hands are shaking. He might be waiting for exam results, but we can't be sure.",
    'I think he feels tired because the long wait is tiring. I guess he needs support. Perhaps she can cheer him up.',
    'She seems kind and has a heart of gold. He takes a breath to calm down, and she stays beside him.'
]
LABELS = ['Appearances and final sounds', 'Deductions and clear contrasts', 'Feelings and word stress', 'Support and connected expressions']
TIPS = {
 'looks':'Keep the final /ks/ in one syllable. Do not add a vowel after looks.',
 'worried':'Stress WOR. Finish the second syllable with /d/: WOR-ried.',
 'seems':'Hold the long ee vowel and finish with /mz/.',
 'calm':'One syllable. The l is silent; finish with /m/.',
 'like':'Finish with /k/. Link looks_like as one thought group.',
 'student':'Stress STU. Keep the second syllable light.',
 'waiting':'Stress WAIT. The ending is /ng/, without a separate hard g.',
 'important':'Stress the middle syllable: im-POR-tant.',
 'result':'Stress the second syllable: re-SULT. Keep the final /t/.',
 'results':'Stress re-SULTS and keep the final /ts/ clear.',
 'must':'Keep the final /st/. Stress MUST when the evidence is strong.',
 'nervous':'Stress NER; keep the second syllable short: NER-vous.',
 'because':'Stress the second syllable: be-CAUSE.',
 'hands':'Finish with /ndz/, without adding another syllable.',
 'shaking':'Stress SHAKE. Keep the ng ending smooth.',
 'might':'One syllable. Keep the final /t/ before be.',
 'exam':'Stress the second syllable: ig-ZAM.',
 "can't":"Use one syllable. Keep the negative clear; do not let can't sound like can.",
 'sure':'One syllable, starting with the sh sound.',
 'think':'Begin with unvoiced th, tongue gently between the teeth; finish with /ngk/.',
 'feels':'Hold the long ee vowel and finish with /lz/.',
 'tired':'Keep the final /d/. Listen to how the model joins tired_because.',
 'tiring':'Stress TIRE; keep the ing ending light.',
 'guess':'One syllable. The u is silent; start with hard /g/.',
 'needs':'Finish with /dz/. Connect needs_support without an extra vowel.',
 'support':'Stress the second syllable: sup-PORT.',
 'perhaps':'Stress the second syllable: per-HAPS; keep final /ps/.',
 'cheer':'One syllable, starting with ch. Make CHEER strong in cheer_him_up.',
 'him':'Keep him light between cheer and up.',
 'up':'Keep the final /p/. Link cheer_him_up smoothly.',
 'kind':'Keep the final /nd/.',
 'heart':'One syllable. Link heart_of without a long pause.',
 'gold':'Hold the vowel smoothly, then finish with /ld/.',
 'takes':'Keep the final /ks/ in one syllable.',
 'breath':'One syllable. The final th is unvoiced; this is breath, not breathe.',
 'down':'Make DOWN strong in calm_down.',
 'stays':'Finish with a voiced /z/, not /s/.',
 'beside':'Stress the second syllable: be-SIDE.'
}


def patch_backend(text):
    if 'def submit_intermediate2_unit5_pronunciation(' in text:
        return text
    anchor='INTERMEDIATE2_UNIT4_PRONUNCIATION_SUBMISSIONS_PATH = os.environ.get('
    start=text.index(anchor);end=text.index('\n)',start)+2
    text=text[:end]+ '\n'+text[start:end].replace('UNIT4','UNIT5').replace('unit4','unit5')+text[end:]
    start=text.index('INTERMEDIATE2_UNIT4_PRONUNCIATION_ID =');end=text.index('\n',text.index('INTERMEDIATE2_UNIT4_PRONUNCIATION_REFERENCE =',start))
    new='INTERMEDIATE2_UNIT5_PRONUNCIATION_ID = "intermediate2Unit5FirstImpressionsPronunciation"\nINTERMEDIATE2_UNIT5_PRONUNCIATION_VERSION = "2026.1"\nINTERMEDIATE2_UNIT5_PRONUNCIATION_REFERENCE = '+json.dumps(' '.join(TEXTS))
    text=text[:end]+'\n'+new+text[end:]
    start=text.index('def read_intermediate2_unit4_pronunciation_submissions():');end=text.index('\ndef read_intermediate2_unit2_listening_submissions():',start)
    new=text[start:end].replace('unit4','unit5').replace('UNIT4','UNIT5')
    text=text[:end]+'\n'+new+text[end:]
    text=text.replace('"/api/intermediate2/unit4-pronunciation/audio"\n        ):','"/api/intermediate2/unit4-pronunciation/audio",\n            "/api/intermediate2/unit5-pronunciation/submissions",\n            "/api/intermediate2/unit5-pronunciation/audio"\n        ):')
    text=text.replace('if "/unit4-pronunciation/" in parsed.path else INTERMEDIATE_ENGLISH_GRADES_PATH','if any(u in parsed.path for u in ("/unit4-pronunciation/", "/unit5-pronunciation/")) else INTERMEDIATE_ENGLISH_GRADES_PATH')
    text=text.replace('if "/unit4-pronunciation/" in parsed.path:\n                    store', 'if "/unit5-pronunciation/" in parsed.path:\n                    store = read_intermediate2_unit5_pronunciation_submissions()\n                elif "/unit4-pronunciation/" in parsed.path:\n                    store')
    start=text.index('        if parsed.path == "/api/intermediate2/unit4-pronunciation/submit":');end=text.index('\n        if ',start+15)
    text=text[:end]+'\n'+text[start:end].replace('unit4','unit5')+text[end:]
    compile(text,'progress_api.py','exec')
    return text


def main():
    BASE.mkdir(parents=True,exist_ok=True);(BASE/'words').mkdir(exist_ok=True)
    src=ROOT/'assets/js/english-intermediate2-pronunciation-unit4.js'
    config=json.loads(src.read_text(encoding='utf-8').split(' = ',1)[1].rsplit(';',2)[0])
    config=json.loads(json.dumps(config).replace('unit4','unit5').replace('unit-4','unit-5').replace('ie2-u4','ie2-u5'))
    config.update(activityTitle='Unit 5 Pronunciation - '+TITLE,product='complete first-impression description',speechEquivalences=[['cannot',"can't"],['can not',"can't"]],tips=TIPS)
    config['stages']=[dict(label=label,shortLabel=str(i+1),audio=f'audio/pronunciation/unit-5-intermediate2/section-{i+1}.mp3',text=t) for i,(label,t) in enumerate(zip(LABELS,TEXTS))]
    config['stages'].append(dict(label='Final challenge',shortLabel='Final',final=True,audio=f'audio/pronunciation/unit-5-intermediate2/{STEM}-model-us.mp3',text=' '.join(TEXTS)))
    (ROOT/'assets/js/english-intermediate2-pronunciation-unit5.js').write_text('(()=>{"use strict";window.JaraIntermediate2PronunciationConfig = '+json.dumps(config,ensure_ascii=False,indent=2)+';})();\n',encoding='utf-8')
    page=(ROOT/'ingles/intermediate-2/pronunciation-unit-4-make-your-movie-review-clear.html').read_text(encoding='utf-8')
    replacements={
      'unit-4':'unit-5','unit4':'unit5','Unit 4':'Unit 5',
      'Make Your Movie Review Clear':TITLE,
      'Practice a movie review with present-perfect contractions, review vocabulary, connected speech and an idiom.':'Describe appearances, feelings and clues with clear final sounds, word stress and connected expressions.',
      'Make your movie review clear: talk about your experience, explain your opinion and recommend the film.':'Describe what you see, explain your first impression and offer support with clear pronunciation.',
      '/pronunciation-movie-review/movie-review-hero-v1.png':'/pronunciation/first-impressions-hero-v1.png',
      'Adult English learner recording a movie review with headphones and a microphone':'Two adult classmates discussing a first impression beside a microphone',
      'Search watched, original, gripping, soundtrack, check it out...':'Search looks, might, tired, tiring, cheer up...',
      'Try: original, sequel, watched, convincing, catchy, edge of my seat.':'Try: seems, must, might, tired, tiring, heart of gold.',
      'movie review science fiction original sequel watched present perfect gripping predictable convincing catchy soundtrack phrasal verb check out edge seat recording':'first impressions looks seems like must might cannot tired tiring think guess perhaps cheer up calm down heart gold recording',
      'Build one clear movie review, section by section':'Describe a first impression, section by section',
      'english-intermediate2-pronunciation-unit5.js?v=20260829-unit3':'english-intermediate2-pronunciation-unit5.js?v=20260926-1',
      'english-intermediate2-pronunciation-unit5.css?v=20260919-1':'english-intermediate2-pronunciation-unit5.css?v=20260926-1',
      'google-auth.js?v=20260829-intermediate2-pronunciation':'google-auth.js?v=20260919-local-login'
    }
    for a,b in replacements.items():page=page.replace(a,b)
    focus=[('looks · seems','Keep final /ks/ and /mz/ audible: looks_worried, seems_calm.'),('must · might · can’t','Keep the final sounds clear so the listener hears your level of certainty.'),('TIRED · TIR-ing','Tired describes the feeling; tiring describes its cause. Listen to the different endings.'),('I THINK · I GUESS · per-HAPS','Stress the main idea; perhaps has stress on its second syllable.'),('cheer_him_up · calm_down','Phrasal verbs: link each expression smoothly. Make UP and DOWN strong.'),('a_heart_of_GOLD','Idiom: a very kind person. Join the small words and stress GOLD.')]
    guide=[('Clear appearances','The listener hears looks, seems and looks like.'),('Different levels of certainty','Must, might and can’t remain clearly different.'),('Feeling and cause','Tired and tiring have distinct endings.'),('Connected expressions','Cheer him up, calm down and a heart of gold form meaningful groups.'),('One complete description','Use short pauses between observations, deductions, feelings and support.')]
    def cards(items,cls):return ''.join('<div class="'+cls+'-card"><strong>'+html.escape(a)+'</strong><span>'+html.escape(b)+'</span></div>' for a,b in items)
    support='<div class="ie2-pronunciation-support" aria-label="Pronunciation support"><section class="pronunciation-panel ie2-search-item" data-search-keywords="looks seems must might tired tiring phrasal verb idiom"><p class="eyebrow">Pronunciation focus</p><h3>Make your first impression clear</h3><div class="phrase-focus-grid">'+cards(focus,'phrase-focus')+'</div></section><section class="pronunciation-panel ie2-search-item"><p class="eyebrow">Teacher listening guide</p><h3>What the teacher will notice</h3><div class="rubric-focus-grid">'+cards(guide,'rubric-focus')+'</div></section></div>\n'
    start=page.index('<div class="ie2-pronunciation-support"');end=page.index('            <section class="ie2-pronunciation-delivery-zone"',start)
    page=page[:start]+support+page[end:]
    page=page.replace('</head>','<link rel="canonical" href="https://www.jaralingua.com/ingles/intermediate-2/'+PAGE+'.html"/>\n</head>')
    (ROOT/'ingles/intermediate-2'/f'{PAGE}.html').write_text(page,encoding='utf-8')
    css=(ROOT/'assets/css/english-intermediate2-pronunciation-unit4.css').read_text(encoding='utf-8').replace('Unit 4','Unit 5').replace('unit4','unit5').replace('unit-4/pronunciation-movie-review/movie-review-hero-v1.png','unit-5/pronunciation/first-impressions-hero-v1.png')
    css+='\n.ie2-pronunciation-unit5-page .ie2-pronunciation-search{margin-top:1rem!important}\n@media(max-width:640px){.ie2-pronunciation-unit5-page .lesson-hero-image{height:auto!important;min-height:0!important;max-height:none!important}.ie2-pronunciation-unit5-page .lesson-hero-image img{display:block;height:auto!important;min-height:0!important;max-height:none!important;aspect-ratio:1672/941;object-fit:contain}}\n'
    (ROOT/'assets/css/english-intermediate2-pronunciation-unit5.css').write_text(css,encoding='utf-8')
    qrcode.make('https://www.jaralingua.com/ingles/intermediate-2/'+PAGE+'.html',image_factory=qrcode.image.svg.SvgPathImage,box_size=10,border=4).save(ROOT/'assets/img/page-qr'/f'ingles-intermediate-2-{PAGE}.svg')
    words=sorted(set(re.findall(r"[a-z]+(?:'[a-z]+)?",' '.join(TEXTS).lower())))
    prior=json.loads((ROOT/'ingles/intermediate-2/audio/pronunciation/unit-4-intermediate2/models.json').read_text())
    reuse={i['text']:i for i in prior['items'] if i['kind']=='word'}
    items=[dict(file=Path(s['audio']).name,text=s['text'],kind='section') for s in config['stages']]
    for w in words:
        item=dict(file='words/'+re.sub('[^a-z0-9]','',w)+'.mp3',text=w,kind='word')
        if w in reuse:
            old=ROOT/'ingles/intermediate-2/audio/pronunciation/unit-4-intermediate2'/reuse[w]['file']
            assert hashlib.sha256(old.read_bytes()).hexdigest()==reuse[w]['sha256']
            shutil.copy2(old,BASE/item['file']);item['reusedFrom']=old.relative_to(ROOT).as_posix()
        if (BASE/item['file']).exists():
            raw=(BASE/item['file']).read_bytes();item.update(bytes=len(raw),sha256=hashlib.sha256(raw).hexdigest())
        items.append(item)
    (BASE/'models.json').write_text(json.dumps(dict(activityId='intermediate2Unit5FirstImpressionsPronunciation',voiceId=prior['voiceId'],modelId=prior['modelId'],provider='elevenlabs',items=items),indent=2)+'\n')
    (ROOT/'ingles/intermediate-2/audio/pronunciation'/f'unit-5-{STEM}-script.md').write_text('# '+TITLE+'\n\nPublic teaching script. Sarah; General American English; ElevenLabs eleven_multilingual_v2.\n\n'+'\n\n'.join('## '+s['label']+'\n\n> '+s['text'] for s in config['stages'])+'\n',encoding='utf-8')
    for old,new in [('generate_intermediate2_unit4_pronunciation_audio.py','generate_intermediate2_unit5_pronunciation_audio.py'),('audit_intermediate2_unit4_pronunciation_audio.py','audit_intermediate2_unit5_pronunciation_audio.py')]:
        code=(ROOT/'tools'/old).read_text(encoding='utf-8').replace('Unit 4','Unit 5').replace('unit-4','unit-5')
        if old.startswith('audit'):
            code=code.replace("[('i have', \"i've\"), ('have not', \"haven't\"), ('you are', \"you're\")]", "[('cannot', \"can't\"), ('can not', \"can't\")]")
            code=code.replace("x['text'] == 'original'", "x['text'] in ('must', 'might', \"can't\", 'tired', 'tiring', 'breath')")
        (ROOT/'tools'/new).write_text(code,encoding='utf-8')
    api=ROOT/'server/progress_api.py';api.write_text(patch_backend(api.read_text(encoding='utf-8')),encoding='utf-8')
    print(f'Built 5 stages, {len(words)} clickable words; {sum("reusedFrom" in i for i in items)} audited words reused.')


if __name__=='__main__':main()
