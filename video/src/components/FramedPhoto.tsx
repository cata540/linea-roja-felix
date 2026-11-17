import React from 'react';
import {Img, staticFile} from 'remotion';
import {C} from '../theme';

/**
 * Foto histórica con marco fino dorado/beige y Ken Burns suave.
 * `progress` (0..1) fija el punto del movimiento; en vídeo real se calcula con useCurrentFrame.
 */
export const FramedPhoto: React.FC<{
  src: string;
  progress?: number;
  width?: number;
  height?: number;
  top?: number;
}> = ({src, progress = 0.5, width = 1480, height = 780, top = 70}) => {
  const scale = 1.04 + 0.08 * progress;
  const tx = -14 * progress;
  const ty = -8 * progress;
  return (
    <div
      style={{
        position: 'absolute',
        left: (1920 - width) / 2,
        top,
        width,
        height,
        padding: 9,
        border: `2px solid ${C.frame}`,
        boxShadow: '0 10px 40px rgba(0,0,0,.8)',
        background: '#090705',
      }}
    >
      <div style={{width: '100%', height: '100%', border: `1px solid ${C.frameDim}`, overflow: 'hidden'}}>
        <Img
          src={staticFile(src)}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transform: `scale(${scale}) translate(${tx}px, ${ty}px)`,
            filter: 'grayscale(1) contrast(1.12) sepia(0.18) brightness(0.92)',
          }}
        />
      </div>
    </div>
  );
};
