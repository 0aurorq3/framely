export const DEFAULT_BLUR_STRENGTH = 12;

export function getBlurRadius(strength: number, imageWidth: number): number {
  const safeStrength = Math.min(40, Math.max(1, Number.isFinite(strength) ? strength : DEFAULT_BLUR_STRENGTH));
  return Math.max(0.5, safeStrength * Math.max(1, imageWidth) / 1000);
}
