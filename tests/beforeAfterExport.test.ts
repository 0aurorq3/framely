import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { composeBeforeAfter, renderRawBeforePanel } from '../src/renderer/utils/beforeAfterExport';

function mockCtx() {
  return {
    fillStyle: '',
    strokeStyle: '',
    font: '',
    textAlign: 'left',
    textBaseline: 'alphabetic',
    shadowColor: '',
    shadowBlur: 0,
    shadowOffsetY: 0,
    imageSmoothingEnabled: true,
    imageSmoothingQuality: 'high',
    fillRect: vi.fn(),
    drawImage: vi.fn(),
    fillText: vi.fn(),
    beginPath: vi.fn(),
    rect: vi.fn(),
    fill: vi.fn(),
    clip: vi.fn(),
    save: vi.fn(),
    restore: vi.fn(),
    moveTo: vi.fn(),
    lineTo: vi.fn(),
    stroke: vi.fn(),
    roundRect: vi.fn(),
  };
}

function makeCanvas(w: number, h: number): HTMLCanvasElement {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  return c;
}

function makeImage(w: number, h: number): HTMLImageElement {
  const img = document.createElement('img');
  Object.defineProperty(img, 'naturalWidth', { value: w, configurable: true });
  Object.defineProperty(img, 'naturalHeight', { value: h, configurable: true });
  Object.defineProperty(img, 'width', { value: w, configurable: true });
  Object.defineProperty(img, 'height', { value: h, configurable: true });
  return img;
}

describe('beforeAfterExport', () => {
  let getContextSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    getContextSpy = vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockImplementation(() => mockCtx() as any);
  });

  afterEach(() => {
    getContextSpy.mockRestore();
  });

  it('renderRawBeforePanel sizes to target height with padding', () => {
    const img = makeImage(400, 200);
    const panel = renderRawBeforePanel(img, 100);
    // height = targetH + pad*2 = 100 + 40
    expect(panel.height).toBe(140);
    // width = scaledW + pad*2 = 200 + 40
    expect(panel.width).toBe(240);
  });

  it('composeBeforeAfter lays out two panels side by side with labels', () => {
    const before = makeCanvas(200, 100);
    const after = makeCanvas(300, 150);
    const out = composeBeforeAfter(before, after, {
      gap: 20,
      padding: 16,
      maxPanelHeight: 900,
    });
    // width = pad*2 + beforeW + gap + afterW
    expect(out.width).toBe(16 * 2 + 200 + 20 + 300);
    // Height includes the label band and panel.
    expect(out.height).toBeGreaterThan(150 + 16 * 2);
  });

  it('composeBeforeAfter downscales tall panels', () => {
    const before = makeCanvas(100, 1200);
    const after = makeCanvas(100, 1200);
    const out = composeBeforeAfter(before, after, { maxPanelHeight: 400, padding: 10, gap: 10 });
    // each panel height capped at 400; total height < raw 1200
    expect(out.height).toBeLessThan(900);
  });

  it('supports an optional custom footer', () => {
    const before = makeCanvas(50, 50);
    const after = makeCanvas(50, 50);
    const out = composeBeforeAfter(before, after, { brandFooter: 'Custom footer' });
    expect(out.width).toBeGreaterThan(0);
    expect(out.height).toBeGreaterThan(0);
  });
});
