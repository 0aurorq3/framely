import * as fs from 'fs';

export type FileErrorCode = 'DISK_FULL' | 'PERMISSION_DENIED' | 'NOT_FOUND' | 'INVALID_FILENAME' | 'UNKNOWN';

export class FileError extends Error {
  constructor(public readonly code: FileErrorCode, message: string) {
    super(message);
    this.name = 'FileError';
  }

  toJSON() {
    return { code: this.code, message: this.message };
  }
}

export function classifyFsError(err: unknown): FileError {
  const error = err as NodeJS.ErrnoException;
  if (error.code === 'ENOSPC') return new FileError('DISK_FULL', `Not enough disk space: ${error.message}`);
  if (error.code === 'EACCES' || error.code === 'EPERM') return new FileError('PERMISSION_DENIED', `Permission denied: ${error.message}`);
  if (error.code === 'ENOENT') return new FileError('NOT_FOUND', `File or directory not found: ${error.message}`);
  return new FileError('UNKNOWN', error.message || String(err));
}

export function estimateOutputSize(base64Data: string): number {
  const separator = base64Data.indexOf(',');
  const payload = separator >= 0 ? base64Data.slice(separator + 1) : base64Data;
  return Math.ceil(payload.length * 3 / 4);
}

export function checkDiskSpace(directory: string, requiredBytes: number): void {
  try {
    const stat = fs.statfsSync(directory);
    const freeBytes = stat.bavail * stat.bsize;
    if (freeBytes < requiredBytes) {
      throw new FileError('DISK_FULL', 'Not enough disk space for the selected Burst Pack.');
    }
  } catch (err) {
    if (err instanceof FileError) throw err;
    const error = err as NodeJS.ErrnoException;
    if (error.code === 'ENOSYS' || error.code === 'EPERM') return;
    throw classifyFsError(err);
  }
}
