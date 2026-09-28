import { useState, useEffect } from 'react';
import type { Annotation, AnnotationTool } from '../canvasRenderer';
import { DEFAULT_BLUR_STRENGTH } from '../../shared/blur';
import type { ShaderType, ShaderParams } from '../shaders/shaderPresets';
import { getUserDefault, updateUserDefault } from '../utils/storageUtils';
import { FRAMELY_AURORA_COLORS, FRAMELY_AURORA_PARAMS } from '../../shared/framelyAurora';

const SYSTEM_FONT_FALLBACKS = [
  'Geist',
  'Geist Mono',
  'Segoe UI',
  '-apple-system',
  'BlinkMacSystemFont',
  'Arial',
  'Helvetica',
  'Times New Roman',
  'Courier New',
  'Georgia',
  'Verdana',
  'Trebuchet MS',
  'Impact',
  'Comic Sans MS',
  'Consolas',
  'Monospace',
  'Sans-Serif',
  'Serif'
];

export { SYSTEM_FONT_FALLBACKS };

export function useStyleConfig() {
  const [padding, setPadding] = useState<number>(() => getUserDefault('padding', 38));
  const [rounded, setRounded] = useState<number>(() => getUserDefault('rounded', 20));
  const [shadow, setShadow] = useState<number>(() => getUserDefault('shadow', 30));
  const [shadowColor, setShadowColor] = useState<string>('rgba(0, 0, 0, 0.45)');
  const [shadowEnabled, setShadowEnabled] = useState<boolean>(true);
  const [inset, setInset] = useState<number>(0);
  const [insetColor, setInsetColor] = useState<string>('rgba(255, 255, 255, 0.25)');
  const [border, setBorder] = useState<number>(0);
  const [borderColor, setBorderColor] = useState<string>('#ffffff');
  const [scale, setScale] = useState<number>(100);
  const [backgroundType, setBackgroundType] = useState<'gradient' | 'color' | 'blur' | 'mesh' | 'shader'>('shader');
  const [backgroundValue, setBackgroundValue] = useState<string>('linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)');
  const [bgGrain, setBgGrain] = useState<number>(() => getUserDefault('bgGrain', 0));
  const [lightRaysStyle, setLightRaysStyle] = useState<'none' | 'diagonal' | 'spotlight' | 'aurora'>(() => getUserDefault('lightRaysStyle', 'none') as any);
  const [lightRaysOpacity, setLightRaysOpacity] = useState<number>(() => getUserDefault('lightRaysOpacity', 30));
  const [lightRaysAngle, setLightRaysAngle] = useState<number>(() => getUserDefault('lightRaysAngle', 135));
  const [lightRaysCount, setLightRaysCount] = useState<number>(() => getUserDefault('lightRaysCount', 4));
  const [lightRaysSourceX, setLightRaysSourceX] = useState<number>(() => getUserDefault('lightRaysSourceX', 50));
  const [lightRaysSourceY, setLightRaysSourceY] = useState<number>(() => getUserDefault('lightRaysSourceY', 0));
  const [aspectRatio, setAspectRatio] = useState<string>('Auto');
  const [canvasWidth, setCanvasWidth] = useState<number>(800);
  const [canvasHeight, setCanvasHeight] = useState<number>(600);
  const [selectedPreset, setSelectedPreset] = useState<string>('');
  const [showSafeZone, setShowSafeZone] = useState<boolean>(true);
  const [paddingMode, setPaddingMode] = useState<'fit' | 'fill'>('fit');
  const [chromeStyle, setChromeStyle] = useState<'mac' | 'windows' | 'none'>('mac');
  const [chromeTheme, setChromeTheme] = useState<'dark' | 'light'>('dark');
  const [blurDensity, setBlurDensity] = useState<number>(40);
  const [autoImportCaptured, setAutoImportCapturedState] = useState<boolean>(() => getUserDefault('autoImportCaptured', true));
  const [captureShortcut, setCaptureShortcutState] = useState<string>(() => getUserDefault('captureShortcut', 'PrintScreen'));

  const [noImageMode, setNoImageMode] = useState<boolean>(false);
  const [meshPoints, setMeshPoints] = useState<Array<{ id: string; color: string; x: number; y: number; radius: number }>>([
    { id: '1', color: '#ff5f6d', x: 0.2, y: 0.2, radius: 180 },
    { id: '2', color: '#ffc371', x: 0.8, y: 0.2, radius: 220 },
    { id: '3', color: '#00c6ff', x: 0.2, y: 0.8, radius: 200 },
    { id: '4', color: '#7209b7', x: 0.8, y: 0.8, radius: 240 },
  ]);
  const [meshBlur, setMeshBlur] = useState<number>(60);
  const [meshGrain, setMeshGrain] = useState<number>(15);
  const [meshOpacity, setMeshOpacity] = useState<number>(100);
  const [meshSpread, setMeshSpread] = useState<number>(100);
  const [activePointIdx, setActivePointIdx] = useState<number>(0);
  const [shaderType, setShaderType] = useState<ShaderType>('staticMesh');
  const [shaderColors, setShaderColors] = useState<string[]>(() => [...FRAMELY_AURORA_COLORS]);
  const [shaderParams, setShaderParams] = useState<ShaderParams>(() => ({ ...FRAMELY_AURORA_PARAMS }));

  const [watermarkEnabled, setWatermarkEnabled] = useState<boolean>(() => getUserDefault('watermarkEnabled', false));
  const [watermarkText, setWatermarkText] = useState<string>(() => getUserDefault('watermarkText', 'Made with Framely'));
  const [watermarkSize, setWatermarkSize] = useState<number>(() => getUserDefault('watermarkSize', 20));
  const [watermarkPosition, setWatermarkPosition] = useState<'left' | 'middle' | 'right' | 'top left' | 'top middle' | 'top right'>(() => getUserDefault('watermarkPosition', 'right') as any);
  const [watermarkOpacity, setWatermarkOpacity] = useState<number>(() => getUserDefault('watermarkOpacity', 0.38));
  const [watermarkFont, setWatermarkFont] = useState<string>(() => getUserDefault('watermarkFont', 'sans-serif'));
  const [watermarkBold, setWatermarkBold] = useState<boolean>(() => getUserDefault('watermarkBold', false));
  const [watermarkItalic, setWatermarkItalic] = useState<boolean>(() => getUserDefault('watermarkItalic', false));
  const [annotationFont, setAnnotationFont] = useState<string>(() => getUserDefault('annotationFont', 'sans-serif'));
  const [annotationFontSize, setAnnotationFontSize] = useState<number>(() => getUserDefault('annotationFontSize', 24));
  const [annotationBold, setAnnotationBold] = useState<boolean>(() => getUserDefault('annotationBold', true));
  const [annotationItalic, setAnnotationItalic] = useState<boolean>(() => getUserDefault('annotationItalic', false));
  const [annotationOutlineEnabled, setAnnotationOutlineEnabled] = useState<boolean>(() => getUserDefault('annotationOutlineEnabled', false));
  const [annotationOutlineColor, setAnnotationOutlineColor] = useState<string>(() => getUserDefault('annotationOutlineColor', '#000000'));
  const [annotationOutlineWidth, setAnnotationOutlineWidth] = useState<number>(() => getUserDefault('annotationOutlineWidth', 3));
  const [annotationGradientEnabled, setAnnotationGradientEnabled] = useState<boolean>(() => getUserDefault('annotationGradientEnabled', false));
  const [annotationGradientColor1, setAnnotationGradientColor1] = useState<string>(() => getUserDefault('annotationGradientColor1', '#ff0080'));
  const [annotationGradientColor2, setAnnotationGradientColor2] = useState<string>(() => getUserDefault('annotationGradientColor2', '#7928ca'));
  const [annotationGradientAngle, setAnnotationGradientAngle] = useState<number>(() => getUserDefault('annotationGradientAngle', 135));
  const [systemFonts, setSystemFonts] = useState<string[]>(SYSTEM_FONT_FALLBACKS);
  const [previewFont, setPreviewFont] = useState<string | null>(null);
  const [position, setPosition] = useState<string>('Middle center');
  const [activeTool, setActiveTool] = useState<AnnotationTool>('pointer');
  const [arrowStyle, setArrowStyle] = useState<'classic' | 'dashed' | 'tapered' | 'curved'>('classic');
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [annotationColor, setAnnotationColor] = useState<string>('#f43f5e');
  const [annotationStrokeWidth, setAnnotationStrokeWidth] = useState<number>(8);
  const [annotationDisplayWidth, setAnnotationDisplayWidth] = useState<number>(0);
  const [blurStrength, setBlurStrength] = useState<number>(() => getUserDefault('blurStrength', DEFAULT_BLUR_STRENGTH));

  // Load system fonts dynamically on startup
  useEffect(() => {
    async function loadSystemFonts() {
      if ('queryLocalFonts' in window) {
        try {
          const fonts = await (window as any).queryLocalFonts();
          const uniqueFamilies = Array.from(new Set(fonts.map((f: any) => f.family))) as string[];
          uniqueFamilies.sort((a, b) => a.localeCompare(b));
          if (uniqueFamilies.length > 0) {
            setSystemFonts(Array.from(new Set([...SYSTEM_FONT_FALLBACKS, ...uniqueFamilies])));
          }
        } catch (err) {
          console.warn('Failed to query local fonts, using fallbacks:', err);
        }
      }
    }
    loadSystemFonts();
  }, []);

  const setAutoImportCaptured = (val: boolean) => {
    setAutoImportCapturedState(val);
    updateUserDefault('autoImportCaptured', val);
  };
  const setCaptureShortcut = (val: string) => {
    setCaptureShortcutState(val);
    updateUserDefault('captureShortcut', val);
  };

  return {
    padding, setPadding, rounded, setRounded, shadow, setShadow, shadowColor, setShadowColor,
    shadowEnabled, setShadowEnabled, inset, setInset, insetColor, setInsetColor, border, setBorder,
    borderColor, setBorderColor, scale, setScale, backgroundType, setBackgroundType,
    backgroundValue, setBackgroundValue, bgGrain, setBgGrain,
    lightRaysStyle, setLightRaysStyle, lightRaysOpacity, setLightRaysOpacity,
    lightRaysAngle, setLightRaysAngle, lightRaysCount, setLightRaysCount,
    lightRaysSourceX, setLightRaysSourceX, lightRaysSourceY, setLightRaysSourceY,
    aspectRatio, setAspectRatio, canvasWidth, setCanvasWidth, canvasHeight, setCanvasHeight,
    selectedPreset, setSelectedPreset, showSafeZone, setShowSafeZone,
    paddingMode, setPaddingMode, chromeStyle, setChromeStyle, chromeTheme, setChromeTheme,
    blurDensity, setBlurDensity, noImageMode, setNoImageMode,
    meshPoints, setMeshPoints, meshBlur, setMeshBlur, meshGrain, setMeshGrain,
    meshOpacity, setMeshOpacity, meshSpread, setMeshSpread,
    activePointIdx, setActivePointIdx,
    shaderType, setShaderType, shaderColors, setShaderColors, shaderParams, setShaderParams,
    watermarkEnabled, setWatermarkEnabled, watermarkText, setWatermarkText,
    watermarkSize, setWatermarkSize, watermarkPosition, setWatermarkPosition,
    watermarkOpacity, setWatermarkOpacity, watermarkFont, setWatermarkFont,
    watermarkBold, setWatermarkBold, watermarkItalic, setWatermarkItalic,
    annotationFont, setAnnotationFont, annotationFontSize, setAnnotationFontSize,
    annotationBold, setAnnotationBold, annotationItalic, setAnnotationItalic,
    annotationOutlineEnabled, setAnnotationOutlineEnabled, annotationOutlineColor, setAnnotationOutlineColor,
    annotationOutlineWidth, setAnnotationOutlineWidth,
    annotationGradientEnabled, setAnnotationGradientEnabled,
    annotationGradientColor1, setAnnotationGradientColor1,
    annotationGradientColor2, setAnnotationGradientColor2,
    annotationGradientAngle, setAnnotationGradientAngle,
    systemFonts, setSystemFonts, previewFont, setPreviewFont,
    position, setPosition, activeTool, setActiveTool, arrowStyle, setArrowStyle,
    annotations, setAnnotations, annotationColor, setAnnotationColor,
    annotationStrokeWidth, setAnnotationStrokeWidth, annotationDisplayWidth, setAnnotationDisplayWidth,
    blurStrength, setBlurStrength,
    autoImportCaptured, setAutoImportCaptured,
    captureShortcut, setCaptureShortcut,
  };
}
