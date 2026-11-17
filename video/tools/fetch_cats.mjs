// Descarga por CATEGORÍAS de Commons (más precisas que el buscador). Filtra licencia, época (1936-1952) y excluye monumentos/museos.
import fs from 'node:fs';
import path from 'node:path';

const UA = 'LineaRojaResearch/0.1 (documentary project; non-commercial research script)';
const ROOT = path.resolve(import.meta.dirname, '..');
const mp = path.join(ROOT, 'data', 'images.json');
const manifest = JSON.parse(fs.readFileSync(mp, 'utf8'));
const seen = new Set(manifest.map((m) => m.title));

// [capítulo, etiqueta, categoría, máx]
const CATS = [
  [0, 'hendaye', 'Meeting at Hendaye', 3], [0, 'franco', 'Francisco Franco', 4], [0, 'hitler', 'Adolf Hitler', 3],
  [1, 'guerra', 'Spanish Civil War', 8], [1, 'franco', 'Francisco Franco', 3],
  [2, 'francia', 'Battle of France', 8], [2, 'bretana', 'Battle of Britain', 5],
  [3, 'canaris', 'Wilhelm Canaris', 4], [3, 'serrano', 'Ramón Serrano Súñer', 5], [3, 'gibraltar', 'Gibraltar', 8],
  [4, 'hoare', 'Samuel Hoare, Viscount Templewood (1880-1959)', 3], [4, 'churchill', 'Winston Churchill', 4],
  [5, 'petain', 'Hitler meeting with Petain', 3], [5, 'ribbentrop', 'Joachim von Ribbentrop', 3], [5, 'hendaye', 'Hitler', 2],
  [7, 'wehrmacht', 'Wehrmacht', 8], [7, 'stuka', 'Junkers Ju 87', 5], [7, 'uboat', 'Kriegsmarine', 4],
  [8, 'gibraltar', 'Royal Navy', 4], [9, 'barbarroja', 'Operation Barbarossa', 8],
  [10, 'rn', 'Force H', 4], [12, 'azul', 'Blue Division', 6],
];

const LIC_OK = /(public domain|^pd\b|pd-|cc0|cc by-sa|cc by \d)/i;
const LIC_BAD = /(nc|nd|fair use|copyrighted|all rights)/i;
const JUNK = /(monument|memorial|museum|grave|exhibition|statue|diorama|plaque|replica|reenact|re-enact|cemetery|model|colori[sz]ed|coloured|painting of|map|flag of|banknote|stamp|coin|poster|cover|certificate|medal|wuhlgarten|gedenk)/i;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const strip = (s) => (s || '').toString().replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();

async function api(params) {
  const url = 'https://commons.wikimedia.org/w/api.php?' + new URLSearchParams({format: 'json', ...params});
  for (let i = 0; i < 5; i++) {
    const r = await fetch(url, {headers: {'User-Agent': UA}});
    if (r.ok) return r.json();
    await sleep(2000 * (i + 1));
  }
  throw new Error('API fail');
}

const RUN = process.env.CATS_JSON ? JSON.parse(process.env.CATS_JSON) : CATS;
const MINW = Number(process.env.MINW || 900);
for (const [chap, tag, cat, max] of RUN) {
  if (manifest.filter((m) => m.chapter === chap && m.tag === tag && m.from === 'cat:' + cat).length >= max) continue;
  let j;
  try {
    j = await api({
      action: 'query', generator: 'categorymembers', gcmtitle: 'Category:' + cat, gcmtype: 'file', gcmlimit: '120',
      prop: 'imageinfo', iiprop: 'url|size|mime|extmetadata', iiurlwidth: '1600',
      iiextmetadatafilter: 'LicenseShortName|Artist|Credit|ImageDescription|DateTimeOriginal|Restrictions',
    });
  } catch (e) { console.log('FAIL', cat); continue; }
  const pages = Object.values(j.query?.pages || {});
  if (!pages.length) { console.log(`${cat}: sin ficheros (¿categoría inexistente?)`); continue; }
  // priorizar las de mayor resolución
  pages.sort((a, b) => (b.imageinfo?.[0]?.width || 0) - (a.imageinfo?.[0]?.width || 0));
  let got = 0;
  for (const p of pages) {
    if (got >= max) break;
    const i = p.imageinfo?.[0];
    if (!i || seen.has(p.title)) continue;
    if (!/image\/jpeg|image\/png/.test(i.mime)) continue;
    if (i.width < MINW || i.height < 420) continue;
    const ar = i.width / i.height;
    if (ar < 0.85 || ar > 2.4) continue;
    const m = i.extmetadata || {};
    const lic = strip(m.LicenseShortName?.value);
    const credit = strip(m.Credit?.value);
    const artist = strip(m.Artist?.value);
    const desc = strip(m.ImageDescription?.value);
    const date = strip(m.DateTimeOriginal?.value);
    const blob = `${p.title} ${credit} ${artist} ${desc}`;
    if (!LIC_OK.test(lic) || LIC_BAD.test(lic)) continue;
    if (/imperial war museum|\biwm\b|\bBU ?\d{3,}\b/i.test(blob)) continue;
    if (strip(m.Restrictions?.value)) continue;
    if (JUNK.test(p.title) || JUNK.test(desc.slice(0, 200))) continue;
    // época: fecha explícita 1936-1952, o año en título/descripción
    const yr = (date.match(/(19\d\d)/) || [])[1];
    const okDate = yr ? Number(yr) >= 1936 && Number(yr) <= 1952 : /19(3[6-9]|4\d|5[0-2])/.test(p.title + ' ' + desc.slice(0, 250));
    if (!okDate) continue;
    const slug = p.title.replace(/^File:/, '').replace(/\.[^.]+$/, '').replace(/[^\w]+/g, '_').slice(0, 55);
    const rel = `img/ch${String(chap).padStart(2, '0')}/c_${tag}_${slug}.jpg`;
    const dest = path.join(ROOT, 'public', rel);
    fs.mkdirSync(path.dirname(dest), {recursive: true});
    const fileName = p.title.replace(/^File:/, '').replace(/ /g, '_');
    const url = i.thumburl || `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(fileName)}?width=${Math.min(1920, i.width)}`;
    let ok = false;
    for (let t = 0; t < 3 && !ok; t++) {
      try {
        const r = await fetch(url, {headers: {'User-Agent': UA}, redirect: 'follow'});
        if (r.ok && (r.headers.get('content-type') || '').startsWith('image/')) { fs.writeFileSync(dest, Buffer.from(await r.arrayBuffer())); ok = true; }
        else await sleep(2500 * (t + 1));
      } catch { await sleep(2500); }
    }
    if (!ok) continue;
    seen.add(p.title);
    got++;
    manifest.push({chapter: chap, tag, from: 'cat:' + cat, file: rel, title: p.title, license: lic, artist: artist.slice(0, 120), credit: credit.slice(0, 160), description: desc.slice(0, 240), date: date.slice(0, 40), page: `https://commons.wikimedia.org/wiki/${encodeURIComponent(p.title.replace(/ /g, '_'))}`, width: i.width, height: i.height});
    fs.writeFileSync(mp, JSON.stringify(manifest, null, 1));
    await sleep(800);
  }
  console.log(`ch${chap} ${tag} «${cat}»: ${got}/${max}`);
  await sleep(500);
}
console.log('TOTAL', manifest.length);
