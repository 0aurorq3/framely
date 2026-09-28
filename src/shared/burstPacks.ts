export interface BurstPackDefinition {
  id: string;
  name: string;
  description: string;
  presetKeys: string[];
}

export const BURST_PACKS: BurstPackDefinition[] = [
  {
    id: 'launch-kit',
    name: 'Launch Kit',
    description: 'OG link preview, X, LinkedIn, and Product Hunt',
    presetKeys: [
      'Open Graph - OG Standard',
      'X (Twitter) - In-Feed Landscape',
      'LinkedIn - Shared Link / Ad',
      'Product Hunt - Gallery',
    ],
  },
  {
    id: 'social-story-kit',
    name: 'Social Story Kit',
    description: 'Vertical story formats for IG, TikTok, and Pinterest',
    presetKeys: [
      'Instagram - Stories & Reels',
      'TikTok - Video / Cover Frame',
      'Pinterest - Standard Pin',
    ],
  },
];

export function getBurstPackById(id: string): BurstPackDefinition | undefined {
  return BURST_PACKS.find((pack) => pack.id === id);
}

export function resolvePresetKeys(packId: string | null, customKeys: string[]): string[] {
  if (packId) {
    const pack = getBurstPackById(packId);
    if (pack) return [...pack.presetKeys];
  }
  return [...new Set(customKeys)];
}