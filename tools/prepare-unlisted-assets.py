#!/usr/bin/env python3
"""One-time reviewed derivatives; needs PyMuPDF and jpegtran. Never alters originals."""
import hashlib,json,re,subprocess,sys
from pathlib import Path
import pymupdf
from PIL import Image
ROOT=Path(__file__).resolve().parents[1]
OUTPUT=ROOT/'public/unlisted-reviewed'
def prepare():
    records={}
    for relative in json.loads((ROOT/'src/_data/unlisted-assets.json').read_text()):
        source=ROOT/relative;target=OUTPUT/relative
        if source.suffix=='.pdf':
            target.parent.mkdir(parents=True,exist_ok=True)
            doc=pymupdf.open(source);page=doc[0]
            old='(626) 524-8156' if 'DataAnnotation' in relative else '626-524-8156'
            new='(805) 500-8865' if 'DataAnnotation' in relative else '805-500-8865'
            rects=page.search_for(old);assert len(rects)==1
            span=next(s for b in page.get_text('dict')['blocks'] for l in b.get('lines',[]) for s in l['spans'] if old in s['text'])
            font_name='NotoSerif-Regular.ttf' if 'DataAnnotation' in relative else 'LiberationSans-Regular.ttf'
            font_bytes=(Path(sys.argv[1])/font_name).read_bytes()
            font=pymupdf.Font(fontbuffer=font_bytes)
            assert all(font.has_glyph(ord(c)) for c in new)
            box=rects[0]
            assert font.text_length(new,fontsize=span['size'])<=box.width+.5
            page.add_redact_annot(box,fill=(1,1,1));page.apply_redactions(images=0,graphics=0)
            page.insert_font(fontname='UpdatedPhone',fontbuffer=font_bytes)
            color=tuple(((span['color']>>shift)&255)/255 for shift in (16,8,0))
            page.insert_text((box.x0,span['origin'][1]),new,fontsize=span['size'],fontname='UpdatedPhone',color=color)
            doc.set_metadata({});doc.del_xml_metadata()
            doc.save(target,garbage=4,deflate=True,no_new_id=True)
            # All content other than the phone stays present, regardless of PDF extraction order.
            after=pymupdf.open(target);text=' '.join(p.get_text() for p in after)
            assert new in text and old not in text
            before=' '.join(p.get_text() for p in pymupdf.open(source))
            tokenize=lambda s:sorted(re.findall(r'\S+',s))
            assert tokenize(before.replace(old,''))==tokenize(text.replace(new,''))
            reason='Correct approved public phone; remove document metadata; preserve layout and other text'
        elif source.suffix=='.jpg':
            with Image.open(source) as image:
                if not (image.getexif() or image.info.get('icc_profile') or image.info.get('photoshop')):continue
                assert image.getexif().get(274,1)==1,'Orientation requires explicit normalization'
                original_pixels=image.tobytes()
            target.parent.mkdir(parents=True,exist_ok=True)
            subprocess.run(['jpegtran','-copy','none','-outfile',str(target),str(source)],check=True)
            with Image.open(target) as image:
                assert not image.getexif() and not image.info.get('icc_profile') and not image.info.get('photoshop')
                assert image.tobytes()==original_pixels,'Lossless derivative changed decoded pixels'
            reason='Lossless removal of EXIF, Photoshop and ICC metadata; identical decoded pixels'
        else:continue
        records[relative]={'source':target.relative_to(ROOT).as_posix(),'sha256':hashlib.sha256(target.read_bytes()).hexdigest(),'original_sha256':hashlib.sha256(source.read_bytes()).hexdigest(),'reason':reason}
    (ROOT/'src/_data/unlisted-derivatives.json').write_text(json.dumps(records,indent=2)+'\n')
    print(f'Prepared {len(records)} reviewed derivatives; originals unchanged.')
if __name__=='__main__':prepare()
