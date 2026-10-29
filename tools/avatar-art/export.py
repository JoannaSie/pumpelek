import json, os
from PIL import Image
ART='/Users/joannasieniawska/Documents/Pumpelek/art'
OUT=ART+'/ready'; os.makedirs(OUT, exist_ok=True)
T=json.load(open('transforms.json'))
PAD=150
W,H=1122,1402+PAD
def canvas(): return Image.new('RGBA',(W,H),(0,0,0,0))
for name in ('base','outfit_kimono'):
    c=canvas(); im=Image.open(f'{ART}/{name}.png').convert('RGBA'); c.paste(im,(0,PAD),im); c.save(f'{OUT}/{name}.png')
for n,t in T.items():
    for side in ('back','front'):
        im=Image.open(f'{ART}/hair/hair_{n}_{side}.png')
        im=im.resize((round(im.width*t['s']),round(im.height*t['s'])),Image.LANCZOS)
        c=canvas(); c.paste(im,(round(t['dx']),round(t['dy'])+PAD),im); c.save(f'{OUT}/hair_{n}_{side}.png')
json.dump({'canvas':[W,H],'pad_top':PAD,'transforms':T},open(f'{OUT}/layout.json','w'),indent=1)
# check
c=Image.new('RGBA',(W,H),(222,216,206,255))
for f in ('hair_topknot_back','base','outfit_kimono','hair_topknot_front'):
    c=Image.alpha_composite(c,Image.open(f'{OUT}/{f}.png'))
c.convert('RGB').resize((W//2,H//2)).save('ready_check.png')
print(sorted(os.listdir(OUT))[:5], len(os.listdir(OUT)))
