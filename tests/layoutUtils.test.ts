import { describe, it, expect } from 'vitest';
import {
  zoomIn,
  zoomOut,
  getZoomStyle,
  getFixedSizeFromAspectRatio,
  getPositionAlignment,
  transformCoordinates,
  getDeleteButtonPosition,
} from '../src/renderer/utils/layoutUtils';

describe('layoutUtils', () => {
  describe('zoomIn', () => {
    it('transitions from "Zoom to fit" to 110%', () => {
      expect(zoomIn('Zoom to fit')).toBe('110%');
    });

    it('increments by 10% for normal values', () => {
      expect(zoomIn('100%')).toBe('110%');
      expect(zoomIn('110%')).toBe('120%');
      expect(zoomIn('150%')).toBe('160%');
    });

    it('caps at 500%', () => {
      expect(zoomIn('490%')).toBe('500%');
      expect(zoomIn('500%')).toBe('500%');
      expect(zoomIn('510%')).toBe('500%');
    });

    it('handles non-numeric input gracefully', () => {
      expect(zoomIn('abc')).toBe('100%');
    });
  });

  describe('zoomOut', () => {
    it('transitions from "Zoom to fit" to 90%', () => {
      expect(zoomOut('Zoom to fit')).toBe('90%');
    });

    it('decrements by 10% for normal values', () => {
      expect(zoomOut('100%')).toBe('90%');
      expect(zoomOut('90%')).toBe('80%');
      expect(zoomOut('50%')).toBe('40%');
    });

    it('floors at 10%', () => {
      expect(zoomOut('10%')).toBe('10%');
      expect(zoomOut('15%')).toBe('10%');
      expect(zoomOut('5%')).toBe('10%');
    });

    it('handles non-numeric input gracefully', () => {
      expect(zoomOut('xyz')).toBe('100%');
    });
  });

  describe('getZoomStyle', () => {
    it('returns empty object for "Zoom to fit"', () => {
      expect(getZoomStyle('Zoom to fit')).toEqual({});
    });

    it('returns scale transform for valid percentage', () => {
      expect(getZoomStyle('100%')).toEqual({ transform: 'scale(1)' });
      expect(getZoomStyle('150%')).toEqual({ transform: 'scale(1.5)' });
      expect(getZoomStyle('50%')).toEqual({ transform: 'scale(0.5)' });
    });

    it('returns empty object for NaN input', () => {
      expect(getZoomStyle('abc')).toEqual({});
    });

    it('handles 200%', () => {
      expect(getZoomStyle('200%')).toEqual({ transform: 'scale(2)' });
    });
  });

  describe('getFixedSizeFromAspectRatio', () => {
    it('returns auto dimensions for "Auto"', () => {
      expect(getFixedSizeFromAspectRatio('Auto', 800, 600, false)).toEqual({
        width: 'auto',
        height: 'auto',
      });
    });

    it('returns 600x600 for "1:1"', () => {
      expect(getFixedSizeFromAspectRatio('1:1', 800, 600, false)).toEqual({
        width: 600,
        height: 600,
      });
    });

    it('returns 800x450 for "16:9"', () => {
      expect(getFixedSizeFromAspectRatio('16:9', 800, 600, false)).toEqual({
        width: 800,
        height: 450,
      });
    });

    it('returns 700x525 for "4:3"', () => {
      expect(getFixedSizeFromAspectRatio('4:3', 800, 600, false)).toEqual({
        width: 700,
        height: 525,
      });
    });

    it('returns 750x500 for "3:2"', () => {
      expect(getFixedSizeFromAspectRatio('3:2', 800, 600, false)).toEqual({
        width: 750,
        height: 500,
      });
    });

    it('uses canvasWidth/canvasHeight for "Custom"', () => {
      expect(getFixedSizeFromAspectRatio('Custom', 1024, 768, false)).toEqual({
        width: 1024,
        height: 768,
      });
    });

    it('returns auto when noImageMode is false and aspect is unknown', () => {
      expect(getFixedSizeFromAspectRatio('Unknown', 800, 600, false)).toEqual({
        width: 'auto',
        height: 'auto',
      });
    });

    it('returns 800x450 for unknown aspect with noImageMode true', () => {
      expect(getFixedSizeFromAspectRatio('Unknown', 800, 600, true)).toEqual({
        width: 800,
        height: 450,
      });
    });

    it('returns 800x450 for "Auto" with noImageMode true', () => {
      expect(getFixedSizeFromAspectRatio('Auto', 800, 600, true)).toEqual({
        width: 800,
        height: 450,
      });
    });
  });

  describe('getPositionAlignment', () => {
    it('Top left aligns flex-start/flex-start', () => {
      expect(getPositionAlignment('Top left')).toEqual({
        alignItems: 'flex-start',
        justifyContent: 'flex-start',
      });
    });

    it('Top center aligns flex-start/center', () => {
      expect(getPositionAlignment('Top center')).toEqual({
        alignItems: 'flex-start',
        justifyContent: 'center',
      });
    });

    it('Top right aligns flex-start/flex-end', () => {
      expect(getPositionAlignment('Top right')).toEqual({
        alignItems: 'flex-start',
        justifyContent: 'flex-end',
      });
    });

    it('Middle left aligns center/flex-start', () => {
      expect(getPositionAlignment('Middle left')).toEqual({
        alignItems: 'center',
        justifyContent: 'flex-start',
      });
    });

    it('Middle center aligns center/center', () => {
      expect(getPositionAlignment('Middle center')).toEqual({
        alignItems: 'center',
        justifyContent: 'center',
      });
    });

    it('Middle right aligns center/flex-end', () => {
      expect(getPositionAlignment('Middle right')).toEqual({
        alignItems: 'center',
        justifyContent: 'flex-end',
      });
    });

    it('Bottom left aligns flex-end/flex-start', () => {
      expect(getPositionAlignment('Bottom left')).toEqual({
        alignItems: 'flex-end',
        justifyContent: 'flex-start',
      });
    });

    it('Bottom center aligns flex-end/center', () => {
      expect(getPositionAlignment('Bottom center')).toEqual({
        alignItems: 'flex-end',
        justifyContent: 'center',
      });
    });

    it('Bottom right aligns flex-end/flex-end', () => {
      expect(getPositionAlignment('Bottom right')).toEqual({
        alignItems: 'flex-end',
        justifyContent: 'flex-end',
      });
    });
  });

  describe('transformCoordinates', () => {
    const dimensions = { width: 1000, height: 800 };

    it('converts percentage coordinates to absolute pixels', () => {
      const result = transformCoordinates(
        { x: 0.1, y: 0.2, w: 0.3, h: 0.4 },
        dimensions
      );
      expect(result.x1).toBe(100);  // 0.1 * 1000
      expect(result.y1).toBe(160);  // 0.2 * 800
      expect(result.w).toBe(300);   // 0.3 * 1000
      expect(result.h).toBe(320);   // 0.4 * 800
    });

    it('handles negative width (rect created right-to-left)', () => {
      const result = transformCoordinates(
        { x: 0.5, y: 0.2, w: -0.3, h: 0.4 },
        dimensions
      );
      expect(result.w).toBe(-300);
      expect(result.rectW).toBe(300); // absolute value
      expect(result.rectH).toBe(320);
    });

    it('handles negative height (rect created bottom-to-top)', () => {
      const result = transformCoordinates(
        { x: 0.1, y: 0.5, w: 0.3, h: -0.4 },
        dimensions
      );
      expect(result.h).toBe(-320);
      expect(result.rectW).toBe(300);
      expect(result.rectH).toBe(320); // absolute value
    });

    it('handles zero width and height', () => {
      const result = transformCoordinates(
        { x: 0.5, y: 0.5, w: 0, h: 0 },
        dimensions
      );
      expect(result.rectW).toBe(0);
      expect(result.rectH).toBe(0);
    });
  });

  describe('getDeleteButtonPosition', () => {
    it('calculates percentage position centered below annotation', () => {
      const ann = { x: 0.1, y: 0.2, w: 0.3, h: 0.1 };
      const result = getDeleteButtonPosition(ann);

      // Center X: (0.1 + 0.3/2) * 100 = 25
      expect(result.percentX).toBeCloseTo(25, 1);
      // Bottom Y: (0.2 + 0.1) * 100 = 30
      expect(result.percentY).toBeCloseTo(30, 1);
    });

    it('handles annotation at origin', () => {
      const ann = { x: 0, y: 0, w: 0.5, h: 0.5 };
      const result = getDeleteButtonPosition(ann);
      expect(result.percentX).toBeCloseTo(25, 1);
      expect(result.percentY).toBeCloseTo(50, 1);
    });
  });
});
