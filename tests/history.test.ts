import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useHistory } from '../src/renderer/hooks/useHistory';

describe('useHistory (real hook)', () => {
  it('initializes with empty history and index -1', () => {
    const applyConfig = vi.fn();
    const { result } = renderHook(() => useHistory(applyConfig));

    expect(result.current.history).toEqual([]);
    expect(result.current.historyIndex).toBe(-1);
  });

  it('pushHistory increases history length and points to last entry', () => {
    const applyConfig = vi.fn();
    const { result } = renderHook(() => useHistory(applyConfig));

    act(() => {
      result.current.pushHistory({ scale: 100 });
    });
    expect(result.current.history).toHaveLength(1);
    expect(result.current.historyIndex).toBe(0);
    expect(result.current.history[0]).toEqual({ scale: 100 });

    act(() => {
      result.current.pushHistory({ scale: 80 });
    });
    expect(result.current.history).toHaveLength(2);
    expect(result.current.historyIndex).toBe(1);
  });

  it('truncates future entries when pushHistory is called after undo', () => {
    const applyConfig = vi.fn();
    const { result } = renderHook(() => useHistory(applyConfig));

    act(() => { result.current.pushHistory({ scale: 100 }); });
    act(() => { result.current.pushHistory({ scale: 80 }); });
    act(() => { result.current.pushHistory({ scale: 60 }); });

    // Undo back to first
    act(() => { result.current.handleUndo(); });
    expect(result.current.historyIndex).toBe(1);
    act(() => { result.current.handleUndo(); });
    expect(result.current.historyIndex).toBe(0);

    // Push a new entry – should truncate the old future
    act(() => { result.current.pushHistory({ scale: 50 }); });
    expect(result.current.history).toHaveLength(2);
    expect(result.current.historyIndex).toBe(1);
    expect(result.current.history[0]).toEqual({ scale: 100 });
    expect(result.current.history[1]).toEqual({ scale: 50 });
  });

  it('handleUndo is a no-op when at index 0', () => {
    const applyConfig = vi.fn();
    const { result } = renderHook(() => useHistory(applyConfig));

    act(() => { result.current.pushHistory({ scale: 100 }); });

    // Already at index 0, undo should be a no-op
    act(() => { result.current.handleUndo(); });
    expect(result.current.historyIndex).toBe(0);

    // Second undo at index 0 is a no-op
    act(() => { result.current.handleUndo(); });
    expect(result.current.historyIndex).toBe(0);
  });

  it('handleRedo is a no-op at latest', () => {
    const applyConfig = vi.fn();
    const { result } = renderHook(() => useHistory(applyConfig));

    act(() => { result.current.pushHistory({ scale: 100 }); });
    const callsBefore = applyConfig.mock.calls.length;

    act(() => { result.current.handleRedo(); });
    expect(result.current.historyIndex).toBe(0);
    // No additional applyConfig call beyond pushHistory
    expect(applyConfig.mock.calls.length).toBe(callsBefore);
  });

  it('full cycle: push x3 → undo x2 → push → redo has no effect', () => {
    const applyConfig = vi.fn();
    const { result } = renderHook(() => useHistory(applyConfig));

    act(() => { result.current.pushHistory({ scale: 100 }); });
    act(() => { result.current.pushHistory({ scale: 80 }); });
    act(() => { result.current.pushHistory({ scale: 60 }); });

    // Undo twice
    act(() => { result.current.handleUndo(); });
    expect(result.current.historyIndex).toBe(1);
    act(() => { result.current.handleUndo(); });
    expect(result.current.historyIndex).toBe(0);

    // Push new entry
    act(() => { result.current.pushHistory({ scale: 50 }); });
    expect(result.current.historyIndex).toBe(1);

    // Redo should be no-op (future truncated)
    const callsBeforeRedo = applyConfig.mock.calls.length;
    act(() => { result.current.handleRedo(); });
    expect(result.current.historyIndex).toBe(1);
    expect(applyConfig.mock.calls.length).toBeLessThanOrEqual(callsBeforeRedo + 1);
  });

  it('caps history at 50 entries, oldest discarded', () => {
    const applyConfig = vi.fn();
    const { result } = renderHook(() => useHistory(applyConfig));

    for (let i = 0; i < 55; i++) {
      act(() => { result.current.pushHistory({ scale: i }); });
    }

    expect(result.current.history.length).toBe(50);
    expect(result.current.history[0]).toEqual({ scale: 5 });
    expect(result.current.history[49]).toEqual({ scale: 54 });
    expect(result.current.historyIndex).toBe(49);
  });

  it('calls applyConfig with correct config on undo', () => {
    const applyConfig = vi.fn();
    const { result } = renderHook(() => useHistory(applyConfig));

    act(() => { result.current.pushHistory({ scale: 100 }); });
    act(() => { result.current.pushHistory({ scale: 80 }); });
    applyConfig.mockClear();

    act(() => { result.current.handleUndo(); });
    expect(applyConfig).toHaveBeenCalledWith({ scale: 100 });
  });

  it('calls applyConfig with correct config on redo', () => {
    const applyConfig = vi.fn();
    const { result } = renderHook(() => useHistory(applyConfig));

    act(() => { result.current.pushHistory({ scale: 100 }); });
    act(() => { result.current.pushHistory({ scale: 80 }); });
    act(() => { result.current.handleUndo(); });

    applyConfig.mockClear();
    act(() => { result.current.handleRedo(); });
    expect(applyConfig).toHaveBeenCalledWith({ scale: 80 });
  });

  it('deep-clones pushed configs so mutations do not affect history', () => {
    const applyConfig = vi.fn();
    const { result } = renderHook(() => useHistory(applyConfig));

    const config = { scale: 100, nested: { value: 1 } };
    act(() => { result.current.pushHistory(config); });

    // Mutate original
    config.scale = 200;
    config.nested.value = 999;

    expect(result.current.history[0].scale).toBe(100);
    expect(result.current.history[0].nested.value).toBe(1);
  });
});
