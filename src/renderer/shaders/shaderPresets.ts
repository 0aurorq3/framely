import {
  FRAMELY_AURORA_COLORS,
  FRAMELY_AURORA_PARAMS,
  FRAMELY_AURORA_PRESET_ID,
  FRAMELY_AURORA_PRESET_NAME,
} from '../../shared/framelyAurora';

export type ShaderType = 'staticMesh' | 'grainGradient' | 'dotGrid' | 'pulsingBorder';

export type GrainGradientShape = 'wave' | 'dots' | 'truchet' | 'corners' | 'ripple';
export type DotGridShape = 'circle' | 'diamond' | 'square' | 'triangle';
export type PulsingBorderAspectRatio = 'auto' | 'square';

export interface StaticMeshGradientParams {
  positions: number;
  waveX: number;
  waveXShift: number;
  waveY: number;
  waveYShift: number;
  mixing: number;
  grainMixer: number;
  grainOverlay: number;
  scale: number;
  rotation: number;
  offsetX: number;
  offsetY: number;
}

export interface GrainGradientParams {
  shape: GrainGradientShape;
  softness: number;
  intensity: number;
  noise: number;
}

export interface DotGridParams {
  shape: DotGridShape;
  size: number;
  gapX: number;
  gapY: number;
  strokeWidth: number;
  sizeRange: number;
  opacityRange: number;
  scale: number;
  rotation: number;
  offsetX: number;
  offsetY: number;
}

export interface PulsingBorderParams {
  colorBack: string;
  roundness: number;
  thickness: number;
  softness: number;
  aspectRatio: PulsingBorderAspectRatio;
  intensity: number;
  bloom: number;
  spots: number;
  spotSize: number;
  pulse: number;
  smoke: number;
  smokeSize: number;
  marginLeft: number;
  marginRight: number;
  marginTop: number;
  marginBottom: number;
  scale: number;
  rotation: number;
  offsetX: number;
  offsetY: number;
}

export type ShaderParams = StaticMeshGradientParams | GrainGradientParams | DotGridParams | PulsingBorderParams;

export interface ShaderPreset {
  id: string;
  name: string;
  type: ShaderType;
  colors: string[];
  params: ShaderParams;
}

export const DEFAULT_STATIC_MESH_PARAMS: StaticMeshGradientParams = {
  positions: 50,
  waveX: 0.3,
  waveXShift: 0.25,
  waveY: 0.3,
  waveYShift: 0.75,
  mixing: 0.5,
  grainMixer: 0,
  grainOverlay: 0,
  scale: 1,
  rotation: 0,
  offsetX: 0,
  offsetY: 0,
};

export const DEFAULT_GRAIN_GRADIENT_PARAMS: GrainGradientParams = {
  shape: 'wave',
  softness: 0.5,
  intensity: 0,
  noise: 0,
};

export const DEFAULT_DOT_GRID_PARAMS: DotGridParams = {
  shape: 'circle',
  size: 2,
  gapX: 32,
  gapY: 32,
  strokeWidth: 0,
  sizeRange: 0,
  opacityRange: 0,
  scale: 1,
  rotation: 0,
  offsetX: 0,
  offsetY: 0,
};

export const DEFAULT_PULSING_BORDER_PARAMS: PulsingBorderParams = {
  colorBack: '#000000',
  roundness: 0,
  thickness: 0.05,
  softness: 0,
  aspectRatio: 'auto',
  intensity: 0.85,
  bloom: 0.85,
  spots: 3,
  spotSize: 0.88,
  pulse: 0,
  smoke: 0,
  smokeSize: 0.42,
  marginLeft: 0,
  marginRight: 0,
  marginTop: 0,
  marginBottom: 0,
  scale: 1,
  rotation: 160,
  offsetX: 0,
  offsetY: 0,
};

function meshPreset(
  id: string,
  name: string,
  colors: string[],
  params: Partial<StaticMeshGradientParams>,
): ShaderPreset {
  return { id, name, type: 'staticMesh', colors, params: { ...DEFAULT_STATIC_MESH_PARAMS, ...params } };
}

export const shaderPresets: ShaderPreset[] = [
  {
    id: FRAMELY_AURORA_PRESET_ID,
    name: FRAMELY_AURORA_PRESET_NAME,
    type: 'staticMesh',
    colors: [...FRAMELY_AURORA_COLORS],
    params: { ...FRAMELY_AURORA_PARAMS },
  },
  {
    id: 'aurora-mesh',
    name: 'Aurora Mesh',
    type: 'staticMesh',
    colors: ['#5100ff', '#00ff80', '#ffcc00', '#ea00ff'],
    params: { ...DEFAULT_STATIC_MESH_PARAMS, mixing: 0.6, waveX: 0.4, waveY: 0.4 },
  },
  {
    id: 'sunset-mesh',
    name: 'Sunset Mesh',
    type: 'staticMesh',
    colors: ['#ff5f6d', '#ffc371', '#ff0080', '#7928ca'],
    params: { ...DEFAULT_STATIC_MESH_PARAMS, positions: 30, mixing: 0.7 },
  },
  {
    id: 'ocean-mesh',
    name: 'Ocean Mesh',
    type: 'staticMesh',
    colors: ['#00c6ff', '#0072ff', '#00d2ff', '#3a7bd5'],
    params: { ...DEFAULT_STATIC_MESH_PARAMS, waveX: 0.5, waveY: 0.2 },
  },
  {
    id: 'neon-mesh',
    name: 'Neon Mesh',
    type: 'staticMesh',
    colors: ['#00f2fe', '#4facfe', '#f093fb', '#f5576c'],
    params: { ...DEFAULT_STATIC_MESH_PARAMS },
  },
  {
    id: 'forest-mesh',
    name: 'Forest Mesh',
    type: 'staticMesh',
    colors: ['#134e5e', '#71b280', '#56ab2f', '#a8e063'],
    params: { ...DEFAULT_STATIC_MESH_PARAMS, mixing: 0.4 },
  },
  meshPreset('rose-quartz-mesh', 'Rose Quartz',
    ['#fff1f2', '#fecdd3', '#f9a8d4', '#e9d5ff', '#fdf4ff'],
    { positions: 62, mixing: 0.78, waveX: 0.2, waveY: 0.32, rotation: 18 }),
  meshPreset('peach-sorbet-mesh', 'Peach Sorbet',
    ['#fff7ed', '#fed7aa', '#fda4af', '#fb7185', '#fff1f2'],
    { positions: 38, mixing: 0.72, waveX: 0.24, waveY: 0.42, rotation: 328 }),
  meshPreset('apricot-glow-mesh', 'Apricot Glow',
    ['#fff8e1', '#ffdda1', '#ffb089', '#f47868', '#ffe8c2'],
    { positions: 72, mixing: 0.7, waveX: 0.36, waveY: 0.18, rotation: 42 }),
  meshPreset('golden-hour-mesh', 'Golden Hour',
    ['#fffbeb', '#fcd34d', '#fb923c', '#f472b6', '#7c3aed'],
    { positions: 24, mixing: 0.58, waveX: 0.42, waveY: 0.3, rotation: 12 }),
  meshPreset('amber-silk-mesh', 'Amber Silk',
    ['#451a03', '#b45309', '#f59e0b', '#fde68a', '#fef3c7'],
    { positions: 56, mixing: 0.8, waveX: 0.16, waveY: 0.38, rotation: 145 }),
  meshPreset('coral-reef-mesh', 'Coral Reef',
    ['#fff1f2', '#fb7185', '#fda4af', '#5eead4', '#0d9488'],
    { positions: 45, mixing: 0.52, waveX: 0.38, waveY: 0.34, waveYShift: 0.56, rotation: 28 }),
  meshPreset('ruby-velvet-mesh', 'Ruby Velvet',
    ['#280c24', '#881337', '#be123c', '#f43f5e', '#fda4af'],
    { positions: 68, mixing: 0.76, waveX: 0.3, waveY: 0.22, rotation: 198 }),
  meshPreset('desert-bloom-mesh', 'Desert Bloom',
    ['#fff7ed', '#e9c8a3', '#cf886d', '#f3b6a2', '#c7d6ba'],
    { positions: 34, mixing: 0.74, waveX: 0.22, waveY: 0.26, rotation: 72 }),
  meshPreset('lavender-mist-mesh', 'Lavender Mist',
    ['#faf5ff', '#e9d5ff', '#c4b5fd', '#ddd6fe', '#fbcfe8'],
    { positions: 64, mixing: 0.84, waveX: 0.18, waveY: 0.28, scale: 1.12, rotation: 8 }),
  meshPreset('lilac-dream-mesh', 'Lilac Dream',
    ['#f5f3ff', '#a78bfa', '#c084fc', '#e879f9', '#fdf4ff'],
    { positions: 42, mixing: 0.64, waveX: 0.34, waveY: 0.32, rotation: 316 }),
  meshPreset('orchid-glow-mesh', 'Orchid Glow',
    ['#3b0764', '#9333ea', '#e879f9', '#fbcfe8', '#a5b4fc'],
    { positions: 76, mixing: 0.7, waveX: 0.26, waveY: 0.38, waveXShift: 0.52, rotation: 36 }),
  meshPreset('cosmic-dusk-mesh', 'Cosmic Dusk',
    ['#0f172a', '#312e81', '#6d28d9', '#c026d3', '#f472b6'],
    { positions: 28, mixing: 0.66, waveX: 0.42, waveY: 0.26, rotation: 214 }),
  meshPreset('electric-violet-mesh', 'Electric Violet',
    ['#140b3b', '#5b21b6', '#8b5cf6', '#a78bfa', '#22d3ee'],
    { positions: 54, mixing: 0.5, waveX: 0.44, waveY: 0.32, rotation: 338 }),
  meshPreset('midnight-aurora-mesh', 'Midnight Aurora',
    ['#020617', '#0c4a6e', '#2563eb', '#7c3aed', '#2dd4bf'],
    { positions: 70, mixing: 0.62, waveX: 0.2, waveY: 0.46, scale: 1.08, rotation: 24 }),
  meshPreset('ice-blue-mesh', 'Ice Blue',
    ['#f0f9ff', '#e0f2fe', '#bae6fd', '#93c5fd', '#c7d2fe'],
    { positions: 48, mixing: 0.82, waveX: 0.16, waveY: 0.24, rotation: 12 }),
  meshPreset('glacier-mesh', 'Glacier',
    ['#eff6ff', '#67e8f9', '#38bdf8', '#60a5fa', '#f8fafc'],
    { positions: 32, mixing: 0.64, waveX: 0.38, waveY: 0.2, rotation: 162 }),
  meshPreset('blue-hour-mesh', 'Blue Hour',
    ['#0f172a', '#1e3a8a', '#3b82f6', '#93c5fd', '#dbeafe'],
    { positions: 58, mixing: 0.74, waveX: 0.22, waveY: 0.34, rotation: 286 }),
  meshPreset('arctic-lagoon-mesh', 'Arctic Lagoon',
    ['#f0fdfa', '#99f6e4', '#5eead4', '#67e8f9', '#cffafe'],
    { positions: 66, mixing: 0.76, waveX: 0.32, waveY: 0.18, rotation: 48 }),
  meshPreset('emerald-tide-mesh', 'Emerald Tide',
    ['#022c22', '#047857', '#10b981', '#6ee7b7', '#a5f3fc'],
    { positions: 40, mixing: 0.6, waveX: 0.24, waveY: 0.4, rotation: 126 }),
  meshPreset('mint-cloud-mesh', 'Mint Cloud',
    ['#f7fee7', '#d9f99d', '#bbf7d0', '#a7f3d0', '#f0fdf4'],
    { positions: 74, mixing: 0.8, waveX: 0.18, waveY: 0.28, rotation: 352 }),
  meshPreset('sage-linen-mesh', 'Sage Linen',
    ['#fafaf9', '#d6dfce', '#a7bea4', '#c6d4bc', '#e7e5e4'],
    { positions: 46, mixing: 0.84, waveX: 0.2, waveY: 0.22, rotation: 22 }),
  meshPreset('matcha-mesh', 'Matcha',
    ['#fefce8', '#e9edc9', '#a3b18a', '#588157', '#f4f1de'],
    { positions: 30, mixing: 0.68, waveX: 0.3, waveY: 0.24, rotation: 104 }),
  meshPreset('olive-gold-mesh', 'Olive Gold',
    ['#1a2e05', '#4d7c0f', '#a3b18a', '#d9b44a', '#fef3c7'],
    { positions: 60, mixing: 0.66, waveX: 0.24, waveY: 0.36, rotation: 244 }),
  meshPreset('sea-glass-mesh', 'Sea Glass',
    ['#ecfeff', '#bae6c8', '#a8dadc', '#8db3bc', '#e5eef0'],
    { positions: 52, mixing: 0.78, waveX: 0.3, waveY: 0.18, waveXShift: 0.42, rotation: 64 }),
  meshPreset('sandstone-mesh', 'Sandstone',
    ['#fffbeb', '#e8d2b4', '#c9a987', '#a77d5b', '#f2e8db'],
    { positions: 36, mixing: 0.76, waveX: 0.2, waveY: 0.32, rotation: 156 }),
  meshPreset('cocoa-cream-mesh', 'Cocoa Cream',
    ['#291c17', '#6b4f3f', '#a67c62', '#dec3a7', '#fff4e6'],
    { positions: 68, mixing: 0.82, waveX: 0.26, waveY: 0.18, rotation: 304 }),
  meshPreset('silver-mist-mesh', 'Silver Mist',
    ['#ffffff', '#e2e8f0', '#cbd5e1', '#a8b2c3', '#f1f5f9'],
    { positions: 44, mixing: 0.86, waveX: 0.16, waveY: 0.2, rotation: 20 }),
  meshPreset('graphite-glow-mesh', 'Graphite Glow',
    ['#09090b', '#27272a', '#52525b', '#a1a1aa', '#e4e4e7'],
    { positions: 64, mixing: 0.72, waveX: 0.26, waveY: 0.3, rotation: 218 }),
  meshPreset('iridescent-pearl-mesh', 'Iridescent Pearl',
    ['#ffffff', '#fae8ff', '#dbeafe', '#ccfbf1', '#fef3c7'],
    { positions: 78, mixing: 0.74, waveX: 0.34, waveY: 0.28, scale: 1.06, rotation: 34 }),
  meshPreset('prism-mesh', 'Prism',
    ['#f472b6', '#fb923c', '#fde047', '#34d399', '#38bdf8', '#a78bfa'],
    { positions: 26, mixing: 0.46, waveX: 0.42, waveY: 0.38, rotation: 346 }),
  {
    id: 'pastel-wave',
    name: 'Pastel Wave',
    type: 'grainGradient',
    colors: ['#ffecd2', '#fcb69f', '#a1c4fd', '#c2e9fb'],
    params: { ...DEFAULT_GRAIN_GRADIENT_PARAMS, shape: 'wave', softness: 0.6 },
  },
  {
    id: 'neon-grain',
    name: 'Neon Grain',
    type: 'grainGradient',
    colors: ['#f093fb', '#f5576c', '#4facfe', '#00f2fe'],
    params: { ...DEFAULT_GRAIN_GRADIENT_PARAMS, shape: 'ripple' },
  },
  {
    id: 'ocean-ripple',
    name: 'Ocean Ripple',
    type: 'grainGradient',
    colors: ['#00c6ff', '#0072ff', '#00d2ff'],
    params: { ...DEFAULT_GRAIN_GRADIENT_PARAMS, shape: 'ripple', softness: 0.4 },
  },
  {
    id: 'warm-wave',
    name: 'Warm Wave',
    type: 'grainGradient',
    colors: ['#fa709a', '#fee140', '#ff9a9e', '#fad0c4'],
    params: { ...DEFAULT_GRAIN_GRADIENT_PARAMS, shape: 'wave' },
  },
  {
    id: 'cosmic-dots',
    name: 'Cosmic Dots',
    type: 'grainGradient',
    colors: ['#667eea', '#764ba2', '#f093fb'],
    params: { ...DEFAULT_GRAIN_GRADIENT_PARAMS, shape: 'dots', softness: 0.7 },
  },
  {
    id: 'dot-grid-classic',
    name: 'Classic Dot Grid',
    type: 'dotGrid',
    colors: ['#000000', '#ffffff', '#ffaa00'],
    params: { ...DEFAULT_DOT_GRID_PARAMS },
  },
  {
    id: 'dot-grid-indigo',
    name: 'Indigo Diamonds',
    type: 'dotGrid',
    colors: ['#0b0c10', '#4f46e5', '#818cf8'],
    params: { ...DEFAULT_DOT_GRID_PARAMS, shape: 'diamond', size: 4, gapX: 24, gapY: 24 },
  },
  {
    id: 'dot-grid-matrix',
    name: 'Matrix Grid',
    type: 'dotGrid',
    colors: ['#050c05', '#00ff66', '#00aa33'],
    params: { ...DEFAULT_DOT_GRID_PARAMS, shape: 'square', size: 6, gapX: 40, gapY: 40, opacityRange: 0.4 },
  },
  {
    id: 'dot-grid-sunset',
    name: 'Sunset Triangles',
    type: 'dotGrid',
    colors: ['#1a0b2e', '#ff4b2b', '#ff416c'],
    params: { ...DEFAULT_DOT_GRID_PARAMS, shape: 'triangle', size: 8, gapX: 48, gapY: 48, sizeRange: 0.3 },
  },
  {
    id: 'border-default',
    name: 'Default Border',
    type: 'pulsingBorder',
    colors: ['#83afec'],
    params: { ...DEFAULT_PULSING_BORDER_PARAMS },
  },
  {
    id: 'border-circle',
    name: 'Circle Glow',
    type: 'pulsingBorder',
    colors: ['#ff4500', '#ff8c00'],
    params: { ...DEFAULT_PULSING_BORDER_PARAMS, roundness: 1.0, thickness: 0.08, spots: 4, spotSize: 0.5 },
  },
  {
    id: 'border-aurora',
    name: 'Northern lights',
    type: 'pulsingBorder',
    colors: ['#00ffcc', '#00ff66', '#00ffff'],
    params: { ...DEFAULT_PULSING_BORDER_PARAMS, thickness: 0.12, spots: 4, spotSize: 0.7, smoke: 0.5, smokeSize: 0.6, bloom: 0.9 },
  },
  {
    id: 'border-solid',
    name: 'Solid line',
    type: 'pulsingBorder',
    colors: ['#ff00ff'],
    params: { ...DEFAULT_PULSING_BORDER_PARAMS, thickness: 0.03, softness: 0, bloom: 0, intensity: 1.0 },
  },
];

export const SHAPE_LABELS: Record<GrainGradientShape, string> = {
  wave: 'Wave',
  dots: 'Dots',
  truchet: 'Truchet',
  corners: 'Corners',
  ripple: 'Ripple',
};

export const SHAPE_OPTIONS: GrainGradientShape[] = ['wave', 'dots', 'truchet', 'corners', 'ripple'];

export const DOT_GRID_SHAPE_LABELS: Record<DotGridShape, string> = {
  circle: 'Circle',
  diamond: 'Diamond',
  square: 'Square',
  triangle: 'Triangle',
};

export const DOT_GRID_SHAPE_OPTIONS: DotGridShape[] = ['circle', 'diamond', 'square', 'triangle'];

export const PULSING_BORDER_ASPECT_RATIO_LABELS: Record<PulsingBorderAspectRatio, string> = {
  auto: 'Auto',
  square: 'Square',
};

export const PULSING_BORDER_ASPECT_RATIO_OPTIONS: PulsingBorderAspectRatio[] = ['auto', 'square'];
