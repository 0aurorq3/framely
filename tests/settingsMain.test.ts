import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as fs from 'fs';

// Mock electron
vi.mock('electron', () => ({
  app: {
    getPath: vi.fn().mockReturnValue('/mocked/user/data'),
  },
}));

// Mock fs
vi.mock('fs', () => ({
  existsSync: vi.fn(),
  readFileSync: vi.fn(),
  writeFileSync: vi.fn(),
}));

import { loadSettings, saveSettings, defaultSettings, getSettingsPath } from '../src/main/settings';
import { FRAMELY_AURORA_COLORS } from '../src/shared/framelyAurora';

describe('Settings Main Module', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('computes correct settings path', () => {
    expect(getSettingsPath()).toContain('settings.json');
  });

  it('loads default settings when file does not exist', () => {
    vi.mocked(fs.existsSync).mockReturnValue(false);
    const settings = loadSettings();
    expect(settings).toEqual(defaultSettings);
  });

  it('loads and parses saved settings from disk', () => {
    vi.mocked(fs.existsSync).mockReturnValue(true);
    const mockData = {
      windowBounds: { width: 800, height: 600 },
      lastConfig: { padding: 40, captureShortcut: 'Ctrl+Shift+S', captureResolution: '8k' },
      presets: [],
    };
    vi.mocked(fs.readFileSync).mockReturnValue(JSON.stringify(mockData));

    const settings = loadSettings();
    expect(settings.windowBounds.width).toBe(800);
    expect(settings.lastConfig.padding).toBe(40);
    // Should fallback to default autoImportCaptured
    expect(settings.lastConfig.autoImportCaptured).toBe(true);
    expect(settings.lastConfig).not.toHaveProperty('captureResolution');
  });

  it('moves older saved backgrounds to Framely Aurora once', () => {
    vi.mocked(fs.existsSync).mockReturnValue(true);
    vi.mocked(fs.readFileSync).mockReturnValue(JSON.stringify({
      ...defaultSettings,
      settingsVersion: 1,
      lastConfig: { ...defaultSettings.lastConfig, backgroundType: 'gradient' },
    }));

    const settings = loadSettings();
    expect(settings.settingsVersion).toBe(2);
    expect(settings.lastConfig.backgroundType).toBe('shader');
    expect(settings.lastConfig.shaderColors).toEqual(FRAMELY_AURORA_COLORS);
  });

  it('keeps backgrounds chosen after the migration', () => {
    vi.mocked(fs.existsSync).mockReturnValue(true);
    vi.mocked(fs.readFileSync).mockReturnValue(JSON.stringify({
      ...defaultSettings,
      lastConfig: { ...defaultSettings.lastConfig, backgroundType: 'gradient' },
    }));

    expect(loadSettings().lastConfig.backgroundType).toBe('gradient');
  });

  it('does not expose or persist settings outside the current schema', () => {
    vi.mocked(fs.existsSync).mockReturnValue(true);
    vi.mocked(fs.readFileSync).mockReturnValue(JSON.stringify({
      ...defaultSettings,
      obsoleteCredential: 'secret',
    }));

    const settings = loadSettings();
    expect(settings).not.toHaveProperty('obsoleteCredential');

    saveSettings({ ...settings, lastConfig: { ...settings.lastConfig, captureResolution: '4k' }, obsoleteCredential: 'secret' } as typeof settings);
    const saved = vi.mocked(fs.writeFileSync).mock.calls[0][1] as string;
    expect(saved).not.toContain('obsoleteCredential');
    expect(saved).not.toContain('captureResolution');
  });

  it('saves settings to disk correctly', () => {
    const mockData = {
      windowBounds: { width: 900, height: 700 },
      lastConfig: { padding: 10, rounded: 5, shadow: 15, shadowColor: 'black', shadowEnabled: true, inset: 0, insetColor: 'white', border: 0, borderColor: 'white', scale: 100, backgroundType: 'color' as const, backgroundValue: 'red', aspectRatio: 'Auto', canvasWidth: 100, canvasHeight: 100, paddingMode: 'fit' as const, chromeStyle: 'mac' as const, watermarkEnabled: false, watermarkText: 'x', position: 'center' },
      presets: [],
    };

    saveSettings(mockData);
    expect(fs.writeFileSync).toHaveBeenCalledWith(
      expect.stringContaining('settings.json'),
      expect.stringContaining('900'),
      'utf-8'
    );
  });
});
