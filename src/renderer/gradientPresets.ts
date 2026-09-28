import gradientPresetsImport from '../../assets/presets.json';
import macosSonomaImg from './backgrounds/macos_sonoma.webp';
import windowsBloomBlueImg from './backgrounds/windows_bloom_blue.webp';
import macosBigSurImg from './backgrounds/macos_big_sur.webp';
import windowsHeroGlowImg from './backgrounds/windows_hero_glow.webp';
import glassLoopFluidImg from './backgrounds/glass_loop_fluid.webp';
import meshRedPinkImg from './backgrounds/mesh_red_pink.webp';
import meshPurpleOrangeImg from './backgrounds/mesh_purple_orange.webp';
import warmOrangeWaveImg from './backgrounds/warm_orange_wave.webp';
import tealYellowWaveImg from './backgrounds/teal_yellow_wave.webp';
import darkVioletWaveImg from './backgrounds/dark_violet_wave.webp';

export interface GradientPreset {
  id: string;
  name: string;
  gradient: string;
  type: 'gradient' | 'color';
  category?: 'classic' | 'os' | 'disney' | 'marvel' | 'hollywood';
  bgGrain?: number;
  lightRaysStyle?: 'none' | 'diagonal' | 'spotlight' | 'aurora';
  lightRaysOpacity?: number;
}

export const defaultGradients: GradientPreset[] = gradientPresetsImport as GradientPreset[];

export const solidPresets = [
  { id: 'white', name: 'White', color: '#ffffff', type: 'color' as const },
  { id: 'black', name: 'Black', color: '#090d16', type: 'color' as const },
  { id: 'slate', name: 'Slate', color: '#475569', type: 'color' as const },
  { id: 'indigo', name: 'Indigo', color: '#6366f1', type: 'color' as const },
  { id: 'emerald', name: 'Emerald', color: '#10b981', type: 'color' as const },
  { id: 'rose', name: 'Rose', color: '#f43f5e', type: 'color' as const },
  { id: 'amber', name: 'Amber', color: '#f59e0b', type: 'color' as const },
  { id: 'sky', name: 'Sky', color: '#0ea5e9', type: 'color' as const },
];

export const disneyHollywoodGradients: GradientPreset[] = [
  // FANTASY & ANIMATION THEMES (Inspired by classics)
  {
    id: 'playtime-clouds',
    name: 'Playtime Clouds',
    gradient: 'linear-gradient(135deg, #56ccf2 0%, #2f80ed 60%, #ffdf00 100%)',
    type: 'gradient',
    category: 'disney'
  },
  {
    id: 'fjord-ice',
    name: 'Fjord Ice Castle',
    gradient: 'linear-gradient(135deg, #e0f2fe 0%, #7dd3fc 35%, #0284c7 70%, #0369a1 100%)',
    type: 'gradient',
    category: 'disney'
  },
  {
    id: 'savannah-sunset',
    name: 'Savannah Sunset',
    gradient: 'linear-gradient(135deg, #1a0500 0%, #8b0000 35%, #ff4500 70%, #ffd700 100%)',
    type: 'gradient',
    category: 'disney'
  },
  {
    id: 'arabian-nightfall',
    name: 'Arabian Nightfall',
    gradient: 'linear-gradient(135deg, #0b132b 0%, #1c2541 30%, #5bc0be 70%, #fdf0cd 100%)',
    type: 'gradient',
    category: 'disney'
  },
  {
    id: 'mermaid-lagoon',
    name: 'Mermaid Lagoon',
    gradient: 'linear-gradient(135deg, #0d9488 0%, #06b6d4 35%, #f43f5e 75%, #ca8a04 100%)',
    type: 'gradient',
    category: 'disney'
  },
  {
    id: 'enchanted-ballroom',
    name: 'Enchanted Ballroom',
    gradient: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 40%, #ca8a04 80%, #fef08a 100%)',
    type: 'gradient',
    category: 'disney'
  },
  {
    id: 'polynesian-voyage',
    name: 'Polynesian Voyage',
    gradient: 'linear-gradient(135deg, #0ea5e9 0%, #0d9488 40%, #10b981 70%, #fef08a 100%)',
    type: 'gradient',
    category: 'disney'
  },
  {
    id: 'floating-lanterns',
    name: 'Floating Lanterns',
    gradient: 'linear-gradient(135deg, #1e1b4b 0%, #581c87 40%, #c084fc 75%, #fde047 100%)',
    type: 'gradient',
    category: 'disney'
  },
  {
    id: 'memories-marigold',
    name: 'Day of Memories',
    gradient: 'linear-gradient(135deg, #ff007f 0%, #7b2cbf 40%, #ff8c00 80%, #ffd700 100%)',
    type: 'gradient',
    category: 'disney'
  },
  {
    id: 'scare-floor',
    name: 'Scare Floor Teal & Lime',
    gradient: 'linear-gradient(135deg, #06b6d4 0%, #8b5cf6 50%, #84cc16 100%)',
    type: 'gradient',
    category: 'disney'
  },
  {
    id: 'reef-explorer',
    name: 'Reef Explorer',
    gradient: 'linear-gradient(135deg, #0284c7 0%, #0369a1 40%, #ff781f 80%, #ffffff 100%)',
    type: 'gradient',
    category: 'disney'
  },
  {
    id: 'island-ohana',
    name: 'Hawaiian Island Ohana',
    gradient: 'linear-gradient(135deg, #38bdf8 0%, #ef4444 50%, #22c55e 100%)',
    type: 'gradient',
    category: 'disney'
  },
  {
    id: 'grecian-hero',
    name: 'Zero to Grecian Hero',
    gradient: 'linear-gradient(135deg, #2e0854 0%, #e05a47 50%, #fdf0cd 100%)',
    type: 'gradient',
    category: 'disney'
  },
  {
    id: 'balloon-flight',
    name: 'Adventure Balloon Flight',
    gradient: 'linear-gradient(135deg, #ef4444 0%, #f59e0b 25%, #3b82f6 50%, #10b981 75%, #38bdf8 100%)',
    type: 'gradient',
    category: 'disney'
  },
  {
    id: 'blossom-reflection',
    name: 'Blossom Reflection',
    gradient: 'linear-gradient(135deg, #fda4af 0%, #f43f5e 35%, #0f766e 70%, #ca8a04 100%)',
    type: 'gradient',
    category: 'disney'
  },
  {
    id: 'midnight-slipper',
    name: 'Midnight Slipper',
    gradient: 'linear-gradient(135deg, #1e293b 0%, #38bdf8 50%, #c084fc 100%)',
    type: 'gradient',
    category: 'disney'
  },
  {
    id: 'core-memories',
    name: 'Core Memories',
    gradient: 'linear-gradient(135deg, #facc15 0%, #3b82f6 30%, #ef4444 60%, #a855f7 100%)',
    type: 'gradient',
    category: 'disney'
  },
  {
    id: 'space-ecology',
    name: 'Rusty Space Ecology',
    gradient: 'linear-gradient(135deg, #451a03 0%, #78350f 40%, #065f46 80%, #f8fafc 100%)',
    type: 'gradient',
    category: 'disney'
  },
  {
    id: 'astral-jazz',
    name: 'Astral Jazz',
    gradient: 'linear-gradient(135deg, #0c4a6e 0%, #0284c7 35%, #c084fc 70%, #f472b6 100%)',
    type: 'gradient',
    category: 'disney'
  },
  {
    id: 'sugar-rush',
    name: 'Sugar Rush Arcade',
    gradient: 'linear-gradient(135deg, #ec4899 0%, #f472b6 40%, #10b981 85%, #facc15 100%)',
    type: 'gradient',
    category: 'disney'
  },

  // HEROIC COMICS THEMES
  {
    id: 'reactor-core',
    name: 'Reactor Core Red & Gold',
    gradient: 'linear-gradient(135deg, #b91c1c 0%, #ea580c 45%, #eab308 100%)',
    type: 'gradient',
    category: 'marvel'
  },
  {
    id: 'vibranium-royal',
    name: 'Vibranium Royal Purple',
    gradient: 'linear-gradient(135deg, #1e0030 0%, #5d0c8c 50%, #ca8a04 100%)',
    type: 'gradient',
    category: 'marvel'
  },
  {
    id: 'multiverse-neon',
    name: 'Multiverse Neon Spray',
    gradient: 'linear-gradient(135deg, #ff007f 0%, #7b2cbf 50%, #00f5d4 100%)',
    type: 'gradient',
    category: 'marvel'
  },
  {
    id: 'hero-alliance',
    name: 'Hero Alliance Assembly',
    gradient: 'linear-gradient(135deg, #000c24 0%, #0b3c5d 50%, #328cc1 100%)',
    type: 'gradient',
    category: 'marvel'
  },
  {
    id: 'voltage-surge',
    name: 'High-Voltage Surge',
    gradient: 'linear-gradient(135deg, #0284c7 0%, #3b82f6 50%, #00f260 100%)',
    type: 'gradient',
    category: 'marvel'
  },

  // CINEMATIC & GOLDEN GLAMOUR
  {
    id: 'bubblegum-dollhouse',
    name: 'Bubblegum Dollhouse',
    gradient: 'linear-gradient(135deg, #ff758c 0%, #ff7eb3 50%, #fecfef 100%)',
    type: 'gradient',
    category: 'hollywood'
  },
  {
    id: 'red-carpet-gold',
    name: 'Red Carpet Gold',
    gradient: 'linear-gradient(135deg, #111111 0%, #3a301d 30%, #c5a059 70%, #fdf0cd 100%)',
    type: 'gradient',
    category: 'hollywood'
  },
  {
    id: 'space-saber',
    name: 'Deep Space Saber',
    gradient: 'linear-gradient(135deg, #020024 0%, #090979 35%, #00d4ff 100%)',
    type: 'gradient',
    category: 'hollywood'
  },
  {
    id: 'vintage-cinema',
    name: 'Vintage Cinema Glamour',
    gradient: 'linear-gradient(135deg, #b82e1f 0%, #e05a47 50%, #fcdcd4 100%)',
    type: 'gradient',
    category: 'hollywood'
  },
  {
    id: 'cinema-glamour',
    name: 'Cinema Glamour',
    gradient: 'linear-gradient(135deg, #b91c1c 0%, #fdf0cd 45%, #c5a059 80%, #111111 100%)',
    type: 'gradient',
    category: 'hollywood'
  },
  {
    id: 'galactic-saber',
    name: 'Galactic Saber',
    gradient: 'linear-gradient(135deg, #030712 0%, #1d4ed8 40%, #06b6d4 75%, #ec4899 100%)',
    type: 'gradient',
    category: 'hollywood'
  },
  {
    id: 'linear-glow',
    name: 'Linear Glow (Effects)',
    gradient: 'linear-gradient(135deg, rgba(168, 85, 247, 0.6) 0%, rgba(217, 70, 239, 0) 35%), linear-gradient(120deg, rgba(217, 70, 239, 0.45) 5%, rgba(217, 70, 239, 0) 45%), linear-gradient(135deg, rgba(168, 85, 247, 0.5) 0%, rgba(168, 85, 247, 0) 20%, rgba(217, 70, 239, 0.6) 24%, rgba(217, 70, 239, 0) 38%, rgba(139, 92, 246, 0.5) 42%, rgba(139, 92, 246, 0) 60%), linear-gradient(135deg, #3b0082 0%, #0a0026 50%, #061233 100%)',
    type: 'gradient',
    category: 'hollywood',
    bgGrain: 22,
    lightRaysStyle: 'diagonal',
    lightRaysOpacity: 45
  },
  {
    id: 'cyberpunk-aurora',
    name: 'Cyberpunk Aurora (Effects)',
    gradient: 'linear-gradient(135deg, #0b132b 0%, #1c2541 40%, #7209b7 100%)',
    type: 'gradient',
    category: 'hollywood',
    bgGrain: 20,
    lightRaysStyle: 'aurora',
    lightRaysOpacity: 40
  },
  {
    id: 'studio-spotlight',
    name: 'Studio Spotlight (Effects)',
    gradient: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
    type: 'gradient',
    category: 'hollywood',
    bgGrain: 10,
    lightRaysStyle: 'spotlight',
    lightRaysOpacity: 50
  },
  {
    id: 'mesh-red-pink',
    name: 'Mesh Red Pink',
    gradient: `url(${meshRedPinkImg})`,
    type: 'gradient',
    category: 'os'
  },
  {
    id: 'mesh-purple-orange',
    name: 'Mesh Purple Orange',
    gradient: `url(${meshPurpleOrangeImg})`,
    type: 'gradient',
    category: 'os'
  },
  {
    id: 'warm-orange-wave',
    name: 'Warm Orange Wave',
    gradient: `url(${warmOrangeWaveImg})`,
    type: 'gradient',
    category: 'os'
  },
  {
    id: 'teal-yellow-wave',
    name: 'Teal Yellow Textured Wave',
    gradient: `url(${tealYellowWaveImg})`,
    type: 'gradient',
    category: 'os'
  },
  {
    id: 'dark-violet-wave',
    name: 'Dark Violet Wave',
    gradient: `url(${darkVioletWaveImg})`,
    type: 'gradient',
    category: 'os'
  },
  {
    id: 'macos-big-sur',
    name: 'macOS Big Sur',
    gradient: `url(${macosBigSurImg})`,
    type: 'gradient',
    category: 'os'
  },
  {
    id: 'macos-ventura',
    name: 'macOS Ventura',
    gradient: 'linear-gradient(135deg, #f97316 0%, #db2777 50%, #7c3aed 100%)',
    type: 'gradient',
    category: 'os'
  },
  {
    id: 'blue-green-wave',
    name: 'Blue Green Wave',
    gradient: 'linear-gradient(135deg, #0ea5e9 0%, #0d9488 40%, #10b981 100%)',
    type: 'gradient',
    category: 'os'
  },
  {
    id: 'macos-sonoma',
    name: 'macOS Sonoma',
    gradient: `url(${macosSonomaImg})`,
    type: 'gradient',
    category: 'os'
  },
  {
    id: 'peach-cyan-gradient',
    name: 'Peach Cyan Soft Gradient',
    gradient: 'linear-gradient(135deg, #fda4af 0%, #fecfef 40%, #a5f3fc 100%)',
    type: 'gradient',
    category: 'os'
  },
  {
    id: 'windows-hero-glow',
    name: 'Windows Hero Glow',
    gradient: `url(${windowsHeroGlowImg})`,
    type: 'gradient',
    category: 'os'
  },
  {
    id: 'layered-pastel-ribbons',
    name: 'Layered Pastel Ribbons',
    gradient: 'radial-gradient(circle at 10% 20%, rgba(253, 164, 186, 0.4) 0%, transparent 60%), radial-gradient(circle at 80% 80%, rgba(165, 243, 252, 0.5) 0%, transparent 60%), linear-gradient(135deg, #e0f2fe 0%, #fef08a 100%)',
    type: 'gradient',
    category: 'os'
  },
  {
    id: 'windows-bloom-blue',
    name: 'Windows 11 Bloom Blue',
    gradient: `url(${windowsBloomBlueImg})`,
    type: 'gradient',
    category: 'os'
  },
  {
    id: 'windows-bloom-dark',
    name: 'Windows 11 Bloom Dark',
    gradient: 'radial-gradient(circle at 80% 20%, #1d4ed8 0%, transparent 50%), radial-gradient(circle at 20% 80%, #7c3aed 0%, transparent 50%), linear-gradient(135deg, #0f172a 0%, #020617 100%)',
    type: 'gradient',
    category: 'os'
  },
  {
    id: 'neon-ribbon-splash',
    name: 'Neon Ribbon Splash',
    gradient: 'radial-gradient(circle at 30% 30%, #ec4899 0%, transparent 40%), radial-gradient(circle at 70% 70%, #06b6d4 0%, transparent 45%), linear-gradient(135deg, #000000 0%, #0f172a 100%)',
    type: 'gradient',
    category: 'os'
  },
  {
    id: 'glass-loop-fluid',
    name: 'Glass Loop Fluid',
    gradient: `url(${glassLoopFluidImg})`,
    type: 'gradient',
    category: 'os'
  },
  {
    id: 'windows-bloom-pink',
    name: 'Windows 11 Bloom Pink',
    gradient: 'radial-gradient(circle at 50% 50%, #fecfef 0%, #fda4af 50%, #f43f5e 100%)',
    type: 'gradient',
    category: 'os'
  },
  {
    id: 'windows-bloom-grey',
    name: 'Windows 11 Bloom Grey',
    gradient: 'radial-gradient(circle at 30% 30%, #e2e8f0 0%, #cbd5e1 50%, #94a3b8 100%)',
    type: 'gradient',
    category: 'os'
  },
  {
    id: 'glass-liquid-droplets',
    name: 'Glass Liquid Droplets',
    gradient: 'radial-gradient(circle at 20% 20%, #ea580c 0%, transparent 50%), radial-gradient(circle at 80% 80%, #475569 0%, transparent 50%), linear-gradient(135deg, #090d16 0%, #000000 100%)',
    type: 'gradient',
    category: 'os'
  },
  {
    id: 'colorful-wireframe-ribbon',
    name: 'Colorful Wireframe Ribbon',
    gradient: 'linear-gradient(90deg, rgba(239,68,68,0.15) 0%, rgba(245,158,11,0.15) 20%, rgba(16,185,129,0.15) 40%, rgba(59,130,246,0.15) 60%, rgba(139,92,246,0.15) 80%, rgba(236,72,153,0.15) 100%), #000000',
    type: 'gradient',
    category: 'os'
  }
];
