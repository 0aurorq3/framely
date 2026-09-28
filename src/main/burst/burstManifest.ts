import * as fs from 'fs';
import * as path from 'path';
import { BURST_MANIFEST_FILE, BurstManifest, BurstManifestVariant } from '../../shared/burstTypes';

export function writeBurstManifest(
  bundleDir: string,
  documentName: string,
  variants: BurstManifestVariant[]
): void {
  const manifest: BurstManifest = {
    version: 1,
    documentName,
    createdAt: new Date().toISOString(),
    variants,
  };
  fs.writeFileSync(
    path.join(bundleDir, BURST_MANIFEST_FILE),
    JSON.stringify(manifest, null, 2),
    'utf-8'
  );
}

export function readBurstManifest(bundleDir: string): BurstManifest | null {
  const manifestPath = path.join(bundleDir, BURST_MANIFEST_FILE);
  if (!fs.existsSync(manifestPath)) return null;
  try {
    return JSON.parse(fs.readFileSync(manifestPath, 'utf-8')) as BurstManifest;
  } catch {
    return null;
  }
}