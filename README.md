# Game On – sajt igraonice

Statički sajt spreman za GitHub Pages (ili bilo koji hosting).

## Struktura
- `index.html` – glavna stranica (desktop + mobilna verzija, responzivno)
- `pregled.html` – pregled desktop i mobilne verzije jedna pored druge
- `support.js` – runtime koji iscrtava stranicu (obavezno uz index.html)
- `assets/` – logo i fotografije

## Objavljivanje na GitHub Pages
1. Napravite novi repozitorijum na GitHub-u (npr. `gameon-igraonica`).
2. Otpakujte ZIP i uploadujte SVE fajlove u root repozitorijuma (Add file → Upload files).
3. Settings → Pages → Source: `Deploy from a branch`, Branch: `main` / `(root)` → Save.
4. Posle 1–2 minuta sajt je na: `https://<korisnik>.github.io/<repo>/`

## Sopstveni domen
Settings → Pages → Custom domain (npr. `gameon-nis.rs`), pa kod registrara domena dodajte CNAME zapis ka `<korisnik>.github.io`.

## Napomene
- Sajt mora da se otvara preko servera (GitHub Pages, Netlify…), ne duplim klikom na fajl.
- Forma za rezervaciju trenutno prikazuje potvrdu bez slanja. Za stvarno slanje upita povežite npr. Formspree ili Netlify Forms.
- Recenzije su primeri – zamenite ih pravim Google recenzijama.
