import { useAppContext } from '../AppContext';
import InspectorSection from './InspectorSection';
import { Sparkles } from 'lucide-react';
import FontSelector from './FontSelector';
import ColorSwatchPicker from './annotations/ColorSwatchPicker';
import { updateUserDefault } from '../utils/storageUtils';

export default function ExtraSettings() {
  const {
    chromeStyle, setChromeStyle,
    chromeTheme, setChromeTheme,
    annotationColor, setAnnotationColor,
    annotationStrokeWidth, setAnnotationStrokeWidth,
    annotations, setAnnotations,
    watermarkEnabled, setWatermarkEnabled,
    watermarkText, setWatermarkText,
    watermarkSize, setWatermarkSize,
    watermarkPosition, setWatermarkPosition,
    watermarkOpacity, setWatermarkOpacity,
    watermarkFont = 'sans-serif', setWatermarkFont,
    watermarkBold = false, setWatermarkBold,
    watermarkItalic = false, setWatermarkItalic,
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
    activeTool,
    systemFonts = [],
    getCurrentConfig, pushHistory, handleSliderRelease
  } = useAppContext();

  return (
    <InspectorSection title="Extras" icon={<Sparkles className="w-3.5 h-3.5" />}>
      {/* Browser Chrome Overlay */}
      <div className="control-group">
        <span className="control-label">Browser Mockup</span>
        <select value={chromeStyle} onChange={(e) => {
          setChromeStyle(e.target.value as any);
          pushHistory({ ...getCurrentConfig(), chromeStyle: e.target.value as any });
        }}>
          <option value="none">None</option>
          <option value="mac">macOS Style</option>
          <option value="windows">Windows Style</option>
        </select>

        {chromeStyle !== 'none' && (
          <div style={{ display: 'flex', gap: '1px', background: 'var(--border)', borderRadius: '6px', overflow: 'hidden', marginTop: '0.5rem' }}>
            <button 
              className="btn btn-secondary" 
              style={{ 
                flex: 1, 
                border: 'none', 
                borderRadius: '0', 
                backgroundColor: chromeTheme === 'dark' ? 'var(--accent)' : 'var(--surface-2)',
                color: chromeTheme === 'dark' ? 'var(--on-accent)' : 'var(--text-secondary)',
                height: '28px',
                padding: 0,
                fontSize: '0.8rem'
              }}
              onClick={() => {
                setChromeTheme('dark');
                pushHistory({ ...getCurrentConfig(), chromeTheme: 'dark' });
              }}
            >
              Dark Theme
            </button>
            <button 
              className="btn btn-secondary" 
              style={{ 
                flex: 1, 
                border: 'none', 
                borderRadius: '0', 
                backgroundColor: chromeTheme === 'light' ? 'var(--accent)' : 'var(--surface-2)',
                color: chromeTheme === 'light' ? 'var(--on-accent)' : 'var(--text-secondary)',
                height: '28px',
                padding: 0,
                fontSize: '0.8rem'
              }}
              onClick={() => {
                setChromeTheme('light');
                pushHistory({ ...getCurrentConfig(), chromeTheme: 'light' });
              }}
            >
              Light Theme
            </button>
          </div>
        )}
      </div>

      {/* Annotation Tools settings */}
      <div className="control-group">
        <span className="control-label">Annotation Style</span>
        <div className="color-picker-row">
          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Color:</span>
          <input 
            type="color" 
            value={annotationColor} 
            onChange={(e) => setAnnotationColor(e.target.value)} 
            className="color-swatch-picker"
          />
          <input 
            type="text" 
            value={annotationColor} 
            onChange={(e) => setAnnotationColor(e.target.value)} 
            className="input-sm"
            style={{ flex: 1 }}
          />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          <div className="control-label-container">
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Size</span>
            <span className="control-value">{annotationStrokeWidth}px</span>
          </div>
          <input 
            type="range" 
            min="2" 
            max="16" 
            value={annotationStrokeWidth} 
            onChange={(e) => setAnnotationStrokeWidth(parseInt(e.target.value, 10))}
          />
        </div>

        {/* Font style controls for text tool */}
        {activeTool === 'text' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.5rem', borderTop: '1px solid var(--border)', paddingTop: '0.5rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            <span className="control-label" style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Font Family</span>
            <FontSelector
              value={annotationFont}
              onChange={(val) => {
                setAnnotationFont(val);
                pushHistory({ ...getCurrentConfig(), annotationFont: val });
              }}
              systemFonts={systemFonts}
              styleType="sidebar"
            />
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', flex: 1 }}>
              <div className="control-label-container">
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Font Size</span>
                <span className="control-value">{annotationFontSize}px</span>
              </div>
              <input 
                type="range" 
                min="12" 
                max="124"
                value={annotationFontSize}
                onChange={(e) => {
                  setAnnotationFontSize(parseInt(e.target.value, 10));
                }}
                onMouseUp={handleSliderRelease}
              />
            </div>
            
            <div style={{ display: 'flex', gap: '4px', alignSelf: 'flex-end', height: '28px' }}>
              <button
                className={`btn btn-secondary ${annotationBold ? 'active' : ''}`}
                style={{
                  padding: '0 8px',
                  fontWeight: 'bold',
                  backgroundColor: annotationBold ? 'var(--accent)' : 'var(--surface-2)',
                  color: annotationBold ? 'var(--on-accent)' : 'var(--text-secondary)',
                  border: 'none',
                  borderRadius: '4px',
                }}
                onClick={() => {
                  setAnnotationBold(!annotationBold);
                  pushHistory({ ...getCurrentConfig(), annotationBold: !annotationBold });
                }}
                title="Bold"
              >
                B
              </button>
              <button
                className={`btn btn-secondary ${annotationItalic ? 'active' : ''}`}
                style={{
                  padding: '0 8px',
                  fontStyle: 'italic',
                  backgroundColor: annotationItalic ? 'var(--accent)' : 'var(--surface-2)',
                  color: annotationItalic ? 'var(--on-accent)' : 'var(--text-secondary)',
                  border: 'none',
                  borderRadius: '4px',
                }}
                onClick={() => {
                  setAnnotationItalic(!annotationItalic);
                  pushHistory({ ...getCurrentConfig(), annotationItalic: !annotationItalic });
                }}
                title="Italic"
              >
                I
              </button>
            </div>
          </div>

          {/* Text Outline controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem' }}>
            <label className="switch" style={{ flexShrink: 0 }}>
              <input
                type="checkbox"
                checked={annotationOutlineEnabled}
                onChange={(e) => {
                  setAnnotationOutlineEnabled(e.target.checked);
                  pushHistory({ ...getCurrentConfig(), annotationOutlineEnabled: e.target.checked });
                }}
              />
              <span className="slider" />
            </label>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Outline</span>
            <div style={{ position: 'relative', width: '28px', height: '28px', flexShrink: 0 }}>
              <button
                className="btn btn-secondary"
                style={{
                  width: '28px',
                  height: '28px',
                  padding: 0,
                  border: `1px solid ${annotationOutlineColor}`,
                  backgroundColor: 'var(--surface-2)',
                  borderRadius: '4px',
                  cursor: 'pointer',
                }}
                title="Outline Color"
              >
                <span style={{ display: 'block', width: '14px', height: '14px', borderRadius: '2px', background: annotationOutlineColor, margin: 'auto' }} />
              </button>
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
                style={{
                  position: 'absolute',
                  inset: 0,
                  width: '100%',
                  height: '100%',
                  opacity: 0,
                  cursor: 'pointer',
                }}
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', flex: 1 }}>
              <div className="control-label-container">
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Width</span>
                <span className="control-value">{annotationOutlineWidth}px</span>
              </div>
              <input
                type="range"
                min="1"
                max="20"
                value={annotationOutlineWidth}
                onChange={(e) => setAnnotationOutlineWidth(parseInt(e.target.value, 10))}
                onMouseUp={handleSliderRelease}
                disabled={!annotationOutlineEnabled}
                style={{ opacity: annotationOutlineEnabled ? 1 : 0.4 }}
              />
            </div>
          </div>

          {/* Text Gradient controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem' }}>
            <label className="switch" style={{ flexShrink: 0 }}>
              <input
                type="checkbox"
                checked={annotationGradientEnabled}
                onChange={(e) => {
                  setAnnotationGradientEnabled(e.target.checked);
                  pushHistory({ ...getCurrentConfig(), annotationGradientEnabled: e.target.checked });
                }}
              />
              <span className="slider" />
            </label>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Gradient</span>
            <ColorSwatchPicker
              value={annotationGradientColor1}
              onChange={(color) => {
                setAnnotationGradientColor1(color);
                pushHistory({ ...getCurrentConfig(), annotationGradientColor1: color });
              }}
              title="Gradient Start Color"
              styleType="sidebar"
            />
            <ColorSwatchPicker
              value={annotationGradientColor2}
              onChange={(color) => {
                setAnnotationGradientColor2(color);
                pushHistory({ ...getCurrentConfig(), annotationGradientColor2: color });
              }}
              title="Gradient End Color"
              styleType="sidebar"
            />
          </div>
          {annotationGradientEnabled && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              <div className="control-label-container">
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Gradient Angle</span>
                <span className="control-value">{annotationGradientAngle}°</span>
              </div>
              <input
                type="range"
                min="0"
                max="360"
                value={annotationGradientAngle}
                onChange={(e) => setAnnotationGradientAngle(parseInt(e.target.value, 10))}
                onMouseUp={handleSliderRelease}
              />
            </div>
          )}
        </div>
        )}

        {annotations.length > 0 && (
          <button 
            className="btn btn-secondary" 
            style={{ padding: '0.4rem', fontSize: '0.8rem', marginTop: '0.25rem' }} 
            onClick={() => {
              setAnnotations([]);
              pushHistory({ ...getCurrentConfig(), annotations: [] });
            }}
          >
            Clear Annotations
          </button>
        )}
      </div>

      {/* Watermark Section — brand default helps viral growth; one-click off */}
      <div className="control-group" style={{ paddingBottom: '2rem' }}>
        <div className="switch-container">
          <span className="control-label" title="Shown on exports by default. Turn off anytime — preference is saved.">
            Watermark
          </span>
          <label className="switch">
            <input 
              type="checkbox" 
              checked={watermarkEnabled} 
              onChange={(e) => {
                setWatermarkEnabled(e.target.checked);
                updateUserDefault('watermarkEnabled', e.target.checked);
                pushHistory({ ...getCurrentConfig(), watermarkEnabled: e.target.checked });
              }} 
            />
            <span className="slider-switch"></span>
          </label>
        </div>
        {!watermarkEnabled && (
          <p style={{ margin: '0.35rem 0 0', fontSize: '0.72rem', color: 'var(--text-tertiary)', lineHeight: 1.35 }}>
            Tip: a subtle &quot;Made with Framely&quot; badge can be enabled whenever you want attribution.
          </p>
        )}
        {watermarkEnabled && (
          <>
            <input 
              type="text" 
              placeholder="Watermark text..." 
              value={watermarkText} 
              onChange={(e) => {
                setWatermarkText(e.target.value);
              }}
              onBlur={() => pushHistory(getCurrentConfig())}
              style={{ marginTop: '0.5rem' }}
            />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', marginTop: '0.5rem' }}>
              <span className="control-label" style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Font Family</span>
              <div style={{ display: 'flex', gap: '4px' }}>
                <select 
                  value={watermarkFont} 
                  onChange={(e) => {
                    setWatermarkFont(e.target.value);
                    pushHistory({ ...getCurrentConfig(), watermarkFont: e.target.value });
                  }}
                  style={{ flex: 1 }}
                >
                  {systemFonts.map((f) => (
                    <option key={f} value={f}>{f}</option>
                  ))}
                </select>
                <button
                  className={`btn btn-secondary ${watermarkBold ? 'active' : ''}`}
                  style={{
                    padding: '0 8px',
                    fontWeight: 'bold',
                    backgroundColor: watermarkBold ? 'var(--accent)' : 'var(--surface-2)',
                    color: watermarkBold ? 'var(--on-accent)' : 'var(--text-secondary)',
                    border: 'none',
                    borderRadius: '4px',
                    height: '28px',
                  }}
                  onClick={() => {
                    setWatermarkBold(!watermarkBold);
                    pushHistory({ ...getCurrentConfig(), watermarkBold: !watermarkBold });
                  }}
                  title="Bold"
                >
                  B
                </button>
                <button
                  className={`btn btn-secondary ${watermarkItalic ? 'active' : ''}`}
                  style={{
                    padding: '0 8px',
                    fontStyle: 'italic',
                    backgroundColor: watermarkItalic ? 'var(--accent)' : 'var(--surface-2)',
                    color: watermarkItalic ? 'var(--on-accent)' : 'var(--text-secondary)',
                    border: 'none',
                    borderRadius: '4px',
                    height: '28px',
                  }}
                  onClick={() => {
                    setWatermarkItalic(!watermarkItalic);
                    pushHistory({ ...getCurrentConfig(), watermarkItalic: !watermarkItalic });
                  }}
                  title="Italic"
                >
                  I
                </button>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', marginTop: '0.5rem' }}>
              <span className="control-label" style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Position</span>
              <select 
                value={watermarkPosition} 
                onChange={(e) => {
                  const val = e.target.value as any;
                  setWatermarkPosition(val);
                  pushHistory({ ...getCurrentConfig(), watermarkPosition: val });
                }}
              >
                <option value="left">Bottom Left</option>
                <option value="middle">Bottom Center</option>
                <option value="right">Bottom Right</option>
                <option value="top left">Top Left</option>
                <option value="top middle">Top Center</option>
                <option value="top right">Top Right</option>
              </select>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', marginTop: '0.5rem' }}>
              <div className="control-label-container">
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Font Size</span>
                <span className="control-value">{watermarkSize}px</span>
              </div>
              <input 
                type="range" 
                min="10" 
                max="40" 
                value={watermarkSize} 
                onChange={(e) => setWatermarkSize(parseInt(e.target.value, 10))}
                onMouseUp={handleSliderRelease}
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', marginTop: '0.5rem' }}>
              <div className="control-label-container">
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Opacity</span>
                <span className="control-value">{Math.round(watermarkOpacity * 100)}%</span>
              </div>
              <input 
                type="range" 
                min="0" 
                max="100" 
                value={Math.round(watermarkOpacity * 100)} 
                onChange={(e) => setWatermarkOpacity(parseFloat(e.target.value) / 100)}
                onMouseUp={handleSliderRelease}
              />
            </div>
          </>
        )}
      </div>
    </InspectorSection>
  );
}
