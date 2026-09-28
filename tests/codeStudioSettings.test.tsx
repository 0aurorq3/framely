import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import CodeStudioSettings from '../src/renderer/components/CodeStudioSettings';
import type { AppContextType } from '../src/renderer/types/appContextTypes';
import { makeFullMockContext } from './shared';

vi.mock('../src/renderer/AppContext', () => ({
  useAppContext: () => mockContext,
}));

let mockContext: ReturnType<typeof makeFullMockContext> & Pick<
  AppContextType,
  | 'codeStudioLanguage'
  | 'setCodeStudioLanguage'
  | 'codeStudioTheme'
  | 'setCodeStudioTheme'
  | 'codeStudioFontSize'
  | 'setCodeStudioFontSize'
  | 'codeStudioLineNumbers'
  | 'setCodeStudioLineNumbers'
  | 'codeStudioShowLanguage'
  | 'setCodeStudioShowLanguage'
  | 'codeStudioBreakpoints'
  | 'setCodeStudioBreakpoints'
  | 'codeStudioShowBreakpoints'
  | 'setCodeStudioShowBreakpoints'
>;

beforeEach(() => {
  mockContext = {
    ...makeFullMockContext(),
    codeStudioLanguage: 'typescript',
    setCodeStudioLanguage: vi.fn(),
    codeStudioTheme: 'One Dark',
    setCodeStudioTheme: vi.fn(),
    codeStudioFontSize: 14,
    setCodeStudioFontSize: vi.fn(),
    codeStudioLineNumbers: true,
    setCodeStudioLineNumbers: vi.fn(),
    codeStudioShowLanguage: true,
    setCodeStudioShowLanguage: vi.fn(),
    codeStudioBreakpoints: [1, 4, 7],
    setCodeStudioBreakpoints: vi.fn(),
    codeStudioShowBreakpoints: false,
    setCodeStudioShowBreakpoints: vi.fn(),
    getCurrentConfig: vi.fn(() => ({})),
    pushHistory: vi.fn(),
    handleSliderRelease: vi.fn(),
  };
});

describe('CodeStudioSettings', () => {
  it('renders language selector with current value', () => {
    render(<CodeStudioSettings />);
    expect(screen.getByText('Language')).toBeInTheDocument();
  });

  it('renders code theme selector', () => {
    render(<CodeStudioSettings />);
    expect(screen.getByText('Code Theme')).toBeInTheDocument();
  });

  it('renders font size slider', () => {
    render(<CodeStudioSettings />);
    expect(screen.getByText('14px')).toBeInTheDocument();
  });

  it('changes font size on slider change', () => {
    render(<CodeStudioSettings />);
    const sliders = screen.getAllByRole('slider');
    fireEvent.change(sliders[0], { target: { value: '18' } });
    expect(mockContext.setCodeStudioFontSize).toHaveBeenCalledWith(18);
  });

  it('changes language on select', () => {
    render(<CodeStudioSettings />);
    const selects = screen.getAllByRole('combobox');
    fireEvent.change(selects[0], { target: { value: 'python' } });
    expect(mockContext.setCodeStudioLanguage).toHaveBeenCalledWith('python');
    expect(mockContext.pushHistory).toHaveBeenCalled();
  });

  it('changes theme on select', () => {
    render(<CodeStudioSettings />);
    const selects = screen.getAllByRole('combobox');
    fireEvent.change(selects[1], { target: { value: 'Dracula' } });
    expect(mockContext.setCodeStudioTheme).toHaveBeenCalledWith('Dracula');
  });

  it('renders breakpoints input with comma-separated values', () => {
    render(<CodeStudioSettings />);
    expect(screen.getByText('Breakpoints')).toBeInTheDocument();
    const input = screen.getByPlaceholderText('e.g. 1, 4, 7');
    expect(input).toBeInTheDocument();
    expect((input as HTMLInputElement).value).toBe('1, 4, 7');
  });

  it('parses breakpoints on input change', () => {
    render(<CodeStudioSettings />);
    const input = screen.getByPlaceholderText('e.g. 1, 4, 7');
    fireEvent.change(input, { target: { value: '2, 5, 10' } });
    expect(mockContext.setCodeStudioBreakpoints).toHaveBeenCalledWith([2, 5, 10]);
  });

  it('filters invalid breakpoint values', () => {
    render(<CodeStudioSettings />);
    const input = screen.getByPlaceholderText('e.g. 1, 4, 7');
    fireEvent.change(input, { target: { value: '1, abc, -1, 5' } });
    expect(mockContext.setCodeStudioBreakpoints).toHaveBeenCalledWith([1, 5]);
  });

  it('toggles line numbers switch', () => {
    render(<CodeStudioSettings />);
    const checkboxes = screen.getAllByRole('checkbox');
    const lineNumbersCheckbox = checkboxes[0];
    fireEvent.click(lineNumbersCheckbox);
    expect(mockContext.setCodeStudioLineNumbers).toHaveBeenCalledWith(false);
  });

  it('toggles show breakpoints switch', () => {
    render(<CodeStudioSettings />);
    const checkboxes = screen.getAllByRole('checkbox');
    const showBreakpointsCheckbox = checkboxes[1];
    fireEvent.click(showBreakpointsCheckbox);
    expect(mockContext.setCodeStudioShowBreakpoints).toHaveBeenCalledWith(true);
  });

  it('toggles show language pill switch', () => {
    render(<CodeStudioSettings />);
    const checkboxes = screen.getAllByRole('checkbox');
    const showLanguageCheckbox = checkboxes[2];
    fireEvent.click(showLanguageCheckbox);
    expect(mockContext.setCodeStudioShowLanguage).toHaveBeenCalledWith(false);
  });
});
