import { useRef } from 'react';
import {
  PaintRoller,
  ImagePlus,
  Undo2,
  Redo2,
  FilePlus,
  MousePointer,
  Square,
  Circle,
  Slash,
  ArrowUpRight,
  Type,
  TypeOutline,
  Pencil,
  Droplets,
  Smile,
  Palette,
  HelpCircle,
  Sun,
  Moon,
  Settings,
  Code,
  Camera
} from 'lucide-react';
import { useAppContext } from '../AppContext';
import { toggleTheme } from '../utils/uiUtils';
import Tooltip from './Tooltip';
import FontSelector from './FontSelector';
import ColorSwatchPicker from './annotations/ColorSwatchPicker';
import { useToolbarShortcuts } from '../hooks/useToolbarShortcuts';
import { formatModShortcut } from '../utils/shortcutLabels';

export default function WorkspaceToolbar() {
  useToolbarShortcuts();

  const {
    sidebarVisible, setSidebarVisible,
    noImageMode, setNoImageMode,
    historyIndex, history,
    handleUndo, handleRedo,
    activeTool, setActiveTool,
    editingMode, setEditingMode,
    selectedAnnotationId, setSelectedAnnotationId,
    annotations, setAnnotations,
    blurStrength, setBlurStrength,
    arrowStyle, setArrowStyle,
    annotationColor, setAnnotationColor,
    annotationStrokeWidth, setAnnotationStrokeWidth,
    annotationFont = 'sans-serif', setAnnotationFont,
    annotationFontSize = 24, setAnnotationFontSize,
    annotationBold = true, setAnnotationBold,
    annotationItalic = false, setAnnotationItalic,
    annotationOutlineEnabled = false, setAnnotationOutlineEnabled,
    annotationOutlineColor = '#000000', setAnnotationOutlineColor,
    annotationOutlineWidth = 3, setAnnotationOutlineWidth,
    annotationGradientEnabled = false, setAnnotationGradientEnabled,
    annotationGradientColor1 = '#ff0080', setAnnotationGradientColor1,
    annotationGradientColor2 = '#7928ca', setAnnotationGradientColor2,
    annotationGradientAngle = 135, setAnnotationGradientAngle,
    systemFonts = [],
    pushHistory, getCurrentConfig, selectFile, colorInputRef,
    appTheme, setAppTheme,
    settingsVisible, setSettingsVisible,
    helpVisible, setHelpVisible,
    setImageSrc,
    clearWorkspace,
    codeStudioActive,
    imageSrc, showToast,
    toggleCodeStudio,
  } = useAppContext();

  const tools: Array<{ id: typeof activeTool; icon: React.ReactNode; title: string; tooltip: string }> = [
    { id: 'pointer', icon: <MousePointer className="w-4 h-4" />, title: 'Select / Move', tooltip: 'Select / Move (V or 1)' },
    { id: 'rect', icon: <Square className="w-4 h-4" />, title: 'Rectangle Outline', tooltip: 'Rectangle Outline (R or 2)' },
    { id: 'filled-rect', icon: <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><rect x="3" y="3" width="18" height="18" rx="4" /></svg>, title: 'Rectangle Filled', tooltip: 'Rectangle Filled (F, Shift+R, or 3)' },
    { id: 'circle', icon: <Circle className="w-4 h-4" />, title: 'Circle Outline', tooltip: 'Circle Outline (O, C, or 4)' },
    { id: 'filled-circle', icon: <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="9" /></svg>, title: 'Circle Filled', tooltip: 'Circle Filled (Shift+O, Shift+C, or 5)' },
    { id: 'line', icon: <Slash className="w-4 h-4" />, title: 'Straight Line', tooltip: 'Straight Line (L or 6)' },
    { id: 'arrow', icon: <ArrowUpRight className="w-4 h-4" />, title: 'Draw Arrow', tooltip: 'Draw Arrow (A or 7)' },
    { id: 'blur', icon: <Droplets className="w-4 h-4" />, title: 'Blur Area', tooltip: 'Drag to blur a selected area' },
    { id: 'text', icon: <Type className="w-4 h-4" />, title: 'Draw Text', tooltip: 'Draw Text (T or 8)' },
    { id: 'pen', icon: <Pencil className="w-4 h-4" />, title: 'Freehand Draw', tooltip: 'Freehand Draw (P, D, or 9)' },
    { id: 'emoji', icon: <Smile className="w-4 h-4" />, title: 'Add Emoji', tooltip: 'Add Emoji (E or 0)' },
  ];

  const selectedBlur = annotations.find((annotation) => annotation.id === selectedAnnotationId && annotation.type === 'blur');
  const currentBlurStrength = selectedBlur?.blurStrength ?? blurStrength;
  const pendingBlurHistory = useRef<typeof annotations | null>(null);
  const updateBlurStrength = (strength: number) => {
    setBlurStrength(strength);
    if (selectedBlur) {
      const updated = annotations.map((annotation) =>
        annotation.id === selectedBlur.id ? { ...annotation, blurStrength: strength } : annotation
      );
      setAnnotations(updated);
      pendingBlurHistory.current = updated;
    }
  };
  const commitBlurStrength = () => {
    const updated = pendingBlurHistory.current;
    if (!updated) return;
    const strength = updated.find((annotation) => annotation.id === selectedAnnotationId)?.blurStrength ?? blurStrength;
    pushHistory({ ...getCurrentConfig(), annotations: updated, blurStrength: strength });
    pendingBlurHistory.current = null;
  };

  return (
    <div className={`toolbar-dock ${editingMode ? 'is-editing' : ''}`}>
      {/* Workspace controls */}
      <div className="toolbar-group">
        <Tooltip content="Capture screenshot" position="right">
          <button
            className="tool-btn capture-trigger"
            title="Capture screenshot"
            aria-label="Capture screenshot"
            onClick={() => {
              if (window.framelyAPI?.triggerScreenCapture) window.framelyAPI.triggerScreenCapture();
              else showToast('Screen capture is available in the Framely desktop app.');
            }}
          >
            <Camera className="w-4 h-4" /><span>Capture</span>
          </button>
        </Tooltip>
        {noImageMode && (
          <>
            <Tooltip position="right">
              <button
                className="tool-btn"
                onClick={selectFile}
                title="Upload Screenshot"
                aria-label="Upload Screenshot"
              >
                <ImagePlus className="w-4 h-4" />
              </button>
            </Tooltip>
            <Tooltip position="right">
              <button
                className="tool-btn"
                onClick={() => {
                  setNoImageMode(false);
                  setImageSrc(null);
                  pushHistory({ ...getCurrentConfig(), noImage: false });
                }}
                title="Exit Gradient Mode"
              >
                <span style={{ fontSize: '0.65rem', fontWeight: 600 }}>Exit</span>
              </button>
            </Tooltip>
          </>
        )}
      </div>

      <div className="toolbar-divider" />

      <div className="toolbar-group">
        <Tooltip position="right">
          <button className="tool-btn" onClick={handleUndo} disabled={historyIndex <= 0} title={`Undo (${formatModShortcut('Z')})`} aria-label="Undo">
            <Undo2 className="w-4 h-4" />
          </button>
        </Tooltip>
        <Tooltip position="right">
          <button className="tool-btn" onClick={handleRedo} disabled={historyIndex >= history.length - 1} title={`Redo (${formatModShortcut('Y')})`} aria-label="Redo">
            <Redo2 className="w-4 h-4" />
          </button>
        </Tooltip>
        <Tooltip position="right">
          <button
            className="tool-btn"
            onClick={clearWorkspace}
            title={`New workspace (${formatModShortcut('N')})`}
            aria-label="New workspace"
          >
            <FilePlus className="w-4 h-4" />
          </button>
        </Tooltip>
      </div>

      <div className="toolbar-divider" />
      <div className="toolbar-group">
        <button
          className={`tool-btn edit-mode-toggle ${editingMode ? 'active' : ''}`}
          onClick={() => {
            setEditingMode(!editingMode);
            setActiveTool('pointer');
            setSelectedAnnotationId(null);
          }}
          title={editingMode ? 'Finish editing' : 'Show editing tools'}
          aria-label={editingMode ? 'Finish editing' : 'Enter edit mode'}
          aria-pressed={editingMode}
        >
          <Pencil className="w-4 h-4" />
          <span>{editingMode ? 'Done' : 'Edit'}</span>
        </button>
      </div>

      {editingMode && <>
      <div className="toolbar-divider" />

      {/* Annotation tools */}
      <div className="toolbar-group">
        {tools.map((tool) => (
          <Tooltip key={tool.id} content={tool.tooltip} position="right">
            <button
              className={`tool-btn ${activeTool === tool.id ? 'active' : ''}`}
              onClick={() => setActiveTool(tool.id)}
              title={tool.title}
              disabled={tool.id === 'blur' && (!imageSrc || noImageMode || codeStudioActive)}
              aria-label={tool.title}
            >
              {tool.icon}
            </button>
          </Tooltip>
        ))}
      </div>

      {(activeTool === 'blur' || selectedBlur) && (
        <div className="toolbar-control blur-strength-control">
          <label htmlFor="blur-strength" className="toolbar-control-label">Blur</label>
          <input
            id="blur-strength"
            type="range"
            min="2"
            max="40"
            value={currentBlurStrength}
            onChange={(event) => updateBlurStrength(Number(event.target.value))}
            onPointerUp={commitBlurStrength}
            onKeyUp={commitBlurStrength}
            onBlur={commitBlurStrength}
            aria-label="Blur strength"
          />
          <span className="toolbar-control-value">{currentBlurStrength}</span>
        </div>
      )}

      {activeTool === 'arrow' && (
        <>
          <div className="toolbar-divider" />
          <div className="toolbar-group">
            <Tooltip position="right">
              <button
                className={`tool-btn ${arrowStyle === 'classic' ? 'active' : ''}`}
                onClick={() => setArrowStyle('classic')}
                title="Classic Arrow"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="19" x2="19" y2="5" />
                  <polyline points="12 5 19 5 19 12" />
                </svg>
              </button>
            </Tooltip>
            <Tooltip position="right">
              <button
                className={`tool-btn ${arrowStyle === 'dashed' ? 'active' : ''}`}
                onClick={() => setArrowStyle('dashed')}
                title="Dashed Arrow"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="3 3">
                  <line x1="5" y1="19" x2="19" y2="5" />
                  <polyline points="12 5 19 5 19 12" strokeDasharray="none" />
                </svg>
              </button>
            </Tooltip>
            <Tooltip position="right">
              <button
                className={`tool-btn ${arrowStyle === 'tapered' ? 'active' : ''}`}
                onClick={() => setArrowStyle('tapered')}
                title="Tapered Curved Arrow"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M4.5 19.5 C 5.5 18.5, 12 11, 15 8 L 13.5 6.5 L 20.5 5.5 L 19.5 12.5 L 18 11 C 15 14, 4.5 19.5, 4.5 19.5 Z" />
                </svg>
              </button>
            </Tooltip>
            <Tooltip position="right">
              <button
                className={`tool-btn ${arrowStyle === 'curved' ? 'active' : ''}`}
                onClick={() => setArrowStyle('curved')}
                title="Curved Arrow"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 20 Q 14 16 19 5" />
                  <polyline points="12 5 19 5 19 12" />
                </svg>
              </button>
            </Tooltip>
          </div>
        </>
      )}

      {activeTool === 'text' && (
        <>
          <div className="toolbar-divider" />
          <div className="toolbar-group">
            <Tooltip position="right">
                <FontSelector
                  value={annotationFont}
                  onChange={(val) => {
                    setAnnotationFont(val);
                    pushHistory({ ...getCurrentConfig(), annotationFont: val });
                  }}
                  systemFonts={systemFonts}
                  triggerWidth="110px"
                  styleType="toolbar"
                />
            </Tooltip>
            <Tooltip position="right">
              <div className="toolbar-control" style={{ gap: '4px', paddingRight: '8px' }}>
                <span className="toolbar-control-label">Font Size</span>
                <input
                  type="range"
                  min="12"
                  max="124"
                  value={annotationFontSize}
                  onChange={(e) => setAnnotationFontSize(parseInt(e.target.value, 10))}
                  style={{ width: '60px' }}
                  title={`Font Size: ${annotationFontSize}px`}
                />
                <span className="toolbar-control-value">{annotationFontSize}px</span>
              </div>
            </Tooltip>
            <Tooltip position="right">
              <button
                className={`tool-btn ${annotationBold ? 'active' : ''}`}
                style={{
                  fontWeight: 'bold',
                  backgroundColor: annotationBold ? 'var(--accent)' : 'transparent',
                  color: annotationBold ? 'var(--on-accent)' : 'var(--text-secondary)',
                }}
                onClick={() => {
                  setAnnotationBold(!annotationBold);
                  pushHistory({ ...getCurrentConfig(), annotationBold: !annotationBold });
                }}
                title="Bold"
              >
                B
              </button>
            </Tooltip>
            <Tooltip position="right">
              <button
                className={`tool-btn ${annotationItalic ? 'active' : ''}`}
                style={{
                  fontStyle: 'italic',
                  backgroundColor: annotationItalic ? 'var(--accent)' : 'transparent',
                  color: annotationItalic ? 'var(--on-accent)' : 'var(--text-secondary)',
                }}
                onClick={() => {
                  setAnnotationItalic(!annotationItalic);
                  pushHistory({ ...getCurrentConfig(), annotationItalic: !annotationItalic });
                }}
                title="Italic"
              >
                I
              </button>
            </Tooltip>
            <Tooltip position="right">
              <button
                className={`tool-btn ${annotationOutlineEnabled ? 'active' : ''}`}
                style={{
                  backgroundColor: annotationOutlineEnabled ? 'var(--accent)' : 'transparent',
                  color: annotationOutlineEnabled ? 'var(--on-accent)' : 'var(--text-secondary)',
                }}
                onClick={() => {
                  setAnnotationOutlineEnabled(!annotationOutlineEnabled);
                  pushHistory({ ...getCurrentConfig(), annotationOutlineEnabled: !annotationOutlineEnabled });
                }}
                title="Text Outline (toggle on/off)"
              >
                <TypeOutline className="w-4 h-4" style={{ strokeWidth: 2.5 }} />
              </button>
            </Tooltip>
            <Tooltip position="right">
              <button
                className="tool-btn"
                style={{
                  position: 'relative',
                  border: `1px solid ${annotationOutlineColor}`,
                  backgroundColor: 'var(--surface-2)',
                  padding: 0,
                }}
                title="Outline Color"
              >
                <span style={{ display: 'block', width: '16px', height: '16px', borderRadius: '2px', background: annotationOutlineColor }} />
                <input
                  type="color"
                  value={annotationOutlineColor}
                  onChange={(e) => {
                    setAnnotationOutlineColor(e.target.value);
                    if (!annotationOutlineEnabled) {
                      setAnnotationOutlineEnabled(true);
                      pushHistory({ ...getCurrentConfig(), annotationOutlineColor: e.target.value, annotationOutlineEnabled: true });
                    } else {
                      pushHistory({ ...getCurrentConfig(), annotationOutlineColor: e.target.value });
                    }
                  }}
                  onClick={(e) => e.stopPropagation()}
                  style={{
                    position: 'absolute',
                    inset: 0,
                    width: '100%',
                    height: '100%',
                    opacity: 0,
                    cursor: 'pointer',
                  }}
                />
              </button>
            </Tooltip>
            {annotationOutlineEnabled && (
              <Tooltip position="right">
                <div className="toolbar-control" style={{ gap: '4px', paddingRight: '8px' }}>
                  <span className="toolbar-control-label">Outline</span>
                  <input
                    type="range"
                    min="1"
                    max="20"
                    value={annotationOutlineWidth}
                    onChange={(e) => setAnnotationOutlineWidth(parseInt(e.target.value, 10))}
                    style={{ width: '50px' }}
                    title={`Outline Width: ${annotationOutlineWidth}px`}
                  />
                  <span className="toolbar-control-value">{annotationOutlineWidth}px</span>
                </div>
              </Tooltip>
            )}
            <Tooltip position="right">
              <button
                className={`tool-btn ${annotationGradientEnabled ? 'active' : ''}`}
                style={{
                  backgroundColor: annotationGradientEnabled ? 'var(--accent)' : 'transparent',
                  color: annotationGradientEnabled ? 'var(--on-accent)' : 'var(--text-secondary)',
                  position: 'relative',
                  overflow: 'hidden',
                }}
                onClick={() => {
                  setAnnotationGradientEnabled(!annotationGradientEnabled);
                  pushHistory({ ...getCurrentConfig(), annotationGradientEnabled: !annotationGradientEnabled });
                }}
                title="Gradient Text (toggle on/off)"
              >
                <span style={{
                  display: 'block',
                  width: '16px',
                  height: '16px',
                  borderRadius: '2px',
                  background: `linear-gradient(${annotationGradientAngle}deg, ${annotationGradientColor1}, ${annotationGradientColor2})`,
                }} />
              </button>
            </Tooltip>
            {annotationGradientEnabled && (
              <>
                <Tooltip position="right">
                  <ColorSwatchPicker
                    value={annotationGradientColor1}
                    onChange={(color) => {
                      setAnnotationGradientColor1(color);
                      pushHistory({ ...getCurrentConfig(), annotationGradientColor1: color });
                    }}
                    title="Gradient Start Color"
                  />
                </Tooltip>
                <Tooltip position="right">
                  <ColorSwatchPicker
                    value={annotationGradientColor2}
                    onChange={(color) => {
                      setAnnotationGradientColor2(color);
                      pushHistory({ ...getCurrentConfig(), annotationGradientColor2: color });
                    }}
                    title="Gradient End Color"
                  />
                </Tooltip>
                <Tooltip position="right">
                  <div className="toolbar-control" style={{ gap: '4px', paddingRight: '8px' }}>
                    <span className="toolbar-control-label">Angle</span>
                    <input
                      type="range"
                      min="0"
                      max="360"
                      value={annotationGradientAngle}
                      onChange={(e) => setAnnotationGradientAngle(parseInt(e.target.value, 10))}
                      style={{ width: '50px' }}
                      title={`Gradient Angle: ${annotationGradientAngle}°`}
                    />
                    <span className="toolbar-control-value">{annotationGradientAngle}°</span>
                  </div>
                </Tooltip>
              </>
            )}
          </div>
        </>
      )}

      <div className="toolbar-divider" />

      {/* Color + Size */}
      <div className="toolbar-group" style={{ position: 'relative' }}>
        <Tooltip position="right">
          <button
            className="tool-btn"
            style={{ border: `1px solid ${annotationColor}` }}
            title="Annotation Color"
          >
            <Palette className="w-4 h-4" style={{ color: annotationColor }} />
            <input
              type="color"
              ref={colorInputRef as any}
              value={annotationColor}
              onChange={(e) => setAnnotationColor(e.target.value)}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                opacity: 0,
                cursor: 'pointer',
              }}
            />
          </button>
        </Tooltip>
      </div>

      {['rect', 'filled-rect', 'circle', 'filled-circle', 'line', 'arrow', 'pen'].includes(activeTool) && (
        <Tooltip position="right">
          <div className="toolbar-control">
            <span className="toolbar-control-label">Size</span>
            <input
              type="range"
              min="2"
              max="16"
              value={annotationStrokeWidth}
              onChange={(e) => setAnnotationStrokeWidth(parseInt(e.target.value, 10))}
              title={`Stroke Width: ${annotationStrokeWidth}px`}
            />
            <span className="toolbar-control-value">{annotationStrokeWidth}px</span>
          </div>
        </Tooltip>
      )}

      </>}

      <div className="toolbar-divider" />

      {/* Sidebar + Code Studio toggle + controls */}
      <div className="toolbar-group">
        <Tooltip position="right">
          <button
            className={`tool-btn ${sidebarVisible ? 'active' : ''}`}
            onClick={() => setSidebarVisible(prev => !prev)}
            title={sidebarVisible ? 'Hide Sidebar' : 'Show Sidebar'}
            aria-label={sidebarVisible ? 'Hide Sidebar' : 'Show Sidebar'}
            aria-pressed={sidebarVisible}
          >
            <PaintRoller className="w-4 h-4" />
          </button>
        </Tooltip>

        <Tooltip position="right">
          <button
            className={`tool-btn ${codeStudioActive ? 'active' : ''}`}
            onClick={() => {
              if (!codeStudioActive) {
                toggleCodeStudio(true);
                if (imageSrc) {
                  showToast('Code Studio active. Screenshot preserved.');
                } else {
                  showToast('Code Studio active.');
                }
              } else {
                toggleCodeStudio(false);
                if (imageSrc) {
                  showToast('Restored screenshot and annotations.');
                } else {
                  showToast('Screenshot Beautifier active.');
                }
              }
            }}
            title={codeStudioActive ? `Exit Code Studio (${formatModShortcut('Shift + C')})` : `Code Studio (${formatModShortcut('Shift + C')})`}
            aria-label={codeStudioActive ? 'Exit Code Studio' : 'Code Studio'}
            aria-pressed={codeStudioActive}
          >
            <Code className="w-4 h-4" />
          </button>
        </Tooltip>
      </div>



      <div className="toolbar-divider" />

      {/* Right: Theme + Settings + Help */}
      <div className="toolbar-group">
        <Tooltip position="right">
          <button
            className="tool-btn"
            onClick={() => setAppTheme(toggleTheme(appTheme))}
            title={appTheme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            aria-label={appTheme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {appTheme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        </Tooltip>
        <Tooltip position="right">
          <button
            className={`tool-btn ${settingsVisible ? 'active' : ''}`}
            onClick={() => setSettingsVisible(prev => !prev)}
            title="Settings"
            aria-label="Settings"
            aria-pressed={settingsVisible}
          >
            <Settings className="w-4 h-4" />
          </button>
        </Tooltip>
        <Tooltip position="right">
          <button
            className={`tool-btn ${helpVisible ? 'active' : ''}`}
            onClick={() => setHelpVisible(prev => !prev)}
            title="Help"
            aria-label="Help"
            aria-pressed={helpVisible}
            style={{ position: 'relative' }}
          >
            <HelpCircle className="w-4 h-4" />
          </button>
        </Tooltip>
      </div>
    </div>
  );
}
