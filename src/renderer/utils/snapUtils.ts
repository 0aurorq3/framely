import type { Annotation } from '../canvasRenderer';

export interface SnapGuide {
  id: string;
  orientation: 'vertical' | 'horizontal';
  position: number; // fractional coordinate 0-1
}

interface SnapAxisResult {
  delta: number;
  position: number | null;
}

const SNAP_THRESHOLD_PX = 5;

function getAllSnapTargets(
  annotations: Annotation[],
  includeContainer: boolean,
): { xCandidates: number[]; yCandidates: number[] } {
  const xSet = new Set<number>();
  const ySet = new Set<number>();

  for (const ann of annotations) {
    const cx = ann.x + ann.w / 2;
    xSet.add(round6(ann.x));
    xSet.add(round6(cx));
    xSet.add(round6(ann.x + ann.w));

    const cy = ann.y + ann.h / 2;
    ySet.add(round6(ann.y));
    ySet.add(round6(cy));
    ySet.add(round6(ann.y + ann.h));
  }

  if (includeContainer) {
    xSet.add(0);
    xSet.add(0.5);
    xSet.add(1);
    ySet.add(0);
    ySet.add(0.5);
    ySet.add(1);
  }

  return {
    xCandidates: Array.from(xSet).sort((a, b) => a - b),
    yCandidates: Array.from(ySet).sort((a, b) => a - b),
  };
}

function round6(n: number): number {
  return Math.round(n * 1e6) / 1e6;
}

function snapAxis(
  sourcePoints: number[],
  candidates: number[],
  threshold: number,
): SnapAxisResult {
  let bestDelta = 0;
  let bestPosition: number | null = null;
  let bestDist = threshold;

  for (const sp of sourcePoints) {
    for (const c of candidates) {
      const dist = Math.abs(sp - c);
      if (dist < bestDist) {
        bestDist = dist;
        bestDelta = c - sp;
        bestPosition = c;
      }
    }
  }

  return { delta: bestDelta, position: bestPosition };
}

function makeGuideId(axis: 'x' | 'y', position: number): string {
  return `${axis}-${round6(position)}`;
}

export function snapDragPosition(
  proposedX: number,
  proposedY: number,
  annW: number,
  annH: number,
  otherAnnotations: Annotation[],
  dims: { width: number; height: number },
): { x: number; y: number; guides: SnapGuide[] } {
  const { xCandidates, yCandidates } = getAllSnapTargets(otherAnnotations, true);
  const thresholdX = SNAP_THRESHOLD_PX / (dims.width || 1);
  const thresholdY = SNAP_THRESHOLD_PX / (dims.height || 1);

  const xSources = [proposedX, proposedX + annW / 2, proposedX + annW];
  const ySources = [proposedY, proposedY + annH / 2, proposedY + annH];

  const xResult = snapAxis(xSources, xCandidates, thresholdX);
  const yResult = snapAxis(ySources, yCandidates, thresholdY);

  const guides: SnapGuide[] = [];
  if (xResult.position !== null) {
    guides.push({ id: makeGuideId('x', xResult.position), orientation: 'vertical', position: xResult.position });
  }
  if (yResult.position !== null) {
    guides.push({ id: makeGuideId('y', yResult.position), orientation: 'horizontal', position: yResult.position });
  }

  return { x: proposedX + xResult.delta, y: proposedY + yResult.delta, guides };
}

export function snapResizeDimensions(
  _origX: number,
  _origY: number,
  _origW: number,
  _origH: number,
  proposedX: number,
  proposedY: number,
  proposedW: number,
  proposedH: number,
  handle: string,
  otherAnnotations: Annotation[],
  dims: { width: number; height: number },
): { x: number; y: number; w: number; h: number; guides: SnapGuide[] } {
  if (handle === 'rot') {
    return { x: proposedX, y: proposedY, w: proposedW, h: proposedH, guides: [] };
  }

  const { xCandidates, yCandidates } = getAllSnapTargets(otherAnnotations, true);
  const thresholdX = SNAP_THRESHOLD_PX / (dims.width || 1);
  const thresholdY = SNAP_THRESHOLD_PX / (dims.height || 1);

  const xSources: number[] = [];
  if (handle.includes('r')) xSources.push(proposedX + proposedW);
  if (handle.includes('l')) xSources.push(proposedX);
  if (!handle.includes('r') && !handle.includes('l')) xSources.push(proposedX + proposedW / 2);

  const ySources: number[] = [];
  if (handle.includes('b')) ySources.push(proposedY + proposedH);
  if (handle.includes('t')) ySources.push(proposedY);
  if (!handle.includes('b') && !handle.includes('t')) ySources.push(proposedY + proposedH / 2);

  const xResult = snapAxis(xSources, xCandidates, thresholdX);
  const yResult = snapAxis(ySources, yCandidates, thresholdY);

  let snappedX = proposedX;
  let snappedW = proposedW;

  if (xResult.position !== null) {
    if (handle.includes('l')) {
      snappedX = proposedX + xResult.delta;
      snappedW = proposedW - xResult.delta;
    } else if (handle.includes('r')) {
      snappedW = proposedW + xResult.delta;
    }
  }

  let snappedY = proposedY;
  let snappedH = proposedH;

  if (yResult.position !== null) {
    if (handle.includes('t')) {
      snappedY = proposedY + yResult.delta;
      snappedH = proposedH - yResult.delta;
    } else if (handle.includes('b')) {
      snappedH = proposedH + yResult.delta;
    }
  }

  const guides: SnapGuide[] = [];
  if (xResult.position !== null) {
    guides.push({ id: makeGuideId('x', xResult.position), orientation: 'vertical', position: xResult.position });
  }
  if (yResult.position !== null) {
    guides.push({ id: makeGuideId('y', yResult.position), orientation: 'horizontal', position: yResult.position });
  }

  return { x: snappedX, y: snappedY, w: snappedW, h: snappedH, guides };
}

export function snapDrawingDimensions(
  startX: number,
  startY: number,
  proposedW: number,
  proposedH: number,
  otherAnnotations: Annotation[],
  dims: { width: number; height: number },
): { w: number; h: number; guides: SnapGuide[] } {
  const { xCandidates, yCandidates } = getAllSnapTargets(otherAnnotations, true);
  const thresholdX = SNAP_THRESHOLD_PX / (dims.width || 1);
  const thresholdY = SNAP_THRESHOLD_PX / (dims.height || 1);

  const xSources = [startX + proposedW];
  const ySources = [startY + proposedH];

  const xResult = snapAxis(xSources, xCandidates, thresholdX);
  const yResult = snapAxis(ySources, yCandidates, thresholdY);

  const guides: SnapGuide[] = [];
  if (xResult.position !== null) {
    guides.push({ id: makeGuideId('x', xResult.position), orientation: 'vertical', position: xResult.position });
  }
  if (yResult.position !== null) {
    guides.push({ id: makeGuideId('y', yResult.position), orientation: 'horizontal', position: yResult.position });
  }

  return { w: proposedW + xResult.delta, h: proposedH + yResult.delta, guides };
}
