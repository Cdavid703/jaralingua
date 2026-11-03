"""Worksheet activity 6: exact discussion prompts with optional local self-listening."""
import copy
import json
import sys
from html import escape
from pathlib import Path
from lxml import html
from preintermediate1_unit1_speaking_content import INSTRUCTION, QUESTIONS, VOCABULARY, SELF_CHECK

ROOT = Path(__file__).resolve().parents[1]
COURSE = ROOT / 'ingles/preintermedio-1'
NAME = 'speaking-unit-1-lets-talk-about-personality.html'
PREV = 'vocabulary-unit-1-describing-pictures.html'
MEDIA = '/assets/img/english-preintermediate-1/unit-1/practice/personality-speaking/'
AUDIO = '/ingles/preintermedio-1/audio/unit1/personality-speaking/'
PDF = 'materials/22-describing-personality-original.pdf'
VERSION = '20261031-personality-speaking-1'
MIC = '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="9" y="2" width="6" height="12" rx="3"></rect><path d="M5 10v2a7 7 0 0014 0v-2M12 19v3M8 22h8"></path></svg>'


def fragment(text):
    return html.fragment_fromstring(text)


def write(name, doc):
    (COURSE / name).write_text('<!doctype html>\n' + html.tostring(doc, encoding='unicode', method='html') + '\n')


doc = html.document_fromstring((COURSE / 'course-overview.html').read_text())
description = 'Discuss the eight original questions about personality. Listen to each question and optionally record an answer to hear yourself.'
doc.find('.//title').text = 'Let’s Talk About Personality | Preintermediate English Course 1'
doc.xpath('//meta[@name="description"]')[0].set('content', description)
doc.xpath('//link[contains(@href,"course-responsive.css")]')[0].addprevious(fragment(f'<link rel="stylesheet" href="/assets/css/preintermediate1-personality-speaking.css?v={VERSION}">'))
body = doc.find('.//body')
body.set('class', 'english-basic-page basic2-page preinter-page pi-practice-page pi-connected-page ps-page')
for script in body.xpath('./script[contains(@src,"preintermediate1-")]'):
    body.remove(script)
for link in doc.xpath('//header//a[@aria-current]'):
    link.attrib.pop('aria-current', None)
doc.xpath('//header//ul[contains(@class,"nav-links")]')[0].append(fragment('<li><a href="practice-lab.html">Practice Lab</a></li>'))
main = doc.find('.//main'); hero = copy.deepcopy(main[0]); main.clear(); main.set('id', 'main-content')
hero.set('style', f'--hero-image:url({MEDIA}cover.webp)')
hero.xpath('.//p[@class="eyebrow"]')[0].text = 'Practice Lab · Unit 1 · Speaking'
hero.xpath('.//h1')[0].text = 'Let’s Talk About Personality'
hero.xpath('.//div[contains(@class,"pi-hero-copy")]/p[not(@class="eyebrow")]')[0].text = description
actions = hero.xpath('.//div[contains(@class,"hero-actions")]')[0]; actions.clear(); actions.set('class', 'hero-actions pi-actions')
actions.extend(html.fragments_fromstring(f'<a class="btn btn-primary" href="#discussion-practice">Start discussion</a><a class="btn btn-secondary" href="{PDF}" download="22 - Describing Personality.pdf">Download original PDF</a><a class="btn btn-secondary" href="practice-lab.html#unit-1-personality">Unit 1 activities</a>'))
image = hero.xpath('.//figure/img')[0]; image.set('src', MEDIA + 'cover.webp'); image.set('alt', 'Four adult learners taking turns in a friendly classroom discussion'); image.set('width', '1600'); image.set('height', '800')
main.append(hero)

content = '''<section class="pi-objective ps-intro"><p class="pi-label">Activity 6 of 8 · ESL Pals · Lower part of page 7</p><h2>Your learning goal</h2><p>Describe personality, share your views and give a reason or example in a class discussion.</p><div class="pi-route"><span>15–20 minutes</span><span>8 original questions</span><span>Speaking · no official grade</span></div><p class="pi-small">Questions 3 and 4 are alternatives: choose the one that fits your situation. You may describe a fictional person. Listening and recording are optional support for the class discussion.</p><p class="pi-small">Recordings stay on this page and are not uploaded. Save any recording you want to keep before reloading or leaving. Your practice marks and self-check are saved in this browser tab.</p><p id="ps-storage-status" class="pi-small" role="status" hidden></p></section>'''
content += '<details class="pi-topic" id="useful-language"><summary><span class="pi-number">Words</span><h2>Optional vocabulary support</h2></summary><div class="pi-topic-body"><p>Hover or focus for the meaning in Spanish. Tap an underlined word to hear its pronunciation.</p><ul class="pi-connected-vocab">' + ''.join('<li><span data-glossary>' + escape(v['term']) + '</span></li>' for v in VOCABULARY) + '</ul></div></details>'
content += '''<div class="pi-audio-controls" aria-label="Question and word audio controls"><span>Support audio speed</span><button type="button" data-ps-speed="0.75" aria-pressed="false">0.75×</button><button type="button" data-ps-speed="1" aria-pressed="true">1.0×</button><button type="button" data-ps-speed="1.25" aria-pressed="false">1.25×</button><button type="button" data-ps-stop-audio>Stop support audio</button><span id="ps-audio-status" role="status" aria-live="polite">Listen to a question or an underlined word when you need support.</span></div><details class="pi-topic" id="discussion-practice"><summary><span class="pi-number">Talk</span><h2>Discussion Questions</h2></summary><div class="pi-topic-body"><p class="ps-original-instruction">''' + INSTRUCTION + '''</p><p class="pi-small">The question wording and order below are unchanged from the worksheet. Optional starters and recording controls are classroom support.</p><p id="ps-practice-count" role="status" aria-live="polite">0 of 7 discussion topics marked. Questions 3 and 4 count as one choice.</p><div class="ps-question-grid">'''
for i, (question, starter) in enumerate(QUESTIONS, 1):
    content += f'''<article class="ps-question" id="question-{i}"><h3><span class="ps-number">{i}.</span> <span class="ps-original-question" data-glossary>{escape(question)}</span></h3>{('<p class="ps-alternative">Alternative · choose question 3 or 4</p>' if i in [3, 4] else '')}<div class="ps-controls"><button type="button" class="btn btn-secondary" data-ps-question="{i}" aria-label="Listen to question {i}"><span aria-hidden="true">▷</span> Listen</button><button type="button" class="btn btn-primary ps-record" data-ps-record="{i}" aria-label="Record answer {i}">{MIC}<span>Record</span></button><button type="button" class="btn btn-secondary" data-ps-stop="{i}" aria-label="Stop recording {i}" hidden>Stop recording</button></div><p class="ps-record-status" id="record-status-{i}" role="status" aria-live="polite">Recording is optional. Speak in class or record to listen to yourself.</p><div class="ps-clip" id="clip-{i}" hidden><audio controls preload="metadata" aria-label="Your recording for question {i}"></audio><div class="ps-clip-actions"><a class="btn btn-secondary" data-ps-download="{i}" download>Save my recording</a><button type="button" class="btn btn-secondary" data-ps-remove="{i}">Remove recording</button></div></div><button type="button" class="btn btn-secondary ps-undo" data-ps-undo="{i}" hidden>Undo remove</button><details class="ps-starter"><summary>Help me start</summary><p>{escape(starter)}</p><p class="pi-small">Use your own idea and an example. There is no single correct personal answer.</p></details><label class="ps-practised"><input type="checkbox" data-ps-mark="{i}"> I practised this question</label></article>'''
content += '</div></div></details><details class="pi-topic" id="self-check"><summary><span class="pi-number">Check</span><h2>Listen and reflect</h2></summary><div class="pi-topic-body"><p>Think about your class answer or listen to your own recording. Mark what you notice.</p><div class="ps-self-check">' + ''.join(f'<label><input type="checkbox" data-ps-check="{i}"> {escape(text)}</label>' for i, text in enumerate(SELF_CHECK, 1)) + '</div><button type="button" class="btn btn-primary" id="ps-review">Review my practice</button><p id="ps-review-result" class="ps-review-result" role="status" aria-live="polite" tabindex="-1" hidden></p><p class="pi-small">This is your self-check. The page does not judge your voice or your personal views.</p></div></details>'
content += f'''<details class="pi-topic" id="original-page"><summary><span class="pi-number">PDF</span><h2>View the original worksheet · Page 7</h2></summary><div class="pi-topic-body"><p>This activity uses Discussion Questions at the bottom of page 7. Describing Pictures above it belongs to Activity 5.</p><figure class="ps-original-page"><img src="/assets/img/english-preintermediate-1/unit-1/practice/describing-pictures/original-page-7.webp" width="1275" height="1800" alt="Original ESL Pals page 7: six Describing Pictures illustrations above the eight Discussion Questions transcribed here" loading="lazy"><figcaption>ESL Pals · Describing Personality · Page 7</figcaption></figure></div></details><section class="pi-objective ps-footer" id="paper-version"><div><h2>Original PDF · 10 pages</h2><p>Discussion Questions and their class instruction: ESL Pals, <cite>Describing Personality</cite>. PDF provided unchanged. This section has no separate exercise illustrations; the new cover represents a class discussion.</p></div><div class="pi-actions"><a class="btn btn-primary" href="{PDF}" download="22 - Describing Personality.pdf">Download original PDF</a><a class="btn btn-secondary" href="{PREV}">Previous · Describing Pictures</a><a class="btn btn-secondary" href="practice-lab.html#unit-1-personality">Unit 1 activities · 6 of 8 ready</a></div></section><noscript><p class="pi-objective">You can read and discuss all eight questions without JavaScript. Enable JavaScript for support audio, optional recording and saved practice marks.</p></noscript>'''
main.append(fragment('<div class="pi-shell">' + content + '</div>'))
body.append(fragment('<audio id="ps-support-audio" preload="none" hidden></audio>'))
data = html.Element('script', id='ps-data', type='application/json'); data.text = json.dumps(dict(questions=[dict(number=i, text=q, audio=AUDIO + f'question-{i:02}.mp3') for i, (q, _) in enumerate(QUESTIONS, 1)], vocabulary=VOCABULARY), ensure_ascii=False).replace('<', '\\u003c'); body.append(data)
for src in ['/assets/js/first-visit-vocabulary.js?v=20261031-personality-speaking', '/assets/js/preintermediate1-personality-recorder.js?v=' + VERSION, '/assets/js/preintermediate1-personality-speaking.js?v=' + VERSION]:
    body.append(fragment('<script src="' + src + '"></script>'))
write(NAME, doc)

lab = html.document_fromstring((COURSE / 'practice-lab.html').read_text()); unit = lab.get_element_by_id('unit-1'); block = lab.get_element_by_id('unit-1-personality')
grid = block.xpath('./div/div[contains(@class,"pi-section-grid")]')[0]
for previous in grid.xpath('./article[.//a[@href=$name]]', name=NAME):
    grid.remove(previous)
card = f'''<article class="course-section-card"><div class="course-section-image"><img src="{MEDIA}cover.webp" alt="Four adult learners sharing a classroom discussion" width="1600" height="800" loading="lazy" decoding="async"></div><div class="course-section-content"><span class="section-number">06</span><span class="course-status course-status-available">Speaking · Available now</span><h3>Let’s Talk About Personality</h3><p>8 discussion questions and optional self-recording.</p><a class="card-link" href="{NAME}">Open speaking activity</a></div></article>'''
grid.append(fragment(card)); block.xpath('./summary/h3')[0].text = 'Describing Personality · 6 of 8 activities ready'
pending = block.xpath('.//ol[contains(@class,"pi-planned-activities")]')[0]
for previous in pending.xpath('./li[.//strong[text()="Let’s Talk About Personality"]]'):
    pending.remove(previous)
pending.set('start', '7'); write('practice-lab.html', lab)
for name in ['vocabulary-unit-1-personality.html', 'grammar-unit-1-personality-be.html', 'reading-unit-1-meet-the-characters.html', 'writing-unit-1-describing-people.html', PREV]:
    previous = html.document_fromstring((COURSE / name).read_text()); links = previous.xpath('//*[@id="paper-version"]//div[contains(@class,"pi-actions")]')[0]
    for link in links.xpath('./a[contains(@href,"practice-lab.html")]'):
        link.text = 'Unit 1 activities · 6 of 8 ready'
    if name == PREV:
        for link in links.xpath('./a[@href=$name]', name=NAME): links.remove(link)
        links.insert(1, fragment(f'<a class="btn btn-secondary" href="{NAME}">Next · Let’s Talk About Personality</a>'))
    write(name, previous)

library = html.document_fromstring((COURSE / 'listening-library.html').read_text()); shell = library.get_element_by_id('unit-audio-library')
for previous in shell.xpath('./section[@id="unit-1-speaking-audio"]'): shell.remove(previous)
shell.get_element_by_id('unit-1').addprevious(fragment('<section class="pi-objective" id="unit-1-speaking-audio"><h2>Unit 1 · Discussion question audio</h2><p>Listen to the eight original personality discussion questions inside the speaking activity.</p><div class="pi-library-activities">' + card + '</div></section>')); write('listening-library.html', library)
try:
    import qrcode
except ModuleNotFoundError:
    sys.path.insert(0, str(ROOT / 'tmp/unit5-explanation/python-deps'))
    import qrcode
import qrcode.image.svg
qrcode.make('https://www.jaralingua.com/ingles/preintermedio-1/' + NAME, image_factory=qrcode.image.svg.SvgPathImage, box_size=10, border=4).save(ROOT / 'assets/img/page-qr' / ('ingles-preintermedio-1-' + NAME.removesuffix('.html') + '.svg'))
print('Built Activity 6: eight original discussion prompts, individual question audio, optional local recording, self-check and expandable QR.')

import runpy
runpy.run_path(str(ROOT / 'tools/build_preintermediate1_unit1_my_personality.py'), run_name='__main__')
