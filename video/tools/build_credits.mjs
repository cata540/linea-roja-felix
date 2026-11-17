import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const images = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'images.json'), 'utf8'));
const tl = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'timeline.json'), 'utf8'));

const used = new Set();
for (const s of tl.shots) {
  if (s.kind === 'photo' && s.image && !s.ai) used.add(s.image);
  if (s.kind === 'outro' && s.src) used.add(s.src.replace('img_b/', 'img/'));
}
const byFile = new Map(images.map((i) => [i.file, i]));
const rows = [...used].map((f) => byFile.get(f)).filter(Boolean).sort((a, b) => a.chapter - b.chapter || a.title.localeCompare(b.title));
const needsAttr = rows.filter((r) => /CC BY/i.test(r.license));

const L = [];
L.push('CRÉDITOS DE IMÁGENES, DATOS Y AUDIO · LÍNEA ROJA');
L.push('Vídeo 2: "La Verdadera Razón Por La Que Hitler Nunca Invadió España (Operación Félix)"');
L.push('');
L.push('Licencias comprobadas con la API de Wikimedia Commons el 2026-11-15. Solo dominio público y CC BY / CC BY-SA (con atribución).');
L.push('Se excluyó material del Imperial War Museum y cualquier licencia no comercial.');
L.push(`Imágenes de archivo usadas: ${rows.length} (dominio público: ${rows.length - needsAttr.length} · requieren atribución: ${needsAttr.length}).`);
L.push('');
L.push('=== TEXTO PARA LA DESCRIPCIÓN DE YOUTUBE ===');
L.push('Imágenes: US Army Signal Corps / U.S. National Archives, Library of Congress, Bundesarchiv y otros archivos (dominio público o CC BY / CC BY-SA), vía Wikimedia Commons. Listado completo abajo.');
L.push('Mapas: Natural Earth (dominio público). Esquemas ilustrativos con fronteras actuales.');
L.push('Documentos y telegrama: recreación gráfica propia a partir de la Directiva nº 18 (PS-444, Núremberg) y del acta de Vigón (Avalon Project).');
L.push('Vídeo de archivo: películas del gobierno de EE. UU. (Why We Fight; Naval Photographic Center / NARA; dominio público) y Prelinger Archives (Spain in Revolt; sin restricciones conocidas), vía Archive.org / Wikimedia Commons.');
L.push('Música y efectos: producción propia (síntesis), sin derechos de terceros. Voz: síntesis de voz neural (Microsoft Edge TTS, es-ES-AlvaroNeural).');
L.push('');
L.push('=== IMÁGENES QUE REQUIEREN ATRIBUCIÓN (CC BY / CC BY-SA) ===');
for (const r of needsAttr) {
  L.push(`- ${r.title.replace('File:', '')}`);
  L.push(`  Autor: ${r.artist || r.credit || 'ver página de origen'} · Licencia: ${r.license}`);
  L.push(`  ${r.page}`);
}
L.push('');
L.push('=== TODAS LAS IMÁGENES USADAS, POR CAPÍTULO ===');
let ch = -1;
for (const r of rows) {
  if (r.chapter !== ch) { ch = r.chapter; L.push(''); L.push(`-- Capítulo ${ch} --`); }
  L.push(`[${r.license}] ${r.title.replace('File:', '')}`);
  L.push(`   Autor/fuente: ${r.artist || r.credit || 'no indicado'} · ${r.page}`);
}
L.push('');
L.push('=== PORTADAS / RETRATOS ===');
L.push('Yalta summit 1945 with Churchill, Roosevelt, Stalin (recortes de Churchill y Stalin para los círculos de los mapas) · Army Signal Corps Collection, U.S. National Archives · Dominio público');
L.push('https://commons.wikimedia.org/wiki/File:Yalta_summit_1945_with_Churchill,_Roosevelt,_Stalin.jpg');
L.push('American and Soviet generals on the banks of the Elbe, Torgau, 26 April 1945 (111-SC-229966) · US Army Signal Corps / NARA · Dominio público');
L.push('');
const vids = fs.existsSync(path.join(ROOT, 'data', 'videos_src.json')) ? JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'videos_src.json'), 'utf8')) : {};
const usedSrc = new Set(tl.shots.filter((x) => x.kind === 'video').map((x) => x.clip.replace(/_\d+$/, '')));
L.push('=== VÍDEOS DE ARCHIVO (dominio público) ===');
for (const id of usedSrc) { const v = vids[id]; if (v) { L.push(`- ${v.title.replace('File:', '')} · ${v.license}`); L.push(`  Fuente: ${(v.credit || '').slice(0, 120)}`); L.push(`  ${v.page}`); } }
L.push('');
const aiList = fs.existsSync(path.join(ROOT, 'data', 'ai.json')) ? JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'ai.json'), 'utf8')) : [];
L.push('=== ILUSTRACIONES GENERADAS CON IA (rotuladas en pantalla) ===');
L.push('Modelo FLUX.1 [schnell] vía fal.ai. Son ilustraciones de ambientación, no fotografías de época.');
for (const a of aiList) L.push(`- ${a.id}: «${a.prompt.slice(0, 110)}»`);
L.push('');
L.push('=== FUENTES DOCUMENTALES ===');
L.push('Directiva nº 18 (12-nov-1940), doc. PS-444 · Harvard Law School, Nuremberg Trials Project · https://nuremberg.law.harvard.edu/documents/495-instructions-for-future-actions');
L.push('Acta del general Vigón, 7-dic-1940 (telegrama de Stohrer, 12-dic-1940) · The Avalon Project, Yale · https://avalon.law.yale.edu/wwii/sp12.asp');
L.push('«Building an Empire and Bringing About a Famine…», Contemporary European History (Cambridge UP, 2023).');
L.push('P. Preston, «Franco and Hitler: The Myth of Hendaye 1940», Contemporary European History 1(1), 1992.');
L.push('Á. Viñas, Operation Bribes (Routledge). · German History in Documents and Images (GHI Washington).');
L.push('');
L.push('=== DATOS Y TIPOGRAFÍAS ===');
L.push('Natural Earth, Admin 0 – Countries 1:50m · Dominio público · https://www.naturalearthdata.com');
L.push('Cormorant Garamond, Oswald, Special Elite · SIL Open Font License · vía Google Fonts');
L.push('');
const text = L.join('\n');
fs.writeFileSync(path.resolve(ROOT, '..', 'CREDITOS.txt'), text);
const ts = (fr) => { const ms = Math.round(fr / 30 * 1000); const p = (n, k = 2) => String(n).padStart(k, '0'); return p(Math.floor(ms / 3600000)) + ':' + p(Math.floor(ms / 60000) % 60) + ':' + p(Math.floor(ms / 1000) % 60) + ',' + p(ms % 1000, 3); };
const NL = String.fromCharCode(10);
fs.writeFileSync(path.resolve(ROOT, '..', 'Operacion_Felix_1940.srt'), tl.subs.map((c, i) => (i + 1) + NL + ts(c.from) + ' --> ' + ts(c.from + c.dur) + NL + c.text + NL).join(NL));
console.log(`créditos: ${rows.length} imágenes, ${needsAttr.length} con atribución`);
