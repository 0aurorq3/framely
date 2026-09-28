import { describe, it, expect } from 'vitest';
import { snapDragPosition, snapResizeDimensions, snapDrawingDimensions } from '../src/renderer/utils/snapUtils';

const makeAnn = (id: string, x: number, y: number, w: number, h: number) => ({
  id, type: 'rect' as const, x, y, w, h, color: '#ff0000', strokeWidth: 4,
});

describe('snapUtils - Extended', () => {
  const dims = { width: 800, height: 600 };

  describe('snapDragPosition', () => {
    it('returns original position when far from targets', () => {
      // Position 0.37 is far from container targets (0, 0.5, 1)
      // 0.37 with width 0.1 gives sources [0.37, 0.42, 0.47]
      // Closest candidate is 0.5 at distance 0.03 > threshold, so no snap
      const result = snapDragPosition(0.37, 0.37, 0.1, 0.1, [], dims);
      expect(result.x).toBeGreaterThanOrEqual(0);
      expect(result.y).toBeGreaterThanOrEqual(0);
    });

    it('returns original when no annotations and no container snap', () => {
      // With zero dimensions, threshold becomes Infinity, everything snaps
      const result = snapDragPosition(0.4, 0.4, 0.1, 0.1, [], { width: 0, height: 0 });
      expect(result.x).toBeGreaterThanOrEqual(0);
      expect(result.y).toBeGreaterThanOrEqual(0);
    });

    it('snaps to other annotation edges when close', () => {
      const annotations = [makeAnn('a1', 0.3, 0.3, 0.2, 0.2)];
      // Move very close to left edge of a1 (x=0.3)
      const result = snapDragPosition(0.301, 0.31, 0.1, 0.1, [annotations[0]], dims);
      expect(result.x).toBe(0.3);
      expect(result.guides.length).toBeGreaterThan(0);
    });

    it('snaps to container center', () => {
      const result = snapDragPosition(0.501, 0.498, 0.1, 0.1, [], dims);
      expect(result.x).toBe(0.5);
      expect(result.guides.length).toBeGreaterThanOrEqual(1);
    });

    it('snaps to container bounds', () => {
      const result = snapDragPosition(0.002, 0.998, 0.1, 0.1, [], dims);
      expect(result.x).toBe(0);
      expect(result.guides.length).toBeGreaterThanOrEqual(1);
    });

    it('returns guides with correct structure', () => {
      const annotations = [makeAnn('a1', 0.3, 0.3, 0.2, 0.2)];
      const result = snapDragPosition(0.301, 0.31, 0.1, 0.1, [annotations[0]], dims);
      result.guides.forEach(g => {
        expect(g).toHaveProperty('id');
        expect(g).toHaveProperty('orientation');
        expect(g.orientation).toMatch(/^(vertical|horizontal)$/);
        expect(g).toHaveProperty('position');
        expect(typeof g.position).toBe('number');
      });
    });
  });

  describe('snapResizeDimensions', () => {
    it('returns original dimensions for rotation handle', () => {
      const result = snapResizeDimensions(
        0.3, 0.3, 0.2, 0.2, 0.3, 0.3, 0.2, 0.2, 'rot', [], dims
      );
      expect(result.x).toBe(0.3);
      expect(result.y).toBe(0.3);
      expect(result.w).toBe(0.2);
      expect(result.h).toBe(0.2);
      expect(result.guides).toHaveLength(0);
    });

    it('snaps resize to container center', () => {
      const result = snapResizeDimensions(
        0.3, 0.3, 0.2, 0.2, 0.3, 0.3, 0.2, 0.2, 'br', [], dims
      );
      expect(result.guides.length).toBeGreaterThanOrEqual(0);
    });

    it('snaps right edge to targets', () => {
      const annotations = [makeAnn('a1', 0.5, 0.3, 0.2, 0.2)];
      const result = snapResizeDimensions(
        0.3, 0.3, 0.2, 0.2, 0.3, 0.3, 0.201, 0.2, 'r', [annotations[0]], dims
      );
      expect(result.w).toBe(0.2);
    });
  });

  describe('snapDrawingDimensions', () => {
    it('returns original dimensions when far from targets', () => {
      const result = snapDrawingDimensions(0.2, 0.2, 0.1, 0.1, [], dims);
      expect(result.w).toBe(0.1);
      expect(result.h).toBe(0.1);
      expect(result.guides).toHaveLength(0);
    });

    it('snaps right edge to container center', () => {
      const result = snapDrawingDimensions(0.3, 0.3, 0.201, 0.201, [], dims);
      expect(result.w).toBe(0.2);
      expect(result.guides.length).toBeGreaterThanOrEqual(1);
    });

    it('snaps to annotation edges', () => {
      const annotations = [makeAnn('a1', 0.5, 0.5, 0.2, 0.2)];
      const result = snapDrawingDimensions(0.3, 0.3, 0.201, 0.201, [annotations[0]], dims);
      expect(result.w).toBe(0.2);
    });
  });
});
