import { RenderConfig } from '../src/renderer/canvasRenderer';
import { FRAMELY_AURORA_COLORS, FRAMELY_AURORA_PARAMS } from '../src/shared/framelyAurora';

export const baseConfig: RenderConfig = {
  padding: 38,
  rounded: 20,
  shadow: 30,
  shadowColor: 'rgba(0, 0, 0, 0.4)',
  shadowEnabled: true,
  inset: 0,
  insetColor: 'rgba(255, 255, 255, 0.2)',
  border: 0,
  borderColor: '#ffffff',
  scale: 100,
  backgroundType: 'gradient',
  backgroundValue: 'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)',
  aspectRatio: 'Auto',
  canvasWidth: 800,
  canvasHeight: 600,
  paddingMode: 'fit',
  chromeStyle: 'mac',
  watermarkEnabled: false,
  watermarkText: 'Made with Framely',
  watermarkSize: 20,
  watermarkPosition: 'middle',
  watermarkOpacity: 0.45,
  position: 'Middle center',
};

export interface MockCtx extends CanvasRenderingContext2D {
  calls: string[];
  _state: Record<string, any>;
}

/**
 * Enhanced mock CanvasRenderingContext2D that tracks property sets and method calls.
 */
export function makeMockCtx(): MockCtx {
  const calls: string[] = [];
  const state: Record<string, any> = {};

  const handler: ProxyHandler<object> = {
    get(_t, prop) {
      if (prop === 'calls') return calls;
      if (prop === '_state') return state;
      if (prop === 'createLinearGradient') {
        return (x0: number, y0: number, x1: number, y1: number) => {
          calls.push(`createLinearGradient(${x0},${y0},${x1},${y1})`);
          return {
            addColorStop: (offset: number, color: string) => {
              calls.push(`addColorStop(${offset},${color})`);
            },
          };
        };
      }
      if (prop === 'createRadialGradient') {
        return (x0: number, y0: number, r0: number, x1: number, y1: number, r1: number) => {
          calls.push(`createRadialGradient(${x0},${y0},${r0},${x1},${y1},${r1})`);
          return {
            addColorStop: (offset: number, color: string) => {
              calls.push(`addColorStop(${offset},${color})`);
            },
          };
        };
      }
      if (prop === 'createPattern') {
        return (_el: any, _repetition: string) => {
          calls.push('createPattern');
          return {};
        };
      }
      if (prop === 'createImageData') {
        return (w: number, h: number) => {
          calls.push(`createImageData(${w},${h})`);
          return { data: new Uint8ClampedArray(w * h * 4) };
        };
      }
      if (prop === 'measureText') {
        return (str: string) => {
          calls.push(`measureText(${str})`);
          return { width: str.length * 5 };
        };
      }
      if (prop === 'roundRect') {
        return (...args: number[]) => {
          calls.push(`roundRect(${args.join(',')})`);
        };
      }
      if (prop === 'getImageData') {
        return () => {
          calls.push('getImageData');
          return { data: new Uint8ClampedArray(800 * 600 * 4) };
        };
      }
      if (prop === 'putImageData') {
        return () => {
          calls.push('putImageData');
        };
      }
      if (prop === 'drawImage') {
        return (..._args: unknown[]) => {
          calls.push('drawImage');
        };
      }
      if (prop === 'setLineDash') {
        return (segments: number[]) => {
          calls.push(`setLineDash(${segments.join(',')})`);
        };
      }
      if (prop === 'save') {
        return () => calls.push('save');
      }
      if (prop === 'restore') {
        return () => calls.push('restore');
      }
      if (prop === 'beginPath') {
        return () => calls.push('beginPath');
      }
      if (prop === 'closePath') {
        return () => calls.push('closePath');
      }
      if (prop === 'moveTo') {
        return (x: number, y: number) => calls.push(`moveTo(${x},${y})`);
      }
      if (prop === 'lineTo') {
        return (x: number, y: number) => calls.push(`lineTo(${x},${y})`);
      }
      if (prop === 'quadraticCurveTo') {
        return (cpx: number, cpy: number, x: number, y: number) =>
          calls.push(`quadraticCurveTo(${cpx},${cpy},${x},${y})`);
      }
      if (prop === 'bezierCurveTo') {
        return (...args: number[]) => calls.push(`bezierCurveTo(${args.join(',')})`);
      }
      if (prop === 'arc') {
        return (...args: number[]) => calls.push(`arc(${args.join(',')})`);
      }
      if (prop === 'ellipse') {
        return (...args: number[]) => calls.push(`ellipse(${args.join(',')})`);
      }
      if (prop === 'rect') {
        return (x: number, y: number, w: number, h: number) =>
          calls.push(`rect(${x},${y},${w},${h})`);
      }
      if (prop === 'fill' || prop === 'stroke' || prop === 'clip') {
        return () => calls.push(prop as string);
      }
      if (prop === 'fillRect') {
        return (x: number, y: number, w: number, h: number) =>
          calls.push(`fillRect(${x},${y},${w},${h})`);
      }
      if (prop === 'strokeRect') {
        return (x: number, y: number, w: number, h: number) =>
          calls.push(`strokeRect(${x},${y},${w},${h})`);
      }
      if (prop === 'clearRect') {
        return (x: number, y: number, w: number, h: number) =>
          calls.push(`clearRect(${x},${y},${w},${h})`);
      }
      if (prop === 'translate') {
        return (x: number, y: number) => calls.push(`translate(${x},${y})`);
      }
      if (prop === 'rotate') {
        return (angle: number) => calls.push(`rotate(${angle})`);
      }
      if (prop === 'scale') {
        return (x: number, y: number) => calls.push(`scale(${x},${y})`);
      }
      if (prop === 'transform') {
        return (...args: number[]) => calls.push(`transform(${args.join(',')})`);
      }
      if (prop === 'setTransform') {
        return (...args: number[]) => calls.push(`setTransform(${args.join(',')})`);
      }
      return (..._args: unknown[]) => {
        calls.push(String(prop));
      };
    },
    set(_t, prop, value) {
      state[String(prop)] = value;
      calls.push(`set:${String(prop)}`);
      return true;
    },
  };
  return new Proxy({} as any, handler) as MockCtx;
}

export function makeArrowAnnotation(
  arrowStyle: 'classic' | 'dashed' | 'tapered' | 'curved' = 'classic'
) {
  return {
    id: 'test',
    type: 'arrow' as const,
    x: 0.1, y: 0.1, w: 0.4, h: 0.3,
    color: '#ff0000',
    strokeWidth: 4,
    arrowStyle,
  };
}

/**
 * Creates a mock annotation of any type for testing.
 */
export function makeMockAnnotation(type: string, overrides: Record<string, any> = {}) {
  const base: Record<string, any> = {
    id: `mock-${type}-${Math.random().toString(36).slice(2, 6)}`,
    type,
    x: 0.1,
    y: 0.1,
    w: 0.3,
    h: 0.2,
    color: '#ff0000',
    strokeWidth: 4,
    rotation: 0,
  };
  if (type === 'text') {
    base.text = 'Hello';
    base.fontSize = 16;
  }
  if (type === 'emoji') {
    base.emoji = '😀';
  }
  if (type === 'arrow') {
    base.arrowStyle = 'classic';
  }
  if (type === 'pen') {
    base.points = [{ x: 0.1, y: 0.1 }, { x: 0.2, y: 0.15 }, { x: 0.3, y: 0.12 }];
  }
  return { ...base, ...overrides };
}

/**
 * Creates a full mock context value matching AppContextType shape.
 */
export function makeFullMockContext(overrides: Record<string, any> = {}) {
  const noop = () => {};
  return {
    imageSrc: null as string | null,
    setImageSrc: noop,
    noImageMode: false,
    setNoImageMode: noop,
    annotations: [],
    setAnnotations: noop,
    activeTool: 'pointer',
    setActiveTool: noop,
    annotationColor: '#ff0000',
    setAnnotationColor: noop,
    annotationStrokeWidth: 4,
    setAnnotationStrokeWidth: noop,
    annotationDisplayWidth: 0,
    blurStrength: 12,
    setBlurStrength: noop,
    editingMode: false,
    setEditingMode: noop,
    selectedAnnotationId: null as string | null,
    setSelectedAnnotationId: noop,
    setAnnotationDisplayWidth: noop,
    arrowStyle: 'classic' as const,
    setArrowStyle: noop,
    annotationFont: 'sans-serif',
    setAnnotationFont: noop,
    annotationFontSize: 24,
    setAnnotationFontSize: noop,
    annotationBold: true,
    setAnnotationBold: noop,
    annotationItalic: false,
    setAnnotationItalic: noop,
    annotationOutlineEnabled: false,
    setAnnotationOutlineEnabled: noop,
    annotationOutlineColor: '#000000',
    setAnnotationOutlineColor: noop,
    annotationOutlineWidth: 3,
    setAnnotationOutlineWidth: noop,
    annotationGradientEnabled: false,
    setAnnotationGradientEnabled: noop,
    annotationGradientColor1: '#ff0080',
    setAnnotationGradientColor1: noop,
    annotationGradientColor2: '#7928ca',
    setAnnotationGradientColor2: noop,
    annotationGradientAngle: 135,
    setAnnotationGradientAngle: noop,
    systemFonts: [] as string[],
    setSystemFonts: noop,
    chromeStyle: 'none',
    setChromeStyle: noop,
    chromeTheme: 'dark',
    setChromeTheme: noop,
    watermarkEnabled: false,
    setWatermarkEnabled: noop,
    watermarkText: 'Made with Framely',
    setWatermarkText: noop,
    watermarkSize: 20,
    setWatermarkSize: noop,
    watermarkPosition: 'middle',
    setWatermarkPosition: noop,
    watermarkOpacity: 0.45,
    setWatermarkOpacity: noop,
    watermarkFont: 'sans-serif',
    setWatermarkFont: noop,
    watermarkBold: false,
    setWatermarkBold: noop,
    watermarkItalic: false,
    setWatermarkItalic: noop,
    exportFormat: 'png',
    setExportFormat: noop,
    jpegQuality: 90,
    setJpegQuality: noop,
    compressionMode: 'balanced',
    setCompressionMode: noop,
    triggerExport: noop,
    copyBeautifiedImage: noop,
    promptConfig: null,
    setPromptConfig: noop,
    getCurrentConfig: noop,
    pushHistory: noop,
    handleSliderRelease: noop,
    getZoomStyle: noop,
    applyMeshPalette: noop,
    generateRandomPalette: noop,
    selectFile: noop,
    pasteFromClipboard: noop,
    customPrompt: noop,
    saveCustomPreset: noop,
    deleteCustomPreset: noop,
    selectBackgroundPreset: noop,
    handleUndo: noop,
    handleRedo: noop,
    padding: 38,
    setPadding: noop,
    rounded: 20,
    setRounded: noop,
    shadow: 30,
    setShadow: noop,
    shadowColor: 'rgba(0,0,0,0.4)',
    setShadowColor: noop,
    shadowEnabled: true,
    setShadowEnabled: noop,
    scale: 100,
    setScale: noop,
    backgroundType: 'gradient',
    setBackgroundType: noop,
    backgroundValue: 'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)',
    setBackgroundValue: noop,
    aspectRatio: 'Auto',
    setAspectRatio: noop,
    canvasWidth: 800,
    setCanvasWidth: noop,
    canvasHeight: 600,
    setCanvasHeight: noop,
    paddingMode: 'fit',
    setPaddingMode: noop,
    position: 'Middle center',
    setPosition: noop,
    inset: 0,
    setInset: noop,
    insetColor: 'rgba(255,255,255,0.2)',
    setInsetColor: noop,
    border: 0,
    setBorder: noop,
    borderColor: '#ffffff',
    setBorderColor: noop,
    blurDensity: 50,
    setBlurDensity: noop,
    meshPoints: [
      { x: 0.3, y: 0.2, color: '#ff6b6b', radius: 0.25 },
      { x: 0.7, y: 0.3, color: '#4ecdc4', radius: 0.25 },
      { x: 0.4, y: 0.6, color: '#ffe66d', radius: 0.25 },
      { x: 0.6, y: 0.8, color: '#a29bfe', radius: 0.25 },
    ],
    setMeshPoints: noop,
    meshBlur: 30,
    setMeshBlur: noop,
    meshGrain: 5,
    setMeshGrain: noop,
    meshOpacity: 50,
    setMeshOpacity: noop,
    meshSpread: 15,
    setMeshSpread: noop,
    activePointIdx: null as number | null,
    setActivePointIdx: noop,
    meshDataUrl: '',
    setMeshDataUrl: noop,
    shaderType: 'staticMesh' as const,
    setShaderType: noop,
    shaderColors: [...FRAMELY_AURORA_COLORS],
    setShaderColors: noop,
    shaderParams: { ...FRAMELY_AURORA_PARAMS },
    setShaderParams: noop,
    shaderDataUrl: '',
    setShaderDataUrl: noop,
    showHollywoodPalettes: false,
    setShowHollywoodPalettes: noop,
    selectedGradientCategory: 'all',
    setSelectedGradientCategory: noop,
    showHollywoodMeshPalettes: false,
    setShowHollywoodMeshPalettes: noop,
    selectedPreset: '',
    setSelectedPreset: noop,
    showSafeZone: true,
    setShowSafeZone: noop,
    sidebarVisible: true,
    setSidebarVisible: noop,
    resetStyles: noop,
    appTheme: 'dark',
    setAppTheme: noop,
    isDragging: false,
    setIsDragging: noop,
    newPresetName: '',
    setNewPresetName: noop,
    customPresets: [],
    setCustomPresets: noop,
    sidebarPosition: 'right' as 'left' | 'right',
    setSidebarPosition: noop,
    bgGrain: 0,
    setBgGrain: noop,
    lightRaysStyle: 'none' as const,
    setLightRaysStyle: noop,
    lightRaysOpacity: 30,
    setLightRaysOpacity: noop,
    lightRaysAngle: 135,
    setLightRaysAngle: noop,
    lightRaysCount: 4,
    setLightRaysCount: noop,
    lightRaysSourceX: 50,
    setLightRaysSourceX: noop,
    lightRaysSourceY: 0,
    setLightRaysSourceY: noop,
    vibePalette: null,
    vibeVariantIndex: -1,
    vibeUpdateDrawColor: true,
    setVibeUpdateDrawColor: noop,
    applyAutoVibe: async () => {},
    clearWorkspace: noop,
    containerRef: { current: null },
    helpVisible: false,
    setHelpVisible: noop,
    settingsVisible: false,
    setSettingsVisible: noop,
    autoImportCaptured: true,
    setAutoImportCaptured: noop,
    captureShortcut: 'PrintScreen',
    setCaptureShortcut: noop,
    showToast: noop,
    toastMessage: null,
    ...overrides,
  };
}

/**
 * Creates a mock canvas element with a proxied 2D context.
 */
export function makeMockCanvas() {
  const ctx = makeMockCtx();
  const canvas = {
    width: 800,
    height: 600,
    getContext: (_type: string) => ctx,
    toDataURL: () => 'data:image/png;base64,mockdata',
    toBlob: (cb: (blob: Blob) => void) => {
      cb(new Blob(['mock'], { type: 'image/png' }));
    },
  };
  return { canvas: canvas as unknown as HTMLCanvasElement, ctx };
}

/**
 * Creates a mock HTMLImageElement.
 */
export function makeMockImage(naturalWidth = 800, naturalHeight = 600) {
  const img = new Image();
  Object.defineProperty(img, 'naturalWidth', { value: naturalWidth });
  Object.defineProperty(img, 'naturalHeight', { value: naturalHeight });
  Object.defineProperty(img, 'width', { value: naturalWidth, writable: true });
  Object.defineProperty(img, 'height', { value: naturalHeight, writable: true });
  return img;
}
