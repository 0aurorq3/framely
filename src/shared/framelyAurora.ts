/**
 * Framely's signature background: a soft, six-colour aurora inspired by
 * daylight passing through frosted glass. Keeping the recipe in shared code
 * makes the live preview, saved projects, and export renderer use one source
 * of truth.
 */
export const FRAMELY_AURORA_COLORS = [
  '#356FE8',
  '#62B7FF',
  '#73E1F4',
  '#D4EEFF',
  '#735CF2',
  '#B58CFF',
];

export const FRAMELY_AURORA_PARAMS = {
  positions: 58,
  waveX: 0.18,
  waveXShift: 0.12,
  waveY: 0.24,
  waveYShift: 0.72,
  mixing: 0.86,
  grainMixer: 0.025,
  grainOverlay: 0.035,
  scale: 1.08,
  rotation: 10,
  offsetX: -0.02,
  offsetY: 0.02,
};

export const FRAMELY_AURORA_PRESET_ID = 'framely-aurora';
export const FRAMELY_AURORA_PRESET_NAME = 'Framely Aurora';
