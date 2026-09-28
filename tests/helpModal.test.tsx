import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import HelpModal from '../src/renderer/components/HelpModal';
import { makeFullMockContext } from './shared';

vi.mock('../src/renderer/AppContext', () => ({
  useAppContext: () => mockContext,
}));

let mockContext: ReturnType<typeof makeFullMockContext>;

beforeEach(() => {
  mockContext = {
    ...makeFullMockContext(),
    helpVisible: false,
    setHelpVisible: vi.fn(),
  };
  vi.restoreAllMocks();
});

describe('HelpModal', () => {
  describe('conditional rendering', () => {
    it('returns null when helpVisible is false', () => {
      mockContext.helpVisible = false;
      const { container } = render(<HelpModal />);
      expect(container.firstChild).toBeNull();
    });

    it('renders modal when helpVisible is true', () => {
      mockContext.helpVisible = true;
      render(<HelpModal />);
      expect(screen.getByText('Framely')).toBeInTheDocument();
    });
  });

  describe('modal content', () => {
    beforeEach(() => {
      mockContext.helpVisible = true;
    });

    it('displays the app name and version', () => {
      render(<HelpModal />);
      expect(screen.getByText('Framely')).toBeInTheDocument();
      // Version is rendered in two places
      const versionElements = screen.getAllByText(/Version/);
      expect(versionElements.length).toBeGreaterThanOrEqual(1);
    });

    it('displays system specs section', () => {
      render(<HelpModal />);
      expect(screen.getByText(/Electron:/)).toBeInTheDocument();
      expect(screen.getByText(/Chromium:/)).toBeInTheDocument();
      expect(screen.getByText(/Node.js:/)).toBeInTheDocument();
      expect(screen.getByText(/V8:/)).toBeInTheDocument();
      expect(screen.getByText(/OS:/)).toBeInTheDocument();
    });

    it('displays copyright with current year', () => {
      render(<HelpModal />);
      const year = new Date().getFullYear().toString();
      // Match only the copyright line, not version strings
      expect(screen.getByText(new RegExp(`©\\s*${year}`))).toBeInTheDocument();
    });

    it('renders Done and Copy buttons', () => {
      render(<HelpModal />);
      expect(screen.getByText('Done')).toBeInTheDocument();
      expect(screen.getByText('Copy')).toBeInTheDocument();
    });
  });

  describe('close behavior', () => {
    beforeEach(() => {
      mockContext.helpVisible = true;
    });

    it('closes modal when X button is clicked', () => {
      render(<HelpModal />);
      const closeBtn = screen.getByLabelText('Close help');
      fireEvent.click(closeBtn);
      expect(mockContext.setHelpVisible).toHaveBeenCalledWith(false);
    });

    it('closes modal when Done button is clicked', () => {
      render(<HelpModal />);
      fireEvent.click(screen.getByText('Done'));
      expect(mockContext.setHelpVisible).toHaveBeenCalledWith(false);
    });

    it('closes modal when clicking overlay background', () => {
      const { container } = render(<HelpModal />);
      const overlay = container.querySelector('.modal-overlay');
      expect(overlay).toBeTruthy();
      fireEvent.click(overlay!);
      expect(mockContext.setHelpVisible).toHaveBeenCalledWith(false);
    });

    it('does NOT close when clicking the modal card itself', () => {
      const { container } = render(<HelpModal />);
      const card = container.querySelector('.modal-card');
      expect(card).toBeTruthy();
      fireEvent.click(card!);
      expect(mockContext.setHelpVisible).not.toHaveBeenCalled();
    });
  });

  describe('Copy button', () => {
    beforeEach(() => {
      mockContext.helpVisible = true;
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('copies version info to clipboard and shows Copied!', async () => {
      const writeTextMock = vi.fn().mockResolvedValue(undefined);
      Object.assign(navigator, {
        clipboard: { writeText: writeTextMock },
      });

      render(<HelpModal />);
      fireEvent.click(screen.getByText('Copy'));

      expect(writeTextMock).toHaveBeenCalled();
      const copiedText = writeTextMock.mock.calls[0][0];
      expect(copiedText).toContain('Framely Version:');
      expect(copiedText).toContain('Electron:');
      expect(copiedText).toContain('Chromium:');
      expect(copiedText).toContain('Node.js:');
      expect(copiedText).toContain('V8:');
      expect(copiedText).toContain('OS:');
    });

    it('shows "Copied!" after clicking copy and reverts after 2s', async () => {
      const writeTextMock = vi.fn().mockResolvedValue(undefined);
      Object.assign(navigator, {
        clipboard: { writeText: writeTextMock },
      });

      render(<HelpModal />);
      fireEvent.click(screen.getByText('Copy'));

      // After copy resolves
      await act(async () => {
        await Promise.resolve();
      });

      expect(screen.getByText('Copied!')).toBeInTheDocument();

      // Advance time past 2000ms
      act(() => {
        vi.advanceTimersByTime(2500);
      });

      expect(screen.getByText('Copy')).toBeInTheDocument();
    });

    it('handles clipboard error gracefully', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const writeTextMock = vi.fn().mockRejectedValue(new Error('Clipboard error'));
      Object.assign(navigator, {
        clipboard: { writeText: writeTextMock },
      });

      render(<HelpModal />);
      fireEvent.click(screen.getByText('Copy'));

      await act(async () => {
        await Promise.resolve().catch(() => {});
      });

      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });

  describe('version fallback', () => {
    it('falls back to userAgent parsing when API versions are N/A', () => {
      mockContext.helpVisible = true;
      // framelyAPI with N/A versions triggers userAgent fallback
      vi.stubGlobal('framelyAPI', {
        versions: { electron: 'N/A', chrome: 'N/A', node: 'N/A', v8: 'N/A' },
        platform: 'Win32',
      });

      render(<HelpModal />);
      // Should still render the spec section
      expect(screen.getByText(/Electron:/)).toBeInTheDocument();
    });

    it('uses API versions when available', () => {
      mockContext.helpVisible = true;
      vi.stubGlobal('framelyAPI', {
        versions: { electron: '31.0.0', chrome: '120.0.0', node: '20.0.0', v8: '12.0.0' },
        platform: 'Win32',
      });

      render(<HelpModal />);
      expect(screen.getByText(/31\.0\.0/)).toBeInTheDocument();
    });
  });

});
