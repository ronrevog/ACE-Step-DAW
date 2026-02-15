import { useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useProjectStore } from '../store/projectStore';
import { getAudioEngine } from './useAudioEngine';
import { saveAudioBlob } from '../services/audioFileManager';
import { computeWaveformPeaks } from '../utils/waveformPeaks';
import { audioBufferToWavBlob } from '../utils/wav';

export function useAudioImport() {
  const addTrack = useProjectStore((s) => s.addTrack);
  const addClip = useProjectStore((s) => s.addClip);
  const updateClipStatus = useProjectStore((s) => s.updateClipStatus);

  /**
   * Import audio into an existing track (adds a clip to that track).
   */
  const importAudioToTrack = useCallback(async (file: File, trackId: string) => {
    const project = useProjectStore.getState().project;
    if (!project) return;

    const engine = getAudioEngine();
    await engine.resume();

    const arrayBuffer = await file.arrayBuffer();
    const audioBuffer = await engine.ctx.decodeAudioData(arrayBuffer);
    const duration = audioBuffer.duration;

    // Find the latest clip end on this track to place the new clip after it
    const track = useProjectStore.getState().getTrackById(trackId);
    let startTime = 0;
    if (track) {
      for (const clip of track.clips) {
        const end = clip.startTime + clip.duration;
        if (end > startTime) startTime = end;
      }
    }

    const clipDuration = Math.min(duration, project.totalDuration - startTime);
    if (clipDuration <= 0) return;

    const clip = addClip(trackId, {
      startTime,
      duration: clipDuration,
      prompt: `Imported: ${file.name}`,
      lyrics: '',
    });

    // Trim the buffer to clip duration if needed
    const sampleRate = audioBuffer.sampleRate;
    const trimmedLength = Math.min(
      Math.floor(clipDuration * sampleRate),
      audioBuffer.length,
    );
    const trimmedBuffer = engine.ctx.createBuffer(
      audioBuffer.numberOfChannels,
      trimmedLength,
      sampleRate,
    );
    for (let ch = 0; ch < audioBuffer.numberOfChannels; ch++) {
      const src = audioBuffer.getChannelData(ch);
      const dst = trimmedBuffer.getChannelData(ch);
      for (let i = 0; i < trimmedLength; i++) {
        dst[i] = src[i];
      }
    }

    const wavBlob = audioBufferToWavBlob(trimmedBuffer);
    const isolatedKey = await saveAudioBlob(project.id, clip.id, 'isolated', wavBlob);
    const peaks = computeWaveformPeaks(trimmedBuffer, 200);

    updateClipStatus(clip.id, 'ready', {
      isolatedAudioKey: isolatedKey,
      waveformPeaks: peaks,
      audioDuration: clipDuration,
      audioOffset: 0,
    });
  }, [addClip, updateClipStatus]);

  const importAudioFile = useCallback(async (file: File) => {
    const project = useProjectStore.getState().project;
    if (!project) return;

    const engine = getAudioEngine();
    await engine.resume();

    // Decode the audio file
    const arrayBuffer = await file.arrayBuffer();
    const audioBuffer = await engine.ctx.decodeAudioData(arrayBuffer);
    const duration = audioBuffer.duration;

    // Create a custom track
    const track = addTrack('custom');
    // Rename to the file name
    useProjectStore.getState().updateTrack(track.id, {
      displayName: file.name.replace(/\.[^.]+$/, ''),
    });

    // Create a clip spanning the audio
    const clipDuration = Math.min(duration, project.totalDuration);
    const clip = addClip(track.id, {
      startTime: 0,
      duration: clipDuration,
      prompt: `Imported: ${file.name}`,
      lyrics: '',
    });

    // Trim the buffer to clip duration if needed
    const sampleRate = audioBuffer.sampleRate;
    const trimmedLength = Math.min(
      Math.floor(clipDuration * sampleRate),
      audioBuffer.length,
    );
    const trimmedBuffer = engine.ctx.createBuffer(
      audioBuffer.numberOfChannels,
      trimmedLength,
      sampleRate,
    );
    for (let ch = 0; ch < audioBuffer.numberOfChannels; ch++) {
      const src = audioBuffer.getChannelData(ch);
      const dst = trimmedBuffer.getChannelData(ch);
      for (let i = 0; i < trimmedLength; i++) {
        dst[i] = src[i];
      }
    }

    // Convert to WAV and store
    const wavBlob = audioBufferToWavBlob(trimmedBuffer);
    const isolatedKey = await saveAudioBlob(project.id, clip.id, 'isolated', wavBlob);

    // Compute waveform peaks
    const peaks = computeWaveformPeaks(trimmedBuffer, 200);

    // Mark clip as ready
    updateClipStatus(clip.id, 'ready', {
      isolatedAudioKey: isolatedKey,
      waveformPeaks: peaks,
      audioDuration: clipDuration,
      audioOffset: 0,
    });
  }, [addTrack, addClip, updateClipStatus]);

  const openFilePicker = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'audio/*';
    input.onchange = async () => {
      const file = input.files?.[0];
      if (file) {
        await importAudioFile(file);
      }
    };
    input.click();
  }, [importAudioFile]);

  const openFilePickerForTrack = useCallback((trackId: string) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'audio/*';
    input.onchange = async () => {
      const file = input.files?.[0];
      if (file) {
        await importAudioToTrack(file, trackId);
      }
    };
    input.click();
  }, [importAudioToTrack]);

  return { importAudioFile, importAudioToTrack, openFilePicker, openFilePickerForTrack };
}
