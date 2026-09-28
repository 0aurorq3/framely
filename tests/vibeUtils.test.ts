import { describe, it, expect } from 'vitest';
import {
  getRelativeLuminance,
  getIdealChromeTheme,
  generateVibeConfigs,
} from '../src/renderer/utils/vibeUtils';
import type { VibePalette } from '../src/renderer/utils/colorExtractor';

// ---------------------------------------------------------------------------
// helpers
// ---------------------------------------------------------------------------
function makePalette(dominant: string): VibePalette {
  return {
    dominant,
    vibrant: '#ff6b6b',
    lightVibrant: '#ffaaaa',
    darkVibrant: '#cc0000',
    muted: '#d4a0a0',
    lightMuted: '#f0d0d0',
    darkMuted: '#884444',
  };
}

// ---------------------------------------------------------------------------
// getRelativeLuminance
// ---------------------------------------------------------------------------
describe('getRelativeLuminance', () => {
  it('returns 1.0 for pure white', () => {
    expect(getRelativeLuminance('#ffffff')).toBeCloseTo(1.0, 3);
  });

  it('returns 0.0 for pure black', () => {
    expect(getRelativeLuminance('#000000')).toBeCloseTo(0.0, 3);
  });

  it('returns ~0.216 for #808080 (mid-gray)', () => {
    expect(getRelativeLuminance('#808080')).toBeCloseTo(0.216, 2);
  });

  it('returns known WCAG value for red', () => {
    // #ff0000 → linear R ≈ 0.2126, G=0, B=0 → luminance ≈ 0.2126
    const red = getRelativeLuminance('#ff0000');
    expect(red).toBeCloseTo(0.2126, 2);
  });

  it('returns known WCAG value for blue', () => {
    // #0000ff → linear B ≈ 0.0722 → luminance ≈ 0.0722
    const blue = getRelativeLuminance('#0000ff');
    expect(blue).toBeCloseTo(0.0722, 1);
  });
});

// ---------------------------------------------------------------------------
// getIdealChromeTheme
// ---------------------------------------------------------------------------
describe('getIdealChromeTheme', () => {
  it("returns 'dark' for bright colors (luminance > 0.179)", () => {
    expect(getIdealChromeTheme('#ffffff')).toBe('dark');
    expect(getIdealChromeTheme('#ffcc00')).toBe('dark');
  });

  it("returns 'light' for dark colors (luminance ≤ 0.179)", () => {
    expect(getIdealChromeTheme('#000000')).toBe('light');
    expect(getIdealChromeTheme('#1a1a2e')).toBe('light');
  });

  it('returns light for a boundary-adjacent dark color', () => {
    // #333333 → luminance ≈ 0.028, well under 0.179
    expect(getIdealChromeTheme('#333333')).toBe('light');
  });
});

// ---------------------------------------------------------------------------
// generateVibeConfigs
// ---------------------------------------------------------------------------
describe('generateVibeConfigs', () => {
  const palette = makePalette('#6366f1');

  it('returns exactly 4 variants', () => {
    const configs = generateVibeConfigs(palette);
    expect(configs).toHaveLength(4);
  });

  it('each variant has all required fields', () => {
    const configs = generateVibeConfigs(palette);
    for (const c of configs) {
      expect(c).toHaveProperty('backgroundType');
      expect(c).toHaveProperty('shadowColor');
      expect(c).toHaveProperty('chromeTheme');
      expect(c).toHaveProperty('annotationColor');
      expect(['mesh', 'gradient']).toContain(c.backgroundType);
      expect(['dark', 'light']).toContain(c.chromeTheme);
    }
  });

  it('mesh variants have meshColors with 4 entries', () => {
    const configs = generateVibeConfigs(palette);
    const meshVariants = configs.filter((c) => c.backgroundType === 'mesh');
    expect(meshVariants).toHaveLength(3);
    for (const c of meshVariants) {
      expect(c.meshColors).toHaveLength(4);
    }
  });

  it('gradient variant has backgroundValue but no meshColors', () => {
    const configs = generateVibeConfigs(palette);
    const gradient = configs.find((c) => c.backgroundType === 'gradient');
    expect(gradient).toBeDefined();
    expect(gradient!.backgroundValue).toBeDefined();
    expect(gradient!.meshColors).toBeUndefined();
  });

  it('mesh variants do NOT have backgroundValue', () => {
    const configs = generateVibeConfigs(palette);
    const meshVariants = configs.filter((c) => c.backgroundType === 'mesh');
    for (const c of meshVariants) {
      expect(c.backgroundValue).toBeUndefined();
    }
  });
});
