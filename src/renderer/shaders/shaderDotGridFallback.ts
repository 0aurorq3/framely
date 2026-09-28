export function drawDotGrid2D(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  colors: string[],
  shape: 'circle' | 'diamond' | 'square' | 'triangle',
  size: number,
  gapX: number,
  gapY: number,
  strokeWidth: number,
  sizeRange: number,
  opacityRange: number,
  scale: number,
  rotation: number,
  offsetX: number,
  offsetY: number
): void {
  // 1. Draw background
  ctx.fillStyle = colors[0] || '#000000';
  ctx.fillRect(0, 0, w, h);

  // 2. Grid drawing with scale, rotation, offset
  ctx.save();
  
  // Apply center offset, scale, rotation
  ctx.translate(w / 2 + offsetX * w, h / 2 + offsetY * h);
  ctx.scale(scale, scale);
  ctx.rotate((rotation * Math.PI) / 180);
  ctx.translate(-w / 2, -h / 2);

  ctx.fillStyle = colors[1] || '#ffffff';
  ctx.strokeStyle = colors[2] || '#ffaa00';
  ctx.lineWidth = strokeWidth;

  // We cover a larger area than just w x h to handle rotation/scale clipping
  const padding = Math.max(w, h) * 1.5;
  const startX = -padding;
  const endX = w + padding;
  const startY = -padding;
  const endY = h + padding;

  // Use a deterministic seed/hash for range variations based on grid index
  const hashGrid = (ix: number, iy: number) => {
    const val = Math.sin(ix * 12.9898 + iy * 78.233) * 43758.5453;
    return val - Math.floor(val);
  };

  for (let x = startX; x < endX; x += gapX) {
    for (let y = startY; y < endY; y += gapY) {
      // Calculate grid index for deterministic randomness
      const ix = Math.round(x / gapX);
      const iy = Math.round(y / gapY);
      const randSize = hashGrid(ix, iy);
      const randOpacity = hashGrid(ix + 1000, iy + 1000);

      // Apply sizeRange (0 = uniform, higher = random value subtracted up to base size)
      const currentSize = Math.max(0.1, size * (1.0 - sizeRange * randSize));

      // Apply opacityRange (0 = all shapes opaque, higher = semi-transparent)
      const opacity = Math.max(0, 1.0 - opacityRange * randOpacity);
      ctx.globalAlpha = opacity;

      ctx.beginPath();
      if (shape === 'circle') {
        ctx.arc(x, y, currentSize / 2, 0, Math.PI * 2);
      } else if (shape === 'diamond') {
        const r = currentSize / 2;
        ctx.moveTo(x, y - r);
        ctx.lineTo(x + r, y);
        ctx.lineTo(x, y + r);
        ctx.lineTo(x - r, y);
        ctx.closePath();
      } else if (shape === 'square') {
        const r = currentSize / 2;
        ctx.rect(x - r, y - r, currentSize, currentSize);
      } else if (shape === 'triangle') {
        const r = currentSize / 2;
        ctx.moveTo(x, y - r);
        ctx.lineTo(x + r, y + r);
        ctx.lineTo(x - r, y + r);
        ctx.closePath();
      }

      if (strokeWidth > 0) {
        ctx.fill();
        ctx.stroke();
      } else {
        ctx.fill();
      }
    }
  }

  ctx.restore();
}
