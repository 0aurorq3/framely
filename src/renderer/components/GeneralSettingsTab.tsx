import React from 'react';
import { useAppContext } from '../AppContext';
import { updateUserDefault } from '../utils/storageUtils';
import { registerSettingsSection } from '../utils/settingsRegistry';
import { getModKeyLabel } from '../utils/shortcutLabels';

registerSettingsSection({ tab: 'general', label: 'General Settings', keywords: 'general sidebar position left right' });
registerSettingsSection({ tab: 'general', label: 'Screen Capture', keywords: 'screen capture auto import clipboard focus global shortcut printscreen hotkey' });
registerSettingsSection({ tab: 'general', label: 'Canvas Defaults', keywords: 'canvas defaults padding border radius shadow blur' });
registerSettingsSection({ tab: 'general', label: 'Export Preferences', keywords: 'export preferences format quality optimization png jpeg webp compression original balanced small' });
registerSettingsSection({ tab: 'general', label: 'Watermark Defaults', keywords: 'watermark defaults text font family bold italic position opacity enable' });

interface Section {
  label: string;
  keywords: string;
  render: () => React.ReactNode;
}

export default function GeneralSettingsTab({ searchQuery = '' }: { searchQuery?: string }) {
  const {
    padding, setPadding,
    rounded, setRounded,
    shadow, setShadow,
    watermarkEnabled, setWatermarkEnabled,
    watermarkText, setWatermarkText,
    watermarkPosition, setWatermarkPosition,
    watermarkOpacity, setWatermarkOpacity,
    watermarkFont = 'sans-serif', setWatermarkFont,
    watermarkBold = false, setWatermarkBold,
    watermarkItalic = false, setWatermarkItalic,
    systemFonts = [],
    exportFormat, setExportFormat,
    jpegQuality, setJpegQuality,
    compressionMode, setCompressionMode,
    pushHistory,
    getCurrentConfig,
    sidebarPosition, setSidebarPosition,
    autoImportCaptured, setAutoImportCaptured,
    captureShortcut, setCaptureShortcut,
  } = useAppContext();

  const updateSetting = (key: string, val: any, setter: (v: any) => void) => {
    setter(val);
    updateUserDefault(key, val);
    pushHistory(getCurrentConfig());
  };

  const q = searchQuery.toLowerCase();

  const sections: Section[] = [
    {
      label: 'General Settings',
      keywords: 'general sidebar position left right',
      render: () => (
        <>
          <div className="control-group">
            <span className="control-label">Sidebar Position</span>
            <div className="format-toggle" style={{ marginTop: '4px' }}>
              <button
                className={`format-toggle-btn ${sidebarPosition === 'left' ? 'active' : ''}`}
                onClick={() => {
                  updateSetting('sidebarPosition', 'left', setSidebarPosition);
                }}
                style={{ flex: 1 }}
                type="button"
              >Left</button>
              <button
                className={`format-toggle-btn ${sidebarPosition === 'right' ? 'active' : ''}`}
                onClick={() => {
                  updateSetting('sidebarPosition', 'right', setSidebarPosition);
                }}
                style={{ flex: 1 }}
                type="button"
              >Right</button>
            </div>
          </div>
        </>
      ),
    },
    {
      label: 'Screen Capture',
      keywords: 'screen capture auto import clipboard focus global shortcut printscreen hotkey',
      render: () => (
        <>
          <div className="switch-container">
            <span className="control-label">Auto-Import from Clipboard on Focus</span>
            <label className="switch">
              <input
                type="checkbox"
                checked={autoImportCaptured}
                onChange={(e) => updateSetting('autoImportCaptured', e.target.checked, setAutoImportCaptured)}
              />
              <span className="slider-switch" />
            </label>
          </div>
          <div className="control-group">
            <span className="control-label">Global Capture Shortcut</span>
            <select
              value={captureShortcut}
              onChange={(e) => updateSetting('captureShortcut', e.target.value, setCaptureShortcut)}
              style={{ marginTop: '4px' }}
            >
              <option value="PrintScreen">Print Screen</option>
              <option value="CommandOrControl+Shift+S">{getModKeyLabel()} + Shift + S</option>
              <option value="CommandOrControl+Alt+S">{getModKeyLabel()} + Alt + S</option>
              <option value="Disabled">Disabled</option>
            </select>
          </div>
        </>
      ),
    },
    {
      label: 'Canvas Defaults',
      keywords: 'canvas defaults padding border radius shadow blur',
      render: () => (
        <>
          <div className="control-group">
            <div className="control-label-container">
              <span className="control-label">Default Padding</span>
              <span className="control-value">{padding}px</span>
            </div>
            <input type="range" min="0" max="100" value={padding}
              onChange={(e) => updateSetting('padding', parseInt(e.target.value, 10), setPadding)} />
          </div>
          <div className="control-group">
            <div className="control-label-container">
              <span className="control-label">Default Border Radius</span>
              <span className="control-value">{rounded}px</span>
            </div>
            <input type="range" min="0" max="50" value={rounded}
              onChange={(e) => updateSetting('rounded', parseInt(e.target.value, 10), setRounded)} />
          </div>
          <div className="control-group">
            <div className="control-label-container">
              <span className="control-label">Default Shadow Blur</span>
              <span className="control-value">{shadow}px</span>
            </div>
            <input type="range" min="0" max="100" value={shadow}
              onChange={(e) => updateSetting('shadow', parseInt(e.target.value, 10), setShadow)} />
          </div>
        </>
      ),
    },
    {
      label: 'Export Preferences',
      keywords: 'export preferences format quality optimization png jpeg webp compression original balanced small',
      render: () => (
        <>
          <div className="control-group">
            <span className="control-label">Default Format</span>
            <div className="format-toggle" style={{ marginTop: '4px' }}>
              <button className={`format-toggle-btn ${exportFormat === 'png' ? 'active' : ''}`}
                onClick={() => updateSetting('exportFormat', 'png', setExportFormat)} style={{ flex: 1 }} type="button">PNG</button>
              <button className={`format-toggle-btn ${exportFormat === 'jpeg' ? 'active' : ''}`}
                onClick={() => updateSetting('exportFormat', 'jpeg', setExportFormat)} style={{ flex: 1 }} type="button">JPEG</button>
              <button className={`format-toggle-btn ${exportFormat === 'webp' ? 'active' : ''}`}
                onClick={() => updateSetting('exportFormat', 'webp', setExportFormat)} style={{ flex: 1 }} type="button">WebP</button>
            </div>
          </div>
          {(exportFormat === 'jpeg' || exportFormat === 'webp') && (
            <div className="control-group">
              <div className="control-label-container">
                <span className="control-label">Quality</span>
                <span className="control-value">{jpegQuality}%</span>
              </div>
              <input type="range" min="10" max="100" value={jpegQuality}
                onChange={(e) => updateSetting('jpegQuality', parseInt(e.target.value, 10), setJpegQuality)} />
            </div>
          )}
          <div className="control-group">
            <span className="control-label">Default Optimization</span>
            <div className="format-toggle" style={{ marginTop: '4px' }}>
              <button className={`format-toggle-btn ${compressionMode === 'original' ? 'active' : ''}`}
                onClick={() => updateSetting('compressionMode', 'original', setCompressionMode)} style={{ flex: 1 }} type="button">Original</button>
              <button className={`format-toggle-btn ${compressionMode === 'balanced' ? 'active' : ''}`}
                onClick={() => updateSetting('compressionMode', 'balanced', setCompressionMode)} style={{ flex: 1 }} type="button">Balanced</button>
              <button className={`format-toggle-btn ${compressionMode === 'small' ? 'active' : ''}`}
                onClick={() => updateSetting('compressionMode', 'small', setCompressionMode)} style={{ flex: 1 }} type="button">Small</button>
            </div>
          </div>
        </>
      ),
    },
    {
      label: 'Watermark Defaults',
      keywords: 'watermark defaults text font family bold italic position opacity enable',
      render: () => (
        <>
          <div className="switch-container">
            <span className="control-label" title="Optional Framely signature for shared images.">
              Brand Watermark by Default
            </span>
            <label className="switch">
              <input type="checkbox" checked={watermarkEnabled}
                onChange={(e) => updateSetting('watermarkEnabled', e.target.checked, setWatermarkEnabled)} />
              <span className="slider-switch" />
            </label>
          </div>
          <p style={{ margin: '0 0 0.5rem', fontSize: '0.72rem', color: 'var(--text-tertiary)', lineHeight: 1.35 }}>
            Add a subtle &quot;Made with Framely&quot; badge when you want attribution. Clean exports remain the default.
          </p>
          <div className="control-group">
            <span className="control-label">Default Text</span>
            <input type="text" value={watermarkText}
              onChange={(e) => updateSetting('watermarkText', e.target.value, setWatermarkText)}
              style={{ marginTop: '4px' }} />
          </div>
          <div className="control-group">
            <span className="control-label">Default Font Family</span>
            <div style={{ display: 'flex', gap: '4px', marginTop: '4px' }}>
              <select value={watermarkFont}
                onChange={(e) => updateSetting('watermarkFont', e.target.value, setWatermarkFont)}
                style={{ flex: 1 }}>
                {systemFonts.map((f) => <option key={f} value={f}>{f}</option>)}
              </select>
              <button
                className={`btn btn-secondary ${watermarkBold ? 'active' : ''}`}
                style={{
                  padding: '0 8px', fontWeight: 'bold',
                  backgroundColor: watermarkBold ? 'var(--accent)' : 'var(--surface-2)',
                  color: watermarkBold ? 'var(--on-accent)' : 'var(--text-secondary)',
                  border: 'none', borderRadius: '4px', height: '28px',
                }}
                onClick={() => updateSetting('watermarkBold', !watermarkBold, setWatermarkBold)}
                title="Bold" type="button">B</button>
              <button
                className={`btn btn-secondary ${watermarkItalic ? 'active' : ''}`}
                style={{
                  padding: '0 8px', fontStyle: 'italic',
                  backgroundColor: watermarkItalic ? 'var(--accent)' : 'var(--surface-2)',
                  color: watermarkItalic ? 'var(--on-accent)' : 'var(--text-secondary)',
                  border: 'none', borderRadius: '4px', height: '28px',
                }}
                onClick={() => updateSetting('watermarkItalic', !watermarkItalic, setWatermarkItalic)}
                title="Italic" type="button">I</button>
            </div>
          </div>
          <div className="control-group">
            <span className="control-label">Default Position</span>
            <select value={watermarkPosition}
              onChange={(e) => updateSetting('watermarkPosition', e.target.value, setWatermarkPosition)}
              style={{ marginTop: '4px' }}>
              <option value="left">Bottom Left</option>
              <option value="middle">Bottom Center</option>
              <option value="right">Bottom Right</option>
              <option value="top left">Top Left</option>
              <option value="top middle">Top Center</option>
              <option value="top right">Top Right</option>
            </select>
          </div>
          <div className="control-group">
            <div className="control-label-container">
              <span className="control-label">Default Opacity</span>
              <span className="control-value">{Math.round(watermarkOpacity * 100)}%</span>
            </div>
            <input type="range" min="0" max="100" value={Math.round(watermarkOpacity * 100)}
              onChange={(e) => updateSetting('watermarkOpacity', parseFloat(e.target.value) / 100, setWatermarkOpacity)}
              style={{ marginTop: '4px' }} />
          </div>
        </>
      ),
    },
  ];

  const filtered = q
    ? sections.filter(s => s.keywords.includes(q) || s.label.toLowerCase().includes(q))
    : sections;

  if (filtered.length === 0) {
    return <div className="settings-no-results">No settings match &ldquo;{searchQuery}&rdquo;</div>;
  }

  return (
    <>
      {filtered.map((section) => (
        <div key={section.label} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <h3 style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-tertiary)', margin: '0 0 4px 0' }}>
            {section.label}
          </h3>
          {section.render()}
        </div>
      ))}
    </>
  );
}
