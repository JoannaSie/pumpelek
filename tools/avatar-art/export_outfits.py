import json, os
import numpy as np
from PIL import Image
import outfits as O
import skin2
from scipy import ndimage as ndi
T = json.load(open('outfit_transforms.json'))
OUT = O.R
IDS = {n: n for n in O.FILES}
HOODED = set(O.FILES) - {'wintersweater', 'kimono'}   # every outfit whose neck shows; the scarf one hides it
base = np.array(Image.open(O.A + 'base.png').convert('RGBA'))
# head: the base down to the chin, no feathering
h = base.copy(); h[O.CUT:, :, 3] = 0
head = Image.new('RGBA', (O.W, O.H), (0, 0, 0, 0)); head.alpha_composite(Image.fromarray(h, 'RGBA'), dest=(0, O.PAD)); head.save(OUT + 'head.png')
for old in [f for f in os.listdir(OUT) if f.startswith('outfit_')]:
    os.remove(OUT + old)
for n, t in T.items():
    im = Image.open(O.A + O.FILES[n]).convert('RGBA')
    if n in HOODED:
        # the drawing has a chin shadow at the top of its neck; the base neck brings its own, so flatten this one
        arr = np.array(im)
        y0 = t['ntop'] - t['dy']                      # neck top in the outfit's own coordinates
        sub = arr[y0:y0 + 90, 495:630].astype(np.float32)
        r, g, b = sub[..., 0], sub[..., 1], sub[..., 2]
        mx, mn = sub[..., :3].max(axis=2), sub[..., :3].min(axis=2)
        skin = (sub[..., 3] > 200) & (r > g) & (g > b) & (mx > 170) & ((mx - mn) / (mx + 1e-6) > 0.18) & ((mx - mn) / (mx + 1e-6) < 0.45)   # a beige hood is less saturated than skin
        lower = skin.copy(); lower[:40] = False
        if lower.sum() > 200:
            lum = sub[..., :3].mean(axis=2)
            light = np.median(sub[lower & (lum >= np.percentile(lum[lower], 60))][:, :3], axis=0)
            top = skin & (lum < light.mean() - 2)
            sub[top, :3] = light
            # the drawn chin outline across the top of the neck goes too (the side outlines stay)
            nrows = max(6, min(34, t['cut'] - t['ntop'] - 2))   # never paint into the collar below the neck
            mid = sub[:nrows, 25:110]
            mid[..., :3] = light
            mid[..., 3] = 255
            sub[:nrows, 25:110] = mid
            # a thin leftover of the drawn chin line lower down: dark pixels with skin directly above and below
            blk = (sub[..., 3] > 60) & (sub[..., :3].mean(axis=2) < 140)
            skn = skin | (np.abs(sub[..., :3] - light).sum(axis=2) < 60)
            up = np.zeros_like(skn); dn = np.zeros_like(skn)
            for k in range(3, 8):
                up[k:] |= skn[:-k]; dn[:-k] |= skn[k:]
            fix = (blk | (sub[..., 3] < 250)) & up & dn
            fix = fix | (ndi.binary_dilation(fix, iterations=3) & (blk | (sub[..., 3] < 250)))
            fix[:, :20] = False; fix[:, 115:] = False
            sub[fix, :3] = light; sub[fix, 3] = 255
            arr[y0:y0 + 90, 495:630] = sub.astype(np.uint8)
            im = Image.fromarray(arr, 'RGBA')
    if n == 'kimono':
        # the kimono has an empty V where the neck should go: fill it with the base's neck (shadow included), so the neck runs into the collar
        arr = np.array(im)
        hole = np.zeros(arr.shape[:2], bool)
        hole[478:541, 488:635] = True
        hole[478:491, :507] = False; hole[478:491, 619:] = False   # not beside the neck, where the background shows
        hole &= arr[..., 3] < 20
        flat = base[500, 540:585, :3].astype(float).mean(axis=0)   # plain light skin below the chin shadow
        for y in range(478, 541):
            for x in np.nonzero(hole[y])[0]:
                src = base[y, x] if (y <= 499 and base[y, x, 3] > 200) else None
                arr[y, x, :3] = (src[:3] if src is not None else flat).astype(np.uint8)
                arr[y, x, 3] = 255
        im = Image.fromarray(arr, 'RGBA')
    layer = Image.new('RGBA', (O.W, O.H), (0, 0, 0, 0))
    layer.alpha_composite(im, dest=(round(t['dx']), round(t['dy']) + O.PAD))
    if n in HOODED:
        # the outfit's own skin is a little pinker than the base's: bring it to the same colour
        arr = np.array(layer)
        rgbf = arr[..., :3].astype(np.float32)
        sk = skin2.mask_outfit(rgbf, arr[..., 3], n == 'sundress')
        yy = t['ntop'] + O.PAD
        zone = np.zeros_like(sk); zone[yy + 10:yy + 130, 500:620] = True
        zl = sk & zone & (rgbf.mean(axis=2) > 200)
        row = base[496, 500:625]
        ok = (row[:, 3] > 200) & (row[:, :3].mean(axis=1) > 200)
        if zl.sum() > 200 and ok.sum() > 20:
            mine = np.median(rgbf[zl], axis=0)
            gain = np.median(row[ok][:, :3], axis=0) / mine
            # only pixels that really are this outfit's skin (not a beige hood next to it)
            sk = sk & (np.abs(rgbf - mine).sum(axis=2) < 90)
            arr[..., :3] = np.where(sk[..., None], np.clip(rgbf * gain, 0, 255), rgbf).astype(np.uint8)
            layer = Image.fromarray(arr, 'RGBA')
    # neck filler from the base: rows 440..cut, soft at the bottom, drawn under the outfit's own pixels? no: over, so the neck is continuous
    cut = t['cut']; strip = base.copy()
    strip[:440, :, 3] = 0
    if cut > 500:
        # below row 496 the base neck flares out into the shoulders, which does not fit a hood or collar:
        # carry the straight neck down instead
        row = strip[496].copy()
        lum = row[:, :3].astype(float).mean(axis=1)
        lit = (row[:, 3] > 200) & (lum > 150)
        if lit.sum() > 20:
            # keep the outlines at the sides but drop the tail of the chin shadow in the middle
            light = np.median(row[lit & (lum >= np.percentile(lum[lit], 60))][:, :3], axis=0)
            row[lit, :3] = light.astype(np.uint8)
        strip[496:cut] = row
    strip[cut:, :, 3] = 0
    nt = int(t.get('ntop', 0))
    f0 = cut - 3 if cut == 504 else (max(O.CUT, cut - 20) if nt + 10 <= cut - 20 or nt < O.CUT else max(nt + 4, cut - 14))
    for i, y in enumerate(range(f0, cut)):
        strip[y, :, 3] = (strip[y, :, 3] * (1 - (i + 1) / (cut - f0 + 1))).astype(np.uint8)
    s = Image.new('RGBA', (O.W, O.H), (0, 0, 0, 0)); s.alpha_composite(Image.fromarray(strip, 'RGBA'), dest=(0, O.PAD))
    if n == 'wintersweater':
        # the neck comes up out of the white turtleneck, in front of the dark inside of the scarf:
        # draw it over the outfit, but only above the top edge of the white collar (column by column)
        sa = np.array(s)
        # the neck goes down to the inner front edge of the turtleneck: a shallow smile-shaped curve (marked by hand on the picture)
        for x in range(sa.shape[1]):
            lim = int(round(709 - 14 * ((x - 561) / 58.0) ** 2)) - 2
            sa[max(lim, 0):, x, 3] = 0
        layer = Image.alpha_composite(layer, Image.fromarray(sa, 'RGBA'))
    elif n == 'kimono':
        layer = Image.alpha_composite(s, layer)   # the collar is in front of the neck
    else:
        layer = Image.alpha_composite(layer, s)
    layer.save(f'{OUT}outfit_{IDS[n]}.png')
print(sorted(f for f in os.listdir(OUT) if f.startswith('outfit_') or f == 'head.png'))
# check from the exported files only
tiles = []
for n in ('sporty', 'sundress', 'oversized', 'school', 'wintersweater', 'kimono', 'ninja'):
    c = Image.new('RGBA', (O.W, O.H), (222, 216, 206, 255))
    for l in ('hair_ballerina_back', 'outfit_' + n, 'head', 'hair_ballerina_front'):
        c = Image.alpha_composite(c, Image.open(f'{OUT}{l}.png'))
    tiles.append(c.convert('RGB').resize((280, 388)))
sheet = Image.new('RGB', (280 * 7, 388))
for i, t in enumerate(tiles): sheet.paste(t, (i * 280, 0))
sheet.save('export_check.png')
