export function rotatePoint(x: number, y: number, cx: number, cy: number, angleDeg: number) {
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

export function normalizePenPoints(penPoints: Array<{ x: number; y: number }>) {
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
  return { x: minX, y: minY, w, h, points: finalPoints };
}

export function getTextDrawingSize(w: number, h: number) {
  let finalW = Math.abs(w);
  let finalH = Math.abs(h);
  if (finalW < 0.02) finalW = 0.16;
  if (finalH < 0.02) finalH = 0.04;
  return { w: finalW, h: finalH };
}

export function normalizeShapeDrawing(drawingAnn: { x: number; y: number; w: number; h: number }) {
  const width = Math.abs(drawingAnn.w);
  const height = Math.abs(drawingAnn.h);
  if (width <= 0.005 && height <= 0.005) return null;
  
  return {
    x: drawingAnn.w < 0 ? drawingAnn.x + drawingAnn.w : drawingAnn.x,
    y: drawingAnn.h < 0 ? drawingAnn.y + drawingAnn.h : drawingAnn.y,
    w: width,
    h: height,
  };
}

export function hasDragged(startX: number, startY: number, currentX: number, currentY: number, threshold = 5) {
  const dist = Math.hypot(currentX - startX, currentY - startY);
  return dist >= threshold;
}

export function isDoubleClick(lastClickTime: number, currentTime: number, threshold = 300) {
  return lastClickTime > 0 && currentTime - lastClickTime < threshold;
}

export function calculateRotationAngle(mouseX: number, mouseY: number, cx: number, cy: number) {
  const rad = Math.atan2(mouseY - cy, mouseX - cx);
  let deg = rad * (180 / Math.PI) + 90;
  if (deg < 0) deg += 360;
  return Math.round(deg);
}
