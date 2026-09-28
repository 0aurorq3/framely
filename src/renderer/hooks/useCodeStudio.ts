import { useState, useCallback } from 'react';
import type { RenderConfig } from '../canvasRenderer';

interface MeshPoint {
  id: string; color: string; x: number; y: number; radius: number;
}

interface UseCodeStudioDeps {
  backgroundType: string;
  backgroundValue: string;
  bgGrain: number;
  lightRaysStyle: string;
  lightRaysOpacity: number;
  lightRaysAngle: number;
  lightRaysCount: number;
  lightRaysSourceX: number;
  lightRaysSourceY: number;
  meshPoints: MeshPoint[];
  meshBlur: number;
  meshGrain: number;
  meshOpacity: number;
  meshSpread: number;
  selectedPreset: string;
  imageSrc: string | null;
  noImageMode: boolean;
  setBackgroundType: React.Dispatch<React.SetStateAction<any>>;
  setBackgroundValue: React.Dispatch<React.SetStateAction<string>>;
  setBgGrain: React.Dispatch<React.SetStateAction<number>>;
  setLightRaysStyle: React.Dispatch<React.SetStateAction<any>>;
  setLightRaysOpacity: React.Dispatch<React.SetStateAction<number>>;
  setLightRaysAngle: React.Dispatch<React.SetStateAction<number>>;
  setLightRaysCount: React.Dispatch<React.SetStateAction<number>>;
  setLightRaysSourceX: React.Dispatch<React.SetStateAction<number>>;
  setLightRaysSourceY: React.Dispatch<React.SetStateAction<number>>;
  setMeshPoints: React.Dispatch<React.SetStateAction<MeshPoint[]>>;
  setMeshBlur: React.Dispatch<React.SetStateAction<number>>;
  setMeshGrain: React.Dispatch<React.SetStateAction<number>>;
  setMeshOpacity: React.Dispatch<React.SetStateAction<number>>;
  setMeshSpread: React.Dispatch<React.SetStateAction<number>>;
  setSelectedPreset: React.Dispatch<React.SetStateAction<string>>;
  setNoImageMode: React.Dispatch<React.SetStateAction<boolean>>;
  getCurrentConfig: () => RenderConfig;
  pushHistory: (config: any) => void;
}

export function useCodeStudio(deps: UseCodeStudioDeps) {
  const [codeStudioActive, setCodeStudioActive] = useState<boolean>(false);
  const [codeStudioCode, setCodeStudioCode] = useState<string>(() =>
    `// Paste or type your code here...\nfunction helloWorld() {\n  console.log("Hello, Framely!");\n}`
  );
  const [codeStudioLanguage, setCodeStudioLanguage] = useState<string>('javascript');
  const [codeStudioTheme, setCodeStudioTheme] = useState<string>('Dracula');
  const [codeStudioFontSize, setCodeStudioFontSize] = useState<number>(14);
  const [codeStudioLineNumbers, setCodeStudioLineNumbers] = useState<boolean>(true);
  const [codeStudioShowLanguage, setCodeStudioShowLanguage] = useState<boolean>(true);
  const [codeStudioBreakpoints, setCodeStudioBreakpoints] = useState<number[]>([]);
  const [codeStudioShowBreakpoints, setCodeStudioShowBreakpoints] = useState<boolean>(true);
  const [screenshotBgConfig, setScreenshotBgConfig] = useState<any>(null);
  const [codeStudioBgConfig, setCodeStudioBgConfig] = useState<any>(null);

  const toggleCodeStudio = useCallback((active: boolean, codeText?: string, codeLang?: string) => {
    setCodeStudioActive(active);

    if (active) {
      let currentBg = screenshotBgConfig;
      if (!codeStudioActive) {
        currentBg = {
          backgroundType: deps.backgroundType,
          backgroundValue: deps.backgroundValue,
          bgGrain: deps.bgGrain,
          lightRaysStyle: deps.lightRaysStyle,
          lightRaysOpacity: deps.lightRaysOpacity,
          lightRaysAngle: deps.lightRaysAngle,
          lightRaysCount: deps.lightRaysCount,
          lightRaysSourceX: deps.lightRaysSourceX,
          lightRaysSourceY: deps.lightRaysSourceY,
          meshPoints: deps.meshPoints,
          meshBlur: deps.meshBlur,
          meshGrain: deps.meshGrain,
          meshOpacity: deps.meshOpacity,
          meshSpread: deps.meshSpread,
          selectedPreset: deps.selectedPreset,
        };
        setScreenshotBgConfig(currentBg);
      }

      const codeStudioBg = codeStudioBgConfig || {
        backgroundType: 'gradient',
        backgroundValue: 'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)',
        bgGrain: 0,
        lightRaysStyle: 'none',
        lightRaysOpacity: 30,
        lightRaysAngle: 135,
        lightRaysCount: 4,
        lightRaysSourceX: 50,
        lightRaysSourceY: 0,
        meshPoints: [
          { id: '1', color: '#ff5f6d', x: 0.2, y: 0.2, radius: 180 },
          { id: '2', color: '#ffc371', x: 0.8, y: 0.2, radius: 220 },
          { id: '3', color: '#00c6ff', x: 0.2, y: 0.8, radius: 200 },
          { id: '4', color: '#7209b7', x: 0.8, y: 0.8, radius: 240 },
        ],
        meshBlur: 60,
        meshGrain: 15,
        meshOpacity: 100,
        meshSpread: 100,
        selectedPreset: '',
      };

      deps.setBackgroundType(codeStudioBg.backgroundType);
      deps.setBackgroundValue(codeStudioBg.backgroundValue);
      deps.setBgGrain(codeStudioBg.bgGrain);
      deps.setLightRaysStyle(codeStudioBg.lightRaysStyle);
      deps.setLightRaysOpacity(codeStudioBg.lightRaysOpacity);
      deps.setLightRaysAngle(codeStudioBg.lightRaysAngle);
      deps.setLightRaysCount(codeStudioBg.lightRaysCount);
      deps.setLightRaysSourceX(codeStudioBg.lightRaysSourceX);
      deps.setLightRaysSourceY(codeStudioBg.lightRaysSourceY);
      deps.setMeshPoints(codeStudioBg.meshPoints);
      deps.setMeshBlur(codeStudioBg.meshBlur);
      deps.setMeshGrain(codeStudioBg.meshGrain);
      deps.setMeshOpacity(codeStudioBg.meshOpacity);
      deps.setMeshSpread(codeStudioBg.meshSpread);
      deps.setSelectedPreset(codeStudioBg.selectedPreset);

      deps.setNoImageMode(true);
      if (codeText !== undefined) setCodeStudioCode(codeText);
      if (codeLang !== undefined) setCodeStudioLanguage(codeLang);

      deps.pushHistory({
        ...deps.getCurrentConfig(),
        codeStudioActive: true,
        noImage: true,
        backgroundType: codeStudioBg.backgroundType,
        backgroundValue: codeStudioBg.backgroundValue,
        bgGrain: codeStudioBg.bgGrain,
        lightRaysStyle: codeStudioBg.lightRaysStyle,
        lightRaysOpacity: codeStudioBg.lightRaysOpacity,
        lightRaysAngle: codeStudioBg.lightRaysAngle,
        lightRaysCount: codeStudioBg.lightRaysCount,
        lightRaysSourceX: codeStudioBg.lightRaysSourceX,
        lightRaysSourceY: codeStudioBg.lightRaysSourceY,
        meshPoints: codeStudioBg.meshPoints,
        meshBlur: codeStudioBg.meshBlur,
        meshGrain: codeStudioBg.meshGrain,
        meshOpacity: codeStudioBg.meshOpacity,
        meshSpread: codeStudioBg.meshSpread,
        selectedPreset: codeStudioBg.selectedPreset,
        screenshotBgConfig: currentBg,
        codeStudioBgConfig: codeStudioBg,
        ...(codeText !== undefined ? { codeStudioCode: codeText } : {}),
        ...(codeLang !== undefined ? { codeStudioLanguage: codeLang } : {}),
      });

    } else {
      let currentBg = codeStudioBgConfig;
      if (codeStudioActive) {
        currentBg = {
          backgroundType: deps.backgroundType,
          backgroundValue: deps.backgroundValue,
          bgGrain: deps.bgGrain,
          lightRaysStyle: deps.lightRaysStyle,
          lightRaysOpacity: deps.lightRaysOpacity,
          lightRaysAngle: deps.lightRaysAngle,
          lightRaysCount: deps.lightRaysCount,
          lightRaysSourceX: deps.lightRaysSourceX,
          lightRaysSourceY: deps.lightRaysSourceY,
          meshPoints: deps.meshPoints,
          meshBlur: deps.meshBlur,
          meshGrain: deps.meshGrain,
          meshOpacity: deps.meshOpacity,
          meshSpread: deps.meshSpread,
          selectedPreset: deps.selectedPreset,
        };
        setCodeStudioBgConfig(currentBg);
      }

      const screenshotBg = screenshotBgConfig || {
        backgroundType: 'gradient',
        backgroundValue: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
        bgGrain: 0,
        lightRaysStyle: 'none',
        lightRaysOpacity: 30,
        lightRaysAngle: 135,
        lightRaysCount: 4,
        lightRaysSourceX: 50,
        lightRaysSourceY: 0,
        meshPoints: [
          { id: '1', color: '#ff5f6d', x: 0.2, y: 0.2, radius: 180 },
          { id: '2', color: '#ffc371', x: 0.8, y: 0.2, radius: 220 },
          { id: '3', color: '#00c6ff', x: 0.2, y: 0.8, radius: 200 },
          { id: '4', color: '#7209b7', x: 0.8, y: 0.8, radius: 240 },
        ],
        meshBlur: 60,
        meshGrain: 15,
        meshOpacity: 100,
        meshSpread: 100,
        selectedPreset: '',
      };

      deps.setBackgroundType(screenshotBg.backgroundType);
      deps.setBackgroundValue(screenshotBg.backgroundValue);
      deps.setBgGrain(screenshotBg.bgGrain ?? 0);
      deps.setLightRaysStyle(screenshotBg.lightRaysStyle ?? 'none');
      deps.setLightRaysOpacity(screenshotBg.lightRaysOpacity ?? 30);
      deps.setLightRaysAngle(screenshotBg.lightRaysAngle ?? 135);
      deps.setLightRaysCount(screenshotBg.lightRaysCount ?? 4);
      deps.setLightRaysSourceX(screenshotBg.lightRaysSourceX ?? 50);
      deps.setLightRaysSourceY(screenshotBg.lightRaysSourceY ?? 0);
      deps.setMeshPoints(screenshotBg.meshPoints ?? [
        { id: '1', color: '#ff5f6d', x: 0.2, y: 0.2, radius: 180 },
        { id: '2', color: '#ffc371', x: 0.8, y: 0.2, radius: 220 },
        { id: '3', color: '#00c6ff', x: 0.2, y: 0.8, radius: 200 },
        { id: '4', color: '#7209b7', x: 0.8, y: 0.8, radius: 240 },
      ]);
      deps.setMeshBlur(screenshotBg.meshBlur ?? 60);
      deps.setMeshGrain(screenshotBg.meshGrain ?? 15);
      deps.setMeshOpacity(screenshotBg.meshOpacity ?? 100);
      deps.setMeshSpread(screenshotBg.meshSpread ?? 100);
      deps.setSelectedPreset(screenshotBg.selectedPreset ?? '');

      const hasImage = !!deps.imageSrc;
      deps.setNoImageMode(!hasImage);

      deps.pushHistory({
        ...deps.getCurrentConfig(),
        codeStudioActive: false,
        noImage: !hasImage,
        codeStudioBgConfig: currentBg,
        screenshotBgConfig: screenshotBg,
        backgroundType: screenshotBg.backgroundType,
        backgroundValue: screenshotBg.backgroundValue,
        bgGrain: screenshotBg.bgGrain ?? 0,
        lightRaysStyle: screenshotBg.lightRaysStyle ?? 'none',
        lightRaysOpacity: screenshotBg.lightRaysOpacity ?? 30,
        lightRaysAngle: screenshotBg.lightRaysAngle ?? 135,
        lightRaysCount: screenshotBg.lightRaysCount ?? 4,
        lightRaysSourceX: screenshotBg.lightRaysSourceX ?? 50,
        lightRaysSourceY: screenshotBg.lightRaysSourceY ?? 0,
        meshPoints: screenshotBg.meshPoints ?? [
          { id: '1', color: '#ff5f6d', x: 0.2, y: 0.2, radius: 180 },
          { id: '2', color: '#ffc371', x: 0.8, y: 0.2, radius: 220 },
          { id: '3', color: '#00c6ff', x: 0.2, y: 0.8, radius: 200 },
          { id: '4', color: '#7209b7', x: 0.8, y: 0.8, radius: 240 },
        ],
        meshBlur: screenshotBg.meshBlur ?? 60,
        meshGrain: screenshotBg.meshGrain ?? 15,
        meshOpacity: screenshotBg.meshOpacity ?? 100,
        meshSpread: screenshotBg.meshSpread ?? 100,
        selectedPreset: screenshotBg.selectedPreset ?? '',
      });
    }
  }, [
    deps.backgroundType, deps.backgroundValue, deps.bgGrain, deps.lightRaysStyle, deps.lightRaysOpacity, deps.lightRaysAngle,
    deps.lightRaysCount, deps.lightRaysSourceX, deps.lightRaysSourceY, deps.meshPoints, deps.meshBlur, deps.meshGrain,
    deps.meshOpacity, deps.meshSpread, deps.selectedPreset, deps.imageSrc, deps.getCurrentConfig, deps.pushHistory,
    setCodeStudioCode, setCodeStudioLanguage, codeStudioActive, screenshotBgConfig, codeStudioBgConfig
  ]);

  return {
    codeStudioActive, setCodeStudioActive,
    codeStudioCode, setCodeStudioCode,
    codeStudioLanguage, setCodeStudioLanguage,
    codeStudioTheme, setCodeStudioTheme,
    codeStudioFontSize, setCodeStudioFontSize,
    codeStudioLineNumbers, setCodeStudioLineNumbers,
    codeStudioShowLanguage, setCodeStudioShowLanguage,
    codeStudioBreakpoints, setCodeStudioBreakpoints,
    codeStudioShowBreakpoints, setCodeStudioShowBreakpoints,
    toggleCodeStudio,
    screenshotBgConfig, setScreenshotBgConfig,
    codeStudioBgConfig, setCodeStudioBgConfig,
  };
}
