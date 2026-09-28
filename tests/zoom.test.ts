import { describe, it, expect } from 'vitest';
import { zoomIn, zoomOut } from '../src/renderer/utils/layoutUtils';

describe('Zoom', () => {
  describe('zoomIn', () => {
    it('increments zoom level', () => {
      expect(zoomIn('100%')).toBe('110%');
      expect(zoomIn('200%')).toBe('210%');
    });

    it('clamps at max 500%', () => {
      expect(zoomIn('500%')).toBe('500%');
      expect(zoomIn('490%')).toBe('500%');
    });

    it('handles special values', () => {
      expect(zoomIn('Zoom to fit')).toBe('110%');
      expect(zoomIn('invalid')).toBe('100%');
    });
  });

  describe('zoomOut', () => {
    it('decrements zoom level', () => {
      expect(zoomOut('100%')).toBe('90%');
      expect(zoomOut('200%')).toBe('190%');
    });

    it('clamps at min 10%', () => {
      expect(zoomOut('10%')).toBe('10%');
      expect(zoomOut('20%')).toBe('10%');
    });

    it('handles special values', () => {
      expect(zoomOut('Zoom to fit')).toBe('90%');
      expect(zoomOut('invalid')).toBe('100%');
    });
  });

  describe('boundary conditions', () => {
    it('handles non-round values', () => {
      expect(zoomIn('105%')).toBe('110%');
      expect(zoomOut('105%')).toBe('100%');
    });

    it('chains zoom operations', () => {
      let z = 'Zoom to fit';
      z = zoomIn(z);
      expect(z).toBe('110%');
      z = zoomOut(z);
      expect(z).toBe('100%');
    });
  });
});
