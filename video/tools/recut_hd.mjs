// Re-corta todos los clips válidos desde las fuentes de mayor resolución (640x480 / 720p), a 1920x1080, más claros y nítidos.
import fs from 'node:fs';
import path from 'node:path';
import {spawn, spawnSync} from 'node:child_process';
const ROOT = path.resolve(import.meta.dirname, '..');
const HD = path.join(ROOT, 'media', 'src', 'hd'), SRC = path.join(ROOT, 'media', 'src');
const MAP = {wwf_divide: path.join(SRC, 'wwf_divide.mp4'), wwf_divide_b: path.join(SRC, 'wwf_divide.mp4'), wwf_britain: path.join(HD, 'britain_400.ogv'), wwf_britain_b: path.join(HD, 'britain_400.ogv'), spain_in_revolt: path.join(HD, 'spain_in_revolt_640.mp4'), spain_revolt_r3: path.join(HD, 'revolt_r3_640.mp4'), npc16555: path.join(HD, 'npc_720.mov')};
const VF = "scale=1920:-2:flags=lanczos,crop=1920:1080:0:'(ih-1080)*0.3',fps=30,unsharp=5:5:0.9:5:5:0.0,format=gray,eq=contrast=1.10:brightness=0.03:gamma=1.10,format=rgb24,lutrgb=r='val*1.06':b='val*0.88',format=yuv420p";
const clips = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'clips.json'), 'utf8'));
const block = new Set(JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'clip_block.json'), 'utf8')));
const todo = clips.filter((c) => !block.has(c.id));
const OUT = path.join(ROOT, 'public', 'clips');
let i = 0, done = 0;
const stats = {};
async function worker() {
  while (i < todo.length) {
    const c = todo[i++];
    const out = path.join(OUT, c.id + '.mp4');
    await new Promise((res) => {
      const p = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-ss', String(c.t0), '-i', MAP[c.src], '-t', String(c.dur), '-an', '-vf', VF, '-c:v', 'libx264', '-crf', '25', '-preset', 'veryfast', '-movflags', '+faststart', out]);
      p.on('close', res);
    });
    const r = spawnSync('ffmpeg', ['-hide_banner', '-nostats', '-ss', String(Math.min(1.2, c.dur / 2)), '-i', out, '-frames:v', '1', '-vf', 'signalstats,metadata=print:key=lavfi.signalstats.YAVG', '-f', 'null', '-'], {encoding: 'utf8'});
    stats[c.id] = parseFloat(((r.stderr || '').match(/YAVG=([\d.]+)/) || [])[1] || 0);
    if (++done % 40 === 0) console.log(done, '/', todo.length);
  }
}
await Promise.all([worker(), worker(), worker(), worker()]);
fs.writeFileSync(path.join(ROOT, 'data', 'clip_luma.json'), JSON.stringify(stats));
console.log('FIN', done);
