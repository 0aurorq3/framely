import { Annotation } from './canvasRenderer';

export type ArrowStyle = 'classic' | 'dashed' | 'tapered' | 'curved';

interface CurvedArrowInfo {
  x0: number;
  y0: number;
  x_h: number;
  y_h: number;
  cx: number;
  cy: number;
  arrow1X: number;
  arrow1Y: number;
  arrow2X: number;
  arrow2Y: number;
  x1: number;
  y1: number;
}

export function getCurvedArrowPoints(
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  strokeW: number
): CurvedArrowInfo | null {
  const dx = x1 - x0;
  const dy = y1 - y0;
  const L = Math.sqrt(dx * dx + dy * dy);
  
  if (L < 1) return null;

  const midX = (x0 + x1) / 2;
  const midY = (y0 + y1) / 2;
  const nx = -dy / L;
  const ny = dx / L;

  // Control point for quadratic curve
  const offset = L * 0.12;
  const cx = midX + nx * offset;
  const cy = midY + ny * offset;

  const headLen = Math.max(18, strokeW * 5);
  const hLen = Math.min(headLen, L * 0.55);
  const angle = Math.atan2(y1 - cy, x1 - cx);

  const x_h = x1 - hLen * Math.cos(angle);
  const y_h = y1 - hLen * Math.sin(angle);

  const arrow1X = x1 - hLen * Math.cos(angle - Math.PI / 6);
  const arrow1Y = y1 - hLen * Math.sin(angle - Math.PI / 6);
  const arrow2X = x1 - hLen * Math.cos(angle + Math.PI / 6);
  const arrow2Y = y1 - hLen * Math.sin(angle + Math.PI / 6);

  return {
    x0, y0, x_h, y_h, cx, cy,
    arrow1X, arrow1Y, arrow2X, arrow2Y, x1, y1
  };
}

interface TaperedArrowPoints {
  leftPoints: Array<{ x: number; y: number }>;
  rightPoints: Array<{ x: number; y: number }>;
  H_left: { x: number; y: number };
  H_right: { x: number; y: number };
  tip: { x: number; y: number };
}

export function getTaperedCurvedArrowPoints(
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  strokeW: number
): TaperedArrowPoints | null {
  const dx = x1 - x0;
  const dy = y1 - y0;
  const L = Math.sqrt(dx * dx + dy * dy);
  
  if (L < 1) return null;

  const midX = (x0 + x1) / 2;
  const midY = (y0 + y1) / 2;
  const nx = -dy / L;
  const ny = dx / L;

  // Control point for a nice organic curve
  const offset = L * 0.12;
  const cx = midX + nx * offset;
  const cy = midY + ny * offset;

  // Arrowhead size
  const headLen = Math.max(18, strokeW * 5);
  const hLen = Math.min(headLen, L * 0.55);
  const t_h = Math.max(0.1, 1 - hLen / L);

  const getPoint = (t: number) => {
    const mt = 1 - t;
    return {
      x: mt * mt * x0 + 2 * mt * t * cx + t * t * x1,
      y: mt * mt * y0 + 2 * mt * t * cy + t * t * y1
    };
  };

  const getTangent = (t: number) => {
    const mt = 1 - t;
    return {
      x: 2 * mt * (cx - x0) + 2 * t * (x1 - cx),
      y: 2 * mt * (cy - y0) + 2 * t * (y1 - cy)
    };
  };

  const p_h = getPoint(t_h);
  const tan_h = getTangent(t_h);
  const len_h = Math.sqrt(tan_h.x * tan_h.x + tan_h.y * tan_h.y) || 1;
  const nhx = -tan_h.y / len_h;
  const nhy = tan_h.x / len_h;

  const w_head = hLen * 1.15;
  
  const H_left = {
    x: p_h.x - (w_head / 2) * nhx,
    y: p_h.y - (w_head / 2) * nhy
  };
  const H_right = {
    x: p_h.x + (w_head / 2) * nhx,
    y: p_h.y + (w_head / 2) * nhy
  };

  // Shaft widths
  const w0 = Math.max(1.5, strokeW * 0.15);
  const w_h = strokeW;

  const leftPoints: Array<{ x: number; y: number }> = [];
  const rightPoints: Array<{ x: number; y: number }> = [];

  const steps = 15;
  for (let i = 0; i <= steps; i++) {
    const t = (i / steps) * t_h;
    const pt = getPoint(t);
    const tan = getTangent(t);
    const len = Math.sqrt(tan.x * tan.x + tan.y * tan.y) || 1;
    const tx = -tan.y / len;
    const ty = tan.x / len;

    const w = w0 + (w_h - w0) * (i / steps);

    leftPoints.push({
      x: pt.x - (w / 2) * tx,
      y: pt.y - (w / 2) * ty
    });
    rightPoints.push({
      x: pt.x + (w / 2) * tx,
      y: pt.y + (w / 2) * ty
    });
  }

  return {
    leftPoints,
    rightPoints,
    H_left,
    H_right,
    tip: { x: x1, y: y1 }
  };
}

export function drawArrowOnCanvas(
  ctx: CanvasRenderingContext2D,
  ann: Annotation,
  halfW: number,
  halfH: number,
  strokeW: number
) {
  const style = ann.arrowStyle || 'classic';

  if (style === 'tapered') {
    const pts = getTaperedCurvedArrowPoints(-halfW, -halfH, halfW, halfH, strokeW);
    if (!pts) return;

    ctx.beginPath();
    ctx.moveTo(pts.leftPoints[0].x, pts.leftPoints[0].y);
    for (let i = 1; i < pts.leftPoints.length; i++) {
      ctx.lineTo(pts.leftPoints[i].x, pts.leftPoints[i].y);
    }
    ctx.lineTo(pts.H_left.x, pts.H_left.y);
    ctx.lineTo(pts.tip.x, pts.tip.y);
    ctx.lineTo(pts.H_right.x, pts.H_right.y);
    for (let i = pts.rightPoints.length - 1; i >= 0; i--) {
      ctx.lineTo(pts.rightPoints[i].x, pts.rightPoints[i].y);
    }
    ctx.closePath();
    ctx.fill();
  } else if (style === 'curved') {
    const info = getCurvedArrowPoints(-halfW, -halfH, halfW, halfH, strokeW);
    if (!info) return;

    ctx.beginPath();
    ctx.moveTo(info.x0, info.y0);
    ctx.quadraticCurveTo(info.cx, info.cy, info.x_h, info.y_h);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(info.x1, info.y1);
    ctx.lineTo(info.arrow1X, info.arrow1Y);
    ctx.lineTo(info.arrow2X, info.arrow2Y);
    ctx.closePath();
    ctx.fill();
  } else {
    // classic or dashed
    const isDashed = style === 'dashed';
    const angle = Math.atan2(halfH * 2, halfW * 2);
    const headLen = Math.max(18, strokeW * 4.5);

    if (isDashed) {
      ctx.save();
      ctx.setLineDash([strokeW * 2, strokeW * 1.5]);
    }

    ctx.beginPath();
    ctx.moveTo(-halfW, -halfH);
    ctx.lineTo(
      halfW - (headLen * 0.5) * Math.cos(angle),
      halfH - (headLen * 0.5) * Math.sin(angle)
    );
    ctx.stroke();

    if (isDashed) {
      ctx.restore();
    }

    // Draw arrowhead at end point
    ctx.beginPath();
    ctx.moveTo(halfW, halfH);
    ctx.lineTo(
      halfW - headLen * Math.cos(angle - Math.PI / 6),
      halfH - headLen * Math.sin(angle - Math.PI / 6)
    );
    ctx.lineTo(
      halfW - headLen * Math.cos(angle + Math.PI / 6),
      halfH - headLen * Math.sin(angle + Math.PI / 6)
    );
    ctx.closePath();
    ctx.fill();
  }
}
