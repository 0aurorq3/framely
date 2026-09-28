import { describe, it, expect } from 'vitest';
import { BURST_PACKS, getBurstPackById, resolvePresetKeys } from '../src/shared/burstPacks';

describe('burstPacks', () => {
  it('defines launch and social story kits', () => {
    expect(BURST_PACKS.length).toBeGreaterThanOrEqual(2);
    expect(getBurstPackById('launch-kit')?.presetKeys).toContain('Open Graph - OG Standard');
  });

  it('resolvePresetKeys uses pack when packId is set', () => {
    const keys = resolvePresetKeys('launch-kit', ['Custom - One']);
    expect(keys).toContain('LinkedIn - Shared Link / Ad');
    expect(keys).not.toContain('Custom - One');
  });

  it('resolvePresetKeys dedupes custom keys when no pack selected', () => {
    const keys = resolvePresetKeys(null, ['A - 1', 'A - 1', 'B - 2']);
    expect(keys).toEqual(['A - 1', 'B - 2']);
  });
});