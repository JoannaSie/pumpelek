"""Build the web assets: every avatar layer cropped to its content, halved in size, saved as WebP, plus a manifest of positions."""
import json
import os
import sys
import numpy as np
from PIL import Image

import haircolor
import skin2

R = '/Users/joannasieniawska/Documents/Pumpelek/art/ready/'
OUT = '/Users/joannasieniawska/Documents/Pumpelek/img/avatar/'
os.makedirs(OUT, exist_ok=True)
W, H = 1122, 1552
SCALE = 0.5
HAIRS = ['topknot', 'ballerina', 'long', 'halfup', 'buns', 'braid', 'lowtail', 'ponytail', 'braids']
OUTFITS = ['kimono', 'school', 'casual', 'sporty', 'coat', 'sundress', 'sweaterskirt', 'raincoat', 'haori', 'outdoor', 'blazer', 'wintersweater', 'oversized', 'pajamas', 'ninja']
ACCS = ['bow', 'flower', 'catears', 'crown', 'freckles']   # the same picture on every hairstyle
FITTED = ['headphones', 'kanzashi']                        # drawn separately for each hairstyle
PETS = ['cat', 'dog', 'bunny', 'fox', 'panda', 'penguin', 'unicorn', 'dragon']
SKINS = ['s0', 's1', 's2', 's3', 's4', 's5']
TONES = skin2.TONES
manifest = {}
total = 0


def save(key, img):
    """key like 'hair:topknot:back:black' -> file name; stores [x, y, w, h] in canvas units."""
    global total
    a = np.asarray(img)[..., 3]
    ys, xs = np.nonzero(a > 6)
    if not len(xs):
        return
    x0, y0, x1, y1 = int(xs.min()), int(ys.min()), int(xs.max()) + 1, int(ys.max()) + 1
    crop = img.crop((x0, y0, x1, y1))
    w, h = max(1, round(crop.width * SCALE)), max(1, round(crop.height * SCALE))
    crop = crop.resize((w, h), Image.LANCZOS)
    name = key.replace(':', '_') + '.webp'
    crop.save(OUT + name, 'WEBP', quality=82, alpha_quality=92, method=4)
    total += os.path.getsize(OUT + name)
    manifest[key] = [x0, y0, x1 - x0, y1 - y0]


def op(name):
    return Image.open(R + name + '.png').convert('RGBA')


if __name__ == '__main__':
    part = sys.argv[1] if len(sys.argv) > 1 else 'all'
    if part in ('all', 'head'):
        head = op('head')
        for i, s in enumerate(SKINS):
            save(f'head:{s}', head if i == 0 else skin2.recolor(head, TONES[i], 'head'))
        for a in ACCS:
            save(f'acc:{a}', op('acc_' + a))
        for a in FITTED:
            for h in HAIRS:
                save(f'acc:{a}:{h}', op(f'acc_{a}_{h}'))
        for p in PETS:
            save(f'pet:{p}', op('pet_' + p))
    if part in ('all', 'outfit'):
        for o in OUTFITS:
            img = op('outfit_' + o)
            for i, s in enumerate(SKINS):
                save(f'outfit:{o}:{s}', img if i == 0 else skin2.recolor(img, TONES[i], 'outfit', o == 'sundress'))
            print('outfit', o, flush=True)
    if part in ('all', 'hair'):
        for h in HAIRS:
            for side in ('back', 'front'):
                img = op(f'hair_{h}_{side}')
                for c in haircolor.COLORS:
                    save(f'hair:{h}:{side}:{c}', haircolor.recolor(img, c))
            print('hair', h, flush=True)
    json.dump(manifest, open(f'/private/tmp/claude-501/-Users-joannasieniawska-Projects-Diet-Assistance/85fd9c83-cdc1-4b9f-aa86-60432083199b/scratchpad/manifest_{part}.json', 'w'))
    print(part, 'files', len(manifest), 'bytes', total)
