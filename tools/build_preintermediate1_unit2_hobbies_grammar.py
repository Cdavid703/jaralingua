"""Build only the approved second activity of the Unit 2 original worksheet."""
import copy
import json
import sys
from pathlib import Path
from html import escape
from lxml import html
from preintermediate1_unit2_hobbies_grammar_content import THEORY_INSTRUCTION, THEORY, INSTRUCTIONS, GAPS, FIXES, PROMPTS, VOCABULARY, AUDIO
from preintermediate1_unit2_hobby_vocabulary_content import PLAN
ROOT=Path(__file__).resolve().parents[1]
COURSE=ROOT/'ingles/preintermedio-1'
NAME='grammar-unit-2-hobbies-can-cant.html'
PDF='materials/25-hobbies-can-and-cant-original.pdf'
MEDIA='/assets/img/english-preintermediate-1/unit-2/practice/hobbies-grammar/'
VERSION='20261103-hobbies-grammar-1'
def fragment(text):return html.fragment_fromstring(text)
def write(name,doc): (COURSE/name).write_text('<!doctype html>\n'+html.tostring(doc,encoding='unicode',method='html')+'\n')
def audio_button(slug,label):return f'<button type="button" class="btn btn-secondary" data-hg-audio="{slug}">{escape(label)}</button>'
def actions(check):return f'<div class="pi-actions"><button type="button" class="btn btn-primary" data-hg-check>{check}</button><button type="button" class="btn btn-secondary" data-hg-reset>Start again</button><button type="button" class="btn btn-secondary" data-hg-undo hidden>Undo reset</button></div><p class="hg-result" role="status" aria-live="polite" tabindex="-1" hidden></p>'
def folder(id,number,title,content):return f'<details class="pi-topic" id="{id}"><summary><span class="pi-number">{number}</span><h2>{title}</h2></summary><div class="pi-topic-body">{content}</div></details>'
def instruction(number):return '<div class="hg-instruction"><p class="hg-original-instruction">'+escape(INSTRUCTIONS[number])+'</p>'+audio_button('task-'+number+'-instruction','Listen to the Task '+number+' instruction')+'</div>'
doc=html.document_fromstring((COURSE/'course-overview.html').read_text())
description='Practise can and can’t with the original grammar worksheet: personal abilities, seven corrections and six sentences about you.'
doc.find('.//title').text='Hobbies with Can and Can’t | Preintermediate English Course 1'
doc.xpath('//meta[@name="description"]')[0].set('content',description)
doc.xpath('//link[contains(@href,"course-responsive.css")]')[0].addprevious(fragment(f'<link rel="stylesheet" href="/assets/css/preintermediate1-hobbies-grammar.css?v={VERSION}">'))
body=doc.find('.//body');body.set('class','english-basic-page basic2-page preinter-page pi-practice-page pi-connected-page hg-page')
for el in body.xpath('./script[contains(@src,"preintermediate1-")]'):body.remove(el)
for link in doc.xpath('//header//a[@aria-current]'):link.attrib.pop('aria-current',None)
doc.xpath('//header//ul[contains(@class,"nav-links")]')[0].append(fragment('<li><a href="practice-lab.html">Practice Lab</a></li>'))
main=doc.find('.//main');hero=copy.deepcopy(main[0]);main.clear();main.set('id','main-content');hero.set('style',f'--hero-image:url({MEDIA}cover.webp)')
hero.xpath('.//p[@class="eyebrow"]')[0].text='Practice Lab · Unit 2 · Grammar'
hero.xpath('.//h1')[0].text='Hobbies with Can and Can’t'
hero.xpath('.//div[contains(@class,"pi-hero-copy")]/p[not(@class="eyebrow")]')[0].text=description
a=hero.xpath('.//div[contains(@class,"hero-actions")]')[0];a.clear();a.set('class','hero-actions pi-actions')
a.extend(html.fragments_fromstring(f'<a class="btn btn-primary" href="#grammar-reference">Start activity</a><a class="btn btn-secondary" href="{PDF}" download="25 - Hobbies - Can and Cant.pdf">Download original PDF</a><a class="btn btn-secondary" href="practice-lab.html#unit-2-hobbies">Unit 2 activities</a>'))
im=hero.xpath('.//figure/img')[0];im.set('src',MEDIA+'cover.webp');im.set('alt','An adult beginner learning a dance step with an instructor at a community hobby studio');im.set('width','1600');im.set('height','800');main.append(hero)
content='''<section class="pi-objective hg-intro"><p class="pi-label">Hobbies: Can / Can’t · Activity 2 of 8 · ESL Pals · Pages 2–3</p><h2>Your learning goal</h2><p>Use can and can’t with a base verb to describe abilities and correct common mistakes.</p><div class="pi-route"><span>Task 1 · 7 personal choices</span><span>Task 2 · 7 corrections</span><span>Task 3 · 6 personal sentences</span></div><p class="pi-small">Only Task 2 has a fixed answer key. Its explanations and model audio appear after two different complete attempts, or when all answers are correct. Tasks 1 and 3 are personal and not scored. Your draft stays in this browser tab; each task has its own reset and undo.</p><p id="hg-storage-status" class="pi-small" role="status" hidden></p></section><div class="pi-audio-controls" aria-label="Grammar and vocabulary audio controls"><span>Audio speed</span><button type="button" data-hg-speed="0.75" aria-pressed="false">0.75×</button><button type="button" data-hg-speed="1" aria-pressed="true">1.0×</button><button type="button" data-hg-speed="1.25" aria-pressed="false">1.25×</button><button type="button" data-hg-stop>Stop audio</button><span id="hg-audio-status" role="status" aria-live="polite">Listen to an underlined word, an instruction or a grammar model.</span></div>'''
theory='<div class="hg-instruction"><p class="hg-original-instruction">'+THEORY_INSTRUCTION+'</p>'+audio_button('theory-instruction','Listen to the grammar instruction')+'</div><h3 class="hg-model-heading">Auxiliary Verb</h3><div class="hg-theory-grid">'
for c in THEORY:
 theory+='<article class="hg-theory"><h4>'+c['title']+'</h4><p data-glossary>'+c['definition']+'</p>'
 for slug,txt in c['models']:theory+='<div class="hg-model"><p>'+txt+'</p>'+audio_button(slug,'Listen: '+txt)+'</div>'
 theory+='</article>'
theory+='''</div><div class="hg-help"><p><strong>Form:</strong> subject + can / can’t + base verb. Use the same can with I, you, he, she, it, we and they. Do not add -s, -ing or to to the verb after can.</p><p><strong>Questions:</strong> Can + subject + base verb? <strong>Negative:</strong> can’t or cannot. Both negative forms are accepted in Task 2. Keep each original sentence’s meaning when you correct it.</p></div>'''
content+=folder('grammar-reference','Can','Grammar reference · Can and can’t',theory)
choices=''
for i,(before,after) in enumerate(GAPS,1):
 choices+=f'<div class="hg-personal-choice"><label for="hg-choice-{i}"><b>{i}.</b> <span data-glossary>{before}</span> <span class="hg-gap">__________</span> <span data-glossary>{after}</span></label><select id="hg-choice-{i}"><option value="">Choose…</option><option value="can">can</option><option value="can’t">can’t</option></select></div>'
task1=instruction('1')+'<p class="pi-small">Choose can or can’t according to your situation. For partner, use a partner or classmate; you may also imagine a person. These are personal choices, not right or wrong answers.</p><div class="hg-illustrated"><div data-hg-task="choices"><p class="hg-count" role="status" aria-live="polite">0 of 7 answered.</p><div class="hg-choices-grid">'+choices+'</div>'+actions('Review my choices')+'</div><img class="hg-original-art" src="'+MEDIA+'dancers-task-1.webp" width="1250" height="927" alt="Original worksheet illustration of three people dancing" loading="lazy"></div>'
content+=folder('personal-abilities','01','Task 1 · Complete for you',task1)
fixes=''
for i,f in enumerate(FIXES,1):
 fixes+=f'<article class="hg-correction"><label for="hg-fix-{i}"><b>{i}.</b> <span data-glossary>{escape(f["original"])}</span></label><textarea id="hg-fix-{i}" rows="2" aria-describedby="hg-fix-feedback-{i}" placeholder="Write the corrected sentence." spellcheck="true"></textarea><p id="hg-fix-feedback-{i}" class="hg-feedback" hidden></p><button type="button" class="btn btn-secondary" data-hg-model="correction-{i}" hidden>Listen to correction {i}</button></article>'
task2=instruction('2')+'<p class="pi-small">Rewrite each whole sentence. Keep the subject, the activity and the positive, negative or question meaning. Capitalisation, final punctuation, and can’t / cannot do not change the check.</p><div data-hg-task="fixes"><p class="hg-count" role="status" aria-live="polite">0 of 7 answered.</p><div class="hg-corrections-grid">'+fixes+'</div>'+actions('Check corrections')+'</div><figure class="hg-art-aside"><img class="hg-original-art" src="'+MEDIA+'dancers-task-2.webp" width="1190" height="822" alt="Original worksheet illustration of two people dancing" loading="lazy"></figure>'
content+=folder('correct-mistakes','02','Task 2 · Correct the mistakes',task2)
prompts=''
for i,p in enumerate(PROMPTS,1):prompts+=f'<div class="hg-personal-sentence"><label for="hg-sentence-{i}"><b>{i}.</b> <span data-glossary>{p}</span></label><textarea id="hg-sentence-{i}" rows="2" placeholder="Write a sentence about yourself." spellcheck="true"></textarea></div>'
task3=instruction('3')+'<p class="pi-small">Write a complete sentence about each ability. Your can or can’t choice is personal. These sentences are not automatically corrected or scored.</p><div data-hg-task="sentences"><p class="hg-count" role="status" aria-live="polite">0 of 6 answered.</p><div class="hg-sentences-grid">'+prompts+'</div>'+actions('Review my sentences')+'</div><details class="hg-writing-help"><summary>Sentence help</summary><p>Begin with I can or I can’t and add the base verb from the prompt. For example: I can bake a cake. / I can’t bake a cake. Choose the meaning that is true for you.</p></details>'
content+=folder('my-sentences','03','Task 3 · Make sentences for yourself',task3)
originals='<p>This grammar activity uses all of page 2 and only Task 3 at the top of page 3. Listening Practice below Task 3 belongs to the next activity.</p><div class="hg-originals-grid">'
for p in [2,3]:originals+=f'<figure class="hg-original-page"><img src="{MEDIA}original-page-{p}.webp" width="1275" height="1801" alt="Complete original ESL Pals worksheet page {p}" loading="lazy"><figcaption>ESL Pals · Original page {p}'+(' · Task 3 only' if p==3 else '')+'</figcaption></figure>'
originals+='</div>';content+=folder('original-pages','PDF','View the original worksheet · Pages 2–3',originals)
content+=f'<section class="pi-objective hg-footer"><div><h2>Original PDF · 10 pages</h2><p>Original words, instructions and illustrations: ESL Pals, <cite>Hobbies: Can / Can’t</cite>. The complete PDF is provided unchanged.</p></div><div class="pi-actions"><a class="btn btn-primary" href="{PDF}" download="25 - Hobbies - Can and Cant.pdf">Download original PDF</a><a class="btn btn-secondary" href="vocabulary-unit-2-hobbies.html">Previous · Hobby Vocabulary</a><a class="btn btn-secondary" href="practice-lab.html#unit-2-hobbies">Unit 2 worksheet · 2 of 8 ready</a></div></section><noscript><p class="pi-objective">Read the grammar and original pages or download the PDF to work on paper. Enable JavaScript for checking, draft saving, meanings and audio.</p></noscript>'
main.append(fragment('<div class="pi-shell">'+content+'</div>'))
body.append(fragment('<audio id="hg-audio" preload="none" hidden></audio>'))
data=html.Element('script',id='hg-data',type='application/json');data.text=json.dumps(dict(vocabulary=VOCABULARY,audio=AUDIO,fixes=FIXES,counts=dict(choices=7,fixes=7,sentences=6)),ensure_ascii=False).replace('<','\\u003c');body.append(data)
for src in ['/assets/js/first-visit-vocabulary.js?v=20261031-personality-speaking','/assets/js/preintermediate1-hobbies-grammar.js?v='+VERSION]:body.append(fragment('<script src="'+src+'"></script>'))
write(NAME,doc)
# Integrate into the existing original-PDF folder, retaining the two connected stories.
lab=html.document_fromstring((COURSE/'practice-lab.html').read_text());unit=lab.get_element_by_id('unit-2');block=lab.get_element_by_id('unit-2-hobbies');grid=block.xpath('.//div[@class="pi-section-grid"]')[0]
for old in grid.xpath('./article[.//a[@href="'+NAME+'"]]'):grid.remove(old)
card=f'<article class="course-section-card"><div class="course-section-image"><img src="{MEDIA}cover.webp" alt="An adult learning a dance step with an instructor" width="1600" height="800" loading="lazy" decoding="async"></div><div class="course-section-content"><span class="section-number">02</span><span class="course-status course-status-available">Grammar · Available now</span><h3>Hobbies with Can and Can’t</h3><p>7 personal choices, 7 corrections and 6 sentences about you.</p><a class="card-link" href="{NAME}">Open grammar activity</a></div></article>'
grid.append(fragment(card));block.xpath('./summary/h3')[0].text='Hobbies: Can / Can’t · 2 of 8 activities ready'
pending=block.xpath('.//ol')[0];pending.clear();pending.set('class','pi-planned-activities');pending.set('start','3')
for title,kind,pages in PLAN[2:]:pending.append(fragment(f'<li><div><strong>{escape(title)}</strong><span>{escape(kind)} · {escape(pages)}</span></div><span class="pi-small" lang="es">En preparación</span></li>'))
unit.xpath('./div[contains(@class,"pi-topic-body")]/p[contains(@class,"pi-goal")]')[0].text='Sessions 3–5 · 9 hours of class · 4 activities available'
lab.xpath('//section[@class="pi-objective"]/p')[0].text='Units 1–6 each have a connected listening and reading story. Unit 1 also has all eight Describing Personality activities and extra grammar practice. Unit 2 has Hobby Vocabulary and Hobbies with Can and Can’t from its original worksheet.'
write('practice-lab.html',lab)
library=html.document_fromstring((COURSE/'listening-library.html').read_text());shell=library.get_element_by_id('unit-audio-library')
for old in shell.xpath('./section[@id="unit-2-hobbies-grammar-audio"]'):shell.remove(old)
shell.get_element_by_id('unit-2').addprevious(fragment('<section class="pi-objective" id="unit-2-hobbies-grammar-audio"><h2>Unit 2 · Hobbies grammar audio</h2><p>Listen to the four grammar examples, four instructions and vocabulary inside the activity. Seven correction models unlock with the explanations in Task 2.</p><div class="pi-library-activities">'+card+'</div></section>'));write('listening-library.html',library)
previous=html.document_fromstring((COURSE/'vocabulary-unit-2-hobbies.html').read_text());footer=previous.xpath('//section[contains(@class,"hv-footer")]')[0]
progress=footer.xpath('.//a[contains(@href,"practice-lab")]')[0];progress.text='Unit 2 worksheet · 2 of 8 ready'
for old in footer.xpath('.//a[@href="'+NAME+'"]'):old.getparent().remove(old)
progress.addprevious(fragment(f'<a class="btn btn-secondary" href="{NAME}">Next · Hobbies with Can and Can’t</a>'));write('vocabulary-unit-2-hobbies.html',previous)
try:import qrcode
except ModuleNotFoundError:sys.path.insert(0,str(ROOT/'tmp/unit5-explanation/python-deps'));import qrcode
import qrcode.image.svg
qrcode.make('https://www.jaralingua.com/ingles/preintermedio-1/'+NAME,image_factory=qrcode.image.svg.SvgPathImage,box_size=10,border=4).save(ROOT/'assets/img/page-qr'/('ingles-preintermedio-1-'+NAME.removesuffix('.html')+'.svg'))
print('Built Unit 2 worksheet activity 2/8: original grammar, 7 personal choices, 7 corrections and 6 personal sentences.')

# Reapply the separately approved original video activity after rebuilding grammar.
import runpy
runpy.run_path(str(ROOT/'tools/build_preintermediate1_unit2_people_hobbies.py'), run_name='__main__')
