"""Headphones and hair stick fitted to every hairstyle (the hair is a different height and shape in each)."""
import json
import os
import numpy as np
from PIL import Image
from acc import FILES, A

R = A + 'ready/'
W, H = 1122, 1552
HAIRS = ['topknot', 'ballerina', 'long', 'halfup', 'buns', 'braid', 'lowtail', 'ponytail', 'braids']
# top of the hair crown (canvas y), measured beside the bun / ponytail
CROWN = {'topknot': 47, 'ballerina': 75, 'long': 126, 'halfup': 45, 'buns': 84, 'braid': 65, 'lowtail': 93, 'ponytail': 94, 'braids': 83}
# hair stick: centre x, centre y, size, rotation (degrees, clockwise), mirrored?
STICK = json.load(open('stick.json')) if os.path.exists('stick.json') else {}
STICK_DEFAULT = {
    'topknot': (595, 105, 170, 0, False), 'ballerina': (590, 125, 150, 0, False), 'halfup': (585, 100, 140, 0, False),
    'buns': (745, 125, 150, 0, False), 'ponytail': (470, 150, 150, 0, True),
    'long': (655, 165, 170, -15, False), 'braid': (655, 165, 170, -15, False), 'lowtail': (655, 165, 170, -15, False), 'braids': (655, 165, 170, -15, False),
}


def tight(name):
    im = Image.open(A + FILES[name]).convert('RGBA')
    a = np.asarray(im)[..., 3]
    ys, xs = np.nonzero(a > 30)
    return im.crop((xs.min(), ys.min(), xs.max() + 1, ys.max() + 1))


def headphones(hair):
    raw = tight('headphones')
    w_t = 460
    h_t = round(raw.height * w_t / raw.width)
    raw = raw.resize((w_t, h_t), Image.LANCZOS)
    arc_h = round(h_t * 0.20)
    side_end = round(h_t * 0.45)
    cups_h = h_t - side_end
    cups_top = 460 - round(cups_h * 0.46)          # the cups are centred on the ears (y 460)
    apex = CROWN[hair] + 36
    side_h = max(20, cups_top - (apex + arc_h))
    arc = raw.crop((0, 0, w_t, arc_h))
    side = raw.crop((0, arc_h, w_t, side_end)).resize((w_t, side_h), Image.LANCZOS)
    cups = raw.crop((0, side_end, w_t, h_t))
    c = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    x0 = 560 - w_t // 2
    c.alpha_composite(arc, dest=(x0, apex))
    c.alpha_composite(side, dest=(x0, apex + arc_h))
    c.alpha_composite(cups, dest=(x0, apex + arc_h + side_h))
    return c


def kanzashi(hair):
    cx, cy, size, rot, flip = STICK.get(hair, STICK_DEFAULT[hair])
    raw = tight('kanzashi')
    k = size / max(raw.size)
    raw = raw.resize((round(raw.width * k), round(raw.height * k)), Image.LANCZOS)
    if flip:
        raw = raw.transpose(Image.FLIP_LEFT_RIGHT)
    if rot:
        raw = raw.rotate(-rot, expand=True, resample=Image.BICUBIC)
    c = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    c.alpha_composite(raw, dest=(round(cx - raw.width / 2), round(cy - raw.height / 2)))
    return c


def build():
    for h in HAIRS:
        headphones(h).save(R + f'acc_headphones_{h}.png')
        kanzashi(h).save(R + f'acc_kanzashi_{h}.png')


if __name__ == '__main__':
    from accgrid import grid
    build()
    for a in ('headphones', 'kanzashi'):
        grid(a, f'fit_{a}.png', {h: (f'acc_{a}_{h}',) for h in HAIRS})
