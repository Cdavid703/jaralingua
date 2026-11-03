"""Build approved activity 7, preserving page 8's free-writing prompt."""
import copy
import json
import sys
from html import escape
from pathlib import Path
from lxml import html
from preintermediate1_unit1_my_personality_content import INSTRUCTION, WORDS, VOCABULARY, SELF_CHECK, STARTERS

ROOT = Path(__file__).resolve().parents[1]
COURSE = ROOT / 'ingles/preintermedio-1'
NAME = 'writing-unit-1-my-personality.html'
PREV = 'speaking-unit-1-lets-talk-about-personality.html'
MEDIA = '/assets/img/english-preintermediate-1/unit-1/practice/my-personality/'
PDF = 'materials/22-describing-personality-original.pdf'
AUDIO = '/ingles/preintermedio-1/audio/unit1/my-personality/instruction.mp3'
VERSION = '20261103-my-personality-1'


def fragment(text):
    return html.fragment_fromstring(text)


def write(name, doc):
    (COURSE / name).write_text('<!doctype html>\n' + html.tostring(doc, encoding='unicode', method='html') + '\n')


doc = html.document_fromstring((COURSE / 'course-overview.html').read_text())
description = 'Write about your own personality using the original word box. Review and revise your writing with an optional self-check.'
doc.find('.//title').text = 'My Personality | Preintermediate English Course 1'
doc.xpath('//meta[@name="description"]')[0].set('content', description)
doc.xpath('//link[contains(@href,"course-responsive.css")]')[0].addprevious(fragment(f'<link rel="stylesheet" href="/assets/css/preintermediate1-my-personality.css?v={VERSION}">'))
body = doc.find('.//body')
body.set('class', 'english-basic-page basic2-page preinter-page pi-practice-page pi-connected-page mp-page')
for script in body.xpath('./script[contains(@src,"preintermediate1-")]'):
    body.remove(script)
for link in doc.xpath('//header//a[@aria-current]'):
    link.attrib.pop('aria-current', None)
doc.xpath('//header//ul[contains(@class,"nav-links")]')[0].append(fragment('<li><a href="practice-lab.html">Practice Lab</a></li>'))
main = doc.find('.//main'); hero = copy.deepcopy(main[0]); main.clear(); main.set('id', 'main-content')
hero.set('style', f'--hero-image:url({MEDIA}cover.webp)')
hero.xpath('.//p[@class="eyebrow"]')[0].text = 'Practice Lab · Unit 1 · Writing'
hero.xpath('.//h1')[0].text = 'My Personality'
hero.xpath('.//div[contains(@class,"pi-hero-copy")]/p[not(@class="eyebrow")]')[0].text = description
actions = hero.xpath('.//div[contains(@class,"hero-actions")]')[0]; actions.clear(); actions.set('class', 'hero-actions pi-actions')
actions.extend(html.fragments_fromstring(f'<a class="btn btn-primary" href="#writing-practice">Start writing</a><a class="btn btn-secondary" href="{PDF}" download="22 - Describing Personality.pdf">Download original PDF</a><a class="btn btn-secondary" href="practice-lab.html#unit-1-personality">Unit 1 activities</a>'))
image = hero.xpath('.//figure/img')[0]; image.set('src', MEDIA + 'cover.webp'); image.set('alt', 'Adult learner reflecting on her personality while writing in a notebook'); image.set('width', '1600'); image.set('height', '800')
main.append(hero)
bank = '<ul class="mp-wordbank" aria-label="Original word box">' + ''.join('<li><span data-glossary>' + escape(w) + '</span></li>' for w in WORDS) + '</ul>'
checklist = ''.join(f'<label><input type="checkbox" data-mp-check="{i}"><span>{escape(text)}</span></label>' for i, text in enumerate(SELF_CHECK, 1))
starters = ''.join('<li>' + escape(text) + '</li>' for text in STARTERS)
content = '''<section class="pi-objective mp-intro"><p class="pi-label">Activity 7 of 8 · ESL Pals · Page 8</p><h2>Your learning goal</h2><p>Describe your own personality with adjectives and add reasons or examples.</p><div class="pi-route"><span>Write → review → revise</span><span>9 words to choose from</span><span>Writing · no official grade</span></div><p class="pi-small">Choose words that fit you. There is no minimum word count and you do not need to use every word. Your draft stays in this browser tab after a reload. Copy your writing into your own document before closing the tab.</p><p id="mp-storage-status" class="pi-small" role="status" hidden></p></section>'''
content += f'''<details class="pi-topic" id="writing-practice"><summary><span class="pi-number">Write</span><h2>My Personality</h2></summary><div class="pi-topic-body"><p class="pi-label">HOMEWORK · WRITING EXERCISE</p><div class="mp-instruction"><p id="mp-original-instruction">{escape(INSTRUCTION)}</p><button type="button" class="btn btn-secondary" id="mp-listen">▷ Listen to the instruction</button></div>{bank}<p class="pi-small">Hover or focus for the meaning in Spanish. Tap an underlined word to hear its pronunciation.</p><div class="pi-audio-controls" aria-label="Instruction and word audio controls"><span>Audio speed</span><button type="button" data-mp-speed="0.75" aria-pressed="false">0.75×</button><button type="button" data-mp-speed="1" aria-pressed="true">1.0×</button><button type="button" data-mp-speed="1.25" aria-pressed="false">1.25×</button><button type="button" data-mp-stop>Stop audio</button><span id="mp-audio-status" role="status" aria-live="polite">Listen to the instruction or a word when you need support.</span></div><form id="mp-form" novalidate><div class="mp-workspace"><div class="mp-writing-panel"><label for="mp-writing">My writing</label><p id="mp-writing-help" class="pi-small">Write about yourself. Say as much as you can, using your own ideas.</p><textarea id="mp-writing" name="my-personality" rows="12" spellcheck="true" autocapitalize="sentences" autocomplete="off" aria-describedby="mp-writing-help mp-count" placeholder="Write about your personality here."></textarea><p id="mp-count">0 words · no minimum or target</p><div class="pi-actions"><button type="button" class="btn btn-secondary" id="mp-copy">Copy my writing</button><button type="button" class="btn btn-secondary" id="mp-reset">Start again</button><button type="button" class="btn btn-secondary" id="mp-undo" hidden>Undo reset</button></div><p id="mp-copy-status" class="pi-small" role="status" aria-live="polite"></p></div><aside class="mp-review-panel" aria-labelledby="mp-review-heading"><details class="mp-help"><summary>Help me start · optional</summary><p>These are optional starters, not answers from the worksheet. Complete them with your own ideas.</p><ul>{starters}</ul></details><h3 id="mp-review-heading">Read, check and revise</h3><p class="pi-small">Read your writing and mark what you have checked. You can edit your text at any time.</p><div class="mp-self-check">{checklist}</div><button type="button" class="btn btn-primary" id="mp-review">Review my writing</button><p class="pi-small">This is your self-check. The page does not correct or grade your writing automatically.</p></aside></div><p id="mp-result" class="mp-result" role="status" aria-live="polite" tabindex="-1" hidden></p></form></div></details>'''
content += f'''<details class="pi-topic" id="original-page"><summary><span class="pi-number">PDF</span><h2>View the original worksheet · Page 8</h2></summary><div class="pi-topic-body"><p>The original page contains the writing instruction, the nine-word box and writing lines. The digital starters and self-check above are optional support.</p><figure class="mp-original-page"><img src="{MEDIA}original-page-8.webp" width="1275" height="1801" alt="Original ESL Pals page 8: Homework, Writing Exercise, original personality instruction, nine-word box and writing lines" loading="lazy"><figcaption>ESL Pals · Describing Personality · Page 8</figcaption></figure></div></details><section class="pi-objective mp-footer" id="paper-version"><div><h2>Original PDF · 10 pages</h2><p>Writing instruction and word box: ESL Pals, <cite>Describing Personality</cite>. PDF provided unchanged. Page 8 has no exercise illustrations; the new cover represents personal writing.</p></div><div class="pi-actions"><a class="btn btn-primary" href="{PDF}" download="22 - Describing Personality.pdf">Download original PDF</a><a class="btn btn-secondary" href="{PREV}">Previous · Let’s Talk About Personality</a><a class="btn btn-secondary" href="practice-lab.html#unit-1-personality">Unit 1 activities · 7 of 8 ready</a></div></section><noscript><p class="pi-objective">You can write in the space above or use the original PDF. Enable JavaScript for audio, the word counter, copying, self-check feedback and saved drafts. Without it, copy your writing before leaving.</p></noscript>'''
main.append(fragment('<div class="pi-shell">' + content + '</div>'))
body.append(fragment('<audio id="mp-audio" preload="none" hidden></audio>'))
data = html.Element('script', id='mp-data', type='application/json')
data.text = json.dumps(dict(instruction=INSTRUCTION, instructionAudio=AUDIO, vocabulary=VOCABULARY), ensure_ascii=False).replace('<', '\\u003c')
body.append(data)
for src in ['/assets/js/first-visit-vocabulary.js?v=20261031-personality-speaking', '/assets/js/preintermediate1-my-personality.js?v=' + VERSION]:
    body.append(fragment('<script src="' + src + '"></script>'))
write(NAME, doc)

lab = html.document_fromstring((COURSE / 'practice-lab.html').read_text()); block = lab.get_element_by_id('unit-1-personality')
grid = block.xpath('./div/div[contains(@class,"pi-section-grid")]')[0]
for previous in grid.xpath('./article[.//a[@href=$name]]', name=NAME): grid.remove(previous)
card = f'''<article class="course-section-card"><div class="course-section-image"><img src="{MEDIA}cover.webp" alt="Adult learner writing a personal reflection" width="1600" height="800" loading="lazy" decoding="async"></div><div class="course-section-content"><span class="section-number">07</span><span class="course-status course-status-available">Writing · Available now</span><h3>My Personality</h3><p>Write, review and revise your own personality description.</p><a class="card-link" href="{NAME}">Open writing activity</a></div></article>'''
grid.append(fragment(card)); block.xpath('./summary/h3')[0].text = 'Describing Personality · 7 of 8 activities ready'
pending = block.xpath('.//ol[contains(@class,"pi-planned-activities")]')[0]
for previous in pending.xpath('./li[.//strong[text()="My Personality"]]'): pending.remove(previous)
pending.set('start', '8'); write('practice-lab.html', lab)
for name in ['vocabulary-unit-1-personality.html', 'grammar-unit-1-personality-be.html', 'reading-unit-1-meet-the-characters.html', 'writing-unit-1-describing-people.html', 'vocabulary-unit-1-describing-pictures.html', PREV]:
    previous = html.document_fromstring((COURSE / name).read_text()); links = previous.xpath('//*[@id="paper-version"]//div[contains(@class,"pi-actions")]')[0]
    for link in links.xpath('./a[contains(@href,"practice-lab.html")]'): link.text = 'Unit 1 activities · 7 of 8 ready'
    if name == PREV:
        for link in links.xpath('./a[@href=$name]', name=NAME): links.remove(link)
        links.insert(1, fragment(f'<a class="btn btn-secondary" href="{NAME}">Next · My Personality</a>'))
    write(name, previous)
library = html.document_fromstring((COURSE / 'listening-library.html').read_text()); shell = library.get_element_by_id('unit-audio-library')
for previous in shell.xpath('./section[@id="unit-1-personal-writing-audio"]'): shell.remove(previous)
shell.get_element_by_id('unit-1').addprevious(fragment('<section class="pi-objective" id="unit-1-personal-writing-audio"><h2>Unit 1 · My Personality writing support</h2><p>Listen to the original writing instruction and nine word pronunciations inside the activity.</p><div class="pi-library-activities">' + card + '</div></section>'))
write('listening-library.html', library)
try:
    import qrcode
except ModuleNotFoundError:
    sys.path.insert(0, str(ROOT / 'tmp/unit5-explanation/python-deps'))
    import qrcode
import qrcode.image.svg
qrcode.make('https://www.jaralingua.com/ingles/preintermedio-1/' + NAME, image_factory=qrcode.image.svg.SvgPathImage, box_size=10, border=4).save(ROOT / 'assets/img/page-qr' / ('ingles-preintermedio-1-' + NAME.removesuffix('.html') + '.svg'))
print('Built Activity 7: original page 8 writing prompt, nine words, personal draft, self-check and expandable QR.')

import runpy
runpy.run_path(str(ROOT / 'tools/build_preintermediate1_unit1_more_personalities.py'), run_name='__main__')
