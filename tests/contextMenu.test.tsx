import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ContextMenu from '../src/renderer/components/ContextMenu';
import { makeFullMockContext } from './shared';

vi.mock('../src/renderer/AppContext', () => ({
  useAppContext: () => mockContext,
}));

let mockContext: ReturnType<typeof makeFullMockContext>;

beforeEach(() => {
  mockContext = {
    ...makeFullMockContext(),
    copyBeautifiedImage: vi.fn().mockResolvedValue(undefined),
    triggerExport: vi.fn(),
    resetStyles: vi.fn(),
  };
});

describe('ContextMenu', () => {
  const defaultProps = {
    x: 100,
    y: 100,
    onClose: vi.fn(),
    hasImage: true,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders all menu items', () => {
    render(<ContextMenu {...defaultProps} />);
    expect(screen.getByText('Copy Image')).toBeInTheDocument();
    expect(screen.getByText('Export Image')).toBeInTheDocument();
    expect(screen.getByText('Reset Styles')).toBeInTheDocument();
  });

  it('disables Copy Image when no image', () => {
    render(<ContextMenu {...defaultProps} hasImage={false} />);
    const copyBtn = screen.getByText('Copy Image').closest('button');
    expect(copyBtn).toBeDisabled();
  });

  it('disables Export Image when no image', () => {
    render(<ContextMenu {...defaultProps} hasImage={false} />);
    const exportBtn = screen.getByText('Export Image').closest('button');
    expect(exportBtn).toBeDisabled();
  });

  it('Reset Styles is always enabled', () => {
    render(<ContextMenu {...defaultProps} hasImage={false} />);
    const resetBtn = screen.getByText('Reset Styles').closest('button');
    expect(resetBtn).not.toBeDisabled();
  });

  it('calls resetStyles and onClose when Reset Styles is clicked', () => {
    render(<ContextMenu {...defaultProps} />);
    fireEvent.click(screen.getByText('Reset Styles'));
    expect(defaultProps.onClose).toHaveBeenCalled();
    expect(mockContext.resetStyles).toHaveBeenCalled();
  });

  it('calls triggerExport and onClose when Export Image is clicked', () => {
    render(<ContextMenu {...defaultProps} />);
    fireEvent.click(screen.getByText('Export Image'));
    expect(defaultProps.onClose).toHaveBeenCalled();
    expect(mockContext.triggerExport).toHaveBeenCalled();
  });

  it('positions menu at given coordinates', () => {
    const { container } = render(<ContextMenu {...defaultProps} x={200} y={300} />);
    const menu = container.querySelector('.custom-context-menu') as HTMLElement;
    expect(menu).toBeTruthy();
  });

  it('stops click propagation on the menu container', () => {
    const stopPropagation = vi.fn();
    const { container } = render(<ContextMenu {...defaultProps} />);
    const menu = container.querySelector('.custom-context-menu') as HTMLElement;
    fireEvent.click(menu, { stopPropagation });
  });
});
