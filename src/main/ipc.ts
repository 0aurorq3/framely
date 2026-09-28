import { ipcMain, dialog, clipboard, shell, BrowserWindow, nativeImage } from 'electron';
import * as fs from 'fs';
import * as path from 'path';
import { loadSettings, saveSettings } from './settings';
import { triggerOSScreenCapture, setIgnoreNextClipboardImage, updateCaptureConfigurations } from './capture';
import { compressImageBuffer, decodeImageDataUrl, CompressionMode } from './imageCompression';

export function registerIpcHandlers(getMainWindow: () => BrowserWindow | null) {
  // Theme Changed
  ipcMain.on('theme:changed', (_event, theme) => {
    const mainWindow = getMainWindow();
    if (!mainWindow) return;
    if (process.platform === 'win32' && typeof (mainWindow as any).setTitleBarOverlay === 'function') {
      const isDark = theme === 'dark';
      (mainWindow as any).setTitleBarOverlay({
        color: isDark ? '#0b0f19' : '#f7f7f7',
        symbolColor: isDark ? '#9699a3' : '#454953',
        height: 32
      });
    }
  });

  // Settings API
  ipcMain.handle('settings:get', () => {
    return loadSettings();
  });

  ipcMain.handle('settings:set', (_event, newSettings) => {
    const current = loadSettings();
    const merged = { ...current, ...newSettings };
    saveSettings(merged);
    
    // Update capture configurations dynamically
    updateCaptureConfigurations(merged, getMainWindow());
    
    return true;
  });

  // External URL
  ipcMain.on('url:open', (_event, url) => {
    shell.openExternal(url);
  });

  // Screen capture trigger from renderer
  ipcMain.on('capture:trigger', () => {
    triggerOSScreenCapture();
  });

  // File APIs
  ipcMain.handle('file:open-dialog', async () => {
    const mainWindow = getMainWindow();
    if (!mainWindow) return null;
    const result = await dialog.showOpenDialog(mainWindow, {
      properties: ['openFile'],
      filters: [
        { name: 'Images', extensions: ['png', 'jpg', 'jpeg', 'webp'] }
      ]
    });

    if (result.canceled || result.filePaths.length === 0) {
      return null;
    }

    const filePath = result.filePaths[0];
    const fileBuffer = fs.readFileSync(filePath);
    const ext = path.extname(filePath).toLowerCase();
    let mimeType = 'image/png';
    if (ext === '.jpg' || ext === '.jpeg') mimeType = 'image/jpeg';
    else if (ext === '.webp') mimeType = 'image/webp';

    return `data:${mimeType};base64,${fileBuffer.toString('base64')}`;
  });

  ipcMain.handle('file:open-in-explorer', async (_event, folderPath: string) => {
    if (typeof folderPath !== 'string' || !path.isAbsolute(folderPath) || !fs.existsSync(folderPath)) {
      return false;
    }
    try {
      if (!fs.statSync(folderPath).isDirectory()) return false;
    } catch {
      return false;
    }
    return (await shell.openPath(folderPath)) === '';
  });

  ipcMain.handle('file:save-dialog', async (_event, { base64Data, type, quality, compressionMode }) => {
    const mainWindow = getMainWindow();
    if (!mainWindow) return false;

    const ext = type === 'jpeg' ? 'jpg' : type === 'webp' ? 'webp' : 'png';
    const result = await dialog.showSaveDialog(mainWindow, {
      title: 'Export Beautified Screenshot',
      defaultPath: `framely-export.${ext}`,
      filters: [
        { name: type === 'jpeg' ? 'JPEG Image' : type === 'webp' ? 'WebP Image' : 'PNG Image', extensions: [ext] }
      ]
    });

    if (result.canceled || !result.filePath) {
      return false;
    }

    const buffer = decodeImageDataUrl(base64Data);
    const outputBuffer = await compressImageBuffer(buffer, {
      type,
      quality,
      compressionMode: compressionMode as CompressionMode | undefined,
    });
    
    fs.writeFileSync(result.filePath, outputBuffer);
    return true;
  });

  // Clipboard APIs
  ipcMain.handle('clipboard:copy-image', async (_event, base64Data, text?: string) => {
    try {
      const base64Content = base64Data.replace(/^data:image\/\w+;base64,/, '');
      const buffer = Buffer.from(base64Content, 'base64');
      
      const image = nativeImage.createFromBuffer(buffer);
      if (text) {
        clipboard.write({
          image,
          text: text
        });
      } else {
        clipboard.writeImage(image);
      }

      // Read back immediately to get the exact OS-converted bitmap bytes
      const readBackImage = clipboard.readImage();
      if (!readBackImage.isEmpty()) {
        setIgnoreNextClipboardImage(readBackImage.toBitmap());
      }
      
      return true;
    } catch (error) {
      console.error('Failed to copy image to clipboard:', error);
      return false;
    }
  });

  ipcMain.handle('clipboard:read-image', () => {
    const image = clipboard.readImage();
    if (image.isEmpty()) return null;
    return image.toDataURL();
  });

  ipcMain.handle('clipboard:copy-text', (_event, text: string) => {
    try {
      clipboard.writeText(text);
      return true;
    } catch (error) {
      console.error('Failed to copy text to clipboard:', error);
      return false;
    }
  });
}
