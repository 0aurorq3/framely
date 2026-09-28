import { BrowserWindow, dialog, ipcMain } from 'electron';
import type { BurstPackSavePayload } from '../../shared/burstTypes';
import { saveBurstPackBundle } from './burstBundle';

const MAX_BURST_PAYLOAD = 200 * 1024 * 1024;

export function registerBurstIpcHandlers(getMainWindow: () => BrowserWindow | null): void {
  ipcMain.handle('burst:save', async (_event, payload: BurstPackSavePayload) => {
    if (!payload?.variants?.length) {
      return { success: false, error: { code: 'INVALID_PAYLOAD', message: 'Missing Burst Pack variants.' } };
    }
    const totalSize = payload.variants.reduce((sum, variant) => sum + (variant.base64Data?.length || 0), 0);
    if (totalSize > MAX_BURST_PAYLOAD) {
      return { success: false, error: { code: 'PAYLOAD_TOO_LARGE', message: 'Burst Pack payload is too large.' } };
    }

    const mainWindow = getMainWindow();
    if (!mainWindow) {
      return { success: false, error: { code: 'NO_WINDOW', message: 'The Framely window is unavailable.' } };
    }
    const selection = await dialog.showOpenDialog(mainWindow, {
      title: 'Choose where to save the Burst Pack',
      properties: ['openDirectory', 'createDirectory'],
    });
    if (selection.canceled || !selection.filePaths[0]) {
      return { success: false, error: { code: 'CANCELLED', message: 'Save cancelled.' } };
    }
    return saveBurstPackBundle(selection.filePaths[0], payload);
  });
}
