/**
 * Isolate a single track's audio by subtracting the previous cumulative mix.
 *
 * currentMix = layers 1..N combined (lego output)
 * previousMix = layers 1..N-1 combined (previous lego output), null for first track
 * Result = isolated track N audio
 */
export function isolateTrackAudio(
  ctx: BaseAudioContext,
  currentMix: AudioBuffer,
  previousMix: AudioBuffer | null,
): AudioBuffer {
  if (!previousMix) return currentMix;

  const isolated = ctx.createBuffer(
    currentMix.numberOfChannels,
    currentMix.length,
    currentMix.sampleRate,
  );

  for (let ch = 0; ch < currentMix.numberOfChannels; ch++) {
    const curr = currentMix.getChannelData(ch);
    const prev = previousMix.getChannelData(ch);
    const out = isolated.getChannelData(ch);

    for (let i = 0; i < curr.length; i++) {
      out[i] = curr[i] - (i < prev.length ? prev[i] : 0);
    }
  }

  return isolated;
}
