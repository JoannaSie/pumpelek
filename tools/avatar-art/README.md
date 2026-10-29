Skrypty, którymi z oryginalnych rysunków (folder `art/`, tylko na komputerze, bez gita; opis w `art/README.txt`) powstały obrazki w `img/avatar/`.
Potrzebują Pythona z Pillow, numpy i scipy. Ścieżki w skryptach są na stałe do folderu Pumpelek.

Kolejność:
1. tidy.py: porządkuje i nazywa oryginały (jednorazowo)
2. cut_hair.py: cięcie arkuszy fryzur na tył i przód
3. fit.py: dopasowanie fryzur do głowy z base.png
4. outfits.py, export_outfits.py: stroje pod głową
5. place_acc.py, acc_fit.py, place_pets.py: dodatki (słuchawki i spinka osobno dla każdej fryzury) i zwierzątka
6. export_web.py: kolory włosów, odcienie skóry, WebP i lista położeń (potem zapisać jako js/avatar-art.js)
