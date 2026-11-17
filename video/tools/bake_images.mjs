// Pre-escala (máx. 1920 px) y hornea el acabado B/N cálido: public/img/... -> public/img_b/...
import fs from 'node:fs';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
const ROOT = path.resolve(import.meta.dirname, '..');
const images = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'images.json'), 'utf8'));
const extra = ['img/churchill_yalta_crop.jpg', 'img/stalin_yalta_crop.jpg', 'img/torgau_elbe_1945.jpg'];
const files = [...new Set([...images.map((i) => i.file), ...extra])];
let n = 0, skip = 0, fail = 0;
for (const f of files) {
  const src = path.join(ROOT, 'public', f);
  const dst = path.join(ROOT, 'public', f.replace(/^img\//, 'img_b/'));
  if (!fs.existsSync(src)) { fail++; continue; }
  if (fs.existsSync(dst)) { skip++; continue; }
  fs.mkdirSync(path.dirname(dst), {recursive: true});
  const r = spawnSync('ffmpeg', ['-y', '-loglevel', 'error', '-i', src, '-vf', "scale='min(1920,iw)':-2,format=gray,eq=contrast=1.12:brightness=-0.04,format=rgb24,lutrgb=r='val*1.05':b='val*0.88'", '-q:v', '3', '-frames:v', '1', dst]);
  if (r.status === 0) n++; else fail++;
}
const sz = (d) => { let t = 0; const w = (p) => { for (const e of fs.readdirSync(p, {withFileTypes: true})) e.isDirectory() ? w(path.join(p, e.name)) : (t += fs.statSync(path.join(p, e.name)).size); }; w(d); return (t / 1e6).toFixed(0); };
console.log(`horneadas ${n} · ya estaban ${skip} · fallos ${fail} · img_b ${sz(path.join(ROOT, 'public', 'img_b'))} MB (originales ${sz(path.join(ROOT, 'public', 'img'))} MB)`);
