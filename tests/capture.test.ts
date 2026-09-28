import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { shell, clipboard, globalShortcut } from 'electron';

// Mock electron
vi.mock('electron', () => {
  const mockImage = {
    isEmpty: vi.fn().mockReturnValue(false),
    toBitmap: vi.fn().mockReturnValue(Buffer.from('mock-bitmap')),
    toDataURL: vi.fn().mockReturnValue('data:image/png;base64,mock-data'),
  };
  return {
    shell: {
      openExternal: vi.fn().mockResolvedValue(true),
    },
    clipboard: {
      readImage: vi.fn().mockReturnValue(mockImage),
      writeImage: vi.fn(),
      availableFormats: vi.fn().mockReturnValue([]),
    },
    globalShortcut: {
      register: vi.fn().mockReturnValue(true),
      unregister: vi.fn(),
      unregisterAll: vi.fn(),
    },
    BrowserWindow: class {},
  };
});

const mockExec = vi.hoisted(() => vi.fn());

// Mock child_process
vi.mock('child_process', () => ({
  exec: mockExec,
  default: {
    exec: mockExec,
  },
}));

import {
  triggerOSScreenCapture,
  checkClipboardAndImport,
  setupFocusCheck,
  updateCaptureConfigurations,
  cleanupCaptureModule,
  getRegisteredShortcut,
  getAutoImportEnabled,
  setIgnoreNextClipboardImage,
  getIsCaptureInitiated,
} from '../src/main/capture';

describe('Capture Main Module', () => {
  let mockWindow: any;
  let mockImage: any;
  const originalPlatform = process.platform;

  beforeEach(() => {
    vi.clearAllMocks();
    cleanupCaptureModule();
    mockImage = clipboard.readImage();
    mockImage.isEmpty.mockReturnValue(false);
    mockImage.toBitmap.mockReturnValue(Buffer.from('mock-bitmap'));
    mockImage.toDataURL.mockReturnValue('data:image/png;base64,mock-data');

    mockWindow = {
      isDestroyed: vi.fn().mockReturnValue(false),
      isVisible: vi.fn().mockReturnValue(true),
      isMinimized: vi.fn().mockReturnValue(false),
      show: vi.fn(),
      hide: vi.fn(),
      restore: vi.fn(),
      focus: vi.fn(),
      on: vi.fn(),
      webContents: {
        send: vi.fn(),
      },
    };
  });

  afterEach(() => {
    Object.defineProperty(process, 'platform', { value: originalPlatform });
  });

  it('triggers Windows screen capture via ms-screenclip protocol', () => {
    Object.defineProperty(process, 'platform', { value: 'win32' });
    triggerOSScreenCapture();
    expect(shell.openExternal).toHaveBeenCalledWith('ms-screenclip:');
  });

  it('uses normal capture even when older settings contain a retired resolution preference', () => {
    Object.defineProperty(process, 'platform', { value: 'win32' });
    updateCaptureConfigurations({ lastConfig: { captureShortcut: 'Disabled', captureResolution: '8k' } } as any, mockWindow);
    triggerOSScreenCapture();
    expect(shell.openExternal).toHaveBeenCalledWith('ms-screenclip:');
    mockImage.toBitmap.mockReturnValue(Buffer.from('new-captured-bitmap'));
    checkClipboardAndImport(mockWindow);
    expect(mockWindow.webContents.send).toHaveBeenCalledWith('hotkey:triggered', 'data:image/png;base64,mock-data', true);
  });

  it('triggers macOS screen capture via screencapture command', () => {
    Object.defineProperty(process, 'platform', { value: 'darwin' });
    triggerOSScreenCapture();
    expect(mockExec).toHaveBeenCalledWith('screencapture -i -c', expect.any(Function));
  });

  it('checks clipboard and imports new image to renderer', () => {
    checkClipboardAndImport(mockWindow);
    expect(mockWindow.webContents.send).toHaveBeenCalledWith(
      'hotkey:triggered',
      'data:image/png;base64,mock-data',
      false
    );
  });

  it('does not import if clipboard image is empty', () => {
    mockImage.isEmpty.mockReturnValue(true);
    checkClipboardAndImport(mockWindow);
    expect(mockWindow.webContents.send).not.toHaveBeenCalled();
  });

  it('does not import if image has not changed', () => {
    // First import
    checkClipboardAndImport(mockWindow);
    expect(mockWindow.webContents.send).toHaveBeenCalledTimes(1);

    // Second check with same buffer
    checkClipboardAndImport(mockWindow);
    expect(mockWindow.webContents.send).toHaveBeenCalledTimes(1); // Still 1
  });

  it('ignores self-copied image to prevent infinite loop', () => {
    const selfBuffer = Buffer.from('self-copied-buffer');
    mockImage.toBitmap.mockReturnValue(selfBuffer);

    // Tell capture module to ignore this buffer
    setIgnoreNextClipboardImage(selfBuffer);

    checkClipboardAndImport(mockWindow);
    expect(mockWindow.webContents.send).not.toHaveBeenCalled();
  });

  it('setupFocusCheck registers focus event', () => {
    setupFocusCheck(mockWindow);
    expect(mockWindow.on).toHaveBeenCalledWith('focus', expect.any(Function));
  });

  it('updates capture configurations based on settings', () => {
    const mockSettings = {
      windowBounds: { width: 100, height: 100 },
      lastConfig: {
        padding: 10, rounded: 10, shadow: 10, shadowColor: 'rgba(0,0,0,0.5)', shadowEnabled: true,
        inset: 0, insetColor: '', border: 0, borderColor: '', scale: 1, backgroundType: 'color' as const,
        backgroundValue: '', aspectRatio: 'Auto', canvasWidth: 100, canvasHeight: 100, paddingMode: 'fit' as const,
        chromeStyle: 'mac' as const, watermarkEnabled: false, watermarkText: '', position: '',
        autoImportCaptured: false,
        captureShortcut: 'PrintScreen',
      },
      presets: [],
    };

    updateCaptureConfigurations(mockSettings, mockWindow);
    expect(getAutoImportEnabled()).toBe(false);
    expect(globalShortcut.register).toHaveBeenCalledWith('PrintScreen', expect.any(Function));
    expect(getRegisteredShortcut()).toBe('PrintScreen');
  });

  it('disables auto-import on focus if global shortcut is Disabled', () => {
    const mockSettings = {
      windowBounds: { width: 100, height: 100 },
      lastConfig: {
        padding: 10, rounded: 10, shadow: 10, shadowColor: 'rgba(0,0,0,0.5)', shadowEnabled: true,
        inset: 0, insetColor: '', border: 0, borderColor: '', scale: 1, backgroundType: 'color' as const,
        backgroundValue: '', aspectRatio: 'Auto', canvasWidth: 100, canvasHeight: 100, paddingMode: 'fit' as const,
        chromeStyle: 'mac' as const, watermarkEnabled: false, watermarkText: '', position: '',
        autoImportCaptured: true,
        captureShortcut: 'Disabled',
      },
      presets: [],
    };

    updateCaptureConfigurations(mockSettings, mockWindow);
    expect(getAutoImportEnabled()).toBe(false);
    expect(globalShortcut.register).not.toHaveBeenCalled();
    expect(getRegisteredShortcut()).toBeNull();
  });

  it('sets isCaptureInitiated flag on triggering capture and resets on focus/cleanup', () => {
    expect(getIsCaptureInitiated()).toBe(false);
    triggerOSScreenCapture();
    expect(getIsCaptureInitiated()).toBe(true);

    cleanupCaptureModule();
    expect(getIsCaptureInitiated()).toBe(false);

    // Test reset on focus
    triggerOSScreenCapture();
    expect(getIsCaptureInitiated()).toBe(true);

    let focusCallback: () => void = () => {};
    mockWindow.on.mockImplementation((event: string, callback: () => void) => {
      if (event === 'focus') {
        focusCallback = callback;
      }
    });

    setupFocusCheck(mockWindow);
    expect(focusCallback).toBeDefined();

    // Trigger focus callback
    focusCallback();
    expect(getIsCaptureInitiated()).toBe(false);
  });

  it('does not import if clipboard contains text/HTML formats and capture was not initiated', () => {
    (clipboard.availableFormats as any).mockReturnValue(['text/html', 'image/png']);
    checkClipboardAndImport(mockWindow);
    expect(mockWindow.webContents.send).not.toHaveBeenCalled();
  });

  it('imports even if clipboard contains text/HTML formats if capture was explicitly initiated', () => {
    (clipboard.availableFormats as any).mockReturnValue(['text/html', 'image/png']);
    triggerOSScreenCapture();
    mockImage.toBitmap.mockReturnValue(Buffer.from('new-captured-bitmap'));
    checkClipboardAndImport(mockWindow);
    expect(mockWindow.webContents.send).toHaveBeenCalled();
  });
});
