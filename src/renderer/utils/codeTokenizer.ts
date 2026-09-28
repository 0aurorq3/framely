/**
 * Regex-based code tokenizer and language detector.
 * Produces token arrays for syntax highlighting — no formatting, no dependencies.
 */

export type TokenType =
  | 'keyword' | 'string' | 'comment' | 'number'
  | 'operator' | 'function' | 'type' | 'decorator'
  | 'punctuation' | 'tag' | 'attribute' | 'plain';

export interface Token {
  type: TokenType;
  value: string;
}

// ─── Language keyword sets ───────────────────────────────────────────────

const KEYWORDS: Record<string, Set<string>> = {
  java: new Set([
    'abstract', 'assert', 'boolean', 'break', 'byte', 'case', 'catch', 'char',
    'class', 'const', 'continue', 'default', 'do', 'double', 'else', 'enum',
    'extends', 'final', 'finally', 'float', 'for', 'goto', 'if', 'implements',
    'import', 'instanceof', 'int', 'interface', 'long', 'native', 'new',
    'package', 'private', 'protected', 'public', 'return', 'short', 'static',
    'strictfp', 'super', 'switch', 'synchronized', 'this', 'throw', 'throws',
    'transient', 'try', 'void', 'volatile', 'while', 'var', 'record', 'sealed',
    'permits', 'yield', 'true', 'false', 'null',
  ]),
  python: new Set([
    'and', 'as', 'assert', 'async', 'await', 'break', 'class', 'continue',
    'def', 'del', 'elif', 'else', 'except', 'finally', 'for', 'from',
    'global', 'if', 'import', 'in', 'is', 'lambda', 'nonlocal', 'not', 'or',
    'pass', 'raise', 'return', 'try', 'while', 'with', 'yield',
    'True', 'False', 'None', 'self',
  ]),
  javascript: new Set([
    'async', 'await', 'break', 'case', 'catch', 'class', 'const', 'continue',
    'debugger', 'default', 'delete', 'do', 'else', 'export', 'extends',
    'finally', 'for', 'from', 'function', 'if', 'import', 'in', 'instanceof',
    'let', 'new', 'of', 'return', 'static', 'super', 'switch', 'this',
    'throw', 'try', 'typeof', 'var', 'void', 'while', 'with', 'yield',
    'true', 'false', 'null', 'undefined', 'interface', 'type', 'enum',
    'implements', 'private', 'protected', 'public', 'readonly', 'abstract',
  ]),
  css: new Set([
    'important', 'inherit', 'initial', 'unset', 'none', 'auto', 'block',
    'inline', 'flex', 'grid', 'absolute', 'relative', 'fixed', 'sticky',
    'solid', 'dashed', 'dotted', 'transparent', 'currentColor',
  ]),
  sql: new Set([
    'SELECT', 'FROM', 'WHERE', 'INSERT', 'INTO', 'UPDATE', 'DELETE', 'CREATE',
    'TABLE', 'DROP', 'ALTER', 'INDEX', 'VIEW', 'JOIN', 'INNER', 'LEFT',
    'RIGHT', 'OUTER', 'ON', 'AND', 'OR', 'NOT', 'NULL', 'IS', 'IN', 'AS',
    'ORDER', 'BY', 'GROUP', 'HAVING', 'LIMIT', 'OFFSET', 'UNION', 'ALL',
    'SET', 'VALUES', 'DISTINCT', 'BETWEEN', 'LIKE', 'EXISTS', 'CASE', 'WHEN',
    'THEN', 'ELSE', 'END', 'PRIMARY', 'KEY', 'FOREIGN', 'REFERENCES',
    'INT', 'VARCHAR', 'TEXT', 'BOOLEAN', 'DATE', 'TIMESTAMP', 'FLOAT',
    'select', 'from', 'where', 'insert', 'into', 'update', 'delete', 'create',
    'table', 'drop', 'alter', 'join', 'inner', 'left', 'right', 'outer', 'on',
    'and', 'or', 'not', 'null', 'is', 'in', 'as', 'order', 'by', 'group',
    'having', 'limit', 'set', 'values', 'distinct', 'between', 'like',
    'exists', 'case', 'when', 'then', 'else', 'end', 'true', 'false',
  ]),
  go: new Set([
    'break', 'case', 'chan', 'const', 'continue', 'default', 'defer', 'else',
    'fallthrough', 'for', 'func', 'go', 'goto', 'if', 'import', 'interface',
    'map', 'package', 'range', 'return', 'select', 'struct', 'switch', 'type',
    'var', 'true', 'false', 'nil', 'iota',
  ]),
  rust: new Set([
    'as', 'async', 'await', 'break', 'const', 'continue', 'crate', 'dyn',
    'else', 'enum', 'extern', 'fn', 'for', 'if', 'impl', 'in', 'let',
    'loop', 'match', 'mod', 'move', 'mut', 'pub', 'ref', 'return', 'self',
    'Self', 'static', 'struct', 'super', 'trait', 'type', 'unsafe', 'use',
    'where', 'while', 'true', 'false',
  ]),
};

// ─── Type keywords (rendered differently) ────────────────────────────────

const TYPE_KEYWORDS = new Set([
  'String', 'Integer', 'Boolean', 'Long', 'Double', 'Float', 'Byte', 'Short',
  'Object', 'List', 'Map', 'Set', 'Array', 'HashMap', 'ArrayList', 'Optional',
  'Promise', 'void', 'int', 'float', 'double', 'boolean', 'char', 'byte',
  'short', 'long', 'i32', 'i64', 'u32', 'u64', 'f32', 'f64', 'str', 'bool',
  'usize', 'isize', 'Vec', 'Box', 'Rc', 'Arc', 'Result', 'Option',
]);

// ─── Language detection ──────────────────────────────────────────────────

const LANG_SIGNATURES: [string, RegExp][] = [
  ['java', /\b(public\s+class|System\.out\.|import\s+java\.|@Override|extends\s+\w|void\s+main)\b/],
  ['python', /\b(def\s+\w+\s*\(|import\s+\w+|from\s+\w+\s+import|print\s*\(|self\.|if\s+__name__)\b/],
  ['rust', /\b(fn\s+\w+|let\s+mut\s|impl\s+\w|pub\s+fn|use\s+std::|\->\s*\w|\.unwrap\(\))\b/],
  ['go', /\b(func\s+\w+|package\s+\w+|import\s+\(|fmt\.|:=)\b/],
  ['sql', /\b(SELECT\s+.+FROM|CREATE\s+TABLE|INSERT\s+INTO|ALTER\s+TABLE)\b/i],
  ['css', /\{[^}]*:\s*[^;]+;[^}]*\}|@media\s|@keyframes\s|:root\s*\{/],
  ['html', /<(!DOCTYPE|html|head|body|div|span|p|a\s|img\s|script|style)\b/i],
  ['yaml', /^\w[\w-]*:\s*[^\n{]+$/m],
  ['json', /^\s*[{\[]\s*"[^"]+"\s*:/m],
  ['javascript', /\b(const\s+\w+|let\s+\w+|function\s+\w+|=>\s*\{|require\(|module\.exports|import\s+.*from)\b/],
];

export function detectLanguage(code: string): string {
  for (const [lang, pattern] of LANG_SIGNATURES) {
    if (pattern.test(code)) return lang;
  }
  return 'plain';
}

// ─── Tokenizer ───────────────────────────────────────────────────────────

/**
 * Master regex pattern applied line-by-line.
 * Groups: 1=block comment, 2=line comment, 3=template literal,
 *   4=double string, 5=single string, 6=number, 7=decorator,
 *   8=identifier, 9=operator, 10=punctuation
 */
const MASTER_RE = new RegExp(
  [
    '(\\/\\*[\\s\\S]*?\\*\\/)',                       // 1: block comment
    '(\\/\\/[^\\n]*|#[^\\n]*|--[^\\n]*)',              // 2: line comment
    '(`(?:\\\\.|[^`])*`)',                            // 3: template literal
    '("(?:\\\\.|[^"\\\\])*")',                         // 4: double-quoted string
    '(\'(?:\\\\.|[^\'\\\\])*\')',                      // 5: single-quoted string
    '(\\b0x[\\da-fA-F]+\\b|\\b\\d+\\.?\\d*(?:e[+-]?\\d+)?\\b)', // 6: number
    '(@\\w+)',                                        // 7: decorator
    '(\\b[a-zA-Z_$][\\w$]*\\b)',                      // 8: identifier
    '([+\\-*/%=!<>&|^~?:]+)',                         // 9: operator
    '([{}()\\[\\];,.])',                               // 10: punctuation
  ].join('|'),
  'g'
);

export function tokenizeLine(
  line: string,
  language: string
): Token[] {
  const tokens: Token[] = [];
  const kws = KEYWORDS[language] || KEYWORDS.javascript || new Set();
  let lastIndex = 0;

  const re = new RegExp(MASTER_RE.source, 'g');
  let match: RegExpExecArray | null;

  while ((match = re.exec(line)) !== null) {
    // Fill gap with plain text
    if (match.index > lastIndex) {
      tokens.push({ type: 'plain', value: line.slice(lastIndex, match.index) });
    }

    const value = match[0];
    let type: TokenType = 'plain';

    if (match[1]) type = 'comment';       // block comment
    else if (match[2]) type = 'comment';   // line comment
    else if (match[3]) type = 'string';    // template literal
    else if (match[4]) type = 'string';    // double-quoted string
    else if (match[5]) type = 'string';    // single-quoted string
    else if (match[6]) type = 'number';    // number
    else if (match[7]) type = 'decorator'; // decorator/annotation
    else if (match[8]) {                   // identifier
      if (kws.has(value)) type = 'keyword';
      else if (TYPE_KEYWORDS.has(value)) type = 'type';
      else if (/^[A-Z]/.test(value)) type = 'type';
      else if (re.lastIndex < line.length && line[re.lastIndex] === '(') type = 'function';
      else type = 'plain';
    }
    else if (match[9]) type = 'operator';
    else if (match[10]) type = 'punctuation';

    tokens.push({ type, value });
    lastIndex = re.lastIndex;
  }

  // Trailing text
  if (lastIndex < line.length) {
    tokens.push({ type: 'plain', value: line.slice(lastIndex) });
  }

  return tokens;
}

export const SUPPORTED_LANGUAGES = [
  'java', 'python', 'javascript', 'css', 'sql',
  'go', 'rust', 'html', 'yaml', 'json', 'plain',
] as const;

export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];
