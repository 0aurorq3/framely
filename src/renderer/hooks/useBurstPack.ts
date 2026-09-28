import { useState, useCallback, useRef } from 'react';
import { renderCanvas, RenderConfig } from '../canvasRenderer';
import { resolvePresetKeys } from '../../shared/burstPacks';
import {
  computeBurstConfigPatch,
  collectOgWarnings,
  estimateBase64SizeKb,
} from '../../shared/burstReframe';
import { buildBurstVariantFilename } from '../../shared/burstVariantFilename';
import type { BurstPackSaveResult, BurstVariantPayload } from '../../shared/burstTypes';
import { loadBurstImages } from '../utils/burstImageLoader';
import { findPresetByKey } from '../utils/burstPresetLookup';
import type { CompressionMode } from './useExport';

export type BurstPackPhase = 'idle' | 'rendering' | 'saving' | 'done' | 'error';

export function useBurstPack(
  imageSrc: string | null,
  noImageMode: boolean,
  getCurrentConfig: () => RenderConfig,
  ensureDocumentName: () => string,
  exportFormat: 'png' | 'jpeg' | 'webp',
  jpegQuality: number,
  compressionMode: CompressionMode
) {
  const [modalOpen, setModalOpen] = useState(false);
  const [phase, setPhase] = useState<BurstPackPhase>('idle');
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [toast, setToast] = useState<string | null>(null);
  const [lastResult, setLastResult] = useState<BurstPackSaveResult | null>(null);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = useCallback((message: string, duration = 3000) => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToast(message);
    toastTimerRef.current = setTimeout(() => {
      setToast(null);
      toastTimerRef.current = null;
    }, duration);
  }, []);

  const openModal = useCallback(() => {
    setLastResult(null);
    setPhase('idle');
    setModalOpen(true);
  }, []);
  const closeModal = useCallback(() => {
    if (phase === 'rendering' || phase === 'saving') return;
    setModalOpen(false);
    setPhase('idle');
    setLastResult(null);
  }, [phase]);

  const renderVariants = useCallback(
    (presetKeys: string[], img: HTMLImageElement | null): BurstVariantPayload[] => {
      const master = getCurrentConfig();
      const imgW = noImageMode ? 800 : img?.naturalWidth || img?.width || 800;
      const imgH = noImageMode ? 600 : img?.naturalHeight || img?.height || 600;
      const variants: BurstVariantPayload[] = [];

      for (const presetKey of presetKeys) {
        const preset = findPresetByKey(presetKey);
        if (!preset) continue;

        const { patch, warnings: reframeWarnings } = computeBurstConfigPatch(
          {
            padding: master.padding,
            scale: master.scale,
            chromeStyle: master.chromeStyle,
            position: master.position,
          },
          imgW,
          imgH,
          preset
        );

        const variantConfig: RenderConfig = {
          ...master,
          ...patch,
          showSafeZone: false,
          forceCanvasSize: patch.forceCanvasSize,
        };

        const canvas = document.createElement('canvas');
        renderCanvas(canvas, img, variantConfig);
        const mime =
          exportFormat === 'jpeg' ? 'image/jpeg' : exportFormat === 'webp' ? 'image/webp' : 'image/png';
        const base64Data = canvas.toDataURL(mime, jpegQuality / 100);
        const fileSizeKb = estimateBase64SizeKb(base64Data);
        const ogWarnings = collectOgWarnings(presetKey, fileSizeKb);
        const filename = buildBurstVariantFilename(
          presetKey,
          preset.width,
          preset.height,
          exportFormat
        );

        variants.push({
          presetKey,
          filename,
          base64Data,
          width: preset.width,
          height: preset.height,
          fileSizeKb,
          warnings: [
            ...reframeWarnings.map((message) => ({ code: 'REFRAME', message })),
            ...ogWarnings.map((message) => ({ code: 'SIZE', message })),
          ],
        });
      }

      return variants;
    },
    [getCurrentConfig, noImageMode, exportFormat, jpegQuality]
  );

  const saveBurstPack = useCallback(
    async (packId: string | null, customPresetKeys: string[]) => {
      if (!noImageMode && !imageSrc) return { success: false as const };
      if (!window.framelyAPI?.saveBurstPack) return { success: false as const };

      const presetKeys = resolvePresetKeys(packId, customPresetKeys);
      if (presetKeys.length === 0) return { success: false as const };

      setPhase('rendering');
      setProgress({ current: 0, total: presetKeys.length });

      return new Promise<{ success: boolean; variantCount?: number; error?: string }>((resolve) => {
        loadBurstImages(imageSrc, noImageMode, getCurrentConfig, async (img) => {
          try {
            const variants = renderVariants(presetKeys, img);
            if (variants.length === 0) {
              setPhase('error');
              showToast('No valid platform presets selected');
              resolve({ success: false, error: 'No variants rendered' });
              return;
            }

            setProgress({ current: variants.length, total: variants.length });
            setPhase('saving');

            const documentName = ensureDocumentName();
            const result = await window.framelyAPI.saveBurstPack({
              documentName,
              exportFormat,
              jpegQuality,
              compressionMode,
              variants,
            });

            if (result.success && result.data) {
              setLastResult(result.data);
              setPhase('done');
              // Keep modal open with launch checklist (viral post-export UX)
              showToast(`Burst Pack saved (${result.data.variantCount} variants)`);
              resolve({ success: true, variantCount: result.data.variantCount });
            } else if (result.error?.code === 'CANCELLED') {
              setPhase('idle');
              resolve({ success: false, error: 'CANCELLED' });
            } else {
              setPhase('error');
              const msg = result.error?.message || 'Failed to save burst pack';
              showToast(msg, 4000);
              resolve({ success: false, error: msg });
            }
          } catch (err) {
            setPhase('error');
            const msg = err instanceof Error ? err.message : 'Burst pack failed';
            showToast(msg, 4000);
            resolve({ success: false, error: msg });
          }
        });
      });
    },
    [
      imageSrc,
      noImageMode,
      getCurrentConfig,
      ensureDocumentName,
      exportFormat,
      jpegQuality,
      compressionMode,
      renderVariants,
      showToast,
    ]
  );

  return {
    modalOpen,
    openModal,
    closeModal,
    phase,
    progress,
    toast,
    lastResult,
    saveBurstPack,
  };
}
