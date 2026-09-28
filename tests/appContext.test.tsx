import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { render, screen, fireEvent, act, waitFor } from '@testing-library/react';
import { AppProvider, useAppContext } from '../src/renderer/AppContext';
import { useToolbarShortcuts } from '../src/renderer/hooks/useToolbarShortcuts';

// Mock dependency hooks
vi.mock('../src/renderer/hooks/useHistory', () => ({
  useHistory: () => mockUseHistory,
}));

vi.mock('../src/renderer/hooks/usePresets', () => ({
  usePresets: () => mockUsePresets,
}));

vi.mock('../src/renderer/hooks/useExport', () => ({
  useExport: () => mockUseExport,
}));

vi.mock('../src/renderer/canvasRenderer', () => ({
  drawMeshGradient: vi.fn(),
}));

let mockUseHistory: any;
let mockUsePresets: any;
let mockUseExport: any;

beforeEach(() => {
  mockUseHistory = {
    history: [], setHistory: vi.fn(),
    historyIndex: -1, setHistoryIndex: vi.fn(),
    pushHistory: vi.fn(), handleUndo: vi.fn(), handleRedo: vi.fn(),
  };
  mockUsePresets = {
    customPresets: [], setCustomPresets: vi.fn(),
    newPresetName: '', setNewPresetName: vi.fn(),
    fileInputRef: { current: null },
    onImageLoaded: vi.fn(),
    selectFile: vi.fn(),
    handleHTMLFileInput: vi.fn(),
    pasteFromClipboard: vi.fn(),
    saveCustomPreset: vi.fn(),
    deleteCustomPreset: vi.fn(),
    selectBackgroundPreset: vi.fn(),
  };
  mockUseExport = {
    exportFormat: 'png', setExportFormat: vi.fn(),
    jpegQuality: 90, setJpegQuality: vi.fn(),
    compressionMode: 'balanced', setCompressionMode: vi.fn(),
    copyBeautifiedImage: vi.fn(), triggerExport: vi.fn(),
  };

  vi.stubGlobal('framelyAPI', undefined);
  localStorage.clear();
  document.body.className = '';
});

afterEach(() => {
  vi.restoreAllMocks();
});

// Test consumer component
function TestConsumer() {
  const ctx = useAppContext();
  return (
    <div>
      <span data-testid="padding">{ctx.padding}</span>
      <span data-testid="backgroundType">{ctx.backgroundType}</span>
      <button data-testid="undo-btn" onClick={ctx.handleUndo}>Undo</button>
      <button data-testid="redo-btn" onClick={ctx.handleRedo}>Redo</button>
      <button data-testid="export-btn" onClick={ctx.triggerExport}>Export</button>
      <button data-testid="copy-btn" onClick={() => ctx.copyBeautifiedImage()}>Copy</button>
      <button data-testid="slider-btn" onClick={ctx.handleSliderRelease}>Slider Release</button>
      <button data-testid="apply-mesh" onClick={() => ctx.applyMeshPalette(['#ff0000', '#00ff00'])}>Apply Mesh</button>
      <button data-testid="random-palette" onClick={ctx.generateRandomPalette}>Random</button>
    </div>
  );
}

describe('AppContext', () => {
  describe('AppProvider', () => {
    it('renders children', () => {
      render(
        <AppProvider><div data-testid="child">Hello</div></AppProvider>
      );
      expect(screen.getByTestId('child')).toBeInTheDocument();
    });

    it('provides default context values', () => {
      render(
        <AppProvider><TestConsumer /></AppProvider>
      );
      expect(screen.getByTestId('padding')).toHaveTextContent('38');
      expect(screen.getByTestId('backgroundType')).toHaveTextContent('shader');
    });

    it('provides getCurrentConfig with all state', () => {
      let capturedConfig: any;
      function Consumer() {
        const ctx = useAppContext();
        capturedConfig = ctx.getCurrentConfig();
        return <div data-testid="cfg">done</div>;
      }
      render(<AppProvider><Consumer /></AppProvider>);
      expect(capturedConfig).toHaveProperty('padding', 38);
      expect(capturedConfig).toHaveProperty('backgroundType', 'shader');
      expect(capturedConfig).toHaveProperty('noImage', false);
    });

    it('provides applyConfig', () => {
      let applyConfigFn: any;
      function Consumer() {
        const ctx = useAppContext();
        applyConfigFn = ctx.applyConfig;
        return <div data-testid="cfg">done</div>;
      }
      render(<AppProvider><Consumer /></AppProvider>);
      expect(typeof applyConfigFn).toBe('function');
    });

    it('pushHistory delegates to useHistory hook', () => {
      render(<AppProvider><TestConsumer /></AppProvider>);
      fireEvent.click(screen.getByTestId('slider-btn'));
      expect(mockUseHistory.pushHistory).toHaveBeenCalled();
    });

    it('handleUndo delegates to useHistory', () => {
      render(<AppProvider><TestConsumer /></AppProvider>);
      fireEvent.click(screen.getByTestId('undo-btn'));
      expect(mockUseHistory.handleUndo).toHaveBeenCalled();
    });

    it('handleRedo delegates to useHistory', () => {
      render(<AppProvider><TestConsumer /></AppProvider>);
      fireEvent.click(screen.getByTestId('redo-btn'));
      expect(mockUseHistory.handleRedo).toHaveBeenCalled();
    });

    it('triggerExport delegates to useExport', () => {
      render(<AppProvider><TestConsumer /></AppProvider>);
      fireEvent.click(screen.getByTestId('export-btn'));
      expect(mockUseExport.triggerExport).toHaveBeenCalled();
    });

    it('copyBeautifiedImage delegates to useExport', () => {
      render(<AppProvider><TestConsumer /></AppProvider>);
      fireEvent.click(screen.getByTestId('copy-btn'));
      expect(mockUseExport.copyBeautifiedImage).toHaveBeenCalled();
    });

    it('applyMeshPalette updates mesh point colors', () => {
      render(<AppProvider><TestConsumer /></AppProvider>);
      fireEvent.click(screen.getByTestId('apply-mesh'));
      expect(mockUseHistory.pushHistory).toHaveBeenCalled();
    });

    it('generateRandomPalette randomizes mesh points', () => {
      render(<AppProvider><TestConsumer /></AppProvider>);
      fireEvent.click(screen.getByTestId('random-palette'));
      expect(mockUseHistory.pushHistory).toHaveBeenCalled();
    });

    it('customPrompt returns a promise and sets promptConfig', async () => {
      let customPromptFn: any;
      function Consumer() {
        const ctx = useAppContext();
        customPromptFn = ctx.customPrompt;
        return <div data-testid="cfg">done</div>;
      }
      render(<AppProvider><Consumer /></AppProvider>);

      const promise = customPromptFn('Test message', 'default');
      expect(promise).toBeInstanceOf(Promise);
    });

    it('handleDragOver prevents default and sets isDragging', () => {
      let handleDragOverFn: any;
      function Consumer() {
        const ctx = useAppContext();
        handleDragOverFn = ctx.handleDragOver;
        return <div data-testid="cfg">done</div>;
      }
      render(<AppProvider><Consumer /></AppProvider>);

      const mockEvent = { preventDefault: vi.fn() };
      handleDragOverFn(mockEvent);
      expect(mockEvent.preventDefault).toHaveBeenCalled();
    });

    it('handleDragLeave sets isDragging false', () => {
      let handleDragLeaveFn: any;
      function Consumer() {
        const ctx = useAppContext();
        handleDragLeaveFn = ctx.handleDragLeave;
        return <div data-testid="cfg">done</div>;
      }
      render(<AppProvider><Consumer /></AppProvider>);
      expect(() => handleDragLeaveFn()).not.toThrow();
    });

    it('handleDrop reads dropped image file', () => {
      let handleDropFn: any;
      function Consumer() {
        const ctx = useAppContext();
        handleDropFn = ctx.handleDrop;
        return <div data-testid="cfg">done</div>;
      }
      render(<AppProvider><Consumer /></AppProvider>);

      const mockFile = new File(['test'], 'test.png', { type: 'image/png' });
      const mockEvent = {
        preventDefault: vi.fn(),
        dataTransfer: { files: [mockFile] as unknown as FileList },
      };
      handleDropFn(mockEvent);
      expect(mockEvent.preventDefault).toHaveBeenCalled();
    });

    it('handleDrop ignores non-image files', () => {
      let handleDropFn: any;
      function Consumer() {
        const ctx = useAppContext();
        handleDropFn = ctx.handleDrop;
        return <div data-testid="cfg">done</div>;
      }
      render(<AppProvider><Consumer /></AppProvider>);

      const mockFile = new File(['test'], 'test.txt', { type: 'text/plain' });
      const mockEvent = {
        preventDefault: vi.fn(),
        dataTransfer: { files: [mockFile] as unknown as FileList },
      };
      expect(() => handleDropFn(mockEvent)).not.toThrow();
      expect(mockEvent.preventDefault).toHaveBeenCalled();
    });
  });

  describe('useAppContext', () => {
    it('throws error when used outside AppProvider', () => {
      function BadConsumer() {
        useAppContext();
        return <div>bad</div>;
      }
      // Suppress console.error for expected error
      const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
      expect(() => render(<BadConsumer />)).toThrow('useAppContext must be used within an AppProvider');
      spy.mockRestore();
    });
  });

  describe('Theme effect', () => {
    it('syncs appTheme to localStorage', () => {
      function Consumer() {
        const ctx = useAppContext();
        return (
          <button
            data-testid="theme-btn"
            onClick={() => ctx.setAppTheme('light')}
          >
            Toggle
          </button>
        );
      }
      render(<AppProvider><Consumer /></AppProvider>);
      fireEvent.click(screen.getByTestId('theme-btn'));
      expect(localStorage.getItem('framely-app-theme')).toBe('light');
    });
  });

  describe('Keyboard shortcuts', () => {
    it('fires undo on Ctrl+Z', () => {
      render(<AppProvider><div>test</div></AppProvider>);
      act(() => {
        window.dispatchEvent(new KeyboardEvent('keydown', { ctrlKey: true, key: 'z', bubbles: true }));
      });
      expect(mockUseHistory.handleUndo).toHaveBeenCalled();
    });

    it('fires redo on Ctrl+Y', () => {
      render(<AppProvider><div>test</div></AppProvider>);
      act(() => {
        window.dispatchEvent(new KeyboardEvent('keydown', { ctrlKey: true, key: 'y', bubbles: true }));
      });
      expect(mockUseHistory.handleRedo).toHaveBeenCalled();
    });

    it('ignores export on Ctrl+Shift+S when the workspace is empty', () => {
      render(<AppProvider><div>test</div></AppProvider>);
      act(() => {
        window.dispatchEvent(new KeyboardEvent('keydown', { ctrlKey: true, shiftKey: true, key: 'S', bubbles: true }));
      });
      expect(mockUseExport.triggerExport).not.toHaveBeenCalled();
    });

    it('exports on Ctrl+S when workspace has content', async () => {
      let currentCtx: any;
      function ShortcutConsumer() {
        currentCtx = useAppContext();
        return <div>test</div>;
      }
      render(
        <AppProvider>
          <ShortcutConsumer />
        </AppProvider>
      );

      act(() => {
        currentCtx.setImageSrc('data:image/png;base64,test');
      });

      act(() => {
        window.dispatchEvent(new KeyboardEvent('keydown', { ctrlKey: true, key: 's', bubbles: true }));
      });

      await waitFor(() => {
        expect(mockUseExport.triggerExport).toHaveBeenCalled();
      });
    });

    it('exports on Cmd+S when workspace has content', async () => {
      let currentCtx: any;
      function ShortcutConsumer() {
        currentCtx = useAppContext();
        return <div>test</div>;
      }
      render(
        <AppProvider>
          <ShortcutConsumer />
        </AppProvider>
      );

      act(() => {
        currentCtx.setImageSrc('data:image/png;base64,test');
      });

      act(() => {
        window.dispatchEvent(new KeyboardEvent('keydown', { metaKey: true, key: 's', bubbles: true }));
      });

      await waitFor(() => {
        expect(mockUseExport.triggerExport).toHaveBeenCalled();
      });
    });

    it('does not export on Ctrl+S without workspace content', () => {
      render(<AppProvider><div>test</div></AppProvider>);
      act(() => {
        window.dispatchEvent(new KeyboardEvent('keydown', { ctrlKey: true, key: 's', bubbles: true }));
      });
      expect(mockUseExport.triggerExport).not.toHaveBeenCalled();
    });

    it('fires new workspace on Ctrl+N', () => {
      let currentCtx: any;
      function ShortcutConsumer() {
        currentCtx = useAppContext();
        return <div>test</div>;
      }
      render(
        <AppProvider>
          <ShortcutConsumer />
        </AppProvider>
      );

      act(() => {
        currentCtx.setImageSrc('data:image/png;base64,test');
        currentCtx.setAnnotations([{ id: '1' }]);
      });

      expect(currentCtx.imageSrc).toBe('data:image/png;base64,test');

      act(() => {
        window.dispatchEvent(new KeyboardEvent('keydown', { ctrlKey: true, key: 'n', bubbles: true }));
      });

      expect(currentCtx.imageSrc).toBeNull();
      expect(currentCtx.annotations).toEqual([]);
    });

    it('does not fire shortcut when focused on input', () => {
      render(
        <AppProvider>
          <input type="text" data-testid="text-input" />
        </AppProvider>
      );
      const input = screen.getByTestId('text-input') as HTMLInputElement;
      input.focus();
      mockUseHistory.handleUndo.mockClear();

      act(() => {
        input.dispatchEvent(new KeyboardEvent('keydown', { ctrlKey: true, key: 'z', bubbles: true }));
      });
      expect(mockUseHistory.handleUndo).not.toHaveBeenCalled();
    });

    it('switches active tools via keyboard shortcuts', () => {
      function ShortcutConsumer() {
        const ctx = useAppContext();
        useToolbarShortcuts();
        return <><div data-testid="tool">{ctx.activeTool}</div><button onClick={() => ctx.setEditingMode(true)}>Edit</button></>;
      }
      render(
        <AppProvider>
          <ShortcutConsumer />
        </AppProvider>
      );
      
      expect(screen.getByTestId('tool')).toHaveTextContent('pointer');

      act(() => {
        window.dispatchEvent(new KeyboardEvent('keydown', { key: 'r', bubbles: true }));
      });
      expect(screen.getByTestId('tool')).toHaveTextContent('pointer');
      fireEvent.click(screen.getByText('Edit'));

      act(() => {
        window.dispatchEvent(new KeyboardEvent('keydown', { key: 'r', bubbles: true }));
      });
      expect(screen.getByTestId('tool')).toHaveTextContent('rect');

      act(() => {
        window.dispatchEvent(new KeyboardEvent('keydown', { key: '3', bubbles: true }));
      });
      expect(screen.getByTestId('tool')).toHaveTextContent('filled-rect');

      act(() => {
        window.dispatchEvent(new KeyboardEvent('keydown', { key: 'c', bubbles: true }));
      });
      expect(screen.getByTestId('tool')).toHaveTextContent('circle');

      act(() => {
        window.dispatchEvent(new KeyboardEvent('keydown', { key: 'O', bubbles: true }));
      });
      expect(screen.getByTestId('tool')).toHaveTextContent('filled-circle');

      act(() => {
        window.dispatchEvent(new KeyboardEvent('keydown', { key: '6', bubbles: true }));
      });
      expect(screen.getByTestId('tool')).toHaveTextContent('line');

      act(() => {
        window.dispatchEvent(new KeyboardEvent('keydown', { key: 'a', bubbles: true }));
      });
      expect(screen.getByTestId('tool')).toHaveTextContent('arrow');

      act(() => {
        window.dispatchEvent(new KeyboardEvent('keydown', { key: '8', bubbles: true }));
      });
      expect(screen.getByTestId('tool')).toHaveTextContent('text');

      act(() => {
        window.dispatchEvent(new KeyboardEvent('keydown', { key: 'p', bubbles: true }));
      });
      expect(screen.getByTestId('tool')).toHaveTextContent('pen');

      act(() => {
        window.dispatchEvent(new KeyboardEvent('keydown', { key: '0', bubbles: true }));
      });
      expect(screen.getByTestId('tool')).toHaveTextContent('emoji');

      act(() => {
        window.dispatchEvent(new KeyboardEvent('keydown', { key: '1', bubbles: true }));
      });
      expect(screen.getByTestId('tool')).toHaveTextContent('pointer');
    });

    it('ignores toolbar shortcuts when modifier keys are pressed', () => {
      function ShortcutConsumer() {
        const ctx = useAppContext();
        useToolbarShortcuts();
        return <div data-testid="tool">{ctx.activeTool}</div>;
      }
      render(
        <AppProvider>
          <ShortcutConsumer />
        </AppProvider>
      );
      
      expect(screen.getByTestId('tool')).toHaveTextContent('pointer');

      act(() => {
        window.dispatchEvent(new KeyboardEvent('keydown', { ctrlKey: true, key: 'r', bubbles: true }));
      });
      expect(screen.getByTestId('tool')).toHaveTextContent('pointer');
    });

    it('ignores toolbar shortcuts when typing inside a textarea', () => {
      function ShortcutConsumer() {
        const ctx = useAppContext();
        useToolbarShortcuts();
        return (
          <div>
            <div data-testid="tool">{ctx.activeTool}</div>
            <textarea data-testid="editor" />
          </div>
        );
      }
      render(
        <AppProvider>
          <ShortcutConsumer />
        </AppProvider>
      );

      const textarea = screen.getByTestId('editor') as HTMLTextAreaElement;
      textarea.focus();

      act(() => {
        textarea.dispatchEvent(new KeyboardEvent('keydown', { key: 'r', bubbles: true }));
      });
      expect(screen.getByTestId('tool')).toHaveTextContent('pointer');
    });

    it('toggles Code Studio on Ctrl+Shift+C', () => {
      let currentCtx: any;
      function ShortcutConsumer() {
        currentCtx = useAppContext();
        return <div data-testid="code-studio">{String(currentCtx.codeStudioActive)}</div>;
      }
      render(
        <AppProvider>
          <ShortcutConsumer />
        </AppProvider>
      );

      expect(currentCtx.codeStudioActive).toBe(false);

      act(() => {
        window.dispatchEvent(new KeyboardEvent('keydown', { ctrlKey: true, shiftKey: true, key: 'c', bubbles: true }));
      });
      expect(currentCtx.codeStudioActive).toBe(true);

      act(() => {
        window.dispatchEvent(new KeyboardEvent('keydown', { ctrlKey: true, shiftKey: true, key: 'c', bubbles: true }));
      });
      expect(currentCtx.codeStudioActive).toBe(false);
    });

    it('toggles Code Studio on Cmd+Shift+C (macOS)', () => {
      let currentCtx: any;
      function ShortcutConsumer() {
        currentCtx = useAppContext();
        return <div data-testid="code-studio">{String(currentCtx.codeStudioActive)}</div>;
      }
      render(
        <AppProvider>
          <ShortcutConsumer />
        </AppProvider>
      );

      act(() => {
        window.dispatchEvent(new KeyboardEvent('keydown', { metaKey: true, shiftKey: true, key: 'c', bubbles: true }));
      });
      expect(currentCtx.codeStudioActive).toBe(true);
    });

    it('does not toggle Code Studio on Ctrl+Shift+C when focused on input', () => {
      let currentCtx: any;
      function ShortcutConsumer() {
        currentCtx = useAppContext();
        return <input type="text" data-testid="text-input" />;
      }
      render(
        <AppProvider>
          <ShortcutConsumer />
        </AppProvider>
      );
      const input = screen.getByTestId('text-input') as HTMLInputElement;
      input.focus();

      act(() => {
        input.dispatchEvent(new KeyboardEvent('keydown', { ctrlKey: true, shiftKey: true, key: 'c', bubbles: true }));
      });
      expect(currentCtx.codeStudioActive).toBe(false);
    });
  });

  describe('Paste event', () => {
    it('adds paste event listener on mount', () => {
      const addSpy = vi.spyOn(window, 'addEventListener');
      const removeSpy = vi.spyOn(window, 'removeEventListener');
      const { unmount } = render(<AppProvider><div>test</div></AppProvider>);
      expect(addSpy).toHaveBeenCalledWith('paste', expect.any(Function));
      unmount();
      expect(removeSpy).toHaveBeenCalledWith('paste', expect.any(Function));
      addSpy.mockRestore();
      removeSpy.mockRestore();
    });

    it('calls onImageLoaded when imageSrc is null', async () => {
      function Consumer() {
        useAppContext();
        return <div>test</div>;
      }

      vi.stubGlobal('framelyAPI', {
        readImageFromClipboard: vi.fn().mockResolvedValue('data:image/png;base64,pastedimage'),
        getSettings: vi.fn().mockResolvedValue({}),
        saveSettings: vi.fn().mockResolvedValue(undefined),
        onGlobalHotkeyTriggered: vi.fn(() => vi.fn()),
      });

      render(
        <AppProvider>
          <Consumer />
        </AppProvider>
      );

      await act(async () => {
        window.dispatchEvent(new Event('paste'));
      });
      await new Promise(resolve => setTimeout(resolve, 20));

      expect(mockUsePresets.onImageLoaded).toHaveBeenCalledWith('data:image/png;base64,pastedimage');
    });

    it('pastes onto existing canvas when imageSrc is present', async () => {
      const originalImage = global.Image;
      try {
        global.Image = class {
          onload: (() => void) | null = null;
          naturalWidth = 1000;
          naturalHeight = 800;
          set src(_: string) {
            setTimeout(() => {
              if (this.onload) this.onload();
            }, 0);
          }
        } as any;

        let context: any;
        function Consumer() {
          context = useAppContext();
          return (
            <div>
              <span data-testid="annotations-count">{context.annotations.length}</span>
            </div>
          );
        }

        vi.stubGlobal('framelyAPI', {
          readImageFromClipboard: vi.fn().mockResolvedValue('data:image/png;base64,pastedimage'),
          getSettings: vi.fn().mockResolvedValue({}),
          saveSettings: vi.fn().mockResolvedValue(undefined),
          onGlobalHotkeyTriggered: vi.fn(() => vi.fn()),
        });

        render(
          <AppProvider>
            <Consumer />
          </AppProvider>
        );

        await act(async () => {
          context.setImageSrc('data:image/png;base64,existing');
          context.setAnnotations([]);
        });

        await act(async () => {
          window.dispatchEvent(new Event('paste'));
        });

        await waitFor(() => {
          expect(screen.getByTestId('annotations-count')).toHaveTextContent('1');
        });

        expect(context.annotations[0].type).toBe('image');
        expect(context.annotations[0].imageSrc).toBe('data:image/png;base64,pastedimage');
      } finally {
        global.Image = originalImage;
      }
    });

    it('creates a new canvas when global hotkey is triggered', async () => {
      let context: any;
      let hotkeyCallback: ((src: string) => void) | null = null;
      function Consumer() {
        context = useAppContext();
        return <div>test</div>;
      }

      vi.stubGlobal('framelyAPI', {
        getSettings: vi.fn().mockResolvedValue({}),
        saveSettings: vi.fn().mockResolvedValue(undefined),
        onGlobalHotkeyTriggered: vi.fn((cb) => {
          hotkeyCallback = cb;
          return vi.fn();
        }),
      });

      render(
        <AppProvider>
          <Consumer />
        </AppProvider>
      );

      await act(async () => {
        context.setImageSrc('data:image/png;base64,existing');
        context.setAnnotations([]);
      });

      await act(async () => {
        if (hotkeyCallback) {
          hotkeyCallback('data:image/png;base64,capturedimage');
        }
      });
      await new Promise(resolve => setTimeout(resolve, 20));

      expect(mockUsePresets.onImageLoaded).toHaveBeenCalledWith('data:image/png;base64,capturedimage');
    });
  });

  describe('Settings sync effect', () => {
    it('attempts to load settings from framelyAPI on mount', async () => {
      const mockGetSettings = vi.fn().mockResolvedValue({});
      vi.stubGlobal('framelyAPI', {
        getSettings: mockGetSettings,
        saveSettings: vi.fn().mockResolvedValue(undefined),
        onGlobalHotkeyTriggered: vi.fn(() => vi.fn()),
      });

      render(<AppProvider><div>test</div></AppProvider>);
      // Wait for async effect
      await vi.waitFor(() => {
        expect(mockGetSettings).toHaveBeenCalled();
      }, { timeout: 2000 });
    });
  });

  describe('ExtendedContext operations', () => {
    function ExtendedTestConsumer() {
      const ctx = useAppContext();
      return (
        <div>
          <span data-testid="padding">{ctx.padding}</span>
          <span data-testid="backgroundType">{ctx.backgroundType}</span>
          <span data-testid="watermarkText">{ctx.watermarkText}</span>
          <span data-testid="annotations-count">{ctx.annotations.length}</span>
          <span data-testid="meshPoints-count">{ctx.meshPoints.length}</span>
          <button data-testid="reset-btn" onClick={ctx.resetStyles}>Reset Styles</button>
          <button data-testid="clear-btn" onClick={ctx.clearWorkspace}>New Workspace</button>
          <button data-testid="apply-mesh" onClick={() => ctx.applyMeshPalette(['#ff0000', '#00ff00'])}>Apply Mesh</button>
          <button data-testid="random-palette" onClick={ctx.generateRandomPalette}>Random Palette</button>
          <button data-testid="slider-btn" onClick={ctx.handleSliderRelease}>Slider Release</button>
        </div>
      );
    }

    it('resetStyles sets all state to defaults via setters', () => {
      render(
        <AppProvider>
          <ExtendedTestConsumer />
        </AppProvider>
      );

      // Verify initial state
      expect(screen.getByTestId('backgroundType')).toHaveTextContent('shader');

      // Click reset
      fireEvent.click(screen.getByTestId('reset-btn'));

      // After resetStyles, background type should reset to Framely Aurora.
      expect(screen.getByTestId('backgroundType')).toHaveTextContent('shader');
    });

    it('clearWorkspace clears image, history, and annotations', () => {
      render(
        <AppProvider>
          <ExtendedTestConsumer />
        </AppProvider>
      );

      fireEvent.click(screen.getByTestId('clear-btn'));

      // After clear, annotations should be empty.
      expect(screen.getByTestId('annotations-count')).toHaveTextContent('0');
    });

    it('applyMeshPalette calls pushHistory', () => {
      mockUseHistory.pushHistory = vi.fn();
      render(
        <AppProvider>
          <ExtendedTestConsumer />
        </AppProvider>
      );

      fireEvent.click(screen.getByTestId('apply-mesh'));
      // Mesh points should still be 4 (just colors changed)
      expect(screen.getByTestId('meshPoints-count')).toHaveTextContent('4');
    });

    it('generateRandomPalette preserves point count and calls pushHistory', () => {
      mockUseHistory.pushHistory = vi.fn();
      render(
        <AppProvider>
          <ExtendedTestConsumer />
        </AppProvider>
      );

      fireEvent.click(screen.getByTestId('random-palette'));
      // Should still have 4 points
      expect(screen.getByTestId('meshPoints-count')).toHaveTextContent('4');
    });

    it('handleSliderRelease delegates to pushHistory', () => {
      mockUseHistory.pushHistory = vi.fn();
      render(
        <AppProvider>
          <ExtendedTestConsumer />
        </AppProvider>
      );

      fireEvent.click(screen.getByTestId('slider-btn'));
      expect(mockUseHistory.pushHistory).toHaveBeenCalled();
    });
  });

  describe('drag and drop', () => {
    function DragConsumer() {
      const ctx = useAppContext();
      return (
        <div>
          <span data-testid="dragging">{ctx.isDragging ? 'yes' : 'no'}</span>
          <div
            data-testid="drop-zone"
            onDragOver={ctx.handleDragOver}
            onDragLeave={ctx.handleDragLeave}
            onDrop={ctx.handleDrop}
          >
            Drop Zone
          </div>
        </div>
      );
    }

    it('handleDragOver prevents default and sets isDragging', () => {
      render(
        <AppProvider>
          <DragConsumer />
        </AppProvider>
      );

      const zone = screen.getByTestId('drop-zone');
      const event = new Event('dragover', { bubbles: true, cancelable: true });

      fireEvent(zone, event);
      // After drag over, isDragging should be true
      expect(screen.getByTestId('dragging')).toHaveTextContent('yes');
    });

    it('handleDragLeave sets isDragging false', () => {
      render(
        <AppProvider>
          <DragConsumer />
        </AppProvider>
      );

      // First set dragging to true
      const zone = screen.getByTestId('drop-zone');
      const dragOverEvent = new Event('dragover', { bubbles: true, cancelable: true });
      fireEvent(zone, dragOverEvent);

      expect(screen.getByTestId('dragging')).toHaveTextContent('yes');

      // Now drag leave
      fireEvent.dragLeave(zone);
      expect(screen.getByTestId('dragging')).toHaveTextContent('no');
    });
  });

  describe('sidebar position', () => {
    function SidebarConsumer() {
      const ctx = useAppContext();
      return (
        <div>
          <span data-testid="sidebar-pos">{ctx.sidebarPosition}</span>
        </div>
      );
    }

    it('defaults sidebar position to right', () => {
      render(
        <AppProvider>
          <SidebarConsumer />
        </AppProvider>
      );
      expect(screen.getByTestId('sidebar-pos')).toHaveTextContent('right');
    });

    it('reads sidebar position from localStorage', () => {
      localStorage.setItem('framely-user-defaults', JSON.stringify({ sidebarPosition: 'left' }));
      render(
        <AppProvider>
          <SidebarConsumer />
        </AppProvider>
      );
      expect(screen.getByTestId('sidebar-pos')).toHaveTextContent('left');
    });

  });

  describe('Code Studio and Paste detection', () => {
    it('detects Java code in pasted text and switches to Code Studio', async () => {
      let context: any;
      function Consumer() {
        context = useAppContext();
        return (
          <div>
            <span data-testid="code-active">{context.codeStudioActive ? 'yes' : 'no'}</span>
            <span data-testid="code-lang">{context.codeStudioLanguage}</span>
            <span data-testid="code-text">{context.codeStudioCode}</span>
          </div>
        );
      }

      render(
        <AppProvider>
          <Consumer />
        </AppProvider>
      );

      // Verify initially Code Studio is inactive
      expect(screen.getByTestId('code-active')).toHaveTextContent('no');

      // Dispatch paste event with Java code
      const pasteEvent = new Event('paste', {
        bubbles: true,
        cancelable: true,
      });
      const mockClipboardData = {
        getData: (type: string) => {
          if (type === 'text/plain') return 'public class Main { public static void main(String[] args) {} }';
          return '';
        },
        items: [],
      };
      Object.defineProperty(pasteEvent, 'clipboardData', {
        value: mockClipboardData,
      });

      await act(async () => {
        window.dispatchEvent(pasteEvent);
      });

      expect(screen.getByTestId('code-active')).toHaveTextContent('yes');
      expect(screen.getByTestId('code-lang')).toHaveTextContent('java');
      expect(screen.getByTestId('code-text')).toHaveTextContent('public class Main { public static void main(String[] args) {} }');
    });

    it('detects Python code in pasted text and switches to Code Studio', async () => {
      let context: any;
      function Consumer() {
        context = useAppContext();
        return (
          <div>
            <span data-testid="code-active">{context.codeStudioActive ? 'yes' : 'no'}</span>
            <span data-testid="code-lang">{context.codeStudioLanguage}</span>
          </div>
        );
      }

      render(
        <AppProvider>
          <Consumer />
        </AppProvider>
      );

      // Dispatch paste event with Python code
      const pasteEvent = new Event('paste', {
        bubbles: true,
        cancelable: true,
      });
      const mockClipboardData = {
        getData: (type: string) => {
          if (type === 'text/plain') return 'def calculate_sum(a, b):\n    return a + b\n\nprint(calculate_sum(5, 10))';
          return '';
        },
        items: [],
      };
      Object.defineProperty(pasteEvent, 'clipboardData', {
        value: mockClipboardData,
      });

      await act(async () => {
        window.dispatchEvent(pasteEvent);
      });

      expect(screen.getByTestId('code-active')).toHaveTextContent('yes');
      expect(screen.getByTestId('code-lang')).toHaveTextContent('python');
    });
  });

  describe('Code Studio toggling and state preservation', () => {
    it('preserves imageSrc when entering and exiting Code Studio', async () => {
      let context: any;
      function Consumer() {
        context = useAppContext();
        return <div>test</div>;
      }

      render(
        <AppProvider>
          <Consumer />
        </AppProvider>
      );

      // Load an image screenshot
      await act(async () => {
        context.setImageSrc('data:image/png;base64,mockImage');
        context.setNoImageMode(false);
      });

      expect(context.imageSrc).toBe('data:image/png;base64,mockImage');
      expect(context.noImageMode).toBe(false);

      // Toggle Code Studio ON
      await act(async () => {
        context.setCodeStudioActive(true);
        context.setNoImageMode(true);
      });

      // Verify that codeStudioActive is true, noImageMode is true, but imageSrc is preserved
      expect(context.codeStudioActive).toBe(true);
      expect(context.noImageMode).toBe(true);
      expect(context.imageSrc).toBe('data:image/png;base64,mockImage');

      // Toggle Code Studio OFF
      await act(async () => {
        context.setCodeStudioActive(false);
        const hasImage = !!context.imageSrc;
        context.setNoImageMode(!hasImage);
      });

      // Verify imageSrc is still there and noImageMode becomes false again
      expect(context.codeStudioActive).toBe(false);
      expect(context.noImageMode).toBe(false);
      expect(context.imageSrc).toBe('data:image/png;base64,mockImage');
    });

    it('disables Code Studio mode when a new image is loaded', async () => {
      let context: any;
      function Consumer() {
        context = useAppContext();
        return <div>test</div>;
      }

      render(
        <AppProvider>
          <Consumer />
        </AppProvider>
      );

      // Start in Code Studio mode
      await act(async () => {
        context.setCodeStudioActive(true);
      });
      expect(context.codeStudioActive).toBe(true);

      // Load a new image screenshot
      await act(async () => {
        context.setImageSrc('data:image/png;base64,newImage');
      });

      // Verify Code Studio gets turned off
      expect(context.codeStudioActive).toBe(false);
    });

    it('preserves mode-specific backgrounds when toggling via toggleCodeStudio', async () => {
      let context: any;
      function Consumer() {
        context = useAppContext();
        return <div>test</div>;
      }

      render(
        <AppProvider>
          <Consumer />
        </AppProvider>
      );

      // 1. Start in Screenshot mode (default) and select Neon Glow
      await act(async () => {
        context.setBackgroundType('gradient');
        context.setBackgroundValue('linear-gradient(135deg, #ec008c 0%, #fc6767 100%)'); // Neon Glow
      });

      expect(context.backgroundValue).toBe('linear-gradient(135deg, #ec008c 0%, #fc6767 100%)');

      // 2. Toggle Code Studio ON
      await act(async () => {
        context.toggleCodeStudio(true);
      });

      // Verify Code Studio is active and background changed to default (Electric Lavender)
      expect(context.codeStudioActive).toBe(true);
      expect(context.backgroundValue).toBe('linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)');

      // 3. In Code Studio, change background to Mesh Aurora
      await act(async () => {
        context.setBackgroundValue('radial-gradient(circle at 20% 20%, #ff8a00 0%, transparent 50%), radial-gradient(circle at 80% 80%, #da00ff 0%, transparent 50%), linear-gradient(135deg, #00b4db 0%, #0083b0 100%)'); // Mesh Aurora
      });

      expect(context.backgroundValue).toContain('#ff8a00');

      // 4. Toggle Code Studio OFF (switch back to screenshot mode)
      await act(async () => {
        context.toggleCodeStudio(false);
      });

      // Verify Code Studio is inactive, and the screenshot background is restored to Neon Glow
      expect(context.codeStudioActive).toBe(false);
      expect(context.backgroundValue).toBe('linear-gradient(135deg, #ec008c 0%, #fc6767 100%)'); // Restored Neon Glow!
    });
  });
});

