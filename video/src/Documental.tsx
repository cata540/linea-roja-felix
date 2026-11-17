import React, {useMemo} from 'react';
import {AbsoluteFill, Img, Sequence, interpolate, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import timeline from '../data/timeline.json';
import {Background, Vignette} from './components/Atmosphere';
import {DateCard, Subtitle} from './components/Overlays';
import {DocumentScene} from './components/DocumentScene';
import {MapAnimated} from './components/MapScene';
import {ListScene, OutroScene, QuoteScene, PhotoShot, TelegramScene, TimelineScene, TitleScene, VideoShot} from './components/Scenes';

type Shot = any;

const GrainTex: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{pointerEvents: 'none', mixBlendMode: 'overlay', opacity: 0.2}}>
      <Img src={staticFile(`grain/g${Math.floor(frame / 2) % 4}.jpg`)} style={{width: '100%', height: '100%'}} />
    </AbsoluteFill>
  );
};

const AnimCard: React.FC<{title: string; sub?: string; dur: number}> = ({title, sub, dur}) => {
  const frame = useCurrentFrame();
  const o = interpolate(frame, [0, 8, dur - 8, dur], [0, 1, 1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const x = interpolate(frame, [0, 10], [-40, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <AbsoluteFill style={{opacity: o, transform: `translateX(${x}px)`}}>
      <DateCard title={title} sub={sub} />
    </AbsoluteFill>
  );
};

const MapBaseImage: React.FC<{file: string}> = ({file}) => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  const z = 1 + 0.05 * (frame / Math.max(1, durationInFrames));
  return (
    <AbsoluteFill style={{background: '#0f1214'}}>
      <Img src={staticFile(file)} style={{width: '100%', height: '100%', transform: `scale(${z})`, transformOrigin: '50% 50%'}} />
    </AbsoluteFill>
  );
};

const renderShot = (s: Shot) => {
  switch (s.kind) {
    case 'photo':
      return <PhotoShot src={s.src} bg={s.bg} kb={s.kb} layout={s.layout} caption={s.caption} ai={s.ai} />;
    case 'map':
      return (
        <AbsoluteFill>
          <MapBaseImage file={`maps/${s.map}_base.png`} />
          <MapAnimated variant={s.map} />
        </AbsoluteFill>
      );
    case 'video':
      return <VideoShot src={s.src} />;
    case 'telegram':
      return <TelegramScene spec={s.spec} />;
    case 'timeline':
      return <TimelineScene {...s.spec} />;
    case 'quote':
      return <QuoteScene spec={s.spec} />;
    case 'list':
      return <ListScene {...s.spec} />;
    case 'doc':
      return (
        <AbsoluteFill>
          <Background />
          <DocumentScene spec={s.spec} />
        </AbsoluteFill>
      );
    case 'title':
      return <TitleScene title={s.title} />;
    case 'outro':
      return <OutroScene src={s.src} bg={s.bg} />;
    default:
      return <Background />;
  }
};

const SubLayer: React.FC = () => {
  const frame = useCurrentFrame();
  const subs = timeline.subs as {from: number; dur: number; text: string}[];
  const cur = useMemo(() => {
    let lo = 0;
    let hi = subs.length - 1;
    let found = -1;
    while (lo <= hi) {
      const mid = (lo + hi) >> 1;
      if (subs[mid].from <= frame) {
        found = mid;
        lo = mid + 1;
      } else hi = mid - 1;
    }
    return found;
  }, [frame]);
  if (cur < 0) return null;
  const s = subs[cur];
  if (frame >= s.from + s.dur) return null;
  return <Subtitle text={s.text} />;
};

export const Documental: React.FC = () => (
  <AbsoluteFill style={{background: C0}}>
    {(timeline.shots as Shot[]).map((s, i) => (
      <Sequence key={i} from={s.from} durationInFrames={s.dur} layout="none">
        <AbsoluteFill>{renderShot(s)}</AbsoluteFill>
      </Sequence>
    ))}
    <Vignette />
    <GrainTex />
    {(timeline.cards as {from: number; dur: number; title: string; sub?: string}[]).map((c, i) => (
      <Sequence key={i} from={c.from} durationInFrames={c.dur} layout="none">
        <AnimCard title={c.title} sub={c.sub} dur={c.dur} />
      </Sequence>
    ))}
    <SubLayer />
  </AbsoluteFill>
);

const C0 = '#0d0a08';
