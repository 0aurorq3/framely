import { useAppContext } from '../AppContext';
import InspectorSection from './InspectorSection';
import { Layout } from 'lucide-react';

export default function LayoutSettings() {
  const {
    padding, setPadding,
    rounded, setRounded,
    shadow, setShadow,
    shadowColor, setShadowColor,
    shadowEnabled, setShadowEnabled,
    inset, setInset,
    insetColor, setInsetColor,
    border, setBorder,
    borderColor, setBorderColor,
    scale, setScale,
    position, setPosition,
    showAdvancedInset, setShowAdvancedInset,
    showAdvancedShadow, setShowAdvancedShadow,
    showAdvancedBorder, setShowAdvancedBorder,
    getCurrentConfig, pushHistory, handleSliderRelease
  } = useAppContext();

  return (
    <InspectorSection title="Layout" icon={<Layout className="w-3.5 h-3.5" />}>
      {/* Position Layout */}
      <div className="control-group">
        <span className="control-label">Position</span>
        <select value={position} onChange={(e) => {
          setPosition(e.target.value);
          pushHistory({ ...getCurrentConfig(), position: e.target.value });
        }}>
          <option>Middle center</option>
          <option>Top center</option>
          <option>Bottom center</option>
          <option>Middle left</option>
          <option>Middle right</option>
        </select>
      </div>

      {/* Padding */}
      <div className="control-group">
        <div className="control-label-container">
          <span className="control-label">Padding</span>
          <span className="control-value">{padding}px</span>
        </div>
        <input 
          type="range" 
          min="0" 
          max="120" 
          value={padding} 
          onChange={(e) => setPadding(parseInt(e.target.value, 10))}
          onMouseUp={handleSliderRelease}
        />
      </div>

      {/* Scale */}
      <div className="control-group">
        <div className="control-label-container">
          <span className="control-label">Scale</span>
          <span className="control-value">{scale}%</span>
        </div>
        <input 
          type="range" 
          min="20" 
          max="100" 
          value={scale} 
          onChange={(e) => setScale(parseInt(e.target.value, 10))}
          onMouseUp={handleSliderRelease}
        />
      </div>

      {/* Inset Border (Inner Border) */}
      <div className="control-group">
        <div className="control-label-container">
          <span className="control-label">Inset Border</span>
          <button type="button" className="control-link" onClick={() => setShowAdvancedInset(!showAdvancedInset)}>
            {showAdvancedInset ? 'Hide' : 'Advanced'}
          </button>
        </div>
        <input 
          type="range" 
          min="0" 
          max="20" 
          value={inset} 
          onChange={(e) => setInset(parseInt(e.target.value, 10))}
          onMouseUp={handleSliderRelease}
        />
        {showAdvancedInset && (
          <div className="color-picker-row" style={{ marginTop: '0.25rem' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Color:</span>
            <input 
              type="color" 
              value={insetColor.startsWith('rgba') ? '#ffffff' : insetColor} 
              onChange={(e) => {
                setInsetColor(e.target.value);
                pushHistory({ ...getCurrentConfig(), insetColor: e.target.value });
              }} 
              className="color-swatch-picker"
            />
            <input 
              type="text" 
              value={insetColor} 
              onChange={(e) => {
                setInsetColor(e.target.value);
                pushHistory({ ...getCurrentConfig(), insetColor: e.target.value });
              }} 
              className="input-sm"
              style={{ flex: 1 }}
            />
          </div>
        )}
      </div>

      {/* Drop Shadow */}
      <div className="control-group">
        <div className="control-label-container">
          <span className="control-label">Shadow</span>
          <button type="button" className="control-link" onClick={() => setShowAdvancedShadow(!showAdvancedShadow)}>
            {showAdvancedShadow ? 'Hide' : 'Advanced'}
          </button>
        </div>
        <div className="switch-container" style={{ marginBottom: '0.25rem' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Shadow Enabled</span>
          <label className="switch">
            <input 
              type="checkbox" 
              checked={shadowEnabled} 
              onChange={(e) => {
                setShadowEnabled(e.target.checked);
                pushHistory({ ...getCurrentConfig(), shadowEnabled: e.target.checked });
              }} 
            />
            <span className="slider-switch"></span>
          </label>
        </div>
        <input 
          type="range" 
          min="0" 
          max="50" 
          value={shadow} 
          disabled={!shadowEnabled}
          onChange={(e) => setShadow(parseInt(e.target.value, 10))}
          onMouseUp={handleSliderRelease}
        />
        {showAdvancedShadow && (
          <div className="color-picker-row" style={{ marginTop: '0.25rem', opacity: shadowEnabled ? 1 : 0.5 }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Color:</span>
            <input 
              type="color" 
              value={shadowColor.startsWith('rgba') ? '#000000' : shadowColor} 
              disabled={!shadowEnabled}
              onChange={(e) => {
                setShadowColor(e.target.value);
                pushHistory({ ...getCurrentConfig(), shadowColor: e.target.value });
              }} 
              className="color-swatch-picker"
            />
            <input 
              type="text" 
              value={shadowColor} 
              disabled={!shadowEnabled}
              onChange={(e) => {
                setShadowColor(e.target.value);
                pushHistory({ ...getCurrentConfig(), shadowColor: e.target.value });
              }} 
              className="input-sm"
              style={{ flex: 1 }}
            />
          </div>
        )}
      </div>

      {/* Rounded Corner */}
      <div className="control-group">
        <div className="control-label-container">
          <span className="control-label">Rounded Corners</span>
          <span className="control-value">{rounded}px</span>
        </div>
        <input 
          type="range" 
          min="0" 
          max="40" 
          value={rounded} 
          onChange={(e) => setRounded(parseInt(e.target.value, 10))}
          onMouseUp={handleSliderRelease}
        />
      </div>

      {/* Border (Outer) */}
      <div className="control-group">
        <div className="control-label-container">
          <span className="control-label">Outer Border</span>
          <button type="button" className="control-link" onClick={() => setShowAdvancedBorder(!showAdvancedBorder)}>
            {showAdvancedBorder ? 'Hide' : 'Advanced'}
          </button>
        </div>
        <input 
          type="range" 
          min="0" 
          max="20" 
          value={border} 
          onChange={(e) => setBorder(parseInt(e.target.value, 10))}
          onMouseUp={handleSliderRelease}
        />
        {showAdvancedBorder && (
          <div className="color-picker-row" style={{ marginTop: '0.25rem' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Color:</span>
            <input 
              type="color" 
              value={borderColor} 
              onChange={(e) => {
                setBorderColor(e.target.value);
                pushHistory({ ...getCurrentConfig(), borderColor: e.target.value });
              }} 
              className="color-swatch-picker"
            />
            <input 
              type="text" 
              value={borderColor} 
              onChange={(e) => {
                setBorderColor(e.target.value);
                pushHistory({ ...getCurrentConfig(), borderColor: e.target.value });
              }} 
              className="input-sm"
              style={{ flex: 1 }}
            />
          </div>
        )}
      </div>
    </InspectorSection>
  );
}
