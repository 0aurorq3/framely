export const MIN_MESH_POINTS = 2;
export const MAX_MESH_POINTS = 10;

export function canAddMeshPoint(currentCount: number) {
  return currentCount < MAX_MESH_POINTS;
}

export function canRemoveMeshPoint(currentCount: number) {
  return currentCount > MIN_MESH_POINTS;
}

export function convertToPercentage(value: number) {
  return Math.round(value * 100);
}

export const MESH_FILTER_RANGES = {
  blur: { min: 10, max: 200, default: 60 },
  grain: { min: 0, max: 50, default: 15 },
  opacity: { min: 10, max: 100, default: 100 },
  spread: { min: 20, max: 200, default: 100 },
};

export const BLUR_DENSITY_RANGE = {
  min: 10,
  max: 100,
  default: 50,
};

export function filterGradientsByCategory(
  gradients: Array<{ category?: string }>,
  category: string
) {
  return gradients.filter(g => g.category === category);
}
