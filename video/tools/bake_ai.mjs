// Ilustraciones IA: quita las bandas negras, reescala (≤1920 px) y apaga un poco la saturación (conserva el tono sepia).
import fs from 'node:fs';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
const ROOT = path.resolve(import.meta.dirname, '..');
const ai = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'ai.json'), 'utf8'));
fs.mkdirSync(path.join(ROOT, 'public', 'ai_b'), {recursive: true});
for (const a of ai) {
  const src = path.join(ROOT, 'public', a.file);
  const dst = path.join(ROOT, 'public', a.file.replace(/^ai\//, 'ai_b/'));
  const r = spawnSync('ffmpeg', ['-hide_banner', '-nostats', '-i', src, '-vf', 'cropdetect=limit=40:round=2:reset=0', '-frames:v', '1', '-f', 'null', '-'], {encoding: 'utf8'});
  const m = [...(r.stderr || '').matchAll(/crop=(\d+):(\d+):(\d+):(\d+)/g)].pop();
  const crop = m ? `crop=${m[1]}:${m[2]}:${m[3]}:${m[4]},` : '';
  const q = spawnSync('ffmpeg', ['-y', '-loglevel', 'error', '-i', src, '-vf', `${crop}scale='min(1920,iw)':-2:flags=lanczos,eq=saturation=0.72:contrast=1.06:brightness=-0.04`, '-q:v', '3', '-frames:v', '1', dst]);
  console.log(a.id, m ? `recorte ${m[1]}x${m[2]}` : 'sin bandas', q.status === 0 ? 'ok' : 'FALLO');
}
