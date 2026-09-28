import { describe, expect, it, vi } from 'vitest';
import { Module } from 'node:module';

import { compressImageBuffer } from '../src/main/imageCompression';

describe('imageCompression without sharp', () => {
  it('returns the input buffer unchanged', async () => {
    const moduleWithLoad = Module as unknown as {
      _load: (request: string, parent: unknown, isMain: boolean) => unknown;
    };
    const originalLoad = moduleWithLoad._load;
    vi.spyOn(moduleWithLoad, '_load').mockImplementation((request, parent, isMain) => {
      if (request === 'sharp') {
        throw new Error('sharp unavailable in test');
      }
      return originalLoad(request, parent, isMain);
    });

    const input = Buffer.from('uncompressed image data');

    const output = await compressImageBuffer(input, {
      type: 'png',
      compressionMode: 'balanced',
    });

    expect(output).toBe(input);
    vi.restoreAllMocks();
  });
});
