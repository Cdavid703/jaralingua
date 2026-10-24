"""Build Around Town theory and connect the six available explanations."""
import copy
import json
import sys
from pathlib import Path

from lxml import html
from preintermediate1_unit6_content import audios, topics, clusters, expressions_html

ROOT = Path(__file__).resolve().parents[1]
COURSE = ROOT / 'ingles/preintermedio-1'
VERSION = '20261024-unit6-theory'
PAGE = 'unit-6-around-town.html'
IMAGE = '/assets/img/english-preintermediate-1/unit-6/around-town-hero.webp'


def controls():
    return '<div class="pi-audio-controls" aria-label="Model audio controls"><span>Speed</span><button type="button" data-speed="0.75" aria-pressed="false">0.75×</button><button type="button" data-speed="1" aria-pressed="true">1.0×</button><button type="button" data-stop>Stop audio</button><span data-audio-status role="status" aria-live="polite">Tap a word or sentence to listen.</span></div>'


def link(href, text, secondary=False):
    return f'<a class="btn pi-button {"btn-secondary" if secondary else "btn-primary"}" href="{href}">{text}</a>'


def card(title, body):
    return f'<article class="basic2-info-card pi-card"><h3>{title}</h3>{body}</article>'


def read(name):
    return html.document_fromstring((COURSE/name).read_text())


def fragment(source):
    return html.fragment_fromstring(source)


def write(name, doc, registry='unit1'):
    for el in doc.xpath('//link[@href] | //script[@src]'):
        attr = 'href' if el.tag == 'link' else 'src'
        value = el.get(attr)
        if any(part in value for part in ('english-preintermediate-1.css', 'preintermediate1-lesson.js')):
            el.set(attr, value.split('?')[0]+'?v='+VERSION)
        if 'preintermediate1-' in value and '-audio-data.js' in value:
            el.set(attr, '/assets/js/preintermediate1-'+registry+'-audio-data.js?v='+VERSION)
    (COURSE/name).write_text('<!doctype html>\n'+html.tostring(doc, encoding='unicode', method='html')+'\n')


doc = read('unit-5-childhood-memories.html')
doc.find('.//title').text = 'Unit 6 Around Town | JaraLingua'
doc.xpath('//meta[@name="description"]')[0].set('content', 'Understand places, location, directions and visitor information through a fictional map, complete explained models and professional English audio.')
main = doc.find('.//main')
hero = copy.deepcopy(main[0])
hero.set('style', '--hero-image:url('+IMAGE+')')
hero.xpath('.//*[@class="eyebrow"]')[0].text = 'Preintermediate English Course 1 · Unit 6'
hero.xpath('.//h1')[0].text = 'Around Town'
hero.xpath('.//div[contains(@class,"pi-hero-copy")]/p[not(@class="eyebrow")]')[0].text = 'Explore places around town, understand clear directions and connect visitor questions with useful information. Follow a complete fictional map, tour and weekend itinerary.'
actions = hero.xpath('.//div[contains(@class,"hero-actions")]')[0]
actions.clear(keep_tail=True)
actions.set('class', 'hero-actions pi-actions')
actions.extend(html.fragments_fromstring(link('#places-shops', 'Start the explanation')+link('course-overview.html#unit-6', 'Course Overview', True)))
image = hero.xpath('.//figure//img')[0]
image.set('src', IMAGE)
image.set('alt', 'An adult local guide and two visitors consulting a paper map in a fictional town square')
image.set('width', '1536')
image.set('height', '1024')
main.clear(keep_tail=True)
main.set('id', 'main-content')
main.append(hero)
overview = '<section class="pi-objective"><h2>What you will be able to do</h2><p>Understand and describe locations, follow a route from a stated starting point, ask for visitor information and understand recommendations and a complete itinerary.</p><div class="pi-route"><span>Sessions 14–16 · 9 hours</span><span>01 · Places and location</span><span>02 · Directions</span><span>03 · Visitor information</span><span>04 · Language in context</span></div></section>'
overview += '<details class="pi-quick"><summary>Explore the unit topics</summary><nav aria-label="Unit topics">'+''.join(f'<a href="#{t["id"]}">{t["title"]}</a>' for t in topics)+'</nav></details><p class="pi-intro">Each topic contains an explanation, visual comparisons and complete examples. Highlighted words and sentences have individual audio models. This unit applies familiar questions, prepositions, recommendations and plans to location and movement. The map and all service information describe a fictional town.</p>'
blocks = []
for n, slug, title, goal in clusters:
    nested = []
    for i, t in enumerate((t for t in topics if t['group'] == n), 1):
        nested.append(f'<details class="pi-topic pi-subtopic" id="{t["id"]}"><summary><span class="pi-number">{n}.{i}</span><h3>{t["title"]}</h3></summary><div class="pi-topic-body"><p class="pi-goal"><b>What we will learn:</b> {t["goal"]}</p>{controls() if t["id"] != "unit-6-summary" else ""}{t["body"]}</div></details>')
    blocks.append(f'<details class="pi-topic pi-cluster" id="{slug}"><summary><span class="pi-number">{n:02}</span><h2>{title}</h2></summary><div class="pi-cluster-body"><p class="pi-goal">{goal}</p>{"".join(nested)}</div></details>')
main.append(fragment('<div class="pi-shell">'+overview+''.join(blocks)+'</div>'))
write(PAGE, doc, 'unit6')

doc = read('course-overview.html')
doc.xpath('.//p[@class="pi-intro"]')[0].text = 'Explanations for all six units are available. Open a unit to explore its vocabulary, grammar and complete explained models, from Making Friends to Around Town.'
entry = fragment('<details class="pi-topic" id="unit-6"><summary><span class="pi-number">06</span><h2>Around Town</h2></summary><div class="pi-topic-body"><p class="pi-goal">Sessions 14–16 · 9 hours</p><p>Explore places, location and directions with a supplied fictional map. Understand visitor information, recommendations, guided tours and an explained itinerary.</p><div class="pi-grid">'+''.join(card(title, '<p>'+goal+'</p>'+link(PAGE+'#'+slug, 'Explore this block', True)) for _, slug, title, goal in clusters)+'</div><div class="pi-actions">'+link(PAGE, 'Open the full unit')+link('expressions.html#unit-6-expressions', 'Explore Unit 6 expressions', True)+'</div></div></details>')
old = doc.get_element_by_id('unit-6', None)
if old is None:
    old = doc.xpath('//article[contains(@class,"pi-planned")][div/h2="Around Town"]')[0]
old.getparent().replace(old, entry)
write('course-overview.html', doc)

doc = read('index.html')
doc.xpath('.//div[contains(@class,"pi-hero-copy")]/p[not(@class="eyebrow")]')[0].text = 'Explore the language of everyday life, from meeting people and describing memories to finding your way around town. Each unit connects clear explanations with complete audio models.'
doc.xpath('.//section[@class="pi-objective"]/p')[0].text = 'The six unit explanations connect vocabulary, grammar and complete audio models. Each unit shows how language works in an everyday context.'
grid = doc.xpath('.//div[@class="pi-shell"]/div[@class="pi-grid"]')[0]
for el in grid.xpath('./article[h3="Unit 6 Around Town"]'):
    grid.remove(el)
grid.insert(6, fragment(card('Unit 6 Around Town', '<p>Places, directions, tourist information and recommendations with a complete fictional map and itinerary.</p>'+link(PAGE, 'Open Unit 6'))))
grid.xpath('./article[h3="Course Overview"]/p')[0].text = 'See the complete six-unit explanation route, from Making Friends to Around Town.'
grid.xpath('./article[h3="Expressions in context"]/p')[0].text = 'Explore the meaning, use and pronunciation of expressions from Units 1, 2, 3, 4, 5 and 6.'
write('index.html', doc)

doc = read('expressions.html')
doc.xpath('//meta[@name="description"]')[0].set('content', 'Phrasal verbs and idioms from Units 1, 2, 3, 4, 5 and 6 with individual audio, meaning, register and contextual examples.')
doc.xpath('.//*[@class="eyebrow"]')[0].text = 'Units 1, 2, 3, 4, 5 and 6 · Expression library'
doc.xpath('.//div[contains(@class,"pi-hero-copy")]/p[not(@class="eyebrow")]')[0].text = 'Understand each expression through its meaning, register and complete example. Audio models connect the expressions with the situations explained in each unit.'
actions = doc.xpath('.//div[contains(@class,"hero-actions")]')[0]
actions.clear(keep_tail=True)
actions.set('class', 'hero-actions pi-actions')
actions.extend(html.fragments_fromstring(link('unit-1-making-friends.html#social-expressions', 'Unit 1 expressions')+link('unit-2-interests-hobbies.html#hobby-expressions', 'Unit 2 expressions', True)+link('unit-3-healthy-living.html#healthy-expressions', 'Unit 3 expressions', True)+link('unit-4-celebrations-festivals.html#celebration-expressions', 'Unit 4 expressions', True)+link('unit-5-childhood-memories.html#memory-expressions', 'Unit 5 expressions', True)+link(PAGE+'#town-expressions', 'Unit 6 expressions', True)))
shell = doc.xpath('.//div[@class="pi-shell"]')[0]
old = doc.get_element_by_id('unit-6-expressions', None)
if old is not None:
    old.getparent().remove(old)
library_html = expressions_html.replace('<h4>', '<h3>').replace('</h4>', '</h3>')
shell.append(fragment('<details class="pi-topic" id="unit-6-expressions"><summary><span class="pi-number">06</span><h2>Around Town</h2></summary><div class="pi-topic-body"><p class="pi-goal">Understand five expressions for exploring a town, transport and nearby places.</p>'+controls()+library_html+'</div></details>'))
write('expressions.html', doc, 'all')

combined = {}
for unit in (1, 2, 3, 4, 5):
    combined.update(json.loads((COURSE/f'audio/unit{unit}/lesson/audio-manifest.json').read_text()))
combined.update(audios)
for name, data in [('unit6', audios), ('all', combined)]:
    (ROOT/f'assets/js/preintermediate1-{name}-audio-data.js').write_text('window.Preintermediate1Audio = '+json.dumps(data, ensure_ascii=False, indent=2)+';\n')
audio_dir = COURSE/'audio/unit6/lesson'
audio_dir.mkdir(parents=True, exist_ok=True)
(audio_dir/'audio-manifest.json').write_text(json.dumps(audios, ensure_ascii=False, indent=2)+'\n')
(audio_dir/'scripts.md').write_text('# Preintermediate 1 Unit 6 exact teaching audio\n\n'+'\n\n'.join(f'## {key}\nFile: `{key}.mp3`\n\n{item["voice"]}: {item["text"]}' for key, item in audios.items())+'\n')

try:
    import qrcode
except ModuleNotFoundError:
    sys.path.insert(0, str(ROOT/'tmp/unit5-explanation/python-deps'))
    import qrcode
import qrcode.image.svg
qrcode.make('https://www.jaralingua.com/ingles/preintermedio-1/'+PAGE, image_factory=qrcode.image.svg.SvgPathImage, box_size=10, border=4).save(ROOT/'assets/img/page-qr/ingles-preintermedio-1-unit-6-around-town.svg')
print(f'Built Unit 6 theory: {len(clusters)} blocks, {len(topics)} topics and {len(audios)} exact audio models; updated course access and expression library.')
