"""Build approved Unit 2 Activity 8, original Writing Exercise on pages 9–10."""
import copy,json,sys
from pathlib import Path
from html import escape
from lxml import html
from preintermediate1_unit2_my_hobbies_content import *
from preintermediate1_unit2_hobby_vocabulary_content import PLAN
ROOT=Path(__file__).resolve().parents[1];COURSE=ROOT/'ingles/preintermedio-1'
NAME='writing-unit-2-my-hobbies.html';PDF='materials/25-hobbies-can-and-cant-original.pdf'
MEDIA='/assets/img/english-preintermediate-1/unit-2/practice/my-hobbies/';VERSION='20261107-my-hobbies-1'
def fragment(s):return html.fragment_fromstring(s)
def write(name,doc):(COURSE/name).write_text('<!doctype html>\n'+html.tostring(doc,encoding='unicode',method='html')+'\n')
def audio_button(slug,label):return f'<button type="button" class="btn btn-secondary" data-mh-audio="{slug}">{escape(label)}</button>'
def folder(id,num,title,body):return f'<details class="pi-topic" id="{id}"><summary><span class="pi-number">{num}</span><h2>{title}</h2></summary><div class="pi-topic-body">{body}</div></details>'
doc=html.document_fromstring((COURSE/'course-overview.html').read_text());description='Write your own answers to five original questions about abilities, family hobbies and why hobbies matter.'
doc.find('.//title').text='My Hobbies | Preintermediate English Course 1';doc.xpath('//meta[@name="description"]')[0].set('content',description)
doc.xpath('//link[contains(@href,"course-responsive.css")]')[0].addprevious(fragment(f'<link rel="stylesheet" href="/assets/css/preintermediate1-my-hobbies.css?v={VERSION}">'))
body=doc.find('.//body');body.set('class','english-basic-page basic2-page preinter-page pi-practice-page pi-connected-page mh-page')
for el in body.xpath('./script[contains(@src,"preintermediate1-")]'):body.remove(el)
for a in doc.xpath('//header//a[@aria-current]'):a.attrib.pop('aria-current',None)
doc.xpath('//header//ul[contains(@class,"nav-links")]')[0].append(fragment('<li><a href="practice-lab.html">Practice Lab</a></li>'))
main=doc.find('.//main');hero=copy.deepcopy(main[0]);main.clear();main.set('id','main-content');main.set('data-jaralingua-managed-draft','true');hero.set('style',f'--hero-image:url({MEDIA}cover.webp)')
hero.xpath('.//p[@class="eyebrow"]')[0].text='Practice Lab · Unit 2 · Writing';hero.xpath('.//h1')[0].text='My Hobbies'
hero.xpath('.//div[contains(@class,"pi-hero-copy")]/p[not(@class="eyebrow")]')[0].text=description
a=hero.xpath('.//div[contains(@class,"hero-actions")]')[0];a.clear();a.set('class','hero-actions pi-actions');a.extend(html.fragments_fromstring(f'<a class="btn btn-primary" href="#writing-questions">Start writing</a><a class="btn btn-secondary" href="{PDF}" download="25 - Hobbies - Can and Cant.pdf">Download original PDF</a><a class="btn btn-secondary" href="practice-lab.html#unit-2-hobbies">Unit 2 activities</a>'))
im=hero.xpath('.//figure/img')[0];im.set('src',MEDIA+'cover.webp');im.set('alt','An adult reflecting on his hobbies while writing at a kitchen table');im.set('width','1600');im.set('height','800');main.append(hero)
content='''<section class="pi-objective mh-intro"><p class="pi-label">Hobbies: Can / Can’t · Activity 8 of 8 · ESL Pals · Lower page 9 and page 10</p><h2>Your learning goal</h2><p>Write about your abilities, your family’s hobbies and the value of hobbies. Answer the relevant parts of each question in your own words.</p><div class="pi-route"><span>5 original writing questions</span><span>Personal answers · no answer key</span><span>Review, revise and save a copy</span></div><p class="pi-small">There is no minimum word count. Each answer has its own draft, self-check marks, reset and undo in this browser tab, including after a reload. Save your own copy before closing the tab. Reviews use your marks; they do not automatically correct or grade your writing. Nothing is submitted to a teacher from this page.</p><p id="mh-storage-status" class="pi-small" role="status" hidden></p></section><div class="pi-audio-controls" aria-label="Writing question audio controls"><span>Audio speed</span><button type="button" data-mh-speed="0.75" aria-pressed="false">0.75×</button><button type="button" data-mh-speed="1" aria-pressed="true">1.0×</button><button type="button" data-mh-speed="1.25" aria-pressed="false">1.25×</button><button type="button" data-mh-stop>Stop audio</button><span id="mh-audio-status" role="status" aria-live="polite">Listen to an instruction, question or underlined phrase.</span></div>'''
writing='<div class="mh-instruction"><p class="mh-original-instruction">'+INSTRUCTION+'</p>'+audio_button('instruction','Listen to the writing instruction')+'</div><p id="mh-total-count" class="mh-count" role="status" aria-live="polite">0 of 5 answers started.</p><div class="mh-writing-grid">'
for q in QUESTIONS:
 n=q['number'];writing+=f'<article class="mh-answer" data-mh-question="{n}" id="mh-question-{n}"><label class="mh-question-heading" for="mh-answer-{n}"><b>{n}.</b> <span class="mh-original-question" data-glossary>{escape(q["text"])}</span></label>'+audio_button('question-'+str(n),'Listen to question '+str(n))+f'<details class="mh-starter"><summary>Help me start</summary><p>{escape(q["starter"])}</p><p class="pi-small">This is a sentence frame. Use your own answer and details.</p></details><textarea id="mh-answer-{n}" rows="{5 if n==5 else 4}" spellcheck="true" aria-describedby="mh-feedback-{n}" placeholder="Write your own answer."></textarea><p class="mh-word-count">0 words · no minimum or target</p><div class="mh-checks">'
 for i,text in enumerate(SELF_CHECK,1):writing+=f'<label><input type="checkbox" data-mh-mark="{i}"> <span>{escape(text)}</span></label>'
 writing+=f'</div><div class="pi-actions"><button type="button" class="btn btn-primary" data-mh-review>Review answer {n}</button><button type="button" class="btn btn-secondary" data-mh-reset>Start answer {n} again</button><button type="button" class="btn btn-secondary" data-mh-undo hidden>Undo reset {n}</button></div><p class="mh-feedback" id="mh-feedback-{n}" role="status" aria-live="polite" tabindex="-1" hidden></p></article>'
writing+='</div><div class="pi-actions"><button type="button" class="btn btn-primary" id="mh-review-all">Review my five answers</button><a class="btn btn-secondary" href="#save-writing">Save my own copy</a></div><div class="mh-result" id="mh-result" role="status" aria-live="polite" tabindex="-1" hidden></div><figure class="mh-decoration"><img src="'+MEDIA+'graduates.webp" width="1051" height="464" alt="Original worksheet illustration of three characters with graduation caps" loading="lazy"></figure>'
content+=folder('writing-questions','Write','Write your five answers',writing)
saving='''<p>Copy or download the five questions and your current answers as plain text. You can save a partial draft and continue later. This keeps your own copy; it is not a teacher submission.</p><div class="pi-actions"><button type="button" class="btn btn-primary" id="mh-download">Save my answers (.txt)</button><button type="button" class="btn btn-secondary" id="mh-copy">Copy my answers</button></div><p id="mh-copy-status" role="status" aria-live="polite"></p><div id="mh-copy-fallback" hidden><label for="mh-copy-text">Your questions and answers · select and copy</label><textarea id="mh-copy-text" rows="10" readonly></textarea></div><figure class="mh-decoration mh-drone"><img src="'''+MEDIA+'''drone-race.webp" width="1263" height="921" alt="Original worksheet illustration of a person waving a checkered flag beside racing drones" loading="lazy"></figure>'''
content+=folder('save-writing','Save','Save your own writing',saving)
original='<p>The Writing Exercise starts below Grammar Exercise 2 on page 9 and continues on page 10. The grammar section at the top of page 9 belongs to Activity 7.</p><div class="mh-originals-grid">'
for n,src in [(9,'/assets/img/english-preintermediate-1/unit-2/practice/more-grammar/original-page-9.webp'),(10,MEDIA+'original-page-10.webp')]:original+=f'<figure class="mh-original-page"><img src="{src}" width="1275" height="1801" alt="Complete original ESL Pals worksheet page {n}" loading="lazy"><figcaption>ESL Pals · Original page {n}'+(' · Writing Exercise below the grammar section' if n==9 else '')+'</figcaption></figure>'
content+=folder('original-pages','PDF','View the original worksheet · Pages 9–10',original+'</div>')
content+=f'<section class="pi-objective mh-footer"><div><h2>Original PDF · 10 pages</h2><p>Original questions, instruction and illustrations: ESL Pals, <cite>Hobbies: Can / Can’t</cite>. All eight worksheet activities are now available. The complete PDF is provided unchanged.</p></div><div class="pi-actions"><a class="btn btn-primary" href="{PDF}" download="25 - Hobbies - Can and Cant.pdf">Download original PDF</a><a class="btn btn-secondary" href="grammar-unit-2-can-cant-more-practice.html">Previous · Can and Can’t: More Practice</a><a class="btn btn-secondary" href="practice-lab.html#unit-2-hobbies">Unit 2 worksheet · 8 of 8 ready</a></div></section><noscript><p class="pi-objective">Read the questions or use the PDF for paper writing. Enable JavaScript for audio, meanings, draft recovery, self-checks and saving your copy.</p></noscript>'
main.append(fragment('<div class="pi-shell">'+content+'</div>'));body.append(fragment('<audio id="mh-audio" preload="none" hidden></audio>'))
data=html.Element('script',id='mh-data',type='application/json');data.text=json.dumps(dict(questions=QUESTIONS,vocabulary=VOCABULARY,audio=AUDIO),ensure_ascii=False).replace('<','\\u003c');body.append(data)
for src in ['/assets/js/first-visit-vocabulary.js?v=20261031-personality-speaking','/assets/js/preintermediate1-my-hobbies.js?v='+VERSION]:body.append(fragment('<script src="'+src+'"></script>'))
write(NAME,doc)
lab=html.document_fromstring((COURSE/'practice-lab.html').read_text());unit=lab.get_element_by_id('unit-2');block=lab.get_element_by_id('unit-2-hobbies');grid=block.xpath('.//div[@class="pi-section-grid"]')[0]
for old in grid.xpath('./article[.//a[@href="'+NAME+'"]]'):grid.remove(old)
card=f'<article class="course-section-card"><div class="course-section-image"><img src="{MEDIA}cover.webp" alt="An adult reflecting on his hobbies while writing" width="1600" height="800" loading="lazy" decoding="async"></div><div class="course-section-content"><span class="section-number">08</span><span class="course-status course-status-available">Writing · Available now</span><h3>My Hobbies</h3><p>5 personal writing questions with self-checks and your own saved copy.</p><a class="card-link" href="{NAME}">Open hobby writing</a></div></article>'
grid.append(fragment(card));block.xpath('./summary/h3')[0].text='Hobbies: Can / Can’t · 8 of 8 activities ready';pending=block.xpath('.//ol')[0];pending.clear();pending.set('class','pi-planned-activities');pending.set('start','9');pending.getparent().set('hidden','hidden')
unit.xpath('./div[contains(@class,"pi-topic-body")]/p[contains(@class,"pi-goal")]')[0].text='Sessions 3–5 · 9 hours of class · 10 activities available'
lab.xpath('//section[@class="pi-objective"]/p')[0].text='Units 1–6 each have a connected listening and reading story. Unit 1 also has all eight Describing Personality activities and extra grammar practice. Unit 2 now has all eight original Hobbies: Can / Can’t worksheet activities, including the final writing activity.';write('practice-lab.html',lab)
library=html.document_fromstring((COURSE/'listening-library.html').read_text());shell=library.get_element_by_id('unit-audio-library')
for old in shell.xpath('./section[@id="unit-2-my-hobbies-audio"]'):shell.remove(old)
shell.get_element_by_id('unit-2').addprevious(fragment('<section class="pi-objective" id="unit-2-my-hobbies-audio"><h2>Unit 2 · My Hobbies writing audio</h2><p>Listen to the five original writing questions, instruction and vocabulary inside the writing activity.</p><div class="pi-library-activities">'+card+'</div></section>'));write('listening-library.html',library)
for name,cls in [('vocabulary-unit-2-hobbies.html','hv-footer'),('grammar-unit-2-hobbies-can-cant.html','hg-footer'),('video-listening-unit-2-people-and-hobbies.html','ph-footer'),('reading-unit-2-why-hobbies-are-good.html','wh-footer'),('speaking-unit-2-talk-about-hobbies.html','th-footer'),('case-study-unit-2-who-can-do-it.html','wc-footer'),('grammar-unit-2-can-cant-more-practice.html','mg-footer')]:
 previous=html.document_fromstring((COURSE/name).read_text());footer=previous.xpath('//section[contains(@class,"'+cls+'\")]')[0];progress=footer.xpath('.//a[contains(@href,"practice-lab")]')[0];progress.text='Unit 2 worksheet · 8 of 8 ready'
 if name.startswith('grammar-unit-2-can-cant-more'):
  for old in footer.xpath('.//a[@href="'+NAME+'"]'):old.getparent().remove(old)
  progress.addprevious(fragment(f'<a class="btn btn-secondary" href="{NAME}">Next · My Hobbies</a>'))
 write(name,previous)
try:import qrcode
except ModuleNotFoundError:sys.path.insert(0,str(ROOT/'tmp/unit5-explanation/python-deps'));import qrcode
import qrcode.image.svg
qrcode.make('https://www.jaralingua.com/ingles/preintermedio-1/'+NAME,image_factory=qrcode.image.svg.SvgPathImage,box_size=10,border=4).save(ROOT/'assets/img/page-qr'/('ingles-preintermedio-1-'+NAME.removesuffix('.html')+'.svg'))
print('Built Unit 2 Activity 8/8: five original writing questions, independent drafts and own-copy export.')

# Preserve the separately approved Unit 3 vocabulary activity in the complete build chain.
import runpy
runpy.run_path(str(ROOT/'tools/build_preintermediate1_unit3_healthy_vocabulary.py'), run_name='__main__')
