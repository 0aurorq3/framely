import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { BurstPackSavePayload } from '../src/shared/burstTypes';

const handlers = vi.hoisted(() => new Map<string, (...args: any[]) => any>());
const showOpenDialog = vi.hoisted(() => vi.fn());
const saveBurstPackBundle = vi.hoisted(() => vi.fn());

vi.mock('electron', () => ({
  ipcMain: { handle: vi.fn((channel: string, handler: (...args: any[]) => any) => handlers.set(channel, handler)) },
  dialog: { showOpenDialog },
}));
vi.mock('../src/main/burst/burstBundle', () => ({ saveBurstPackBundle }));

import { registerBurstIpcHandlers } from '../src/main/burst/burstIpc';

function payload(): BurstPackSavePayload {
  return {
    documentName: 'framely-burst',
    exportFormat: 'png',
    jpegQuality: 90,
    compressionMode: 'balanced',
    variants: [{
      presetKey: 'OG Standard', filename: 'og-standard-1200x630.png',
      base64Data: 'data:image/png;base64,AAAA', width: 1200, height: 630, fileSizeKb: 1,
    }],
  };
}

describe('burst:save', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    handlers.clear();
    registerBurstIpcHandlers(() => ({}) as any);
    showOpenDialog.mockResolvedValue({ canceled: false, filePaths: ['C:\\exports'] });
    saveBurstPackBundle.mockResolvedValue({ success: true });
  });

  it('asks the user for a destination folder', async () => {
    const data = payload();
    await handlers.get('burst:save')!({}, data);
    expect(showOpenDialog).toHaveBeenCalledWith(expect.anything(), expect.objectContaining({
      properties: expect.arrayContaining(['openDirectory']),
    }));
    expect(saveBurstPackBundle).toHaveBeenCalledWith('C:\\exports', data);
  });

  it('does not save when the dialog is cancelled', async () => {
    showOpenDialog.mockResolvedValue({ canceled: true, filePaths: [] });
    const result = await handlers.get('burst:save')!({}, payload());
    expect(result.error.code).toBe('CANCELLED');
    expect(saveBurstPackBundle).not.toHaveBeenCalled();
  });

  it('rejects an empty pack before opening the dialog', async () => {
    const result = await handlers.get('burst:save')!({}, { ...payload(), variants: [] });
    expect(result.error.code).toBe('INVALID_PAYLOAD');
    expect(showOpenDialog).not.toHaveBeenCalled();
  });
});
