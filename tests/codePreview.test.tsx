import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import CodePreview from '../src/renderer/views/codeStudio/CodePreview';
import type { AppContextType } from '../src/renderer/types/appContextTypes';
import { makeFullMockContext } from './shared';

vi.mock('../src/renderer/AppContext', () => ({
  useAppContext: () => mockContext,
}));

let mockContext: ReturnType<typeof makeFullMockContext> & Pick<AppContextType, 'codeStudioShowLanguage'>;

beforeEach(() => {
  mockContext = {
    ...makeFullMockContext(),
    aspectRatio: 'Auto',
    codeStudioShowLanguage: true,
  };
});

const defaultProps = {
  code: 'const x = 1;\nconst y = 2;',
  onChangeCode: vi.fn(),
  language: 'typescript',
  onChangeLanguage: vi.fn(),
  themeName: 'One Dark',
  fontSize: 14,
  showLineNumbers: true,
  breakpoints: [] as number[],
  onToggleBreakpoint: vi.fn(),
  showBreakpoints: true,
};

describe('CodePreview', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders code lines', () => {
    const { container } = render(<CodePreview {...defaultProps} />);
    const lines = container.querySelectorAll('.code-preview-line');
    expect(lines.length).toBe(2);
  });

  it('shows line numbers when enabled', () => {
    const { container } = render(<CodePreview {...defaultProps} />);
    const lineNumbers = container.querySelectorAll('.line-number');
    expect(lineNumbers.length).toBe(2);
    expect(lineNumbers[0].textContent).toBe('1');
    expect(lineNumbers[1].textContent).toBe('2');
  });

  it('hides line numbers when disabled', () => {
    render(<CodePreview {...defaultProps} showLineNumbers={false} />);
    const gutter = document.querySelector('.code-preview-gutter');
    expect(gutter).toBeNull();
  });

  it('shows language badge when enabled and language is not plain', () => {
    render(<CodePreview {...defaultProps} />);
    expect(screen.getByText('typescript')).toBeInTheDocument();
  });

  it('hides language badge when codeStudioShowLanguage is false', () => {
    mockContext.codeStudioShowLanguage = false;
    render(<CodePreview {...defaultProps} />);
    expect(screen.queryByText('typescript')).not.toBeInTheDocument();
  });

  it('hides language badge for plain language', () => {
    render(<CodePreview {...defaultProps} language="plain" />);
    expect(screen.queryByText('plain')).not.toBeInTheDocument();
  });

  it('calls onChangeCode when textarea value changes', () => {
    const { container } = render(<CodePreview {...defaultProps} />);
    const textarea = container.querySelector('textarea');
    expect(textarea).toBeTruthy();
    fireEvent.change(textarea!, { target: { value: 'new code' } });
    expect(defaultProps.onChangeCode).toHaveBeenCalledWith('new code');
  });

  it('renders breakpoint markers when breakpoints are set', () => {
    const { container } = render(
      <CodePreview {...defaultProps} breakpoints={[1]} />
    );
    const markers = container.querySelectorAll('.breakpoint-marker');
    expect(markers.length).toBe(1);
  });

  it('calls onToggleBreakpoint when gutter line is clicked', () => {
    const { container } = render(
      <CodePreview {...defaultProps} breakpoints={[]} />
    );
    const rows = container.querySelectorAll('.breakpoint-row');
    if (rows.length > 0) {
      fireEvent.click(rows[0]);
      expect(defaultProps.onToggleBreakpoint).toHaveBeenCalledWith(1);
    }
  });

  it('renders textarea for code input', () => {
    const { container } = render(<CodePreview {...defaultProps} />);
    const textarea = container.querySelector('textarea');
    expect(textarea).toBeTruthy();
    expect((textarea as HTMLTextAreaElement).value).toBe('const x = 1;\nconst y = 2;');
  });

  it('renders empty line as non-breaking space', () => {
    const { container } = render(
      <CodePreview {...defaultProps} code={"line1\n\nline3"} />
    );
    const lines = container.querySelectorAll('.code-preview-line');
    expect(lines.length).toBe(3);
  });
});
