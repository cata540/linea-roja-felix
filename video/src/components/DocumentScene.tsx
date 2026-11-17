import React from 'react';
import {AbsoluteFill, Easing, interpolate, useCurrentFrame} from 'remotion';
import {C, typewriter, head} from '../theme';

export type DocSpec = {
  head1: string; head2: string; title: string; subtitle?: string;
  label: string; quote: string; stamp: string; source: string;
};

/** Documento de archivo animado (recreación gráfica): se escribe, se resalta la frase clave, subrayado rojo y sello. */
export const DocumentScene: React.FC<{spec: DocSpec}> = ({spec}) => {
  const frame = useCurrentFrame();
  const enter = interpolate(frame, [0, 16], [0, 1], {extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic)});
  const reveal = (a: number, d = 18) => interpolate(frame, [a, a + d], [0, 100], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const hl = interpolate(frame, [52, 80], [0, 100], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const under = interpolate(frame, [82, 112], [0, 100], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.inOut(Easing.cubic)});
  const st = interpolate(frame, [114, 122], [2.6, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.in(Easing.quad)});
  const stOp = interpolate(frame, [114, 120], [0, 0.9], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const shake = frame >= 122 && frame < 130 ? Math.sin((frame - 122) * 2.2) * (130 - frame) * 0.7 : 0;
  const zoom = 1 + 0.05 * (frame / 210);
  return (
    <AbsoluteFill style={{transform: `scale(${zoom})`}}>
      <div style={{position: 'absolute', left: 560, top: 60, width: 800, height: 770, background: `linear-gradient(180deg, ${C.paper}, #d8c9a6)`, boxShadow: '0 20px 60px rgba(0,0,0,.85), inset 0 0 90px rgba(120,90,40,.35)', transform: `translate(${shake}px, ${(1 - enter) * 120}px) rotate(${-1.2 + (1 - enter) * 4}deg)`, opacity: enter, padding: '70px 70px', fontFamily: typewriter, color: '#2a2218'}}>
        <div style={{fontSize: 24, letterSpacing: 3, opacity: 0.8, clipPath: `inset(0 ${100 - reveal(8)}% 0 0)`}}>{spec.head1}</div>
        <div style={{fontSize: 24, letterSpacing: 3, opacity: 0.8, marginTop: 4, clipPath: `inset(0 ${100 - reveal(14)}% 0 0)`}}>{spec.head2}</div>
        <div style={{height: 3, background: '#2a2218', opacity: 0.6, margin: '26px 0 40px', width: `${reveal(18, 20)}%`}} />
        <div style={{fontSize: 46, lineHeight: 1.25, clipPath: `inset(0 ${100 - reveal(26, 22)}% 0 0)`}}>{spec.title}</div>
        {spec.subtitle ? <div style={{fontSize: 36, lineHeight: 1.3, marginTop: 20, clipPath: `inset(0 ${100 - reveal(40, 22)}% 0 0)`}}>{spec.subtitle}</div> : null}
        <div style={{marginTop: 50, fontSize: 30, lineHeight: 1.6, position: 'relative'}}>
          {spec.label}{' '}
          <span style={{background: `linear-gradient(90deg, rgba(242,201,76,.65) ${hl}%, rgba(242,201,76,0) ${hl}%)`, padding: '0 6px'}}>{spec.quote}</span>
          <div style={{height: 8, background: '#c1121f', borderRadius: 4, width: `${under * 0.9}%`, marginTop: 6, opacity: under > 0 ? 1 : 0}} />
        </div>
        <div style={{position: 'absolute', right: 34, top: 600, border: '6px solid #b3261e', color: '#b3261e', padding: '4px 20px', fontFamily: head, fontWeight: 700, fontSize: 48, letterSpacing: 6, transform: `rotate(8deg) scale(${st})`, opacity: stOp}}>{spec.stamp}</div>
        <div style={{position: 'absolute', left: 70, bottom: 36, fontSize: 18, opacity: 0.55}}>{spec.source}</div>
      </div>
    </AbsoluteFill>
  );
};
