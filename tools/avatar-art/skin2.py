"""Skin tones v2: loose skin mask on the head, zoned mask on outfits, softer shading for darker tones."""
import numpy as np
from PIL import Image
from scipy import ndimage as ndi

R = '/Users/joannasieniawska/Documents/Pumpelek/art/ready/'
TONES = ['#FFE0C7', '#F3C9A4', '#E3A977', '#C98B5B', '#9B6240', '#6B4226']
REF = np.array([248., 216., 194.], dtype=np.float32)
GAMMA = 0.7


def hsv(rgb):
    x = rgb / 255.0
    mx, mn = x.max(axis=2), x.min(axis=2)
    d = mx - mn + 1e-6
    r, g, b = x[..., 0], x[..., 1], x[..., 2]
    h = np.where(mx == r, ((g - b) / d) % 6, np.where(mx == g, (b - r) / d + 2, (r - g) / d + 4)) * 60
    return h, d / (mx + 1e-6), mx


def hexrgb(h):
    return np.array([int(h[i:i + 2], 16) for i in (1, 3, 5)], dtype=np.float32)


def mask_head(rgb, a):
    h, s, v = hsv(rgb)
    return (a > 0) & (h <= 32) & (s >= 0.08) & (s <= 0.8) & (v >= 0.58)


def mask_outfit(rgb, a, arms=False):
    h, s, v = hsv(rgb)
    strict = (a > 20) & (h >= 18) & (h <= 28) & (s >= 0.15) & (s <= 0.45) & (v >= 0.55)
    lab, n = ndi.label(strict)
    keep = np.zeros(n + 1, dtype=bool)
    objs = ndi.find_objects(lab)
    sizes = ndi.sum(strict, lab, range(1, n + 1))
    for i, sl in enumerate(objs, start=1):
        if sizes[i - 1] < 1800:
            continue
        y0, y1, x0, x1 = sl[0].start, sl[0].stop, sl[1].start, sl[1].stop
        in_neck = x0 < 650 and x1 > 480 and y0 < 800 and y1 > 560
        is_hand = y1 >= 1380 and (x1 - x0) < 220 and (y1 - y0) < 330
        is_arm = arms and sizes[i - 1] > 9000 and ((x1 < 400) or (x0 > 720))   # bare arms (only the sundress has them)
        keep[i] = in_neck or is_hand or is_arm
    m = keep[lab]
    # the neck zone itself, loosely, so the shaded neck and the join with the head are included
    zone = np.zeros_like(m); zone[470:760, 480:650] = True
    loose = (a > 0) & (h >= 10) & (h <= 30) & (s >= 0.12) & (s <= 0.7) & (v >= 0.5) & zone
    return m | loose


def tint(arr, m, tone):
    rgb = arr[..., :3].astype(np.float32)
    rel = np.clip(rgb / REF, 0, 1.15)
    new = np.clip(hexrgb(tone) * rel ** GAMMA, 0, 255)
    out = arr.copy()
    out[..., :3] = np.where(m[..., None], new, rgb).astype(np.uint8)
    return out


def recolor(img, tone, kind, arms=False):
    arr = np.array(img.convert('RGBA'))
    rgb = arr[..., :3].astype(np.float32)
    m = mask_head(rgb, arr[..., 3]) if kind == 'head' else mask_outfit(rgb, arr[..., 3], arms)
    # pixels on the soft edge of the skin area (blended with outline or background) get the tint too
    h, s, v = hsv(rgb)
    edge = ndi.binary_dilation(m, iterations=2) & ~m & (arr[..., 3] > 0) & (v >= 0.45) & (h <= 45)
    m = m | edge
    return Image.fromarray(tint(arr, m, tone), 'RGBA')


def figure(outfit, tone, hair='ballerina'):
    c = Image.new('RGBA', (1122, 1552), (232, 228, 222, 255))
    c = Image.alpha_composite(c, Image.open(R + f'hair_{hair}_back.png'))
    c = Image.alpha_composite(c, recolor(Image.open(R + f'outfit_{outfit}.png'), tone, 'outfit', outfit == 'sundress'))
    c = Image.alpha_composite(c, recolor(Image.open(R + 'head.png'), tone, 'head'))
    c = Image.alpha_composite(c, Image.open(R + f'hair_{hair}_front.png'))
    return c


if __name__ == '__main__':
    rows = []
    for outfit in ('sundress', 'blazer', 'coat'):
        rows.append([figure(outfit, t).convert('RGB').crop((150, 150, 972, 1100)).resize((246, 285)) for t in TONES])
    sheet = Image.new('RGB', (246 * 6, 285 * 3), (255, 255, 255))
    for j, row in enumerate(rows):
        for i, t in enumerate(row):
            sheet.paste(t, (i * 246, j * 285))
    sheet.save('skin_sheet2.png')
    tiles = [figure('sundress', t).convert('RGB').crop((380, 520, 760, 820)) for t in (TONES[0], TONES[2], TONES[4], TONES[5])]
    s2 = Image.new('RGB', (380 * 4, 300))
    for i, t in enumerate(tiles):
        s2.paste(t, (i * 380, 0))
    s2.save('skin_neck2.png')
