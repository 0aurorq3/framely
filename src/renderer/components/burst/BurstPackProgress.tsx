import type { BurstPackPhase } from '../../hooks/useBurstPack';

interface BurstPackProgressProps {
  phase: BurstPackPhase;
  current: number;
  total: number;
}

export default function BurstPackProgress({ phase, current, total }: BurstPackProgressProps) {
  if (phase === 'idle' || phase === 'done') return null;

  const label =
    phase === 'rendering'
      ? `Rendering variants (${current}/${total})…`
      : 'Saving Burst Pack to the selected folder…';

  const pct = total > 0 ? Math.round((current / total) * 100) : 0;

  return (
    <div className="burst-pack-progress" data-testid="burst-pack-progress">
      <span className="burst-pack-progress-label">{label}</span>
      {phase === 'rendering' && total > 0 && (
        <div className="burst-pack-progress-bar">
          <div className="burst-pack-progress-fill" style={{ width: `${pct}%` }} />
        </div>
      )}
    </div>
  );
}
