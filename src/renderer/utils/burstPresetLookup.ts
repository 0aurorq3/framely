import { platformPresets } from '../platformPresetsData';
import type { BurstPreset } from '../../shared/burstReframe';

export function findPresetByKey(presetKey: string): BurstPreset | undefined {
  const preset = platformPresets.find((p) => `${p.platform} - ${p.name}` === presetKey);
  if (!preset) return undefined;
  return {
    platform: preset.platform,
    name: preset.name,
    width: preset.width,
    height: preset.height,
    safeZone: preset.safeZone,
  };
}