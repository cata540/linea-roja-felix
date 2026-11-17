// Añade fotos concretas de Commons (por título exacto) a data/images.json con licencia y crédito.
import fs from 'node:fs';
import path from 'node:path';
const UA = 'LineaRojaResearch/0.1 (documentary project; non-commercial research script)';
const ROOT = path.resolve(import.meta.dirname, '..');
const mp = path.join(ROOT, 'data', 'images.json');
const manifest = JSON.parse(fs.readFileSync(mp, 'utf8'));
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const strip = (s) => (s || '').toString().replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
const LIST = JSON.parse(fs.readFileSync(process.argv[2], 'utf8')); // [[cap, tag, titulo], ...]
for (const [chap, tag, name] of LIST) {
  const title = 'File:' + name;
  if (manifest.find((m) => m.title === title)) { console.log('ya está', name); continue; }
  const u = 'https://commons.wikimedia.org/w/api.php?' + new URLSearchParams({format: 'json', action: 'query', titles: title, prop: 'imageinfo', iiprop: 'url|size|mime|extmetadata', iiextmetadatafilter: 'LicenseShortName|Artist|Credit|ImageDescription|DateTimeOriginal'});
  let j; for (let k = 0; k < 6; k++) { const r = await fetch(u, {headers: {'User-Agent': UA}}); const t = await r.text(); try { j = JSON.parse(t); break; } catch { await sleep(6000 * (k + 1)); } }
  const p = Object.values(j?.query?.pages || {})[0]; const i = p?.imageinfo?.[0];
  if (!i) { console.log('NO', name); continue; }
  const m = i.extmetadata || {}; const lic = strip(m.LicenseShortName?.value);
  if (!/(public domain|cc0|cc by)/i.test(lic) || /(nc|nd)\b/i.test(lic)) { console.log('licencia no válida', name, lic); continue; }
  const slug = name.replace(/\.[^.]+$/, '').replace(/[^\w]+/g, '_').slice(0, 55);
  const rel = `img/ch${String(chap).padStart(2, '0')}/c_${tag}_${slug}.jpg`;
  const dest = path.join(ROOT, 'public', rel); fs.mkdirSync(path.dirname(dest), {recursive: true});
  const url = `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(name.replace(/ /g, '_'))}?width=${Math.min(1920, i.width)}`;
  let ok = false;
  for (let t = 0; t < 5 && !ok; t++) { const r = await fetch(url, {headers: {'User-Agent': UA}, redirect: 'follow'}); if (r.ok && (r.headers.get('content-type') || '').startsWith('image/')) { fs.writeFileSync(dest, Buffer.from(await r.arrayBuffer())); ok = true; } else await sleep(5000 * (t + 1)); }
  if (!ok) { console.log('FALLO descarga', name); continue; }
  manifest.push({chapter: chap, tag, from: 'manual', file: rel, title, license: lic, artist: strip(m.Artist?.value).slice(0, 120), credit: strip(m.Credit?.value).slice(0, 160), description: strip(m.ImageDescription?.value).slice(0, 240), date: strip(m.DateTimeOriginal?.value).slice(0, 40), page: 'https://commons.wikimedia.org/wiki/' + encodeURIComponent(title.replace(/ /g, '_')), width: i.width, height: i.height});
  fs.writeFileSync(mp, JSON.stringify(manifest, null, 1));
  console.log('ok', rel, lic);
  await sleep(2500);
}
