import os
import numpy as np
from PIL import Image, ImageDraw
A='/Users/joannasieniawska/Documents/Pumpelek/art/'
FILES={'bow':'Glossy Anime Pink Ribbon Bow.png','flower':'Anime Cherry Blossom Accessory with Leaves.png','kanzashi':'Floral Golden Kanzashi Hairpin.png',
 'catears':'Cute Black Cat-Ear Headband.png','headphones':'Symmetrical Lavender Over-Ear Headphones.png','crown':'Ornate Golden Gemmed Tiara.png','freckles':'Delicate Freckles Overlay.png'}
ref=Image.open(A+'reference_for_accessories.png').convert('RGBA')
def load(n):
    im=Image.open(A+FILES[n]).convert('RGBA')
    return im.resize((1122,1552),Image.LANCZOS)
if __name__=='__main__':
    tiles=[]
    for n in FILES:
        c=Image.alpha_composite(ref,load(n))
        bb=load(n).getbbox(); print(n,'bbox',bb)
        t=c.convert('RGB').crop((250,100,880,700)).resize((420,400)); ImageDraw.Draw(t).text((4,4),n,fill=(255,0,0)); tiles.append(t)
    sheet=Image.new('RGB',(420*4,800),(255,255,255))
    for i,t in enumerate(tiles): sheet.paste(t,((i%4)*420,(i//4)*400))
    sheet.save('acc_check.png')
