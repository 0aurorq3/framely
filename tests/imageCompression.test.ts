import { describe, expect, it } from 'vitest';
import sharp from 'sharp';
import { compressImageBuffer, decodeImageDataUrl } from '../src/main/imageCompression';

async function createTestPngBuffer() {
  return sharp({
    create: {
      width: 16,
      height: 16,
      channels: 4,
      background: { r: 120, g: 80, b: 200, alpha: 1 },
    },
  })
    .png()
    .toBuffer();
}

describe('imageCompression', () => {
  it('decodes image data URLs into buffers', async () => {
    const input = Buffer.from('framely-image-data');
    const dataUrl = `data:image/png;base64,${input.toString('base64')}`;

    expect(decodeImageDataUrl(dataUrl).equals(input)).toBe(true);
  });

  it('exports a valid optimized PNG buffer', async () => {
    const input = await createTestPngBuffer();
    const output = await compressImageBuffer(input, {
      type: 'png',
      compressionMode: 'small',
    });

    const metadata = await sharp(output).metadata();
    expect(metadata.format).toBe('png');
    expect(metadata.width).toBe(16);
    expect(metadata.height).toBe(16);
  });

  it('exports a valid JPEG buffer with requested quality path', async () => {
    const input = await createTestPngBuffer();
    const output = await compressImageBuffer(input, {
      type: 'jpeg',
      quality: 77,
      compressionMode: 'original',
    });

    const metadata = await sharp(output).metadata();
    expect(metadata.format).toBe('jpeg');
    expect(metadata.width).toBe(16);
    expect(metadata.height).toBe(16);
  });

  it('exports a valid WebP buffer with requested quality path', async () => {
    const input = await createTestPngBuffer();
    const output = await compressImageBuffer(input, {
      type: 'webp',
      quality: 82,
      compressionMode: 'balanced',
    });

    const metadata = await sharp(output).metadata();
    expect(metadata.format).toBe('webp');
    expect(metadata.width).toBe(16);
    expect(metadata.height).toBe(16);
  });
});
