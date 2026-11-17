import React, {useMemo} from 'react';
import {AbsoluteFill, Easing, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {geoMercator, geoPath} from 'd3-geo';
import type {GeoPermissibleObjects} from 'd3-geo';
import countries from '../../public/data/ne_50m_admin_0_countries.json';
import {C, head, W, H} from '../theme';

export type MapVariant = 'iberia' | 'mediterraneo' | 'gibraltar' | 'suministro' | 'exigencias' | 'atlantico' | 'estesur';
type Pt = [number, number];
type Arrow = {pts: Pt[]; color?: string; date?: string; dashed?: boolean; noHead?: boolean; label?: string};
type Mk = {at: Pt; text: string; dx?: number; dy?: number; dot?: boolean};
type Cfg = {box: [number, number, number, number]; fills: Record<string, string>; arrows: Arrow[]; marks: Mk[]; headline: string; sub?: string};

const RED = '#e63946';
const BLUE = '#6fb1d8';
const GOLD = '#ffd166';
const FILL_SPAIN = '#b4601f';
const FILL_GER = '#7a2323';
const FILL_FRA = '#5b3b2b';
const FILL_UK = '#33506b';
const FILL_DEM = '#d9531a';

export const MAP_CFG: Record<MapVariant, Cfg> = {
  iberia: {
    box: [-12.5, 31.6, 8.5, 46.4],
    fills: {Spain: FILL_SPAIN, France: FILL_FRA, Germany: FILL_GER, Portugal: '#4a4036'},
    arrows: [
      {pts: [[-1.78, 43.37], [-3.7, 42.35], [-3.7, 40.42], [-4.78, 37.89], [-5.4, 36.2]], color: RED, date: '10 ENE 1941'},
      {pts: [[-0.58, 44.84], [-3.0, 40.0], [-5.3, 36.25]], color: '#ff9e45', dashed: true, label: 'ATAQUE AÉREO'},
    ],
    marks: [
      {at: [-1.78, 43.37], text: 'HENDAYA', dx: 36, dy: -10, dot: true},
      {at: [-3.7, 40.42], text: 'MADRID', dx: -66, dy: 8, dot: true},
      {at: [-5.35, 36.14], text: 'GIBRALTAR', dx: 92, dy: 40, dot: true},
    ],
    headline: 'Operación Félix', sub: 'La ruta prevista · 10 de enero de 1941',
  },
  mediterraneo: {
    box: [-18, 28, 17, 46],
    fills: {Spain: FILL_SPAIN, France: FILL_FRA, 'United Kingdom': FILL_UK, Italy: '#6d4a2a', Morocco: '#4a4036', Algeria: '#4a4036'},
    arrows: [
      {pts: [[-5.35, 36.1], [-1, 36.9], [4, 38], [10, 37.4], [14.4, 35.6]], color: BLUE, label: 'RUTA BRITÁNICA A SUEZ'},
      {pts: [[-5.3, 36.35], [-5.3, 35.85]], color: RED, noHead: true, label: 'CERRAR EL ESTRECHO'},
    ],
    marks: [{at: [-5.35, 36.14], text: 'GIBRALTAR', dx: -30, dy: 52, dot: true}, {at: [14.5, 35.9], text: 'MALTA', dx: 10, dy: 40, dot: true}, {at: [-15.4, 28.1], text: 'CANARIAS', dx: 0, dy: 38, dot: true}],
    headline: 'La puerta del Mediterráneo', sub: 'Quien cierra el Estrecho cierra el Mediterráneo',
  },
  gibraltar: {
    box: [-6.6, 35.45, -4.4, 36.75],
    fills: {Spain: FILL_SPAIN, Morocco: '#4a4036'},
    arrows: [
      {pts: [[-5.45, 36.72], [-5.37, 36.4], [-5.35, 36.16]], color: RED, date: 'ASALTO'},
      {pts: [[-5.0, 36.7], [-5.3, 36.3]], color: '#ff9e45', dashed: true, label: 'AVIACIÓN'},
    ],
    marks: [
      {at: [-5.35, 36.14], text: 'PEÑÓN DE GIBRALTAR', dx: 50, dy: 8, dot: true},
      {at: [-5.45, 36.13], text: 'ALGECIRAS', dx: -80, dy: -14, dot: true},
      {at: [-5.31, 35.89], text: 'CEUTA', dx: 20, dy: 32, dot: true},
      {at: [-5.8, 35.78], text: 'TÁNGER', dx: -20, dy: 34, dot: true},
    ],
    headline: 'El Peñón', sub: 'Defendido desde dentro de la roca',
  },
  suministro: {
    box: [-64, 18, 10, 52],
    fills: {Spain: FILL_SPAIN, 'United Kingdom': FILL_UK, Canada: '#3a332c', 'United States of America': '#3a332c', France: FILL_FRA, Portugal: '#4a4036'},
    arrows: [
      {pts: [[-62, 46.5], [-40, 44], [-20, 42], [-9, 41.5]], color: GOLD, label: 'TRIGO DE CANADÁ'},
      {pts: [[-60, 22], [-40, 30], [-20, 37], [-9, 39]], color: GOLD, label: 'ARGENTINA / AMÉRICA'},
    ],
    marks: [{at: [-4, 40.2], text: 'ESPAÑA', dx: 0, dy: -50}, {at: [-2.5, 53.5], text: 'MARINA REAL', dx: -10, dy: 20}],
    headline: 'El pan viene por mar', sub: 'Navicerts desde el 1 de diciembre de 1939',
  },
  exigencias: {
    box: [-12, 26.5, 8, 41],
    fills: {Spain: FILL_SPAIN, Morocco: FILL_DEM, Algeria: FILL_DEM, France: FILL_FRA, Portugal: '#4a4036'},
    arrows: [
      {pts: [[-4.5, 37.6], [-5.5, 34.5], [-6.2, 32.5]], color: RED, label: 'MARRUECOS FRANCÉS'},
      {pts: [[-2.5, 37.4], [-1.2, 36.2], [-0.65, 35.7]], color: RED, label: 'ORÁN'},
    ],
    marks: [{at: [-5.35, 36.14], text: 'GIBRALTAR', dx: -40, dy: 44, dot: true}, {at: [-6.9, 31.2], text: 'MARRUECOS', dx: 0, dy: 10}, {at: [2, 31], text: 'ARGELIA', dx: 0, dy: 10}],
    headline: 'Lo que pedía Franco', sub: 'Gibraltar, Marruecos francés y Orán',
  },
  atlantico: {
    box: [-31, 11, -5, 43],
    fills: {Spain: FILL_SPAIN, Portugal: '#4a4036', Morocco: '#4a4036', 'United Kingdom': FILL_UK},
    arrows: [{pts: [[-12, 43], [-14, 36], [-15.4, 28.6]], color: BLUE, dashed: true, label: 'PLAN BRITÁNICO · PILGRIM'}],
    marks: [
      {at: [-15.4, 28.1], text: 'CANARIAS', dx: 70, dy: 6, dot: true}, {at: [-16.9, 32.7], text: 'MADEIRA', dx: 70, dy: 6, dot: true},
      {at: [-28, 38.6], text: 'AZORES', dx: 60, dy: 6, dot: true}, {at: [-23.6, 15.1], text: 'CABO VERDE', dx: 70, dy: 6, dot: true},
    ],
    headline: 'Las islas del Atlántico', sub: 'La respuesta que temía Franco',
  },
  estesur: {
    box: [-12, 34, 46, 60],
    fills: {Spain: FILL_SPAIN, Germany: FILL_GER, France: FILL_FRA, Russia: '#8a2a12', Ukraine: '#8a2a12', Belarus: '#8a2a12', 'United Kingdom': FILL_UK},
    arrows: [
      {pts: [[14, 52], [24, 53], [33, 55]], color: RED, date: '18 DIC 1940 · DIRECTIVA 21', label: 'BARBARROJA'},
      {pts: [[-1.78, 43.37], [-3.7, 40.4], [-5.4, 36.2]], color: 'rgba(255,255,255,.55)', dashed: true, label: 'FÉLIX'},
    ],
    marks: [{at: [-5.35, 36.14], text: 'GIBRALTAR', dx: 40, dy: 30, dot: true}],
    headline: 'Dos guerras posibles', sub: 'El sur se aparcó; el este se firmó',
  },
};

const box2poly = ([x0, y0, x1, y1]: [number, number, number, number]) => ({type: 'Polygon' as const, coordinates: [[[x0, y0], [x0, y1], [x1, y1], [x1, y0], [x0, y0]]]});
const useProj = (v: MapVariant) => useMemo(() => geoMercator().fitExtent([[0, 0], [W, H]], box2poly(MAP_CFG[v].box) as GeoPermissibleObjects), [v]);

/** BASE ESTÁTICA (se rasteriza una vez a PNG). */
export const MapBase: React.FC<{variant: MapVariant}> = ({variant}) => {
  const cfg = MAP_CFG[variant];
  const geo = useMemo(() => {
    const projection = geoMercator().fitExtent([[0, 0], [W, H]], box2poly(cfg.box) as GeoPermissibleObjects);
    const gp = geoPath(projection);
    const feats = (countries as any).features as any[];
    return feats.map((f) => ({name: f.properties.NAME as string, d: gp(f) || ''})).filter((p) => p.d);
  }, [variant]);
  return (
    <AbsoluteFill>
      <svg width={W} height={H} style={{position: 'absolute', inset: 0}}>
        <rect width={W} height={H} fill={C.sea} />
        {geo.map((p) => {
          const fill = cfg.fills[p.name] || C.land;
          const hi = !!cfg.fills[p.name];
          return <path key={p.name} d={p.d} fill={fill} stroke={hi ? '#ffb27a' : 'rgba(205,178,122,.45)'} strokeWidth={hi ? 1.6 : 1.2} />;
        })}
        <text x={W - 36} y={H - 18} textAnchor="end" fill="rgba(255,255,255,.5)" fontFamily={head} fontSize={20} letterSpacing={2}>
          ESQUEMA ILUSTRATIVO · FRONTERAS ACTUALES
        </text>
      </svg>
    </AbsoluteFill>
  );
};

const lenOf = (pts: [number, number][]) => pts.slice(1).reduce((a, p, i) => a + Math.hypot(p[0] - pts[i][0], p[1] - pts[i][1]), 0);
const pointAt = (pts: [number, number][], d: number): {p: [number, number]; ang: number} => {
  let acc = 0;
  for (let i = 1; i < pts.length; i++) {
    const seg = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
    if (acc + seg >= d || i === pts.length - 1) {
      const t = seg === 0 ? 0 : Math.min(1, (d - acc) / seg);
      return {p: [pts[i - 1][0] + (pts[i][0] - pts[i - 1][0]) * t, pts[i - 1][1] + (pts[i][1] - pts[i - 1][1]) * t], ang: Math.atan2(pts[i][1] - pts[i - 1][1], pts[i][0] - pts[i - 1][0])};
    }
    acc += seg;
  }
  return {p: pts[pts.length - 1], ang: 0};
};

/** CAPA ANIMADA: líneas de avance que se dibujan, fechas, marcadores y titular. */
export const MapAnimated: React.FC<{variant: MapVariant}> = ({variant}) => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  const cfg = MAP_CFG[variant];
  const proj = useProj(variant);
  const P = (pt: Pt) => proj(pt)!;
  const zoom = 1 + 0.05 * (frame / Math.max(1, durationInFrames));
  const fade = (a: number, d = 12) => interpolate(frame, [a, a + d], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{transform: `scale(${zoom})`, transformOrigin: '50% 50%'}}>
        <svg width={W} height={H} style={{position: 'absolute', inset: 0}}>
          {cfg.arrows.map((a, i) => {
            const pts = a.pts.map(P);
            const L = lenOf(pts);
            const p = interpolate(frame, [24 + i * 18, 24 + i * 18 + 56], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic)});
            if (p <= 0) return null;
            const col = a.color || RED;
            const end = pointAt(pts, L * p);
            const drawn = [pts[0], ...pts.slice(1).filter((_, k) => lenOf(pts.slice(0, k + 2)) < L * p), end.p];
            const poly = drawn.map((q) => q.join(',')).join(' ');
            const hx = [end.p[0] + Math.cos(end.ang) * 26, end.p[1] + Math.sin(end.ang) * 26];
            const l = [end.p[0] - Math.cos(end.ang) * 34 + Math.sin(end.ang) * 34, end.p[1] - Math.sin(end.ang) * 34 - Math.cos(end.ang) * 34];
            const r = [end.p[0] - Math.cos(end.ang) * 34 - Math.sin(end.ang) * 34, end.p[1] - Math.sin(end.ang) * 34 + Math.cos(end.ang) * 34];
            const mid = pointAt(pts, L * 0.55).p;
            return (
              <g key={i}>
                <polyline points={poly} fill="none" stroke="#000" strokeOpacity={0.5} strokeWidth={a.dashed ? 14 : 26} strokeLinecap="round" strokeLinejoin="round" />
                <polyline points={poly} fill="none" stroke={col} strokeWidth={a.dashed ? 8 : 18} strokeDasharray={a.dashed ? '22 14' : undefined} strokeLinecap="round" strokeLinejoin="round" />
                {!a.noHead && p > 0.1 ? <polygon points={`${hx.join(',')} ${l.join(',')} ${r.join(',')}`} fill={col} /> : null}
                {a.label && p > 0.4 ? (
                  <text x={mid[0] + 30} y={mid[1] - 18} fill="#fff" fontFamily={head} fontWeight={700} fontSize={26} letterSpacing={3} style={{textShadow: '0 2px 6px #000'}} opacity={fade(24 + i * 18 + 30)}>{a.label}</text>
                ) : null}
                {a.date && p > 0.85 ? (
                  <g opacity={fade(24 + i * 18 + 50, 10)} transform={`translate(${end.p[0] + 40}, ${end.p[1] - 96})`}>
                    <rect x={-8} y={-30} width={a.date.length * 17 + 24} height={46} fill="#8a3a10" stroke="#e07a2f" strokeWidth={3} />
                    <text x={4} y={3} fill="#fff4e2" fontFamily={head} fontWeight={700} fontSize={28} letterSpacing={2}>{a.date}</text>
                  </g>
                ) : null}
              </g>
            );
          })}
          {cfg.marks.map((m, i) => {
            const [x, y] = P(m.at);
            const o = fade(14 + i * 6);
            return (
              <g key={m.text} opacity={o}>
                {m.dot ? <circle cx={x} cy={y} r={11 + 3 * Math.sin(frame / 6)} fill="none" stroke="#fff" strokeWidth={3} /> : null}
                {m.dot ? <circle cx={x} cy={y} r={5} fill={RED} /> : null}
                <text x={x + (m.dx ?? 0)} y={y + (m.dy ?? 0)} textAnchor="middle" fill="#ffe9cf" fontFamily={head} fontWeight={600} fontSize={26} letterSpacing={3} style={{textShadow: '0 2px 6px #000'}}>{m.text}</text>
              </g>
            );
          })}
        </svg>
      </AbsoluteFill>
      <div style={{position: 'absolute', left: 90, top: 190, maxWidth: 900}}>
        <div style={{fontFamily: head, fontWeight: 700, fontSize: 84, lineHeight: 1.02, color: '#fff', textTransform: 'uppercase', textShadow: '0 4px 14px rgba(0,0,0,.95)', opacity: fade(8), transform: `translateY(${(1 - fade(8)) * 30}px)`}}>{cfg.headline}</div>
        {cfg.sub ? <div style={{marginTop: 12, fontFamily: head, fontWeight: 600, fontSize: 42, letterSpacing: 3, color: '#ff6b4a', textTransform: 'uppercase', textShadow: '0 3px 10px rgba(0,0,0,.95)', opacity: fade(20)}}>{cfg.sub}</div> : null}
      </div>
    </AbsoluteFill>
  );
};
