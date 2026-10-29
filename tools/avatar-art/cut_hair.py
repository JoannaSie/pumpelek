"""Split each hairstyle sheet into back/front halves; the sheets already carry real transparency, so just clean the alpha."""
import os
import numpy as np
from PIL import Image

SRC = '/private/tmp/claude-501/-Users-joannasieniawska-Documents-Pumpelek/85fd9c83-cdc1-4b9f-aa86-60432083199b/images'
OUT = '/Users/joannasieniawska/Documents/Pumpelek/art/hair'
os.makedirs(OUT, exist_ok=True)

NAMES = {4: 'ballerina', 5: 'long', 6: 'ponytail', 7: 'braid', 8: 'topknot', 9: 'buns', 10: 'lowtail', 11: 'halfup', 12: 'braids'}


def clean(im):
    a = np.array(im.convert('RGBA'))
    al = a[..., 3].astype(np.float32)
    al[al < 10] = 0
    al = np.clip(al / 250.0, 0, 1) * 255
    a[..., 3] = al.astype(np.uint8)
    a[a[..., 3] == 0, :3] = 0
    return Image.fromarray(a)


rows = []
for n, name in NAMES.items():
    img = Image.open(f'{SRC}/{n}.webp')
    w, h = img.size
    mid = w // 2
    for side, box in (('back', (0, 0, mid - 16, h)), ('front', (mid + 16, 0, w, h))):
        im = clean(img.crop(box))
        bbox = im.getbbox()
        im.save(f'{OUT}/hair_{name}_{side}.png')
        rows.append((name, side, im.size, bbox))
for r in rows:
    print(*r)
