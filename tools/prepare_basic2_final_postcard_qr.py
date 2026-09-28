"""Build the static vector QR for the new exam page."""
import sys
from pathlib import Path
ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / 'tmp/unit5-explanation/python-deps'))
import qrcode
import qrcode.image.svg

qrcode.make('https://www.jaralingua.com/ingles/basico-2/basic-course-2-final-writing-task.html',
            image_factory=qrcode.image.svg.SvgPathImage, border=4).save(
    ROOT / 'assets/img/page-qr/ingles-basico-2-basic-course-2-final-writing-task.svg')
