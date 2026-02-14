import { SAMPLE_RATE, NUM_CHANNELS, BITS_PER_SAMPLE } from '../constants/defaults';

/**
 * Generate a WAV blob of silence at 48kHz stereo 16-bit PCM.
 */
export function generateSilenceWav(durationSeconds: number): Blob {
  const numSamples = Math.ceil(SAMPLE_RATE * durationSeconds);
  const bytesPerSample = BITS_PER_SAMPLE / 8;
  const blockAlign = NUM_CHANNELS * bytesPerSample;
  const dataSize = numSamples * blockAlign;
  const bufferSize = 44 + dataSize;

  const buffer = new ArrayBuffer(bufferSize);
  const view = new DataView(buffer);

  // RIFF header
  writeStr(view, 0, 'RIFF');
  view.setUint32(4, bufferSize - 8, true);
  writeStr(view, 8, 'WAVE');

  // fmt chunk
  writeStr(view, 12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);                               // PCM
  view.setUint16(22, NUM_CHANNELS, true);
  view.setUint32(24, SAMPLE_RATE, true);
  view.setUint32(28, SAMPLE_RATE * blockAlign, true);         // byte rate
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, BITS_PER_SAMPLE, true);

  // data chunk (all zeros = silence)
  writeStr(view, 36, 'data');
  view.setUint32(40, dataSize, true);
  // The ArrayBuffer is already zero-initialized

  return new Blob([buffer], { type: 'audio/wav' });
}

function writeStr(view: DataView, offset: number, str: string) {
  for (let i = 0; i < str.length; i++) {
    view.setUint8(offset + i, str.charCodeAt(i));
  }
}
