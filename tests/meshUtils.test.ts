import { describe, it, expect } from 'vitest';
import {
  MIN_MESH_POINTS,
  MAX_MESH_POINTS,
  canAddMeshPoint,
  canRemoveMeshPoint,
  convertToPercentage,
  filterGradientsByCategory,
  MESH_FILTER_RANGES,
  BLUR_DENSITY_RANGE,
} from '../src/renderer/utils/meshUtils';

describe('meshUtils', () => {
  describe('constants', () => {
    it('MIN_MESH_POINTS is 2', () => {
      expect(MIN_MESH_POINTS).toBe(2);
    });

    it('MAX_MESH_POINTS is 10', () => {
      expect(MAX_MESH_POINTS).toBe(10);
    });
  });

  describe('canAddMeshPoint', () => {
    it('returns true when count is below max', () => {
      expect(canAddMeshPoint(0)).toBe(true);
      expect(canAddMeshPoint(1)).toBe(true);
      expect(canAddMeshPoint(5)).toBe(true);
      expect(canAddMeshPoint(9)).toBe(true);
    });

    it('returns false when count reaches max', () => {
      expect(canAddMeshPoint(10)).toBe(false);
    });

    it('returns false when count exceeds max', () => {
      expect(canAddMeshPoint(11)).toBe(false);
      expect(canAddMeshPoint(100)).toBe(false);
    });
  });

  describe('canRemoveMeshPoint', () => {
    it('returns false when count is at min', () => {
      expect(canRemoveMeshPoint(0)).toBe(false);
      expect(canRemoveMeshPoint(1)).toBe(false);
      expect(canRemoveMeshPoint(2)).toBe(false);
    });

    it('returns true when count is above min', () => {
      expect(canRemoveMeshPoint(3)).toBe(true);
      expect(canRemoveMeshPoint(5)).toBe(true);
      expect(canRemoveMeshPoint(10)).toBe(true);
    });
  });

  describe('convertToPercentage', () => {
    it('converts 0 to 0', () => {
      expect(convertToPercentage(0)).toBe(0);
    });

    it('converts 0.5 to 50', () => {
      expect(convertToPercentage(0.5)).toBe(50);
    });

    it('converts 1 to 100', () => {
      expect(convertToPercentage(1)).toBe(100);
    });

    it('rounds values correctly', () => {
      expect(convertToPercentage(0.333)).toBe(33);
      expect(convertToPercentage(0.666)).toBe(67);
      expect(convertToPercentage(0.255)).toBe(26);
    });
  });

  describe('MESH_FILTER_RANGES', () => {
    it('blur range is correct', () => {
      expect(MESH_FILTER_RANGES.blur).toEqual({ min: 10, max: 200, default: 60 });
    });

    it('grain range is correct', () => {
      expect(MESH_FILTER_RANGES.grain).toEqual({ min: 0, max: 50, default: 15 });
    });

    it('opacity range is correct', () => {
      expect(MESH_FILTER_RANGES.opacity).toEqual({ min: 10, max: 100, default: 100 });
    });

    it('spread range is correct', () => {
      expect(MESH_FILTER_RANGES.spread).toEqual({ min: 20, max: 200, default: 100 });
    });
  });

  describe('BLUR_DENSITY_RANGE', () => {
    it('has correct values', () => {
      expect(BLUR_DENSITY_RANGE).toEqual({ min: 10, max: 100, default: 50 });
    });
  });

  describe('filterGradientsByCategory', () => {
    const gradients = [
      { id: '1', name: 'Sunset', category: 'warm' },
      { id: '2', name: 'Ocean', category: 'cool' },
      { id: '3', name: 'Rose', category: 'warm' },
      { id: '4', name: 'Mint', category: 'cool' },
      { id: '5', name: 'Neutral', category: undefined },
    ];

    it('filters gradients by matching category', () => {
      const result = filterGradientsByCategory(gradients, 'warm') as any[];
      expect(result).toHaveLength(2);
      expect(result[0].name).toBe('Sunset');
      expect(result[1].name).toBe('Rose');
    });

    it('returns empty array when no matches', () => {
      const result = filterGradientsByCategory(gradients, 'neon');
      expect(result).toHaveLength(0);
    });

    it('does not include items with undefined category', () => {
      const result = filterGradientsByCategory(gradients, 'warm') as any[];
      const names = result.map(g => g.name);
      expect(names).not.toContain('Neutral');
    });

    it('works with empty gradient array', () => {
      expect(filterGradientsByCategory([], 'warm')).toEqual([]);
    });
  });
});
