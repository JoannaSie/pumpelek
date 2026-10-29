# Pumpelek

Aplikacja do nauki angielskiego (słówka, zwroty, całe zdania) metodą powtórek w odstępach, jak Anki, ale dla 12-latki: po angielsku, z awatarem do ubierania, punktami, serią dni i odznakami.

Działa jako PWA: to zwykła strona, którą na iPhonie dodaje się do ekranu głównego i która potem otwiera się jak aplikacja, także bez internetu.

## Jak uruchomić u siebie (test na komputerze)

```bash
cd ~/Documents/Pumpelek
python3 -m http.server 8765
```

Potem otwórz http://localhost:8765 w przeglądarce. Dane zapisują się w tej przeglądarce.

## Jak zainstalować na iPhonie

iPhone potrafi zainstalować aplikację tylko ze strony pod adresem **https://**, więc folder trzeba najpierw gdzieś udostępnić (to nie wysyła żadnych danych córki, bo te zostają w telefonie). Najprościej:

- **Netlify Drop** (app.netlify.com/drop): przeciągasz folder `Pumpelek` na stronę i dostajesz adres `https://...netlify.app`.
- **GitHub Pages** albo **Cloudflare Pages**: jeśli wolisz mieć kod w repozytorium.

Gdy masz adres, na iPhonie córki:

1. Otwórz adres w **Safari**.
2. Stuknij przycisk **Udostępnij** (kwadrat ze strzałką w górę, na dole ekranu).
3. Wybierz **Dodaj do ekranu początkowego** i potwierdź **Dodaj**.
4. Uruchamiaj aplikację z ikony na ekranie głównym, nie z Safari.

Dane są tylko w tej zainstalowanej aplikacji. Usunięcie ikony kasuje postępy, dlatego co jakiś czas zrób kopię: **Words → Import · Export → Back up everything**.

## Dodawanie fiszek

- Pojedynczo: zakładka **Words**, przycisk **＋**. Pola: angielski, polski, przykładowe zdanie (opcjonalne), talia. Karta może być słowem, frazą albo całym zdaniem. Kilka poprawnych odpowiedzi rozdziel ukośnikiem, np. `big / large`.
- Z pliku: **Words → Import · Export → Import cards from a file**. Plik CSV z kolumnami `english; polish; example; deck` (ostatnie dwie są opcjonalne). Szablon do pobrania jest w tym samym menu. W Excelu: *Zapisz jako → CSV UTF-8*. Rozdzielnik (`;` lub `,`) program rozpozna sam.

Przy imporcie plik jest tylko czytany jako tekst, nic się w nim nie wykonuje. Powtórzone karty są pomijane.

## Jak to działa

- Powtórki: uproszczony algorytm SM-2 (jak klasyczny Anki). Karta pomyłkowa wraca w tej samej sesji, aż zostanie dobrze odpowiedziana.
- Nowe słówko najpierw jest pokazane (z wymową), potem pojawia się w ćwiczeniach. Można to wyłączyć w Settings (*Show new words before practising them*), wtedy nowa karta od razu trafia do ćwiczenia.
- Ćwiczenia: wybór z 4 odpowiedzi (raz po angielsku, raz po polsku), słuchanie, wpisywanie, układanie zdania ze słów oraz karta do samooceny jak w Anki: widać tylko jedną stronę (raz angielską, raz polską), a po „Show answer” ocenia się samemu: Again / Hard / Good / Easy.
- Nagrody: XP i poziomy, monety na ubranka awatara, dzienny cel, seria dni, odznaki.
- Prywatność: żadnych kont, reklam ani śledzenia. Strona nie ładuje nic z zewnątrz (blokuje to nagłówek Content-Security-Policy w `index.html`).

## Pliki

```
index.html          strona
css/style.css       wygląd
js/util.js          pomocnicze (DOM, sprawdzanie odpowiedzi, dźwięk, okna)
js/store.js         zapis danych i ich walidacja
js/srs.js           algorytm powtórek
js/csv.js           import i eksport CSV
js/avatar.js        awatar i sklepik
js/game.js          XP, poziomy, seria, odznaki
js/study.js         sesja nauki i ćwiczenia
js/screens.js       ekrany Learn / Words / Style / Progress, ustawienia
js/main.js          start aplikacji
sw.js               działanie bez internetu
```

Nazwa aplikacji jest w `index.html`, `manifest.webmanifest` i `sw.js` (cache), jeśli chcesz ją zmienić.
