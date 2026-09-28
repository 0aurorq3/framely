import { useState } from 'react';
import { RenderConfig } from '../canvasRenderer';

export function useHistory(
  applyConfig: (config: RenderConfig) => void
) {
  const [history, setHistory] = useState<any[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);

  const pushHistory = (config: any) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(JSON.parse(JSON.stringify(config)));
    if (newHistory.length > 50) newHistory.shift();
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      const newIdx = historyIndex - 1;
      setHistoryIndex(newIdx);
      applyConfig(history[newIdx]);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const newIdx = historyIndex + 1;
      setHistoryIndex(newIdx);
      applyConfig(history[newIdx]);
    }
  };

  return {
    history,
    setHistory,
    historyIndex,
    setHistoryIndex,
    pushHistory,
    handleUndo,
    handleRedo
  };
}
