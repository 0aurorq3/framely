import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as path from 'path';

const {
  mockHandle, mockOn, mockShowOpenDialog, mockShowSaveDialog,
  mockClipboard, mockShell, mockNativeImage,
  mockLoadSettings, mockSaveSettings, mockTriggerCapture,
  mockSetIgnoreNext, mockUpdateCapture, mockCompressBuffer, mockDecodeDataUrl,
  mockReadFileSync, mockWriteFileSync, mockExistsSync, mockStatSync,
} = vi.hoisted(() => ({
  mockHandle: vi.fn(),
  mockOn: vi.fn(),
  mockShowOpenDialog: vi.fn(),
  mockShowSaveDialog: vi.fn(),
  mockClipboard: {
    writeImage: vi.fn(),
    write: vi.fn(),
    readImage: vi.fn(),
    writeText: vi.fn(),
  },
  mockShell: { openExternal: vi.fn(), openPath: vi.fn() },
  mockNativeImage: {
    createFromBuffer: vi.fn().mockReturnValue({ isEmpty: () => false }),
  },
  mockLoadSettings: vi.fn(),
  mockSaveSettings: vi.fn(),
  mockTriggerCapture: vi.fn(),
  mockSetIgnoreNext: vi.fn(),
  mockUpdateCapture: vi.fn(),
  mockCompressBuffer: vi.fn(),
  mockDecodeDataUrl: vi.fn(),
  mockReadFileSync: vi.fn(),
  mockWriteFileSync: vi.fn(),
  mockExistsSync: vi.fn(),
  mockStatSync: vi.fn(),
}));

vi.mock('electron', () => ({
  ipcMain: { handle: mockHandle, on: mockOn },
  dialog: { showOpenDialog: mockShowOpenDialog, showSaveDialog: mockShowSaveDialog },
  clipboard: mockClipboard,
  shell: mockShell,
  BrowserWindow: class {},
  nativeImage: mockNativeImage,
}));

vi.mock('../src/main/settings', () => ({
  loadSettings: () => mockLoadSettings(),
  saveSettings: (s: any) => mockSaveSettings(s),
}));

vi.mock('../src/main/capture', () => ({
  triggerOSScreenCapture: () => mockTriggerCapture(),
  setIgnoreNextClipboardImage: (b: any) => mockSetIgnoreNext(b),
  updateCaptureConfigurations: (s: any, w: any) => mockUpdateCapture(s, w),
}));

vi.mock('../src/main/imageCompression', () => ({
  compressImageBuffer: (buf: any, opts: any) => mockCompressBuffer(buf, opts),
  decodeImageDataUrl: (data: any) => mockDecodeDataUrl(data),
  CompressionMode: {},
}));

vi.mock('fs', () => ({
  readFileSync: (...args: any[]) => mockReadFileSync(...args),
  writeFileSync: (...args: any[]) => mockWriteFileSync(...args),
  existsSync: (...args: any[]) => mockExistsSync(...args),
  statSync: (...args: any[]) => mockStatSync(...args),
}));

import { registerIpcHandlers } from '../src/main/ipc';

function getHandler(channel: string) {
  const handleCall = mockHandle.mock.calls.find((args) => args[0] === channel);
  return handleCall ? handleCall[1] : null;
}

function getOnHandler(channel: string) {
  const onCall = mockOn.mock.calls.find((args) => args[0] === channel);
  return onCall ? onCall[1] : null;
}

const mockMainWindow = {
  setTitleBarOverlay: vi.fn(),
  webContents: { send: vi.fn() },
};

beforeEach(() => {
  vi.clearAllMocks();
  registerIpcHandlers(() => mockMainWindow as any);
});

describe('registerIpcHandlers', () => {
  it('registers all expected IPC channels', () => {
    const channels = mockHandle.mock.calls.map((args) => args[0]);
    expect(channels).toContain('settings:get');
    expect(channels).toContain('settings:set');
    expect(channels).toContain('file:open-dialog');
    expect(channels).toContain('file:open-in-explorer');
    expect(channels).toContain('file:save-dialog');
    expect(channels).toContain('clipboard:copy-image');
    expect(channels).toContain('clipboard:read-image');
    expect(channels).toContain('clipboard:copy-text');

    const onChannels = mockOn.mock.calls.map((args) => args[0]);
    expect(onChannels).toContain('theme:changed');
    expect(onChannels).toContain('url:open');
    expect(onChannels).toContain('capture:trigger');
  });

  describe('theme:changed', () => {
    it('calls setTitleBarOverlay on win32', () => {
      const origPlatform = process.platform;
      Object.defineProperty(process, 'platform', { value: 'win32' });
      const handler = getOnHandler('theme:changed');
      handler({}, 'dark');
      expect(mockMainWindow.setTitleBarOverlay).toHaveBeenCalled();
      Object.defineProperty(process, 'platform', { value: origPlatform });
    });
  });

  describe('settings:get', () => {
    it('returns loaded settings', () => {
      mockLoadSettings.mockReturnValue({ padding: 50 });
      const handler = getHandler('settings:get');
      expect(handler()).toEqual({ padding: 50 });
    });
  });

  describe('settings:set', () => {
    it('merges and saves settings', () => {
      mockLoadSettings.mockReturnValue({ padding: 30 });
      const handler = getHandler('settings:set');
      handler({}, { padding: 50, rounded: 20 });
      expect(mockSaveSettings).toHaveBeenCalledWith(
        expect.objectContaining({ padding: 50, rounded: 20 })
      );
    });

    it('calls updateCaptureConfigurations', () => {
      mockLoadSettings.mockReturnValue({ padding: 30 });
      const handler = getHandler('settings:set');
      handler({}, { padding: 50 });
      expect(mockUpdateCapture).toHaveBeenCalled();
    });
  });

  describe('file:open-dialog', () => {
    it('returns null when dialog is cancelled', async () => {
      mockShowOpenDialog.mockResolvedValue({ canceled: true, filePaths: [] });
      const handler = getHandler('file:open-dialog');
      const result = await handler();
      expect(result).toBeNull();
    });

    it('returns null when no main window', async () => {
      vi.clearAllMocks();
      registerIpcHandlers(() => null);
      const handler = getHandler('file:open-dialog');
      const result = await handler();
      expect(result).toBeNull();
    });

    it('returns base64 data URL when file is selected (PNG)', async () => {
      mockShowOpenDialog.mockResolvedValue({ canceled: false, filePaths: ['/path/to/image.png'] });
      mockReadFileSync.mockReturnValue(Buffer.from('fake-png-data'));
      const handler = getHandler('file:open-dialog');
      const result = await handler();
      expect(result).toContain('data:image/png;base64,');
    });

    it('returns base64 data URL for JPEG file', async () => {
      mockShowOpenDialog.mockResolvedValue({ canceled: false, filePaths: ['/path/to/image.jpg'] });
      mockReadFileSync.mockReturnValue(Buffer.from('fake-jpg-data'));
      const handler = getHandler('file:open-dialog');
      const result = await handler();
      expect(result).toContain('data:image/jpeg;base64,');
    });

    it('returns base64 data URL for WebP file', async () => {
      mockShowOpenDialog.mockResolvedValue({ canceled: false, filePaths: ['/path/to/image.webp'] });
      mockReadFileSync.mockReturnValue(Buffer.from('fake-webp-data'));
      const handler = getHandler('file:open-dialog');
      const result = await handler();
      expect(result).toContain('data:image/webp;base64,');
    });
  });

  describe('file:open-in-explorer', () => {
    it('opens an existing output folder', async () => {
      const folder = path.resolve('exports');
      mockExistsSync.mockReturnValue(true);
      mockStatSync.mockReturnValue({ isDirectory: () => true });
      mockShell.openPath.mockResolvedValue('');
      const handler = getHandler('file:open-in-explorer');
      expect(await handler({}, folder)).toBe(true);
      expect(mockShell.openPath).toHaveBeenCalledWith(folder);
    });

    it('rejects a relative path', async () => {
      const handler = getHandler('file:open-in-explorer');
      expect(await handler({}, '../exports')).toBe(false);
      expect(mockShell.openPath).not.toHaveBeenCalled();
    });

    it('does not open a file as an application', async () => {
      mockExistsSync.mockReturnValue(true);
      mockStatSync.mockReturnValue({ isDirectory: () => false });
      const handler = getHandler('file:open-in-explorer');
      expect(await handler({}, path.resolve('Framely.exe'))).toBe(false);
      expect(mockShell.openPath).not.toHaveBeenCalled();
    });
  });

  describe('file:save-dialog', () => {
    it('returns false when no main window', async () => {
      vi.clearAllMocks();
      registerIpcHandlers(() => null);
      const handler = getHandler('file:save-dialog');
      const result = await handler({}, { base64Data: 'data', type: 'png', quality: 90 });
      expect(result).toBe(false);
    });

    it('returns false when dialog is cancelled', async () => {
      mockShowSaveDialog.mockResolvedValue({ canceled: true, filePath: '' });
      const handler = getHandler('file:save-dialog');
      const result = await handler({}, { base64Data: 'data:image/png;base64,abc', type: 'png', quality: 90 });
      expect(result).toBe(false);
    });

    it('returns true and writes file when save succeeds', async () => {
      mockShowSaveDialog.mockResolvedValue({ canceled: false, filePath: '/path/to/output.png' });
      mockDecodeDataUrl.mockReturnValue(Buffer.from('decoded'));
      mockCompressBuffer.mockResolvedValue(Buffer.from('compressed'));
      const handler = getHandler('file:save-dialog');
      const result = await handler({}, { base64Data: 'data:image/png;base64,abc', type: 'png', quality: 90 });
      expect(result).toBe(true);
      expect(mockCompressBuffer).toHaveBeenCalled();
      expect(mockWriteFileSync).toHaveBeenCalledWith('/path/to/output.png', expect.any(Buffer));
    });

    it('handles JPEG export', async () => {
      mockShowSaveDialog.mockResolvedValue({ canceled: false, filePath: '/path/to/output.jpg' });
      mockDecodeDataUrl.mockReturnValue(Buffer.from('decoded'));
      mockCompressBuffer.mockResolvedValue(Buffer.from('compressed'));
      const handler = getHandler('file:save-dialog');
      const result = await handler({}, { base64Data: 'data:image/jpeg;base64,abc', type: 'jpeg', quality: 80 });
      expect(result).toBe(true);
    });

    it('handles WebP export', async () => {
      mockShowSaveDialog.mockResolvedValue({ canceled: false, filePath: '/path/to/output.webp' });
      mockDecodeDataUrl.mockReturnValue(Buffer.from('decoded'));
      mockCompressBuffer.mockResolvedValue(Buffer.from('compressed'));
      const handler = getHandler('file:save-dialog');
      const result = await handler({}, { base64Data: 'data:image/webp;base64,abc', type: 'webp', quality: 85 });
      expect(result).toBe(true);
    });
  });

  describe('clipboard:copy-image', () => {
    it('stores the OS-converted bitmap after copying', async () => {
      const bitmap = Buffer.from('bitmap');
      mockClipboard.readImage.mockReturnValue({
        isEmpty: () => false,
        toBitmap: () => bitmap,
      });
      const handler = getHandler('clipboard:copy-image');
      const result = await handler({}, 'data:image/png;base64,abc');
      expect(result).toBe(true);
      expect(mockSetIgnoreNext).toHaveBeenCalledWith(bitmap);
    });

    it('returns false on error', async () => {
      mockClipboard.writeImage.mockImplementation(() => { throw new Error('fail'); });
      const handler = getHandler('clipboard:copy-image');
      const result = await handler({}, 'data:image/png;base64,abc');
      expect(result).toBe(false);
    });
  });

  describe('clipboard:read-image', () => {
    it('returns null when clipboard is empty', () => {
      mockClipboard.readImage.mockReturnValue({ isEmpty: () => true });
      const handler = getHandler('clipboard:read-image');
      expect(handler()).toBeNull();
    });

    it('returns data URL when clipboard has image', () => {
      mockClipboard.readImage.mockReturnValue({
        isEmpty: () => false,
        toDataURL: () => 'data:image/png;base64,abc',
      });
      const handler = getHandler('clipboard:read-image');
      expect(handler()).toBe('data:image/png;base64,abc');
    });
  });

  describe('clipboard:copy-text', () => {
    it('returns true on success', () => {
      const handler = getHandler('clipboard:copy-text');
      expect(handler({}, 'hello')).toBe(true);
      expect(mockClipboard.writeText).toHaveBeenCalledWith('hello');
    });

    it('returns false on error', () => {
      mockClipboard.writeText.mockImplementation(() => { throw new Error('fail'); });
      const handler = getHandler('clipboard:copy-text');
      expect(handler({}, 'hello')).toBe(false);
    });
  });

  describe('url:open', () => {
    it('opens external URL', () => {
      const handler = getOnHandler('url:open');
      handler({}, 'https://example.com');
      expect(mockShell.openExternal).toHaveBeenCalledWith('https://example.com');
    });
  });

  describe('capture:trigger', () => {
    it('triggers OS screen capture', () => {
      const handler = getOnHandler('capture:trigger');
      handler();
      expect(mockTriggerCapture).toHaveBeenCalled();
    });
  });

});
