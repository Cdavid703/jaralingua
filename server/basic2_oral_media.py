"""Bounded, isolated conversion of Basic 2 presentation uploads into JPEG pages."""
import base64
import io
import json
import os
from pathlib import Path
import re
import shutil
import subprocess
import sys
import tempfile
import threading
import zipfile
from xml.etree import ElementTree

from basic2_integrated_exam import ExamError, need, clean

MAX_FILE = 15 * 1024 * 1024
MAX_PAGES = 30
MAX_RENDERED = 35 * 1024 * 1024
CONVERSIONS = threading.BoundedSemaphore(2)
EXTENSIONS = {'.jpg', '.jpeg', '.png', '.webp', '.pdf', '.pptx'}


def decode_upload(payload):
    name = clean(payload.get('name'), 120, 1)
    need('/' not in name and '\\' not in name and not any(ord(c) < 32 for c in name), 400, 'invalid_filename')
    suffix = Path(name).suffix.lower()
    need(suffix in EXTENSIONS, 415, 'unsupported_file')
    value = payload.get('data')
    need(isinstance(value, str) and len(value) <= (MAX_FILE * 4 // 3) + 4, 413, 'file_too_large')
    try:
        raw = base64.b64decode(value, validate=True)
    except Exception:
        raise ExamError(400, 'invalid_file')
    need(0 < len(raw) <= MAX_FILE, 413, 'file_too_large')
    return name, suffix, raw


def validate_pptx(raw):
    try:
        with zipfile.ZipFile(io.BytesIO(raw)) as archive:
            entries = archive.infolist()
            names = {p.filename for p in entries}
            need(len(entries) < 3000 and sum(p.file_size for p in entries) <= 80*1024*1024, 413, 'presentation_too_large')
            need('ppt/presentation.xml' in names and '[Content_Types].xml' in names, 415, 'invalid_powerpoint')
            need(not any('..' in Path(p).parts or p.startswith('/') or '\\' in p for p in names), 415, 'invalid_powerpoint')
            need(not any('vba' in p.lower() or '/embeddings/' in p or '/activeX/' in p for p in names), 415, 'unsupported_embedded_content')
            slides = [p for p in names if re.fullmatch(r'ppt/slides/slide\d+\.xml', p)]
            need(1 <= len(slides) <= MAX_PAGES, 413, 'too_many_pages')
            # External links can be loaded by Office importers. Require self-contained decks.
            for p in entries:
                if p.filename.endswith('.rels'):
                    need(p.file_size < 1024*1024, 415, 'invalid_powerpoint')
                    relationships = archive.read(p)
                    need(b'<!DOCTYPE' not in relationships.upper() and b'<!ENTITY' not in relationships.upper(),415,'invalid_powerpoint')
                    need(not any(node.get('TargetMode','').lower()=='external' for node in ElementTree.fromstring(relationships)),
                         415,'external_powerpoint_links')
    except (zipfile.BadZipFile, RuntimeError, KeyError, ElementTree.ParseError):
        raise ExamError(415, 'invalid_powerpoint')


def render_upload(suffix, raw):
    need(CONVERSIONS.acquire(blocking=False), 429, 'converter_busy')
    try:
        if suffix == '.pdf':
            need(raw.startswith(b'%PDF-'), 415, 'invalid_pdf')
        if suffix == '.pptx':
            validate_pptx(raw)
        with tempfile.TemporaryDirectory(prefix='basic2-oral-render-') as folder:
            root = Path(folder)
            (root/('input'+suffix)).write_bytes(raw)
            worker = Path(__file__).resolve()
            # Production always uses the network-free bwrap namespace. Only a synthetic
            # developer test may run the bounded worker directly on macOS.
            if sys.platform == 'linux':
                need(shutil.which('bwrap'), 503, 'converter_unavailable')
                command = ['bwrap','--die-with-parent','--unshare-all','--new-session',
                    '--ro-bind','/usr','/usr','--ro-bind','/bin','/bin','--ro-bind','/lib','/lib',
                    '--ro-bind-try','/lib64','/lib64','--ro-bind','/etc/fonts','/etc/fonts',
                    '--ro-bind-try','/var/cache/fontconfig','/var/cache/fontconfig',
                    '--ro-bind','/etc/libreoffice','/etc/libreoffice',
                    '--proc','/proc','--dev','/dev','--tmpfs','/tmp',
                    '--ro-bind',str(worker),'/code/basic2_oral_media.py',
                    '--ro-bind',str(worker.parent/'basic2_integrated_exam.py'),'/code/basic2_integrated_exam.py',
                    '--bind',folder,'/work',
                    '--chdir','/work','--setenv','HOME','/work',
                    '/usr/bin/python3','/code/basic2_oral_media.py','--worker',suffix]
            else:
                command = [sys.executable,str(worker),'--worker',suffix]
            try:
                result = subprocess.run(command,cwd=folder,stdout=subprocess.PIPE,stderr=subprocess.PIPE,timeout=100,
                                        env={'PATH':'/usr/bin:/bin','LANG':'C.UTF-8'})
            except subprocess.TimeoutExpired:
                raise ExamError(422,'conversion_timeout')
            if result.returncode:
                try:
                    error = json.loads(result.stdout.decode().splitlines()[-1])['error']
                except Exception:
                    error = 'conversion_failed'
                raise ExamError(422,error)
            pages = sorted(root.glob('page-*.jpg'))
            need(1 <= len(pages) <= MAX_PAGES,422,'conversion_failed')
            need(sum(p.stat().st_size for p in pages) <= MAX_RENDERED,413,'presentation_too_large')
            return [p.read_bytes() for p in pages]
    finally:
        CONVERSIONS.release()


def worker(suffix):
    import resource
    from PIL import Image, ImageOps
    resource.setrlimit(resource.RLIMIT_CPU,(80,80))
    if sys.platform == 'linux':
        resource.setrlimit(resource.RLIMIT_AS,(1536*1024*1024,1536*1024*1024))
    resource.setrlimit(resource.RLIMIT_FSIZE,(MAX_RENDERED,MAX_RENDERED))
    Image.MAX_IMAGE_PIXELS = 25_000_000
    source = Path('input'+suffix)
    if suffix in ('.jpg','.jpeg','.png','.webp'):
        try:
            with Image.open(source) as original:
                need(original.format in ('JPEG','PNG','WEBP'),415,'invalid_image')
                need(original.width*original.height <= 25_000_000,413,'image_too_large')
                picture = ImageOps.exif_transpose(original).convert('RGBA')
                background = Image.new('RGBA',picture.size,'white')
                picture = Image.alpha_composite(background,picture).convert('RGB')
                picture.thumbnail((1920,1920))
                picture.save('page-001.jpg',quality=88)
        except (OSError, ValueError, Image.DecompressionBombError):
            raise ExamError(415,'invalid_image')
        return
    if suffix == '.pptx':
        need(shutil.which('libreoffice'),503,'converter_unavailable')
        profile = Path('office-profile').resolve(); profile.mkdir()
        (profile/'user').mkdir()
        (profile/'user/registrymodifications.xcu').write_text(
            '<?xml version="1.0"?><oor:items xmlns:oor="http://openoffice.org/2001/registry">'
            '<item oor:path="/org.openoffice.Office.Common/Security/Scripting">'
            '<prop oor:name="MacroSecurityLevel" oor:op="fuse"><value>3</value></prop></item></oor:items>')
        subprocess.run(['libreoffice','-env:UserInstallation='+profile.as_uri(),
            '--headless','--nologo','--nodefault','--norestore','--convert-to','pdf:impress_pdf_Export',
            '--outdir','.',str(source)],check=True,timeout=65,stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL)
        source = Path('input.pdf')
    need(shutil.which('pdfinfo') and shutil.which('pdftoppm'),503,'converter_unavailable')
    info = subprocess.run(['pdfinfo',str(source)],check=True,stdout=subprocess.PIPE,stderr=subprocess.DEVNULL,timeout=10).stdout.decode()
    match = re.search(r'^Pages:\s+(\d+)',info,re.M)
    need(match and 1 <= int(match[1]) <= MAX_PAGES,413,'too_many_pages')
    subprocess.run(['pdftoppm','-jpeg','-jpegopt','quality=88','-scale-to','1600',str(source),'render'],
                   check=True,timeout=65,stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL)
    pages = sorted(Path('.').glob('render-*.jpg'),key=lambda p:int(p.stem.split('-')[-1]))
    for index,p in enumerate(pages,1):
        p.rename(f'page-{index:03}.jpg')


if __name__ == '__main__':
    try:
        need(len(sys.argv)==3 and sys.argv[1]=='--worker' and sys.argv[2] in EXTENSIONS,400,'invalid_file')
        worker(sys.argv[2])
    except Exception as error:
        print(json.dumps({'error':error.message if isinstance(error,ExamError) else 'conversion_failed'}))
        sys.exit(1)
