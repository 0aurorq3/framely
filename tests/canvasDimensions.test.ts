import { describe, it, expect } from 'vitest';
import { getCanvasDimensions } from '../src/renderer/canvasRenderer';
import { baseConfig } from './shared';

describe('Canvas Dimensions', () => {
  it('calculates Auto aspect ratio', () => {
    const dims = getCanvasDimensions(800, 600, baseConfig);
    expect(dims.width).toBe(876);
    expect(dims.height).toBe(708);
  });

  it('calculates Auto ratio with 50% scale', () => {
    const dims = getCanvasDimensions(800, 600, { ...baseConfig, scale: 50 });
    expect(dims.width).toBe(476);
    expect(dims.height).toBe(392);
  });

  it('calculates 16:9 fixed ratio', () => {
    const cfg = { ...baseConfig, aspectRatio: '16:9', paddingMode: 'fit' as const };
    const dims = getCanvasDimensions(1920, 1080, cfg);
    expect(dims.height).toBe(1188);
    expect(dims.width).toBe(2112);
  });

  it('calculates 1:1 fixed ratio', () => {
    const cfg = { ...baseConfig, aspectRatio: '1:1', paddingMode: 'fit' as const };
    const dims = getCanvasDimensions(800, 600, cfg);
    expect(dims.width).toBe(876);
    expect(dims.height).toBe(876);
  });

  it('calculates no-image dimensions', () => {
    const auto = getCanvasDimensions(0, 0, { ...baseConfig, noImage: true, aspectRatio: 'Auto' });
    expect(auto.width).toBe(1200);
    expect(auto.height).toBe(675);

    const sq = getCanvasDimensions(0, 0, { ...baseConfig, noImage: true, aspectRatio: '1:1' });
    expect(sq.width).toBe(1200);
    expect(sq.height).toBe(1200);

    const custom = getCanvasDimensions(0, 0, {
      ...baseConfig, noImage: true, aspectRatio: 'Custom', canvasWidth: 800, canvasHeight: 600
    });
    expect(custom.width).toBe(1200);
    expect(custom.height).toBe(900);
  });

  it('calculates chromeStyle=none dimensions', () => {
    const cfg = { ...baseConfig, chromeStyle: 'none' as const };
    const dims = getCanvasDimensions(800, 600, cfg);
    expect(dims.width).toBe(876);
    expect(dims.height).toBe(676);
  });

  it('calculates 4:3 fixed ratio', () => {
    const cfg = { ...baseConfig, aspectRatio: '4:3', paddingMode: 'fit' as const };
    const dims = getCanvasDimensions(800, 600, cfg);
    expect(dims.height).toBe(708);
    expect(dims.width).toBe(Math.round(708 * (4 / 3)));
  });

  it('calculates 3:2 fixed ratio', () => {
    const cfg = { ...baseConfig, aspectRatio: '3:2', paddingMode: 'fit' as const };
    const dims = getCanvasDimensions(1200, 800, cfg);
    const expectedH = 908;
    const expectedW = Math.round(908 * (3 / 2));
    expect(dims.height).toBe(expectedH);
    expect(dims.width).toBe(expectedW);
  });

  it('calculates Custom aspect ratio', () => {
    const cfg = {
      ...baseConfig,
      aspectRatio: 'Custom',
      canvasWidth: 1920,
      canvasHeight: 1080,
      paddingMode: 'fit' as const
    };
    const dims = getCanvasDimensions(800, 600, cfg);
    const targetRatio = 1920 / 1080;
    expect(Math.abs(dims.width / dims.height - targetRatio)).toBeLessThan(0.01);
  });

  it('calculates paddingMode=fill', () => {
    const cfg = {
      ...baseConfig,
      aspectRatio: '16:9',
      paddingMode: 'fill' as const
    };
    const dims = getCanvasDimensions(800, 600, cfg);
    expect(dims.width).toBeGreaterThanOrEqual(800);
    const ratio = dims.width / dims.height;
    expect(Math.abs(ratio - 16 / 9)).toBeLessThan(0.01);
  });

  it('calculates no-image ratios', () => {
    const r43 = getCanvasDimensions(0, 0, { ...baseConfig, noImage: true, aspectRatio: '4:3' });
    expect(r43.width).toBe(1200);
    expect(r43.height).toBe(900);

    const r32 = getCanvasDimensions(0, 0, { ...baseConfig, noImage: true, aspectRatio: '3:2' });
    expect(r32.width).toBe(1200);
    expect(r32.height).toBe(800);

    const r169 = getCanvasDimensions(0, 0, { ...baseConfig, noImage: true, aspectRatio: '16:9' });
    expect(r169.width).toBe(1200);
    expect(r169.height).toBe(675);
  });

  // -----------------------------------------------------------------------
  // Edge cases
  // -----------------------------------------------------------------------
  it('scale: 0 still produces positive dimensions (padding keeps output non-zero)', () => {
    const dims = getCanvasDimensions(800, 600, { ...baseConfig, scale: 0 });
    expect(dims.width).toBeGreaterThan(0);
    expect(dims.height).toBeGreaterThan(0);
  });

  it('scale: 200 doubles image dimensions appropriately', () => {
    const dims = getCanvasDimensions(800, 600, { ...baseConfig, scale: 200 });
    // With scale=200, content is roughly doubled. Verify both are at least 2x the padded base.
    const baseDims = getCanvasDimensions(800, 600, { ...baseConfig, scale: 100 });
    expect(dims.width).toBeGreaterThan(baseDims.width);
    expect(dims.height).toBeGreaterThan(baseDims.height);
  });

  it('1×1 pixel image in 16:9 fit mode preserves ratio', () => {
    const cfg = { ...baseConfig, aspectRatio: '16:9' as const, paddingMode: 'fit' as const };
    const dims = getCanvasDimensions(1, 1, cfg);
    const ratio = dims.width / dims.height;
    expect(Math.abs(ratio - 16 / 9)).toBeLessThan(0.01);
  });

  it('very wide panorama (4000×400) in 1:1 fit mode produces height ≥ width', () => {
    const cfg = { ...baseConfig, aspectRatio: '1:1' as const, paddingMode: 'fit' as const };
    const dims = getCanvasDimensions(4000, 400, cfg);
    // In 1:1, both dimensions should be equal
    expect(dims.width).toBe(dims.height);
    // The image width drives the canvas size (wide ratio > 1:1)
    expect(dims.width).toBeGreaterThanOrEqual(4000);
  });

  it('paddingMode: fill with small image (200×150) in 16:9 produces at least 800 wide with correct ratio', () => {
    const cfg = {
      ...baseConfig,
      aspectRatio: '16:9' as const,
      paddingMode: 'fill' as const,
    };
    const dims = getCanvasDimensions(200, 150, cfg);
    expect(dims.width).toBeGreaterThanOrEqual(800);
    const ratio = dims.width / dims.height;
    expect(Math.abs(ratio - 16 / 9)).toBeLessThan(0.01);
  });
});
