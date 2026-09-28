import { useEffect } from 'react';
import type { RenderConfig } from '../canvasRenderer';
import { updateUserDefault } from '../utils/storageUtils';

interface UseSettingsSyncDeps {
  appTheme: 'dark' | 'light';
  exportFormat: string;
  jpegQuality: number;
  compressionMode: string;
  blurStrength: number;
  sidebarPosition: string;
  bgGrain: number;
  lightRaysStyle: string;
  lightRaysOpacity: number;
  lightRaysAngle: number;
  lightRaysCount: number;
  lightRaysSourceX: number;
  lightRaysSourceY: number;
  getCurrentConfig: () => RenderConfig;
  customPresets: any[];
  setCustomPresets: React.Dispatch<React.SetStateAction<any[]>>;
  applyConfig: (config: RenderConfig) => void;
  // Deps for the settings sync effect dependency array
  syncDeps: any[];
}

export function useSettingsSync(deps: UseSettingsSyncDeps) {
  // Sync settings on startup
  useEffect(() => {
    const initApp = async () => {
      if (window.framelyAPI) {
        try {
          const settings = await window.framelyAPI.getSettings();
          if (settings.lastConfig) deps.applyConfig(settings.lastConfig);
          if (settings.presets) deps.setCustomPresets(settings.presets);
        } catch (e) { console.error('Failed to read settings:', e); }
      }
    };
    initApp();
  }, []);

  // Sync appTheme to localStorage and toggle body class
  useEffect(() => {
    localStorage.setItem('framely-app-theme', deps.appTheme);
    if (deps.appTheme === 'light') {
      document.body.classList.add('light-theme');
    } else {
      document.body.classList.remove('light-theme');
    }
    if (window.framelyAPI && typeof window.framelyAPI.setTheme === 'function') {
      window.framelyAPI.setTheme(deps.appTheme);
    }
  }, [deps.appTheme]);

  useEffect(() => {
    updateUserDefault('exportFormat', deps.exportFormat);
  }, [deps.exportFormat]);

  useEffect(() => {
    updateUserDefault('jpegQuality', deps.jpegQuality);
  }, [deps.jpegQuality]);

  useEffect(() => {
    updateUserDefault('compressionMode', deps.compressionMode);
  }, [deps.compressionMode]);

  useEffect(() => {
    updateUserDefault('blurStrength', deps.blurStrength);
  }, [deps.blurStrength]);

  useEffect(() => {
    updateUserDefault('sidebarPosition', deps.sidebarPosition);
  }, [deps.sidebarPosition]);

  useEffect(() => {
    updateUserDefault('bgGrain', deps.bgGrain);
  }, [deps.bgGrain]);

  useEffect(() => {
    updateUserDefault('lightRaysStyle', deps.lightRaysStyle);
  }, [deps.lightRaysStyle]);

  useEffect(() => {
    updateUserDefault('lightRaysOpacity', deps.lightRaysOpacity);
  }, [deps.lightRaysOpacity]);

  useEffect(() => {
    updateUserDefault('lightRaysAngle', deps.lightRaysAngle);
  }, [deps.lightRaysAngle]);

  useEffect(() => {
    updateUserDefault('lightRaysCount', deps.lightRaysCount);
  }, [deps.lightRaysCount]);

  useEffect(() => {
    updateUserDefault('lightRaysSourceX', deps.lightRaysSourceX);
  }, [deps.lightRaysSourceX]);

  useEffect(() => {
    updateUserDefault('lightRaysSourceY', deps.lightRaysSourceY);
  }, [deps.lightRaysSourceY]);

  // Debounced settings save to main process
  useEffect(() => {
    const saveSettingsToMain = async () => {
      if (window.framelyAPI) {
        const config = deps.getCurrentConfig();
        const settings = { windowBounds: {}, lastConfig: { ...config, annotations: [] }, presets: deps.customPresets };
        await window.framelyAPI.saveSettings(settings);
      }
    };
    const timer = setTimeout(saveSettingsToMain, 1000);
    return () => clearTimeout(timer);
  }, deps.syncDeps);
}
