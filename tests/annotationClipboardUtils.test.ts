import { describe, it, expect, beforeEach } from 'vitest';
import {
  cloneAnnotation,
  getAnnotationClipboard,
  setAnnotationClipboard,
  clearAnnotationClipboard,
  hasAnnotationClipboard,
  ANNOTATION_PASTE_OFFSET,
} from '../src/renderer/utils/annotationClipboardUtils';
import { Annotation } from '../src/renderer/canvasRenderer';

const sample: Annotation = {
  id: 'ann-original',
  type: 'rect',
  x: 0.1,
  y: 0.2,
  w: 0.3,
  h: 0.25,
  color: '#ff0000',
  strokeWidth: 4,
  rotation: 15,
  points: [
    { x: 0, y: 0 },
    { x: 1, y: 1 },
  ],
  text: 'hello',
  fontFamily: 'Inter',
  fontSize: 20,
};

describe('annotationClipboardUtils', () => {
  beforeEach(() => {
    clearAnnotationClipboard();
  });

  describe('cloneAnnotation', () => {
    it('creates a new id and deep-clones points', () => {
      const clone = cloneAnnotation(sample);
      expect(clone.id).not.toBe(sample.id);
      expect(clone.id).toMatch(/^ann-/);
      expect(clone.type).toBe('rect');
      expect(clone.color).toBe('#ff0000');
      expect(clone.text).toBe('hello');
      expect(clone.points).toEqual(sample.points);
      expect(clone.points).not.toBe(sample.points);
      if (clone.points && sample.points) {
        expect(clone.points[0]).not.toBe(sample.points[0]);
      }
    });

    it('does not mutate the source', () => {
      const clone = cloneAnnotation(sample, { offset: 0.05 });
      expect(sample.x).toBe(0.1);
      expect(sample.y).toBe(0.2);
      expect(clone.x).toBeCloseTo(0.15);
      expect(clone.y).toBeCloseTo(0.25);
    });

    it('applies offset when provided', () => {
      const clone = cloneAnnotation(sample, { offset: ANNOTATION_PASTE_OFFSET });
      expect(clone.x).toBeCloseTo(0.1 + ANNOTATION_PASTE_OFFSET);
      expect(clone.y).toBeCloseTo(0.2 + ANNOTATION_PASTE_OFFSET);
    });

    it('clamps offset so the object stays on-canvas', () => {
      const nearEdge: Annotation = {
        ...sample,
        x: 0.95,
        y: 0.9,
        w: 0.2,
        h: 0.2,
      };
      const clone = cloneAnnotation(nearEdge, { offset: 0.1 });
      // maxX = 1 - 0.2 = 0.8
      expect(clone.x).toBeLessThanOrEqual(0.8);
      expect(clone.y).toBeLessThanOrEqual(0.8);
      expect(clone.x).toBeGreaterThanOrEqual(0);
      expect(clone.y).toBeGreaterThanOrEqual(0);
    });

    it('preserves imageSrc and style fields', () => {
      const withImage: Annotation = {
        ...sample,
        type: 'image',
        imageSrc: 'data:image/png;base64,abc',
        gradientEnabled: true,
        gradientColor1: '#fff',
        gradientColor2: '#000',
      };
      const clone = cloneAnnotation(withImage);
      expect(clone.imageSrc).toBe('data:image/png;base64,abc');
      expect(clone.gradientEnabled).toBe(true);
      expect(clone.gradientColor1).toBe('#fff');
    });
  });

  describe('module clipboard', () => {
    it('starts empty', () => {
      expect(hasAnnotationClipboard()).toBe(false);
      expect(getAnnotationClipboard()).toBeNull();
    });

    it('stores and retrieves an annotation', () => {
      const clone = cloneAnnotation(sample);
      setAnnotationClipboard(clone);
      expect(hasAnnotationClipboard()).toBe(true);
      expect(getAnnotationClipboard()).toEqual(clone);
    });

    it('clears the clipboard', () => {
      setAnnotationClipboard(cloneAnnotation(sample));
      clearAnnotationClipboard();
      expect(hasAnnotationClipboard()).toBe(false);
      expect(getAnnotationClipboard()).toBeNull();
    });
  });
});
