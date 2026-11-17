// Construye data/timeline.json (planos, tarjetas, subtítulos), data/schedule.json (audio) y data/sfx.json
import fs from 'node:fs';
import path from 'node:path';
import {execFileSync} from 'node:child_process';

const ROOT = path.resolve(import.meta.dirname, '..');
const FPS = 30;
const sentences = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'sentences_dur.json'), 'utf8'));
const images = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'images.json'), 'utf8'));
// Ilustraciones IA (data/ai.json): cada una se asigna a un único capítulo para no repetir
const AI_CH = {hendaye_tren: 0, hambre_cola: 1, gibraltar_roca: 2, mesa_mapas: 3, bloqueo_mar: 4, tren_roto: 8, pirineos_columna: 7, stukas_estrecho: 7, flota_puerto: 10, granero_vacio: 11,
  ruinas_aldea: 1, mula_arado: 1, mujeres_fuente: 1, kiosco_propaganda: 6, despacho_balcon: 6, plaza_banderas: 6, balanza_trigo_canones: 11, puerto_inactivo: 11, vagones_frontera: 11, convoy_escolta: 4, manos_libro_cuentas: 4, telegrafista: 8, trenes_este: 9, voluntarios_estacion: 12, submarinos_puerto: 12, oficiales_prismaticos: 3, fortaleza_estrecho: 3, transportes_atlantico: 10};
const DROP = /(Le_Chesne|Panzer_II|Sprz|Zniszczony|Niemiecka_piechota|Heinkel|Messerschmitt|Tweede_Wereldoorlog_SFA0228040|Ponferrada|Teleki|Junkers_Ju_87|Een_met_bommen|Sturzkampf)/i;
for (let i = images.length - 1; i >= 0; i--) if (DROP.test(images[i].file)) images.splice(i, 1);
if (fs.existsSync(path.join(ROOT, 'data', 'ai.json'))) {
  for (const x of JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'ai.json'), 'utf8'))) {
    if (AI_CH[x.id] === undefined) continue;
    images.push({chapter: AI_CH[x.id], tag: 'ia', file: x.file, title: 'IA ' + x.id, license: 'Ilustración generada con IA (FLUX schnell / fal.ai)', artist: '', credit: '', description: x.prompt, date: '', page: '', width: 1024, height: 576, ai: true});
  }
}
const f = (t) => Math.round(t * FPS);

// ---------- configuración editorial ----------
const DIR18 = {head1: "FUEHRER'S HEADQUARTERS · 12 NOV 1940", head2: 'TOP SECRET · DIRECTIVE No. 18', title: 'IBERIAN PENINSULA', subtitle: 'Code name "FELIX"', label: '2. Spain and Portugal.', quote: 'Gibraltar will be taken and the Straits closed.', stamp: 'TOP SECRET', source: 'Recreación gráfica · IMT doc. PS-444'};
const TELE_VIGON = {head1: 'MADRID, 12 DE DICIEMBRE DE 1940', head2: 'MUY SECRETO · EMBAJADOR STOHRER A BERLÍN', lines: ['Acta del general Vigón (7-dic-1940):', '«El abastecimiento de España es absolutamente inadecuado…»'], quote: 'déficit de grano: un millón de toneladas', source: 'Recreación gráfica · The Spanish Government and the Axis (1946)'};
const LIST_PLAN = {title: 'El plan de la Directiva 18', kicker: 'Operación Félix · 12 de noviembre de 1940', items: ['Oficiales de reconocimiento «en traje civil»', 'Aviso tres semanas antes de cruzar la frontera', 'Unidades motorizadas: «baja capacidad» ferroviaria', 'Ataque aéreo desde suelo francés y bombarderos en picado', 'Sin participación italiana']};
const TL = {title: 'Del hambre a la guerra posible', kicker: '1939 · 1941', y0: 1939.2, y1: 1941.4, years: [1939, 1940, 1941], events: [{y: 1939.25, label: '1 abr 1939', sub: 'Fin de la guerra civil'}, {y: 1939.92, label: '1 dic 1939', sub: 'Navicerts'}, {y: 1940.45, label: '14 jun 1940', sub: 'Tánger'}, {y: 1940.81, label: '23 oct 1940', sub: 'Hendaya'}, {y: 1940.86, label: '12 nov 1940', sub: 'Directiva 18'}, {y: 1940.93, label: '7 dic 1940', sub: 'Canaris ante Franco'}, {y: 1940.97, label: '18 dic 1940', sub: 'Barbarroja'}]};
const SPECIAL = {
  0: [
    {m: 'Siete horas después', kind: 'doc', spec: DIR18, dur: 7},
  ],
  1: [{m: 'Eso tenía una consecuencia directa', kind: 'map', map: 'suministro', dur: 7}],
  2: [{m: 'Gibraltar controla la puerta', kind: 'map', map: 'mediterraneo', dur: 7}],
  3: [{m: 'Canaris volvió de Algeciras', kind: 'map', map: 'gibraltar', dur: 7}],
  5: [{m: 'Y ese precio era descomunal', kind: 'map', map: 'exigencias', dur: 8}],
  7: [{m: 'El plan era meticuloso', kind: 'list', spec: LIST_PLAN, dur: 9}, {m: 'Y la directiva iba mucho más allá', kind: 'map', map: 'atlantico', dur: 7}],
  8: [{m: 'Y tercera, la más contundente', kind: 'telegram', spec: TELE_VIGON, dur: 9}],
  9: [{m: 'Y Hitler tenía su propia razón', kind: 'timeline', spec: TL, dur: 9}, {m: 'Esa fecha tampoco llegó', kind: 'map', map: 'estesur', dur: 7}],
  10: [],
};
// el mapa de Félix (iberia) entra en el gancho justo cuando se anuncia la fecha
SPECIAL[0].push({m: 'Su objetivo: tomar Gibraltar', kind: 'map', map: 'iberia', dur: 8});

for (const q of [4, 5, 11, 12]) SPECIAL[q] ||= [];
const LIST_RAZONES = {title: 'Por qué nunca ocurrió', kicker: 'Las cinco razones', items: ['1 · El precio de África', '2 · El hambre', '3 · La presión británica', '4 · La advertencia de Canaris', '5 · Barbarroja']};
const LIST_LECTURAS = {title: 'Lecturas de Hendaya', kicker: 'El mito y la historia', items: ['Régimen: el Caudillo «burló» a Hitler', 'Preston: quería entrar, pero el precio era imposible', 'Cambridge (2023): chocaron las ambiciones en África', 'Otras lecturas: pesó la debilidad española']};
SPECIAL[1].push({m: 'En Jaén', kind: 'quote', spec: {variant: 'stat', kicker: 'Jaén · primeros meses de 1940', big: '+20 días', text: 'al mes sin recibir pan en Andújar, Linares o Úbeda', by: 'Contemporary European History · Cambridge, 2023'}, dur: 7});
SPECIAL[3].push({m: 'A principios de junio de 1940', kind: 'quote', spec: {variant: 'stat', kicker: 'Gibraltar · junio de 1940', big: '13.500', text: 'civiles evacuados a Casablanca', by: 'La guarnición se más que duplicó'}, dur: 7});
SPECIAL[4].push({m: 'Un consejero económico', kind: 'quote', spec: {variant: 'quote', kicker: 'David Eccles · embajada británica', text: 'Alemania no podía ofrecerle trigo, petróleo ni algodón; la Commonwealth, sí', by: 'Asesor económico de Samuel Hoare'}, dur: 8});
SPECIAL[5].push({m: 'Un historiador español, Enrique Moradiellos', kind: 'quote', spec: {variant: 'quote', kicker: 'Enrique Moradiellos · historiador', text: 'Un apetito imperial excesivo para alguien con tan pocos dientes', by: 'Sobre Hendaya'}, dur: 7});
SPECIAL[6] = [{m: 'Con los años, el régimen', kind: 'list', spec: LIST_LECTURAS, dur: 11}, {m: 'Lo que nadie discute', kind: 'quote', spec: {variant: 'stat', kicker: 'Lo que nadie discute', big: '', text: 'Hendaya no fue una victoria brillante de Franco. Fue un regateo que se estancó.'}, dur: 7}];
SPECIAL[7].push({m: 'Según los planes conocidos', kind: 'quote', spec: {variant: 'stat', kicker: 'Operación Félix · el plan', big: '2 cuerpos', text: 'de ejército cruzarían los Pirineos', by: 'Kübler (asalto) · Schmidt (cobertura)'}, dur: 7});
SPECIAL[9].push({m: 'Cuando Hitler recibió el informe', kind: 'quote', spec: {variant: 'quote', kicker: 'Hitler · carta a Mussolini', text: 'Temo que Franco esté cometiendo el mayor error de su vida', by: 'Tras cancelar la Operación Félix'}, dur: 8});
SPECIAL[11] = [{m: 'Pero sí hay un orden de importancia', kind: 'list', spec: LIST_RAZONES, dur: 11}, {m: 'Hay un detalle revelador', kind: 'quote', spec: {variant: 'stat', kicker: 'El pan se detenía', big: '30.000 t', text: 'de trigo detenidas tras Hendaya', by: 'Según las memorias de Serrano Súñer'}, dur: 8}];
SPECIAL[12] = [{m: 'Porque las grandes decisiones', kind: 'quote', spec: {variant: 'quote', kicker: 'Línea Roja', text: 'Las grandes decisiones de la historia casi nunca las toma un genio. Las toma una despensa vacía.'}, dur: 8}];
const CARDS = {
  0: [['Octubre de 1940.', 'Octubre de 1940'], ['Siete horas después', 'Directiva nº 18', 'Núremberg · PS-444']],
  1: [['Primero de abril de 1939', '1 de abril de 1939', 'Fin de la guerra civil'], ['Desde el uno de diciembre de 1939', '1 de diciembre de 1939', 'Sistema de navicerts']],
  2: [['Mayo y junio de 1940', 'Junio de 1940', 'Cae Francia'], ['El catorce de junio', '14 de junio de 1940', 'España ocupa Tánger']],
  3: [['Canaris volvió de Algeciras', 'Julio de 1940', 'Canaris en Algeciras'], ['El veinticuatro de agosto', '24 de agosto de 1940', 'Hitler aprueba el plan']],
  4: [['En junio de 1940, justo cuando', 'Junio de 1940', 'Hoare llega a Madrid']],
  5: [['Hendaya es una pequeña localidad', 'Hendaya · 23 de octubre de 1940', 'La única entrevista']],

  7: [['El doce de noviembre de 1940', '12 de noviembre de 1940', 'Directiva nº 18']],
  8: [['El cinco de diciembre', '5 de diciembre de 1940', 'Hitler pide el paso'], ['Dos días después, el siete de diciembre', '7 de diciembre de 1940', 'Canaris ante Franco']],
  9: [['El dieciocho de diciembre de 1940', '18 de diciembre de 1940', 'Directiva 21 · Barbarroja'], ['En febrero de 1941', 'Febrero de 1941', 'Franco vuelve a decir no']],
  10: [['Se llamaba Operación Pilgrim', 'Operación Pilgrim', 'Plan británico sobre Canarias']],
  12: [['Cuando Alemania invadió', '1941', 'La División Azul']],
};

const CUES = {
  0: [['', 'hitler'], ['Adolf Hitler acaba', 'hitler'], ['Francisco Franco llegó', 'franco'], ['Siete horas después', 'franco'], ['La explicación que se ha repetido', 'franco']],
  1: [['', 'guerra'], ['Esa devastación', 'guerra'], ['Ese alguien era la Marina', 'franco']],
  2: [['', 'francia'], ['Pero Gran Bretaña no pidió', 'bretana'], ['Gibraltar controla', 'bretana']],
  3: [['', 'canaris'], ['Canaris no era un observador', 'canaris'], ['Pero el plan siguió adelante', 'serrano'], ['Mientras tanto, en el propio Peñón', 'gibraltar']],
  4: [['', 'hoare'], ['Londres jugó', 'churchill'], ['Hay, además, un capítulo', 'churchill']],
  5: [['', 'hendaye'], ['Fue la única vez', 'ribbentrop'], ['Cada una de esas peticiones', 'petain'], ['Poco después, según cuenta', 'hendaye']],
  6: [['', 'franco'], ['El historiador Paul Preston', 'hitler']],
  7: [['', 'wehrmacht'], ['El ataque empezaría por el aire', 'stuka'], ['Los submarinos esperarían', 'uboat']],
  8: [['', 'canaris'], ['Primera: la flota británica', 'gibraltar']],
  9: [['', 'barbarroja']],
  10: [['', 'rn']],
  11: [['', 'franco']],
  12: [['', 'azul']],
};

const TITLE = 'La Verdadera Razón Por La Que Hitler Nunca Invadió España';

// ---------- utilidades ----------
function mulberry32(a) {
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rnd = mulberry32(20451945);

// ---------- 1) horario de audio ----------
const GAP_SENT = 0.12;
const GAP_PAR = 0.25;
const GAP_CH = 0.5;
const GAP_TITLE = 5.0;
const START = 1.4;
const END_PAD = 1.4;
const OUTRO = 9.0;

let t = START;
const schedule = []; // {type:'voice'|'silence', id?, dur}
schedule.push({type: 'silence', dur: START});
const chapters = [...new Set(sentences.map((s) => s.chapter))];
const chInfo = {};
sentences.forEach((s, i) => {
  s.start = t;
  s.end = t + s.dur;
  schedule.push({type: 'voice', id: s.id, dur: s.dur});
  t = s.end;
  const next = sentences[i + 1];
  let gap;
  if (!next) gap = END_PAD + OUTRO;
  else if (next.chapter !== s.chapter) gap = s.chapter === 0 ? GAP_TITLE : GAP_CH;
  else gap = s.lastOfPar ? GAP_PAR : GAP_SENT;
  schedule.push({type: 'silence', dur: gap});
  t += gap;
  const ci = (chInfo[s.chapter] ||= {n: s.chapter, first: s.start, last: s.end});
  ci.last = s.end;
});
const TOTAL = t;
const durationInFrames = f(TOTAL);

// ---------- 2) ventanas de capítulo ----------
const windows = {};
chapters.forEach((n, k) => {
  const ci = chInfo[n];
  const nextCh = chInfo[chapters[k + 1]];
  let start = k === 0 ? 0 : n === 1 ? ci.first - 0.6 : ci.first - 0.3;
  let end;
  if (k === chapters.length - 1) end = ci.last + END_PAD;
  else if (n === 0) end = ci.last + 0.8;
  else end = nextCh.first - 0.3;
  windows[n] = {start, end};
});
const titleWin = {start: chInfo[0].last + 0.8, end: chInfo[1].first - 0.6};
const outroWin = {start: chInfo[12].last + END_PAD, end: TOTAL};

// ---------- 3) buscar frases ----------
const sentIn = (ch, m) => sentences.find((s) => s.chapter === ch && s.text.toLowerCase().includes(m.toLowerCase()));
const warn = [];

// ---------- 4) planos ----------
const shots = [];
const cards = [];
const sfx = [];
const byChapter = {};
for (const im of images) (byChapter[im.chapter] ||= []).push(im);
const usage = new Map();
const bgDone = new Set();
const bgOf = (file) => {
  const name = 'bg/' + path.basename(file).replace(/\.[^.]+$/, '') + '.jpg';
  if (!bgDone.has(name)) {
    const dest = path.join(ROOT, 'public', name);
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(path.dirname(dest), {recursive: true});
      execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-i', path.join(ROOT, 'public', file), '-vf', 'scale=240:-2,gblur=sigma=4,eq=brightness=-0.30:saturation=0,format=yuvj420p', '-q:v', '3', dest]);
    }
    bgDone.add(name);
  }
  return name;
};

// Encuadres de foto que se alternan: marco centrado / pantalla completa / marco ladeado con año y fuente al lado
const LAYOUTS = ['center', 'tiltR', 'full', 'tiltL', 'center', 'full', 'tiltL', 'tiltR', 'full', 'center'];
let photoCount = 0;
const layoutFor = (im) => {
  let l = LAYOUTS[photoCount++ % LAYOUTS.length];
  const ar = im.width / im.height;
  if (l === 'full' && (ar < 1.15 || im.width < 1300)) l = photoCount % 2 ? 'tiltL' : 'tiltR';
  if ((l === 'tiltL' || l === 'tiltR') && ar > 2.2) l = 'center';
  return l;
};
const captionFor = (im) => {
  if (im.ai) return {credit: 'Ilustración generada con IA'};
  const y = ((im.date || '').match(/(19[3-5]\d)/) || (im.title || '').match(/(19[3-5]\d)/) || [])[1];
  const raw = `${im.artist || ''} ${im.credit || ''}`;
  let credit = 'Wikimedia Commons';
  if (/signal corps|nara|national archives|u.s. army|us army/i.test(raw)) credit = 'US Army Signal Corps · NARA';
  else if (/library of congress|loc./i.test(raw)) credit = 'Library of Congress';
  else if (/bundesarchiv/i.test(raw)) credit = 'Bundesarchiv';
  else if (/u.s. navy|us navy|naval/i.test(raw)) credit = 'US Navy · NARA';
  else if (im.artist && im.artist.length >= 5 && im.artist.length < 40 && !/unknown/i.test(im.artist)) credit = im.artist;
  return {year: y, credit};
};
const baked = (file) => file.replace(/^img\//, 'img_b/');
const FOCI = [[0.5, 0.38], [0.28, 0.4], [0.72, 0.4], [0.5, 0.62], [0.35, 0.3], [0.65, 0.55]];
function makePhotoShot(im, startT, endT, variant) {
  const portrait = im.width / im.height < 1.15;
  const focus = FOCI[variant % FOCI.length];
  const fy = portrait ? Math.min(focus[1], 0.3) : focus[1];
  const strong = variant > 0;
  const z0 = strong ? 1.22 + rnd() * 0.08 : 1.0;
  const z1 = strong ? z0 + 0.1 : 1.1 + rnd() * 0.05;
  const rev = rnd() < 0.4;
  const dx = (rnd() < 0.5 ? -1 : 1) * (14 + rnd() * 20);
  const dy = (rnd() < 0.5 ? -1 : 1) * (8 + rnd() * 12);
  return {
    kind: 'photo', from: f(startT), dur: Math.max(1, f(endT) - f(startT)), src: baked(im.file), bg: bgOf(baked(im.file)), image: im.file, ai: !!im.ai,
    kb: rev ? {z0: z1, z1: z0, fx: focus[0], fy, dx: -dx, dy: -dy} : {z0, z1, fx: focus[0], fy, dx, dy},
  };
}

// clips de vídeo de archivo (data/clips.json)
const CLIPLIST = fs.existsSync(path.join(ROOT, 'data', 'clips.json')) ? JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'clips.json'), 'utf8')) : [];
const CLIPBY = {};
const CLIPBLOCK = new Set(fs.existsSync(path.join(ROOT, 'data', 'clip_block.json')) ? JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'clip_block.json'), 'utf8')) : []);
for (const c of CLIPLIST) if (!CLIPBLOCK.has(c.id)) (CLIPBY[c.tag] ||= []).push(c);
for (const k of Object.keys(CLIPBY)) CLIPBY[k].sort(() => rnd() - 0.5); // barajado con semilla fija
const clipUsed = new Set();
const CHCLIP = Object.fromEntries(Array.from({length: 13}, (_, i) => [i, ['f1940', 'guerra1940']]));
CHCLIP[1] = ['guerracivil', 'f1940', 'guerra1940'];
CHCLIP[6] = ['guerracivil', 'f1940', 'guerra1940'];
CHCLIP[11] = ['guerracivil', 'guerra1940', 'f1940'];
CHCLIP[4] = ['guerra1940', 'rn', 'f1940'];
CHCLIP[10] = ['rn', 'guerra1940', 'f1940'];
const CLIPCUE = {};
const FORCE_VIDEO = {0: ['Fecha prevista para cruzar', 'Ni un solo soldado'], 1: ['Esa devastación'], 2: ['El doce de julio']};

for (const n of chapters) {
  const win = windows[n];
  // especiales
  const specials = [];
  for (const sp of SPECIAL[n] || []) {
    const s = sentIn(n, sp.m);
    if (!s) { warn.push(`SPECIAL no encontrado ch${n}: ${sp.m}`); continue; }
    const st = Math.max(win.start, s.start - 0.1);
    specials.push({...sp, start: st, end: Math.min(win.end, st + sp.dur)});
  }
  specials.sort((a, b) => a.start - b.start);
  for (let q = 1; q < specials.length; q++) { const pe = specials[q - 1].end; if (specials[q].start < pe + 0.2) { const dd = specials[q].end - specials[q].start; specials[q].start = pe + 0.2; specials[q].end = Math.min(win.end, specials[q].start + dd); warn.push(`SPECIAL desplazado ch${n}: ${specials[q].m}`); } }
  // huecos libres
  const free = [];
  let cursor = win.start;
  for (const sp of specials) {
    if (sp.start - cursor > 0.01) free.push([cursor, sp.start]);
    cursor = sp.end;
  }
  if (win.end - cursor > 0.01) free.push([cursor, win.end]);

  // cues
  const cueList = (CUES[n] || []).map(([m, tag]) => {
    if (m === '') return {t: win.start, tag};
    const s = sentIn(n, m);
    if (!s) { warn.push(`CUE no encontrado ch${n}: ${m}`); return null; }
    return {t: s.start, tag};
  }).filter(Boolean).sort((a, b) => a.t - b.t);
  // Capítulos con pocas fotos propias toman prestadas fotos temáticamente compatibles de otros (como extras "x9")
  const BORROW = {6: [[0, 'franco'], [1, 'franco']], 11: [[2, 'francia'], [9, 'barbarroja'], [7, 'wehrmacht']], 12: [[9, 'barbarroja']]};
  const pool = [...(byChapter[n] || []), ...((BORROW[n] || []).flatMap(([c, t]) => (byChapter[c] || []).filter((p) => p.tag === t).map((p) => ({...p, tag: 'x9'}))))];
  const tags = [...new Set(pool.map((p) => p.tag))];
  const tagAt = (tt) => {
    let cur = cueList[0]?.tag;
    for (const c of cueList) if (c.t <= tt + 0.01) cur = c.tag;
    return cur;
  };

  // Los cambios de tema (cues) fuerzan un corte para que la imagen coincida con la frase.
  const cutTimes = cueList.map((c) => c.t).filter((x) => x > win.start + 0.5);
  const freeSegs = [];
  for (const [a, b] of free) {
    const pts = [a, ...cutTimes.filter((x) => x > a + 3.3 && x < b - 3.3), b];
    const clean = [pts[0]];
    for (let i = 1; i < pts.length; i++) {
      if (pts[i] - clean[clean.length - 1] >= 3.3 || i === pts.length - 1) clean.push(pts[i]);
    }
    for (let i = 0; i < clean.length - 1; i++) freeSegs.push([clean[i], clean[i + 1]]);
  }

  const chapterShots = [];
  for (const sp of specials) {
    const base = {from: f(sp.start), dur: f(sp.end) - f(sp.start)};
    if (sp.kind === 'map') chapterShots.push({...base, kind: 'map', map: sp.map});
    else chapterShots.push({...base, kind: sp.kind, spec: sp.spec});
    if (sp.kind === 'doc') { sfx.push({t: sp.start + 0.25, type: 'tick'}, {t: sp.start + 4.0, type: 'stamp'}); }
    else if (sp.kind === 'telegram') { sfx.push({t: sp.start + 0.4, type: 'tick'}); }
    else if (sp.kind === 'list') { for (let q = 0; q < sp.spec.items.length; q++) sfx.push({t: sp.start + (24 + q * 26 + 4) / FPS, type: 'ping'}); }
    else if (sp.kind === 'timeline') { for (let q = 0; q < sp.spec.events.length; q++) sfx.push({t: sp.start + (40 + q * 22 + 6) / FPS, type: 'ping'}); }
    else sfx.push({t: sp.start, type: 'whoosh'});
  }
  // Relleno: mezcla continua de fotos y clips de vídeo de archivo (sin repetir ninguno); planos de 4-6,5 s.
  const clipPrefs = (tt) => {
    let cur = CHCLIP[n] || ['victory'];
    for (const [t0, tags2] of clipCues) if (t0 <= tt + 0.01) cur = tags2;
    return cur;
  };
  const clipCues = (CLIPCUE[n] || []).map(([m, tg]) => { const ss = sentIn(n, m); return ss ? [ss.start, [tg, ...(CHCLIP[n] || [])]] : null; }).filter(Boolean).sort((p, q) => p[0] - q[0]);
  const pickClip = (tt) => { for (const tg of clipPrefs(tt)) { const c = (CLIPBY[tg] || []).find((x) => !clipUsed.has(x.id)); if (c) return c; } return null; };
  const pickPhoto = (tt) => {
    const tag = tagAt(tt);
    const unusedOf = (arr) => arr.filter((p) => !usage.has(p.file));
    const own = pool.filter((p) => p.tag === tag);
    const extras = pool.filter((p) => /^[xy][0-9]/.test(p.tag));
    let c1 = unusedOf(own);
    if (!c1.length) c1 = unusedOf(extras);
    if (!c1.length) c1 = unusedOf(pool);
    return c1[0] || null;
  };
  let pat = 0;
  for (const [a, b] of freeSegs) {
    let t = a;
    let first = true;
    while (b - t > 0.05) {
      const remain = b - t;
      if (remain < 1.7) {
        const prev = chapterShots.filter((q) => q.from + q.dur === f(t)).pop();
        if (prev) { prev.dur += f(b) - f(t); break; }
      }
      const forceV = (FORCE_VIDEO[n] || []).some((mm) => { const ss = sentIn(n, mm); return ss && t >= ss.start - 0.3 && t <= ss.end + 0.2; });
      const wantVideo = forceV || [1, 3].includes(pat % 5);
      pat++;
      let unit = null;
      let dur = 0;
      if (wantVideo) { const c = pickClip(t); if (c) { unit = {clip: c}; dur = Math.min(c.dur - 0.15, 4.6 + rnd() * 1.6, remain); } }
      if (!unit) {
        const im = pickPhoto(t);
        if (im) { unit = {photo: im}; dur = Math.min(4.4 + rnd() * 1.8, remain); }
        else { const c = pickClip(t); if (c) { unit = {clip: c}; dur = Math.min(c.dur - 0.15, 5.5, remain); } }
      }
      if (!unit) { for (const tg of Object.keys(CLIPBY)) { const c = CLIPBY[tg].find((x) => !clipUsed.has(x.id)); if (c) { unit = {clip: c}; dur = Math.min(c.dur - 0.15, 5.5, remain); break; } } }
      if (!unit) { // sin material libre: la foto menos usada (se avisa)
        const im = [...pool].sort((x, y) => (usage.get(x.file) || 0) - (usage.get(y.file) || 0))[0];
        unit = {photo: im}; dur = Math.min(5.5, remain);
        warn.push(`REPETIDA forzada ch${n} en ${t.toFixed(0)}s`);
      }
      if (remain - dur < 2.0 && unit.photo) dur = remain <= 7 ? remain : remain / 2;
      if (unit.photo) {
        const u = usage.get(unit.photo.file) || 0;
        usage.set(unit.photo.file, u + 1);
        { const sh = makePhotoShot(unit.photo, t, t + dur, u); sh.layout = layoutFor(unit.photo); sh.caption = captionFor(unit.photo); chapterShots.push(sh); }
      } else {
        clipUsed.add(unit.clip.id);
        chapterShots.push({kind: 'video', from: f(t), dur: Math.max(1, f(t + dur) - f(t)), src: unit.clip.file, bg: unit.clip.bg, clip: unit.clip.id});
      }
      t += dur;
      first = false;
    }
  }
  chapterShots.sort((x, y) => x.from - y.from);
  shots.push(...chapterShots);

  // tarjetas
  for (const [m, title, sub] of CARDS[n] || []) {
    const s = sentIn(n, m);
    if (!s) { warn.push(`CARD no encontrada ch${n}: ${m}`); continue; }
    let st = s.start;
    const prev = cards[cards.length - 1];
    if (prev && f(st) < prev.from + prev.dur + 6) st = (prev.from + prev.dur + 6) / FPS;
    cards.push({from: f(st), dur: f(5.5), title, sub});
    sfx.push({t: st, type: 'thud'});
  }
}

// título y cierre
shots.push({kind: 'title', from: f(titleWin.start), dur: f(titleWin.end) - f(titleWin.start), title: TITLE});
sfx.push({t: titleWin.start - 3.0, type: 'riser'});
sfx.push({t: titleWin.start + 0.15, type: 'impact'});
const outroImg = (byChapter[12] || [])[0];
shots.push({kind: 'outro', from: f(outroWin.start), dur: durationInFrames - f(outroWin.start), src: outroImg ? baked(outroImg.file) : undefined, bg: outroImg ? bgOf(baked(outroImg.file)) : undefined});
sfx.push({t: outroWin.start, type: 'impact'});

shots.sort((a, b) => a.from - b.from);
// fusionar planos absurdamente cortos (< 1,5 s) con el anterior
for (let i = shots.length - 1; i > 0; i--) { if ((shots[i].kind === 'photo' || shots[i].kind === 'video') && shots[i].dur < 45) { shots[i - 1].dur += shots[i].dur; shots.splice(i, 1); } }
for (const sh of shots) if ((sh.kind === 'photo' || sh.kind === 'video') && sh.from > 0) sfx.push({t: sh.from / FPS, type: 'cut'});
// rellenar huecos/solapes para cobertura continua
for (let i = 0; i < shots.length; i++) {
  const nx = shots[i + 1];
  if (nx) shots[i].dur = nx.from - shots[i].from;
}
shots[shots.length - 1].dur = durationInFrames - shots[shots.length - 1].from;
if (shots[0].from !== 0) shots[0] = {...shots[0], dur: shots[0].dur + shots[0].from, from: 0};

// ---------- 5) subtítulos ----------
const subs = [];
function chunk(text) {
  if (text.length <= 92) return [text];
  const n = Math.ceil(text.length / 78);
  const words = text.split(' ');
  const out = [];
  const target = text.length / n;
  let cur = [];
  let len = 0;
  for (let i = 0; i < words.length; i++) {
    cur.push(words[i]);
    len += words[i].length + 1;
    const endsPunct = /[,;:.!?]$/.test(words[i]);
    if (out.length < n - 1 && (len >= target || (endsPunct && len >= target * 0.8))) {
      out.push(cur.join(' '));
      cur = [];
      len = 0;
    }
  }
  if (cur.length) out.push(cur.join(' '));
  return out;
}
for (const s of sentences) {
  const parts = chunk(s.text);
  const total = parts.reduce((a, p) => a + p.length, 0);
  // inicio de cada trozo: con marcas de tiempo reales de la voz si existen; si no, reparto por caracteres
  const starts = [];
  let chars = 0;
  parts.forEach((p) => {
    let t0;
    if (s.words?.length) {
      // posición relativa en caracteres -> marca de palabra más cercana (las marcas cubren toda la frase)
      const wl = s.words.map((w) => w.w.length + 1);
      const wtot = wl.reduce((a, b) => a + b, 0);
      const target = (chars / total) * wtot;
      let cum = 0;
      let j = 0;
      while (j < wl.length - 1 && cum + wl[j] <= target + 0.5) { cum += wl[j]; j++; }
      t0 = chars === 0 ? 0 : s.words[j].t;
    } else t0 = (s.dur * chars) / total;
    starts.push(s.start + t0);
    chars += p.length;
  });
  parts.forEach((p, i) => {
    const a = starts[i];
    const b = i + 1 < parts.length ? starts[i + 1] : s.end;
    subs.push({from: f(a), dur: Math.max(1, f(b) - f(a)), text: p});
  });
}

// ---------- salida ----------
const timeline = {
  fps: FPS, width: 1920, height: 1080, durationInFrames, totalSeconds: TOTAL,
  chapters: chapters.map((n) => ({n, start: f(windows[n].start), end: f(windows[n].end)})),
  shots, cards, subs,
};
fs.writeFileSync(path.join(ROOT, 'data', 'timeline.json'), JSON.stringify(timeline));
fs.writeFileSync(path.join(ROOT, 'data', 'schedule.json'), JSON.stringify(schedule));
fs.writeFileSync(path.join(ROOT, 'data', 'sfx.json'), JSON.stringify(sfx.sort((a, b) => a.t - b.t)));
// Informe de coherencia imagen-frase (para revisión manual)
{
  const byF = new Map(images.map((i) => [i.file, i]));
  const rows = shots.filter((s) => s.kind === 'photo').map((s) => {
    const mid = (s.from + s.dur / 2) / FPS;
    const sent = sentences.find((x) => x.start <= mid && mid <= x.end + 0.9) || sentences.find((x) => x.start > mid);
    const im = byF.get(s.src);
    return `${(mid / 60).toFixed(1)}m ch${sent?.chapter ?? '?'} [${im?.tag}] ${im?.title.replace('File:', '').slice(0, 70)}\n     «${(sent?.text || '').slice(0, 110)}»`;
  });
  fs.writeFileSync(path.join(ROOT, 'data', 'shot_review.txt'), rows.join('\n'));
}
const kinds = shots.reduce((a, s) => ((a[s.kind] = (a[s.kind] || 0) + 1), a), {});
const avg = shots.filter((s) => s.kind === 'photo').reduce((a, s) => a + s.dur, 0) / kinds.photo / FPS;
console.log(`duración ${(TOTAL / 60).toFixed(1)} min · ${durationInFrames} frames · planos`, kinds, `· foto media ${avg.toFixed(1)}s · tarjetas ${cards.length} · subs ${subs.length}`);
const unused = images.filter((p) => !usage.has(p.file)).length;
console.log(`imágenes usadas ${usage.size}/${images.length} (sin usar ${unused})`);
if (warn.length) console.log('AVISOS:\n' + warn.join('\n'));
