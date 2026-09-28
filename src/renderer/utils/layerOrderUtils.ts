/**
 * Immutable z-order helpers for annotation layers.
 *
 * The annotation array doubles as the z-order stack: index 0 is the bottom
 * (rendered first / painted under everything) and the last index is the top
 * (rendered last / painted over everything). Each helper returns a new array
 * and is a no-op when the target is already at the requested edge or when the
 * id cannot be found, so callers can invoke them unconditionally.
 *
 * The helpers are generic over any array of `{ id: string }` so they stay
 * decoupled from the full Annotation shape and are trivially unit-testable.
 */

interface WithId {
  id: string;
}

function indexOfId<T extends WithId>(items: T[], id: string): number {
  return items.findIndex((item) => item.id === id);
}

/**
 * Move the item with the given id to the end of the array (top of the stack).
 * No-op if the id is missing or already last.
 */
export function bringToFront<T extends WithId>(items: T[], id: string): T[] {
  const idx = indexOfId(items, id);
  if (idx < 0 || idx === items.length - 1) return items;
  const next = [...items];
  const [moved] = next.splice(idx, 1);
  next.push(moved);
  return next;
}

/**
 * Move the item with the given id one step toward the top (swap with its
 * next neighbor). No-op if the id is missing or already last.
 */
export function bringForward<T extends WithId>(items: T[], id: string): T[] {
  const idx = indexOfId(items, id);
  if (idx < 0 || idx === items.length - 1) return items;
  const next = [...items];
  const tmp = next[idx];
  next[idx] = next[idx + 1];
  next[idx + 1] = tmp;
  return next;
}

/**
 * Move the item with the given id one step toward the bottom (swap with its
 * previous neighbor). No-op if the id is missing or already first.
 */
export function sendBackward<T extends WithId>(items: T[], id: string): T[] {
  const idx = indexOfId(items, id);
  if (idx <= 0) return items;
  const next = [...items];
  const tmp = next[idx];
  next[idx] = next[idx - 1];
  next[idx - 1] = tmp;
  return next;
}

/**
 * Move the item with the given id to the start of the array (bottom of the
 * stack). No-op if the id is missing or already first.
 */
export function sendToBack<T extends WithId>(items: T[], id: string): T[] {
  const idx = indexOfId(items, id);
  if (idx <= 0) return items;
  const next = [...items];
  const [moved] = next.splice(idx, 1);
  next.unshift(moved);
  return next;
}
