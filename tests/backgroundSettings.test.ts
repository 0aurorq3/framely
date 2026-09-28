import { describe, it, expect } from 'vitest';
import { disneyHollywoodGradients, defaultGradients } from '../src/renderer/presetsData';
import {
  MIN_MESH_POINTS,
  MAX_MESH_POINTS,
  canAddMeshPoint,
  canRemoveMeshPoint,
  convertToPercentage,
  MESH_FILTER_RANGES,
  BLUR_DENSITY_RANGE,
  filterGradientsByCategory,
} from '../src/renderer/utils/meshUtils';

describe('Background Settings', () => {
  describe('gradient category filtering', () => {
    it('filters gradients by category', () => {
      const categories = ['classic', 'disney', 'marvel', 'hollywood'] as const;

      for (const cat of categories) {
        if (cat === 'classic') {
          expect(defaultGradients.length).toBeGreaterThan(0);
        } else {
          const filtered = filterGradientsByCategory(disneyHollywoodGradients, cat);
          expect(filtered.length).toBeGreaterThan(0);
          for (const g of filtered) {
            expect(g.category).toBe(cat);
          }
        }
      }
    });
  });

  describe('background type modes', () => {
    it('has valid type labels', () => {
      const types = ['color', 'gradient', 'blur', 'mesh'] as const;

      for (const type of types) {
        expect(typeof type).toBe('string');
        expect(type.length).toBeGreaterThan(0);
      }

      const labels: Record<string, string> = {
        color: 'Solid',
        gradient: 'Preset',
        blur: 'Blurred',
        mesh: 'Mesh'
      };

      for (const type of types) {
        expect(labels[type]).toBeTruthy();
      }
    });
  });

  describe('mesh point limits', () => {
    it('enforces min/max constraints', () => {
      expect(MIN_MESH_POINTS).toBeGreaterThanOrEqual(2);
      expect(MAX_MESH_POINTS).toBeLessThanOrEqual(10);

      expect(canRemoveMeshPoint(2)).toBe(false);
      expect(canAddMeshPoint(2)).toBe(true);
      expect(canAddMeshPoint(10)).toBe(false);
    });
  });

  describe('mesh point position values', () => {
    it('converts normalized to percentage', () => {
      expect(convertToPercentage(0.5)).toBe(50);
      expect(convertToPercentage(0.75)).toBe(75);
      expect(convertToPercentage(0.5) >= 0 && convertToPercentage(0.5) <= 100).toBe(true);
      expect(convertToPercentage(0.75) >= 0 && convertToPercentage(0.75) <= 100).toBe(true);
    });
  });

  describe('mesh filter ranges', () => {
    it('has valid ranges', () => {
      for (const [_name, range] of Object.entries(MESH_FILTER_RANGES)) {
        expect(range.min).toBeLessThan(range.max);
        expect(range.default).toBeGreaterThanOrEqual(range.min);
        expect(range.default).toBeLessThanOrEqual(range.max);
      }
    });
  });

  describe('blur density range', () => {
    it('has valid range', () => {
      expect(BLUR_DENSITY_RANGE.min).toBeLessThan(BLUR_DENSITY_RANGE.max);
      expect(BLUR_DENSITY_RANGE.default).toBeGreaterThanOrEqual(BLUR_DENSITY_RANGE.min);
      expect(BLUR_DENSITY_RANGE.default).toBeLessThanOrEqual(BLUR_DENSITY_RANGE.max);
    });
  });
});
