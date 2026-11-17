// Mezcla final: voz (Álvaro +6 %, sin silencios largos) + música instrumental tensa (síntesis propia) + SFX suaves, con ducking.
// Uso: node tools/build_audio.mjs            -> mezcla completa en public/audio/mezcla_final.m4a
//      TEST_SECONDS=45 node tools/build_audio.mjs -> data/audio/prueba_mix.m4a (primeros N segundos)
import fs from 'node:fs';
import path from 'node:path';
import {execFileSync} from 'node:child_process';

const ROOT = path.resolve(import.meta.dirname, '..');
const A = path.join(ROOT, 'data', 'audio');
fs.mkdirSync(A, {recursive: true});
const ff = (args) => execFileSync('ffmpeg', ['-y', '-loglevel', 'error', ...args], {stdio: ['ignore', 'inherit', 'inherit']});
const schedule = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'schedule.json'), 'utf8'));
const timeline = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'timeline.json'), 'utf8'));
const TEST = process.env.TEST_SECONDS ? Number(process.env.TEST_SECONDS) : null;
const TOTAL = TEST ? Math.min(TEST, timeline.totalSeconds) : timeline.totalSeconds;
const VOICE_DIR = process.env.VOICE_DIR || 'voice_edge0';

// 1) narración: concat de frases (ya recortadas) + silencios cortos
const lines = [];
const silences = new Map();
for (const seg of schedule) {
  if (seg.type === 'voice') lines.push(`file '${path.join(ROOT, 'data', VOICE_DIR, `s_${String(seg.id).padStart(4, '0')}.wav`).replace(/\\/g, '/')}'`);
  else {
    const ms = Math.round(seg.dur * 1000);
    if (!silences.has(ms)) {
      const p = path.join(A, `sil_${ms}.wav`);
      if (!fs.existsSync(p)) ff(['-f', 'lavfi', '-i', 'anullsrc=r=24000:cl=mono', '-t', String(ms / 1000), '-c:a', 'pcm_s16le', p]);
      silences.set(ms, p);
    }
    lines.push(`file '${silences.get(ms).replace(/\\/g, '/')}'`);
  }
}
fs.writeFileSync(path.join(A, 'concat.txt'), lines.join('\n'));
ff(['-f', 'concat', '-safe', '0', '-i', path.join(A, 'concat.txt'), '-c:a', 'pcm_s16le', path.join(A, 'narration_raw.wav')]);
// voz natural: solo limpieza de graves y compresión suave, estéreo a 48 kHz
ff(['-i', path.join(A, 'narration_raw.wav'), '-af', 'highpass=f=60,acompressor=threshold=-22dB:ratio=2:attack=15:release=250:makeup=2,aresample=48000,pan=stereo|c0=c0|c1=c0', path.join(A, 'narration.wav')]);

// Niveles por defecto de la mezcla (ajuste del usuario tras escuchar Unthinkable: SFX −7 dB y música −3 dB)
const VOICE_LUFS = -19;
const MUSIC_LUFS = -31;   // audible pero por debajo de la voz (v1: -27 algo alto; -30 con graves = inaudible)
const SFX_GAIN = 0.4;     // antes 0.9  (≈ −7 dB)

// 2) música + SFX (síntesis propia, sin derechos). REMIX=1 reutiliza los stems ya sintetizados.
if (!(process.env.REMIX && fs.existsSync(path.join(A, 'music.wav')) && fs.existsSync(path.join(A, 'sfx_track.wav')))) {
  execFileSync('node', [path.join(ROOT, 'tools', 'synth_audio.mjs'), ...(TEST ? [String(TOTAL + 2)] : [])], {stdio: 'inherit'});
}

// 3) mezcla: voz a -19 LUFS, música a -27 LUFS con ducking bajo la voz, SFX suaves; normalización final a -16 LUFS
const mix = [
  `[0:a]loudnorm=I=${VOICE_LUFS}:TP=-2:LRA=7,asplit=2[nar][key]`,
  `[1:a]highpass=f=85,equalizer=f=450:t=q:w=0.9:g=3,equalizer=f=2200:t=q:w=1:g=2.5,loudnorm=I=${MUSIC_LUFS}:TP=-3:LRA=7[mus]`,
  '[mus][key]sidechaincompress=threshold=0.04:ratio=2.2:attack=40:release=700:makeup=1[duck]',
  `[2:a]volume=${SFX_GAIN}[sfx]`,
  '[nar][duck][sfx]amix=inputs=3:normalize=0:duration=longest,alimiter=limit=0.95,loudnorm=I=-18:TP=-1.5:LRA=9[out]',
].join(';');
const outFile = TEST ? path.join(A, 'prueba_mix.m4a') : path.join(ROOT, 'public', 'audio', 'mezcla_final.m4a');
fs.mkdirSync(path.dirname(outFile), {recursive: true});
const fade = TEST ? `,afade=t=out:st=${TOTAL - 1.2}:d=1.2` : '';
ff([
  '-i', path.join(A, 'narration.wav'), '-i', path.join(A, 'music.wav'), '-i', path.join(A, 'sfx_track.wav'),
  '-filter_complex', mix.replace('[out]', `${fade ? '[pre];[pre]' + fade.slice(1) + '[out]' : '[out]'}`),
  '-map', '[out]', '-t', String(TOTAL), '-c:a', 'aac', '-b:a', '192k', '-ar', '48000', outFile,
]);
console.log(`mezcla lista: ${(fs.statSync(outFile).size / 1e6).toFixed(1)} MB · ${(TOTAL / 60).toFixed(2)} min → ${outFile}`);
