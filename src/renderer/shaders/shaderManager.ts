import type { ShaderType, ShaderParams } from './shaderPresets';
import type { StaticMeshGradientParams, GrainGradientParams, DotGridParams, PulsingBorderParams } from './shaderPresets';
import { drawStaticMeshGradient2D, drawGrainGradient2D } from './shaderFallback';
import { drawDotGrid2D } from './shaderDotGridFallback';
import { drawPulsingBorder2D } from './shaderPulsingBorderFallback';
import { renderGrainGradientWebGL, renderStaticMeshWebGL, renderDotGridWebGL, renderPulsingBorderWebGL } from './shaderWebGL';

/** Try WebGL first, fall back to Canvas 2D if unavailable */
export function renderShaderToCanvas(
  type: ShaderType,
  colors: string[],
  params: ShaderParams,
  width: number,
  height: number
): HTMLCanvasElement | null {
  // Attempt real WebGL rendering
  const webglCanvas = renderShaderWebGLCanvas(type, colors, params, width, height);
  if (webglCanvas) return webglCanvas;

  // Fall back to Canvas 2D approximation
  return renderShader2DFallback(type, colors, params, width, height);
}

function renderShaderWebGLCanvas(
  type: ShaderType,
  colors: string[],
  params: ShaderParams,
  width: number,
  height: number
): HTMLCanvasElement | null {
  if (type === 'staticMesh') {
    const p = params as StaticMeshGradientParams;
    return renderStaticMeshWebGL(
      width, height, colors,
      p.positions, p.waveX, p.waveXShift, p.waveY, p.waveYShift,
      p.mixing, p.grainMixer, p.grainOverlay,
      p.scale ?? 1, p.rotation ?? 0, p.offsetX ?? 0, p.offsetY ?? 0
    );
  } else if (type === 'dotGrid') {
    const p = params as DotGridParams;
    return renderDotGridWebGL(
      width, height, colors,
      p.shape, p.size, p.gapX, p.gapY, p.strokeWidth,
      p.sizeRange, p.opacityRange,
      p.scale ?? 1, p.rotation ?? 0, p.offsetX ?? 0, p.offsetY ?? 0
    );
  } else if (type === 'pulsingBorder') {
    const p = params as PulsingBorderParams;
    return renderPulsingBorderWebGL(
      width, height, colors,
      p.colorBack ?? '#000000',
      p.roundness, p.thickness, p.softness, p.aspectRatio,
      p.intensity, p.bloom, p.spots, p.spotSize,
      p.pulse, p.smoke, p.smokeSize,
      p.marginLeft, p.marginRight, p.marginTop, p.marginBottom,
      p.scale ?? 1, p.rotation ?? 0, p.offsetX ?? 0, p.offsetY ?? 0
    );
  }
  const p = params as GrainGradientParams;
  return renderGrainGradientWebGL(width, height, colors, p.shape, p.softness, p.intensity, p.noise);
}

function renderShader2DFallback(
  type: ShaderType,
  colors: string[],
  params: ShaderParams,
  width: number,
  height: number
): HTMLCanvasElement | null {
  // Cap 2D fallback at the shader reference width so pattern density matches the preview
  const maxW = 800;
  let renderW = width;
  let renderH = height;
  if (width > maxW) {
    const scaleFactor = maxW / width;
    renderW = maxW;
    renderH = Math.round(height * scaleFactor);
  }

  const canvas = document.createElement('canvas');
  canvas.width = renderW;
  canvas.height = renderH;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  if (type === 'staticMesh') {
    const p = params as StaticMeshGradientParams;
    drawStaticMeshGradient2D(
      ctx, renderW, renderH, colors,
      p.positions, p.waveX, p.waveXShift, p.waveY, p.waveYShift,
      p.mixing, p.grainMixer, p.grainOverlay,
      p.scale ?? 1, p.rotation ?? 0, p.offsetX ?? 0, p.offsetY ?? 0
    );
  } else if (type === 'dotGrid') {
    const p = params as DotGridParams;
    drawDotGrid2D(
      ctx, renderW, renderH, colors,
      p.shape, p.size, p.gapX, p.gapY, p.strokeWidth,
      p.sizeRange, p.opacityRange,
      p.scale ?? 1, p.rotation ?? 0, p.offsetX ?? 0, p.offsetY ?? 0
    );
  } else if (type === 'pulsingBorder') {
    const p = params as PulsingBorderParams;
    drawPulsingBorder2D(
      ctx, renderW, renderH, colors,
      p.colorBack ?? '#000000',
      p.roundness, p.thickness, p.softness, p.aspectRatio,
      p.intensity, p.bloom, p.spots, p.spotSize,
      p.pulse, p.smoke, p.smokeSize,
      p.marginLeft, p.marginRight, p.marginTop, p.marginBottom,
      p.scale ?? 1, p.rotation ?? 0, p.offsetX ?? 0, p.offsetY ?? 0
    );
  } else {
    const p = params as GrainGradientParams;
    drawGrainGradient2D(ctx, renderW, renderH, colors, p.shape, p.softness, p.intensity, p.noise);
  }

  return canvas;
}

export function shaderToDataUrl(
  type: ShaderType,
  colors: string[],
  params: ShaderParams,
  width: number,
  height: number
): string {
  const canvas = renderShaderToCanvas(type, colors, params, width, height);
  return canvas ? canvas.toDataURL('image/png') : '';
}

export function drawShaderOnCanvas(
  type: ShaderType,
  colors: string[],
  params: ShaderParams,
  targetCtx: CanvasRenderingContext2D,
  width: number,
  height: number
): void {
  const shaderCanvas = renderShaderToCanvas(type, colors, params, width, height);
  if (shaderCanvas) {
    targetCtx.drawImage(shaderCanvas, 0, 0, width, height);
  }
}

