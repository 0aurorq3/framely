export type WatermarkPosition =
  | 'left'
  | 'middle'
  | 'right'
  | 'top left'
  | 'top middle'
  | 'top right';

export const WATERMARK_POSITIONS: WatermarkPosition[] = [
  'left',
  'middle',
  'right',
  'top left',
  'top middle',
  'top right',
];

/** Distance from canvas/card edge to watermark — keeps text in the padding band near the outer edge. */
export function getWatermarkInset(padding: number, fontSize: number): number {
  return Math.round(Math.max(padding * 0.15, fontSize * 0.5));
}

export interface WatermarkCssPlacement {
  top?: string;
  bottom?: string;
  left?: string;
  right?: string;
  transform: string;
  textAlign: 'left' | 'center' | 'right';
}

/** Maps each watermark position to card-edge insets for preview CSS. */
export function getWatermarkCssPlacement(
  position: WatermarkPosition | string | undefined,
  insetPx: number
): WatermarkCssPlacement {
  const pos = (position || 'middle') as WatermarkPosition;
  const inset = `${insetPx}px`;
  const isTop = pos.startsWith('top');
  const vertical: Pick<WatermarkCssPlacement, 'top' | 'bottom'> = isTop
    ? { top: inset, bottom: 'auto' }
    : { bottom: inset, top: 'auto' };

  if (pos === 'left' || pos === 'top left') {
    return {
      ...vertical,
      left: inset,
      right: 'auto',
      transform: 'none',
      textAlign: 'left',
    };
  }

  if (pos === 'right' || pos === 'top right') {
    return {
      ...vertical,
      left: 'auto',
      right: inset,
      transform: 'none',
      textAlign: 'right',
    };
  }

  return {
    ...vertical,
    left: '50%',
    right: 'auto',
    transform: 'translateX(-50%)',
    textAlign: 'center',
  };
}

export interface WatermarkCanvasPlacement {
  x: number;
  y: number;
  textAlign: CanvasTextAlign;
  textBaseline: CanvasTextBaseline;
}

/** Maps each watermark position to canvas coordinates for export parity. */
export function getWatermarkCanvasPlacement(
  width: number,
  height: number,
  position: WatermarkPosition | string | undefined,
  inset: number
): WatermarkCanvasPlacement {
  const pos = (position || 'middle') as WatermarkPosition;
  const isTop = pos.startsWith('top');

  let x = width / 2;
  let textAlign: CanvasTextAlign = 'center';

  if (pos === 'left' || pos === 'top left') {
    x = inset;
    textAlign = 'left';
  } else if (pos === 'right' || pos === 'top right') {
    x = width - inset;
    textAlign = 'right';
  }

  return {
    x,
    y: isTop ? inset : height - inset,
    textAlign,
    textBaseline: isTop ? 'top' : 'bottom',
  };
}