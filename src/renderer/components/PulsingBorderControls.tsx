import { useAppContext } from '../AppContext';
import {
  PULSING_BORDER_ASPECT_RATIO_LABELS,
  PULSING_BORDER_ASPECT_RATIO_OPTIONS,
  type PulsingBorderParams,
} from '../shaders/shaderPresets';

export default function PulsingBorderControls() {
  const {
    shaderType,
    shaderParams,
    setShaderParams,
    getCurrentConfig,
    pushHistory,
    handleSliderRelease,
  } = useAppContext();

  if (shaderType !== 'pulsingBorder') return null;

  const params = shaderParams as PulsingBorderParams;

  const updateParam = <K extends keyof PulsingBorderParams>(
    key: K,
    value: PulsingBorderParams[K]
  ) => {
    const updated = { ...params, [key]: value };
    setShaderParams(updated);
  };

  return (
    <>
      <div className="control-group">
        <span className="control-label">Background</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <input
            type="color"
            value={(params.colorBack ?? '#000000').slice(0, 7)}
            onChange={(e) => updateParam('colorBack', e.target.value)}
            onMouseUp={handleSliderRelease}
            className="color-swatch-picker"
            style={{ width: '32px', height: '32px', cursor: 'pointer' }}
          />
          <span className="control-value">{params.colorBack ?? '#000000'}</span>
        </div>
      </div>

      <div className="control-group">
        <span className="control-label">Aspect Ratio</span>
        <div className="btn-group" style={{ flexWrap: 'wrap' }}>
          {PULSING_BORDER_ASPECT_RATIO_OPTIONS.map((a) => (
            <button
              key={a}
              className={`btn-group-item ${params.aspectRatio === a ? 'active' : ''}`}
              onClick={() => {
                updateParam('aspectRatio', a);
                pushHistory({ ...getCurrentConfig(), shaderParams: { ...params, aspectRatio: a } });
              }}
              style={{ padding: '0.25rem 0.5rem', fontSize: '0.7rem' }}
            >
              {PULSING_BORDER_ASPECT_RATIO_LABELS[a]}
            </button>
          ))}
        </div>
      </div>

      <div className="control-group">
        <div className="control-label-container">
          <span className="control-label">Roundness</span>
          <span className="control-value">{params.roundness.toFixed(2)}</span>
        </div>
        <input
          type="range" min="0" max="1" step="0.01"
          value={params.roundness}
          onChange={(e) => updateParam('roundness', parseFloat(e.target.value))}
          onMouseUp={handleSliderRelease}
        />
      </div>

      <div className="control-group">
        <div className="control-label-container">
          <span className="control-label">Thickness</span>
          <span className="control-value">{params.thickness.toFixed(2)}</span>
        </div>
        <input
          type="range" min="0" max="1" step="0.01"
          value={params.thickness}
          onChange={(e) => updateParam('thickness', parseFloat(e.target.value))}
          onMouseUp={handleSliderRelease}
        />
      </div>

      <div className="control-group">
        <div className="control-label-container">
          <span className="control-label">Softness</span>
          <span className="control-value">{params.softness.toFixed(2)}</span>
        </div>
        <input
          type="range" min="0" max="1" step="0.01"
          value={params.softness}
          onChange={(e) => updateParam('softness', parseFloat(e.target.value))}
          onMouseUp={handleSliderRelease}
        />
      </div>

      <div className="control-group">
        <div className="control-label-container">
          <span className="control-label">Intensity</span>
          <span className="control-value">{params.intensity.toFixed(2)}</span>
        </div>
        <input
          type="range" min="0" max="1" step="0.01"
          value={params.intensity}
          onChange={(e) => updateParam('intensity', parseFloat(e.target.value))}
          onMouseUp={handleSliderRelease}
        />
      </div>

      <div className="control-group">
        <div className="control-label-container">
          <span className="control-label">Bloom</span>
          <span className="control-value">{params.bloom.toFixed(2)}</span>
        </div>
        <input
          type="range" min="0" max="1" step="0.01"
          value={params.bloom}
          onChange={(e) => updateParam('bloom', parseFloat(e.target.value))}
          onMouseUp={handleSliderRelease}
        />
      </div>

      <div className="control-group">
        <div className="control-label-container">
          <span className="control-label">Spots</span>
          <span className="control-value">{params.spots}</span>
        </div>
        <input
          type="range" min="1" max="20" step="1"
          value={params.spots}
          onChange={(e) => updateParam('spots', parseInt(e.target.value))}
          onMouseUp={handleSliderRelease}
        />
      </div>

      <div className="control-group">
        <div className="control-label-container">
          <span className="control-label">Spot Size</span>
          <span className="control-value">{params.spotSize.toFixed(2)}</span>
        </div>
        <input
          type="range" min="0" max="1" step="0.01"
          value={params.spotSize}
          onChange={(e) => updateParam('spotSize', parseFloat(e.target.value))}
          onMouseUp={handleSliderRelease}
        />
      </div>

      <div className="control-group">
        <div className="control-label-container">
          <span className="control-label">Pulse</span>
          <span className="control-value">{params.pulse.toFixed(2)}</span>
        </div>
        <input
          type="range" min="0" max="1" step="0.01"
          value={params.pulse}
          onChange={(e) => updateParam('pulse', parseFloat(e.target.value))}
          onMouseUp={handleSliderRelease}
        />
      </div>

      <div className="control-group">
        <div className="control-label-container">
          <span className="control-label">Smoke</span>
          <span className="control-value">{params.smoke.toFixed(2)}</span>
        </div>
        <input
          type="range" min="0" max="1" step="0.01"
          value={params.smoke}
          onChange={(e) => updateParam('smoke', parseFloat(e.target.value))}
          onMouseUp={handleSliderRelease}
        />
      </div>

      <div className="control-group">
        <div className="control-label-container">
          <span className="control-label">Smoke Size</span>
          <span className="control-value">{params.smokeSize.toFixed(2)}</span>
        </div>
        <input
          type="range" min="0" max="1" step="0.01"
          value={params.smokeSize}
          onChange={(e) => updateParam('smokeSize', parseFloat(e.target.value))}
          onMouseUp={handleSliderRelease}
        />
      </div>

      {/* Margins */}
      <div className="control-group">
        <div className="control-label-container">
          <span className="control-label">Margin Left</span>
          <span className="control-value">{params.marginLeft.toFixed(2)}</span>
        </div>
        <input
          type="range" min="0" max="1" step="0.01"
          value={params.marginLeft}
          onChange={(e) => updateParam('marginLeft', parseFloat(e.target.value))}
          onMouseUp={handleSliderRelease}
        />
      </div>

      <div className="control-group">
        <div className="control-label-container">
          <span className="control-label">Margin Right</span>
          <span className="control-value">{params.marginRight.toFixed(2)}</span>
        </div>
        <input
          type="range" min="0" max="1" step="0.01"
          value={params.marginRight}
          onChange={(e) => updateParam('marginRight', parseFloat(e.target.value))}
          onMouseUp={handleSliderRelease}
        />
      </div>

      <div className="control-group">
        <div className="control-label-container">
          <span className="control-label">Margin Top</span>
          <span className="control-value">{params.marginTop.toFixed(2)}</span>
        </div>
        <input
          type="range" min="0" max="1" step="0.01"
          value={params.marginTop}
          onChange={(e) => updateParam('marginTop', parseFloat(e.target.value))}
          onMouseUp={handleSliderRelease}
        />
      </div>

      <div className="control-group">
        <div className="control-label-container">
          <span className="control-label">Margin Bottom</span>
          <span className="control-value">{params.marginBottom.toFixed(2)}</span>
        </div>
        <input
          type="range" min="0" max="1" step="0.01"
          value={params.marginBottom}
          onChange={(e) => updateParam('marginBottom', parseFloat(e.target.value))}
          onMouseUp={handleSliderRelease}
        />
      </div>

      {/* Transforms */}
      <div className="control-group">
        <div className="control-label-container">
          <span className="control-label">Scale</span>
          <span className="control-value">{(params.scale ?? 1).toFixed(2)}</span>
        </div>
        <input
          type="range" min="0.01" max="4" step="0.01"
          value={params.scale ?? 1}
          onChange={(e) => updateParam('scale', parseFloat(e.target.value))}
          onMouseUp={handleSliderRelease}
        />
      </div>

      <div className="control-group">
        <div className="control-label-container">
          <span className="control-label">Rotation</span>
          <span className="control-value">{(params.rotation ?? 0).toFixed(0)}°</span>
        </div>
        <input
          type="range" min="0" max="360" step="1"
          value={params.rotation ?? 0}
          onChange={(e) => updateParam('rotation', parseFloat(e.target.value))}
          onMouseUp={handleSliderRelease}
        />
      </div>

      <div className="control-group">
        <div className="control-label-container">
          <span className="control-label">Offset X</span>
          <span className="control-value">{(params.offsetX ?? 0).toFixed(2)}</span>
        </div>
        <input
          type="range" min="-1" max="1" step="0.01"
          value={params.offsetX ?? 0}
          onChange={(e) => updateParam('offsetX', parseFloat(e.target.value))}
          onMouseUp={handleSliderRelease}
        />
      </div>

      <div className="control-group">
        <div className="control-label-container">
          <span className="control-label">Offset Y</span>
          <span className="control-value">{(params.offsetY ?? 0).toFixed(2)}</span>
        </div>
        <input
          type="range" min="-1" max="1" step="0.01"
          value={params.offsetY ?? 0}
          onChange={(e) => updateParam('offsetY', parseFloat(e.target.value))}
          onMouseUp={handleSliderRelease}
        />
      </div>
    </>
  );
}
