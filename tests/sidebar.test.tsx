import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Sidebar from '../src/renderer/components/Sidebar';
import { makeFullMockContext } from './shared';

vi.mock('../src/renderer/AppContext', () => ({
  useAppContext: () => mockContext,
}));

let mockContext: ReturnType<typeof makeFullMockContext>;

beforeEach(() => {
  mockContext = {
    ...makeFullMockContext(),
    sidebarVisible: true,
    setSidebarVisible: vi.fn(),
    sidebarPosition: 'left',
    selectFile: vi.fn(),
    pasteFromClipboard: vi.fn(),
    saveCustomPreset: vi.fn(),
    deleteCustomPreset: vi.fn(),
    selectBackgroundPreset: vi.fn(),
    resetStyles: vi.fn(),
    customPresets: [],
  };
});

describe('Sidebar', () => {
  describe('rendering', () => {
    it('renders sidebar with app name', () => {
      render(<Sidebar />);
      expect(screen.getByText('Framely')).toBeInTheDocument();
    });

    it('shows collapsed class when not visible', () => {
      mockContext.sidebarVisible = false;
      const { container } = render(<Sidebar />);
      const sidebar = container.querySelector('.sidebar');
      expect(sidebar).toBeTruthy();
      expect(sidebar?.classList.contains('collapsed')).toBe(true);
    });

    it('does not have collapsed class when visible', () => {
      const { container } = render(<Sidebar />);
      const sidebar = container.querySelector('.sidebar');
      expect(sidebar?.classList.contains('collapsed')).toBe(false);
    });

    it('renders logo image', () => {
      render(<Sidebar />);
      const logo = document.querySelector('.sidebar-logo');
      expect(logo).toBeTruthy();
    });
  });

  describe('sidebar position', () => {
    it('renders with left class by default', () => {
      const { container } = render(<Sidebar />);
      const sidebar = container.querySelector('.sidebar');
      expect(sidebar?.classList.contains('left')).toBe(true);
    });

    it('renders with right class when configured', () => {
      mockContext.sidebarPosition = 'right';
      const { container } = render(<Sidebar />);
      const sidebar = container.querySelector('.sidebar');
      expect(sidebar?.classList.contains('right')).toBe(true);
    });
  });

  describe('action buttons', () => {
    it('renders action buttons container', () => {
      const { container } = render(<Sidebar />);
      const actions = container.querySelector('.sidebar-actions');
      expect(actions).toBeTruthy();
      // Should have 3 buttons (New, Paste, Reset)
      const buttons = actions?.querySelectorAll('button');
      expect(buttons?.length).toBe(3);
    });

    it('New snap button triggers selectFile', () => {
      const { container } = render(<Sidebar />);
      const newBtn = container.querySelector('[title="New snap"]') as HTMLElement;
      expect(newBtn).toBeTruthy();
      fireEvent.click(newBtn);
      expect(mockContext.selectFile).toHaveBeenCalled();
    });

    it('Paste button triggers pasteFromClipboard', () => {
      const { container } = render(<Sidebar />);
      const pasteBtn = container.querySelector('[title="Paste"]') as HTMLElement;
      expect(pasteBtn).toBeTruthy();
      fireEvent.click(pasteBtn);
      expect(mockContext.pasteFromClipboard).toHaveBeenCalled();
    });
  });

  describe('reset button', () => {
    it('renders reset button', () => {
      const { container } = render(<Sidebar />);
      const resetBtn = container.querySelector('[title="Reset Styles"]') as HTMLElement;
      expect(resetBtn).toBeTruthy();
    });

    it('shows confirm dialog on reset click', () => {
      const mockConfirm = vi.fn().mockReturnValue(false);
      vi.stubGlobal('confirm', mockConfirm);

      const { container } = render(<Sidebar />);
      const resetBtn = container.querySelector('[title="Reset Styles"]') as HTMLElement;
      fireEvent.click(resetBtn);

      expect(mockConfirm).toHaveBeenCalled();
      expect(mockContext.resetStyles).not.toHaveBeenCalled();
    });

    it('calls resetStyles when confirmed', () => {
      const mockConfirm = vi.fn().mockReturnValue(true);
      vi.stubGlobal('confirm', mockConfirm);

      const { container } = render(<Sidebar />);
      const resetBtn = container.querySelector('[title="Reset Styles"]') as HTMLElement;
      fireEvent.click(resetBtn);

      expect(mockContext.resetStyles).toHaveBeenCalled();
    });
  });

});
