# Jurnal de modificări — Limpezimea

## 2.3.0 — 2026-11-15

- Nou: accesibilitate pe toate ecranele — butonul „Aa” (mărimea textului, contrast ridicat, fără animații, text lizibil, linkuri subliniate, citire cu voce), săgeata „Înapoi sus” și „Sari la conținut”; fereastra se potrivește mereu ecranului; zoom-ul cu lupă și „potrivire ecran” stau acum pe marginea din stânga (fff-kit 1.6.0).

## 2.2.7 — 2026-11-15

- Nou: texturi fractale hiper-detaliate (fff-texturi 1.1.2) — fundalul și suprafețele mari (carduri, panouri, antete, butoane; filele și dialogurile ascunse la încărcare, când se deschid) primesc un material generat local (WebGL2, fără rețea și fără imagini), care se repetă fără cusătură; culorile aplicației rămân ale ei. Se oprește din dialogul „Transparență” sau cu `?notex=1`.

## 2.2.0 — 2026-11-02 (reîmprospătare kit)

- Nou (kit): **Sincronizare între dispozitive** (`FFF.sync`) — în dialogul «Transparență» (clic pe versiune → Copie de siguranță): conectezi două dispozitive direct (WebRTC, cod/QR, fără server și fără cont) și își schimbă datele aplicației; cea mai recentă valoare câștigă, secretele (chei API, parole) nu se trimit, ștergerile nu se propagă. Aplicarea trece prin importul kitului (confirmare, chei permise, rollback).
- Nou (kit): **Istoric local — «mașina timpului»** (`FFF.history`) — instantanee automate ale datelor (IndexedDB, fără secrete), diferență față de starea curentă și restaurare reversibilă; «Șterge datele aplicației» șterge și istoricul.
- Module adăugate: `qr`, `p2p`, `sync`, `history` (+~140 KB). Versiunea aplicației nu se schimbă.

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
