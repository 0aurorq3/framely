/**
 * Code syntax-highlighting themes.
 * Each theme maps token types to CSS colors.
 * Background is intentionally omitted — framely's canvas backgrounds are used.
 */

import type { TokenType } from './codeTokenizer';

export interface CodeTheme {
  name: string;
  variant: 'dark' | 'light';
  /** Background of the code editor window */
  background: string;
  /** Foreground for plain/unclassified tokens */
  foreground: string;
  /** Line number gutter text */
  lineNumber: string;
  /** Per-token-type colors */
  tokens: Record<TokenType, string>;
}

// ─── Dark Themes ─────────────────────────────────────────────────────────

const dracula: CodeTheme = {
  name: 'Dracula',
  variant: 'dark',
  background: '#282a36',
  foreground: '#f8f8f2',
  lineNumber: '#6272a4',
  tokens: {
    keyword: '#ff79c6',
    string: '#f1fa8c',
    comment: '#6272a4',
    number: '#bd93f9',
    operator: '#ff79c6',
    function: '#50fa7b',
    type: '#8be9fd',
    decorator: '#50fa7b',
    punctuation: '#f8f8f2',
    tag: '#ff79c6',
    attribute: '#50fa7b',
    plain: '#f8f8f2',
  },
};

const oneDark: CodeTheme = {
  name: 'One Dark',
  variant: 'dark',
  background: '#282c34',
  foreground: '#abb2bf',
  lineNumber: '#4b5263',
  tokens: {
    keyword: '#c678dd',
    string: '#98c379',
    comment: '#5c6370',
    number: '#d19a66',
    operator: '#56b6c2',
    function: '#61afef',
    type: '#e5c07b',
    decorator: '#e5c07b',
    punctuation: '#abb2bf',
    tag: '#e06c75',
    attribute: '#d19a66',
    plain: '#abb2bf',
  },
};

const monokai: CodeTheme = {
  name: 'Monokai',
  variant: 'dark',
  background: '#272822',
  foreground: '#f8f8f2',
  lineNumber: '#75715e',
  tokens: {
    keyword: '#f92672',
    string: '#e6db74',
    comment: '#75715e',
    number: '#ae81ff',
    operator: '#f92672',
    function: '#a6e22e',
    type: '#66d9ef',
    decorator: '#a6e22e',
    punctuation: '#f8f8f2',
    tag: '#f92672',
    attribute: '#a6e22e',
    plain: '#f8f8f2',
  },
};

const nord: CodeTheme = {
  name: 'Nord',
  variant: 'dark',
  background: '#2e3440',
  foreground: '#d8dee9',
  lineNumber: '#4c566a',
  tokens: {
    keyword: '#81a1c1',
    string: '#a3be8c',
    comment: '#616e88',
    number: '#b48ead',
    operator: '#81a1c1',
    function: '#88c0d0',
    type: '#8fbcbb',
    decorator: '#d08770',
    punctuation: '#eceff4',
    tag: '#81a1c1',
    attribute: '#8fbcbb',
    plain: '#d8dee9',
  },
};

const solarizedDark: CodeTheme = {
  name: 'Solarized Dark',
  variant: 'dark',
  background: '#002b36',
  foreground: '#839496',
  lineNumber: '#586e75',
  tokens: {
    keyword: '#859900',
    string: '#2aa198',
    comment: '#586e75',
    number: '#d33682',
    operator: '#859900',
    function: '#268bd2',
    type: '#b58900',
    decorator: '#cb4b16',
    punctuation: '#93a1a1',
    tag: '#268bd2',
    attribute: '#b58900',
    plain: '#839496',
  },
};

const githubDark: CodeTheme = {
  name: 'GitHub Dark',
  variant: 'dark',
  background: '#0d1117',
  foreground: '#e6edf3',
  lineNumber: '#484f58',
  tokens: {
    keyword: '#ff7b72',
    string: '#a5d6ff',
    comment: '#8b949e',
    number: '#79c0ff',
    operator: '#ff7b72',
    function: '#d2a8ff',
    type: '#ffa657',
    decorator: '#ffa657',
    punctuation: '#e6edf3',
    tag: '#7ee787',
    attribute: '#79c0ff',
    plain: '#e6edf3',
  },
};

// ─── Light Themes ────────────────────────────────────────────────────────

const githubLight: CodeTheme = {
  name: 'GitHub Light',
  variant: 'light',
  background: '#ffffff',
  foreground: '#1f2328',
  lineNumber: '#636c76',
  tokens: {
    keyword: '#cf222e',
    string: '#0a3069',
    comment: '#6e7781',
    number: '#0550ae',
    operator: '#cf222e',
    function: '#8250df',
    type: '#953800',
    decorator: '#953800',
    punctuation: '#1f2328',
    tag: '#116329',
    attribute: '#0550ae',
    plain: '#1f2328',
  },
};

const solarizedLight: CodeTheme = {
  name: 'Solarized Light',
  variant: 'light',
  background: '#fdf6e3',
  foreground: '#657b83',
  lineNumber: '#93a1a1',
  tokens: {
    keyword: '#859900',
    string: '#2aa198',
    comment: '#93a1a1',
    number: '#d33682',
    operator: '#859900',
    function: '#268bd2',
    type: '#b58900',
    decorator: '#cb4b16',
    punctuation: '#586e75',
    tag: '#268bd2',
    attribute: '#b58900',
    plain: '#657b83',
  },
};

// ─── Exports ─────────────────────────────────────────────────────────────

export const CODE_THEMES: CodeTheme[] = [
  dracula, oneDark, monokai, nord, solarizedDark, githubDark,
  githubLight, solarizedLight,
];

export function getThemeByName(name: string): CodeTheme {
  return CODE_THEMES.find(t => t.name === name) || dracula;
}
