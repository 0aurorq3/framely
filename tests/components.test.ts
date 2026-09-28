import { describe, it, expect, vi } from 'vitest';
import {
  getArrowAngle,
  getArrowheadLength,
  calculateArrowheadPositions,
  getTextFontSize,
  getTextStrokeWidth,
  getEmojiFontSize,
  getFilledRectCornerRadius,
  getTextBorderRadius,
  generatePenPath,
  getDashedLinePattern,
} from '../src/renderer/utils/drawingUtils';
import {
  getFixedSizeFromAspectRatio,
  getPositionAlignment,
  transformCoordinates,
  getDeleteButtonPosition,
} from '../src/renderer/utils/layoutUtils';
import {
  toggleTheme,
  shouldResolveOnKey,
  shouldDeleteTextAnnotation,
  shouldUpdateTextAnnotation,
  toggleSection,
  calculateSelectionBoxHandles,
  calculateRotationHandlePosition,
  getTextEditorFontSize,
  TOOLBAR_TOOLS,
} from '../src/renderer/utils/uiUtils';
import { updateUserDefault, DEFAULT_SETTINGS } from '../src/renderer/utils/storageUtils';

describe('Components', () => {
  describe('arrow angle calculation', () => {
    it('calculates angles correctly', () => {
      const angle = getArrowAngle(100, 100);
      expect(Math.abs(angle - Math.PI / 4)).toBeLessThan(0.001);

      const angle2 = getArrowAngle(100, 0);
      expect(Math.abs(angle2 - 0)).toBeLessThan(0.001);

      const angle3 = getArrowAngle(0, 100);
      expect(Math.abs(angle3 - Math.PI / 2)).toBeLessThan(0.001);
    });
  });

  describe('arrowhead length calculation', () => {
    it('calculates length based on stroke width', () => {
      expect(getArrowheadLength(2)).toBe(12);
      expect(getArrowheadLength(8)).toBe(24);
      expect(getArrowheadLength(16)).toBe(48);
    });
  });

  describe('arrowhead position calculation', () => {
    it('calculates positions correctly', () => {
      const pos = calculateArrowheadPositions(100, 100, 24);

      expect(typeof pos.arrow1X).toBe('number');
      expect(isNaN(pos.arrow1X)).toBe(false);
      expect(typeof pos.arrow1Y).toBe('number');
      expect(isNaN(pos.arrow1Y)).toBe(false);
      expect(typeof pos.arrow2X).toBe('number');
      expect(isNaN(pos.arrow2X)).toBe(false);
      expect(typeof pos.arrow2Y).toBe('number');
      expect(isNaN(pos.arrow2Y)).toBe(false);
      expect(pos.arrow1X !== pos.arrow2X || pos.arrow1Y !== pos.arrow2Y).toBe(true);
    });
  });

  describe('text font size calculation', () => {
    it('calculates font size based on rect height', () => {
      expect(getTextFontSize(10)).toBe(12);
      expect(getTextFontSize(50)).toBe(35);
      expect(getTextFontSize(100)).toBe(70);
    });
  });

  describe('text stroke width calculation', () => {
    it('calculates stroke width based on font size', () => {
      expect(getTextStrokeWidth(12)).toBe(2);
      expect(Math.abs(getTextStrokeWidth(50) - 7.5)).toBeLessThan(0.001);
      expect(getTextStrokeWidth(100)).toBe(15);
    });
  });

  describe('emoji font size calculation', () => {
    it('uses smaller dimension', () => {
      expect(getEmojiFontSize(50, 30)).toBe(30);
      expect(getEmojiFontSize(30, 50)).toBe(30);
      expect(getEmojiFontSize(100, 100)).toBe(100);
    });
  });

  describe('filled-rect corner radius', () => {
    it('calculates corner radius', () => {
      expect(getFilledRectCornerRadius(100, 100)).toBe(8);
      expect(getFilledRectCornerRadius(50, 50)).toBe(5);
      expect(getFilledRectCornerRadius(30, 100)).toBe(3);
    });
  });

  describe('text border radius', () => {
    it('calculates border radius', () => {
      expect(Math.abs(getTextBorderRadius(50) - 7.5)).toBeLessThan(0.001);
      expect(getTextBorderRadius(100)).toBe(15);
    });
  });

  describe('aspect ratio to fixed size mapping', () => {
    it('maps aspect ratios to fixed sizes', () => {
      const size1x1 = getFixedSizeFromAspectRatio('1:1', 800, 600, false);
      expect(size1x1.width).toBe(600);
      expect(size1x1.height).toBe(600);

      const size16x9 = getFixedSizeFromAspectRatio('16:9', 800, 600, false);
      expect(size16x9.width).toBe(800);
      expect(size16x9.height).toBe(450);

      const size4x3 = getFixedSizeFromAspectRatio('4:3', 800, 600, false);
      expect(size4x3.width).toBe(700);
      expect(size4x3.height).toBe(525);

      const size3x2 = getFixedSizeFromAspectRatio('3:2', 800, 600, false);
      expect(size3x2.width).toBe(750);
      expect(size3x2.height).toBe(500);

      const sizeCustom = getFixedSizeFromAspectRatio('Custom', 1920, 1080, false);
      expect(sizeCustom.width).toBe(1920);
      expect(sizeCustom.height).toBe(1080);

      const sizeNoImage = getFixedSizeFromAspectRatio('Auto', 800, 600, true);
      expect(sizeNoImage.width).toBe(800);
      expect(sizeNoImage.height).toBe(450);

      const sizeAuto = getFixedSizeFromAspectRatio('Auto', 800, 600, false);
      expect(sizeAuto.width).toBe('auto');
      expect(sizeAuto.height).toBe('auto');
    });
  });

  describe('position alignment logic', () => {
    it('calculates alignment correctly', () => {
      const align1 = getPositionAlignment('Middle center');
      expect(align1.alignItems).toBe('center');
      expect(align1.justifyContent).toBe('center');

      const align2 = getPositionAlignment('Top center');
      expect(align2.alignItems).toBe('flex-start');
      expect(align2.justifyContent).toBe('center');

      const align3 = getPositionAlignment('Bottom center');
      expect(align3.alignItems).toBe('flex-end');
      expect(align3.justifyContent).toBe('center');

      const align4 = getPositionAlignment('Middle left');
      expect(align4.alignItems).toBe('center');
      expect(align4.justifyContent).toBe('flex-start');

      const align5 = getPositionAlignment('Middle right');
      expect(align5.alignItems).toBe('center');
      expect(align5.justifyContent).toBe('flex-end');
    });
  });

  describe('coordinate transformation', () => {
    it('transforms coordinates correctly', () => {
      const dimensions = { width: 800, height: 600 };
      const ann = { x: 0.25, y: 0.5, w: 0.5, h: 0.25 };

      const result = transformCoordinates(ann, dimensions);

      expect(result.x1).toBe(200);
      expect(result.y1).toBe(300);
      expect(result.w).toBe(400);
      expect(result.h).toBe(150);
      expect(result.rectW).toBe(400);
      expect(result.rectH).toBe(150);
    });
  });

  describe('text editor font size', () => {
    it('calculates font size with stroke width', () => {
      expect(getTextEditorFontSize(2)).toBe(16);
      expect(getTextEditorFontSize(8)).toBe(22);
      expect(getTextEditorFontSize(0)).toBe(14);
    });
  });

  describe('pen path data generation', () => {
    it('generates path data', () => {
      const points = [
        { x: 0, y: 0 },
        { x: 0.5, y: 0 },
        { x: 1, y: 1 },
      ];

      const pathData = generatePenPath(points, 100, 100);

      expect(pathData.startsWith('M')).toBe(true);
      expect(pathData.includes('L')).toBe(true);
      expect(pathData.includes('-50')).toBe(true);

      const emptyPath = generatePenPath([], 100, 100);
      expect(emptyPath).toBe('');
    });
  });

  describe('dashed line pattern', () => {
    it('calculates dashed pattern', () => {
      expect(getDashedLinePattern(4, true)).toBe('8 6');
      expect(getDashedLinePattern(4, false)).toBeUndefined();
      expect(getDashedLinePattern(8, true)).toBe('16 12');
    });
  });

  describe('settings localStorage update', () => {
    it('updates settings in localStorage', () => {
      const storage: Record<string, string> = {};
      const mockLocalStorage = {
        getItem: (key: string) => storage[key] || null,
        setItem: (key: string, value: string) => { storage[key] = value; },
      };

      // Mock localStorage
      vi.stubGlobal('localStorage', mockLocalStorage);

      updateUserDefault('padding', 50);
      const saved1 = JSON.parse(storage['framely-user-defaults']);
      expect(saved1.padding).toBe(50);

      updateUserDefault('rounded', 30);
      const saved2 = JSON.parse(storage['framely-user-defaults']);
      expect(saved2.padding).toBe(50);
      expect(saved2.rounded).toBe(30);

      updateUserDefault('padding', 60);
      const saved3 = JSON.parse(storage['framely-user-defaults']);
      expect(saved3.padding).toBe(60);
      expect(saved3.rounded).toBe(30);
    });
  });

  describe('settings reset logic', () => {
    it('has correct default values', () => {
      expect(DEFAULT_SETTINGS.padding).toBe(38);
      expect(DEFAULT_SETTINGS.rounded).toBe(20);
      expect(DEFAULT_SETTINGS.shadow).toBe(30);
      expect(DEFAULT_SETTINGS.watermarkEnabled).toBe(false);
      expect(DEFAULT_SETTINGS.watermarkText).toBe('Made with Framely');
      expect(DEFAULT_SETTINGS.exportFormat).toBe('png');
      expect(DEFAULT_SETTINGS.jpegQuality).toBe(90);
    });
  });

  describe('toolbar tools array structure', () => {
    it('has valid tool definitions', () => {
      expect(TOOLBAR_TOOLS.length).toBe(10);

      for (const tool of TOOLBAR_TOOLS) {
        expect(tool.id).toBeTruthy();
        expect(tool.title).toBeTruthy();
      }

      const ids = TOOLBAR_TOOLS.map(t => t.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });
  });

  describe('theme toggle logic', () => {
    it('toggles between themes', () => {
      expect(toggleTheme('dark')).toBe('light');
      expect(toggleTheme('light')).toBe('dark');
      expect(toggleTheme(toggleTheme('dark'))).toBe('dark');
    });
  });

  describe('prompt modal keyboard handling', () => {
    it('handles Enter and Escape keys', () => {
      expect(shouldResolveOnKey('Enter', 'enter')).toBe(true);
      expect(shouldResolveOnKey('Escape', 'enter')).toBe(false);
      expect(shouldResolveOnKey('Escape', 'escape')).toBe(true);
      expect(shouldResolveOnKey('Enter', 'escape')).toBe(false);
      expect(shouldResolveOnKey('a', 'enter')).toBe(false);
    });

    it('returns false for invalid action', () => {
      expect(shouldResolveOnKey('Enter', 'invalid' as any)).toBe(false);
    });
  });

  describe('annotations layer text editing', () => {
    it('handles empty and non-empty text', () => {
      expect(shouldDeleteTextAnnotation('')).toBe(true);
      expect(shouldDeleteTextAnnotation('   ')).toBe(true);
      expect(shouldDeleteTextAnnotation('Hello')).toBe(false);

      expect(shouldUpdateTextAnnotation('Hello')).toBe(true);
      expect(shouldUpdateTextAnnotation('')).toBe(false);
      expect(shouldUpdateTextAnnotation('   ')).toBe(false);
    });
  });

  describe('delete button positioning', () => {
    it('positions delete button correctly', () => {
      const ann = { x: 0.25, y: 0.25, w: 0.5, h: 0.5 };
      const pos = getDeleteButtonPosition(ann);

      expect(pos.percentX).toBe(50);
      expect(pos.percentY).toBe(75);

      const ann2 = { x: 0, y: 0, w: 1, h: 1 };
      const pos2 = getDeleteButtonPosition(ann2);

      expect(pos2.percentX).toBe(50);
      expect(pos2.percentY).toBe(100);
    });
  });

  describe('inspector section toggle', () => {
    it('toggles open state', () => {
      expect(toggleSection(true)).toBe(false);
      expect(toggleSection(false)).toBe(true);
      expect(toggleSection(toggleSection(true))).toBe(true);
    });
  });

  describe('selection box handle positions', () => {
    it('positions handles correctly', () => {
      const handles = calculateSelectionBoxHandles(100, 80);

      expect(handles.tl.x < handles.tr.x).toBe(true);
      expect(handles.tl.y < handles.bl.y).toBe(true);
      expect(handles.br.x > handles.bl.x).toBe(true);
      expect(handles.br.y > handles.tr.y).toBe(true);
      expect(Math.abs(handles.tc.x) < handles.tr.x).toBe(true);
      expect(Math.abs(handles.ml.y) < handles.bl.y).toBe(true);
    });
  });

  describe('rotation handle position', () => {
    it('positions rotation handle correctly', () => {
      const pos = calculateRotationHandlePosition(80);

      expect(pos.stemY2 < pos.stemY1).toBe(true);
      expect(pos.handleY < pos.stemY2).toBe(true);
      expect(pos.stemY1).toBe(-48);
      expect(pos.stemY2).toBe(-74);
      expect(pos.handleY).toBe(-81);
    });
  });
});
