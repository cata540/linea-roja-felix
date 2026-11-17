// Corta los vídeos de archivo en clips de 3-6 s por cambio de plano, con el acabado B/N cálido ya incorporado (render más ligero).
import fs from 'node:fs';
import path from 'node:path';
import {execFileSync, spawnSync} from 'node:child_process';

const ROOT = path.resolve(import.meta.dirname, '..');
const SRC = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'videos_src.json'), 'utf8'));
const OUTDIR = path.join(ROOT, 'public', 'clips');
const BGDIR = path.join(ROOT, 'public', 'bg');
fs.mkdirSync(OUTDIR, {recursive: true});
fs.mkdirSync(BGDIR, {recursive: true});

// máx. clips por fuente y zona útil [%] (evita rótulos del principio y créditos del final)
const CFG = {
  wwf_divide: {max: 80, from: 0.05, to: 0.95, tag: 'f1940'},
  wwf_britain: {max: 60, from: 0.05, to: 0.95, tag: 'guerra1940'},
  wwf_divide_b: {max: 110, from: 0.05, to: 0.95, tag: 'f1940', base: 'wwf_divide'},
  wwf_britain_b: {max: 90, from: 0.05, to: 0.95, tag: 'guerra1940', base: 'wwf_britain'},
  spain_in_revolt: {max: 70, from: 0.02, to: 0.98, tag: 'guerracivil'},
  spain_revolt_r3: {max: 70, from: 0.02, to: 0.98, tag: 'guerracivil'},
  npc16555: {max: 12, from: 0.0, to: 1.0, tag: 'rn'},
};
const VF = 'scale=1280:-2:flags=lanczos,crop=1280:720:0:\'(ih-720)*0.3\',fps=30,format=gray,eq=contrast=1.12:brightness=-0.04,format=rgb24,lutrgb=r=\'val*1.05\':b=\'val*0.88\',format=yuv420p';
const ONLY = process.env.ONLY;
const registry = ONLY && fs.existsSync(path.join(ROOT, 'data', 'clips.json')) ? JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'clips.json'), 'utf8')).filter((c) => c.src !== ONLY) : [];
const regPath = path.join(ROOT, 'data', 'clips.json');

for (const [id, meta] of Object.entries(SRC)) {
  const cfg = CFG[id];
  if (!cfg || (ONLY && ONLY !== id)) continue;
  const prior = cfg.base ? JSON.parse(fs.readFileSync(regPath, 'utf8')).filter((c) => c.src === cfg.base).map((c) => [c.t0 - 0.5, c.t0 + c.dur + 0.5]) : [];
  const dur = parseFloat(execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', meta.file]).toString());
  // detección de cambios de plano a baja resolución
  const r = spawnSync('ffmpeg', ['-hide_banner', '-nostats', '-i', meta.file, '-an', '-vf', "scale=320:-2,select='gt(scene,0.32)',showinfo", '-f', 'null', '-'], {encoding: 'utf8', maxBuffer: 1 << 28});
  const cuts = [...(r.stderr || '').matchAll(/pts_time:([\d.]+)/g)].map((m) => parseFloat(m[1]));
  const b = [0, ...cuts.filter((x) => x > 0.5 && x < dur - 0.5), dur];
  const cand = [];
  for (let i = 0; i < b.length - 1; i++) {
    const a = b[i], z = b[i + 1], len = z - a;
    if (a < dur * cfg.from || z > dur * cfg.to) continue;
    if (len < 2.8) continue;
    if (prior.some(([p0, p1]) => a < p1 && z > p0)) continue;
    cand.push([a + 0.12, Math.min(a + 0.12 + 5.6, z - 0.1)]);
    if (len > 13) cand.push([a + len / 2, Math.min(a + len / 2 + 5, z - 0.1)]);
  }
  // reparto uniforme a lo largo del vídeo
  const picked = [];
  if (cand.length <= cfg.max) picked.push(...cand);
  else for (let k = 0; k < cfg.max; k++) picked.push(cand[Math.floor((k + 0.5) * (cand.length / cfg.max))]);
  console.log(`${id}: ${dur.toFixed(0)} s · ${cuts.length} cambios · ${cand.length} candidatos · ${picked.length} clips`);
  picked.forEach(([a, z], k) => {
    const cid = `${id}_${String(k).padStart(2, '0')}`;
    const out = path.join(OUTDIR, cid + '.mp4');
    if (!fs.existsSync(out)) {
      const rr = spawnSync('ffmpeg', ['-y', '-loglevel', 'error', '-ss', String(a), '-i', meta.file, '-t', String(Math.max(2.5, z - a)), '-an', '-vf', VF, '-c:v', 'libx264', '-crf', '28', '-preset', 'veryfast', '-movflags', '+faststart', out]);
      if (rr.status !== 0) { console.log('fallo', cid); return; }
    }
    // fondo desenfocado (primer fotograma, muy pequeño y oscuro)
    const bg = path.join(BGDIR, cid + '.jpg');
    if (!fs.existsSync(bg)) spawnSync('ffmpeg', ['-y', '-loglevel', 'error', '-i', out, '-frames:v', '1', '-vf', 'scale=240:-2,gblur=sigma=4,eq=brightness=-0.30:saturation=0,format=yuvj420p', '-q:v', '3', bg]);
    const d = parseFloat(execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', out]).toString());
    registry.push({id: cid, src: id, tag: cfg.tag, file: `clips/${cid}.mp4`, bg: `bg/${cid}.jpg`, dur: d, t0: +a.toFixed(2)});
  });
  fs.writeFileSync(regPath, JSON.stringify(registry, null, 1));
}
console.log('TOTAL clips', registry.length);
