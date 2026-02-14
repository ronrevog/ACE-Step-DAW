import { useGeneration } from '../../hooks/useGeneration';

export function GenerateButton() {
  const { isGenerating, generateAll } = useGeneration();

  return (
    <button
      onClick={generateAll}
      disabled={isGenerating}
      className={`px-4 py-1.5 text-xs font-medium rounded transition-colors ${
        isGenerating
          ? 'bg-zinc-700 text-zinc-400 cursor-not-allowed'
          : 'bg-daw-accent hover:bg-daw-accent-hover text-white'
      }`}
    >
      {isGenerating ? 'Generating...' : 'Generate All'}
    </button>
  );
}
