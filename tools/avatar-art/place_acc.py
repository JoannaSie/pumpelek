import json, os
import numpy as np
from PIL import Image, ImageDraw
from acc import FILES, A
R = A + 'ready/'
W, H = 1122, 1552
# target boxes (x0, y0, x1, y1) on the 1122 x 1552 canvas
BOX = json.load(open('acc_boxes.json')) if os.path.exists('acc_boxes.json') else {}
DEFAULT = {
    'crown': (420, 100, 700, 262), 'headphones': (310, 190, 810, 600), 'catears': (360, 150, 760, 372),
    'bow': (600, 215, 790, 385), 'flower': (615, 215, 765, 355), 'kanzashi': (560, 90, 760, 285), 'freckles': (425, 475, 700, 535),
}
def place(n):
    im = Image.open(A + FILES[n]).convert('RGBA')
    a = np.asarray(im)[..., 3]
    ys, xs = np.nonzero(a > 30)
    crop = im.crop((xs.min(), ys.min(), xs.max() + 1, ys.max() + 1))
    x0, y0, x1, y1 = BOX.get(n, DEFAULT[n])
    crop = crop.resize((x1 - x0, y1 - y0), Image.LANCZOS)
    c = Image.new('RGBA', (W, H), (0, 0, 0, 0)); c.alpha_composite(crop, dest=(x0, y0))
    return c
if __name__ == '__main__':
    ref = {}
    tiles = []
    for hair in ('topknot', 'long', 'braids'):
        for n in FILES:
            pass
    for n in FILES:
        layer = place(n); layer.save(R + f'acc_{n}.png')
    # preview: three hairstyles, each with a couple of accessories
    def fig(hair, accs):
        c = Image.new('RGBA', (W, H), (232, 228, 222, 255))
        for l in (f'hair_{hair}_back', 'outfit_kimono', 'head', f'hair_{hair}_front') + tuple(f'acc_{a}' for a in accs):
            c = Image.alpha_composite(c, Image.open(R + l + '.png'))
        return c.convert('RGB').crop((200, 0, 920, 760)).resize((360, 380))
    sets = [('topknot', ['crown']), ('topknot', ['headphones']), ('topknot', ['catears']), ('topknot', ['bow']), ('topknot', ['flower']), ('topknot', ['kanzashi']), ('braids', ['freckles', 'bow']), ('long', ['headphones'])]
    sheet = Image.new('RGB', (360 * 4, 380 * 2))
    for i, (h, a) in enumerate(sets):
        sheet.paste(fig(h, a), ((i % 4) * 360, (i // 4) * 380))
    sheet.save('acc_placed.png')
