import { useCallback } from 'react';
import type { Track } from '../../types/project';
import { useUIStore } from '../../store/uiStore';
import { useProjectStore } from '../../store/projectStore';
import { useTimelineInteraction } from '../../hooks/useTimelineInteraction';
import { ClipBlock } from './ClipBlock';

interface TrackLaneProps {
  track: Track;
}

export function TrackLane({ track }: TrackLaneProps) {
  const pixelsPerSecond = useUIStore((s) => s.pixelsPerSecond);
  const project = useProjectStore((s) => s.project);
  const { handleLaneClick } = useTimelineInteraction();

  const onClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    // Only create a clip if the click target is the lane itself, not a child clip
    if (e.target !== e.currentTarget) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    handleLaneClick(track.id, clickX, 0);
  }, [track.id, handleLaneClick]);

  if (!project) return null;

  const totalWidth = project.totalDuration * pixelsPerSecond;

  return (
    <div
      className="relative h-16 border-b border-daw-border"
      style={{ width: totalWidth }}
      onClick={onClick}
    >
      {track.clips.map((clip) => (
        <ClipBlock key={clip.id} clip={clip} track={track} />
      ))}
    </div>
  );
}
