import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import * as fs from 'fs';
import * as path from 'path';
import CanvasWatermark from '../src/renderer/components/CanvasWatermark';
import {
  getWatermarkCanvasPlacement,
  getWatermarkCssPlacement,
  getWatermarkInset,
  WATERMARK_POSITIONS,
  type WatermarkPosition,
} from '../src/shared/watermark';

describe('CanvasWatermark', () => {
  it('renders nothing when watermarkEnabled is false', () => {
    const { container } = render(
      <CanvasWatermark
        watermarkEnabled={false}
        watermarkText="Test"
        padding={38}
      />
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders nothing when watermarkText is empty', () => {
    const { container } = render(
      <CanvasWatermark
        watermarkEnabled={true}
        watermarkText=""
        padding={38}
      />
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders watermark text when enabled', () => {
    render(
      <CanvasWatermark
        watermarkEnabled={true}
        watermarkText="My Brand"
        padding={38}
      />
    );
    expect(screen.getByText('My Brand')).toBeTruthy();
  });

  // Regression: opacity was incorrectly divided by 100 (0.45 became 0.0045)
  it('applies opacity directly without dividing by 100 (regression)', () => {
    const { container } = render(
      <CanvasWatermark
        watermarkEnabled={true}
        watermarkText="Brand"
        watermarkOpacity={0.45}
        padding={38}
      />
    );
    const el = container.firstChild as HTMLElement;
    // Opacity must be 0.45, NOT 0.0045
    expect(el.style.opacity).toBe('0.45');
  });

  it('opacity 0.15 renders as 0.15, not 0.0015', () => {
    const { container } = render(
      <CanvasWatermark
        watermarkEnabled={true}
        watermarkText="Brand"
        watermarkOpacity={0.15}
        padding={38}
      />
    );
    const el = container.firstChild as HTMLElement;
    expect(parseFloat(el.style.opacity)).toBeCloseTo(0.15, 3);
    expect(parseFloat(el.style.opacity)).toBeGreaterThan(0.01);
  });

  it('uses default opacity 0.45 when watermarkOpacity is undefined', () => {
    const { container } = render(
      <CanvasWatermark
        watermarkEnabled={true}
        watermarkText="Brand"
        padding={38}
      />
    );
    const el = container.firstChild as HTMLElement;
    expect(parseFloat(el.style.opacity)).toBeCloseTo(0.45, 3);
  });

  it('applies correct font size', () => {
    const { container } = render(
      <CanvasWatermark
        watermarkEnabled={true}
        watermarkText="Brand"
        watermarkSize={32}
        padding={38}
      />
    );
    const el = container.firstChild as HTMLElement;
    expect(el.style.fontSize).toBe('32px');
  });

  it('applies correct font family, weight, and style', () => {
    const { container } = render(
      <CanvasWatermark
        watermarkEnabled={true}
        watermarkText="Brand"
        watermarkFont="Georgia"
        watermarkBold={true}
        watermarkItalic={true}
        padding={38}
      />
    );
    const el = container.firstChild as HTMLElement;
    expect(el.style.fontFamily).toBe('Georgia');
    expect(el.style.fontWeight).toBe('bold');
    expect(el.style.fontStyle).toBe('italic');
  });

  const positionExpectations: Record<
    WatermarkPosition,
    {
      top?: string;
      bottom?: string;
      left?: string;
      right?: string;
      transform: string;
    }
  > = {
    left: { bottom: '10px', left: '10px', right: 'auto', top: 'auto', transform: 'none' },
    middle: { bottom: '10px', left: '50%', right: 'auto', top: 'auto', transform: 'translateX(-50%)' },
    right: { bottom: '10px', right: '10px', left: 'auto', top: 'auto', transform: 'none' },
    'top left': { top: '10px', left: '10px', right: 'auto', bottom: 'auto', transform: 'none' },
    'top middle': { top: '10px', left: '50%', right: 'auto', bottom: 'auto', transform: 'translateX(-50%)' },
    'top right': { top: '10px', right: '10px', left: 'auto', bottom: 'auto', transform: 'none' },
  };

  it.each(WATERMARK_POSITIONS)(
    'positions watermark near card edge for %s',
    (watermarkPosition) => {
      const { container } = render(
        <CanvasWatermark
          watermarkEnabled={true}
          watermarkText="Brand"
          watermarkPosition={watermarkPosition}
          padding={60}
        />
      );
      const el = container.firstChild as HTMLElement;
      const expected = positionExpectations[watermarkPosition];

      if (expected.top) expect(el.style.top).toBe(expected.top);
      if (expected.bottom) expect(el.style.bottom).toBe(expected.bottom);
      if (expected.left) expect(el.style.left).toBe(expected.left);
      if (expected.right) expect(el.style.right).toBe(expected.right);
      expect(el.style.transform).toBe(expected.transform);
    }
  );

  // Regression: with zero/small padding, safe inset must be at least fontSize*0.5
  // to prevent text from being clipped by card border-radius overflow:hidden
  it('uses fontSize*0.5 safe inset when padding is 0', () => {
    const { container } = render(
      <CanvasWatermark
        watermarkEnabled={true}
        watermarkText="Brand"
        watermarkPosition="left"
        watermarkSize={20}
        padding={0}
      />
    );
    const el = container.firstChild as HTMLElement;
    // safeInset = max(0*0.15, 20*0.5) = max(0, 10) = 10px
    expect(el.style.left).toBe('10px');
    expect(el.style.bottom).toBe('10px');
  });

  it('uses padding*0.15 when it exceeds fontSize*0.5', () => {
    const { container } = render(
      <CanvasWatermark
        watermarkEnabled={true}
        watermarkText="Brand"
        watermarkPosition="top left"
        watermarkSize={20}
        padding={90}
      />
    );
    const el = container.firstChild as HTMLElement;
    // safeInset = max(90*0.15, 20*0.5) = max(13.5, 10) = 14px
    expect(el.style.left).toBe('14px');
    expect(el.style.top).toBe('14px');
  });

  it.each(WATERMARK_POSITIONS)(
    'preview placement helper matches rendered styles for %s',
    (watermarkPosition) => {
      const inset = getWatermarkInset(38, 20);
      const { container } = render(
        <CanvasWatermark
          watermarkEnabled={true}
          watermarkText="Brand"
          watermarkPosition={watermarkPosition}
          watermarkSize={20}
          padding={38}
        />
      );
      const el = container.firstChild as HTMLElement;
      const placement = getWatermarkCssPlacement(watermarkPosition, inset);

      expect(el.style.top).toBe(placement.top ?? '');
      expect(el.style.bottom).toBe(placement.bottom ?? '');
      expect(el.style.left).toBe(placement.left ?? '');
      expect(el.style.right).toBe(placement.right ?? '');
      expect(el.style.transform).toBe(placement.transform);
    }
  );

  it.each(WATERMARK_POSITIONS)(
    'canvas placement uses the same inset on card edges for %s',
    (watermarkPosition) => {
      const width = 800;
      const height = 600;
      const inset = getWatermarkInset(38, 20);
      const placement = getWatermarkCanvasPlacement(width, height, watermarkPosition, inset);

      if (watermarkPosition === 'left' || watermarkPosition === 'top left') {
        expect(placement.x).toBe(inset);
      } else if (watermarkPosition === 'right' || watermarkPosition === 'top right') {
        expect(placement.x).toBe(width - inset);
      } else {
        expect(placement.x).toBe(width / 2);
      }

      if (watermarkPosition.startsWith('top')) {
        expect(placement.y).toBe(inset);
        expect(placement.textBaseline).toBe('top');
      } else {
        expect(placement.y).toBe(height - inset);
        expect(placement.textBaseline).toBe('bottom');
      }
    }
  );

  // Regression: .preview-watermark CSS class sets left:50% transform:translateX(-50%)
  // For right/left positions the inline styles must explicitly reset these to prevent
  // the CSS class from shifting text outside the card (clipping) or stretching to center.
  it('right position sets right and explicitly clears left and transform', () => {
    const { container } = render(
      <CanvasWatermark
        watermarkEnabled={true}
        watermarkText="Brand"
        watermarkPosition="right"
        padding={38}
      />
    );
    const el = container.firstChild as HTMLElement;
    expect(el.style.right).not.toBe('');
    // left must be 'auto' to prevent CSS-class left:50% from making text appear centered
    expect(el.style.left).toBe('auto');
    // transform must be 'none' to prevent CSS-class translateX(-50%) from shifting text off-screen
    expect(el.style.transform).toBe('none');
  });

  it('top right position sets right/top and clears left and transform', () => {
    const { container } = render(
      <CanvasWatermark
        watermarkEnabled={true}
        watermarkText="Brand"
        watermarkPosition="top right"
        padding={38}
      />
    );
    const el = container.firstChild as HTMLElement;
    expect(el.style.right).not.toBe('');
    expect(el.style.top).not.toBe('');
    expect(el.style.left).toBe('auto');
    expect(el.style.transform).toBe('none');
  });

  it('left position sets left and clears transform to prevent CSS-class translateX shift', () => {
    const { container } = render(
      <CanvasWatermark
        watermarkEnabled={true}
        watermarkText="Brand"
        watermarkPosition="left"
        padding={38}
      />
    );
    const el = container.firstChild as HTMLElement;
    expect(el.style.left).not.toBe('auto');
    // transform must be 'none' so text is not shifted -50% of its width outside the card
    expect(el.style.transform).toBe('none');
    expect(el.style.right).toBe('auto');
  });

  it('center position sets left:50% and transform:translateX(-50%)', () => {
    const { container } = render(
      <CanvasWatermark
        watermarkEnabled={true}
        watermarkText="Brand"
        watermarkPosition="middle"
        padding={38}
      />
    );
    const el = container.firstChild as HTMLElement;
    expect(el.style.left).toBe('50%');
    expect(el.style.transform).toBe('translateX(-50%)');
    expect(el.style.right).toBe('auto');
  });
});

// Regression: canvas renderer drawWatermark must also use opacity as-is (0–1)
import { renderCanvas, RenderConfig } from '../src/renderer/canvasRenderer';
import { makeMockCanvas, baseConfig } from './shared';

describe('drawWatermark canvas opacity parity', () => {
  it('globalAlpha uses watermarkOpacity directly as 0-1, matching CanvasWatermark CSS', () => {
    const { canvas, ctx } = makeMockCanvas();
    const config: RenderConfig = {
      ...baseConfig,
      watermarkEnabled: true,
      watermarkText: 'Brand',
      watermarkOpacity: 0.45,
    };
    renderCanvas(canvas, null, { ...config, noImage: true });
    expect(ctx._state.globalAlpha).toBe(0.45);
    expect(ctx._state.fillStyle).toBe('#ffffff');
  });

  it('applies custom watermarkFont, watermarkBold, and watermarkItalic to canvas font property', () => {
    const { canvas, ctx } = makeMockCanvas();
    const config: RenderConfig = {
      ...baseConfig,
      watermarkEnabled: true,
      watermarkText: 'Brand',
      watermarkSize: 25,
      watermarkFont: 'Courier New',
      watermarkBold: true,
      watermarkItalic: true,
    };
    renderCanvas(canvas, null, { ...config, noImage: true });
    expect(ctx._state.font).toBe('italic bold 25px Courier New');
  });

  it('watermark is invisible (fillText skipped) when watermarkEnabled is false', () => {
    const { canvas, ctx } = makeMockCanvas();
    const config: RenderConfig = {
      ...baseConfig,
      watermarkEnabled: false,
      watermarkText: 'Brand',
      watermarkOpacity: 0.45,
    };
    renderCanvas(canvas, null, { ...config, noImage: true });
    expect(ctx.calls.some((c: string) => c.startsWith('fillText'))).toBe(false);
  });

  it('watermark is visible (fillText called) when watermarkEnabled is true', () => {
    const { canvas, ctx } = makeMockCanvas();
    const config: RenderConfig = {
      ...baseConfig,
      watermarkEnabled: true,
      watermarkText: 'Brand',
      watermarkOpacity: 0.45,
    };
    renderCanvas(canvas, null, { ...config, noImage: true });
    expect(ctx.calls.some((c: string) => c.startsWith('fillText'))).toBe(true);
  });
});

describe('Watermark CSS color parity', () => {
  it('index.css has .preview-watermark color: #ffffff to prevent double-applied opacity', () => {
    const cssPath = path.resolve(__dirname, '../src/renderer/index.css');
    const cssContent = fs.readFileSync(cssPath, 'utf-8');
    const ruleMatch = cssContent.match(/\.preview-watermark\s*\{([^}]+)\}/);
    expect(ruleMatch).not.toBeNull();
    const ruleBody = ruleMatch![1];
    expect(ruleBody).toContain('color: #ffffff');
  });
});
