// === Color Math Helpers ===

export function hexToRgb(hex: string): [number, number, number] {
  const clean = hex.replace('#', '');
  const n = parseInt(clean.length === 3 ? clean.split('').map((c) => c + c).join('') : clean, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

export function rgbToHex(r: number, g: number, b: number): string {
  return '#' + [r, g, b].map((v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')).join('');
}

export function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  const rn = r / 255, gn = g / 255, bn = b / 255;
  const max = Math.max(rn, gn, bn), min = Math.min(rn, gn, bn);
  let h = 0, s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case rn: h = ((gn - bn) / d + (gn < bn ? 6 : 0)) / 6; break;
      case gn: h = ((bn - rn) / d + 2) / 6; break;
      default:  h = ((rn - gn) / d + 4) / 6; break;
    }
  }
  return [h, s, l];
}

export function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  if (s === 0) { const v = Math.round(l * 255); return [v, v, v]; }
  const hue2rgb = (p: number, q: number, t: number) => {
    if (t < 0) t += 1; if (t > 1) t -= 1;
    if (t < 1/6) return p + (q - p) * 6 * t;
    if (t < 1/2) return q;
    if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
    return p;
  };
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  return [
    Math.round(hue2rgb(p, q, h + 1/3) * 255),
    Math.round(hue2rgb(p, q, h) * 255),
    Math.round(hue2rgb(p, q, h - 1/3) * 255),
  ];
}

export function lighten(hex: string, pct: number): string {
  const [r, g, b] = hexToRgb(hex);
  const [h, s, l] = rgbToHsl(r, g, b);
  return rgbToHex(...hslToRgb(h, s, Math.min(1, l + pct / 100)));
}

export function darken(hex: string, pct: number): string {
  const [r, g, b] = hexToRgb(hex);
  const [h, s, l] = rgbToHsl(r, g, b);
  return rgbToHex(...hslToRgb(h, s, Math.max(0, l - pct / 100)));
}

export function rotateHue(hex: string, degrees: number): string {
  const [r, g, b] = hexToRgb(hex);
  const [h, s, l] = rgbToHsl(r, g, b);
  const newH = ((h + degrees / 360) % 1 + 1) % 1;
  return rgbToHex(...hslToRgb(newH, s, l));
}

export function desaturate(hex: string, pct: number): string {
  const [r, g, b] = hexToRgb(hex);
  const [h, s, l] = rgbToHsl(r, g, b);
  return rgbToHex(...hslToRgb(h, Math.max(0, s - pct / 100), l));
}

// === Palette Types ===

export interface VibePalette {
  dominant: string;
  vibrant: string;
  lightVibrant: string;
  darkVibrant: string;
  muted: string;
  lightMuted: string;
  darkMuted: string;
}

// === Swatch Scoring ===

interface SwatchTarget { targetS: number; targetL: number }

const SWATCH_TARGETS: Record<keyof Omit<VibePalette, 'dominant'>, SwatchTarget> = {
  vibrant:      { targetS: 0.80, targetL: 0.50 },
  lightVibrant: { targetS: 0.80, targetL: 0.75 },
  darkVibrant:  { targetS: 0.80, targetL: 0.30 },
  muted:        { targetS: 0.30, targetL: 0.50 },
  lightMuted:   { targetS: 0.30, targetL: 0.70 },
  darkMuted:    { targetS: 0.30, targetL: 0.30 },
};

function scoreSwatch([, s, l]: [number, number, number], { targetS, targetL }: SwatchTarget): number {
  return 1 - (Math.abs(s - targetS) + Math.abs(l - targetL));
}

// === Palette Extraction ===

export async function extractPalette(imageSrc: string): Promise<VibePalette> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const SIZE = 64;
      const canvas = document.createElement('canvas');
      canvas.width = SIZE; canvas.height = SIZE;
      const ctx = canvas.getContext('2d');
      if (!ctx) { resolve(buildFallback('#6366f1')); return; }

      ctx.drawImage(img, 0, 0, SIZE, SIZE);
      const { data } = ctx.getImageData(0, 0, SIZE, SIZE);

      // Build HSL pixel list, skip nearly transparent pixels
      const pixels: [number, number, number][] = [];
      for (let i = 0; i < data.length; i += 4) {
        if (data[i + 3] < 128) continue;
        pixels.push(rgbToHsl(data[i], data[i + 1], data[i + 2]));
      }

      if (pixels.length === 0) { resolve(buildFallback('#6366f1')); return; }

      // Dominant = pixel closest to average hue/lightness
      const avgH = pixels.reduce((s, p) => s + p[0], 0) / pixels.length;
      const avgL = pixels.reduce((s, p) => s + p[2], 0) / pixels.length;
      const dominant = pixels.reduce((best, p) => {
        const d = Math.abs(p[0] - avgH) + Math.abs(p[2] - avgL);
        const bd = Math.abs(best[0] - avgH) + Math.abs(best[2] - avgL);
        return d < bd ? p : best;
      });
      const dominantHex = rgbToHex(...hslToRgb(dominant[0], dominant[1], dominant[2]));

      // Score each pixel against each swatch target
      const swatches = {} as Record<string, string | null>;
      for (const [key, target] of Object.entries(SWATCH_TARGETS)) {
        let bestScore = -Infinity, bestPixel: [number, number, number] | null = null;
        for (const p of pixels) {
          const score = scoreSwatch(p, target);
          if (score > bestScore) { bestScore = score; bestPixel = p; }
        }
        swatches[key] = bestPixel && bestScore > 0.3
          ? rgbToHex(...hslToRgb(bestPixel[0], bestPixel[1], bestPixel[2]))
          : null;
      }

      resolve(applyFallbacks(dominantHex, swatches));
    };
    img.onerror = () => resolve(buildFallback('#6366f1'));
    img.crossOrigin = 'anonymous';
    img.src = imageSrc;
  });
}

function buildFallback(base: string): VibePalette {
  return applyFallbacks(base, { vibrant: null, lightVibrant: null, darkVibrant: null, muted: null, lightMuted: null, darkMuted: null });
}

export function applyFallbacks(dominant: string, raw: Record<string, string | null>): VibePalette {
  const vibrant      = raw.vibrant      ?? rotateHue(dominant, 15);
  const lightVibrant = raw.lightVibrant ?? lighten(vibrant, 25);
  const darkVibrant  = raw.darkVibrant  ?? darken(vibrant, 25);
  const muted        = raw.muted        ?? desaturate(vibrant, 40);
  const lightMuted   = raw.lightMuted   ?? lighten(muted, 20);
  const darkMuted    = raw.darkMuted    ?? darken(muted, 20);
  return { dominant, vibrant, lightVibrant, darkVibrant, muted, lightMuted, darkMuted };
}
