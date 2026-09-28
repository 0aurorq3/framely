export function drawPulsingBorder2D(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  colors: string[],
  colorBack: string,
  roundness: number,
  thickness: number,
  _softness: number,
  aspectRatio: 'auto' | 'square',
  _intensity: number,
  bloom: number,
  _spots: number,
  _spotSize: number,
  _pulse: number,
  _smoke: number,
  _smokeSize: number,
  marginLeft: number,
  marginRight: number,
  marginTop: number,
  marginBottom: number,
  scale: number,
  rotation: number,
  offsetX: number,
  offsetY: number
): void {
  // Fill background with user-configurable colorBack
  ctx.save();
  ctx.fillStyle = colorBack || '#000000';
  ctx.fillRect(0, 0, w, h);
  ctx.restore();

  ctx.save();

  // Apply scale, rotation, offset
  ctx.translate(w / 2 + offsetX * w, h / 2 + offsetY * h);
  ctx.scale(scale, scale);
  ctx.rotate((rotation * Math.PI) / 180);
  ctx.translate(-w / 2, -h / 2);

  // Compute boundaries based on margins
  let left = marginLeft * w;
  let right = w - marginRight * w;
  let top = marginTop * h;
  let bottom = h - marginBottom * h;

  let width = right - left;
  let height = bottom - top;

  if (aspectRatio === 'square') {
    const size = Math.min(width, height);
    const cx = left + width / 2;
    const cy = top + height / 2;
    left = cx - size / 2;
    right = cx + size / 2;
    top = cy - size / 2;
    bottom = cy + size / 2;
    width = size;
    height = size;
  }

  if (width <= 0 || height <= 0) {
    ctx.restore();
    return;
  }

  // Draw border path
  // We use roundness (0 to 1) mapped to maximum possible corner radius (min(width, height) / 2)
  const maxRadius = Math.min(width, height) / 2;
  const radius = roundness * maxRadius;

  // Calculate actual thickness in pixels
  const borderThickness = Math.max(1, thickness * Math.min(w, h));

  // If bloom is high, configure shadow for neon glow
  if (bloom > 0) {
    ctx.shadowColor = colors[0] || '#83afec';
    ctx.shadowBlur = bloom * borderThickness * 3.0;
  }

  // Set line styling
  ctx.lineWidth = borderThickness;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  // Create a gradient stroke to blend the colors around the border
  const grad = ctx.createLinearGradient(left, top, right, bottom);
  if (colors.length > 0) {
    colors.forEach((color, i) => {
      grad.addColorStop(i / Math.max(1, colors.length - 1), color);
    });
  } else {
    grad.addColorStop(0, '#83afec');
  }
  ctx.strokeStyle = grad;

  // Build the rounded rect path
  ctx.beginPath();
  ctx.moveTo(left + radius, top);
  ctx.lineTo(right - radius, top);
  ctx.quadraticCurveTo(right, top, right, top + radius);
  ctx.lineTo(right, bottom - radius);
  ctx.quadraticCurveTo(right, bottom, right - radius, bottom);
  ctx.lineTo(left + radius, bottom);
  ctx.quadraticCurveTo(left, bottom, left, bottom - radius);
  ctx.lineTo(left, top + radius);
  ctx.quadraticCurveTo(left, top, left + radius, top);
  ctx.closePath();

  // Draw
  ctx.stroke();

  ctx.restore();
}
