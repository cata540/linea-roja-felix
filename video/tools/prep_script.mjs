// Extrae la locución del guion Markdown, la divide en frases y prepara texto para TTS.
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const md = fs.readFileSync(path.resolve(ROOT, '..', 'guion.md'), 'utf8');

// Pronunciación para el sintetizador (NO afecta a los subtítulos).
const PRON = [
  [/CAB 120\/691/g, 'C A B, ciento veinte, seiscientos noventa y uno'],
  [/Churchill/g, 'Chérchil'],
  [/Stalingrado/g, 'Estalingrado'],
  [/Stalin/g, 'Estalin'],
  [/Roosevelt/g, 'Rusvelt'],
  [/Truman/g, 'Trúman'],
  [/Potsdam/g, 'Pótsdam'],
  [/Torgau/g, 'Tórgau'],
  [/Zhukov/g, 'Yúkov'],
  [/Eisenhower/g, 'Áisenjauer'],
  [/Patton/g, 'Páton'],
  [/Stimson/g, 'Estímson'],
  [/Attlee/g, 'Átli'],
  [/Burgess/g, 'Bérgues'],
  [/Lublin/g, 'Lublín'],
  [/Hopkins/g, 'Jópkins'],
  [/Kyushu/g, 'Kiushu'],
  [/Downfall/g, 'Dáunfol'],
  [/Trinity/g, 'Trínidi'],
  [/Curzon/g, 'Kérzon'],
  [/Warm Springs/g, 'Uorm Sprins'],
  [/Fulton/g, 'Fúlton'],
  [/Hitler/g, 'Jítler'],
  [/Georgia/g, 'Yórya'],
  [/Livadia/g, 'Livádia'],
  [/OTAN/g, 'otán'],
  [/Dresde/g, 'Dresde'],
  [/Impensable/g, 'Impensable'],
];

const chapters = [];
let cur = null;
for (const line of md.split(/\r?\n/)) {
  const h = line.match(/^## CAP\. (\d+) · (.+?) \(/);
  if (h) {
    cur = {n: Number(h[1]), title: h[2].trim(), paras: []};
    chapters.push(cur);
    continue;
  }
  if (cur && line.startsWith('>')) {
    const t = line
      .replace(/^>\s*/, '')
      .replace(/⚠ VERIFICAR[^.]*\./g, '')
      .replace(/\s+/g, ' ')
      .trim();
    if (t) cur.paras.push(t);
  }
}

const sentences = [];
let id = 0;
for (const ch of chapters) {
  ch.paras.forEach((p, pi) => {
    const parts = p.split(/(?<=[.!?…])\s+(?=[A-ZÁÉÍÓÚÑ¿¡“"‘'])/).map((s) => s.trim()).filter(Boolean);
    parts.forEach((s, si) => {
      let tts = s.replace(/["“”]/g, '');
      for (const [re, rep] of PRON) tts = tts.replace(re, rep);
      sentences.push({id: id++, chapter: ch.n, par: pi, first: si === 0, lastOfPar: si === parts.length - 1, text: s, tts});
    });
  });
}

fs.mkdirSync(path.join(ROOT, 'data'), {recursive: true});
fs.writeFileSync(path.join(ROOT, 'data', 'sentences.json'), JSON.stringify(sentences, null, 1));
const words = sentences.reduce((a, s) => a + s.text.split(/\s+/).length, 0);
console.log(`capítulos ${chapters.length} · frases ${sentences.length} · palabras ${words}`);
