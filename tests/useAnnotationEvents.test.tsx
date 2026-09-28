import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useAnnotationEvents } from '../src/renderer/hooks/useAnnotationEvents';
import { Annotation } from '../src/renderer/canvasRenderer';
import { clearAnnotationClipboard } from '../src/renderer/utils/annotationClipboardUtils';

describe('useAnnotationEvents', () => {
  let containerRef: any;
  let setAnnotations: ReturnType<typeof vi.fn<React.Dispatch<React.SetStateAction<Annotation[]>>>>;
  let onSaveHistory: ReturnType<typeof vi.fn<(newAnns?: Annotation[]) => void>>;
  let customPrompt: ReturnType<typeof vi.fn<(message: string, defaultValue?: string) => Promise<string | null>>>;

  beforeEach(() => {
    containerRef = { current: null };
    setAnnotations = vi.fn<React.Dispatch<React.SetStateAction<Annotation[]>>>().mockImplementation((val: any) => {
      if (typeof val === 'function') return val([]);
      return val;
    });
    onSaveHistory = vi.fn<(newAnns?: Annotation[]) => void>();
    customPrompt = vi.fn<(message: string, defaultValue?: string) => Promise<string | null>>().mockResolvedValue('😀');
  });

  it('initializes with default state', () => {
    const { result } = renderHook(() =>
      useAnnotationEvents({
        annotations: [],
        setAnnotations,
        activeTool: 'pointer',
        color: '#ff0000',
        strokeWidth: 4,
        arrowStyle: 'classic',
        onSaveHistory,
        customPrompt,
        containerRef,
      })
    );

    expect(result.current.dimensions).toEqual({ width: 1, height: 1 });
    expect(result.current.drawingAnnotation).toBeNull();
    expect(result.current.selectedId).toBeNull();
    expect(result.current.editingTextId).toBeNull();
    expect(result.current.editingTextValue).toBe('');
    expect(result.current.penPoints).toEqual([]);
  });

  it('handles pointer down for rect tool', () => {
    const { result } = renderHook(() =>
      useAnnotationEvents({
        annotations: [],
        setAnnotations,
        activeTool: 'rect',
        color: '#ff0000',
        strokeWidth: 4,
        arrowStyle: 'classic',
        onSaveHistory,
        customPrompt,
        containerRef,
      })
    );

    // set containerRef so pointer down works
    const mockDiv = document.createElement('div');
    mockDiv.getBoundingClientRect = () => ({ left: 0, top: 0, width: 800, height: 600, right: 800, bottom: 600, x: 0, y: 0, toJSON: () => {} });
    containerRef.current = mockDiv;

    act(() => {
      result.current.handlePointerDown({
        clientX: 100,
        clientY: 150,
        pointerId: 1,
        target: { tagName: 'DIV' },
        currentTarget: { tagName: 'DIV' },
      } as any);
    });

    expect(result.current.drawingAnnotation).not.toBeNull();
    expect(result.current.drawingAnnotation?.type).toBe('rect');
    expect(result.current.drawingAnnotation?.color).toBe('#ff0000');
  });

  it('creates a blur region with the selected strength only in edit mode', () => {
    const div = document.createElement('div');
    div.getBoundingClientRect = () => ({ left: 0, top: 0, width: 800, height: 600, right: 800, bottom: 600, x: 0, y: 0, toJSON: () => {} });
    containerRef.current = div;
    const props = {
      annotations: [], setAnnotations, activeTool: 'blur' as const,
      color: '#ffffff', strokeWidth: 2, blurStrength: 18,
      onSaveHistory, customPrompt, containerRef,
    };
    const { result, rerender } = renderHook(({ enabled }) => useAnnotationEvents({ ...props, enabled }), {
      initialProps: { enabled: false },
    });
    const event = { clientX: 100, clientY: 150, pointerId: 1 } as any;
    act(() => result.current.handlePointerDown(event));
    expect(result.current.drawingAnnotation).toBeNull();

    rerender({ enabled: true });
    act(() => result.current.handlePointerDown(event));
    expect(result.current.drawingAnnotation?.type).toBe('blur');
    expect(result.current.drawingAnnotation?.blurStrength).toBe(18);
  });

  it('handles pointer down for arrow tool with arrowStyle', () => {
    const mockDiv = document.createElement('div');
    mockDiv.getBoundingClientRect = () => ({ left: 0, top: 0, width: 800, height: 600, right: 800, bottom: 600, x: 0, y: 0, toJSON: () => {} });
    containerRef.current = mockDiv;

    const { result } = renderHook(() =>
      useAnnotationEvents({
        annotations: [],
        setAnnotations,
        activeTool: 'arrow',
        color: '#0000ff',
        strokeWidth: 2,
        arrowStyle: 'tapered',
        onSaveHistory,
        customPrompt,
        containerRef,
      })
    );

    act(() => {
      result.current.handlePointerDown({
        clientX: 200,
        clientY: 300,
        pointerId: 1,
        target: { tagName: 'DIV' },
        currentTarget: { tagName: 'DIV' },
      } as any);
    });

    expect(result.current.drawingAnnotation?.type).toBe('arrow');
    expect(result.current.drawingAnnotation?.arrowStyle).toBe('tapered');
  });

  it('handles pointer down for pen tool with points', () => {
    const mockDiv = document.createElement('div');
    mockDiv.getBoundingClientRect = () => ({ left: 0, top: 0, width: 800, height: 600, right: 800, bottom: 600, x: 0, y: 0, toJSON: () => {} });
    containerRef.current = mockDiv;

    const { result } = renderHook(() =>
      useAnnotationEvents({
        annotations: [],
        setAnnotations,
        activeTool: 'pen',
        color: '#00ff00',
        strokeWidth: 3,
        arrowStyle: 'classic',
        onSaveHistory,
        customPrompt,
        containerRef,
      })
    );

    act(() => {
      result.current.handlePointerDown({
        clientX: 100,
        clientY: 100,
        pointerId: 1,
        target: { tagName: 'DIV' },
        currentTarget: { tagName: 'DIV' },
      } as any);
    });

    expect(result.current.drawingAnnotation?.type).toBe('pen');
  });

  it('deselects when clicking background with pointer tool', () => {
    const mockDiv = document.createElement('div');
    mockDiv.getBoundingClientRect = () => ({ left: 0, top: 0, width: 800, height: 600, right: 800, bottom: 600, x: 0, y: 0, toJSON: () => {} });
    containerRef.current = mockDiv;

    const { result } = renderHook(() =>
      useAnnotationEvents({
        annotations: [],
        setAnnotations,
        activeTool: 'pointer',
        color: '#ff0000',
        strokeWidth: 4,
        arrowStyle: 'classic',
        onSaveHistory,
        customPrompt,
        containerRef,
      })
    );

    act(() => {
      result.current.setSelectedId('test-id');
    });

    const e = {
      clientX: 100,
      clientY: 100,
      pointerId: 1,
      target: mockDiv,
      currentTarget: mockDiv,
    };

    act(() => {
      result.current.handlePointerDown(e as any);
    });

    expect(result.current.selectedId).toBeNull();
  });

  it('handles pointer move for shape drawing', () => {
    const mockDiv = document.createElement('div');
    mockDiv.getBoundingClientRect = () => ({ left: 0, top: 0, width: 800, height: 600, right: 800, bottom: 600, x: 0, y: 0, toJSON: () => {} });
    containerRef.current = mockDiv;

    const { result } = renderHook(() =>
      useAnnotationEvents({
        annotations: [],
        setAnnotations,
        activeTool: 'rect',
        color: '#ff0000',
        strokeWidth: 4,
        arrowStyle: 'classic',
        onSaveHistory,
        customPrompt,
        containerRef,
      })
    );

    // Create drawingAnnotation first
    act(() => {
      result.current.handlePointerDown({
        clientX: 100,
        clientY: 100,
        pointerId: 1,
        target: { tagName: 'DIV' },
        currentTarget: { tagName: 'DIV' },
      } as any);
    });

    act(() => {
      result.current.handlePointerMove({
        clientX: 200,
        clientY: 250,
      } as any);
    });

    expect(result.current.drawingAnnotation).toBeDefined();
  });

  it('deletes annotation on Delete key', () => {
    const annotations: Annotation[] = [{
      id: 'ann-1', type: 'rect', x: 0.1, y: 0.1, w: 0.2, h: 0.15,
      color: '#ff0000', strokeWidth: 4,
    }];

    let currentAnnotations = annotations;
    const wrappedSetAnnotations = vi.fn<React.Dispatch<React.SetStateAction<Annotation[]>>>().mockImplementation((updater: any) => {
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
        color: '#ff0000',
        strokeWidth: 4,
        arrowStyle: 'classic',
        onSaveHistory,
        customPrompt,
        containerRef,
      })
    );

    act(() => {
      result.current.setSelectedId('ann-1');
    });

    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Delete', bubbles: true }));
    });

    expect(onSaveHistory).toHaveBeenCalled();
    expect(result.current.selectedId).toBeNull();
  });

  it('calls deleteAnnotation and removes annotation', () => {
    const annotations: Annotation[] = [{
      id: 'ann-1', type: 'rect', x: 0.1, y: 0.1, w: 0.2, h: 0.15,
      color: '#ff0000', strokeWidth: 4,
    }];

    let currentAnnotations = [...annotations];
    const wrappedSetAnnotations = vi.fn<React.Dispatch<React.SetStateAction<Annotation[]>>>().mockImplementation((updater: any) => {
      if (typeof updater === 'function') {
        currentAnnotations = updater(currentAnnotations);
        return currentAnnotations;
      }
      currentAnnotations = updater;
      return updater;
    });

    const { result } = renderHook(() =>
      useAnnotationEvents({
        annotations,
        setAnnotations: wrappedSetAnnotations,
        activeTool: 'pointer',
        color: '#ff0000',
        strokeWidth: 4,
        arrowStyle: 'classic',
        onSaveHistory,
        customPrompt,
        containerRef,
      })
    );

    act(() => {
      result.current.setSelectedId('ann-1');
    });

    act(() => {
      result.current.deleteAnnotation({ stopPropagation: vi.fn() } as any, 'ann-1');
    });

    expect(result.current.selectedId).toBeNull();
    expect(onSaveHistory).toHaveBeenCalled();
    expect(currentAnnotations).toEqual([]);
  });

  it('starts drag on annotation', () => {
    const mockDiv = document.createElement('div');
    mockDiv.getBoundingClientRect = () => ({ left: 0, top: 0, width: 800, height: 600, right: 800, bottom: 600, x: 0, y: 0, toJSON: () => {} });
    containerRef.current = mockDiv;

    const annotations: Annotation[] = [{
      id: 'ann-1', type: 'rect', x: 0.2, y: 0.2, w: 0.3, h: 0.2,
      color: '#ff0000', strokeWidth: 4,
    }];

    const { result } = renderHook(() =>
      useAnnotationEvents({
        annotations,
        setAnnotations,
        activeTool: 'pointer',
        color: '#ff0000',
        strokeWidth: 4,
        arrowStyle: 'classic',
        onSaveHistory,
        customPrompt,
        containerRef,
      })
    );

    act(() => {
      result.current.startDrag(
        { stopPropagation: vi.fn(), clientX: 200, clientY: 150, pointerId: 1, detail: 1 } as any,
        annotations[0]
      );
    });

    expect(result.current.selectedId).toBe('ann-1');
  });

  it('starts resize on annotation handle', () => {
    const mockDiv = document.createElement('div');
    mockDiv.getBoundingClientRect = () => ({ left: 0, top: 0, width: 800, height: 600, right: 800, bottom: 600, x: 0, y: 0, toJSON: () => {} });
    containerRef.current = mockDiv;

    const annotations: Annotation[] = [{
      id: 'ann-1', type: 'rect', x: 0.2, y: 0.2, w: 0.3, h: 0.2,
      color: '#ff0000', strokeWidth: 4,
    }];

    const { result } = renderHook(() =>
      useAnnotationEvents({
        annotations,
        setAnnotations,
        activeTool: 'pointer',
        color: '#ff0000',
        strokeWidth: 4,
        arrowStyle: 'classic',
        onSaveHistory,
        customPrompt,
        containerRef,
      })
    );

    act(() => {
      result.current.startResize(
        { stopPropagation: vi.fn(), clientX: 400, clientY: 300, pointerId: 1 } as any,
        annotations[0],
        'br'
      );
    });

    expect(result.current.selectedId).toBe('ann-1');
  });

  it('handles double click on text annotation', () => {
    const annotations: Annotation[] = [{
      id: 'ann-1', type: 'text', x: 0.2, y: 0.2, w: 0.3, h: 0.1,
      color: '#ffffff', strokeWidth: 4, text: 'Hello',
    }];

    const { result } = renderHook(() =>
      useAnnotationEvents({
        annotations,
        setAnnotations,
        activeTool: 'pointer',
        color: '#ff0000',
        strokeWidth: 4,
        arrowStyle: 'classic',
        onSaveHistory,
        customPrompt,
        containerRef,
      })
    );

    act(() => {
      result.current.handleDoubleClick(
        { stopPropagation: vi.fn() } as any,
        annotations[0]
      );
    });

    expect(result.current.editingTextId).toBe('ann-1');
    expect(result.current.editingTextValue).toBe('Hello');
  });

  it('synchronizes selected annotation color with active color picker', () => {
    const annotations: Annotation[] = [{
      id: 'ann-1', type: 'rect', x: 0.2, y: 0.2, w: 0.3, h: 0.2,
      color: '#ff0000', strokeWidth: 4,
    }];

    let currentAnnotations = [...annotations];
    const wrappedSetAnnotations = vi.fn<React.Dispatch<React.SetStateAction<Annotation[]>>>().mockImplementation((updater: any) => {
      if (typeof updater === 'function') {
        currentAnnotations = updater(currentAnnotations);
        return currentAnnotations;
      }
      currentAnnotations = updater;
      return updater;
    });

    const setAnnotationColor = vi.fn<(color: string) => void>();

    const { result, rerender } = renderHook(
      ({ color }) =>
        useAnnotationEvents({
          annotations: currentAnnotations,
          setAnnotations: wrappedSetAnnotations,
          activeTool: 'pointer',
          color,
          setAnnotationColor,
          strokeWidth: 4,
          arrowStyle: 'classic',
          onSaveHistory,
          customPrompt,
          containerRef,
        }),
      {
        initialProps: { color: '#ff0000' },
      }
    );

    // Select the annotation
    act(() => {
      result.current.setSelectedId('ann-1');
    });

    // Change color to green
    rerender({ color: '#00ff00' });

    expect(wrappedSetAnnotations).toHaveBeenCalled();
    expect(currentAnnotations[0].color).toBe('#00ff00');
    expect(onSaveHistory).toHaveBeenCalled();
  });

  it('updates color picker to match selected annotation color', () => {
    const annotations: Annotation[] = [{
      id: 'ann-1', type: 'rect', x: 0.2, y: 0.2, w: 0.3, h: 0.2,
      color: '#0000ff', strokeWidth: 4,
    }];

    const setAnnotationColor = vi.fn<(color: string) => void>();

    const { result } = renderHook(() =>
      useAnnotationEvents({
        annotations,
        setAnnotations,
        activeTool: 'pointer',
        color: '#ffffff',
        setAnnotationColor,
        strokeWidth: 4,
        arrowStyle: 'classic',
        onSaveHistory,
        customPrompt,
        containerRef,
      })
    );

    act(() => {
      result.current.setSelectedId('ann-1');
    });

    expect(setAnnotationColor).toHaveBeenCalledWith('#0000ff');
  });

  it('syncs dimensions from container on re-render via useLayoutEffect', () => {
    // Create a real DOM element with a non-trivial size
    const div = document.createElement('div');
    // jsdom doesn't do layout, so offsetWidth/offsetHeight return 0 by default.
    // We mock them to simulate a container that has real dimensions.
    Object.defineProperty(div, 'offsetWidth', { value: 800, configurable: true, writable: true });
    Object.defineProperty(div, 'offsetHeight', { value: 600, configurable: true, writable: true });
    containerRef = { current: div };

    const { result, rerender } = renderHook(() =>
      useAnnotationEvents({
        annotations: [],
        setAnnotations,
        activeTool: 'pointer',
        color: '#ff0000',
        strokeWidth: 4,
        arrowStyle: 'classic',
        onSaveHistory,
        customPrompt,
        containerRef,
      })
    );

    // After initial render + layout effect, dimensions should reflect the container
    expect(result.current.dimensions).toEqual({ width: 800, height: 600 });

    // Simulate the container growing after an image loads.
    Object.defineProperty(div, 'offsetWidth', { value: 1024, configurable: true, writable: true });
    Object.defineProperty(div, 'offsetHeight', { value: 768, configurable: true, writable: true });

    // Re-render (e.g. parent re-renders after image load) — layout effect should sync
    rerender();

    expect(result.current.dimensions).toEqual({ width: 1024, height: 768 });
  });

  it('does not update dimensions when container size has not changed', () => {
    const div = document.createElement('div');
    Object.defineProperty(div, 'offsetWidth', { value: 500, configurable: true, writable: true });
    Object.defineProperty(div, 'offsetHeight', { value: 400, configurable: true, writable: true });
    containerRef = { current: div };

    const { result, rerender } = renderHook(() =>
      useAnnotationEvents({
        annotations: [],
        setAnnotations,
        activeTool: 'pointer',
        color: '#ff0000',
        strokeWidth: 4,
        arrowStyle: 'classic',
        onSaveHistory,
        customPrompt,
        containerRef,
      })
    );

    expect(result.current.dimensions).toEqual({ width: 500, height: 400 });

    // Re-render with no size change — dimensions should stay the same
    rerender();
    expect(result.current.dimensions).toEqual({ width: 500, height: 400 });
  });

  it('uses pre-transform dimensions (offsetWidth) not post-transform (getBoundingClientRect) for rendering', () => {
    // Simulate a CSS transform: scale(0.5) on the parent container.
    // getBoundingClientRect returns post-transform (scaled) dimensions,
    // but offsetWidth/offsetHeight return pre-transform (CSS layout) dimensions.
    // The SVG coordinate space uses pre-transform dimensions, so dimensions
    // state must use offsetWidth/offsetHeight to render annotations correctly.
    const div = document.createElement('div');
    // Pre-transform size: 800x600 (what the SVG coordinate space uses)
    Object.defineProperty(div, 'offsetWidth', { value: 800, configurable: true, writable: true });
    Object.defineProperty(div, 'offsetHeight', { value: 600, configurable: true, writable: true });
    // Post-transform size: 400x300 (what getBoundingClientRect returns after scale(0.5))
    div.getBoundingClientRect = () => ({
      width: 400, height: 300, top: 0, left: 0, right: 400, bottom: 300, x: 0, y: 0, toJSON: () => {}
    });
    containerRef = { current: div };

    const { result } = renderHook(() =>
      useAnnotationEvents({
        annotations: [],
        setAnnotations,
        activeTool: 'pointer',
        color: '#ff0000',
        strokeWidth: 4,
        arrowStyle: 'classic',
        onSaveHistory,
        customPrompt,
        containerRef,
      })
    );

    // dimensions should be the pre-transform size (800x600), NOT the post-transform (400x300)
    expect(result.current.dimensions).toEqual({ width: 800, height: 600 });
    expect(result.current.dimensions.width).not.toBe(400);
    expect(result.current.dimensions.height).not.toBe(300);
  });

  describe('copy / cut / paste', () => {
    beforeEach(() => {
      clearAnnotationClipboard();
    });

    const sampleAnn: Annotation = {
      id: 'ann-1',
      type: 'rect',
      x: 0.1,
      y: 0.2,
      w: 0.3,
      h: 0.25,
      color: '#ff0000',
      strokeWidth: 4,
    };

    function setup(annotations: Annotation[] = [sampleAnn]) {
      let currentAnnotations = [...annotations];
      const wrappedSetAnnotations = vi.fn<React.Dispatch<React.SetStateAction<Annotation[]>>>().mockImplementation((updater: any) => {
        if (typeof updater === 'function') {
          currentAnnotations = updater(currentAnnotations);
          return currentAnnotations;
        }
        currentAnnotations = updater;
        return updater;
      });

      const hook = renderHook(() =>
        useAnnotationEvents({
          annotations: currentAnnotations,
          setAnnotations: wrappedSetAnnotations,
          activeTool: 'pointer',
          color: '#ff0000',
          strokeWidth: 4,
          arrowStyle: 'classic',
          onSaveHistory,
          customPrompt,
          containerRef,
        })
      );

      return { ...hook, getAnnotations: () => currentAnnotations, wrappedSetAnnotations };
    }

    it('copyAnnotation stores a clone on the clipboard without mutating canvas', () => {
      const { result, getAnnotations } = setup();
      act(() => {
        result.current.setSelectedId('ann-1');
      });
      act(() => {
        result.current.copyAnnotation();
      });
      expect(result.current.canPasteAnnotation()).toBe(true);
      expect(getAnnotations()).toHaveLength(1);
      expect(onSaveHistory).not.toHaveBeenCalled();
    });

    it('cutAnnotation removes the selected annotation and saves history', () => {
      const { result, getAnnotations } = setup();
      act(() => {
        result.current.setSelectedId('ann-1');
      });
      act(() => {
        result.current.cutAnnotation();
      });
      expect(getAnnotations()).toEqual([]);
      expect(result.current.selectedId).toBeNull();
      expect(result.current.canPasteAnnotation()).toBe(true);
      expect(onSaveHistory).toHaveBeenCalledWith([]);
    });

    it('pasteAnnotation appends an offset clone with a new id and selects it', () => {
      const { result, getAnnotations } = setup();
      act(() => {
        result.current.setSelectedId('ann-1');
      });
      act(() => {
        result.current.copyAnnotation();
      });
      act(() => {
        result.current.pasteAnnotation();
      });
      const anns = getAnnotations();
      expect(anns).toHaveLength(2);
      expect(anns[1].id).not.toBe('ann-1');
      expect(anns[1].x).toBeCloseTo(0.12);
      expect(anns[1].y).toBeCloseTo(0.22);
      expect(result.current.selectedId).toBe(anns[1].id);
      expect(onSaveHistory).toHaveBeenCalled();
    });

    it('Ctrl/Cmd+C copies the selected annotation', () => {
      const { result } = setup();
      act(() => {
        result.current.setSelectedId('ann-1');
      });
      act(() => {
        window.dispatchEvent(
          new KeyboardEvent('keydown', { key: 'c', ctrlKey: true, bubbles: true })
        );
      });
      expect(result.current.canPasteAnnotation()).toBe(true);
    });

    it('Ctrl/Cmd+X cuts the selected annotation', () => {
      const { result, getAnnotations } = setup();
      act(() => {
        result.current.setSelectedId('ann-1');
      });
      act(() => {
        window.dispatchEvent(
          new KeyboardEvent('keydown', { key: 'x', ctrlKey: true, bubbles: true })
        );
      });
      expect(getAnnotations()).toEqual([]);
      expect(onSaveHistory).toHaveBeenCalled();
    });

    it('Ctrl/Cmd+V pastes when clipboard has content', () => {
      const { result, getAnnotations } = setup();
      act(() => {
        result.current.setSelectedId('ann-1');
      });
      act(() => {
        result.current.copyAnnotation();
      });
      act(() => {
        window.dispatchEvent(
          new KeyboardEvent('keydown', { key: 'v', ctrlKey: true, bubbles: true })
        );
      });
      expect(getAnnotations()).toHaveLength(2);
    });

    it('Ctrl/Cmd+V is a no-op when clipboard is empty', () => {
      const { getAnnotations } = setup();
      act(() => {
        window.dispatchEvent(
          new KeyboardEvent('keydown', { key: 'v', ctrlKey: true, bubbles: true })
        );
      });
      expect(getAnnotations()).toHaveLength(1);
      expect(onSaveHistory).not.toHaveBeenCalled();
    });

    it('ignores cut shortcut when event originates from a textarea', () => {
      const { result, getAnnotations } = setup();
      act(() => {
        result.current.setSelectedId('ann-1');
      });
      const textarea = document.createElement('textarea');
      document.body.appendChild(textarea);
      act(() => {
        // Event target is the textarea → handler must no-op
        textarea.dispatchEvent(
          new KeyboardEvent('keydown', { key: 'x', ctrlKey: true, bubbles: true })
        );
      });
      document.body.removeChild(textarea);
      expect(getAnnotations()).toHaveLength(1);
      expect(onSaveHistory).not.toHaveBeenCalled();
    });

    it('copyAnnotation accepts an explicit id (context menu)', () => {
      const second: Annotation = { ...sampleAnn, id: 'ann-2', x: 0.5 };
      const { result, getAnnotations } = setup([sampleAnn, second]);
      act(() => {
        result.current.copyAnnotation('ann-2');
      });
      expect(result.current.canPasteAnnotation()).toBe(true);
      act(() => {
        result.current.pasteAnnotation();
      });
      const anns = getAnnotations();
      expect(anns).toHaveLength(3);
      const pasted = anns[anns.length - 1];
      expect(pasted.id).not.toBe('ann-2');
      expect(pasted.x).toBeCloseTo(0.52);
    });
  });
});
