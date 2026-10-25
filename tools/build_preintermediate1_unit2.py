"""Build Unit 2 and idempotently connect it to the existing course pages.

Unit 1 remains the source of the shared Basic 2 shell. No audio API calls occur
here: the canonical scripts are generated for the existing ElevenLabs pipeline.
"""
import copy
import json
import sys
from pathlib import Path

from lxml import html
from preintermediate1_unit2_content import audios, topics, clusters, expressions_html

ROOT = Path(__file__).resolve().parents[1]
COURSE = ROOT / 'ingles/preintermedio-1'
VERSION = '20261024-unit2'
PAGE = 'unit-2-interests-hobbies.html'
IMAGE = '/assets/img/english-preintermediate-1/unit-2/interests-hobbies-hero.webp'
UNIT1 = json.loads((COURSE/'audio/unit1/lesson/audio-manifest.json').read_text())


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


doc = read('unit-1-making-friends.html')
doc.find('.//title').text = 'Unit 2 Interests and Hobbies | JaraLingua'
doc.xpath('//meta[@name="description"]')[0].set('content', 'Explore hobbies, object pronouns, abilities, crafts, sports and nature with detailed explanations and professional audio.')
main = doc.find('.//main')
hero = copy.deepcopy(main[0])
hero.set('style', '--hero-image:url('+IMAGE+')')
hero.xpath('.//*[@class="eyebrow"]')[0].text = 'Preintermediate English Course 1 · Unit 2'
hero.xpath('.//h1')[0].text = 'Interests and Hobbies'
hero.xpath('.//div[contains(@class,"pi-hero-copy")]/p[not(@class="eyebrow")]')[0].text = 'Explore music, crafts, sports and the natural world. Describe your interests, explain what you can do and connect with a hobby group.'
actions = hero.xpath('.//div[contains(@class,"hero-actions")]')[0]
actions.clear(keep_tail=True)
actions.set('class', 'hero-actions pi-actions')
actions.extend(html.fragments_fromstring(link('#free-time','Start the explanation')+link('course-overview.html#unit-2','Course Overview',True)))
image = hero.xpath('.//figure//img')[0]
image.set('src', IMAGE)
image.set('alt', 'Adult hobby group making bead bracelets and a wooden craft, with a guitar and hiking backpack nearby')
image.set('width', '1536')
image.set('height', '1024')
main.clear(keep_tail=True)
main.set('id','main-content')
main.append(hero)
overview = '<section class="pi-objective"><h2>What you will be able to do</h2><p>Describe interests and abilities, use object pronouns with a clear reference, explain a simple project, ask for practical information and introduce a hobby group.</p><div class="pi-route"><span>Sessions 3–5 · 9 hours</span><span>01 · Leisure and music</span><span>02 · Crafts and sports</span><span>03 · Nature</span><span>04 · Hobby groups</span></div></section>'
overview += '<details class="pi-quick"><summary>Explore the unit topics</summary><nav aria-label="Unit topics">'+''.join(f'<a href="#{s["id"]}">{s["title"]}</a>' for s in topics)+'</nav></details><p class="pi-intro">Open a block, then a topic. Each topic explains what we will learn and provides examples. Tap a highlighted model to hear it. The main new grammar is object pronouns; the other structures connect with language from Basic 2 and Unit 1.</p>'
blocks = []
for n, slug, title, goal in clusters:
    nested = []
    for i, t in enumerate((t for t in topics if t['group']==n),1):
        nested.append(f'<details class="pi-topic pi-subtopic" id="{t["id"]}"><summary><span class="pi-number">{n}.{i}</span><h3>{t["title"]}</h3></summary><div class="pi-topic-body"><p class="pi-goal"><b>What we will learn:</b> {t["goal"]}</p>{controls() if t["id"]!="unit-2-summary" else ""}{t["body"]}</div></details>')
    blocks.append(f'<details class="pi-topic pi-cluster" id="{slug}"><summary><span class="pi-number">{n:02}</span><h2>{title}</h2></summary><div class="pi-cluster-body"><p class="pi-goal">{goal}</p>{"".join(nested)}</div></details>')
main.append(fragment('<div class="pi-shell">'+overview+''.join(blocks)+'</div>'))
write(PAGE,doc,'unit2')

# Upgrade the Unit 2 entry while leaving the rest of the course route intact.
doc = read('course-overview.html')
doc.xpath('.//p[@class="pi-intro"]')[0].text = 'Six units lead to classroom tasks. The explanations for Units 1 and 2 are available. Open a unit to explore its topics; the remaining units show the route as their materials are developed.'
entry = fragment('<details class="pi-topic" id="unit-2"><summary><span class="pi-number">02</span><h2>Interests and Hobbies</h2></summary><div class="pi-topic-body"><p class="pi-goal">Sessions 3–5 · 9 hours</p><p>Explore music, sports, handmade projects and the natural world. The main new grammar is object pronouns, with abilities and familiar present-tense forms in context.</p><div class="pi-grid">'+''.join(card(title,'<p>'+goal+'</p>'+link(PAGE+'#'+slug,'Explore this block',True)) for _,slug,title,goal in clusters)+'</div><div class="pi-actions">'+link(PAGE,'Open the full unit')+link('expressions.html#unit-2-expressions','Explore Unit 2 expressions',True)+'</div></div></details>')
old = doc.get_element_by_id('unit-2',None)
if old is None:
    old = doc.xpath('//article[contains(@class,"pi-planned")][div/h2="Interests and Hobbies"]')[0]
old.getparent().replace(old,entry)
write('course-overview.html',doc)

# Course home is owned by the final dashboard builder.

doc = read('expressions.html')
doc.find('.//title').text = 'Expressions in Context Preintermediate 1 | JaraLingua'
doc.xpath('//meta[@name="description"]')[0].set('content','Phrasal verbs and idiomatic expressions from Units 1 and 2 with individual audio and contextual examples.')
doc.xpath('.//*[@class="eyebrow"]')[0].text = 'Units 1 and 2 · Expression library'
doc.xpath('.//h1')[0].text = 'Expressions in context'
actions=doc.xpath('.//div[contains(@class,"hero-actions")]')[0]
actions.clear(keep_tail=True)
actions.set('class','hero-actions pi-actions')
actions.extend(html.fragments_fromstring(link('unit-1-making-friends.html#social-expressions','Unit 1 expressions')+link(PAGE+'#hobby-expressions','Unit 2 expressions',True)))
shell=doc.xpath('.//div[@class="pi-shell"]')[0]
if doc.get_element_by_id('unit-1-expressions',None) is None:
    folder=fragment('<details class="pi-topic" id="unit-1-expressions"><summary><span class="pi-number">01</span><h2>Making Friends</h2></summary><div class="pi-topic-body"></div></details>')
    body=folder.xpath('.//div[@class="pi-topic-body"]')[0]
    for child in list(shell)[1:]:
        body.append(child)
    shell.append(folder)
old=doc.get_element_by_id('unit-2-expressions',None)
if old is not None:
    old.getparent().remove(old)
library_html=expressions_html.replace('<h4>','<h3>').replace('</h4>','</h3>')
shell.append(fragment('<details class="pi-topic" id="unit-2-expressions"><summary><span class="pi-number">02</span><h2>Interests and Hobbies</h2></summary><div class="pi-topic-body"><p class="pi-goal">Understand the meaning and use of five expressions for hobbies.</p>'+controls()+library_html+'</div></details>'))
write('expressions.html',doc,'all')

for name, data in [('unit2',audios),('all',{**UNIT1,**audios})]:
    (ROOT/f'assets/js/preintermediate1-{name}-audio-data.js').write_text('window.Preintermediate1Audio = '+json.dumps(data,ensure_ascii=False,indent=2)+';\n')
audio_dir=COURSE/'audio/unit2/lesson'
audio_dir.mkdir(parents=True,exist_ok=True)
(audio_dir/'audio-manifest.json').write_text(json.dumps(audios,ensure_ascii=False,indent=2)+'\n')
(audio_dir/'scripts.md').write_text('# Preintermediate 1 Unit 2 exact teaching audio\n\n'+'\n\n'.join(f'## {key}\nFile: `{key}.mp3`\n\n{item["voice"]}: {item["text"]}' for key,item in audios.items())+'\n')

try:
    import qrcode
except ModuleNotFoundError:
    sys.path.insert(0,str(ROOT/'tmp/unit5-explanation/python-deps'))
    import qrcode
import qrcode.image.svg
qrcode.make('https://www.jaralingua.com/ingles/preintermedio-1/'+PAGE,image_factory=qrcode.image.svg.SvgPathImage,box_size=10,border=4).save(ROOT/'assets/img/page-qr/ingles-preintermedio-1-unit-2-interests-hobbies.svg')
print(f'Built Unit 2: {len(clusters)} blocks, {len(topics)} topics and {len(audios)} exact audio models; connected overview, home and expression library.')

# Keep the next explanation connected when rebuilding earlier units.
unit3_builder = ROOT / "tools/build_preintermediate1_unit3.py"
if unit3_builder.exists():
    import runpy
    runpy.run_path(str(unit3_builder), run_name="__main__")
