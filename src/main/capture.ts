import { shell, clipboard, BrowserWindow, globalShortcut } from 'electron';
import { exec } from 'child_process';
import { AppSettings } from './settings';

let lastCapturedBuffer: Buffer | null = null;
let ignoreBuffer: Buffer | null = null;
let registeredShortcut: string | null = null;
let autoImportEnabled = true;
let isFocusCheckSetup = false;
let isCaptureInitiated = false;

function sendCapture(window: BrowserWindow, dataUrl: string, initiated: boolean): void {
  if (window.isDestroyed()) return;
  window.webContents.send('hotkey:triggered', dataUrl, initiated);
  if (!window.isVisible()) window.show();
  if (window.isMinimized()) window.restore();
  window.focus();
}

// Set the buffer that should be ignored (copied by Framely itself)
export function setIgnoreNextClipboardImage(buffer: Buffer) {
  ignoreBuffer = buffer;
}

// Trigger OS native screen capture
export function triggerOSScreenCapture() {
  isCaptureInitiated = true;
  // Capture current clipboard image buffer BEFORE screenshot starts to compare with later
  const currentImage = clipboard.readImage();
  if (!currentImage.isEmpty()) {
    lastCapturedBuffer = currentImage.toBitmap();
  } else {
    lastCapturedBuffer = null;
  }

  if (process.platform === 'win32') {
    shell.openExternal('ms-screenclip:').catch((err) => {
      isCaptureInitiated = false;
      console.error('Failed to trigger Windows screenclip:', err);
    });
  } else if (process.platform === 'darwin') {
    exec('screencapture -i -c', (err) => {
      if (err) {
        console.error('Failed to trigger macOS screencapture:', err);
      }
    });
  } else {
    console.warn('Screen capture is not supported on this platform.');
  }
}

// Check clipboard for changes and notify renderer
export function checkClipboardAndImport(window: BrowserWindow) {
  if (window.isDestroyed()) return;

  if (!isCaptureInitiated) {
    const formats = clipboard.availableFormats();
    const hasTextOrHtml = formats.includes('text/html') || formats.includes('text/plain') || formats.includes('text/uri-list');
    if (hasTextOrHtml) {
      return;
    }
  }

  const image = clipboard.readImage();
  if (image.isEmpty()) {
    lastCapturedBuffer = null;
    return;
  }

  const currentBuffer = image.toBitmap();

  // If this matches the ignoreBuffer (copied by Framely), skip it and clear ignoreBuffer
  if (ignoreBuffer && currentBuffer.equals(ignoreBuffer)) {
    lastCapturedBuffer = currentBuffer;
    ignoreBuffer = null;
    return;
  }

  // If buffer is different from last captured buffer, it is a new screenshot
  if (!lastCapturedBuffer || !currentBuffer.equals(lastCapturedBuffer)) {
    lastCapturedBuffer = currentBuffer;
    const dataUrl = image.toDataURL();

    sendCapture(window, dataUrl, isCaptureInitiated);
  }
}

// Initialize focus listener
export function setupFocusCheck(window: BrowserWindow) {
  if (isFocusCheckSetup) return;
  isFocusCheckSetup = true;

  // Listen for focus event on main window
  window.on('focus', () => {
    if (autoImportEnabled || isCaptureInitiated) {
      checkClipboardAndImport(window);
      isCaptureInitiated = false;
    }
  });
}

// Update shortcut and monitoring config
export function updateCaptureConfigurations(settings: AppSettings, _window: BrowserWindow | null) {
  const newShortcut = settings.lastConfig?.captureShortcut ?? 'PrintScreen';

  // Update auto-import config
  autoImportEnabled = (settings.lastConfig?.autoImportCaptured ?? true) && (newShortcut !== 'Disabled');

  // If shortcut changed, unregister old one and register new one
  if (registeredShortcut !== newShortcut) {
    if (registeredShortcut) {
      try {
        globalShortcut.unregister(registeredShortcut);
      } catch (e) {
        console.error(`Failed to unregister global shortcut ${registeredShortcut}:`, e);
      }
      registeredShortcut = null;
    }

    if (newShortcut && newShortcut !== 'Disabled') {
      try {
        const success = globalShortcut.register(newShortcut, () => {
          triggerOSScreenCapture();
        });
        if (success) {
          registeredShortcut = newShortcut;
        } else {
          console.error(`Failed to register global shortcut: ${newShortcut}`);
        }
      } catch (e) {
        console.error(`Exception registering global shortcut ${newShortcut}:`, e);
      }
    }
  }
}

// Clean up shortcut on exit
export function cleanupCaptureModule() {
  try {
    globalShortcut.unregisterAll();
  } catch (e) {}
  registeredShortcut = null;
  lastCapturedBuffer = null;
  ignoreBuffer = null;
  isFocusCheckSetup = false;
  isCaptureInitiated = false;
}

export function getRegisteredShortcut() {
  return registeredShortcut;
}

export function getAutoImportEnabled() {
  return autoImportEnabled;
}

export function getIsCaptureInitiated() {
  return isCaptureInitiated;
}
