// Locución con msedge-tts (es-ES-AlvaroNeural) + marcas de tiempo por palabra, una frase por archivo.
// OJO: el texto del guion se envía al servicio de Microsoft Edge TTS (autorizado por el usuario).
// Uso: node tools/make_voice_edge.mjs [--test] [--force]
import fs from 'node:fs';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {MsEdgeTTS, OUTPUT_FORMAT} from 'msedge-tts';

const ROOT = path.resolve(import.meta.dirname, '..');
const OUT = path.join(ROOT, 'data', process.env.VOICE_DIR || 'voice_edge0');
fs.mkdirSync(OUT, {recursive: true});
const test = process.argv.includes('--test');
const force = process.argv.includes('--force');
const VOICE = 'es-ES-AlvaroNeural';
const RATE = process.env.RATE || '+0%';

const sentences = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'sentences.json'), 'utf8'));

// Pronunciación solo para el TTS (los subtítulos conservan la grafía original). Nombres ingleses/rusos.
const ALIAS = [
  [/Contemporary European History/g, 'Contémporari Yuropían Jístori'],
  [/Canaris/g, 'Canáris'], [/Reichenau/g, 'Ráijenau'], [/Kübler/g, 'Kíbler'], [/Schmidt/g, 'Chmit'],
  [/Hoare/g, 'Jor'], [/Eccles/g, 'Ekls'], [/Vichy/g, 'Vishí'], [/Pétain/g, 'Petén'], [/Montoire/g, 'Montuár'],
  [/Ribbentrop/g, 'Ribentrop'], [/Hitler/g, 'Jítler'], [/Göring/g, 'Géring'], [/Guderian/g, 'Gudérian'],
  [/Félix-Heinrich/g, 'Félix Jáinrij'], [/Heinrich/g, 'Jáinrij'], [/Pilgrim/g, 'Pílgrim'], [/Wilhelm/g, 'Vílhelm'],
  [/Ludwig/g, 'Lúdvig'], [/Rudolf/g, 'Rúdolf'], [/Walther/g, 'Válter'], [/Mussolini/g, 'Musolíni'], [/Goliath/g, 'Goliat'],
];
const alias = (t) => ALIAS.reduce((s, [re, r]) => s.replace(re, r), t);
const esc = (t) => t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const readStream = (s) => new Promise((res, rej) => { const c = []; s.on('data', (d) => c.push(d)); s.on('end', () => res(Buffer.concat(c))); s.on('error', rej); s.on('close', () => res(Buffer.concat(c))); });

async function makeClient() {
  const tts = new MsEdgeTTS();
  await tts.setMetadata(VOICE, OUTPUT_FORMAT.AUDIO_24KHZ_96KBITRATE_MONO_MP3, {wordBoundaryEnabled: true, sentenceBoundaryEnabled: true});
  return tts;
}

const todo = test ? sentences.slice(0, 3) : sentences;
let next = 0;
let done = 0;
async function worker(id) {
  let tts = await makeClient();
  while (true) {
    const i = next++;
    if (i >= todo.length) break;
    const s = todo[i];
    const base = path.join(OUT, `s_${String(s.id).padStart(4, '0')}`);
    if (!force && fs.existsSync(base + '.mp3') && fs.existsSync(base + '.json') && fs.existsSync(base + '.wav')) { done++; continue; }
    let ok = false;
    for (let a = 1; a <= 5 && !ok; a++) {
      try {
        const {audioStream, metadataStream} = tts.toStream(esc(alias(s.text)), {rate: RATE});
        const [buf, metaBuf] = await Promise.all([readStream(audioStream), metadataStream ? readStream(metadataStream) : Buffer.alloc(0)]);
        if (buf.length < 1500) throw new Error('audio vacío');
        const meta = [];
        for (const part of metaBuf.toString().split(/(?<=\})\s*(?=\{)/)) { try { const j = JSON.parse(part); meta.push(...(j.Metadata ?? [])); } catch {} }
        fs.writeFileSync(base + '.mp3', buf);
        fs.writeFileSync(base + '.json', JSON.stringify(meta));
        const firstT = (meta.find((m) => m.Type === 'WordBoundary')?.Data.Offset ?? 0) / 1e7;
        const lead = Math.max(0, firstT - 0.04);
        execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-ss', String(lead), '-i', base + '.mp3', '-af', 'areverse,silenceremove=start_periods=1:start_threshold=-42dB:start_duration=0.02,areverse', '-ar', '24000', '-ac', '1', '-c:a', 'pcm_s16le', base + '.wav']);
        fs.writeFileSync(base + '.lead', String(lead));
        ok = true;
      } catch (e) {
        console.log(`s${s.id} intento ${a} fallido: ${e.message}`);
        try { tts.close(); } catch {}
        await new Promise((r) => setTimeout(r, 1500 * a));
        tts = await makeClient();
      }
    }
    if (!ok) throw new Error('fallo en frase ' + s.id);
    done++;
    if (done % 20 === 0 || test) console.log(`${done}/${todo.length}`);
  }
  try { tts.close(); } catch {}
}
await Promise.all([worker(1), worker(2), worker(3)]);

// duración real + palabras (ms desde el inicio de la frase)
const out = sentences.map((s) => {
  const base = path.join(OUT, `s_${String(s.id).padStart(4, '0')}`);
  if (!fs.existsSync(base + '.wav')) return null;
  const dur = parseFloat(execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', base + '.wav']).toString());
  const meta = JSON.parse(fs.readFileSync(base + '.json', 'utf8'));
  const lead = fs.existsSync(base + '.lead') ? parseFloat(fs.readFileSync(base + '.lead', 'utf8')) : 0;
  const words = meta.filter((m) => m.Type === 'WordBoundary').map((m) => ({t: Math.max(0, m.Data.Offset / 1e7 - lead), d: m.Data.Duration / 1e7, w: m.Data.text?.Text ?? ''}));
  return {...s, dur, words};
}).filter(Boolean);
if (!test) fs.writeFileSync(path.join(ROOT, 'data', 'sentences_dur.json'), JSON.stringify(out));
const tot = out.reduce((a, s) => a + s.dur, 0);
const wc = out.reduce((a, s) => a + s.text.split(/\s+/).length, 0);
console.log(`frases ${out.length} · voz ${(tot / 60).toFixed(1)} min · ${(wc / (tot / 60)).toFixed(0)} palabras/min · con tiempos por palabra: ${out.filter((s) => s.words.length).length}`);
if (test) console.log(JSON.stringify(out[0].words.slice(0, 5)));
