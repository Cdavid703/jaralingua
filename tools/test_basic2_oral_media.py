"""Run on the actual converter host with synthetic PNG, PDF and PPTX fixtures."""
import argparse
import io
from pathlib import Path
import sys
import tempfile
import zipfile
sys.path.insert(0,str(Path(__file__).resolve().parents[1]/'server'))
from basic2_oral_media import render_upload,validate_pptx
from basic2_integrated_exam import ExamError

parser=argparse.ArgumentParser();parser.add_argument('--fixtures',required=True);args=parser.parse_args()
fixtures=Path(args.fixtures)
with tempfile.TemporaryDirectory(prefix='basic2-oral-converter-check-') as tmp:
    for filename,count in [('photo.png',1),('two-pages.pdf',2),('two-slides.pptx',2)]:
        file=fixtures/filename;pages=render_upload(file.suffix,file.read_bytes())
        assert len(pages)==count,(filename,len(pages))
        for n,data in enumerate(pages):
            assert data.startswith(b'\xff\xd8') and len(data)>1000
        print('PASS isolated conversion:',filename,len(pages),'pages',flush=True)
    try:render_upload('.pdf',b'not a PDF')
    except ExamError as e:assert e.message=='invalid_pdf'
    else:raise AssertionError('Accepted fake PDF')
    try:validate_pptx(b'not a ZIP')
    except ExamError as e:assert e.message=='invalid_powerpoint'
    else:raise AssertionError('Accepted fake PowerPoint')
    for xml in ['<Relationships><Relationship TargetMode="External" Target="https://example.com/image.png"/></Relationships>',
                '<Relationships><Relationship TargetMode="&#69;xternal" Target="https://example.com/image.png"/></Relationships>']:
        raw=io.BytesIO()
        with zipfile.ZipFile(fixtures/'two-slides.pptx') as original,zipfile.ZipFile(raw,'w') as modified:
            for entry in original.infolist():
                modified.writestr(entry,xml.encode('utf-16') if entry.filename=='_rels/.rels' else original.read(entry))
        try:validate_pptx(raw.getvalue())
        except ExamError as e:assert e.message=='external_powerpoint_links'
        else:raise AssertionError('Accepted external PowerPoint relationships')
    print('PASS invalid type rejection')
