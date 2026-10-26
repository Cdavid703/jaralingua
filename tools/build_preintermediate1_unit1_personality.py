"""Build only activity 1/8; preserve the published stories and other units."""
import copy
import json
import sys
from pathlib import Path
from html import escape
from lxml import html
from preintermediate1_unit1_personality_content import WORDS, MATCHES, PICTURES, PLAN

ROOT = Path(__file__).resolve().parents[1]
COURSE = ROOT / 'ingles/preintermedio-1'
NAME = 'vocabulary-unit-1-personality.html'
MEDIA = '/assets/img/english-preintermediate-1/unit-1/practice/personality-vocabulary/'
PDF = 'materials/22-describing-personality-original.pdf'
VERSION = '20261026-personality-1'
STYLE_VERSION = '20261026-personality-compact'

def fragment(text):
    return html.fragment_fromstring(text)

def write(name, doc):
    (COURSE / name).write_text('<!doctype html>\n' + html.tostring(doc, encoding='unicode', method='html') + '\n', encoding='utf-8')

def options():
    return '<option value="">Choose…</option>' + ''.join(f'<option value="{w}">{w}</option>' for w in WORDS)

models = {}
for word in WORDS:
    folder = 'lesson' if word in ['friendly', 'creative', 'shy', 'talkative'] else 'personality-vocabulary'
    models[word] = dict(text=word, path=f'/ingles/preintermedio-1/audio/unit1/{folder}/{word}.mp3')

def bank():
    return '<div class="pv-wordbank" aria-label="Word box">' + ''.join(f'<button type="button" data-audio="{w}" aria-label="Listen to {w}"><span aria-hidden="true">▷</span> {w}</button>' for w in WORDS) + '</div>'

def task(number, title, instruction, cards):
    exercise = f'<div class="pv-grid">{cards}</div>'
    if number == 1:
        exercise = f'<div class="pv-meaning-layout">{exercise}<img class="pv-original-decoration" src="{MEDIA}word-task-illustration.webp" width="853" height="861" alt="" loading="lazy"></div>'
    else:
        exercise += f'<img class="pv-picture-decoration" src="{MEDIA}picture-task-illustration.webp" width="1051" height="464" alt="" loading="lazy">'
    return f'''<details class="pi-topic pv-task" id="task-{number}"><summary><span class="pi-number">0{number}</span><h2>{title}</h2></summary><div class="pi-topic-body"><p class="pv-original-instruction">{instruction}</p>{bank()}<p data-audio-status role="status" aria-live="polite">Choose a word to listen.</p><form data-task="{number}" novalidate><p class="pv-count" role="status" aria-live="polite">0 of 9 answered.</p>{exercise}<div class="pi-actions"><button type="submit" class="btn btn-primary">Check answers</button><button type="button" data-reset class="btn btn-secondary">Start again</button></div><p class="pv-result" role="status" aria-live="polite" tabindex="-1" hidden></p></form></div></details>'''

cards1 = ''.join(f'<div class="pv-question"><label for="match-{i}"><span class="pv-item-number">{i}.</span> {escape(prompt)}</label><select id="match-{i}" name="q{i}" required aria-describedby="match-feedback-{i}">{options()}</select><p class="pv-feedback" id="match-feedback-{i}" hidden></p></div>' for i, (prompt, _, _) in enumerate(MATCHES, 1))
cards2 = ''.join(f'<div class="pv-question pv-picture"><figure><img src="{MEDIA}picture-{i:02}.webp" alt="{escape(alt)}" width="{size[0]}" height="{size[1]}" loading="lazy" decoding="async"></figure><label for="picture-{i}"><span class="pv-item-number">{i}.</span> Picture {i}</label><select id="picture-{i}" name="q{i}" required aria-describedby="picture-feedback-{i}">{options()}</select><p class="pv-feedback" id="picture-feedback-{i}" hidden></p></div>' for i, ((alt, _, _, _), size) in enumerate(zip(PICTURES, [(291,340),(220,340),(293,340),(240,480),(542,340),(480,480),(268,340),(495,480),(339,340)]), 1))

doc = html.document_fromstring((COURSE / 'reading-unit-1-first-connections.html').read_text())
doc.find('.//title').text = 'Personality Vocabulary | Preintermediate English Course 1'
description = 'Learn nine personality adjectives through the original word-matching and picture exercises from Describing Personality.'
doc.xpath('//meta[@name="description"]')[0].set('content', description)
head = doc.find('.//head')
# Put activity styles before the final shared responsive layer.
head.insert(list(head).index(doc.xpath('//link[contains(@href,"course-responsive.css")]')[0]), fragment(f'<link rel="stylesheet" href="/assets/css/preintermediate1-personality-vocabulary.css?v={STYLE_VERSION}">'))
body = doc.find('.//body'); body.set('class', 'english-basic-page basic2-page preinter-page pi-practice-page pv-page')
for el in body.xpath('./script[@id="pi-connected-data"] | ./script[contains(@src,"first-visit-vocabulary")] | ./script[contains(@src,"preintermediate1-connected")] | ./audio'):
    body.remove(el)
main = doc.find('.//main'); hero = copy.deepcopy(main[0]); main.clear(); main.set('id','main-content')
hero.set('style', f'--hero-image:url({MEDIA}cover.webp)')
hero.xpath('.//p[@class="eyebrow"]')[0].text = 'Practice Lab · Unit 1 · Vocabulary'
hero.xpath('.//h1')[0].text = 'Personality Vocabulary'
hero.xpath('.//div[contains(@class,"pi-hero-copy")]/p[not(@class="eyebrow")]')[0].text = description
actions = hero.xpath('.//div[contains(@class,"hero-actions")]')[0];actions.clear();actions.set('class','hero-actions pi-actions')
actions.extend(html.fragments_fromstring(f'<a class="btn btn-primary" href="#task-1">Start vocabulary</a><a class="btn btn-secondary" href="{PDF}" download="22 - Describing Personality.pdf">Download original PDF</a><a class="btn btn-secondary" href="practice-lab.html#unit-1-personality">Practice Lab</a>'))
img = hero.xpath('.//figure/img')[0];img.set('src',MEDIA+'cover.webp');img.set('alt','Three adult classmates sharing ideas around a classroom table');img.set('width','1600');img.set('height','800')
main.append(hero)
content = '''<section class="pi-objective pv-intro"><p class="pi-label">Describing Personality · ESL Pals · Pages 1–2</p><h2>Your learning goal</h2><p>Identify nine personality adjectives and connect them to meanings and pictures.</p><div class="pi-route"><span>15–20 minutes</span><span>9 words · 2 tasks</span><span>Practice · no official grade</span></div><p class="pi-small">Check your answers and try again. Explanations appear after two different complete attempts, or when all answers are accepted. Your draft stays in this browser tab.</p><div class="pi-audio-controls"><span>Word audio</span><button type="button" data-speed="0.75" aria-pressed="false">0.75×</button><button type="button" data-speed="1" aria-pressed="true">1.0×</button><button type="button" data-speed="1.25" aria-pressed="false">1.25×</button><button type="button" data-stop>Stop audio</button></div><p data-audio-status class="pv-audio-status" role="status" aria-live="polite">Tap a word in either task to hear it.</p><p id="pv-storage-status" class="pi-small" role="status" hidden></p></section>
<details class="pi-topic" id="warm-up"><summary><span class="pi-number">☀</span><h2>Warm up · Weather</h2></summary><div class="pi-topic-body"><p>What is the weather like in your city today? Do you like it? Explain.</p><p class="pv-weather">sunny · rainy · snowy · cloudy</p><label for="pv-warmup">Your answer (optional)</label><textarea id="pv-warmup" rows="2" maxlength="1500" placeholder="Write your answer or discuss it with a classmate."></textarea></div></details>'''
content += task(1, 'Task 1 · Match the words', 'Match the words to their box to their synonyms.', cards1)
content += task(2, 'Task 2 · Match the pictures', 'Choose a picture that matches one of the words from the box.', cards2)
content += f'''<section class="pi-objective pv-download pv-footer" id="paper-version"><div><h2>Original PDF · 10 pages</h2><p>This activity uses pages 1–2. Download the complete worksheet to work on paper.</p><p class="pi-small">Worksheet and original illustrations: ESL Pals, <cite>Describing Personality</cite>. PDF provided unchanged.</p></div><div class="pi-actions"><a class="btn btn-primary" href="{PDF}" download="22 - Describing Personality.pdf">Download original PDF</a><a class="btn btn-secondary" href="practice-lab.html#unit-1-personality">Unit 1 activities · 1 of 8 ready</a></div></section><noscript><p class="pi-objective">Enable JavaScript to check answers and play word audio, or download the original PDF to work on paper.</p></noscript>'''
main.append(fragment('<div class="pi-shell">' + content + '</div>'))
warmup = doc.get_element_by_id('warm-up').xpath('.//p[@class="pv-weather"]')[0]
weather = '<div class="pv-weather-pictures">' + ''.join(f'<figure><img src="{MEDIA}{w}.webp" alt="{w}" width="{size[0]}" height="{size[1]}" loading="lazy"><figcaption>{w}</figcaption></figure>' for w,size in [('sunny',(399,340)),('rainy',(364,340)),('snowy',(409,340)),('cloudy',(367,340))]) + '</div>'
warmup.getparent().replace(warmup,fragment(weather))
paper = doc.get_element_by_id('paper-version')
originals = '<details class="pi-topic" id="original-pages"><summary><span class="pi-number">PDF</span><h2>View the original worksheet · Pages 1–2</h2></summary><div class="pi-topic-body"><p>The exact original pages, with all their illustrations, instructions and layout.</p>' + ''.join(f'<figure class="pv-original-page"><img src="{MEDIA}original-page-{n}.webp" width="1275" height="1800" alt="Original Describing Personality worksheet, page {n}. The exercises are transcribed above." loading="lazy"><figcaption>ESL Pals · Describing Personality · Page {n}</figcaption></figure>' for n in [1,2]) + '</div></details>'
paper.addprevious(fragment(originals))
data = html.Element('script', id='pv-data', type='application/json')
data.text = json.dumps({'words':WORDS,'tasks':{
    '1':[dict(answer=answer,accepted=[answer],explanation=explanation) for _,answer,explanation in MATCHES],
    '2':[dict(answer=answer,accepted=accepted,explanation=explanation) for _,answer,accepted,explanation in PICTURES]
}},ensure_ascii=False).replace('<','\\u003c');body.append(data)
audio_data = html.Element('script');audio_data.text='window.Preintermediate1Audio = '+json.dumps(models)+';';body.append(audio_data)
for src in ['/assets/js/preintermediate1-lesson.js?v=20261024-connected-unit1','/assets/js/preintermediate1-personality-vocabulary.js?v='+VERSION]:
    body.append(fragment('<script src="'+src+'"></script>'))
write(NAME,doc)

lab = html.document_fromstring((COURSE / 'practice-lab.html').read_text())
lab_body = lab.find('.//body')
if 'pv-lab' not in lab_body.get('class','').split(): lab_body.set('class',lab_body.get('class','')+' pv-lab')
if not lab.xpath('//link[contains(@href,"preintermediate1-personality-vocabulary.css")]'):
    lab_head = lab.find('.//head')
    lab_head.insert(list(lab_head).index(lab.xpath('//link[contains(@href,"course-responsive.css")]')[0]), fragment(f'<link rel="stylesheet" href="/assets/css/preintermediate1-personality-vocabulary.css?v={STYLE_VERSION}">'))
unit = lab.get_element_by_id('unit-1').xpath('./div[contains(@class,"pi-topic-body")]')[0]
# Keep the two live story cards. Replace only the obsolete Unit 1 future-activity list.
for previous in unit.xpath('.//*[@id="unit-1-personality"] | .//section[contains(@class,"pi-practice-pending")]'):
    previous.getparent().remove(previous)
unit.xpath('./p[contains(@class,"pi-goal")]')[0].text='Sessions 1–2 · 6 hours of class · 3 activities available'
for layout in unit.xpath('./div[contains(@class,"pi-practice-unit-layout")]'):
    layout.set('class', 'pi-unit1-stories')
pending = ''.join(f'<li><div><strong>{escape(title)}</strong><span>{escape(kind)}</span></div><span class="pi-small" lang="es">En preparación</span></li>' for title,kind in PLAN[1:])
unit.append(fragment(f'''<details class="pi-topic" id="unit-1-personality"><summary><span class="pi-number">+</span><h3>Describing Personality · 1 of 8 activities ready</h3></summary><div class="pi-topic-body"><p>Explore the worksheet one activity at a time. Download the original PDF from the first activity.</p><div class="pi-section-grid"><article class="course-section-card"><div class="course-section-image"><img src="{MEDIA}cover.webp" alt="Adult classmates sharing ideas" width="1600" height="800" loading="lazy" decoding="async"></div><div class="course-section-content"><span class="section-number">01</span><span class="course-status course-status-available">Vocabulary · Available now</span><h3>Personality Vocabulary</h3><p>Nine adjectives, word matching and the nine original worksheet pictures. Includes pronunciation and a printable PDF.</p><a class="card-link" href="{NAME}">Open vocabulary activity</a></div></article></div><section class="pi-practice-pending"><h3 class="pi-model-heading">Next activities · en preparación</h3><ol class="pi-planned-activities" start="2">{pending}</ol></section></div></details>'''))
lab.xpath('//section[@class="pi-objective"]/p')[0].text='Units 1–6 each have a connected listening and reading story. Unit 1 also includes Personality Vocabulary, the first of eight Describing Personality activities.'
write('practice-lab.html',lab)

try:
    import qrcode
except ModuleNotFoundError:
    sys.path.insert(0,str(ROOT/'tmp/unit5-explanation/python-deps'))
    import qrcode
import qrcode.image.svg
qrcode.make('https://www.jaralingua.com/ingles/preintermedio-1/'+NAME,image_factory=qrcode.image.svg.SvgPathImage,box_size=10,border=4).save(ROOT/'assets/img/page-qr'/('ingles-preintermedio-1-'+NAME.removesuffix('.html')+'.svg'))
print('Built Personality Vocabulary: 9 meanings, 9 original pictures, original PDF and Unit 1 navigation. Activities 2–8 remain pending.')
