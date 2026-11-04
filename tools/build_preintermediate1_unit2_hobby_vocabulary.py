"""Build the first Unit 2 worksheet activity and its eight-activity route."""
import copy
import json
import sys
from pathlib import Path
from html import escape
from lxml import html
from preintermediate1_unit2_hobby_vocabulary_content import WORDS, PICTURES, VOCABULARY, PLAN, INSTRUCTION, WARMUP_INSTRUCTION, WARMUP_OPTIONS

ROOT = Path(__file__).resolve().parents[1]
COURSE = ROOT/'ingles/preintermedio-1'
NAME = 'vocabulary-unit-2-hobbies.html'
PDF = 'materials/25-hobbies-can-and-cant-original.pdf'
MEDIA = '/assets/img/english-preintermediate-1/unit-2/practice/hobby-vocabulary/'
AUDIO = '/ingles/preintermedio-1/audio/unit2/hobby-vocabulary/'
VERSION = '20261103-hobby-vocabulary-1'


def fragment(text): return html.fragment_fromstring(text)
def write(name, doc): (COURSE/name).write_text('<!doctype html>\n'+html.tostring(doc,encoding='unicode',method='html')+'\n')


doc = html.document_fromstring((COURSE/'course-overview.html').read_text())
description = 'Learn eight hobbies with the original picture exercise. Choose a definition of hobby and write about your own abilities.'
doc.find('.//title').text = 'Hobby Vocabulary | Preintermediate English Course 1'
doc.xpath('//meta[@name="description"]')[0].set('content',description)
doc.xpath('//link[contains(@href,"course-responsive.css")]')[0].addprevious(fragment(f'<link rel="stylesheet" href="/assets/css/preintermediate1-hobby-vocabulary.css?v={VERSION}">'))
body=doc.find('.//body');body.set('class','english-basic-page basic2-page preinter-page pi-practice-page pi-connected-page hv-page')
for el in body.xpath('./script[contains(@src,"preintermediate1-")]'):body.remove(el)
for link in doc.xpath('//header//a[@aria-current]'):link.attrib.pop('aria-current',None)
doc.xpath('//header//ul[contains(@class,"nav-links")]')[0].append(fragment('<li><a href="practice-lab.html">Practice Lab</a></li>'))
main=doc.find('.//main');hero=copy.deepcopy(main[0]);main.clear();main.set('id','main-content');hero.set('style',f'--hero-image:url({MEDIA}cover.webp)')
hero.xpath('.//p[@class="eyebrow"]')[0].text='Practice Lab · Unit 2 · Vocabulary'
hero.xpath('.//h1')[0].text='Hobby Vocabulary'
hero.xpath('.//div[contains(@class,"pi-hero-copy")]/p[not(@class="eyebrow")]')[0].text=description
actions=hero.xpath('.//div[contains(@class,"hero-actions")]')[0];actions.clear();actions.set('class','hero-actions pi-actions')
actions.extend(html.fragments_fromstring(f'<a class="btn btn-primary" href="#warm-up">Start activity</a><a class="btn btn-secondary" href="{PDF}" download="25 - Hobbies - Can and Cant.pdf">Download original PDF</a><a class="btn btn-secondary" href="practice-lab.html#unit-2-hobbies">Unit 2 activities</a>'))
im=hero.xpath('.//figure/img')[0];im.set('src',MEDIA+'cover.webp');im.set('alt','Two adult learners exploring free-time activities at a community hobby centre');im.set('width','1600');im.set('height','800');main.append(hero)
content='''<section class="pi-objective hv-intro"><p class="pi-label">Hobbies: Can / Can’t · Activity 1 of 8 · ESL Pals · Page 1</p><h2>Your learning goal</h2><p>Identify eight hobbies and use the word box to describe your own abilities.</p><div class="pi-route"><span>Warm up · 8 original pictures</span><span>Personal ability table</span><span>Practice · no official grade</span></div><p class="pi-small">Choose, check and try again. Explanations appear after two different complete attempts, or when all answers are correct. Personal ability columns are not scored. Your draft stays in this browser tab; each section has its own reset and undo.</p><p id="hv-storage-status" class="pi-small" role="status" hidden></p></section>'''
content+='''<div class="pi-audio-controls" aria-label="Vocabulary and instruction audio controls"><span>Audio speed</span><button type="button" data-hv-speed="0.75" aria-pressed="false">0.75×</button><button type="button" data-hv-speed="1" aria-pressed="true">1.0×</button><button type="button" data-hv-speed="1.25" aria-pressed="false">1.25×</button><button type="button" data-hv-stop>Stop audio</button><span id="hv-audio-status" role="status" aria-live="polite">Listen to an underlined word or an instruction.</span></div>'''
warmup=''.join(f'<label class="hv-definition"><input type="radio" name="definition" value="{i}" aria-describedby="hv-warmup-feedback"><span><b>{i}.</b> {escape(text)}</span></label>' for i,text in enumerate(WARMUP_OPTIONS,1))


def task_actions(id, check):
    return f'<div class="pi-actions"><button type="button" class="btn btn-primary" data-hv-check>{check}</button><button type="button" class="btn btn-secondary" data-hv-reset>Start again</button><button type="button" class="btn btn-secondary" data-hv-undo hidden>Undo reset</button></div><p class="hv-result" role="status" aria-live="polite" tabindex="-1" hidden></p>'


content+=f'''<details class="pi-topic" id="warm-up"><summary><span class="pi-number">01</span><h2>Warm up · What is a hobby?</h2></summary><div class="pi-topic-body"><div class="hv-instruction"><p class="hv-original-instruction" data-glossary>{escape(WARMUP_INSTRUCTION)}</p><button type="button" class="btn btn-secondary" data-hv-audio="warm-up-instruction">Listen to the warm-up instruction</button></div><div class="hv-warmup-layout"><div data-hv-task="warmup"><p class="hv-count" role="status" aria-live="polite">0 of 1 answered.</p>{warmup}<p id="hv-warmup-feedback" class="hv-feedback" hidden></p>{task_actions('warmup','Check answer')}</div><img class="hv-warmup-art" src="{MEDIA}warm-up-illustration.webp" width="1305" height="959" alt="Original worksheet illustration of a person with a fishing rod" loading="lazy"></div></div></details>'''
bank='<ul class="hv-wordbox" aria-label="Original word box">'+''.join('<li><span data-glossary>'+escape(w)+'</span></li>' for w in WORDS)+'</ul>'
options='<option value="">Choose…</option>'+''.join(f'<option value="{escape(w)}">{escape(w)}</option>' for w in WORDS)
cards=''.join(f'''<article class="hv-picture"><figure><img src="{MEDIA}picture-{p['number']:02}.webp" width="{p['width']}" height="{p['height']}" alt="{p['alt']}" loading="lazy" decoding="async"></figure><label for="picture-{p['number']}"><b>{p['number']}.</b> Picture {p['number']}</label><select id="picture-{p['number']}" name="picture-{p['number']}" aria-describedby="hv-picture-feedback-{p['number']}">{options}</select><p id="hv-picture-feedback-{p['number']}" class="hv-feedback" hidden></p></article>''' for p in PICTURES)
content+=f'''<details class="pi-topic" id="picture-practice"><summary><span class="pi-number">02</span><h2>Vocabulary · Match the pictures</h2></summary><div class="pi-topic-body"><div class="hv-instruction"><p class="hv-original-instruction">{escape(INSTRUCTION)}</p><button type="button" class="btn btn-secondary" data-hv-audio="vocabulary-instruction">Listen to the vocabulary instruction</button></div>{bank}<p class="pi-small">Hover or focus for the meaning in Spanish. Tap an underlined word to hear its pronunciation.</p><div data-hv-task="pictures"><p class="hv-count" role="status" aria-live="polite">0 of 8 answered.</p><div class="hv-picture-grid">{cards}</div>{task_actions('pictures','Check answers')}</div><div class="pi-actions"><a class="btn btn-secondary" href="#my-abilities">Continue to the personal table</a></div></div></details>'''
content+=f'''<details class="pi-topic" id="my-abilities"><summary><span class="pi-number">You</span><h2>Things I can do · Things I can’t do</h2></summary><div class="pi-topic-body"><p>Use the original word box above to divide the hobbies into the two columns for you. You can leave one column empty if all your choices belong in the other.</p><div id="hv-personal"><div class="hv-personal-grid"><div><label for="hv-can">Things I can do!</label><textarea id="hv-can" rows="4" placeholder="Write hobbies here." spellcheck="true"></textarea></div><div><label for="hv-cant">Things I can’t do!</label><textarea id="hv-cant" rows="4" placeholder="Write hobbies here." spellcheck="true"></textarea></div></div><div class="pi-actions"><button type="button" class="btn btn-primary" id="hv-personal-check">Review my table</button><button type="button" class="btn btn-secondary" id="hv-personal-reset">Start again</button><button type="button" class="btn btn-secondary" id="hv-personal-undo" hidden>Undo reset</button></div><p id="hv-personal-result" class="hv-result" role="status" aria-live="polite" tabindex="-1" hidden></p></div><p class="pi-small">Your abilities are personal. This table has no single answer key and is not scored.</p></div></details><details class="pi-topic" id="original-page"><summary><span class="pi-number">PDF</span><h2>View the original worksheet · Page 1</h2></summary><div class="pi-topic-body"><figure class="hv-original-page"><img src="{MEDIA}original-page-1.webp" width="1275" height="1801" alt="Complete original ESL Pals page 1: warm up, word box, eight pictures and the personal ability table" loading="lazy"><figcaption>ESL Pals · Hobbies: Can / Can’t · Page 1</figcaption></figure></div></details><section class="pi-objective hv-footer" id="paper-version"><div><h2>Original PDF · 10 pages</h2><p>Words, instructions and original images: ESL Pals, <cite>Hobbies: Can / Can’t</cite>. The complete PDF is provided unchanged. This activity uses only page 1.</p></div><div class="pi-actions"><a class="btn btn-primary" href="{PDF}" download="25 - Hobbies - Can and Cant.pdf">Download original PDF</a><a class="btn btn-secondary" href="practice-lab.html#unit-2-hobbies">Unit 2 worksheet · 1 of 8 ready</a></div></section><noscript><p class="pi-objective">Read the original page or download the PDF to work on paper. Enable JavaScript for audio, meanings, answer checking and draft saving.</p></noscript>'''
main.append(fragment('<div class="pi-shell">'+content+'</div>'))
body.append(fragment('<audio id="hv-audio" preload="none" hidden></audio>'))
audio={v['term'].replace(' ','-'):dict(text=v['term'],path=v['audio']) for v in VOCABULARY}
audio.update({key:dict(text=text,path=AUDIO+key+'.mp3') for key,text in [('warm-up-instruction',WARMUP_INSTRUCTION),('vocabulary-instruction',INSTRUCTION)]})
data=html.Element('script',id='hv-data',type='application/json');data.text=json.dumps(dict(words=WORDS,vocabulary=VOCABULARY,audio=audio,tasks={'warmup':[dict(answer='2',text=WARMUP_OPTIONS[1],explanation='A hobby is something you do outside work for enjoyment. It is not a work task or something you cannot do.')],'pictures':[dict(answer=p['answer'],text=p['answer'],explanation=p['explanation']) for p in PICTURES]}),ensure_ascii=False).replace('<','\\u003c');body.append(data)
for src in ['/assets/js/first-visit-vocabulary.js?v=20261031-personality-speaking','/assets/js/preintermediate1-hobby-vocabulary.js?v='+VERSION]:body.append(fragment('<script src="'+src+'"></script>'))
write(NAME,doc)

lab=html.document_fromstring((COURSE/'practice-lab.html').read_text());unit=lab.get_element_by_id('unit-2').xpath('./div[contains(@class,"pi-topic-body")]')[0]
for previous in unit.xpath('./details[@id="unit-2-hobbies"]'):unit.remove(previous)
for previous in unit.xpath('./p[@lang="es"]'):unit.remove(previous)
unit.xpath('./p[contains(@class,"pi-goal")]')[0].text='Sessions 3–5 · 9 hours of class · 3 activities available'
card=f'''<article class="course-section-card"><div class="course-section-image"><img src="{MEDIA}cover.webp" alt="Adults exploring hobbies together" width="1600" height="800" loading="lazy" decoding="async"></div><div class="course-section-content"><span class="section-number">01</span><span class="course-status course-status-available">Vocabulary · Available now</span><h3>Hobby Vocabulary</h3><p>8 original pictures, word meanings and your ability table.</p><a class="card-link" href="{NAME}">Open vocabulary activity</a></div></article>'''
pending=''.join(f'<li><div><strong>{escape(title)}</strong><span>{escape(kind)} · {escape(pages)}</span></div><span class="pi-small" lang="es">En preparación</span></li>' for title,kind,pages in PLAN[1:])
unit.append(fragment('<details class="pi-topic" id="unit-2-hobbies"><summary><span class="pi-number">+</span><h3>Hobbies: Can / Can’t · 1 of 8 activities ready</h3></summary><div class="pi-topic-body"><p>Original ESL Pals worksheet, organised by activity. The complete PDF is available in Hobby Vocabulary.</p><div class="pi-section-grid">'+card+'</div><section class="pi-practice-pending"><h3 class="pi-model-heading">Next activities · en preparación</h3><ol class="pi-planned-activities" start="2">'+pending+'</ol></section></div></details>'))
lab.xpath('//section[@class="pi-objective"]/p')[0].text='Units 1–6 each have a connected listening and reading story. Unit 1 also has all eight Describing Personality activities and extra grammar practice. Unit 2 begins its Hobbies: Can / Can’t worksheet with Hobby Vocabulary.'
write('practice-lab.html',lab)
library=html.document_fromstring((COURSE/'listening-library.html').read_text());shell=library.get_element_by_id('unit-audio-library')
for previous in shell.xpath('./section[@id="unit-2-hobby-vocabulary-audio"]'):shell.remove(previous)
shell.get_element_by_id('unit-2').addprevious(fragment('<section class="pi-objective" id="unit-2-hobby-vocabulary-audio"><h2>Unit 2 · Hobby Vocabulary audio</h2><p>Listen to eight hobbies, the word hobby and two original instructions inside the vocabulary activity.</p><div class="pi-library-activities">'+card+'</div></section>'));write('listening-library.html',library)
try:
    import qrcode
except ModuleNotFoundError:
    sys.path.insert(0,str(ROOT/'tmp/unit5-explanation/python-deps'));import qrcode
import qrcode.image.svg
qrcode.make('https://www.jaralingua.com/ingles/preintermedio-1/'+NAME,image_factory=qrcode.image.svg.SvgPathImage,box_size=10,border=4).save(ROOT/'assets/img/page-qr'/('ingles-preintermedio-1-'+NAME.removesuffix('.html')+'.svg'))
print('Built Unit 2 worksheet activity 1/8: original warm up, eight pictures, personal columns and unchanged downloadable PDF.')

# Reapply the separately approved grammar activity after reconstructing this route.
import runpy
runpy.run_path(str(ROOT/'tools/build_preintermediate1_unit2_hobbies_grammar.py'), run_name='__main__')
