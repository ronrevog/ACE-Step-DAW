import { useProjectStore } from '../../store/projectStore';

export function TempoDisplay() {
  const project = useProjectStore((s) => s.project);

  if (!project) return null;

  return (
    <div className="flex items-center gap-2 text-xs">
      <span className="opacity-40 uppercase font-bold tracking-[0.15em]">BPM</span>
      <span className="font-bold text-white">{project.bpm.toFixed(2)}</span>
    </div>
  );
}
