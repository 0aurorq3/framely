import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import PresetSelector from '../src/renderer/components/PresetSelector';
import { makeFullMockContext } from './shared';

vi.mock('../src/renderer/AppContext', () => ({
  useAppContext: () => mockContext,
}));

let mockContext: ReturnType<typeof makeFullMockContext>;

beforeEach(() => {
  mockContext = {
    ...makeFullMockContext(),
    setAspectRatio: vi.fn(),
    setCanvasWidth: vi.fn(),
    setCanvasHeight: vi.fn(),
    setSelectedPreset: vi.fn(),
    pushHistory: vi.fn(),
    getCurrentConfig: vi.fn(() => ({ selectedPreset: '' })),
  };
});

describe('PresetSelector', () => {
  it('renders with placeholder when no preset selected', () => {
    render(<PresetSelector />);
    expect(screen.getByText('Select platform preset...')).toBeInTheDocument();
  });

  it('opens dropdown and shows search input when clicked', () => {
    render(<PresetSelector />);
    const trigger = screen.getByText('Select platform preset...');
    fireEvent.click(trigger);
    
    expect(screen.getByPlaceholderText('Search platforms, assets or sizes...')).toBeInTheDocument();
  });

  it('filters presets based on search query', () => {
    render(<PresetSelector />);
    fireEvent.click(screen.getByText('Select platform preset...'));
    
    const searchInput = screen.getByPlaceholderText('Search platforms, assets or sizes...');
    fireEvent.change(searchInput, { target: { value: 'YouTube Video' } });
    
    expect(screen.getByText('Video Thumbnail')).toBeInTheDocument();
    expect(screen.queryByText('Stories & Reels')).not.toBeInTheDocument();
  });

  it('selects a preset and sets state and history', () => {
    render(<PresetSelector />);
    fireEvent.click(screen.getByText('Select platform preset...'));
    
    const searchInput = screen.getByPlaceholderText('Search platforms, assets or sizes...');
    fireEvent.change(searchInput, { target: { value: 'YouTube Video' } });
    
    fireEvent.click(screen.getByText('Video Thumbnail'));
    
    expect(mockContext.setAspectRatio).toHaveBeenCalledWith('Custom');
    expect(mockContext.setCanvasWidth).toHaveBeenCalledWith(1280);
    expect(mockContext.setCanvasHeight).toHaveBeenCalledWith(720);
    expect(mockContext.setSelectedPreset).toHaveBeenCalledWith('YouTube - Video Thumbnail');
    expect(mockContext.pushHistory).toHaveBeenCalled();
  });

  it('displays selected preset and shows clear button', () => {
    mockContext.selectedPreset = 'YouTube - Video Thumbnail';
    render(<PresetSelector />);
    
    expect(screen.getByText('YouTube')).toBeInTheDocument();
    expect(screen.getByText('Video Thumbnail')).toBeInTheDocument();
    
    const clearBtn = screen.getByTitle('Clear preset selection');
    expect(clearBtn).toBeInTheDocument();
    
    fireEvent.click(clearBtn);
    expect(mockContext.setSelectedPreset).toHaveBeenCalledWith('');
    expect(mockContext.setAspectRatio).toHaveBeenCalledWith('Auto');
  });
});
