"""Build activity 5, preserving all six original pictures and their writing spaces."""
import copy
import json
import sys
from html import escape
from pathlib import Path
from lxml import html
from preintermediate1_unit1_pictures_content import WORDS, INSTRUCTION, PICTURES

ROOT=Path(__file__).resolve().parents[1]
COURSE=ROOT/'ingles/preintermedio-1'
NAME='vocabulary-unit-1-describing-pictures.html'
PREV='writing-unit-1-describing-people.html'
PDF='materials/22-describing-personality-original.pdf'
MEDIA='/assets/img/english-preintermediate-1/unit-1/practice/describing-pictures/'
SOURCE_IMAGE=MEDIA+'original-page-7.webp'
VERSION='20261029-describing-pictures-1'

def fragment(text):return html.fragment_fromstring(text)
def write(name,doc):(COURSE/name).write_text('<!doctype html>\n'+html.tostring(doc,encoding='unicode',method='html')+'\n',encoding='utf-8')

doc=html.document_fromstring((COURSE/PREV).read_text())
description='Look at the six original pictures and describe them using the personality word box.'
doc.find('.//title').text='Describing Pictures | Preintermediate English Course 1'
doc.xpath('//meta[@name="description"]')[0].set('content',description)
head=doc.find('.//head')
for link in head.xpath('./link[contains(@href,"preintermediate1-describing-people.css")]'):head.remove(link)
head.insert(list(head).index(doc.xpath('//link[contains(@href,"course-responsive.css")]')[0]),fragment(f'<link rel="stylesheet" href="/assets/css/preintermediate1-describing-pictures.css?v={VERSION}">'))
body=doc.find('.//body');body.set('class','english-basic-page basic2-page preinter-page pi-practice-page pv-page pp-page')
for script in body.xpath('./script'):
    if not script.get('src') or any(src in script.get('src','') for src in ['preintermediate1-describing-people.js','preintermediate1-lesson.js']):body.remove(script)
main=doc.find('.//main');hero=copy.deepcopy(main[0]);main.clear();main.set('id','main-content')
hero.set('style',f'--hero-image:url({MEDIA}cover.webp)')
hero.xpath('.//p[@class="eyebrow"]')[0].text='Practice Lab · Unit 1 · Visual Vocabulary'
hero.xpath('.//h1')[0].text='Describing Pictures'
hero.xpath('.//div[contains(@class,"pi-hero-copy")]/p[not(@class="eyebrow")]')[0].text=description
actions=hero.xpath('.//div[contains(@class,"hero-actions")]')[0];actions.clear();actions.set('class','hero-actions pi-actions')
actions.extend(html.fragments_fromstring(f'<a class="btn btn-primary" href="#picture-practice">Start activity</a><a class="btn btn-secondary" href="{PDF}" download="22 - Describing Personality.pdf">Download original PDF</a><a class="btn btn-secondary" href="{PREV}">Activity 4 · Writing</a>'))
image=hero.xpath('.//figure/img')[0];image.set('src',MEDIA+'cover.webp');image.set('alt','An adult learner examining illustrated picture cards at a classroom table');image.set('width','1600');image.set('height','800');main.append(hero)


content='''<section class="pi-objective pv-intro"><p class="pi-label">Activity 5 of 8 · ESL Pals · Upper part of page 7</p><h2>Your learning goal</h2><p>Connect visual clues with personality adjectives and describe the six pictures.</p><div class="pi-route"><span>10–15 minutes</span><span>9 words · 6 pictures</span><span>Visual vocabulary · no official grade</span></div><p class="pi-small">Write a word from the box for each picture, then compare your ideas with the visual clues. Pictures can have more than one interpretation. Your draft stays in this browser tab.</p><p id="pp-storage-status" class="pi-small" role="status" hidden></p></section>'''
bank='<div class="pv-wordbank" aria-label="Word box">'+''.join(f'<button type="button" data-audio="{w}" aria-label="Listen to {w}"><span aria-hidden="true">▷</span> {w}</button>' for w in WORDS)+'</div>'
cards=''.join(f'''<article class="pp-picture"><img src="{MEDIA}picture-{p['number']:02}.webp" width="{p['width']}" height="{p['height']}" alt="{escape(p['alt'])}"><label for="picture-{p['number']}"><b class="pv-item-number">{p['number']}.</b><span class="pp-sr-only"> Describe picture {p['number']}</span><input id="picture-{p['number']}" name="q{p['number']}" type="text" maxlength="120" autocomplete="off" autocapitalize="none" spellcheck="true" required aria-describedby="picture-feedback-{p['number']}" placeholder="Your word"></label><div id="picture-feedback-{p['number']}" class="pp-feedback pv-feedback" hidden><strong>Possible description: {escape(p['ideas'])}</strong><p>{escape(p['evidence'])}</p></div></article>''' for p in PICTURES)
content+=f'''<details class="pi-topic" id="picture-practice"><summary><span class="pi-number">Look</span><h2>Describing Pictures</h2></summary><div class="pi-topic-body"><p class="pv-original-instruction">{escape(INSTRUCTION)}</p>{bank}<div class="pi-audio-controls"><span>Word audio</span><button type="button" data-speed="0.75" aria-pressed="false">0.75×</button><button type="button" data-speed="1" aria-pressed="true">1.0×</button><button type="button" data-speed="1.25" aria-pressed="false">1.25×</button><button type="button" data-stop>Stop audio</button></div><p class="pv-audio-status" data-audio-status role="status" aria-live="polite">Tap a word to hear it.</p><form id="pp-picture-form" novalidate><p id="pp-count" class="pp-count" role="status" aria-live="polite">0 of 6 pictures described.</p><div class="pp-picture-grid">{cards}</div><div class="pi-actions"><button type="button" class="btn btn-primary" id="pp-review">Compare my descriptions</button><button type="button" class="btn btn-secondary" id="pp-reset">Start again</button><button type="button" class="btn btn-secondary" id="pp-undo" hidden>Undo reset</button></div><p id="pp-result" class="pv-result" role="status" aria-live="polite" tabindex="-1" hidden></p></form></div></details>'''
content+=f'''<details class="pi-topic" id="original-page"><summary><span class="pi-number">PDF</span><h2>View the original worksheet · Page 7</h2></summary><div class="pi-topic-body"><p>This activity uses Describing Pictures in the upper part of page 7. Discussion Questions below it belongs to Activity 6.</p><figure class="pv-original-page"><img src="{SOURCE_IMAGE}" width="1275" height="1800" alt="Original worksheet page 7 with six Describing Pictures illustrations and the following Discussion Questions section" loading="lazy"><figcaption>ESL Pals · Describing Personality · Page 7</figcaption></figure></div></details><section class="pi-objective pv-download pv-footer" id="paper-version"><div><h2>Original PDF · 10 pages</h2><p>Use Describing Pictures in the upper part of page 7 to practise on paper, with the same six pictures and writing spaces.</p><p class="pi-small">Exercise and illustrations: ESL Pals, <cite>Describing Personality</cite>. PDF provided unchanged. Comparison ideas are interpretations, not an official answer key.</p></div><div class="pi-actions"><a class="btn btn-primary" href="{PDF}" download="22 - Describing Personality.pdf">Download original PDF</a><a class="btn btn-secondary" href="{PREV}">Previous · Describing People</a><a class="btn btn-secondary" href="practice-lab.html#unit-1-personality">Unit 1 activities · 5 of 8 ready</a></div></section><noscript><p class="pi-objective">Enable JavaScript for audio, draft saving and comparison, or download the original PDF to work on paper.</p></noscript>'''
main.append(fragment('<div class="pi-shell">'+content+'</div>'))
models={}
for word in WORDS:
    folder='lesson' if word in ['friendly','creative','shy','talkative'] else 'personality-vocabulary'
    models[word]=dict(text=word,path=f'/ingles/preintermedio-1/audio/unit1/{folder}/{word}.mp3')
audio_data=html.Element('script');audio_data.text='window.Preintermediate1Audio = '+json.dumps(models)+';';body.append(audio_data)
for src in ['/assets/js/preintermediate1-lesson.js?v=20261024-connected-unit1','/assets/js/preintermediate1-describing-pictures.js?v='+VERSION]:body.append(fragment('<script src="'+src+'"></script>'))
write(NAME,doc)

lab=html.document_fromstring((COURSE/'practice-lab.html').read_text());unit=lab.get_element_by_id('unit-1');block=lab.get_element_by_id('unit-1-personality')
unit.xpath('./div/p[contains(@class,"pi-goal")]')[0].text='Sessions 1–2 · 6 hours of class · 7 activities available'
block.xpath('./summary/h3')[0].text='Describing Personality · 5 of 8 activities ready'
grid=block.xpath('./div/div[contains(@class,"pi-section-grid")]')[0]
for card in grid.xpath('./article[.//a[@href=$name]]',name=NAME):grid.remove(card)
grid.append(fragment(f'''<article class="course-section-card"><div class="course-section-image"><img src="{MEDIA}cover.webp" alt="Adult learner examining illustrated picture cards" width="1600" height="800" loading="lazy" decoding="async"></div><div class="course-section-content"><span class="section-number">05</span><span class="course-status course-status-available">Visual Vocabulary · Available now</span><h3>Describing Pictures</h3><p>Describe six original pictures.</p><a class="card-link" href="{NAME}">Open picture activity</a></div></article>'''))
pending=block.xpath('.//ol[contains(@class,"pi-planned-activities")]')[0]
for li in pending.xpath('./li[.//strong[text()="Describing Pictures"]]'):pending.remove(li)
pending.set('start','6')
lab.xpath('//section[@class="pi-objective"]/p')[0].text='Units 1–6 each have a connected listening and reading story. Unit 1 also has five Describing Personality activities: vocabulary, grammar, reading, writing and visual vocabulary.'
write('practice-lab.html',lab)
for name in ['vocabulary-unit-1-personality.html','grammar-unit-1-personality-be.html','reading-unit-1-meet-the-characters.html',PREV]:
    previous=html.document_fromstring((COURSE/name).read_text());links=previous.xpath('//*[@id="paper-version"]//div[contains(@class,"pi-actions")]')[0]
    for link in links.xpath('./a[contains(@href,"practice-lab.html")]'):link.text='Unit 1 activities · 5 of 8 ready'
    if name==PREV:
        for link in links.xpath('./a[@href=$target]',target=NAME):links.remove(link)
        links.insert(1,fragment(f'<a class="btn btn-secondary" href="{NAME}">Next · Describing Pictures</a>'))
    write(name,previous)
try:
    import qrcode
except ModuleNotFoundError:
    sys.path.insert(0,str(ROOT/'tmp/unit5-explanation/python-deps'))
    import qrcode
import qrcode.image.svg
qrcode.make('https://www.jaralingua.com/ingles/preintermedio-1/'+NAME,image_factory=qrcode.image.svg.SvgPathImage,box_size=10,border=4).save(ROOT/'assets/img/page-qr'/('ingles-preintermedio-1-'+NAME.removesuffix('.html')+'.svg'))
print('Built activity 5: six original pictures and writing responses. Activities 6–8 remain pending.')
