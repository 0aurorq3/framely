export type PlatformType = 
  | 'Open Graph' 
  | 'Universal' 
  | 'Instagram' 
  | 'Meta' 
  | 'X (Twitter)' 
  | 'LinkedIn' 
  | 'YouTube' 
  | 'TikTok' 
  | 'Pinterest'
  | 'WordPress'
  | 'Google Business'
  | 'Apple / Android'
  | 'Product Hunt';

export interface PlatformPreset {
  platform: PlatformType;
  name: string;
  width: number;
  height: number;
  ratio: string;
  note: string;
  isUniversal?: boolean;
  safeZone?: {
    width: number;
    height: number;
  };
}

export const platformPresets: PlatformPreset[] = [
  // OPEN GRAPH (OG) PRESETS
  { 
    platform: 'Open Graph', 
    name: 'OG Standard', 
    width: 1200, 
    height: 630, 
    ratio: '1.91:1', 
    note: 'Industry standard web preview (og:image). Clear text/logos inside central 1200x576 px to avoid iMessage/WhatsApp crops.',
    safeZone: { width: 1200, height: 576 }
  },
  { 
    platform: 'Open Graph', 
    name: 'OG Square', 
    width: 600, 
    height: 600, 
    ratio: '1:1', 
    note: 'Minimum resolution standard for square layout fallback web tags (e.g., summary cards).',
    isUniversal: true 
  },

  // UNIVERSAL PRESETS
  { 
    platform: 'Universal', 
    name: 'Full-Screen Vertical / Story', 
    width: 1080, 
    height: 1920, 
    ratio: '9:16', 
    note: 'Core Preset: For IG Stories/Reels, TikTok, YT Shorts',
    isUniversal: true,
    safeZone: { width: 1080, height: 1420 }
  },
  { 
    platform: 'Universal', 
    name: 'Portrait / Vertical Feed', 
    width: 1080, 
    height: 1350, 
    ratio: '4:5', 
    note: 'Core Preset: Max screen estate for IG/Meta mobile feeds',
    isUniversal: true 
  },
  { 
    platform: 'Universal', 
    name: 'Square / Grid Standard', 
    width: 1080, 
    height: 1080, 
    ratio: '1:1', 
    note: 'Core Preset: Universal feed post, card, or carousel',
    isUniversal: true 
  },
  { 
    platform: 'Universal', 
    name: 'Landscape / Universal Link', 
    width: 1200, 
    height: 630, 
    ratio: '1.91:1', 
    note: 'Core Preset: Standard Meta/LinkedIn link previews & OG tags',
    isUniversal: true,
    safeZone: { width: 1200, height: 576 }
  },
  { 
    platform: 'Universal', 
    name: 'Standard Video Landscape', 
    width: 1920, 
    height: 1080, 
    ratio: '16:9', 
    note: 'Core Preset: YouTube videos & desktop landscape content',
    isUniversal: true 
  },
  {
    platform: 'Universal',
    name: 'Universal Brand Logo',
    width: 500,
    height: 500,
    ratio: '1:1',
    note: 'High-res default canvas for creating a standalone square logo mark.',
    isUniversal: true
  },

  // INSTAGRAM PRESETS
  { 
    platform: 'Instagram', 
    name: 'Feed Portrait', 
    width: 1080, 
    height: 1350, 
    ratio: '4:5', 
    note: 'Optimizes mobile feed real estate' 
  },
  { 
    platform: 'Instagram', 
    name: 'Feed Square', 
    width: 1080, 
    height: 1080, 
    ratio: '1:1', 
    note: 'Standard square post' 
  },
  { 
    platform: 'Instagram', 
    name: 'Stories & Reels', 
    width: 1080, 
    height: 1920, 
    ratio: '9:16', 
    note: 'Keep key UI/text inside central 1080 × 1420 px safe zone',
    safeZone: { width: 1080, height: 1420 }
  },
  { 
    platform: 'Instagram', 
    name: 'Profile Picture', 
    width: 320, 
    height: 320, 
    ratio: '1:1', 
    note: 'UI crops to a circle; center critical visual elements' 
  },
  {
    platform: 'Instagram',
    name: 'Profile / Brand Logo',
    width: 320,
    height: 320,
    ratio: '1:1',
    note: 'UI Circle Crop. Keep all logo letters/icons well within the center bounds.'
  },

  // META PRESETS
  { 
    platform: 'Meta', 
    name: 'Link Preview Image', 
    width: 1200, 
    height: 630, 
    ratio: '1.91:1', 
    note: 'Standard open-graph layout dimension',
    safeZone: { width: 1200, height: 576 }
  },
  { 
    platform: 'Meta', 
    name: 'Cover Photo', 
    width: 851, 
    height: 315, 
    ratio: '~2.7:1', 
    note: 'Scales dynamically; keep text centered for mobile viewports' 
  },
  {
    platform: 'Meta',
    name: 'Business Page Logo',
    width: 170,
    height: 170,
    ratio: '1:1',
    note: 'UI Circle Crop. Renders at 170x170 on desktop, 128x128 on smartphones.'
  },

  // X (TWITTER) PRESETS
  { 
    platform: 'X (Twitter)', 
    name: 'In-Feed Landscape', 
    width: 1600, 
    height: 900, 
    ratio: '16:9', 
    note: 'High-res standard landscape' 
  },
  { 
    platform: 'X (Twitter)', 
    name: 'In-Feed Square', 
    width: 1080, 
    height: 1080, 
    ratio: '1:1', 
    note: 'Displays cleanly without cropping in timeline' 
  },
  { 
    platform: 'X (Twitter)', 
    name: 'Header Banner', 
    width: 1500, 
    height: 500, 
    ratio: '3:1', 
    note: 'Crop lines shift slightly depending on browser window width' 
  },
  { 
    platform: 'X (Twitter)', 
    name: 'Profile Picture', 
    width: 400, 
    height: 400, 
    ratio: '1:1', 
    note: 'UI crops to a circle' 
  },
  {
    platform: 'X (Twitter)',
    name: 'Profile / Brand Logo',
    width: 400,
    height: 400,
    ratio: '1:1',
    note: 'UI Circle Crop. Scale down checks show it needs thick, high-contrast lines.'
  },

  // LINKEDIN PRESETS
  { 
    platform: 'LinkedIn', 
    name: 'Feed Image (Square)', 
    width: 1200, 
    height: 1200, 
    ratio: '1:1', 
    note: 'Renders heavily on desktop feeds' 
  },
  { 
    platform: 'LinkedIn', 
    name: 'Feed Image (Portrait)', 
    width: 1080, 
    height: 1350, 
    ratio: '4:5', 
    note: 'Higher click-through rate on modern mobile device feeds' 
  },
  { 
    platform: 'LinkedIn', 
    name: 'Shared Link / Ad', 
    width: 1200, 
    height: 627, 
    ratio: '1.91:1', 
    note: 'Specifically used for outbound sponsored or organic URLs' 
  },
  { 
    platform: 'LinkedIn', 
    name: 'Cover Image (Personal)', 
    width: 1584, 
    height: 396, 
    ratio: '4:1', 
    note: 'Landscape banner behind user profile picture' 
  },
  { 
    platform: 'LinkedIn', 
    name: 'Profile Picture', 
    width: 400, 
    height: 400, 
    ratio: '1:1', 
    note: 'UI crops to a circle' 
  },
  {
    platform: 'LinkedIn',
    name: 'Company Page Logo',
    width: 300,
    height: 300,
    ratio: '1:1',
    note: 'UI Square Display. Unlike profiles, business page logos display as sharp squares.'
  },

  // YOUTUBE PRESETS
  { 
    platform: 'YouTube', 
    name: 'Video Thumbnail', 
    width: 1280, 
    height: 720, 
    ratio: '16:9', 
    note: 'Keep export file sizes strictly under 2MB platform limit' 
  },
  { 
    platform: 'YouTube', 
    name: 'Shorts', 
    width: 1080, 
    height: 1920, 
    ratio: '9:16', 
    note: 'Standard full vertical format',
    safeZone: { width: 1080, height: 1420 }
  },
  { 
    platform: 'YouTube', 
    name: 'Channel Banner', 
    width: 2560, 
    height: 1440, 
    ratio: '16:9', 
    note: 'Absolute safe area for text/logos is central 1546 × 423 px',
    safeZone: { width: 1546, height: 423 }
  },
  {
    platform: 'YouTube',
    name: 'Channel Logo (PFP)',
    width: 800,
    height: 800,
    ratio: '1:1',
    note: 'UI Circle Crop. Renders as small as 32px in comment feeds. Text wordmarks fail here.'
  },

  // TIKTOK PRESETS
  { 
    platform: 'TikTok', 
    name: 'Video / Cover Frame', 
    width: 1080, 
    height: 1920, 
    ratio: '9:16', 
    note: 'Avoid critical design elements in bottom 20% (UI overlay)',
    safeZone: { width: 1080, height: 1536 }
  },
  {
    platform: 'TikTok',
    name: 'Account Logo',
    width: 100,
    height: 100,
    ratio: '1:1',
    note: 'UI Circle Crop. Minimum requirement, exporting at 500x500 is safer for crispness.'
  },

  // PINTEREST PRESETS
  { 
    platform: 'Pinterest', 
    name: 'Standard Pin', 
    width: 1000, 
    height: 1500, 
    ratio: '2:3', 
    note: 'Vertical feed standard; longer aspects get cut off' 
  },
  { 
    platform: 'Pinterest', 
    name: 'Square Pin', 
    width: 1000, 
    height: 1000, 
    ratio: '1:1', 
    note: 'Primarily used for automated e-commerce catalog syncs' 
  },

  // WORDPRESS PRESETS
  {
    platform: 'WordPress',
    name: 'System: Thumbnail',
    width: 150,
    height: 150,
    ratio: '1:1',
    note: 'Core Default: Automatically cropped square; used in post grids/widgets.'
  },
  {
    platform: 'WordPress',
    name: 'System: Medium',
    width: 300,
    height: 300,
    ratio: 'Max 1:1 bounding box',
    note: 'Core Default: Proportional constraint (longest edge scales down to 300px).'
  },
  {
    platform: 'WordPress',
    name: 'System: Large',
    width: 1024,
    height: 1024,
    ratio: 'Max 1:1 bounding box',
    note: 'Core Default: Proportional constraint (longest edge scales down to 1024px).'
  },
  {
    platform: 'WordPress',
    name: 'Featured Image (Standard)',
    width: 1200,
    height: 630,
    ratio: '1.91:1',
    note: 'Theme Recommendation: Fits the content area cleanly and matches Open Graph requirements.',
    safeZone: { width: 1200, height: 576 }
  },
  {
    platform: 'WordPress',
    name: 'Featured Image (Alternate)',
    width: 1200,
    height: 900,
    ratio: '4:3',
    note: 'Theme Recommendation: Excellent for traditional or magazine-style portrait/landscape grids.'
  },
  {
    platform: 'WordPress',
    name: 'Hero Banner / Background',
    width: 1920,
    height: 1080,
    ratio: '16:9',
    note: 'Theme Recommendation: For full-width landing pages and desktop banners.'
  },
  {
    platform: 'WordPress',
    name: 'Site Logo',
    width: 250,
    height: 100,
    ratio: 'Highly Variable',
    note: 'Theme Recommendation: Transparent PNG usually works best; scales safely on retina displays.'
  },
  {
    platform: 'WordPress',
    name: 'Favicon / Site Icon',
    width: 512,
    height: 512,
    ratio: '1:1',
    note: 'System Requirement: Uploaded in customizer to generate all browser/mobile home screen shortcuts.'
  },
  {
    platform: 'WordPress',
    name: 'Site Logo (Horizontal)',
    width: 250,
    height: 100,
    ratio: '2.5:1',
    note: 'Theme Dependent. Highly variable, transparent PNG backgrounds are mandatory.'
  },
  {
    platform: 'WordPress',
    name: 'Favicon / App Icon',
    width: 512,
    height: 512,
    ratio: '1:1',
    note: 'UI Square. Displays in browser tabs and pinned mobile bookmarks.'
  },

  // GOOGLE BUSINESS PRESETS
  {
    platform: 'Google Business',
    name: 'Profile Logo',
    width: 720,
    height: 720,
    ratio: '1:1',
    note: 'UI Circle Crop. Essential for local business map markers.'
  },

  // APPLE / ANDROID PRESETS
  {
    platform: 'Apple / Android',
    name: 'App Store Icon',
    width: 1024,
    height: 1024,
    ratio: '1:1',
    note: 'UI Rounded Corner. Must be a full bleed square without pre-transpired corners.'
  },

  // PRODUCT HUNT PRESETS
  {
    platform: 'Product Hunt',
    name: 'Thumbnail',
    width: 240,
    height: 240,
    ratio: '1:1',
    note: 'Product Hunt post thumbnail/icon (square display).'
  },
  {
    platform: 'Product Hunt',
    name: 'Gallery',
    width: 1270,
    height: 760,
    ratio: '~1.67:1',
    note: 'Product Hunt product gallery image display dimension.'
  }
];
