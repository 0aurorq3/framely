import { describe, it, expect } from 'vitest';
import {
  solidPresets,
  curatedMeshPalettes,
  disneyHollywoodGradients,
  disneyHollywoodMeshPalettes,
  defaultGradients,
  platformPresets,
} from '../src/renderer/presetsData';

describe('Presets Data', () => {
  describe('solidPresets', () => {
    it('has valid entries', () => {
      expect(solidPresets.length).toBeGreaterThan(0);
      for (const p of solidPresets) {
        expect(p.id).toBeTruthy();
        expect(p.name).toBeTruthy();
        expect(p.color.startsWith('#')).toBe(true);
        expect(p.type).toBe('color');
      }
    });
  });

  describe('curatedMeshPalettes', () => {
    it('has valid entries', () => {
      expect(curatedMeshPalettes.length).toBeGreaterThan(0);
      for (const p of curatedMeshPalettes) {
        expect(p.name).toBeTruthy();
        expect(Array.isArray(p.colors)).toBe(true);
        expect(p.colors.length).toBe(4);
        for (const c of p.colors) {
          expect(c.startsWith('#')).toBe(true);
        }
      }
    });
  });

  describe('disneyHollywoodGradients', () => {
    it('has valid entries with unique IDs', () => {
      expect(disneyHollywoodGradients.length).toBeGreaterThan(0);
      const ids = new Set<string>();
      for (const g of disneyHollywoodGradients) {
        expect(g.id).toBeTruthy();
        expect(ids.has(g.id)).toBe(false);
        ids.add(g.id);
        expect(g.name).toBeTruthy();
        expect(
          g.gradient.startsWith('linear-gradient') || g.gradient.startsWith('radial-gradient') || g.gradient.startsWith('url(')
        ).toBe(true);
        expect(['disney', 'marvel', 'hollywood', 'os'].includes(g.category!)).toBe(true);
      }
    });
  });

  describe('disneyHollywoodMeshPalettes', () => {
    it('has valid entries', () => {
      expect(disneyHollywoodMeshPalettes.length).toBeGreaterThan(0);
      for (const p of disneyHollywoodMeshPalettes) {
        expect(p.name).toBeTruthy();
        expect(p.colors.length).toBe(4);
        expect(['disney', 'marvel', 'hollywood'].includes(p.category)).toBe(true);
      }
    });
  });

  describe('defaultGradients', () => {
    it('has valid entries with unique IDs', () => {
      expect(defaultGradients.length).toBeGreaterThan(0);
      const ids = new Set<string>();
      for (const g of defaultGradients) {
        expect(g.id).toBeTruthy();
        expect(ids.has(g.id)).toBe(false);
        ids.add(g.id);
        expect(g.name).toBeTruthy();
        expect(
          g.gradient.startsWith('linear-gradient') || g.gradient.startsWith('radial-gradient')
        ).toBe(true);
        expect(g.type).toBe('gradient');
      }
    });
  });

  describe('platformPresets', () => {
    it('has valid platform preset entries, including Product Hunt', () => {
      expect(platformPresets.length).toBeGreaterThan(0);
      const phPresets = platformPresets.filter(p => p.platform === 'Product Hunt');
      expect(phPresets).toHaveLength(2);
      
      const thumbnail = phPresets.find(p => p.name === 'Thumbnail');
      expect(thumbnail).toBeDefined();
      expect(thumbnail?.width).toBe(240);
      expect(thumbnail?.height).toBe(240);
      expect(thumbnail?.ratio).toBe('1:1');

      const gallery = phPresets.find(p => p.name === 'Gallery');
      expect(gallery).toBeDefined();
      expect(gallery?.width).toBe(1270);
      expect(gallery?.height).toBe(760);
      expect(gallery?.ratio).toBe('~1.67:1');

      for (const p of platformPresets) {
        expect(p.platform).toBeTruthy();
        expect(p.name).toBeTruthy();
        expect(p.width).toBeGreaterThan(0);
        expect(p.height).toBeGreaterThan(0);
        expect(p.ratio).toBeTruthy();
        expect(p.note).toBeTruthy();
      }
    });
  });
});
