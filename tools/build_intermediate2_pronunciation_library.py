"""Render one compact library from the same pronunciation catalog as Practice Lab."""
from pathlib import Path
import json,html,sys,re
R=Path(__file__).resolve().parents[1];E=html.escape
HERO='/assets/img/english-intermediate-2/pronunciation-library-hero.webp'
def main():
 d=json.loads((R/'assets/data/english-intermediate-2-content.json').read_text());items=sorted((x for x in d['items'] if x['type']=='pronunciation' and x['status']=='published'),key=lambda x:(x['unit'],x['order']))
 ref=(R/'ingles/intermediate-2/listening-library.html').read_text();head=ref.split('<main>')[0]
 head=head.replace("Catalog-driven Listening Library for Intermediate English Course 2 with professional listening, video listening and future audiobooks.","Pronunciation activities for Units 1–6: listen, shadow, record and improve.").replace('Listening Library','Pronunciation Library').replace('listening-library','pronunciation-library')
 head=re.sub(r'<ul class="nav-links">[\s\S]*?</ul>','<ul class="nav-links"><li><a href="./index.html">Course Home</a></li><li><a href="./practice-lab.html">Practice Lab</a></li><li><a href="./listening-library.html">Listening Library</a></li><li><a href="#pronunciation-activities">Activities</a></li></ul>',head)
 head=head.replace('</head>','<link rel="canonical" href="https://www.jaralingua.com/ingles/intermediate-2/pronunciation-library.html"/><link rel="stylesheet" href="../../assets/css/english-intermediate2-pronunciation-library.css?v=20261009-1"/></head>')
 head=head.replace('class="english-intermediate2-page','class="pronunciation-library-page english-intermediate2-page')
 body='''<main><section class="pron-library-hero" aria-labelledby="libraryTitle"><div class="hero-text"><p class="intermediate2-kicker">Intermediate English Course 2</p><h1 id="libraryTitle">Pronunciation Library</h1><p>Listen, shadow, record and improve. Choose an activity from Units 1–6.</p><div class="pron-library-actions"><a class="intermediate2-button primary" href="#pronunciation-activities">Explore activities</a><a class="intermediate2-button ghost" href="./practice-lab.html">Practice Lab</a></div></div><figure><img src="HERO" alt="Two adult learners practicing pronunciation with headphones and a microphone" width="1536" height="1024" fetchpriority="high"/></figure></section><section class="pron-library-shell" id="pronunciation-activities" aria-labelledby="activitiesTitle"><div class="pron-library-heading"><h2 id="activitiesTitle">Choose a unit</h2><span>COUNT activities</span></div><div class="pron-library-grid">CARDS</div><p class="pron-library-note">These are the same activities available in Practice Lab. For explanations of sounds, visit <a href="../basico/phonetic-rules.html">Phonetic Rules</a>.</p></section></main>'''
 summaries={1:'Describe people and relationships with clear connected speech.',2:'Practice wishes, advice and conditional phrases.',3:'Give clear instructions and describe technology problems.',4:'Read a movie review with stress and connected speech.',5:'Describe impressions, feelings and degrees of certainty.',6:'Report news with word stress and clear past endings.'}
 cards=[]
 for x in items:
  cards.append('<article class="pron-library-card"><img src="'+E(x['image'])+'" alt="" loading="lazy"/><div class="pron-library-card-body"><span class="pron-library-unit">Unit '+str(x['unit'])+' · Pronunciation</span><h3>'+E(x['title'])+'</h3><p>'+E("Practice vocabulary, listening and spoken words in three challenges." if x["id"]=="unit-6-news-quest" else summaries[x["unit"]])+'</p><a href="'+E(x['workshopHref'])+'" aria-label="Open '+E(x['title'])+'">Open activity <span aria-hidden="true">→</span></a></div></article>')
 footer='''<footer class="site-footer"><p>JaraLingua · Intermediate English Course 2</p></footer><script src="../../assets/js/google-auth-config.js"></script><script src="https://accounts.google.com/gsi/client" async defer></script><script src="../../assets/js/google-auth.js?v=20261003-persistent-signin"></script><script src="/assets/js/course-switcher.js"></script><script src="/assets/js/page-qr-access.js"></script></body></html>'''
 (R/'ingles/intermediate-2/pronunciation-library.html').write_text(head+body.replace('HERO',HERO).replace('COUNT',str(len(items))).replace('CARDS',''.join(cards))+footer)
 css=(R/'assets/css/basic2-pronunciation-library.css').read_text()
 # Keep the Intermediate 2 palette, complete images and shared auth behavior.
 css=css.replace('background:#e91e53','background:#0f766e').replace('object-fit:cover','object-fit:contain').replace('color:#0b5366','color:#f0c978')
 css+='\n@media(max-width:650px){.pron-library-hero .hero-text.jl-page-qr-host{padding:18px!important}}\n.pron-library-card>img{background:#e8eef4}.pron-library-hero figure{background:#e8eef4}.pronunciation-library-page .nav-links{overflow:visible;flex-wrap:wrap}.pronunciation-library-page .navbar{overflow:visible}.pronunciation-library-page .pron-library-hero .intermediate2-kicker{color:#f0c978}.pronunciation-library-page [hidden]{display:none!important}\n'
 (R/'assets/css/english-intermediate2-pronunciation-library.css').write_text(css)
 sys.path.insert(0,str(R/'tmp/unit5-explanation/python-deps'));import qrcode,qrcode.image.svg
 qrcode.make('https://www.jaralingua.com/ingles/intermediate-2/pronunciation-library.html',image_factory=qrcode.image.svg.SvgPathImage).save(R/'assets/img/page-qr/ingles-intermediate-2-pronunciation-library.svg')
 print('Built library:',len(items),'original activity links')
if __name__=='__main__':main()
