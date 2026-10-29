"""Fit every hairstyle to the base head by search:
the hair must cover the bald skull, leave the face (eyes, nose, mouth) uncovered, and be as small as that allows."""
import json
import os
import numpy as np
from PIL import Image
from scipy.signal import fftconvolve

ART = '/Users/joannasieniawska/Documents/Pumpelek/art'
SP = os.path.dirname(os.path.abspath(__file__))
names = ['topknot', 'ballerina', 'long', 'halfup', 'buns', 'braid', 'lowtail', 'ponytail', 'braids']
Q = 4  # work at 1/4 resolution

base = np.asarray(Image.open(f'{ART}/base.png'))
al = base[..., 3] > 40
H, W = al.shape

# skull: the bald head above the brows
skull = np.zeros_like(al)
skull[54:250] = al[54:250]
# face: the part that has to stay visible, from just under the brows to the chin
CX = 560
def face_mask(shrink):
    m = np.zeros_like(al)
    for y in range(262, 452):
        w = np.interp(y, prof_y, prof_w) / 2 - shrink
        m[y, int(CX - w):int(CX + w)] = True
    return m


prof_y = [262, 300, 340, 370, 400, 430, 450]
prof_w = [296, 290, 262, 228, 190, 120, 40]


def small(m):
    return np.asarray(Image.fromarray((m * 255).astype(np.uint8)).resize((m.shape[1] // Q, m.shape[0] // Q), Image.BILINEAR)) > 100


S = small(skull).astype(np.float32)
nS = S.sum()
SHRINK = {}


def fit(name):
    F = small(face_mask(SHRINK.get(name, 8))).astype(np.float32)
    nF = F.sum()
    f = np.asarray(Image.open(f'{ART}/hair/hair_{name}_front.png'))[..., 3] > 60
    b = np.asarray(Image.open(f'{ART}/hair/hair_{name}_back.png'))[..., 3] > 60
    w = max(f.shape[1], b.shape[1])
    f = np.pad(f, ((0, 0), (0, w - f.shape[1])))
    b = np.pad(b, ((0, 0), (0, w - b.shape[1])))
    u = f | b
    best = None
    for s in np.arange(0.40, 1.60, 0.02):
        sw, sh = int(f.shape[1] * s / Q), int(f.shape[0] * s / Q)

        def rs(m):
            return (np.asarray(Image.fromarray((m * 255).astype(np.uint8)).resize((sw, sh), Image.BILINEAR)) > 100).astype(np.float32)

        U, Fr = rs(u), rs(f)
        cov = fftconvolve(S, Fr[::-1, ::-1], mode="full") / nS
        ovl = fftconvolve(F, Fr[::-1, ::-1], mode='full') / nF
        # keep the hair roughly centred on the head so the search cannot pick a far-off spot
        iy, ix = np.mgrid[0:cov.shape[0], 0:cov.shape[1]]
        sc = cov - 3 * ovl
        ok = (cov >= 0.985) & (ovl <= 0.02)
        if ok.any():
            # among the valid placements prefer the one where the hole is centred on the face
            dxs = (ix - (sw - 1)) * Q
            # centre of the hair's face opening vs face centre: use the hair bbox centre of the front layer
            ys, xs = np.nonzero(f)
            cxh = (xs.min() + xs.max()) / 2 * s
            off = np.abs(dxs + cxh - CX)
            sc2 = np.where(ok, -off, -1e9)
            k = np.unravel_index(np.argmax(sc2), sc2.shape)
            return dict(s=float(s), dx=float((k[1] - (sw - 1)) * Q), dy=float((k[0] - (sh - 1)) * Q), cov=float(cov[k]), ovl=float(ovl[k]), ok=True)
        k = np.unravel_index(np.argmax(sc), sc.shape)
        if best is None or sc[k] > best[0]:
            best = (sc[k], dict(s=float(s), dx=float((k[1] - (sw - 1)) * Q), dy=float((k[0] - (sh - 1)) * Q), cov=float(cov[k]), ovl=float(ovl[k]), ok=False))
    return best[1]


if __name__ == '__main__':
    out = {}
    for n in names:
        t = fit(n)
        out[n] = t
        print(n, {k: (round(v, 3) if isinstance(v, float) else v) for k, v in t.items()})
    json.dump(out, open(f'{SP}/transforms.json', 'w'), indent=1)
