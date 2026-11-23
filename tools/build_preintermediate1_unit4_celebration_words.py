"""Build only the approved first Unit 4 vocabulary page and its navigation."""
import copy
import json
import sys
from pathlib import Path
from html import escape
from lxml import html
from preintermediate1_unit4_celebration_words_content import TITLE, TASKS, BANKS, INSTRUCTIONS, VOCABULARY, AUDIO

ROOT = Path(__file__).resolve().parents[1]
COURSE = ROOT / 'ingles/preintermedio-1'
NAME = 'vocabulary-unit-4-celebration-words.html'
PDF = 'materials/christmas-around-the-world-original.pdf'
MEDIA = '/assets/img/english-preintermediate-1/unit-4/practice/celebration-words/'
VERSION = '20261122-celebration-words-1'

def fragment(text): return html.fragment_fromstring(text)
def write(name, doc):
    (COURSE / name).write_text('<!doctype html>\n' + html.tostring(doc, encoding='unicode', method='html') + '\n')
def listen(key, label):
    return f'<button type="button" class="btn btn-secondary" data-cw-audio="{key}">{escape(label)}</button>'
def folder(identifier, number, title, content):
    return f'<details class="pi-topic" id="{identifier}"><summary><span class="pi-number">{number}</span><h2>{title}</h2></summary><div class="pi-topic-body">{content}</div></details>'

doc = html.document_fromstring((COURSE / 'course-overview.html').read_text())
description = 'Explore four celebration concepts, match nine pictures and practise four useful celebration expressions.'
doc.find('.//title').text = TITLE + ' · Vocabulary | Preintermediate English Course 1'
doc.xpath('//meta[@name="description"]')[0].set('content', description)
doc.xpath('//link[contains(@href,"course-responsive.css")]')[0].addprevious(fragment(f'<link rel="stylesheet" href="/assets/css/preintermediate1-celebration-words.css?v={VERSION}">'))
body = doc.find('.//body')
body.set('class', 'english-basic-page basic2-page preinter-page pi-practice-page pi-connected-page cw-page')
for script in body.xpath('./script[contains(@src,"preintermediate1-")]'): body.remove(script)
for link in doc.xpath('//header//a[@aria-current]'): link.attrib.pop('aria-current', None)
doc.xpath('//header//ul[contains(@class,"nav-links")]')[0].append(fragment('<li><a href="practice-lab.html">Practice Lab</a></li>'))
main = doc.find('.//main'); hero = copy.deepcopy(main[0]); main.clear()
main.set('id', 'main-content'); main.set('data-jaralingua-managed-draft', 'true')
hero.set('style', f'--hero-image:url({MEDIA}cover.webp)')
hero.xpath('.//p[@class="eyebrow"]')[0].text = 'Practice Lab · Unit 4 · Vocabulary'
hero.xpath('.//h1')[0].text = TITLE
hero.xpath('.//div[contains(@class,"pi-hero-copy")]/p[not(@class="eyebrow")]')[0].text = description
actions = hero.xpath('.//div[contains(@class,"hero-actions")]')[0]
actions.clear(); actions.set('class', 'hero-actions pi-actions')
actions.extend(html.fragments_fromstring(f'<a class="btn btn-primary" href="#celebration-concepts">Start vocabulary</a><a class="btn btn-secondary" href="{PDF}" download="Christmas Around the World - ESL Pals.pdf">Download original PDF</a><a class="btn btn-secondary" href="practice-lab.html#unit-4-vocabulary">Unit 4 vocabulary activities</a>'))
image = hero.xpath('.//figure/img')[0]
image.set('src', MEDIA+'cover.webp'); image.set('width', '1600'); image.set('height', '800')
image.set('alt', 'Three adult friends arranging decorations, gifts and shared food for a community celebration')
main.append(hero)

content = '''<section class="pi-objective cw-intro"><p class="pi-label">Unit 4 · Celebrations and Festivals · Vocabulary</p><h2>Your vocabulary goal</h2><p>Distinguish celebration words, identify festive objects and use four useful word combinations.</p><div class="pi-route"><span>4 key concepts</span><span>9 picture matches</span><span>4 useful combinations</span></div><p class="pi-small">Exercise 2 adapts ESL Pals, Christmas Around the World, page 2, Task 1. Exercises 1 and 3 are additional course practice. The conversation questions are reserved for Speaking.</p><p class="pi-small">Complete an exercise before checking. Explanations and model audio appear after two different complete attempts, or after a perfect first attempt. Each exercise saves its own draft in this browser tab and has a reset with undo. This is practice only; no official grade or teacher submission is created.</p><p><a href="unit-4-celebrations-festivals.html#key-concepts">Review the Unit 4 explanation</a></p><p id="cw-storage-status" class="pi-small" role="status" hidden></p></section><div class="pi-audio-controls" aria-label="Vocabulary practice audio controls"><span>Audio speed</span><button type="button" data-cw-speed="0.75" aria-pressed="false">0.75×</button><button type="button" data-cw-speed="1" aria-pressed="true">1.0×</button><button type="button" data-cw-speed="1.25" aria-pressed="false">1.25×</button><button type="button" data-cw-stop>Stop audio</button><span id="cw-audio-status" role="status" aria-live="polite">Tap an underlined expression or listen to an instruction.</span></div>'''
for number, key, identifier, title in [
    (1, 'concepts', 'celebration-concepts', 'Exercise 1 · Four key concepts'),
    (2, 'pictures', 'celebration-pictures', 'Exercise 2 · Match the pictures'),
    (3, 'combinations', 'celebration-combinations', 'Exercise 3 · Useful word combinations'),
]:
    items = TASKS[key]
    block = '<div class="cw-instruction"><p>' + escape(INSTRUCTIONS[key]) + '</p>' + listen('instruction-'+key, f'Listen to Exercise {number} instruction') + '</div>'
    block += '<ul class="cw-wordbox" aria-label="Word bank">' + ''.join('<li><span data-glossary>'+escape(word)+'</span></li>' for word in BANKS[key]) + '</ul>'
    if key == 'pictures':
        block += '<p class="pi-small">Adapted from page 2, Task 1. One illustration and a spelling error have been corrected. The complete original PDF is unchanged.</p>'
    block += '<p class="pi-small">Hover or focus on an underlined word for its meaning in Spanish. Tap it to hear the pronunciation.</p>' if key != 'combinations' else '<p class="pi-small">Choose the verb or phrase for each gap. Review the complete expressions in Vocabulary support below.</p>'
    block += f'<div data-cw-task="{key}"><p class="cw-count" role="status" aria-live="polite">0 of {len(items)} answered.</p><div class="'+('cw-picture-grid' if key=='pictures' else 'cw-corrections-grid')+'">'
    options = '<option value="">Choose…</option>' + ''.join(f'<option value="{escape(word)}">{escape(word)}</option>' for word in BANKS[key])
    for item in items:
        uid = item['id']; n = item['number']
        block += '<article class="cw-correction' + (' cw-picture' if key == 'pictures' else '') + '">'
        if key == 'pictures':
            block += f'<figure><img src="{MEDIA}picture-{n:02d}.webp" width="{item["width"]}" height="{item["height"]}" alt="{escape(item["alt"])}" loading="lazy" decoding="async"></figure>'
        prompt = f'Picture {n}' if key == 'pictures' else item['prompt']
        block += f'<label for="cw-answer-{uid}"><b>{n}.</b> <span>{escape(prompt)}</span></label><select id="cw-answer-{uid}" name="{uid}" aria-describedby="cw-feedback-{uid}">{options}</select><p class="cw-feedback" id="cw-feedback-{uid}" hidden></p><button type="button" class="btn btn-secondary" data-cw-model="{uid}" hidden>'+('Listen to the word' if key=='pictures' else 'Listen to a complete model')+'</button></article>'
    block += f'</div><div class="pi-actions"><button type="button" class="btn btn-primary" data-cw-check>Check Exercise {number}</button><button type="button" class="btn btn-secondary" data-cw-reset>Start Exercise {number} again</button><button type="button" class="btn btn-secondary" data-cw-undo hidden>Undo reset Exercise {number}</button></div><p class="cw-result" role="status" aria-live="polite" tabindex="-1" hidden></p></div>'
    content += folder(identifier, f'{number:02d}', title, block)

content += folder('vocabulary-support', 'Aa', 'Vocabulary support', '<p>Tap an underlined expression to hear it. Hover or focus to see its meaning in Spanish.</p><ul class="cw-wordbox">'+''.join('<li><span data-glossary>'+escape(v['term'])+'</span></li>' for v in VOCABULARY)+'</ul>')
content += folder('original-page', 'PDF', 'View the original worksheet · Page 2', f'<figure class="cw-original-page"><img src="{MEDIA}original-page-2.webp" width="1275" height="1802" alt="Complete original ESL Pals page 2 with vocabulary pictures and conversation questions" loading="lazy"><figcaption>ESL Pals · Christmas Around the World · Original page 2. This page adapts Task 1 only; Task 2 is reserved for Speaking.</figcaption></figure><div class="cw-source-note"><h3>Adaptation notes</h3><p>The original word box prints Carloing. This activity uses carolling; caroling is the American spelling. The original picture paired with mistletoe shows spiky leaves and red berries, characteristic of holly. Picture 3 has been replaced with an illustration of mistletoe with smooth oval leaves and white berries. The other eight vocabulary illustrations are from the original worksheet.</p><p><a href="https://www.woodlandtrust.org.uk/blog/where-does-mistletoe-grow/" target="_blank" rel="noopener">Plant identification reference · Woodland Trust</a></p></div>')
content += f'<section class="pi-objective cw-footer"><div><h2>Original PDF · 9 pages</h2><p>Original picture-matching source: ESL Pals, <cite>Christmas Around the World</cite>, page 2, Task 1. The complete PDF is provided unchanged. The four concepts and four word combinations are complementary Unit 4 course practice.</p></div><div class="pi-actions"><a class="btn btn-primary" href="{PDF}" download="Christmas Around the World - ESL Pals.pdf">Download original PDF</a><a class="btn btn-secondary" href="reading-unit-4-saturdays-celebration-plan.html">Previous · Saturday’s Celebration Plan</a><a class="btn btn-secondary" href="practice-lab.html#unit-4-vocabulary">Unit 4 vocabulary activities</a></div></section><noscript><p class="pi-objective">Read the original page or download the PDF to work on paper. Enable JavaScript for checking, audio, meanings and draft recovery.</p></noscript>'
main.append(fragment('<div class="pi-shell">'+content+'</div>'))
body.append(fragment('<audio id="cw-audio" preload="none" hidden></audio>'))
data = html.Element('script', id='cw-data', type='application/json')
data.text = json.dumps(dict(tasks=TASKS, banks=BANKS, vocabulary=VOCABULARY, audio=AUDIO), ensure_ascii=False).replace('<', '\\u003c')
body.append(data)
for src in ['/assets/js/first-visit-vocabulary.js?v=20261031-personality-speaking', '/assets/js/preintermediate1-celebration-words.js?v='+VERSION]:
    body.append(fragment('<script src="'+src+'"></script>'))
write(NAME, doc)

card = f'<article class="course-section-card"><div class="course-section-image"><img src="{MEDIA}cover.webp" alt="Adult friends preparing decorations, gifts and shared food" width="1600" height="800" loading="lazy" decoding="async"></div><div class="course-section-content"><span class="section-number">01</span><span class="course-status course-status-available">Vocabulary · Available now</span><h3>{TITLE}</h3><p>4 concepts, 9 picture matches and 4 celebration word combinations.</p><a class="card-link" href="{NAME}">Open celebration vocabulary</a></div></article>'
lab = html.document_fromstring((COURSE/'practice-lab.html').read_text())
unit = lab.get_element_by_id('unit-4').xpath('./div[contains(@class,"pi-topic-body")]')[0]
for old in unit.xpath('./details[@id="unit-4-vocabulary"]'): unit.remove(old)
for old in unit.xpath('./p[@lang="es"]'): unit.remove(old)
unit.xpath('./p[contains(@class,"pi-goal")]')[0].text = 'Sessions 9–10 · 6 hours of class · 3 activities available'
unit.append(fragment('<details class="pi-topic" id="unit-4-vocabulary"><summary><span class="pi-number">+</span><h3>Celebrations and Festivals · Vocabulary</h3></summary><div class="pi-topic-body"><p>Vocabulary activities are separate from Grammar, Speaking and Writing. Download the complete supporting worksheet inside the activity.</p><div class="pi-section-grid">'+card+'</div><p class="pi-small" lang="es">Las demás actividades de la unidad están en preparación.</p></div></details>'))
intro = lab.xpath('//section[@class="pi-objective"]/p')[0]
addition = ' Unit 4 adds Celebration Words and Objects vocabulary.'
if 'Unit 4 adds Celebration Words and Objects' not in (intro.text or ''): intro.text = (intro.text or '') + addition
write('practice-lab.html', lab)

library = html.document_fromstring((COURSE/'listening-library.html').read_text())
shell = library.get_element_by_id('unit-audio-library')
for old in shell.xpath('./section[@id="unit-4-celebration-words-audio"]'): shell.remove(old)
shell.get_element_by_id('unit-4').addprevious(fragment('<section class="pi-objective" id="unit-4-celebration-words-audio"><h2>Unit 4 · Celebration vocabulary audio</h2><p>Listen to instructions, seventeen vocabulary entries and complete concept and word-combination models inside the activity.</p><div class="pi-library-activities">'+card+'</div></section>'))
write('listening-library.html', library)

try: import qrcode
except ModuleNotFoundError:
    sys.path.insert(0, str(ROOT/'tmp/unit5-explanation/python-deps')); import qrcode
import qrcode.image.svg
qrcode.make('https://www.jaralingua.com/ingles/preintermedio-1/'+NAME, image_factory=qrcode.image.svg.SvgPathImage, box_size=10, border=4).save(ROOT/'assets/img/page-qr'/('ingles-preintermedio-1-'+NAME.removesuffix('.html')+'.svg'))
print('Built Celebration Words and Objects: 4 concepts, 9 pictures and 4 combinations; Unit 4 has 3 activities.')

# Preserve the separately approved Grammar page and category after rebuilding Vocabulary.
import runpy
runpy.run_path(str(ROOT/'tools/build_preintermediate1_unit4_customs_descriptions.py'), run_name='__main__')
