// Quita franjas negras incrustadas en los clips (material 4:3 con barras) y rellena 1280x720 en modo "cover".
import fs from 'node:fs';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
const ROOT = path.resolve(import.meta.dirname, '..');
const clips = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'clips.json'), 'utf8'));
let fixed = 0, ok = 0, fail = 0;
for (const c of clips) {
  const f = path.join(ROOT, 'public', c.file);
  const r = spawnSync('ffmpeg', ['-hide_banner', '-nostats', '-ss', '0.6', '-i', f, '-t', '2.2', '-vf', 'cropdetect=limit=28:round=2:reset=0', '-f', 'null', '-'], {encoding: 'utf8'});
  const m = [...(r.stderr || '').matchAll(/crop=(\d+):(\d+):(\d+):(\d+)/g)];
  if (!m.length) { ok++; continue; }
  const [w, h, x, y] = m[m.length - 1].slice(1).map(Number);
  if (w >= 1250 && h >= 700) { ok++; continue; }
  if (w < 500 || h < 300) { ok++; continue; }  // detección dudosa: no tocar
  const tmp = f.replace('.mp4', '.fix.mp4');
  const q = spawnSync('ffmpeg', ['-y', '-loglevel', 'error', '-i', f, '-an', '-vf', `crop=${w}:${h}:${x}:${y},scale=1280:720:force_original_aspect_ratio=increase:flags=lanczos,crop=1280:720,format=yuv420p`, '-c:v', 'libx264', '-crf', '26', '-preset', 'veryfast', '-movflags', '+faststart', tmp]);
  if (q.status === 0) { fs.renameSync(tmp, f); fixed++; } else fail++;
}
console.log(`clips: ${clips.length} · con barras corregidas ${fixed} · sin barras ${ok} · fallos ${fail}`);
