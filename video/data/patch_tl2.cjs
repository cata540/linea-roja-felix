const fs=require('fs');
let s=fs.readFileSync('tools/build_timeline.mjs','utf8');
const rep=(a,b)=>{if(!s.includes(a))throw new Error('falta: '+a.slice(0,70));s=s.replace(a,b)};
// ---- layout + caption
const i0=s.indexOf("// Encuadres de foto que se alternan");
const i1=s.indexOf("const baked = (file)");
s=s.slice(0,i0)+`// Rótulos de nombre y cargo (solo si el título/descripción de la foto menciona a la persona)
const NAMES = {
  hitler: ['Adolf Hitler', 'Canciller de Alemania', /hitler/i],
  franco: ['Francisco Franco', 'Jefe del Estado español', /franco/i],
  canaris: ['Wilhelm Canaris', 'Jefe de la Abwehr', /canaris/i],
  serrano: ['Ramón Serrano Súñer', 'Cuñado de Franco', /(serrano|su[ñn]er)/i],
  ribbentrop: ['Joachim von Ribbentrop', 'Ministro de Exteriores alemán', /ribbentrop/i],
  mussolini: ['Benito Mussolini', 'Líder de Italia', /mussolini/i],
  petain: ['Philippe Pétain', 'Jefe del régimen de Vichy', /p[eé]tain/i],
  churchill: ['Winston Churchill', 'Primer ministro británico', /churchill/i],
  hoare: ['Samuel Hoare', 'Embajador británico en Madrid', /hoare/i],
  keitel: ['Wilhelm Keitel', 'Jefe del OKW', /keitel/i],
  jodl: ['Alfred Jodl', 'Jefe de operaciones del OKW', /jodl/i],
};
// Encuadres de foto que se alternan
const LAY_PLAIN = ['center', 'tiltR', 'full', 'tiltL', 'center', 'full', 'tiltL', 'tiltR', 'full', 'center'];
const LAY_NAMED = ['lower', 'split', 'tiltL', 'lower', 'center', 'split', 'tiltR', 'lower'];
let photoCount = 0, namedCount = 0;
const layoutFor = (im, cap) => {
  const ar = im.width / im.height;
  if (cap && cap.name) {
    let l = LAY_NAMED[namedCount++ % LAY_NAMED.length];
    if ((l === 'lower') && (ar < 1.15 || im.width < 1100)) l = 'split';
    return l;
  }
  let l = LAY_PLAIN[photoCount++ % LAY_PLAIN.length];
  if (l === 'full' && (ar < 1.15 || im.width < 1300)) l = photoCount % 2 ? 'tiltL' : 'tiltR';
  if ((l === 'tiltL' || l === 'tiltR') && ar > 2.2) l = 'center';
  return l;
};
const captionFor = (im) => {
  if (im.ai) return {};
  const y = ((im.date || '').match(/(19[3-5]\d)/) || (im.title || '').match(/(19[3-5]\d)/) || [])[1];
  const cap = {year: y};
  const nm = NAMES[im.tag];
  if (nm && nm[2].test(\`\${im.title} \${im.description}\`)) { cap.name = nm[0]; cap.role = nm[1]; }
  return cap;
};
`+s.slice(i1);
// ---- sentence-driven choice
const j0=s.indexOf("  const pickPhoto = (tt) => {");
const j1=s.indexOf("  let pat = 0;");
s=s.slice(0,j0)+`  // Qué se está diciendo en cada momento → qué imagen toca
  const ENT = [[/hitler|f[uü]hrer/i, 'hitler'], [/canaris|abwehr/i, 'canaris'], [/serrano/i, 'serrano'], [/ribbentrop/i, 'ribbentrop'], [/mussolini/i, 'mussolini'], [/p[eé]tain|vichy/i, 'petain'], [/churchill/i, 'churchill'], [/hoare/i, 'hoare'], [/keitel/i, 'keitel'], [/jodl/i, 'jodl'], [/franco|caudillo/i, 'franco'], [/gibraltar|pe[ñn][oó]n|estrecho/i, 'gibraltar'], [/hambre|\bpan\b|trigo|grano|raci[oó]n|inanici[oó]n|hambruna|alimentos|cosecha/i, 'hambre'], [/submarino|flota|marina|barcos|buques|naval|bloqueo|convoy/i, 'naval'], [/barbarroja|uni[oó]n sovi|moscú|rusia|frente oriental/i, 'barbarroja'], [/guerra civil|devastaci|ruinas|1936/i, 'guerra'], [/canarias|azores|madeira|atl[aá]ntico/i, 'atlantico'], [/pirineos|frontera|hendaya/i, 'frontera'], [/soborno|millones de d[oó]lares|dinero|cr[eé]ditos/i, 'dinero'], [/divisi[oó]n azul|voluntarios/i, 'azul'], [/tropas|ej[eé]rcito|alemanes|wehrmacht|cuerpos?/i, 'wehrmacht']];
  const sentAt = (tt) => sentences.find((q) => q.chapter === n && q.start - 0.05 <= tt && tt < q.end + 0.3) || null;
  const entTag = (tt) => { const q = sentAt(tt); if (!q) return null; for (const [re, tg] of ENT) if (re.test(q.text)) return tg; return null; };
  const unusedTag = (tg) => images.filter((p) => p.tag === tg && !usage.has(p.file) && !p.ai).sort((a, b) => Math.abs(a.chapter - n) - Math.abs(b.chapter - n)).concat(images.filter((p) => p.tag === tg && !usage.has(p.file) && p.ai).sort((a, b) => Math.abs(a.chapter - n) - Math.abs(b.chapter - n)));
  const pickPhoto = (tt) => {
    const et = entTag(tt);
    if (et) { const c0 = unusedTag(et); if (c0.length) return c0[0]; }
    const tag = tagAt(tt);
    const own = pool.filter((p) => p.tag === tag && !p.ai && !usage.has(p.file));
    if (own.length) return own[0];
    const ai = (byChapter[n] || []).filter((p) => p.ai && !usage.has(p.file));
    return ai[0] || null;
  };
  const CLIPENT = {hambre: ['guerracivil'], guerra: ['guerracivil'], franco: ['guerracivil'], regimen: ['guerracivil'], frontera: ['guerracivil', 'f1940'], naval: ['rn', 'guerra1940'], atlantico: ['rn', 'guerra1940']};
`+s.slice(j1);
// clip preference uses entity
rep("  const clipPrefs = (tt) => {\n    let cur = CHCLIP[n] || ['victory'];","  const clipPrefs = (tt) => {\n    const et0 = entTag(tt);\n    if (et0 && CLIPENT[et0]) return CLIPENT[et0].concat(CHCLIP[n] || []);\n    let cur = CHCLIP[n] || ['victory'];");
// entity photo always wins over the video pattern
rep("      const wantVideo = forceV || [1, 3].includes(pat % 5);","      const et1 = entTag(t);\n      const hasEnt = !!(et1 && unusedTag(et1).length);\n      const wantVideo = !hasEnt && (forceV || [1, 3].includes(pat % 5));");
// layout call
rep("sh.layout = layoutFor(unit.photo); sh.caption = captionFor(unit.photo);","sh.caption = captionFor(unit.photo); sh.layout = layoutFor(unit.photo, sh.caption);");
fs.writeFileSync('tools/build_timeline.mjs',s);
console.log('ok');
