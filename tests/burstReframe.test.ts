import { describe, it, expect } from 'vitest';
import { computeBurstConfigPatch, collectOgWarnings } from '../src/shared/burstReframe';

describe('burstReframe', () => {
  it('fits content inside OG safe zone by reducing scale', () => {
    const { patch, warnings } = computeBurstConfigPatch(
      { padding: 60, scale: 100, chromeStyle: 'mac' },
      1400,
      900,
      {
        platform: 'Open Graph',
        name: 'OG Standard',
        width: 1200,
        height: 630,
        safeZone: { width: 1200, height: 576 },
      }
    );

    expect(patch.canvasWidth).toBe(1200);
    expect(patch.canvasHeight).toBe(630);
    expect(patch.forceCanvasSize).toEqual({ width: 1200, height: 630 });
    expect(patch.scale).toBeLessThan(100);
    expect(warnings).toEqual([]);
  });

  it('warns when content cannot fit even at minimum scale', () => {
    const { warnings } = computeBurstConfigPatch(
      { padding: 80, scale: 100, chromeStyle: 'none' },
      4000,
      3000,
      {
        platform: 'Product Hunt',
        name: 'Thumbnail',
        width: 240,
        height: 240,
      }
    );

    expect(warnings.length).toBeGreaterThan(0);
  });

  it('collectOgWarnings flags large OG files', () => {
    const warnings = collectOgWarnings('Open Graph - OG Standard', 450);
    expect(warnings.some((w) => w.includes('300KB'))).toBe(true);
  });
});