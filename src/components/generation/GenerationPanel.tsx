import { useGenerationStore } from '../../store/generationStore';
import { useUIStore } from '../../store/uiStore';
import { GenerateButton } from './GenerateButton';

export function GenerationPanel() {
  const jobs = useGenerationStore((s) => s.jobs);
  const clearCompletedJobs = useGenerationStore((s) => s.clearCompletedJobs);
  const showMixer = useUIStore((s) => s.showMixer);
  const toggleMixer = useUIStore((s) => s.toggleMixer);

  return (
    <div className="border-t border-daw-border bg-daw-panel shrink-0">
      <div className="flex items-center h-9 px-4 gap-3">
        <GenerateButton />

        {/* Mixer toggle */}
        <button
          onClick={toggleMixer}
          className={`flex items-center gap-1.5 px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded border transition-colors ${showMixer
            ? 'bg-daw-accent/15 text-daw-accent border-daw-accent/30'
            : 'text-slate-500 border-daw-border hover:text-slate-300 hover:bg-white/5'
            }`}
        >
          <span className="material-symbols-outlined text-sm">equalizer</span>
          Mixer
        </button>

        {jobs.length > 0 && (
          <>
            <div className="flex-1 flex items-center gap-2 overflow-x-auto">
              {jobs.map((job) => (
                <div
                  key={job.id}
                  className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider whitespace-nowrap border ${job.status === 'done'
                    ? 'bg-emerald-900/30 text-emerald-400 border-emerald-500/20'
                    : job.status === 'error'
                      ? 'bg-red-900/30 text-red-400 border-red-500/20'
                      : job.status === 'generating'
                        ? 'bg-daw-accent/10 text-daw-accent border-daw-accent/20'
                        : 'bg-black/20 text-slate-500 border-daw-border'
                    }`}
                >
                  {job.status === 'generating' && (
                    <div className="w-2 h-2 border border-current border-t-transparent rounded-full animate-spin" />
                  )}
                  <span>{job.trackName}</span>
                  <span className="opacity-60">{job.progress}</span>
                </div>
              ))}
            </div>

            <button
              onClick={clearCompletedJobs}
              className="text-[9px] text-slate-600 hover:text-slate-400 uppercase font-bold tracking-wider transition-colors"
            >
              Clear
            </button>
          </>
        )}
      </div>
    </div>
  );
}
