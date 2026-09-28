import { describe, it, expect } from 'vitest';
import {
  getCurvedArrowPoints,
  getTaperedCurvedArrowPoints,
  drawArrowOnCanvas,
} from '../src/renderer/arrowUtils';
import { makeMockCtx, makeArrowAnnotation } from './shared';

describe('Arrow Utils', () => {
  describe('getCurvedArrowPoints', () => {
    it('calculates curved arrow points', () => {
      const res = getCurvedArrowPoints(0, 0, 100, 100, 4);
      expect(res).not.toBeNull();
      expect(res!.x0).toBe(0);
      expect(res!.y0).toBe(0);
      expect(res!.x1).toBe(100);
      expect(res!.y1).toBe(100);
      expect(res!.cx !== 50 || res!.cy !== 50).toBe(true);
      expect(typeof res!.arrow1X).toBe('number');
      expect(typeof res!.arrow2X).toBe('number');
    });

    it('returns null for short distance', () => {
      expect(getCurvedArrowPoints(0, 0, 0.5, 0.5, 4)).toBeNull();
    });

    it('handles large stroke width', () => {
      const res = getCurvedArrowPoints(0, 0, 200, 0, 20);
      expect(res).not.toBeNull();
      expect(typeof res!.cx).toBe('number');
    });
  });

  describe('getTaperedCurvedArrowPoints', () => {
    it('calculates tapered arrow points', () => {
      const res = getTaperedCurvedArrowPoints(0, 0, 100, 100, 4);
      expect(res).not.toBeNull();
      expect(res!.leftPoints.length).toBeGreaterThan(0);
      expect(res!.rightPoints.length).toBeGreaterThan(0);
      expect(res!.tip.x).toBe(100);
      expect(res!.tip.y).toBe(100);
      expect(typeof res!.H_left.x).toBe('number');
      expect(typeof res!.H_right.x).toBe('number');
    });

    it('returns null for short distance', () => {
      expect(getTaperedCurvedArrowPoints(0, 0, 0.5, 0.5, 4)).toBeNull();
    });

    it('handles minimal stroke', () => {
      const res = getTaperedCurvedArrowPoints(0, 0, 50, 50, 1);
      expect(res).not.toBeNull();
      expect(res!.leftPoints.length).toBe(16);
      expect(res!.rightPoints.length).toBe(16);
    });

    it('produces correct tip coordinates', () => {
      const res = getTaperedCurvedArrowPoints(10, 20, 110, 120, 4);
      expect(res).not.toBeNull();
      expect(res!.tip.x).toBe(110);
      expect(res!.tip.y).toBe(120);
    });

    it('produces valid head geometry points', () => {
      const res = getTaperedCurvedArrowPoints(0, 0, 200, 0, 6);
      expect(res).not.toBeNull();
      expect(typeof res!.H_left.x).toBe('number');
      expect(typeof res!.H_right.x).toBe('number');
      // Left and right head endpoints should have opposite normals
      expect(res!.H_left.y * res!.H_right.y).toBeLessThan(0);
    });

    it('handles zero-length stroke gracefully', () => {
      const res = getTaperedCurvedArrowPoints(0, 0, 100, 100, 0);
      expect(res).not.toBeNull();
      expect(res!.leftPoints.length).toBe(16);
      expect(res!.rightPoints.length).toBe(16);
    });
  });

  describe('drawArrowOnCanvas', () => {
    it('draws classic arrow without throwing', () => {
      expect(() => drawArrowOnCanvas(makeMockCtx(), makeArrowAnnotation('classic'), 50, 30, 4)).not.toThrow();
    });

    it('draws dashed arrow without throwing', () => {
      expect(() => drawArrowOnCanvas(makeMockCtx(), makeArrowAnnotation('dashed'), 50, 30, 4)).not.toThrow();
    });

    it('draws tapered arrow without throwing', () => {
      expect(() => drawArrowOnCanvas(makeMockCtx(), makeArrowAnnotation('tapered'), 50, 30, 4)).not.toThrow();
    });

    it('draws curved arrow without throwing', () => {
      expect(() => drawArrowOnCanvas(makeMockCtx(), makeArrowAnnotation('curved'), 50, 30, 4)).not.toThrow();
    });

    it('handles tapered short distance early return', () => {
      expect(() => drawArrowOnCanvas(makeMockCtx(), makeArrowAnnotation('tapered'), 0.3, 0.2, 4)).not.toThrow();
    });

    it('handles curved short distance early return', () => {
      expect(() => drawArrowOnCanvas(makeMockCtx(), makeArrowAnnotation('curved'), 0.3, 0.2, 4)).not.toThrow();
    });

    it('defaults to classic style when arrowStyle is missing', () => {
      const ann = { ...makeArrowAnnotation('classic'), arrowStyle: undefined as any };
      expect(() => drawArrowOnCanvas(makeMockCtx(), ann as any, 50, 30, 4)).not.toThrow();
    });
  });
});
