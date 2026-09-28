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

describe('Annotation Events', () => {
  describe('rotatePoint', () => {
    it('rotates points correctly', () => {
      const p0 = rotatePoint(100, 0, 0, 0, 0);
      expect(Math.abs(p0.x - 100)).toBeLessThan(0.001);
      expect(Math.abs(p0.y - 0)).toBeLessThan(0.001);

      const p90 = rotatePoint(100, 0, 0, 0, 90);
      expect(Math.abs(p90.x - 0)).toBeLessThan(0.001);
      expect(Math.abs(p90.y - (-100))).toBeLessThan(0.001);

      const p180 = rotatePoint(100, 0, 0, 0, 180);
      expect(Math.abs(p180.x - (-100))).toBeLessThan(0.001);
      expect(Math.abs(p180.y - 0)).toBeLessThan(0.001);

      const p270 = rotatePoint(100, 0, 0, 0, 270);
      expect(Math.abs(p270.x - 0)).toBeLessThan(0.001);
      expect(Math.abs(p270.y - 100)).toBeLessThan(0.001);

      const pCenter = rotatePoint(150, 100, 100, 100, 90);
      expect(Math.abs(pCenter.x - 100)).toBeLessThan(0.001);
      expect(Math.abs(pCenter.y - 50)).toBeLessThan(0.001);
    });
  });

  describe('pen point normalization', () => {
    it('normalizes points to 0-1 range', () => {
      const penPoints = [
        { x: 10, y: 20 },
        { x: 30, y: 40 },
        { x: 50, y: 10 },
        { x: 20, y: 60 },
      ];

      const result = normalizePenPoints(penPoints);

      expect(result.x).toBe(10);
      expect(result.y).toBe(10);
      expect(result.w).toBe(40);
      expect(result.h).toBe(50);

      expect(result.points[0].x >= 0 && result.points[0].x <= 1).toBe(true);
      expect(result.points[0].y >= 0 && result.points[0].y <= 1).toBe(true);

      const minPoint = result.points.find(p => p.x === 0);
      expect(minPoint).toBeTruthy();

      const minYPoint = result.points.find(p => p.y === 0);
      expect(minYPoint).toBeTruthy();
    });

    it('handles single point', () => {
      const penPoints = [{ x: 100, y: 200 }];
      const result = normalizePenPoints(penPoints);

      expect(result.w).toBe(0.001);
      expect(result.h).toBe(0.001);
    });
  });

  describe('text drawing default sizing', () => {
    it('applies defaults for small drags', () => {
      const result1 = getTextDrawingSize(0.01, 0.01);
      expect(result1.w).toBe(0.16);
      expect(result1.h).toBe(0.04);

      const result2 = getTextDrawingSize(0.5, 0.3);
      expect(result2.w).toBe(0.5);
      expect(result2.h).toBe(0.3);
    });
  });

  describe('shape drawing normalization', () => {
    it('normalizes negative dimensions', () => {
      const drawingAnn = { x: 0.5, y: 0.5, w: -0.2, h: -0.1 };
      const result = normalizeShapeDrawing(drawingAnn);

      expect(result).toBeTruthy();
      expect(result!.x).toBe(0.3);
      expect(result!.y).toBe(0.4);
      expect(result!.w).toBe(0.2);
      expect(result!.h).toBe(0.1);
    });

    it('returns null for tiny shapes', () => {
      const result = normalizeShapeDrawing({ x: 0, y: 0, w: 0.003, h: 0.003 });
      expect(result).toBeNull();

      const result2 = normalizeShapeDrawing({ x: 0, y: 0, w: 0.01, h: 0.01 });
      expect(result2).toBeTruthy();
    });
  });

  describe('drag threshold logic', () => {
    it('requires minimum distance to drag', () => {
      expect(hasDragged(100, 100, 102, 102)).toBe(false);
      expect(hasDragged(100, 100, 110, 110)).toBe(true);
      expect(hasDragged(100, 100, 105, 100)).toBe(true);
    });
  });

  describe('double-click timing logic', () => {
    it('detects double-clicks within threshold', () => {
      const now = Date.now();
      
      expect(isDoubleClick(0, now)).toBe(false);
      expect(isDoubleClick(now, now + 200)).toBe(true);
      expect(isDoubleClick(now, now + 400)).toBe(false);
    });
  });

  describe('rotation angle calculation', () => {
    it('calculates angles correctly', () => {
      const deg1 = calculateRotationAngle(50, 0, 50, 50);
      expect(Math.abs(deg1 - 0) < 1 || Math.abs(deg1 - 360) < 1).toBe(true);

      const deg2 = calculateRotationAngle(100, 50, 50, 50);
      expect(Math.abs(deg2 - 90)).toBeLessThan(1);

      const deg3 = calculateRotationAngle(50, 100, 50, 50);
      expect(Math.abs(deg3 - 180)).toBeLessThan(1);

      const deg4 = calculateRotationAngle(0, 50, 50, 50);
      expect(Math.abs(deg4 - 270)).toBeLessThan(1);
    });

    it('normalizes negative angles', () => {
      const deg = calculateRotationAngle(25, 25, 50, 50);
      expect(Math.abs(deg - 315)).toBeLessThan(1);
    });
  });
});
