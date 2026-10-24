"""Build Healthy Living theory and connect the three available explanations."""
import copy
import json
import sys
from pathlib import Path

from lxml import html
from preintermediate1_unit3_content import audios, topics, clusters, expressions_html

ROOT = Path(__file__).resolve().parents[1]
COURSE = ROOT / 'ingles/preintermedio-1'
VERSION = '20261024-unit3-theory'
PAGE = 'unit-3-healthy-living.html'
IMAGE = '/assets/img/english-preintermediate-1/unit-3/healthy-living-hero.webp'


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


doc = read('unit-2-interests-hobbies.html')
doc.find('.//title').text = 'Unit 3 Healthy Living | JaraLingua'
doc.xpath('//meta[@name="description"]')[0].set('content', 'Understand habits, temporary changes, advice, suggestions, obligations and intentions through explained English models and professional audio.')
main = doc.find('.//main')
hero = copy.deepcopy(main[0])
hero.set('style', '--hero-image:url('+IMAGE+')')
hero.xpath('.//*[@class="eyebrow"]')[0].text = 'Preintermediate English Course 1 · Unit 3'
hero.xpath('.//h1')[0].text = 'Healthy Living'
hero.xpath('.//div[contains(@class,"pi-hero-copy")]/p[not(@class="eyebrow")]')[0].text = 'Understand everyday habits, describe how people feel and explore the language of recommendations. Connect routines, temporary changes and personal intentions.'
actions = hero.xpath('.//div[contains(@class,"hero-actions")]')[0]
actions.clear(keep_tail=True)
actions.set('class', 'hero-actions pi-actions')
actions.extend(html.fragments_fromstring(link('#everyday-habits', 'Start the explanation')+link('course-overview.html#unit-3', 'Course Overview', True)))
image = hero.xpath('.//figure//img')[0]
image.set('src', IMAGE)
image.set('alt', 'Three adult friends pausing beside a park bench during a walk, with a water bottle and notebook')
image.set('width', '1536')
image.set('height', '1024')
main.clear(keep_tail=True)
main.set('id', 'main-content')
main.append(hero)
overview = '<section class="pi-objective"><h2>What you will be able to do</h2><p>Understand habits and temporary changes, describe feelings, distinguish advice from obligation, and explain a personal intention using the language in the models.</p><div class="pi-route"><span>Sessions 6–8 · 9 hours</span><span>01 · Habits and eating</span><span>02 · Recommendations</span><span>03 · Stress and relaxation</span><span>04 · Language in context</span></div></section>'
overview += '<details class="pi-quick"><summary>Explore the unit topics</summary><nav aria-label="Unit topics">'+''.join(f'<a href="#{t["id"]}">{t["title"]}</a>' for t in topics)+'</nav></details><p class="pi-intro">Each topic contains an explanation, visual comparisons and complete examples. Highlighted words and sentences have individual audio models. Routines and temporary changes connect with Unit 2; this unit develops advice, suggestions, necessity and intentions.</p>'
blocks = []
for n, slug, title, goal in clusters:
    nested = []
    for i, t in enumerate((t for t in topics if t['group'] == n), 1):
        nested.append(f'<details class="pi-topic pi-subtopic" id="{t["id"]}"><summary><span class="pi-number">{n}.{i}</span><h3>{t["title"]}</h3></summary><div class="pi-topic-body"><p class="pi-goal"><b>What we will learn:</b> {t["goal"]}</p>{controls() if t["id"] != "unit-3-summary" else ""}{t["body"]}</div></details>')
    blocks.append(f'<details class="pi-topic pi-cluster" id="{slug}"><summary><span class="pi-number">{n:02}</span><h2>{title}</h2></summary><div class="pi-cluster-body"><p class="pi-goal">{goal}</p>{"".join(nested)}</div></details>')
main.append(fragment('<div class="pi-shell">'+overview+''.join(blocks)+'</div>'))
write(PAGE, doc, 'unit3')

doc = read('course-overview.html')
doc.xpath('.//p[@class="pi-intro"]')[0].text = 'The explanations for Units 1, 2 and 3 are available. Open a unit to explore its vocabulary, grammar and explained models. The remaining units show the route as their explanations are developed.'
entry = fragment('<details class="pi-topic" id="unit-3"><summary><span class="pi-number">03</span><h2>Healthy Living</h2></summary><div class="pi-topic-body"><p class="pi-goal">Sessions 6–8 · 9 hours</p><p>Understand habits, temporary changes and feelings. Explore advice, suggestions, necessity, habitual situations and personal intentions.</p><div class="pi-grid">'+''.join(card(title, '<p>'+goal+'</p>'+link(PAGE+'#'+slug, 'Explore this block', True)) for _, slug, title, goal in clusters)+'</div><div class="pi-actions">'+link(PAGE, 'Open the full unit')+link('expressions.html#unit-3-expressions', 'Explore Unit 3 expressions', True)+'</div></div></details>')
old = doc.get_element_by_id('unit-3', None)
if old is None:
    old = doc.xpath('//article[contains(@class,"pi-planned")][div/h2="Healthy Living"]')[0]
old.getparent().replace(old, entry)
write('course-overview.html', doc)

doc = read('index.html')
doc.xpath('.//div[contains(@class,"pi-hero-copy")]/p[not(@class="eyebrow")]')[0].text = 'Explore the language of everyday life through Making Friends, Interests and Hobbies, and Healthy Living. Each unit connects clear explanations with complete audio models.'
doc.xpath('.//section[@class="pi-objective"]/p')[0].text = 'Explore how people connect, describe interests and discuss daily habits. The three available explanations combine vocabulary, grammar and models in context.'
grid = doc.xpath('.//div[@class="pi-shell"]/div[@class="pi-grid"]')[0]
for el in grid.xpath('./article[h3="Unit 3 Healthy Living"]'):
    grid.remove(el)
grid.insert(3, fragment(card('Unit 3 Healthy Living', '<p>Habits, feelings, advice, suggestions, obligations and intentions, explained in context.</p>'+link(PAGE, 'Open Unit 3'))))
grid.xpath('./article[h3="Course Overview"]/p')[0].text = 'See the six-unit route and explore the explanations for Units 1, 2 and 3.'
grid.xpath('./article[h3="Expressions in context"]/p')[0].text = 'Explore the meaning, use and pronunciation of expressions from Units 1, 2 and 3.'
write('index.html', doc)

doc = read('expressions.html')
doc.xpath('//meta[@name="description"]')[0].set('content', 'Phrasal verbs and idioms from Units 1, 2 and 3 with individual audio, meaning, register and contextual examples.')
doc.xpath('.//*[@class="eyebrow"]')[0].text = 'Units 1, 2 and 3 · Expression library'
doc.xpath('.//div[contains(@class,"pi-hero-copy")]/p[not(@class="eyebrow")]')[0].text = 'Understand each expression through its meaning, register and complete example. Audio models connect the expressions with the situations explained in each unit.'
actions = doc.xpath('.//div[contains(@class,"hero-actions")]')[0]
actions.clear(keep_tail=True)
actions.set('class', 'hero-actions pi-actions')
actions.extend(html.fragments_fromstring(link('unit-1-making-friends.html#social-expressions', 'Unit 1 expressions')+link('unit-2-interests-hobbies.html#hobby-expressions', 'Unit 2 expressions', True)+link(PAGE+'#healthy-expressions', 'Unit 3 expressions', True)))
shell = doc.xpath('.//div[@class="pi-shell"]')[0]
old = doc.get_element_by_id('unit-3-expressions', None)
if old is not None:
    old.getparent().remove(old)
library_html = expressions_html.replace('<h4>', '<h3>').replace('</h4>', '</h3>')
shell.append(fragment('<details class="pi-topic" id="unit-3-expressions"><summary><span class="pi-number">03</span><h2>Healthy Living</h2></summary><div class="pi-topic-body"><p class="pi-goal">Understand five expressions for habits, feelings and rest.</p>'+controls()+library_html+'</div></details>'))
write('expressions.html', doc, 'all')

combined = {}
for unit in (1, 2):
    combined.update(json.loads((COURSE/f'audio/unit{unit}/lesson/audio-manifest.json').read_text()))
combined.update(audios)
for name, data in [('unit3', audios), ('all', combined)]:
    (ROOT/f'assets/js/preintermediate1-{name}-audio-data.js').write_text('window.Preintermediate1Audio = '+json.dumps(data, ensure_ascii=False, indent=2)+';\n')
audio_dir = COURSE/'audio/unit3/lesson'
audio_dir.mkdir(parents=True, exist_ok=True)
(audio_dir/'audio-manifest.json').write_text(json.dumps(audios, ensure_ascii=False, indent=2)+'\n')
(audio_dir/'scripts.md').write_text('# Preintermediate 1 Unit 3 exact teaching audio\n\n'+'\n\n'.join(f'## {key}\nFile: `{key}.mp3`\n\n{item["voice"]}: {item["text"]}' for key, item in audios.items())+'\n')

try:
    import qrcode
except ModuleNotFoundError:
    sys.path.insert(0, str(ROOT/'tmp/unit5-explanation/python-deps'))
    import qrcode
import qrcode.image.svg
qrcode.make('https://www.jaralingua.com/ingles/preintermedio-1/'+PAGE, image_factory=qrcode.image.svg.SvgPathImage, box_size=10, border=4).save(ROOT/'assets/img/page-qr/ingles-preintermedio-1-unit-3-healthy-living.svg')
print(f'Built Unit 3 theory: {len(clusters)} blocks, {len(topics)} topics and {len(audios)} exact audio models; updated course access and expression library.')

# Preserve the latest explanation when rebuilding earlier course pages.
unit4_builder = ROOT / "tools/build_preintermediate1_unit4.py"
if unit4_builder.exists():
    import runpy
    runpy.run_path(str(unit4_builder), run_name="__main__")
