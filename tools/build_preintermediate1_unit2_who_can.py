"""Build the approved Unit 2 Activity 6, original Case Study on page 7."""
import copy,json,sys
from pathlib import Path
from html import escape
from lxml import html
from preintermediate1_unit2_who_can_content import *
from preintermediate1_unit2_hobby_vocabulary_content import PLAN
ROOT=Path(__file__).resolve().parents[1];COURSE=ROOT/'ingles/preintermedio-1'
NAME='case-study-unit-2-who-can-do-it.html';PDF='materials/25-hobbies-can-and-cant-original.pdf'
MEDIA='/assets/img/english-preintermediate-1/unit-2/practice/who-can/';VERSION='20261107-who-can-1'
def fragment(s):return html.fragment_fromstring(s)
def write(name,doc):(COURSE/name).write_text('<!doctype html>\n'+html.tostring(doc,encoding='unicode',method='html')+'\n')
def audio_button(slug,label):return f'<button type="button" class="btn btn-secondary" data-wc-audio="{slug}">{escape(label)}</button>'
def folder(id,num,title,body):return f'<details class="pi-topic" id="{id}"><summary><span class="pi-number">{num}</span><h2>{title}</h2></summary><div class="pi-topic-body">{body}</div></details>'
doc=html.document_fromstring((COURSE/'course-overview.html').read_text());description='Compare four people’s abilities in the original hobby table and answer eight questions. Select every person who fits.'
doc.find('.//title').text='Who Can Do It? | Preintermediate English Course 1';doc.xpath('//meta[@name="description"]')[0].set('content',description)
doc.xpath('//link[contains(@href,"course-responsive.css")]')[0].addprevious(fragment(f'<link rel="stylesheet" href="/assets/css/preintermediate1-who-can.css?v={VERSION}">'))
body=doc.find('.//body');body.set('class','english-basic-page basic2-page preinter-page pi-practice-page pi-connected-page wc-page')
for el in body.xpath('./script[contains(@src,"preintermediate1-")]'):body.remove(el)
for a in doc.xpath('//header//a[@aria-current]'):a.attrib.pop('aria-current',None)
doc.xpath('//header//ul[contains(@class,"nav-links")]')[0].append(fragment('<li><a href="practice-lab.html">Practice Lab</a></li>'))
main=doc.find('.//main');hero=copy.deepcopy(main[0]);main.clear();main.set('id','main-content');hero.set('style',f'--hero-image:url({MEDIA}cover.webp)')
hero.xpath('.//p[@class="eyebrow"]')[0].text='Practice Lab · Unit 2 · Case Study';hero.xpath('.//h1')[0].text='Who Can Do It?'
hero.xpath('.//div[contains(@class,"pi-hero-copy")]/p[not(@class="eyebrow")]')[0].text=description
a=hero.xpath('.//div[contains(@class,"hero-actions")]')[0];a.clear();a.set('class','hero-actions pi-actions');a.extend(html.fragments_fromstring(f'<a class="btn btn-primary" href="#ability-table">Explore the case</a><a class="btn btn-secondary" href="{PDF}" download="25 - Hobbies - Can and Cant.pdf">Download original PDF</a><a class="btn btn-secondary" href="practice-lab.html#unit-2-hobbies">Unit 2 activities</a>'))
im=hero.xpath('.//figure/img')[0];im.set('src',MEDIA+'cover.webp');im.set('alt','Two adult learners sharing their different skills in chess and baking');im.set('width','1600');im.set('height','800');main.append(hero)
content='''<section class="pi-objective wc-intro"><p class="pi-label">Hobbies: Can / Can’t · Activity 6 of 8 · ESL Pals · Page 7</p><h2>Your learning goal</h2><p>Read the ability table and combine its information to identify everyone who fits each question.</p><div class="pi-route"><span>4 people · 5 abilities</span><span>8 original questions</span><span>Select all matching names</span></div><p class="pi-small">A question can have more than one answer. Select every person who fits. Explanations appear after two different complete attempts or when all eight questions are correct. Your draft, reset and undo stay in this browser tab. This is practice, with no submission or official grade.</p><p id="wc-storage-status" class="pi-small" role="status" hidden></p></section><div class="pi-audio-controls" aria-label="Case study audio controls"><span>Audio speed</span><button type="button" data-wc-speed="0.75" aria-pressed="false">0.75×</button><button type="button" data-wc-speed="1" aria-pressed="true">1.0×</button><button type="button" data-wc-speed="1.25" aria-pressed="false">1.25×</button><button type="button" data-wc-stop>Stop audio</button><span id="wc-audio-status" role="status" aria-live="polite">Listen to the instruction, a question or an underlined word.</span></div>'''
table='<div class="wc-instruction"><p class="wc-original-instruction" data-glossary>'+INSTRUCTION+'</p>'+audio_button('instruction','Listen to the original instruction')+'</div><p class="wc-legend"><span>✓ Can</span><span>× Can’t</span></p><p class="pi-small" id="wc-table-help">On a small screen, scroll the table sideways to see all five abilities. You can also focus the table and use the left and right arrow keys.</p><div class="wc-table-scroll" tabindex="0" role="region" aria-label="Original hobby ability table" aria-describedby="wc-table-help"><table class="wc-ability-table"><caption>Original case study · Amber, Sam, Nina and Josh</caption><thead><tr><th scope="col">Person</th>'
for c in COLUMNS:table+=f'<th scope="col"><img src="{c["photo"]}" width="{c["width"]}" height="{c["height"]}" alt="{c["alt"]}" loading="lazy"><span data-glossary>{c["label"]}</span></th>'
table+='</tr></thead><tbody>'
for p in PEOPLE:
 table+=f'<tr id="wc-person-{p["id"]}" tabindex="-1"><th scope="row">{p["name"]}</th>'
 for c in COLUMNS:
  can=p['skills'][c['id']];table+=f'<td data-wc-person="{p["id"]}" data-wc-skill="{c["id"]}" data-wc-can="{str(can).lower()}"><span class="wc-ability {"wc-can" if can else "wc-cant"}"><span aria-hidden="true">{"✓" if can else "×"}</span> {"Can" if can else "Can’t"}</span></td>'
 table+='</tr>'
table+='</tbody></table></div><p class="pi-small" data-glossary>Check both parts of a question. In “can’t … or …”, the person cannot do either activity.</p><div class="pi-actions"><a class="btn btn-primary" href="#case-questions">Answer the questions</a></div>'
content+=folder('ability-table','Table','Explore the original ability table',table)
questions='<p>Use the original table. Select all matching names for each question, then check your eight answers.</p><p class="wc-count" role="status" aria-live="polite">0 of 8 questions answered.</p><div class="wc-question-grid">'
for i,q in enumerate(QUESTIONS,1):
 questions+=f'<article class="wc-question" id="wc-question-{i}"><fieldset data-wc-question="{i}" aria-describedby="wc-feedback-{i}"><legend><span>{i}.</span> <span class="wc-original-question" data-glossary>{escape(q["text"])}</span></legend><div class="wc-name-grid">'
 for p in PEOPLE:questions+=f'<label><input type="checkbox" value="{p["id"]}" id="wc-answer-{i}-{p["id"]}"> {p["name"]}</label>'
 questions+='</div></fieldset>'+audio_button('question-'+str(i),'Listen to question '+str(i))+f'<div class="wc-feedback" id="wc-feedback-{i}" hidden></div></article>'
questions+='</div><div class="pi-actions"><button type="button" class="btn btn-primary" id="wc-check">Check my answers</button><button type="button" class="btn btn-secondary" id="wc-reset">Start again</button><button type="button" class="btn btn-secondary" id="wc-undo" hidden>Undo reset</button><a class="btn btn-secondary" href="#ability-table">Return to the table</a></div><p class="wc-result" id="wc-result" role="status" aria-live="polite" tabindex="-1" hidden></p><figure class="wc-decoration"><img src="'+MEDIA+'tennis-illustration.webp" width="1345" height="959" alt="Original worksheet illustration of a tennis player and spectators" loading="lazy"></figure>'
content+=folder('case-questions','01','Answer the eight questions',questions)
content+=folder('original-page','PDF','View the original worksheet · Page 7','<figure class="wc-original-page"><img src="'+MEDIA+'original-page-7.webp" width="1275" height="1801" alt="Complete original ESL Pals page 7: Case Study with an ability table and eight questions" loading="lazy"><figcaption>ESL Pals · Hobbies: Can / Can’t · Original page 7</figcaption></figure>')
content+=f'<section class="pi-objective wc-footer"><div><h2>Original PDF · 10 pages</h2><p>Original table, photos, questions and illustration: ESL Pals, <cite>Hobbies: Can / Can’t</cite>. The complete PDF is provided unchanged.</p></div><div class="pi-actions"><a class="btn btn-primary" href="{PDF}" download="25 - Hobbies - Can and Cant.pdf">Download original PDF</a><a class="btn btn-secondary" href="speaking-unit-2-talk-about-hobbies.html">Previous · Let’s Talk About Hobbies</a><a class="btn btn-secondary" href="practice-lab.html#unit-2-hobbies">Unit 2 worksheet · 6 of 8 ready</a></div></section><noscript><p class="pi-objective">Read the original table and questions, or use the PDF for paper practice. Enable JavaScript for audio, meanings, saved choices and answer checking.</p></noscript>'
main.append(fragment('<div class="pi-shell">'+content+'</div>'));body.append(fragment('<audio id="wc-audio" preload="none" hidden></audio>'))
data=html.Element('script',id='wc-data',type='application/json');data.text=json.dumps(dict(people=PEOPLE,columns=COLUMNS,questions=QUESTIONS,vocabulary=VOCABULARY,audio=AUDIO),ensure_ascii=False).replace('<','\\u003c');body.append(data)
for src in ['/assets/js/first-visit-vocabulary.js?v=20261031-personality-speaking','/assets/js/preintermediate1-who-can.js?v='+VERSION]:body.append(fragment('<script src="'+src+'"></script>'))
write(NAME,doc)
lab=html.document_fromstring((COURSE/'practice-lab.html').read_text());unit=lab.get_element_by_id('unit-2');block=lab.get_element_by_id('unit-2-hobbies');grid=block.xpath('.//div[@class="pi-section-grid"]')[0]
for old in grid.xpath('./article[.//a[@href="'+NAME+'"]]'):grid.remove(old)
card=f'<article class="course-section-card"><div class="course-section-image"><img src="{MEDIA}cover.webp" alt="Adult learners comparing chess and baking skills" width="1600" height="800" loading="lazy" decoding="async"></div><div class="course-section-content"><span class="section-number">06</span><span class="course-status course-status-available">Case Study · Available now</span><h3>Who Can Do It?</h3><p>Compare 4 people’s abilities and answer 8 questions.</p><a class="card-link" href="{NAME}">Open hobby case study</a></div></article>'
grid.append(fragment(card));block.xpath('./summary/h3')[0].text='Hobbies: Can / Can’t · 6 of 8 activities ready';pending=block.xpath('.//ol')[0];pending.clear();pending.set('class','pi-planned-activities');pending.set('start','7')
for title,kind,pages in PLAN[6:]:pending.append(fragment(f'<li><div><strong>{escape(title)}</strong><span>{escape(kind)} · {escape(pages)}</span></div><span class="pi-small" lang="es">En preparación</span></li>'))
unit.xpath('./div[contains(@class,"pi-topic-body")]/p[contains(@class,"pi-goal")]')[0].text='Sessions 3–5 · 9 hours of class · 8 activities available'
lab.xpath('//section[@class="pi-objective"]/p')[0].text='Units 1–6 each have a connected listening and reading story. Unit 1 also has all eight Describing Personality activities and extra grammar practice. Unit 2 has six original Hobbies: Can / Can’t worksheet activities: vocabulary, grammar, video listening, reading, speaking and a case study.';write('practice-lab.html',lab)
library=html.document_fromstring((COURSE/'listening-library.html').read_text());shell=library.get_element_by_id('unit-audio-library')
for old in shell.xpath('./section[@id="unit-2-who-can-audio"]'):shell.remove(old)
shell.get_element_by_id('unit-2').addprevious(fragment('<section class="pi-objective" id="unit-2-who-can-audio"><h2>Unit 2 · Who Can Do It? case study audio</h2><p>Listen to the original instruction, eight questions and vocabulary inside the case study.</p><div class="pi-library-activities">'+card+'</div></section>'));write('listening-library.html',library)
for name,cls in [('vocabulary-unit-2-hobbies.html','hv-footer'),('grammar-unit-2-hobbies-can-cant.html','hg-footer'),('video-listening-unit-2-people-and-hobbies.html','ph-footer'),('reading-unit-2-why-hobbies-are-good.html','wh-footer'),('speaking-unit-2-talk-about-hobbies.html','th-footer')]:
 previous=html.document_fromstring((COURSE/name).read_text());footer=previous.xpath('//section[contains(@class,"'+cls+'\")]')[0];progress=footer.xpath('.//a[contains(@href,"practice-lab")]')[0];progress.text='Unit 2 worksheet · 6 of 8 ready'
 if name.startswith('speaking-unit'):
  for old in footer.xpath('.//a[@href="'+NAME+'"]'):old.getparent().remove(old)
  progress.addprevious(fragment(f'<a class="btn btn-secondary" href="{NAME}">Next · Who Can Do It?</a>'))
 write(name,previous)
try:import qrcode
except ModuleNotFoundError:sys.path.insert(0,str(ROOT/'tmp/unit5-explanation/python-deps'));import qrcode
import qrcode.image.svg
qrcode.make('https://www.jaralingua.com/ingles/preintermedio-1/'+NAME,image_factory=qrcode.image.svg.SvgPathImage,box_size=10,border=4).save(ROOT/'assets/img/page-qr'/('ingles-preintermedio-1-'+NAME.removesuffix('.html')+'.svg'))
print('Built Unit 2 Activity 6/8: original 4-person/5-ability table and eight multi-select questions.')
