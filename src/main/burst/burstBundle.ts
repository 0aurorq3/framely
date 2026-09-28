import * as fs from 'fs';
import * as path from 'path';
import type { BurstManifestVariant, BurstPackSavePayload, BurstPackSaveResult, BurstResult } from '../../shared/burstTypes';
import { compressImageBuffer, decodeImageDataUrl } from '../imageCompression';
import { checkDiskSpace, classifyFsError, estimateOutputSize, FileError } from '../fileValidation';
import { writeBurstManifest } from './burstManifest';

function createBundleDirectory(outputRoot: string, documentName: string): string {
  const stem = documentName.replace(/[^a-zA-Z0-9_-]/g, '-').slice(0, 80) || 'framely-burst';
  for (let suffix = 1; suffix <= 100; suffix++) {
    const bundleDir = path.join(outputRoot, suffix === 1 ? stem : `${stem}-${suffix}`);
    try {
      fs.mkdirSync(bundleDir);
      return bundleDir;
    } catch (err) {
      if ((err as NodeJS.ErrnoException).code !== 'EEXIST') throw err;
    }
  }
  throw new FileError('INVALID_FILENAME', 'Could not create a unique Burst Pack folder.');
}

export async function saveBurstPackBundle(
  outputRoot: string,
  payload: BurstPackSavePayload
): Promise<BurstResult<BurstPackSaveResult>> {
  try {
    if (!payload.variants?.length) {
      return { success: false, error: { code: 'NO_VARIANTS', message: 'No variants to save' } };
    }

    const extension = payload.exportFormat === 'jpeg' ? '.jpg' : `.${payload.exportFormat}`;
    for (const variant of payload.variants) {
      if (path.basename(variant.filename) !== variant.filename || !variant.filename.toLowerCase().endsWith(extension)) {
        throw new FileError('INVALID_FILENAME', `Invalid Burst Pack filename: ${variant.filename}`);
      }
    }

    fs.mkdirSync(outputRoot, { recursive: true });
    const estimatedSize = payload.variants.reduce((sum, variant) => sum + estimateOutputSize(variant.base64Data), 0);
    checkDiskSpace(outputRoot, estimatedSize);
    const bundleDir = createBundleDirectory(outputRoot, payload.documentName);
    const stem = path.basename(bundleDir);
    const manifestVariants: BurstManifestVariant[] = [];

    for (const variant of payload.variants) {
      const outputPath = path.join(bundleDir, variant.filename);
      const buffer = decodeImageDataUrl(variant.base64Data);
      const outputBuffer = await compressImageBuffer(buffer, {
        type: payload.exportFormat,
        quality: payload.jpegQuality,
        compressionMode: payload.compressionMode,
      });
      fs.writeFileSync(outputPath, outputBuffer);
      manifestVariants.push({
        presetKey: variant.presetKey,
        filename: variant.filename,
        width: variant.width,
        height: variant.height,
        fileSizeKb: variant.fileSizeKb,
        warnings: variant.warnings,
      });
    }

    writeBurstManifest(bundleDir, stem, manifestVariants);
    return {
      success: true,
      data: {
        bundlePath: bundleDir,
        documentName: stem,
        variantCount: manifestVariants.length,
        primaryExportPath: path.join(bundleDir, payload.variants[0].filename),
      },
    };
  } catch (err) {
    const error = err instanceof FileError ? err : classifyFsError(err);
    return { success: false, error: error.toJSON() };
  }
}
