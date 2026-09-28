import Tooltip from './Tooltip';

interface MeshPoint {
  id: string;
  color: string;
  x: number;
  y: number;
  radius: number;
}

interface MeshGradientHandlesProps {
  meshPoints: MeshPoint[];
  activePointIdx: number;
  activeTool: string;
  handlePointerDown: (e: React.PointerEvent, idx: number) => void;
  handlePointerMove: (e: React.PointerEvent) => void;
  handlePointerUp: (e: React.PointerEvent) => void;
}

export default function MeshGradientHandles({
  meshPoints,
  activePointIdx,
  activeTool,
  handlePointerDown,
  handlePointerMove,
  handlePointerUp,
}: MeshGradientHandlesProps) {
  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        pointerEvents: 'none',
        zIndex: 10,
      }}
    >
      {meshPoints.map((pt, idx) => (
        <Tooltip key={pt.id} position="top">
          <div
            onPointerDown={activeTool === 'pointer' ? (e) => handlePointerDown(e, idx) : undefined}
            onPointerMove={activeTool === 'pointer' ? handlePointerMove : undefined}
            onPointerUp={activeTool === 'pointer' ? handlePointerUp : undefined}
            style={{
              position: 'absolute',
              left: `${pt.x * 100}%`,
              top: `${pt.y * 100}%`,
              width: '24px',
              height: '24px',
              borderRadius: '50%',
              backgroundColor: pt.color,
              border: idx === activePointIdx ? '3px solid #ffffff' : '2px solid rgba(255,255,255,0.8)',
              boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
              transform: 'translate(-50%, -50%)',
              cursor: activeTool === 'pointer' ? 'move' : 'default',
              pointerEvents: activeTool === 'pointer' ? 'auto' : 'none',
              zIndex: idx === activePointIdx ? 12 : 11,
            }}
            title={`Point ${idx + 1}`}
          >
            <div
              style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                backgroundColor: '#ffffff',
                margin: '6px auto 0 auto',
              }}
            />
          </div>
        </Tooltip>
      ))}
    </div>
  );
}
