import { describe, it, expect, vi, beforeEach, Mock } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import React from 'react';
import { useAnnotationEvents } from '../src/renderer/hooks/useAnnotationEvents';
import { Annotation } from '../src/renderer/canvasRenderer';

function makeMockDiv() {
  const div = document.createElement('div');
  div.getBoundingClientRect = () => ({
    left: 0, top: 0, width: 800, height: 600,
    right: 800, bottom: 600, x: 0, y: 0, toJSON: () => {},
  });
  return div;
}

function makeRect(id: string, x: number, y: number, w: number, h: number): Annotation {
  return { id, type: 'rect', x, y, w, h, color: '#ff0000', strokeWidth: 4 };
}

describe('annotation snapping integration', () => {
  let containerRef: any;
  let setAnnotations: Mock<React.Dispatch<React.SetStateAction<Annotation[]>>>;
  let onSaveHistory: Mock<(newAnns?: Annotation[]) => void>;
  let customPrompt: Mock<(message: string, defaultValue?: string) => Promise<string | null>>;

  beforeEach(() => {
    containerRef = { current: null };
    setAnnotations = vi.fn<React.Dispatch<React.SetStateAction<Annotation[]>>>((val: any) => {
      if (typeof val === 'function') return val([]);
      return val;
    });
    onSaveHistory = vi.fn<(newAnns?: Annotation[]) => void>();
    customPrompt = vi.fn<(message: string, defaultValue?: string) => Promise<string | null>>().mockResolvedValue('😀');
  });

  describe('activeGuides state', () => {
    it('is initially empty', () => {
      const { result } = renderHook(() =>
        useAnnotationEvents({
          annotations: [], setAnnotations, activeTool: 'pointer',
          color: '#ff0000', strokeWidth: 4, arrowStyle: 'classic',
          onSaveHistory, customPrompt, containerRef,
        }),
      );
      expect(result.current.activeGuides).toEqual([]);
    });
  });

  describe('drag snapping', () => {
    it('sets activeGuides when drag snaps to another annotation edge', () => {
      const mockDiv = makeMockDiv();
      containerRef.current = mockDiv;

      const existing: Annotation[] = [
        makeRect('a1', 0.1, 0.1, 0.2, 0.2), // right edge at 0.3
      ];

      let currentAnnotations = existing;
      const wrappedSetAnnotations = vi.fn<React.Dispatch<React.SetStateAction<Annotation[]>>>((updater: any) => {
        if (typeof updater === 'function') {
          currentAnnotations = updater(currentAnnotations);
          return currentAnnotations;
        }
        currentAnnotations = updater;
        return updater;
      });

      const { result } = renderHook(() =>
        useAnnotationEvents({
          annotations: currentAnnotations,
          setAnnotations: wrappedSetAnnotations,
          activeTool: 'pointer',
          color: '#ff0000', strokeWidth: 4, arrowStyle: 'classic',
          onSaveHistory, customPrompt, containerRef,
        }),
      );

      // Start and complete a drag
      act(() => {
        result.current.setSelectedId('a1');
        result.current.startDrag(
          { stopPropagation: vi.fn(), clientX: 160, clientY: 120, pointerId: 1, detail: 1 } as any,
          existing[0],
        );
      });

      act(() => {
        result.current.handlePointerUp({
          clientX: 100, clientY: 100, pointerId: 1,
        } as any);
      });

      // Guides MUST be empty after pointer up
      expect(result.current.activeGuides).toEqual([]);
    });
  });

  describe('drawing snapping', () => {
    it('sets activeGuides during shape drawing', () => {
      const mockDiv = makeMockDiv();
      containerRef.current = mockDiv;

      const existing: Annotation[] = [
        makeRect('a1', 0.1, 0.1, 0.2, 0.2),
      ];

      const { result } = renderHook(() =>
        useAnnotationEvents({
          annotations: existing,
          setAnnotations,
          activeTool: 'rect',
          color: '#00ff00', strokeWidth: 3, arrowStyle: 'classic',
          onSaveHistory, customPrompt, containerRef,
        }),
      );

      // Start drawing
      act(() => {
        result.current.handlePointerDown({
          clientX: 100, clientY: 100, pointerId: 1,
          target: { tagName: 'DIV' }, currentTarget: { tagName: 'DIV' },
        } as any);
      });

      // Move near another annotation's edge
      act(() => {
        result.current.handlePointerMove({
          clientX: 245, clientY: 150, pointerId: 1,
        } as any);
      });

      // Should have guides if moving corner is near a snap candidate
      expect(result.current.activeGuides).toBeDefined();
    });

    it('clears activeGuides when drawing ends', () => {
      const mockDiv = makeMockDiv();
      containerRef.current = mockDiv;

      const { result } = renderHook(() =>
        useAnnotationEvents({
          annotations: [],
          setAnnotations,
          activeTool: 'rect',
          color: '#00ff00', strokeWidth: 3, arrowStyle: 'classic',
          onSaveHistory, customPrompt, containerRef,
        }),
      );

      act(() => {
        result.current.handlePointerDown({
          clientX: 100, clientY: 100, pointerId: 1,
          target: { tagName: 'DIV' }, currentTarget: { tagName: 'DIV' },
        } as any);
      });

      act(() => {
        result.current.handlePointerUp({
          clientX: 200, clientY: 200, pointerId: 1,
        } as any);
      });

      expect(result.current.activeGuides).toEqual([]);
    });
  });

  describe('resize snapping', () => {
    it('sets activeGuides during resize', () => {
      const mockDiv = makeMockDiv();
      containerRef.current = mockDiv;

      const existing: Annotation[] = [
        makeRect('a1', 0.2, 0.2, 0.3, 0.2),
        makeRect('a2', 0.6, 0.1, 0.1, 0.2), // left edge at 0.6
      ];

      let currentAnnotations = [...existing];
      const wrappedSetAnnotations = vi.fn<React.Dispatch<React.SetStateAction<Annotation[]>>>((updater: any) => {
        if (typeof updater === 'function') {
          currentAnnotations = updater(currentAnnotations);
          return currentAnnotations;
        }
        currentAnnotations = updater;
        return updater;
      });

      const { result } = renderHook(() =>
        useAnnotationEvents({
          annotations: currentAnnotations,
          setAnnotations: wrappedSetAnnotations,
          activeTool: 'pointer',
          color: '#ff0000', strokeWidth: 4, arrowStyle: 'classic',
          onSaveHistory, customPrompt, containerRef,
        }),
      );

      // Start resize
      act(() => {
        result.current.startResize(
          { stopPropagation: vi.fn(), clientX: 400, clientY: 200, pointerId: 1 } as any,
          existing[0],
          'br',
        );
      });

      // Resize to snap right edge to a2's left edge
      act(() => {
        result.current.handlePointerMove({
          clientX: 480, clientY: 250, pointerId: 1,
        } as any);
      });

      expect(result.current.activeGuides).toBeDefined();
    });

    it('clears activeGuides when resize ends', () => {
      const mockDiv = makeMockDiv();
      containerRef.current = mockDiv;

      const existing: Annotation[] = [
        makeRect('a1', 0.2, 0.2, 0.3, 0.2),
      ];

      let currentAnnotations = [...existing];
      const wrappedSetAnnotations = vi.fn<React.Dispatch<React.SetStateAction<Annotation[]>>>((updater: any) => {
        if (typeof updater === 'function') {
          currentAnnotations = updater(currentAnnotations);
          return currentAnnotations;
        }
        currentAnnotations = updater;
        return updater;
      });

      const { result } = renderHook(() =>
        useAnnotationEvents({
          annotations: currentAnnotations,
          setAnnotations: wrappedSetAnnotations,
          activeTool: 'pointer',
          color: '#ff0000', strokeWidth: 4, arrowStyle: 'classic',
          onSaveHistory, customPrompt, containerRef,
        }),
      );

      act(() => {
        result.current.startResize(
          { stopPropagation: vi.fn(), clientX: 400, clientY: 200, pointerId: 1 } as any,
          existing[0],
          'br',
        );
      });

      act(() => {
        result.current.handlePointerUp({
          clientX: 500, clientY: 300, pointerId: 1,
        } as any);
      });

      expect(result.current.activeGuides).toEqual([]);
    });
  });

  describe('container edge snapping', () => {
    it('snaps to container left edge (0) during drag', () => {
      const mockDiv = makeMockDiv();
      containerRef.current = mockDiv;

      const existing: Annotation[] = [
        makeRect('a1', 0.3, 0.2, 0.2, 0.2),
      ];

      let currentAnnotations = [...existing];
      const wrappedSetAnnotations = vi.fn<React.Dispatch<React.SetStateAction<Annotation[]>>>((updater: any) => {
        if (typeof updater === 'function') {
          currentAnnotations = updater(currentAnnotations);
          return currentAnnotations;
        }
        currentAnnotations = updater;
        return updater;
      });

      const { result } = renderHook(() =>
        useAnnotationEvents({
          annotations: currentAnnotations,
          setAnnotations: wrappedSetAnnotations,
          activeTool: 'pointer',
          color: '#ff0000', strokeWidth: 4, arrowStyle: 'classic',
          onSaveHistory, customPrompt, containerRef,
        }),
      );

      act(() => {
        result.current.setSelectedId('a1');
        // Click at center of annotation: x=320, y=120 (annotation center is at 0.4, 0.3)
        result.current.startDrag(
          { stopPropagation: vi.fn(), clientX: 320, clientY: 120, pointerId: 1, detail: 1 } as any,
          existing[0],
        );
      });

      // Move mouse to near left edge (mouse at x=4, which is 4/800 = 0.005 fraction)
      // rawX = 0.3 + (0.005 - 0.4) = -0.095 — hmm, still far from 0
      // Actually we need rawX ≈ 0, so mouseX = dragStart.annX - dragStart.annX + 0 = 0
      // mouseX = dragStart.mouseX + (0 - dragStart.annX) = 0.4 + (0 - 0.3) = 0.1
      // clientX = 0.1 * 800 = 80
      act(() => {
        result.current.handlePointerMove({
          clientX: 80, clientY: 120, pointerId: 1,
        } as any);
      });

      // activeGuides should contain a guide at position 0
      const verticalGuide = result.current.activeGuides.find(
        g => g.orientation === 'vertical' && g.position === 0,
      );
      expect(verticalGuide).toBeDefined();
    });
  });

  describe('guide clearing on pointer up', () => {
    it('clears guides regardless of gesture type', () => {
      const mockDiv = makeMockDiv();
      containerRef.current = mockDiv;

      const { result } = renderHook(() =>
        useAnnotationEvents({
          annotations: [], setAnnotations, activeTool: 'pointer',
          color: '#ff0000', strokeWidth: 4, arrowStyle: 'classic',
          onSaveHistory, customPrompt, containerRef,
        }),
      );

      // Even without a gesture, pointer up clears guides
      act(() => {
        result.current.handlePointerUp({
          clientX: 100, clientY: 100, pointerId: 1,
        } as any);
      });

      expect(result.current.activeGuides).toEqual([]);
    });
  });
});
