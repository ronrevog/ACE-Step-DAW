export function computeWaveformPeaks(
  audioBuffer: AudioBuffer,
  numPeaks: number,
  startSample: number = 0,
  endSample?: number,
): number[] {
  const channelData = audioBuffer.getChannelData(0);
  const regionEnd = endSample ?? channelData.length;
  const regionLength = regionEnd - startSample;
  const samplesPerPeak = Math.floor(regionLength / numPeaks);
  if (samplesPerPeak <= 0) return new Array(numPeaks).fill(0);

  const peaks: number[] = new Array(numPeaks);

  for (let i = 0; i < numPeaks; i++) {
    let max = 0;
    const start = startSample + i * samplesPerPeak;
    const end = Math.min(start + samplesPerPeak, regionEnd);
    for (let j = start; j < end; j++) {
      const abs = Math.abs(channelData[j]);
      if (abs > max) max = abs;
    }
    peaks[i] = max;
  }

  return peaks;
}
