import { useGeneration } from '../../hooks/useGeneration';

export function GenerateButton() {
  const { isGenerating, generateAll } = useGeneration();

  return (
    <button
      onClick={generateAll}
      disabled={isGenerating}
      className={`flex items-center gap-2 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.15em] rounded transition-all ${isGenerating
          ? 'bg-daw-panel-light text-slate-500 cursor-not-allowed'
          : 'bg-daw-accent hover:bg-blue-600 text-white shadow-lg shadow-daw-accent/10'
        }`}
    >
      <span className="material-symbols-outlined text-sm">
        {isGenerating ? 'hourglass_top' : 'auto_awesome'}
      </span>
      {isGenerating ? 'Generating...' : 'Generate All'}
    </button>
  );
}
