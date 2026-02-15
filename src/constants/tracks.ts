import type { TrackName } from '../types/project';

export interface TrackInfo {
  name: TrackName;
  displayName: string;
  emoji: string;
  color: string;
  defaultOrder: number;
  /** Default prompt prefix that always gets prepended to user prompts for generation */
  defaultPrompt: string;
}

export const TRACK_CATALOG: Record<TrackName, TrackInfo> = {
  drums: { name: 'drums', displayName: 'Drums', emoji: '🥁', color: '#ef4444', defaultOrder: 12, defaultPrompt: 'drums, drum kit, rhythmic percussion' },
  bass: { name: 'bass', displayName: 'Bass', emoji: '🎸', color: '#f97316', defaultOrder: 11, defaultPrompt: 'bass, bass guitar, low-end groove' },
  guitar: { name: 'guitar', displayName: 'Guitar', emoji: '🎸', color: '#eab308', defaultOrder: 10, defaultPrompt: 'guitar, electric guitar or acoustic guitar' },
  keyboard: { name: 'keyboard', displayName: 'Keyboard', emoji: '🎹', color: '#22c55e', defaultOrder: 9, defaultPrompt: 'keyboard, piano, keys' },
  percussion: { name: 'percussion', displayName: 'Percussion', emoji: '🪘', color: '#14b8a6', defaultOrder: 8, defaultPrompt: 'percussion, auxiliary percussion, shakers, tambourine' },
  strings: { name: 'strings', displayName: 'Strings', emoji: '🎻', color: '#06b6d4', defaultOrder: 7, defaultPrompt: 'strings, orchestral strings, violin, cello' },
  synth: { name: 'synth', displayName: 'Synth', emoji: '🎛️', color: '#3b82f6', defaultOrder: 6, defaultPrompt: 'synthesizer, electronic synth, synth pad' },
  fx: { name: 'fx', displayName: 'FX', emoji: '✨', color: '#8b5cf6', defaultOrder: 5, defaultPrompt: 'sound effects, fx, ambient textures' },
  brass: { name: 'brass', displayName: 'Brass', emoji: '🎺', color: '#a855f7', defaultOrder: 4, defaultPrompt: 'brass, trumpet, trombone, horn section' },
  woodwinds: { name: 'woodwinds', displayName: 'Woodwinds', emoji: '🎷', color: '#d946ef', defaultOrder: 3, defaultPrompt: 'woodwinds, saxophone, flute, clarinet' },
  backing_vocals: { name: 'backing_vocals', displayName: 'Backing Vocals', emoji: '🎙️', color: '#ec4899', defaultOrder: 2, defaultPrompt: 'backing vocals, harmony vocals, choir' },
  vocals: { name: 'vocals', displayName: 'Vocals', emoji: '🎤', color: '#f43f5e', defaultOrder: 1, defaultPrompt: 'lead vocals, singing voice' },
  custom: { name: 'custom', displayName: 'Generic', emoji: '🎵', color: '#71717a', defaultOrder: 0, defaultPrompt: '' },
};

export const TRACK_NAMES: TrackName[] = [
  'drums', 'bass', 'guitar', 'keyboard', 'percussion',
  'strings', 'synth', 'fx', 'brass', 'woodwinds',
  'backing_vocals', 'vocals', 'custom',
];

export const KEY_SCALES = [
  'C major', 'C minor', 'C# major', 'C# minor',
  'D major', 'D minor', 'D# major', 'D# minor',
  'E major', 'E minor',
  'F major', 'F minor', 'F# major', 'F# minor',
  'G major', 'G minor', 'G# major', 'G# minor',
  'A major', 'A minor', 'A# major', 'A# minor',
  'B major', 'B minor',
];

export const TIME_SIGNATURES = [2, 3, 4, 6];
