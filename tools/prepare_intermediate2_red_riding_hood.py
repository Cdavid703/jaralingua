"""Prepare public story media manifests; narration is the visible text verbatim."""
from pathlib import Path
import hashlib,json,sys
ROOT=Path(__file__).resolve().parents[1]
DATA=ROOT/'assets/data/english-intermediate2-red-riding-hood.json'
DEST=ROOT/'ingles/intermediate-2/audio/unit-5-red-riding-hood'
DEST.mkdir(parents=True,exist_ok=True)
data=json.loads(DATA.read_text(encoding='utf-8'));items=[]
old=json.loads((DEST/'models.json').read_text(encoding='utf-8')) if (DEST/'models.json').exists() else {}
previous={i['file']:i for i in old.get('items',[])}
def item(text,kind,prefix):
    digest=hashlib.sha256(text.encode()).hexdigest()[:14];name=prefix+'-'+digest+'.mp3'
    value=dict(id=digest,file=name,text=text,kind=kind)
    if name in previous:
        for k in ('bytes','sha256'):
            if k in previous[name]:value[k]=previous[name][k]
    items.append(value)
    return 'audio/unit-5-red-riding-hood/'+name
for n,p in enumerate(data['pages'],1):
    p['image']='/assets/img/english-intermediate-2/unit-5/red-riding-hood/'+p['slug']+'.webp'
    p['audio']=item(p['title']+'. '+' '.join(p['paragraphs']),'section','page-'+str(n).zfill(2))
    for phrase in p['phrases']:
        assert sum(phrase['text'] in paragraph for paragraph in p['paragraphs'])==1,phrase['text']
        phrase['audio']=item(phrase['text'],'phrase','phrase')
data['libraryAudio']={term:item(term,'phrase','library') for term in ['run away','look for']}
DATA.write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
(DEST/'models.json').write_text(json.dumps(dict(voiceId='EXAVITQu4vr4xnSDxMaL',modelId='eleven_multilingual_v2',items=items),ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
(DEST/'scripts.md').write_text('# Little Red Riding Hood — public narration scripts\n\n'+'\n\n'.join('### '+i['file']+'\n\n'+i['text'] for i in items)+'\n',encoding='utf-8')
sys.path.insert(0,str(ROOT/'tmp/unit5-explanation/python-deps'))
import qrcode,qrcode.image.svg
url='https://www.jaralingua.com/ingles/intermediate-2/reading-unit-5-little-red-riding-hood.html'
qrcode.make(url,image_factory=qrcode.image.svg.SvgPathImage,border=4).save(ROOT/'assets/img/page-qr/ingles-intermediate-2-reading-unit-5-little-red-riding-hood.svg')
print('Prepared',len(data['pages']),'pages and',len(items),'audio models.')
