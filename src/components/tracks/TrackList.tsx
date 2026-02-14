import { useProjectStore } from '../../store/projectStore';
import { TrackHeader } from './TrackHeader';
import { AddTrackButton } from './AddTrackButton';

export function TrackList() {
  const project = useProjectStore((s) => s.project);

  if (!project) return null;

  // Display tracks in visual order: lowest order at bottom
  const sortedTracks = [...project.tracks].sort((a, b) => a.order - b.order);

  return (
    <div className="flex flex-col w-[200px] min-w-[200px] bg-daw-surface border-r border-daw-border">
      {/* Header spacer aligned with TimeRuler */}
      <div className="h-6 border-b border-daw-border" />

      <div className="flex-1 overflow-y-auto">
        {sortedTracks.map((track) => (
          <TrackHeader key={track.id} track={track} />
        ))}
      </div>

      <AddTrackButton />
    </div>
  );
}
