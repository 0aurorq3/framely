import { contextBridge, ipcRenderer } from 'electron';

// Expose safe IPC channels to the renderer process
contextBridge.exposeInMainWorld('framelyAPI', {
  platform: process.platform,
  osInfo: `${process.platform || 'Unknown OS'} ${process.arch || ''}`.trim(),
  versions: {
    electron: process.versions.electron || 'N/A',
    chrome: process.versions.chrome || 'N/A',
    node: process.versions.node || 'N/A',
    v8: process.versions.v8 || 'N/A',
  },
  setTheme: (theme: 'dark' | 'light') => ipcRenderer.send('theme:changed', theme),

  // Settings API
  getSettings: () => ipcRenderer.invoke('settings:get'),
  saveSettings: (settings: any) => ipcRenderer.invoke('settings:set', settings),

  // File API
  openFile: () => ipcRenderer.invoke('file:open-dialog'),
  saveFile: (base64Data: string, type: 'png' | 'jpeg' | 'webp', quality?: number, compressionMode?: 'original' | 'balanced' | 'small') => 
    ipcRenderer.invoke('file:save-dialog', { base64Data, type, quality, compressionMode }),

  // Screen Capture API
  triggerScreenCapture: () => ipcRenderer.send('capture:trigger'),

  // Clipboard API
  copyImageToClipboard: (base64Data: string, text?: string) => ipcRenderer.invoke('clipboard:copy-image', base64Data, text),
  readImageFromClipboard: () => ipcRenderer.invoke('clipboard:read-image'),
  copyTextToClipboard: (text: string) => ipcRenderer.invoke('clipboard:copy-text', text),
  openURL: (url: string) => ipcRenderer.send('url:open', url),

  // Event listener for global hotkey
  onGlobalHotkeyTriggered: (callback: (imageUrl: string, isCaptureInitiated?: boolean) => void) => {
    const subscription = (_event: any, imageUrl: string, isCaptureInitiated?: boolean) => callback(imageUrl, isCaptureInitiated);
    ipcRenderer.on('hotkey:triggered', subscription);
    return () => {
      ipcRenderer.removeListener('hotkey:triggered', subscription);
    };
  },

  openInExplorer: (filePath: string) => ipcRenderer.invoke('file:open-in-explorer', filePath),
  saveBurstPack: (payload: any) => ipcRenderer.invoke('burst:save', payload),
});
