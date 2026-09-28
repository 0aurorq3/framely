import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import BurstPackModal from '../src/renderer/components/burst/BurstPackModal';

const mockBurst = {
  modalOpen: true,
  openModal: vi.fn(),
  closeModal: vi.fn(),
  phase: 'idle' as 'idle' | 'rendering' | 'saving' | 'done' | 'error',
  progress: { current: 0, total: 0 },
  toast: null,
  lastResult: null as null | {
    bundlePath: string;
    documentName: string;
    variantCount: number;
    primaryExportPath: string;
  },
  saveBurstPack: vi.fn().mockResolvedValue({ success: true, variantCount: 4 }),
};

const mockApp = {
  documentName: 'my-screenshot',
  showToast: vi.fn(),
};

vi.mock('../src/renderer/contexts/BurstPackContext', () => ({
  useBurstPackContext: () => mockBurst,
}));

vi.mock('../src/renderer/AppContext', () => ({
  useAppContext: () => mockApp,
}));

describe('BurstPackModal', () => {
  beforeEach(() => {
    mockBurst.saveBurstPack.mockClear();
    mockBurst.closeModal.mockClear();
    mockBurst.modalOpen = true;
    mockBurst.phase = 'idle';
  });

  it('renders curated packs', () => {
    render(<BurstPackModal />);
    expect(screen.getByText('Platform Burst Pack')).toBeInTheDocument();
    expect(screen.getByText('Launch Kit')).toBeInTheDocument();
    expect(screen.getByText('Social Story Kit')).toBeInTheDocument();
  });

  it('calls saveBurstPack with selected pack', () => {
    render(<BurstPackModal />);
    fireEvent.click(screen.getByText('Save Burst Pack'));
    expect(mockBurst.saveBurstPack).toHaveBeenCalledWith('launch-kit', []);
  });

  it('renders nothing when modal is closed', () => {
    mockBurst.modalOpen = false;
    const { container } = render(<BurstPackModal />);
    expect(container.firstChild).toBeNull();
  });

  it('explains that a destination folder is chosen when saving', () => {
    render(<BurstPackModal />);
    expect(screen.getByText(/Choose a folder when saving/)).toBeInTheDocument();
    expect(document.querySelector('.burst-pack-save-dest-path')?.textContent).toContain('my-screenshot');
  });

  it('custom checkbox clears curated pack selection', () => {
    render(<BurstPackModal />);
    const checkboxes = screen.getAllByRole('checkbox');
    fireEvent.click(checkboxes[0]);
    expect(mockBurst.saveBurstPack).not.toHaveBeenCalled();
    fireEvent.click(screen.getByText('Save Burst Pack'));
    expect(mockBurst.saveBurstPack).toHaveBeenCalledWith(null, expect.arrayContaining([expect.any(String)]));
  });

  it('closes modal when Escape key is pressed', () => {
    render(<BurstPackModal />);
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(mockBurst.closeModal).toHaveBeenCalled();
  });

  it('does not close on Escape when busy', () => {
    mockBurst.phase = 'rendering';
    render(<BurstPackModal />);
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(mockBurst.closeModal).not.toHaveBeenCalled();
  });

  it('shows launch checklist after successful save', () => {
    mockBurst.phase = 'done';
    mockBurst.lastResult = {
      bundlePath: 'C:\\Users\\me\\Pictures\\Screenshot Beaut\\my-screenshot',
      documentName: 'my-screenshot',
      variantCount: 4,
      primaryExportPath: 'C:\\Users\\me\\Pictures\\Screenshot Beaut\\my-screenshot\\og.png',
    };
    render(<BurstPackModal />);
    expect(screen.getByTestId('burst-pack-done')).toBeInTheDocument();
    expect(screen.getByText(/4 platform variants saved/i)).toBeInTheDocument();
    expect(screen.getByText(/Copy Product Hunt caption/i)).toBeInTheDocument();
    expect(screen.getByText(/Copy launch tweet/i)).toBeInTheDocument();
  });
});
