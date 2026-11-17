import React from 'react';
import {AbsoluteFill, Img, staticFile, useCurrentFrame} from 'remotion';
import {C} from '../theme';

export const Background: React.FC = () => (
  <AbsoluteFill
    style={{
      background: `radial-gradient(circle at 50% 40%, ${C.bgGlow} 0%, ${C.bg} 70%)`,
    }}
  />
);

/** Fondo con profundidad: la misma foto, muy oscura y desenfocada, detrás del marco. */
export const BlurBackdrop: React.FC<{src: string}> = ({src}) => (
  <AbsoluteFill style={{overflow: 'hidden', background: C.bg}}>
    <Img
      src={staticFile(src)}
      style={{
        width: '100%',
        height: '100%',
        objectFit: 'cover',
        transform: 'scale(1.25)',
        filter: 'grayscale(1) sepia(0.25) blur(38px) brightness(0.28)',
      }}
    />
    <AbsoluteFill style={{background: 'radial-gradient(circle at 50% 40%, rgba(42,31,22,.25), rgba(13,10,8,.55))'}} />
  </AbsoluteFill>
);

export const Grain: React.FC<{opacity?: number}> = ({opacity = 0.25}) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{pointerEvents: 'none', mixBlendMode: 'overlay', opacity}}>
      <svg width="100%" height="100%">
        <filter id="grain">
          <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed={frame % 9} stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#grain)" />
      </svg>
    </AbsoluteFill>
  );
};

export const Vignette: React.FC<{strength?: number}> = ({strength = 0.88}) => (
  <AbsoluteFill
    style={{
      pointerEvents: 'none',
      background: `radial-gradient(ellipse at center, rgba(0,0,0,0) 42%, rgba(0,0,0,${strength}) 100%)`,
    }}
  />
);
