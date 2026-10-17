"""Shared, static navigation for the teacher's October 17 lesson."""
from pathlib import Path
import re

ROOT = Path(__file__).resolve().parents[1]
STYLE = '<link rel="stylesheet" href="../../assets/css/english-intermediate2-class-route.css?v=20261017-2">'
STEPS = [
 ('Verbs + prepositions', 'unit-6-news-and-natural-disasters.html#verb-prepositions', 'Compare look for / look at and the other nine pairs.'),
 ('After the Storm', 'reading-unit-6-after-the-storm.html#class-step-2', 'Read the interactive book and choose the expression that fits each blank.'),
 ('Reported speech', 'unit-6-news-and-natural-disasters.html#direct-reported', 'Understand the message, build a report and check what changes.'),
 ('What did they say?', 'speaking-unit-6-what-did-they-say.html#class-step-4', 'Student A describes the picture. Student B reports what A said.'),
 ('Disaster News Memory', 'game-unit-6-disaster-news-memory.html#class-step-5', 'Match pictures and give one news headline in the past, in your own words.'),
 ('After the Flood', 'listening-unit-6-after-the-flood.html#class-step-6', 'Listen to the news, answer eight questions and report what a speaker said.'),
 ('Kahoot · Flood News Review', 'course-overview.html#class-step-7', 'Review flood vocabulary and verb + preposition combinations before the final assessment.'),
 ('Final Oral Assessment · Live News Report', 'final-oral-live-news-report.html#class-step-8', 'Assign the roles, reveal the scene cards in order and perform the classroom example together.'),
]

def step_nav(step):
    total = len(STEPS)
    title, _, description = STEPS[step-1]
    back = STEPS[step-2][1] if step > 1 else 'course-overview.html#class-september-17'
    next_url = STEPS[step][1] if step < total else 'course-overview.html#class-september-17'
    next_label = f'Next: {STEPS[step][0]} →' if step < total else 'Finish · return to the class route'
    support = ''
    if step == 3:
        support = '<p class="ie2-class-substeps">Read in order: <a href="#direct-reported">1. What is it?</a> → <a href="#say-tell">2. Said / told</a> → <a href="#changes">3. What changes?</a></p>'
    if step == 5:
        support = '<p>For a short classroom round, choose <b>Help · 5 pairs</b> in the Vocabulary menu.</p>'
    if step == 8:
        support = '<p>Read the model together, then try <b>Rehearsal · pictures only</b>. During the final assessment, speak without reading.</p><p class="ie2-class-substeps"><a href="#exam">Assessment instructions</a> · <a href="#topics">Choose your news story</a> · <a href="#scenes">Reveal the scene cards</a></p>'
    if step == 7:
        support = '<p><b>20 questions · Play together.</b> Teacher: open your saved Kahoot and choose <b>Present live</b>. Students: join at <a href="https://kahoot.it/" target="_blank" rel="noopener noreferrer">kahoot.it ↗</a> with the game PIN.</p><p><a class="ie2-class-launch" href="https://create.kahoot.it/details/unit-6-flood-news-words-verb-partners/3a98457b-131b-42cd-b286-6e3947c5282f" target="_blank" rel="noopener noreferrer">Open Kahoot · Teacher ↗</a></p><p class="ie2-class-note">Opens in a new tab. Sign in to the teacher account that owns this private Kahoot. After the game, return here and continue to the final assessment.</p>'
    return f'''<nav class="ie2-class-step" data-class-tone="{step}" id="class-step-{step}" aria-label="October 17 class, step {step} of {total}"><div><p class="ie2-class-label"><span lang="en">October 17 Class</span> · Step {step} / {total}</p><strong>{title}</strong><p>{description}</p>{support}</div><div class="ie2-class-actions"><a href="{back}" data-class-back>← Previous step</a><a class="ie2-class-next" href="{next_url}" data-class-next>{next_label}</a><a href="course-overview.html#class-september-17">View all {total} steps</a></div></nav>'''

def overview():
    items = ''.join(f'<li><a data-class-tone="{i}" href="{url}"><b>{i}. {title}</b><span>{description}</span></a></li>' for i, (title,url,description) in enumerate(STEPS,1))
    return f'''<details class="ie2-class-overview" id="class-september-17"><summary lang="en">October 17 Class</summary><div><h2>Your class, step by step</h2><p>Follow this order. Each explanation or activity includes a link to the next step.</p><ol>{items}</ol><a class="ie2-class-next" href="{STEPS[0][1]}">Start the class →</a></div></details>{step_nav(7)}'''

def marked(key, content):
    return f'<!-- class-route:{key}:start -->{content}<!-- class-route:{key}:end -->'

def insert(path, key, content, anchor):
    p = ROOT/'ingles/intermediate-2'/path
    text = p.read_text()
    block = marked(key, content)
    pattern = rf'<!-- class-route:{key}:start -->.*?<!-- class-route:{key}:end -->'
    if re.search(pattern,text,re.S):
        text = re.sub(pattern,lambda _:block,text,flags=re.S)
    else:
        assert text.count(anchor)==1, (path,anchor)
        text = text.replace(anchor,block+anchor,1)
    if 'english-intermediate2-class-route.css?' in text:
        text = re.sub(r'<link rel="stylesheet" href="../../assets/css/english-intermediate2-class-route.css[^"]*">', STYLE, text)
    else:text=text.replace('</head>',STYLE+'</head>')
    p.write_text(text)

if __name__ == '__main__':
    insert('course-overview.html','overview',overview(),'<section class="intermediate2-search course-search-panel"')
    insert('reading-unit-6-after-the-storm.html','story',step_nav(2),'<section class="fv-panel st-example">')
    insert('speaking-unit-6-what-did-they-say.html','speaking',step_nav(4),'<section class="rs-intro"')
    insert('game-unit-6-disaster-news-memory.html','memory','<div class="dm-back">'+step_nav(5)+'</div>','<section class="game-shell"')
    insert('listening-unit-6-after-the-flood.html','listening',step_nav(6),'<section class="ie2-listening-block ie2-search-item" id="before-listening"')
    insert('final-oral-live-news-report.html','assessment','<span id="class-step-7" aria-hidden="true"></span>'+step_nav(8),'<section id="scenes" class="news-example">')
    p=ROOT/'ingles/intermediate-2/course-overview.html'
    text=p.read_text()
    button='<a class="intermediate2-button primary" lang="en" href="#class-september-17">October 17 Class</a>'
    if button not in text:text=text.replace('<a class="intermediate2-button primary" href="./unit-1',button+'<a class="intermediate2-button primary" href="./unit-1',1)
    script='<script src="../../assets/js/english-intermediate2-class-route.js?v=20261017-2"></script>'
    if 'english-intermediate2-class-route.js?' in text:
        text = re.sub(r'<script src="../../assets/js/english-intermediate2-class-route.js[^"]*"></script>', script, text)
    else:text=text.replace('</body>',script+'</body>')
    p.write_text(text)
