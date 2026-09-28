import { VibePalette, lighten, darken, rotateHue, hexToRgb } from './colorExtractor';

// === WCAG Luminance ===

export function getRelativeLuminance(hex: string): number {
  const toLinear = (c: number) => {
    const n = c / 255;
    return n <= 0.04045 ? n / 12.92 : Math.pow((n + 0.055) / 1.055, 2.4);
  };
  const [r, g, b] = hexToRgb(hex);
  return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
}

export function getIdealChromeTheme(hex: string): 'dark' | 'light' {
  // If background is bright (luminance > 0.179), use dark chrome buttons for contrast
  return getRelativeLuminance(hex) > 0.179 ? 'dark' : 'light';
}

// === Variant Config Shape ===

export interface VibeVariantConfig {
  backgroundType: 'mesh' | 'gradient';
  meshColors?: string[];   // 4 mesh point colors (mesh mode)
  backgroundValue?: string; // gradient CSS string (gradient mode)
  shadowColor: string;
  chromeTheme: 'dark' | 'light';
  annotationColor: string;
}

// === Variant Generator ===

export function generateVibeConfigs(palette: VibePalette): VibeVariantConfig[] {
  const { dominant, vibrant, lightVibrant, darkVibrant, muted, lightMuted, darkMuted } = palette;

  const toShadow = (hex: string, alpha: number) => {
    const [r, g, b] = hexToRgb(hex);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

  return [
    // Variant 1: Vibrant Mesh — High Energy
    {
      backgroundType: 'mesh',
      meshColors: [vibrant, lightVibrant, rotateHue(darkVibrant, 20), rotateHue(muted, -15)],
      shadowColor: toShadow(dominant, 0.45),
      chromeTheme: getIdealChromeTheme(dominant),
      annotationColor: lightVibrant,
    },
    // Variant 2: Soft Pastel — Minimalist & Light
    {
      backgroundType: 'mesh',
      meshColors: [muted, lightMuted, rotateHue(lightVibrant, 15), rotateHue(muted, -20)],
      shadowColor: toShadow(muted, 0.25),
      chromeTheme: 'light',
      annotationColor: darkVibrant,
    },
    // Variant 3: Dark Neon Glow — Night Mode
    {
      backgroundType: 'mesh',
      meshColors: [darkVibrant, darkMuted, darken(darkVibrant, 15), vibrant],
      shadowColor: toShadow(darkVibrant, 0.60),
      chromeTheme: 'light',
      annotationColor: vibrant,
    },
    // Variant 4: Linear Tint — Clean Contrast
    {
      backgroundType: 'gradient',
      backgroundValue: `linear-gradient(135deg, ${darkMuted} 0%, ${lighten(lightMuted, 10)} 100%)`,
      shadowColor: toShadow(dominant, 0.20),
      chromeTheme: getIdealChromeTheme(lightMuted),
      annotationColor: vibrant,
    },
  ];
}
