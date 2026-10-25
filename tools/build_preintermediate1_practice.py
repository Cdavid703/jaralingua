"""Build the first Practice Lab increment; leave theory pages unchanged."""
import copy
import json
import sys
from html import escape
from pathlib import Path

from lxml import html
from preintermediate1_unit1_practice_content import ACTIVITIES, QUESTIONS, READING, SUPPORT

ROOT = Path(__file__).resolve().parents[1]
COURSE = ROOT / 'ingles/preintermedio-1'
VERSION = '20261024-unit1-reading'
PAGE = 'reading-unit-1-first-connections.html'
IMAGE = '/assets/img/english-preintermediate-1/unit-1/practice/first-connections-reading.webp'
COURSE_IMAGE = '/assets/img/english-preintermediate-1/course/practice-lab.webp'
MODELS = json.loads((COURSE / 'audio/unit1/lesson/audio-manifest.json').read_text())


def fragment(source):
    return html.fragment_fromstring(source)


def page(name, title, eyebrow, description, image_path, image_alt, actions, content, audio=False):
    doc = html.document_fromstring((COURSE / 'course-overview.html').read_text())
    doc.find('.//title').text = title + ' | Preintermediate English Course 1'
    doc.xpath('//meta[@name="description"]')[0].set('content', description)
    doc.find('.//body').set('class', 'english-basic-page basic2-page preinter-page pi-practice-page')
    for el in doc.xpath('//header//a[@aria-current]'):
        el.attrib.pop('aria-current', None)
    nav = doc.xpath('//header//ul[contains(@class,"nav-links")]')[0]
    nav.append(fragment('<li><a href="practice-lab.html"' + (' aria-current="page"' if name == 'practice-lab.html' else '') + '>Practice Lab</a></li>'))
    for el in doc.xpath('//link[contains(@href,"english-preintermediate-1.css")]'):
        el.set('href', '/assets/css/english-preintermediate-1.css?v=' + VERSION)
    for el in doc.xpath('//script[contains(@src,"preintermediate1-")]'):
        el.getparent().remove(el)
    main = doc.find('.//main')
    hero = copy.deepcopy(main[0])
    hero.set('style', '--hero-image:url(' + image_path + ')')
    hero.xpath('.//p[@class="eyebrow"]')[0].text = eyebrow
    hero.xpath('.//h1')[0].text = title
    hero.xpath('.//div[contains(@class,"pi-hero-copy")]/p[not(@class="eyebrow")]')[0].text = description
    links = hero.xpath('.//div[contains(@class,"hero-actions")]')[0]
    links.clear()
    links.set('class', 'hero-actions pi-actions')
    links.extend(html.fragments_fromstring(actions))
    image = hero.xpath('.//figure/img')[0]
    image.set('src', image_path)
    image.set('alt', image_alt)
    main.clear()
    main.set('id', 'main-content')
    main.append(hero)
    main.append(fragment('<div class="pi-shell">' + content + '</div>'))
    if audio:
        for src in ['/assets/js/preintermediate1-unit1-audio-data.js?v=20261024-unit6-theory', '/assets/js/preintermediate1-lesson.js?v=20261024-unit6-theory']:
            doc.find('.//body').append(fragment('<script src="' + src + '"></script>'))
        data = html.Element('script', id='pi-reading-data', type='application/json')
        data.text = json.dumps(QUESTIONS, ensure_ascii=False).replace('<', '\\u003c')
        doc.find('.//body').append(data)
        doc.find('.//body').append(fragment('<script src="/assets/js/preintermediate1-reading.js?v=' + VERSION + '"></script>'))
    else:
        # Shared hash navigation opens a requested folder, while initial folders stay closed.
        doc.find('.//body').append(fragment('<script src="/assets/js/preintermediate1-lesson.js?v=20261024-unit6-theory"></script>'))
    (COURSE / name).write_text('<!doctype html>\n' + html.tostring(doc, encoding='unicode', method='html') + '\n')


vocab = []
for category, word, meaning, audio_key in SUPPORT:
    model = MODELS[audio_key]
    vocab.append(f'<article class="basic2-info-card pi-card"><span class="pi-label">{escape(category)}</span><h3>{escape(word)}</h3><p>{escape(meaning)}</p><button type="button" class="pi-say" data-audio="{audio_key}"><span aria-hidden="true">▶</span> {escape(model["text"])}</button></article>')
audio_controls = '<div class="pi-audio-controls" aria-label="Language model audio controls"><span>Speed</span><button type="button" data-speed="0.75" aria-pressed="false">0.75×</button><button type="button" data-speed="1" aria-pressed="true">1.0×</button><button type="button" data-stop>Stop audio</button><span data-audio-status role="status" aria-live="polite">Choose a language model to listen.</span></div>'
intro = '''<section class="pi-objective"><h2>Read, connect and explain</h2><p>Read Laura and Mateo’s first conversation. Find key details, compare their interests and use evidence to understand what their conversation shows.</p><div class="pi-route"><span>Session 1 · about 15 minutes</span><span>157 words · 8 questions</span><span>Formative practice · no official grade</span></div></section>
<details class="pi-topic" id="useful-language"><summary><span class="pi-number">01</span><h2>Before you read: useful language</h2></summary><div class="pi-topic-body"><p>Use these meanings and complete audio models if you need support.</p>''' + audio_controls + '<div class="pi-grid">' + ''.join(vocab) + '</div></div></details>'
story = '<article class="pi-objective pi-reading-text" id="reading-text"><p class="pi-label">Read the story</p><h2>First Connections</h2>' + ''.join(f'<p id="reading-p{n}"><span class="pi-paragraph-number" aria-label="Paragraph {n}">{n}</span>{escape(paragraph)}</p>' for n, paragraph in enumerate(READING, 1)) + '</article>'
quiz = '''<section class="pi-objective pi-reading-questions" id="reading-questions"><h2>Understand the story</h2><p>Choose one answer for each question. You can return to the story at any time. Check your answers to see an explanation and evidence.</p><p class="pi-small">Your answers are kept in this browser tab while you practise.</p><p id="pi-answer-count" role="status" aria-live="polite">Choose your answers.</p><form id="pi-reading-quiz">'''
for number, question in enumerate(QUESTIONS, 1):
    quiz += f'<fieldset class="pi-question" id="{question["id"]}"><legend>{number}. {escape(question["question"])}</legend>'
    for letter, text in question['options'].items():
        quiz += f'<label class="pi-choice" for="{question["id"]}-{letter.lower()}"><input type="radio" id="{question["id"]}-{letter.lower()}" name="{question["id"]}" value="{letter}"><span><b>{letter}.</b> {escape(text)}</span></label>'
    quiz += '<div class="pi-question-feedback" hidden><p class="pi-feedback-answer"></p><p class="pi-feedback-explanation"></p><blockquote class="pi-feedback-evidence"></blockquote><a class="pi-evidence-link">Read the paragraph</a></div></fieldset>'
quiz += '''<div class="pi-actions"><button type="submit" class="btn btn-primary">Check answers</button><button type="button" id="pi-reading-reset" class="btn btn-secondary">Try again</button><a href="#reading-text" class="btn btn-secondary">Back to the story</a></div><p id="pi-reading-result" class="pi-reading-result" role="status" aria-live="polite" tabindex="-1" hidden></p></form><noscript>Enable JavaScript to check your answers and see feedback. You can still read the story and questions.</noscript></section>'''
page(PAGE, 'First Connections Reading', 'Practice Lab · Unit 1 · Activity 01',
     'Read how Laura and Mateo get to know each other. Discover their routines and shared interests through eight comprehension questions.',
     IMAGE, 'Two adult classmates meeting before English class and consulting a class card',
     '<a class="btn btn-primary" href="#reading-text">Start reading</a><a class="btn btn-secondary" href="practice-lab.html#unit-1">Practice Lab</a><a class="btn btn-secondary" href="unit-1-making-friends.html">Review Unit 1</a>',
     intro + '<div class="pi-reading-layout">' + story + quiz + '</div>', audio=True)

ready = f'''<article class="course-section-card"><div class="course-section-image"><img src="{IMAGE}" alt="Two classmates beginning their first conversation" width="1536" height="1024" loading="lazy" decoding="async"></div><div class="course-section-content"><span class="section-number">01</span><span class="course-status course-status-available">Reading · Available now</span><h3>First Connections Reading</h3><p>157 words, eight questions and explained feedback.</p><a class="card-link" href="{PAGE}">Open reading activity</a></div></article>'''
pending = '<section class="pi-practice-pending"><h3 class="pi-model-heading">Next activities · en preparación</h3><ol class="pi-planned-activities" start="2">' + ''.join(f'<li><div><strong>{escape(title)}</strong><span>{escape(kind)}</span></div><p>{escape(description)}</p><span class="pi-small" lang="es">En preparación</span></li>' for title, kind, description in ACTIVITIES[1:]) + '</ol></section>'
lab = '''<section class="pi-objective"><h2>Apply the language from each unit</h2><p>Open a unit folder to find its activities. Unit 1 starts with First Connections Reading. More activities will appear here as they are built.</p></section>
<details class="pi-topic" id="unit-1"><summary><span class="pi-number">01</span><h2>Making Friends</h2></summary><div class="pi-topic-body"><p class="pi-goal">Sessions 1–2 · 6 hours of class · 1 activity available · 7 in preparation</p><div class="pi-practice-unit-layout"><div class="pi-section-grid">''' + ready + '</div>' + pending + '</div></div></details>'
for number, title in enumerate(['Interests and Hobbies', 'Healthy Living', 'Celebrations and Festivals', 'Childhood Memories', 'Around Town'], 2):
    lab += f'<details class="pi-topic" id="unit-{number}"><summary><span class="pi-number">{number:02}</span><h2>{title}</h2></summary><div class="pi-topic-body"><p lang="es">En preparación.</p><p>Activities for this unit will appear here as they are built.</p></div></details>'
page('practice-lab.html', 'Practice Lab', 'Preintermediate English Course 1',
     'Practise the language of each unit through reading, questions, listening, speaking and writing. Begin with the first Making Friends activity.',
     COURSE_IMAGE, 'Two adults working together with study cards and a notebook',
     '<a class="btn btn-primary" href="#unit-1">Explore Unit 1 activities</a><a class="btn btn-secondary" href="index.html">Course home</a>', lab)

try:
    import qrcode
except ModuleNotFoundError:
    sys.path.insert(0, str(ROOT / 'tmp/unit5-explanation/python-deps'))
    import qrcode
import qrcode.image.svg
for name in ['practice-lab.html', PAGE]:
    slug = name.removesuffix('.html')
    qrcode.make('https://www.jaralingua.com/ingles/preintermedio-1/' + name, image_factory=qrcode.image.svg.SvgPathImage, box_size=10, border=4).save(ROOT / 'assets/img/page-qr' / ('ingles-preintermedio-1-' + slug + '.svg'))
print('Built Practice Lab: first reading available, seven Unit 1 activities planned; 157 words, eight questions and six exact existing audio models.')
