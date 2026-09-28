import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import type { RenderConfig } from '../src/renderer/canvasRenderer';

const { mockRenderCanvas, mockLoadBurstImages } = vi.hoisted(() => ({
  mockRenderCanvas: vi.fn(),
  mockLoadBurstImages: vi.fn(),
}));

vi.mock('../src/renderer/canvasRenderer', () => ({
  renderCanvas: mockRenderCanvas,
}));

vi.mock('../src/renderer/utils/burstImageLoader', () => ({
  loadBurstImages: mockLoadBurstImages,
}));

import { useBurstPack } from '../src/renderer/hooks/useBurstPack';

function makeSmallBase64() {
  return 'data:image/png;base64,' + 'A'.repeat(100);
}

function makeConfig(): RenderConfig {
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
    chromeStyle: 'mac',
    position: { x: 0, y: 0 },
  } as unknown as RenderConfig;
}

function makeFakeImage() {
  return {
    naturalWidth: 1200,
    naturalHeight: 800,
    width: 1200,
    height: 800,
  } as HTMLImageElement;
}

describe('useBurstPack', () => {
  const mockGetCurrentConfig = vi.fn(makeConfig);
  const mockEnsureDocumentName = vi.fn(() => 'my-screenshot');
  const mockSaveBurstPack = vi.fn();

  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllMocks();
    mockRenderCanvas.mockImplementation((canvas: HTMLCanvasElement) => {
      canvas.toDataURL = () => makeSmallBase64();
    });
    mockLoadBurstImages.mockImplementation(
      (_src, _noImage, _getConfig, callback: (img: HTMLImageElement | null) => void) => {
        callback(makeFakeImage());
      }
    );
    mockSaveBurstPack.mockResolvedValue({
      success: true,
      data: {
        variantCount: 4,
        bundlePath: '/exports/my-screenshot',
        documentName: 'my-screenshot',
        primaryExportPath: '/exports/my-screenshot/og.png',
      },
    });
    window.framelyAPI = {
      saveBurstPack: mockSaveBurstPack,
    } as unknown as typeof window.framelyAPI;
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('opens and closes the modal when idle', () => {
    const { result } = renderHook(() =>
      useBurstPack('img-src', false, mockGetCurrentConfig, mockEnsureDocumentName, 'png', 90, 'balanced')
    );

    expect(result.current.modalOpen).toBe(false);
    act(() => result.current.openModal());
    expect(result.current.modalOpen).toBe(true);
    act(() => result.current.closeModal());
    expect(result.current.modalOpen).toBe(false);
  });

  it('returns failure when image is required but missing', async () => {
    const { result } = renderHook(() =>
      useBurstPack(null, false, mockGetCurrentConfig, mockEnsureDocumentName, 'png', 90, 'balanced')
    );

    let saveResult: { success: boolean };
    await act(async () => {
      saveResult = await result.current.saveBurstPack('launch-kit', []);
    });
    expect(saveResult!.success).toBe(false);
    expect(mockSaveBurstPack).not.toHaveBeenCalled();
  });

  it('returns failure when framelyAPI is unavailable', async () => {
    window.framelyAPI = undefined as unknown as typeof window.framelyAPI;
    const { result } = renderHook(() =>
      useBurstPack('img-src', false, mockGetCurrentConfig, mockEnsureDocumentName, 'png', 90, 'balanced')
    );

    let saveResult: { success: boolean };
    await act(async () => {
      saveResult = await result.current.saveBurstPack('launch-kit', []);
    });
    expect(saveResult!.success).toBe(false);
  });

  it('returns failure when no presets resolve', async () => {
    const { result } = renderHook(() =>
      useBurstPack('img-src', false, mockGetCurrentConfig, mockEnsureDocumentName, 'png', 90, 'balanced')
    );

    let saveResult: { success: boolean };
    await act(async () => {
      saveResult = await result.current.saveBurstPack(null, []);
    });
    expect(saveResult!.success).toBe(false);
  });

  it('saves launch kit variants through IPC', async () => {
    const { result } = renderHook(() =>
      useBurstPack('data:image/png;base64,abc', false, mockGetCurrentConfig, mockEnsureDocumentName, 'png', 90, 'balanced')
    );

    act(() => result.current.openModal());

    let saveResult: { success: boolean; variantCount?: number };
    await act(async () => {
      saveResult = await result.current.saveBurstPack('launch-kit', []);
    });

    expect(saveResult!.success).toBe(true);
    expect(saveResult!.variantCount).toBe(4);
    expect(mockRenderCanvas).toHaveBeenCalled();
    expect(mockSaveBurstPack).toHaveBeenCalledWith(
      expect.objectContaining({
        documentName: 'my-screenshot',
        exportFormat: 'png',
        compressionMode: 'balanced',
        variants: expect.arrayContaining([
          expect.objectContaining({
            presetKey: 'Open Graph - OG Standard',
            filename: expect.stringMatching(/\.png$/),
          }),
        ]),
      })
    );
    // Stay open so the launch checklist (viral post-export UX) can show
    expect(result.current.modalOpen).toBe(true);
    expect(result.current.phase).toBe('done');
    expect(result.current.lastResult?.variantCount).toBe(4);
    expect(result.current.toast).toContain('Burst Pack saved');
  });

  it('shows error toast when IPC save fails', async () => {
    mockSaveBurstPack.mockResolvedValueOnce({
      success: false,
      error: { code: 'DISK_FULL', message: 'No space left' },
    });

    const { result } = renderHook(() =>
      useBurstPack('data:image/png;base64,abc', false, mockGetCurrentConfig, mockEnsureDocumentName, 'png', 90, 'balanced')
    );

    let saveResult: { success: boolean; error?: string };
    await act(async () => {
      saveResult = await result.current.saveBurstPack('launch-kit', []);
    });

    expect(saveResult!.success).toBe(false);
    expect(saveResult!.error).toBe('No space left');
    expect(result.current.toast).toBe('No space left');
  });

  it('handles render exceptions gracefully', async () => {
    mockRenderCanvas.mockImplementation(() => {
      throw new Error('Canvas blew up');
    });

    const { result } = renderHook(() =>
      useBurstPack('data:image/png;base64,abc', false, mockGetCurrentConfig, mockEnsureDocumentName, 'png', 90, 'balanced')
    );

    let saveResult: { success: boolean; error?: string };
    await act(async () => {
      saveResult = await result.current.saveBurstPack('launch-kit', []);
    });

    expect(saveResult!.success).toBe(false);
    expect(saveResult!.error).toBe('Canvas blew up');
    expect(result.current.toast).toBe('Canvas blew up');
  });

  it('blocks closeModal while rendering or saving', async () => {
    let resolveSave: (value: unknown) => void = () => {};
    mockSaveBurstPack.mockReturnValue(new Promise((resolve) => {
      resolveSave = resolve;
    }));

    const { result } = renderHook(() =>
      useBurstPack('data:image/png;base64,abc', false, mockGetCurrentConfig, mockEnsureDocumentName, 'png', 90, 'balanced')
    );

    act(() => result.current.openModal());
    let savePromise: Promise<unknown>;
    act(() => {
      savePromise = result.current.saveBurstPack('launch-kit', []);
    });

    expect(result.current.phase).toBe('saving');
    act(() => result.current.closeModal());
    expect(result.current.modalOpen).toBe(true);

    await act(async () => {
      resolveSave({
        success: true,
        data: { variantCount: 4, bundlePath: '/exports/my-screenshot', documentName: 'my-screenshot' },
      });
      await savePromise!;
      vi.runAllTimers();
    });
  });

  it('fails when all custom preset keys are invalid', async () => {
    const { result } = renderHook(() =>
      useBurstPack('data:image/png;base64,abc', false, mockGetCurrentConfig, mockEnsureDocumentName, 'png', 90, 'balanced')
    );

    let saveResult: { success: boolean; error?: string };
    await act(async () => {
      saveResult = await result.current.saveBurstPack(null, ['Not A Real Preset']);
    });

    expect(saveResult!.success).toBe(false);
    expect(saveResult!.error).toBe('No variants rendered');
    expect(result.current.toast).toBe('No valid platform presets selected');
    expect(mockSaveBurstPack).not.toHaveBeenCalled();
  });

  it('supports no-image mode without screenshot source', async () => {
    const { result } = renderHook(() =>
      useBurstPack(null, true, mockGetCurrentConfig, mockEnsureDocumentName, 'jpeg', 85, 'small')
    );

    let saveResult: { success: boolean };
    await act(async () => {
      saveResult = await result.current.saveBurstPack('social-story-kit', []);
    });

    expect(saveResult!.success).toBe(true);
    expect(mockLoadBurstImages).toHaveBeenCalledWith(null, true, mockGetCurrentConfig, expect.any(Function));
  });
});
