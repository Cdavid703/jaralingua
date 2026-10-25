"""Add missing course QR assets/scripts; preserve existing activities and QR widgets."""
from pathlib import Path
from urllib.parse import quote
import re,json,os
import qrcode
import qrcode.image.svg
ROOT=Path(__file__).resolve().parents[1]
SCRIPT=b'<script src="/assets/js/page-qr-access.js?v=20261025-all-courses" defer fetchpriority="high"></script>'
def slug(name):return re.sub(r'\s+','-',name[:-5].replace('/','-'))
def main():
 changed=[];pages=[];skipped=[]
 for lang in ('ingles','frances'):
  for page in sorted((ROOT/lang).rglob('*.html')):
   name=page.relative_to(ROOT).as_posix()
   # Media-folder utility copies and unpublished pages are not course activities.
   if '/audio/' in name:continue
   raw=page.read_bytes()
   if re.search(rb'<meta[^>]+http-equiv=["\']refresh',raw,re.I):skipped.append(name);continue
   if b'<h1' not in raw.lower():skipped.append(name);continue
   # Only published pages; avoid unrelated drafts in this shared checkout.
   if not (Path(os.environ.get('QR_SNAPSHOT','/tmp/qr-public-pages'))/name).exists():continue
   pages.append(name)
   if b'page-qr-access.js' not in raw:
    assert raw.lower().count(b'</head>')==1,name
    newline=b'\r\n' if b'\r\n' in raw else b'\n'
    raw=re.sub(rb'</head>',SCRIPT+newline+b'</head>',raw,count=1,flags=re.I)
    page.write_bytes(raw);changed.append(name)
   asset=ROOT/'assets/img/page-qr'/(slug(name)+'.svg')
   if not asset.exists():
    qrcode.make('https://www.jaralingua.com/'+quote(name,safe='/'),image_factory=qrcode.image.svg.SvgPathImage,border=4).save(asset)
    changed.append(asset.relative_to(ROOT).as_posix())
 Path(os.environ.get('QR_MANIFEST','/tmp/all-course-qr-manifest.json')).write_text(json.dumps({'pages':pages,'changed':changed,'redirects':skipped},ensure_ascii=False,indent=2))
 print('Pages:',len(pages),'changed files:',len(changed),'redirects skipped:',len(skipped))
if __name__=='__main__':main()
