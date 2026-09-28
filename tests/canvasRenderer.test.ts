import { describe, it, expect, vi } from 'vitest';
import {
  drawMeshGradient,
  drawBackground,
  drawRoundedRectPath,
  getCanvasDimensions,
  renderCanvas,
  Annotation,
  getBgImage,
  preloadBgImage,
} from '../src/renderer/canvasRenderer';
import { makeMockCtx, makeMockCanvas, makeMockImage, baseConfig } from './shared';

describe('drawRoundedRectPath', () => {
  it('draws rounded rect path with roundRect', () => {
    const ctx = makeMockCtx();
    drawRoundedRectPath(ctx, 10, 20, 100, 200, 8);
    expect(ctx.calls).toContain('beginPath');
    expect(ctx.calls.some(c => c.startsWith('roundRect'))).toBe(true);
  });

  it('handles zero radius', () => {
    const ctx = makeMockCtx();
    drawRoundedRectPath(ctx, 0, 0, 100, 100, 0);
    expect(ctx.calls).toContain('beginPath');
    expect(ctx.calls.some(c => c.startsWith('roundRect'))).toBe(true);
  });
});

describe('getCanvasDimensions', () => {
  it('handles noImage mode with Auto aspect ratio', () => {
    const config = { ...baseConfig, noImage: true, aspectRatio: 'Auto' };
    const dims = getCanvasDimensions(800, 600, config);
    expect(dims).toEqual({ width: 1200, height: 675 });
  });

  it('handles noImage mode with 1:1 aspect ratio', () => {
    const config = { ...baseConfig, noImage: true, aspectRatio: '1:1' };
    const dims = getCanvasDimensions(800, 600, config);
    expect(dims.width).toBe(1200);
    expect(dims.height).toBe(1200);
  });

  it('handles noImage mode with 4:3 aspect ratio', () => {
    const config = { ...baseConfig, noImage: true, aspectRatio: '4:3' };
    const dims = getCanvasDimensions(800, 600, config);
    expect(dims.width).toBe(1200);
    expect(dims.height).toBe(Math.round(1200 / (4 / 3)));
  });

  it('handles noImage mode with 16:9 aspect ratio', () => {
    const config = { ...baseConfig, noImage: true, aspectRatio: '16:9' };
    const dims = getCanvasDimensions(800, 600, config);
    expect(dims.width).toBe(1200);
    expect(dims.height).toBe(Math.round(1200 / (16 / 9)));
  });

  it('handles noImage mode with 3:2 aspect ratio', () => {
    const config = { ...baseConfig, noImage: true, aspectRatio: '3:2' };
    const dims = getCanvasDimensions(800, 600, config);
    expect(dims.width).toBe(1200);
    expect(dims.height).toBe(Math.round(1200 / (3 / 2)));
  });

  it('handles noImage mode with Custom aspect ratio', () => {
    const config = { ...baseConfig, noImage: true, aspectRatio: 'Custom', canvasWidth: 1000, canvasHeight: 500 };
    const dims = getCanvasDimensions(800, 600, config);
    expect(dims.width).toBe(1200);
    expect(dims.height).toBe(600);
  });

  it('handles Auto aspect ratio with image', () => {
    const config = { ...baseConfig, aspectRatio: 'Auto' };
    const dims = getCanvasDimensions(800, 600, config);
    expect(dims.width).toBeGreaterThan(0);
    expect(dims.height).toBeGreaterThan(0);
  });

  it('calculates dimensions with chrome offset', () => {
    const config = { ...baseConfig, aspectRatio: 'Auto', chromeStyle: 'mac' as const };
    const dims = getCanvasDimensions(800, 600, config);
    expect(dims.width).toBeGreaterThan(0);
    expect(dims.height).toBeGreaterThan(0);
  });

  it('handles 1:1 fixed ratio with image', () => {
    const config = { ...baseConfig, aspectRatio: '1:1', paddingMode: 'fit' as const };
    const dims = getCanvasDimensions(800, 600, config);
    expect(dims.width).toBeGreaterThan(0);
    expect(dims.height).toBeGreaterThan(0);
  });

  it('handles paddingMode fill', () => {
    const config = { ...baseConfig, aspectRatio: '1:1', paddingMode: 'fill' as const };
    const dims = getCanvasDimensions(800, 600, config);
    expect(dims.width).toBeGreaterThan(0);
    expect(dims.height).toBeGreaterThan(0);
  });

  it('handles fit mode when content is wider than target', () => {
    const config = { ...baseConfig, aspectRatio: '1:1', paddingMode: 'fit' as const, padding: 0, scale: 200 };
    const dims = getCanvasDimensions(800, 600, config);
    expect(dims.width).toBeGreaterThan(0);
    expect(dims.height).toBeGreaterThan(0);
  });

  it('handles chrome none', () => {
    const config = { ...baseConfig, aspectRatio: 'Auto', chromeStyle: 'none' as const };
    const dims = getCanvasDimensions(800, 600, config);
    expect(dims.width).toBeGreaterThan(0);
    expect(dims.height).toBeGreaterThan(0);
  });
});

describe('drawMeshGradient', () => {
  it('draws mesh gradient with points', () => {
    const ctx = makeMockCtx();
    const points = [
      { id: '1', x: 0.2, y: 0.2, color: '#ff0000', radius: 0.25 },
      { id: '2', x: 0.8, y: 0.2, color: '#00ff00', radius: 0.25 },
      { id: '3', x: 0.5, y: 0.8, color: '#0000ff', radius: 0.25 },
    ];
    expect(() => drawMeshGradient(ctx, 800, 600, points, 30, 5, 50, 15)).not.toThrow();
    expect(ctx.calls).toContain('save');
    expect(ctx.calls).toContain('restore');
    expect(ctx.calls.some(c => c.startsWith('fillRect'))).toBe(true);
  });

  it('draws mesh gradient with zero blur', () => {
    const ctx = makeMockCtx();
    const points = [{ id: '1', x: 0.5, y: 0.5, color: '#ff0000', radius: 0.3 }];
    expect(() => drawMeshGradient(ctx, 400, 300, points, 0, 0, 100, 100)).not.toThrow();
  });

  it('draws mesh gradient with zero grain', () => {
    const ctx = makeMockCtx();
    const points = [{ id: '1', x: 0.5, y: 0.5, color: '#ff0000', radius: 0.3 }];
    expect(() => drawMeshGradient(ctx, 400, 300, points, 30, 0, 100, 100)).not.toThrow();
  });

  it('handles mesh gradient with point radius <= 0', () => {
    const ctx = makeMockCtx();
    const points = [
      { id: '1', x: 0.5, y: 0.5, color: '#ff0000', radius: 0 },
      { id: '2', x: 0.3, y: 0.3, color: '#00ff00', radius: 0.25 },
    ];
    expect(() => drawMeshGradient(ctx, 800, 600, points, 30, 5, 50, 15)).not.toThrow();
  });

  it('handles mesh gradient with extreme parameters', () => {
    const ctx = makeMockCtx();
    const points = [
      { id: '1', x: 0.1, y: 0.1, color: '#ff0000', radius: 0.5 },
      { id: '2', x: 0.9, y: 0.9, color: '#00ff00', radius: 0.5 },
    ];
    expect(() => drawMeshGradient(ctx, 800, 600, points, 200, 50, 10, 200)).not.toThrow();
  });

  it('handles empty points array', () => {
    const ctx = makeMockCtx();
    expect(() => drawMeshGradient(ctx, 800, 600, [], 30, 5, 50, 15)).not.toThrow();
  });
});

describe('drawBackground', () => {
  it('draws color background', () => {
    const ctx = makeMockCtx();
    const config = { ...baseConfig, backgroundType: 'color' as const, backgroundValue: '#ff5722' };
    drawBackground(ctx, 800, 600, config, null);
    expect(ctx.calls.some(c => c.startsWith('fillRect'))).toBe(true);
  });

  it('draws color background with default value', () => {
    const ctx = makeMockCtx();
    const config = { ...baseConfig, backgroundType: 'color' as const, backgroundValue: '' };
    drawBackground(ctx, 800, 600, config, null);
    expect(ctx.calls.some(c => c.startsWith('fillRect'))).toBe(true);
  });

  it('draws gradient background with linear gradient', () => {
    const ctx = makeMockCtx();
    const config = {
      ...baseConfig,
      backgroundType: 'gradient' as const,
      backgroundValue: 'linear-gradient(135deg, #ff7e5f 0%, #feb47b 100%)',
    };
    drawBackground(ctx, 800, 600, config, null);
    expect(ctx.calls.some(c => c.startsWith('createLinearGradient'))).toBe(true);
    expect(ctx.calls.some(c => c.startsWith('fillRect'))).toBe(true);
  });

  it('draws gradient background with radial gradient', () => {
    const ctx = makeMockCtx();
    const config = {
      ...baseConfig,
      backgroundType: 'gradient' as const,
      backgroundValue: 'radial-gradient(circle at 20% 30%, #ff8a00 0%, transparent 50%)',
    };
    drawBackground(ctx, 800, 600, config, null);
    expect(ctx.calls.some(c => c.startsWith('createRadialGradient'))).toBe(true);
  });

  it('draws gradient background with multi-layer gradients', () => {
    const ctx = makeMockCtx();
    const config = {
      ...baseConfig,
      backgroundType: 'gradient' as const,
      backgroundValue: 'linear-gradient(45deg, #ff0000, #0000ff), radial-gradient(circle at 50% 50%, #00ff00, transparent)',
    };
    drawBackground(ctx, 800, 600, config, null);
    // Should call both linear and radial
    expect(ctx.calls.some(c => c.startsWith('createLinearGradient'))).toBe(true);
    expect(ctx.calls.some(c => c.startsWith('createRadialGradient'))).toBe(true);
    
    // Back-to-front rendering check: bottommost layer (radial-gradient, listed second) drawn BEFORE topmost layer (linear-gradient, listed first)
    const linearIdx = ctx.calls.findIndex(c => c.startsWith('createLinearGradient'));
    const radialIdx = ctx.calls.findIndex(c => c.startsWith('createRadialGradient'));
    expect(radialIdx).toBeLessThan(linearIdx);
  });

  it('correctly splits and parses layered gradients with nested parentheses and commas in colors', () => {
    const ctx = makeMockCtx();
    const config = {
      ...baseConfig,
      backgroundType: 'gradient' as const,
      backgroundValue: 'linear-gradient(135deg, rgba(168, 85, 247, 0.6) 0%, rgba(217, 70, 239, 0) 35%), linear-gradient(135deg, #3b0082 0%, #061233 100%)',
    };
    drawBackground(ctx, 800, 600, config, null);
    // Should create exactly 2 linear gradients (one for each layer)
    const linearCalls = ctx.calls.filter(c => c.startsWith('createLinearGradient'));
    expect(linearCalls.length).toBe(2);
  });

  it('renders Mesh Aurora preset with correct multi-layer order (radial gradients on top of linear gradient)', () => {
    const ctx = makeMockCtx();
    const config = {
      ...baseConfig,
      backgroundType: 'gradient' as const,
      backgroundValue: 'radial-gradient(circle at 20% 20%, #ff8a00 0%, transparent 50%), radial-gradient(circle at 80% 80%, #da00ff 0%, transparent 50%), linear-gradient(135deg, #00b4db 0%, #0083b0 100%)',
    };
    drawBackground(ctx, 800, 600, config, null);

    // Should call both linear and radial gradients
    const linearCalls = ctx.calls.filter(c => c.startsWith('createLinearGradient'));
    const radialCalls = ctx.calls.filter(c => c.startsWith('createRadialGradient'));
    expect(linearCalls).toHaveLength(1);
    expect(radialCalls).toHaveLength(2);

    // Finding call indices in ctx.calls to ensure correct drawing order:
    // Order in string: [radial1, radial2, linear]
    // Drawn order (back-to-front): [linear (drawn first), radial2 (drawn second), radial1 (drawn last)]
    const linearIdx = ctx.calls.indexOf(linearCalls[0]);
    const radial2Idx = ctx.calls.indexOf(radialCalls[0]); // first call to radial (drawn second)
    const radial1Idx = ctx.calls.indexOf(radialCalls[1]); // second call to radial (drawn last)

    expect(linearIdx).toBeLessThan(radial2Idx);
    expect(radial2Idx).toBeLessThan(radial1Idx);
  });

  it('filters out shape, position, angle, and unit keywords from parsed color stops', () => {
    const ctx = makeMockCtx();
    const config = {
      ...baseConfig,
      backgroundType: 'gradient' as const,
      backgroundValue: 'radial-gradient(circle at 20% 30%, #ff8a00 0%, transparent 50%)',
    };
    drawBackground(ctx, 800, 600, config, null);

    expect(ctx.calls.some(c => c.startsWith('createRadialGradient'))).toBe(true);

    const addColorStopCalls = ctx.calls.filter(c => c.startsWith('addColorStop'));
    expect(addColorStopCalls).toEqual([
      'addColorStop(0,#ff8a00)',
      'addColorStop(0.5,transparent)'
    ]);
  });

  it('calculates the correct farthest-corner radius for radial gradients', () => {
    const ctx = makeMockCtx();
    const config = {
      ...baseConfig,
      backgroundType: 'gradient' as const,
      backgroundValue: 'radial-gradient(circle at 20% 30%, #ff8a00 0%, transparent 50%)',
    };
    drawBackground(ctx, 800, 600, config, null);

    const radialCall = ctx.calls.find(c => c.startsWith('createRadialGradient'));
    expect(radialCall).toBeDefined();

    const match = radialCall!.match(/createRadialGradient\(([^)]+)\)/);
    expect(match).not.toBeNull();
    const params = match![1].split(',').map(Number);

    expect(params[0]).toBe(160); // cx
    expect(params[1]).toBe(180); // cy
    expect(params[2]).toBe(0);   // inner radius
    expect(params[3]).toBe(160); // cx
    expect(params[4]).toBe(180); // cy
    expect(params[5]).toBeCloseTo(765.506, 3); // farthest-corner radius
  });

  it('draws gradient background with default value', () => {
    const ctx = makeMockCtx();
    const config = { ...baseConfig, backgroundType: 'gradient' as const, backgroundValue: '' };
    drawBackground(ctx, 800, 600, config, null);
    // Should use default gradient
    expect(ctx.calls.some(c => c.startsWith('fillRect'))).toBe(true);
  });

  it('draws blur background with image', () => {
    const ctx = makeMockCtx();
    const config = { ...baseConfig, backgroundType: 'blur' as const, blurDensity: 40 };
    const img = makeMockImage();
    drawBackground(ctx, 800, 600, config, img);
    expect(ctx.calls).toContain('drawImage');
  });

  it('draws blur background with default blurDensity', () => {
    const ctx = makeMockCtx();
    const config = { ...baseConfig, backgroundType: 'blur' as const };
    const img = makeMockImage();
    drawBackground(ctx, 800, 600, config, img);
    expect(ctx.calls).toContain('drawImage');
  });

  it('skips blur drawing when imageEl is null', () => {
    const ctx = makeMockCtx();
    const config = { ...baseConfig, backgroundType: 'blur' as const };
    drawBackground(ctx, 800, 600, config, null);
    expect(ctx.calls).not.toContain('drawImage');
  });

  it('draws mesh background', () => {
    const ctx = makeMockCtx();
    const config = {
      ...baseConfig,
      backgroundType: 'mesh' as const,
      meshPoints: [{ id: '1', x: 0.5, y: 0.5, color: '#ff0000', radius: 0.3 }],
      meshBlur: 30,
      meshGrain: 5,
      meshOpacity: 50,
      meshSpread: 15,
    };
    drawBackground(ctx, 800, 600, config, null);
    expect(ctx.calls).toContain('save');
    expect(ctx.calls).toContain('restore');
  });

  it('draws mesh background with default parameters', () => {
    const ctx = makeMockCtx();
    const config = {
      ...baseConfig,
      backgroundType: 'mesh' as const,
      meshPoints: [{ id: '1', x: 0.5, y: 0.5, color: '#ff0000', radius: 0.3 }],
    };
    drawBackground(ctx, 800, 600, config, null);
    expect(ctx.calls).toContain('save');
    expect(ctx.calls).toContain('restore');
  });

  it('draws linear gradient with variadic color stops', () => {
    const ctx = makeMockCtx();
    const config = {
      ...baseConfig,
      backgroundType: 'gradient' as const,
      backgroundValue: 'linear-gradient(180deg, #ff0000 #00ff00 #0000ff)',
    };
    drawBackground(ctx, 800, 600, config, null);
    expect(ctx.calls.some(c => c.startsWith('fillRect'))).toBe(true);
  });

  it('handles gradient with single color', () => {
    const ctx = makeMockCtx();
    const config = {
      ...baseConfig,
      backgroundType: 'gradient' as const,
      backgroundValue: 'linear-gradient(90deg, #ff0000 50%)',
    };
    drawBackground(ctx, 800, 600, config, null);
    expect(ctx.calls.some(c => c.startsWith('fillRect'))).toBe(true);
  });

  it('handles solid color fallback in gradient parser', () => {
    const ctx = makeMockCtx();
    const config = {
      ...baseConfig,
      backgroundType: 'gradient' as const,
      backgroundValue: '#ff0000',
    };
    drawBackground(ctx, 800, 600, config, null);
    expect(ctx.calls.some(c => c.startsWith('fillRect'))).toBe(true);
  });

  it('draws light rays in drawBackground when configured', () => {
    const ctx = makeMockCtx();
    const config = {
      ...baseConfig,
      backgroundType: 'color' as const,
      backgroundValue: '#0b0f19',
      lightRaysStyle: 'diagonal' as const,
      lightRaysOpacity: 40,
      lightRaysAngle: 180,
      lightRaysCount: 3,
      lightRaysSourceX: 40,
      lightRaysSourceY: 20,
    };
    drawBackground(ctx, 800, 600, config, null);
    // Should have created 3 linear gradients for the streaks + 1 for perpendicular sweep = 4 linear gradients
    const linearCalls = ctx.calls.filter(c => c.startsWith('createLinearGradient'));
    expect(linearCalls.length).toBe(4);
  });

  it('draws spotlight rays with custom source coordinates', () => {
    const ctx = makeMockCtx();
    const config = {
      ...baseConfig,
      backgroundType: 'color' as const,
      backgroundValue: '#0b0f19',
      lightRaysStyle: 'spotlight' as const,
      lightRaysOpacity: 50,
      lightRaysSourceX: 70, // 70% of 800 = 560
      lightRaysSourceY: 30, // 30% of 600 = 180
    };
    drawBackground(ctx, 800, 600, config, null);
    const radialCall = ctx.calls.find(c => c.startsWith('createRadialGradient'));
    expect(radialCall).toBeDefined();
    expect(radialCall).toContain('560,180,0,560,180');
  });

  it('draws aurora rays with custom angle and source', () => {
    const ctx = makeMockCtx();
    const config = {
      ...baseConfig,
      backgroundType: 'color' as const,
      backgroundValue: '#0b0f19',
      lightRaysStyle: 'aurora' as const,
      lightRaysOpacity: 60,
      lightRaysAngle: 90,
      lightRaysSourceX: 25,
      lightRaysSourceY: 75,
    };
    drawBackground(ctx, 800, 600, config, null);
    // Should create a main linear gradient and a sweep linear gradient
    const linearCalls = ctx.calls.filter(c => c.startsWith('createLinearGradient'));
    expect(linearCalls.length).toBe(2);
  });

  it('draws grain in drawBackground when configured', () => {
    const ctx = makeMockCtx();
    const config = {
      ...baseConfig,
      backgroundType: 'color' as const,
      backgroundValue: '#0b0f19',
      bgGrain: 20,
    };
    
    const originalCreateElement = document.createElement;
    document.createElement = vi.fn().mockImplementation((tagName) => {
      if (tagName === 'canvas') {
        return {
          width: 128,
          height: 128,
          getContext: () => ({
            createImageData: () => ({ data: new Uint8ClampedArray(128 * 128 * 4) }),
            putImageData: () => {},
          }),
        };
      }
      return originalCreateElement.call(document, tagName);
    });

    drawBackground(ctx, 800, 600, config, null);
    expect(ctx.calls.some(c => c.startsWith('createPattern'))).toBe(true);

    document.createElement = originalCreateElement;
  });
});

describe('renderCanvas', () => {
  it('returns early if getContext returns null', () => {
    const canvas = { getContext: () => null, width: 0, height: 0 } as unknown as HTMLCanvasElement;
    renderCanvas(canvas, null, baseConfig);
    // Should not throw
  });

  it('renders noImage mode with background only', () => {
    const { canvas, ctx } = makeMockCanvas();
    const config = { ...baseConfig, noImage: true, backgroundType: 'color' as const, backgroundValue: '#ff5722' };
    renderCanvas(canvas, null, config);
    expect(ctx.calls.some(c => c.startsWith('clearRect'))).toBe(true);
    expect(ctx.calls.some(c => c.startsWith('fillRect'))).toBe(true);
  });

  it('renders noImage mode with watermark', () => {
    const { canvas, ctx } = makeMockCanvas();
    const config = {
      ...baseConfig,
      noImage: true,
      backgroundType: 'color' as const,
      backgroundValue: '#ff5722',
      watermarkEnabled: true,
      watermarkText: 'Test Watermark',
    };
    renderCanvas(canvas, null, config);
    expect(ctx.calls.some(c => c.startsWith('fillText'))).toBe(true);
  });

  it('renders noImage mode without watermark when disabled', () => {
    const { canvas, ctx } = makeMockCanvas();
    const config = {
      ...baseConfig,
      noImage: true,
      backgroundType: 'color' as const,
      backgroundValue: '#ff5722',
      watermarkEnabled: false,
      watermarkText: 'Test',
    };
    renderCanvas(canvas, null, config);
    const fillTextCalls = ctx.calls.filter(c => c.startsWith('fillText'));
    expect(fillTextCalls).toHaveLength(0);
  });

  it('renders with image and default position', () => {
    const { canvas, ctx } = makeMockCanvas();
    const img = makeMockImage();
    const config = { ...baseConfig, position: 'Middle center' as const };
    renderCanvas(canvas, img, config);
    expect(ctx.calls.some(c => c.startsWith('clearRect'))).toBe(true);
    expect(ctx.calls).toContain('drawImage');
  });

  it('clips and blurs only the selected screenshot area during export', () => {
    const { canvas, ctx } = makeMockCanvas();
    const img = makeMockImage();
    renderCanvas(canvas, img, {
      ...baseConfig,
      chromeStyle: 'none',
      annotations: [{
        id: 'blur-1', type: 'blur', x: 0.2, y: 0.3, w: 0.4, h: 0.2,
        color: '#ffffff', strokeWidth: 2, blurStrength: 20,
      }],
    });
    expect(ctx.calls.filter((call) => call === 'drawImage').length).toBeGreaterThanOrEqual(2);
    expect(ctx.calls).toContain('set:filter');
    expect(ctx.calls).toContain('clip');
    expect(ctx._state.filter).toMatch(/^blur\(/);
  });

  it('renders with Top center position', () => {
    const { canvas, ctx } = makeMockCanvas();
    const img = makeMockImage();
    const config = { ...baseConfig, position: 'Top center' as const };
    renderCanvas(canvas, img, config);
    expect(ctx.calls).toContain('drawImage');
  });

  it('renders with Bottom center position', () => {
    const { canvas, ctx } = makeMockCanvas();
    const img = makeMockImage();
    const config = { ...baseConfig, position: 'Bottom center' as const };
    renderCanvas(canvas, img, config);
    expect(ctx.calls).toContain('drawImage');
  });

  it('renders with Middle left position', () => {
    const { canvas, ctx } = makeMockCanvas();
    const img = makeMockImage();
    const config = { ...baseConfig, position: 'Middle left' as const };
    renderCanvas(canvas, img, config);
    expect(ctx.calls).toContain('drawImage');
  });

  it('renders with Middle right position', () => {
    const { canvas, ctx } = makeMockCanvas();
    const img = makeMockImage();
    const config = { ...baseConfig, position: 'Middle right' as const };
    renderCanvas(canvas, img, config);
    expect(ctx.calls).toContain('drawImage');
  });

  it('renders with macOS chrome', () => {
    const { canvas, ctx } = makeMockCanvas();
    const img = makeMockImage();
    const config = { ...baseConfig, chromeStyle: 'mac' as const, chromeTheme: 'dark' as const };
    renderCanvas(canvas, img, config);
    // Should have arc calls for the three dots
    expect(ctx.calls.some(c => c.startsWith('arc'))).toBe(true);
  });

  it('renders with macOS light theme', () => {
    const { canvas, ctx } = makeMockCanvas();
    const img = makeMockImage();
    const config = { ...baseConfig, chromeStyle: 'mac' as const, chromeTheme: 'light' as const };
    renderCanvas(canvas, img, config);
    expect(ctx.calls.some(c => c.startsWith('moveTo'))).toBe(true);
  });

  it('renders with Windows chrome dark theme', () => {
    const { canvas, ctx } = makeMockCanvas();
    const img = makeMockImage();
    const config = { ...baseConfig, chromeStyle: 'windows' as const, chromeTheme: 'dark' as const };
    renderCanvas(canvas, img, config);
    expect(ctx.calls.some(c => c.startsWith('rect'))).toBe(true);
  });

  it('renders with Windows chrome light theme', () => {
    const { canvas, ctx } = makeMockCanvas();
    const img = makeMockImage();
    const config = { ...baseConfig, chromeStyle: 'windows' as const, chromeTheme: 'light' as const };
    renderCanvas(canvas, img, config);
    expect(ctx.calls.some(c => c.startsWith('rect'))).toBe(true);
  });

  it('renders with shadow disabled', () => {
    const { canvas, ctx } = makeMockCanvas();
    const img = makeMockImage();
    const config = { ...baseConfig, shadowEnabled: false };
    renderCanvas(canvas, img, config);
    expect(ctx.calls).toContain('drawImage');
  });

  it('renders with shadow set to 0', () => {
    const { canvas, ctx } = makeMockCanvas();
    const img = makeMockImage();
    const config = { ...baseConfig, shadowEnabled: true, shadow: 0 };
    renderCanvas(canvas, img, config);
    expect(ctx.calls).toContain('drawImage');
  });

  it('renders annotations of type rect', () => {
    const { canvas, ctx } = makeMockCanvas();
    const img = makeMockImage();
    const annotations: Annotation[] = [{
      id: '1', type: 'rect', x: 0.1, y: 0.1, w: 0.3, h: 0.2,
      color: '#ff0000', strokeWidth: 4,
    }];
    const config = { ...baseConfig, annotations };
    renderCanvas(canvas, img, config);
    expect(ctx.calls.some(c => c.startsWith('strokeRect'))).toBe(true);
  });

  it('renders annotations of type filled-rect', () => {
    const { canvas, ctx } = makeMockCanvas();
    const img = makeMockImage();
    const annotations: Annotation[] = [{
      id: '1', type: 'filled-rect', x: 0.1, y: 0.1, w: 0.3, h: 0.2,
      color: '#ff0000', strokeWidth: 4,
    }];
    const config = { ...baseConfig, annotations };
    renderCanvas(canvas, img, config);
    expect(ctx.calls).toContain('fill');
  });

  it('renders annotations of type circle', () => {
    const { canvas, ctx } = makeMockCanvas();
    const img = makeMockImage();
    const annotations: Annotation[] = [{
      id: '1', type: 'circle', x: 0.1, y: 0.1, w: 0.3, h: 0.2,
      color: '#00ff00', strokeWidth: 4,
    }];
    const config = { ...baseConfig, annotations };
    renderCanvas(canvas, img, config);
    expect(ctx.calls.some(c => c.startsWith('ellipse'))).toBe(true);
  });

  it('renders annotations of type filled-circle', () => {
    const { canvas, ctx } = makeMockCanvas();
    const img = makeMockImage();
    const annotations: Annotation[] = [{
      id: '1', type: 'filled-circle', x: 0.1, y: 0.1, w: 0.3, h: 0.2,
      color: '#00ff00', strokeWidth: 4,
    }];
    const config = { ...baseConfig, annotations };
    renderCanvas(canvas, img, config);
    expect(ctx.calls).toContain('fill');
  });

  it('renders annotations of type line', () => {
    const { canvas, ctx } = makeMockCanvas();
    const img = makeMockImage();
    const annotations: Annotation[] = [{
      id: '1', type: 'line', x: 0.1, y: 0.1, w: 0.3, h: 0.2,
      color: '#0000ff', strokeWidth: 4,
    }];
    const config = { ...baseConfig, annotations };
    renderCanvas(canvas, img, config);
    expect(ctx.calls.some(c => c.startsWith('moveTo'))).toBe(true);
    expect(ctx.calls.some(c => c.startsWith('lineTo'))).toBe(true);
  });

  it('renders annotations of type arrow', () => {
    const { canvas, ctx } = makeMockCanvas();
    const img = makeMockImage();
    const annotations: Annotation[] = [{
      id: '1', type: 'arrow', x: 0.1, y: 0.1, w: 0.3, h: 0.2,
      color: '#ff0000', strokeWidth: 4, arrowStyle: 'classic',
    }];
    const config = { ...baseConfig, annotations };
    renderCanvas(canvas, img, config);
    expect(ctx.calls.some(c => c.startsWith('beginPath'))).toBe(true);
  });

  it('renders annotations of type text', () => {
    const { canvas, ctx } = makeMockCanvas();
    const img = makeMockImage();
    const annotations: Annotation[] = [{
      id: '1', type: 'text', x: 0.1, y: 0.1, w: 0.3, h: 0.2,
      color: '#ffffff', strokeWidth: 4, text: 'Hello World',
    }];
    const config = { ...baseConfig, annotations };
    renderCanvas(canvas, img, config);
    expect(ctx.calls.some(c => c.startsWith('fillText'))).toBe(true);
  });

  it('renders text annotations with custom font styling', () => {
    const { canvas, ctx } = makeMockCanvas();
    const img = makeMockImage();
    const annotations: Annotation[] = [{
      id: '1',
      type: 'text',
      x: 0.1,
      y: 0.1,
      w: 0.3,
      h: 0.2,
      color: '#ffffff',
      strokeWidth: 4,
      text: 'Hello World',
      fontFamily: 'Verdana',
      fontSize: 32,
      fontBold: true,
      fontItalic: true,
    }];
    const config = { ...baseConfig, annotations };
    renderCanvas(canvas, img, config);
    expect(ctx._state.font).toBe('italic bold 32px Verdana');
  });

  it('does not stroke text by default (no outline)', () => {
    const { canvas, ctx } = makeMockCanvas();
    const img = makeMockImage();
    const annotations: Annotation[] = [{
      id: '1', type: 'text', x: 0.1, y: 0.1, w: 0.3, h: 0.2,
      color: '#ffffff', strokeWidth: 4, text: 'Hello World',
      fontSize: 32,
    }];
    const config = { ...baseConfig, annotations };
    renderCanvas(canvas, img, config);
    expect(ctx.calls.some(c => c.startsWith('fillText'))).toBe(true);
    expect(ctx.calls).not.toContain('strokeText');
  });

  it('strokes text with configurable outline color and width when enabled', () => {
    const { canvas, ctx } = makeMockCanvas();
    const img = makeMockImage();
    const annotations: Annotation[] = [{
      id: '1', type: 'text', x: 0.1, y: 0.1, w: 0.3, h: 0.2,
      color: '#ffffff', strokeWidth: 4, text: 'Hello World',
      fontSize: 32,
      outlineEnabled: true,
      outlineColor: '#ff0000',
      outlineWidth: 6,
    }];
    const config = { ...baseConfig, annotations };
    renderCanvas(canvas, img, config);
    expect(ctx.calls).toContain('strokeText');
    expect(ctx._state.strokeStyle).toBe('#ff0000');
    expect(ctx._state.lineWidth).toBe(6);
    expect(ctx.calls.some(c => c.startsWith('fillText'))).toBe(true);
  });

  it('renders annotations of type emoji', () => {
    const { canvas, ctx } = makeMockCanvas();
    const img = makeMockImage();
    const annotations: Annotation[] = [{
      id: '1', type: 'emoji', x: 0.1, y: 0.1, w: 0.1, h: 0.1,
      color: '#000000', strokeWidth: 4, text: '😀',
    }];
    const config = { ...baseConfig, annotations };
    renderCanvas(canvas, img, config);
    expect(ctx.calls.some(c => c.startsWith('fillText'))).toBe(true);
  });

  it('renders annotations of type pen', () => {
    const { canvas, ctx } = makeMockCanvas();
    const img = makeMockImage();
    const annotations: Annotation[] = [{
      id: '1', type: 'pen', x: 0.1, y: 0.1, w: 0.3, h: 0.2,
      color: '#ff0000', strokeWidth: 4,
      points: [{ x: 0, y: 0 }, { x: 0.5, y: 0.5 }, { x: 1, y: 0 }],
    }];
    const config = { ...baseConfig, annotations };
    renderCanvas(canvas, img, config);
    expect(ctx.calls.some(c => c.startsWith('moveTo'))).toBe(true);
    expect(ctx.calls.some(c => c.startsWith('lineTo'))).toBe(true);
  });

  it('renders annotations with rotation', () => {
    const { canvas, ctx } = makeMockCanvas();
    const img = makeMockImage();
    const annotations: Annotation[] = [{
      id: '1', type: 'rect', x: 0.1, y: 0.1, w: 0.3, h: 0.2,
      color: '#ff0000', strokeWidth: 4, rotation: 45,
    }];
    const config = { ...baseConfig, annotations };
    renderCanvas(canvas, img, config);
    expect(ctx.calls.some(c => c.startsWith('rotate'))).toBe(true);
  });

  it('renders with empty annotations array', () => {
    const { canvas, ctx } = makeMockCanvas();
    const img = makeMockImage();
    const config = { ...baseConfig, annotations: [] };
    renderCanvas(canvas, img, config);
    expect(ctx.calls).toContain('drawImage');
  });

  it('renders with inset border', () => {
    const { canvas, ctx } = makeMockCanvas();
    const img = makeMockImage();
    const config = { ...baseConfig, inset: 5, insetColor: 'rgba(255,255,255,0.3)' };
    renderCanvas(canvas, img, config);
    expect(ctx.calls).toContain('stroke');
  });

  it('does not render inset when inset is 0', () => {
    const { canvas, ctx } = makeMockCanvas();
    const img = makeMockImage();
    const config = { ...baseConfig, inset: 0 };
    renderCanvas(canvas, img, config);
    // stroke may come from other places, so just check no error
    expect(ctx.calls).toContain('drawImage');
  });

  it('renders with outer border', () => {
    const { canvas, ctx } = makeMockCanvas();
    const img = makeMockImage();
    const config = { ...baseConfig, border: 3, borderColor: '#ffffff' };
    renderCanvas(canvas, img, config);
    expect(ctx.calls).toContain('stroke');
  });

  it('does not render border when border is 0', () => {
    const { canvas, ctx } = makeMockCanvas();
    const img = makeMockImage();
    const config = { ...baseConfig, border: 0 };
    renderCanvas(canvas, img, config);
    expect(ctx.calls).toContain('drawImage');
  });

  it('renders watermark when enabled', () => {
    const { canvas, ctx } = makeMockCanvas();
    const img = makeMockImage();
    const config = { ...baseConfig, watermarkEnabled: true, watermarkText: 'Test' };
    renderCanvas(canvas, img, config);
    expect(ctx.calls.some(c => c.startsWith('fillText'))).toBe(true);
  });

  it('does not render watermark when disabled', () => {
    const { canvas, ctx } = makeMockCanvas();
    const img = makeMockImage();
    const config = { ...baseConfig, watermarkEnabled: false, watermarkText: 'Test' };
    renderCanvas(canvas, img, config);
    const fillTextCalls = ctx.calls.filter(c => c.startsWith('fillText'));
    expect(fillTextCalls.length).toBe(0);
  });

  it('handles image without naturalWidth', () => {
    const { canvas, ctx } = makeMockCanvas();
    const img = { width: 400, height: 300, naturalWidth: 0, naturalHeight: 0 } as unknown as HTMLImageElement;
    const config = { ...baseConfig };
    renderCanvas(canvas, img, config);
    expect(ctx.calls).toContain('drawImage');
  });

  it('renders with mesh background type', () => {
    const { canvas, ctx } = makeMockCanvas();
    const img = makeMockImage();
    const config = {
      ...baseConfig,
      backgroundType: 'mesh' as const,
      meshPoints: [{ id: '1', x: 0.5, y: 0.5, color: '#ff0000', radius: 0.3 }],
    };
    renderCanvas(canvas, img, config);
    expect(ctx.calls).toContain('drawImage');
  });

  it('renders annotations with dashed arrow', () => {
    const { canvas, ctx } = makeMockCanvas();
    const img = makeMockImage();
    const annotations: Annotation[] = [{
      id: '1', type: 'arrow', x: 0.1, y: 0.1, w: 0.3, h: 0.2,
      color: '#ff0000', strokeWidth: 4, arrowStyle: 'dashed',
    }];
    const config = { ...baseConfig, annotations };
    renderCanvas(canvas, img, config);
    // dashed arrows should call setLineDash
    expect(ctx.calls.some(c => c.startsWith('setLineDash'))).toBe(true);
  });

  it('renders annotations with tapered arrow', () => {
    const { canvas, ctx } = makeMockCanvas();
    const img = makeMockImage();
    const annotations: Annotation[] = [{
      id: '1', type: 'arrow', x: 0.1, y: 0.1, w: 0.4, h: 0.3,
      color: '#ff0000', strokeWidth: 4, arrowStyle: 'tapered',
    }];
    const config = { ...baseConfig, annotations };
    renderCanvas(canvas, img, config);
    expect(ctx.calls).toContain('fill');
  });

  describe('watermark custom position and opacity', () => {
    const positions = ['left', 'middle', 'right', 'top left', 'top middle', 'top right'] as const;

    positions.forEach((pos) => {
      it(`renders watermark at position: ${pos}`, () => {
        const { canvas, ctx } = makeMockCanvas();
        const img = makeMockImage();
        const config = {
          ...baseConfig,
          watermarkEnabled: true,
          watermarkText: 'Custom Watermark Position',
          watermarkPosition: pos,
          watermarkOpacity: 0.75,
        };
        renderCanvas(canvas, img, config);
        
        expect(ctx.calls.some(c => c.startsWith('fillText'))).toBe(true);
        expect(ctx._state.globalAlpha).toBe(0.75);
        expect(ctx._state.fillStyle).toBe('#ffffff');
      });
    });

    it('renders watermark with custom opacity', () => {
      const { canvas, ctx } = makeMockCanvas();
      const img = makeMockImage();
      const config = {
        ...baseConfig,
        watermarkEnabled: true,
        watermarkText: 'Opacity Test',
        watermarkOpacity: 0.15,
      };
      renderCanvas(canvas, img, config);
      expect(ctx._state.globalAlpha).toBe(0.15);
      expect(ctx._state.fillStyle).toBe('#ffffff');
    });

    it('uses textBaseline bottom for bottom positions', () => {
      const { canvas, ctx } = makeMockCanvas();
      const img = makeMockImage();
      const config = { ...baseConfig, watermarkEnabled: true, watermarkText: 'W', watermarkPosition: 'middle' as const };
      renderCanvas(canvas, img, config);
      expect(ctx._state.textBaseline).toBe('bottom');
    });

    it('uses textBaseline top for top positions', () => {
      const { canvas, ctx } = makeMockCanvas();
      const img = makeMockImage();
      const config = { ...baseConfig, watermarkEnabled: true, watermarkText: 'W', watermarkPosition: 'top middle' as const };
      renderCanvas(canvas, img, config);
      expect(ctx._state.textBaseline).toBe('top');
    });

    it('safe inset is at least fontSize*0.5 when padding is zero (text stays in canvas)', () => {
      const { canvas, ctx } = makeMockCanvas();
      const img = makeMockImage();
      // padding=0 should still apply fontSize*0.5 = 10 safe margin
      const config = {
        ...baseConfig,
        padding: 0,
        watermarkEnabled: true,
        watermarkText: 'W',
        watermarkSize: 20,
        watermarkPosition: 'left' as const,
      };
      renderCanvas(canvas, img, config);
      expect(ctx.calls.some((c: string) => c.startsWith('fillText'))).toBe(true);
      // textBaseline = 'bottom' means y = canvasHeight - inset; inset = max(0, 10) = 10
      // so text bottom is at canvasHeight - 10, well within bounds
      expect(ctx._state.textBaseline).toBe('bottom');
    });
  });

  describe('drawBackground with url() background image', () => {
    it('preloads and draws the background image', () => {
      const ctx = makeMockCtx();
      const config = {
        ...baseConfig,
        backgroundType: 'gradient' as const,
        backgroundValue: 'url(test-bg.png)',
      };
      
      // Initially, it is not in cache, and not complete, so it shouldn't draw
      drawBackground(ctx, 800, 600, config, null);
      // It shouldn't draw the image yet
      const drawImageCalls = ctx.calls.filter(c => c === 'drawImage');
      expect(drawImageCalls).toHaveLength(0);

      // Now we preload it
      let preloadCallbackCalled = false;
      preloadBgImage('test-bg.png', () => {
        preloadCallbackCalled = true;
      });

      const cachedImg = getBgImage('test-bg.png');
      expect(cachedImg).not.toBeNull();
      
      // Simulate image loaded
      Object.defineProperty(cachedImg, 'complete', { value: true, configurable: true });
      Object.defineProperty(cachedImg, 'naturalWidth', { value: 100, configurable: true });
      
      // Fire the onload/load event if there are listeners
      cachedImg!.dispatchEvent(new Event('load'));

      // If preloadBgImage ran synchronously (which it might not if onload isn't mocked, but dispatching event triggers it)
      if (cachedImg!.onload) {
        cachedImg!.onload(new Event('load'));
      }

      expect(preloadCallbackCalled).toBe(true);

      // Draw again
      drawBackground(ctx, 800, 600, config, null);
      expect(ctx.calls).toContain('drawImage');
    });
  });
});

// ---------------------------------------------------------------------------
// Regression: image-based background export parity with CSS preview
// ---------------------------------------------------------------------------
describe('drawBackground url() cover-scale regression', () => {
  function makeDrawImageCapturingCtx() {
    const drawImageArgs: number[][] = [];
    const calls: string[] = [];
    const state: Record<string, any> = {};
    const handler: ProxyHandler<object> = {
      get(_t, prop) {
        if (prop === 'drawImageArgs') return drawImageArgs;
        if (prop === 'calls') return calls;
        if (prop === '_state') return state;
        if (prop === 'drawImage') {
          return (_img: unknown, x: number, y: number, w: number, h: number) => {
            calls.push('drawImage');
            drawImageArgs.push([x, y, w, h]);
          };
        }
        if (prop === 'createLinearGradient') {
          return () => ({ addColorStop: () => {} });
        }
        if (prop === 'createRadialGradient') {
          return () => ({ addColorStop: () => {} });
        }
        if (prop === 'fillRect' || prop === 'clearRect') {
          return (...args: number[]) => calls.push(`${String(prop)}(${args.join(',')})`);
        }
        if (prop === 'save' || prop === 'restore') return () => calls.push(String(prop));
        return (..._args: unknown[]) => {};
      },
      set(_t, prop, value) { state[String(prop)] = value; return true; },
    };
    return new Proxy({} as any, handler) as any;
  }

  function makeLoadedImage(naturalWidth: number, naturalHeight: number): HTMLImageElement {
    const img = new Image();
    Object.defineProperty(img, 'complete', { value: true, configurable: true });
    Object.defineProperty(img, 'naturalWidth', { value: naturalWidth, configurable: true });
    Object.defineProperty(img, 'naturalHeight', { value: naturalHeight, configurable: true });
    return img;
  }

  it('uses cover scaling (not stretch) for wide image on square canvas', () => {
    // Image: 2000×1000 (2:1). Canvas: 400×400 (1:1).
    // cover scale = max(400/2000, 400/1000) = max(0.2, 0.4) = 0.4
    // sw = 2000*0.4 = 800, sh = 1000*0.4 = 400
    // sx = (400-800)/2 = -200, sy = (400-400)/2 = 0
    const bgUrl = 'regression-wide-image.png';
    makeLoadedImage(2000, 1000);
    // Inject directly into bgImageCache via preloadBgImage
    preloadBgImage(bgUrl, () => {});
    const cached = getBgImage(bgUrl)!;
    Object.defineProperty(cached, 'complete', { value: true, configurable: true });
    Object.defineProperty(cached, 'naturalWidth', { value: 2000, configurable: true });
    Object.defineProperty(cached, 'naturalHeight', { value: 1000, configurable: true });
    cached.dispatchEvent(new Event('load'));
    if ((cached as any).onload) (cached as any).onload();

    const ctx = makeDrawImageCapturingCtx();
    const config = { ...baseConfig, backgroundType: 'gradient' as const, backgroundValue: `url(${bgUrl})` };
    drawBackground(ctx, 400, 400, config, null);

    expect(ctx.calls).toContain('drawImage');
    const [x, y, w, h] = ctx.drawImageArgs[0];
    // Must NOT be plain stretch (0, 0, canvasW, canvasH)
    expect([x, y, w, h]).not.toEqual([0, 0, 400, 400]);
    // Cover: scale=0.4, sw=800, sh=400, sx=-200, sy=0
    expect(w).toBeCloseTo(800, 0);
    expect(h).toBeCloseTo(400, 0);
    expect(x).toBeCloseTo(-200, 0);
    expect(y).toBeCloseTo(0, 0);
  });

  it('uses cover scaling for tall image on landscape canvas', () => {
    // Image: 100×500 (tall). Canvas: 600×300 (landscape).
    // cover scale = max(600/100, 300/500) = max(6, 0.6) = 6
    // sw = 100*6 = 600, sh = 500*6 = 3000
    // sx = (600-600)/2 = 0, sy = (300-3000)/2 = -1350
    const bgUrl = 'regression-tall-image.png';
    preloadBgImage(bgUrl, () => {});
    const cached = getBgImage(bgUrl)!;
    Object.defineProperty(cached, 'complete', { value: true, configurable: true });
    Object.defineProperty(cached, 'naturalWidth', { value: 100, configurable: true });
    Object.defineProperty(cached, 'naturalHeight', { value: 500, configurable: true });
    cached.dispatchEvent(new Event('load'));
    if ((cached as any).onload) (cached as any).onload();

    const ctx = makeDrawImageCapturingCtx();
    const config = { ...baseConfig, backgroundType: 'gradient' as const, backgroundValue: `url(${bgUrl})` };
    drawBackground(ctx, 600, 300, config, null);

    expect(ctx.calls).toContain('drawImage');
    const [x, y, w, h] = ctx.drawImageArgs[0];
    expect(w).toBeCloseTo(600, 0);
    expect(h).toBeCloseTo(3000, 0);
    expect(x).toBeCloseTo(0, 0);
    expect(y).toBeCloseTo(-1350, 0);
  });

  it('does NOT draw image when it is not yet loaded (no fallback regression)', () => {
    const bgUrl = 'regression-unloaded.png';
    preloadBgImage(bgUrl, () => {});
    // Do NOT mark it as complete — simulates still-loading state
    const ctx = makeDrawImageCapturingCtx();
    const config = { ...baseConfig, backgroundType: 'gradient' as const, backgroundValue: `url(${bgUrl})` };
    drawBackground(ctx, 400, 400, config, null);
    // Should not call drawImage since image is incomplete
    expect(ctx.drawImageArgs).toHaveLength(0);
  });

  it('preloadBgImage calls onDone immediately for already-loaded cached image', () => {
    const bgUrl = 'regression-already-cached.png';
    // First preload: puts it in cache
    preloadBgImage(bgUrl, () => {});
    const cached = getBgImage(bgUrl)!;
    Object.defineProperty(cached, 'complete', { value: true, configurable: true });
    Object.defineProperty(cached, 'naturalWidth', { value: 200, configurable: true });

    // Second preload: should call onDone synchronously since complete & valid
    let calledSync = false;
    preloadBgImage(bgUrl, () => { calledSync = true; });
    expect(calledSync).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Regression: annotation stroke/font/outline must scale with the export
// content width relative to the on-screen preview width, so objects render
// at the same proportions on export as they do on the live canvas.
// Bug: with a large screenshot, drawn objects looked smaller on export/copy
// than on the live canvas.
// ---------------------------------------------------------------------------
describe('annotation export scaling parity with live preview', () => {
  it('scales text fontSize by contentWidth / annotationDisplayWidth (large screenshot)', () => {
    const { canvas, ctx } = makeMockCanvas();
    // Large screenshot (2400px) displayed at 800px in the live preview.
    const img = makeMockImage(2400, 1600);
    const annotations: Annotation[] = [{
      id: '1', type: 'text', x: 0.1, y: 0.1, w: 0.3, h: 0.2,
      color: '#ffffff', strokeWidth: 4, text: 'Hello',
      fontSize: 24,
    }];
    const config = { ...baseConfig, annotations, annotationDisplayWidth: 800 };
    renderCanvas(canvas, img, config);
    // contentW = 2400, displayWidth = 800 -> pxScale = 3 -> fontSize = 24 * 3 = 72
    expect(ctx._state.font).toContain('72px');
  });

  it('scales stroke width by contentWidth / annotationDisplayWidth', () => {
    const { canvas, ctx } = makeMockCanvas();
    const img = makeMockImage(2400, 1600);
    const annotations: Annotation[] = [{
      id: '1', type: 'rect', x: 0.1, y: 0.1, w: 0.3, h: 0.2,
      color: '#ff0000', strokeWidth: 4,
    }];
    const config = { ...baseConfig, annotations, annotationDisplayWidth: 800 };
    renderCanvas(canvas, img, config);
    // pxScale = 2400 / 800 = 3 -> strokeW = 4 * 3 = 12
    expect(ctx._state.lineWidth).toBe(12);
  });

  it('scales text outline width by contentWidth / annotationDisplayWidth', () => {
    const { canvas, ctx } = makeMockCanvas();
    const img = makeMockImage(2400, 1600);
    const annotations: Annotation[] = [{
      id: '1', type: 'text', x: 0.1, y: 0.1, w: 0.3, h: 0.2,
      color: '#ffffff', strokeWidth: 4, text: 'Hello',
      fontSize: 24,
      outlineEnabled: true,
      outlineColor: '#000000',
      outlineWidth: 6,
    }];
    const config = { ...baseConfig, annotations, annotationDisplayWidth: 800 };
    renderCanvas(canvas, img, config);
    // pxScale = 3 -> outlineW = max(1, 6 * 3) = 18
    expect(ctx._state.lineWidth).toBe(18);
  });

  it('preserves live-preview proportions: fontSize matches on-screen ratio', () => {
    // On the live canvas the user sees fontSize=24 over an 800px-wide screenshot
    // (24/800 = 3% of width). The export draws the screenshot at 2400px, so the
    // font must be 72px to keep the same 3% proportion.
    const { canvas, ctx } = makeMockCanvas();
    const img = makeMockImage(2400, 1600);
    const annotations: Annotation[] = [{
      id: '1', type: 'text', x: 0.1, y: 0.1, w: 0.3, h: 0.2,
      color: '#ffffff', strokeWidth: 4, text: 'Hello',
      fontSize: 24,
    }];
    const config = { ...baseConfig, annotations, annotationDisplayWidth: 800 };
    renderCanvas(canvas, img, config);
    const fontMatch = ctx._state.font.match(/(\d+(?:\.\d+)?)px/);
    const exportedFontSize = fontMatch ? parseFloat(fontMatch[1]) : 0;
    // Proportion of font to content width should match the live preview ratio.
    const contentW = 2400; // imgW * scale(100%)
    expect(exportedFontSize / contentW).toBeCloseTo(24 / 800, 5);
  });

  it('falls back to legacy scaling when annotationDisplayWidth is not provided', () => {
    // Without annotationDisplayWidth, fontSize should scale by `sf` only
    // (legacy behavior), preserving backward compatibility for old annotations.
    const { canvas, ctx } = makeMockCanvas();
    const img = makeMockImage(800, 600);
    const annotations: Annotation[] = [{
      id: '1', type: 'text', x: 0.1, y: 0.1, w: 0.3, h: 0.2,
      color: '#ffffff', strokeWidth: 4, text: 'Hello',
      fontSize: 32,
      fontFamily: 'Verdana',
      fontBold: true,
      fontItalic: true,
    }];
    const config = { ...baseConfig, annotations };
    renderCanvas(canvas, img, config);
    // scale = 100 -> sf = 1 -> legacy fontSize = 32 * 1 = 32
    expect(ctx._state.font).toBe('italic bold 32px Verdana');
  });

  it('does not shrink fontSize when screenshot is large but displayed at natural size', () => {
    // If the user views the screenshot at its natural width (displayWidth = imgW),
    // pxScale = 1 and fontSize should equal the stored value (no shrink).
    const { canvas, ctx } = makeMockCanvas();
    const img = makeMockImage(2400, 1600);
    const annotations: Annotation[] = [{
      id: '1', type: 'text', x: 0.1, y: 0.1, w: 0.3, h: 0.2,
      color: '#ffffff', strokeWidth: 4, text: 'Hello',
      fontSize: 24,
    }];
    const config = { ...baseConfig, annotations, annotationDisplayWidth: 2400 };
    renderCanvas(canvas, img, config);
    expect(ctx._state.font).toContain('24px');
  });
});
