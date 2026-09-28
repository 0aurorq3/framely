import { useEffect } from 'react';
import { detectLanguage } from '../utils/codeTokenizer';

/**
 * System clipboard paste: images and auto-detected code.
 * Independent of the in-app annotation clipboard (Cut/Copy/Paste objects).
 * When that clipboard has content, mod+V is handled in useAnnotationEvents
 * (preventDefault) so this paste path does not run for that keystroke.
 */
export function useClipboardPaste(
  codeStudioActive: boolean,
  toggleCodeStudio: (active: boolean, codeText?: string, codeLang?: string) => void,
  handlePasteImage: (dataUrl: string) => void,
  showToast: (message: string, duration?: number) => void
) {
  useEffect(() => {
    const handlePaste = async (e: ClipboardEvent) => {
      const target = e.target as HTMLElement;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable)
      ) {
        return;
      }

      let pastedImage = false;

      // 1. Check if there's an image in the clipboard first
      if (window.framelyAPI) {
        const dataUrl = await window.framelyAPI.readImageFromClipboard();
        if (dataUrl) {
          handlePasteImage(dataUrl);
          pastedImage = true;
        }
      }

      if (!pastedImage) {
        const items = e.clipboardData?.items;
        if (items) {
          for (let i = 0; i < items.length; i++) {
            if (items[i].type.indexOf('image') !== -1) {
              const blob = items[i].getAsFile();
              if (blob) {
                const reader = new FileReader();
                reader.onload = (event) => {
                  if (event.target?.result) {
                    handlePasteImage(event.target.result as string);
                  }
                };
                reader.readAsDataURL(blob);
                pastedImage = true;
                break;
              }
            }
          }
        }
      }

      // 2. If no image was found, check if plain text is Java/Python code
      if (!pastedImage) {
        const text = e.clipboardData?.getData('text/plain');
        if (text) {
          const detectedLang = detectLanguage(text);
          if (detectedLang === 'java' || detectedLang === 'python') {
            toggleCodeStudio(true, text, detectedLang);
            showToast(`Switched to Code Studio (${detectedLang}).`);
          }
        }
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [
    codeStudioActive,
    toggleCodeStudio,
    handlePasteImage,
    showToast,
  ]);
}
