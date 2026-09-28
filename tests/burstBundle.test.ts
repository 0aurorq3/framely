import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { BurstPackSavePayload } from '../src/shared/burstTypes';
import * as path from 'path';

const mockFs = vi.hoisted(() => ({
  mkdirSync: vi.fn(),
  statfsSync: vi.fn(),
  writeFileSync: vi.fn(),
}));

vi.mock('fs', () => mockFs);
vi.mock('../src/main/imageCompression', () => ({
  compressImageBuffer: vi.fn(async (buffer: Buffer) => buffer),
  decodeImageDataUrl: vi.fn(() => Buffer.from('decoded-image')),
}));

import { saveBurstPackBundle } from '../src/main/burst/burstBundle';

const outputRoot = '/home/user/exports';

function makePayload(overrides: Partial<BurstPackSavePayload> = {}): BurstPackSavePayload {
  return {
    documentName: 'my-screenshot',
    exportFormat: 'png',
    jpegQuality: 90,
    compressionMode: 'balanced',
    variants: [{
      presetKey: 'Open Graph - OG Standard',
      filename: 'open-graph-og-standard-1200x630.png',
      base64Data: 'data:image/png;base64,' + 'A'.repeat(100),
      width: 1200,
      height: 630,
      fileSizeKb: 1,
    }],
    ...overrides,
  };
}

describe('saveBurstPackBundle', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFs.statfsSync.mockReturnValue({ bavail: 1000000, bsize: 4096 });
  });

  it('rejects an empty pack before creating a folder', async () => {
    const result = await saveBurstPackBundle(outputRoot, makePayload({ variants: [] }));
    expect(result.error?.code).toBe('NO_VARIANTS');
    expect(mockFs.mkdirSync).not.toHaveBeenCalled();
  });

  it('writes variants and a manifest under the chosen folder', async () => {
    const result = await saveBurstPackBundle(outputRoot, makePayload());
    expect(result.success).toBe(true);
    expect(result.data?.bundlePath).toBe(path.join(outputRoot, 'my-screenshot'));
    expect(result.data?.variantCount).toBe(1);
    const paths = mockFs.writeFileSync.mock.calls.map((call) => String(call[0]));
    expect(paths).toContain(path.join(outputRoot, 'my-screenshot', 'open-graph-og-standard-1200x630.png'));
    expect(paths).toContain(path.join(outputRoot, 'my-screenshot', 'burst-manifest.json'));
    expect(paths).toHaveLength(2);
  });

  it('uses a new folder name when a previous pack already exists', async () => {
    mockFs.mkdirSync.mockImplementation((directory: string) => {
      if (directory === path.join(outputRoot, 'my-screenshot')) {
        throw Object.assign(new Error('exists'), { code: 'EEXIST' });
      }
    });
    const result = await saveBurstPackBundle(outputRoot, makePayload());
    expect(result.data?.bundlePath).toBe(path.join(outputRoot, 'my-screenshot-2'));
  });

  it('rejects filenames that would leave the selected folder', async () => {
    const payload = makePayload({ variants: [{ ...makePayload().variants[0], filename: '../escape.png' }] });
    const result = await saveBurstPackBundle(outputRoot, payload);
    expect(result.error?.code).toBe('INVALID_FILENAME');
  });

  it('reports insufficient disk space', async () => {
    mockFs.statfsSync.mockReturnValue({ bavail: 0, bsize: 4096 });
    const result = await saveBurstPackBundle(outputRoot, makePayload());
    expect(result.error?.code).toBe('DISK_FULL');
  });
});
