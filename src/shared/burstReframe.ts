export interface BurstPreset {
  platform: string;
  name: string;
  width: number;
  height: number;
  safeZone?: { width: number; height: number };
}

export interface BurstMasterLayout {
  padding: number;
  scale: number;
  chromeStyle: 'mac' | 'windows' | 'none';
  position?: string;
}

export interface BurstConfigPatch {
  aspectRatio: 'Custom';
  canvasWidth: number;
  canvasHeight: number;
  selectedPreset: string;
  padding: number;
  scale: number;
  position: string;
  paddingMode: 'fill';
  forceCanvasSize: { width: number; height: number };
}

const MIN_ABSOLUTE_SCALE = 60;

export function buildPresetKey(preset: BurstPreset): string {
  return `${preset.platform} - ${preset.name}`;
}

export function computeBurstConfigPatch(
  master: BurstMasterLayout,
  imgWidth: number,
  imgHeight: number,
  preset: BurstPreset
): { patch: BurstConfigPatch; warnings: string[] } {
  const warnings: string[] = [];
  const chromeOffset = master.chromeStyle !== 'none' ? 32 : 0;
  const targetW = preset.safeZone?.width ?? preset.width;
  const targetH = preset.safeZone?.height ?? preset.height;

  let padding = master.padding;
  let scale = master.scale;
  const minScale = Math.min(master.scale, Math.max(MIN_ABSOLUTE_SCALE, Math.round(master.scale * 0.6)));

  const fits = (s: number, p: number) => {
    const contentW = imgWidth * (s / 100);
    const contentH = (imgHeight + chromeOffset) * (s / 100);
    return contentW <= targetW - p * 2 && contentH <= targetH - p * 2;
  };

  let guard = 0;
  while (!fits(scale, padding) && guard < 80) {
    guard += 1;
    if (scale > minScale) {
      scale -= 5;
      continue;
    }
    if (padding > 8) {
      padding = Math.max(8, Math.round(padding * 0.85));
      continue;
    }
    warnings.push('Content may extend outside the platform safe zone');
    break;
  }

  return {
    patch: {
      aspectRatio: 'Custom',
      canvasWidth: preset.width,
      canvasHeight: preset.height,
      selectedPreset: buildPresetKey(preset),
      padding,
      scale,
      position: 'Middle center',
      paddingMode: 'fill',
      forceCanvasSize: { width: preset.width, height: preset.height },
    },
    warnings,
  };
}

export function estimateBase64SizeKb(base64Data: string): number {
  return Math.round((base64Data.length * 0.75) / 1024);
}

export function collectOgWarnings(presetKey: string, fileSizeKb: number): string[] {
  const warnings: string[] = [];
  const isOg =
    presetKey.includes('OG') ||
    presetKey.includes('Link') ||
    presetKey.includes('Facebook') ||
    presetKey.includes('LinkedIn');
  if (isOg && fileSizeKb > 300) {
    warnings.push(`File is ${fileSizeKb}KB — keep Open Graph images under 300KB for link previews`);
  }
  if (fileSizeKb > 8 * 1024) {
    warnings.push(`File exceeds 8MB — may fail on some social platforms`);
  }
  return warnings;
}