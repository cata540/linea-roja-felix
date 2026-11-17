import {loadFont as loadSerif} from '@remotion/google-fonts/CormorantGaramond';
import {loadFont as loadHead} from '@remotion/google-fonts/Oswald';
import {loadFont as loadMono} from '@remotion/google-fonts/SpecialElite';

export const serif = loadSerif('normal', {weights: ['600', '700']}).fontFamily;
export const head = loadHead('normal', {weights: ['600', '700']}).fontFamily;
export const typewriter = loadMono('normal', {weights: ['400']}).fontFamily;

export const C = {
  bg: '#0d0a08',
  bgGlow: '#2a1f16',
  gold: '#f2c94c',
  frame: '#cdb27a',
  frameDim: '#8c7547',
  burnt: '#8a3a10',
  burntDark: '#5e2608',
  accent: '#e07a2f',
  red: '#d62828',
  land: '#2b2723',
  sea: '#0f1214',
  paper: '#e8dcc0',
};

export const W = 1920;
export const H = 1080;
