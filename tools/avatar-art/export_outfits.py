import json, os
import numpy as np
from PIL import Image
import outfits as O
T = json.load(open('outfit_transforms.json'))
OUT = O.R
IDS = {n: n for n in O.FILES}
base = np.array(Image.open(O.A + 'base.png').convert('RGBA'))
# head: the base down to the chin, no feathering
h = base.copy(); h[O.CUT:, :, 3] = 0
head = Image.new('RGBA', (O.W, O.H), (0, 0, 0, 0)); head.alpha_composite(Image.fromarray(h, 'RGBA'), dest=(0, O.PAD)); head.save(OUT + 'head.png')
for old in [f for f in os.listdir(OUT) if f.startswith('outfit_')]:
    os.remove(OUT + old)
for n, t in T.items():
    im = Image.open(O.A + O.FILES[n]).convert('RGBA')
    if t.get('ntop', 0) >= 480:
        # the drawing has a chin shadow at the top of its neck; the base neck brings its own, so flatten this one
        arr = np.array(im)
        y0 = t['ntop'] - t['dy']                      # neck top in the outfit's own coordinates
        sub = arr[y0:y0 + 90, 495:630].astype(np.float32)
        r, g, b = sub[..., 0], sub[..., 1], sub[..., 2]
        mx, mn = sub[..., :3].max(axis=2), sub[..., :3].min(axis=2)
        skin = (sub[..., 3] > 200) & (r > g) & (g > b) & (mx > 170) & ((mx - mn) / (mx + 1e-6) > 0.1) & ((mx - mn) / (mx + 1e-6) < 0.45)
        lower = skin.copy(); lower[:40] = False
        if lower.sum() > 200:
            lum = sub[..., :3].mean(axis=2)
            light = np.median(sub[lower & (lum >= np.percentile(lum[lower], 60))][:, :3], axis=0)
            top = skin & (lum < light.mean() - 2)
            sub[top, :3] = light
            arr[y0:y0 + 90, 495:630] = sub.astype(np.uint8)
            im = Image.fromarray(arr, 'RGBA')
    layer = Image.new('RGBA', (O.W, O.H), (0, 0, 0, 0))
    layer.alpha_composite(im, dest=(round(t['dx']), round(t['dy']) + O.PAD))
    # neck filler from the base: rows 440..cut, soft at the bottom, drawn under the outfit's own pixels? no: over, so the neck is continuous
    cut = t['cut']; strip = base.copy()
    strip[:440, :, 3] = 0; strip[cut:, :, 3] = 0
    nt = int(t.get('ntop', 0))
    f0 = max(O.CUT, cut - 20) if nt + 10 <= cut - 20 or nt < O.CUT else max(nt + 4, cut - 14)
    for i, y in enumerate(range(f0, cut)):
        strip[y, :, 3] = (strip[y, :, 3] * (1 - (i + 1) / (cut - f0 + 1))).astype(np.uint8)
    s = Image.new('RGBA', (O.W, O.H), (0, 0, 0, 0)); s.alpha_composite(Image.fromarray(strip, 'RGBA'), dest=(0, O.PAD))
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
