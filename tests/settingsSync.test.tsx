import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, act, waitFor } from '@testing-library/react';
import { AppProvider, useAppContext } from '../src/renderer/AppContext';

// Mock framelyAPI on window
const mockSaveSettings = vi.fn();
(window as any).framelyAPI = {
  getSettings: vi.fn().mockResolvedValue({ lastConfig: null, presets: [] }),
  saveSettings: mockSaveSettings,
  onGlobalHotkeyTriggered: vi.fn().mockReturnValue(() => {}),
};

// Test consumer to trigger changes
function TestConsumer() {
  const {
    exportFormat, setExportFormat,
    jpegQuality, setJpegQuality,
    sidebarPosition, setSidebarPosition,
  } = useAppContext();

  return (
    <div>
      <span data-testid="exportFormat">{exportFormat}</span>
      <span data-testid="jpegQuality">{jpegQuality}</span>
      <span data-testid="sidebarPosition">{sidebarPosition}</span>
      
      <button data-testid="change-format" onClick={() => setExportFormat('jpeg')}>Change Format</button>
      <button data-testid="change-quality" onClick={() => setJpegQuality(75)}>Change Quality</button>
      <button data-testid="change-sidebar" onClick={() => setSidebarPosition('left')}>Change Sidebar</button>
    </div>
  );
}

describe('Settings Synchronization', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('updates localStorage and saves to framelyAPI when exportFormat, jpegQuality, or sidebarPosition change', async () => {
    render(
      <AppProvider>
        <TestConsumer />
      </AppProvider>
    );

    // Initial values
    expect(screen.getByTestId('exportFormat').textContent).toBe('png');
    expect(screen.getByTestId('jpegQuality').textContent).toBe('90');
    expect(screen.getByTestId('sidebarPosition').textContent).toBe('right');

    // Change exportFormat
    act(() => {
      fireEvent.click(screen.getByTestId('change-format'));
    });
    expect(screen.getByTestId('exportFormat').textContent).toBe('jpeg');
    
    // Check localStorage is updated
    await waitFor(() => {
      const defaults = JSON.parse(localStorage.getItem('framely-user-defaults') || '{}');
      expect(defaults.exportFormat).toBe('jpeg');
    });

    // Change jpegQuality
    act(() => {
      fireEvent.click(screen.getByTestId('change-quality'));
    });
    expect(screen.getByTestId('jpegQuality').textContent).toBe('75');

    await waitFor(() => {
      const defaults = JSON.parse(localStorage.getItem('framely-user-defaults') || '{}');
      expect(defaults.jpegQuality).toBe(75);
    });

    // Change sidebarPosition
    act(() => {
      fireEvent.click(screen.getByTestId('change-sidebar'));
    });
    expect(screen.getByTestId('sidebarPosition').textContent).toBe('left');

    await waitFor(() => {
      const defaults = JSON.parse(localStorage.getItem('framely-user-defaults') || '{}');
      expect(defaults.sidebarPosition).toBe('left');
    });

    // Verify framelyAPI.saveSettings is eventually called with the updated config
    await waitFor(() => {
      expect(mockSaveSettings).toHaveBeenCalled();
      const lastCallArgs = mockSaveSettings.mock.calls[mockSaveSettings.mock.calls.length - 1][0];
      expect(lastCallArgs.lastConfig.exportFormat).toBe('jpeg');
      expect(lastCallArgs.lastConfig.jpegQuality).toBe(75);
      expect(lastCallArgs.lastConfig.sidebarPosition).toBe('left');
    }, { timeout: 2500 });
  });
});
