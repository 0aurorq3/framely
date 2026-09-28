export function getPlatformId(): string {
  if (typeof window !== 'undefined' && window.framelyAPI?.platform) {
    return window.framelyAPI.platform;
  }
  if (typeof navigator !== 'undefined' && /Mac|iPhone|iPad|iPod/.test(navigator.platform)) {
    return 'darwin';
  }
  return 'win32';
}

/** Primary modifier label: ⌘ on macOS, Ctrl on Windows and Linux. */
export function getModKeyLabel(): string {
  return getPlatformId() === 'darwin' ? '⌘' : 'Ctrl';
}

export function formatModShortcut(key: string): string {
  return `${getModKeyLabel()} + ${key}`;
}