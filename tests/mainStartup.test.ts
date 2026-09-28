import { EventEmitter } from 'events';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const state = vi.hoisted(() => ({ windows: [] as any[], explicitBackend: false, appendSwitch: vi.fn() }));
const originalPlatform = process.platform;
vi.mock('electron', () => ({
  app: {
    commandLine: { hasSwitch: () => state.explicitBackend, appendSwitch: state.appendSwitch },
    whenReady: () => Promise.resolve(), on: vi.fn(),
  },
  BrowserWindow: class extends EventEmitter {
    destroyed = false;
    show = vi.fn(() => this.emit('show'));
    hide = vi.fn(() => this.emit('hide'));
    isDestroyed = () => this.destroyed;
    webContents = { setWindowOpenHandler: vi.fn() };
    setAutoHideMenuBar = vi.fn();
    setMenuBarVisibility = vi.fn();
    loadFile = vi.fn();
    constructor() { super(); state.windows.push(this); }
  },
  Tray: class { setToolTip() {} setContextMenu() {} on() {} },
  Menu: { buildFromTemplate: vi.fn(), setApplicationMenu: vi.fn() },
  session: { defaultSession: { setPermissionRequestHandler: vi.fn() } },
  ipcMain: {}, shell: {},
}));
vi.mock('fs', () => ({ mkdirSync: vi.fn() }));
vi.mock('../src/main/settings', () => ({
  loadSettings: () => ({ windowBounds: {} }),
  saveSettings: vi.fn(),
}));
vi.mock('../src/main/ipc', () => ({ registerIpcHandlers: vi.fn() }));
vi.mock('../src/main/burst', () => ({ registerBurstIpcHandlers: vi.fn() }));
vi.mock('../src/main/capture', () => ({ setupFocusCheck: vi.fn(), updateCaptureConfigurations: vi.fn(), cleanupCaptureModule: vi.fn(), triggerOSScreenCapture: vi.fn() }));

beforeEach(() => {
  vi.resetModules();
  vi.clearAllMocks();
  vi.useFakeTimers();
  state.windows = [];
  state.explicitBackend = false;
  vi.stubEnv('DISPLAY', ':1');
  Object.defineProperty(process, 'platform', { value: 'linux', configurable: true });
});
afterEach(() => {
  vi.useRealTimers(); vi.restoreAllMocks(); vi.unstubAllEnvs();
  Object.defineProperty(process, 'platform', { value: originalPlatform, configurable: true });
});
async function start() {
  await import('../src/main/main');
  return state.windows[0];
}

describe('main window startup', () => {
  it('shows a Linux window even if ready-to-show never arrives', async () => {
    const win = await start();
    vi.advanceTimersByTime(3000);
    expect(win.show).toHaveBeenCalledTimes(1);
    win.emit('ready-to-show');
    expect(win.show).toHaveBeenCalledTimes(1);
  });
  it('cancels the fallback after normal startup', async () => {
    const win = await start();
    win.emit('ready-to-show');
    vi.advanceTimersByTime(3000);
    expect(win.show).toHaveBeenCalledTimes(1);
  });
  it.each(['close', 'minimize', 'hide', 'closed'])('does not reopen after %s', async (event) => {
    const win = await start();
    win.emit(event, { preventDefault() {} });
    vi.advanceTimersByTime(3000);
    win.emit('ready-to-show');
    expect(win.show).not.toHaveBeenCalled();
  });
  it('uses the supported X11 flag when a display is available', async () => {
    await start();
    expect(state.appendSwitch).toHaveBeenCalledWith('ozone-platform', 'x11');
  });
  it('preserves an explicit backend choice', async () => {
    state.explicitBackend = true;
    await start();
    expect(state.appendSwitch).not.toHaveBeenCalled();
  });
  it('does not force X11 without an X display', async () => {
    vi.stubEnv('DISPLAY', '');
    await start();
    expect(state.appendSwitch).not.toHaveBeenCalled();
  });
  it.each(['darwin', 'win32'] as const)('keeps normal startup on %s', async (platform) => {
    Object.defineProperty(process, 'platform', { value: platform, configurable: true });
    const win = await start();
    vi.advanceTimersByTime(3000);
    expect(win.show).not.toHaveBeenCalled();
    expect(state.appendSwitch).not.toHaveBeenCalled();
    win.emit('ready-to-show');
    expect(win.show).toHaveBeenCalledTimes(1);
  });
});
