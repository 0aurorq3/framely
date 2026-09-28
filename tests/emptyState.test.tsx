import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import EmptyState from '../src/renderer/components/EmptyState';

// Mock AppContext — EmptyState only needs a small slice.
vi.mock('../src/renderer/AppContext', () => ({
  useAppContext: () => mockContext,
}));

// Mock shortcutLabels so the platform label is stable across environments.
vi.mock('../src/renderer/utils/shortcutLabels', () => ({
  getModKeyLabel: () => 'Ctrl',
}));

let mockContext: any;

beforeEach(() => {
  mockContext = {
    selectFile: vi.fn(),
    setNoImageMode: vi.fn(),
    setBackgroundType: vi.fn(),
    setShaderType: vi.fn(),
    setShaderColors: vi.fn(),
    setShaderParams: vi.fn(),
    setImageSrc: vi.fn(),
    pushHistory: vi.fn(),
    getCurrentConfig: vi.fn(() => ({})),
    setCodeStudioActive: vi.fn(),
    isDragging: false,
  };
});

describe('EmptyState', () => {
  it('renders the drop prompt and action buttons', () => {
    render(<EmptyState />);
    expect(screen.getByText('Drag & Drop screenshot here')).toBeInTheDocument();
    expect(screen.getByText('Create Blank Gradient')).toBeInTheDocument();
    expect(screen.getByText('Beautify Code')).toBeInTheDocument();
  });

  it('does not have the dragging class when isDragging is false', () => {
    const { container } = render(<EmptyState />);
    const emptyState = container.querySelector('.empty-state');
    expect(emptyState).not.toBeNull();
    expect(emptyState?.classList.contains('dragging')).toBe(false);
  });

  it('applies the dragging class when isDragging is true', () => {
    mockContext.isDragging = true;
    const { container } = render(<EmptyState />);
    const emptyState = container.querySelector('.empty-state');
    expect(emptyState?.classList.contains('dragging')).toBe(true);
  });

  it('calls selectFile when the drop zone is clicked', () => {
    render(<EmptyState />);
    fireEvent.click(screen.getByText('Drag & Drop screenshot here'));
    expect(mockContext.selectFile).toHaveBeenCalled();
  });

  it('creates a blank Framely Aurora without selecting a file', () => {
    render(<EmptyState />);
    fireEvent.click(screen.getByText('Create Blank Gradient'));
    expect(mockContext.setNoImageMode).toHaveBeenCalledWith(true);
    expect(mockContext.setBackgroundType).toHaveBeenCalledWith('shader');
    expect(mockContext.setShaderType).toHaveBeenCalledWith('staticMesh');
    expect(mockContext.setShaderColors).toHaveBeenCalledWith(expect.arrayContaining(['#356FE8', '#73E1F4', '#735CF2']));
    expect(mockContext.setShaderParams).toHaveBeenCalledWith(expect.objectContaining({ mixing: 0.86 }));
    expect(mockContext.setImageSrc).toHaveBeenCalledWith(null);
    expect(mockContext.pushHistory).toHaveBeenCalled();
  });

  it('activates code studio mode when Beautify Code is clicked', () => {
    render(<EmptyState />);
    fireEvent.click(screen.getByText('Beautify Code'));
    expect(mockContext.setCodeStudioActive).toHaveBeenCalledWith(true);
    expect(mockContext.setNoImageMode).toHaveBeenCalledWith(true);
    expect(mockContext.setBackgroundType).toHaveBeenCalledWith('gradient');
  });
});
