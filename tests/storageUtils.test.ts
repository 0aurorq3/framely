import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  getUserDefault,
  updateUserDefault,
  clearUserDefaults,
  DEFAULT_SETTINGS,
} from '../src/renderer/utils/storageUtils';

const STORAGE_KEY = 'framely-user-defaults';

describe('storageUtils', () => {
  let store: Record<string, string>;

  beforeEach(() => {
    store = {};
    vi.spyOn(localStorage, 'getItem').mockImplementation((key: string) => store[key] ?? null);
    vi.spyOn(localStorage, 'setItem').mockImplementation((key: string, value: string) => {
      store[key] = value;
    });
    vi.spyOn(localStorage, 'removeItem').mockImplementation((key: string) => {
      delete store[key];
    });
  });

  describe('getUserDefault', () => {
    it('returns the fallback when no data is stored', () => {
      expect(getUserDefault('padding', 42)).toBe(42);
    });

    it('returns the stored value for an existing key', () => {
      store[STORAGE_KEY] = JSON.stringify({ padding: 60 });
      expect(getUserDefault('padding', 42)).toBe(60);
    });

    it('removes the retired capture preference while preserving existing defaults', () => {
      store[STORAGE_KEY] = JSON.stringify({ padding: 60, exportFormat: 'webp', captureResolution: '8k' });
      expect(getUserDefault('padding', 42)).toBe(60);
      expect(JSON.parse(store[STORAGE_KEY])).toEqual({ padding: 60, exportFormat: 'webp' });
    });

    it('keeps saved defaults readable when cleanup cannot write to storage', () => {
      store[STORAGE_KEY] = JSON.stringify({ padding: 60, captureResolution: '4k' });
      vi.mocked(localStorage.setItem).mockImplementationOnce(() => { throw new Error('Storage unavailable'); });
      expect(getUserDefault('padding', 42)).toBe(60);
    });

    it('returns the fallback for a missing key when other keys exist', () => {
      store[STORAGE_KEY] = JSON.stringify({ rounded: 10 });
      expect(getUserDefault('padding', 42)).toBe(42);
    });

    it('returns the fallback when JSON is malformed', () => {
      store[STORAGE_KEY] = 'not-json';
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      expect(getUserDefault('padding', 42)).toBe(42);
      consoleSpy.mockRestore();
    });

    it('returns the fallback for undefined stored value (explicit undefined)', () => {
      store[STORAGE_KEY] = JSON.stringify({ padding: undefined });
      // JSON.stringify removes undefined keys, so padding won't exist
      expect(getUserDefault('padding', 42)).toBe(42);
    });

    it('works with string values', () => {
      store[STORAGE_KEY] = JSON.stringify({ name: 'test-name' });
      expect(getUserDefault('name', 'default')).toBe('test-name');
    });

    it('works with boolean values', () => {
      store[STORAGE_KEY] = JSON.stringify({ enabled: true });
      expect(getUserDefault('enabled', false)).toBe(true);
    });

    it('works with number zero as stored value', () => {
      store[STORAGE_KEY] = JSON.stringify({ count: 0 });
      expect(getUserDefault('count', 10)).toBe(0);
    });

    it('works with empty string as stored value', () => {
      store[STORAGE_KEY] = JSON.stringify({ text: '' });
      expect(getUserDefault('text', 'fallback')).toBe('');
    });
  });

  describe('updateUserDefault', () => {
    it('creates a new entry when nothing is stored', () => {
      updateUserDefault('padding', 60);
      const saved = JSON.parse(store[STORAGE_KEY]);
      expect(saved.padding).toBe(60);
    });

    it('merges into existing data without losing other keys', () => {
      store[STORAGE_KEY] = JSON.stringify({ rounded: 10, padding: 30 });
      updateUserDefault('padding', 60);
      const saved = JSON.parse(store[STORAGE_KEY]);
      expect(saved.padding).toBe(60);
      expect(saved.rounded).toBe(10);
    });

    it('adds a new key alongside existing keys', () => {
      store[STORAGE_KEY] = JSON.stringify({ rounded: 10 });
      updateUserDefault('padding', 60);
      const saved = JSON.parse(store[STORAGE_KEY]);
      expect(saved.padding).toBe(60);
      expect(saved.rounded).toBe(10);
    });

    it('handles malformed JSON gracefully (no-op, original data preserved)', () => {
      store[STORAGE_KEY] = 'bad-json';
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      // updateUserDefault catches JSON parse error silently, does nothing
      updateUserDefault('padding', 60);
      expect(store[STORAGE_KEY]).toBe('bad-json');
      consoleSpy.mockRestore();
    });

    it('stores string values', () => {
      updateUserDefault('exportFormat', 'jpeg');
      const saved = JSON.parse(store[STORAGE_KEY]);
      expect(saved.exportFormat).toBe('jpeg');
    });

    it('stores boolean values', () => {
      updateUserDefault('watermarkEnabled', true);
      const saved = JSON.parse(store[STORAGE_KEY]);
      expect(saved.watermarkEnabled).toBe(true);
    });

    it('stores null values', () => {
      updateUserDefault('something', null);
      const saved = JSON.parse(store[STORAGE_KEY]);
      expect(saved.something).toBeNull();
    });
  });

  describe('clearUserDefaults', () => {
    it('removes the storage key', () => {
      store[STORAGE_KEY] = JSON.stringify({ padding: 60 });
      clearUserDefaults();
      expect(store[STORAGE_KEY]).toBeUndefined();
    });

    it('is a no-op when nothing is stored', () => {
      expect(() => clearUserDefaults()).not.toThrow();
      expect(store[STORAGE_KEY]).toBeUndefined();
    });
  });

  describe('DEFAULT_SETTINGS', () => {
    it('has all expected default keys', () => {
      expect(DEFAULT_SETTINGS).toHaveProperty('padding', 38);
      expect(DEFAULT_SETTINGS).toHaveProperty('rounded', 20);
      expect(DEFAULT_SETTINGS).toHaveProperty('shadow', 30);
      expect(DEFAULT_SETTINGS).toHaveProperty('watermarkEnabled', false);
      expect(DEFAULT_SETTINGS).toHaveProperty('watermarkText', 'Made with Framely');
      expect(DEFAULT_SETTINGS).toHaveProperty('watermarkSize', 20);
      expect(DEFAULT_SETTINGS).toHaveProperty('watermarkPosition', 'right');
      expect(DEFAULT_SETTINGS).toHaveProperty('watermarkOpacity', 0.38);
      expect(DEFAULT_SETTINGS).toHaveProperty('watermarkFont', 'sans-serif');
      expect(DEFAULT_SETTINGS).toHaveProperty('watermarkBold', false);
      expect(DEFAULT_SETTINGS).toHaveProperty('watermarkItalic', false);
      expect(DEFAULT_SETTINGS).toHaveProperty('annotationFont', 'sans-serif');
      expect(DEFAULT_SETTINGS).toHaveProperty('annotationFontSize', 24);
      expect(DEFAULT_SETTINGS).toHaveProperty('annotationBold', true);
      expect(DEFAULT_SETTINGS).toHaveProperty('annotationItalic', false);
      expect(DEFAULT_SETTINGS).toHaveProperty('exportFormat', 'png');
      expect(DEFAULT_SETTINGS).toHaveProperty('jpegQuality', 90);
      expect(DEFAULT_SETTINGS).toHaveProperty('compressionMode', 'balanced');
      expect(DEFAULT_SETTINGS).toHaveProperty('sidebarPosition', 'right');
    });

  });
});
