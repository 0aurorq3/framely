import { describe, it, expect } from 'vitest';
import {
  snapDragPosition,
  snapResizeDimensions,
  snapDrawingDimensions,
} from '../src/renderer/utils/snapUtils';
import type { Annotation } from '../src/renderer/canvasRenderer';

const dims = { width: 800, height: 600 };

function makeRect(
  id: string,
  x: number,
  y: number,
  w: number,
  h: number,
): Annotation {
  return { id, type: 'rect', x, y, w, h, color: '#ff0000', strokeWidth: 4 };
}

// Helper: picks a position far from container snap candidates 0, 0.5, 1
// Threshold at 800px = 5/800 = 0.00625, so >0.01 margin is safe.
const SAFE_X = 0.25;
const SAFE_Y = 0.3;

describe('snapDragPosition', () => {
  it('returns unchanged position when no annotations and far from container candidates', () => {
    const result = snapDragPosition(SAFE_X, SAFE_Y, 0.1, 0.1, [], dims);
    expect(result.x).toBe(SAFE_X);
    expect(result.y).toBe(SAFE_Y);
    expect(result.guides).toEqual([]);
  });

  it('snaps left edge to another annotation right edge', () => {
    const others = [makeRect('a1', 0.1, 0.1, 0.2, 0.2)]; // right edge at 0.3
    // Proposed left edge at 0.303 → within 3px of 0.3 at 800px width
    const result = snapDragPosition(0.303, SAFE_Y, 0.1, 0.1, others, dims);
    expect(result.x).toBeCloseTo(0.3, 2);
    expect(result.guides.length).toBeGreaterThanOrEqual(1);
    expect(result.guides.some(g => g.orientation === 'vertical')).toBe(true);
  });

  it('snaps right edge to another annotation left edge', () => {
    const others = [makeRect('a1', 0.5, 0.1, 0.2, 0.2)]; // left edge at 0.5
    // Proposed right edge at 0.502 (0.402 + 0.1) → within 2px
    const result = snapDragPosition(0.402, 0.25, 0.1, 0.1, others, dims);
    expect(result.x).toBeCloseTo(0.4, 2);
    expect(result.guides.length).toBeGreaterThanOrEqual(1);
  });

  it('snaps center to center', () => {
    const others = [makeRect('a1', 0.3, 0.2, 0.2, 0.2)]; // centerX = 0.4
    // Proposed centerX at 0.402 (0.347 + 0.055) → within 2px of 0.4
    const result = snapDragPosition(0.347, 0.25, 0.11, 0.1, others, dims);
    expect(result.x).toBeCloseTo(0.345, 2);
    expect(result.guides.length).toBeGreaterThanOrEqual(1);
  });

  it('snaps top edge to another annotation bottom edge', () => {
    const others = [makeRect('a1', 0.2, 0.1, 0.1, 0.2)]; // bottom at 0.3
    const result = snapDragPosition(0.3, 0.303, 0.1, 0.1, others, dims);
    expect(result.y).toBeCloseTo(0.3, 2);
    expect(result.guides.some(g => g.orientation === 'horizontal')).toBe(true);
  });

  it('snaps bottom edge to another annotation top edge', () => {
    const others = [makeRect('a1', 0.1, 0.5, 0.2, 0.2)]; // top at 0.5
    // Proposed bottom edge at 0.502 (0.402 + 0.1) → near 0.5
    const result = snapDragPosition(0.2, 0.402, 0.1, 0.1, others, dims);
    expect(result.y).toBeCloseTo(0.4, 2);
    expect(result.guides.length).toBeGreaterThanOrEqual(1);
  });

  it('snaps to container edges (0 and 1)', () => {
    const others: Annotation[] = [];
    // snap left edge to 0
    const r1 = snapDragPosition(0.004, 0.25, 0.1, 0.1, others, dims);
    expect(r1.x).toBeCloseTo(0, 2);
    expect(r1.guides.length).toBeGreaterThanOrEqual(1);
    expect(r1.guides.some(g => g.position === 0)).toBe(true);

    // snap right edge to 1
    const r2 = snapDragPosition(0.896, 0.25, 0.1, 0.1, others, dims);
    expect(r2.x).toBeCloseTo(0.9, 2);
    expect(r2.guides.some(g => g.position === 1)).toBe(true);
  });

  it('snaps to container center (0.5)', () => {
    const others: Annotation[] = [];
    // centerX = 0.445 + 0.05 = 0.495, close enough to 0.5
    const result = snapDragPosition(0.445, 0.25, 0.1, 0.1, others, dims);
    expect(result.x).toBeCloseTo(0.45, 2);
    expect(result.guides.length).toBeGreaterThanOrEqual(1);
  });

  it('returns no guides when far from all candidates', () => {
    const others = [makeRect('a1', 0.1, 0.1, 0.2, 0.2)]; // right edge at 0.3
    // All source points far from 0, 0.3, 0.5, 1 and other's edges
    const result = snapDragPosition(0.75, 0.25, 0.08, 0.08, others, dims);
    expect(result.x).toBe(0.75);
    expect(result.y).toBe(0.25);
    expect(result.guides).toEqual([]);
  });

  it('snaps to closest candidate when multiple are in range', () => {
    const others = [
      makeRect('a1', 0.1, 0.1, 0.2, 0.2), // right edge at 0.3
      makeRect('a2', 0.33, 0.1, 0.1, 0.2), // left edge at 0.33
    ];
    // Proposed right edge at 0.322 (0.212 + 0.11)
    const result = snapDragPosition(0.212, 0.25, 0.11, 0.1, others, dims);
    // right edge (0.322) is closer to 0.33 than to 0.3
    expect(result.guides.length).toBeGreaterThanOrEqual(1);
  });

  it('simultaneously snaps both x and y axes', () => {
    const others = [makeRect('a1', 0.1, 0.1, 0.2, 0.2)]; // right=0.3, bottom=0.3
    const result = snapDragPosition(0.303, 0.303, 0.1, 0.1, others, dims);
    expect(result.x).toBeCloseTo(0.3, 2);
    expect(result.y).toBeCloseTo(0.3, 2);
    expect(result.guides.length).toBeGreaterThanOrEqual(2);
  });

  it('handles zero-width annotation', () => {
    const others = [makeRect('a1', 0.3, 0.1, 0.0, 0.2)]; // all x at 0.3
    const result = snapDragPosition(0.295, 0.15, 0.1, 0.1, others, dims);
    // right edge (0.295+0.1=0.395) closest source point to 0.3
    // Actually centerX=0.345 is closest to 0.3 (diff 0.045 > threshold)
    // left=0.295 diff=0.005 → snaps!
    expect(result.x).toBeCloseTo(0.3, 2);
  });

  it('works with small container dimensions', () => {
    const smallDims = { width: 100, height: 100 };
    // threshold = 5/100 = 0.05
    const others = [makeRect('a1', 0.1, 0.1, 0.2, 0.2)];
    // left edge 0.305 → 0.05 from 0.3 → should snap (threshold is 0.05 at 100px)
    const result = snapDragPosition(0.305, 0.25, 0.1, 0.1, others, smallDims);
    expect(result.x).toBeCloseTo(0.3, 2);
  });
});

describe('snapResizeDimensions', () => {
  it('returns unchanged values when no annotations and far from container edges', () => {
    const result = snapResizeDimensions(
      0.2, 0.25, 0.3, 0.2,
      0.2, 0.25, 0.35, 0.2, // h stays 0.2 (bottom=0.45, not near 0.5)
      'br', [], dims,
    );
    expect(result.x).toBe(0.2);
    expect(result.y).toBe(0.25);
    expect(result.w).toBe(0.35);
    expect(result.h).toBe(0.2);
    expect(result.guides).toEqual([]);
  });

  it('snaps right edge during resize with br handle', () => {
    const others = [makeRect('a1', 0.6, 0.1, 0.1, 0.2)]; // left edge at 0.6
    const result = snapResizeDimensions(
      0.2, 0.1, 0.3, 0.2, // original
      0.2, 0.1, 0.405, 0.25, // proposed (right edge at 0.605, snap to 0.6)
      'br', others, dims,
    );
    expect(result.w).toBeCloseTo(0.4, 2);
    expect(result.guides.length).toBeGreaterThanOrEqual(1);
  });

  it('snaps left edge during resize with tl handle', () => {
    const others = [makeRect('a1', 0.0, 0.1, 0.2, 0.2)]; // right edge at 0.2
    const result = snapResizeDimensions(
      0.3, 0.2, 0.3, 0.2, // original (left=0.3, right=0.6)
      0.195, 0.2, 0.405, 0.2, // proposed left=0.195, should snap to 0.2
      'tl', others, dims,
    );
    expect(result.x).toBeCloseTo(0.2, 2);
    expect(result.guides.length).toBeGreaterThanOrEqual(1);
  });

  it('snaps top edge during resize with tc handle', () => {
    const others = [makeRect('a1', 0.1, 0.0, 0.2, 0.2)]; // bottom at 0.2
    const result = snapResizeDimensions(
      0.2, 0.3, 0.2, 0.2, // original (top=0.3)
      0.2, 0.195, 0.2, 0.305, // proposed top=0.195, snaps to 0.2
      'tc', others, dims,
    );
    expect(result.y).toBeCloseTo(0.2, 2);
    expect(result.guides.length).toBeGreaterThanOrEqual(1);
  });

  it('snaps bottom edge during resize with bc handle', () => {
    const others = [makeRect('a1', 0.1, 0.5, 0.2, 0.1)]; // top at 0.5
    const result = snapResizeDimensions(
      0.2, 0.2, 0.2, 0.2, // original (bottom=0.4)
      0.2, 0.2, 0.2, 0.305, // proposed bottom=0.505, snaps to 0.5
      'bc', others, dims,
    );
    expect(result.h).toBeCloseTo(0.3, 2);
    expect(result.guides.length).toBeGreaterThanOrEqual(1);
  });

  it('skips snapping for rotation handle', () => {
    const others = [makeRect('a1', 0.3, 0.1, 0.2, 0.2)];
    const result = snapResizeDimensions(
      0.2, 0.2, 0.3, 0.2,
      0.2, 0.2, 0.4, 0.3,
      'rot', others, dims,
    );
    expect(result.x).toBe(0.2);
    expect(result.y).toBe(0.2);
    expect(result.w).toBe(0.4);
    expect(result.h).toBe(0.3);
    expect(result.guides).toEqual([]);
  });

  it('does not snap when edges are far from any candidate', () => {
    const others = [makeRect('a1', 0.1, 0.1, 0.1, 0.1)];
    const result = snapResizeDimensions(
      0.7, 0.7, 0.1, 0.1,
      0.7, 0.7, 0.15, 0.15,
      'br', others, dims,
    );
    expect(result.x).toBe(0.7);
    expect(result.w).toBe(0.15);
    expect(result.guides).toEqual([]);
  });
});

describe('snapDrawingDimensions', () => {
  it('returns unchanged dimensions when far from candidates', () => {
    const result = snapDrawingDimensions(0.25, 0.3, 0.2, 0.15, [], dims);
    // corner = (0.25+0.2=0.45, 0.3+0.15=0.45), far from 0/0.5/1
    expect(result.w).toBe(0.2);
    expect(result.h).toBe(0.15);
    expect(result.guides).toEqual([]);
  });

  it('snaps drawing corner to another annotation edge', () => {
    const others = [makeRect('a1', 0.1, 0.1, 0.2, 0.2)]; // right edge at 0.3
    const result = snapDrawingDimensions(0.1, 0.15, 0.205, 0.1, others, dims);
    // opposite corner x = 0.1 + 0.205 = 0.305, snaps to 0.3
    expect(result.w).toBeCloseTo(0.2, 2);
    expect(result.guides.length).toBeGreaterThanOrEqual(1);
  });

  it('snaps drawing corner vertically', () => {
    const others = [makeRect('a1', 0.1, 0.5, 0.2, 0.1)]; // top edge at 0.5
    const result = snapDrawingDimensions(0.2, 0.1, 0.1, 0.405, others, dims);
    // opposite corner y = 0.1 + 0.405 = 0.505, snaps to 0.5
    expect(result.h).toBeCloseTo(0.4, 2);
    expect(result.guides.length).toBeGreaterThanOrEqual(1);
  });

  it('snaps drawing corner to container edges', () => {
    const others: Annotation[] = [];
    const result = snapDrawingDimensions(0.1, 0.2, 0.895, 0.1, others, dims);
    // opposite corner x = 0.1 + 0.895 = 0.995, snaps to 1.0
    expect(result.w).toBeCloseTo(0.9, 2);
    expect(result.guides.length).toBeGreaterThanOrEqual(1);
  });

  it('handles negative w (drawing leftward)', () => {
    const others = [makeRect('a1', 0.1, 0.1, 0.2, 0.2)]; // left edge at 0.1
    const result = snapDrawingDimensions(0.3, 0.2, -0.195, 0.1, others, dims);
    // opposite corner x = 0.3 - 0.195 = 0.105, snaps to 0.1
    expect(result.w).toBeCloseTo(-0.2, 2);
  });

  it('handles negative h (drawing upward)', () => {
    const others = [makeRect('a1', 0.1, 0.1, 0.2, 0.2)]; // top edge at 0.1
    const result = snapDrawingDimensions(0.3, 0.3, 0.1, -0.195, others, dims);
    // opposite corner y = 0.3 - 0.195 = 0.105, snaps to 0.1
    expect(result.h).toBeCloseTo(-0.2, 2);
  });

  it('returns no guides when corner is far from candidates', () => {
    const others = [makeRect('a1', 0.1, 0.1, 0.1, 0.1)];
    const result = snapDrawingDimensions(0.7, 0.7, 0.15, 0.15, others, dims);
    expect(result.w).toBe(0.15);
    expect(result.h).toBe(0.15);
    expect(result.guides).toEqual([]);
  });

  it('snaps both axes simultaneously', () => {
    const others = [makeRect('a1', 0.1, 0.1, 0.2, 0.2)]; // right=0.3, bottom=0.3
    const result = snapDrawingDimensions(0.1, 0.1, 0.203, 0.203, others, dims);
    expect(result.w).toBeCloseTo(0.2, 2);
    expect(result.h).toBeCloseTo(0.2, 2);
    expect(result.guides.length).toBeGreaterThanOrEqual(2);
  });
});
