import { useState, useEffect } from 'react';
import { useAppContext } from '../AppContext';
import { Copy, Download, RefreshCw } from 'lucide-react';
import './ContextMenu.css';

interface ContextMenuProps {
  x: number;
  y: number;
  onClose: () => void;
  hasImage: boolean;
}

export default function ContextMenu({ x, y, onClose, hasImage }: ContextMenuProps) {
  const { copyBeautifiedImage, triggerExport, resetStyles } = useAppContext();
  const [coords, setCoords] = useState({ x, y });

  useEffect(() => {
    // Account for menu width (~180px) and height (~160px) to prevent screen overflow
    const menuWidth = 180;
    const menuHeight = 160;
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;

    let adjustedX = x;
    let adjustedY = y;

    if (x + menuWidth > screenWidth) {
      adjustedX = Math.max(8, screenWidth - menuWidth - 8);
    }
    if (y + menuHeight > screenHeight) {
      adjustedY = Math.max(8, screenHeight - menuHeight - 8);
    }

    setCoords({ x: adjustedX, y: adjustedY });
  }, [x, y]);

  return (
    <div
      className="custom-context-menu"
      style={{
        top: `${coords.y}px`,
        left: `${coords.x}px`,
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <button
        className="context-menu-item"
        disabled={!hasImage}
        onClick={async () => {
          onClose();
          try {
            await copyBeautifiedImage();
          } catch (err) {
            console.error('Copy failed:', err);
          }
        }}
      >
        <Copy className="w-4 h-4" />
        <span>Copy Image</span>
      </button>

      <button
        className="context-menu-item"
        disabled={!hasImage}
        onClick={() => {
          onClose();
          triggerExport();
        }}
      >
        <Download className="w-4 h-4" />
        <span>Export Image</span>
      </button>

      <div className="context-menu-divider" />

      <button
        className="context-menu-item"
        onClick={() => {
          onClose();
          resetStyles();
        }}
      >
        <RefreshCw className="w-4 h-4" />
        <span>Reset Styles</span>
      </button>
    </div>
  );
}
