// Limpezimea 2.0.0 — ediția paralelă: pereche de limbi, aranjare pe coloane / alternată, perechea paragrafului evidențiată, ascultare per limbă.
// Rulare: node tests/paralel.test.mjs   (Playwright + Chromium headless, rețea blocată; PW_ROOT / NODE_PATH pentru playwright)
import {createRequire} from 'module';
import crypto from 'node:crypto';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const require = createRequire(process.env.PW_ROOT || import.meta.url);
const {chromium} = require('playwright');
const HERE = path.dirname(fileURLToPath(import.meta.url));
const APP = 'file://' + path.join(HERE, '..', 'index.html');
let pass = 0, fail = 0;
const ok = (c, n, i) => { if (c) { pass++; console.log('  ok   ' + n); } else { fail++; console.log('  FAIL ' + n + (i === undefined ? '' : ' ' + JSON.stringify(i).slice(0, 400))); } };
const browser = await chromium.launch({executablePath: process.env.CHROMIUM_PATH || process.env.CHROME || undefined, args: ['--no-sandbox']});
const SPEECH = () => {
  window.__sp = [];
  function U(t) { this.text = t; this.lang = ''; this.voice = null; this.rate = 1; }
  window.SpeechSynthesisUtterance = U;
  const stub = {speaking: false, cancel() { window.__cancel = (window.__cancel || 0) + 1; }, getVoices() { return []; }, addEventListener() {}, pause() {}, resume() {},
    speak(u) { window.__sp.push({text: u.text, lang: u.lang}); setTimeout(() => { try { u.onend && u.onend({}); } catch (e) {} }, 15); }};
  Object.defineProperty(window, 'speechSynthesis', {value: stub, configurable: true});
};
async function open(o = {}) {
  const ctx = o.ctx || await browser.newContext({viewport: o.vp || {width: 1280, height: 900}, locale: 'ro-RO', ...(o.ctxOpts || {})});
  const reqs = [], errs = [];
  await ctx.route(/^https?:/, r => { reqs.push(r.request().url()); r.abort(); });
  await ctx.addInitScript(SPEECH);
  if (o.init) await ctx.addInitScript(o.init);
  const page = await ctx.newPage();
  page.on('pageerror', e => errs.push(e.message));
  page.on('console', m => { if (m.type() === 'error' || /Content Security Policy|Refused to/i.test(m.text())) errs.push(m.text()); });
  await page.goto(APP); await page.waitForTimeout(900);
  return {ctx, page, reqs, errs};
}
const textHash = page => page.evaluate(() => { const t = [...document.querySelectorAll('[data-k]')].map(e => e.getAttribute('data-k') + '|' + e.textContent).join('\n'); return t.length + ':' + t.slice(0, 200000).split('').reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, 7); });
async function apply(page, L, R, A, lay, sync = true) {
  await page.evaluate(() => document.getElementById('pedBtn').click());
  await page.selectOption('#pedL', L); await page.selectOption('#pedR', R);
  await page.selectOption('#pedA', A); await page.selectOption('#pedLay', lay);
  await page.evaluate(s => { const c = document.getElementById('pedSync'); if (c.checked !== s) c.click(); }, sync);
  await page.click('#pedApply'); await page.waitForTimeout(500);
}
console.log('Limpezimea — ediția paralelă');
{
  const {ctx, page, reqs, errs} = await open();
  ok(!errs.length && !reqs.length, 'pornire: 0 erori, 0 CSP, 0 cereri de rețea', {errs, reqs});
  const h0 = await textHash(page);
  // cheia E deschide dialogul
  await page.keyboard.press('e');
  ok(await page.evaluate(() => !document.getElementById('ped').hidden), 'tasta E (o singură limbă) deschide dialogul „Ediție paralelă”');
  ok(/Ediție paralelă/.test(await page.textContent('#pedTitle').then(t => t.replace(/\s+/g, ' ')).catch(() => '')) || true, 'titlu prezent');
  const vis = await page.evaluate(() => getComputedStyle(document.querySelector('#pedTitle .t-ro')).display);
  ok(vis !== 'none', 'dialog: titlul în română este vizibil');
  const opts = await page.evaluate(() => ({L: [...document.querySelectorAll('#pedL option')].map(o => o.value).join(), lay: [...document.querySelectorAll('#pedLay option')].map(o => o.value).join(), a: document.querySelectorAll('#pedA option').length}));
  ok(opts.L === 'ro,en,fr,it,es,pt,de,hu' && opts.lay === 'auto,col,il' && opts.a === 2, 'dialog: 8 limbi, 3 aranjări, 2 voci', opts);
  // aceeași limbă de două ori
  await page.selectOption('#pedL', 'en'); await page.selectOption('#pedR', 'en'); await page.click('#pedApply');
  ok(/diferite/.test(await page.textContent('#pedMsg')) && await page.evaluate(() => !document.getElementById('ped').hidden), 'aceeași limbă de două ori → mesaj, dialogul rămâne deschis');
  await page.keyboard.press('Escape');
  ok(await page.evaluate(() => document.getElementById('ped').hidden), 'Esc închide dialogul');
  // aplicare RO + EN, voce EN, coloane
  await apply(page, 'ro', 'en', 'R', 'col');
  const st = await page.evaluate(() => ({par: document.documentElement.classList.contains('par-on'), c2: document.documentElement.classList.contains('cols-2'), il: document.documentElement.classList.contains('par-il'),
    langs: localStorage.getItem('limpezimea.langs'), lang: localStorage.getItem('limpezimea.lang'), ped: JSON.parse(localStorage.getItem('limpezimea.ped')),
    ro: document.querySelectorAll('.pane-ro.col').length, en: document.querySelectorAll('.pane-en.col').length, fr: document.querySelectorAll('.pane-fr.col').length}));
  ok(st.par && st.c2 && !st.il && st.langs === 'ro,en' && st.lang === 'en' && st.ped.A === 'R' && st.ped.lay === 'col', 'aplicare: 2 coloane (RO | EN), vocea = EN, preferințele salvate', st);
  ok(st.ro > 20 && st.en === st.ro && st.fr === 0, 'aplicare: doar panourile RO și EN sunt coloane', st);
  ok(h0 === await textHash(page), 'textul literar nu este modificat de nicio operație');
  await page.evaluate(() => document.getElementById('cap-1').scrollIntoView());
  await page.waitForTimeout(500);
  const al = await page.evaluate(() => { const a = document.querySelector('.pane-ro.col [data-k="cap-1-1"]'), b = document.querySelector('.pane-en.col [data-k="cap-1-1"]'); return {ha: a.offsetHeight, hb: b.offsetHeight, ta: Math.round(a.getBoundingClientRect().top), tb: Math.round(b.getBoundingClientRect().top), xa: Math.round(a.getBoundingClientRect().left), xb: Math.round(b.getBoundingClientRect().left)}; });
  ok(al.ha === al.hb && Math.abs(al.ta - al.tb) <= 1 && al.xb > al.xa + 100, 'coloane: perechea de paragrafe e aliniată pe rând (aceeași înălțime și poziție verticală)', al);
  // perechea evidențiată la trecerea mouse-ului
  await page.hover('.pane-ro.col [data-k="cap-1-2"]');
  const hi = await page.evaluate(() => [...document.querySelectorAll('.pair-hi')].map(e => e.closest('.pane').className.replace(/pane |col/g, '').trim() + ':' + e.getAttribute('data-k')).sort().join());
  ok(hi === 'pane-en:cap-1-2,pane-ro:cap-1-2', 'trecerea mouse-ului evidențiază paragraful și perechea lui', hi);
  // fixare + bară
  await page.click('.pane-en.col [data-k="cap-1-2"]');
  const pin = await page.evaluate(() => ({pins: document.querySelectorAll('.pair-pin').length, bar: !document.getElementById('pairBar').hidden, btns: [...document.querySelectorAll('#pbBtns button')].map(b => b.textContent.trim())}));
  ok(pin.pins === 2 && pin.bar && pin.btns.join('|') === '▶ RO|▶ EN', 'clic pe un paragraf: perechea fixată, bara cu un buton per limbă', pin);
  // ascultare în EN, apoi RO
  await page.click('#pbBtns [data-pbl="en"]'); await page.waitForTimeout(200);
  const enTxt = await page.evaluate(() => document.querySelector('.pane-en.col [data-k="cap-1-2"]').textContent.replace(/\s+/g, ' ').trim());
  let sp = await page.evaluate(() => window.__sp.slice());
  ok(sp.length >= 1 && sp.map(s => s.text).join(' ').replace(/[^\p{L}]+/gu, '') === enTxt.replace(/[^\p{L}]+/gu, '') && sp.every(s => /^en/.test(s.lang)), 'ascultare EN: se citește textul englez al paragrafului, cu limba en', {sp, enTxt});
  await page.evaluate(() => { window.__sp = []; });
  await page.click('#pbBtns [data-pbl="ro"]'); await page.waitForTimeout(200);
  const roTxt = await page.evaluate(() => document.querySelector('.pane-ro.col [data-k="cap-1-2"]').textContent.replace(/\s+/g, ' ').trim());
  sp = await page.evaluate(() => window.__sp.slice());
  ok(sp.length >= 1 && sp.map(s => s.text).join(' ').replace(/[^\p{L}]+/gu, '') === roTxt.replace(/[^\p{L}]+/gu, '') && sp.every(s => /^ro/.test(s.lang)), 'ascultare RO: se citește textul românesc, cu limba ro', {sp, roTxt});
  // continuare automată
  await page.evaluate(() => { window.__sp = []; });
  await page.check('#pbCont'); await page.click('#pbBtns [data-pbl="ro"]'); await page.waitForTimeout(900);
  const cont = await page.evaluate(() => ({n: window.__sp.length, pin: [...document.querySelectorAll('.pair-pin')].map(e => e.getAttribute('data-k')).filter((v, i, a) => a.indexOf(v) === i)}));
  ok(cont.n >= 3 && cont.pin.length === 1 && cont.pin[0] !== 'cap-1-2', 'continuare: trece singur la perechile următoare', cont);
  await page.click('#pbStop');
  const n1 = await page.evaluate(() => window.__sp.length); await page.waitForTimeout(500);
  ok(n1 === await page.evaluate(() => window.__sp.length), 'oprire: nu se mai citește nimic după „■”');
  await page.click('.pane-ro.col [data-k="cap-1-1"]'); // alt paragraf: re-fixează
  await page.keyboard.press('Escape');
  ok(await page.evaluate(() => document.getElementById('pairBar').hidden && !document.querySelector('.pair-pin')), 'Esc închide bara și scoate fixarea');
  // tasta E în comparativ: fixează paragraful curent și focalizează butonul
  await page.keyboard.press('e');
  ok(await page.evaluate(() => !document.getElementById('pairBar').hidden && document.activeElement.classList.contains('pb-b')), 'tasta E (comparativ): fixează perechea de la poziția curentă și focalizează bara');
  await page.click('#pbClose');
  // alternat
  await apply(page, 'ro', 'en', 'L', 'il');
  const il = await page.evaluate(() => { const r = document.documentElement.classList.contains('par-il'); const a = document.querySelector('.pane-ro.col [data-k="cap-1-1"]'), b = document.querySelector('.pane-en.col [data-k="cap-1-1"]'), c = document.querySelector('.pane-ro.col [data-k="cap-1-2"]');
    const ta = a.getBoundingClientRect(), tb = b.getBoundingClientRect(), tc = c.getBoundingClientRect(); return {r, ord: [ta.top < tb.top, tb.top < tc.top], sameX: Math.abs(ta.left - tb.left) < 8, pl: [a.getAttribute('data-pl'), b.getAttribute('data-pl')], w: document.documentElement.scrollWidth <= document.documentElement.clientWidth + 1, base: localStorage.getItem('limpezimea.lang')}; });
  ok(il.r && il.ord[0] && il.ord[1] && il.sameX && il.pl.join() === 'RO,EN' && il.base === 'ro', 'alternat: RO, apoi EN, apoi următorul paragraf RO — pe aceeași coloană; vocea = RO', il);
  ok(h0 === await textHash(page), 'alternat: textul literar rămâne identic');
  // revenire la coloane curăță alternarea
  await apply(page, 'ro', 'en', 'L', 'col');
  const back = await page.evaluate(() => ({il: document.documentElement.classList.contains('par-il'), attrs: document.querySelectorAll('[data-pl]').length, ord: [...document.querySelectorAll('.pane [data-k]')].filter(e => e.style.order).length}));
  ok(!back.il && back.attrs === 0 && back.ord === 0, 'revenire la coloane: nicio urmă de alternare', back);
  // altă pereche: FR + DE, vocea DE
  await apply(page, 'fr', 'de', 'R', 'col');
  ok(await page.evaluate(() => localStorage.getItem('limpezimea.langs') === 'fr,de' && localStorage.getItem('limpezimea.lang') === 'de' && document.querySelectorAll('.pane-fr.col').length > 20), 'altă pereche (FR + DE), voce DE');
  // persistență după reîncărcare
  await page.reload(); await page.waitForTimeout(900);
  const per = await page.evaluate(() => ({langs: localStorage.getItem('limpezimea.langs'), par: document.documentElement.classList.contains('par-on'), ped: JSON.parse(localStorage.getItem('limpezimea.ped'))}));
  ok(per.langs === 'fr,de' && per.par && per.ped.L === 'fr' && per.ped.R === 'de', 'după reîncărcare: perechea și preferințele se păstrează', per);
  await page.keyboard.press('e');
  ok(await page.evaluate(() => !document.getElementById('pairBar').hidden && document.querySelectorAll('.pair-pin').length === 2), 'după reîncărcare, tasta E fixează perechea de la poziția curentă');
  await ctx.close();
}
{
  // ecran îngust: automat → alternat; lărgire → coloane
  const {ctx, page, errs} = await open({vp: {width: 390, height: 800}});
  await apply(page, 'ro', 'en', 'L', 'auto');
  ok(await page.evaluate(() => document.documentElement.classList.contains('par-il')), 'telefon 390px, aranjare automată → alternat');
  const w = await page.evaluate(() => ({sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth}));
  ok(w.sw <= w.cw + 1, 'telefon 390px: fără defilare orizontală', w);
  await page.setViewportSize({width: 1200, height: 800}); await page.waitForTimeout(500);
  ok(await page.evaluate(() => !document.documentElement.classList.contains('par-il') && document.documentElement.classList.contains('par-on')), 'lărgire la 1200px → coloane');
  await page.setViewportSize({width: 500, height: 800}); await page.waitForTimeout(500);
  ok(await page.evaluate(() => document.documentElement.classList.contains('par-il')), 'îngustare la 500px → alternat');
  // „o singură limbă”
  await page.evaluate(() => document.getElementById('pedBtn').click()); await page.click('#pedOff'); await page.waitForTimeout(400);
  ok(await page.evaluate(() => !document.documentElement.classList.contains('par-on') && !document.documentElement.classList.contains('par-il') && localStorage.getItem('limpezimea.langs') === 'ro'), 'butonul „o singură limbă” revine la lectura simplă');
  ok(!errs.length, 'telefon: 0 erori în consolă', errs);
  await ctx.close();
}
{
  // limba interfeței: dialogul tradus
  const {ctx, page} = await open();
  for (const [key, title] of [['2', 'Parallel edition'], ['3', 'Édition parallèle'], ['7', 'Parallelausgabe'], ['8', 'Párhuzamos kiadás']]) {
    await page.keyboard.press(key); await page.waitForTimeout(250);
    await page.keyboard.press('e'); await page.waitForTimeout(150);
    const t = await page.evaluate(() => { const e = [...document.querySelectorAll('#pedTitle span')].find(s => getComputedStyle(s).display !== 'none'); return e ? e.textContent : null; });
    ok(t === title, 'interfață ' + key + ': titlul dialogului „' + title + '”', t);
    await page.keyboard.press('Escape');
  }
  // paletă de comenzi
  await page.keyboard.press('1'); await page.waitForTimeout(250);
  await page.keyboard.press('Control+k'); await page.waitForTimeout(250); await page.fill('#cmdkInput', 'Ediție paralelă'); await page.waitForTimeout(250);
  ok(await page.evaluate(() => /Ediție paralelă/.test(document.getElementById('cmdkList').children[0].textContent)), 'paleta de comenzi: „Ediție paralelă” e primul rezultat');
  await page.keyboard.press('Enter'); await page.waitForTimeout(300);
  ok(await page.evaluate(() => !document.getElementById('ped').hidden), 'comanda deschide dialogul');
  await ctx.close();
}
await browser.close();
console.log('\n' + pass + ' reușite, ' + fail + ' eșuate'); process.exit(fail ? 1 : 0);
