import { beforeEach, describe, expect, it, vi } from 'vitest';

describe('settingsRegistry', () => {
  beforeEach(() => vi.resetModules());

  it('collects keywords for each active settings tab', async () => {
    const { registerSettingsSection, getKeywordsForTab } = await import('../src/renderer/utils/settingsRegistry');
    registerSettingsSection({ tab: 'general', label: 'Canvas', keywords: 'padding shadow' });
    registerSettingsSection({ tab: 'general', label: 'Export', keywords: 'png jpeg' });
    registerSettingsSection({ tab: 'shortcuts', label: 'Keyboard', keywords: 'paste undo' });

    expect(getKeywordsForTab('general')).toContain('padding');
    expect(getKeywordsForTab('general')).toContain('jpeg');
    expect(getKeywordsForTab('general')).not.toContain('undo');
    expect(getKeywordsForTab('shortcuts')).toContain('undo');
  });

  it('ignores duplicate section registration', async () => {
    const { registerSettingsSection, getKeywordsForTab } = await import('../src/renderer/utils/settingsRegistry');
    registerSettingsSection({ tab: 'shortcuts', label: 'Keyboard', keywords: 'paste undo' });
    registerSettingsSection({ tab: 'shortcuts', label: 'Keyboard', keywords: 'paste undo' });

    expect(getKeywordsForTab('shortcuts')).toBe('paste undo');
  });

  it('returns an empty string when the tab has no sections', async () => {
    const { getKeywordsForTab } = await import('../src/renderer/utils/settingsRegistry');
    expect(getKeywordsForTab('general')).toBe('');
  });
});
