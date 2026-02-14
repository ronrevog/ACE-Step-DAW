import { get, set, del } from 'idb-keyval';

function makeKey(projectId: string, clipId: string, type: 'cumulative' | 'isolated'): string {
  return `audio:${projectId}:${clipId}:${type}`;
}

export async function saveAudioBlob(
  projectId: string,
  clipId: string,
  type: 'cumulative' | 'isolated',
  blob: Blob,
): Promise<string> {
  const key = makeKey(projectId, clipId, type);
  await set(key, blob);
  return key;
}

export async function loadAudioBlob(
  projectId: string,
  clipId: string,
  type: 'cumulative' | 'isolated',
): Promise<Blob | undefined> {
  const key = makeKey(projectId, clipId, type);
  return get<Blob>(key);
}

export async function loadAudioBlobByKey(key: string): Promise<Blob | undefined> {
  return get<Blob>(key);
}

export async function deleteAudioBlob(
  projectId: string,
  clipId: string,
  type: 'cumulative' | 'isolated',
): Promise<void> {
  const key = makeKey(projectId, clipId, type);
  await del(key);
}

export async function deleteAllProjectAudio(projectId: string): Promise<void> {
  // idb-keyval doesn't support prefix queries, so we track keys in the project
  // For now, individual deletion is handled per-clip
}
