import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import WorkspaceFooter from '../src/renderer/components/WorkspaceFooter';

// Mock AppContext
vi.mock('../src/renderer/AppContext', () => ({
  useAppContext: () => mockContext,
  AppProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock('../src/renderer/contexts/BurstPackContext', () => ({
  useBurstPackContext: () => ({
    openModal: vi.fn(),
    toast: null,
  }),
}));

let mockContext: any = {};

describe('WorkspaceFooter & ShareMenu', () => {
  beforeEach(() => {
    mockContext = {
      imageSrc: 'data:image/png;base64,mock',
      noImageMode: false,
      exportFormat: 'png',
      jpegQuality: 90,
      triggerExport: vi.fn(),
      copyBeautifiedImage: vi.fn().mockResolvedValue(undefined),
      exportBeforeAfter: vi.fn(),
      copyBeforeAfter: vi.fn().mockResolvedValue(undefined),
      toastMessage: null,
      setExportFormat: vi.fn(),
      setJpegQuality: vi.fn(),
      compressionMode: 'balanced',
      setCompressionMode: vi.fn(),
      showToast: vi.fn(),
    };
    window.framelyAPI = {
      openURL: vi.fn(),
      copyTextToClipboard: vi.fn().mockResolvedValue(true),
    };
  });

  it('renders WorkspaceFooter components', () => {
    render(<WorkspaceFooter />);
    expect(screen.getByText('Export')).toBeInTheDocument();
    expect(screen.getByText('Copy')).toBeInTheDocument();
    expect(screen.getByText('Share')).toBeInTheDocument();
  });

  it('toggles share menu popover when clicking Share button', () => {
    render(<WorkspaceFooter />);
    
    // Popover shouldn't be visible initially
    expect(screen.queryByTestId('share-menu-popover')).not.toBeInTheDocument();

    // Click Share button
    const shareBtn = screen.getByText('Share');
    fireEvent.click(shareBtn);

    // Popover should be visible
    expect(screen.getByTestId('share-menu-popover')).toBeInTheDocument();
    expect(screen.getByText('Copy & post on X')).toBeInTheDocument();
    expect(screen.getByText('Copy & send on WhatsApp')).toBeInTheDocument();
    expect(screen.getByText('Copy & share on LinkedIn')).toBeInTheDocument();

    // Click Share button again
    fireEvent.click(shareBtn);
    expect(screen.queryByTestId('share-menu-popover')).not.toBeInTheDocument();
  });

  it('triggers copyBeautifiedImage when Copy is clicked', async () => {
    render(<WorkspaceFooter />);
    fireEvent.click(screen.getByText('Copy'));

    expect(mockContext.copyBeautifiedImage).toHaveBeenCalled();
  });

  it('triggers triggerExport when Export is clicked', () => {
    render(<WorkspaceFooter />);
    fireEvent.click(screen.getByText('Export'));

    expect(mockContext.triggerExport).toHaveBeenCalled();
  });

  it('copies image with caption and opens X/Twitter intent URL when Copy & post on X is clicked', async () => {
    render(<WorkspaceFooter />);
    fireEvent.click(screen.getByText('Share'));
    fireEvent.click(screen.getByText('Copy & post on X'));

    await waitFor(() => {
      expect(mockContext.copyBeautifiedImage).toHaveBeenCalledWith(
        expect.stringContaining('Framely')
      );
      expect(window.framelyAPI.openURL).toHaveBeenCalledWith(
        expect.stringContaining('x.com/intent/post')
      );
    });
    expect(screen.queryByTestId('share-menu-popover')).not.toBeInTheDocument();
  });

  it('copies image with caption and opens WhatsApp intent URL when Copy & send on WhatsApp is clicked', async () => {
    render(<WorkspaceFooter />);
    fireEvent.click(screen.getByText('Share'));
    fireEvent.click(screen.getByText('Copy & send on WhatsApp'));

    await waitFor(() => {
      expect(mockContext.copyBeautifiedImage).toHaveBeenCalledWith(
        expect.stringContaining('Framely')
      );
      expect(window.framelyAPI.openURL).toHaveBeenCalledWith(
        expect.stringContaining('api.whatsapp.com/send')
      );
    });
    expect(screen.queryByTestId('share-menu-popover')).not.toBeInTheDocument();
  });

  it('shows Before/After export and copy-caption items', () => {
    render(<WorkspaceFooter />);
    expect(screen.getByTestId('before-after-export')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Share'));
    expect(screen.getByTestId('copy-caption-only')).toBeInTheDocument();
    expect(screen.getByTestId('share-before-after')).toBeInTheDocument();
  });

  it('copies caption only when Copy Framely caption is clicked', async () => {
    render(<WorkspaceFooter />);
    fireEvent.click(screen.getByText('Share'));
    fireEvent.click(screen.getByTestId('copy-caption-only'));
    await waitFor(() => {
      expect(window.framelyAPI.copyTextToClipboard).toHaveBeenCalledWith(
        expect.stringContaining('Framely')
      );
    });
  });

  it('closes share menu popover when clicking outside', () => {
    render(<WorkspaceFooter />);
    fireEvent.click(screen.getByText('Share'));
    expect(screen.getByTestId('share-menu-popover')).toBeInTheDocument();

    // Trigger mousedown outside
    fireEvent.mouseDown(document.body);
    expect(screen.queryByTestId('share-menu-popover')).not.toBeInTheDocument();
  });

  it('closes share menu popover when Escape is pressed', () => {
    render(<WorkspaceFooter />);
    fireEvent.click(screen.getByText('Share'));
    expect(screen.getByTestId('share-menu-popover')).toBeInTheDocument();

    fireEvent.keyDown(document, { key: 'Escape' });
    expect(screen.queryByTestId('share-menu-popover')).not.toBeInTheDocument();
  });

  it('shows a success toast after Copy completes', async () => {
    render(<WorkspaceFooter />);
    fireEvent.click(screen.getByText('Copy'));
    await waitFor(() => {
      expect(mockContext.copyBeautifiedImage).toHaveBeenCalled();
      expect(mockContext.showToast).toHaveBeenCalledWith('Copied to clipboard');
    });
  });

  it('shows a success toast after Export is triggered', () => {
    render(<WorkspaceFooter />);
    fireEvent.click(screen.getByText('Export'));
    expect(mockContext.triggerExport).toHaveBeenCalled();
    expect(mockContext.showToast).toHaveBeenCalledWith('Exported successfully');
  });

  it('shows an error toast when Copy fails', async () => {
    mockContext.copyBeautifiedImage = vi.fn().mockRejectedValue(new Error('clip'));
    render(<WorkspaceFooter />);
    fireEvent.click(screen.getByText('Copy'));
    await waitFor(() => {
      expect(mockContext.showToast).toHaveBeenCalledWith('Copy failed', 4000);
    });
  });
});
