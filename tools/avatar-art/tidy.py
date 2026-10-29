"""Sort the art folder into subfolders and give every original a plain name."""
import os
import shutil

ART = '/Users/joannasieniawska/Documents/Pumpelek/art/'
OUTFITS = {
    'Anime Grey Striped Tracksuit Cutout.png': 'sporty', 'Anime Yellow Raincoat Backpack Cutout.png': 'raincoat',
    'Beige Blazer Outfit Overlay.png': 'blazer', 'Cozy Cable-Knit Sweater and Plaid Skirt.png': 'sweaterskirt',
    'Cozy Cream Sweater and Blue Scarf Sprite.png': 'wintersweater', 'Floral Black Kimono with Red Hakama.png': 'haori',
    'Floral Sky-Blue Sundress Sprite.png': 'sundress', 'Headless Anime School Uniform Outfit.png': 'school',
    'Headless Oversized Black Hoodie Template.png': 'oversized', 'Headless Purple Ninja Kimono Outfit.png': 'ninja',
    'Headless White Hooded Jacket Illustration.png': 'outdoor', 'Headless Winter Outfit with Burgundy Scarf.png': 'coat',
    'Pastel Pink Cat Pajama Set.png': 'pajamas', 'outfit_kimono.png': 'kimono',
    'Anime Cream Hoodie with Cat Patch and Backpack.png': 'casual',
}
ACCS = {
    'Glossy Anime Pink Ribbon Bow.png': 'bow', 'Anime Cherry Blossom Accessory with Leaves.png': 'flower',
    'Floral Golden Kanzashi Hairpin.png': 'kanzashi', 'Cute Black Cat-Ear Headband.png': 'catears',
    'Symmetrical Lavender Over-Ear Headphones.png': 'headphones', 'Ornate Golden Gemmed Tiara.png': 'crown',
    'Delicate Freckles Overlay.png': 'freckles',
}
PETS = {
    'Kawaii Orange Tabby Sticker.png': 'cat', 'Adorable Chibi Puppy on Transparent Canvas.png': 'dog',
    'Cute Bunny on Transparent Background.png': 'bunny', 'Adorable Chibi Fox in Transparent Space.png': 'fox',
    'Chibi Panda with Bamboo on Transparent Background.png': 'panda', 'Chibi Penguin in the Corner.png': 'penguin',
    'Kawaii Pastel Unicorn Sticker.png': 'unicorn', 'Chibi Green Dragon on Transparent Background.png': 'dragon',
}
for d in ('outfits', 'accessories', 'pets', 'reference'):
    os.makedirs(ART + d, exist_ok=True)
for table, folder, prefix in ((OUTFITS, 'outfits', 'outfit_'), (ACCS, 'accessories', 'acc_'), (PETS, 'pets', 'pet_')):
    for old, new in table.items():
        if os.path.exists(ART + old):
            shutil.move(ART + old, f'{ART}{folder}/{prefix}{new}.png')
            print('moved', old, '->', f'{folder}/{prefix}{new}.png')
for f in ('reference_for_accessories.png', 'skin_sample.png'):
    if os.path.exists(ART + f):
        shutil.move(ART + f, ART + 'reference/' + f)
if os.path.isdir(ART + 'source') and not os.path.isdir(ART + 'hair_sheets'):
    os.rename(ART + 'source', ART + 'hair_sheets')
for f in os.listdir(ART):
    if f == '.DS_Store':
        os.remove(ART + f)
open(ART + 'README.txt', 'w').write(
    'Originals and work files of the Pumpelek avatar (this folder is not in git; keep a copy).\n\n'
    'base.png            the bald girl with a grey tank top (position guide, source of the head)\n'
    'outfits/            outfit_<id>.png   one outfit each, headless, same canvas as base.png\n'
    'accessories/        acc_<id>.png      hair accessories and freckles, as drawn\n'
    'pets/               pet_<id>.png      the eight pets, as drawn\n'
    'hair_sheets/        sheet_<style>.png the hairstyle sheets (back on the left, front on the right)\n'
    'hair/               hair_<style>_back/front.png   the sheets cut into layers\n'
    'reference/          pictures used as prompts or previews\n'
    'ready/              everything placed on the common 1122 x 1552 canvas (made by tools/avatar-art)\n\n'
    'The app itself uses img/avatar/ (small WebP files made from ready/).\n')
print(sorted(os.listdir(ART)))
