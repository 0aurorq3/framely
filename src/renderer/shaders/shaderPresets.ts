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
