import { useTransportStore } from '../../store/transportStore';
import { useProjectStore } from '../../store/projectStore';
import { formatTime, formatBarsBeats } from '../../utils/time';

export function TimeDisplay() {
  const currentTime = useTransportStore((s) => s.currentTime);
  const project = useProjectStore((s) => s.project);

  const barsBeats = project
    ? formatBarsBeats(currentTime, project.bpm, project.timeSignature)
    : '1.1.00';

  return (
    <div className="text-lg font-bold tracking-wider tabular-nums">
      {formatTime(currentTime)}
    </div>
  );
}
