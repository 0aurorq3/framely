import { describe, it, expect } from 'vitest';
import {
  hexToRgb, rgbToHex, rgbToHsl, hslToRgb,
  lighten, darken, rotateHue, desaturate,
  applyFallbacks,
} from '../src/renderer/utils/colorExtractor';
import { getRelativeLuminance, getIdealChromeTheme, generateVibeConfigs } from '../src/renderer/utils/vibeUtils';

// colorExtractor is not exported, expose via re-export trick in test only
// We test applyFallbacks via a named export added below

describe('hexToRgb / rgbToHex round-trip', () => {
  it('converts white correctly', () => {
    expect(hexToRgb('#ffffff')).toEqual([255, 255, 255]);
    expect(rgbToHex(255, 255, 255)).toBe('#ffffff');
  });

  it('converts black correctly', () => {
    expect(hexToRgb('#000000')).toEqual([0, 0, 0]);
    expect(rgbToHex(0, 0, 0)).toBe('#000000');
  });

  it('round-trips an arbitrary color', () => {
    const [r, g, b] = hexToRgb('#a034bc');
    expect(rgbToHex(r, g, b)).toBe('#a034bc');
  });
});

describe('rgbToHsl / hslToRgb', () => {
  it('pure red maps to hue 0', () => {
    const [h, s, l] = rgbToHsl(255, 0, 0);
    expect(h).toBeCloseTo(0, 2);
    expect(s).toBeCloseTo(1, 2);
    expect(l).toBeCloseTo(0.5, 2);
  });

  it('gray has zero saturation', () => {
    const [, s] = rgbToHsl(128, 128, 128);
    expect(s).toBeCloseTo(0, 2);
  });

  it('hslToRgb inverts rgbToHsl', () => {
    const [r0, g0, b0] = [200, 100, 50];
    const [h, s, l] = rgbToHsl(r0, g0, b0);
    const [r1, g1, b1] = hslToRgb(h, s, l);
    expect(Math.abs(r1 - r0)).toBeLessThanOrEqual(1);
    expect(Math.abs(g1 - g0)).toBeLessThanOrEqual(1);
    expect(Math.abs(b1 - b0)).toBeLessThanOrEqual(1);
  });
});

describe('lighten / darken', () => {
  it('lighten increases perceived lightness', () => {
    const orig = '#3b3b8a';
    const lit = lighten(orig, 20);
    const [,,lo] = rgbToHsl(...hexToRgb(orig));
    const [,,ll] = rgbToHsl(...hexToRgb(lit));
    expect(ll).toBeGreaterThan(lo);
  });

  it('darken clamps to pure black when amount is very large', () => {
    expect(darken('#aaaaaa', 200)).toBe('#000000');
  });

  it('lighten clamps to pure white when amount is very large', () => {
    expect(lighten('#aaaaaa', 200)).toBe('#ffffff');
  });
});

describe('rotateHue', () => {
  it('rotating by 0 returns same color', () => {
    expect(rotateHue('#ff6633', 0)).toBe('#ff6633');
  });

  it('rotating by 360 returns same color', () => {
    expect(rotateHue('#ff6633', 360)).toBe('#ff6633');
  });

  it('rotating by 180 gives complementary hue', () => {
    const orig = '#ff0000'; // red, h=0
    const comp = rotateHue(orig, 180);
    const [h] = rgbToHsl(...hexToRgb(comp));
    expect(h).toBeCloseTo(0.5, 1); // cyan
  });
});

describe('desaturate', () => {
  it('reduces saturation', () => {
    const orig = '#ff6600';
    const desat = desaturate(orig, 50);
    const [, s0] = rgbToHsl(...hexToRgb(orig));
    const [, s1] = rgbToHsl(...hexToRgb(desat));
    expect(s1).toBeLessThan(s0);
  });
});

describe('applyFallbacks', () => {
  it('produces all 7 palette keys', () => {
    const palette = applyFallbacks('#6366f1', { vibrant: null, lightVibrant: null, darkVibrant: null, muted: null, lightMuted: null, darkMuted: null });
    expect(Object.keys(palette)).toEqual(['dominant', 'vibrant', 'lightVibrant', 'darkVibrant', 'muted', 'lightMuted', 'darkMuted']);
  });

  it('keeps provided swatches', () => {
    const palette = applyFallbacks('#ff0000', { vibrant: '#00ff00', lightVibrant: null, darkVibrant: null, muted: null, lightMuted: null, darkMuted: null });
    expect(palette.vibrant).toBe('#00ff00');
  });

  it('does not return NaN-containing hex strings', () => {
    const palette = applyFallbacks('#808080', { vibrant: null, lightVibrant: null, darkVibrant: null, muted: null, lightMuted: null, darkMuted: null });
    for (const v of Object.values(palette)) {
      expect(v).toMatch(/^#[0-9a-f]{6}$/);
    }
  });
});

describe('getRelativeLuminance', () => {
  it('white has luminance 1', () => {
    expect(getRelativeLuminance('#ffffff')).toBeCloseTo(1, 3);
  });

  it('black has luminance 0', () => {
    expect(getRelativeLuminance('#000000')).toBeCloseTo(0, 3);
  });

  it('mid-gray is between 0 and 1', () => {
    const l = getRelativeLuminance('#808080');
    expect(l).toBeGreaterThan(0);
    expect(l).toBeLessThan(1);
  });
});

describe('getIdealChromeTheme', () => {
  it('white background -> dark chrome', () => {
    expect(getIdealChromeTheme('#ffffff')).toBe('dark');
  });

  it('black background -> light chrome', () => {
    expect(getIdealChromeTheme('#000000')).toBe('light');
  });
});

describe('generateVibeConfigs', () => {
  const palette = {
    dominant: '#4a3a8c',
    vibrant: '#7c3aed',
    lightVibrant: '#a78bfa',
    darkVibrant: '#3730a3',
    muted: '#6b7280',
    lightMuted: '#9ca3af',
    darkMuted: '#374151',
  };

  it('returns exactly 4 variants', () => {
    expect(generateVibeConfigs(palette)).toHaveLength(4);
  });

  it('variants 0-2 use mesh background type', () => {
    const configs = generateVibeConfigs(palette);
    expect(configs[0].backgroundType).toBe('mesh');
    expect(configs[1].backgroundType).toBe('mesh');
    expect(configs[2].backgroundType).toBe('mesh');
  });

  it('variant 3 uses gradient background type', () => {
    const configs = generateVibeConfigs(palette);
    expect(configs[3].backgroundType).toBe('gradient');
    expect(configs[3].backgroundValue).toMatch(/linear-gradient/);
  });

  it('each mesh variant has exactly 4 mesh colors', () => {
    const configs = generateVibeConfigs(palette);
    for (let i = 0; i < 3; i++) {
      expect(configs[i].meshColors).toHaveLength(4);
    }
  });

  it('chromeTheme is either dark or light for all variants', () => {
    const configs = generateVibeConfigs(palette);
    for (const v of configs) {
      expect(['dark', 'light']).toContain(v.chromeTheme);
    }
  });

  it('annotationColor is a valid hex string', () => {
    const configs = generateVibeConfigs(palette);
    for (const v of configs) {
      expect(v.annotationColor).toMatch(/^#[0-9a-f]{6}$/i);
    }
  });
});
