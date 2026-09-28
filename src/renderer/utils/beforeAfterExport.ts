export interface BeforeAfterComposeOptions {
  gap?: number;
  padding?: number;
  background?: string;
  labelBefore?: string;
  labelAfter?: string;
  brandFooter?: string;
  /** Max height for each panel before letterboxing. */
  maxPanelHeight?: number;
}

const DEFAULTS = {
  gap: 24,
  padding: 32,
  background: '#0f1117',
  labelBefore: 'BEFORE',
  labelAfter: 'AFTER',
  maxPanelHeight: 900,
};

/**
 * Draw a simple "raw screenshot" panel: dark surface, soft shadow, image only.
 * Used as the left half of a before→after viral export.
 */
export function renderRawBeforePanel(
  imageEl: HTMLImageElement,
  targetHeight: number
): HTMLCanvasElement {
  const naturalW = imageEl.naturalWidth || imageEl.width || 800;
  const naturalH = imageEl.naturalHeight || imageEl.height || 600;
  const scale = targetHeight / naturalH;
  const drawW = Math.max(1, Math.round(naturalW * scale));
  const drawH = Math.max(1, Math.round(naturalH * scale));
  const pad = 20;
  const radius = 12;

  const canvas = document.createElement('canvas');
  canvas.width = drawW + pad * 2;
  canvas.height = drawH + pad * 2;
  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;

  ctx.fillStyle = '#16181f';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.save();
  ctx.shadowColor = 'rgba(0, 0, 0, 0.45)';
  ctx.shadowBlur = 24;
  ctx.shadowOffsetY = 8;
  ctx.beginPath();
  if (typeof (ctx as any).roundRect === 'function') {
    (ctx as any).roundRect(pad, pad, drawW, drawH, radius);
  } else {
    ctx.rect(pad, pad, drawW, drawH);
  }
  ctx.fillStyle = '#000';
  ctx.fill();
  ctx.clip();
  ctx.drawImage(imageEl, pad, pad, drawW, drawH);
  ctx.restore();

  return canvas;
}

function fitPanel(
  source: HTMLCanvasElement,
  maxH: number
): { canvas: HTMLCanvasElement; width: number; height: number } {
  const scale = source.height > maxH ? maxH / source.height : 1;
  const width = Math.max(1, Math.round(source.width * scale));
  const height = Math.max(1, Math.round(source.height * scale));
  if (scale === 1) {
    return { canvas: source, width, height };
  }
  const fitted = document.createElement('canvas');
  fitted.width = width;
  fitted.height = height;
  const ctx = fitted.getContext('2d');
  if (ctx) {
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(source, 0, 0, width, height);
  }
  return { canvas: fitted, width, height };
}

function drawLabel(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  width: number
) {
  ctx.save();
  ctx.font = '600 13px system-ui, -apple-system, Segoe UI, sans-serif';
  ctx.fillStyle = 'rgba(255, 255, 255, 0.55)';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, x + width / 2, y);
  ctx.restore();
}

/**
 * Compose a dual-panel before → after image for social demos.
 * Returns a new canvas sized to both panels + labels + brand footer.
 */
export function composeBeforeAfter(
  beforeCanvas: HTMLCanvasElement,
  afterCanvas: HTMLCanvasElement,
  options: BeforeAfterComposeOptions = {}
): HTMLCanvasElement {
  const gap = options.gap ?? DEFAULTS.gap;
  const padding = options.padding ?? DEFAULTS.padding;
  const background = options.background ?? DEFAULTS.background;
  const labelBefore = options.labelBefore ?? DEFAULTS.labelBefore;
  const labelAfter = options.labelAfter ?? DEFAULTS.labelAfter;
  const brandFooter = options.brandFooter ?? '';
  const maxPanelHeight = options.maxPanelHeight ?? DEFAULTS.maxPanelHeight;

  const labelBand = 28;
  const footerBand = brandFooter ? 36 : 0;

  const before = fitPanel(beforeCanvas, maxPanelHeight);
  const after = fitPanel(afterCanvas, maxPanelHeight);
  const panelH = Math.max(before.height, after.height);

  const out = document.createElement('canvas');
  out.width = padding * 2 + before.width + gap + after.width;
  out.height = padding * 2 + labelBand + panelH + footerBand;
  const ctx = out.getContext('2d');
  if (!ctx) return out;

  ctx.fillStyle = background;
  ctx.fillRect(0, 0, out.width, out.height);

  const beforeX = padding;
  const afterX = padding + before.width + gap;
  const panelY = padding + labelBand;

  drawLabel(ctx, labelBefore, beforeX, padding + labelBand / 2, before.width);
  drawLabel(ctx, labelAfter, afterX, padding + labelBand / 2, after.width);

  // Center panels vertically within panelH if heights differ
  const beforeY = panelY + Math.round((panelH - before.height) / 2);
  const afterY = panelY + Math.round((panelH - after.height) / 2);

  ctx.drawImage(before.canvas, beforeX, beforeY, before.width, before.height);
  ctx.drawImage(after.canvas, afterX, afterY, after.width, after.height);

  // Soft divider line between panels
  ctx.save();
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
  ctx.lineWidth = 1;
  const midX = beforeX + before.width + gap / 2;
  ctx.beginPath();
  ctx.moveTo(midX, panelY);
  ctx.lineTo(midX, panelY + panelH);
  ctx.stroke();
  ctx.restore();

  if (brandFooter) {
    ctx.save();
    ctx.font = '500 12px system-ui, -apple-system, Segoe UI, sans-serif';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(brandFooter, out.width / 2, out.height - padding / 2 - footerBand / 4);
    ctx.restore();
  }

  return out;
}
