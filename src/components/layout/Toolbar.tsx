import { useProjectStore } from '../../store/projectStore';
import { useUIStore } from '../../store/uiStore';
import { useTransport } from '../../hooks/useTransport';
import { useTransportStore } from '../../store/transportStore';
import { TimeDisplay } from '../transport/TimeDisplay';
import { TempoDisplay } from '../transport/TempoDisplay';
import type { ActiveTab } from '../../store/uiStore';

export function Toolbar() {
  const project = useProjectStore((s) => s.project);
  const activeTab = useUIStore((s) => s.activeTab);
  const setActiveTab = useUIStore((s) => s.setActiveTab);
  const setShowNewProjectDialog = useUIStore((s) => s.setShowNewProjectDialog);
  const setShowSettingsDialog = useUIStore((s) => s.setShowSettingsDialog);
  const setShowExportDialog = useUIStore((s) => s.setShowExportDialog);
  const setShowProjectListDialog = useUIStore((s) => s.setShowProjectListDialog);
  const { isPlaying, play, pause, stop } = useTransport();
  const loopEnabled = useTransportStore((s) => s.loopEnabled);
  const toggleLoop = useTransportStore((s) => s.toggleLoop);

  const tabs: { id: ActiveTab; label: string; icon: string }[] = [
    { id: 'composer', label: 'Composer', icon: 'auto_awesome' },
    { id: 'daw', label: 'DAW', icon: 'tune' },
  ];

  return (
    <header className="h-14 border-b border-daw-border bg-daw-panel flex items-center justify-between px-4 z-50 shrink-0">
      {/* Left section: Logo + Actions + Tabs */}
      <div className="flex items-center gap-4">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="logo-box">
            <div>COM<br />PLEX</div>
          </div>
          <span className="text-xl font-bold tracking-[-0.04em] uppercase text-white" style={{ fontFamily: "'Roboto Condensed', sans-serif" }}>
            COMPOSER
          </span>
        </div>

        <div className="h-5 w-px bg-white/10" />

        {/* Action buttons */}
        <div className="flex items-center gap-1.5 text-[10px] uppercase font-semibold tracking-wider text-slate-500">
          <button
            onClick={() => setShowProjectListDialog(true)}
            className="px-2 py-1 bg-black/20 border border-daw-border rounded hover:text-slate-300 transition-colors"
          >
            Projects
          </button>
          <button
            onClick={() => setShowNewProjectDialog(true)}
            className="px-2 py-1 bg-black/20 border border-daw-border rounded hover:text-slate-300 transition-colors"
          >
            New
          </button>
          <button
            onClick={() => setShowExportDialog(true)}
            className="px-2 py-1 bg-black/20 border border-daw-border rounded hover:text-slate-300 transition-colors"
            disabled={!project}
          >
            Export
          </button>
          <button
            onClick={() => setShowSettingsDialog(true)}
            className="px-2 py-1 bg-black/20 border border-daw-border rounded hover:text-slate-300 transition-colors"
          >
            Settings
          </button>
        </div>

        <div className="h-5 w-px bg-white/10" />

        {/* Tab switcher */}
        <div className="flex items-center bg-black/20 border border-daw-border rounded p-0.5 gap-0.5">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.1em] rounded transition-colors ${activeTab === tab.id
                ? 'bg-daw-accent text-white'
                : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'
                }`}
            >
              <span className="material-symbols-outlined text-sm">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Right section: Transport + Time */}
      <div className="flex items-center gap-4">
        {/* Transport Controls */}
        <div className="flex items-center gap-0.5 bg-black/30 p-1 rounded border border-daw-border">
          <button
            onClick={stop}
            className="w-8 h-8 flex items-center justify-center hover:bg-white/5 rounded transition-colors"
            title="Stop"
          >
            <span className="material-symbols-outlined text-lg">stop</span>
          </button>
          <button
            onClick={() => isPlaying ? pause() : play()}
            className={`w-10 h-8 flex items-center justify-center rounded transition-colors ${isPlaying ? 'bg-white/10 text-daw-accent' : 'hover:bg-white/5 text-daw-accent'}`}
            title={isPlaying ? 'Pause' : 'Play'}
          >
            <span className="material-symbols-outlined text-xl">
              {isPlaying ? 'pause' : 'play_arrow'}
            </span>
          </button>
          <button
            onClick={toggleLoop}
            className={`w-8 h-8 flex items-center justify-center rounded transition-colors ${loopEnabled ? 'text-daw-accent' : 'hover:bg-white/5 text-slate-500'}`}
            title={loopEnabled ? 'Loop On' : 'Loop Off'}
          >
            <span className="material-symbols-outlined text-lg">loop</span>
          </button>
        </div>

        {/* Time / BPM Display */}
        <div className="hidden lg:flex items-center gap-4 bg-black/40 border border-daw-border px-4 h-9 rounded font-mono text-daw-accent">
          <TimeDisplay />
          <div className="h-3 w-px bg-white/10" />
          <TempoDisplay />
        </div>
      </div>
    </header>
  );
}
