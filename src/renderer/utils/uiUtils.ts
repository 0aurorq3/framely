export const TOOLBAR_TOOLS = [
  { id: 'pointer', title: 'Select / Move' },
  { id: 'rect', title: 'Rectangle Outline' },
  { id: 'filled-rect', title: 'Rectangle Filled' },
  { id: 'circle', title: 'Circle Outline' },
  { id: 'filled-circle', title: 'Circle Filled' },
  { id: 'line', title: 'Straight Line' },
  { id: 'arrow', title: 'Draw Arrow' },
  { id: 'text', title: 'Draw Text' },
  { id: 'pen', title: 'Freehand Draw' },
  { id: 'emoji', title: 'Add Emoji' },
] as const;

export function toggleTheme(currentTheme: 'dark' | 'light'): 'dark' | 'light' {
  return currentTheme === 'dark' ? 'light' : 'dark';
}

export function shouldResolveOnKey(key: string, action: 'enter' | 'escape') {
  if (action === 'enter') return key === 'Enter';
  if (action === 'escape') return key === 'Escape';
  return false;
}

export function shouldDeleteTextAnnotation(text: string) {
  return !text.trim();
}

export function shouldUpdateTextAnnotation(text: string) {
  return !!text.trim();
}

export function toggleSection(open: boolean) {
  return !open;
}

export function calculateSelectionBoxHandles(rectW: number, rectH: number, handleSize = 12, offset = 8) {
  return {
    tl: { x: -rectW / 2 - offset - handleSize, y: -rectH / 2 - offset - handleSize },
    tc: { x: -handleSize / 2, y: -rectH / 2 - offset - handleSize },
    tr: { x: rectW / 2 + offset, y: -rectH / 2 - offset - handleSize },
    ml: { x: -rectW / 2 - offset - handleSize, y: -handleSize / 2 },
    mr: { x: rectW / 2 + offset, y: -handleSize / 2 },
    bl: { x: -rectW / 2 - offset - handleSize, y: rectH / 2 + offset },
    bc: { x: -handleSize / 2, y: rectH / 2 + offset },
    br: { x: rectW / 2 + offset, y: rectH / 2 + offset },
  };
}

export function calculateRotationHandlePosition(rectH: number, offset = 8, stemLength = 26, handleRadius = 7) {
  const stemY1 = -rectH / 2 - offset;
  const stemY2 = stemY1 - stemLength;
  const handleY = stemY2 - handleRadius;
  return { stemY1, stemY2, handleY };
}

export function getTextEditorFontSize(strokeWidth: number) {
  return Math.max(12, 14 + strokeWidth);
}
