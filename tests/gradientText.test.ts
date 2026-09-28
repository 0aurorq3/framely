import { describe, it, expect } from 'vitest';
import { renderCanvas } from '../src/renderer/canvasRenderer';
import { Annotation } from '../src/renderer/canvasRenderer';
import { makeMockCanvas, makeMockImage, baseConfig } from './shared';

const solidBgConfig = {
  ...baseConfig,
  backgroundType: 'color' as const,
  backgroundValue: '#000000',
  shadowEnabled: false,
};

describe('gradient text on canvas export', () => {
  it('renders text with solid color when gradient is disabled', () => {
    const { canvas, ctx } = makeMockCanvas();
    const img = makeMockImage();
    const annotations: Annotation[] = [{
      id: '1', type: 'text', x: 0.1, y: 0.1, w: 0.3, h: 0.2,
      color: '#ffffff', strokeWidth: 4, text: 'Hello',
      fontSize: 32,
      gradientEnabled: false,
    }];
    const config = { ...solidBgConfig, annotations };
    renderCanvas(canvas, img, config);
    expect(ctx.calls.some(c => c.startsWith('fillText'))).toBe(true);
    expect(ctx.calls.some(c => c.startsWith('createLinearGradient'))).toBe(false);
  });

  it('renders text with solid color when gradient fields are absent (no regression)', () => {
    const { canvas, ctx } = makeMockCanvas();
    const img = makeMockImage();
    const annotations: Annotation[] = [{
      id: '1', type: 'text', x: 0.1, y: 0.1, w: 0.3, h: 0.2,
      color: '#aabbcc', strokeWidth: 4, text: 'NoGrad',
      fontSize: 24,
    }];
    const config = { ...solidBgConfig, annotations };
    renderCanvas(canvas, img, config);
    expect(ctx.calls.some(c => c.startsWith('fillText'))).toBe(true);
    expect(ctx.calls.some(c => c.startsWith('createLinearGradient'))).toBe(false);
  });

  it('creates a linear gradient when gradientEnabled is true', () => {
    const { canvas, ctx } = makeMockCanvas();
    const img = makeMockImage();
    const annotations: Annotation[] = [{
      id: '1', type: 'text', x: 0.1, y: 0.1, w: 0.3, h: 0.2,
      color: '#ffffff', strokeWidth: 4, text: 'Gradient',
      fontSize: 32,
      gradientEnabled: true,
      gradientColor1: '#ff0080',
      gradientColor2: '#7928ca',
      gradientAngle: 135,
    }];
    const config = { ...solidBgConfig, annotations };
    renderCanvas(canvas, img, config);

    expect(ctx.calls.some(c => c.startsWith('createLinearGradient'))).toBe(true);
    expect(ctx.calls.some(c => c.startsWith('fillText'))).toBe(true);
  });

  it('adds correct color stops for gradient text', () => {
    const { canvas, ctx } = makeMockCanvas();
    const img = makeMockImage();
    const annotations: Annotation[] = [{
      id: '1', type: 'text', x: 0.1, y: 0.1, w: 0.3, h: 0.2,
      color: '#ffffff', strokeWidth: 4, text: 'Stops',
      fontSize: 32,
      gradientEnabled: true,
      gradientColor1: '#ff0000',
      gradientColor2: '#0000ff',
      gradientAngle: 90,
    }];
    const config = { ...solidBgConfig, annotations };
    renderCanvas(canvas, img, config);

    expect(ctx.calls).toContain('addColorStop(0,#ff0000)');
    expect(ctx.calls).toContain('addColorStop(1,#0000ff)');
  });

  it('renders outline before gradient fill when both are enabled', () => {
    const { canvas, ctx } = makeMockCanvas();
    const img = makeMockImage();
    const annotations: Annotation[] = [{
      id: '1', type: 'text', x: 0.1, y: 0.1, w: 0.3, h: 0.2,
      color: '#ffffff', strokeWidth: 4, text: 'Outline+Grad',
      fontSize: 32,
      outlineEnabled: true,
      outlineColor: '#000000',
      outlineWidth: 4,
      gradientEnabled: true,
      gradientColor1: '#ff0080',
      gradientColor2: '#7928ca',
      gradientAngle: 135,
    }];
    const config = { ...solidBgConfig, annotations };
    renderCanvas(canvas, img, config);

    const gradIdx = ctx.calls.findIndex(c => c.startsWith('createLinearGradient'));
    const fillIdx = ctx.calls.findIndex(c => c.startsWith('fillText'));

    expect(gradIdx).toBeGreaterThan(-1);
    expect(fillIdx).toBeGreaterThan(-1);
    expect(gradIdx).toBeLessThan(fillIdx);

    const strokeIdx = ctx.calls.lastIndexOf('strokeText', gradIdx);
    expect(strokeIdx).toBeGreaterThan(-1);
    expect(strokeIdx).toBeLessThan(gradIdx);
  });

  it('produces different gradient vectors for different angles', () => {
    const { canvas: canvas1, ctx: ctx1 } = makeMockCanvas();
    const { canvas: canvas2, ctx: ctx2 } = makeMockCanvas();
    const img = makeMockImage();

    const makeAnnotation = (angle: number): Annotation[] => [{
      id: '1', type: 'text', x: 0.1, y: 0.1, w: 0.3, h: 0.2,
      color: '#ffffff', strokeWidth: 4, text: 'Angle',
      fontSize: 32,
      gradientEnabled: true,
      gradientColor1: '#ff0000',
      gradientColor2: '#0000ff',
      gradientAngle: angle,
    }];

    renderCanvas(canvas1, img, { ...solidBgConfig, annotations: makeAnnotation(0) });
    renderCanvas(canvas2, img, { ...solidBgConfig, annotations: makeAnnotation(90) });

    const grad1 = ctx1.calls.find(c => c.startsWith('createLinearGradient'));
    const grad2 = ctx2.calls.find(c => c.startsWith('createLinearGradient'));
    expect(grad1).toBeDefined();
    expect(grad2).toBeDefined();
    expect(grad1).not.toBe(grad2);
  });

  it('uses default angle of 135 when gradientAngle is not set', () => {
    const { canvas, ctx } = makeMockCanvas();
    const img = makeMockImage();
    const annotations: Annotation[] = [{
      id: '1', type: 'text', x: 0.1, y: 0.1, w: 0.3, h: 0.2,
      color: '#ffffff', strokeWidth: 4, text: 'Default',
      fontSize: 32,
      gradientEnabled: true,
      gradientColor1: '#ff0000',
      gradientColor2: '#0000ff',
    }];
    const config = { ...solidBgConfig, annotations };
    renderCanvas(canvas, img, config);

    const gradCall = ctx.calls.find(c => c.startsWith('createLinearGradient'));
    expect(gradCall).toBeDefined();
  });

  it('does not create gradient when gradientEnabled is true but colors are missing', () => {
    const { canvas, ctx } = makeMockCanvas();
    const img = makeMockImage();
    const annotations: Annotation[] = [{
      id: '1', type: 'text', x: 0.1, y: 0.1, w: 0.3, h: 0.2,
      color: '#ffffff', strokeWidth: 4, text: 'NoColors',
      fontSize: 32,
      gradientEnabled: true,
    }];
    const config = { ...solidBgConfig, annotations };
    renderCanvas(canvas, img, config);

    expect(ctx.calls.some(c => c.startsWith('fillText'))).toBe(true);
    expect(ctx.calls.some(c => c.startsWith('createLinearGradient'))).toBe(false);
  });

  it('sets fillStyle to gradient object before fillText', () => {
    const { canvas, ctx } = makeMockCanvas();
    const img = makeMockImage();
    const annotations: Annotation[] = [{
      id: '1', type: 'text', x: 0.1, y: 0.1, w: 0.3, h: 0.2,
      color: '#ffffff', strokeWidth: 4, text: 'FillStyle',
      fontSize: 32,
      gradientEnabled: true,
      gradientColor1: '#ff0080',
      gradientColor2: '#7928ca',
      gradientAngle: 135,
    }];
    const config = { ...solidBgConfig, annotations };
    renderCanvas(canvas, img, config);

    const setFillIdx = ctx.calls.lastIndexOf('set:fillStyle');
    const fillTextIdx = ctx.calls.findIndex(c => c.startsWith('fillText'));
    expect(setFillIdx).toBeGreaterThan(-1);
    expect(fillTextIdx).toBeGreaterThan(-1);
    expect(setFillIdx).toBeLessThan(fillTextIdx);
  });

  it('produces a horizontal gradient vector at 90° (CSS "to right")', () => {
    const { canvas, ctx } = makeMockCanvas();
    const img = makeMockImage();
    const annotations: Annotation[] = [{
      id: '1', type: 'text', x: 0.1, y: 0.1, w: 0.3, h: 0.2,
      color: '#ffffff', strokeWidth: 4, text: 'Horizontal',
      fontSize: 32,
      gradientEnabled: true,
      gradientColor1: '#ff0000',
      gradientColor2: '#0000ff',
      gradientAngle: 90,
    }];
    const config = { ...solidBgConfig, annotations };
    renderCanvas(canvas, img, config);

    const gradCall = ctx.calls.find(c => c.startsWith('createLinearGradient'));
    expect(gradCall).toBeDefined();
    const match = gradCall!.match(/createLinearGradient\(([^)]+)\)/);
    expect(match).toBeTruthy();
    const [x0, y0, x1, y1] = match![1].split(',').map(Number);
    expect(y0).toBeCloseTo(y1, 1);
    expect(x0).not.toBeCloseTo(x1, 1);
  });

  it('produces a vertical gradient vector at 180° (CSS "to bottom")', () => {
    const { canvas, ctx } = makeMockCanvas();
    const img = makeMockImage();
    const annotations: Annotation[] = [{
      id: '1', type: 'text', x: 0.1, y: 0.1, w: 0.3, h: 0.2,
      color: '#ffffff', strokeWidth: 4, text: 'Vertical',
      fontSize: 32,
      gradientEnabled: true,
      gradientColor1: '#ff0000',
      gradientColor2: '#0000ff',
      gradientAngle: 180,
    }];
    const config = { ...solidBgConfig, annotations };
    renderCanvas(canvas, img, config);

    const gradCall = ctx.calls.find(c => c.startsWith('createLinearGradient'));
    expect(gradCall).toBeDefined();
    const match = gradCall!.match(/createLinearGradient\(([^)]+)\)/);
    expect(match).toBeTruthy();
    const [x0, y0, x1, y1] = match![1].split(',').map(Number);
    expect(x0).toBeCloseTo(x1, 1);
    expect(y0).not.toBeCloseTo(y1, 1);
  });

  it('does not create gradient when only one color is present', () => {
    const { canvas, ctx } = makeMockCanvas();
    const img = makeMockImage();
    const annotations: Annotation[] = [{
      id: '1', type: 'text', x: 0.1, y: 0.1, w: 0.3, h: 0.2,
      color: '#ffffff', strokeWidth: 4, text: 'OneColor',
      fontSize: 32,
      gradientEnabled: true,
      gradientColor1: '#ff0080',
    }];
    const config = { ...solidBgConfig, annotations };
    renderCanvas(canvas, img, config);

    expect(ctx.calls.some(c => c.startsWith('fillText'))).toBe(true);
    expect(ctx.calls.some(c => c.startsWith('createLinearGradient'))).toBe(false);
  });
});
