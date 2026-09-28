import { describe, expect, it } from 'vitest';
import {
  FRAMELY_AURORA_COLORS,
  FRAMELY_AURORA_PARAMS,
  FRAMELY_AURORA_PRESET_ID,
} from '../src/shared/framelyAurora';
import { shaderPresets } from '../src/renderer/shaders/shaderPresets';
import { drawStaticMeshGradient2D } from '../src/renderer/shaders/shaderFallback';
import { makeMockCtx } from './shared';

describe('Framely Aurora', () => {
  it('uses a true multi-colour palette', () => {
    expect(FRAMELY_AURORA_COLORS).toHaveLength(6);
    expect(new Set(FRAMELY_AURORA_COLORS).size).toBe(6);
    expect(FRAMELY_AURORA_PARAMS.mixing).toBeGreaterThan(0.8);
    expect(FRAMELY_AURORA_PARAMS.grainOverlay).toBeGreaterThan(0);
  });

  it('is the featured static-mesh preset', () => {
    const preset = shaderPresets.find((item) => item.id === FRAMELY_AURORA_PRESET_ID);

    expect(preset).toBeDefined();
    expect(preset?.type).toBe('staticMesh');
    expect(preset?.colors).toEqual(FRAMELY_AURORA_COLORS);
    expect(preset?.params).toMatchObject(FRAMELY_AURORA_PARAMS);
  });

  it('renders through the Canvas 2D fallback used when WebGL is unavailable', () => {
    const ctx = makeMockCtx();

    drawStaticMeshGradient2D(
      ctx,
      8,
      4,
      FRAMELY_AURORA_COLORS,
      FRAMELY_AURORA_PARAMS.positions,
      FRAMELY_AURORA_PARAMS.waveX,
      FRAMELY_AURORA_PARAMS.waveXShift,
      FRAMELY_AURORA_PARAMS.waveY,
      FRAMELY_AURORA_PARAMS.waveYShift,
      FRAMELY_AURORA_PARAMS.mixing,
      FRAMELY_AURORA_PARAMS.grainMixer,
      FRAMELY_AURORA_PARAMS.grainOverlay,
      FRAMELY_AURORA_PARAMS.scale,
      FRAMELY_AURORA_PARAMS.rotation,
      FRAMELY_AURORA_PARAMS.offsetX,
      FRAMELY_AURORA_PARAMS.offsetY,
    );

    expect(ctx.calls).toContain('createImageData(8,4)');
    expect(ctx.calls).toContain('putImageData');
  });
});
