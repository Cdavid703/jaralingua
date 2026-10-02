"""Build the Unit 5 illustrated reading book, using the course shell and shared QR."""
from pathlib import Path
import json,html,re
ROOT=Path(__file__).resolve().parents[1]
data=json.loads((ROOT/'assets/data/english-intermediate2-red-riding-hood.json').read_text(encoding='utf-8'))
stem='reading-unit-5-little-red-riding-hood'; E=html.escape
source=(ROOT/'ingles/intermediate-2/speaking-unit-5-our-picture-stories.html').read_text(encoding='utf-8')
head=source.split('<main>')[0]
head=head.replace('Our Picture Stories | Unit 5 Group Speaking','Little Red Riding Hood | Unit 5 Interactive Book')
head=head.replace('Build a two-minute group story from one picture, prepare every speaker’s part and submit it to your teacher.','Read and listen to Little Red Riding Hood in an illustrated, interactive book. Eight pages explore appearances, feelings and clues.')
head=head.replace('speaking-unit-5-our-picture-stories',stem).replace('english-intermediate2-group-stories.css?v=20260925-1','english-intermediate2-red-riding-hood.css?v=20260926-nav-2').replace('ie2-group-stories','ie2-red-book')
head=head.replace('href="#workspace">Class workspace','href="#storybook">Read the book').replace('href="#howTo">Your task','href="#bookHelp">Reading help')
hero=data['pages'][0]['image']
page='''<main>
<section class="ie2-grammar-hero" aria-labelledby="pageTitle"><div class="ie2-grammar-hero-copy"><p class="intermediate2-kicker">Practice Lab · Unit 5 · Read &amp; listen</p><h1 id="pageTitle">Little Red<br>Riding Hood</h1><p>A story of first impressions.<br>Look closely. Listen carefully. Follow the clues.</p><div class="ie2-grammar-meta"><span>8 illustrated pages</span><span>Read &amp; listen</span><span>Unit 5 language</span></div><div class="intermediate2-actions"><a class="intermediate2-button primary" href="#storybook" id="rrHeroOpen">Open the book →</a><a class="intermediate2-button ghost" href="#bookHelp">Reading help</a></div></div><figure><img src="HERO" width="1254" height="1254" alt="Little Red and her mother at a sunlit cottage door" fetchpriority="high"/></figure></section>
<div class="ie2-grammar-shell rr-shell"><section id="storybook" aria-labelledby="rrHeading"><div class="rr-section-heading"><div><p class="intermediate2-kicker">The illustrated story</p><h2 id="rrHeading">Turn the page. Follow the story.</h2></div><p>Tap a phrase marked <span aria-hidden="true">◖))</span> to hear it.</p></div>
<div id="rrHome"><div id="rrReader" class="rr-reader">
<div class="rr-toolbar"><label for="rrJump">Page <select id="rrJump"><option value="-1">Cover</option>OPTIONS</select></label><span id="rrCounter" role="status">Cover · 8 pages</span><div class="rr-tools"><button id="rrTextSize" type="button" aria-pressed="false" title="Use larger story text">A+ <span>Larger text</span></button><button id="rrEnlarge" type="button">⛶ Enlarge book</button></div></div>
<nav class="rr-turn-nav" aria-label="Book pages"><button type="button" data-prev disabled>← Previous</button><div class="rr-page-dots" aria-label="Jump to a page">DOTS</div><button type="button" data-next>Open book →</button></nav>
<div id="rrPageScroll" class="rr-page-scroll"><div id="rrBook" class="rr-book"><div id="rrPaper" class="rr-paper">
<div id="rrCover" class="rr-cover"><div class="rr-cover-copy"><p class="rr-cover-kicker">An illustrated tale</p><h2>Little Red<br>Riding Hood</h2><div class="rr-ornament" aria-hidden="true">✦ ─── ✦</div><p>A story of first impressions</p><button id="rrBegin" type="button">Open the book <span aria-hidden="true">→</span></button><small>Retold for Intermediate English Course 2</small></div><figure><img src="HERO" width="1254" height="1254" alt="Little Red receives a basket for her grandmother"/></figure></div>
<article id="rrLeaf" class="rr-leaf" aria-labelledby="rrPageTitle" hidden><button type="button" id="rrImageOpen" class="rr-image-open" aria-label="Enlarge this page's illustration"><img id="rrImage" width="1254" height="1254" alt=""/><span aria-hidden="true">⛶ View illustration</span></button><div class="rr-story-copy"><p id="rrFolio" class="rr-folio"></p><h2 id="rrPageTitle" tabindex="-1"></h2><div id="rrText"></div><p id="rrEnd" class="rr-end" hidden>And so the story ends. <span aria-hidden="true">✦</span></p></div></article>
</div></div><details id="rrSceneHelp" class="rr-scene-help" hidden><summary>Pause and explore this page</summary><p id="rrQuestion"></p><div id="rrLanguage" class="rr-language"></div></details></div>
<div id="rrAudioBar" class="rr-audio-bar"><div class="rr-audio-actions"><button id="rrListen" type="button" class="rr-primary">▶ Listen to this page</button><button id="rrListenAll" type="button" aria-pressed="false">Listen to the book</button><button id="rrStop" type="button" disabled>Stop</button><div class="rr-speeds" role="group" aria-label="Narration speed"><button type="button" data-rate="0.75" aria-pressed="true">0.75×</button><button type="button" data-rate="1" aria-pressed="false">1×</button></div></div><div class="rr-progress"><span id="rrElapsed">0:00</span><input id="rrSeek" type="range" min="0" max="100" value="0" step="0.1" aria-label="Audio position" disabled/><span id="rrDuration">0:00</span></div><p id="rrAudioStatus" role="status">Open a page, or listen to the book from the beginning.</p></div>
</div></div>
<noscript><p>Enable JavaScript to turn the pages and use the audio controls.</p></noscript>
</section>
<details id="bookHelp" class="rr-help"><summary>Reading help</summary><div class="rr-help-grid"><div><h3>Read and listen</h3><p>Open a page and listen at 0.75× or 1×. Listen to the book continues from the current page and turns the pages for you.</p></div><div><h3>Explore the language</h3><p>Tap the speaker-marked words to hear a short model. Open the page help for meanings and a conversation question.</p></div><div><h3>Read together</h3><p>Use Enlarge book for the classroom screen and A+ for larger text. Use the arrows, page selector or a horizontal swipe to turn a page.</p></div></div></details>
<p class="rr-colophon">An original classroom retelling of the traditional tale, with a gentle ending. Based on <a href="https://www.gutenberg.org/cache/epub/2591/pg2591-images.html" target="_blank" rel="noopener">Little Red-Cap, collected by the Brothers Grimm</a>.</p>
</div></main>
<dialog id="rrReadingDialog" class="rr-reading-dialog" aria-label="Enlarged storybook"><header><strong>Little Red Riding Hood</strong><div><button id="rrFullscreen" type="button">Full screen</button><button id="rrCloseReading" type="button">Close ×</button></div></header><div id="rrReadingSlot"></div></dialog>
<dialog id="rrImageDialog" class="rr-image-dialog" aria-label="Enlarged story illustration"><header><strong id="rrImageTitle">Illustration</strong><button id="rrCloseImage" type="button">Close ×</button></header><img id="rrLargeImage" alt=""/></dialog>
<footer class="site-footer"><p>JaraLingua · Intermediate English Course 2 · Read &amp; listen</p></footer><script src="../../assets/js/google-auth-config.js"></script><script src="https://accounts.google.com/gsi/client" async defer></script><script src="../../assets/js/google-auth.js?v=20260919-local-login"></script><script src="../../assets/js/english-intermediate2-red-riding-hood.js?v=20260926-1"></script><script src="/assets/js/course-switcher.js"></script><script src="/assets/js/page-qr-access.js"></script></body></html>
'''
page=page.replace('HERO',hero).replace('OPTIONS',''.join(f'<option value="{i}">{i+1} · {E(p["title"])}</option>' for i,p in enumerate(data['pages'])))
page=page.replace('DOTS',''.join(f'<button type="button" data-jump="{i}" aria-label="Go to page {i+1}">{i+1}</button>' for i in range(8)))
(ROOT/'ingles/intermediate-2'/f'{stem}.html').write_text(head+page,encoding='utf-8')
js=ROOT/'assets/js/english-intermediate2-red-riding-hood.js'
if js.exists():
    code=js.read_text(encoding='utf-8');code=re.sub(r'const bookData=.*?;\n',lambda _: 'const bookData='+json.dumps(data,ensure_ascii=False)+';\n',code,count=1);js.write_text(code,encoding='utf-8')
print('Built the illustrated storybook and embedded its eight pages.')
