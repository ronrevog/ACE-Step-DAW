import { useState, useRef, useCallback } from 'react';
import { useLoraStore } from '../../store/loraStore';

const MODAL_PROXY = '/api/modal';

interface TrainingFile {
    id: string;
    file: File;
    name: string;
    size: string;
}

interface TrainingJob {
    id: string;
    name: string;
    status: 'queued' | 'annotating' | 'training' | 'done' | 'error';
    progress: string;
    startedAt: number;
    error?: string;
}

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

function formatFileSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function LoraTrainingPanel() {
    // Training files
    const [files, setFiles] = useState<TrainingFile[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Training config
    const [loraName, setLoraName] = useState('');
    const [epochs, setEpochs] = useState(100);
    const [learningRate, setLearningRate] = useState(0.0001);
    const [loraRank, setLoraRank] = useState(16);
    const [batchSize, setBatchSize] = useState(1);
    const [saveEvery, setSaveEvery] = useState(50);

    // Training state
    const [training, setTraining] = useState(false);
    const [trainingProgress, setTrainingProgress] = useState('');
    const [error, setError] = useState<string | null>(null);

    // Persistent LoRA store
    const addLora = useLoraStore((s) => s.addLora);
    const updateLora = useLoraStore((s) => s.updateLora);
    const localLoras = useLoraStore((s) => s.localLoras);

    // Training history
    const [jobs, setJobs] = useState<TrainingJob[]>([]);

    const handleFilesSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFiles = Array.from(e.target.files || []);
        const newFiles: TrainingFile[] = selectedFiles.map((f) => ({
            id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
            file: f,
            name: f.name,
            size: formatFileSize(f.size),
        }));
        setFiles((prev) => [...prev, ...newFiles]);
        // Reset input so same files can be re-selected
        if (fileInputRef.current) fileInputRef.current.value = '';
    }, []);

    const removeFile = (id: string) => {
        setFiles((prev) => prev.filter((f) => f.id !== id));
    };

    const handleStartTraining = async () => {
        if (files.length === 0) {
            setError('Please add at least one training audio file');
            return;
        }
        if (!loraName.trim()) {
            setError('Please enter a name for the LoRA');
            return;
        }

        setTraining(true);
        setError(null);

        const jobId = `job-${Date.now()}`;
        const job: TrainingJob = {
            id: jobId,
            name: loraName,
            status: 'queued',
            progress: 'Preparing training data...',
            startedAt: Date.now(),
        };
        setJobs((prev) => [job, ...prev]);

        // Register in persistent store
        addLora({
            name: loraName.trim(),
            status: 'training',
            createdAt: Date.now(),
            epochs,
            rank: loraRank,
            numFiles: files.length,
        });

        try {
            // Encode all audio files as base64
            setTrainingProgress('Encoding audio files...');
            updateJobStatus(jobId, 'annotating', 'Encoding audio files...');

            const audioFiles: { name: string; data: string }[] = [];
            for (const tf of files) {
                const base64 = await blobToBase64(tf.file);
                audioFiles.push({ name: tf.name, data: base64 });
            }

            setTrainingProgress('Submitting training job...');
            updateJobStatus(jobId, 'training', 'Submitting training job...');

            // Submit to Modal training endpoint
            const res = await fetch(`${MODAL_PROXY}/train`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    task_type: 'lora_training',
                    lora_name: loraName.trim(),
                    audio_files: audioFiles,
                    epochs,
                    learning_rate: learningRate,
                    lora_rank: loraRank,
                    batch_size: batchSize,
                    save_every: saveEvery,
                }),
            });

            if (!res.ok) {
                const text = await res.text();
                throw new Error(`Training failed: ${res.status} - ${text}`);
            }

            const result = await res.json();

            if (result.status === 'succeeded' || result.status === 'completed') {
                updateJobStatus(jobId, 'done', 'Training complete!');
                setTrainingProgress('Training complete!');
                updateLora(loraName.trim(), { status: 'done' });
            } else if (result.status === 'accepted' || result.status === 'queued') {
                updateJobStatus(jobId, 'training', `Job accepted: ${result.message || 'Training in progress...'}`);
                setTrainingProgress(`Job submitted: ${result.message || 'Training in background...'}`);
                // Mark as done since the backend accepted it (training happens async on Modal)
                updateLora(loraName.trim(), { status: 'done' });
            } else {
                updateJobStatus(jobId, 'done', `Status: ${result.status}`);
                setTrainingProgress(`Done: ${result.status}`);
                updateLora(loraName.trim(), { status: 'done' });
            }
        } catch (err) {
            const msg = err instanceof Error ? err.message : 'Unknown error';
            setError(msg);
            setTrainingProgress('');
            updateJobStatus(jobId, 'error', msg);
            updateLora(loraName.trim(), { status: 'error', error: msg });
        } finally {
            setTraining(false);
        }
    };

    const updateJobStatus = (jobId: string, status: TrainingJob['status'], progress: string) => {
        setJobs((prev) =>
            prev.map((j) =>
                j.id === jobId ? { ...j, status, progress, ...(status === 'error' ? { error: progress } : {}) } : j,
            ),
        );
    };

    return (
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
            {/* Header */}
            <div className="px-6 py-4 border-b border-daw-border bg-daw-surface">
                <h2 className="text-sm font-semibold flex items-center gap-2">
                    <span>🧠</span>
                    LoRA Training
                </h2>
                <p className="text-[11px] text-zinc-500 mt-0.5">
                    Train a custom style LoRA from your audio files. ~8 songs, ~1 hour on a 3090 (12GB VRAM).
                </p>
            </div>

            <div className="flex-1 flex min-h-0 overflow-hidden">
                {/* ─── Training Form ─── */}
                <div className="flex-1 overflow-y-auto p-6 space-y-5">
                    {/* Training Audio Files */}
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="text-xs font-medium text-zinc-300">Training Audio Files</h3>
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                className="px-3 py-1 text-[11px] font-medium bg-daw-surface-2 hover:bg-zinc-600 rounded transition-colors"
                            >
                                + Add Files
                            </button>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="audio/*"
                                multiple
                                onChange={handleFilesSelect}
                                className="hidden"
                            />
                        </div>

                        {files.length === 0 ? (
                            <div
                                onClick={() => fileInputRef.current?.click()}
                                className="border-2 border-dashed border-daw-border rounded-lg p-8 text-center cursor-pointer hover:border-daw-accent/50 transition-colors"
                            >
                                <p className="text-xs text-zinc-500">
                                    Drop audio files here or click to browse
                                </p>
                                <p className="text-[10px] text-zinc-600 mt-1">
                                    Recommended: 4-16 songs in your target style
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-1.5 max-h-48 overflow-y-auto">
                                {files.map((f) => (
                                    <div
                                        key={f.id}
                                        className="flex items-center justify-between px-3 py-2 bg-daw-bg border border-daw-border rounded text-xs"
                                    >
                                        <div className="flex items-center gap-2 min-w-0">
                                            <span className="text-zinc-500">🎵</span>
                                            <span className="truncate text-zinc-300">{f.name}</span>
                                            <span className="text-zinc-600 flex-shrink-0">{f.size}</span>
                                        </div>
                                        <button
                                            onClick={() => removeFile(f.id)}
                                            className="text-zinc-600 hover:text-red-400 ml-2 flex-shrink-0"
                                        >
                                            ✕
                                        </button>
                                    </div>
                                ))}
                                <p className="text-[10px] text-zinc-600 pt-1">
                                    {files.length} file{files.length !== 1 ? 's' : ''} selected
                                </p>
                            </div>
                        )}
                    </div>

                    {/* LoRA Configuration */}
                    <div>
                        <h3 className="text-xs font-medium text-zinc-300 mb-2">LoRA Configuration</h3>
                        <div className="space-y-3">
                            <div>
                                <label className="block text-[10px] text-zinc-500 mb-1">LoRA Name</label>
                                <input
                                    type="text"
                                    value={loraName}
                                    onChange={(e) => setLoraName(e.target.value)}
                                    placeholder="e.g. my-jazz-style"
                                    className="w-full px-3 py-1.5 text-sm bg-daw-bg border border-daw-border rounded focus:outline-none focus:border-daw-accent"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-[10px] text-zinc-500 mb-1">Epochs</label>
                                    <input
                                        type="number"
                                        value={epochs}
                                        onChange={(e) => setEpochs(parseInt(e.target.value) || 100)}
                                        min={10}
                                        max={1000}
                                        className="w-full px-2 py-1.5 text-sm bg-daw-bg border border-daw-border rounded focus:outline-none focus:border-daw-accent"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] text-zinc-500 mb-1">Learning Rate</label>
                                    <input
                                        type="number"
                                        value={learningRate}
                                        onChange={(e) => setLearningRate(parseFloat(e.target.value) || 0.0001)}
                                        min={0.000001}
                                        max={0.01}
                                        step={0.00001}
                                        className="w-full px-2 py-1.5 text-sm bg-daw-bg border border-daw-border rounded focus:outline-none focus:border-daw-accent"
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-3 gap-3">
                                <div>
                                    <label className="block text-[10px] text-zinc-500 mb-1">LoRA Rank</label>
                                    <select
                                        value={loraRank}
                                        onChange={(e) => setLoraRank(parseInt(e.target.value))}
                                        className="w-full px-2 py-1.5 text-sm bg-daw-bg border border-daw-border rounded focus:outline-none focus:border-daw-accent"
                                    >
                                        <option value={4}>4 (Fastest)</option>
                                        <option value={8}>8</option>
                                        <option value={16}>16 (Default)</option>
                                        <option value={32}>32</option>
                                        <option value={64}>64 (Highest Quality)</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[10px] text-zinc-500 mb-1">Batch Size</label>
                                    <input
                                        type="number"
                                        value={batchSize}
                                        onChange={(e) => setBatchSize(Math.max(1, Math.min(8, parseInt(e.target.value) || 1)))}
                                        min={1}
                                        max={8}
                                        className="w-full px-2 py-1.5 text-sm bg-daw-bg border border-daw-border rounded focus:outline-none focus:border-daw-accent"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] text-zinc-500 mb-1">Save Every N</label>
                                    <input
                                        type="number"
                                        value={saveEvery}
                                        onChange={(e) => setSaveEvery(parseInt(e.target.value) || 50)}
                                        min={10}
                                        max={500}
                                        className="w-full px-2 py-1.5 text-sm bg-daw-bg border border-daw-border rounded focus:outline-none focus:border-daw-accent"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Start Training */}
                    <div className="pt-2">
                        <button
                            onClick={handleStartTraining}
                            disabled={training || files.length === 0 || !loraName.trim()}
                            className="w-full py-2.5 text-sm font-semibold bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded transition-colors flex items-center justify-center gap-2"
                        >
                            {training ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    {trainingProgress}
                                </>
                            ) : (
                                <>🧠 Start Training</>
                            )}
                        </button>
                        {error && (
                            <p className="mt-2 text-xs text-red-400 bg-red-900/20 px-3 py-2 rounded">{error}</p>
                        )}
                    </div>

                    {/* Tips */}
                    <div className="bg-daw-surface-2 rounded-lg p-4">
                        <h4 className="text-[11px] font-semibold text-zinc-300 mb-2">💡 Training Tips</h4>
                        <ul className="space-y-1 text-[10px] text-zinc-500">
                            <li>• Use 4-16 songs that represent your target style</li>
                            <li>• Higher LoRA rank = more expressive but slower training</li>
                            <li>• 100 epochs is a good starting point; increase for more complex styles</li>
                            <li>• Training takes ~1 hour for 8 songs on a 3090 (12GB VRAM)</li>
                            <li>• Lower learning rate (0.00005) for fine-tuning, higher (0.0002) for new styles</li>
                        </ul>
                    </div>
                </div>

                {/* ─── Training History ─── */}
                <div className="w-80 flex-shrink-0 bg-daw-surface border-l border-daw-border overflow-y-auto">
                    <div className="p-4">
                        <h3 className="text-xs font-semibold text-zinc-300 mb-3">
                            Training History ({jobs.length})
                        </h3>
                        {jobs.length === 0 ? (
                            <p className="text-xs text-zinc-600 text-center py-8">
                                Training jobs will appear here
                            </p>
                        ) : (
                            <div className="space-y-2">
                                {jobs.map((job) => (
                                    <div
                                        key={job.id}
                                        className="bg-daw-bg rounded border border-daw-border p-3"
                                    >
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="text-xs font-medium text-zinc-300">{job.name}</span>
                                            <span
                                                className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${job.status === 'done'
                                                    ? 'bg-emerald-900/50 text-emerald-300'
                                                    : job.status === 'error'
                                                        ? 'bg-red-900/50 text-red-300'
                                                        : job.status === 'training'
                                                            ? 'bg-indigo-900/50 text-indigo-300'
                                                            : 'bg-zinc-800 text-zinc-400'
                                                    }`}
                                            >
                                                {job.status}
                                            </span>
                                        </div>
                                        <p className="text-[10px] text-zinc-500">{job.progress}</p>
                                        <p className="text-[9px] text-zinc-600 mt-1">
                                            {new Date(job.startedAt).toLocaleString()}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
