import { describe, it, expect } from 'vitest';
import {
  hexToRgb,
  rgbToHex,
  rgbToHsl,
  hslToRgb,
  lighten,
  darken,
  rotateHue,
  desaturate,
  applyFallbacks,
} from '../src/renderer/utils/colorExtractor';

// ---------------------------------------------------------------------------
// hexToRgb
// ---------------------------------------------------------------------------
describe('hexToRgb', () => {
  it('converts 3-digit hex shorthand', () => {
    expect(hexToRgb('#abc')).toEqual([170, 187, 204]);
  });

  it('converts full 6-digit hex', () => {
    expect(hexToRgb('#ff6600')).toEqual([255, 102, 0]);
  });

  it('converts pure black', () => {
    expect(hexToRgb('#000000')).toEqual([0, 0, 0]);
  });

  it('converts pure white', () => {
    expect(hexToRgb('#ffffff')).toEqual([255, 255, 255]);
  });

  it('handles hex without # prefix', () => {
    expect(hexToRgb('808080')).toEqual([128, 128, 128]);
  });

  it('converts midtone', () => {
    expect(hexToRgb('#4a90d9')).toEqual([74, 144, 217]);
  });
});

// ---------------------------------------------------------------------------
// rgbToHex
// ---------------------------------------------------------------------------
describe('rgbToHex', () => {
  it('round-trips with hexToRgb', () => {
    const hex = '#4a90d9';
    const [r, g, b] = hexToRgb(hex);
    expect(rgbToHex(r, g, b)).toBe('#4a90d9');
  });

  it('clamps values at 0', () => {
    expect(rgbToHex(-10, 100, 200)).toBe('#0064c8');
  });

  it('clamps values at 255', () => {
    expect(rgbToHex(300, 200, 100)).toBe('#ffc864');
  });

  it('rounds float values', () => {
    expect(rgbToHex(127.6, 127.4, 127.5)).toBe('#807f80');
  });

  it('handles pure white', () => {
    expect(rgbToHex(255, 255, 255)).toBe('#ffffff');
  });

  it('handles pure black', () => {
    expect(rgbToHex(0, 0, 0)).toBe('#000000');
  });
});

// ---------------------------------------------------------------------------
// rgbToHsl
// ---------------------------------------------------------------------------
describe('rgbToHsl', () => {
  it('converts white to [0,0,1]', () => {
    const [, s, l] = rgbToHsl(255, 255, 255);
    expect(s).toBe(0);
    expect(l).toBe(1);
  });

  it('converts black to [0,0,0]', () => {
    const [, s, l] = rgbToHsl(0, 0, 0);
    expect(s).toBe(0);
    expect(l).toBe(0);
  });

  it('converts pure red', () => {
    const [h, s, l] = rgbToHsl(255, 0, 0);
    expect(h).toBe(0);
    expect(s).toBe(1);
    expect(l).toBe(0.5);
  });

  it('converts pure green', () => {
    const [h] = rgbToHsl(0, 255, 0);
    expect(h).toBeCloseTo(1 / 3, 5);
  });

  it('converts pure blue', () => {
    const [h] = rgbToHsl(0, 0, 255);
    expect(h).toBeCloseTo(2 / 3, 5);
  });

  it('converts mid-gray', () => {
    const [, s, l] = rgbToHsl(128, 128, 128);
    expect(s).toBe(0);
    expect(l).toBeCloseTo(128 / 255, 5);
  });
});

// ---------------------------------------------------------------------------
// hslToRgb
// ---------------------------------------------------------------------------
describe('hslToRgb', () => {
  it('returns grayscale when saturation is 0', () => {
    const [r, g, b] = hslToRgb(0, 0, 0.5);
    expect(r).toBe(g);
    expect(g).toBe(b);
  });

  it('round-trips with rgbToHsl', () => {
    const [h, s, l] = rgbToHsl(74, 144, 217);
    const [r, g, b] = hslToRgb(h, s, l);
    expect(r).toBeCloseTo(74, -1);
    expect(g).toBeCloseTo(144, -1);
    expect(b).toBeCloseTo(217, -1);
  });

  it('converts known HSL red', () => {
    const [r, g, b] = hslToRgb(0, 1, 0.5);
    expect(r).toBe(255);
    expect(g).toBe(0);
    expect(b).toBe(0);
  });

  it('converts known HSL green', () => {
    const [r, g, b] = hslToRgb(1 / 3, 1, 0.5);
    expect(r).toBe(0);
    expect(g).toBe(255);
    expect(b).toBe(0);
  });

  it('converts known HSL blue', () => {
    const [r, g, b] = hslToRgb(2 / 3, 1, 0.5);
    expect(r).toBe(0);
    expect(g).toBe(0);
    expect(b).toBe(255);
  });
});

// ---------------------------------------------------------------------------
// lighten
// ---------------------------------------------------------------------------
describe('lighten', () => {
  it('increases lightness without exceeding 1.0', () => {
    const original = '#808080';
    const result = lighten(original, 50);
    const [, , lOrig] = rgbToHsl(...hexToRgb(original));
    const [, , lResult] = rgbToHsl(...hexToRgb(result));
    expect(lResult).toBeGreaterThan(lOrig);
    expect(lResult).toBeLessThanOrEqual(1);
  });

  it('clamps at white when over-lightened', () => {
    expect(lighten('#ffffff', 50)).toBe('#ffffff');
  });

  it('lightens a dark color noticeably', () => {
    const result = lighten('#333333', 30);
    const [, , l] = rgbToHsl(...hexToRgb(result));
    expect(l).toBeGreaterThan(0.2);
  });
});

// ---------------------------------------------------------------------------
// darken
// ---------------------------------------------------------------------------
describe('darken', () => {
  it('decreases lightness without going below 0', () => {
    const original = '#808080';
    const result = darken(original, 50);
    const [, , lOrig] = rgbToHsl(...hexToRgb(original));
    const [, , lResult] = rgbToHsl(...hexToRgb(result));
    expect(lResult).toBeLessThan(lOrig);
    expect(lResult).toBeGreaterThanOrEqual(0);
  });

  it('clamps at black when over-darkened', () => {
    expect(darken('#000000', 50)).toBe('#000000');
  });

  it('darkens a bright color noticeably', () => {
    const result = darken('#cccccc', 30);
    const [, , l] = rgbToHsl(...hexToRgb(result));
    expect(l).toBeLessThan(0.8);
  });
});

// ---------------------------------------------------------------------------
// rotateHue
// ---------------------------------------------------------------------------
describe('rotateHue', () => {
  it('wraps from 360° to 0°', () => {
    const [hOrig] = rgbToHsl(...hexToRgb('#ff0000'));
    const [hResult] = rgbToHsl(...hexToRgb(rotateHue('#ff0000', 360)));
    // Red + 360° → still red (h close to 0 or 1)
    expect(Math.abs(hResult - hOrig)).toBeCloseTo(0, 1);
  });

  it('handles negative degree wrap correctly', () => {
    const redHex = '#ff0000';
    const rotated = rotateHue(redHex, -120);
    // Rotating red by -120° should give blue-ish
    const [h] = rgbToHsl(...hexToRgb(rotated));
    expect(h).toBeCloseTo(2 / 3, 1);
  });

  it('preserves saturation and lightness', () => {
    const original = '#4a90d9';
    const [, sOrig, lOrig] = rgbToHsl(...hexToRgb(original));
    const [, sRot, lRot] = rgbToHsl(...hexToRgb(rotateHue(original, 90)));
    expect(sRot).toBeCloseTo(sOrig, 5);
    expect(lRot).toBeCloseTo(lOrig, 5);
  });
});

// ---------------------------------------------------------------------------
// desaturate
// ---------------------------------------------------------------------------
describe('desaturate', () => {
  it('clamps saturation at 0', () => {
    const result = desaturate('#ff0000', 200);
    const [, s] = rgbToHsl(...hexToRgb(result));
    expect(s).toBe(0);
  });

  it('partially desaturates a vivid color', () => {
    const original = '#ff0000';
    const [, sOrig] = rgbToHsl(...hexToRgb(original));
    const [, sResult] = rgbToHsl(...hexToRgb(desaturate(original, 50)));
    expect(sResult).toBeLessThan(sOrig);
    expect(sResult).toBeGreaterThan(0);
  });

  it('preserves hue and lightness', () => {
    const original = '#4a90d9';
    const [hOrig, , lOrig] = rgbToHsl(...hexToRgb(original));
    const [hDesat, , lDesat] = rgbToHsl(...hexToRgb(desaturate(original, 30)));
    expect(hDesat).toBeCloseTo(hOrig, 2);
    expect(lDesat).toBeCloseTo(lOrig, 2);
  });
});

// ---------------------------------------------------------------------------
// applyFallbacks
// ---------------------------------------------------------------------------
describe('applyFallbacks', () => {
  it('fills all 7 fields when all swatches are null', () => {
    const result = applyFallbacks('#6366f1', {
      vibrant: null,
      lightVibrant: null,
      darkVibrant: null,
      muted: null,
      lightMuted: null,
      darkMuted: null,
    });
    expect(result.dominant).toBe('#6366f1');
    expect(result.vibrant).toBeTruthy();
    expect(result.lightVibrant).toBeTruthy();
    expect(result.darkVibrant).toBeTruthy();
    expect(result.muted).toBeTruthy();
    expect(result.lightMuted).toBeTruthy();
    expect(result.darkMuted).toBeTruthy();
    // Every field should be a valid hex color
    Object.values(result).forEach((v) => {
      expect(v).toMatch(/^#[0-9a-f]{6}$/);
    });
  });

  it('uses provided values when available', () => {
    const result = applyFallbacks('#6366f1', {
      vibrant: '#ff0000',
      lightVibrant: null,
      darkVibrant: '#880000',
      muted: null,
      lightMuted: null,
      darkMuted: '#440000',
    });
    expect(result.vibrant).toBe('#ff0000');
    expect(result.darkVibrant).toBe('#880000');
    expect(result.darkMuted).toBe('#440000');
    // Fallback fields should still be filled
    expect(result.lightVibrant).toBeTruthy();
    expect(result.muted).toBeTruthy();
    expect(result.lightMuted).toBeTruthy();
  });

  it('returns originals unchanged when no nulls', () => {
    const swatches = {
      vibrant: '#ff0000',
      lightVibrant: '#ff8888',
      darkVibrant: '#880000',
      muted: '#ffccaa',
      lightMuted: '#eeddcc',
      darkMuted: '#443322',
    };
    const result = applyFallbacks('#6366f1', swatches);
    expect(result.vibrant).toBe('#ff0000');
    expect(result.lightVibrant).toBe('#ff8888');
    expect(result.darkVibrant).toBe('#880000');
    expect(result.muted).toBe('#ffccaa');
    expect(result.lightMuted).toBe('#eeddcc');
    expect(result.darkMuted).toBe('#443322');
  });
});
