"""Connect the approved Unit 2 listening and reading; reuse Intermedio glossary."""
import copy
import json
import sys
from html import escape
from pathlib import Path

from lxml import html
from preintermediate1_unit2_connected_content import LISTENING_QUESTIONS, READING, READING_QUESTIONS, VOCAB

ROOT = Path(__file__).resolve().parents[1]
COURSE = ROOT / 'ingles/preintermedio-1'
VERSION = '20261024-connected-unit2'
LISTEN = 'audio-listening-unit-2-trying-a-new-hobby.html'
READ = 'reading-unit-2-our-first-group-project.html'
LISTEN_IMAGE = '/assets/img/english-preintermediate-1/unit-2/practice/trying-a-new-hobby-listening.webp'
READ_IMAGE = '/assets/img/english-preintermediate-1/unit-2/practice/our-first-group-project-reading.webp'
AUDIO = '/ingles/preintermedio-1/audio/unit2/connected/trying-a-new-hobby-v4.mp3'
MODELS = json.loads((COURSE / 'audio/unit2/lesson/audio-manifest.json').read_text())


def fragment(text):
    return html.fragment_fromstring(text)


def dump(name, doc):
    for link in doc.xpath('//link[contains(@href,"english-preintermediate-1.css")]'):
        link.set('href', '/assets/css/english-preintermediate-1.css?v=' + VERSION)
    (COURSE / name).write_text('<!doctype html>\n' + html.tostring(doc, encoding='unicode', method='html') + '\n')


def vocab_for(kind):
    entries = []
    for item in VOCAB:
        if kind not in item['pages']:
            continue
        audio = item.get('existing_path') or ('/ingles/preintermedio-1/audio/unit2/connected/' + item['file'] if item.get('new') else MODELS[item['existing']]['path'])
        if item.get('existing'):
            assert MODELS[item['existing']]['text'] == item['term']
        entries.append(dict(term=item['term'], spanish=item['spanish'], audio=audio))
    return entries


def controls():
    return '''<div class="pi-audio-controls" aria-label="Audio controls"><span>Speed</span><button type="button" data-connected-speed="0.75" aria-pressed="false">0.75×</button><button type="button" data-connected-speed="1" aria-pressed="true">1.0×</button><button type="button" data-connected-speed="1.25" aria-pressed="false">1.25×</button><button type="button" data-connected-stop>Stop audio</button><span id="pi-connected-audio-status" role="status" aria-live="polite">Choose an underlined word to hear its pronunciation.</span></div>'''


def vocabulary(kind):
    title = 'Before you listen' if kind == 'listening' else 'Before you read'
    return f'<details class="pi-topic" id="useful-language"><summary><span class="pi-number">01</span><h2>{title}: useful vocabulary</h2></summary><div class="pi-topic-body"><p>Underlined words: hover or focus for the meaning in Spanish. Tap or click to hear the pronunciation.</p><ul class="pi-connected-vocab">' + ''.join('<li><span data-glossary>' + escape(item['term']) + '</span></li>' for item in vocab_for(kind)) + '</ul></div></details>'


def quiz(kind, questions, next_link):
    verb = 'Listen' if kind == 'listening' else 'Read'
    output = f'''<section class="pi-objective pi-reading-questions" id="comprehension-check"><h2>Answer the questions</h2><p>Choose one answer per question. After a first complete attempt, {verb.lower()} again and try once more. Explanations appear after a second complete attempt, or when every answer is correct.</p><p class="pi-small">Formative practice. Your answers stay in this browser tab.</p><p id="pi-answer-count" role="status" aria-live="polite">Choose your answers.</p><form id="pi-connected-quiz">'''
    for number, q in enumerate(questions, 1):
        output += f'<fieldset class="pi-question" id="{q["id"]}"><legend>{number}. {escape(q["question"])}</legend>'
        for letter, text in q['options'].items():
            output += f'<label class="pi-choice" for="{q["id"]}-{letter.lower()}"><input type="radio" id="{q["id"]}-{letter.lower()}" name="{q["id"]}" value="{letter}"><span><b>{letter}.</b> {escape(text)}</span></label>'
        output += '<div class="pi-question-feedback" hidden><p class="pi-feedback-answer"></p><p class="pi-feedback-explanation"></p><blockquote class="pi-feedback-evidence"></blockquote>' + ('<a class="pi-evidence-link">Read the paragraph</a>' if kind == 'reading' else '') + '</div></fieldset>'
    output += '<div class="pi-actions"><button type="submit" class="btn btn-primary">Check answers</button><button type="button" id="pi-connected-reset" class="btn btn-secondary">Try again</button><a class="btn btn-secondary" href="#' + ('listening-player' if kind == 'listening' else 'reading-text') + '">' + ('Back to the audio' if kind == 'listening' else 'Back to the story') + '</a></div><p id="pi-connected-result" class="pi-reading-result" role="status" aria-live="polite" tabindex="-1" hidden></p></form><div class="pi-actions">' + next_link + '</div><noscript>Enable JavaScript to use pronunciation and check your answers.</noscript></section>'
    return output


def page(kind, name, title, image, description, content, questions, actions):
    doc = html.document_fromstring((COURSE / 'course-overview.html').read_text())
    doc.find('.//title').text = title + ' | Preintermediate English Course 1'
    doc.xpath('//meta[@name="description"]')[0].set('content', description)
    doc.find('.//body').set('class', 'english-basic-page basic2-page preinter-page pi-practice-page pi-connected-page')
    for el in doc.xpath('//header//a[@aria-current]'):
        el.attrib.pop('aria-current', None)
    doc.xpath('//header//ul[contains(@class,"nav-links")]')[0].append(fragment('<li><a href="practice-lab.html">Practice Lab</a></li>'))
    for el in doc.xpath('//script[contains(@src,"preintermediate1-")]'):
        el.getparent().remove(el)
    main = doc.find('.//main')
    hero = copy.deepcopy(main[0])
    hero.set('style', '--hero-image:url(' + image + ')')
    hero.xpath('.//p[@class="eyebrow"]')[0].text = 'Practice Lab · Unit 2 · Part ' + ('1 · Listening' if kind == 'listening' else '2 · Reading')
    hero.xpath('.//h1')[0].text = title
    hero.xpath('.//div[contains(@class,"pi-hero-copy")]/p[not(@class="eyebrow")]')[0].text = description
    links = hero.xpath('.//div[contains(@class,"hero-actions")]')[0]
    links.clear(); links.set('class', 'hero-actions pi-actions'); links.extend(html.fragments_fromstring(actions))
    img = hero.xpath('.//figure/img')[0]
    img.set('src', image)
    img.set('alt', 'Laura and Mateo discussing joining a craft group' if kind == 'listening' else 'Laura and Mateo making blue bracelets with Ana')
    main.clear(); main.set('id', 'main-content'); main.append(hero)
    main.append(fragment('<div class="pi-shell">' + content + '</div>'))
    body = doc.find('.//body')
    body.append(fragment('<audio id="pi-vocabulary-audio" preload="none" hidden></audio>'))
    data = html.Element('script', id='pi-connected-data', type='application/json')
    # The full listening transcript is supplied separately to the teacher, not in page data.
    data.text = json.dumps(dict(unit=2, kind=kind, questions=questions, vocabulary=vocab_for(kind)), ensure_ascii=False).replace('<', '\\u003c')
    body.append(data)
    for src in ['/assets/js/first-visit-vocabulary.js?v=20261024-connected', '/assets/js/preintermediate1-connected.js?v=' + VERSION]:
        body.append(fragment('<script src="' + src + '"></script>'))
    dump(name, doc)


listening = '''<section class="pi-objective"><h2>Explore a new hobby</h2><p>Laura wants a new hobby. Mateo invites her to his craft group. Listen for preferences, abilities, people and meeting details. Part 2 reveals their shared project.</p><div class="pi-route"><span>About 15 minutes</span><span>Two voices · about 1 minute</span><span>10 questions · formative practice</span></div></section>''' + vocabulary('listening') + '''<section class="pi-objective" id="listening-player"><h2>Trying a New Hobby</h2><p>Listen once for the situation, then again for details. Notice who or what each object pronoun refers to.</p><audio id="pi-story-audio" controls preload="metadata" src="''' + AUDIO + '''">Your browser does not support audio playback.</audio><div class="pi-actions"><button type="button" class="btn btn-primary" id="pi-story-play">Play from the start</button></div><button type="button" class="btn btn-secondary" id="pi-audio-retry" hidden>Retry audio</button>''' + controls() + '''</section><section class="pi-objective"><h2>Three things to notice</h2><div class="pi-route"><span>01 · Interests and abilities</span><span>02 · It, them and her</span><span>03 · When, how long and how much</span></div></section>'''
listening += quiz('listening', LISTENING_QUESTIONS, '<a class="btn btn-primary" href="' + READ + '">Continue to Part 2: Our First Group Project</a>')
page('listening', LISTEN, 'Listening: Trying a New Hobby', LISTEN_IMAGE,
     'Laura wants to try a new hobby. Listen as Mateo invites her to his craft group and explains how it works.', listening, LISTENING_QUESTIONS,
     '<a class="btn btn-primary" href="#listening-player">Start listening</a><a class="btn btn-secondary" href="' + READ + '">Part 2: Reading</a><a class="btn btn-secondary" href="practice-lab.html#unit-2">Practice Lab</a>')

story = '<article class="pi-objective pi-reading-text" id="reading-text"><p class="pi-label">Part 2 · Continue the story</p><h2>Our First Group Project</h2>' + ''.join(f'<p id="reading-p{n}"><span class="pi-paragraph-number" aria-label="Paragraph {n}">{n}</span><span data-glossary>{escape(p)}</span></p>' for n, p in enumerate(READING, 1)) + '<h3>Three things to notice</h3><ul><li>The project Laura and Mateo make together.</li><li>The people and objects behind the pronouns.</li><li>The steps and their purpose.</li></ul></article>'
word_count = sum(len(p.split()) for p in READING)
reading = f'''<section class="pi-objective"><h2>Join the craft group</h2><p>The listening introduces the group. This continuation follows Laura’s first meeting and reveals the project she makes with Mateo.</p><div class="pi-route"><span>About 15 minutes</span><span>{word_count} words · 10 questions</span><span>Formative practice · no official grade</span></div></section>''' + vocabulary('reading') + controls() + '<div class="pi-reading-layout">' + story + quiz('reading', READING_QUESTIONS, '<a class="btn btn-secondary" href="' + LISTEN + '">Return to Part 1: Trying a New Hobby</a>') + '</div>'
page('reading', READ, 'Reading: Our First Group Project', READ_IMAGE,
     'Continue the story at Laura’s first craft-group meeting. Discover the project, follow the steps and see how the group helps her learn.', reading, READING_QUESTIONS,
     '<a class="btn btn-primary" href="#reading-text">Start reading</a><a class="btn btn-secondary" href="' + LISTEN + '">Part 1: Listening</a><a class="btn btn-secondary" href="practice-lab.html#unit-2">Practice Lab</a>')


def activity_card(number, title, kind, image, target, description):
    return f'<article class="course-section-card"><div class="course-section-image"><img src="{image}" alt="{escape(title)} cover" width="1536" height="1024" loading="lazy" decoding="async"></div><div class="course-section-content"><span class="section-number">{number:02}</span><span class="course-status course-status-available">{kind} · Available now</span><h3>{escape(title)}</h3><p>{escape(description)}</p><a class="card-link" href="{target}">Open {kind.lower()} activity</a></div></article>'


cards = activity_card(1, 'Trying a New Hobby', 'Listening', LISTEN_IMAGE, LISTEN, 'Part 1: explore interests, abilities and a craft group. Ten questions.') + activity_card(2, 'Our First Group Project', 'Reading', READ_IMAGE, READ, 'Part 2: follow the shared project and its result. Ten questions.')
doc = html.document_fromstring((COURSE / 'practice-lab.html').read_text())
doc.xpath('//div[contains(@class,"pi-hero-copy")]/p[not(@class="eyebrow")]')[0].text = 'Begin Units 1 and 2 with connected listening and reading stories. Open a unit folder to find its activities.'
doc.xpath('//section[@class="pi-objective"]/p')[0].text = 'Each available story begins with listening and continues in reading. Units 1 and 2 have two activities each. More activities will appear as they are built.'
unit = doc.get_element_by_id('unit-2').xpath('./div[contains(@class,"pi-topic-body")]')[0]
unit.clear(); unit.set('class', 'pi-topic-body')
unit.extend(html.fragments_fromstring('<p class="pi-goal">Sessions 3–5 · 9 hours of class · 2 activities available</p><div class="pi-section-grid">' + cards + '</div><p class="pi-small" lang="es">Las demás actividades de la unidad están en preparación.</p>'))
dump('practice-lab.html', doc)

doc = html.document_fromstring((COURSE / 'listening-library.html').read_text())
shell = doc.get_element_by_id('unit-audio-library')
for previous in shell.xpath('./section[@id="unit-2-listening-activities"]'):
    shell.remove(previous)
shell[0].xpath('./p')[0].text = 'Start the connected stories for Units 1 and 2 below. The unit folders also collect the explained words, sentences and dialogues from each unit.'
shell.insert(2, fragment('<section class="pi-objective" id="unit-2-listening-activities"><h2>Unit 2 · Listening activity</h2><div class="pi-library-activities">' + activity_card(1, 'Trying a New Hobby', 'Listening', LISTEN_IMAGE, LISTEN, 'Join a craft group with Laura and Mateo. Ten questions, followed by a connected reading.') + '</div></section>'))
dump('listening-library.html', doc)

try:
    import qrcode
except ModuleNotFoundError:
    sys.path.insert(0, str(ROOT / 'tmp/unit5-explanation/python-deps'))
    import qrcode
import qrcode.image.svg
for name in [LISTEN, READ]:
    qrcode.make('https://www.jaralingua.com/ingles/preintermedio-1/' + name, image_factory=qrcode.image.svg.SvgPathImage, box_size=10, border=4).save(ROOT / 'assets/img/page-qr' / ('ingles-preintermedio-1-' + name.removesuffix('.html') + '.svg'))
print('Built Unit 2 craft-group listening and reading: ten questions each, contextual glossary, unique images and expandable QR.')

# Preserve the approved Unit 3 story when rebuilding earlier units.
import runpy
runpy.run_path(str(ROOT / 'tools/build_preintermediate1_unit3_connected.py'), run_name='__main__')
