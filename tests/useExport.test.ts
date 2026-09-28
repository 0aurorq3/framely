import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';

const { mockRenderCanvas } = vi.hoisted(() => ({
  mockRenderCanvas: vi.fn(),
}));

vi.mock('../src/renderer/canvasRenderer', () => ({
  renderCanvas: mockRenderCanvas,
}));

import { useExport } from '../src/renderer/hooks/useExport';
import { RenderConfig } from '../src/renderer/canvasRenderer';

// Simulates a canvas whose toDataURL returns a small base64 payload (~0.7KB actual)
function makeSmallBase64() {
  return 'data:image/png;base64,' + 'A'.repeat(1000);
}

// Simulates a canvas whose toDataURL returns ~9MB base64 payload
function makeLargeBase64() {
  return 'data:image/png;base64,' + 'A'.repeat(12000000);
}

describe('useExport', () => {
  let mockGetCurrentConfig: ReturnType<typeof vi.fn<() => RenderConfig>>;

  beforeEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
    mockRenderCanvas.mockReset();

    mockGetCurrentConfig = vi.fn<() => RenderConfig>().mockReturnValue({
      padding: 38,
      rounded: 20,
      scale: 100,
      backgroundType: 'gradient',
      backgroundValue: 'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)',
      aspectRatio: 'Auto',
      canvasWidth: 800,
      canvasHeight: 600,
      selectedPreset: '',
      noImage: false,
    } as unknown as RenderConfig);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // Simple helper: mock renderCanvas to produce a given base64 payload
  function stubCanvas(size: 'small' | 'large') {
    const toData = size === 'large' ? makeLargeBase64() : makeSmallBase64();
    mockRenderCanvas.mockImplementation((canvas: HTMLCanvasElement) => {
      canvas.toDataURL = () => toData;
      canvas.toBlob = (cb: (b: Blob) => void) => {
        cb(new Blob([toData], { type: 'image/png' }));
      };
    });
  }

  // -----------------------------------------------------------------------
  // initial state
  // -----------------------------------------------------------------------
  describe('initial state', () => {
    it('defaults export format to png', () => {
      const { result } = renderHook(() =>
        useExport('test-image', false, mockGetCurrentConfig)
      );
      expect(result.current.exportFormat).toBe('png');
    });

    it('defaults jpeg quality to 90', () => {
      const { result } = renderHook(() =>
        useExport('test-image', false, mockGetCurrentConfig)
      );
      expect(result.current.jpegQuality).toBe(90);
    });

    it('defaults compression mode to balanced', () => {
      const { result } = renderHook(() =>
        useExport('test-image', false, mockGetCurrentConfig)
      );
      expect(result.current.compressionMode).toBe('balanced');
    });

    it('reads export format from localStorage if available', () => {
      localStorage.setItem('framely-user-defaults', JSON.stringify({ exportFormat: 'jpeg' }));
      const { result } = renderHook(() =>
        useExport('test-image', false, mockGetCurrentConfig)
      );
      expect(result.current.exportFormat).toBe('jpeg');
    });

    it('reads webp export format from localStorage if available', () => {
      localStorage.setItem('framely-user-defaults', JSON.stringify({ exportFormat: 'webp' }));
      const { result } = renderHook(() =>
        useExport('test-image', false, mockGetCurrentConfig)
      );
      expect(result.current.exportFormat).toBe('webp');
    });

    it('reads jpeg quality from localStorage if available', () => {
      localStorage.setItem('framely-user-defaults', JSON.stringify({ jpegQuality: 75 }));
      const { result } = renderHook(() =>
        useExport('test-image', false, mockGetCurrentConfig)
      );
      expect(result.current.jpegQuality).toBe(75);
    });

    it('reads compression mode from localStorage if available', () => {
      localStorage.setItem('framely-user-defaults', JSON.stringify({ compressionMode: 'small' }));
      const { result } = renderHook(() =>
        useExport('test-image', false, mockGetCurrentConfig)
      );
      expect(result.current.compressionMode).toBe('small');
    });

    it('handles malformed localStorage gracefully for export format', () => {
      localStorage.setItem('framely-user-defaults', 'bad-json');
      const { result } = renderHook(() =>
        useExport('test-image', false, mockGetCurrentConfig)
      );
      expect(result.current.exportFormat).toBe('png');
    });

    it('handles malformed localStorage gracefully for jpeg quality', () => {
      localStorage.setItem('framely-user-defaults', 'bad-json');
      const { result } = renderHook(() =>
        useExport('test-image', false, mockGetCurrentConfig)
      );
      expect(result.current.jpegQuality).toBe(90);
    });

    it('ignores invalid compression mode from localStorage', () => {
      localStorage.setItem('framely-user-defaults', JSON.stringify({ compressionMode: 'tiny' }));
      const { result } = renderHook(() =>
        useExport('test-image', false, mockGetCurrentConfig)
      );
      expect(result.current.compressionMode).toBe('balanced');
    });

    it('ignores invalid export format from localStorage', () => {
      localStorage.setItem('framely-user-defaults', JSON.stringify({ exportFormat: 'gif' }));
      const { result } = renderHook(() =>
        useExport('test-image', false, mockGetCurrentConfig)
      );
      expect(result.current.exportFormat).toBe('png');
    });
  });

  // -----------------------------------------------------------------------
  // setExportFormat
  // -----------------------------------------------------------------------
  describe('setExportFormat', () => {
    it('updates export format state', () => {
      const { result } = renderHook(() =>
        useExport('test-image', false, mockGetCurrentConfig)
      );
      act(() => {
        result.current.setExportFormat('jpeg');
      });
      expect(result.current.exportFormat).toBe('jpeg');
    });

    it('can switch to webp', () => {
      const { result } = renderHook(() =>
        useExport('test-image', false, mockGetCurrentConfig)
      );
      act(() => {
        result.current.setExportFormat('webp');
      });
      expect(result.current.exportFormat).toBe('webp');
    });
  });

  // -----------------------------------------------------------------------
  // setJpegQuality
  // -----------------------------------------------------------------------
  describe('setJpegQuality', () => {
    it('updates jpeg quality state', () => {
      const { result } = renderHook(() =>
        useExport('test-image', false, mockGetCurrentConfig)
      );
      act(() => {
        result.current.setJpegQuality(50);
      });
      expect(result.current.jpegQuality).toBe(50);
    });
  });

  // -----------------------------------------------------------------------
  // checkOgSizeLimit (exercised via triggerExport)
  // -----------------------------------------------------------------------
  describe('checkOgSizeLimit', () => {
    it('does NOT call confirm for OG preset with small file', () => {
      stubCanvas('small');
      const mockConfirm = vi.fn();
      vi.stubGlobal('confirm', mockConfirm);
      mockGetCurrentConfig.mockReturnValue({
        ...mockGetCurrentConfig(),
        selectedPreset: 'OG Image',
      });

      const { result } = renderHook(() =>
        useExport(null, true, mockGetCurrentConfig)
      );

      act(() => {
        result.current.triggerExport();
      });

      expect(mockConfirm).not.toHaveBeenCalled();
    });

    it('calls confirm for OG preset with large file', () => {
      stubCanvas('large');
      const mockConfirm = vi.fn().mockReturnValue(false);
      vi.stubGlobal('confirm', mockConfirm);

      mockGetCurrentConfig.mockReturnValue({
        ...mockGetCurrentConfig(),
        selectedPreset: 'OG Image',
      });

      const { result } = renderHook(() =>
        useExport(null, true, mockGetCurrentConfig)
      );

      act(() => {
        result.current.triggerExport();
      });

      expect(mockConfirm).toHaveBeenCalled();
    });

    it('does NOT call confirm for non-OG preset with large file', () => {
      stubCanvas('large');
      const mockConfirm = vi.fn();
      vi.stubGlobal('confirm', mockConfirm);
      // Provide framelyAPI so link.click() is avoided in jsdom
      vi.stubGlobal('framelyAPI', { saveFile: vi.fn() });

      mockGetCurrentConfig.mockReturnValue({
        ...mockGetCurrentConfig(),
        selectedPreset: 'MacBook Pro',
      });

      const { result } = renderHook(() =>
        useExport(null, true, mockGetCurrentConfig)
      );

      act(() => {
        result.current.triggerExport();
      });

      expect(mockConfirm).not.toHaveBeenCalled();
    });

    it("treats 'LinkedIn Post' as OG preset", () => {
      stubCanvas('large');
      const mockConfirm = vi.fn();
      vi.stubGlobal('confirm', mockConfirm);

      mockGetCurrentConfig.mockReturnValue({
        ...mockGetCurrentConfig(),
        selectedPreset: 'LinkedIn Post',
      });

      const { result } = renderHook(() =>
        useExport(null, true, mockGetCurrentConfig)
      );

      act(() => {
        result.current.triggerExport();
      });

      expect(mockConfirm).toHaveBeenCalled();
    });

    it("treats 'Facebook Cover' as OG preset", () => {
      stubCanvas('large');
      const mockConfirm = vi.fn();
      vi.stubGlobal('confirm', mockConfirm);

      mockGetCurrentConfig.mockReturnValue({
        ...mockGetCurrentConfig(),
        selectedPreset: 'Facebook Cover',
      });

      const { result } = renderHook(() =>
        useExport(null, true, mockGetCurrentConfig)
      );

      act(() => {
        result.current.triggerExport();
      });

      expect(mockConfirm).toHaveBeenCalled();
    });

    it("treats 'Ad Banner' as OG preset", () => {
      stubCanvas('large');
      const mockConfirm = vi.fn();
      vi.stubGlobal('confirm', mockConfirm);

      mockGetCurrentConfig.mockReturnValue({
        ...mockGetCurrentConfig(),
        selectedPreset: 'Ad Banner',
      });

      const { result } = renderHook(() =>
        useExport(null, true, mockGetCurrentConfig)
      );

      act(() => {
        result.current.triggerExport();
      });

      expect(mockConfirm).toHaveBeenCalled();
    });
  });

  // -----------------------------------------------------------------------
  // triggerExport
  // -----------------------------------------------------------------------
  describe('triggerExport', () => {
    it('is a no-op when no image and not in noImageMode', () => {
      const { result } = renderHook(() =>
        useExport(null, false, mockGetCurrentConfig)
      );
      expect(() => {
        act(() => {
          result.current.triggerExport();
        });
      }).not.toThrow();
    });

    it('works in noImageMode without image', () => {
      stubCanvas('small');
      const { result } = renderHook(() =>
        useExport(null, true, mockGetCurrentConfig)
      );
      expect(() => {
        act(() => {
          result.current.triggerExport();
        });
      }).not.toThrow();
    });

    it('uses browser download fallback when framelyAPI is unavailable', () => {
      stubCanvas('small');
      vi.stubGlobal('framelyAPI', undefined);

      const { result } = renderHook(() =>
        useExport(null, true, mockGetCurrentConfig)
      );

      const mockLink = document.createElement('a');
      const clickSpy = vi.spyOn(mockLink, 'click');
      const origCreateElement = document.createElement.bind(document);
      vi.spyOn(document, 'createElement').mockImplementation(((tag: string, opts?: ElementCreationOptions) => {
        if (tag === 'a') return mockLink;
        return origCreateElement(tag, opts);
      }) as typeof document.createElement);

      act(() => {
        result.current.triggerExport();
      });

      expect(clickSpy).toHaveBeenCalled();
      expect(mockLink.download).toContain('framely-export');
    });

    it('uses JPEG mime type when exportFormat is jpeg', () => {
      stubCanvas('small');
      vi.stubGlobal('framelyAPI', undefined);

      const mockLink = document.createElement('a');
      vi.spyOn(mockLink, 'click');
      const origCreateElement = document.createElement.bind(document);

      // Capture the canvas created by useExport so we can spy on toDataURL
      vi.spyOn(document, 'createElement').mockImplementation(((tag: string, opts?: ElementCreationOptions) => {
        if (tag === 'canvas') {
          const c = origCreateElement(tag, opts) as HTMLCanvasElement;
          c.toDataURL = () => makeSmallBase64();
          return c;
        }
        if (tag === 'a') return mockLink;
        return origCreateElement(tag, opts);
      }) as typeof document.createElement);

      const { result } = renderHook(() =>
        useExport(null, true, mockGetCurrentConfig)
      );

      act(() => {
        result.current.setExportFormat('jpeg');
      });

      // Override renderCanvas to not interfere with the canvas's toDataURL
      mockRenderCanvas.mockImplementation(() => {});

      act(() => {
        result.current.triggerExport();
      });

      // Verify the canvas was used — the link was clicked with correct extension
      expect(mockLink.download).toContain('.jpg');
    });

    it('uses .jpg extension for JPEG export via browser download', () => {
      stubCanvas('small');
      vi.stubGlobal('framelyAPI', undefined);

      const mockLink = document.createElement('a');
      vi.spyOn(mockLink, 'click');
      const origCreateElement = document.createElement.bind(document);
      vi.spyOn(document, 'createElement').mockImplementation(((tag: string, opts?: ElementCreationOptions) => {
        if (tag === 'a') return mockLink;
        return origCreateElement(tag, opts);
      }) as typeof document.createElement);

      const { result } = renderHook(() =>
        useExport(null, true, mockGetCurrentConfig)
      );

      act(() => {
        result.current.setExportFormat('jpeg');
      });

      act(() => {
        result.current.triggerExport();
      });

      expect(mockLink.download).toContain('.jpg');
    });

    it('calls framelyAPI.saveFile with correct args for JPEG path', () => {
      stubCanvas('small');
      const saveFileSpy = vi.fn();
      vi.stubGlobal('framelyAPI', { saveFile: saveFileSpy });

      const { result } = renderHook(() =>
        useExport(null, true, mockGetCurrentConfig)
      );

      act(() => {
        result.current.setExportFormat('jpeg');
      });

      act(() => {
        result.current.triggerExport();
      });

      expect(saveFileSpy).toHaveBeenCalled();
      const call = saveFileSpy.mock.calls[0];
      expect(call[1]).toBe('jpeg');
    });

    it('calls framelyAPI.saveFile with correct args for WebP path', () => {
      stubCanvas('small');
      const saveFileSpy = vi.fn();
      vi.stubGlobal('framelyAPI', { saveFile: saveFileSpy });

      const { result } = renderHook(() =>
        useExport(null, true, mockGetCurrentConfig)
      );

      act(() => {
        result.current.setExportFormat('webp');
      });

      act(() => {
        result.current.triggerExport();
      });

      expect(saveFileSpy).toHaveBeenCalled();
      const call = saveFileSpy.mock.calls[0];
      expect(call[1]).toBe('webp');
    });

    it('passes selected compression mode to framelyAPI.saveFile', () => {
      stubCanvas('small');
      const saveFileSpy = vi.fn();
      vi.stubGlobal('framelyAPI', { saveFile: saveFileSpy });

      const { result } = renderHook(() =>
        useExport(null, true, mockGetCurrentConfig)
      );

      act(() => {
        result.current.setCompressionMode('small');
      });

      act(() => {
        result.current.triggerExport();
      });

      expect(saveFileSpy).toHaveBeenCalledWith(expect.any(String), 'png', 90, 'small');
    });

    it('calls alert with tip for OG preset > 300KB via framelyAPI', () => {
      stubCanvas('small');
      const mockAlert = vi.fn();
      vi.stubGlobal('alert', mockAlert);
      const saveFileSpy = vi.fn();
      vi.stubGlobal('framelyAPI', { saveFile: saveFileSpy });

      mockGetCurrentConfig.mockReturnValue({
        ...mockGetCurrentConfig(),
        selectedPreset: 'OG Image',
      });

      // Canvas producing ~375KB base64 (>300KB, <8MB)
      const medBase64 = 'data:image/png;base64,' + 'A'.repeat(500000);
      mockRenderCanvas.mockImplementation((canvas: HTMLCanvasElement) => {
        canvas.toDataURL = () => medBase64;
      });

      const { result } = renderHook(() =>
        useExport(null, true, mockGetCurrentConfig)
      );

      act(() => {
        result.current.triggerExport();
      });

      expect(mockAlert).toHaveBeenCalledWith(
        expect.stringContaining('Tip: Keep Open Graph images under 300KB')
      );
    });

    it('does NOT call alert with tip for non-OG preset', () => {
      stubCanvas('small');
      const mockAlert = vi.fn();
      vi.stubGlobal('alert', mockAlert);
      const saveFileSpy = vi.fn();
      vi.stubGlobal('framelyAPI', { saveFile: saveFileSpy });

      mockGetCurrentConfig.mockReturnValue({
        ...mockGetCurrentConfig(),
        selectedPreset: 'MacBook Pro',
      });

      const medBase64 = 'data:image/png;base64,' + 'A'.repeat(500000);
      mockRenderCanvas.mockImplementation((canvas: HTMLCanvasElement) => {
        canvas.toDataURL = () => medBase64;
      });

      const { result } = renderHook(() =>
        useExport(null, true, mockGetCurrentConfig)
      );

      act(() => {
        result.current.triggerExport();
      });

      expect(mockAlert).not.toHaveBeenCalled();
    });

    it('uses .webp extension for browser download when format is webp', () => {
      vi.stubGlobal('framelyAPI', undefined);

      const mockLink = { download: '', href: '', click: vi.fn() };
      const origCE = document.createElement.bind(document);
      vi.spyOn(document, 'createElement').mockImplementation(((tag: string) => {
        if (tag === 'a') return mockLink as any;
        if (tag === 'canvas') {
          const c = origCE('canvas');
          c.toDataURL = () => 'data:image/webp;base64,fake';
          return c;
        }
        return origCE(tag as keyof HTMLElementTagNameMap);
      }) as typeof document.createElement);

      const { result } = renderHook(() =>
        useExport(null, true, mockGetCurrentConfig)
      );

      act(() => {
        result.current.setExportFormat('webp');
      });

      act(() => {
        result.current.triggerExport();
      });

      expect(mockLink.download).toBe('framely-export.webp');
      expect(mockLink.href).toBe('data:image/webp;base64,fake');
      expect(mockLink.click).toHaveBeenCalled();

      (document.createElement as any).mockRestore();
    });
  });

  // -----------------------------------------------------------------------
  // copyBeautifiedImage
  // -----------------------------------------------------------------------
  describe('copyBeautifiedImage', () => {
    it('is a no-op when no image and not in noImageMode', async () => {
      const { result } = renderHook(() =>
        useExport(null, false, mockGetCurrentConfig)
      );
      await act(async () => {
        await result.current.copyBeautifiedImage();
      });
      // Should not throw
    });

    it('uses navigator.clipboard.write when framelyAPI is absent', async () => {
      stubCanvas('small');
      vi.stubGlobal('framelyAPI', undefined);

      const writeSpy = vi.fn().mockResolvedValue(undefined);
      Object.defineProperty(navigator, 'clipboard', {
        value: { write: writeSpy },
        writable: true,
        configurable: true,
      });

      const { result } = renderHook(() =>
        useExport(null, true, mockGetCurrentConfig)
      );

      await act(async () => {
        await result.current.copyBeautifiedImage();
      });

      expect(writeSpy).toHaveBeenCalled();
    });

    it('aborts clipboard write when OG size limit check returns false', async () => {
      stubCanvas('large');
      const mockConfirm = vi.fn().mockReturnValue(false);
      vi.stubGlobal('confirm', mockConfirm);
      const writeSpy = vi.fn().mockResolvedValue(undefined);
      Object.defineProperty(navigator, 'clipboard', {
        value: { write: writeSpy },
        writable: true,
        configurable: true,
      });

      mockGetCurrentConfig.mockReturnValue({
        ...mockGetCurrentConfig(),
        selectedPreset: 'OG Image',
      });

      const { result } = renderHook(() =>
        useExport(null, true, mockGetCurrentConfig)
      );

      await act(async () => {
        await result.current.copyBeautifiedImage();
      });

      expect(mockConfirm).toHaveBeenCalled();
      expect(writeSpy).not.toHaveBeenCalled();
    });
  });


});
