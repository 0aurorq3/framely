import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, fireEvent } from '@testing-library/react';
import React from 'react';
import CanvasPreview from '../src/renderer/components/CanvasPreview';

// Mock AppContext
vi.mock('../src/renderer/AppContext', () => ({
  useAppContext: () => mockContext,
  AppProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

let mockContext: any = {};

beforeEach(() => {
  mockContext = {
    padding: 40,
    rounded: 16,
    shadow: 25,
    shadowColor: 'rgba(0, 0, 0, 0.3)',
    shadowEnabled: true,
    inset: 0,
    insetColor: 'rgba(255, 255, 255, 0.1)',
    border: 0,
    borderColor: '#ffffff',
    scale: 100,
    backgroundType: 'gradient',
    backgroundValue: 'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)',
    aspectRatio: 'Auto',
    canvasWidth: 800,
    canvasHeight: 600,
    paddingMode: 'fit',
    chromeStyle: 'none',
    chromeTheme: 'dark',
    blurDensity: 30,
    noImageMode: false,
    meshPoints: [],
    meshDataUrl: '',
    activePointIdx: 0,
    watermarkEnabled: false,
    watermarkText: 'Made with Framely',
    watermarkSize: 20,
    watermarkPosition: 'middle',
    watermarkOpacity: 0.4,
    position: 'Middle center',
    annotations: [],
    setAnnotations: vi.fn(),
    setAnnotationDisplayWidth: vi.fn(),
    setSelectedAnnotationId: vi.fn(),
    imageSrc: 'data:image/png;base64,mock',
    zoomLevel: 'Zoom to fit',
    setZoomLevel: vi.fn(),
    getZoomStyle: vi.fn(() => ({})),
    customPrompt: vi.fn(),
    handlePointerDown: vi.fn(),
    handlePointerMove: vi.fn(),
    handlePointerUp: vi.fn(),
    getCurrentConfig: vi.fn(() => mockContext),
    pushHistory: vi.fn(),
  };
});

describe('CanvasPreview Parity & Layout Tests', () => {
  it('computes correct card dimensions in Auto aspect ratio with padding', () => {
    const { container } = render(<CanvasPreview />);
    const img = container.querySelector('img[alt="Screenshot"]') as HTMLImageElement;
    if (img) {
      Object.defineProperty(img, 'naturalWidth', { value: 600, configurable: true });
      Object.defineProperty(img, 'naturalHeight', { value: 400, configurable: true });
      fireEvent.load(img);
    }

    const card = container.querySelector('.preview-background-card');
    // imgW (600) * scale (1.0) + paddingX (40*2) = 680
    // imgH (400) * scale (1.0) + paddingY (40*2) = 480
    expect(card).toHaveStyle({ width: '680px' });
    expect(card).toHaveStyle({ height: '480px' });
  });

  it('handles fixed aspect ratio 1:1 in fit padding mode', () => {
    mockContext.aspectRatio = '1:1';
    mockContext.paddingMode = 'fit';

    const { container } = render(<CanvasPreview />);
    const img = container.querySelector('img[alt="Screenshot"]') as HTMLImageElement;
    if (img) {
      Object.defineProperty(img, 'naturalWidth', { value: 800, configurable: true });
      Object.defineProperty(img, 'naturalHeight', { value: 600, configurable: true });
      fireEvent.load(img);
    }

    const card = container.querySelector('.preview-background-card');
    // contentW (800) + padX (80) = 880 width.
    // contentH (600) + padY (80) = 680.
    // Ratio = 880 / 680 = 1.29 > 1 (target ratio).
    // Width is bound, so height is calculated as width / targetRatio = 880 / 1 = 880
    // Width = 880px, Height = 880px
    expect(card).toHaveStyle({ width: '880px' });
    expect(card).toHaveStyle({ height: '880px' });
  });

  it('handles fixed aspect ratio 16:9 in fill padding mode', () => {
    mockContext.aspectRatio = '16:9';
    mockContext.paddingMode = 'fill';

    const { container } = render(<CanvasPreview />);
    const img = container.querySelector('img[alt="Screenshot"]') as HTMLImageElement;
    if (img) {
      Object.defineProperty(img, 'naturalWidth', { value: 960, configurable: true });
      Object.defineProperty(img, 'naturalHeight', { value: 540, configurable: true });
      fireEvent.load(img);
    }

    const card = container.querySelector('.preview-background-card');
    // baseWidth = Max(800, 960) = 960
    // height = baseWidth / (16/9) = 540
    expect(card).toHaveStyle({ width: '960px' });
    expect(card).toHaveStyle({ height: '540px' });
  });

  it('computes scale factor correctly for numeric zoom levels', () => {
    mockContext.zoomLevel = '150%';

    const { container } = render(<CanvasPreview />);
    const img = container.querySelector('img[alt="Screenshot"]') as HTMLImageElement;
    if (img) {
      Object.defineProperty(img, 'naturalWidth', { value: 500, configurable: true });
      Object.defineProperty(img, 'naturalHeight', { value: 300, configurable: true });
      fireEvent.load(img);
    }

    const wrapper = container.querySelector('.preview-card-wrapper');
    const card = container.querySelector('.preview-background-card');

    // dims: width = 500 + 80 = 580; height = 300 + 80 = 380
    // scale factor is 1.5
    // wrapper no longer sets width/height (avoids double-scale with the card transform)
    expect(wrapper).not.toHaveStyle({ width: '870px' });
    expect(card).toHaveStyle({ width: '580px' });
    expect(card).toHaveStyle({ height: '380px' });
    expect(card).toHaveStyle({ transform: 'scale(1.5)' });
  });

  it('calculates content size with chrome height for macOS style', () => {
    mockContext.chromeStyle = 'mac';
    mockContext.scale = 100;

    const { container } = render(<CanvasPreview />);
    const img = container.querySelector('img[alt="Screenshot"]') as HTMLImageElement;
    if (img) {
      Object.defineProperty(img, 'naturalWidth', { value: 800, configurable: true });
      Object.defineProperty(img, 'naturalHeight', { value: 600, configurable: true });
      fireEvent.load(img);
    }

    const box = container.querySelector('.preview-container-box');
    // imgH (600) + chromeOffset (32) = 632px
    expect(box).toHaveStyle({ width: '800px' });
    expect(box).toHaveStyle({ height: '632px' });
  });

  it('calculates content size with chrome height for Windows style', () => {
    mockContext.chromeStyle = 'windows';
    mockContext.scale = 80;

    const { container } = render(<CanvasPreview />);
    const img = container.querySelector('img[alt="Screenshot"]') as HTMLImageElement;
    if (img) {
      Object.defineProperty(img, 'naturalWidth', { value: 1000, configurable: true });
      Object.defineProperty(img, 'naturalHeight', { value: 500, configurable: true });
      fireEvent.load(img);
    }

    const box = container.querySelector('.preview-container-box');
    // contentW = 1000 * 0.8 = 800px
    // contentH = (500 + 32) * 0.8 = 532 * 0.8 = 425.6px -> 425.6px or ~426px style height depending on round
    expect(box).toHaveStyle({ width: '800px' });
    expect(box).toHaveStyle({ height: '425.6px' });
  });

  it('applies correct position styles in fixed aspect ratio mode', () => {
    mockContext.aspectRatio = '16:9';
    mockContext.position = 'Bottom center';
    mockContext.padding = 24;

    const { container } = render(<CanvasPreview />);
    const box = container.querySelector('.preview-container-box');
    expect(box).toHaveStyle({
      position: 'absolute',
      left: '176px',
      top: '24px',
    });
  });
});
