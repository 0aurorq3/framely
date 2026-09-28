import type { SnapGuide } from '../../utils/snapUtils';

interface SnapGuidesProps {
  guides: SnapGuide[];
  containerWidth: number;
  containerHeight: number;
}

const guideLineStyle: React.CSSProperties = {
  stroke: 'var(--accent)',
  strokeWidth: 1.5,
  strokeDasharray: '8 4',
  opacity: 0.9,
};

export default function SnapGuides({ guides, containerWidth, containerHeight }: SnapGuidesProps) {
  if (!guides || guides.length === 0) return null;

  return (
    <g style={{ pointerEvents: 'none' }}>
      {guides.map((guide) =>
        guide.orientation === 'vertical' ? (
          <line
            key={guide.id}
            x1={guide.position * containerWidth}
            y1={0}
            x2={guide.position * containerWidth}
            y2={containerHeight}
            style={guideLineStyle}
          />
        ) : (
          <line
            key={guide.id}
            x1={0}
            y1={guide.position * containerHeight}
            x2={containerWidth}
            y2={guide.position * containerHeight}
            style={guideLineStyle}
          />
        ),
      )}
    </g>
  );
}
