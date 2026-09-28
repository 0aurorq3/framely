import { Minus, Plus } from 'lucide-react';
import Tooltip from './Tooltip';

interface ZoomControlsProps {
  zoomLevel: string;
  setZoomLevel: (v: string) => void;
  handleZoomIn: () => void;
  handleZoomOut: () => void;
}

export default function ZoomControls({
  zoomLevel,
  setZoomLevel,
  handleZoomIn,
  handleZoomOut
}: ZoomControlsProps) {
  return (
    <div className="zoom-cluster" style={{ gap: '4px' }}>
      <Tooltip position="top">
        <button
          className="zoom-btn"
          onClick={handleZoomOut}
          disabled={zoomLevel !== 'Zoom to fit' && parseInt(zoomLevel, 10) <= 10}
          title="Zoom out (10%)"
          aria-label="Zoom out"
        >
          <Minus className="w-3.5 h-3.5" />
        </button>
      </Tooltip>
      <Tooltip position="top">
        <button
          className={`zoom-btn ${zoomLevel === 'Zoom to fit' ? 'active' : ''}`}
          style={{ minWidth: '48px', fontWeight: 'bold' }}
          onClick={() => setZoomLevel('Zoom to fit')}
          title="Reset to Zoom to fit"
        >
          {zoomLevel === 'Zoom to fit' ? 'Fit' : zoomLevel}
        </button>
      </Tooltip>
      <Tooltip position="top">
        <button
          className="zoom-btn"
          onClick={handleZoomIn}
          disabled={zoomLevel !== 'Zoom to fit' && parseInt(zoomLevel, 10) >= 500}
          title="Zoom in (10%)"
          aria-label="Zoom in"
        >
          <Plus className="w-3.5 h-3.5" />
        </button>
      </Tooltip>
    </div>
  );
}
