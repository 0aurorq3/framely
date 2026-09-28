export function slugifyPresetKey(presetKey: string): string {
  return presetKey
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48);
}

export function buildBurstVariantFilename(
  presetKey: string,
  width: number,
  height: number,
  ext: string
): string {
  const slug = slugifyPresetKey(presetKey);
  const normalizedExt = ext === 'jpeg' ? 'jpg' : ext.replace(/^\./, '');
  return `${slug}-${width}x${height}.${normalizedExt}`;
}