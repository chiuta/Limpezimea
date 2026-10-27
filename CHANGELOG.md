# Jurnal de modificări — Limpezimea

## 2.2.0 — 2026-10-27 (anterior: 2.1.0)

- EPUB: copertă tipografică SVG generată (nu ilustrație), `cover-image` + prima pagină din spine.
- EPUB cu aparat critic: buton separat „(spoilere)”; adaugă avertismentul porții, cronica, povestirea „Tăul Mut” și studiul critic în limba curentă. Etichete în 8 limbi (fr/it/es/pt/de/hu: traducere automată).
- Test nou `tests/epub.test.mjs` (46 verificări, structural; fără epubcheck / cititor fizic). Textul literar nemodificat.
- Nu implementat: sinopsis lung / descriere pe capitole (fără sursă verificată); copertă ilustrată.

## 2.1.0 — 2026-10-27 (anterior: 2.0.0)

- Nou: „Despre carte” (prezentare scurtă din descrierea și începutul textului din depozit, fără spoilere; fragment din capitolul 1; timp de lectură pe limba curentă la 180 cuv./min), în 8 limbi (prezentarea în afara ro/en: traducere automată).
- Nou: export EPUB în limba curentă (fără aparatul critic), generat în browser, fără dependențe/rețea. Verificat structural, nu cu epubcheck sau pe un cititor fizic.
- Textul literar și traducerile: nemodificate. Hash-uri CSP, sha256, app.json, sw.js recalculate.
- README: „Stare: stabil”, „Offline: complet”.
- Nu implementat: sinopsis lung / descriere pe capitole (fără sursă verificată în depozit în afara textului însuși); copertă grafică în EPUB; EPUB cu aparat critic.
