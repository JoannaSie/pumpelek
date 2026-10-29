"""Put every outfit under the base head: the outfit supplies neck, shoulders, arms and hands; the base supplies only the head."""
import json
import os
import sys
import numpy as np
from PIL import Image, ImageDraw

A = '/Users/joannasieniawska/Documents/Pumpelek/art/'
R = A + 'ready/'
PAD = 150
CUT = 458          # the base is kept down to the chin; below it the outfit's own neck is used
W, H = 1122, 1402 + PAD

FILES = {n: f'outfits/outfit_{n}.png' for n in ('sporty', 'raincoat', 'blazer', 'sweaterskirt', 'wintersweater', 'haori', 'sundress', 'school', 'oversized', 'ninja', 'casual', 'outdoor', 'coat', 'pajamas', 'kimono')}


def width_profile(a):
    prof = {}
    for y in range(a.shape[0]):
        xs = np.nonzero(a[y])[0]
        prof[y] = (xs.min(), xs.max()) if len(xs) else None
    return prof


def y_cross(a, w):
    for y in range(a.shape[0]):
        xs = np.nonzero(a[y])[0]
        if len(xs) and xs.max() - xs.min() >= w:
            return y
    return None


def head_layer(cut=CUT):
    b = Image.open(A + 'base.png').convert('RGBA')
    arr = np.array(b)
    arr[cut:, :, 3] = 0
    # soft lower edge so the neck stump blends into the outfit's own neck
    f0 = max(CUT, cut - 20)
    for i, y in enumerate(range(f0, cut)):
        arr[y, :, 3] = (arr[y, :, 3] * (1 - (i + 1) / (cut - f0 + 1))).astype(np.uint8)
    out = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    out.alpha_composite(Image.fromarray(arr, 'RGBA'), dest=(0, PAD))
    return out


def place(name, over=None):
    im = Image.open(A + FILES[name]).convert('RGBA')
    a = np.asarray(im)[..., 3] > 40
    yb = y_cross(np.asarray(Image.open(A + 'base.png'))[..., 3] > 40, 360)
    yo = y_cross(a, 360)
    dy = (yb - yo) if yo is not None else 0
    dx = 0
    s = 1.0
    if over:
        s *= over.get('s', 1)
        dx += over.get('dx', 0)
        dy += over.get('dy', 0)
    # where the outfit's own neck starts (middle columns), so the base neck can fill the gap under the chin
    band = a[:, 530:597].any(axis=1)
    top_c = int(np.argmax(band)) if band.any() else 0
    # first row of the central strip that is no longer neck skin = where the collar / scarf starts
    rgb = np.asarray(im)[..., :3].astype(int)
    skin = np.median(rgb[top_c + 12:top_c + 18, 548:578].reshape(-1, 3), axis=0)
    coll = None
    run = 0
    for y in range(top_c + 12, im.height):
        px = np.median(rgb[y, 548:578], axis=0)
        if a[y, 548:578].mean() < 0.5 or np.abs(px - skin).sum() > 90:
            run += 1
            if run >= 4:
                coll = y - 3
                break
        else:
            run = 0
    coll = (coll if coll is not None else im.height) * s + dy
    ntop = int(top_c * s + dy)
    base_cut = max(CUT, min(500, coll - 6))
    if ntop + 10 > base_cut:
        # the outfit's neck starts below the chin: cover its top edge with the base neck, then fade
        cut = int(max(ntop + 10, min(ntop + 46, coll - 4)))
    else:
        cut = int(base_cut)
    if over and 'cut' in over:
        cut = over['cut']
    return dict(s=s, dx=dx, dy=dy, cut=cut, ntop=ntop)


def render(name, t, hair='topknot'):
    c = Image.new('RGBA', (W, H), (222, 216, 206, 255))
    c = Image.alpha_composite(c, Image.open(R + f'hair_{hair}_back.png'))
    im = Image.open(A + FILES[name]).convert('RGBA')
    if t['s'] != 1:
        im = im.resize((round(im.width * t['s']), round(im.height * t['s'])), Image.LANCZOS)
    o = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    o.alpha_composite(im, dest=(round(t['dx']), round(t['dy']) + PAD)) if round(t['dx']) >= 0 and round(t['dy']) + PAD >= 0 else o.paste(im, (round(t['dx']), round(t['dy']) + PAD), im)
    c = Image.alpha_composite(c, o)
    c = Image.alpha_composite(c, head_layer(t['cut']))
    c = Image.alpha_composite(c, Image.open(R + f'hair_{hair}_front.png'))
    return c


if __name__ == '__main__':
    over = json.load(open('outfit_over.json')) if os.path.exists('outfit_over.json') else {}
    T = {n: place(n, over.get(n)) for n in FILES}
    json.dump(T, open('outfit_transforms.json', 'w'), indent=1)
    names = list(FILES)
    tiles = []
    for i, n in enumerate(names):
        t = render(n, T[n]).convert('RGB').resize((280, 388))
        ImageDraw.Draw(t).text((4, 4), f'{i} {n}', fill=(255, 0, 0))
        tiles.append(t)
        print(n, {k: round(v, 1) for k, v in T[n].items()})
    sheet = Image.new('RGB', (280 * 7, 388 * 2), (255, 255, 255))
    for i, t in enumerate(tiles):
        sheet.paste(t, ((i % 7) * 280, (i // 7) * 388))
    sheet.save('outfits_fit.png')
