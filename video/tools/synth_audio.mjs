// Música instrumental tensa (síntesis propia) + SFX suaves. Salida: data/audio/music.wav y sfx_track.wav (48 kHz, estéreo, 16 bit).
// Uso: node tools/synth_audio.mjs [segundos_max]   (si se indica, solo sintetiza los primeros N segundos)
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const A = path.join(ROOT, 'data', 'audio');
fs.mkdirSync(A, {recursive: true});
const SR = 48000;
const tl = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'timeline.json'), 'utf8'));
const events = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'sfx.json'), 'utf8'));
const LIMIT = process.argv[2] ? Number(process.argv[2]) : null;
const TOTAL = LIMIT ? Math.min(LIMIT, tl.totalSeconds) : tl.totalSeconds;
const N = Math.ceil(TOTAL * SR);

// ---- utilidades ----
let seed = 1945;
const rnd = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };
const midi = (m) => 440 * 2 ** ((m - 69) / 12);
const TAU = Math.PI * 2;
const saw = (ph) => 2 * (ph - Math.floor(ph + 0.5));
const smooth = (x) => { x = Math.max(0, Math.min(1, x)); return x * x * (3 - 2 * x); };

function writeWav(file, nSamples, producer) {
  const fd = fs.openSync(file, 'w');
  const hdr = Buffer.alloc(44);
  const dataBytes = nSamples * 4;
  hdr.write('RIFF', 0); hdr.writeUInt32LE(36 + dataBytes, 4); hdr.write('WAVEfmt ', 8);
  hdr.writeUInt32LE(16, 16); hdr.writeUInt16LE(1, 20); hdr.writeUInt16LE(2, 22); hdr.writeUInt32LE(SR, 24);
  hdr.writeUInt32LE(SR * 4, 28); hdr.writeUInt16LE(4, 32); hdr.writeUInt16LE(16, 34); hdr.write('data', 36); hdr.writeUInt32LE(dataBytes, 40);
  fs.writeSync(fd, hdr);
  const CH = SR * 10;
  for (let s0 = 0; s0 < nSamples; s0 += CH) {
    const len = Math.min(CH, nSamples - s0);
    const L = new Float32Array(len), R = new Float32Array(len);
    producer(s0, len, L, R);
    const buf = Buffer.alloc(len * 4);
    for (let i = 0; i < len; i++) {
      buf.writeInt16LE(Math.max(-32767, Math.min(32767, Math.round(L[i] * 32767))), i * 4);
      buf.writeInt16LE(Math.max(-32767, Math.min(32767, Math.round(R[i] * 32767))), i * 4 + 2);
    }
    fs.writeSync(fd, buf);
  }
  fs.closeSync(fd);
}

// ================= MÚSICA =================
const BPM = 72, BEAT = 60 / BPM, CHORD_BEATS = 8, CHORD = CHORD_BEATS * BEAT;
// Am – F – Dm – E (tensión menor armónica). Notas MIDI: fundamental, quinta, octava, tercera
const CH = [[33, 45, 52, 60], [29, 41, 48, 57], [26, 38, 45, 53], [28, 40, 47, 56]];
const chapterStarts = tl.chapters.map((c) => c.start / tl.fps);

// reverb de Schroeder
class Comb { constructor(d, g) { this.b = new Float32Array(d); this.i = 0; this.g = g; this.lp = 0; }
  p(x) { const y = this.b[this.i]; this.lp += 0.35 * (y - this.lp); this.b[this.i] = x + this.lp * this.g; if (++this.i >= this.b.length) this.i = 0; return y; } }
class AP { constructor(d) { this.b = new Float32Array(d); this.i = 0; }
  p(x) { const z = this.b[this.i]; const y = -x + z; this.b[this.i] = x + z * 0.5; if (++this.i >= this.b.length) this.i = 0; return y; } }
const k = SR / 44100;
const mkRev = (off) => ({c: [1557, 1617, 1491, 1422, 1277, 1356].map((d) => new Comb(Math.round((d + off) * k), 0.86)), a: [new AP(Math.round((225 + off) * k)), new AP(Math.round((556 + off) * k))]});
const revL = mkRev(0), revR = mkRev(23);
const runRev = (r, x) => { let s = 0; for (const c of r.c) s += c.p(x); s /= r.c.length; for (const a of r.a) s = a.p(s); return s; };

// estado de filtros
let padLpL = 0, padLpR = 0, ostLp = 0, subLp = 0;
const intensityAt = (t) => {
  // intensidad base lenta + subida dentro de cada capítulo (sube hacia el final y cae al empezar el siguiente)
  let ci = 0; for (let i = 0; i < chapterStarts.length; i++) if (t >= chapterStarts[i]) ci = i;
  const a = chapterStarts[ci], b = chapterStarts[ci + 1] ?? tl.totalSeconds;
  const p = (t - a) / Math.max(1, b - a);
  const base = 0.5 + 0.28 * p + 0.12 * Math.sin(ci * 1.7);
  const fadeIn = smooth(t / 5), fadeOut = smooth((tl.totalSeconds - t) / 8);
  return base * fadeIn * fadeOut;
};

function musicBlock(s0, len, L, R) {
  for (let n = 0; n < len; n++) {
    const t = (s0 + n) / SR;
    const I = intensityAt(t);
    const ci = Math.floor(t / CHORD), local = t - ci * CHORD;
    const cur = CH[ci % 4], prev = CH[(ci + 3) % 4];
    const w = smooth(local / 1.6);
    // pad de cuerdas (3 sierras desafinadas por nota), crossfade entre acordes
    let padL = 0, padR = 0;
    for (let v = 0; v < 4; v++) {
      for (const [notes, g] of [[cur, w], [prev, 1 - w]]) {
        if (g <= 0.001) continue;
        const f = midi(notes[v] + (v >= 2 ? 0 : 12));
        const a = saw(f * 0.997 * t) + saw(f * t) * 0.9 + saw(f * 1.003 * t + 0.31);
        padL += a * g * 0.045; padR += (saw(f * 1.002 * t + 0.17) + saw(f * 0.998 * t) * 0.9 + saw(f * t + 0.5)) * g * 0.045;
      }
    }
    const cut = 380 + 900 * I;
    const al = 1 - Math.exp(-TAU * cut / SR);
    padLpL += al * (padL - padLpL); padLpR += al * (padR - padLpR);
    let oL = padLpL * (0.8 + 0.5 * I), oR = padLpR * (0.8 + 0.5 * I);

    // sub-bajo continuo
    const root = midi(cur[0]);
    subLp += 0.02 * (Math.sin(TAU * root * t) * 0.5 + Math.sin(TAU * root * 2 * t) * 0.15 - subLp);
    oL += subLp * 0.9; oR += subLp * 0.9;

    // ostinato de corcheas grave (estilo cello pulsante)
    const eighth = BEAT / 2, tau = (t % eighth), step = Math.floor(t / eighth) % 8;
    const acc = [1, 0.45, 0.7, 0.45, 0.9, 0.45, 0.7, 0.6][step];
    const f0 = midi(cur[0] + 12) * (step === 6 ? 1.5 : 1);
    ostLp += 0.09 * (saw(f0 * t) - ostLp);
    const ost = ostLp * Math.exp(-7 * tau) * acc * 0.55 * Math.max(0, I - 0.25);
    oL += ost; oR += ost;

    // timbal / latido: pulso en cada compás y golpe fuerte en el primer tiempo del acorde
    if (t > 5) {
      const beatIdx = Math.floor(t / BEAT), tb = t - beatIdx * BEAT;
      const hard = beatIdx % CHORD_BEATS === 0, bar = beatIdx % 4 === 0;
      if (hard || bar) {
        const amp = (hard ? 1.0 : 0.55) * Math.min(1, I + 0.1);
        const kick = Math.sin(TAU * (46 + 60 * Math.exp(-tb * 22)) * tb) * Math.exp(-tb * (hard ? 3.2 : 5)) * 0.55 * amp;
        oL += kick; oR += kick;
      }
    }
    // brillo agudo muy sutil (tensión)
    const sh = (Math.sin(TAU * 1318.5 * t) + Math.sin(TAU * 1760 * t) * 0.7) * 0.012 * I * (0.5 + 0.5 * Math.sin(TAU * 0.11 * t));
    oL += sh; oR += sh * 0.8;

    // reverb
    const rl = runRev(revL, (oL + oR) * 0.5 * 0.5), rr = runRev(revR, (oL + oR) * 0.5 * 0.5);
    L[n] = Math.tanh((oL * 0.8 + rl * 0.9) * 0.5);
    R[n] = Math.tanh((oR * 0.8 + rr * 0.9) * 0.5);
  }
}

// ================= SFX =================
function mkWave(dur, fn) { const n = Math.ceil(dur * SR); const a = new Float32Array(n); for (let i = 0; i < n; i++) a[i] = fn(i / SR, i); return a; }
const noise = () => rnd() * 2 - 1;
function swish(len = 0.28, amp = 0.2) { let hp = 0, lp = 0, prev = 0; return mkWave(len, (t) => { const x = noise(); hp = x - prev * 0.8; prev = x; lp += 0.5 * (hp - lp); return lp * amp * Math.min(1, t / 0.03) * Math.exp(-t * 11) * (t < 0.03 ? t / 0.03 : 1); }); }
function whoosh(len = 1.0, amp = 0.32) { let lp = 0; return mkWave(len, (t) => { const c = 0.04 + 0.45 * smooth(t / len); lp += c * (noise() - lp); return lp * amp * Math.sin(Math.PI * Math.min(1, t / len)) ** 1.6 * 2.2; }); }
function thud(amp = 0.55) { return mkWave(0.7, (t) => (Math.sin(TAU * (44 + 52 * Math.exp(-t * 26)) * t) * Math.exp(-t * 7) + noise() * Math.exp(-t * 90) * 0.35) * amp); }
function stamp() { return mkWave(0.8, (t) => (Math.sin(TAU * (38 + 80 * Math.exp(-t * 30)) * t) * Math.exp(-t * 6.5) + noise() * Math.exp(-t * 55) * 0.5) * 0.9); }
function typing(n = 7) {
  const out = new Float32Array(Math.ceil((n * 0.13 + 0.2) * SR));
  let pos = 0;
  for (let k2 = 0; k2 < n; k2++) { pos += Math.round((0.07 + rnd() * 0.08) * SR); const len = Math.round(0.012 * SR); let prev = 0; for (let i = 0; i < len && pos + i < out.length; i++) { const x = noise(); out[pos + i] += (x - prev * 0.7) * Math.exp(-i / (len / 3)) * 0.32; prev = x; } }
  return out;
}
function ping() { return mkWave(0.5, (t) => Math.sin(TAU * 988 * t) * Math.exp(-t * 9) * 0.16); }
function riser() { let lp = 0; return mkWave(3.2, (t) => { const e = (t / 3.2) ** 2.2; lp += (0.05 + 0.5 * e) * (noise() - lp); return (lp * 0.7 + Math.sin(TAU * (90 + 330 * (t / 3.2)) * t) * 0.18) * e * 0.55; }); }
function impact() { return mkWave(3.2, (t) => (Math.sin(TAU * 36 * t) * Math.exp(-t * 1.5) * 0.95 + noise() * Math.exp(-t * 18) * 0.4 + Math.sin(TAU * 72 * t) * Math.exp(-t * 3) * 0.3)); }
const BANK = {cut: () => swish(0.3, 0.2 + rnd() * 0.06), thud: () => thud(0.5), tick: () => typing(8), stamp, whoosh: () => whoosh(1.0, 0.3), ping, riser, impact};
// Ganancia por tipo de efecto (por defecto desde 2026-11-16: carteles, sellos e impactos apenas se insinúan)
const TYPE_GAIN = {cut: 1, thud: 0.3, stamp: 0.3, impact: 0.45, whoosh: 0.5, tick: 0.5, ping: 0.55, riser: 0.55};
const placed = events.filter((e) => e.t < TOTAL).map((e) => {
  const w = (BANK[e.type] || BANK.thud)();
  const g = TYPE_GAIN[e.type] ?? 0.5;
  for (let i = 0; i < w.length; i++) w[i] *= g;
  return {s: Math.round(e.t * SR), w, pan: (rnd() - 0.5) * 0.5};
});

function sfxBlock(s0, len, L, R) {
  for (const e of placed) {
    const a = Math.max(s0, e.s), b = Math.min(s0 + len, e.s + e.w.length);
    for (let i = a; i < b; i++) { const v = e.w[i - e.s]; L[i - s0] += v * (1 - Math.max(0, e.pan)); R[i - s0] += v * (1 + Math.min(0, e.pan)); }
  }
  for (let i = 0; i < len; i++) { L[i] = Math.tanh(L[i]); R[i] = Math.tanh(R[i]); }
}

if (!process.env.SFX_ONLY) writeWav(path.join(A, 'music.wav'), N, musicBlock);
writeWav(path.join(A, 'sfx_track.wav'), N, sfxBlock);
console.log(`música y SFX: ${(N / SR).toFixed(1)} s · ${placed.length} efectos`);
