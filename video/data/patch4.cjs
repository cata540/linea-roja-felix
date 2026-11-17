const fs=require('fs');
let t=fs.readFileSync('tools/build_timeline.mjs','utf8');
const r=(s,x,y)=>{if(!s.includes(x))throw new Error('falta '+x.slice(0,50));return s.replace(x,y)};
t=r(t,"  const entTag = (tt) => { const q = sentAt(tt); if (!q) return null; for (const [re, tg] of ENT) if (re.test(q.text)) return tg; return null; };",
"  const entTag = (tt) => { const qs = sentences.filter((q) => q.chapter === n && q.end > tt && q.start < tt + 4.2); for (const q of qs) for (const [re, tg] of ENT) if (re.test(q.text)) return tg; return null; };");
fs.writeFileSync('tools/build_timeline.mjs',t);
let a=fs.readFileSync('src/components/Scenes.tsx','utf8');
a=r(a,"          <div style={{height: 6, width: 150, background: C.red, margin: '18px 0 20px'}} />","          {caption?.year || caption?.name ? <div style={{height: 6, width: 150, background: C.red, margin: '18px 0 20px'}} /> : null}");
fs.writeFileSync('src/components/Scenes.tsx',a);
