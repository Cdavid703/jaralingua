"""Build activity 4, preserving the original model and seven blank writing responses."""
import copy
import json
import sys
from html import escape
from pathlib import Path
from lxml import html
from preintermediate1_unit1_describing_people_content import WORDS, INSTRUCTION, EXAMPLE, PROMPTS

ROOT=Path(__file__).resolve().parents[1]
COURSE=ROOT/'ingles/preintermedio-1'
NAME='writing-unit-1-describing-people.html'
PREV='reading-unit-1-meet-the-characters.html'
PDF='materials/22-describing-personality-original.pdf'
MEDIA='/assets/img/english-preintermediate-1/unit-1/practice/describing-people/'
SOURCE_IMAGE='/assets/img/english-preintermediate-1/unit-1/practice/meet-the-characters/original-page-6.webp'
VERSION='20261026-describing-people-1'

def fragment(text):return html.fragment_fromstring(text)
def write(name,doc):(COURSE/name).write_text('<!doctype html>\n'+html.tostring(doc,encoding='unicode',method='html')+'\n',encoding='utf-8')

doc=html.document_fromstring((COURSE/PREV).read_text())
description='Use the original personality word box and model sentence to describe people in your life.'
doc.find('.//title').text='Describing People | Preintermediate English Course 1'
doc.xpath('//meta[@name="description"]')[0].set('content',description)
head=doc.find('.//head')
for link in head.xpath('./link[contains(@href,"preintermediate1-personality-characters.css")]'):head.remove(link)
head.insert(list(head).index(doc.xpath('//link[contains(@href,"course-responsive.css")]')[0]),fragment(f'<link rel="stylesheet" href="/assets/css/preintermediate1-describing-people.css?v={VERSION}">'))
body=doc.find('.//body');body.set('class','english-basic-page basic2-page preinter-page pi-practice-page pv-page pw-page')
for script in body.xpath('./script'):
    if not script.get('src') or any(src in script.get('src','') for src in ['preintermediate1-personality-characters.js','preintermediate1-lesson.js']):body.remove(script)
main=doc.find('.//main');hero=copy.deepcopy(main[0]);main.clear();main.set('id','main-content')
hero.set('style',f'--hero-image:url({MEDIA}cover.webp)')
hero.xpath('.//p[@class="eyebrow"]')[0].text='Practice Lab · Unit 1 · Writing'
hero.xpath('.//h1')[0].text='Describing People'
hero.xpath('.//div[contains(@class,"pi-hero-copy")]/p[not(@class="eyebrow")]')[0].text=description
actions=hero.xpath('.//div[contains(@class,"hero-actions")]')[0];actions.clear();actions.set('class','hero-actions pi-actions')
actions.extend(html.fragments_fromstring(f'<a class="btn btn-primary" href="#writing-practice">Start writing</a><a class="btn btn-secondary" href="{PDF}" download="22 - Describing Personality.pdf">Download original PDF</a><a class="btn btn-secondary" href="{PREV}">Activity 3 · Case Study</a>'))
image=hero.xpath('.//figure/img')[0];image.set('src',MEDIA+'cover.webp');image.set('alt','An adult learner writing sentences in a notebook at a classroom desk');image.set('width','1600');image.set('height','800');main.append(hero)

content='''<section class="pi-objective pv-intro"><p class="pi-label">Activity 4 of 8 · ESL Pals · Lower part of page 6</p><h2>Your learning goal</h2><p>Write sentences that describe people using personality adjectives and the verb be.</p><div class="pi-route"><span>10–15 minutes</span><span>9 words · 1 model · 7 responses</span><span>Writing practice · no official grade</span></div><p class="pi-small">Read the example, then write your own descriptions. Personal answers can vary. Use the model to review your sentences. Your draft stays in this browser tab.</p><p id="pw-storage-status" class="pi-small" role="status" hidden></p></section>'''
bank='<div class="pv-wordbank" aria-label="Word box">'+''.join(f'<button type="button" data-audio="{w}" aria-label="Listen to {w}"><span aria-hidden="true">▷</span> {w}</button>' for w in WORDS)+'</div>'
fields=''.join(f'<div class="pw-response"><label for="writing-{n}"><b class="pv-item-number">{n}.</b> {escape(prompt)}</label><div class="pw-answer"><span aria-hidden="true">i.</span><textarea id="writing-{n}" name="q{n}" rows="2" maxlength="300" required spellcheck="true" autocapitalize="sentences" autocomplete="off" placeholder="Write your sentence."></textarea></div></div>' for n,prompt in enumerate(PROMPTS[1:],2))
content+=f'''<details class="pi-topic" id="writing-practice"><summary><span class="pi-number">Write</span><h2>Describing People</h2></summary><div class="pi-topic-body"><p class="pv-original-instruction">{escape(INSTRUCTION)}</p>{bank}<div class="pi-audio-controls"><span>Audio</span><button type="button" data-speed="0.75" aria-pressed="false">0.75×</button><button type="button" data-speed="1" aria-pressed="true">1.0×</button><button type="button" data-speed="1.25" aria-pressed="false">1.25×</button><button type="button" data-stop>Stop audio</button></div><p class="pv-audio-status" data-audio-status role="status" aria-live="polite">Tap a word or the example to hear it.</p><article class="pw-example"><div><h3><span class="pv-item-number">1.</span> {escape(PROMPTS[0])}</h3><p><span aria-hidden="true">i.</span> <span id="pw-model-text">{escape(EXAMPLE)}</span></p></div><button type="button" class="btn btn-secondary" data-audio="model-example" aria-label="Listen to the example: My teacher is friendly."><span aria-hidden="true">▷</span> Listen to the example</button></article><form id="pw-writing-form" novalidate><p id="pw-count" class="pw-count" role="status" aria-live="polite">0 of 7 responses written.</p><div class="pw-writing-grid">{fields}</div><div class="pi-actions"><button type="button" class="btn btn-primary" id="pw-review">Review my writing</button><button type="button" class="btn btn-secondary" id="pw-reset">Start again</button><button type="button" class="btn btn-secondary" id="pw-undo" hidden>Undo reset</button></div><p id="pw-result" class="pv-result" role="status" aria-live="polite" tabindex="-1" hidden></p></form></div></details>'''
content+=f'''<details class="pi-topic" id="original-page"><summary><span class="pi-number">PDF</span><h2>View the original worksheet · Page 6</h2></summary><div class="pi-topic-body"><p>This activity is Describing People in the lower part of page 6. The Who is it? task above it belongs to Activity 3.</p><figure class="pv-original-page"><img src="{SOURCE_IMAGE}" width="1275" height="1800" alt="Original worksheet page 6, including the Describing People word box, fixed teacher example and seven writing spaces" loading="lazy"><figcaption>ESL Pals · Describing Personality · Page 6</figcaption></figure></div></details><section class="pi-objective pv-download pv-footer" id="paper-version"><div><h2>Original PDF · 10 pages</h2><p>Use Describing People in the lower part of page 6 to practise on paper. The original model and writing spaces are unchanged.</p><p class="pi-small">Worksheet and model: ESL Pals, <cite>Describing Personality</cite>. PDF provided unchanged.</p></div><div class="pi-actions"><a class="btn btn-primary" href="{PDF}" download="22 - Describing Personality.pdf">Download original PDF</a><a class="btn btn-secondary" href="{PREV}">Previous · Meet the Characters</a><a class="btn btn-secondary" href="practice-lab.html#unit-1-personality">Unit 1 activities · 4 of 8 ready</a></div></section><noscript><p class="pi-objective">Enable JavaScript for audio, draft saving and completion review, or download the original PDF to work on paper.</p></noscript>'''
main.append(fragment('<div class="pi-shell">'+content+'</div>'))
models={}
for word in WORDS:
    folder='lesson' if word in ['friendly','creative','shy','talkative'] else 'personality-vocabulary'
    models[word]=dict(text=word,path=f'/ingles/preintermedio-1/audio/unit1/{folder}/{word}.mp3')
models['model-example']=dict(text=EXAMPLE,path='/ingles/preintermedio-1/audio/unit1/describing-people/my-teacher-is-friendly.mp3')
audio_data=html.Element('script');audio_data.text='window.Preintermediate1Audio = '+json.dumps(models)+';';body.append(audio_data)
for src in ['/assets/js/preintermediate1-lesson.js?v=20261024-connected-unit1','/assets/js/preintermediate1-describing-people.js?v='+VERSION]:body.append(fragment('<script src="'+src+'"></script>'))
write(NAME,doc)

lab=html.document_fromstring((COURSE/'practice-lab.html').read_text());unit=lab.get_element_by_id('unit-1');block=lab.get_element_by_id('unit-1-personality')
unit.xpath('./div/p[contains(@class,"pi-goal")]')[0].text='Sessions 1–2 · 6 hours of class · 6 activities available'
block.xpath('./summary/h3')[0].text='Describing Personality · 4 of 8 activities ready'
grid=block.xpath('./div/div[contains(@class,"pi-section-grid")]')[0]
for card in grid.xpath('./article[.//a[@href=$name]]',name=NAME):grid.remove(card)
grid.append(fragment(f'''<article class="course-section-card"><div class="course-section-image"><img src="{MEDIA}cover.webp" alt="Adult learner writing at a classroom desk" width="1600" height="800" loading="lazy" decoding="async"></div><div class="course-section-content"><span class="section-number">04</span><span class="course-status course-status-available">Writing · Available now</span><h3>Describing People</h3><p>Describe people using nine adjectives.</p><a class="card-link" href="{NAME}">Open writing activity</a></div></article>'''))
summaries={'vocabulary-unit-1-personality.html':'9 words: meanings and pictures.','grammar-unit-1-personality-be.html':'am / is / are and sentence practice.',PREV:'5 profiles and two reading tasks.'}
for target,text in summaries.items():grid.xpath('./article[.//a[@href=$name]]//div[contains(@class,"course-section-content")]/p',name=target)[0].text=text
pending=block.xpath('.//ol[contains(@class,"pi-planned-activities")]')[0]
for li in pending.xpath('./li[.//strong[text()="Describing People"]]'):pending.remove(li)
pending.set('start','5')
lab.xpath('//section[@class="pi-objective"]/p')[0].text='Units 1–6 each have a connected listening and reading story. Unit 1 also has four Describing Personality activities: vocabulary, grammar, reading and writing.'
write('practice-lab.html',lab)
for name in ['vocabulary-unit-1-personality.html','grammar-unit-1-personality-be.html',PREV]:
    previous=html.document_fromstring((COURSE/name).read_text());links=previous.xpath('//*[@id="paper-version"]//div[contains(@class,"pi-actions")]')[0]
    for link in links.xpath('./a[contains(@href,"practice-lab.html")]'):link.text='Unit 1 activities · 4 of 8 ready'
    if name==PREV:
        for link in links.xpath('./a[@href=$target]',target=NAME):links.remove(link)
        links.insert(1,fragment(f'<a class="btn btn-secondary" href="{NAME}">Next · Describing People</a>'))
    write(name,previous)
try:
    import qrcode
except ModuleNotFoundError:
    sys.path.insert(0,str(ROOT/'tmp/unit5-explanation/python-deps'))
    import qrcode
import qrcode.image.svg
qrcode.make('https://www.jaralingua.com/ingles/preintermedio-1/'+NAME,image_factory=qrcode.image.svg.SvgPathImage,box_size=10,border=4).save(ROOT/'assets/img/page-qr'/('ingles-preintermedio-1-'+NAME.removesuffix('.html')+'.svg'))
print('Built activity 4: original word box, fixed teacher example and seven writing responses. Activities 5–8 remain pending.')
