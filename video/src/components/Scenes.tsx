import React from 'react';
import {AbsoluteFill, Img, OffthreadVideo, interpolate, staticFile, useCurrentFrame, useVideoConfig, Easing} from 'remotion';
import {C, head, serif, typewriter} from '../theme';
import {Background} from './Atmosphere';

export type KB = {z0: number; z1: number; fx: number; fy: number; dx: number; dy: number};

const Backdrop: React.FC<{bg: string}> = ({bg}) => (
  <>
    <Img src={staticFile(bg)} style={{position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', transform: 'scale(1.06)'}} />
    <AbsoluteFill style={{background: 'radial-gradient(circle at 50% 45%, rgba(42,31,22,.20), rgba(13,10,8,.50))'}} />
  </>
);

/** Foto dentro de un marco fino dorado (geometría libre) con Ken Burns suave. */
const FramedPhoto: React.FC<{src: string; kb: KB; p: number; w: number; h: number; left: number; top: number; rot?: number}> = ({src, kb, p, w, h, left, top, rot = 0}) => {
  const z = kb.z0 + (kb.z1 - kb.z0) * p;
  return (
    <div style={{position: 'absolute', left, top, width: w, height: h, padding: 9, border: `2px solid ${C.frame}`, boxShadow: '0 12px 44px rgba(0,0,0,.85)', background: '#090705', boxSizing: 'content-box', transform: `rotate(${rot}deg)`}}>
      <div style={{width: '100%', height: '100%', border: `1px solid ${C.frameDim}`, overflow: 'hidden', boxSizing: 'border-box', position: 'relative'}}>
        <Img
          src={staticFile(src)}
          style={{width: '100%', height: '100%', objectFit: 'cover', objectPosition: `${kb.fx * 100}% ${kb.fy * 100}%`, transformOrigin: `${kb.fx * 100}% ${kb.fy * 100}%`, transform: `translate(${kb.dx * p}px, ${kb.dy * p}px) scale(${z})`}}
        />
      </div>
    </div>
  );
};

export type Layout = 'center' | 'full' | 'tiltL' | 'tiltR';

/**
 * Foto histórica (acabado B/N cálido horneado). Tres encuadres que se alternan:
 *  - full: pantalla completa con zoom lento
 *  - tiltL / tiltR: marco ladeado a un lado y año + fuente al otro
 *  - center: marco centrado
 */
export const PhotoShot: React.FC<{src: string; bg: string; kb: KB; layout?: Layout; caption?: {year?: string; credit?: string}; ai?: boolean}> = ({src, bg, kb, layout = 'center', caption, ai}) => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  const p = Math.min(1, frame / Math.max(1, durationInFrames - 1));
  const enter = interpolate(frame, [0, 14], [0, 1], {extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic)});

  if (layout === 'full') {
    const z = kb.z0 + (kb.z1 - kb.z0) * p;
    return (
      <AbsoluteFill style={{background: C.bg}}>
        <Img
          src={staticFile(src)}
          style={{width: '100%', height: '100%', objectFit: 'cover', objectPosition: `${kb.fx * 100}% ${kb.fy * 100}%`, transformOrigin: `${kb.fx * 100}% ${kb.fy * 100}%`, transform: `translate(${kb.dx * p}px, ${kb.dy * p}px) scale(${Math.max(1.02, z)})`}}
        />
        <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(0,0,0,.35) 0%, rgba(0,0,0,0) 20%, rgba(0,0,0,0) 52%, rgba(0,0,0,.72) 100%)'}} />
        {ai ? <div style={{position: 'absolute', right: 40, top: 40, fontFamily: head, fontSize: 22, letterSpacing: 3, color: 'rgba(255,255,255,.7)', textShadow: '0 2px 6px #000'}}>ILUSTRACIÓN · IA</div> : null}
      </AbsoluteFill>
    );
  }

  if (layout === 'tiltL' || layout === 'tiltR') {
    const photoLeft = layout === 'tiltL';
    const rot = (photoLeft ? -2.4 : 2.4) * (1 - 0.3 * enter) + (1 - enter) * (photoLeft ? -4 : 4);
    const W2 = 1040, H2 = 620;
    const px = photoLeft ? 110 : 1920 - 110 - W2 - 22;
    const tx = photoLeft ? 1230 : 110;
    const slide = (1 - enter) * (photoLeft ? -80 : 80);
    return (
      <AbsoluteFill style={{background: C.bg}}>
        <Backdrop bg={bg} />
        <FramedPhoto src={src} kb={kb} p={p} w={W2} h={H2} left={px + slide} top={215} rot={rot} />
        <div style={{position: 'absolute', left: tx, top: 330, width: 580, opacity: enter, transform: `translateX(${-slide * 0.5}px)`}}>
          {caption?.year ? <div style={{fontFamily: head, fontWeight: 700, fontSize: 170, lineHeight: 1, color: '#fff', textShadow: '0 4px 18px rgba(0,0,0,.9)'}}>{caption.year}</div> : null}
          <div style={{height: 6, width: 150, background: C.red, margin: '18px 0 20px'}} />
          {caption?.credit ? <div style={{fontFamily: serif, fontWeight: 700, fontSize: 36, lineHeight: 1.25, color: C.gold, textShadow: '0 2px 8px rgba(0,0,0,.9)'}}>{caption.credit}</div> : null}
        </div>
      </AbsoluteFill>
    );
  }

  return (
    <AbsoluteFill style={{background: C.bg}}>
      <Backdrop bg={bg} />
      <FramedPhoto src={src} kb={kb} p={p} w={1244} h={700} left={(1920 - 1244) / 2 - 11} top={150} />
    </AbsoluteFill>
  );
};

/** Clip de vídeo de archivo a PANTALLA COMPLETA (16:9, cover), con empuje de cámara muy leve y degradado inferior. */
export const VideoShot: React.FC<{src: string; startFrom?: number}> = ({src, startFrom = 0}) => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  const z = 1.0 + 0.04 * (frame / Math.max(1, durationInFrames));
  return (
    <AbsoluteFill style={{background: C.bg}}>
      <OffthreadVideo src={staticFile(src)} muted startFrom={startFrom} style={{width: '100%', height: '100%', objectFit: 'cover', transform: `scale(${z})`}} />
      <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(0,0,0,.30) 0%, rgba(0,0,0,0) 18%, rgba(0,0,0,0) 55%, rgba(0,0,0,.65) 100%)'}} />
    </AbsoluteFill>
  );
};

// ---------- telegrama / acta (subrayado rojo animado) ----------
export type TeleSpec = {head1: string; head2: string; lines: string[]; quote: string; source: string};
export const TelegramScene: React.FC<{spec: TeleSpec}> = ({spec}) => {
  const frame = useCurrentFrame();
  const slide = interpolate(frame, [0, 14], [60, 0], {extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic)});
  const op = interpolate(frame, [0, 10], [0, 1], {extrapolateRight: 'clamp'});
  const under = interpolate(frame, [90, 130], [0, 100], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.inOut(Easing.cubic)});
  const reveal = (a: number) => interpolate(frame, [a, a + 22], [0, 100], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <AbsoluteFill>
      <Background />
      <div style={{position: 'absolute', left: 300, top: 150, width: 1320, height: 700, background: 'linear-gradient(180deg,#eadfc2,#d9ccaa)', boxShadow: '0 20px 60px rgba(0,0,0,.85), inset 0 0 90px rgba(120,90,40,.35)', transform: `translateY(${slide}px) rotate(.6deg)`, opacity: op, padding: '56px 80px', fontFamily: typewriter, color: '#2a2218'}}>
        <div style={{fontSize: 30, letterSpacing: 4, opacity: 0.8, clipPath: `inset(0 ${100 - reveal(10)}% 0 0)`}}>{spec.head1}</div>
        <div style={{fontSize: 30, letterSpacing: 3, opacity: 0.8, marginTop: 6, clipPath: `inset(0 ${100 - reveal(20)}% 0 0)`}}>{spec.head2}</div>
        <div style={{height: 3, background: '#2a2218', opacity: 0.6, margin: '22px 0 40px'}} />
        {spec.lines.map((l, i) => (
          <div key={i} style={{fontSize: 36, lineHeight: 1.45, clipPath: `inset(0 ${100 - reveal(32 + i * 14)}% 0 0)`}}>{l}</div>
        ))}
        <div style={{position: 'relative', marginTop: 34, display: 'inline-block'}}>
          <div style={{fontSize: 50, lineHeight: 1.3, background: 'rgba(242,201,76,.55)', padding: '0 10px', clipPath: `inset(0 ${100 - reveal(60 + spec.lines.length * 14)}% 0 0)`}}>{spec.quote}</div>
          <div style={{position: 'absolute', left: 0, bottom: -10, height: 8, width: `${under}%`, background: '#c1121f', borderRadius: 4}} />
        </div>
        <div style={{position: 'absolute', left: 80, bottom: 30, fontSize: 18, opacity: 0.55}}>{spec.source}</div>
      </div>
    </AbsoluteFill>
  );
};

// ---------- línea de tiempo genérica ----------
export type TLEvent = {y: number; label: string; sub: string};
export const TimelineScene: React.FC<{title: string; kicker: string; y0: number; y1: number; years: number[]; events: TLEvent[]}> = ({title, kicker, y0, y1, years, events}) => {
  const frame = useCurrentFrame();
  const x0 = 170, x1 = 1750;
  const X = (y: number) => x0 + ((y - y0) / (y1 - y0)) * (x1 - x0);
  const draw = interpolate(frame, [0, 60], [0, 1], {extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic)});
  return (
    <AbsoluteFill>
      <Background />
      <div style={{position: 'absolute', left: 150, top: 120, fontFamily: head, fontWeight: 700, fontSize: 84, color: '#fff', textTransform: 'uppercase'}}>{title}</div>
      <div style={{position: 'absolute', left: 150, top: 220, fontFamily: head, fontWeight: 600, fontSize: 34, color: '#ff6b4a', letterSpacing: 3}}>{kicker}</div>
      <svg width={1920} height={1080} style={{position: 'absolute', inset: 0}}>
        <line x1={x0} y1={560} x2={x0 + (x1 - x0) * draw} y2={560} stroke="#d62828" strokeWidth={8} />
        {years.map((y) => (
          <g key={y} opacity={draw > (y - y0) / (y1 - y0) ? 1 : 0}>
            <line x1={X(y)} y1={545} x2={X(y)} y2={575} stroke="#e9dcc3" strokeWidth={3} />
            <text x={X(y)} y={620} textAnchor="middle" fill="#e9dcc3" fontFamily={head} fontSize={34} fontWeight={600}>{y}</text>
          </g>
        ))}
        {events.map((e, i) => {
          const t0 = 40 + i * 22;
          const o = interpolate(frame, [t0, t0 + 14], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
          const up = i % 2 === 0;
          const cy = up ? 440 : 690;
          return (
            <g key={e.label} opacity={o} transform={`translate(0, ${(1 - o) * (up ? 20 : -20)})`}>
              <line x1={X(e.y)} y1={560} x2={X(e.y)} y2={up ? cy + 40 : cy - 60} stroke="#ffd166" strokeWidth={3} />
              <circle cx={X(e.y)} cy={560} r={13} fill="#d62828" stroke="#fff" strokeWidth={3} />
              <text x={X(e.y)} y={cy} textAnchor="middle" fill="#ffd166" fontFamily={head} fontSize={32} fontWeight={700}>{e.label}</text>
              <text x={X(e.y)} y={cy + 40} textAnchor="middle" fill="#fff" fontFamily={serif} fontSize={30} fontWeight={700}>{e.sub}</text>
            </g>
          );
        })}
      </svg>
    </AbsoluteFill>
  );
};

// ---------- lista animada con marcas rojas ----------
export const ListScene: React.FC<{title: string; kicker: string; items: string[]}> = ({title, kicker, items}) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill>
      <Background />
      <div style={{position: 'absolute', left: 150, top: 110, fontFamily: head, fontWeight: 700, fontSize: 84, color: '#fff', textTransform: 'uppercase', lineHeight: 1}}>{title}</div>
      <div style={{position: 'absolute', left: 150, top: 215, fontFamily: head, fontWeight: 600, fontSize: 34, color: '#ff6b4a', letterSpacing: 3, textTransform: 'uppercase'}}>{kicker}</div>
      <div style={{position: 'absolute', left: 150, top: 330}}>
        {items.map((it, i) => {
          const t0 = 24 + i * 26;
          const o = interpolate(frame, [t0, t0 + 14], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
          const w = interpolate(frame, [t0 + 8, t0 + 30], [0, 100], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic)});
          return (
            <div key={i} style={{display: 'flex', alignItems: 'center', gap: 26, margin: '16px 0', opacity: o, transform: `translateX(${(1 - o) * -40}px)`}}>
              <div style={{width: 18, height: 18, background: '#d62828', transform: 'rotate(45deg)'}} />
              <div style={{position: 'relative'}}>
                <div style={{fontFamily: serif, fontWeight: 700, fontSize: 48, color: C.gold}}>{it}</div>
                <div style={{position: 'absolute', left: 0, bottom: -4, height: 5, width: `${w}%`, background: '#d62828'}} />
              </div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

export const TitleScene: React.FC<{title: string}> = ({title}) => {
  const frame = useCurrentFrame();
  const o = interpolate(frame, [0, 24], [0, 1], {extrapolateRight: 'clamp'});
  const lineW = interpolate(frame, [10, 50], [0, 620], {extrapolateRight: 'clamp', extrapolateLeft: 'clamp'});
  return (
    <AbsoluteFill>
      <Background />
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', opacity: o}}>
        <div style={{fontFamily: head, fontWeight: 700, fontSize: 150, letterSpacing: 18, color: '#fff'}}>LÍNEA ROJA</div>
        <div style={{height: 6, width: lineW, background: C.red, margin: '14px 0 30px'}} />
        <div style={{fontFamily: serif, fontWeight: 700, fontSize: 52, color: C.gold, textAlign: 'center', maxWidth: 1400, lineHeight: 1.2}}>{title}</div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

export type QuoteSpec = {variant: 'quote' | 'stat'; kicker: string; text: string; by?: string; big?: string};
export const QuoteScene: React.FC<{spec: QuoteSpec}> = ({spec}) => {
  const frame = useCurrentFrame();
  const o = interpolate(frame, [4, 24], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const o2 = interpolate(frame, [30, 52], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const w = interpolate(frame, [18, 60], [0, 100], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic)});
  const stat = spec.variant === 'stat';
  return (
    <AbsoluteFill>
      <Background />
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', padding: '0 200'}}>
        <div style={{opacity: o, fontFamily: head, fontWeight: 600, fontSize: 38, letterSpacing: 8, color: '#ff6b4a', textTransform: 'uppercase', marginBottom: 30, textAlign: 'center'}}>{spec.kicker}</div>
        {stat ? <div style={{opacity: o, transform: `scale(${0.94 + 0.06 * o})`, fontFamily: head, fontWeight: 700, fontSize: 250, lineHeight: 1, color: '#fff', textShadow: '0 6px 30px rgba(0,0,0,.9)', textAlign: 'center'}}>{spec.big}</div> : null}
        <div style={{position: 'relative', opacity: stat ? o2 : o, fontFamily: serif, fontWeight: 700, fontSize: stat ? 54 : 70, lineHeight: 1.22, color: C.gold, textAlign: 'center', maxWidth: 1500, marginTop: stat ? 20 : 0, textShadow: '0 3px 12px rgba(0,0,0,.9)'}}>
          {stat ? spec.text : '«' + spec.text + '»'}
        </div>
        <div style={{height: 6, width: `${w * 0.12}%`, minWidth: 0, background: '#d62828', marginTop: 36}} />
        {spec.by ? <div style={{opacity: o2, marginTop: 26, fontFamily: head, fontWeight: 600, fontSize: 36, letterSpacing: 3, color: '#e9dcc3', textAlign: 'center'}}>{spec.by}</div> : null}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

export const OutroScene: React.FC<{src?: string; bg?: string}> = ({src, bg}) => {
  const frame = useCurrentFrame();
  const o = interpolate(frame, [0, 30], [0, 1], {extrapolateRight: 'clamp'});
  const o2 = interpolate(frame, [40, 70], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <AbsoluteFill style={{background: C.bg}}>
      {bg ? <Img src={staticFile(bg)} style={{position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.8}} /> : <Background />}
      {src ? <Img src={staticFile(src)} style={{position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.3}} /> : null}
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center'}}>
        <div style={{opacity: o, fontFamily: head, fontWeight: 700, fontSize: 170, letterSpacing: 18, color: '#fff', textShadow: '0 4px 20px #000'}}>LÍNEA ROJA</div>
        <div style={{opacity: o, height: 8, width: 520, background: '#d62828', margin: '22px 0 34px'}} />
        <div style={{opacity: o2, fontFamily: serif, fontWeight: 700, fontSize: 64, color: C.gold, textAlign: 'center', maxWidth: 1400, lineHeight: 1.2}}>Suscríbete para no perderte el próximo vídeo</div>
        <div style={{opacity: o2, marginTop: 40, fontFamily: head, fontWeight: 600, fontSize: 40, letterSpacing: 6, color: '#e9dcc3'}}>Historia y geopolítica, con documentos y mapas</div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
