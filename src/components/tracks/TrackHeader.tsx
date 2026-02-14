import type { Track } from '../../types/project';
import { useProjectStore } from '../../store/projectStore';
import { TRACK_CATALOG } from '../../constants/tracks';

interface TrackHeaderProps {
  track: Track;
}

export function TrackHeader({ track }: TrackHeaderProps) {
  const updateTrack = useProjectStore((s) => s.updateTrack);
  const removeTrack = useProjectStore((s) => s.removeTrack);
  const info = TRACK_CATALOG[track.trackName];

  return (
    <div
      className="flex items-center gap-2 h-16 px-2 border-b border-daw-border group"
      style={{ borderLeft: `3px solid ${track.color}` }}
    >
      <span className="text-base" title={info.displayName}>{info.emoji}</span>

      <div className="flex-1 min-w-0">
        <div className="text-xs font-medium text-zinc-200 truncate">{track.displayName}</div>
        <input
          type="range"
          min="0"
          max="100"
          value={Math.round(track.volume * 100)}
          onChange={(e) => updateTrack(track.id, { volume: parseInt(e.target.value) / 100 })}
          className="w-full h-1 mt-1"
          title={`Volume: ${Math.round(track.volume * 100)}%`}
        />
      </div>

      <div className="flex items-center gap-0.5">
        <button
          onClick={() => updateTrack(track.id, { muted: !track.muted })}
          className={`w-6 h-5 text-[10px] font-bold rounded transition-colors ${
            track.muted
              ? 'bg-amber-600 text-white'
              : 'bg-daw-surface-2 text-zinc-500 hover:text-zinc-300'
          }`}
          title="Mute"
        >
          M
        </button>
        <button
          onClick={() => updateTrack(track.id, { soloed: !track.soloed })}
          className={`w-6 h-5 text-[10px] font-bold rounded transition-colors ${
            track.soloed
              ? 'bg-emerald-600 text-white'
              : 'bg-daw-surface-2 text-zinc-500 hover:text-zinc-300'
          }`}
          title="Solo"
        >
          S
        </button>
        <button
          onClick={() => removeTrack(track.id)}
          className="w-6 h-5 text-[10px] font-bold rounded bg-daw-surface-2 text-zinc-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
          title="Remove track"
        >
          ×
        </button>
      </div>
    </div>
  );
}
