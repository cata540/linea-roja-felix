// Render local en 20 trozos (reanudable) + unión + audio.
import fs from 'node:fs';
import path from 'node:path';
import {execSync, execFileSync} from 'node:child_process';

const ROOT = path.resolve(import.meta.dirname, '..');
process.chdir(ROOT);
const CHUNKS = 20;
const CONC = process.env.CONC || '8';
const total = JSON.parse(fs.readFileSync('data/timeline.json', 'utf8')).durationInFrames;
const size = Math.ceil(total / CHUNKS);
fs.mkdirSync('out/chunks', {recursive: true});
const t0 = Date.now();
for (let i = 0; i < CHUNKS; i++) {
  const out = `out/chunks/chunk_${String(i).padStart(2, '0')}.mp4`;
  if (fs.existsSync(out)) { console.log(`trozo ${i}: ya existe`); continue; }
  const a = i * size;
  const b = Math.min(total - 1, a + size - 1);
  const tmp = out.replace('.mp4', '.part.mp4');
  console.log(`trozo ${i}: frames ${a}-${b} (${((Date.now() - t0) / 60000).toFixed(1)} min)`);
  execSync(`npx remotion render src/index.ts Documental ${tmp} --frames=${a}-${b} --muted --codec=h264 --crf=20 --pixel-format=yuv420p --concurrency=${CONC} --log=error`, {stdio: 'inherit'});
  fs.renameSync(tmp, out);
}
const list = fs.readdirSync('out/chunks').filter((f) => /^chunk_\d+\.mp4$/.test(f)).sort().map((f) => `file '${path.resolve('out/chunks', f).replace(/\\/g, '/')}'`);
fs.writeFileSync('out/chunks/list.txt', list.join('\n'));
execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'concat', '-safe', '0', '-i', 'out/chunks/list.txt', '-c', 'copy', 'out/video_only.mp4']);
execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-i', 'out/video_only.mp4', '-i', 'public/audio/mezcla_final.m4a', '-map', '0:v', '-map', '1:a', '-c:v', 'copy', '-c:a', 'copy', '-movflags', '+faststart', '-shortest', 'out/Operacion_Unthinkable_1945.mp4']);
console.log('LISTO', ((Date.now() - t0) / 60000).toFixed(1), 'min');
