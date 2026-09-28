import { useState, useEffect, useLayoutEffect, useRef, useCallback, RefObject } from 'react';
import { Annotation, AnnotationTool } from '../canvasRenderer';
import { SnapGuide, snapDragPosition, snapResizeDimensions, snapDrawingDimensions } from '../utils/snapUtils';
import {
  ANNOTATION_PASTE_OFFSET,
  cloneAnnotation,
  getAnnotationClipboard,
  hasAnnotationClipboard,
  setAnnotationClipboard,
} from '../utils/annotationClipboardUtils';

interface UseAnnotationEventsProps {
  annotations: Annotation[];
  setAnnotations: React.Dispatch<React.SetStateAction<Annotation[]>>;
  activeTool: AnnotationTool;
  enabled?: boolean;
  blurStrength?: number;
  color: string;
  setAnnotationColor?: (color: string) => void;
  strokeWidth: number;
  arrowStyle?: 'classic' | 'dashed' | 'tapered' | 'curved';
  annotationFont?: string;
  setAnnotationFont?: (font: string) => void;
  annotationFontSize?: number;
  setAnnotationFontSize?: (size: number) => void;
  annotationBold?: boolean;
  setAnnotationBold?: (bold: boolean) => void;
  annotationItalic?: boolean;
  setAnnotationItalic?: (italic: boolean) => void;
  annotationOutlineEnabled?: boolean;
  setAnnotationOutlineEnabled?: (enabled: boolean) => void;
  annotationOutlineColor?: string;
  setAnnotationOutlineColor?: (color: string) => void;
  annotationOutlineWidth?: number;
  setAnnotationOutlineWidth?: (width: number) => void;
  annotationGradientEnabled?: boolean;
  setAnnotationGradientEnabled?: (enabled: boolean) => void;
  annotationGradientColor1?: string;
  setAnnotationGradientColor1?: (color: string) => void;
  annotationGradientColor2?: string;
  setAnnotationGradientColor2?: (color: string) => void;
  annotationGradientAngle?: number;
  setAnnotationGradientAngle?: (angle: number) => void;
  onSaveHistory: (newAnns?: Annotation[]) => void;
  customPrompt: (message: string, defaultValue?: string) => Promise<string | null>;
  containerRef: RefObject<HTMLDivElement | null>;
  onDimensionsChange?: (dims: { width: number; height: number }) => void;
}

function rotatePoint(x: number, y: number, cx: number, cy: number, angleDeg: number) {
  const rad = (-angleDeg * Math.PI) / 180;
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);
  const dx = x - cx;
  const dy = y - cy;
  return {
    x: cx + dx * cos - dy * sin,
    y: cy + dx * sin + dy * cos,
  };
}

export function useAnnotationEvents({
  annotations,
  setAnnotations,
  activeTool,
  enabled = true,
  blurStrength = 12,
  color,
  setAnnotationColor,
  strokeWidth,
  arrowStyle,
  annotationFont,
  setAnnotationFont,
  annotationFontSize,
  setAnnotationFontSize,
  annotationBold,
  setAnnotationBold,
  annotationItalic,
  setAnnotationItalic,
  annotationOutlineEnabled,
  setAnnotationOutlineEnabled,
  annotationOutlineColor,
  setAnnotationOutlineColor,
  annotationOutlineWidth,
  setAnnotationOutlineWidth,
  annotationGradientEnabled,
  setAnnotationGradientEnabled,
  annotationGradientColor1,
  setAnnotationGradientColor1,
  annotationGradientColor2,
  setAnnotationGradientColor2,
  annotationGradientAngle,
  setAnnotationGradientAngle,
  onSaveHistory,
  customPrompt,
  containerRef,
  onDimensionsChange,
}: UseAnnotationEventsProps) {
  const [dimensions, setDimensions] = useState({ width: 1, height: 1 });
  const [drawingAnnotation, setDrawingAnnotation] = useState<Annotation | null>(null);
  const [penPoints, setPenPoints] = useState<Array<{ x: number; y: number }>>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled) setSelectedId(null);
  }, [enabled]);
  const [editingTextId, setEditingTextId] = useState<string | null>(null);
  const [editingTextValue, setEditingTextValue] = useState<string>('');
  const lastClickTimeRef = useRef<number>(0);
  
  const [dragStart, setDragStart] = useState<{
    mouseX: number;
    mouseY: number;
    annX: number;
    annY: number;
    startX: number;
    startY: number;
    hasDragged: boolean;
  } | null>(null);
  const [activeGuides, setActiveGuides] = useState<SnapGuide[]>([]);
  const [resizeHandle, setResizeHandle] = useState<string | null>(null);
  const [resizeStart, setResizeStart] = useState<{
    mouseX: number;
    mouseY: number;
    x: number;
    y: number;
    w: number;
    h: number;
    rotation: number;
  } | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver(() => {
      // Use offsetWidth/offsetHeight (pre-transform CSS layout size) to match
      // the SVG coordinate space. getBoundingClientRect() returns post-transform
      // dimensions which differ from the SVG's coordinate system when the parent
      // has a CSS transform (e.g. zoom scale), causing annotation misplacement.
      const el = containerRef.current;
      if (!el) return;
      setDimensions({ width: el.offsetWidth || 1, height: el.offsetHeight || 1 });
    });
    observer.observe(containerRef.current);
    const el = containerRef.current;
    setDimensions({ width: el.offsetWidth || 1, height: el.offsetHeight || 1 });
    return () => observer.disconnect();
  }, [containerRef]);

  // Sync dimensions on every render so that size changes caused by parent
  // re-renders (e.g. image loading after a file change) are caught even if
  // the ResizeObserver timing misses the transition from 0×0 to real size.
  // Use offsetWidth/offsetHeight (pre-transform) to match SVG coordinate space.
  useLayoutEffect(() => {
    if (!containerRef.current) return;
    const el = containerRef.current;
    const w = el.offsetWidth || 1;
    const h = el.offsetHeight || 1;
    setDimensions(prev => {
      if (prev.width === w && prev.height === h) return prev;
      return { width: w, height: h };
    });
  });

  // Report the live annotation-layer dimensions up so the export pipeline can
  // scale strokeWidth/fontSize to match what the user sees on canvas.
  useEffect(() => {
    if (onDimensionsChange) onDimensionsChange(dimensions);
  }, [dimensions, onDimensionsChange]);

  const copyAnnotation = useCallback((id?: string | null) => {
    const targetId = id ?? selectedId;
    if (!targetId) return;
    const ann = annotations.find(a => a.id === targetId);
    if (!ann) return;
    // Store without offset so the first paste is a clean offset from the original.
    setAnnotationClipboard(cloneAnnotation(ann));
  }, [annotations, selectedId]);

  const cutAnnotation = useCallback((id?: string | null) => {
    const targetId = id ?? selectedId;
    if (!targetId) return;
    const ann = annotations.find(a => a.id === targetId);
    if (!ann) return;
    setAnnotationClipboard(cloneAnnotation(ann));
    const updated = annotations.filter(a => a.id !== targetId);
    setAnnotations(updated);
    if (selectedId === targetId) setSelectedId(null);
    onSaveHistory(updated);
  }, [annotations, selectedId, setAnnotations, onSaveHistory]);

  const pasteAnnotation = useCallback(() => {
    const source = getAnnotationClipboard();
    if (!source) return;
    const pasted = cloneAnnotation(source, { offset: ANNOTATION_PASTE_OFFSET });
    // Cascade: next paste offsets from this pasted clone.
    setAnnotationClipboard(pasted);
    const updated = [...annotations, pasted];
    setAnnotations(updated);
    setSelectedId(pasted.id);
    onSaveHistory(updated);
  }, [annotations, setAnnotations, onSaveHistory]);

  useEffect(() => {
    if (!enabled) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) {
        return;
      }
      const mod = e.ctrlKey || e.metaKey;
      // Require plain mod+key (no Shift/Alt) so we don't steal Ctrl+Shift+C (Code Studio), etc.
      if (mod && !e.shiftKey && !e.altKey && e.key.toLowerCase() === 'c') {
        if (selectedId) {
          e.preventDefault();
          copyAnnotation(selectedId);
        }
        return;
      }
      if (mod && !e.shiftKey && !e.altKey && e.key.toLowerCase() === 'x') {
        if (selectedId) {
          e.preventDefault();
          cutAnnotation(selectedId);
        }
        return;
      }
      if (mod && !e.shiftKey && !e.altKey && e.key.toLowerCase() === 'v') {
        if (hasAnnotationClipboard()) {
          e.preventDefault();
          pasteAnnotation();
        }
        return;
      }
      if (selectedId && (e.key === 'Delete' || e.key === 'Backspace')) {
        const updated = annotations.filter(ann => ann.id !== selectedId);
        setAnnotations(updated);
        setSelectedId(null);
        onSaveHistory(updated);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [enabled, selectedId, annotations, setAnnotations, onSaveHistory, copyAnnotation, cutAnnotation, pasteAnnotation]);

  useEffect(() => {
    if (selectedId && arrowStyle) {
      setAnnotations(prev =>
        prev.map(ann => {
          if (ann.id === selectedId && ann.type === 'arrow' && ann.arrowStyle !== arrowStyle) {
            return { ...ann, arrowStyle };
          }
          return ann;
        })
      );
    }
  }, [arrowStyle, selectedId, setAnnotations]);

  // Synchronize selected annotation's color with active color picker
  useEffect(() => {
    if (!selectedId) return;
    const selectedAnn = annotations.find(a => a.id === selectedId);
    if (!selectedAnn) return;

    if (color && selectedAnn.color !== color) {
      const updated = annotations.map(a =>
        a.id === selectedId ? { ...a, color } : a
      );
      setAnnotations(updated);
      onSaveHistory(updated);
    }
  }, [color, selectedId]);

  // Update active color picker state to match selected annotation's color
  useEffect(() => {
    if (!selectedId || !setAnnotationColor) return;
    const selectedAnn = annotations.find(a => a.id === selectedId);
    if (selectedAnn && selectedAnn.color !== color) {
      setAnnotationColor(selectedAnn.color);
    }
  }, [selectedId, setAnnotationColor]);

  // Synchronize selected annotation's font properties with active selectors
  useEffect(() => {
    if (!selectedId) return;
    const selectedAnn = annotations.find(a => a.id === selectedId);
    if (!selectedAnn || selectedAnn.type !== 'text') return;

    let changed = false;
    const updatedAnn = { ...selectedAnn };

    if (annotationFont && selectedAnn.fontFamily !== annotationFont) {
      updatedAnn.fontFamily = annotationFont;
      changed = true;
    }
    if (annotationFontSize !== undefined && selectedAnn.fontSize !== annotationFontSize) {
      updatedAnn.fontSize = annotationFontSize;
      changed = true;
    }
    if (annotationBold !== undefined && selectedAnn.fontBold !== annotationBold) {
      updatedAnn.fontBold = annotationBold;
      changed = true;
    }
    if (annotationItalic !== undefined && selectedAnn.fontItalic !== annotationItalic) {
      updatedAnn.fontItalic = annotationItalic;
      changed = true;
    }
    if (annotationOutlineEnabled !== undefined && selectedAnn.outlineEnabled !== annotationOutlineEnabled) {
      updatedAnn.outlineEnabled = annotationOutlineEnabled;
      changed = true;
    }
    if (annotationOutlineColor !== undefined && selectedAnn.outlineColor !== annotationOutlineColor) {
      updatedAnn.outlineColor = annotationOutlineColor;
      changed = true;
    }
    if (annotationOutlineWidth !== undefined && selectedAnn.outlineWidth !== annotationOutlineWidth) {
      updatedAnn.outlineWidth = annotationOutlineWidth;
      changed = true;
    }
    if (annotationGradientEnabled !== undefined && selectedAnn.gradientEnabled !== annotationGradientEnabled) {
      updatedAnn.gradientEnabled = annotationGradientEnabled;
      changed = true;
    }
    if (annotationGradientColor1 !== undefined && selectedAnn.gradientColor1 !== annotationGradientColor1) {
      updatedAnn.gradientColor1 = annotationGradientColor1;
      changed = true;
    }
    if (annotationGradientColor2 !== undefined && selectedAnn.gradientColor2 !== annotationGradientColor2) {
      updatedAnn.gradientColor2 = annotationGradientColor2;
      changed = true;
    }
    if (annotationGradientAngle !== undefined && selectedAnn.gradientAngle !== annotationGradientAngle) {
      updatedAnn.gradientAngle = annotationGradientAngle;
      changed = true;
    }

    if (changed) {
      const updated = annotations.map(a => (a.id === selectedId ? updatedAnn : a));
      setAnnotations(updated);
      onSaveHistory(updated);
    }
  }, [annotationFont, annotationFontSize, annotationBold, annotationItalic, annotationOutlineEnabled, annotationOutlineColor, annotationOutlineWidth, annotationGradientEnabled, annotationGradientColor1, annotationGradientColor2, annotationGradientAngle, selectedId]);

  // Update active selectors state to match selected annotation's font properties
  useEffect(() => {
    if (!selectedId) return;
    const selectedAnn = annotations.find(a => a.id === selectedId);
    if (!selectedAnn || selectedAnn.type !== 'text') return;

    if (selectedAnn.fontFamily && selectedAnn.fontFamily !== annotationFont && setAnnotationFont) {
      setAnnotationFont(selectedAnn.fontFamily);
    }
    if (selectedAnn.fontSize !== undefined && selectedAnn.fontSize !== annotationFontSize && setAnnotationFontSize) {
      setAnnotationFontSize(selectedAnn.fontSize);
    }
    if (selectedAnn.fontBold !== undefined && selectedAnn.fontBold !== annotationBold && setAnnotationBold) {
      setAnnotationBold(selectedAnn.fontBold);
    }
    if (selectedAnn.fontItalic !== undefined && selectedAnn.fontItalic !== annotationItalic && setAnnotationItalic) {
      setAnnotationItalic(selectedAnn.fontItalic);
    }
    if (selectedAnn.outlineEnabled !== undefined && selectedAnn.outlineEnabled !== annotationOutlineEnabled && setAnnotationOutlineEnabled) {
      setAnnotationOutlineEnabled(selectedAnn.outlineEnabled);
    }
    if (selectedAnn.outlineColor !== undefined && selectedAnn.outlineColor !== annotationOutlineColor && setAnnotationOutlineColor) {
      setAnnotationOutlineColor(selectedAnn.outlineColor);
    }
    if (selectedAnn.outlineWidth !== undefined && selectedAnn.outlineWidth !== annotationOutlineWidth && setAnnotationOutlineWidth) {
      setAnnotationOutlineWidth(selectedAnn.outlineWidth);
    }
    if (selectedAnn.gradientEnabled !== undefined && selectedAnn.gradientEnabled !== annotationGradientEnabled && setAnnotationGradientEnabled) {
      setAnnotationGradientEnabled(selectedAnn.gradientEnabled);
    }
    if (selectedAnn.gradientColor1 !== undefined && selectedAnn.gradientColor1 !== annotationGradientColor1 && setAnnotationGradientColor1) {
      setAnnotationGradientColor1(selectedAnn.gradientColor1);
    }
    if (selectedAnn.gradientColor2 !== undefined && selectedAnn.gradientColor2 !== annotationGradientColor2 && setAnnotationGradientColor2) {
      setAnnotationGradientColor2(selectedAnn.gradientColor2);
    }
    if (selectedAnn.gradientAngle !== undefined && selectedAnn.gradientAngle !== annotationGradientAngle && setAnnotationGradientAngle) {
      setAnnotationGradientAngle(selectedAnn.gradientAngle);
    }
  }, [selectedId, setAnnotationFont, setAnnotationFontSize, setAnnotationBold, setAnnotationItalic, setAnnotationOutlineEnabled, setAnnotationOutlineColor, setAnnotationOutlineWidth, setAnnotationGradientEnabled, setAnnotationGradientColor1, setAnnotationGradientColor2, setAnnotationGradientAngle]);

  const handleFreehandDraw = (mouseX: number, mouseY: number, startX: number, startY: number) => {
    const newPoints = [...penPoints, { x: mouseX, y: mouseY }];
    setPenPoints(newPoints);
    setDrawingAnnotation(prev => {
      if (!prev) return null;
      return {
        ...prev,
        points: newPoints.map(p => ({ x: p.x - startX, y: p.y - startY })),
      };
    });
  };

  const handleShapeDraw = (mouseX: number, mouseY: number) => {
    if (!drawingAnnotation) return;
    const rawW = mouseX - drawingAnnotation.x;
    const rawH = mouseY - drawingAnnotation.y;

    const { w: snappedW, h: snappedH, guides } = snapDrawingDimensions(
      drawingAnnotation.x, drawingAnnotation.y,
      rawW, rawH,
      annotations,
      dimensions,
    );

    setActiveGuides(guides);
    setDrawingAnnotation({ ...drawingAnnotation, w: snappedW, h: snappedH });
  };

  const handleDragMove = (mouseX: number, mouseY: number) => {
    if (!dragStart || !selectedId) return;
    const deltaX = mouseX - dragStart.mouseX;
    const deltaY = mouseY - dragStart.mouseY;
    const rawX = dragStart.annX + deltaX;
    const rawY = dragStart.annY + deltaY;

    const targetAnn = annotations.find(a => a.id === selectedId);
    if (!targetAnn) return;

    const { x: snappedX, y: snappedY, guides } = snapDragPosition(
      rawX, rawY, targetAnn.w, targetAnn.h,
      annotations.filter(a => a.id !== selectedId),
      dimensions,
    );

    setActiveGuides(guides);
    setAnnotations(prev =>
      prev.map(ann =>
        ann.id === selectedId ? { ...ann, x: snappedX, y: snappedY } : ann,
      ),
    );
  };

  const handleRotateMove = (mouseY: number, mouseX: number, cx: number, cy: number) => {
    const rad = Math.atan2(mouseY - cy, mouseX - cx);
    let deg = rad * (180 / Math.PI) + 90;
    if (deg < 0) deg += 360;
    setAnnotations(prev =>
      prev.map(a => (a.id === selectedId ? { ...a, rotation: Math.round(deg) } : a))
    );
  };

  const handleResizeMove = (mouseX: number, mouseY: number, cx: number, cy: number) => {
    if (!resizeStart || !selectedId || !resizeHandle) return;
    if (resizeHandle === 'rot') {
      handleRotateMove(mouseY, mouseX, cx, cy);
      return;
    }

    const unrotated = rotatePoint(mouseX, mouseY, cx, cy, resizeStart.rotation);

    let proposedX = resizeStart.x;
    let proposedY = resizeStart.y;
    let proposedW = resizeStart.w;
    let proposedH = resizeStart.h;

    if (resizeHandle.includes('r')) proposedW = unrotated.x - resizeStart.x;
    if (resizeHandle.includes('l')) {
      const right = resizeStart.x + resizeStart.w;
      proposedX = unrotated.x;
      proposedW = right - proposedX;
    }
    if (resizeHandle.includes('b')) proposedH = unrotated.y - resizeStart.y;
    if (resizeHandle.includes('t')) {
      const bottom = resizeStart.y + resizeStart.h;
      proposedY = unrotated.y;
      proposedH = bottom - proposedY;
    }

    const { x: snappedX, y: snappedY, w: snappedW, h: snappedH, guides } = snapResizeDimensions(
      resizeStart.x, resizeStart.y, resizeStart.w, resizeStart.h,
      proposedX, proposedY, proposedW, proposedH,
      resizeHandle,
      annotations.filter(a => a.id !== selectedId),
      dimensions,
    );

    setActiveGuides(guides);
    setAnnotations(prev =>
      prev.map(a =>
        a.id === selectedId
          ? { ...a, x: snappedX, y: snappedY, w: snappedW, h: snappedH }
          : a,
      ),
    );

    setResizeStart(prev =>
      prev ? { ...prev, x: snappedX, y: snappedY, w: snappedW, h: snappedH } : prev,
    );
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!enabled || !containerRef.current || editingTextId) return;
    const rect = containerRef.current.getBoundingClientRect();
    const w = rect.width || 1;
    const h = rect.height || 1;
    const mouseX = (e.clientX - rect.left) / w;
    const mouseY = (e.clientY - rect.top) / h;
    if (activeTool === 'pointer') {
      if (e.target === e.currentTarget) setSelectedId(null);
      return;
    }
    const newAnn: Annotation = {
      id: `ann-${Date.now()}`,
      type: activeTool,
      x: mouseX,
      y: mouseY,
      w: 0,
      h: 0,
      color,
      strokeWidth,
      blurStrength: activeTool === 'blur' ? blurStrength : undefined,
      rotation: 0,
      points: activeTool === 'pen' ? [{ x: 0, y: 0 }] : undefined,
      arrowStyle: activeTool === 'arrow' ? arrowStyle : undefined,
      fontFamily: activeTool === 'text' ? (annotationFont || 'sans-serif') : undefined,
      fontSize: activeTool === 'text' ? (annotationFontSize || 24) : undefined,
      fontBold: activeTool === 'text' ? (annotationBold ?? true) : undefined,
      fontItalic: activeTool === 'text' ? (annotationItalic ?? false) : undefined,
      outlineEnabled: activeTool === 'text' ? (annotationOutlineEnabled ?? false) : undefined,
      outlineColor: activeTool === 'text' ? (annotationOutlineColor || '#000000') : undefined,
      outlineWidth: activeTool === 'text' ? (annotationOutlineWidth ?? 3) : undefined,
      gradientEnabled: activeTool === 'text' ? (annotationGradientEnabled ?? false) : undefined,
      gradientColor1: activeTool === 'text' ? (annotationGradientColor1 || '#ff0080') : undefined,
      gradientColor2: activeTool === 'text' ? (annotationGradientColor2 || '#7928ca') : undefined,
      gradientAngle: activeTool === 'text' ? (annotationGradientAngle ?? 135) : undefined,
    };
    if (activeTool === 'pen') setPenPoints([{ x: mouseX, y: mouseY }]);
    setDrawingAnnotation(newAnn);
    try { containerRef.current.setPointerCapture(e.pointerId); } catch (err) {}
  };

  const processDragMove = (e: React.PointerEvent, mouseX: number, mouseY: number) => {
    if (!dragStart || !selectedId) return;
    const dist = Math.hypot(e.clientX - dragStart.startX, e.clientY - dragStart.startY);
    if (!dragStart.hasDragged && dist < 5) return;
    if (!dragStart.hasDragged) {
      try { containerRef.current?.setPointerCapture(e.pointerId); } catch (err) {}
      setDragStart(prev => prev ? { ...prev, hasDragged: true } : null);
    }
    handleDragMove(mouseX, mouseY);
  };

  const processResizeMove = (e: React.PointerEvent, mouseX: number, mouseY: number) => {
    if (!resizeStart || !selectedId || !resizeHandle) return;
    try { containerRef.current?.setPointerCapture(e.pointerId); } catch (err) {}
    const cx = resizeStart.x + resizeStart.w / 2;
    const cy = resizeStart.y + resizeStart.h / 2;
    handleResizeMove(mouseX, mouseY, cx, cy);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!enabled || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const w = rect.width || 1;
    const h = rect.height || 1;
    const mouseX = (e.clientX - rect.left) / w;
    const mouseY = (e.clientY - rect.top) / h;
    if (drawingAnnotation) {
      if (activeTool === 'pen') {
        handleFreehandDraw(mouseX, mouseY, drawingAnnotation.x, drawingAnnotation.y);
      } else {
        handleShapeDraw(mouseX, mouseY);
      }
      return;
    }
    if (dragStart && selectedId && !resizeHandle) {
      processDragMove(e, mouseX, mouseY);
      return;
    }
    if (resizeStart && selectedId && resizeHandle) {
      processResizeMove(e, mouseX, mouseY);
    }
  };

  const savePenDrawing = (drawingAnn: Annotation) => {
    if (penPoints.length <= 1) return;
    const xs = penPoints.map(p => p.x);
    const ys = penPoints.map(p => p.y);
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);
    const w = Math.max(0.001, maxX - minX);
    const h = Math.max(0.001, maxY - minY);
    const finalPoints = penPoints.map(p => ({
      x: (p.x - minX) / w,
      y: (p.y - minY) / h,
    }));
    const newAnn = {
      ...drawingAnn,
      x: minX,
      y: minY,
      w,
      h,
      points: finalPoints,
    };
    const updated = [...annotations, newAnn];
    setAnnotations(updated);
    onSaveHistory(updated);
  };

  const saveTextDrawing = (drawingAnn: Annotation) => {
    let w = Math.abs(drawingAnn.w);
    let h = Math.abs(drawingAnn.h);
    if (w < 0.02) w = 0.16;
    if (h < 0.02) h = 0.04;
    const finalAnn: Annotation = {
      ...drawingAnn,
      text: '',
      x: drawingAnn.w >= 0 ? drawingAnn.x : drawingAnn.x - w,
      y: drawingAnn.h >= 0 ? drawingAnn.y : drawingAnn.y - h,
      w,
      h,
    };
    setAnnotations(prev => [...prev, finalAnn]);
    setEditingTextId(finalAnn.id);
    setEditingTextValue('');
  };

  const saveEmojiDrawing = async (drawingAnn: Annotation) => {
    const emojiVal = await customPrompt('Enter an emoji (e.g. 😊, 👍, 🔥, ❌):', '😊');
    if (emojiVal && emojiVal.trim()) {
      const w = 0.06;
      const h = 0.06;
      const newAnn = {
        ...drawingAnn,
        text: emojiVal.trim(),
        x: drawingAnn.x - w / 2,
        y: drawingAnn.y - h / 2,
        w,
        h,
      };
      const updated = [...annotations, newAnn];
      setAnnotations(updated);
      onSaveHistory(updated);
    }
  };

  const saveShapeDrawing = (drawingAnn: Annotation) => {
    const width = Math.abs(drawingAnn.w);
    const height = Math.abs(drawingAnn.h);
    if (width > 0.005 || height > 0.005) {
      let finalAnn = { ...drawingAnn };
      if (!activeTool.includes('line') && !activeTool.includes('arrow')) {
        finalAnn = {
          ...drawingAnn,
          x: drawingAnn.w < 0 ? drawingAnn.x + drawingAnn.w : drawingAnn.x,
          y: drawingAnn.h < 0 ? drawingAnn.y + drawingAnn.h : drawingAnn.y,
          w: Math.abs(drawingAnn.w),
          h: Math.abs(drawingAnn.h),
        };
      }
      const updated = [...annotations, finalAnn];
      setAnnotations(updated);
      onSaveHistory(updated);
    }
  };

  const handlePointerUp = async (e: React.PointerEvent<HTMLDivElement>) => {
    if (!enabled) return;
    setActiveGuides([]);
    if (drawingAnnotation) {
      try { containerRef.current?.releasePointerCapture(e.pointerId); } catch (err) {}
      if (activeTool === 'pen') {
        savePenDrawing(drawingAnnotation);
      } else if (activeTool === 'text') {
        saveTextDrawing(drawingAnnotation);
      } else if (activeTool === 'emoji') {
        await saveEmojiDrawing(drawingAnnotation);
      } else {
        saveShapeDrawing(drawingAnnotation);
      }
      setDrawingAnnotation(null);
      setPenPoints([]);
    }
    if (dragStart) {
      try { containerRef.current?.releasePointerCapture(e.pointerId); } catch (err) {}
      setDragStart(null);
      onSaveHistory(annotations);
    }
    if (resizeStart) {
      try { containerRef.current?.releasePointerCapture(e.pointerId); } catch (err) {}
      setResizeStart(null);
      setResizeHandle(null);
      onSaveHistory(annotations);
    }
  };

  const handleDoubleOrTripleClick = (e: React.PointerEvent, ann: Annotation) => {
    if (ann.type === 'text') {
      try { containerRef.current?.releasePointerCapture(e.pointerId); } catch (err) {}
      setEditingTextId(ann.id);
      setEditingTextValue(ann.text || '');
      setDragStart(null);
      lastClickTimeRef.current = 0;
    } else if (ann.type === 'emoji') {
      try { containerRef.current?.releasePointerCapture(e.pointerId); } catch (err) {}
      setDragStart(null);
      lastClickTimeRef.current = 0;
      (async () => {
        const val = await customPrompt('Edit emoji:', ann.text);
        if (val !== null) {
          const updated = annotations.map(a => (a.id === ann.id ? { ...a, text: val.trim() } : a));
          setAnnotations(updated);
          onSaveHistory(updated);
        }
      })();
    }
  };

  const startDrag = (e: React.PointerEvent, ann: Annotation) => {
    if (activeTool !== 'pointer') return;
    e.stopPropagation();
    setSelectedId(ann.id);
    if (!containerRef.current) return;
    const now = Date.now();
    if (e.detail === 2 || (lastClickTimeRef.current > 0 && now - lastClickTimeRef.current < 300)) {
      handleDoubleOrTripleClick(e, ann);
      return;
    }
    lastClickTimeRef.current = now;
    const rect = containerRef.current.getBoundingClientRect();
    const w = rect.width || 1;
    const h = rect.height || 1;
    const mouseX = (e.clientX - rect.left) / w;
    const mouseY = (e.clientY - rect.top) / h;
    setDragStart({
      mouseX,
      mouseY,
      annX: ann.x,
      annY: ann.y,
      startX: e.clientX,
      startY: e.clientY,
      hasDragged: false,
    });
  };

  const startResize = (e: React.PointerEvent, ann: Annotation, handle: string) => {
    e.stopPropagation();
    setSelectedId(ann.id);
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const w = rect.width || 1;
    const h = rect.height || 1;
    const mouseX = (e.clientX - rect.left) / w;
    const mouseY = (e.clientY - rect.top) / h;
    setResizeHandle(handle);
    setResizeStart({
      mouseX,
      mouseY,
      x: ann.x,
      y: ann.y,
      w: ann.w,
      h: ann.h,
      rotation: ann.rotation || 0,
    });
    try { containerRef.current.setPointerCapture(e.pointerId); } catch (err) {}
  };

  const handleDoubleClick = async (e: React.MouseEvent, ann: Annotation) => {
    if (activeTool !== 'pointer') return;
    e.stopPropagation();
    if (ann.type === 'text') {
      setEditingTextId(ann.id);
      setEditingTextValue(ann.text || '');
    } else if (ann.type === 'emoji') {
      const val = await customPrompt('Edit emoji:', ann.text);
      if (val !== null) {
        const updated = annotations.map(a => (a.id === ann.id ? { ...a, text: val.trim() } : a));
        setAnnotations(updated);
        onSaveHistory(updated);
      }
    }
  };

  const deleteAnnotation = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const updated = annotations.filter(ann => ann.id !== id);
    setAnnotations(updated);
    if (selectedId === id) setSelectedId(null);
    onSaveHistory(updated);
  };

  return {
    dimensions,
    setDimensions,
    drawingAnnotation,
    penPoints,
    selectedId,
    setSelectedId,
    editingTextId,
    setEditingTextId,
    editingTextValue,
    setEditingTextValue,
    activeGuides,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
    startDrag,
    startResize,
    handleDoubleClick,
    deleteAnnotation,
    copyAnnotation,
    cutAnnotation,
    pasteAnnotation,
    canPasteAnnotation: hasAnnotationClipboard,
  };
}
