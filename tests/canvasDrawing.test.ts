import { describe, it, expect, vi } from 'vitest';
import { drawRoundedRectPath, renderCanvas, RenderConfig } from '../src/renderer/canvasRenderer';
import { makeMockCtx } from './shared';

describe('Canvas Drawing', () => {
  it('draws rounded rect path with roundRect available', () => {
    const ctx = makeMockCtx();
    expect(() => drawRoundedRectPath(ctx, 0, 0, 100, 100, 10)).not.toThrow();
  });

  it('draws rounded rect path with manual fallback', () => {
    const ctx = makeMockCtx();
    (ctx as any).roundRect = undefined;
    expect(() => drawRoundedRectPath(ctx, 0, 0, 100, 100, 10)).not.toThrow();
  });

  it('renders canvas in Code Studio mode without throwing', () => {
    const canvas = document.createElement('canvas');
    const mockCtx = makeMockCtx();
    vi.spyOn(canvas, 'getContext').mockReturnValue(mockCtx as any);

    const config: RenderConfig = {
      padding: 38,
      rounded: 20,
      shadow: 30,
      shadowColor: 'rgba(0, 0, 0, 0.45)',
      shadowEnabled: true,
      inset: 0,
      insetColor: 'rgba(255, 255, 255, 0.25)',
      border: 0,
      borderColor: '#ffffff',
      scale: 100,
      backgroundType: 'gradient',
      backgroundValue: 'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)',
      aspectRatio: 'Auto',
      canvasWidth: 800,
      canvasHeight: 600,
      paddingMode: 'fit',
      chromeStyle: 'mac',
      chromeTheme: 'dark',
      watermarkEnabled: false,
      watermarkText: 'Made with Framely',
      position: 'Middle center',
      noImage: true,
      codeStudioActive: true,
      codeStudioCode: 'const x = 42;\nconsole.log(x);',
      codeStudioLanguage: 'javascript',
      codeStudioTheme: 'Dracula',
      codeStudioFontSize: 14,
      codeStudioLineNumbers: true,
      codeStudioShowLanguage: true,
      codeStudioBreakpoints: [1],
      codeStudioShowBreakpoints: true,
    };

    expect(() => renderCanvas(canvas, null, config)).not.toThrow();
  });
});
