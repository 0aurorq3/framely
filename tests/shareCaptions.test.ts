import { describe, it, expect } from 'vitest';
import { buildShareIntentUrl, getShareCaption } from '../src/renderer/utils/shareCaptions';

describe('shareCaptions', () => {
  it('identifies Framely without adding a project URL', () => {
    for (const platform of ['x', 'linkedin', 'whatsapp', 'product-hunt', 'generic'] as const) {
      expect(getShareCaption(platform)).toContain('Framely');
      expect(getShareCaption(platform)).not.toContain('http');
    }
  });

  it('never uses an em dash in captions', () => {
    const emDash = '\u2014';
    const enDash = '\u2013';
    for (const platform of ['x', 'linkedin', 'whatsapp', 'product-hunt', 'generic'] as const) {
      const caption = getShareCaption(platform);
      expect(caption.includes(emDash)).toBe(false);
      expect(caption.includes(enDash)).toBe(false);
    }
  });

  it('builds X intent with encoded caption', () => {
    const caption = getShareCaption('x');
    const url = buildShareIntentUrl('x', caption);
    expect(url).toContain('x.com/intent/post?text=');
    expect(url).toContain(encodeURIComponent('Framely'));
  });

  it('builds WhatsApp intent with encoded caption', () => {
    const url = buildShareIntentUrl('whatsapp', getShareCaption('whatsapp'));
    expect(url).toContain('api.whatsapp.com/send?text=');
  });

  it('opens LinkedIn feed (no reliable text prefill)', () => {
    expect(buildShareIntentUrl('linkedin', 'hi')).toBe('https://www.linkedin.com/feed/');
  });
});
