import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getUserDefault, updateUserDefault, clearUserDefaults, DEFAULT_SETTINGS } from '../src/renderer/utils/storageUtils';

beforeEach(() => {
  localStorage.clear();
  vi.clearAllMocks();
});

describe('storageUtils - Extended', () => {
  describe('getUserDefault', () => {
    it('returns stored value when key exists', () => {
      localStorage.setItem('framely-user-defaults', JSON.stringify({ padding: 50 }));
      expect(getUserDefault('padding', 38)).toBe(50);
    });

    it('returns fallback when no stored data', () => {
      expect(getUserDefault('padding', 38)).toBe(38);
    });

    it('returns fallback when key does not exist in stored data', () => {
      localStorage.setItem('framely-user-defaults', JSON.stringify({ rounded: 10 }));
      expect(getUserDefault('padding', 38)).toBe(38);
    });

    it('handles corrupted JSON gracefully', () => {
      const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
      localStorage.setItem('framely-user-defaults', 'not-json');
      expect(getUserDefault('padding', 38)).toBe(38);
      spy.mockRestore();
    });

    it('returns undefined values from storage', () => {
      localStorage.setItem('framely-user-defaults', JSON.stringify({ padding: null }));
      expect(getUserDefault('padding', 38)).toBe(null);
    });

    it('returns falsy zero value from storage', () => {
      localStorage.setItem('framely-user-defaults', JSON.stringify({ padding: 0 }));
      expect(getUserDefault('padding', 38)).toBe(0);
    });
  });

  describe('updateUserDefault', () => {
    it('saves a value when no existing data', () => {
      updateUserDefault('padding', 60);
      const saved = JSON.parse(localStorage.getItem('framely-user-defaults')!);
      expect(saved.padding).toBe(60);
    });

    it('merges with existing data', () => {
      localStorage.setItem('framely-user-defaults', JSON.stringify({ rounded: 10 }));
      updateUserDefault('padding', 60);
      const saved = JSON.parse(localStorage.getItem('framely-user-defaults')!);
      expect(saved.rounded).toBe(10);
      expect(saved.padding).toBe(60);
    });

    it('overwrites existing key', () => {
      localStorage.setItem('framely-user-defaults', JSON.stringify({ padding: 30 }));
      updateUserDefault('padding', 60);
      const saved = JSON.parse(localStorage.getItem('framely-user-defaults')!);
      expect(saved.padding).toBe(60);
    });

    it('handles corrupted existing data', () => {
      const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
      localStorage.setItem('framely-user-defaults', 'broken');
      updateUserDefault('padding', 60);
      // Corrupt data is not overwritten — the catch swallows the error
      const saved = localStorage.getItem('framely-user-defaults');
      expect(saved).toBe('broken');
      spy.mockRestore();
    });

    it('saves string values', () => {
      updateUserDefault('watermarkText', 'Test');
      const saved = JSON.parse(localStorage.getItem('framely-user-defaults')!);
      expect(saved.watermarkText).toBe('Test');
    });

    it('saves boolean values', () => {
      updateUserDefault('watermarkEnabled', true);
      const saved = JSON.parse(localStorage.getItem('framely-user-defaults')!);
      expect(saved.watermarkEnabled).toBe(true);
    });
  });

  describe('clearUserDefaults', () => {
    it('removes all stored defaults', () => {
      localStorage.setItem('framely-user-defaults', JSON.stringify({ padding: 50 }));
      clearUserDefaults();
      expect(localStorage.getItem('framely-user-defaults')).toBeNull();
    });

    it('handles non-existent data gracefully', () => {
      expect(() => clearUserDefaults()).not.toThrow();
    });
  });

  describe('DEFAULT_SETTINGS', () => {
    it('has required keys with correct default values', () => {
      expect(DEFAULT_SETTINGS.padding).toBe(38);
      expect(DEFAULT_SETTINGS.rounded).toBe(20);
      expect(DEFAULT_SETTINGS.shadow).toBe(30);
      expect(DEFAULT_SETTINGS.watermarkEnabled).toBe(false);
      expect(DEFAULT_SETTINGS.watermarkText).toBe('Made with Framely');
      expect(DEFAULT_SETTINGS.watermarkSize).toBe(20);
      expect(DEFAULT_SETTINGS.watermarkPosition).toBe('right');
      expect(DEFAULT_SETTINGS.watermarkOpacity).toBe(0.38);
      expect(DEFAULT_SETTINGS.exportFormat).toBe('png');
      expect(DEFAULT_SETTINGS.jpegQuality).toBe(90);
      expect(DEFAULT_SETTINGS.sidebarPosition).toBe('right');
    });
  });
});
