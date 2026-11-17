const fs=require('fs');
let a=fs.readFileSync('src/components/Scenes.tsx','utf8');
const r=(s,x,y)=>{if(!s.includes(x))throw new Error('falta '+x.slice(0,50));return s.replace(x,y)};
a=r(a,"left={(1920 - 1244) / 2 - 11} bottom={150} /> : null}","left={(1920 - 1244) / 2 + 20} bottom={262} /> : null}");
fs.writeFileSync('src/components/Scenes.tsx',a);
let t=fs.readFileSync('tools/build_timeline.mjs','utf8');
t=r(t,"  if (nm && nm[2].test(`${im.title} ${im.description}`)) {","  const others = Object.entries(NAMES).some(([k, v]) => k !== im.tag && v[2].test(`${im.title} ${im.description}`));\n  if (nm && nm[2].test(`${im.title} ${im.description}`) && !others) {");
fs.writeFileSync('tools/build_timeline.mjs',t);
