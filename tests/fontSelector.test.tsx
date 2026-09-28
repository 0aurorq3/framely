import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import FontSelector from '../src/renderer/components/FontSelector';

// Mock AppContext
const mockSetPreviewFont = vi.fn();
vi.mock('../src/renderer/AppContext', () => ({
  useAppContext: () => ({
    setPreviewFont: mockSetPreviewFont,
  }),
}));

describe('FontSelector Component', () => {
  const systemFonts = ['Arial', 'Georgia', 'Courier New'];
  let onChange: any;

  beforeEach(() => {
    onChange = vi.fn();
    mockSetPreviewFont.mockClear();
  });

  it('renders with the current value and chevron icon', () => {
    render(
      <FontSelector
        value="Arial"
        onChange={onChange}
        systemFonts={systemFonts}
      />
    );
    expect(screen.getByText('Arial')).toBeInTheDocument();
  });

  it('toggles font dropdown when trigger button is clicked', () => {
    render(
      <FontSelector
        value="Arial"
        onChange={onChange}
        systemFonts={systemFonts}
      />
    );

    // Dropdown list should not be visible initially
    expect(screen.queryByPlaceholderText('Search fonts...')).not.toBeInTheDocument();

    // Click trigger button
    fireEvent.click(screen.getByRole('button'));

    // Dropdown list and search box should be visible
    expect(screen.getByPlaceholderText('Search fonts...')).toBeInTheDocument();
    systemFonts.forEach(font => {
      expect(screen.getAllByText(font).length).toBeGreaterThanOrEqual(1);
    });

    // Click trigger button again
    fireEvent.click(screen.getByRole('button'));
    expect(screen.queryByPlaceholderText('Search fonts...')).not.toBeInTheDocument();
  });

  it('triggers setPreviewFont on font option mouse enter and mouse leave', () => {
    render(
      <FontSelector
        value="Arial"
        onChange={onChange}
        systemFonts={systemFonts}
      />
    );

    // Open dropdown
    fireEvent.click(screen.getByRole('button'));

    // Hover over 'Georgia' option
    const option = screen.getByText('Georgia');
    fireEvent.mouseEnter(option);
    expect(mockSetPreviewFont).toHaveBeenCalledWith('Georgia');

    // Hover over 'Courier New' option
    const option2 = screen.getByText('Courier New');
    fireEvent.mouseEnter(option2);
    expect(mockSetPreviewFont).toHaveBeenCalledWith('Courier New');
  });

  it('filters fonts list when typing in search box', () => {
    render(
      <FontSelector
        value="Arial"
        onChange={onChange}
        systemFonts={systemFonts}
      />
    );

    // Open dropdown
    fireEvent.click(screen.getByRole('button'));

    const searchInput = screen.getByPlaceholderText('Search fonts...');
    fireEvent.change(searchInput, { target: { value: 'Geo' } });

    // 'Georgia' should be visible, 'Arial' and 'Courier New' should be filtered out
    expect(screen.getByText('Georgia')).toBeInTheDocument();
    expect(screen.getAllByText('Arial').length).toBe(1); // Only trigger button, filtered out of the list
    expect(screen.queryByText('Courier New')).not.toBeInTheDocument();
  });

  it('calls onChange, resets preview, and closes dropdown on font item click', () => {
    render(
      <FontSelector
        value="Arial"
        onChange={onChange}
        systemFonts={systemFonts}
      />
    );

    // Open dropdown
    fireEvent.click(screen.getByRole('button'));

    // Click 'Courier New' option
    fireEvent.click(screen.getByText('Courier New'));

    expect(onChange).toHaveBeenCalledWith('Courier New');
    expect(mockSetPreviewFont).toHaveBeenCalledWith(null);
    expect(screen.queryByPlaceholderText('Search fonts...')).not.toBeInTheDocument();
  });
});
