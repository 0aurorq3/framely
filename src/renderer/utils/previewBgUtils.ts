import React from 'react';

export function getDiagonalBackground(
  lightRaysAngle: number,
  lightRaysSourceX: number,
  lightRaysSourceY: number,
  lightRaysCount: number
): string {
  const angleRad = ((lightRaysAngle - 90) * Math.PI) / 180;
  const dx = (lightRaysSourceX / 100) - 0.5;
  const dy = (lightRaysSourceY / 100) - 0.5;
  const gx = Math.cos(angleRad);
  const gy = Math.sin(angleRad);
  const proj = dx * gx + dy * gy;
  const maxProj = 0.5 * (Math.abs(gx) + Math.abs(gy));
  const cFraction = 0.5 + (maxProj > 0 ? proj / (maxProj * 2) : 0);
  const C = Math.max(0, Math.min(100, cFraction * 100));

  const BEAM_TEMPLATES = [
    { offset: 0, width: 2, opacity: 0.8 },
    { offset: 2.5, width: 6, opacity: 0.35 },
    { offset: -7, width: 1.5, opacity: 0.4 },
    { offset: 16, width: 1, opacity: 0.25 },
    { offset: 19, width: 0.8, opacity: 0.15 },
    { offset: 22, width: 1.2, opacity: 0.2 },
    { offset: -14, width: 0.8, opacity: 0.18 },
    { offset: 25, width: 0.7, opacity: 0.12 },
    { offset: -20, width: 1.5, opacity: 0.1 },
    { offset: 30, width: 1, opacity: 0.08 },
  ];

  const limit = Math.max(1, Math.min(10, lightRaysCount));
  const layers: string[] = [];

  for (let i = 0; i < limit; i++) {
    const beam = BEAM_TEMPLATES[i];
    const mid = C + beam.offset;
    layers.push(`linear-gradient(${lightRaysAngle}deg, transparent ${mid - beam.width}%, rgba(255, 255, 255, ${beam.opacity}) ${mid}%, transparent ${mid + beam.width}%)`);
  }

  layers.push(`linear-gradient(${lightRaysAngle + 90}deg, rgba(147, 51, 234, 0) 0%, rgba(147, 51, 234, 0.2) 30%, rgba(59, 130, 246, 0.25) 55%, rgba(6, 182, 212, 0.2) 75%, rgba(6, 182, 212, 0) 100%)`);

  return layers.join(', ');
}

export function getSpotlightBackground(
  lightRaysSourceX: number,
  lightRaysSourceY: number
): string {
  return `radial-gradient(circle at ${lightRaysSourceX}% ${lightRaysSourceY}%, rgba(255, 255, 255, 0.5) 0%, rgba(255, 255, 255, 0.3) 20%, rgba(255, 255, 255, 0.05) 50%, rgba(255, 255, 255, 0) 80%)`;
}

export function getAuroraBackground(
  lightRaysAngle: number,
  lightRaysSourceX: number,
  lightRaysSourceY: number
): string {
  const angleRad = ((lightRaysAngle - 90) * Math.PI) / 180;
  const dx = (lightRaysSourceX / 100) - 0.5;
  const dy = (lightRaysSourceY / 100) - 0.5;
  const gx = Math.cos(angleRad);
  const gy = Math.sin(angleRad);
  const proj = dx * gx + dy * gy;
  const maxProj = 0.5 * (Math.abs(gx) + Math.abs(gy));
  const cFraction = 0.5 + (maxProj > 0 ? proj / (maxProj * 2) : 0);
  const C = Math.max(0, Math.min(100, cFraction * 100));

  return `linear-gradient(${lightRaysAngle}deg, rgba(59, 130, 246, 0) ${C - 50}%, rgba(59, 130, 246, 0.2) ${C - 30}%, rgba(147, 51, 234, 0.25) ${C - 10}%, rgba(6, 182, 212, 0.2) ${C + 10}%, rgba(59, 130, 246, 0.1) ${C + 30}%, rgba(59, 130, 246, 0) ${C + 50}%), linear-gradient(${lightRaysAngle + 90}deg, rgba(255, 255, 255, 0) 20%, rgba(255, 255, 255, 0.15) 50%, rgba(255, 255, 255, 0) 80%)`;
}

export function getBackgroundStyle(
  backgroundType: 'color' | 'gradient' | 'blur' | 'mesh' | 'shader',
  backgroundValue: string,
  imageSrc: string | null,
  meshDataUrl: string,
  shaderDataUrl?: string
): React.CSSProperties {
  if (backgroundType === 'color') {
    return { backgroundColor: backgroundValue };
  }
  if (backgroundType === 'gradient') {
    return {
      backgroundImage: backgroundValue,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat'
    };
  }
  if (backgroundType === 'blur' && imageSrc) {
    return {
      backgroundImage: `url(${imageSrc})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat'
    };
  }
  if (backgroundType === 'mesh') {
    return {
      backgroundImage: `url(${meshDataUrl})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat'
    };
  }
  if (backgroundType === 'shader' && shaderDataUrl) {
    return {
      backgroundImage: `url(${shaderDataUrl})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat'
    };
  }
  return {};
}
