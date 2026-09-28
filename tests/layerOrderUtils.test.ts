import { describe, it, expect } from 'vitest';
import {
  bringToFront,
  bringForward,
  sendBackward,
  sendToBack,
} from '../src/renderer/utils/layerOrderUtils';

interface Item {
  id: string;
}

const items = (ids: string[]): Item[] => ids.map((id) => ({ id }));

// ---------------------------------------------------------------------------
// bringToFront
// ---------------------------------------------------------------------------
describe('bringToFront', () => {
  it('moves a middle item to the end', () => {
    const result = bringToFront(items(['a', 'b', 'c', 'd']), 'b');
    expect(result.map((i) => i.id)).toEqual(['a', 'c', 'd', 'b']);
  });

  it('moves the first item to the end', () => {
    const result = bringToFront(items(['a', 'b', 'c']), 'a');
    expect(result.map((i) => i.id)).toEqual(['b', 'c', 'a']);
  });

  it('is a no-op when the item is already last', () => {
    const input = items(['a', 'b', 'c']);
    const result = bringToFront(input, 'c');
    expect(result).toBe(input);
    expect(result.map((i) => i.id)).toEqual(['a', 'b', 'c']);
  });

  it('is a no-op when the id is not found', () => {
    const input = items(['a', 'b']);
    const result = bringToFront(input, 'zzz');
    expect(result).toBe(input);
  });
});

// ---------------------------------------------------------------------------
// bringForward
// ---------------------------------------------------------------------------
describe('bringForward', () => {
  it('swaps a middle item with its next neighbor', () => {
    const result = bringForward(items(['a', 'b', 'c', 'd']), 'b');
    expect(result.map((i) => i.id)).toEqual(['a', 'c', 'b', 'd']);
  });

  it('swaps the first item with the second', () => {
    const result = bringForward(items(['a', 'b', 'c']), 'a');
    expect(result.map((i) => i.id)).toEqual(['b', 'a', 'c']);
  });

  it('is a no-op when the item is already last', () => {
    const input = items(['a', 'b', 'c']);
    const result = bringForward(input, 'c');
    expect(result).toBe(input);
  });

  it('is a no-op when the id is not found', () => {
    const input = items(['a', 'b']);
    const result = bringForward(input, 'zzz');
    expect(result).toBe(input);
  });
});

// ---------------------------------------------------------------------------
// sendBackward
// ---------------------------------------------------------------------------
describe('sendBackward', () => {
  it('swaps a middle item with its previous neighbor', () => {
    const result = sendBackward(items(['a', 'b', 'c', 'd']), 'c');
    expect(result.map((i) => i.id)).toEqual(['a', 'c', 'b', 'd']);
  });

  it('swaps the last item with the second-to-last', () => {
    const result = sendBackward(items(['a', 'b', 'c']), 'c');
    expect(result.map((i) => i.id)).toEqual(['a', 'c', 'b']);
  });

  it('is a no-op when the item is already first', () => {
    const input = items(['a', 'b', 'c']);
    const result = sendBackward(input, 'a');
    expect(result).toBe(input);
  });

  it('is a no-op when the id is not found', () => {
    const input = items(['a', 'b']);
    const result = sendBackward(input, 'zzz');
    expect(result).toBe(input);
  });
});

// ---------------------------------------------------------------------------
// sendToBack
// ---------------------------------------------------------------------------
describe('sendToBack', () => {
  it('moves a middle item to the start', () => {
    const result = sendToBack(items(['a', 'b', 'c', 'd']), 'c');
    expect(result.map((i) => i.id)).toEqual(['c', 'a', 'b', 'd']);
  });

  it('moves the last item to the start', () => {
    const result = sendToBack(items(['a', 'b', 'c']), 'c');
    expect(result.map((i) => i.id)).toEqual(['c', 'a', 'b']);
  });

  it('is a no-op when the item is already first', () => {
    const input = items(['a', 'b', 'c']);
    const result = sendToBack(input, 'a');
    expect(result).toBe(input);
    expect(result.map((i) => i.id)).toEqual(['a', 'b', 'c']);
  });

  it('is a no-op when the id is not found', () => {
    const input = items(['a', 'b']);
    const result = sendToBack(input, 'zzz');
    expect(result).toBe(input);
  });
});

// ---------------------------------------------------------------------------
// Shared edge cases
// ---------------------------------------------------------------------------
describe('edge cases', () => {
  it('handles a single-element array for all helpers', () => {
    const input = items(['only']);
    expect(bringToFront(input, 'only')).toBe(input);
    expect(bringForward(input, 'only')).toBe(input);
    expect(sendBackward(input, 'only')).toBe(input);
    expect(sendToBack(input, 'only')).toBe(input);
  });

  it('handles an empty array for all helpers', () => {
    const input: Item[] = [];
    expect(bringToFront(input, 'x')).toBe(input);
    expect(bringForward(input, 'x')).toBe(input);
    expect(sendBackward(input, 'x')).toBe(input);
    expect(sendToBack(input, 'x')).toBe(input);
  });

  it('does not mutate the original array', () => {
    const input = items(['a', 'b', 'c']);
    const snapshot = input.map((i) => i.id);
    bringToFront(input, 'a');
    bringForward(input, 'a');
    sendBackward(input, 'c');
    sendToBack(input, 'c');
    expect(input.map((i) => i.id)).toEqual(snapshot);
  });

  it('preserves the relative order of untouched items', () => {
    const input = items(['a', 'b', 'c', 'd', 'e']);
    const result = bringToFront(input, 'b');
    // b moved to end; a, c, d, e keep their relative order
    expect(result.map((i) => i.id)).toEqual(['a', 'c', 'd', 'e', 'b']);
    const result2 = sendToBack(input, 'd');
    expect(result2.map((i) => i.id)).toEqual(['d', 'a', 'b', 'c', 'e']);
  });

  it('returns a new array reference when a move occurs', () => {
    const input = items(['a', 'b', 'c']);
    expect(bringToFront(input, 'a')).not.toBe(input);
    expect(bringForward(input, 'a')).not.toBe(input);
    expect(sendBackward(input, 'c')).not.toBe(input);
    expect(sendToBack(input, 'c')).not.toBe(input);
  });
});
