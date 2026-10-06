# Game On – sajt (GitHub Pages)

Čist statički sajt: HTML + CSS + vanilla JavaScript. Bez frameworka, bez template sistema, bez servera.

## Fajlovi
- index.html – ceo sajt (sav sadržaj je direktno u HTML-u, vidljiv i Google-u)
- styles.css – stilovi (mobile-first, reduced-motion podrška)
- main.js – meni, slider, galerija/lightbox, kalkulator, forma, animacije
- 404.html – stranica za nepostojeće linkove
- sitemap.xml, robots.txt – za Google
- site.webmanifest, favicon.ico, assets/icons/ – ikonice
- .nojekyll – GitHub Pages servira fajlove bez obrade
- assets/ – logo i fotografije

## Objavljivanje
1. U repozitorijumu Game-On obrišite stare fajlove (index.html, support.js, pregled.html).
2. Uploadujte SVE iz ovog foldera u root repozitorijuma (uključujući .nojekyll).
3. Settings → Pages → Branch: main / (root).
4. Posle 1–2 min: https://misicv89-ops.github.io/Game-On/

## Forma (FormSubmit)
Forma šalje na gameon.igraonica@gmail.com preko formsubmit.co (besplatno, bez API ključa).
Pri PRVOM slanju stiže mejl "Activate Form" – kliknite Activate. Tek posle toga upiti stižu.
Adresa se menja u main.js → FORM_ENDPOINT.

## Šta treba dopuniti (pretražite "DOPUNITI" i "PRIMERI" u index.html)
- FAQ: maksimalan broj dece
- Cena tematskih proslava; dnevni ulaz: cena i šta je uključeno
- Google ocena i broj recenzija
- RECENZIJE: trenutnih 5 su PRIMERI iz stare verzije – zamenite stvarnim Google recenzijama pre objave
- Slike: dečiji bioskop, filmska avantura, rođendanski sto, detalji prostora (tražite "SLIKA:")
- og:image (1200×630) i Google Search Console tag u <head>

## Provera posle objave
- https://search.google.com/test/rich-results – LocalBusiness + FAQ
- https://pagespeed.web.dev – brzina (mobile)
- https://misicv89-ops.github.io/Game-On/sitemap.xml i /robots.txt se otvaraju
- https://misicv89-ops.github.io/Game-On/nesto – prikazuje 404 stranicu
- Search Console → Sitemaps → dodajte sitemap.xml
