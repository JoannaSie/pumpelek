import numpy as np
from PIL import Image
SRC = '/private/tmp/claude-501/-Users-joannasieniawska-Documents-Pumpelek/85fd9c83-cdc1-4b9f-aa86-60432083199b/images/14.webp'
OUT = '/Users/joannasieniawska/Documents/Pumpelek/'
im = Image.open(SRC).convert('RGBA')
a = np.asarray(im)
# the grey-beige of the badge's inside, sampled between the ring and the head
samp = np.concatenate([a[560:640, 40:70].reshape(-1, 4), a[1060:1100, 120:160].reshape(-1, 4), a[150:200, 1000:1050].reshape(-1, 4)])
samp = samp[samp[:, 3] > 250][:, :3]
bg = tuple(int(v) for v in np.median(samp, axis=0))
print('background', bg)
im.save('/Users/joannasieniawska/Documents/Pumpelek/art/favicon/favicon.png')
def icon(size, fill=0.94):
    c = Image.new('RGBA', (size, size), bg + (255,))
    k = int(size * fill)
    r = im.resize((k, k), Image.LANCZOS)
    c.alpha_composite(r, ((size - k) // 2, (size - k) // 2))
    return c.convert('RGB')
icon(1024).save('/Users/joannasieniawska/Documents/Pumpelek/art/favicon/favicon_square_1024.png')
for name, size in (('apple-touch-icon.png', 180), ('icon-192.png', 192), ('icon-512.png', 512)):
    icon(size).save(OUT + 'icons/' + name, optimize=True)
icon(32).save(OUT + 'icons/favicon-32.png', optimize=True)
icon(64).save(OUT + 'icons/favicon-64.png', optimize=True)
# preview
sheet = Image.new('RGB', (180 + 96 + 48 + 32 + 100, 200), (244, 240, 255))
x = 10
for sz in (180, 96, 48, 32):
    sheet.paste(icon(sz), (x, 10)); x += sz + 20
sheet.save('icons_preview.png')
icon(512, 0.78).save(OUT + 'icons/icon-maskable-512.png', optimize=True)
