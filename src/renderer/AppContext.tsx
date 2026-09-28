import { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import type { RenderConfig, Annotation } from './canvasRenderer';
import { useHistory } from './hooks/useHistory';
import { useExport } from './hooks/useExport';
import { usePresets } from './hooks/usePresets';
import { useClipboardPaste } from './hooks/useClipboardPaste';
import { getZoomStyle as getZoomStyleUtil } from './utils/layoutUtils';
import { getUserDefault } from './utils/storageUtils';
import type { VibePalette } from './utils/colorExtractor';
import { extractPalette } from './utils/colorExtractor';
import { generateVibeConfigs } from './utils/vibeUtils';
import { FRAMELY_AURORA_COLORS, FRAMELY_AURORA_PARAMS } from '../shared/framelyAurora';
import { DEFAULT_BLUR_STRENGTH } from '../shared/blur';
import { buildFramelyDocumentName } from '../shared/documentNaming';
import type { AppContextType } from './types/appContextTypes';
import { useStyleConfig } from './hooks/useStyleConfig';
import { useCodeStudio } from './hooks/useCodeStudio';
import { useMeshControls } from './hooks/useMeshControls';
import { useSettingsSync } from './hooks/useSettingsSync';


// TypeScript declarations for secure Electron IPC bridge
declare global {
  interface Window {
    framelyAPI: any;
  }
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // 1. Style config hook (all style state)
  const style = useStyleConfig();

  // 2. UI state (stays in AppContext)
  const [promptConfig, setPromptConfig] = useState<{ message: string; defaultValue: string; resolve: (val: string | null) => void } | null>(null);
  const [sidebarVisible, setSidebarVisible] = useState<boolean>(true);
  const [editingMode, setEditingMode] = useState(false);
  const [selectedAnnotationId, setSelectedAnnotationId] = useState<string | null>(null);
  const [settingsVisible, setSettingsVisible] = useState<boolean>(false);
  const [helpVisible, setHelpVisible] = useState<boolean>(false);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [documentName, setDocumentName] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [showAdvancedInset, setShowAdvancedInset] = useState<boolean>(false);
  const [showAdvancedShadow, setShowAdvancedShadow] = useState<boolean>(false);
  const [showAdvancedBorder, setShowAdvancedBorder] = useState<boolean>(false);
  const [zoomLevel, setZoomLevel] = useState<string>('Zoom to fit');
  const [showHollywoodPalettes, setShowHollywoodPalettes] = useState<boolean>(false);
  const [selectedGradientCategory, setSelectedGradientCategory] = useState<'classic' | 'os' | 'disney' | 'marvel' | 'hollywood'>('classic');
  const [showHollywoodMeshPalettes, setShowHollywoodMeshPalettes] = useState<boolean>(false);
  const colorInputRef = useRef<HTMLInputElement | null>(null);
  const [appTheme, setAppTheme] = useState<'dark' | 'light'>(() => {
    const saved = localStorage.getItem('framely-app-theme');
    return (saved as 'dark' | 'light') || 'dark';
  });
  const [sidebarPosition, setSidebarPosition] = useState<'left' | 'right'>(() => getUserDefault('sidebarPosition', 'right'));
  const [vibePalette, setVibePalette] = useState<VibePalette | null>(null);
  const [vibeVariantIndex, setVibeVariantIndex] = useState<number>(-1);
  const [vibeUpdateDrawColor, setVibeUpdateDrawColor] = useState<boolean>(true);

  // 3. getCurrentConfig / applyConfig (compose all hooks)
  const getCurrentConfig = (): RenderConfig => ({
    padding: style.padding, rounded: style.rounded, shadow: style.shadow, shadowColor: style.shadowColor, shadowEnabled: style.shadowEnabled,
    inset: style.inset, insetColor: style.insetColor, border: style.border, borderColor: style.borderColor, scale: style.scale,
    backgroundType: style.backgroundType, backgroundValue: style.backgroundValue, aspectRatio: style.aspectRatio, canvasWidth: style.canvasWidth, canvasHeight: style.canvasHeight,
    paddingMode: style.paddingMode, chromeStyle: style.chromeStyle, chromeTheme: style.chromeTheme, blurDensity: style.blurDensity,
    watermarkEnabled: style.watermarkEnabled, watermarkText: style.watermarkText, watermarkSize: style.watermarkSize,
    watermarkPosition: style.watermarkPosition, watermarkOpacity: style.watermarkOpacity,
    watermarkFont: style.watermarkFont, watermarkBold: style.watermarkBold, watermarkItalic: style.watermarkItalic,
    annotationFont: style.annotationFont, annotationFontSize: style.annotationFontSize, annotationBold: style.annotationBold, annotationItalic: style.annotationItalic,
    annotationOutlineEnabled: style.annotationOutlineEnabled, annotationOutlineColor: style.annotationOutlineColor, annotationOutlineWidth: style.annotationOutlineWidth,
    annotationGradientEnabled: style.annotationGradientEnabled, annotationGradientColor1: style.annotationGradientColor1, annotationGradientColor2: style.annotationGradientColor2, annotationGradientAngle: style.annotationGradientAngle,
    position: style.position, annotations: style.annotations, meshPoints: style.meshPoints, meshBlur: style.meshBlur, meshGrain: style.meshGrain, meshOpacity: style.meshOpacity, meshSpread: style.meshSpread,
    shaderType: style.shaderType, shaderColors: style.shaderColors, shaderParams: style.shaderParams,
    noImage: style.noImageMode,
    annotationDisplayWidth: style.annotationDisplayWidth,
    blurStrength: style.blurStrength,
    imageSrc,
    selectedPreset: style.selectedPreset,
    showSafeZone: style.showSafeZone,
    exportFormat,
    jpegQuality,
    sidebarPosition,
    bgGrain: style.bgGrain,
    lightRaysStyle: style.lightRaysStyle,
    lightRaysOpacity: style.lightRaysOpacity,
    lightRaysAngle: style.lightRaysAngle,
    lightRaysCount: style.lightRaysCount,
    lightRaysSourceX: style.lightRaysSourceX,
    lightRaysSourceY: style.lightRaysSourceY,
    autoImportCaptured: style.autoImportCaptured,
    captureShortcut: style.captureShortcut,
    codeStudioActive: codeStudio.codeStudioActive,
    codeStudioCode: codeStudio.codeStudioCode,
    codeStudioLanguage: codeStudio.codeStudioLanguage,
    codeStudioTheme: codeStudio.codeStudioTheme,
    codeStudioFontSize: codeStudio.codeStudioFontSize,
    codeStudioLineNumbers: codeStudio.codeStudioLineNumbers,
    codeStudioShowLanguage: codeStudio.codeStudioShowLanguage,
    codeStudioBreakpoints: codeStudio.codeStudioBreakpoints,
    codeStudioShowBreakpoints: codeStudio.codeStudioShowBreakpoints,
    screenshotBgConfig: codeStudio.screenshotBgConfig,
    codeStudioBgConfig: codeStudio.codeStudioBgConfig,
  });

  const applyConfig = (config: RenderConfig) => {
    if (!config) return;
    style.setPadding(config.padding ?? 38);
    style.setRounded(config.rounded ?? 20);
    style.setShadow(config.shadow ?? 30);
    style.setShadowColor(config.shadowColor ?? 'rgba(0, 0, 0, 0.45)');
    style.setShadowEnabled(config.shadowEnabled ?? true);
    style.setInset(config.inset ?? 0);
    style.setInsetColor(config.insetColor ?? 'rgba(255, 255, 255, 0.25)');
    style.setBorder(config.border ?? 0);
    style.setBorderColor(config.borderColor ?? '#ffffff');
    style.setScale(config.scale ?? 100);
    style.setBackgroundType(config.backgroundType ?? 'shader');
    style.setBackgroundValue(config.backgroundValue ?? 'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)');
    style.setBgGrain(config.bgGrain ?? 0);
    style.setLightRaysStyle(config.lightRaysStyle ?? 'none');
    style.setLightRaysOpacity(config.lightRaysOpacity ?? 30);
    style.setLightRaysAngle(config.lightRaysAngle ?? 135);
    style.setLightRaysCount(config.lightRaysCount ?? 4);
    style.setLightRaysSourceX(config.lightRaysSourceX ?? 50);
    style.setLightRaysSourceY(config.lightRaysSourceY ?? 0);
    style.setAspectRatio(config.aspectRatio ?? 'Auto');
    style.setCanvasWidth(config.canvasWidth ?? 800);
    style.setCanvasHeight(config.canvasHeight ?? 600);
    style.setSelectedPreset(config.selectedPreset ?? '');
    style.setShowSafeZone(config.showSafeZone ?? true);
    style.setPaddingMode(config.paddingMode ?? 'fit');
    style.setChromeStyle(config.chromeStyle ?? 'mac');
    style.setChromeTheme(config.chromeTheme ?? 'dark');
    style.setBlurDensity(config.blurDensity ?? 40);
    style.setWatermarkEnabled(config.watermarkEnabled ?? false);
    style.setWatermarkText(config.watermarkText ?? 'Made with Framely');
    style.setWatermarkSize(config.watermarkSize ?? 20);
    style.setWatermarkPosition(config.watermarkPosition ?? 'right');
    style.setWatermarkOpacity(config.watermarkOpacity ?? 0.38);
    style.setWatermarkFont(config.watermarkFont ?? 'sans-serif');
    style.setWatermarkBold(config.watermarkBold ?? false);
    style.setWatermarkItalic(config.watermarkItalic ?? false);
    style.setAnnotationFont(config.annotationFont ?? 'sans-serif');
    style.setAnnotationFontSize(config.annotationFontSize ?? 24);
    style.setAnnotationBold(config.annotationBold ?? true);
    style.setAnnotationItalic(config.annotationItalic ?? false);
    style.setAnnotationOutlineEnabled(config.annotationOutlineEnabled ?? false);
    style.setAnnotationOutlineColor(config.annotationOutlineColor ?? '#000000');
    style.setAnnotationOutlineWidth(config.annotationOutlineWidth ?? 3);
    style.setAnnotationGradientEnabled(config.annotationGradientEnabled ?? false);
    style.setAnnotationGradientColor1(config.annotationGradientColor1 ?? '#ff0080');
    style.setAnnotationGradientColor2(config.annotationGradientColor2 ?? '#7928ca');
    style.setAnnotationGradientAngle(config.annotationGradientAngle ?? 135);
    style.setPosition(config.position ?? 'Middle center');
    style.setAnnotations(config.annotations ?? []);
    style.setBlurStrength(config.blurStrength ?? DEFAULT_BLUR_STRENGTH);
    style.setMeshPoints(config.meshPoints ?? [
      { id: '1', color: '#ff5f6d', x: 0.2, y: 0.2, radius: 180 },
      { id: '2', color: '#ffc371', x: 0.8, y: 0.2, radius: 220 },
      { id: '3', color: '#00c6ff', x: 0.2, y: 0.8, radius: 200 },
      { id: '4', color: '#7209b7', x: 0.8, y: 0.8, radius: 240 },
    ]);
    style.setMeshBlur(config.meshBlur ?? 60);
    style.setMeshGrain(config.meshGrain ?? 15);
    style.setMeshOpacity(config.meshOpacity ?? 100);
    style.setMeshSpread(config.meshSpread ?? 100);
    style.setShaderType(config.shaderType ?? 'staticMesh');
    style.setShaderColors(config.shaderColors ?? [...FRAMELY_AURORA_COLORS]);
    style.setShaderParams(config.shaderParams ?? { ...FRAMELY_AURORA_PARAMS });
    style.setNoImageMode(config.noImage ?? false);
    if (config.imageSrc !== undefined) setImageSrc(config.imageSrc ?? null);

    if (config.exportFormat) setExportFormat(config.exportFormat);
    if (config.jpegQuality !== undefined) setJpegQuality(config.jpegQuality);
    if (config.sidebarPosition) setSidebarPosition(config.sidebarPosition);
    if (config.autoImportCaptured !== undefined) style.setAutoImportCaptured(config.autoImportCaptured);
    if (config.captureShortcut) style.setCaptureShortcut(config.captureShortcut);

    if (config.codeStudioActive !== undefined) codeStudio.setCodeStudioActive(config.codeStudioActive);
    if (config.codeStudioCode !== undefined) codeStudio.setCodeStudioCode(config.codeStudioCode);
    if (config.codeStudioLanguage !== undefined) codeStudio.setCodeStudioLanguage(config.codeStudioLanguage);
    if (config.codeStudioTheme !== undefined) codeStudio.setCodeStudioTheme(config.codeStudioTheme);
    if (config.codeStudioFontSize !== undefined) codeStudio.setCodeStudioFontSize(config.codeStudioFontSize);
    if (config.codeStudioLineNumbers !== undefined) codeStudio.setCodeStudioLineNumbers(config.codeStudioLineNumbers);
    if (config.codeStudioShowLanguage !== undefined) codeStudio.setCodeStudioShowLanguage(config.codeStudioShowLanguage);
    if (config.codeStudioBreakpoints !== undefined) codeStudio.setCodeStudioBreakpoints(config.codeStudioBreakpoints);
    if (config.codeStudioShowBreakpoints !== undefined) codeStudio.setCodeStudioShowBreakpoints(config.codeStudioShowBreakpoints);
    if (config.screenshotBgConfig !== undefined) codeStudio.setScreenshotBgConfig(config.screenshotBgConfig);
    if (config.codeStudioBgConfig !== undefined) codeStudio.setCodeStudioBgConfig(config.codeStudioBgConfig);
  };

  // 4. History Hook
  const {
    history, setHistory,
    historyIndex, setHistoryIndex,
    pushHistory, handleUndo, handleRedo
  } = useHistory(applyConfig);

  // 5. Code Studio hook
  const codeStudio = useCodeStudio({
    backgroundType: style.backgroundType, backgroundValue: style.backgroundValue,
    bgGrain: style.bgGrain, lightRaysStyle: style.lightRaysStyle, lightRaysOpacity: style.lightRaysOpacity,
    lightRaysAngle: style.lightRaysAngle, lightRaysCount: style.lightRaysCount,
    lightRaysSourceX: style.lightRaysSourceX, lightRaysSourceY: style.lightRaysSourceY,
    meshPoints: style.meshPoints, meshBlur: style.meshBlur, meshGrain: style.meshGrain,
    meshOpacity: style.meshOpacity, meshSpread: style.meshSpread, selectedPreset: style.selectedPreset,
    imageSrc, noImageMode: style.noImageMode,
    setBackgroundType: style.setBackgroundType, setBackgroundValue: style.setBackgroundValue,
    setBgGrain: style.setBgGrain, setLightRaysStyle: style.setLightRaysStyle,
    setLightRaysOpacity: style.setLightRaysOpacity, setLightRaysAngle: style.setLightRaysAngle,
    setLightRaysCount: style.setLightRaysCount, setLightRaysSourceX: style.setLightRaysSourceX,
    setLightRaysSourceY: style.setLightRaysSourceY, setMeshPoints: style.setMeshPoints,
    setMeshBlur: style.setMeshBlur, setMeshGrain: style.setMeshGrain,
    setMeshOpacity: style.setMeshOpacity, setMeshSpread: style.setMeshSpread,
    setSelectedPreset: style.setSelectedPreset, setNoImageMode: style.setNoImageMode,
    getCurrentConfig, pushHistory,
  });

  // 6. Mesh controls hook
  const meshControls = useMeshControls({
    backgroundType: style.backgroundType, meshPoints: style.meshPoints,
    meshBlur: style.meshBlur, meshGrain: style.meshGrain, meshOpacity: style.meshOpacity, meshSpread: style.meshSpread,
    shaderType: style.shaderType, shaderColors: style.shaderColors, shaderParams: style.shaderParams,
    aspectRatio: style.aspectRatio, canvasWidth: style.canvasWidth, canvasHeight: style.canvasHeight,
    setActivePointIdx: style.setActivePointIdx, setMeshPoints: style.setMeshPoints,
    getCurrentConfig, pushHistory,
  });

  const handlePasteImageRef = useRef<(src: string) => void>(() => {});

  // 7. Presets Hook
  const {
    customPresets, setCustomPresets,
    newPresetName, setNewPresetName,
    fileInputRef, onImageLoaded, selectFile,
    handleHTMLFileInput, pasteFromClipboard,
    saveCustomPreset, deleteCustomPreset, selectBackgroundPreset
  } = usePresets(
    setImageSrc, style.setNoImageMode, style.setAnnotations,
    style.backgroundType, style.setBackgroundType, style.backgroundValue, style.setBackgroundValue,
    getCurrentConfig, pushHistory,
    style.setBgGrain, style.setLightRaysStyle, style.setLightRaysOpacity,
    style.setLightRaysAngle, style.setLightRaysCount, style.setLightRaysSourceX, style.setLightRaysSourceY,
    (src) => handlePasteImageRef.current(src)
  );

  const handlePasteImage = useCallback((dataUrl: string) => {
    if (imageSrc) {
      const img = new Image();
      img.src = dataUrl;
      img.onload = () => {
        const mainImg = new Image();
        mainImg.src = imageSrc;
        mainImg.onload = () => {
          const mainW = mainImg.naturalWidth || 800;
          const mainH = mainImg.naturalHeight || 600;
          const relativeW = 0.4;
          const relativeH = (relativeW * mainW * img.naturalHeight) / (img.naturalWidth * mainH);
          const annX = 0.5 - relativeW / 2;
          const annY = 0.5 - relativeH / 2;
          const newAnn: Annotation = {
            id: `ann-${Date.now()}`,
            type: 'image',
            x: annX, y: annY, w: relativeW, h: relativeH,
            color: '#ffffff', strokeWidth: 2, rotation: 0,
            imageSrc: dataUrl,
          };
          const updated = [...style.annotations, newAnn];
          style.setAnnotations(updated);
          pushHistory({ ...getCurrentConfig(), annotations: updated });
        };
      };
    } else {
      onImageLoaded(dataUrl);
    }
  }, [imageSrc, style.annotations, onImageLoaded, pushHistory, getCurrentConfig]);

  useEffect(() => {
    handlePasteImageRef.current = handlePasteImage;
  }, [handlePasteImage]);

  // 8. Export Hook
  const {
    exportFormat, setExportFormat,
    jpegQuality, setJpegQuality,
    compressionMode, setCompressionMode,
    copyBeautifiedImage, triggerExport, exportBeforeAfter, copyBeforeAfter
  } = useExport(
    imageSrc,
    style.noImageMode,
    getCurrentConfig
  );

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = useCallback((message: string, duration = 2500) => {
    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current);
    }
    setToastMessage(message);
    toastTimerRef.current = setTimeout(() => {
      setToastMessage(null);
      toastTimerRef.current = null;
    }, duration);
  }, []);

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) {
        clearTimeout(toastTimerRef.current);
      }
    };
  }, []);

  // 9. Settings sync hook
  useSettingsSync({
    appTheme, exportFormat, jpegQuality, compressionMode, blurStrength: style.blurStrength,
    sidebarPosition,
    bgGrain: style.bgGrain, lightRaysStyle: style.lightRaysStyle,
    lightRaysOpacity: style.lightRaysOpacity, lightRaysAngle: style.lightRaysAngle,
    lightRaysCount: style.lightRaysCount, lightRaysSourceX: style.lightRaysSourceX,
    lightRaysSourceY: style.lightRaysSourceY,
    getCurrentConfig, customPresets,
    setCustomPresets, applyConfig,
    syncDeps: [
      style.padding, style.rounded, style.shadow, style.shadowColor, style.shadowEnabled, style.inset, style.insetColor, style.border,
      style.borderColor, style.scale, style.backgroundType, style.backgroundValue, style.aspectRatio, style.canvasWidth,
      style.canvasHeight, style.paddingMode, style.chromeStyle, style.chromeTheme, style.blurDensity, style.watermarkEnabled,
      style.watermarkText, style.watermarkSize, style.watermarkPosition, style.watermarkOpacity, style.position, customPresets,
      style.meshPoints, style.meshBlur, style.meshGrain, style.meshOpacity,
      style.meshSpread, style.noImageMode, exportFormat, jpegQuality, sidebarPosition, style.blurStrength,
      style.shaderType, style.shaderColors, style.shaderParams,
      style.bgGrain, style.lightRaysStyle, style.lightRaysOpacity, style.lightRaysAngle, style.lightRaysCount, style.lightRaysSourceX, style.lightRaysSourceY,
      style.autoImportCaptured, style.captureShortcut
    ],
  });

  // Workspace functions
  const handleSliderRelease = () => { pushHistory(getCurrentConfig()); };
  const getZoomStyle = (): React.CSSProperties => getZoomStyleUtil(zoomLevel);

  const applyMeshPalette = (colors: string[]) => {
    style.setMeshPoints((prev) => prev.map((pt, idx) => ({ ...pt, color: colors[idx % colors.length] })));
    pushHistory(getCurrentConfig());
  };

  const generateRandomPalette = () => {
    const randomHex = () => '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
    style.setMeshPoints((prev) => prev.map((pt) => ({
      ...pt, color: randomHex(),
      x: Math.random() * 0.8 + 0.1, y: Math.random() * 0.8 + 0.1
    })));
    pushHistory(getCurrentConfig());
  };

  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = (e: React.DragEvent) => {
    if (e && e.currentTarget && e.relatedTarget !== null && e.currentTarget.contains(e.relatedTarget as Node)) {
      return;
    }
    setIsDragging(false);
  };
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (event) => {
          if (event.target?.result) onImageLoaded(event.target.result as string);
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const customPrompt = (message: string, defaultValue: string = ''): Promise<string | null> => {
    return new Promise((resolve) => { setPromptConfig({ message, defaultValue, resolve }); });
  };

  const resetStyles = () => {
    style.setBlurStrength(DEFAULT_BLUR_STRENGTH);
    style.setPadding(38);
    style.setRounded(20);
    style.setShadow(30);
    style.setShadowColor('rgba(0, 0, 0, 0.45)');
    style.setShadowEnabled(true);
    style.setInset(0);
    style.setInsetColor('rgba(255, 255, 255, 0.25)');
    style.setBorder(0);
    style.setBorderColor('#ffffff');
    style.setScale(100);
    style.setBackgroundType('shader');
    style.setBackgroundValue('linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)');
    style.setBgGrain(0);
    style.setLightRaysStyle('none');
    style.setLightRaysOpacity(30);
    style.setLightRaysAngle(135);
    style.setLightRaysCount(4);
    style.setLightRaysSourceX(50);
    style.setLightRaysSourceY(0);
    style.setAspectRatio('Auto');
    style.setSelectedPreset('');
    style.setShowSafeZone(true);
    style.setPaddingMode('fit');
    style.setChromeStyle('mac');
    style.setChromeTheme('dark');
    style.setBlurDensity(40);
    style.setWatermarkEnabled(false);
    style.setWatermarkText('Made with Framely');
    style.setWatermarkSize(20);
    style.setWatermarkPosition('right');
    style.setWatermarkOpacity(0.38);
    style.setPosition('Middle center');
    style.setMeshPoints([
      { id: '1', color: '#ff5f6d', x: 0.2, y: 0.2, radius: 180 },
      { id: '2', color: '#ffc371', x: 0.8, y: 0.2, radius: 220 },
      { id: '3', color: '#00c6ff', x: 0.2, y: 0.8, radius: 200 },
      { id: '4', color: '#7209b7', x: 0.8, y: 0.8, radius: 240 },
    ]);
    style.setMeshBlur(60);
    style.setMeshGrain(15);
    style.setMeshOpacity(100);
    style.setMeshSpread(100);
    style.setShaderType('staticMesh');
    style.setShaderColors([...FRAMELY_AURORA_COLORS]);
    style.setShaderParams({ ...FRAMELY_AURORA_PARAMS });

    pushHistory({
      ...getCurrentConfig(),
      padding: 38, rounded: 20, shadow: 30, shadowColor: 'rgba(0, 0, 0, 0.45)', shadowEnabled: true,
      inset: 0, insetColor: 'rgba(255, 255, 255, 0.25)', border: 0, borderColor: '#ffffff', scale: 100,
      backgroundType: 'shader', backgroundValue: 'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)',
      bgGrain: 0, lightRaysStyle: 'none', lightRaysOpacity: 30, lightRaysAngle: 135, lightRaysCount: 4,
      lightRaysSourceX: 50, lightRaysSourceY: 0,
      aspectRatio: 'Auto', selectedPreset: '', showSafeZone: true, paddingMode: 'fit',
      chromeStyle: 'mac', chromeTheme: 'dark', blurDensity: 40,
      watermarkEnabled: false, watermarkText: 'Made with Framely', watermarkSize: 20,
      watermarkPosition: 'right', watermarkOpacity: 0.38, position: 'Middle center',
      meshPoints: [
        { id: '1', color: '#ff5f6d', x: 0.2, y: 0.2, radius: 180 },
        { id: '2', color: '#ffc371', x: 0.8, y: 0.2, radius: 220 },
        { id: '3', color: '#00c6ff', x: 0.2, y: 0.8, radius: 200 },
        { id: '4', color: '#7209b7', x: 0.8, y: 0.8, radius: 240 },
      ],
      meshBlur: 60, meshGrain: 15, meshOpacity: 100, meshSpread: 100,
      shaderType: 'staticMesh', shaderColors: [...FRAMELY_AURORA_COLORS], shaderParams: { ...FRAMELY_AURORA_PARAMS },
      blurStrength: DEFAULT_BLUR_STRENGTH,
    });
  };

  const clearWorkspace = () => {
    setImageSrc(null);
    setEditingMode(false);
    setSelectedAnnotationId(null);
    style.setActiveTool('pointer');
    style.setBackgroundType('shader');
    style.setShaderType('staticMesh');
    style.setShaderColors([...FRAMELY_AURORA_COLORS]);
    style.setShaderParams({ ...FRAMELY_AURORA_PARAMS });
    setHistory([]);
    setHistoryIndex(-1);
    style.setAnnotations([]);
    setVibePalette(null);
    setVibeVariantIndex(-1);
    setDocumentName(buildFramelyDocumentName());
    codeStudio.setCodeStudioActive(false);
    codeStudio.setCodeStudioCode(`// Paste or type your code here...\nfunction helloWorld() {\n  console.log("Hello, Framely!");\n}`);
    codeStudio.setCodeStudioLanguage('javascript');
    codeStudio.setCodeStudioShowLanguage(true);
  };

  const applyAutoVibe = useCallback(async () => {
    if (!imageSrc) return;
    let palette = vibePalette;
    if (!palette) {
      palette = await extractPalette(imageSrc);
      setVibePalette(palette);
    }
    const nextIdx = (vibeVariantIndex + 1) % 4;
    setVibeVariantIndex(nextIdx);
    const variant = generateVibeConfigs(palette)[nextIdx];
    const base = getCurrentConfig();
    const update: Partial<RenderConfig> = {
      backgroundType: variant.backgroundType,
      shadowColor: variant.shadowColor,
      chromeTheme: variant.chromeTheme,
    };
    if (variant.backgroundType === 'mesh' && variant.meshColors) {
      style.setMeshPoints((prev) => prev.map((pt, i) => ({ ...pt, color: variant.meshColors![i % 4] })));
    } else if (variant.backgroundValue) {
      update.backgroundValue = variant.backgroundValue;
      style.setBackgroundValue(variant.backgroundValue);
    }
    if (vibeUpdateDrawColor) {
      style.setAnnotationColor(variant.annotationColor);
    }
    style.setBackgroundType(variant.backgroundType);
    style.setShadowColor(variant.shadowColor);
    style.setChromeTheme(variant.chromeTheme);
    pushHistory({ ...base, ...update });
  }, [imageSrc, vibePalette, vibeVariantIndex, vibeUpdateDrawColor]);

  // Reset vibe when a new image is loaded
  const prevImageSrc = useRef<string | null>(null);
  useEffect(() => {
    if (imageSrc && imageSrc !== prevImageSrc.current) {
      setVibePalette(null);
      setVibeVariantIndex(-1);
      if (codeStudio.codeStudioActive) {
        codeStudio.toggleCodeStudio(false);
      }
      prevImageSrc.current = imageSrc;
    }
  }, [imageSrc, codeStudio.codeStudioActive, codeStudio.toggleCodeStudio]);

  const onImageLoadedRef = useRef(onImageLoaded);
  useEffect(() => { onImageLoadedRef.current = onImageLoaded; }, [onImageLoaded]);

  // Global hotkeys
  useEffect(() => {
    if (window.framelyAPI) {
      const unsubscribe = window.framelyAPI.onGlobalHotkeyTriggered((imageUrl: string) => {
        onImageLoadedRef.current(imageUrl);
      });
      return () => unsubscribe();
    }
    return;
  }, []);

  // Clipboard paste hook
  useClipboardPaste(
    codeStudio.codeStudioActive,
    codeStudio.toggleCodeStudio,
    (src) => handlePasteImageRef.current(src),
    showToast
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;

      const isExport = (e.ctrlKey || e.metaKey) && !e.altKey && e.key.toLowerCase() === 's';
      if (isExport) {
        e.preventDefault();
        if (imageSrc || style.noImageMode) triggerExport();
        return;
      }

      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) {
        return;
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') { e.preventDefault(); handleUndo(); }
      if ((e.ctrlKey || e.metaKey) && e.key === 'y') { e.preventDefault(); handleRedo(); }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'n') { e.preventDefault(); clearWorkspace(); }
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && !e.altKey && e.key.toLowerCase() === 'c') {
        e.preventDefault();
        codeStudio.toggleCodeStudio(!codeStudio.codeStudioActive);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [historyIndex, history, imageSrc, style.noImageMode, style.padding, style.rounded, style.shadow, style.shadowColor, style.shadowEnabled, style.inset, style.insetColor, style.border, style.borderColor, style.scale, style.backgroundType, style.backgroundValue, style.aspectRatio, style.canvasWidth, style.canvasHeight, style.paddingMode, style.chromeStyle, style.chromeTheme, style.blurDensity, style.watermarkEnabled, style.watermarkText, style.watermarkSize, style.position, exportFormat, jpegQuality, style.annotations, style.meshPoints, style.meshBlur, style.meshGrain, style.meshOpacity, style.meshSpread, codeStudio.codeStudioActive, codeStudio.toggleCodeStudio]);

  return (
    <AppContext.Provider value={{
      ...style,
      meshDataUrl: meshControls.meshDataUrl, setMeshDataUrl: meshControls.setMeshDataUrl,
      shaderDataUrl: meshControls.shaderDataUrl, setShaderDataUrl: meshControls.setShaderDataUrl,
      promptConfig, setPromptConfig, sidebarVisible, setSidebarVisible,
      editingMode, setEditingMode, selectedAnnotationId, setSelectedAnnotationId,
      settingsVisible, setSettingsVisible,
      helpVisible, setHelpVisible,
      imageSrc, setImageSrc, documentName, setDocumentName, isDragging, setIsDragging,
      customPresets, setCustomPresets, newPresetName, setNewPresetName,
      showAdvancedInset, setShowAdvancedInset, showAdvancedShadow, setShowAdvancedShadow, showAdvancedBorder, setShowAdvancedBorder,
      exportFormat, setExportFormat, jpegQuality, setJpegQuality, compressionMode, setCompressionMode,
      zoomLevel, setZoomLevel, history, setHistory,
      historyIndex, setHistoryIndex, showHollywoodPalettes, setShowHollywoodPalettes, selectedGradientCategory, setSelectedGradientCategory,
      showHollywoodMeshPalettes, setShowHollywoodMeshPalettes,
      appTheme, setAppTheme,
      sidebarPosition, setSidebarPosition,
      vibePalette, vibeVariantIndex, vibeUpdateDrawColor, setVibeUpdateDrawColor,
      fileInputRef, colorInputRef,
      ...codeStudio,
      getCurrentConfig, pushHistory, applyConfig, handleUndo, handleRedo, selectFile, handleHTMLFileInput,
      pasteFromClipboard, saveCustomPreset, deleteCustomPreset, copyBeautifiedImage, triggerExport, exportBeforeAfter, copyBeforeAfter, toastMessage,
      showToast,
      selectBackgroundPreset, handleSliderRelease, getZoomStyle, applyMeshPalette, generateRandomPalette,
      handleDragOver, handleDragLeave, handleDrop, customPrompt,
      handlePointerDown: meshControls.handlePointerDown, handlePointerMove: meshControls.handlePointerMove, handlePointerUp: meshControls.handlePointerUp,
      resetStyles,
      clearWorkspace,
      applyAutoVibe,
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useAppContext must be used within an AppProvider');
  return context;
};
