"""Build the approved extra grammar practice without advancing the PDF sequence."""
import copy
import json
import sys
from html import escape
from pathlib import Path
from lxml import html
from preintermediate1_unit1_ask_connect_content import GROUPS, QUESTIONS, VOCABULARY

ROOT = Path(__file__).resolve().parents[1]
COURSE = ROOT / 'ingles/preintermedio-1'
NAME = 'grammar-unit-1-ask-and-connect.html'
VERSION = '20261031-ask-connect-1'
MEDIA = '/assets/img/english-preintermediate-1/unit-1/practice/ask-connect/'
AUDIO = '/ingles/preintermedio-1/audio/unit1/ask-connect/'


def fragment(text):
    return html.fragment_fromstring(text)


def write(name, doc):
    (COURSE / name).write_text('<!doctype html>\n' + html.tostring(doc, encoding='unicode', method='html') + '\n')


doc = html.document_fromstring((COURSE / 'course-overview.html').read_text())
description = 'Practise questions, short answers, personality and preferences through fifteen choices in everyday conversations.'
doc.find('.//title').text = 'Ask and Connect | Preintermediate English Course 1'
doc.xpath('//meta[@name="description"]')[0].set('content', description)
responsive = doc.xpath('//link[contains(@href,"course-responsive.css")]')[0]
responsive.addprevious(fragment(f'<link rel="stylesheet" href="/assets/css/preintermediate1-ask-connect.css?v={VERSION}">'))
body = doc.find('.//body')
body.set('class', 'english-basic-page basic2-page preinter-page pi-practice-page pi-connected-page ac-page')
for script in body.xpath('./script[contains(@src,"preintermediate1-")]'):
    body.remove(script)
for link in doc.xpath('//header//a[@aria-current]'):
    link.attrib.pop('aria-current', None)
doc.xpath('//header//ul[contains(@class,"nav-links")]')[0].append(fragment('<li><a href="practice-lab.html">Practice Lab</a></li>'))
main = doc.find('.//main')
hero = copy.deepcopy(main[0])
main.clear()
main.set('id', 'main-content')
hero.set('style', f'--hero-image:url({MEDIA}cover.webp)')
hero.xpath('.//p[@class="eyebrow"]')[0].text = 'Practice Lab · Unit 1 · Grammar'
hero.xpath('.//h1')[0].text = 'Ask and Connect'
hero.xpath('.//div[contains(@class,"pi-hero-copy")]/p[not(@class="eyebrow")]')[0].text = description
actions = hero.xpath('.//div[contains(@class,"hero-actions")]')[0]
actions.clear()
actions.set('class', 'hero-actions pi-actions')
actions.extend(html.fragments_fromstring('<a class="btn btn-primary" href="#block-1">Start practice</a><a class="btn btn-secondary" href="unit-1-making-friends.html#asking-questions">Review the explanation</a><a class="btn btn-secondary" href="practice-lab.html#unit-1-complementary">Unit 1 activities</a>'))
image = hero.xpath('.//figure/img')[0]
image.set('src', MEDIA + 'cover.webp')
image.set('alt', 'Laura and Mateo taking turns in a friendly conversation at an adult language-class table')
image.set('width', '1600')
image.set('height', '800')
main.append(hero)

content = '''<section class="pi-objective ac-intro"><h2>Your learning goal</h2><p>Ask about a classmate, answer clearly and choose a follow-up question that fits the conversation. Every situation gives the information you need.</p><div class="pi-route"><span>15–20 minutes</span><span>15 questions · A, B or C</span><span>Formative practice · no official grade</span></div><p class="pi-small">Choose one answer per question. Your first complete attempt shows a score. Explanations and model audio unlock after two different complete sets of answers, or immediately when all answers are correct. Personal tastes are context, not something to grade.</p><p class="pi-small">This is extra Making Friends practice. The Describing Personality worksheet continues in its own folder.</p><p id="ac-storage-status" class="pi-small" role="status" hidden></p></section>'''
content += '<details class="pi-topic" id="useful-language"><summary><span class="pi-number">Words</span><h2>Useful vocabulary</h2></summary><div class="pi-topic-body"><p>Hover or focus on an underlined word for its meaning in Spanish. Tap or click to hear its pronunciation.</p><ul class="pi-connected-vocab">' + ''.join('<li><span data-glossary>' + escape(v['term']) + '</span></li>' for v in VOCABULARY) + '</ul></div></details>'
content += '''<div class="pi-audio-controls" aria-label="Pronunciation and model audio controls"><span>Audio speed</span><button type="button" data-ac-speed="0.75" aria-pressed="false">0.75×</button><button type="button" data-ac-speed="1" aria-pressed="true">1.0×</button><button type="button" data-ac-speed="1.25" aria-pressed="false">1.25×</button><button type="button" data-ac-stop>Stop audio</button><span id="ac-audio-status" role="status" aria-live="polite">Tap an underlined word to listen. Model audio unlocks with the explanations.</span></div><form id="ac-quiz" novalidate><p id="ac-count" role="status" aria-live="polite">0 of 15 answers selected.</p>'''
for n, (title, description) in enumerate(GROUPS, 1):
    content += f'<details class="pi-topic ac-block" id="block-{n}"><summary><span class="pi-number">{n:02}</span><h2>{escape(title)}</h2><span class="ac-block-count" data-block-count="{n}">0 / 3</span></summary><div class="pi-topic-body"><p>{escape(description)} · Questions {n*3-2}–{n*3}</p><div class="ac-question-grid">'
    for q in [q for q in QUESTIONS if q['group'] == n]:
        number = int(q['id'][1:])
        content += f'<fieldset class="pi-question" id="{q["id"]}"><legend>{number}. {escape(q["question"])}</legend><p class="ac-context" data-glossary>{escape(q["context"])}</p>'
        for letter, text in q['options'].items():
            content += f'<label class="pi-choice" for="{q["id"]}-{letter.lower()}"><input id="{q["id"]}-{letter.lower()}" type="radio" name="{q["id"]}" value="{letter}"><span><b>{letter}.</b> {escape(text)}</span></label>'
        content += f'<div class="pi-question-feedback" hidden><p class="pi-feedback-answer"></p><p class="pi-feedback-explanation"></p><p class="ac-model-text"></p><button type="button" class="btn btn-secondary ac-model" data-ac-model="{q["id"]}" disabled><span aria-hidden="true">▷</span> Listen to model {number}</button></div></fieldset>'
    content += '</div></div></details>'
content += '''<section class="pi-objective ac-review"><h2>Check your conversation choices</h2><p>You can change any answer and check again. Rechecking the same complete set does not count as a new attempt.</p><div class="pi-actions"><button type="submit" class="btn btn-primary">Check answers</button><button type="button" class="btn btn-secondary" id="ac-reset">Start again</button><button type="button" class="btn btn-secondary" id="ac-undo" hidden>Undo reset</button></div><p id="ac-result" class="pi-reading-result" role="status" aria-live="polite" tabindex="-1" hidden></p></section></form><section class="pi-objective"><h2>Continue Making Friends</h2><p>Use these questions to notice how a conversation connects. Explore the unit’s other available activities from Practice Lab.</p><div class="pi-actions"><a class="btn btn-secondary" href="reading-unit-1-first-connections.html">Reading · Something in Common</a><a class="btn btn-primary" href="practice-lab.html#unit-1-complementary">Unit 1 activities</a></div></section><noscript><p class="pi-objective">Enable JavaScript for answer checking, pronunciation and draft saving. The questions remain readable.</p></noscript>'''
main.append(fragment('<div class="pi-shell">' + content + '</div>'))
body.append(fragment('<audio id="ac-audio" preload="none" hidden></audio>'))
data = html.Element('script', id='ac-data', type='application/json')
data.text = json.dumps(dict(questions=[dict(q, audio=AUDIO + f'model-{i:02}.mp3') for i, q in enumerate(QUESTIONS, 1)], vocabulary=VOCABULARY), ensure_ascii=False).replace('<', '\\u003c')
body.append(data)
for src in ['/assets/js/first-visit-vocabulary.js?v=20261031-ask-connect', '/assets/js/preintermediate1-ask-connect.js?v=' + VERSION]:
    body.append(fragment('<script src="' + src + '"></script>'))
write(NAME, doc)

# A separate extra-practice folder leaves the PDF's numbering and pending tasks intact.
lab = html.document_fromstring((COURSE / 'practice-lab.html').read_text())
unit = lab.get_element_by_id('unit-1')
for previous in unit.xpath('.//details[@id="unit-1-complementary"]'):
    previous.getparent().remove(previous)
card = f'''<article class="course-section-card"><div class="course-section-image"><img src="{MEDIA}cover.webp" alt="Laura and Mateo sharing a classroom conversation" width="1600" height="800" loading="lazy" decoding="async"></div><div class="course-section-content"><span class="section-number">01</span><span class="course-status course-status-available">Grammar · Available now</span><h3>Ask and Connect</h3><p>15 choices: questions, personality and preferences.</p><a class="card-link" href="{NAME}">Open grammar practice</a></div></article>'''
unit.xpath('./div[contains(@class,"pi-topic-body")]')[0].append(fragment('<details class="pi-topic" id="unit-1-complementary"><summary><span class="pi-number">+</span><h3>More Making Friends practice</h3></summary><div class="pi-topic-body"><p>Extra practice for the language explained in Unit 1.</p><div class="pi-section-grid">' + card + '</div></div></details>'))
activity_count = len(unit.xpath('.//article[contains(@class,"course-section-card")]'))
worksheet_count = len(unit.xpath('.//details[@id="unit-1-personality"]//article[contains(@class,"course-section-card")]'))
unit.xpath('./div/p[contains(@class,"pi-goal")]')[0].text = f'Sessions 1–2 · 6 hours of class · {activity_count} activities available'
lab.xpath('//section[@class="pi-objective"]/p')[0].text = f'Units 1–6 each have a connected listening and reading story. Unit 1 also has {worksheet_count} Describing Personality activities and extra grammar practice in Ask and Connect.'
write('practice-lab.html', lab)

# Link to gated models instead of exposing the answer audio ahead of practice.
library = html.document_fromstring((COURSE / 'listening-library.html').read_text())
shell = library.get_element_by_id('unit-audio-library')
for previous in shell.xpath('./section[@id="unit-1-grammar-audio"]'):
    shell.remove(previous)
shell.insert(7, fragment('<section class="pi-objective" id="unit-1-grammar-audio"><h2>Unit 1 · Grammar model audio</h2><p>Ask and Connect has fifteen resolved models. Their audio unlocks with the explanations inside the activity.</p><div class="pi-library-activities">' + card + '</div></section>'))
write('listening-library.html', library)

try:
    import qrcode
except ModuleNotFoundError:
    sys.path.insert(0, str(ROOT / 'tmp/unit5-explanation/python-deps'))
    import qrcode
import qrcode.image.svg
qrcode.make('https://www.jaralingua.com/ingles/preintermedio-1/' + NAME, image_factory=qrcode.image.svg.SvgPathImage, box_size=10, border=4).save(ROOT / 'assets/img/page-qr' / ('ingles-preintermedio-1-' + NAME.removesuffix('.html') + '.svg'))
print('Built Ask and Connect: 15 questions, gated model audio, inline glossary and separate extra-practice access.')

# Keep the separately approved Unit 2 worksheet when rebuilding the Unit 1 chain.
import runpy
runpy.run_path(str(ROOT / 'tools/build_preintermediate1_unit2_hobby_vocabulary.py'), run_name='__main__')
