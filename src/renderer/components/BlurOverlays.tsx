import type { Annotation } from '../canvasRenderer';
import { DEFAULT_BLUR_STRENGTH, getBlurRadius } from '../../shared/blur';

interface BlurOverlaysProps {
  imageSrc: string;
  annotations: Annotation[];
  displayWidth: number;
}

export default function BlurOverlays({ imageSrc, annotations, displayWidth }: BlurOverlaysProps) {
  const regions = annotations.filter((annotation) => annotation.type === 'blur' && annotation.w > 0.001 && annotation.h > 0.001);
  if (regions.length === 0) return null;

  return (
    <div aria-hidden="true" style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 2 }}>
      {regions.map((region) => (
        <div
          key={region.id}
          data-testid="blur-region"
          style={{
            position: 'absolute',
            left: `${region.x * 100}%`,
            top: `${region.y * 100}%`,
            width: `${region.w * 100}%`,
            height: `${region.h * 100}%`,
            overflow: 'hidden',
          }}
        >
          <img
            src={imageSrc}
            alt=""
            draggable={false}
            style={{
              position: 'absolute',
              left: `${-region.x / region.w * 100}%`,
              top: `${-region.y / region.h * 100}%`,
              width: `${100 / region.w}%`,
              height: `${100 / region.h}%`,
              maxWidth: 'none',
              maxHeight: 'none',
              filter: `blur(${getBlurRadius(region.blurStrength ?? DEFAULT_BLUR_STRENGTH, displayWidth)}px)`,
            }}
          />
        </div>
      ))}
    </div>
  );
}
