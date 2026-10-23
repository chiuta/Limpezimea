// Limpezimea — metadate: manifestul și descrierile enumeră toate cele 8 limbi; app.json ↔ index.html coerente (versiune, mărime, sha256 cu valoarea eliminată); CSP cu hash-uri valide.
// Rulare: node tests/meta.test.mjs
import fs from 'node:fs';
import crypto from 'node:crypto';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const R = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const rd = f => fs.readFileSync(path.join(R, f), 'utf8');
let pass = 0, fail = 0;
const ok = (c, n, i) => { if (c) { pass++; console.log('  ok   ' + n); } else { fail++; console.log('  FAIL ' + n + (i === undefined ? '' : ' ' + JSON.stringify(i))); } };
const h = rd('index.html'), app = JSON.parse(rd('app.json')), man = JSON.parse(rd('manifest.webmanifest'));
const LANGS = ['RO', 'EN', 'FR', 'IT', 'ES', 'PT', 'DE', 'HU'];
ok(LANGS.every(l => man.description.includes(l)) && /opt limbi/.test(man.description), 'manifest.webmanifest: descrierea enumeră cele 8 limbi', man.description);
ok(app.version === h.match(/name="application-version" content="([^"]+)"/)[1] && rd('sw.js').includes('VERSION = "' + app.version + '"'), 'versiune coerentă app.json / meta / sw.js', app.version);
const S = app.sha256;
ok(app.sizeBytes === Buffer.byteLength(h), 'sizeBytes corect');
ok(crypto.createHash('sha256').update(h.split(S).join('')).digest('hex') === S && h.includes('"sha256":"' + S + '"'), 'sha256 corect (valoarea eliminată din fișier)');
const csp = h.match(/Content-Security-Policy" content="([^"]+)"/)[1], decl = [...csp.matchAll(/'sha256-([^']+)'/g)].map(m => m[1]);
const scripts = [...h.matchAll(/<script(?![^>]*\bsrc=)([^>]*)>([\s\S]*?)<\/script>/g)].filter(m => !/json/.test(m[1])).map(m => crypto.createHash('sha256').update(m[2]).digest('base64'));
ok(scripts.length > 0 && scripts.every(d => decl.includes(d)), 'CSP: fiecare script inline are hash declarat', scripts.filter(d => !decl.includes(d)));
for (const f of fs.readdirSync(R).filter(f => /^README(\.\w\w)?\.md$/.test(f))) ok(rd(f).split('\n').slice(0, 8).join('\n').includes(app.version), f + ' are versiunea curentă');
console.log('\n' + pass + ' reușite, ' + fail + ' eșuate'); process.exit(fail ? 1 : 0);
