const fs=require('fs');
let s=fs.readFileSync('src/components/Scenes.tsx','utf8');
const rep=(a,b)=>{if(!s.includes(a))throw new Error('falta: '+a.slice(0,70));s=s.replace(a,b)};
rep("export type Layout = 'center' | 'full' | 'tiltL' | 'tiltR';",
`export type Layout = 'center' | 'full' | 'tiltL' | 'tiltR' | 'split' | 'lower';
export type Caption = {year?: string; name?: string; role?: string};

const AiBadge: React.FC = () => (
  <div style={{position: 'absolute', right: 36, top: 34, fontFamily: head, fontSize: 20, letterSpacing: 3, color: 'rgba(255,255,255,.62)', textShadow: '0 2px 6px #000'}}>ILUSTRACIÓN · IA</div>
);

/** Rótulo de nombre y cargo (tercio inferior), que entra deslizándose. */
const NameTag: React.FC<{name: string; role?: string; left?: number; bottom?: number}> = ({name, role, left = 90, bottom = 190}) => {
  const frame = useCurrentFrame();
  const o = interpolate(frame, [8, 22], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic)});
  return (
    <div style={{position: 'absolute', left, bottom, opacity: o, transform: \`translateX(\${(1 - o) * -60}px)\`}}>
      <div style={{display: 'flex', alignItems: 'stretch'}}>
        <div style={{width: 10, background: '#d62828'}} />
        <div style={{background: 'rgba(10,8,6,.82)', padding: '12px 26px 14px'}}>
          <div style={{fontFamily: head, fontWeight: 700, fontSize: 52, letterSpacing: 2, color: '#fff', textTransform: 'uppercase', lineHeight: 1.05}}>{name}</div>
          {role ? <div style={{fontFamily: serif, fontWeight: 700, fontSize: 30, color: C.gold, marginTop: 4}}>{role}</div> : null}
        </div>
      </div>
    </div>
  );
};`);
rep("caption?: {year?: string; credit?: string}; ai?: boolean}> = ({src, bg, kb, layout = 'center', caption, ai}) => {","caption?: Caption; ai?: boolean}> = ({src, bg, kb, layout = 'center', caption, ai}) => {");
// full
rep("        {ai ? <div style={{position: 'absolute', right: 40, top: 40, fontFamily: head, fontSize: 22, letterSpacing: 3, color: 'rgba(255,255,255,.7)', textShadow: '0 2px 6px #000'}}>ILUSTRACIÓN · IA</div> : null}\n      </AbsoluteFill>",
"        {ai ? <AiBadge /> : null}\n        {caption?.name ? <NameTag name={caption.name} role={caption.role} /> : null}\n      </AbsoluteFill>");
// split / lower before tilt
rep("  if (layout === 'tiltL' || layout === 'tiltR') {",
`  if (layout === 'lower') {
    const z = kb.z0 + (kb.z1 - kb.z0) * p;
    return (
      <AbsoluteFill style={{background: C.bg}}>
        <Img src={staticFile(src)} style={{width: '100%', height: '100%', objectFit: 'cover', objectPosition: \`\${kb.fx * 100}% \${kb.fy * 100}%\`, transformOrigin: \`\${kb.fx * 100}% \${kb.fy * 100}%\`, transform: \`translate(\${kb.dx * p}px, \${kb.dy * p}px) scale(\${Math.max(1.02, z)})\`}} />
        <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(0,0,0,.25) 0%, rgba(0,0,0,0) 22%, rgba(0,0,0,0) 50%, rgba(0,0,0,.78) 100%)'}} />
        {ai ? <AiBadge /> : null}
        {caption?.name ? <NameTag name={caption.name} role={caption.role} left={110} bottom={200} /> : null}
      </AbsoluteFill>
    );
  }

  if (layout === 'split') {
    const z = kb.z0 + (kb.z1 - kb.z0) * p;
    const slide = (1 - enter) * -70;
    return (
      <AbsoluteFill style={{background: C.bg}}>
        <Background />
        <div style={{position: 'absolute', left: 0, top: 0, width: 1160, height: 1080, overflow: 'hidden', transform: \`translateX(\${slide}px)\`}}>
          <Img src={staticFile(src)} style={{width: '100%', height: '100%', objectFit: 'cover', objectPosition: \`\${kb.fx * 100}% \${kb.fy * 100}%\`, transformOrigin: \`\${kb.fx * 100}% \${kb.fy * 100}%\`, transform: \`translate(\${kb.dx * p}px, \${kb.dy * p}px) scale(\${Math.max(1.03, z)})\`}} />
          <AbsoluteFill style={{background: 'linear-gradient(90deg, rgba(0,0,0,0) 70%, rgba(13,10,8,.9) 100%)'}} />
        </div>
        <div style={{position: 'absolute', left: 1160, top: 0, width: 6, height: 1080, background: '#d62828', opacity: enter}} />
        <div style={{position: 'absolute', left: 1230, top: 300, width: 600, opacity: enter}}>
          {caption?.year ? <div style={{fontFamily: head, fontWeight: 700, fontSize: 150, lineHeight: 1, color: '#fff', textShadow: '0 4px 18px rgba(0,0,0,.9)'}}>{caption.year}</div> : null}
          {caption?.year ? <div style={{height: 6, width: 150, background: C.red, margin: '18px 0 22px'}} /> : null}
          {caption?.name ? <div style={{fontFamily: head, fontWeight: 700, fontSize: 64, lineHeight: 1.05, color: '#fff', textTransform: 'uppercase'}}>{caption.name}</div> : null}
          {caption?.role ? <div style={{fontFamily: serif, fontWeight: 700, fontSize: 38, lineHeight: 1.25, color: C.gold, marginTop: 10}}>{caption.role}</div> : null}
        </div>
        {ai ? <AiBadge /> : null}
      </AbsoluteFill>
    );
  }

  if (layout === 'tiltL' || layout === 'tiltR') {`);
// tilt text: credit -> name/role
rep("          {caption?.credit ? <div style={{fontFamily: serif, fontWeight: 700, fontSize: 36, lineHeight: 1.25, color: C.gold, textShadow: '0 2px 8px rgba(0,0,0,.9)'}}>{caption.credit}</div> : null}\n        </div>\n      </AbsoluteFill>",
"          {caption?.name ? <div style={{fontFamily: head, fontWeight: 700, fontSize: 50, lineHeight: 1.05, color: '#fff', textTransform: 'uppercase', textShadow: '0 2px 8px rgba(0,0,0,.9)'}}>{caption.name}</div> : null}\n          {caption?.role ? <div style={{fontFamily: serif, fontWeight: 700, fontSize: 34, lineHeight: 1.25, color: C.gold, marginTop: 8, textShadow: '0 2px 8px rgba(0,0,0,.9)'}}>{caption.role}</div> : null}\n        </div>\n        {ai ? <AiBadge /> : null}\n      </AbsoluteFill>");
// center
rep("      <FramedPhoto src={src} kb={kb} p={p} w={1244} h={700} left={(1920 - 1244) / 2 - 11} top={150} />\n    </AbsoluteFill>",
"      <FramedPhoto src={src} kb={kb} p={p} w={1244} h={700} left={(1920 - 1244) / 2 - 11} top={150} />\n      {ai ? <AiBadge /> : null}\n      {caption?.name ? <NameTag name={caption.name} role={caption.role} left={(1920 - 1244) / 2 - 11} bottom={150} /> : null}\n    </AbsoluteFill>");
fs.writeFileSync('src/components/Scenes.tsx',s);

let d=fs.readFileSync('src/Documental.tsx','utf8');
const r2=(a,b)=>{if(!d.includes(a))throw new Error('falta: '+a.slice(0,60));d=d.replace(a,b)};
r2("export const Documental: React.FC = () => (","const Punch: React.FC<{children: React.ReactNode; flash?: boolean}> = ({children, flash}) => {\n  const frame = useCurrentFrame();\n  const sc = interpolate(frame, [0, 9], [1.045, 1], {extrapolateRight: 'clamp'});\n  const fl = flash ? interpolate(frame, [0, 5], [0.45, 0], {extrapolateRight: 'clamp'}) : 0;\n  return (\n    <AbsoluteFill style={{transform: `scale(${sc})`}}>\n      {children}\n      {flash ? <AbsoluteFill style={{background: '#fff', opacity: fl}} /> : null}\n    </AbsoluteFill>\n  );\n};\n\nexport const Documental: React.FC = () => (");
r2("        <AbsoluteFill>{renderShot(s)}</AbsoluteFill>","        {s.kind === 'photo' || s.kind === 'video' ? <Punch flash={i % 7 === 3}>{renderShot(s)}</Punch> : <AbsoluteFill>{renderShot(s)}</AbsoluteFill>}");
fs.writeFileSync('src/Documental.tsx',d);
console.log('ok');
