import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';

import { usePresets } from '../src/renderer/hooks/usePresets';
import { Annotation } from '../src/renderer/canvasRenderer';

describe('usePresets', () => {
  let mockSetImageSrc: ReturnType<typeof vi.fn<React.Dispatch<React.SetStateAction<string | null>>>>;
  let mockSetNoImageMode: ReturnType<typeof vi.fn<React.Dispatch<React.SetStateAction<boolean>>>>;
  let mockSetAnnotations: ReturnType<typeof vi.fn<React.Dispatch<React.SetStateAction<Annotation[]>>>>;
  let mockSetBackgroundType: ReturnType<typeof vi.fn<React.Dispatch<React.SetStateAction<'gradient' | 'color' | 'blur' | 'mesh' | 'shader'>>>>;
  let mockSetBackgroundValue: ReturnType<typeof vi.fn<React.Dispatch<React.SetStateAction<string>>>>;
  let mockGetCurrentConfig: ReturnType<typeof vi.fn<() => any>>;
  let mockPushHistory: ReturnType<typeof vi.fn<(config: any) => void>>;
  let mockSetBgGrain: ReturnType<typeof vi.fn<React.Dispatch<React.SetStateAction<number>>>>;
  let mockSetLightRaysStyle: ReturnType<typeof vi.fn<React.Dispatch<React.SetStateAction<'none' | 'diagonal' | 'spotlight' | 'aurora'>>>>;
  let mockSetLightRaysOpacity: ReturnType<typeof vi.fn<React.Dispatch<React.SetStateAction<number>>>>;
  let mockSetLightRaysAngle: ReturnType<typeof vi.fn<React.Dispatch<React.SetStateAction<number>>>>;
  let mockSetLightRaysCount: ReturnType<typeof vi.fn<React.Dispatch<React.SetStateAction<number>>>>;
  let mockSetLightRaysSourceX: ReturnType<typeof vi.fn<React.Dispatch<React.SetStateAction<number>>>>;
  let mockSetLightRaysSourceY: ReturnType<typeof vi.fn<React.Dispatch<React.SetStateAction<number>>>>;

  const defaultConfig = {
    padding: 38,
    rounded: 20,
    scale: 100,
    backgroundType: 'gradient',
    backgroundValue: 'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)',
    annotations: [],
    bgGrain: 0,
    lightRaysStyle: 'none' as const,
    lightRaysOpacity: 30,
    lightRaysAngle: 135,
    lightRaysCount: 4,
    lightRaysSourceX: 50,
    lightRaysSourceY: 0,
  };

  beforeEach(() => {
    mockSetImageSrc = vi.fn<React.Dispatch<React.SetStateAction<string | null>>>();
    mockSetNoImageMode = vi.fn<React.Dispatch<React.SetStateAction<boolean>>>();
    mockSetAnnotations = vi.fn<React.Dispatch<React.SetStateAction<Annotation[]>>>();
    mockSetBackgroundType = vi.fn<React.Dispatch<React.SetStateAction<'gradient' | 'color' | 'blur' | 'mesh' | 'shader'>>>();
    mockSetBackgroundValue = vi.fn<React.Dispatch<React.SetStateAction<string>>>();
    mockGetCurrentConfig = vi.fn<() => any>().mockReturnValue(defaultConfig);
    mockPushHistory = vi.fn<(config: any) => void>();
    mockSetBgGrain = vi.fn<React.Dispatch<React.SetStateAction<number>>>();
    mockSetLightRaysStyle = vi.fn<React.Dispatch<React.SetStateAction<'none' | 'diagonal' | 'spotlight' | 'aurora'>>>();
    mockSetLightRaysOpacity = vi.fn<React.Dispatch<React.SetStateAction<number>>>();
    mockSetLightRaysAngle = vi.fn<React.Dispatch<React.SetStateAction<number>>>();
    mockSetLightRaysCount = vi.fn<React.Dispatch<React.SetStateAction<number>>>();
    mockSetLightRaysSourceX = vi.fn<React.Dispatch<React.SetStateAction<number>>>();
    mockSetLightRaysSourceY = vi.fn<React.Dispatch<React.SetStateAction<number>>>();
    vi.restoreAllMocks();
  });

  const render = (overrides?: {
    backgroundType?: 'gradient' | 'color' | 'blur' | 'mesh' | 'shader';
    backgroundValue?: string;
    handlePasteImage?: (src: string) => void;
  }) =>
    renderHook(() =>
      usePresets(
        mockSetImageSrc,
        mockSetNoImageMode,
        mockSetAnnotations,
        overrides?.backgroundType ?? 'gradient',
        mockSetBackgroundType,
        overrides?.backgroundValue ?? 'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)',
        mockSetBackgroundValue,
        mockGetCurrentConfig,
        mockPushHistory,
        mockSetBgGrain,
        mockSetLightRaysStyle,
        mockSetLightRaysOpacity,
        mockSetLightRaysAngle,
        mockSetLightRaysCount,
        mockSetLightRaysSourceX,
        mockSetLightRaysSourceY,
        overrides?.handlePasteImage
      )
    );

  describe('initial state', () => {
    it('starts with empty custom presets', () => {
      const { result } = render();
      expect(result.current.customPresets).toEqual([]);
    });

    it('starts with empty preset name', () => {
      const { result } = render();
      expect(result.current.newPresetName).toBe('');
    });

    it('provides a fileInputRef', () => {
      const { result } = render();
      expect(result.current.fileInputRef).toBeDefined();
      expect(result.current.fileInputRef.current).toBeNull();
    });
  });

  describe('onImageLoaded', () => {
    it('sets the image src', () => {
      const { result } = render();
      act(() => {
        result.current.onImageLoaded('data:image/png;base64,abc123');
      });
      expect(mockSetImageSrc).toHaveBeenCalledWith('data:image/png;base64,abc123');
    });

    it('disables noImageMode', () => {
      const { result } = render();
      act(() => {
        result.current.onImageLoaded('test');
      });
      expect(mockSetNoImageMode).toHaveBeenCalledWith(false);
    });

    it('clears annotations', () => {
      const { result } = render();
      act(() => {
        result.current.onImageLoaded('test');
      });
      expect(mockSetAnnotations).toHaveBeenCalledWith([]);
    });

    it('pushes history with cleared annotations', () => {
      const { result } = render();
      act(() => {
        result.current.onImageLoaded('test-image');
      });
      expect(mockPushHistory).toHaveBeenCalledWith({
        ...defaultConfig,
        annotations: [],
        noImage: false,
      });
    });
  });

  describe('saveCustomPreset', () => {
    it('does nothing when preset name is empty', () => {
      const { result } = render();
      act(() => {
        result.current.saveCustomPreset();
      });
      expect(result.current.customPresets).toEqual([]);
    });

    it('does nothing when preset name is only whitespace', () => {
      const { result } = render();
      act(() => {
        result.current.setNewPresetName('   ');
      });
      act(() => {
        result.current.saveCustomPreset();
      });
      expect(result.current.customPresets).toEqual([]);
    });

    it('creates a gradient preset', () => {
      const { result } = render({ backgroundType: 'gradient', backgroundValue: 'my-gradient' });
      act(() => {
        result.current.setNewPresetName('My Preset');
      });
      act(() => {
        result.current.saveCustomPreset();
      });
      expect(result.current.customPresets).toHaveLength(1);
      const preset = result.current.customPresets[0];
      expect(preset.name).toBe('My Preset');
      expect(preset.gradient).toBe('my-gradient');
      expect(preset.type).toBe('gradient');
      expect(preset.id).toMatch(/^custom-\d+$/);
    });

    it('creates a color preset', () => {
      const { result } = render({ backgroundType: 'color', backgroundValue: '#ff0000' });
      act(() => {
        result.current.setNewPresetName('Red');
      });
      act(() => {
        result.current.saveCustomPreset();
      });
      expect(result.current.customPresets).toHaveLength(1);
      const preset = result.current.customPresets[0];
      expect(preset.color).toBe('#ff0000');
      expect(preset.type).toBe('color');
    });

    it('clears preset name after saving', () => {
      const { result } = render();
      act(() => {
        result.current.setNewPresetName('Test Preset');
      });
      act(() => {
        result.current.saveCustomPreset();
      });
      expect(result.current.newPresetName).toBe('');
    });

    it('appends to existing presets', () => {
      const { result } = render();
      act(() => {
        result.current.setNewPresetName('First');
      });
      act(() => {
        result.current.saveCustomPreset();
      });
      act(() => {
        result.current.setNewPresetName('Second');
      });
      act(() => {
        result.current.saveCustomPreset();
      });
      expect(result.current.customPresets).toHaveLength(2);
    });
  });

  describe('deleteCustomPreset', () => {
    it('removes a preset by id and stops propagation', () => {
      const { result } = render();

      // Pre-populate customPresets directly for reliable setup
      act(() => {
        result.current.setCustomPresets([
          { id: 'preset-1', name: 'P1', type: 'gradient', gradient: 'g1' },
          { id: 'preset-2', name: 'P2', type: 'color', color: '#fff' },
        ]);
      });

      const mockEvent = { stopPropagation: vi.fn() } as unknown as React.MouseEvent;

      act(() => {
        result.current.deleteCustomPreset('preset-1', mockEvent);
      });

      expect(result.current.customPresets).toHaveLength(1);
      expect(result.current.customPresets[0].name).toBe('P2');
      expect(mockEvent.stopPropagation).toHaveBeenCalled();
    });

    it('does nothing when id does not exist', () => {
      const { result } = render();
      const mockEvent = { stopPropagation: vi.fn() } as unknown as React.MouseEvent;
      act(() => {
        result.current.deleteCustomPreset('non-existent', mockEvent);
      });
      expect(result.current.customPresets).toEqual([]);
      expect(mockEvent.stopPropagation).toHaveBeenCalled();
    });
  });

  describe('selectBackgroundPreset', () => {
    it('sets background type and value from a gradient preset', () => {
      const { result } = render();
      act(() => {
        result.current.selectBackgroundPreset({
          type: 'gradient',
          gradient: 'my-gradient-value',
        });
      });
      expect(mockSetBackgroundType).toHaveBeenCalledWith('gradient');
      expect(mockSetBackgroundValue).toHaveBeenCalledWith('my-gradient-value');
    });

    it('sets background type and value from a color preset', () => {
      const { result } = render();
      act(() => {
        result.current.selectBackgroundPreset({
          type: 'color',
          color: '#00ff00',
        });
      });
      expect(mockSetBackgroundType).toHaveBeenCalledWith('color');
      expect(mockSetBackgroundValue).toHaveBeenCalledWith('#00ff00');
    });

    it('pushes history with the preset config', () => {
      const { result } = render();
      act(() => {
        result.current.selectBackgroundPreset({
          type: 'gradient',
          gradient: 'preset-gradient',
        });
      });
      expect(mockPushHistory).toHaveBeenCalledWith({
        ...defaultConfig,
        backgroundType: 'gradient',
        backgroundValue: 'preset-gradient',
      });
    });
  });

  describe('setNewPresetName', () => {
    it('updates the preset name state', () => {
      const { result } = render();
      act(() => {
        result.current.setNewPresetName('Hello');
      });
      expect(result.current.newPresetName).toBe('Hello');
    });
  });

  describe('setCustomPresets', () => {
    it('allows direct state override', () => {
      const { result } = render();
      act(() => {
        result.current.setCustomPresets([{ id: 'x', name: 'Direct' }]);
      });
      expect(result.current.customPresets).toHaveLength(1);
      expect(result.current.customPresets[0].name).toBe('Direct');
    });
  });

  describe('selectFile', () => {
    it('calls framelyAPI.openFile in Electron environment', async () => {
      const mockOpenFile = vi.fn().mockResolvedValue('data:image/png;base64,electron-test');
      vi.stubGlobal('framelyAPI', { openFile: mockOpenFile });

      const { result } = render();
      await act(async () => {
        await result.current.selectFile();
      });

      expect(mockOpenFile).toHaveBeenCalled();
      expect(mockSetImageSrc).toHaveBeenCalledWith('data:image/png;base64,electron-test');
      expect(mockSetNoImageMode).toHaveBeenCalledWith(false);
    });

    it('handles null return from framelyAPI.openFile', async () => {
      const mockOpenFile = vi.fn().mockResolvedValue(null);
      vi.stubGlobal('framelyAPI', { openFile: mockOpenFile });

      const { result } = render();
      await act(async () => {
        await result.current.selectFile();
      });

      expect(mockOpenFile).toHaveBeenCalled();
      expect(mockSetImageSrc).not.toHaveBeenCalled();
    });

    it('clicks hidden file input in browser environment', async () => {
      vi.stubGlobal('framelyAPI', undefined);
      const { result } = render();

      // Create a real input and assign it to the ref
      const input = document.createElement('input');
      const clickSpy = vi.spyOn(input, 'click');
      result.current.fileInputRef.current = input;

      await act(async () => {
        await result.current.selectFile();
      });

      expect(clickSpy).toHaveBeenCalled();
    });
  });

  describe('handleHTMLFileInput', () => {
    it('reads a file via FileReader', () => {
      const { result } = render();

      const file = new File(['test-image-data'], 'test.png', { type: 'image/png' });

      // Mock FileReader — readAsDataURL immediately triggers onload
      const mockFileReader = vi.fn(function (this: any) {
        this.onload = null;
        this.readAsDataURL = vi.fn(() => {
          if (this.onload) {
            this.onload({ target: { result: 'data:image/png;base64,fake' } });
          }
        });
      });
      vi.stubGlobal('FileReader', mockFileReader);

      const mockEvent = {
        target: { files: [file] },
      } as unknown as React.ChangeEvent<HTMLInputElement>;

      act(() => {
        result.current.handleHTMLFileInput(mockEvent);
      });

      expect(mockFileReader).toHaveBeenCalled();
      expect(mockSetImageSrc).toHaveBeenCalledWith('data:image/png;base64,fake');
    });

    it('does nothing when no files are selected', () => {
      const { result } = render();
      const mockEvent = {
        target: { files: [] },
      } as unknown as React.ChangeEvent<HTMLInputElement>;

      act(() => {
        result.current.handleHTMLFileInput(mockEvent);
      });

      expect(mockSetImageSrc).not.toHaveBeenCalled();
    });

    it('does nothing when files is null', () => {
      const { result } = render();
      const mockEvent = {
        target: { files: null },
      } as unknown as React.ChangeEvent<HTMLInputElement>;

      act(() => {
        result.current.handleHTMLFileInput(mockEvent);
      });

      expect(mockSetImageSrc).not.toHaveBeenCalled();
    });
  });

  describe('pasteFromClipboard', () => {
    it('reads image from clipboard via framelyAPI in Electron', async () => {
      const mockReadClipboard = vi.fn().mockResolvedValue('data:image/png;base64,clipboard-test');
      vi.stubGlobal('framelyAPI', { readImageFromClipboard: mockReadClipboard });

      const { result } = render();
      await act(async () => {
        await result.current.pasteFromClipboard();
      });

      expect(mockReadClipboard).toHaveBeenCalled();
      expect(mockSetImageSrc).toHaveBeenCalledWith('data:image/png;base64,clipboard-test');
    });

    it('shows alert when clipboard has no image in Electron', async () => {
      const mockReadClipboard = vi.fn().mockResolvedValue(null);
      vi.stubGlobal('framelyAPI', { readImageFromClipboard: mockReadClipboard });
      const mockAlert = vi.fn();
      vi.stubGlobal('alert', mockAlert);

      const { result } = render();
      await act(async () => {
        await result.current.pasteFromClipboard();
      });

      expect(mockAlert).toHaveBeenCalledWith('No image found in clipboard.');
    });

    it('calls handlePasteImage when provided', async () => {
      const mockReadClipboard = vi.fn().mockResolvedValue('data:image/png;base64,clipboard-test');
      vi.stubGlobal('framelyAPI', { readImageFromClipboard: mockReadClipboard });
      const mockHandlePasteImage = vi.fn();

      const { result } = render({ handlePasteImage: mockHandlePasteImage });
      await act(async () => {
        await result.current.pasteFromClipboard();
      });

      expect(mockReadClipboard).toHaveBeenCalled();
      expect(mockHandlePasteImage).toHaveBeenCalledWith('data:image/png;base64,clipboard-test');
      expect(mockSetImageSrc).not.toHaveBeenCalled();
    });
  });
});
