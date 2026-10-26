"""Build activity 2 only, using the approved compact page and original PDF assets."""
import copy
import json
import sys
from html import escape
from pathlib import Path
from lxml import html
from preintermediate1_unit1_personality_be_content import TABLE, GAPS, FIXES, PERSONAL

ROOT = Path(__file__).resolve().parents[1]
COURSE = ROOT / 'ingles/preintermedio-1'
NAME = 'grammar-unit-1-personality-be.html'
VOCAB = 'vocabulary-unit-1-personality.html'
PDF = 'materials/22-describing-personality-original.pdf'
MEDIA = '/assets/img/english-preintermediate-1/unit-1/practice/personality-be/'
VERSION = '20261026-personality-be-1'

def fragment(text):
    return html.fragment_fromstring(text)

def write(name, doc):
    (COURSE/name).write_text('<!doctype html>\n'+html.tostring(doc,encoding='unicode',method='html')+'\n',encoding='utf-8')

def task(number, title, prompt, exercise, helper=''):
    return f'''<details class="pi-topic pb-task" id="task-{number}"><summary><span class="pi-number">0{number}</span><h2>{title}</h2></summary><div class="pi-topic-body"><p class="pv-original-instruction">{prompt}</p>{('<p class="pi-small">'+helper+'</p>') if helper else ''}<form data-pb-task="{number}" novalidate><p class="pb-count" role="status" aria-live="polite">0 of {10 if number==1 else 9} answered.</p>{exercise}<div class="pi-actions"><button type="submit" class="btn btn-primary">{'Check completion' if number==3 else 'Check answers'}</button><button type="button" class="btn btn-secondary" data-pb-reset>Start again</button></div><p class="pb-result pv-result" role="status" aria-live="polite" tabindex="-1" hidden></p></form></div></details>'''

doc = html.document_fromstring((COURSE/VOCAB).read_text())
description = 'Practise am, is and are with the original sentence-completion, correction and personal-response tasks from Describing Personality.'
doc.find('.//title').text = 'Describing Personality with Be | Preintermediate English Course 1'
doc.xpath('//meta[@name="description"]')[0].set('content',description)
head = doc.find('.//head')
head.insert(list(head).index(doc.xpath('//link[contains(@href,"course-responsive.css")]')[0]),fragment(f'<link rel="stylesheet" href="/assets/css/preintermediate1-personality-be.css?v={VERSION}">'))
body = doc.find('.//body');body.set('class','english-basic-page basic2-page preinter-page pi-practice-page pv-page pb-page')
for script in body.xpath('./script'):
    if script.get('id')=='pv-data' or not script.get('src') or any(part in script.get('src','') for part in ['preintermediate1-personality-vocabulary.js','preintermediate1-lesson.js']):
        body.remove(script)
main=doc.find('.//main');hero=copy.deepcopy(main[0]);main.clear();main.set('id','main-content')
hero.set('style',f'--hero-image:url({MEDIA}cover.webp)')
hero.xpath('.//p[@class="eyebrow"]')[0].text='Practice Lab · Unit 1 · Grammar'
hero.xpath('.//h1')[0].text='Describing Personality with Be'
hero.xpath('.//div[contains(@class,"pi-hero-copy")]/p[not(@class="eyebrow")]')[0].text=description
actions=hero.xpath('.//div[contains(@class,"hero-actions")]')[0];actions.clear();actions.set('class','hero-actions pi-actions')
actions.extend(html.fragments_fromstring(f'<a class="btn btn-primary" href="#grammar-reference">Start grammar</a><a class="btn btn-secondary" href="{PDF}" download="22 - Describing Personality.pdf">Download original PDF</a><a class="btn btn-secondary" href="{VOCAB}">Activity 1 · Vocabulary</a>'))
img=hero.xpath('.//figure/img')[0];img.set('src',MEDIA+'cover.webp');img.set('alt','Two adult classmates studying together, one writing while the other explains an idea');img.set('width','1600');img.set('height','800');main.append(hero)

content='''<section class="pi-objective pv-intro"><p class="pi-label">Activity 2 of 8 · ESL Pals · Pages 3–4</p><h2>Your learning goal</h2><p>Use am, is and are to describe personality, correct mistakes and talk about your life.</p><div class="pi-route"><span>20–25 minutes</span><span>3 original tasks</span><span>Practice · no official grade</span></div><p class="pi-small">Tasks 1–2: check your answers and try again. Explanations appear after two different complete attempts, or when all answers are correct. Task 3 has personal answers. Your draft stays in this browser tab.</p><p id="pb-storage-status" class="pi-small" role="status" hidden></p></section>'''
table='<table class="pb-table"><caption>am / is / are</caption><thead><tr><th scope="col"><span class="pb-sr-only">Grammar</span></th>'+''.join(f'<th scope="col">{form}</th>' for form,_,_ in TABLE)+'</tr></thead><tbody><tr><th scope="row">Use</th>'+''.join('<td>'+'<br>'.join(subjects)+'</td>' for _,subjects,_ in TABLE)+'</tr><tr><th scope="row">Example</th>'+''.join('<td>'+''.join(f'<button class="pb-example" type="button" data-audio="{slug}" aria-label="Listen: {escape(text)}"><span aria-hidden="true">▷</span> {escape(text)}</button>' for slug,text in examples)+'</td>' for _,_,examples in TABLE)+'</tr></tbody></table>'
content+='''<details class="pi-topic" id="grammar-reference"><summary><span class="pi-number">Be</span><h2>Grammar · am / is / are</h2></summary><div class="pi-topic-body"><p class="pv-original-instruction">Learn the grammar from the table and then complete the exercises.</p>'''+table+'''<div class="pi-audio-controls"><span>Example audio</span><button type="button" data-speed="0.75" aria-pressed="false">0.75×</button><button type="button" data-speed="1" aria-pressed="true">1.0×</button><button type="button" data-speed="1.25" aria-pressed="false">1.25×</button><button type="button" data-stop>Stop audio</button></div><p class="pv-audio-status" data-audio-status role="status" aria-live="polite">Tap an example to hear it.</p><a class="pb-text-link" href="#task-1">Continue to Task 1</a></div></details>'''

gap_rows=''.join(f'<div class="pb-item"><label class="pb-sr-only" for="pb-gap-{i}">{i}. {escape(subject)} ___ {escape(tail)}</label><div class="pb-gap-sentence"><span><b class="pv-item-number">{i}.</b> {escape(subject)}</span><select id="pb-gap-{i}" name="q{i}" required aria-describedby="pb-gap-feedback-{i}"><option value="">…</option><option value="am">am</option><option value="is">is</option><option value="are">are</option></select><span>{escape(tail)}</span></div><p class="pb-feedback pv-feedback" id="pb-gap-feedback-{i}" hidden></p></div>' for i,(subject,tail,_,_) in enumerate(GAPS,1))
content+=task(1,'Task 1 · Complete the sentences','Complete the sentences with am / is / are.',f'<div class="pb-illustrated"><div class="pb-list">{gap_rows}</div><img class="pb-source-art" src="{MEDIA}grammar-illustration.webp" width="1078" height="798" alt="Original worksheet illustration of three people" loading="lazy"></div>')
fix_rows=''.join(f'<div class="pb-fix"><label for="pb-fix-{i}"><b class="pv-item-number">{i}.</b> {escape(original)}</label><textarea id="pb-fix-{i}" name="q{i}" rows="2" maxlength="400" required spellcheck="false" autocapitalize="sentences" autocomplete="off" aria-describedby="pb-fix-feedback-{i}" placeholder="Write the corrected sentence."></textarea><p class="pb-feedback pv-feedback" id="pb-fix-feedback-{i}" hidden></p></div>' for i,(original,_,_,_) in enumerate(FIXES,1))
content+=task(2,'Task 2 · Fix the mistakes','Fix the mistakes.',f'<div class="pb-fix-grid">{fix_rows}</div>','Rewrite the sentence using the correct form of be. You may include the extra sentence. Capital letters, punctuation and standard contractions are accepted.')
personal_rows=''.join(f'<div class="pb-personal-row"><label for="pb-self-{i}"><b class="pv-item-number">{i}.</b> {escape(statement)}</label><select id="pb-self-{i}" name="q{i}" required><option value="">Choose…</option><option value="true">True for me</option><option value="false">Not true for me</option><option value="na">Not applicable</option></select></div>' for i,statement in enumerate(PERSONAL,1))
content+=task(3,'Task 3 · True for your life?','Read the sentence then say if it is true for your life.',f'<div class="pb-illustrated"><div class="pb-list">{personal_rows}</div><img class="pb-source-art" src="{MEDIA}personal-practice-illustration.webp" width="1069" height="888" alt="Original worksheet illustration of three people with a guitar, a violin and a camera" loading="lazy"></div>','Say your answer aloud, then choose a response to keep track. There are no right or wrong personal answers. Choose Not applicable when a sentence does not fit your life.')
content+='<details class="pi-topic" id="original-pages"><summary><span class="pi-number">PDF</span><h2>View the original worksheet · Pages 3–4</h2></summary><div class="pi-topic-body"><p>The original pages with the same table, exercises and illustrations.</p>'+''.join(f'<figure class="pv-original-page"><img src="{MEDIA}original-page-{n}.webp" width="1275" height="1800" alt="Original Describing Personality worksheet, page {n}. The grammar and exercises are transcribed above." loading="lazy"><figcaption>ESL Pals · Describing Personality · Page {n}</figcaption></figure>' for n in [3,4])+'</div></details>'
content+=f'''<section class="pi-objective pv-download pv-footer" id="paper-version"><div><h2>Original PDF · 10 pages</h2><p>This activity uses pages 3–4. Download the complete worksheet to work on paper.</p><p class="pi-small">Worksheet, grammar table and original illustrations: ESL Pals, <cite>Describing Personality</cite>. PDF provided unchanged.</p></div><div class="pi-actions"><a class="btn btn-primary" href="{PDF}" download="22 - Describing Personality.pdf">Download original PDF</a><a class="btn btn-secondary" href="{VOCAB}">Previous · Personality Vocabulary</a><a class="btn btn-secondary" href="practice-lab.html#unit-1-personality">Unit 1 activities · 2 of 8 ready</a></div></section><noscript><p class="pi-objective">Enable JavaScript for audio and answer checking, or download the original PDF to practise on paper.</p></noscript>'''
main.append(fragment('<div class="pi-shell">'+content+'</div>'))
data=html.Element('script',id='pb-data',type='application/json');data.text=json.dumps(dict(tasks={
    '1':[dict(answer=answer,accepted=[answer],explanation=why,model=f'{subject} {answer} {tail}') for subject,tail,answer,why in GAPS],
    '2':[dict(answer=correct,accepted=[correct,short],explanation=why,model=correct) for _,correct,short,why in FIXES]
}),ensure_ascii=False).replace('<','\\u003c');body.append(data)
models={slug:dict(text=text,path=f'/ingles/preintermedio-1/audio/unit1/personality-be/{slug}.mp3') for _,_,examples in TABLE for slug,text in examples}
audio_data=html.Element('script');audio_data.text='window.Preintermediate1Audio = '+json.dumps(models)+';';body.append(audio_data)
for src in ['/assets/js/preintermediate1-lesson.js?v=20261024-connected-unit1','/assets/js/preintermediate1-personality-be.js?v='+VERSION]:body.append(fragment('<script src="'+src+'"></script>'))
write(NAME,doc)

# Update only the approved worksheet block; preserve the two story cards and other units.
lab=html.document_fromstring((COURSE/'practice-lab.html').read_text());unit=lab.get_element_by_id('unit-1');block=lab.get_element_by_id('unit-1-personality')
unit.xpath('./div/p[contains(@class,"pi-goal")]')[0].text='Sessions 1–2 · 6 hours of class · 4 activities available'
block.xpath('./summary/h3')[0].text='Describing Personality · 2 of 8 activities ready'
grid=block.xpath('./div/div[contains(@class,"pi-section-grid")]')[0]
for card in grid.xpath('./article[.//a[@href=$name]]',name=NAME):grid.remove(card)
grid.append(fragment(f'''<article class="course-section-card"><div class="course-section-image"><img src="{MEDIA}cover.webp" alt="Two adult classmates studying together" width="1600" height="800" loading="lazy" decoding="async"></div><div class="course-section-content"><span class="section-number">02</span><span class="course-status course-status-available">Grammar · Available now</span><h3>Describing Personality with Be</h3><p>Complete sentences with am, is and are, correct mistakes and talk about your life. Original PDF illustrations.</p><a class="card-link" href="{NAME}">Open grammar activity</a></div></article>'''))
pending=block.xpath('.//ol[contains(@class,"pi-planned-activities")]')[0]
for li in pending.xpath('./li[.//strong[text()="Describing Personality with Be"]]'):pending.remove(li)
pending.set('start','3')
lab.xpath('//section[@class="pi-objective"]/p')[0].text='Units 1–6 each have a connected listening and reading story. Unit 1 also includes vocabulary and grammar, the first two of eight Describing Personality activities.'
write('practice-lab.html',lab)

vocab=html.document_fromstring((COURSE/VOCAB).read_text());links=vocab.xpath('//*[@id="paper-version"]//div[contains(@class,"pi-actions")]')[0]
for link in links.xpath('./a[@href=$name]',name=NAME):links.remove(link)
links.insert(1,fragment(f'<a class="btn btn-secondary" href="{NAME}">Next · Describing Personality with Be</a>'))
for link in links.xpath('./a[contains(@href,"practice-lab.html")]'):link.text='Unit 1 activities · 2 of 8 ready'
write(VOCAB,vocab)

try:
    import qrcode
except ModuleNotFoundError:
    sys.path.insert(0,str(ROOT/'tmp/unit5-explanation/python-deps'))
    import qrcode
import qrcode.image.svg
qrcode.make('https://www.jaralingua.com/ingles/preintermedio-1/'+NAME,image_factory=qrcode.image.svg.SvgPathImage,box_size=10,border=4).save(ROOT/'assets/img/page-qr'/('ingles-preintermedio-1-'+NAME.removesuffix('.html')+'.svg'))
print('Built activity 2: original grammar table, 10 gaps, 9 corrections, 9 personal responses, original illustrations and PDF. Restoring the next approved activity.')

import runpy
runpy.run_path(str(ROOT/'tools/build_preintermediate1_unit1_characters.py'),run_name='__main__')
