import React from 'react';
import { Annotation } from '../../canvasRenderer';

interface SelectionBoxProps {
  ann: Annotation;
  rectW: number;
  rectH: number;
  startResize: (e: React.PointerEvent, ann: Annotation, handle: string) => void;
}

export default function SelectionBox({
  ann,
  rectW,
  rectH,
  startResize,
}: SelectionBoxProps) {
  return (
    <>
      <rect
        x={-rectW / 2 - 8}
        y={-rectH / 2 - 8}
        width={rectW + 16}
        height={rectH + 16}
        stroke="var(--color-primary)"
        strokeWidth="2"
        strokeDasharray="4 4"
        fill="none"
      />

      {/* Resize handles */}
      {/* Top-Left */}
      <rect
        x={-rectW / 2 - 14}
        y={-rectH / 2 - 14}
        width="12"
        height="12"
        fill="white"
        stroke="var(--color-primary)"
        strokeWidth="2"
        style={{ cursor: 'nwse-resize' }}
        onPointerDown={(e) => startResize(e, ann, 'tl')}
      />
      {/* Top-Center */}
      <rect
        x={-6}
        y={-rectH / 2 - 14}
        width="12"
        height="12"
        fill="white"
        stroke="var(--color-primary)"
        strokeWidth="2"
        style={{ cursor: 'ns-resize' }}
        onPointerDown={(e) => startResize(e, ann, 'tc')}
      />
      {/* Top-Right */}
      <rect
        x={rectW / 2 + 2}
        y={-rectH / 2 - 14}
        width="12"
        height="12"
        fill="white"
        stroke="var(--color-primary)"
        strokeWidth="2"
        style={{ cursor: 'nesw-resize' }}
        onPointerDown={(e) => startResize(e, ann, 'tr')}
      />
      {/* Middle-Left */}
      <rect
        x={-rectW / 2 - 14}
        y={-6}
        width="12"
        height="12"
        fill="white"
        stroke="var(--color-primary)"
        strokeWidth="2"
        style={{ cursor: 'ew-resize' }}
        onPointerDown={(e) => startResize(e, ann, 'ml')}
      />
      {/* Middle-Right */}
      <rect
        x={rectW / 2 + 2}
        y={-6}
        width="12"
        height="12"
        fill="white"
        stroke="var(--color-primary)"
        strokeWidth="2"
        style={{ cursor: 'ew-resize' }}
        onPointerDown={(e) => startResize(e, ann, 'mr')}
      />
      {/* Bottom-Left */}
      <rect
        x={-rectW / 2 - 14}
        y={rectH / 2 + 2}
        width="12"
        height="12"
        fill="white"
        stroke="var(--color-primary)"
        strokeWidth="2"
        style={{ cursor: 'nesw-resize' }}
        onPointerDown={(e) => startResize(e, ann, 'bl')}
      />
      {/* Bottom-Center */}
      <rect
        x={-6}
        y={rectH / 2 + 2}
        width="12"
        height="12"
        fill="white"
        stroke="var(--color-primary)"
        strokeWidth="2"
        style={{ cursor: 'ns-resize' }}
        onPointerDown={(e) => startResize(e, ann, 'bc')}
      />
      {/* Bottom-Right */}
      <rect
        x={rectW / 2 + 2}
        y={rectH / 2 + 2}
        width="12"
        height="12"
        fill="white"
        stroke="var(--color-primary)"
        strokeWidth="2"
        style={{ cursor: 'nwse-resize' }}
        onPointerDown={(e) => startResize(e, ann, 'br')}
      />

      {/* Blur regions stay axis-aligned so their mask matches the exported image. */}
      {ann.type !== 'blur' && (
        <>
          {/* Rotation stem & handle */}
          <line
            x1={0}
            y1={-rectH / 2 - 14}
            x2={0}
            y2={-rectH / 2 - 40}
            stroke="var(--color-primary)"
            strokeWidth="2"
          />
          <circle
            cx={0}
            cy={-rectH / 2 - 46}
            r="7"
            fill="white"
            stroke="var(--color-primary)"
            strokeWidth="2"
            style={{ cursor: 'grab' }}
            onPointerDown={(e) => startResize(e, ann, 'rot')}
          />
        </>
      )}
    </>
  );
}
