import { useTransport } from '../../hooks/useTransport';
import { TimeDisplay } from './TimeDisplay';
import { TempoDisplay } from './TempoDisplay';

export function TransportBar() {
  const { isPlaying, play, pause, stop } = useTransport();

  return (
    <div className="flex items-center h-10 px-3 gap-3 bg-daw-surface border-b border-daw-border">
      <div className="flex items-center gap-1">
        <button
          onClick={stop}
          className="w-8 h-8 flex items-center justify-center rounded hover:bg-daw-surface-2 transition-colors"
          title="Stop"
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
            <rect width="12" height="12" rx="1" />
          </svg>
        </button>
        <button
          onClick={() => isPlaying ? pause() : play()}
          className={`w-8 h-8 flex items-center justify-center rounded transition-colors ${
            isPlaying ? 'bg-daw-accent text-white' : 'hover:bg-daw-surface-2'
          }`}
          title={isPlaying ? 'Pause' : 'Play'}
        >
          {isPlaying ? (
            <svg width="12" height="14" viewBox="0 0 12 14" fill="currentColor">
              <rect width="4" height="14" rx="1" />
              <rect x="8" width="4" height="14" rx="1" />
            </svg>
          ) : (
            <svg width="12" height="14" viewBox="0 0 12 14" fill="currentColor">
              <path d="M0 0L12 7L0 14V0Z" />
            </svg>
          )}
        </button>
      </div>

      <div className="w-px h-6 bg-daw-border" />

      <TimeDisplay />

      <div className="w-px h-6 bg-daw-border" />

      <TempoDisplay />
    </div>
  );
}
