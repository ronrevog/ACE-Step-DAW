import { audioBufferToWavBlob } from '../utils/wav';

export async function exportMixToWav(
  clips: Array<{ startTime: number; buffer: AudioBuffer; volume: number }>,
  totalDuration: number,
  sampleRate: number = 48000,
): Promise<Blob> {
  const length = Math.ceil(totalDuration * sampleRate);
  const offlineCtx = new OfflineAudioContext(2, length, sampleRate);

  for (const clip of clips) {
    const source = offlineCtx.createBufferSource();
    source.buffer = clip.buffer;

    const gain = offlineCtx.createGain();
    gain.gain.value = clip.volume;

    source.connect(gain);
    gain.connect(offlineCtx.destination);
    source.start(clip.startTime);
  }

  const rendered = await offlineCtx.startRendering();
  return audioBufferToWavBlob(rendered);
}
