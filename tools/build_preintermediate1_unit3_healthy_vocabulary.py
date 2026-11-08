"""Build only the approved original page-1 Task-2 vocabulary activity."""
import copy,json,sys
from pathlib import Path
from html import escape
from lxml import html
from preintermediate1_unit3_healthy_vocabulary_content import INSTRUCTION,WORDS,VOCABULARY,PICTURES,AUDIO_ROOT
ROOT=Path(__file__).resolve().parents[1];COURSE=ROOT/'ingles/preintermedio-1'
NAME='vocabulary-unit-3-healthy-lifestyle.html';PDF='materials/healthy-lifestyle-original.pdf'
MEDIA='/assets/img/english-preintermediate-1/unit-3/practice/healthy-vocabulary/'
VERSION='20261107-healthy-vocabulary-1'
def fragment(s):return html.fragment_fromstring(s)
def write(name,doc):(COURSE/name).write_text('<!doctype html>\n'+html.tostring(doc,encoding='unicode',method='html')+'\n')
doc=html.document_fromstring((COURSE/'course-overview.html').read_text())
description='Match nine healthy-lifestyle words to the original pictures. Explore their meanings and pronunciation, then check your answers.'
doc.find('.//title').text='Healthy Lifestyle Vocabulary | Preintermediate English Course 1'
doc.xpath('//meta[@name="description"]')[0].set('content',description)
doc.xpath('//link[contains(@href,"course-responsive.css")]')[0].addprevious(fragment(f'<link rel="stylesheet" href="/assets/css/preintermediate1-healthy-vocabulary.css?v={VERSION}">'))
body=doc.find('.//body');body.set('class','english-basic-page basic2-page preinter-page pi-practice-page pi-connected-page hlv-page')
for el in body.xpath('./script[contains(@src,"preintermediate1-")]'):body.remove(el)
for link in doc.xpath('//header//a[@aria-current]'):link.attrib.pop('aria-current',None)
doc.xpath('//header//ul[contains(@class,"nav-links")]')[0].append(fragment('<li><a href="practice-lab.html">Practice Lab</a></li>'))
main=doc.find('.//main');hero=copy.deepcopy(main[0]);main.clear();main.set('id','main-content');main.set('data-jaralingua-managed-draft','true')
hero.set('style',f'--hero-image:url({MEDIA}cover.webp)')
hero.xpath('.//p[@class="eyebrow"]')[0].text='Practice Lab · Unit 3 · Vocabulary'
hero.xpath('.//h1')[0].text='Healthy Lifestyle Vocabulary'
hero.xpath('.//div[contains(@class,"pi-hero-copy")]/p[not(@class="eyebrow")]')[0].text=description
actions=hero.xpath('.//div[contains(@class,"hero-actions")]')[0];actions.clear();actions.set('class','hero-actions pi-actions')
actions.extend(html.fragments_fromstring(f'<a class="btn btn-primary" href="#picture-practice">Start vocabulary</a><a class="btn btn-secondary" href="{PDF}" download="Healthy Lifestyle - ESL Pals.pdf">Download original PDF</a><a class="btn btn-secondary" href="practice-lab.html#unit-3-healthy-lifestyle">Unit 3 activities</a>'))
im=hero.xpath('.//figure/img')[0];im.set('src',MEDIA+'cover.webp');im.set('alt','Two adult friends choosing berries and vegetables at an outdoor market');im.set('width','1600');im.set('height','800');main.append(hero)
content='''<section class="pi-objective hlv-intro"><p class="pi-label">Healthy Lifestyle · ESL Pals · Page 1, Task 2</p><h2>Your vocabulary goal</h2><p>Identify nine words using the original pictures and word box.</p><div class="pi-route"><span>Vocabulary · 9 original pictures</span><span>Meanings and pronunciation</span><span>Practice · no official grade</span></div><p class="pi-small">Choose, check and try again. Explanations appear after two different complete attempts, or when all nine answers are correct. Your draft stays in this browser tab. Start again has an undo option.</p><p id="hlv-storage-status" class="pi-small" role="status" hidden></p></section>'''
content+='''<div class="pi-audio-controls" aria-label="Vocabulary and instruction audio controls"><span>Audio speed</span><button type="button" data-hlv-speed="0.75" aria-pressed="false">0.75×</button><button type="button" data-hlv-speed="1" aria-pressed="true">1.0×</button><button type="button" data-hlv-speed="1.25" aria-pressed="false">1.25×</button><button type="button" data-hlv-stop>Stop audio</button><span id="hlv-audio-status" role="status" aria-live="polite">Tap an underlined word or listen to the instruction.</span></div>'''
bank='<ul class="hlv-wordbox" aria-label="Original word box">'+''.join('<li><span data-glossary>'+escape(w)+'</span></li>' for w in WORDS)+'</ul>'
options='<option value="">Choose…</option>'+''.join(f'<option value="{escape(w)}">{escape(w)}</option>' for w in WORDS)
cards=''.join(f'''<article class="hlv-picture"><figure><img src="{MEDIA}picture-{p['number']:02}.webp" width="{p['width']}" height="{p['height']}" alt="{escape(p['alt'])}" loading="lazy" decoding="async"></figure><label for="picture-{p['number']}"><b>{p['number']}.</b> Picture {p['number']}</label><select id="picture-{p['number']}" name="picture-{p['number']}" aria-describedby="hlv-feedback-{p['number']}">{options}</select><p id="hlv-feedback-{p['number']}" class="hlv-feedback" hidden></p></article>''' for p in PICTURES)
content+=f'''<details class="pi-topic" id="picture-practice"><summary><span class="pi-number">01</span><h2>Vocabulary · Match the pictures</h2></summary><div class="pi-topic-body"><div class="hlv-instruction"><p class="hlv-original-instruction">{escape(INSTRUCTION)}</p><button type="button" class="btn btn-secondary" data-hlv-instruction>Listen to the instruction</button></div>{bank}<p class="pi-small">Hover or focus on an underlined word for its meaning in Spanish. Tap it to hear its pronunciation.</p><div id="hlv-practice"><p id="hlv-count" class="hlv-count" role="status" aria-live="polite">0 of 9 answered.</p><div class="hlv-picture-grid">{cards}</div><div class="pi-actions"><button type="button" class="btn btn-primary" id="hlv-check">Check answers</button><button type="button" class="btn btn-secondary" id="hlv-reset">Start again</button><button type="button" class="btn btn-secondary" id="hlv-undo" hidden>Undo reset</button></div><p id="hlv-result" class="hlv-result" role="status" aria-live="polite" tabindex="-1" hidden></p></div></div></details>'''
content+=f'''<details class="pi-topic" id="original-page"><summary><span class="pi-number">PDF</span><h2>View the original worksheet · Page 1</h2></summary><div class="pi-topic-body"><figure class="hlv-original-page"><img src="{MEDIA}original-page-1.webp" width="1275" height="1802" alt="Complete original ESL Pals page 1, including the nine vocabulary pictures" loading="lazy"><figcaption>ESL Pals · Healthy Lifestyle · Page 1. This activity uses Task 2 only; the conversation tasks belong to Speaking.</figcaption></figure></div></details>'''
content+=f'''<section class="pi-objective hlv-footer" id="paper-version"><div><h2>Original PDF · 9 pages</h2><p>Words, instruction and original illustrations: ESL Pals, <cite>Healthy Lifestyle</cite>. Download the complete original worksheet to work on paper. This page uses the nine picture matches from page 1, Task 2.</p></div><div class="pi-actions"><a class="btn btn-primary" href="{PDF}" download="Healthy Lifestyle - ESL Pals.pdf">Download original PDF</a><a class="btn btn-secondary" href="practice-lab.html#unit-3-healthy-lifestyle">Unit 3 vocabulary activities</a></div></section><noscript><p class="pi-objective">Read the original page or download the PDF to work on paper. Enable JavaScript for audio, word meanings, answer checking and draft saving.</p></noscript>'''
main.append(fragment('<div class="pi-shell">'+content+'</div>'));body.append(fragment('<audio id="hlv-audio" preload="none" hidden></audio>'))
data=html.Element('script',id='hlv-data',type='application/json');data.text=json.dumps(dict(words=WORDS,vocabulary=VOCABULARY,instruction=dict(text=INSTRUCTION,path=AUDIO_ROOT+'instruction.mp3'),pictures=[dict(answer=p['answer'],explanation=p['explanation']) for p in PICTURES]),ensure_ascii=False).replace('<','\\u003c');body.append(data)
for src in ['/assets/js/first-visit-vocabulary.js?v=20261031-personality-speaking','/assets/js/preintermediate1-healthy-vocabulary.js?v='+VERSION]:body.append(fragment('<script src="'+src+'"></script>'))
write(NAME,doc)
card=f'''<article class="course-section-card"><div class="course-section-image"><img src="{MEDIA}cover.webp" alt="Two adults choosing fresh food at an outdoor market" width="1600" height="800" loading="lazy" decoding="async"></div><div class="course-section-content"><span class="section-number">01</span><span class="course-status course-status-available">Vocabulary · Available now</span><h3>Healthy Lifestyle Vocabulary</h3><p>9 original picture matches, meanings and pronunciation.</p><a class="card-link" href="{NAME}">Open vocabulary activity</a></div></article>'''
lab=html.document_fromstring((COURSE/'practice-lab.html').read_text());unit=lab.get_element_by_id('unit-3').xpath('./div[contains(@class,"pi-topic-body")]')[0]
for old in unit.xpath('./details[@id="unit-3-healthy-lifestyle"]'):unit.remove(old)
for old in unit.xpath('./p[@lang="es"]'):unit.remove(old)
unit.xpath('./p[contains(@class,"pi-goal")]')[0].text='Sessions 6–8 · 9 hours of class · 3 activities available'
unit.append(fragment('<details class="pi-topic" id="unit-3-healthy-lifestyle"><summary><span class="pi-number">+</span><h3>Healthy Lifestyle · Vocabulary</h3></summary><div class="pi-topic-body"><p>Original ESL Pals worksheet, with activities separated by skill. Download the complete PDF inside the vocabulary page.</p><div class="pi-section-grid">'+card+'</div><p class="pi-small" lang="es">Las demás actividades del material están en preparación.</p></div></details>'))
intro=lab.xpath('//section[@class="pi-objective"]/p')[0]
if 'Unit 3 adds Healthy Lifestyle Vocabulary' not in (intro.text or ''):intro.text=(intro.text or '')+' Unit 3 adds Healthy Lifestyle Vocabulary.'
write('practice-lab.html',lab)
library=html.document_fromstring((COURSE/'listening-library.html').read_text());shell=library.get_element_by_id('unit-audio-library')
for old in shell.xpath('./section[@id="unit-3-healthy-vocabulary-audio"]'):shell.remove(old)
shell.get_element_by_id('unit-3').addprevious(fragment('<section class="pi-objective" id="unit-3-healthy-vocabulary-audio"><h2>Unit 3 · Healthy Lifestyle vocabulary audio</h2><p>Listen to the nine original words and the picture-matching instruction inside the vocabulary activity.</p><div class="pi-library-activities">'+card+'</div></section>'))
write('listening-library.html',library)
try:import qrcode
except ModuleNotFoundError:sys.path.insert(0,str(ROOT/'tmp/unit5-explanation/python-deps'));import qrcode
import qrcode.image.svg
qrcode.make('https://www.jaralingua.com/ingles/preintermedio-1/'+NAME,image_factory=qrcode.image.svg.SvgPathImage,box_size=10,border=4).save(ROOT/'assets/img/page-qr'/('ingles-preintermedio-1-'+NAME.removesuffix('.html')+'.svg'))
print('Built Unit 3 Vocabulary: nine original matches only, PDF buttons, draft recovery and audio.')

# Reapply the separately approved page-2 vocabulary activity after this page.
import runpy
runpy.run_path(str(ROOT/'tools/build_preintermediate1_unit3_food_fitness.py'), run_name='__main__')
