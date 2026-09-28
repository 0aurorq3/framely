import { useState, useRef } from 'react';
import { RenderConfig, Annotation, preloadBgImage } from '../canvasRenderer';

export function usePresets(
  setImageSrc: React.Dispatch<React.SetStateAction<string | null>>,
  setNoImageMode: React.Dispatch<React.SetStateAction<boolean>>,
  setAnnotations: React.Dispatch<React.SetStateAction<Annotation[]>>,
  backgroundType: 'gradient' | 'color' | 'blur' | 'mesh' | 'shader',
  setBackgroundType: React.Dispatch<React.SetStateAction<'gradient' | 'color' | 'blur' | 'mesh' | 'shader'>>,
  backgroundValue: string,
  setBackgroundValue: React.Dispatch<React.SetStateAction<string>>,
  getCurrentConfig: () => RenderConfig,
  pushHistory: (config: any) => void,
  setBgGrain?: React.Dispatch<React.SetStateAction<number>>,
  setLightRaysStyle?: React.Dispatch<React.SetStateAction<'none' | 'diagonal' | 'spotlight' | 'aurora'>>,
  setLightRaysOpacity?: React.Dispatch<React.SetStateAction<number>>,
  setLightRaysAngle?: React.Dispatch<React.SetStateAction<number>>,
  setLightRaysCount?: React.Dispatch<React.SetStateAction<number>>,
  setLightRaysSourceX?: React.Dispatch<React.SetStateAction<number>>,
  setLightRaysSourceY?: React.Dispatch<React.SetStateAction<number>>,
  handlePasteImage?: (src: string) => void
) {
  const [customPresets, setCustomPresets] = useState<any[]>([]);
  const [newPresetName, setNewPresetName] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const onImageLoaded = (src: string) => {
    setImageSrc(src);
    setNoImageMode(false);
    setAnnotations([]);
    pushHistory({
      ...getCurrentConfig(),
      annotations: [],
      noImage: false,
    });
  };

  const selectFile = async () => {
    if (window.framelyAPI) {
      const imgData = await window.framelyAPI.openFile();
      if (imgData) onImageLoaded(imgData);
    } else {
      fileInputRef.current?.click();
    }
  };

  const handleHTMLFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) onImageLoaded(event.target.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const pasteFromClipboard = async () => {
    if (window.framelyAPI) {
      const dataUrl = await window.framelyAPI.readImageFromClipboard();
      if (dataUrl) {
        if (handlePasteImage) {
          handlePasteImage(dataUrl);
        } else {
          onImageLoaded(dataUrl);
        }
      } else {
        alert('No image found in clipboard.');
      }
    }
  };

  const saveCustomPreset = () => {
    if (!newPresetName.trim()) return;
    const newPreset = {
      id: `custom-${Date.now()}`,
      name: newPresetName,
      gradient: backgroundType === 'gradient' ? backgroundValue : undefined,
      color: backgroundType === 'color' ? backgroundValue : undefined,
      type: backgroundType === 'gradient' ? 'gradient' : 'color',
    };
    const updated = [...customPresets, newPreset];
    setCustomPresets(updated);
    setNewPresetName('');
  };

  const deleteCustomPreset = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setCustomPresets(customPresets.filter(p => p.id !== id));
  };

  const selectBackgroundPreset = (preset: any) => {
    setBackgroundType(preset.type);
    const gradientValue = preset.gradient || preset.color;
    setBackgroundValue(gradientValue);

    // Pre-warm bgImageCache immediately so export doesn't race against image load
    if (preset.type === 'gradient' && gradientValue) {
      const urlPattern = /url\(['"]?([^'"()]+)['"]?\)/g;
      let m;
      while ((m = urlPattern.exec(gradientValue)) !== null) {
        preloadBgImage(m[1], () => {});
      }
    }
    
    const grain = preset.bgGrain ?? 0;
    const style = preset.lightRaysStyle ?? 'none';
    const opacity = preset.lightRaysOpacity ?? 30;
    const angle = preset.lightRaysAngle ?? 135;
    const count = preset.lightRaysCount ?? 4;
    const sourceX = preset.lightRaysSourceX ?? 50;
    const sourceY = preset.lightRaysSourceY ?? 0;

    if (setBgGrain) setBgGrain(grain);
    if (setLightRaysStyle) setLightRaysStyle(style);
    if (setLightRaysOpacity) setLightRaysOpacity(opacity);
    if (setLightRaysAngle) setLightRaysAngle(angle);
    if (setLightRaysCount) setLightRaysCount(count);
    if (setLightRaysSourceX) setLightRaysSourceX(sourceX);
    if (setLightRaysSourceY) setLightRaysSourceY(sourceY);

    pushHistory({
      ...getCurrentConfig(),
      backgroundType: preset.type,
      backgroundValue: preset.gradient || preset.color,
      bgGrain: grain,
      lightRaysStyle: style,
      lightRaysOpacity: opacity,
      lightRaysAngle: angle,
      lightRaysCount: count,
      lightRaysSourceX: sourceX,
      lightRaysSourceY: sourceY,
    });
  };

  return {
    customPresets,
    setCustomPresets,
    newPresetName,
    setNewPresetName,
    fileInputRef,
    onImageLoaded,
    selectFile,
    handleHTMLFileInput,
    pasteFromClipboard,
    saveCustomPreset,
    deleteCustomPreset,
    selectBackgroundPreset
  };
}
