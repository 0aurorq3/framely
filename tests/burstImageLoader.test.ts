import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import type { RenderConfig } from '../src/renderer/canvasRenderer';

const mockPreloadBgImage = vi.hoisted(() => vi.fn((_url: string, onDone: () => void) => onDone()));

vi.mock('../src/renderer/canvasRenderer', () => ({
  preloadBgImage: mockPreloadBgImage,
}));

import { loadBurstImages } from '../src/renderer/utils/burstImageLoader';

function makeConfig(overrides: Partial<RenderConfig> = {}): RenderConfig {
  return {
    padding: 38,
    rounded: 20,
    scale: 100,
    backgroundType: 'solid',
    backgroundValue: '#ffffff',
    aspectRatio: 'Auto',
    canvasWidth: 800,
    canvasHeight: 600,
    selectedPreset: '',
    noImage: false,
    ...overrides,
  } as RenderConfig;
}

describe('loadBurstImages', () => {
  const OriginalImage = globalThis.Image;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    globalThis.Image = OriginalImage;
  });

  it('invokes callback immediately with null in no-image mode without screenshot', () => {
    const callback = vi.fn();
    loadBurstImages(null, true, () => makeConfig(), callback);
    expect(callback).toHaveBeenCalledWith(null);
  });

  it('loads screenshot and passes image to callback on success', () => {
    const callback = vi.fn();
    class MockImage {
      onload: (() => void) | null = null;
      onerror: (() => void) | null = null;
      set src(_value: string) {
        queueMicrotask(() => this.onload?.());
      }
    }
    globalThis.Image = MockImage as unknown as typeof Image;

    loadBurstImages('data:image/png;base64,abc', false, () => makeConfig(), callback);
    return Promise.resolve().then(() => {
      expect(callback).toHaveBeenCalledTimes(1);
      expect(callback.mock.calls[0][0]).toBeInstanceOf(MockImage);
    });
  });

  it('still invokes callback when screenshot load fails', () => {
    const callback = vi.fn();
    class MockImage {
      onload: (() => void) | null = null;
      onerror: (() => void) | null = null;
      set src(_value: string) {
        queueMicrotask(() => this.onerror?.());
      }
    }
    globalThis.Image = MockImage as unknown as typeof Image;

    loadBurstImages('data:image/png;base64,bad', false, () => makeConfig(), callback);
    return Promise.resolve().then(() => {
      expect(callback).toHaveBeenCalledTimes(1);
    });
  });

  it('preloads gradient background image URLs before callback', () => {
    const callback = vi.fn();
    const config = makeConfig({
      backgroundType: 'gradient',
      backgroundValue:
        "linear-gradient(135deg, #fff 0%), url('https://example.com/bg.png') center",
    });

    loadBurstImages(null, true, () => config, callback);
    expect(mockPreloadBgImage).toHaveBeenCalledWith('https://example.com/bg.png', expect.any(Function));
    expect(callback).toHaveBeenCalledWith(null);
  });
});