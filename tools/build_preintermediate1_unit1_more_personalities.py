"""Build the final approved ESL Pals activity, original pages 9–10."""
import copy
import json
import sys
from html import escape
from pathlib import Path
from lxml import html
from preintermediate1_unit1_more_personalities_content import INSTRUCTION, PROFILES, TRUE_FALSE, WHO, VOCABULARY

ROOT = Path(__file__).resolve().parents[1]
COURSE = ROOT / 'ingles/preintermedio-1'
NAME = 'reading-unit-1-more-personalities.html'
PREV = 'writing-unit-1-my-personality.html'
MEDIA = '/assets/img/english-preintermediate-1/unit-1/practice/more-personalities/'
AUDIO = '/ingles/preintermedio-1/audio/unit1/more-personalities/'
PDF = 'materials/22-describing-personality-original.pdf'
VERSION = '20261103-more-personalities-1'


def fragment(text): return html.fragment_fromstring(text)
def write(name, doc): (COURSE / name).write_text('<!doctype html>\n' + html.tostring(doc, encoding='unicode', method='html') + '\n')


doc = html.document_fromstring((COURSE / 'course-overview.html').read_text())
description = 'Read five more original personality profiles. Complete the describing words, True or False and Who is it? activities.'
doc.find('.//title').text = 'Case Study: More Personalities | Preintermediate English Course 1'
doc.xpath('//meta[@name="description"]')[0].set('content', description)
doc.xpath('//link[contains(@href,"course-responsive.css")]')[0].addprevious(fragment(f'<link rel="stylesheet" href="/assets/css/preintermediate1-more-personalities.css?v={VERSION}">'))
body = doc.find('.//body'); body.set('class', 'english-basic-page basic2-page preinter-page pi-practice-page pi-connected-page mx-page')
for script in body.xpath('./script[contains(@src,"preintermediate1-")]'): body.remove(script)
for link in doc.xpath('//header//a[@aria-current]'): link.attrib.pop('aria-current', None)
doc.xpath('//header//ul[contains(@class,"nav-links")]')[0].append(fragment('<li><a href="practice-lab.html">Practice Lab</a></li>'))
main = doc.find('.//main'); hero = copy.deepcopy(main[0]); main.clear(); main.set('id', 'main-content')
hero.set('style', f'--hero-image:url({MEDIA}cover.webp)')
hero.xpath('.//p[@class="eyebrow"]')[0].text = 'Practice Lab · Unit 1 · Reading Extension'
hero.xpath('.//h1')[0].text = 'Case Study: More Personalities'
hero.xpath('.//div[contains(@class,"pi-hero-copy")]/p[not(@class="eyebrow")]')[0].text = description
actions = hero.xpath('.//div[contains(@class,"hero-actions")]')[0]; actions.clear(); actions.set('class', 'hero-actions pi-actions')
actions.extend(html.fragments_fromstring(f'<a class="btn btn-primary" href="#case-study">Start reading</a><a class="btn btn-secondary" href="{PDF}" download="22 - Describing Personality.pdf">Download original PDF</a><a class="btn btn-secondary" href="practice-lab.html#unit-1-personality">Unit 1 activities</a>'))
image = hero.xpath('.//figure/img')[0]; image.set('src', MEDIA + 'cover.webp'); image.set('alt', 'Two fictional adult podcast hosts sharing a creative, friendly moment in a studio'); image.set('width', '1600'); image.set('height', '800'); main.append(hero)
content = '''<section class="pi-objective mx-intro"><p class="pi-label">Activity 8 of 8 · ESL Pals · Pages 9–10</p><h2>Your learning goal</h2><p>Connect personality words with descriptions and identify characters using evidence.</p><div class="pi-route"><span>5 original profiles</span><span>10 True/False · 5 Who is it?</span><span>Practice · no official grade</span></div><p class="pi-small">Complete the describing-words column and compare your ideas with the text. Tasks 1–2 show explanations after two different complete attempts, or immediately when all answers are correct. Your draft stays in this browser tab. Each section has its own reset and undo.</p><p id="mx-storage-status" class="pi-small" role="status" hidden></p></section>'''
content += '<details class="pi-topic" id="vocabulary-support"><summary><span class="pi-number">Words</span><h2>Optional vocabulary support</h2></summary><div class="pi-topic-body"><p>Hover or focus on an underlined word for its meaning in Spanish. Tap to hear its pronunciation.</p><ul class="mx-wordbox">' + ''.join('<li><span data-glossary>' + escape(v['term']) + '</span></li>' for v in VOCABULARY) + '</ul></div></details>'
content += '''<div class="pi-audio-controls" aria-label="Reading and vocabulary audio controls"><span>Audio speed</span><button type="button" data-mx-speed="0.75" aria-pressed="false">0.75×</button><button type="button" data-mx-speed="1" aria-pressed="true">1.0×</button><button type="button" data-mx-speed="1.25" aria-pressed="false">1.25×</button><button type="button" data-mx-stop>Stop audio</button><span id="mx-audio-status" role="status" aria-live="polite">Listen to a profile, an instruction or an underlined word.</span></div>'''
rows = ''.join(f'''<tr id="profile-{p['id']}" role="row"><th id="name-{p['id']}" scope="row" role="rowheader"><span>{escape(p['name'])}</span><button type="button" class="mx-listen" data-mx-audio="{p['id']}-profile" aria-label="Listen to the profile: {escape(p.get('option',p['name']))}">▷ Listen</button></th><td role="cell" headers="name-{p['id']} personality-heading"><span class="mx-cell-label" aria-hidden="true">Personality</span><p class="mx-profile-text" data-glossary>{escape(p['text'])}</p></td><td role="cell" headers="name-{p['id']} words-heading"><label class="mx-cell-label" for="words-{p['id']}">Describing words</label><textarea id="words-{p['id']}" name="{p['id']}" rows="2" aria-label="Describing words for {escape(p.get('option',p['name']))}" aria-describedby="words-feedback-{p['id']}" placeholder="Your describing words" spellcheck="true"></textarea><div id="words-feedback-{p['id']}" class="mx-table-feedback mx-feedback" hidden></div></td></tr>''' for p in PROFILES)
content += f'''<details class="pi-topic" id="case-study"><summary><span class="pi-number">Read</span><h2>Case Study · Complete the table</h2></summary><div class="pi-topic-body"><div class="mx-instruction"><p class="mx-original-instruction">{escape(INSTRUCTION)}</p><button type="button" class="btn btn-secondary" data-mx-audio="reading-instruction">Listen to the reading instruction</button></div><p class="pi-small">Write one or more describing words in the final column. Your descriptions can vary; support them with the text.</p><div class="mx-reading-notes"><p><b>About “You”:</b> this is a fictional character in the reading. Use the information in that profile to answer; it does not describe or assess your own personality.</p><p><b>Ashley’s name:</b> the original worksheet uses Ashely in the name cell, Ahsley in the profile and Ashley in the questions. They refer to the same character. The original spellings remain below; the audio and character choices use Ashley.</p></div><div id="mx-description-form"><p class="mx-count" role="status" aria-live="polite">0 of 5 descriptions written.</p><table class="mx-profile-table" role="table"><thead><tr role="row"><th scope="col" role="columnheader">Name</th><th id="personality-heading" scope="col" role="columnheader">Personality</th><th id="words-heading" scope="col" role="columnheader">Describing words</th></tr></thead><tbody>{rows}</tbody></table><div class="pi-actions"><button type="button" class="btn btn-primary" id="mx-description-check">Compare with the text</button><button type="button" class="btn btn-secondary" id="mx-description-reset">Start again</button><button type="button" class="btn btn-secondary" id="mx-description-undo" hidden>Undo reset</button><a class="btn btn-secondary" href="#task-1">Continue to Task 1</a></div><p id="mx-description-result" class="mx-result" role="status" aria-live="polite" tabindex="-1" hidden></p></div></div></details>'''


def task(number, title, instruction, questions, art, alt, width, height):
    return f'''<details class="pi-topic" id="task-{number}"><summary><span class="pi-number">0{number}</span><h2>{title}</h2></summary><div class="pi-topic-body"><div class="mx-instruction"><p class="mx-original-instruction">{instruction}</p><button type="button" class="btn btn-secondary" data-mx-audio="{'tf' if number==1 else 'who'}-instruction">Listen to Task {number} instruction</button></div><a class="mx-text-link" href="#case-study">Read the profiles again</a><div data-mx-task="{number}"><p class="mx-count" role="status" aria-live="polite">0 of {10 if number==1 else 5} answered.</p>{questions}<div class="mx-task-footer"><div class="pi-actions"><button type="button" class="btn btn-primary" data-mx-check>Check answers</button><button type="button" class="btn btn-secondary" data-mx-reset>Start again</button><button type="button" class="btn btn-secondary" data-mx-undo hidden>Undo reset</button></div><img class="mx-source-art" src="{MEDIA}{art}" width="{width}" height="{height}" alt="{alt}" loading="lazy"></div><p class="mx-result" role="status" aria-live="polite" tabindex="-1" hidden></p></div></div></details>'''


tf = ''.join(f'''<fieldset class="mx-question" id="tf-q{i}"><legend><b>{i}.</b> <span class="mx-question-text" data-glossary>{escape(q['text'])}</span></legend><div class="mx-choices">''' + ''.join(f'<label><input type="radio" name="tf-q{i}" value="{value}" aria-describedby="tf-feedback-{i}"><span>{label}</span></label>' for value,label in [('T','True'),('F','False')]) + f'<div id="tf-feedback-{i}" class="mx-feedback" hidden></div></fieldset>' for i,q in enumerate(TRUE_FALSE,1))
# Feedback belongs after the choices, not inside their flex row.
tf_doc = fragment('<div class="mx-tf-grid">' + tf + '</div>')
for box in tf_doc.xpath('.//div[contains(@class,"mx-feedback")]'): box.getparent().getparent().append(box)
content += task(1, 'Task 1 · True or False', 'True or False', html.tostring(tf_doc, encoding='unicode'), 'page-9-illustration.webp', 'Original worksheet illustration of two people with phones, one wearing headphones', 1383, 1027)
options = '<option value="">Choose a character</option>' + ''.join(f'<option value="{p["id"]}">{escape(p.get("option",p["name"]))}</option>' for p in PROFILES)
who = ''.join(f'''<div class="mx-question" id="who-q{i}"><p id="who-text-{i}"><b>{i}.</b> <span class="mx-question-text" data-glossary>{escape(q['text'])}</span></p><label class="mx-sr-only" for="who-{i}">Character for description {i}</label><select id="who-{i}" name="who-q{i}" aria-describedby="who-text-{i} who-feedback-{i}">{options}</select><div id="who-feedback-{i}" class="mx-feedback" hidden></div></div>''' for i,q in enumerate(WHO,1))
content += task(2, 'Task 2 · Who is it?', 'Who is it? Guess who the character is from the description!', '<div class="mx-who-grid">' + who + '</div>', 'page-10-illustration.webp', 'Original worksheet illustration of a woman holding a yellow heart', 544, 685)
content += '<details class="pi-topic" id="original-pages"><summary><span class="pi-number">PDF</span><h2>View the original worksheet · Pages 9–10</h2></summary><div class="pi-topic-body"><p>Both complete pages and their original illustrations are preserved. The digital vocabulary, audio, spelling note and feedback are learning support.</p>' + ''.join(f'<figure class="mx-original-page"><img src="{MEDIA}original-page-{n}.webp" width="1275" height="1801" alt="Original ESL Pals Describing Personality worksheet, page {n}, preserved in full" loading="lazy"><figcaption>ESL Pals · Describing Personality · Page {n}</figcaption></figure>' for n in [9,10]) + '</div></details>'
content += f'''<section class="pi-objective mx-footer" id="paper-version"><div><h2>Original PDF · 10 pages</h2><p>Texts, exercises and original illustrations: ESL Pals, <cite>Describing Personality</cite>. PDF provided unchanged. Suggested describing words are supported interpretations, not an official answer key.</p></div><div class="pi-actions"><a class="btn btn-primary" href="{PDF}" download="22 - Describing Personality.pdf">Download original PDF</a><a class="btn btn-secondary" href="{PREV}">Previous · My Personality</a><a class="btn btn-secondary" href="practice-lab.html#unit-1-personality">Unit 1 activities · 8 of 8 ready</a></div></section><noscript><p class="pi-objective">Read the profiles and use the original PDF to practise on paper. Enable JavaScript for audio, vocabulary meanings, draft saving and formative feedback.</p></noscript>'''
main.append(fragment('<div class="pi-shell">' + content + '</div>'))
audios = {p['id']+'-profile': dict(text=p.get('option',p['name'])+' — profile', path=AUDIO+p['id']+'-profile.mp3') for p in PROFILES}
audios.update({k+'-instruction':dict(text=text,path=AUDIO+k+'-instruction.mp3') for k,text in [('reading',INSTRUCTION),('tf','True or False'),('who','Who is it? Guess who the character is from the description!')]})
body.append(fragment('<audio id="mx-audio" preload="none" hidden></audio>'))
data = html.Element('script', id='mx-data', type='application/json'); data.text = json.dumps(dict(profiles=PROFILES,tasks={'1':TRUE_FALSE,'2':WHO},vocabulary=VOCABULARY,audio=audios),ensure_ascii=False).replace('<','\\u003c'); body.append(data)
for src in ['/assets/js/first-visit-vocabulary.js?v=20261031-personality-speaking','/assets/js/preintermediate1-more-personalities.js?v='+VERSION]: body.append(fragment('<script src="'+src+'"></script>'))
write(NAME,doc)

lab = html.document_fromstring((COURSE/'practice-lab.html').read_text()); block = lab.get_element_by_id('unit-1-personality'); grid = block.xpath('./div/div[contains(@class,"pi-section-grid")]')[0]
for previous in grid.xpath('./article[.//a[@href=$name]]',name=NAME): grid.remove(previous)
card = f'''<article class="course-section-card"><div class="course-section-image"><img src="{MEDIA}cover.webp" alt="Two fictional podcast hosts sharing a creative moment" width="1600" height="800" loading="lazy" decoding="async"></div><div class="course-section-content"><span class="section-number">08</span><span class="course-status course-status-available">Reading Extension · Available now</span><h3>Case Study: More Personalities</h3><p>5 profiles, describing words, True/False and Who is it?</p><a class="card-link" href="{NAME}">Open reading extension</a></div></article>'''
grid.append(fragment(card)); block.xpath('./summary/h3')[0].text = 'Describing Personality · 8 of 8 activities ready'
pending = block.xpath('.//ol[contains(@class,"pi-planned-activities")]')[0]
for previous in list(pending): pending.remove(previous)
pending.set('start','9'); pending.getparent().set('hidden','hidden'); write('practice-lab.html',lab)
for name in ['vocabulary-unit-1-personality.html','grammar-unit-1-personality-be.html','reading-unit-1-meet-the-characters.html','writing-unit-1-describing-people.html','vocabulary-unit-1-describing-pictures.html','speaking-unit-1-lets-talk-about-personality.html',PREV]:
    previous = html.document_fromstring((COURSE/name).read_text()); links = previous.xpath('//*[@id="paper-version"]//div[contains(@class,"pi-actions")]')[0]
    for link in links.xpath('./a[contains(@href,"practice-lab.html")]'): link.text = 'Unit 1 activities · 8 of 8 ready'
    if name == PREV:
        for link in links.xpath('./a[@href=$name]',name=NAME): links.remove(link)
        links.insert(1,fragment(f'<a class="btn btn-secondary" href="{NAME}">Next · More Personalities</a>'))
    write(name,previous)
library = html.document_fromstring((COURSE/'listening-library.html').read_text()); shell = library.get_element_by_id('unit-audio-library')
for previous in shell.xpath('./section[@id="unit-1-more-personalities-audio"]'): shell.remove(previous)
shell.get_element_by_id('unit-1').addprevious(fragment('<section class="pi-objective" id="unit-1-more-personalities-audio"><h2>Unit 1 · More Personalities reading audio</h2><p>Listen to five profiles, three task instructions and contextual vocabulary inside the reading extension.</p><div class="pi-library-activities">'+card+'</div></section>')); write('listening-library.html',library)
try:
    import qrcode
except ModuleNotFoundError:
    sys.path.insert(0,str(ROOT/'tmp/unit5-explanation/python-deps'))
    import qrcode
import qrcode.image.svg
qrcode.make('https://www.jaralingua.com/ingles/preintermedio-1/'+NAME,image_factory=qrcode.image.svg.SvgPathImage,box_size=10,border=4).save(ROOT/'assets/img/page-qr'/('ingles-preintermedio-1-'+NAME.removesuffix('.html')+'.svg'))
print('Built Activity 8: five original profiles, ten True/False, five Who is it?, original illustrations and 8 of 8 ready.')

import runpy
runpy.run_path(str(ROOT/'tools/build_preintermediate1_unit1_ask_connect.py'),run_name='__main__')
