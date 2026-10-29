import os
import numpy as np
from PIL import Image, ImageDraw
A='/Users/joannasieniawska/Documents/Pumpelek/art/'
FILES={n:f'accessories/acc_{n}.png' for n in ('bow','flower','kanzashi','catears','headphones','crown','freckles')}
ref=Image.open(A+'reference/reference_for_accessories.png').convert('RGBA')
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
