import { BURST_PACKS } from '../../../shared/burstPacks';
import { platformPresets } from '../../platformPresetsData';

interface BurstPackPackListProps {
  selectedPackId: string | null;
  customKeys: string[];
  onSelectPack: (packId: string | null) => void;
  onToggleCustom: (presetKey: string) => void;
}

export default function BurstPackPackList({
  selectedPackId,
  customKeys,
  onSelectPack,
  onToggleCustom,
}: BurstPackPackListProps) {
  return (
    <div className="burst-pack-list">
      <div className="burst-pack-section-label">Curated packs</div>
      {BURST_PACKS.map((pack) => (
        <button
          key={pack.id}
          type="button"
          className={`burst-pack-option ${selectedPackId === pack.id ? 'selected' : ''}`}
          onClick={() => onSelectPack(selectedPackId === pack.id ? null : pack.id)}
        >
          <span className="burst-pack-option-name">{pack.name}</span>
          <span className="burst-pack-option-desc">{pack.description}</span>
          <span className="burst-pack-option-count">{pack.presetKeys.length} variants</span>
        </button>
      ))}

      <div className="burst-pack-section-label">Custom selection</div>
      {selectedPackId && (
        <p className="burst-pack-custom-hint">
          Picking a custom preset switches away from the curated pack.
        </p>
      )}
      <div className="burst-pack-custom-grid">
        {platformPresets
          .filter((p) => p.safeZone || p.width >= 600)
          .slice(0, 12)
          .map((preset) => {
            const key = `${preset.platform} - ${preset.name}`;
            const checked = customKeys.includes(key);
            return (
              <label key={key} className={`burst-pack-custom-item ${checked ? 'checked' : ''}`}>
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => onToggleCustom(key)}
                />
                <span className="burst-pack-custom-label">
                  {preset.platform} — {preset.name}
                </span>
                <span className="burst-pack-custom-size">
                  {preset.width}×{preset.height}
                </span>
              </label>
            );
          })}
      </div>
    </div>
  );
}