import { describe, it, expect } from 'vitest';
import {
  getDiagonalBackground,
  getSpotlightBackground,
  getAuroraBackground,
  getBackgroundStyle,
} from '../src/renderer/utils/previewBgUtils';

describe('previewBgUtils', () => {
  describe('getDiagonalBackground', () => {
    it('returns a string of CSS linear-gradients', () => {
      const result = getDiagonalBackground(135, 50, 0, 4);
      expect(typeof result).toBe('string');
      expect(result).toContain('linear-gradient');
    });

    it('includes the specified angle', () => {
      const result = getDiagonalBackground(90, 50, 50, 3);
      expect(result).toContain('90deg');
    });

    it('produces layers proportional to lightRaysCount', () => {
      const few = getDiagonalBackground(135, 50, 0, 2);
      const many = getDiagonalBackground(135, 50, 0, 8);
      const fewLayers = few.split('linear-gradient').length;
      const manyLayers = many.split('linear-gradient').length;
      expect(manyLayers).toBeGreaterThan(fewLayers);
    });

    it('clamps lightRaysCount to at least 1', () => {
      const result = getDiagonalBackground(135, 50, 0, 0);
      expect(result).toContain('linear-gradient');
    });

    it('clamps lightRaysCount to at most 10', () => {
      const result = getDiagonalBackground(135, 50, 0, 20);
      const layers = result.split('linear-gradient').length;
      expect(layers).toBeLessThanOrEqual(12);
    });

    it('handles edge angles', () => {
      expect(() => getDiagonalBackground(0, 0, 0, 4)).not.toThrow();
      expect(() => getDiagonalBackground(360, 100, 100, 4)).not.toThrow();
    });
  });

  describe('getSpotlightBackground', () => {
    it('returns a radial-gradient string', () => {
      const result = getSpotlightBackground(50, 50);
      expect(result).toContain('radial-gradient');
      expect(result).toContain('50% 50%');
    });

    it('uses custom source coordinates', () => {
      const result = getSpotlightBackground(25, 75);
      expect(result).toContain('25% 75%');
    });
  });

  describe('getAuroraBackground', () => {
    it('returns a string with two linear-gradients', () => {
      const result = getAuroraBackground(45, 50, 50);
      const parts = result.split('linear-gradient');
      expect(parts.length).toBe(3);
    });

    it('includes the specified angle', () => {
      const result = getAuroraBackground(120, 30, 70);
      expect(result).toContain('120deg');
    });

    it('handles zero source coordinates', () => {
      expect(() => getAuroraBackground(0, 0, 0)).not.toThrow();
    });
  });

  describe('getBackgroundStyle', () => {
    it('returns backgroundColor for color type', () => {
      const style = getBackgroundStyle('color', '#ff0000', null, '');
      expect(style.backgroundColor).toBe('#ff0000');
    });

    it('returns backgroundImage for gradient type', () => {
      const grad = 'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)';
      const style = getBackgroundStyle('gradient', grad, null, '');
      expect(style.backgroundImage).toBe(grad);
      expect(style.backgroundSize).toBe('cover');
      expect(style.backgroundPosition).toBe('center');
    });

    it('returns blur background when imageSrc is available', () => {
      const style = getBackgroundStyle('blur', '', 'data:image/png;base64,abc', '');
      expect(style.backgroundImage).toContain('data:image/png;base64,abc');
    });

    it('returns empty style for blur when no imageSrc', () => {
      const style = getBackgroundStyle('blur', '', null, '');
      expect(style).toEqual({});
    });

    it('returns mesh background', () => {
      const style = getBackgroundStyle('mesh', '', null, 'data:image/png;base64,mesh');
      expect(style.backgroundImage).toContain('data:image/png;base64,mesh');
    });
  });
});
