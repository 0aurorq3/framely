export function zoomIn(zoomLevel: string): string {
  if (zoomLevel === 'Zoom to fit') return '110%';
  const currentVal = parseInt(zoomLevel, 10);
  if (isNaN(currentVal)) return '100%';
  const nextVal = Math.min(500, Math.floor(currentVal / 10) * 10 + 10);
  return `${nextVal}%`;
}

export function zoomOut(zoomLevel: string): string {
  if (zoomLevel === 'Zoom to fit') return '90%';
  const currentVal = parseInt(zoomLevel, 10);
  if (isNaN(currentVal)) return '100%';
  const nextVal = Math.max(10, Math.ceil(currentVal / 10) * 10 - 10);
  return `${nextVal}%`;
}

export function getZoomStyle(zoomLevel: string): React.CSSProperties {
  if (zoomLevel === 'Zoom to fit') return {};
  const percent = parseInt(zoomLevel, 10);
  return isNaN(percent) ? {} : { transform: `scale(${percent / 100})` };
}

export function getFixedSizeFromAspectRatio(
  aspectRatio: string,
  canvasWidth: number,
  canvasHeight: number,
  noImageMode: boolean
) {
  const width = aspectRatio === '1:1' ? 600 :
                aspectRatio === '16:9' ? 800 :
                aspectRatio === '4:3' ? 700 :
                aspectRatio === '3:2' ? 750 :
                aspectRatio === 'Custom' ? canvasWidth :
                (noImageMode ? 800 : 'auto');

  const height = aspectRatio === '1:1' ? 600 :
                 aspectRatio === '16:9' ? 450 :
                 aspectRatio === '4:3' ? 525 :
                 aspectRatio === '3:2' ? 500 :
                 aspectRatio === 'Custom' ? canvasHeight :
                 (noImageMode ? 450 : 'auto');
  
  return { width, height };
}

export function getPositionAlignment(position: string) {
  const alignItems = position.includes('Top') ? 'flex-start' : 
                     position.includes('Bottom') ? 'flex-end' : 'center';
  const justifyContent = position.includes('left') ? 'flex-start' : 
                         position.includes('right') ? 'flex-end' : 'center';
  return { alignItems, justifyContent };
}

export function transformCoordinates(ann: { x: number; y: number; w: number; h: number }, dimensions: { width: number; height: number }) {
  const x1 = ann.x * dimensions.width;
  const y1 = ann.y * dimensions.height;
  const w = ann.w * dimensions.width;
  const h = ann.h * dimensions.height;
  const rectW = Math.abs(w);
  const rectH = Math.abs(h);
  return { x1, y1, w, h, rectW, rectH };
}

export function getDeleteButtonPosition(ann: { x: number; y: number; w: number; h: number }) {
  const percentX = (ann.x + ann.w / 2) * 100;
  const percentY = (ann.y + ann.h) * 100;
  return { percentX, percentY };
}
