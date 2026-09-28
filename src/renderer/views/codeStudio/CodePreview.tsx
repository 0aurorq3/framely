/**
 * CodePreview — Renders syntax-highlighted code with line numbers
 * and an overlay transparent textarea to allow direct typing on the canvas.
 */

import { useMemo, useRef } from 'react';
import { useAppContext } from '../../AppContext';
import { tokenizeLine, detectLanguage } from '../../utils/codeTokenizer';
import { getThemeByName } from '../../utils/codeThemes';
import type { Token } from '../../utils/codeTokenizer';
import type { CodeTheme } from '../../utils/codeThemes';
import '../../views/codeStudio/CodeStudio.css';

interface CodePreviewProps {
  code: string;
  onChangeCode: (code: string) => void;
  language: string;
  onChangeLanguage: (lang: string) => void;
  themeName: string;
  fontSize: number;
  showLineNumbers: boolean;
  breakpoints: number[];
  onToggleBreakpoint: (line: number) => void;
  showBreakpoints: boolean;
}

function renderTokens(tokens: Token[], theme: CodeTheme): React.ReactNode[] {
  return tokens.map((tok, i) => {
    const color = theme.tokens[tok.type] || theme.foreground;
    if (tok.type === 'plain' && color === theme.foreground) {
      return <span key={i}>{tok.value}</span>;
    }
    return (
      <span key={i} style={{ color }}>
        {tok.value}
      </span>
    );
  });
}

export default function CodePreview({
  code,
  onChangeCode,
  language,
  onChangeLanguage,
  themeName,
  fontSize,
  showLineNumbers,
  breakpoints,
  onToggleBreakpoint,
  showBreakpoints,
}: CodePreviewProps) {
  const { aspectRatio, codeStudioShowLanguage } = useAppContext();
  const theme = useMemo(() => getThemeByName(themeName), [themeName]);
  const lines = useMemo(() => code.split('\n'), [code]);

  const tokenizedLines = useMemo(
    () => lines.map(line => tokenizeLine(line, language)),
    [lines, language]
  );

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const highlightContainerRef = useRef<HTMLDivElement>(null);

  // Sync scrolling between transparent textarea and highlighted pre block
  const handleScroll = (e: React.UIEvent<HTMLTextAreaElement>) => {
    if (highlightContainerRef.current) {
      highlightContainerRef.current.scrollTop = e.currentTarget.scrollTop;
      highlightContainerRef.current.scrollLeft = e.currentTarget.scrollLeft;
    }
  };

  // Focus the input when clicking on the code container
  const handleContainerClick = () => {
    textareaRef.current?.focus();
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    onChangeCode(val);

    const lengthDiff = val.length - code.length;
    if (language === 'plain' || lengthDiff > 10) {
      const detected = detectLanguage(val);
      if (detected !== language) {
        onChangeLanguage(detected);
      }
    }
  };

  const breakpointSet = useMemo(() => new Set(breakpoints), [breakpoints]);
  const breakpointColumnPx = showBreakpoints ? Math.max(12, fontSize * 0.9) : 0;
  const gutterWidth = (lines.length >= 100 ? 56 : lines.length >= 10 ? 48 : 40) + breakpointColumnPx;

  const handleBreakpointClick = (line: number) => (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleBreakpoint(line);
  };

  return (
    <div
      className="code-preview-container"
      style={{
        fontSize: `${fontSize}px`,
        color: theme.foreground,
        backgroundColor: theme.background,
      }}
      onClick={handleContainerClick}
    >
      {/* Language badge */}
      {codeStudioShowLanguage && language !== 'plain' && (
        <span className="code-language-badge" style={{ color: theme.foreground }}>
          {language}
        </span>
      )}

      {/* Line number gutter */}
      {showLineNumbers && (
        <div
          className="code-preview-gutter"
          style={{
            color: theme.lineNumber,
            fontSize: `${fontSize}px`,
            minWidth: `${gutterWidth}px`,
            backgroundColor: theme.background,
          }}
        >
          {lines.map((_, i) => {
            const lineNo = i + 1;
            const isMarked = showBreakpoints && breakpointSet.has(lineNo);
            return (
              <span
                key={i}
                className="breakpoint-row"
                onClick={handleBreakpointClick(lineNo)}
                title={isMarked ? `Breakpoint at line ${lineNo} (click to remove)` : `Click to add breakpoint at line ${lineNo}`}
              >
                {isMarked && <span className="breakpoint-marker" aria-hidden="true" />}
                <span className="line-number">{lineNo}</span>
              </span>
            );
          })}
        </div>
      )}

      {/* Code Editor Area */}
      <div className="code-editor-area" style={{ position: 'relative', flex: 1 }}>
        {/* Highlighted rendering (underneath) */}
        <div
          ref={highlightContainerRef}
          className="code-preview-lines"
          style={{
            margin: 0,
            overflow: 'hidden',
          }}
        >
          {tokenizedLines.map((tokens, i) => (
            <div key={i} className="code-preview-line">
              {tokens.length > 0 ? renderTokens(tokens, theme) : '\u00A0'}
            </div>
          ))}
        </div>

        {/* Input Textarea (on top, completely transparent text, visible caret) */}
        <textarea
          ref={textareaRef}
          className="code-editor-textarea-overlay"
          value={code}
          onChange={handleChange}
          onScroll={handleScroll}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            fontFamily: 'inherit',
            fontSize: 'inherit',
            lineHeight: '1.6',
            color: 'transparent',
            caretColor: theme.foreground,
            background: 'transparent',
            border: 'none',
            outline: 'none',
            resize: 'none',
            whiteSpace: 'pre',
            overflow: aspectRatio === 'Auto' ? 'hidden' : 'auto',
            padding: 'var(--space-4) var(--space-4)',
            boxSizing: 'border-box',
            zIndex: 2,
          }}
          spellCheck={false}
        />
      </div>
    </div>
  );
}
