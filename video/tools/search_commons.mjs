// Busca en Commons (solo listado; no descarga). Uso: node tools/search_commons.mjs "consulta1" "consulta2"
const UA = 'LineaRojaResearch/0.1 (documentary project; non-commercial research script)';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const strip = (s) => (s || '').toString().replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
for (const q of process.argv.slice(2)) {
  const u = 'https://commons.wikimedia.org/w/api.php?' + new URLSearchParams({format: 'json', action: 'query', generator: 'search', gsrsearch: q + ' filetype:bitmap', gsrnamespace: '6', gsrlimit: '12', prop: 'imageinfo', iiprop: 'url|size|extmetadata', iiextmetadatafilter: 'LicenseShortName|DateTimeOriginal|ImageDescription'});
  let j;
  for (let k = 0; k < 6; k++) { const r = await fetch(u, {headers: {'User-Agent': UA}}); const t = await r.text(); try { j = JSON.parse(t); break; } catch { await sleep(6000 * (k + 1)); } }
  console.log('== ' + q);
  for (const p of Object.values(j?.query?.pages || {})) {
    const i = p.imageinfo?.[0]; if (!i) continue;
    const lic = strip(i.extmetadata?.LicenseShortName?.value);
    if (!/(public domain|pd|cc0|cc by)/i.test(lic) || /(nc|nd)\b/i.test(lic)) continue;
    console.log(`${p.title.replace('File:', '').slice(0, 90)} | ${lic} | ${i.width}x${i.height} | ${strip(i.extmetadata?.ImageDescription?.value).slice(0, 70)}`);
  }
  await sleep(3500);
}
