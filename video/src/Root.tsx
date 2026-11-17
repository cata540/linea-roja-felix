import React from 'react';
import {Composition, Still} from 'remotion';
import timeline from '../data/timeline.json';
import {Documental} from './Documental';
import {MapBase, MAP_CFG} from './components/MapScene';
import './theme';

// Cada mapa se rasteriza UNA vez a PNG (public/maps/<variante>_base.png); la capa animada (líneas, fechas) es ligera.
const variants = Object.keys(MAP_CFG);

export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="Documental" component={Documental} durationInFrames={timeline.durationInFrames} fps={30} width={1920} height={1080} />
    {variants.map((v) => (
      <Still key={v} id={`MapBase-${v}`} width={1920} height={1080} component={() => <MapBase variant={v as any} />} />
    ))}
  </>
);
