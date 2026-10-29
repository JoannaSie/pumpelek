import sys
from PIL import Image, ImageDraw
R='/Users/joannasieniawska/Documents/Pumpelek/art/ready/'
HAIRS=['topknot','ballerina','long','halfup','buns','braid','lowtail','ponytail','braids']
def grid(acc, out, layers=None):
    tiles=[]
    for h in HAIRS:
        c=Image.new('RGBA',(1122,1552),(232,228,222,255))
        for l in (f'hair_{h}_back','outfit_kimono','head',f'hair_{h}_front')+((layers.get(h) if layers else None) or ('acc_'+acc,)):
            c=Image.alpha_composite(c,Image.open(R+l+'.png'))
        t=c.convert('RGB').crop((180,0,940,760)).resize((300,300)); ImageDraw.Draw(t).text((4,4),h,fill=(255,0,0)); tiles.append(t)
    sheet=Image.new('RGB',(300*5,600),(255,255,255))
    for i,t in enumerate(tiles): sheet.paste(t,((i%5)*300,(i//5)*300))
    sheet.save(out)
if __name__=='__main__':
    grid(sys.argv[1], sys.argv[2])
