import {
  FRAMELY_BRAND_WATERMARK,
  FRAMELY_DEFAULT_WATERMARK_ENABLED,
  FRAMELY_DEFAULT_WATERMARK_OPACITY,
  FRAMELY_DEFAULT_WATERMARK_POSITION,
} from '../../shared/branding';

export function getUserDefault<T>(key: string, fallback: T): T {
  try {
    const saved = localStorage.getItem('framely-user-defaults');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Object.prototype.hasOwnProperty.call(parsed, 'captureResolution')) {
        delete parsed.captureResolution;
        try { localStorage.setItem('framely-user-defaults', JSON.stringify(parsed)); } catch {}
      }
      if (parsed[key] !== undefined) return parsed[key];
    }
  } catch (e) {}
  return fallback;
}

export function updateUserDefault(key: string, value: any) {
  try {
    const saved = localStorage.getItem('framely-user-defaults');
    const parsed = saved ? JSON.parse(saved) : {};
    delete parsed.captureResolution;
    parsed[key] = value;
    localStorage.setItem('framely-user-defaults', JSON.stringify(parsed));
  } catch (e) {}
}

export function clearUserDefaults() {
  try {
    localStorage.removeItem('framely-user-defaults');
  } catch (e) {}
}

export const DEFAULT_SETTINGS = {
  padding: 38,
  rounded: 20,
  shadow: 30,
  watermarkEnabled: FRAMELY_DEFAULT_WATERMARK_ENABLED,
  watermarkText: FRAMELY_BRAND_WATERMARK,
  watermarkSize: 20,
  watermarkPosition: FRAMELY_DEFAULT_WATERMARK_POSITION,
  watermarkOpacity: FRAMELY_DEFAULT_WATERMARK_OPACITY,
  watermarkFont: 'sans-serif',
  watermarkBold: false,
  watermarkItalic: false,
  annotationFont: 'sans-serif',
  annotationFontSize: 24,
  annotationBold: true,
  annotationItalic: false,
  blurStrength: 12,
  annotationOutlineEnabled: false,
  annotationOutlineColor: '#000000',
  annotationOutlineWidth: 3,
  exportFormat: 'png' as const,
  jpegQuality: 90,
  compressionMode: 'balanced' as const,
  sidebarPosition: 'right' as const,
  autoImportCaptured: true,
  captureShortcut: 'PrintScreen',
};
