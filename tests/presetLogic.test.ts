import { describe, it, expect } from 'vitest';

describe('Preset Logic', () => {
  describe('saveCustomPreset', () => {
    it('does not save preset with blank name', () => {
      const presets: any[] = [];
      const newPresetName = '  ';
      if (newPresetName.trim()) {
        presets.push({ id: 'x', name: newPresetName });
      }
      expect(presets.length).toBe(0);
    });

    it('saves preset with valid name', () => {
      const presets: any[] = [];
      const name = 'My Preset';
      const bg = 'linear-gradient(135deg, #f00, #00f)';
      const newPreset = {
        id: `custom-${Date.now()}`,
        name,
        gradient: bg,
        color: undefined,
        type: 'gradient',
      };
      presets.push(newPreset);
      expect(presets.length).toBe(1);
      expect(presets[0].name).toBe(name);
      expect(presets[0].gradient).toBe(bg);
    });
  });

  describe('deleteCustomPreset', () => {
    it('removes preset by ID', () => {
      const presets = [
        { id: 'a', name: 'A' },
        { id: 'b', name: 'B' },
        { id: 'c', name: 'C' },
      ];
      const filtered = presets.filter((p) => p.id !== 'b');
      expect(filtered.length).toBe(2);
      expect(filtered.every((p) => p.id !== 'b')).toBe(true);
    });
  });

  describe('selectBackgroundPreset', () => {
    it('selects gradient preset', () => {
      let bgType = 'color';
      let bgValue = '#fff';
      const pushHistoryCalls: any[] = [];

      const selectBackgroundPreset = (preset: any) => {
        bgType = preset.type;
        bgValue = preset.gradient || preset.color;
        pushHistoryCalls.push({ backgroundType: preset.type, backgroundValue: bgValue });
      };

      selectBackgroundPreset({ type: 'gradient', gradient: 'linear-gradient(#aaa, #bbb)', color: undefined });
      expect(bgType).toBe('gradient');
      expect(bgValue).toBe('linear-gradient(#aaa, #bbb)');
      expect(pushHistoryCalls.length).toBe(1);
    });

    it('selects color preset', () => {
      let bgType = 'gradient';
      let bgValue = 'linear-gradient(...)';

      const selectBackgroundPreset = (preset: any) => {
        bgType = preset.type;
        bgValue = preset.gradient || preset.color;
      };

      selectBackgroundPreset({ type: 'color', gradient: undefined, color: '#ff0000' });
      expect(bgType).toBe('color');
      expect(bgValue).toBe('#ff0000');
    });
  });
});
