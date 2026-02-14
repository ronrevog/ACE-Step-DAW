import { useUIStore } from '../../store/uiStore';
import { useAudioImport } from '../../hooks/useAudioImport';

export function AddTrackButton() {
  const setShowInstrumentPicker = useUIStore((s) => s.setShowInstrumentPicker);
  const { openFilePicker } = useAudioImport();

  return (
    <div className="flex gap-1 mx-2 my-2">
      <button
        onClick={() => setShowInstrumentPicker(true)}
        className="flex-1 flex items-center justify-center gap-1 h-8 text-xs font-medium text-zinc-400 hover:text-zinc-200 bg-daw-surface-2 hover:bg-zinc-600 rounded transition-colors"
      >
        <span className="text-sm">+</span> Track
      </button>
      <button
        onClick={openFilePicker}
        className="flex items-center justify-center gap-1 h-8 px-2 text-xs font-medium text-zinc-400 hover:text-zinc-200 bg-daw-surface-2 hover:bg-zinc-600 rounded transition-colors"
        title="Import audio file"
      >
        <span className="text-sm">📁</span>
      </button>
    </div>
  );
}
