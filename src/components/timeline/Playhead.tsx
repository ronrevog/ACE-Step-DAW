import { useTransportStore } from '../../store/transportStore';
import { useUIStore } from '../../store/uiStore';

export function Playhead() {
  const currentTime = useTransportStore((s) => s.currentTime);
  const pixelsPerSecond = useUIStore((s) => s.pixelsPerSecond);
  const x = currentTime * pixelsPerSecond;

  return (
    <div
      className="absolute top-0 bottom-0 w-px bg-daw-playhead z-20 pointer-events-none"
      style={{ left: x }}
    >
      <div className="absolute -top-0 -left-[4px] w-0 h-0 border-l-[5px] border-r-[5px] border-t-[6px] border-l-transparent border-r-transparent border-t-red-500" />
    </div>
  );
}
