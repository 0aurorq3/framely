import { useState, useEffect, useRef, useCallback } from 'react';
import { useAppContext } from '../AppContext';
import AnnotationsLayer from '../AnnotationsLayer';
import { zoomIn, zoomOut } from '../utils/layoutUtils';
import { platformPresets } from '../presetsData';
import ContextMenu from './ContextMenu';
import BlurOverlays from './BlurOverlays';
import CodePreview from '../views/codeStudio/CodePreview';

// Modular Subcomponents
import ChromeMockup from './ChromeMockup';
import ZoomControls from './ZoomControls';
import CanvasWatermark from './CanvasWatermark';
import EmptyState from './EmptyState';
import MeshGradientHandles from './MeshGradientHandles';

// Background Utility functions
import {
  getDiagonalBackground,
  getSpotlightBackground,
  getAuroraBackground,
  getBackgroundStyle
} from '../utils/previewBgUtils';
import { getCanvasDimensions } from '../canvasRenderer';

export default function CanvasPreview() {
  const [imgDims, setImgDims] = useState<{ width: number; height: number } | null>(null);
  const {
    padding,
    rounded,
    shadow,
    shadowColor,
    shadowEnabled,
    inset,
    insetColor,
    border,
    borderColor,
    scale,
    backgroundType,
    backgroundValue,
    aspectRatio,
    chromeStyle,
    chromeTheme,
    blurDensity,
    noImageMode,
    meshPoints,
    meshDataUrl,
    shaderDataUrl,
    activePointIdx,
    watermarkEnabled,
    watermarkText,
    watermarkSize,
    watermarkPosition,
    watermarkOpacity,
    watermarkFont,
    watermarkBold,
    watermarkItalic,
    position,
    activeTool,
    setActiveTool,
    imageSrc,
    zoomLevel, setZoomLevel,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
    selectedPreset,
    showSafeZone,
    annotations,
    setAnnotations,
    annotationColor,
    setAnnotationColor,
    annotationStrokeWidth,
    annotationDisplayWidth,
    editingMode,
    setAnnotationDisplayWidth,
    getCurrentConfig,
    pushHistory,
    customPrompt,
    documentName,
    bgGrain,
    lightRaysStyle,
    lightRaysOpacity,
    lightRaysAngle,
    lightRaysCount,
    lightRaysSourceX,
    lightRaysSourceY,
    codeStudioActive,
    codeStudioCode, setCodeStudioCode,
    codeStudioLanguage, setCodeStudioLanguage,
    codeStudioTheme,
    codeStudioFontSize,
    codeStudioLineNumbers,
    codeStudioBreakpoints, setCodeStudioBreakpoints,
    codeStudioShowBreakpoints,
  } = useAppContext();

  // Report the on-screen annotation layer width up to AppContext so the export
  // pipeline can scale strokeWidth/fontSize to match the live canvas preview.
  const handleAnnotationDimensionsChange = useCallback(
    (dims: { width: number; height: number }) => {
      setAnnotationDisplayWidth(dims.width || 0);
    },
    [setAnnotationDisplayWidth],
  );

  const containerRef = useRef<HTMLDivElement>(null);
  const [containerSize, setContainerSize] = useState({ width: 1024, height: 768 });

  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setContainerSize({
          width: entry.contentRect.width || 1024,
          height: entry.contentRect.height || 768,
        });
      }
    });
    observer.observe(containerRef.current);

    const rect = containerRef.current.getBoundingClientRect();
    if (rect.width && rect.height) {
      setContainerSize({ width: rect.width, height: rect.height });
    }

    return () => observer.disconnect();
  }, []);

  let imgW = 800;
  let imgH = 600;

  if (imageSrc && !noImageMode) {
    imgW = imgDims?.width || 800;
    imgH = imgDims?.height || 600;
  } else if (noImageMode && codeStudioActive) {
    const lines = codeStudioCode.split('\n');
    const longestLine = lines.reduce((max, line) => line.length > max ? line.length : max, 0);
    const charWidth = codeStudioFontSize * 0.6;
    const lineHeight = codeStudioFontSize * 1.6;
    const gutterChars = codeStudioLineNumbers ? (lines.length >= 100 ? 7 : lines.length >= 10 ? 6 : 5) : 0;

    imgW = Math.max(450, Math.round((longestLine + gutterChars) * charWidth + 64));
    imgH = Math.round(lines.length * lineHeight + 40);
  }

  const config = getCurrentConfig();

  const dims = getCanvasDimensions(imgW, imgH, config);

  const getScaleFactor = () => {
    if (zoomLevel !== 'Zoom to fit') {
      return parseInt(zoomLevel, 10) / 100;
    }
    const maxW = Math.max(100, containerSize.width - 80);
    const maxH = Math.max(100, containerSize.height - 80);
    return Math.min(maxW / dims.width, maxH / dims.height, 1.0);
  };

  const scaleFactor = getScaleFactor();

  const scaleVal = scale / 100;
  const chromeHeight = chromeStyle !== 'none' ? 32 : 0;
  const contentW = imgW * scaleVal;
  const contentH = (imgH + chromeHeight) * scaleVal;

  const handleZoomIn = () => setZoomLevel(zoomIn(zoomLevel));
  const handleZoomOut = () => setZoomLevel(zoomOut(zoomLevel));

  const handleToggleBreakpoint = (line: number) => {
    const next = codeStudioBreakpoints.includes(line)
      ? codeStudioBreakpoints.filter(n => n !== line)
      : [...codeStudioBreakpoints, line].sort((a, b) => a - b);
    setCodeStudioBreakpoints(next);
    pushHistory({ ...getCurrentConfig(), codeStudioBreakpoints: next });
  };

  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const closeMenu = () => setContextMenu(null);
    window.addEventListener('click', closeMenu);
    window.addEventListener('contextmenu', closeMenu);
    return () => {
      window.removeEventListener('click', closeMenu);
      window.removeEventListener('contextmenu', closeMenu);
    };
  }, []);

  useEffect(() => {
    if (!imageSrc) {
      setImgDims(null);
    }
  }, [imageSrc]);

  // Mirror the canvas renderer's contentX/contentY calculation exactly
  const getCanvasContentPosition = (
    pos: string,
    paddingVal: number,
    canvasW: number,
    canvasH: number,
    cW: number,
    cH: number
  ) => {
    let cx = (canvasW - cW) / 2;
    let cy = (canvasH - cH) / 2;

    if (pos === 'Top center') {
      cx = (canvasW - cW) / 2;
      cy = paddingVal;
    } else if (pos === 'Bottom center') {
      cx = (canvasW - cW) / 2;
      cy = canvasH - cH - paddingVal;
    } else if (pos === 'Middle left') {
      cx = paddingVal;
      cy = (canvasH - cH) / 2;
    } else if (pos === 'Middle right') {
      cx = canvasW - cW - paddingVal;
      cy = (canvasH - cH) / 2;
    }
    // Middle center / Auto: cx = (canvasW - cW) / 2, cy = (canvasH - cH) / 2

    return {
      position: 'absolute' as const,
      left: `${cx}px`,
      top: `${cy}px`,
      bottom: undefined,
      right: undefined,
      transform: undefined,
    };
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({ x: e.clientX, y: e.clientY });
  };

  return (
    <div className="workspace-canvas-container" ref={containerRef}>
      <div className="canvas-workspace-stack">
        {documentName && (
          <div className="canvas-document-name" title={documentName}>
            {documentName}
          </div>
        )}
      {(imageSrc || noImageMode) ? (
        <div
          className="preview-card-wrapper"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'visible',
          }}
        >

          {/* Output Preview Container Card */}
          <div
            className="preview-background-card"
            onContextMenu={handleContextMenu}
            style={{
              position: 'relative',
              ...getBackgroundStyle(backgroundType, backgroundValue, imageSrc, meshDataUrl, shaderDataUrl),
              borderRadius: '12px',
              width: `${dims.width}px`,
              height: `${dims.height}px`,
              transform: `scale(${scaleFactor})`,
              transformOrigin: 'center center',
              flexShrink: 0,
            }}
          >
            {/* Safe Zone Overlay */}
            {showSafeZone && (() => {
              const activePreset = platformPresets.find(p => `${p.platform} - ${p.name}` === selectedPreset);
              if (!activePreset || !activePreset.safeZone) return null;
              return (
                <div 
                  className="safe-zone-overlay"
                  style={{
                    width: `${(activePreset.safeZone.width / activePreset.width) * 100}%`,
                    height: `${(activePreset.safeZone.height / activePreset.height) * 100}%`,
                  }}
                >
                  <div className="safe-zone-label">
                    Safe Area ({activePreset.safeZone.width}×{activePreset.safeZone.height})
                  </div>
                </div>
              );
            })()}

            {/* Embedded Blurred overlay if blur background */}
            {backgroundType === 'blur' && imageSrc && (
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backdropFilter: `blur(${blurDensity}px) saturate(1.4)`,
                backgroundColor: 'rgba(15, 23, 42, 0.45)',
                zIndex: 0
              }} />
            )}

            {/* Light Rays CSS Overlay */}
            {lightRaysStyle && lightRaysStyle !== 'none' && (
              <div 
                className="light-rays-overlay" 
                style={{
                  position: 'absolute',
                  top: 0, left: 0, right: 0, bottom: 0,
                  opacity: lightRaysOpacity / 100,
                  pointerEvents: 'none',
                  zIndex: 0,
                  backgroundImage: (() => {
                    if (lightRaysStyle === 'diagonal') return getDiagonalBackground(lightRaysAngle, lightRaysSourceX, lightRaysSourceY, lightRaysCount);
                    if (lightRaysStyle === 'spotlight') return getSpotlightBackground(lightRaysSourceX, lightRaysSourceY);
                    if (lightRaysStyle === 'aurora') return getAuroraBackground(lightRaysAngle, lightRaysSourceX, lightRaysSourceY);
                    return undefined;
                  })(),
                }} 
              />
            )}

            {/* Grain Noise CSS Overlay */}
            {bgGrain > 0 && (
              <div 
                className="bg-grain-overlay" 
                style={{
                  position: 'absolute',
                  top: 0, left: 0, right: 0, bottom: 0,
                  opacity: bgGrain / 100,
                  pointerEvents: 'none',
                  zIndex: 0,
                }} 
              />
            )}

            {/* Draggable Point Handles for Mesh Gradient */}
            {backgroundType === 'mesh' && (
              <MeshGradientHandles
                meshPoints={meshPoints}
                activePointIdx={activePointIdx}
                activeTool={activeTool}
                handlePointerDown={handlePointerDown}
                handlePointerMove={handlePointerMove}
                handlePointerUp={handlePointerUp}
              />
            )}

            {/* Main Screenshot card box */}
            {((!noImageMode && imageSrc) || (noImageMode && codeStudioActive)) ? (
              <div
                className={`preview-container-box ${chromeStyle !== 'none' ? `mockup-${chromeTheme}` : ''}`}
                style={{
                  borderRadius: `${rounded}px`,
                  boxShadow: shadowEnabled ? `0 ${shadow * 0.8}px ${shadow * 1.5}px ${shadowColor}` : 'none',
                  border: border > 0 ? `${border}px solid ${borderColor}` : 'none',
                  outline: inset > 0 ? `${inset}px solid ${insetColor}` : 'none',
                  outlineOffset: `-${inset}px`,
                  width: `${contentW}px`,
                  height: `${contentH}px`,
                  zIndex: 1,
                  ...getCanvasContentPosition(position || 'Middle center', padding, dims.width, dims.height, contentW, contentH),
                }}
              >
                {/* Title Bar Mockup */}
                <ChromeMockup chromeStyle={chromeStyle} chromeTheme={chromeTheme || 'dark'} scale={scale / 100} />

                {/* Content rendering: Code editor or Screenshot image */}
                {codeStudioActive ? (
                  <CodePreview
                    code={codeStudioCode}
                    onChangeCode={setCodeStudioCode}
                    language={codeStudioLanguage}
                    onChangeLanguage={setCodeStudioLanguage}
                    themeName={codeStudioTheme}
                    fontSize={codeStudioFontSize}
                    showLineNumbers={codeStudioLineNumbers}
                    breakpoints={codeStudioBreakpoints}
                    onToggleBreakpoint={handleToggleBreakpoint}
                    showBreakpoints={codeStudioShowBreakpoints}
                  />
                ) : (
                  <div style={{ position: 'relative', display: 'inline-block', maxWidth: '100%', maxHeight: '100%' }}>
                    <img
                      src={imageSrc || undefined}
                      alt="Screenshot"
                      className="preview-screenshot-img"
                      onLoad={(e) => {
                        setImgDims({
                          width: e.currentTarget.naturalWidth,
                          height: e.currentTarget.naturalHeight
                        });
                      }}
                      style={{
                        width: aspectRatio === 'Auto' ? 'auto' : '100%',
                        maxWidth: '100%',
                        maxHeight: aspectRatio === 'Auto' ? '100%' : undefined,
                        height: 'auto',
                        display: 'block',
                      }}
                    />
                    {imageSrc && (
                      <BlurOverlays imageSrc={imageSrc} annotations={annotations} displayWidth={annotationDisplayWidth} />
                    )}
                    {/* Annotations drawing layer */}
                    <AnnotationsLayer
                      annotations={annotations}
                      setAnnotations={setAnnotations}
                      activeTool={activeTool}
                      editable={editingMode}
                      setActiveTool={setActiveTool}
                      color={annotationColor}
                      setAnnotationColor={setAnnotationColor}
                      strokeWidth={annotationStrokeWidth}
                      onSaveHistory={(newAnns) => {
                        const cfg = getCurrentConfig();
                        if (newAnns) cfg.annotations = newAnns;
                        pushHistory(cfg);
                      }}
                      customPrompt={customPrompt}
                      onDimensionsChange={handleAnnotationDimensionsChange}
                    />
                  </div>
                )}
              </div>
            ) : (
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 1 }}>
                <AnnotationsLayer
                  annotations={annotations}
                  setAnnotations={setAnnotations}
                  activeTool={activeTool}
                  editable={editingMode}
                  setActiveTool={setActiveTool}
                  color={annotationColor}
                  setAnnotationColor={setAnnotationColor}
                  strokeWidth={annotationStrokeWidth}
                  onSaveHistory={(newAnns) => {
                    const cfg = getCurrentConfig();
                    if (newAnns) cfg.annotations = newAnns;
                    pushHistory(cfg);
                  }}
                  customPrompt={customPrompt}
                  onDimensionsChange={handleAnnotationDimensionsChange}
                />
              </div>
            )}

            {/* Watermark Overlay */}
            <CanvasWatermark
              watermarkEnabled={watermarkEnabled}
              watermarkText={watermarkText}
              watermarkSize={watermarkSize}
              watermarkPosition={watermarkPosition}
              watermarkOpacity={watermarkOpacity}
              padding={padding}
              watermarkFont={watermarkFont}
              watermarkBold={watermarkBold}
              watermarkItalic={watermarkItalic}
            />

          </div>
        </div>
      ) : (
        <EmptyState />
      )}
      </div>

      {/* Zoom controls cluster */}
      {(imageSrc || noImageMode) && (
        <ZoomControls
          zoomLevel={zoomLevel}
          setZoomLevel={setZoomLevel}
          handleZoomIn={handleZoomIn}
          handleZoomOut={handleZoomOut}
        />
      )}

      {/* Right-click Context Menu */}
      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          onClose={() => setContextMenu(null)}
          hasImage={!!imageSrc}
        />
      )}
    </div>
  );
}
