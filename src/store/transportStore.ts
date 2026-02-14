import { create } from 'zustand';

interface TransportState {
  isPlaying: boolean;
  currentTime: number;
  loopEnabled: boolean;
  loopStart: number;
  loopEnd: number;

  play: () => void;
  pause: () => void;
  stop: () => void;
  seek: (time: number) => void;
  setCurrentTime: (time: number) => void;
  toggleLoop: () => void;
  setLoopRegion: (start: number, end: number) => void;
}

export const useTransportStore = create<TransportState>((set) => ({
  isPlaying: false,
  currentTime: 0,
  loopEnabled: false,
  loopStart: 0,
  loopEnd: 0,

  play: () => set({ isPlaying: true }),
  pause: () => set({ isPlaying: false }),
  stop: () => set({ isPlaying: false, currentTime: 0 }),
  seek: (time) => set({ currentTime: Math.max(0, time) }),
  setCurrentTime: (time) => set({ currentTime: time }),
  toggleLoop: () => set((s) => ({ loopEnabled: !s.loopEnabled })),
  setLoopRegion: (start, end) => set({ loopStart: start, loopEnd: end }),
}));
