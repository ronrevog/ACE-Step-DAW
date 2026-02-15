import { useUIStore } from '../../store/uiStore';
import { useAudioImport } from '../../hooks/useAudioImport';

export function AddTrackButton() {
  const setShowInstrumentPicker = useUIStore((s) => s.setShowInstrumentPicker);
  const { openFilePicker } = useAudioImport();

  return (
    <div className="flex gap-1 mx-1.5 my-1.5">
      <button
        onClick={() => setShowInstrumentPicker(true)}
        className="flex-1 flex items-center justify-center gap-1 h-7 text-[9px] font-bold uppercase tracking-wider text-slate-600 hover:text-slate-300 bg-black/30 hover:bg-white/5 border border-daw-border rounded transition-colors"
      >
        <span className="material-symbols-outlined text-xs">add</span> Track
      </button>
      <button
        onClick={openFilePicker}
        className="flex items-center justify-center h-7 w-7 text-slate-600 hover:text-slate-300 bg-black/30 hover:bg-white/5 border border-daw-border rounded transition-colors"
        title="Import audio file"
      >
        <span className="material-symbols-outlined text-xs">folder_open</span>
      </button>
    </div>
  );
}
