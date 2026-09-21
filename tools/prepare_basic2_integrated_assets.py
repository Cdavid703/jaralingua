"""Build private transcript and a lossless SVG QR; never changes the source DOCX."""
from pathlib import Path
import json
import qrcode
import qrcode.image.svg
root=Path(__file__).resolve().parents[1]
folder=root/'server/private_assets/basic2-integrated-task'
bundle=json.loads((folder/'exam.json').read_text(encoding='utf-8'))
script=(folder/'script.md').read_text(encoding='utf-8')
bundle['transcript']='\n\n'.join(line for line in script.splitlines() if line.startswith(('Narrator:','Daniel:','Emma:')))
(folder/'exam.json').write_text(json.dumps(bundle,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
qrcode.make('https://www.jaralingua.com/ingles/basico-2/basic-course-2-integrated-task.html',image_factory=qrcode.image.svg.SvgPathImage,border=4).save(root/'assets/img/page-qr/ingles-basico-2-basic-course-2-integrated-task.svg')
print('Prepared private canonical transcript and QR.')
