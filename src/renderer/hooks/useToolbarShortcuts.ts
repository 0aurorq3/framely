import { useEffect } from 'react';
import { useAppContext } from '../AppContext';

export function useToolbarShortcuts() {
  const { setActiveTool, editingMode } = useAppContext();

  useEffect(() => {
    if (!editingMode) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable)
      ) {
        return;
      }

      // Ignore if modifier keys are active
      if (e.ctrlKey || e.metaKey || e.altKey) {
        return;
      }

      const key = e.key;

      // Handle numbers
      switch (key) {
        case '1':
          setActiveTool('pointer');
          return;
        case '2':
          setActiveTool('rect');
          return;
        case '3':
          setActiveTool('filled-rect');
          return;
        case '4':
          setActiveTool('circle');
          return;
        case '5':
          setActiveTool('filled-circle');
          return;
        case '6':
          setActiveTool('line');
          return;
        case '7':
          setActiveTool('arrow');
          return;
        case '8':
          setActiveTool('text');
          return;
        case '9':
          setActiveTool('pen');
          return;
        case '0':
          setActiveTool('emoji');
          return;
      }

      // Handle letters
      switch (key) {
        case 'v':
        case 'V':
          setActiveTool('pointer');
          break;
        case 'r':
          setActiveTool('rect');
          break;
        case 'R':
        case 'f':
        case 'F':
          setActiveTool('filled-rect');
          break;
        case 'c':
        case 'o':
          setActiveTool('circle');
          break;
        case 'C':
        case 'O':
          setActiveTool('filled-circle');
          break;
        case 'l':
        case 'L':
          setActiveTool('line');
          break;
        case 'a':
        case 'A':
          setActiveTool('arrow');
          break;
        case 'b':
        case 'B':
          setActiveTool('blur');
          break;
        case 't':
        case 'T':
          setActiveTool('text');
          break;
        case 'p':
        case 'P':
        case 'd':
        case 'D':
          setActiveTool('pen');
          break;
        case 'e':
        case 'E':
          setActiveTool('emoji');
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [editingMode, setActiveTool]);
}
