const fs=require('fs');
let t=fs.readFileSync('tools/build_timeline.mjs','utf8');
const r=(x,y)=>{if(!t.includes(x))throw new Error('falta '+x.slice(0,50));t=t.replace(x,y)};
r("  let pat = 0;\n","  let pat = 0;\n  let photoRun = 0;\n");
r("const wantVideo = !hasEnt && (forceV || [1, 3].includes(pat % 5));","const wantVideo = photoRun >= 2 || (!hasEnt && (forceV || [1, 3].includes(pat % 5)));");
r("      if (unit.photo) {\n        const u = usage.get(unit.photo.file) || 0;","      photoRun = unit.photo ? photoRun + 1 : 0;\n      if (unit.photo) {\n        const u = usage.get(unit.photo.file) || 0;");
fs.writeFileSync('tools/build_timeline.mjs',t);
