import React from 'react';
import {C, head, serif} from '../theme';

/** Tarjeta arriba a la izquierda: fecha o atribución de fuente/archivo. */
export const DateCard: React.FC<{title: string; sub?: string}> = ({title, sub}) => (
  <div
    style={{
      position: 'absolute',
      left: 56,
      top: 44,
      padding: '14px 28px 14px 24px',
      background: `linear-gradient(90deg, ${C.burnt}, ${C.burntDark})`,
      borderLeft: `9px solid ${C.accent}`,
      boxShadow: '0 6px 18px rgba(0,0,0,.55)',
      color: '#fff4e2',
      fontFamily: head,
      letterSpacing: 1.5,
      textTransform: 'uppercase',
    }}
  >
    <div style={{fontSize: 40, fontWeight: 700, lineHeight: 1.1}}>{title}</div>
    {sub ? <div style={{fontSize: 22, fontWeight: 600, opacity: 0.85, marginTop: 4}}>{sub}</div> : null}
  </div>
);

/** Subtítulos centrados abajo, serif amarillo dorado. */
export const Subtitle: React.FC<{text: string}> = ({text}) => (
  <div
    style={{
      position: 'absolute',
      left: 160,
      right: 160,
      bottom: 62,
      textAlign: 'center',
      fontFamily: serif,
      fontWeight: 700,
      fontSize: 58,
      lineHeight: 1.2,
      color: C.gold,
      textShadow: '0 2px 6px rgba(0,0,0,.95), 0 0 22px rgba(0,0,0,.8)',
    }}
  >
    {text}
  </div>
);
