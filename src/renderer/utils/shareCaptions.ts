export type SharePlatform = 'x' | 'linkedin' | 'whatsapp' | 'product-hunt' | 'generic';

/**
 * Short, platform-tuned captions for images made with Framely.
 * Keep X under ~200 chars so room remains for the user's own words.
 */
export function getShareCaption(platform: SharePlatform): string {
  switch (platform) {
    case 'x':
      return 'Beautified with Framely ✨';
    case 'linkedin':
      return 'Beautified this screenshot with Framely.';
    case 'whatsapp':
      return 'Check out this screenshot I polished with Framely.';
    case 'product-hunt':
      return 'Launch visuals made with Framely.';
    case 'generic':
    default:
      return 'Beautified with Framely';
  }
}

/** Build web intent URLs that prefill text where the platform allows it. */
export function buildShareIntentUrl(platform: 'x' | 'whatsapp' | 'linkedin', caption: string): string {
  const encoded = encodeURIComponent(caption);
  switch (platform) {
    case 'x':
      return `https://x.com/intent/post?text=${encoded}`;
    case 'whatsapp':
      return `https://api.whatsapp.com/send?text=${encoded}`;
    case 'linkedin':
      // LinkedIn no longer supports reliable text prefill for feed posts;
      // open the feed so the user can paste the image + caption from clipboard.
      return 'https://www.linkedin.com/feed/';
  }
}
