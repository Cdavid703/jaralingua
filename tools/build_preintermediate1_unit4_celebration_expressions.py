"""Build only the approved five meanings and five contextual gaps in Vocabulary."""
import copy,json,sys
from pathlib import Path
from html import escape
from lxml import html
from preintermediate1_unit4_celebration_expressions_content import TITLE,WORDS,TYPES,TASKS,INSTRUCTIONS,VOCABULARY,AUDIO

ROOT=Path(__file__).resolve().parents[1];COURSE=ROOT/'ingles/preintermedio-1'
NAME='vocabulary-unit-4-celebration-expressions.html';PDF='materials/christmas-around-the-world-original.pdf'
MEDIA='/assets/img/english-preintermediate-1/unit-4/practice/celebration-expressions/'
VERSION='20261123-celebration-expressions-1'
def fragment(text):return html.fragment_fromstring(text)
def write(name,doc):(COURSE/name).write_text('<!doctype html>\n'+html.tostring(doc,encoding='unicode',method='html')+'\n')
def listen(key,label):return f'<button type="button" class="btn btn-secondary" data-ce-audio="{key}">{escape(label)}</button>'
def folder(id,num,title,text):return f'<details class="pi-topic" id="{id}"><summary><span class="pi-number">{num}</span><h2>{title}</h2></summary><div class="pi-topic-body">{text}</div></details>'

doc=html.document_fromstring((COURSE/'course-overview.html').read_text())
description='Match five celebration expressions to their meanings, then use them in five short celebration contexts.'
doc.find('.//title').text=TITLE+' · Vocabulary | Preintermediate English Course 1'
doc.xpath('//meta[@name="description"]')[0].set('content',description)
doc.xpath('//link[contains(@href,"course-responsive.css")]')[0].addprevious(fragment(f'<link rel="stylesheet" href="/assets/css/preintermediate1-celebration-expressions.css?v={VERSION}">'))
body=doc.find('.//body');body.set('class','english-basic-page basic2-page preinter-page pi-practice-page pi-connected-page ce-page')
for script in body.xpath('./script[contains(@src,"preintermediate1-")]'):body.remove(script)
for a in doc.xpath('//header//a[@aria-current]'):a.attrib.pop('aria-current',None)
doc.xpath('//header//ul[contains(@class,"nav-links")]')[0].append(fragment('<li><a href="practice-lab.html">Practice Lab</a></li>'))
main=doc.find('.//main');hero=copy.deepcopy(main[0]);main.clear();main.set('id','main-content');main.set('data-jaralingua-managed-draft','true')
hero.set('style',f'--hero-image:url({MEDIA}cover.webp)');hero.xpath('.//p[@class="eyebrow"]')[0].text='Practice Lab · Unit 4 · Vocabulary'
hero.xpath('.//h1')[0].text=TITLE;hero.xpath('.//div[contains(@class,"pi-hero-copy")]/p[not(@class="eyebrow")]')[0].text=description
actions=hero.xpath('.//div[contains(@class,"hero-actions")]')[0];actions.clear();actions.set('class','hero-actions pi-actions')
actions.extend(html.fragments_fromstring(f'<a class="btn btn-primary" href="#expression-meanings">Start expression practice</a><a class="btn btn-secondary" href="{PDF}" download="Christmas Around the World - ESL Pals.pdf">Download supporting PDF</a><a class="btn btn-secondary" href="practice-lab.html#unit-4-vocabulary">Unit 4 vocabulary activities</a>'))
im=hero.xpath('.//figure/img')[0];im.set('src',MEDIA+'cover.webp');im.set('alt','Adult volunteers beside sound equipment at a lively courtyard celebration');im.set('width','1600');im.set('height','800');main.append(hero)
content='''<section class="pi-objective ce-intro"><p class="pi-label">Unit 4 · Vocabulary · Phrasal Verbs and Idioms</p><h2>Your vocabulary goal</h2><p>Connect the five expressions taught in the Unit 4 explanation with their meanings and use them in celebration contexts.</p><div class="pi-route"><span>3 phrasal verbs</span><span>2 idioms</span><span>5 meanings + 5 sentence gaps</span></div><p class="pi-small">This is complementary course practice based on the Unit 4 explanation. The exercises are not original tasks from the ESL Pals PDF; the unchanged PDF supports the celebration topic.</p><p class="pi-small">Complete a block before checking. Explanations and model audio appear after two different complete attempts, or after a perfect first attempt. Changes to capitalisation, spaces or final punctuation do not add an attempt. Each block keeps its own draft, reset and undo in this browser tab, including after a reload. This is practice only; no official grade or teacher submission is created.</p><p><a href="unit-4-celebrations-festivals.html#celebration-expressions">Review these expressions in the Unit 4 explanation</a></p><p id="ce-storage-status" class="pi-small" role="status" hidden></p></section><div class="pi-audio-controls" aria-label="Expression practice audio controls"><span>Audio speed</span><button type="button" data-ce-speed="0.75" aria-pressed="false">0.75×</button><button type="button" data-ce-speed="1" aria-pressed="true">1.0×</button><button type="button" data-ce-speed="1.25" aria-pressed="false">1.25×</button><button type="button" data-ce-stop>Stop audio</button><span id="ce-audio-status" role="status" aria-live="polite">Tap an underlined expression or listen to an instruction.</span></div>'''
bank='<ul class="ce-wordbox" aria-label="Expression word bank">'+''.join('<li><span data-glossary>'+escape(word)+'</span><small class="ce-type">'+TYPES[word]+'</small></li>' for word in WORDS)+'</ul>'
options='<option value="">Choose…</option>'+''.join(f'<option value="{escape(word)}">{escape(word)}</option>' for word in WORDS)
for num,key,id,title in [(1,'definitions','expression-meanings','Exercise 1 · Match the meanings'),(2,'sentences','expression-contexts','Exercise 2 · Expressions in context')]:
    items=TASKS[key]
    block='<div class="ce-instruction"><p>'+escape(INSTRUCTIONS[key])+'</p>'+listen('instruction-'+key,f'Listen to Exercise {num} instruction')+'</div>'+bank
    block+='<p class="pi-small">Hover or focus on an underlined expression for its meaning in Spanish. Tap it to hear the pronunciation.</p>'
    if key=='sentences':block+='<p class="pi-small">Use the expressions from this bank, rather than synonyms. Keep the phrasal verbs as two separate words: get together is the verb; a get-together is a noun for a social gathering.</p>'
    block+=f'<div data-ce-task="{key}"><p class="ce-count" role="status" aria-live="polite">0 of 5 answered.</p><div class="ce-corrections-grid">'
    for item in items:
        uid=item['id'];n=item['number']
        field=f'<select id="ce-answer-{uid}" name="{uid}" aria-describedby="ce-feedback-{uid}">{options}</select>' if key=='definitions' else f'<textarea id="ce-answer-{uid}" rows="2" spellcheck="false" aria-describedby="ce-feedback-{uid}" placeholder="Write only the expression."></textarea>'
        block+=f'<article class="ce-correction"><label for="ce-answer-{uid}"><b>{n}.</b> <span data-glossary>{escape(item["prompt"])}</span></label>{field}<div class="ce-feedback" id="ce-feedback-{uid}" hidden></div><button type="button" class="btn btn-secondary" data-ce-model="{uid}" hidden>Listen to model {n}</button></article>'
    block+=f'</div><div class="pi-actions"><button type="button" class="btn btn-primary" data-ce-check>Check Exercise {num}</button><button type="button" class="btn btn-secondary" data-ce-reset>Start Exercise {num} again</button><button type="button" class="btn btn-secondary" data-ce-undo hidden>Undo reset Exercise {num}</button></div><div class="ce-result" role="status" aria-live="polite" tabindex="-1" hidden></div></div>'
    content+=folder(id,f'{num:02d}',title,block)
content+=folder('vocabulary-support','Aa','Vocabulary support','<p>Review the five target expressions and the supporting words used in the exercises.</p><ul class="ce-wordbox">'+''.join('<li><span data-glossary>'+escape(v['term'])+'</span></li>' for v in VOCABULARY)+'</ul>')
content+=f'<section class="pi-objective ce-footer"><div><h2>Supporting PDF · Christmas Around the World</h2><p>The unchanged 9-page ESL Pals PDF supports the topic. The five meanings and five contextual gaps on this page are complementary course practice for the expressions already taught in Unit 4.</p></div><div class="pi-actions"><a class="btn btn-primary" href="{PDF}" download="Christmas Around the World - ESL Pals.pdf">Download supporting PDF</a><a class="btn btn-secondary" href="grammar-unit-4-customs-celebrations.html">Previous · Customs and Celebration Descriptions Grammar</a><a class="btn btn-secondary" href="practice-lab.html#unit-4-vocabulary">Unit 4 vocabulary activities</a></div></section><noscript><p class="pi-objective">Write your answers on paper. Enable JavaScript for checking, audio, meanings and saved drafts.</p></noscript>'
main.append(fragment('<div class="pi-shell">'+content+'</div>'));body.append(fragment('<audio id="ce-audio" preload="none" hidden></audio>'))
data=html.Element('script',id='ce-data',type='application/json');data.text=json.dumps(dict(tasks=TASKS,words=WORDS,types=TYPES,vocabulary=VOCABULARY,audio=AUDIO),ensure_ascii=False).replace('<','\\u003c');body.append(data)
for src in ['/assets/js/first-visit-vocabulary.js?v=20261031-personality-speaking','/assets/js/preintermediate1-celebration-expressions.js?v='+VERSION]:body.append(fragment('<script src="'+src+'"></script>'))
write(NAME,doc)

card=f'<article class="course-section-card"><div class="course-section-image"><img src="{MEDIA}cover.webp" alt="Adult volunteers and neighbors at a courtyard celebration" width="1600" height="800" loading="lazy" decoding="async"></div><div class="course-section-content"><span class="section-number">02</span><span class="course-status course-status-available">Vocabulary · Available now</span><h3>{TITLE}</h3><p>5 meanings and 5 contextual gaps: three phrasal verbs and two idioms.</p><a class="card-link" href="{NAME}">Open celebration expressions</a></div></article>'
lab=html.document_fromstring((COURSE/'practice-lab.html').read_text());unit=lab.get_element_by_id('unit-4');group=lab.get_element_by_id('unit-4-vocabulary');grid=group.xpath('.//div[@class="pi-section-grid"]')[0]
for old in grid.xpath('./article[.//a[@href=$v]]',v=NAME):grid.remove(old)
grid.append(fragment(card));group.xpath('./div[contains(@class,"pi-topic-body")]/p')[0].text='Celebration words, objects, phrasal verbs and idioms. Grammar has its own separate folder. Each page identifies its source and includes the supporting PDF.'
unit.xpath('./div[contains(@class,"pi-topic-body")]/p[contains(@class,"pi-goal")]')[0].text='Sessions 9–10 · 6 hours of class · 5 activities available'
intro=lab.xpath('//section[@class="pi-objective"]/p')[0]
intro.text=(intro.text or '').replace('Unit 4 adds Celebration Words and Objects vocabulary and Customs and Celebration Descriptions grammar.','Unit 4 adds Celebration Words and Objects, Celebration Expressions vocabulary, and Customs and Celebration Descriptions grammar.')
write('practice-lab.html',lab)
library=html.document_fromstring((COURSE/'listening-library.html').read_text());shell=library.get_element_by_id('unit-audio-library')
for old in shell.xpath('./section[@id="unit-4-celebration-expressions-audio"]'):shell.remove(old)
shell.get_element_by_id('unit-4').addprevious(fragment('<section class="pi-objective" id="unit-4-celebration-expressions-audio"><h2>Unit 4 · Celebration Expressions vocabulary audio</h2><p>Listen to the expressions, supporting vocabulary and instructions. Meaning and sentence models unlock independently inside the two exercises.</p><div class="pi-library-activities">'+card+'</div></section>'));write('listening-library.html',library)
previous=html.document_fromstring((COURSE/'grammar-unit-4-customs-celebrations.html').read_text());footer=previous.xpath('//section[contains(@class,"cd-footer")]')[0]
for old in footer.xpath('.//a[@href=$v]',v=NAME):old.getparent().remove(old)
footer.xpath('.//a[contains(@href,"practice-lab")]')[0].addprevious(fragment(f'<a class="btn btn-secondary" href="{NAME}">Next · Celebration Expressions Vocabulary</a>'));write('grammar-unit-4-customs-celebrations.html',previous)
try:import qrcode
except ModuleNotFoundError:sys.path.insert(0,str(ROOT/'tmp/unit5-explanation/python-deps'));import qrcode
import qrcode.image.svg
qrcode.make('https://www.jaralingua.com/ingles/preintermedio-1/'+NAME,image_factory=qrcode.image.svg.SvgPathImage,box_size=10,border=4).save(ROOT/'assets/img/page-qr'/('ingles-preintermedio-1-'+NAME.removesuffix('.html')+'.svg'))
print('Built Celebration Expressions: five meanings and five context gaps under Vocabulary.')
