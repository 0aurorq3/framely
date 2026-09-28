/**
 * In-app annotation clipboard (Cut / Copy / Paste of canvas objects).
 *
 * This is session-lived module state for a single Electron renderer window —
 * not the OS clipboard. Cross-window sharing would need sessionStorage or IPC.
 *
 * Paste cascade: callers paste with ANNOTATION_PASTE_OFFSET, then store the
 * *pasted* clone back onto the clipboard so the next Paste shifts again
 * (design-tool style stacking) instead of stacking every clone on the original.
 */
import { Annotation } from '../canvasRenderer';

/** Relative (0–1) x/y shift applied on each paste. See cascade note above. */
export const ANNOTATION_PASTE_OFFSET = 0.02;

let annotationClipboard: Annotation | null = null;

export function getAnnotationClipboard(): Annotation | null {
  return annotationClipboard;
}

export function setAnnotationClipboard(ann: Annotation | null): void {
  annotationClipboard = ann;
}

export function clearAnnotationClipboard(): void {
  annotationClipboard = null;
}

export function hasAnnotationClipboard(): boolean {
  return annotationClipboard !== null;
}

/**
 * Deep-clone an annotation with a new id (and deep-copied `points` if present).
 * When `offset` is set, shifts x/y then clamps so the origin stays on-canvas
 * given the object's width/height.
 */
export function cloneAnnotation(
  source: Annotation,
  opts?: { offset?: number },
): Annotation {
  const clone: Annotation = {
    ...source,
    id: `ann-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    points: source.points
      ? source.points.map((p) => ({ x: p.x, y: p.y }))
      : undefined,
  };

  if (opts?.offset !== undefined && opts.offset !== 0) {
    const dx = opts.offset;
    const dy = opts.offset;
    const w = Math.abs(clone.w) || 0;
    const h = Math.abs(clone.h) || 0;
    // Keep origin within [0, 1 - size] when possible; allow lines with negative extents
    const maxX = Math.max(0, 1 - w);
    const maxY = Math.max(0, 1 - h);
    clone.x = Math.min(Math.max(0, clone.x + dx), maxX);
    clone.y = Math.min(Math.max(0, clone.y + dy), maxY);
  }

  return clone;
}
