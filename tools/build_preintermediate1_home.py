"""Build the ten-section dashboard and preserve one relevant cover per page.

Run independently, or as the final step of the six-unit explanation builders.
Shared resources keep their original pages and images. Pending sections have
cards only: they must never link to a nonexistent course page.
"""
from html import escape
from pathlib import Path

from lxml import html

ROOT = Path(__file__).resolve().parents[1]
COURSE = ROOT / 'ingles/preintermedio-1'
VERSION = '20261024-course-dashboard'
DASHBOARD_VERSION = '20261024-home-section-plan'
ASSETS = '/assets/img/english-preintermediate-1/course/'
SECTIONS = [
    ('course-overview', 'Course Overview', 'course-overview.html', 'course-overview',
     'Six units with explanations and audio models.',
     'Two adult learners planning a learning route together in a library'),
    ('practice-lab', 'Practice Lab', None, 'practice-lab',
     'Activities to apply each unit’s language.',
     'Two adults working together with study cards and a notebook'),
    ('games', 'Games', 'games.html', 'games',
     'Shared games from Basic 1 and Basic 2.',
     'Adult learners enjoying a tabletop game together'),
    ('listening-library', 'Listening Library', 'listening-library.html', 'listening-library',
     'Audio models collected unit by unit.',
     'An adult learner listening attentively through headphones'),
    ('pronunciation-library', 'Pronunciation Library', None, 'pronunciation-library',
     'Pronunciation practice for course language.',
     'An adult learner speaking into a desktop microphone'),
    ('expressions', 'Idioms and Phrasal Verbs', 'expressions.html', 'expressions',
     'Meaning, context and audio models.',
     'Three adults exchanging stories in a lively café conversation'),
    ('phonetic-rules', 'Phonetic Rules', '/ingles/basico/phonetic-rules.html',
     '/assets/img/english-basic/phonetics-english-hero.png',
     'English sounds and pronunciation guidance.',
     'English phonetic sounds and pronunciation guide'),
    ('free-english-links', 'Free English Learning Links', '/ingles/basico/english-learning-links.html',
     '/assets/img/english-basic/english-learning-resources-banner.png',
     'Shared free English learning resources.',
     'English language learning resources'),
    ('grades', 'Grades', 'notas.html', 'grades',
     'A fresh gradebook for this course.',
     'An adult learner reviewing an anonymous progress chart'),
    ('evaluations', 'Evaluations and Exam Practice', 'evaluations.html', 'evaluations',
     'A fresh course assessment center.',
     'Adult learners writing individually in a bright classroom'),
]


def read(name):
    return html.document_fromstring((COURSE / name).read_text())


def save(name, doc):
    for link in doc.xpath('//link[contains(@href,"english-preintermediate-1.css")]'):
        link.set('href', '/assets/css/english-preintermediate-1.css?v=' + VERSION)
    (COURSE / name).write_text('<!doctype html>\n' + html.tostring(doc, encoding='unicode', method='html') + '\n')


doc = read('index.html')
doc.find('.//body').set('class', 'english-basic-page basic2-index-page preinter-page preinter-home')
doc.xpath('//meta[@name="description"]')[0].set('content',
    'Preintermediate English Course 1: six unit explanations, expressions, shared resources and the course sections in preparation.')
main = doc.find('.//main')
main.clear(keep_tail=True)
main.set('id', 'main-content')
hero = f'''<section class="basic-course-hero" style="--hero-image:url({ASSETS}course-home.webp)">
  <div class="basic-hero-image"><img src="{ASSETS}course-home.webp" alt="Adult friends sharing interests and conversation in a welcoming town square" width="1536" height="1024" fetchpriority="high"></div>
  <div class="basic-hero-content"><p class="eyebrow">English Learning Path</p>
    <h1>Preintermediate English Course 1</h1>
    <p>Connect with people, explore interests and healthy living, share celebrations and memories, and find your way around town.</p>
    <div class="hero-actions"><a href="#course-sections" class="btn btn-primary">Explore the course</a><a href="/ingles/index.html" class="btn btn-secondary">Back to English</a></div>
  </div>
</section>'''
quick = []
cards = []
for number, (slug, title, href, image, description, alt) in enumerate(SECTIONS, 1):
    image = image if image.startswith('/') else ASSETS + image + '.webp'
    status = {'games': 'Shared games', 'listening-library': 'Unit audio models',
              'grades': 'Sin registros', 'evaluations': 'Desde cero'}.get(slug, 'Available now' if href else 'En preparación')
    destination = href or '#' + slug + '-card'
    quick.append(f'<a href="{destination}"><b>{number:02}</b><span>{escape(title)}'
                 + ('' if href else '<small lang="es">En preparación</small>') + '</span></a>')
    action = (f'<a href="{href}" class="card-link">Open section</a>' if href else
              '<p class="pi-pending-note">Coming soon</p>')
    cards.append(f'''<article class="course-section-card" id="{slug}-card">
      <div class="course-section-image"><img src="{image}" alt="{escape(alt)}" width="1536" height="1024" loading="lazy" decoding="async"></div>
      <div class="course-section-content"><span class="section-number">{number:02}</span>
        <span class="course-status {'course-status-empty' if slug in ('grades', 'evaluations') else 'course-status-available' if href else 'course-status-pending'}"{(' lang="es"' if not href or slug in ('grades', 'evaluations') else '')}>{status}</span>
        <h3>{escape(title)}</h3><p>{escape(description)}</p>{action}
      </div></article>''')
content = hero + '''<section class="quick-access-panel compact" aria-label="Quick navigation">
  <div class="quick-access-header"><h2>Preintermediate 1 menu</h2><span>10 sections</span></div>
  <details class="quick-access-dropdown"><summary>Show Preintermediate 1 menu</summary><div class="quick-link-list">''' + ''.join(quick) + '''</div></details>
</section><section class="basic-intro-section"><div class="section-heading">
  <p class="eyebrow">Course dashboard</p><h2>Choose your learning section</h2>
  <p>Explore the six units, shared games and growing audio library. Practice Lab and Pronunciation Library remain <span lang="es">“En preparación”</span>.</p>
</div></section><section class="course-dashboard" id="course-sections" aria-label="Course sections">''' + ''.join(cards) + '</section>'
main.extend(html.fragments_fromstring(content))
for script in doc.xpath('//script[contains(@src,"preintermediate1-")]'):
    script.getparent().remove(script)
save('index.html', doc)
doc = read('index.html')
doc.xpath('//link[contains(@href,"english-preintermediate-1.css")]')[0].set('href', '/assets/css/english-preintermediate-1.css?v=' + DASHBOARD_VERSION)
(COURSE / 'index.html').write_text('<!doctype html>\n' + html.tostring(doc, encoding='unicode', method='html') + '\n')

# A card and its destination share one cover. Unrelated pages never share it.
for name, cover, alt in [
    ('course-overview.html', 'course-overview', SECTIONS[0][5]),
    ('expressions.html', 'expressions', SECTIONS[5][5]),
]:
    doc = read(name)
    hero = doc.xpath('//section[contains(@class,"pi-hero")]')[0]
    image_path = ASSETS + cover + '.webp'
    hero.set('style', '--hero-image:url(' + image_path + ')')
    image = hero.xpath('.//figure/img')[0]
    image.set('src', image_path)
    image.set('alt', alt)
    save(name, doc)

# Keep the six unit themes visible in the roadmap, using each page's own cover.
doc = read('course-overview.html')
units = [
    ('making-friends', 'Making Friends'),
    ('interests-hobbies', 'Interests and Hobbies'),
    ('healthy-living', 'Healthy Living'),
    ('celebrations-festivals', 'Celebrations and Festivals'),
    ('childhood-memories', 'Childhood Memories'),
    ('around-town', 'Around Town'),
]
for number, (slug, title) in enumerate(units, 1):
    body = doc.get_element_by_id(f'unit-{number}').xpath('./div[contains(@class,"pi-topic-body")]')[0]
    for old in body.xpath('./figure[contains(@class,"pi-unit-cover")]'):
        body.remove(old)
    body.insert(0, html.fragment_fromstring(
        f'<figure class="pi-unit-cover"><a href="unit-{number}-{slug}.html" aria-label="Open Unit {number}: {escape(title)}"><img src="/assets/img/english-preintermediate-1/unit-{number}/{slug}-hero.webp" alt="{escape(title)} — Unit {number} cover" width="1536" height="1024" loading="lazy" decoding="async"></a></figure>'))
save('course-overview.html', doc)
import runpy
runpy.run_path(str(ROOT / 'tools/build_preintermediate1_sections.py'), run_name='__main__')
print('Built ten course cards: eight destinations, two in preparation; fresh gradebook and evaluation center; overview preserved.')
