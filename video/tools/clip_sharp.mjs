// Mide la nitidez (energía de bordes) de cada clip y bloquea los más borrosos.
import fs from 'node:fs';
import path from 'node:path';
import {spawn} from 'node:child_process';
const ROOT = path.resolve(import.meta.dirname, '..');
const clips = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'clips.json'), 'utf8'));
const block = new Set(JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'clip_block.json'), 'utf8')));
const todo = clips.filter((c) => !block.has(c.id));
const res = {}; let i = 0;
async function w() { while (i < todo.length) { const c = todo[i++]; const out = await new Promise((r) => { let e = ''; const p = spawn('ffmpeg', ['-hide_banner', '-nostats', '-ss', String(Math.min(1.5, c.dur / 2)), '-i', path.join(ROOT, 'public', c.file), '-frames:v', '1', '-vf', 'scale=960:540,sobel,signalstats,metadata=print:key=lavfi.signalstats.YAVG', '-f', 'null', '-']); p.stderr.on('data', (d) => (e += d)); p.on('close', () => r(e)); }); res[c.id] = parseFloat((out.match(/YAVG=([\d.]+)/) || [])[1] || 0); } }
await Promise.all([w(), w(), w(), w()]);
const v = Object.values(res).sort((a, b) => a - b);
const thr = v[Math.floor(v.length * 0.15)];
const bad = Object.entries(res).filter(([, x]) => x <= thr).map(([k]) => k);
bad.forEach((k) => block.add(k));
fs.writeFileSync(path.join(ROOT, 'data', 'clip_block.json'), JSON.stringify([...block]));
console.log('umbral', thr.toFixed(2), 'bloqueados', bad.length, 'quedan', todo.length - bad.length);
