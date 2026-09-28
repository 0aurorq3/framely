import { useState, useEffect, useRef } from 'react';
import { drawMeshGradient } from '../canvasRenderer';
import type { RenderConfig } from '../canvasRenderer';
import { shaderToDataUrl } from '../shaders/shaderManager';
import type { ShaderType, ShaderParams } from '../shaders/shaderPresets';
import { onNoiseReady } from '../shaders/shaderWebGL';

interface MeshPoint {
  id: string; color: string; x: number; y: number; radius: number;
}

interface UseMeshControlsDeps {
  backgroundType: string;
  meshPoints: MeshPoint[];
  meshBlur: number;
  meshGrain: number;
  meshOpacity: number;
  meshSpread: number;
  shaderType: ShaderType;
  shaderColors: string[];
  shaderParams: ShaderParams;
  aspectRatio: string;
  canvasWidth: number;
  canvasHeight: number;
  setActivePointIdx: React.Dispatch<React.SetStateAction<number>>;
  setMeshPoints: React.Dispatch<React.SetStateAction<MeshPoint[]>>;
  getCurrentConfig: () => RenderConfig;
  pushHistory: (config: any) => void;
}

export function useMeshControls(deps: UseMeshControlsDeps) {
  const [meshDataUrl, setMeshDataUrl] = useState<string>('');
  const [shaderDataUrl, setShaderDataUrl] = useState<string>('');
  const [noiseReadyState, setNoiseReadyState] = useState<boolean>(false);

  useEffect(() => {
    onNoiseReady(() => {
      setNoiseReadyState(true);
    });
  }, []);

  // Mesh gradient background rendering
  useEffect(() => {
    if (deps.backgroundType !== 'mesh') return;
    const canvas = document.createElement('canvas');
    const baseW = 800;
    let ratio = 16 / 9;
    if (deps.aspectRatio === '1:1') ratio = 1;
    else if (deps.aspectRatio === '4:3') ratio = 4 / 3;
    else if (deps.aspectRatio === '16:9') ratio = 16 / 9;
    else if (deps.aspectRatio === '3:2') ratio = 3 / 2;
    else if (deps.aspectRatio === 'Custom') ratio = deps.canvasWidth / deps.canvasHeight;

    canvas.width = baseW;
    canvas.height = Math.round(baseW / ratio);
    const ctx = canvas.getContext('2d');
    if (ctx) {
      drawMeshGradient(ctx, canvas.width, canvas.height, deps.meshPoints, deps.meshBlur, deps.meshGrain, deps.meshOpacity, deps.meshSpread);
      setMeshDataUrl(canvas.toDataURL());
    }
  }, [deps.backgroundType, deps.meshPoints, deps.meshBlur, deps.meshGrain, deps.meshOpacity, deps.meshSpread, deps.aspectRatio, deps.canvasWidth, deps.canvasHeight]);

  // Shader background rendering
  useEffect(() => {
    if (deps.backgroundType !== 'shader') return;
    const baseW = 800;
    let ratio = 16 / 9;
    if (deps.aspectRatio === '1:1') ratio = 1;
    else if (deps.aspectRatio === '4:3') ratio = 4 / 3;
    else if (deps.aspectRatio === '16:9') ratio = 16 / 9;
    else if (deps.aspectRatio === '3:2') ratio = 3 / 2;
    else if (deps.aspectRatio === 'Custom') ratio = deps.canvasWidth / deps.canvasHeight;

    const w = baseW;
    const h = Math.round(baseW / ratio);
    const url = shaderToDataUrl(deps.shaderType, deps.shaderColors, deps.shaderParams, w, h);
    setShaderDataUrl(url);
  }, [deps.backgroundType, deps.shaderType, deps.shaderColors, deps.shaderParams, deps.aspectRatio, deps.canvasWidth, deps.canvasHeight, noiseReadyState]);

  const dragStartRef = useRef<{ idx: number; rect: DOMRect } | null>(null);

  const handlePointerDown = (e: React.PointerEvent, idx: number) => {
    e.preventDefault(); deps.setActivePointIdx(idx);
    const handle = e.currentTarget as HTMLDivElement;
    const container = handle.parentElement;
    if (container) {
      dragStartRef.current = { idx, rect: container.getBoundingClientRect() };
      try { handle.setPointerCapture(e.pointerId); } catch (err) {}
    }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!dragStartRef.current) return;
    const { idx, rect } = dragStartRef.current;
    const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const y = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height));
    deps.setMeshPoints((prev) => {
      const copy = [...prev]; copy[idx] = { ...copy[idx], x, y }; return copy;
    });
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (dragStartRef.current) {
      const handle = e.currentTarget as HTMLDivElement;
      try { handle.releasePointerCapture(e.pointerId); } catch (err) {}
      dragStartRef.current = null; deps.pushHistory(deps.getCurrentConfig());
    }
  };

  return {
    meshDataUrl, setMeshDataUrl,
    shaderDataUrl, setShaderDataUrl,
    handlePointerDown, handlePointerMove, handlePointerUp,
  };
}
