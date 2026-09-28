import { useState, useRef, useCallback } from 'react';
import { Plus, Trash2, Clipboard, Brush, Bookmark } from 'lucide-react';
import { useAppContext } from '../AppContext';
import logoUrl from '../../../assets/logo.svg';
import LayoutSettings from './LayoutSettings';
import BackgroundSettings from './BackgroundSettings';
import ExtraSettings from './ExtraSettings';
import CodeStudioSettings from './CodeStudioSettings';
import Tooltip from './Tooltip';

const MIN_WIDTH = 425;
const MAX_WIDTH = 560;
const DEFAULT_WIDTH = 425;

export default function Sidebar() {
  const {
    sidebarVisible,
    customPresets,
    newPresetName, setNewPresetName,
    selectFile,
    pasteFromClipboard,
    saveCustomPreset,
    deleteCustomPreset,
    selectBackgroundPreset,
    resetStyles,
    sidebarPosition,
    codeStudioActive
  } = useAppContext();

  const [sidebarWidth, setSidebarWidth] = useState(DEFAULT_WIDTH);
  const isDragging = useRef(false);
  const startX = useRef(0);
  const startWidth = useRef(DEFAULT_WIDTH);

  const handleResetClick = () => {
    const confirmReset = window.confirm("Are you sure you want to reset all layout, background, and style settings to their beautiful defaults?");
    if (confirmReset) resetStyles();
  };

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    isDragging.current = true;
    startX.current = e.clientX;
    startWidth.current = sidebarWidth;

    const onMouseMove = (ev: MouseEvent) => {
      if (!isDragging.current) return;
      const delta = sidebarPosition === 'right' ? (startX.current - ev.clientX) : (ev.clientX - startX.current);
      const next = Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, startWidth.current + delta));
      setSidebarWidth(next);
    };

    const onMouseUp = () => {
      isDragging.current = false;
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };

    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  }, [sidebarWidth, sidebarPosition]);

  return (
    <div
      className={`sidebar ${sidebarPosition === 'right' ? 'right' : 'left'} ${sidebarVisible ? '' : 'collapsed'}`}
      style={{ width: sidebarWidth, minWidth: sidebarWidth }}
    >
      <div className="sidebar-header">
        <div className="sidebar-title">
          <img src={logoUrl} alt="Framely" className="sidebar-logo" />
          <span>Framely</span>
        </div>
      </div>

      <div className="sidebar-content">
        {/* Snap / Change Actions */}
        <div className="sidebar-actions">
          <Tooltip content="New snap" position="top">
            <button
              className="btn btn-primary"
              title="New snap"
              onClick={selectFile}
              style={{ width: '36px', height: '36px', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <Plus className="w-4 h-4" />
            </button>
          </Tooltip>
          <Tooltip content="Paste image" position="top">
            <button
              className="btn btn-secondary"
              title="Paste"
              onClick={pasteFromClipboard}
              style={{ width: '36px', height: '36px', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <Clipboard className="w-4 h-4" />
            </button>
          </Tooltip>
          <Tooltip content="Reset Styles" position="top">
            <button
              className="btn btn-secondary"
              title="Reset Styles"
              onClick={handleResetClick}
              style={{ width: '36px', height: '36px', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <Brush className="w-4 h-4" />
            </button>
          </Tooltip>
        </div>

        {/* User Presets */}
        <div className="control-group">
          <div className="presets-header" style={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center', gap: '6px', marginBottom: 'var(--space-2)' }}>
            <Bookmark className="w-3.5 h-3.5" style={{ color: 'var(--text-secondary)' }} />
            <span className="control-label">User Presets</span>
          </div>

          <div className="color-picker-row">
            <input
              type="text"
              placeholder="Preset name..."
              value={newPresetName}
              onChange={(e) => setNewPresetName(e.target.value)}
              style={{ flex: 1 }}
            />
            <Tooltip position="top">
              <button className="btn btn-secondary" onClick={saveCustomPreset} title="Save current background" style={{ width: '36px', padding: 0, flexShrink: 0 }}>
                <Plus className="w-4 h-4" />
              </button>
            </Tooltip>
          </div>

          {customPresets.length > 0 && (
            <div className="presets-list">
              {customPresets.map((p) => (
                <div key={p.id} className="preset-item" onClick={() => selectBackgroundPreset(p)}>
                  <span>{p.name}</span>
                  <Tooltip content="Delete preset" position="left">
                    <button className="preset-delete-btn" onClick={(e) => deleteCustomPreset(p.id, e)}>
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </Tooltip>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Modular Sidebar Control Groups */}
        {codeStudioActive && <CodeStudioSettings />}
        <LayoutSettings />
        <BackgroundSettings />
        <ExtraSettings />

      </div>

      {/* Resize handle */}
      <div className="sidebar-resize-handle" onMouseDown={onMouseDown} />
    </div>
  );
}
