import React from 'react';
import { getWatermarkCssPlacement, getWatermarkInset } from '../../shared/watermark';

interface CanvasWatermarkProps {
  watermarkEnabled: boolean;
  watermarkText: string;
  watermarkSize?: number;
  watermarkPosition?: string;
  watermarkOpacity?: number;
  padding: number;
  watermarkFont?: string;
  watermarkBold?: boolean;
  watermarkItalic?: boolean;
}

export default function CanvasWatermark({
  watermarkEnabled,
  watermarkText,
  watermarkSize,
  watermarkPosition,
  watermarkOpacity,
  padding,
  watermarkFont,
  watermarkBold,
  watermarkItalic,
}: CanvasWatermarkProps) {
  if (!watermarkEnabled || !watermarkText) return null;

  const opacity = watermarkOpacity !== undefined ? watermarkOpacity : 0.45;
  const fontSizeNum = watermarkSize || 20;
  const fontSize = `${fontSizeNum}px`;
  const placement = getWatermarkCssPlacement(
    watermarkPosition,
    getWatermarkInset(padding, fontSizeNum)
  );

  const styles: React.CSSProperties = {
    position: 'absolute',
    opacity,
    fontSize,
    fontFamily: watermarkFont || 'var(--font-sans)',
    fontWeight: watermarkBold ? 'bold' : '500',
    fontStyle: watermarkItalic ? 'italic' : 'normal',
    pointerEvents: 'none',
    whiteSpace: 'nowrap',
    zIndex: 2,
    top: placement.top,
    bottom: placement.bottom,
    left: placement.left,
    right: placement.right,
    transform: placement.transform,
    textAlign: placement.textAlign,
  };

  return (
    <div className="preview-watermark" style={styles}>
      {watermarkText}
    </div>
  );
}