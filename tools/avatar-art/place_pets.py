"""Place each pet in the bottom-left corner of the common canvas, scaled to a similar visual size."""
import numpy as np
from PIL import Image, ImageDraw
A = '/Users/joannasieniawska/Documents/Pumpelek/art/'
R = A + 'ready/'
PETS = ['cat', 'dog', 'bunny', 'fox', 'panda', 'penguin', 'unicorn', 'dragon']
W, H = 1122, 1552
AREA = 390      # sqrt(width*height) of the drawn pet, in canvas pixels
CX, BOTTOM = 215, 1534
for n in PETS:
    im = Image.open(A + f'pets/pet_{n}.png').convert('RGBA')
    a = np.asarray(im)[..., 3]
    ys, xs = np.nonzero(a > 30)
    crop = im.crop((xs.min(), ys.min(), xs.max() + 1, ys.max() + 1))
    k = AREA / np.sqrt(crop.width * crop.height)
    crop = crop.resize((round(crop.width * k), round(crop.height * k)), Image.LANCZOS)
    c = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    c.alpha_composite(crop, dest=(CX - crop.width // 2, BOTTOM - crop.height))
    c.save(R + f'pet_{n}.png')
tiles = []
for n in PETS:
    c = Image.new('RGBA', (W, H), (232, 228, 222, 255))
    for l in ('hair_topknot_back', 'outfit_school', 'head', 'hair_topknot_front', 'pet_' + n):
        c = Image.alpha_composite(c, Image.open(R + l + '.png'))
    tiles.append(c.convert('RGB').resize((280, 387)))
sheet = Image.new('RGB', (280 * 8, 387))
for i, t in enumerate(tiles):
    sheet.paste(t, (i * 280, 0))
sheet.save('pets_placed.png')
