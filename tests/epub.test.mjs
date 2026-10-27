// Limpezimea — export EPUB: copertă tipografică (SVG) și varianta cu aparat critic. Rulare: node tests/epub.test.mjs
// Verifică structural (ZIP, mimetype primul, XML bine format, spine/manifest coerente, textul aparatului = textul din pagină).
// NU folosește epubcheck și nu a fost deschis într-un cititor fizic.
import {createRequire} from 'node:module';
import path from 'node:path'; import fs from 'node:fs'; import {fileURLToPath, pathToFileURL} from 'node:url';
const require = createRequire(process.env.PW_ROOT || '/opt/node-tools/package.json');
const {chromium} = require('playwright');
const here = path.dirname(fileURLToPath(import.meta.url));
let pass = 0, fail = 0; const ok = (n, c, x) => { if (c) pass++; else { fail++; console.log('  FAIL', n, x === undefined ? '' : JSON.stringify(x).slice(0, 300)); } };
function unzip(buf) { // ZIP „stored” (fără compresie), citit prin directorul central
  const e = buf.length - 22; if (buf.readUInt32LE(e) !== 0x06054b50) throw new Error('EOCD'); const n = buf.readUInt16LE(e + 10); let o = buf.readUInt32LE(e + 16); const out = [];
  for (let i = 0; i < n; i++) { const m = buf.readUInt16LE(o + 10), sz = buf.readUInt32LE(o + 24), nl = buf.readUInt16LE(o + 28), ex = buf.readUInt16LE(o + 30), cm = buf.readUInt16LE(o + 32), lo = buf.readUInt32LE(o + 42);
    const name = buf.slice(o + 46, o + 46 + nl).toString('utf8'); const ln = buf.readUInt16LE(lo + 26), le = buf.readUInt16LE(lo + 28);
    out.push({name, method: m, data: buf.slice(lo + 30 + ln + le, lo + 30 + ln + le + sz)}); o += 46 + nl + ex + cm; }
  return out;
}
const browser = await chromium.launch({executablePath: process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'});
const ctx = await browser.newContext({acceptDownloads: true}); await ctx.route(/^https?:/, r => r.abort());
const p = await ctx.newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message));
await p.goto(pathToFileURL(path.join(here, '..', 'index.html')).href); await p.waitForTimeout(800);
async function get(lang, id) {
  await p.evaluate(l => { const b = [...document.querySelectorAll('.lang-group button, [data-lang]')].find(x => (x.dataset.lang || x.textContent.trim().toLowerCase()) === l); if (b) b.click(); }, lang);
  await p.waitForTimeout(300);
  const [dl] = await Promise.all([p.waitForEvent('download'), p.evaluate(i => document.getElementById(i).click(), id)]);
  return {name: dl.suggestedFilename(), files: unzip(fs.readFileSync(await dl.path()))};
}
async function xmlOk(strs) { return p.evaluate(a => a.every(s => !new DOMParser().parseFromString(s, 'application/xml').querySelector('parsererror')), strs); }
for (const lang of ['ro', 'en', 'hu']) {
  const plain = await get(lang, 'epubBtn'), app = await get(lang, 'epubAppBtn');
  const T = (r, n) => { const f = r.files.find(x => x.name === n); return f ? f.data.toString('utf8') : null; };
  ok(lang + ': mimetype primul și necomprimat', plain.files[0].name === 'mimetype' && plain.files[0].method === 0 && plain.files[0].data.toString() === 'application/epub+zip');
  ok(lang + ': nume fișier', plain.name === 'limpezimea-' + lang + '.epub' && app.name === 'limpezimea-' + lang + '-aparat.epub', [plain.name, app.name]);
  for (const r of [plain, app]) {
    const opf = T(r, 'OEBPS/content.opf'), cov = T(r, 'OEBPS/cover.svg');
    ok(lang + ': copertă SVG bine formată cu titlu și autor', !!cov && await xmlOk([cov]) && /<text[^>]*>[^<]+<\/text>/.test(cov) && cov.includes('Alexandru-Ionuț Chiuță'));
    ok(lang + ': opf declară cover-image și cover.xhtml primul în spine', /properties="cover-image"/.test(opf) && /<spine><itemref idref="cover"/.test(opf));
    const hrefs = [...opf.matchAll(/<item [^>]*href="([^"]+)"/g)].map(m => m[1]);
    ok(lang + ': fiecare item din manifest există în arhivă', hrefs.every(h => r.files.some(f => f.name === 'OEBPS/' + h)), hrefs.filter(h => !r.files.some(f => f.name === 'OEBPS/' + h)));
    const ids = [...opf.matchAll(/<itemref idref="([^"]+)"/g)].map(m => m[1]), mids = [...opf.matchAll(/<item id="([^"]+)"/g)].map(m => m[1]);
    ok(lang + ': spine ⊂ manifest', ids.every(i => mids.includes(i)));
    const xs = r.files.filter(f => /\.(xhtml|opf)$/.test(f.name) || f.name === 'META-INF/container.xml').map(f => f.data.toString('utf8'));
    ok(lang + ': toate XML-urile bine formate', await xmlOk(xs));
  }
  const nPlain = [...T(plain, 'OEBPS/content.opf').matchAll(/<itemref /g)].length, nApp = [...T(app, 'OEBPS/content.opf').matchAll(/<itemref /g)].length;
  ok(lang + ': varianta cu aparat are +4 documente (avertisment + 3 secțiuni)', nApp === nPlain + 4, [nPlain, nApp]);
  // textul aparatului din EPUB = textul panourilor din pagină
  const want = await p.evaluate(l => ['recenzie', 'povestire', 'studiu'].map(id => { const pn = document.querySelector('#' + id + ' .pane-' + l); return (pn.textContent || '').replace(/\s+/g, ' ').trim(); }), lang);
  const got = app.files.filter(f => /^OEBPS\/s\d+\.xhtml$/.test(f.name)).slice(-3).map(f => f.data.toString('utf8').replace(/<head>[\s\S]*?<\/head>/, '').replace(/<[^>]+>/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/\s+/g, ' ').trim());
  const norm = s => s.replace(/[\s*]+/g, '').replace(/[^\p{L}\p{N}]/gu, '');
  ok(lang + ': ultimele 3 documente = cronica, povestirea, studiul (text complet; la povestire se adaugă doar titlul)', got.length === 3 && got.every((g, i) => norm(g).endsWith(norm(want[i])) && norm(g).length - norm(want[i]).length <= (i === 1 ? 40 : 0)), got.map((g, i) => [g.length, want[i].length]));
  ok(lang + ': pagina de titlu a variantei cu aparat nu mai spune „fără aparat”', !/Fără aparatul critic|Without the critical apparatus|Kritikai apparátus nélkül/.test(T(app, 'OEBPS/title.xhtml')) && /Fără aparatul critic|Without the critical apparatus|Kritikai apparátus nélkül/.test(T(plain, 'OEBPS/title.xhtml')));
}
ok('fără erori JS', errs.length === 0, errs);
await browser.close(); console.log(`\n${pass} reușite, ${fail} eșuate`); process.exit(fail ? 1 : 0);
