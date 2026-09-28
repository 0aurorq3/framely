import { describe, it, expect } from 'vitest';
import {
  slugifyPresetKey,
  buildBurstVariantFilename,
} from '../src/shared/burstVariantFilename';

describe('burstVariantFilename', () => {
  describe('slugifyPresetKey', () => {
    it('lowercases and replaces non-alphanumeric runs with hyphens', () => {
      expect(slugifyPresetKey('Open Graph - OG Standard')).toBe('open-graph-og-standard');
    });

    it('trims leading and trailing hyphens', () => {
      expect(slugifyPresetKey('---Hello World---')).toBe('hello-world');
    });

    it('truncates to 48 characters', () => {
      const long = 'A'.repeat(60);
      expect(slugifyPresetKey(long).length).toBe(48);
    });
  });

  describe('buildBurstVariantFilename', () => {
    it('builds a slugged filename with dimensions and png extension', () => {
      expect(
        buildBurstVariantFilename('Open Graph - OG Standard', 1200, 630, 'png')
      ).toBe('open-graph-og-standard-1200x630.png');
    });

    it('normalizes jpeg to jpg', () => {
      expect(buildBurstVariantFilename('X (Twitter) - Post', 1200, 675, 'jpeg')).toBe(
        'x-twitter-post-1200x675.jpg'
      );
    });

    it('strips leading dot from extension', () => {
      expect(buildBurstVariantFilename('Instagram - Story', 1080, 1920, '.webp')).toBe(
        'instagram-story-1080x1920.webp'
      );
    });
  });
});