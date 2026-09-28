export const BURST_MANIFEST_FILE = 'burst-manifest.json';

export interface BurstVariantWarning {
  code: string;
  message: string;
}

export interface BurstVariantPayload {
  presetKey: string;
  filename: string;
  base64Data: string;
  width: number;
  height: number;
  fileSizeKb: number;
  warnings?: BurstVariantWarning[];
}

export interface BurstManifestVariant {
  presetKey: string;
  filename: string;
  width: number;
  height: number;
  fileSizeKb: number;
  warnings?: BurstVariantWarning[];
}

export interface BurstManifest {
  version: number;
  documentName: string;
  createdAt: string;
  variants: BurstManifestVariant[];
}

export interface BurstPackSavePayload {
  documentName: string;
  exportFormat: 'png' | 'jpeg' | 'webp';
  jpegQuality: number;
  compressionMode: 'original' | 'balanced' | 'small';
  variants: BurstVariantPayload[];
}

export interface BurstPackSaveResult {
  bundlePath: string;
  documentName: string;
  variantCount: number;
  primaryExportPath: string;
}

export interface BurstResult<T = void> {
  success: boolean;
  data?: T;
  error?: { code: string; message: string };
}
