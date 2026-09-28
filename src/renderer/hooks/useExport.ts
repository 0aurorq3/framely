import { useState } from 'react';
import { renderCanvas, RenderConfig, preloadBgImage } from '../canvasRenderer';
import { onNoiseReady } from '../shaders/shaderWebGL';
import { composeBeforeAfter, renderRawBeforePanel } from '../utils/beforeAfterExport';

export type CompressionMode = 'original' | 'balanced' | 'small';

export function useExport(
  imageSrc: string | null,
  noImageMode: boolean,
  getCurrentConfig: () => RenderConfig
) {
  const [exportFormat, setExportFormat] = useState<'png' | 'jpeg' | 'webp'>(() => {
    try {
      const saved = localStorage.getItem('framely-user-defaults');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.exportFormat === 'png' || parsed.exportFormat === 'jpeg' || parsed.exportFormat === 'webp') return parsed.exportFormat;
      }
    } catch (e) {}
    return 'png';
  });
  const [jpegQuality, setJpegQuality] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('framely-user-defaults');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.jpegQuality !== undefined) return parsed.jpegQuality;
      }
    } catch (e) {}
    return 90;
  });
  const [compressionMode, setCompressionMode] = useState<CompressionMode>(() => {
    try {
      const saved = localStorage.getItem('framely-user-defaults');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.compressionMode === 'original' || parsed.compressionMode === 'balanced' || parsed.compressionMode === 'small') {
          return parsed.compressionMode;
        }
      }
    } catch (e) {}
    return 'balanced';
  });

  const checkOgSizeLimit = (base64Data: string): boolean => {
    const config = getCurrentConfig();
    const selectedPreset = config.selectedPreset || '';
    const isOgPreset = selectedPreset && (
      selectedPreset.includes('OG') || 
      selectedPreset.includes('Link') || 
      selectedPreset.includes('Ad') || 
      selectedPreset.includes('Facebook') || 
      selectedPreset.includes('LinkedIn')
    );
    if (!isOgPreset) return true;

    const sizeInBytes = base64Data.length * 0.75;
    const sizeInMb = sizeInBytes / (1024 * 1024);
    if (sizeInMb > 8) {
      return confirm(
        `Warning: The image is ${sizeInMb.toFixed(2)}MB, which exceeds the 8MB limit for social media/Open Graph previews (iMessage, WhatsApp, Facebook, etc.).\n\nIt is highly recommended to export as JPEG or reduce padding/scale to bring the file size under 300KB.\n\nDo you want to proceed anyway?`
      );
    }
    return true;
  };

  const loadImages = (
    screenshotSrc: string | null,
    backgroundVal: string,
    callback: (screenshotImg: HTMLImageElement | null) => void
  ) => {
    const bgType = getCurrentConfig().backgroundType;
    let pending = 0;
    let screenshotImg: HTMLImageElement | null = null;
    let called = false;

    const checkDone = () => {
      if (pending === 0 && !called) {
        called = true;
        callback(screenshotImg);
      }
    };

    if (!noImageMode && screenshotSrc) {
      pending++;
      screenshotImg = new Image();
      screenshotImg.src = screenshotSrc;
      screenshotImg.onload = () => {
        pending--;
        checkDone();
      };
      screenshotImg.onerror = () => {
        pending--;
        checkDone();
      };
    }

    // Preload all url() images into bgImageCache so renderCanvas finds them loaded
    if (bgType === 'gradient') {
      const urlPattern = /url\(['"]?([^'"()]+)['"]?\)/g;
      let urlMatch;
      while ((urlMatch = urlPattern.exec(backgroundVal)) !== null) {
        const imgUrl = urlMatch[1];
        pending++;
        preloadBgImage(imgUrl, () => {
          pending--;
          checkDone();
        });
      }
    }

    // grainGradient and pulsingBorder WebGL shaders need the noise texture loaded
    const config = getCurrentConfig();
    if (bgType === 'shader' && (config.shaderType === 'grainGradient' || config.shaderType === 'pulsingBorder')) {
      pending++;
      onNoiseReady(() => {
        pending--;
        checkDone();
      });
    }

    checkDone();
  };

  const copyBeautifiedImage = async (caption?: string): Promise<void> => {
    if (!noImageMode && !imageSrc) return;
    return new Promise<void>((resolve, reject) => {
      loadImages(imageSrc, getCurrentConfig().backgroundValue, async (img) => {
        try {
          const canvas = document.createElement('canvas');
          renderCanvas(canvas, img, getCurrentConfig());
          const base64Data = canvas.toDataURL('image/png');
          
          if (!checkOgSizeLimit(base64Data)) {
            resolve();
            return;
          }

          const config = getCurrentConfig();
          const codeText = (config.codeStudioActive && config.codeStudioCode) ? config.codeStudioCode : undefined;
          // Prefer explicit share caption (viral), then Code Studio source, else nothing.
          const clipboardText = caption ?? codeText;

          if (window.framelyAPI) {
            await window.framelyAPI.copyImageToClipboard(base64Data, clipboardText);
          } else {
            const blob = await new Promise<Blob | null>((res) => canvas.toBlob(res, 'image/png'));
            if (blob) {
              const clipboardItems: Record<string, Blob> = { 'image/png': blob };
              if (clipboardText) {
                clipboardItems['text/plain'] = new Blob([clipboardText], { type: 'text/plain' });
              }
              await navigator.clipboard.write([new ClipboardItem(clipboardItems)]);
            }
          }
          resolve();
        } catch (err) {
          reject(err);
        }
      });
    });
  };

  const buildBeforeAfterCanvas = (
    img: HTMLImageElement | null,
    resolveEmpty: () => void
  ): HTMLCanvasElement | null => {
    if (!img || noImageMode) {
      resolveEmpty();
      return null;
    }
    const afterCanvas = document.createElement('canvas');
    renderCanvas(afterCanvas, img, getCurrentConfig());
    const targetH = Math.min(afterCanvas.height, 900);
    const beforeCanvas = renderRawBeforePanel(img, targetH);
    return composeBeforeAfter(beforeCanvas, afterCanvas);
  };

  const exportBeforeAfter = () => {
    if (!imageSrc || noImageMode) return;
    loadImages(imageSrc, getCurrentConfig().backgroundValue, (img) => {
      const composed = buildBeforeAfterCanvas(img, () => undefined);
      if (!composed) return;
      const base64Data = composed.toDataURL('image/png');
      if (window.framelyAPI) {
        window.framelyAPI.saveFile(base64Data, 'png', 100, 'original');
      } else {
        const link = document.createElement('a');
        link.download = 'framely-before-after.png';
        link.href = base64Data;
        link.click();
      }
    });
  };

  const copyBeforeAfter = async (): Promise<void> => {
    if (!imageSrc || noImageMode) return;
    return new Promise<void>((resolve, reject) => {
      loadImages(imageSrc, getCurrentConfig().backgroundValue, async (img) => {
        try {
          const composed = buildBeforeAfterCanvas(img, () => resolve());
          if (!composed) return;
          const base64Data = composed.toDataURL('image/png');
          if (window.framelyAPI) {
            await window.framelyAPI.copyImageToClipboard(base64Data);
          } else {
            const blob = await new Promise<Blob | null>((res) => composed.toBlob(res, 'image/png'));
            if (blob) {
              await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
            }
          }
          resolve();
        } catch (err) {
          reject(err);
        }
      });
    });
  };

  const triggerExport = () => {
    if (!noImageMode && !imageSrc) return;
    loadImages(imageSrc, getCurrentConfig().backgroundValue, (img) => {
      const canvas = document.createElement('canvas');
      renderCanvas(canvas, img, getCurrentConfig());
      const mime = exportFormat === 'jpeg' ? 'image/jpeg' : exportFormat === 'webp' ? 'image/webp' : 'image/png';
      const base64Data = canvas.toDataURL(mime, jpegQuality / 100);
      
      if (!checkOgSizeLimit(base64Data)) return;

      const sizeInKb = base64Data ? (base64Data.length * 0.75) / 1024 : 0;
      const config = getCurrentConfig();
      const selectedPreset = config.selectedPreset || '';
      const isOgPreset = selectedPreset && (selectedPreset.includes('OG') || selectedPreset.includes('Link'));
      const suffix = (isOgPreset && sizeInKb > 300) ? 'Tip: Keep Open Graph images under 300KB for best link preview performance.' : '';

      if (window.framelyAPI) {
        window.framelyAPI.saveFile(base64Data, exportFormat, jpegQuality, compressionMode);
        if (suffix) alert(suffix);
      } else {
        const link = document.createElement('a');
        const ext = exportFormat === 'jpeg' ? 'jpg' : exportFormat === 'webp' ? 'webp' : 'png';
        link.download = `framely-export.${ext}`;
        link.href = base64Data;
        link.click();
        if (suffix) alert(suffix);
      }
    });
  };

  return {
    exportFormat,
    setExportFormat,
    jpegQuality,
    setJpegQuality,
    compressionMode,
    setCompressionMode,
    copyBeautifiedImage,
    triggerExport,
    exportBeforeAfter,
    copyBeforeAfter,
  };
}
