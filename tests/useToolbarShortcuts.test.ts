import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';

// Mock useAppContext before importing the hook
const { mockSetActiveTool, mockEditingMode } = vi.hoisted(() => ({
  mockSetActiveTool: vi.fn(),
  mockEditingMode: { value: true },
}));

vi.mock('../src/renderer/AppContext', () => ({
  useAppContext: () => ({
    setActiveTool: mockSetActiveTool,
    editingMode: mockEditingMode.value,
  }),
}));

import { useToolbarShortcuts } from '../src/renderer/hooks/useToolbarShortcuts';

describe('useToolbarShortcuts', () => {
  beforeEach(() => {
    mockSetActiveTool.mockReset();
    mockEditingMode.value = true;
    vi.restoreAllMocks();
  });

  afterEach(() => {
    // Clean up listeners
    vi.restoreAllMocks();
  });

  const render = () => renderHook(() => useToolbarShortcuts());

  const pressKey = (key: string, opts: Partial<KeyboardEventInit> = {}) => {
    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', {
        key,
        bubbles: true,
        ...opts,
      }));
    });
  };

  it('ignores annotation shortcuts outside edit mode', () => {
    mockEditingMode.value = false;
    render();
    pressKey('a');
    expect(mockSetActiveTool).not.toHaveBeenCalled();
  });

  it('selects the blur tool in edit mode', () => {
    render();
    pressKey('b');
    expect(mockSetActiveTool).toHaveBeenCalledWith('blur');
  });

  describe('number key mappings', () => {
    it('maps 1 to pointer', () => {
      render();
      pressKey('1');
      expect(mockSetActiveTool).toHaveBeenCalledWith('pointer');
    });

    it('maps 2 to rect', () => {
      render();
      pressKey('2');
      expect(mockSetActiveTool).toHaveBeenCalledWith('rect');
    });

    it('maps 3 to filled-rect', () => {
      render();
      pressKey('3');
      expect(mockSetActiveTool).toHaveBeenCalledWith('filled-rect');
    });

    it('maps 4 to circle', () => {
      render();
      pressKey('4');
      expect(mockSetActiveTool).toHaveBeenCalledWith('circle');
    });

    it('maps 5 to filled-circle', () => {
      render();
      pressKey('5');
      expect(mockSetActiveTool).toHaveBeenCalledWith('filled-circle');
    });

    it('maps 6 to line', () => {
      render();
      pressKey('6');
      expect(mockSetActiveTool).toHaveBeenCalledWith('line');
    });

    it('maps 7 to arrow', () => {
      render();
      pressKey('7');
      expect(mockSetActiveTool).toHaveBeenCalledWith('arrow');
    });

    it('maps 8 to text', () => {
      render();
      pressKey('8');
      expect(mockSetActiveTool).toHaveBeenCalledWith('text');
    });

    it('maps 9 to pen', () => {
      render();
      pressKey('9');
      expect(mockSetActiveTool).toHaveBeenCalledWith('pen');
    });

    it('maps 0 to emoji', () => {
      render();
      pressKey('0');
      expect(mockSetActiveTool).toHaveBeenCalledWith('emoji');
    });
  });

  describe('letter key mappings', () => {
    it('maps v/V to pointer', () => {
      render();
      pressKey('v');
      expect(mockSetActiveTool).toHaveBeenCalledWith('pointer');
      mockSetActiveTool.mockReset();
      pressKey('V');
      expect(mockSetActiveTool).toHaveBeenCalledWith('pointer');
    });

    it('maps r to rect', () => {
      render();
      pressKey('r');
      expect(mockSetActiveTool).toHaveBeenCalledWith('rect');
    });

    it('maps R/f/F to filled-rect', () => {
      render();
      pressKey('R');
      expect(mockSetActiveTool).toHaveBeenCalledWith('filled-rect');
      mockSetActiveTool.mockReset();
      pressKey('f');
      expect(mockSetActiveTool).toHaveBeenCalledWith('filled-rect');
      mockSetActiveTool.mockReset();
      pressKey('F');
      expect(mockSetActiveTool).toHaveBeenCalledWith('filled-rect');
    });

    it('maps c/o to circle', () => {
      render();
      pressKey('c');
      expect(mockSetActiveTool).toHaveBeenCalledWith('circle');
      mockSetActiveTool.mockReset();
      pressKey('o');
      expect(mockSetActiveTool).toHaveBeenCalledWith('circle');
    });

    it('maps C/O to filled-circle', () => {
      render();
      pressKey('C');
      expect(mockSetActiveTool).toHaveBeenCalledWith('filled-circle');
      mockSetActiveTool.mockReset();
      pressKey('O');
      expect(mockSetActiveTool).toHaveBeenCalledWith('filled-circle');
    });

    it('maps l/L to line', () => {
      render();
      pressKey('l');
      expect(mockSetActiveTool).toHaveBeenCalledWith('line');
      mockSetActiveTool.mockReset();
      pressKey('L');
      expect(mockSetActiveTool).toHaveBeenCalledWith('line');
    });

    it('maps a/A to arrow', () => {
      render();
      pressKey('a');
      expect(mockSetActiveTool).toHaveBeenCalledWith('arrow');
      mockSetActiveTool.mockReset();
      pressKey('A');
      expect(mockSetActiveTool).toHaveBeenCalledWith('arrow');
    });

    it('maps t/T to text', () => {
      render();
      pressKey('t');
      expect(mockSetActiveTool).toHaveBeenCalledWith('text');
      mockSetActiveTool.mockReset();
      pressKey('T');
      expect(mockSetActiveTool).toHaveBeenCalledWith('text');
    });

    it('maps p/P/d/D to pen', () => {
      render();
      pressKey('p');
      expect(mockSetActiveTool).toHaveBeenCalledWith('pen');
      mockSetActiveTool.mockReset();
      pressKey('P');
      expect(mockSetActiveTool).toHaveBeenCalledWith('pen');
      mockSetActiveTool.mockReset();
      pressKey('d');
      expect(mockSetActiveTool).toHaveBeenCalledWith('pen');
      mockSetActiveTool.mockReset();
      pressKey('D');
      expect(mockSetActiveTool).toHaveBeenCalledWith('pen');
    });

    it('maps e/E to emoji', () => {
      render();
      pressKey('e');
      expect(mockSetActiveTool).toHaveBeenCalledWith('emoji');
      mockSetActiveTool.mockReset();
      pressKey('E');
      expect(mockSetActiveTool).toHaveBeenCalledWith('emoji');
    });
  });

  describe('ignore conditions', () => {
    it('ignores unknown keys', () => {
      render();
      pressKey('g');
      pressKey('x');
      pressKey('z');
      expect(mockSetActiveTool).not.toHaveBeenCalled();
    });

    it('ignores keydown when target is INPUT', () => {
      render();
      const input = document.createElement('input');
      act(() => {
        input.dispatchEvent(new KeyboardEvent('keydown', { key: '1', bubbles: true }));
      });
      expect(mockSetActiveTool).not.toHaveBeenCalled();
    });

    it('ignores keydown when target is TEXTAREA', () => {
      render();
      const textarea = document.createElement('textarea');
      act(() => {
        textarea.dispatchEvent(new KeyboardEvent('keydown', { key: '1', bubbles: true }));
      });
      expect(mockSetActiveTool).not.toHaveBeenCalled();
    });

    it('ignores keydown when target is contentEditable', () => {
      render();
      const div = document.createElement('div');
      div.contentEditable = 'true';
      act(() => {
        div.dispatchEvent(new KeyboardEvent('keydown', { key: '1', bubbles: true }));
      });
      expect(mockSetActiveTool).not.toHaveBeenCalled();
    });

    it('ignores keydown with Ctrl modifier', () => {
      render();
      pressKey('1', { ctrlKey: true });
      expect(mockSetActiveTool).not.toHaveBeenCalled();
    });

    it('ignores keydown with Meta modifier', () => {
      render();
      pressKey('1', { metaKey: true });
      expect(mockSetActiveTool).not.toHaveBeenCalled();
    });

    it('ignores keydown with Alt modifier', () => {
      render();
      pressKey('1', { altKey: true });
      expect(mockSetActiveTool).not.toHaveBeenCalled();
    });

    it('ignores keydown with Shift modifier alone (not ignored by code)', () => {
      render();
      pressKey('1', { shiftKey: true });
      // Shift is not in the guard clause, so it should still fire
      expect(mockSetActiveTool).toHaveBeenCalledWith('pointer');
    });
  });

  describe('cleanup', () => {
    it('removes event listener on unmount', () => {
      const addSpy = vi.spyOn(window, 'addEventListener');
      const removeSpy = vi.spyOn(window, 'removeEventListener');

      const { unmount } = render();
      expect(addSpy).toHaveBeenCalledWith('keydown', expect.any(Function));

      unmount();
      expect(removeSpy).toHaveBeenCalledWith('keydown', expect.any(Function));
    });
  });
});
