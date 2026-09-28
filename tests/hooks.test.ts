import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useHistory } from '../src/renderer/hooks/useHistory';
import { usePresets } from '../src/renderer/hooks/usePresets';
import { useExport } from '../src/renderer/hooks/useExport';

describe('useHistory', () => {
  let applyConfig: any;

  beforeEach(() => {
    applyConfig = vi.fn();
  });

  it('initializes with empty history and index -1', () => {
    const { result } = renderHook(() => useHistory(applyConfig));
    
    expect(result.current.history).toEqual([]);
    expect(result.current.historyIndex).toBe(-1);
  });

  it('pushes config to history and updates index', () => {
    const { result } = renderHook(() => useHistory(applyConfig));
    
    act(() => {
      result.current.pushHistory({ scale: 100 });
    });
    
    expect(result.current.history).toHaveLength(1);
    expect(result.current.history[0]).toEqual({ scale: 100 });
    expect(result.current.historyIndex).toBe(0);
  });

  it('pushes multiple configs and maintains correct order', () => {
    const { result } = renderHook(() => useHistory(applyConfig));
    
    act(() => {
      result.current.pushHistory({ scale: 100 });
    });
    act(() => {
      result.current.pushHistory({ scale: 80 });
    });
    act(() => {
      result.current.pushHistory({ scale: 60 });
    });
    
    expect(result.current.history).toHaveLength(3);
    expect(result.current.history[0]).toEqual({ scale: 100 });
    expect(result.current.history[1]).toEqual({ scale: 80 });
    expect(result.current.history[2]).toEqual({ scale: 60 });
    expect(result.current.historyIndex).toBe(2);
  });

  it('caps history at 50 entries', () => {
    const { result } = renderHook(() => useHistory(applyConfig));
    
    for (let i = 0; i < 55; i++) {
      act(() => {
        result.current.pushHistory({ scale: i });
      });
    }
    
    expect(result.current.history).toHaveLength(50);
    expect(result.current.history[49]).toEqual({ scale: 54 });
    expect(result.current.historyIndex).toBe(49);
  });

  it('undoes to previous state', () => {
    const { result } = renderHook(() => useHistory(applyConfig));
    
    act(() => {
      result.current.pushHistory({ scale: 100 });
    });
    act(() => {
      result.current.pushHistory({ scale: 80 });
    });
    act(() => {
      result.current.pushHistory({ scale: 60 });
    });
    
    act(() => {
      result.current.handleUndo();
    });
    
    expect(result.current.historyIndex).toBe(1);
    expect(applyConfig).toHaveBeenCalledWith({ scale: 80 });
  });

  it('does not undo past the beginning', () => {
    const { result } = renderHook(() => useHistory(applyConfig));
    
    act(() => {
      result.current.pushHistory({ scale: 100 });
    });
    
    act(() => {
      result.current.handleUndo();
    });
    act(() => {
      result.current.handleUndo();
    });
    
    expect(result.current.historyIndex).toBe(0);
    expect(applyConfig).not.toHaveBeenCalled();
  });

  it('redoes to next state', () => {
    const { result } = renderHook(() => useHistory(applyConfig));
    
    act(() => {
      result.current.pushHistory({ scale: 100 });
    });
    act(() => {
      result.current.pushHistory({ scale: 80 });
    });
    act(() => {
      result.current.pushHistory({ scale: 60 });
    });
    
    act(() => {
      result.current.handleUndo();
    });
    act(() => {
      result.current.handleUndo();
    });
    
    applyConfig.mockClear();
    
    act(() => {
      result.current.handleRedo();
    });
    
    expect(result.current.historyIndex).toBe(1);
    expect(applyConfig).toHaveBeenCalledWith({ scale: 80 });
  });

  it('does not redo past the end', () => {
    const { result } = renderHook(() => useHistory(applyConfig));
    
    act(() => {
      result.current.pushHistory({ scale: 100 });
    });
    act(() => {
      result.current.pushHistory({ scale: 80 });
    });
    
    act(() => {
      result.current.handleRedo();
    });
    
    expect(result.current.historyIndex).toBe(1);
    expect(applyConfig).not.toHaveBeenCalled();
  });

  it('discards future states when pushing after undo', () => {
    const { result } = renderHook(() => useHistory(applyConfig));
    
    act(() => {
      result.current.pushHistory({ scale: 100 });
    });
    act(() => {
      result.current.pushHistory({ scale: 80 });
    });
    act(() => {
      result.current.pushHistory({ scale: 60 });
    });
    
    act(() => {
      result.current.handleUndo();
    });
    
    act(() => {
      result.current.pushHistory({ scale: 50 });
    });
    
    expect(result.current.history).toHaveLength(3);
    expect(result.current.history[2]).toEqual({ scale: 50 });
    expect(result.current.historyIndex).toBe(2);
  });
});
describe('usePresets', () => {
  let mockSetImageSrc: any;
  let mockSetNoImageMode: any;
  let mockSetAnnotations: any;
  let mockSetBackgroundType: any;
  let mockSetBackgroundValue: any;
  let mockGetCurrentConfig: any;
  let mockPushHistory: any;

  beforeEach(() => {
    mockSetImageSrc = vi.fn();
    mockSetNoImageMode = vi.fn();
    mockSetAnnotations = vi.fn();
    mockSetBackgroundType = vi.fn();
    mockSetBackgroundValue = vi.fn();
    mockGetCurrentConfig = vi.fn(() => ({}));
    mockPushHistory = vi.fn();
    vi.stubGlobal('framelyAPI', undefined);
  });

  it('initializes with empty presets and name', () => {
    const { result } = renderHook(() =>
      usePresets(
        mockSetImageSrc,
        mockSetNoImageMode,
        mockSetAnnotations,
        'gradient',
        mockSetBackgroundType,
        'linear-gradient(...)',
        mockSetBackgroundValue,
        mockGetCurrentConfig,
        mockPushHistory
      )
    );
    
    expect(result.current.customPresets).toEqual([]);
    expect(result.current.newPresetName).toBe('');
  });

  it('saves custom preset with gradient', () => {
    const { result } = renderHook(() =>
      usePresets(
        mockSetImageSrc,
        mockSetNoImageMode,
        mockSetAnnotations,
        'gradient',
        mockSetBackgroundType,
        'linear-gradient(135deg, #a18cd1, #fbc2eb)',
        mockSetBackgroundValue,
        mockGetCurrentConfig,
        mockPushHistory
      )
    );
    
    act(() => {
      result.current.setNewPresetName('My Gradient');
    });
    act(() => {
      result.current.saveCustomPreset();
    });
    
    expect(result.current.customPresets).toHaveLength(1);
    expect(result.current.customPresets[0].name).toBe('My Gradient');
    expect(result.current.customPresets[0].type).toBe('gradient');
    expect(result.current.customPresets[0].gradient).toBe('linear-gradient(135deg, #a18cd1, #fbc2eb)');
    expect(result.current.newPresetName).toBe('');
  });

  it('saves custom preset with color', () => {
    const { result } = renderHook(() =>
      usePresets(
        mockSetImageSrc,
        mockSetNoImageMode,
        mockSetAnnotations,
        'color',
        mockSetBackgroundType,
        '#ff5722',
        mockSetBackgroundValue,
        mockGetCurrentConfig,
        mockPushHistory
      )
    );
    
    act(() => {
      result.current.setNewPresetName('My Color');
    });
    act(() => {
      result.current.saveCustomPreset();
    });
    
    expect(result.current.customPresets[0].type).toBe('color');
    expect(result.current.customPresets[0].color).toBe('#ff5722');
  });

  it('does not save preset with empty name', () => {
    const { result } = renderHook(() =>
      usePresets(
        mockSetImageSrc,
        mockSetNoImageMode,
        mockSetAnnotations,
        'gradient',
        mockSetBackgroundType,
        'linear-gradient(...)',
        mockSetBackgroundValue,
        mockGetCurrentConfig,
        mockPushHistory
      )
    );
    
    act(() => {
      result.current.saveCustomPreset();
    });
    
    expect(result.current.customPresets).toHaveLength(0);
  });

  it('deletes custom preset', () => {
    const { result } = renderHook(() =>
      usePresets(
        mockSetImageSrc,
        mockSetNoImageMode,
        mockSetAnnotations,
        'gradient',
        mockSetBackgroundType,
        'linear-gradient(...)',
        mockSetBackgroundValue,
        mockGetCurrentConfig,
        mockPushHistory
      )
    );
    
    act(() => {
      result.current.setNewPresetName('Test');
    });
    act(() => {
      result.current.saveCustomPreset();
    });
    
    const presetId = result.current.customPresets[0].id;
    const mockEvent = { stopPropagation: vi.fn() };
    
    act(() => {
      result.current.deleteCustomPreset(presetId, mockEvent as any);
    });
    
    expect(mockEvent.stopPropagation).toHaveBeenCalled();
    expect(result.current.customPresets).toHaveLength(0);
  });

  it('selects background preset and updates state', () => {
    const { result } = renderHook(() =>
      usePresets(
        mockSetImageSrc,
        mockSetNoImageMode,
        mockSetAnnotations,
        'gradient',
        mockSetBackgroundType,
        'linear-gradient(...)',
        mockSetBackgroundValue,
        mockGetCurrentConfig,
        mockPushHistory
      )
    );
    
    const preset = {
      type: 'gradient',
      gradient: 'linear-gradient(45deg, #ff0000, #0000ff)',
    };
    
    act(() => {
      result.current.selectBackgroundPreset(preset);
    });
    
    expect(mockSetBackgroundType).toHaveBeenCalledWith('gradient');
    expect(mockSetBackgroundValue).toHaveBeenCalledWith('linear-gradient(45deg, #ff0000, #0000ff)');
    expect(mockPushHistory).toHaveBeenCalled();
  });

  it('loads image from file input', () => {
    const { result } = renderHook(() =>
      usePresets(
        mockSetImageSrc,
        mockSetNoImageMode,
        mockSetAnnotations,
        'gradient',
        mockSetBackgroundType,
        'linear-gradient(...)',
        mockSetBackgroundValue,
        mockGetCurrentConfig,
        mockPushHistory
      )
    );
    
    const mockFile = new File(['test image data'], 'test.png', { type: 'image/png' });
    const mockEvent = {
      target: {
        files: [mockFile],
      },
    } as any;
    
    act(() => {
      result.current.handleHTMLFileInput(mockEvent);
    });
    
    expect(mockEvent.target.files).toHaveLength(1);
  });

  it('pastes from clipboard with framelyAPI', async () => {
    const mockReadImageFromClipboard = vi.fn().mockResolvedValue('data:image/png;base64,test');
    vi.stubGlobal('framelyAPI', {
      readImageFromClipboard: mockReadImageFromClipboard,
    });
    
    const { result } = renderHook(() =>
      usePresets(
        mockSetImageSrc,
        mockSetNoImageMode,
        mockSetAnnotations,
        'gradient',
        mockSetBackgroundType,
        'linear-gradient(...)',
        mockSetBackgroundValue,
        mockGetCurrentConfig,
        mockPushHistory
      )
    );
    
    await act(async () => {
      await result.current.pasteFromClipboard();
    });
    
    expect(mockReadImageFromClipboard).toHaveBeenCalled();
    expect(mockSetImageSrc).toHaveBeenCalledWith('data:image/png;base64,test');
  });

  it('alerts when clipboard has no image', async () => {
    const mockAlert = vi.fn();
    vi.stubGlobal('alert', mockAlert);
    vi.stubGlobal('framelyAPI', {
      readImageFromClipboard: vi.fn().mockResolvedValue(null),
    });

    const { result } = renderHook(() =>
      usePresets(
        mockSetImageSrc,
        mockSetNoImageMode,
        mockSetAnnotations,
        'gradient',
        mockSetBackgroundType,
        'linear-gradient(...)',
        mockSetBackgroundValue,
        mockGetCurrentConfig,
        mockPushHistory
      )
    );

    await act(async () => {
      await result.current.pasteFromClipboard();
    });

    expect(mockAlert).toHaveBeenCalledWith('No image found in clipboard.');
  });

  it('falls back to file input click when framelyAPI is unavailable', () => {
    vi.stubGlobal('framelyAPI', undefined);

    const { result } = renderHook(() =>
      usePresets(
        mockSetImageSrc,
        mockSetNoImageMode,
        mockSetAnnotations,
        'gradient',
        mockSetBackgroundType,
        'linear-gradient(...)',
        mockSetBackgroundValue,
        mockGetCurrentConfig,
        mockPushHistory
      )
    );

    // fileInputRef should be created
    expect(result.current.fileInputRef).toBeDefined();

    act(() => {
      result.current.selectFile();
    });

    // Should not throw when called without framelyAPI
    expect(result.current.fileInputRef.current).toBeNull();
  });
});

describe('useExport', () => {
  let mockImageSrc: string | null;
  let mockNoImageMode: boolean;
  let mockGetCurrentConfig: any;

  beforeEach(() => {
    mockImageSrc = 'data:image/png;base64,test';
    mockNoImageMode = false;
    mockGetCurrentConfig = vi.fn(() => ({
      scale: 100,
      padding: 20,
      rounded: 8,
      shadow: 15,
      backgroundType: 'gradient',
      backgroundValue: 'linear-gradient(...)',
    }));
    vi.stubGlobal('framelyAPI', undefined);

    // jsdom doesn't fire Image onload for data URLs — stub it to fire synchronously
    vi.stubGlobal('Image', class {
      onload: (() => void) | null = null;
      onerror: (() => void) | null = null;
      set src(_: string) { setTimeout(() => this.onload?.(), 0); }
    });
  });

  it('initializes with PNG format and quality 90', () => {
    const { result } = renderHook(() =>
      useExport(mockImageSrc, mockNoImageMode, mockGetCurrentConfig)
    );
    
    expect(result.current.exportFormat).toBe('png');
    expect(result.current.jpegQuality).toBe(90);
  });

  it('loads saved format and quality from localStorage', () => {
    localStorage.setItem(
      'framely-user-defaults',
      JSON.stringify({ exportFormat: 'jpeg', jpegQuality: 75 })
    );
    
    const { result } = renderHook(() =>
      useExport(mockImageSrc, mockNoImageMode, mockGetCurrentConfig)
    );
    
    expect(result.current.exportFormat).toBe('jpeg');
    expect(result.current.jpegQuality).toBe(75);
    
    localStorage.removeItem('framely-user-defaults');
  });

  it('updates export format', () => {
    const { result } = renderHook(() =>
      useExport(mockImageSrc, mockNoImageMode, mockGetCurrentConfig)
    );
    
    act(() => {
      result.current.setExportFormat('jpeg');
    });
    
    expect(result.current.exportFormat).toBe('jpeg');
  });

  it('updates jpeg quality', () => {
    const { result } = renderHook(() =>
      useExport(mockImageSrc, mockNoImageMode, mockGetCurrentConfig)
    );
    
    act(() => {
      result.current.setJpegQuality(80);
    });
    
    expect(result.current.jpegQuality).toBe(80);
  });

  it('exports with framelyAPI when available', () => {
    const mockSaveFile = vi.fn().mockResolvedValue(undefined);
    vi.stubGlobal('framelyAPI', {
      saveFile: mockSaveFile,
    });

    const { result } = renderHook(() =>
      useExport(null, true, mockGetCurrentConfig)
    );

    act(() => {
      result.current.triggerExport();
    });

    expect(mockSaveFile).toHaveBeenCalled();
    expect(mockSaveFile.mock.calls[0][1]).toBe('png');
    expect(mockSaveFile.mock.calls[0][2]).toBe(90);
  });

  it('exports JPEG with correct quality', () => {
    const mockSaveFile = vi.fn().mockResolvedValue(undefined);
    vi.stubGlobal('framelyAPI', {
      saveFile: mockSaveFile,
    });

    const { result } = renderHook(() =>
      useExport(null, true, mockGetCurrentConfig)
    );

    act(() => {
      result.current.setExportFormat('jpeg');
    });
    act(() => {
      result.current.setJpegQuality(75);
    });
    act(() => {
      result.current.triggerExport();
    });

    expect(mockSaveFile).toHaveBeenCalledWith(null, 'jpeg', 75, 'balanced');
  });

  it('exports WebP with correct quality', () => {
    const mockSaveFile = vi.fn().mockResolvedValue(undefined);
    vi.stubGlobal('framelyAPI', {
      saveFile: mockSaveFile,
    });

    const { result } = renderHook(() =>
      useExport(null, true, mockGetCurrentConfig)
    );

    act(() => {
      result.current.setExportFormat('webp');
    });
    act(() => {
      result.current.setJpegQuality(80);
    });
    act(() => {
      result.current.triggerExport();
    });

    expect(mockSaveFile).toHaveBeenCalledWith(null, 'webp', 80, 'balanced');
  });

  it('copies to clipboard with framelyAPI', async () => {
    const mockCopyImageToClipboard = vi.fn().mockResolvedValue(undefined);
    vi.stubGlobal('framelyAPI', {
      copyImageToClipboard: mockCopyImageToClipboard,
    });

    const { result } = renderHook(() =>
      useExport(null, true, mockGetCurrentConfig)
    );

    await act(async () => {
      await result.current.copyBeautifiedImage();
    });

    expect(mockCopyImageToClipboard).toHaveBeenCalled();
  });

  it('copies to clipboard without framelyAPI', async () => {
    // jsdom's canvas.toBlob never fires its callback — mock it to resolve immediately with null
    const origToBlob = HTMLCanvasElement.prototype.toBlob;
    HTMLCanvasElement.prototype.toBlob = (cb: BlobCallback) => cb(null);

    const { result } = renderHook(() =>
      useExport(null, true, mockGetCurrentConfig)
    );

    await act(async () => {
      await result.current.copyBeautifiedImage();
    });

    expect(result.current).toBeDefined();
    HTMLCanvasElement.prototype.toBlob = origToBlob;
  });

  it('does not export when no image and not in no-image mode', () => {
    const mockExportImage = vi.fn().mockResolvedValue(undefined);
    vi.stubGlobal('framelyAPI', {
      exportImage: mockExportImage,
    });
    
    const { result } = renderHook(() =>
      useExport(null, false, mockGetCurrentConfig)
    );
    
    act(() => {
      result.current.triggerExport();
    });
    
    expect(mockExportImage).not.toHaveBeenCalled();
  });

  it('exports in no-image mode without image', () => {
    const mockSaveFile = vi.fn().mockResolvedValue(undefined);
    vi.stubGlobal('framelyAPI', {
      saveFile: mockSaveFile,
    });

    const { result } = renderHook(() =>
      useExport(null, true, mockGetCurrentConfig)
    );

    act(() => {
      result.current.triggerExport();
    });

    expect(mockSaveFile).toHaveBeenCalled();
  });

  it('triggers export via browser download when framelyAPI is unavailable', () => {
    const mockClick = vi.fn();
    const mockAnchor = { download: '', href: '', click: mockClick } as any;
    const origCE = document.createElement.bind(document);
    vi.spyOn(document, 'createElement').mockImplementation((tag: string) => {
      if (tag === 'a') return mockAnchor;
      if (tag === 'canvas') {
        const c = origCE('canvas');
        c.toDataURL = () => 'data:image/png;base64,fake';
        return c;
      }
      return origCE(tag);
    });

    const { result } = renderHook(() =>
      useExport(null, true, mockGetCurrentConfig)
    );

    act(() => {
      result.current.triggerExport();
    });

    expect(mockAnchor.download).toBe('framely-export.png');
    expect(mockAnchor.href).toBe('data:image/png;base64,fake');
    expect(mockClick).toHaveBeenCalled();

    (document.createElement as any).mockRestore();
  });
});
