import type { AnyTaskParams, LegoTaskParams, TaskResultItem } from '../types/api';

const MODAL_PROXY = '/api/modal';

/**
 * Convert a Blob to a base64 string.
 */
async function blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            const dataUrl = reader.result as string;
            const base64 = dataUrl.split(',')[1];
            resolve(base64);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
}

/**
 * Decode a base64 string to a Blob.
 */
function base64ToBlob(base64: string, mimeType: string): Blob {
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return new Blob([bytes], { type: mimeType });
}

/**
 * Modal API response format.
 */
interface ModalResponse {
    status: string;
    outputs: string[];
    format: string;
    count: number;
}

export interface ModalGenerationResult {
    audioBlob: Blob;
    metas: TaskResultItem['metas'];
    seed_value?: string;
    dit_model?: string;
}

/**
 * Generic Modal generation call for any task type.
 * Accepts optional source audio blob for tasks that need it (lego, cover, repaint, etc.)
 */
export async function generateViaModal(
    srcAudioBlob: Blob | null,
    params: AnyTaskParams | LegoTaskParams,
): Promise<ModalGenerationResult> {
    const body: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(params)) {
        if (value === null || value === undefined) continue;
        body[key] = value;
    }

    // Include source audio as base64 for tasks that need audio context
    if (srcAudioBlob && srcAudioBlob.size > 0) {
        const srcBase64 = await blobToBase64(srcAudioBlob);
        body.src_audio_base64 = srcBase64;
    }

    const res = await fetch(MODAL_PROXY, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
    });

    if (!res.ok) {
        const text = await res.text();
        throw new Error(`Modal generation failed: ${res.status} - ${text}`);
    }

    const json: ModalResponse = await res.json();

    if (json.status !== 'succeeded') {
        throw new Error(`Modal generation status: ${json.status}`);
    }

    if (!json.outputs || json.outputs.length === 0) {
        throw new Error('Modal returned no outputs');
    }

    const mimeType = json.format === 'wav' ? 'audio/wav' : 'audio/mpeg';
    const audioBlob = base64ToBlob(json.outputs[0], mimeType);

    return {
        audioBlob,
        metas: {},
    };
}

/**
 * Generate multiple outputs (batch_size > 1).
 * Returns all decoded audio blobs.
 */
export async function generateBatchViaModal(
    srcAudioBlob: Blob | null,
    params: AnyTaskParams,
): Promise<ModalGenerationResult[]> {
    const body: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(params)) {
        if (value === null || value === undefined) continue;
        body[key] = value;
    }

    if (srcAudioBlob && srcAudioBlob.size > 0) {
        const srcBase64 = await blobToBase64(srcAudioBlob);
        body.src_audio_base64 = srcBase64;
    }

    const res = await fetch(MODAL_PROXY, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
    });

    if (!res.ok) {
        const text = await res.text();
        throw new Error(`Modal generation failed: ${res.status} - ${text}`);
    }

    const json: ModalResponse = await res.json();

    if (json.status !== 'succeeded') {
        throw new Error(`Modal generation status: ${json.status}`);
    }

    const mimeType = json.format === 'wav' ? 'audio/wav' : 'audio/mpeg';
    return json.outputs.map((output) => ({
        audioBlob: base64ToBlob(output, mimeType),
        metas: {},
    }));
}

/**
 * Health check for Modal endpoint.
 */
export async function modalHealthCheck(): Promise<boolean> {
    try {
        const res = await fetch(MODAL_PROXY, { method: 'OPTIONS' });
        return true;
    } catch {
        return false;
    }
}

/**
 * LoRA adapter info returned from the list endpoint.
 */
export interface LoraInfo {
    name: string;
    has_weights: boolean;
    created_at?: string;
    epochs?: number;
    rank?: number;
    num_files?: number;
}

/**
 * Fetch the list of available trained LoRA adapters from Modal.
 */
export async function listLoras(): Promise<LoraInfo[]> {
    try {
        const res = await fetch('/api/modal/loras', { method: 'GET' });
        if (!res.ok) return [];
        const json = await res.json();
        return (json.loras || []) as LoraInfo[];
    } catch {
        return [];
    }
}
