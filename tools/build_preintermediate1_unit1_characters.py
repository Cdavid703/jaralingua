"""Build only the third approved worksheet activity: the original case study."""
import copy
import json
import sys
from html import escape
from pathlib import Path
from lxml import html
from preintermediate1_unit1_characters_content import PROFILES, TRUE_FALSE, WHO

ROOT=Path(__file__).resolve().parents[1]
COURSE=ROOT/'ingles/preintermedio-1'
NAME='reading-unit-1-meet-the-characters.html'
PREV='grammar-unit-1-personality-be.html'
VOCAB='vocabulary-unit-1-personality.html'
PDF='materials/22-describing-personality-original.pdf'
MEDIA='/assets/img/english-preintermediate-1/unit-1/practice/meet-the-characters/'
VERSION='20261026-characters-1'

def fragment(text):return html.fragment_fromstring(text)
def write(name,doc):(COURSE/name).write_text('<!doctype html>\n'+html.tostring(doc,encoding='unicode',method='html')+'\n',encoding='utf-8')

doc=html.document_fromstring((COURSE/PREV).read_text())
description='Read the five original profiles, choose describing words and complete the True or False and Who is it? tasks.'
doc.find('.//title').text='Case Study: Meet the Characters | Preintermediate English Course 1'
doc.xpath('//meta[@name="description"]')[0].set('content',description)
head=doc.find('.//head')
for link in head.xpath('./link[contains(@href,"preintermediate1-personality-be.css")]'):head.remove(link)
head.insert(list(head).index(doc.xpath('//link[contains(@href,"course-responsive.css")]')[0]),fragment(f'<link rel="stylesheet" href="/assets/css/preintermediate1-personality-characters.css?v={VERSION}">'))
body=doc.find('.//body');body.set('class','english-basic-page basic2-page preinter-page pi-practice-page pv-page pc-page')
for script in body.xpath('./script'):
    if not script.get('src') or any(s in script.get('src','') for s in ['preintermediate1-personality-be.js','preintermediate1-lesson.js']):body.remove(script)
main=doc.find('.//main');hero=copy.deepcopy(main[0]);main.clear();main.set('id','main-content')
hero.set('style',f'--hero-image:url({MEDIA}cover.webp)')
hero.xpath('.//p[@class="eyebrow"]')[0].text='Practice Lab · Unit 1 · Reading'
hero.xpath('.//h1')[0].text='Case Study: Meet the Characters'
hero.xpath('.//div[contains(@class,"pi-hero-copy")]/p[not(@class="eyebrow")]')[0].text=description
actions=hero.xpath('.//div[contains(@class,"hero-actions")]')[0];actions.clear();actions.set('class','hero-actions pi-actions')
actions.extend(html.fragments_fromstring(f'<a class="btn btn-primary" href="#case-study">Start reading</a><a class="btn btn-secondary" href="{PDF}" download="22 - Describing Personality.pdf">Download original PDF</a><a class="btn btn-secondary" href="{PREV}">Activity 2 · Grammar</a>'))
image=hero.xpath('.//figure/img')[0];image.set('src',MEDIA+'cover.webp');image.set('alt','Two adult classmates reading and discussing profile sheets in a library');image.set('width','1600');image.set('height','800');main.append(hero)

content='''<section class="pi-objective pv-intro"><p class="pi-label">Activity 3 of 8 · ESL Pals · Page 5 and the top of page 6</p><h2>Your learning goal</h2><p>Connect descriptions with personality words and use evidence to identify the characters.</p><div class="pi-route"><span>About 20 minutes</span><span>5 profiles · 2 tasks</span><span>Practice · no official grade</span></div><p class="pi-small">Complete the describing-words column and compare your ideas with the text. For Tasks 1–2, explanations appear after two different complete attempts, or when all answers are correct. Your draft stays in this browser tab.</p><p id="pc-storage-status" class="pi-small" role="status" hidden></p></section>'''
words=['smart','friendly','rude','grumpy','creative','shy','silly','lazy','talkative']
rows=''.join(f'''<tr id="profile-{p['id']}" role="row"><th id="name-{p['id']}" scope="row" role="rowheader"><span>{escape(p['name'])}</span><button type="button" class="pc-listen" data-audio="{p['id']}" aria-label="Listen to {escape(p['name'])}’s profile"><span aria-hidden="true">▷</span> Listen</button></th><td role="cell" headers="name-{p['id']} personality-heading"><span class="pc-cell-label" aria-hidden="true">Personality</span><p class="pc-profile-text">{escape(p['text'])}</p></td><td role="cell" headers="name-{p['id']} words-heading"><label class="pc-cell-label" for="words-{p['id']}">Describing words</label><textarea id="words-{p['id']}" name="{p['id']}" rows="2" maxlength="200" required aria-label="Describing words for {escape(p['name'])}" aria-describedby="words-feedback-{p['id']}" placeholder="Your describing words"></textarea><div id="words-feedback-{p['id']}" class="pc-table-feedback pv-feedback" hidden></div></td></tr>''' for p in PROFILES)
content+='''<details class="pi-topic" id="case-study"><summary><span class="pi-number">Read</span><h2>Case Study · Complete the table</h2></summary><div class="pi-topic-body"><p class="pv-original-instruction">Read the text and complete the last table with describing words from the lesson.</p><p class="pi-small">Write one or more describing words in the last column. Your descriptions can vary; compare them with the text.</p><p class="pc-wordbox" aria-label="Describing words from the lesson">'''+''.join(f'<span>{w}</span>' for w in words)+'''</p><form id="pc-description-form" novalidate><p class="pc-count" role="status" aria-live="polite">0 of 5 descriptions written.</p><table class="pc-profile-table" role="table"><thead><tr role="row"><th scope="col" role="columnheader">Name</th><th id="personality-heading" scope="col" role="columnheader">Personality</th><th id="words-heading" scope="col" role="columnheader">Describing words</th></tr></thead><tbody>'''+rows+'''</tbody></table><div class="pi-actions"><button type="submit" class="btn btn-primary">Compare with the text</button><button type="button" class="btn btn-secondary" id="pc-description-reset">Start again</button><a class="btn btn-secondary" href="#task-1">Continue to Task 1</a></div><p id="pc-description-result" class="pv-result" role="status" aria-live="polite" tabindex="-1" hidden></p></form><div class="pi-audio-controls"><span>Profile audio</span><button type="button" data-speed="0.75" aria-pressed="false">0.75×</button><button type="button" data-speed="1" aria-pressed="true">1.0×</button><button type="button" data-speed="1.25" aria-pressed="false">1.25×</button><button type="button" data-stop>Stop audio</button></div><p class="pv-audio-status" data-audio-status role="status" aria-live="polite">Choose Listen beside a name to hear its profile.</p></div></details>'''

def task(number,title,instruction,questions,extra=''):
    return f'''<details class="pi-topic" id="task-{number}"><summary><span class="pi-number">0{number}</span><h2>{title}</h2></summary><div class="pi-topic-body"><p class="pv-original-instruction">{instruction}</p><a class="pc-text-link" href="#case-study">Read the profiles again</a><form data-pc-task="{number}" novalidate><p class="pc-count" role="status" aria-live="polite">0 of {10 if number==1 else 5} answered.</p>{questions}<div class="pc-task-footer"><div class="pi-actions"><button type="submit" class="btn btn-primary">Check answers</button><button type="button" class="btn btn-secondary" data-pc-reset>Start again</button></div>{extra}</div><p class="pc-result pv-result" role="status" aria-live="polite" tabindex="-1" hidden></p></form></div></details>'''

tf=''.join(f'''<fieldset class="pc-question" id="tf-q{i}"><legend class="pc-sr-only">{i}. {escape(q['text'])}</legend><p class="pc-question-text" aria-hidden="true"><b class="pv-item-number">{i}.</b> {escape(q['text'])}</p><div class="pc-choices">'''+''.join(f'<label><input type="radio" name="q{i}" value="{value}" required aria-describedby="tf-feedback-{i}"><span>{label}</span></label>' for value,label in [('T','True'),('F','False')])+f'<div id="tf-feedback-{i}" class="pc-feedback pv-feedback" hidden></div></div></fieldset>' for i,q in enumerate(TRUE_FALSE,1))
# Keep feedback outside the choices so it spans the complete question row.
tf_doc=fragment('<div class="pc-tf-list">'+tf+'</div>')
for box in tf_doc.xpath('.//div[contains(@class,"pc-feedback")]'):box.getparent().getparent().append(box)
tf=html.tostring(tf_doc,encoding='unicode')
content+=task(1,'Task 1 · True or False','True or False',tf,f'<img class="pc-source-art" src="{MEDIA}case-study-illustration.webp" width="991" height="843" alt="Original worksheet illustration of three people cheering in numbered shirts" loading="lazy">')
options='<option value="">Choose a character</option>'+''.join(f'<option value="{p["id"]}">{escape(p["name"])}</option>' for p in PROFILES)
who=''.join(f'<div class="pc-who-question" id="who-q{i}"><label for="who-{i}"><b class="pv-item-number">{i}.</b> {escape(q["text"])}</label><select id="who-{i}" name="q{i}" required aria-describedby="who-feedback-{i}">{options}</select><div id="who-feedback-{i}" class="pc-feedback pv-feedback" hidden></div></div>' for i,q in enumerate(WHO,1))
content+=task(2,'Task 2 · Who is it?','Who is it? Guess who the character is from the description!','<div class="pc-who-grid">'+who+'</div>')
content+='<details class="pi-topic" id="original-pages"><summary><span class="pi-number">PDF</span><h2>View the original worksheet · Pages 5–6</h2></summary><div class="pi-topic-body"><p>This activity uses the Case Study on page 5 and Task 2 at the top of page 6. The Describing People section lower on page 6 belongs to Activity 4.</p>'+''.join(f'<figure class="pv-original-page"><img src="{MEDIA}original-page-{n}.webp" width="1275" height="1800" alt="Original Describing Personality worksheet, page {n}. The case study exercises are transcribed above." loading="lazy"><figcaption>ESL Pals · Describing Personality · Page {n}</figcaption></figure>' for n in [5,6])+'</div></details>'
content+=f'''<section class="pi-objective pv-download pv-footer" id="paper-version"><div><h2>Original PDF · 10 pages</h2><p>Work on page 5 and the Who is it? task at the top of page 6. Download the complete original worksheet to practise on paper.</p><p class="pi-small">Texts, exercises and original illustration: ESL Pals, <cite>Describing Personality</cite>. PDF provided unchanged.</p></div><div class="pi-actions"><a class="btn btn-primary" href="{PDF}" download="22 - Describing Personality.pdf">Download original PDF</a><a class="btn btn-secondary" href="{PREV}">Previous · Describing Personality with Be</a><a class="btn btn-secondary" href="practice-lab.html#unit-1-personality">Unit 1 activities · 3 of 8 ready</a></div></section><noscript><p class="pi-objective">Enable JavaScript to hear profiles, compare your descriptions and check answers, or download the original PDF to work on paper.</p></noscript>'''
main.append(fragment('<div class="pi-shell">'+content+'</div>'))
data=html.Element('script',id='pc-data',type='application/json');data.text=json.dumps(dict(profiles=PROFILES,tasks={'1':TRUE_FALSE,'2':WHO}),ensure_ascii=False).replace('<','\\u003c');body.append(data)
audio_data=html.Element('script');audio_data.text='window.Preintermediate1Audio = '+json.dumps({p['id']:dict(text=p['name']+' — profile',path=f'/ingles/preintermedio-1/audio/unit1/meet-the-characters/{p["id"]}-profile.mp3') for p in PROFILES})+';';body.append(audio_data)
for src in ['/assets/js/preintermediate1-lesson.js?v=20261024-connected-unit1','/assets/js/preintermediate1-personality-characters.js?v='+VERSION]:body.append(fragment('<script src="'+src+'"></script>'))
write(NAME,doc)

lab=html.document_fromstring((COURSE/'practice-lab.html').read_text());unit=lab.get_element_by_id('unit-1');block=lab.get_element_by_id('unit-1-personality')
unit.xpath('./div/p[contains(@class,"pi-goal")]')[0].text='Sessions 1–2 · 6 hours of class · 5 activities available'
block.xpath('./summary/h3')[0].text='Describing Personality · 3 of 8 activities ready'
grid=block.xpath('./div/div[contains(@class,"pi-section-grid")]')[0]
for card in grid.xpath('./article[.//a[@href=$name]]',name=NAME):grid.remove(card)
grid.append(fragment(f'''<article class="course-section-card"><div class="course-section-image"><img src="{MEDIA}cover.webp" alt="Adult classmates reading profile sheets" width="1600" height="800" loading="lazy" decoding="async"></div><div class="course-section-content"><span class="section-number">03</span><span class="course-status course-status-available">Reading · Available now</span><h3>Case Study: Meet the Characters</h3><p>Five original profiles, describing words, True or False and Who is it? Includes the original illustration and PDF.</p><a class="card-link" href="{NAME}">Open case study</a></div></article>'''))
pending=block.xpath('.//ol[contains(@class,"pi-planned-activities")]')[0]
for li in pending.xpath('./li[.//strong[text()="Case Study: Meet the Characters"]]'):pending.remove(li)
pending.set('start','4')
lab.xpath('//section[@class="pi-objective"]/p')[0].text='Units 1–6 each have a connected listening and reading story. Unit 1 also includes vocabulary, grammar and a case study, the first three of eight Describing Personality activities.'
write('practice-lab.html',lab)
for name in [VOCAB,PREV]:
    previous=html.document_fromstring((COURSE/name).read_text());links=previous.xpath('//*[@id="paper-version"]//div[contains(@class,"pi-actions")]')[0]
    for link in links.xpath('./a[contains(@href,"practice-lab.html")]'):link.text='Unit 1 activities · 3 of 8 ready'
    if name==PREV:
        for link in links.xpath('./a[@href=$target]',target=NAME):links.remove(link)
        links.insert(1,fragment(f'<a class="btn btn-secondary" href="{NAME}">Next · Meet the Characters</a>'))
    write(name,previous)
try:
    import qrcode
except ModuleNotFoundError:
    sys.path.insert(0,str(ROOT/'tmp/unit5-explanation/python-deps'))
    import qrcode
import qrcode.image.svg
qrcode.make('https://www.jaralingua.com/ingles/preintermedio-1/'+NAME,image_factory=qrcode.image.svg.SvgPathImage,box_size=10,border=4).save(ROOT/'assets/img/page-qr'/('ingles-preintermedio-1-'+NAME.removesuffix('.html')+'.svg'))
print('Built activity 3: five original profiles and describing-word fields, 10 True/False statements and five Who is it? clues. Activities 4–8 remain pending.')
