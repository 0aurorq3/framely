import { describe, it, expect } from 'vitest';
import {
  rotatePoint,
  normalizePenPoints,
  getTextDrawingSize,
  normalizeShapeDrawing,
  hasDragged,
  isDoubleClick,
  calculateRotationAngle,
} from '../src/renderer/utils/annotationUtils';

// ---------------------------------------------------------------------------
// rotatePoint
// ---------------------------------------------------------------------------
describe('rotatePoint', () => {
  it('returns original coordinates for 0° rotation', () => {
    const result = rotatePoint(10, 20, 0, 0, 0);
    expect(result.x).toBeCloseTo(10, 5);
    expect(result.y).toBeCloseTo(20, 5);
  });

  it('rotates point (1,0) around origin by 90° to (0,-1)', () => {
    // The function negates the input angle, so 90° yields a clockwise rotation
    const result = rotatePoint(1, 0, 0, 0, 90);
    expect(result.x).toBeCloseTo(0, 5);
    expect(result.y).toBeCloseTo(-1, 5);
  });

  it('rotates point (1,0) around origin by 180° to (-1,0)', () => {
    const result = rotatePoint(1, 0, 0, 0, 180);
    expect(result.x).toBeCloseTo(-1, 5);
    expect(result.y).toBeCloseTo(0, 5);
  });

  it('rotates around a non-origin centre', () => {
    // Point (6, 3) around centre (5, 3) by 180° → (4, 3)
    const result = rotatePoint(6, 3, 5, 3, 180);
    expect(result.x).toBeCloseTo(4, 5);
    expect(result.y).toBeCloseTo(3, 5);
  });

  it('handles 270° correctly', () => {
    const result = rotatePoint(0, -1, 0, 0, 270);
    expect(result.x).toBeCloseTo(1, 5);
    expect(result.y).toBeCloseTo(0, 5);
  });
});

// ---------------------------------------------------------------------------
// normalizePenPoints
// ---------------------------------------------------------------------------
describe('normalizePenPoints', () => {
  it('single-point input gets w and h floor of 0.001', () => {
    const result = normalizePenPoints([{ x: 42, y: 99 }]);
    expect(result.w).toBe(0.001);
    expect(result.h).toBe(0.001);
  });

  it('two-point horizontal line gets h=0.001 floor', () => {
    const result = normalizePenPoints([
      { x: 10, y: 50 },
      { x: 30, y: 50 },
    ]);
    expect(result.w).toBe(20);
    expect(result.h).toBe(0.001);
  });

  it('diagonal 3-point path normalises to [0,1] range', () => {
    const result = normalizePenPoints([
      { x: 100, y: 100 },
      { x: 200, y: 150 },
      { x: 300, y: 50 },
    ]);
    expect(result.x).toBe(100);
    expect(result.y).toBe(50);
    expect(result.w).toBe(200);
    expect(result.h).toBe(100);
    // All normalized points should be in [0,1]
    for (const p of result.points) {
      expect(p.x).toBeGreaterThanOrEqual(0);
      expect(p.x).toBeLessThanOrEqual(1);
      expect(p.y).toBeGreaterThanOrEqual(0);
      expect(p.y).toBeLessThanOrEqual(1);
    }
    expect(result.points[0].x).toBe(0);
    expect(result.points[2].x).toBe(1);
    expect(result.points[0].y).toBe(0.5);
    expect(result.points[2].y).toBe(0);
  });

  it('all-same-x input gets w floor', () => {
    const result = normalizePenPoints([
      { x: 50, y: 10 },
      { x: 50, y: 20 },
      { x: 50, y: 30 },
    ]);
    expect(result.w).toBe(0.001);
    expect(result.h).toBe(20);
    // x is normalised to 0 for all points
    for (const p of result.points) {
      expect(p.x).toBe(0);
    }
  });
});

// ---------------------------------------------------------------------------
// getTextDrawingSize
// ---------------------------------------------------------------------------
describe('getTextDrawingSize', () => {
  it('returns defaults when both dims < 0.02', () => {
    const result = getTextDrawingSize(0.01, 0.005);
    expect(result.w).toBe(0.16);
    expect(result.h).toBe(0.04);
  });

  it('only w < 0.02 → w gets default, h unchanged', () => {
    const result = getTextDrawingSize(0.01, 0.1);
    expect(result.w).toBe(0.16);
    expect(result.h).toBe(0.1);
  });

  it('only h < 0.02 → h gets default, w unchanged', () => {
    const result = getTextDrawingSize(0.1, 0.01);
    expect(result.w).toBe(0.1);
    expect(result.h).toBe(0.04);
  });

  it('both dims ≥ 0.02 → abs values returned unchanged', () => {
    const result = getTextDrawingSize(0.3, 0.25);
    expect(result.w).toBe(0.3);
    expect(result.h).toBe(0.25);
  });

  it('negative inputs → abs applied', () => {
    const result = getTextDrawingSize(-0.05, -0.1);
    expect(result.w).toBe(0.05);
    expect(result.h).toBe(0.1);
  });
});

// ---------------------------------------------------------------------------
// normalizeShapeDrawing
// ---------------------------------------------------------------------------
describe('normalizeShapeDrawing', () => {
  it('returns null for too-small shape (both ≤ 0.005)', () => {
    const result = normalizeShapeDrawing({ x: 0.5, y: 0.5, w: 0.003, h: 0.002 });
    expect(result).toBeNull();
  });

  it('negative width → x adjusted, w = abs', () => {
    const result = normalizeShapeDrawing({ x: 0.5, y: 0.3, w: -0.2, h: 0.1 });
    expect(result).not.toBeNull();
    expect(result!.x).toBeCloseTo(0.3, 5);
    expect(result!.w).toBe(0.2);
    expect(result!.y).toBe(0.3);
    expect(result!.h).toBe(0.1);
  });

  it('negative height → y adjusted, h = abs', () => {
    const result = normalizeShapeDrawing({ x: 0.2, y: 0.5, w: 0.1, h: -0.3 });
    expect(result).not.toBeNull();
    expect(result!.y).toBeCloseTo(0.2, 5);
    expect(result!.h).toBe(0.3);
    expect(result!.x).toBe(0.2);
    expect(result!.w).toBe(0.1);
  });

  it('normal positive shape → unchanged', () => {
    const input = { x: 0.2, y: 0.3, w: 0.4, h: 0.2 };
    const result = normalizeShapeDrawing(input);
    expect(result).toEqual(input);
  });

  it('one dimension > 0.005 keeps shape even if other is tiny', () => {
    const result = normalizeShapeDrawing({ x: 0.5, y: 0.5, w: 0.001, h: 0.1 });
    expect(result).not.toBeNull();
    expect(result!.w).toBe(0.001);
    expect(result!.h).toBe(0.1);
  });
});

// ---------------------------------------------------------------------------
// hasDragged
// ---------------------------------------------------------------------------
describe('hasDragged', () => {
  it('returns true when distance exactly at default threshold', () => {
    expect(hasDragged(0, 0, 3, 4)).toBe(true);
  });

  it('returns false when distance below threshold', () => {
    expect(hasDragged(0, 0, 2, 2)).toBe(false);
  });

  it('returns false for no movement', () => {
    expect(hasDragged(10, 20, 10, 20)).toBe(false);
  });

  it('respects custom threshold', () => {
    expect(hasDragged(0, 0, 5, 0, 10)).toBe(false);
    expect(hasDragged(0, 0, 5, 0, 4)).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// isDoubleClick
// ---------------------------------------------------------------------------
describe('isDoubleClick', () => {
  it('returns true when time < 300ms and lastClickTime > 0', () => {
    expect(isDoubleClick(1000, 1200)).toBe(true);
  });

  it('returns false when time delta ≥ 300ms', () => {
    expect(isDoubleClick(1000, 1350)).toBe(false);
  });

  it('returns false for first click (lastClickTime === 0)', () => {
    expect(isDoubleClick(0, 100)).toBe(false);
  });

  it('respects custom threshold', () => {
    expect(isDoubleClick(1000, 1450, 500)).toBe(true);
    expect(isDoubleClick(1000, 1600, 500)).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// calculateRotationAngle
// ---------------------------------------------------------------------------
describe('calculateRotationAngle', () => {
  it('returns 0° for point directly above centre', () => {
    const result = calculateRotationAngle(100, 50, 100, 100);
    expect(result).toBe(0);
  });

  it('returns 90° for point directly right of centre', () => {
    const result = calculateRotationAngle(150, 100, 100, 100);
    expect(result).toBe(90);
  });

  it('returns 180° for point directly below centre', () => {
    const result = calculateRotationAngle(100, 150, 100, 100);
    expect(result).toBe(180);
  });

  it('returns 270° for point directly left of centre', () => {
    const result = calculateRotationAngle(50, 100, 100, 100);
    expect(result).toBe(270);
  });
});
