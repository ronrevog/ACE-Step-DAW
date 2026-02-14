import { useProjectStore } from '../../store/projectStore';

export function TempoDisplay() {
  const project = useProjectStore((s) => s.project);

  if (!project) return null;

  return (
    <div className="flex items-center gap-2 text-xs text-zinc-400">
      <span className="font-medium text-zinc-300">{project.bpm} BPM</span>
      <span>{project.keyScale}</span>
      <span>{project.timeSignature}/4</span>
    </div>
  );
}
