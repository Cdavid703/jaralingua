"""Build the course's section entrances without copying records or game state.

Games are explicitly shared original pages. This is not an adaptation of their
content or persistence. The listening library derives from the unit manifests;
the gradebook and assessment center deliberately start as empty page structures.
"""
import copy
import json
import sys
from html import escape
from pathlib import Path
from urllib.parse import urljoin

from lxml import html

ROOT = Path(__file__).resolve().parents[1]
COURSE = ROOT / 'ingles/preintermedio-1'
VERSION = '20261024-home-section-plan'
ASSETS = '/assets/img/english-preintermediate-1/course/'
UNITS = [
    ('making-friends', 'Making Friends'),
    ('interests-hobbies', 'Interests and Hobbies'),
    ('healthy-living', 'Healthy Living'),
    ('celebrations-festivals', 'Celebrations and Festivals'),
    ('childhood-memories', 'Childhood Memories'),
    ('around-town', 'Around Town'),
]
GAMES = [
    ('Core games', 'Final Adventure', 'Basic 2', 'ingles/basico-2/adventure-unit-1.html', 'Complete six units of language challenges.'),
    ('Core games', 'Guess Who', 'Basic 1 · Basic 2', 'ingles/basico/practice-unit-3-favorite-people.html', 'Ask yes/no questions and describe people.'),
    ('Core games', 'Hangman', 'Basic 2', 'ingles/basico-2/game-hangman.html', 'Spell words and expressions from the six Basic 2 units.'),
    ('Core games', 'Impostor', 'Basic 2', 'ingles/basico-2/game-impostor.html', 'Describe a secret word and discover the hidden role.'),
    ('Classroom speaking', 'Mystery Object Guessing Game', 'Basic 1', 'ingles/basico/workshop-unit-2-bag-exchange.html', 'Identify classroom objects and confirm ownership.'),
    ('Classroom speaking', 'Two Truths and One Lie', 'Basic 1', 'ingles/basico/workshop-unit-4-two-truths-one-lie.html', 'Share routine statements and ask follow-up questions.'),
    ('Memory and sorting', 'Free Time Memory Challenge', 'Basic 1', 'ingles/basico/game-unit-5-free-time-memory.html', 'Find pairs and pronounce free-time activities.'),
    ('Memory and sorting', 'Neighborhood Memory Challenge', 'Basic 1', 'ingles/basico/game-unit-6-neighborhood-memory.html', 'Match pairs of neighborhood places.'),
    ('Memory and sorting', 'Shopping Memory Vocabulary', 'Basic 2', 'ingles/basico-2/practice-unit-2-shopping-memory.html', 'Find clothing pairs and say each item aloud.'),
    ('Memory and sorting', 'Around the World Memory', 'Basic 2', 'ingles/basico-2/practice-unit-3-around-world-memory.html', 'Match useful adjectives for places.'),
    ('Memory and sorting', 'Past be: Memory Grammar Lab', 'Basic 2', 'ingles/basico-2/practice-unit-5-past-be-memory-lab.html', 'Use was, were, wasn’t and weren’t in context.'),
    ('Memory and sorting', 'Food Vocabulary Memory', 'Basic 2', 'ingles/basico-2/practice-unit-6-food-vocabulary-memory.html', 'Find food pairs, listen and pronounce.'),
    ('Memory and sorting', 'Market Basket Challenge', 'Shared from Basic 2', 'ingles/intermediate/practice-unit-5-countable-uncountable-food.html', 'Sort foods and choose quantity expressions.'),
]


def fragment(markup):
    return html.fragment_fromstring(markup)


def page(name, title, cover, description, anchor, action, content, scripts=()):
    # Reuse the level's proven Basic 2 shell, header, auth and QR integration.
    doc = html.document_fromstring((COURSE / 'course-overview.html').read_text())
    doc.find('.//title').text = title + ' | Preintermediate English Course 1'
    for current in doc.xpath('//header//a[@aria-current]'):
        current.attrib.pop('aria-current', None)
    doc.xpath('//meta[@name="description"]')[0].set('content', description)
    doc.find('.//body').set('class', 'english-basic-page basic2-page preinter-page pi-section-page')
    for link in doc.xpath('//link[contains(@href,"english-preintermediate-1.css")]'):
        link.set('href', '/assets/css/english-preintermediate-1.css?v=' + VERSION)
    for script in doc.xpath('//script[contains(@src,"preintermediate1-")]'):
        script.getparent().remove(script)
    main = doc.find('.//main')
    hero = copy.deepcopy(main[0])
    hero.set('style', '--hero-image:url(' + ASSETS + cover + '.webp)')
    hero.xpath('.//p[@class="eyebrow"]')[0].text = 'Preintermediate English Course 1'
    hero.xpath('.//h1')[0].text = title
    hero.xpath('.//div[contains(@class,"pi-hero-copy")]/p[not(@class="eyebrow")]')[0].text = description
    actions = hero.xpath('.//div[contains(@class,"hero-actions")]')[0]
    actions.clear()
    actions.set('class', 'hero-actions pi-actions')
    actions.extend(html.fragments_fromstring(f'<a class="btn btn-primary" href="#{anchor}">{action}</a><a class="btn btn-secondary" href="index.html">Course home</a>'))
    image = hero.xpath('.//figure/img')[0]
    image.set('src', ASSETS + cover + '.webp')
    image.set('alt', {
        'games': 'Adult learners enjoying a tabletop game together',
        'listening-library': 'An adult learner listening attentively through headphones',
        'grades': 'An adult learner reviewing an anonymous progress chart',
        'evaluations': 'Adult learners writing individually in a bright classroom',
    }[cover])
    main.clear()
    main.set('id', 'main-content')
    main.append(hero)
    main.append(fragment('<div class="pi-shell" id="' + anchor + '">' + content + '</div>'))
    for src in scripts:
        doc.find('.//body').append(fragment('<script src="' + src + '"></script>'))
    (COURSE / name).write_text('<!doctype html>\n' + html.tostring(doc, encoding='unicode', method='html') + '\n')


def game_card(item):
    _, title, origin, source, description = item
    doc = html.parse(str(ROOT / source))
    images = doc.xpath('//main//img[not(contains(@src,"page-qr"))] | //header[contains(@class,"hero")]//img')
    image = (urljoin('/' + source, images[0].get('src')) if images else
             '/assets/img/english-basic-2/games/impostor-game-preview.png')
    return f'''<article class="course-section-card">
      <div class="course-section-image"><img src="{escape(image)}" alt="{escape(title)} — original game cover" loading="lazy" decoding="async"></div>
      <div class="course-section-content"><span class="course-status course-status-available">{escape(origin)}</span>
      <h3>{escape(title)}</h3><p>{escape(description)}</p>
      <a class="card-link" href="/{source}">Open original game</a></div></article>'''


games = '''<section class="pi-objective"><h2>The same games from Basic 1 and Basic 2</h2>
<p>This collection opens the existing games in their original course pages. Each card names its source course. Final Adventure uses its original Basic 2 account and keeps progress there.</p></section>'''
for number, group in enumerate(dict.fromkeys(item[0] for item in GAMES), 1):
    games += f'<details class="pi-topic" id="games-{number}"><summary><span class="pi-number">{number:02}</span><h2>{group}</h2></summary><div class="pi-topic-body"><div class="pi-section-grid">' + ''.join(game_card(item) for item in GAMES if item[0] == group) + '</div></div></details>'
page('games.html', 'Games', 'games', 'Explore the same games from Basic 1 and Basic 2, brought together in one collection.', 'game-collection', 'Explore games', games)


def audio_controls():
    return '''<div class="pi-audio-controls" aria-label="Model audio controls"><span>Speed</span><button type="button" data-speed="0.75" aria-pressed="false">0.75×</button><button type="button" data-speed="1" aria-pressed="true">1.0×</button><button type="button" data-stop>Stop audio</button><span data-audio-status role="status" aria-live="polite">Choose a word or sentence to listen.</span></div>'''


library = '''<section class="pi-objective"><h2>Audio models, unit by unit</h2><p>Listen to the complete words, sentences and dialogues from the unit explanations. This collection grows as new unit audios are built. These are explained language models; listening activities will be added as they are constructed.</p></section>'''
total = 0
for number, (slug, title) in enumerate(UNITS, 1):
    manifest = json.loads((COURSE / f'audio/unit{number}/lesson/audio-manifest.json').read_text())
    total += len(manifest)
    buttons = ''.join(f'<button type="button" class="pi-say" data-audio="{escape(key)}"><span aria-hidden="true">▶</span> {escape(item["text"])}</button>' for key, item in manifest.items())
    library += f'''<details class="pi-topic" id="unit-{number}"><summary><span class="pi-number">{number:02}</span><h2>{title}</h2></summary><div class="pi-topic-body"><p class="pi-goal">{len(manifest)} audio models · Unit {number}</p>{audio_controls()}<div class="pi-audio-list">{buttons}</div><div class="pi-actions"><a class="btn btn-secondary" href="unit-{number}-{slug}.html">Open the unit explanation</a></div></div></details>'''
page('listening-library.html', 'Listening Library', 'listening-library', 'Listen to the audio models from each unit. The library grows with the course.', 'unit-audio-library', 'Explore unit audios', library, [
    '/assets/js/preintermediate1-all-audio-data.js?v=20261024-unit6-theory',
    '/assets/js/preintermediate1-lesson.js?v=20261024-unit6-theory',
])


def grade_table(headers, message):
    return '<div class="pi-table-wrap"><table class="pi-empty-table"><thead><tr>' + ''.join('<th scope="col">' + label + '</th>' for label in headers) + f'</tr></thead><tbody><tr><td colspan="{len(headers)}">{message}</td></tr></tbody></table></div>'


grade_sections = [
    ('gradebook', 'Gradebook', 'No grades recorded yet.', grade_table(['Student', 'Assessment', 'Average', 'Course status'], 'No records have been added to this new gradebook.')),
    ('deliverables', 'Deliverables', 'No deliverables recorded yet.', grade_table(['Student', 'Activity', 'Status'], 'No submissions have been added to this course.')),
    ('reports', 'Reports', 'No reports available yet.', '<p>Reports will appear when this course has its own assessment records.</p>'),
    ('roster', 'Roster', 'No roster records added yet.', grade_table(['Student', 'Registration status'], 'This new gradebook starts with an empty roster.')),
]
tabs = '<section class="pi-objective"><h2>A fresh start for this course</h2><p>The Preintermediate 1 gradebook begins with its own empty sections. Assessment records and course administration are not enabled yet.</p></section><div id="preintermediate-gradebook"><div class="staff-tabs" data-gradebook-tabs><div class="staff-tab-nav" role="tablist" aria-label="Course gradebook sections">'
for index, (slug, label, _, _) in enumerate(grade_sections):
    tabs += f'<button class="staff-tab" type="button" role="tab" id="gradebook-tab-{slug}" aria-controls="gradebook-panel-{slug}" aria-selected="{"true" if index == 0 else "false"}" tabindex="{0 if index == 0 else -1}" data-gradebook-tab="{slug}">{label}</button>'
tabs += '</div>'
for index, (slug, label, message, table) in enumerate(grade_sections):
    tabs += f'<section class="staff-tab-panel pi-objective" role="tabpanel" id="gradebook-panel-{slug}" aria-labelledby="gradebook-tab-{slug}" tabindex="0" data-gradebook-panel="{slug}"{(" hidden" if index else "")}><h2>{label}</h2><p class="pi-small">{message}</p>{table}</section>'
tabs += '</div></div>'
page('notas.html', 'Grades', 'grades', 'A new gradebook for Preintermediate English Course 1, beginning with no records.', 'course-gradebook', 'View gradebook', tabs, [
    '/assets/js/gradebook-tabs.js?v=20260721',
    '/assets/js/preintermediate1-sections.js?v=' + VERSION,
])
doc = html.document_fromstring((COURSE / 'notas.html').read_text())
doc.find('.//head').append(fragment('<link rel="stylesheet" href="/assets/css/gradebook-tabs.css?v=20260721">'))
(COURSE / 'notas.html').write_text('<!doctype html>\n' + html.tostring(doc, encoding='unicode', method='html') + '\n')

evaluations = '''<section class="pi-objective"><h2>A new assessment center</h2><p>This space begins from zero for Preintermediate 1. Its own exam preparation and official assessments will appear here as they are built.</p></section>
<details class="pi-topic" id="exam-practice"><summary><span class="pi-number">01</span><h2>Exam Practice</h2></summary><div class="pi-topic-body"><p>No exam practice has been added to this course yet.</p></div></details>
<details class="pi-topic" id="official-evaluations"><summary><span class="pi-number">02</span><h2>Official Evaluations</h2></summary><div class="pi-topic-body"><p>No official assessments are available here yet.</p></div></details>'''
page('evaluations.html', 'Evaluations and Exam Practice', 'evaluations', 'A fresh assessment center for this course, with separate spaces for exam practice and official evaluations.', 'evaluation-sections', 'View assessment sections', evaluations)

try:
    import qrcode
except ModuleNotFoundError:
    sys.path.insert(0, str(ROOT / 'tmp/unit5-explanation/python-deps'))
    import qrcode
import qrcode.image.svg
for name in ['games', 'listening-library', 'notas', 'evaluations']:
    qrcode.make('https://www.jaralingua.com/ingles/preintermedio-1/' + name + '.html', image_factory=qrcode.image.svg.SvgPathImage, box_size=10, border=4).save(ROOT / 'assets/img/page-qr' / ('ingles-preintermedio-1-' + name + '.svg'))
print(f'Built four section entrances: {len(GAMES)} shared original games, {total} unit audio models, empty gradebook and empty evaluation center, with their own cover images and QR assets.')

# Keep the first Practice Lab increment after rebuilding the course entrances.
import runpy
runpy.run_path(str(ROOT / 'tools/build_preintermediate1_practice.py'), run_name='__main__')
