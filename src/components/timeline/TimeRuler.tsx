import { useCallback } from 'react';
import { useProjectStore } from '../../store/projectStore';
import { useUIStore } from '../../store/uiStore';
import { useTransport } from '../../hooks/useTransport';
import { getBarDuration } from '../../utils/time';

export function TimeRuler() {
  const project = useProjectStore((s) => s.project);
  const pixelsPerSecond = useUIStore((s) => s.pixelsPerSecond);
  const { seek } = useTransport();

  const handleClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!project) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const time = Math.max(0, Math.min(x / pixelsPerSecond, project.totalDuration));
    seek(time);
  }, [project, pixelsPerSecond, seek]);

  if (!project) return <div className="h-6 bg-daw-surface border-b border-daw-border" />;

  const barDuration = getBarDuration(project.bpm, project.timeSignature);
  const totalBars = Math.ceil(project.totalDuration / barDuration);
  const totalWidth = project.totalDuration * pixelsPerSecond;

  const markers: { bar: number; x: number }[] = [];
  for (let bar = 1; bar <= totalBars; bar++) {
    const x = (bar - 1) * barDuration * pixelsPerSecond;
    markers.push({ bar, x });
  }

  return (
    <div
      className="relative h-6 bg-daw-surface border-b border-daw-border overflow-hidden select-none cursor-pointer"
      style={{ width: totalWidth }}
      onClick={handleClick}
    >
      {markers.map(({ bar, x }) => (
        <div
          key={bar}
          className="absolute top-0 h-full flex items-end pb-0.5 text-[10px] text-zinc-500 pointer-events-none"
          style={{ left: x }}
        >
          <div className="w-px h-2 bg-daw-grid-bar mr-1" />
          <span>{bar}</span>
        </div>
      ))}
    </div>
  );
}
