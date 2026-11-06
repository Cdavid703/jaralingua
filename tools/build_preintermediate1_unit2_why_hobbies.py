"""Build the approved fourth Unit 2 original worksheet activity, pages 4–5."""
import copy,json,sys
from pathlib import Path
from html import escape
from lxml import html
from preintermediate1_unit2_why_hobbies_content import *
from preintermediate1_unit2_hobby_vocabulary_content import PLAN
ROOT=Path(__file__).resolve().parents[1];COURSE=ROOT/'ingles/preintermedio-1'
NAME='reading-unit-2-why-hobbies-are-good.html';PDF='materials/25-hobbies-can-and-cant-original.pdf'
MEDIA='/assets/img/english-preintermediate-1/unit-2/practice/why-hobbies/';VERSION='20261105-why-hobbies-1'
def fragment(s):return html.fragment_fromstring(s)
def write(name,doc):(COURSE/name).write_text('<!doctype html>\n'+html.tostring(doc,encoding='unicode',method='html')+'\n')
def audio_button(slug,label):return f'<button type="button" class="btn btn-secondary" data-wh-audio="{slug}">{escape(label)}</button>'
def actions(label):return f'<div class="pi-actions"><button type="button" class="btn btn-primary" data-wh-check>{label}</button><button type="button" class="btn btn-secondary" data-wh-reset>Start again</button><button type="button" class="btn btn-secondary" data-wh-undo hidden>Undo reset</button></div><p class="wh-result" role="status" aria-live="polite" tabindex="-1" hidden></p>'
def folder(id,num,title,body):return f'<details class="pi-topic" id="{id}"><summary><span class="pi-number">{num}</span><h2>{title}</h2></summary><div class="pi-topic-body">{body}</div></details>'
def instruction(text,slug,label):return '<div class="wh-instruction"><p class="wh-original-instruction">'+escape(text)+'</p>'+audio_button(slug,label)+'</div>'
def feedback(id):return f'<div id="{id}" class="wh-feedback" hidden></div>'
doc=html.document_fromstring((COURSE/'course-overview.html').read_text());description='Read four original hobby profiles, complete the picture table, check six True/False statements and answer six questions.'
doc.find('.//title').text='Why Hobbies Are Good | Preintermediate English Course 1';doc.xpath('//meta[@name="description"]')[0].set('content',description)
doc.xpath('//link[contains(@href,"course-responsive.css")]')[0].addprevious(fragment(f'<link rel="stylesheet" href="/assets/css/preintermediate1-why-hobbies.css?v={VERSION}">'))
body=doc.find('.//body');body.set('class','english-basic-page basic2-page preinter-page pi-practice-page pi-connected-page wh-page')
for el in body.xpath('./script[contains(@src,"preintermediate1-")]'):body.remove(el)
for a in doc.xpath('//header//a[@aria-current]'):a.attrib.pop('aria-current',None)
doc.xpath('//header//ul[contains(@class,"nav-links")]')[0].append(fragment('<li><a href="practice-lab.html">Practice Lab</a></li>'))
main=doc.find('.//main');hero=copy.deepcopy(main[0]);main.clear();main.set('id','main-content');hero.set('style',f'--hero-image:url({MEDIA}cover.webp)')
hero.xpath('.//p[@class="eyebrow"]')[0].text='Practice Lab · Unit 2 · Reading';hero.xpath('.//h1')[0].text='Why Hobbies Are Good'
hero.xpath('.//div[contains(@class,"pi-hero-copy")]/p[not(@class="eyebrow")]')[0].text=description
a=hero.xpath('.//div[contains(@class,"hero-actions")]')[0];a.clear();a.set('class','hero-actions pi-actions');a.extend(html.fragments_fromstring(f'<a class="btn btn-primary" href="#reading-profiles">Start reading</a><a class="btn btn-secondary" href="{PDF}" download="25 - Hobbies - Can and Cant.pdf">Download original PDF</a><a class="btn btn-secondary" href="practice-lab.html#unit-2-hobbies">Unit 2 activities</a>'))
im=hero.xpath('.//figure/img')[0];im.set('src',MEDIA+'cover.webp');im.set('alt','An adult enjoying painting flowers and trees in a park, with a jogger in the distance');im.set('width','1600');im.set('height','800');main.append(hero)
content='''<section class="pi-objective wh-intro"><p class="pi-label">Hobbies: Can / Can’t · Activity 4 of 8 · ESL Pals · Pages 4–5</p><h2>Your learning goal</h2><p>Find hobbies, frequencies and reasons in four short profiles, then support your answers with the reading.</p><div class="pi-route"><span>4 profiles with audio</span><span>Picture table · 6 True/False statements</span><span>6 written answers</span></div><p class="pi-small">Tasks 1 and 2 show explanations after two different complete attempts, or when all answers are correct. Task 3 offers reading models for questions 1–2 and personal guidance for questions 3–6 after you write all six responses; it is not automatically corrected or scored. Each task has its own draft, reset and undo in this browser tab.</p><p id="wh-storage-status" class="pi-small" role="status" hidden></p></section><div class="pi-audio-controls" aria-label="Reading and vocabulary audio controls"><span>Audio speed</span><button type="button" data-wh-speed="0.75" aria-pressed="false">0.75×</button><button type="button" data-wh-speed="1" aria-pressed="true">1.0×</button><button type="button" data-wh-speed="1.25" aria-pressed="false">1.25×</button><button type="button" data-wh-stop>Stop audio</button><span id="wh-audio-status" role="status" aria-live="polite">Listen to a profile, an instruction, a question or an underlined word.</span></div>'''
reading=instruction(READING_INSTRUCTION,'reading-instruction','Listen to the reading instruction')+'<div class="wh-profile-grid">'
for p in PROFILES:reading+=f'<article class="wh-profile" id="wh-profile-{p["id"]}" tabindex="-1"><h3>{p["name"]}</h3><p class="wh-profile-text" data-glossary>{escape(p["text"])}</p>'+audio_button(p['id']+'-profile','Listen to '+p['name'])+'</article>'
reading+='</div><details class="wh-source-illustration" id="illustrated-reading"><summary>View the original illustrated profiles</summary><figure><img src="'+MEDIA+'original-profiles.webp" width="550" height="382" alt="Original illustrated reading with four faces and speech bubbles" loading="lazy"><figcaption>Original illustration · Olivia: upper left · Benji: upper right · Isabelle: lower left · Liam: lower right</figcaption></figure></details>'
content+=folder('reading-profiles','Read','Read · Olivia, Benji, Isabelle and Liam',reading)
options='<option value="">Choose a name…</option>'+''.join(f'<option value="{p["id"]}">{p["name"]}</option>' for p in PROFILES)
matching=''
for i,item in enumerate(TABLE,1):matching+=f'<article class="wh-match-card"><h3>Column {i}</h3><label for="wh-match-{i}">Who?</label><select id="wh-match-{i}" aria-describedby="wh-match-feedback-{i}">{options}</select><p class="wh-table-label">Hobby</p><figure><img src="{MEDIA}{item["photo"]}.webp" width="{item["width"]}" height="{item["height"]}" alt="{item["alt"]}" loading="lazy"></figure><p class="wh-table-label">When?</p><p class="wh-frequency" data-glossary>{item["when"]}</p>'+feedback('wh-match-feedback-'+str(i))+'</article>'
task1=instruction(TABLE_INSTRUCTION,'table-instruction','Listen to the Task 1 instruction')+'<p class="pi-small">Use both the original hobby photo and its frequency. The columns stay in the same order as the PDF.</p><div data-wh-task="table"><p class="wh-count" role="status" aria-live="polite">0 of 4 answered.</p><div class="wh-match-grid" role="group" aria-label="Original hobby table">'+matching+'</div>'+actions('Check names')+'</div><figure class="wh-decoration wh-road"><img src="'+MEDIA+'mountain-road.webp" width="1126" height="652" alt="Original worksheet illustration of a road through the mountains" loading="lazy"></figure>'
content+=folder('hobby-table','01','Task 1 · Complete the table',task1)
transition=instruction(CONTINUATION,'continuation-instruction','Listen to the page 5 instruction')
tfs=''
for i,item in enumerate(TF,1):tfs+=f'<article class="wh-question"><label for="wh-tf-{i}"><b>{i}.</b> <span data-glossary>{escape(item["statement"])}</span></label><select id="wh-tf-{i}" aria-describedby="wh-tf-feedback-{i}"><option value="">Choose…</option><option value="True">True</option><option value="False">False</option></select>'+feedback('wh-tf-feedback-'+str(i))+'</article>'
task2=transition+instruction(TF_INSTRUCTION,'tf-instruction','Listen to the Task 2 instruction')+'<p class="pi-small">Decide according to the four profiles. You can return to the reading at any time.</p><div data-wh-task="tf"><p class="wh-count" role="status" aria-live="polite">0 of 6 answered.</p><div class="wh-question-grid">'+tfs+'</div>'+actions('Check True/False')+'</div><figure class="wh-decoration wh-runner"><img src="'+MEDIA+'runner-finish.webp" width="1340" height="892" alt="Original worksheet illustration of a runner crossing a finish line" loading="lazy"></figure>'
content+=folder('true-false','02','Task 2 · True or false?',task2)
questions=''
for i,q in enumerate(QUESTIONS,1):questions+=f'<article class="wh-written-question"><label for="wh-written-{i}"><b>{i}.</b> <span data-glossary>{escape(q["text"])}</span></label><p class="wh-answer-kind">'+('Use the reading' if q['kind']=='text' else 'Your view or experience')+'</p>'+audio_button('question-'+str(i),'Listen to question '+str(i))+f'<textarea id="wh-written-{i}" rows="3" aria-describedby="wh-written-feedback-{i}" placeholder="Write your answer." spellcheck="true"></textarea>'+feedback('wh-written-feedback-'+str(i))+'</article>'
task3=instruction(QUESTIONS_INSTRUCTION,'questions-instruction','Listen to the Task 3 instruction')+'<p class="pi-small">Questions 1–2 ask for reasons from the reading. Questions 3–6 invite your choice, experience or opinion. Write your own responses, then compare them with the guidance.</p><div data-wh-task="written"><p class="wh-count" role="status" aria-live="polite">0 of 6 answered.</p><div class="wh-written-grid">'+questions+'</div>'+actions('Review my answers')+'</div><figure class="wh-decoration wh-cyclist"><img src="'+MEDIA+'cyclist.webp" width="1178" height="813" alt="Original worksheet illustration of a person riding a bicycle" loading="lazy"></figure>'
content+=folder('answer-questions','03','Task 3 · Answer the questions',task3)
originals='<p>The complete original pages are preserved below. The four illustrated profiles are repeated in the source on page 5.</p><div class="wh-originals-grid">'
for n in [4,5]:originals+=f'<figure class="wh-original-page"><img src="{MEDIA}original-page-{n}.webp" width="1275" height="1801" alt="Complete original ESL Pals worksheet page {n}: Why Hobbies Are Good" loading="lazy"><figcaption>ESL Pals · Original page {n}</figcaption></figure>'
content+=folder('original-pages','PDF','View the original worksheet · Pages 4–5',originals+'</div>')
content+=f'<section class="pi-objective wh-footer"><div><h2>Original PDF · 10 pages</h2><p>Original profiles, instructions, questions and images: ESL Pals, <cite>Hobbies: Can / Can’t</cite>. The complete PDF is provided unchanged.</p></div><div class="pi-actions"><a class="btn btn-primary" href="{PDF}" download="25 - Hobbies - Can and Cant.pdf">Download original PDF</a><a class="btn btn-secondary" href="video-listening-unit-2-people-and-hobbies.html">Previous · People and Their Hobbies</a><a class="btn btn-secondary" href="practice-lab.html#unit-2-hobbies">Unit 2 worksheet · 4 of 8 ready</a></div></section><noscript><p class="pi-objective">Read the profiles and original pages, or use the PDF for paper practice. Enable JavaScript for checking, draft saving, meanings and audio.</p></noscript>'
main.append(fragment('<div class="pi-shell">'+content+'</div>'));body.append(fragment('<audio id="wh-audio" preload="none" hidden></audio>'))
data=html.Element('script',id='wh-data',type='application/json');data.text=json.dumps(dict(profiles=PROFILES,vocabulary=VOCABULARY,audio=AUDIO,tasks=dict(table=TABLE,tf=TF,written=QUESTIONS)),ensure_ascii=False).replace('<','\\u003c');body.append(data)
for src in ['/assets/js/first-visit-vocabulary.js?v=20261031-personality-speaking','/assets/js/preintermediate1-why-hobbies.js?v='+VERSION]:body.append(fragment('<script src="'+src+'"></script>'))
write(NAME,doc)
lab=html.document_fromstring((COURSE/'practice-lab.html').read_text());unit=lab.get_element_by_id('unit-2');block=lab.get_element_by_id('unit-2-hobbies');grid=block.xpath('.//div[@class="pi-section-grid"]')[0]
for old in grid.xpath('./article[.//a[@href="'+NAME+'"]]'):grid.remove(old)
card=f'<article class="course-section-card"><div class="course-section-image"><img src="{MEDIA}cover.webp" alt="A painter enjoying a creative outdoor hobby" width="1600" height="800" loading="lazy" decoding="async"></div><div class="course-section-content"><span class="section-number">04</span><span class="course-status course-status-available">Reading · Available now</span><h3>Why Hobbies Are Good</h3><p>4 profiles, an original picture table, 6 True/False statements and 6 questions.</p><a class="card-link" href="{NAME}">Open hobby reading</a></div></article>'
grid.append(fragment(card));block.xpath('./summary/h3')[0].text='Hobbies: Can / Can’t · 4 of 8 activities ready';pending=block.xpath('.//ol')[0];pending.clear();pending.set('class','pi-planned-activities');pending.set('start','5')
for title,kind,pages in PLAN[4:]:pending.append(fragment(f'<li><div><strong>{escape(title)}</strong><span>{escape(kind)} · {escape(pages)}</span></div><span class="pi-small" lang="es">En preparación</span></li>'))
unit.xpath('./div[contains(@class,"pi-topic-body")]/p[contains(@class,"pi-goal")]')[0].text='Sessions 3–5 · 9 hours of class · 6 activities available'
lab.xpath('//section[@class="pi-objective"]/p')[0].text='Units 1–6 each have a connected listening and reading story. Unit 1 also has all eight Describing Personality activities and extra grammar practice. Unit 2 has four original Hobbies: Can / Can’t worksheet activities: vocabulary, grammar, video listening and reading.';write('practice-lab.html',lab)
library=html.document_fromstring((COURSE/'listening-library.html').read_text());shell=library.get_element_by_id('unit-audio-library')
for old in shell.xpath('./section[@id="unit-2-why-hobbies-audio"]'):shell.remove(old)
shell.get_element_by_id('unit-2').addprevious(fragment('<section class="pi-objective" id="unit-2-why-hobbies-audio"><h2>Unit 2 · Why Hobbies Are Good reading audio</h2><p>Listen to the four original profiles, task instructions, questions and vocabulary inside the reading activity.</p><div class="pi-library-activities">'+card+'</div></section>'));write('listening-library.html',library)
for name,cls in [('vocabulary-unit-2-hobbies.html','hv-footer'),('grammar-unit-2-hobbies-can-cant.html','hg-footer'),('video-listening-unit-2-people-and-hobbies.html','ph-footer')]:
 previous=html.document_fromstring((COURSE/name).read_text());footer=previous.xpath('//section[contains(@class,"'+cls+'\")]')[0];progress=footer.xpath('.//a[contains(@href,"practice-lab")]')[0];progress.text='Unit 2 worksheet · 4 of 8 ready'
 if name.startswith('video-listening'):
  for old in footer.xpath('.//a[@href="'+NAME+'"]'):old.getparent().remove(old)
  progress.addprevious(fragment(f'<a class="btn btn-secondary" href="{NAME}">Next · Why Hobbies Are Good</a>'))
 write(name,previous)
try:import qrcode
except ModuleNotFoundError:sys.path.insert(0,str(ROOT/'tmp/unit5-explanation/python-deps'));import qrcode
import qrcode.image.svg
qrcode.make('https://www.jaralingua.com/ingles/preintermedio-1/'+NAME,image_factory=qrcode.image.svg.SvgPathImage,box_size=10,border=4).save(ROOT/'assets/img/page-qr'/('ingles-preintermedio-1-'+NAME.removesuffix('.html')+'.svg'))
print('Built Unit 2 activity 4/8: four original profiles, 4-name picture table, six True/False statements and six written answers.')

import runpy
runpy.run_path(str(ROOT/'tools/build_preintermediate1_unit2_talk_hobbies.py'),run_name='__main__')
