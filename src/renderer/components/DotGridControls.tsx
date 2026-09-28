import { useAppContext } from '../AppContext';
import {
  DOT_GRID_SHAPE_LABELS,
  DOT_GRID_SHAPE_OPTIONS,
  type DotGridParams,
} from '../shaders/shaderPresets';

export default function DotGridControls() {
  const {
    shaderType,
    shaderParams,
    setShaderParams,
    getCurrentConfig,
    pushHistory,
    handleSliderRelease,
  } = useAppContext();

  if (shaderType !== 'dotGrid') return null;

  const params = shaderParams as DotGridParams;

  const updateParam = <K extends keyof DotGridParams>(
    key: K,
    value: DotGridParams[K]
  ) => {
    const updated = { ...params, [key]: value };
    setShaderParams(updated);
  };

  return (
    <>
      <div className="control-group">
        <span className="control-label">Shape</span>
        <div className="btn-group" style={{ flexWrap: 'wrap' }}>
          {DOT_GRID_SHAPE_OPTIONS.map((s) => (
            <button
              key={s}
              className={`btn-group-item ${params.shape === s ? 'active' : ''}`}
              onClick={() => {
                updateParam('shape', s);
                pushHistory({ ...getCurrentConfig(), shaderParams: { ...params, shape: s } });
              }}
              style={{ padding: '0.25rem 0.5rem', fontSize: '0.7rem' }}
            >
              {DOT_GRID_SHAPE_LABELS[s]}
            </button>
          ))}
        </div>
      </div>

      <div className="control-group">
        <div className="control-label-container">
          <span className="control-label">Size</span>
          <span className="control-value">{params.size.toFixed(1)}px</span>
        </div>
        <input
          type="range" min="1" max="100" step="0.5"
          value={params.size}
          onChange={(e) => updateParam('size', parseFloat(e.target.value))}
          onMouseUp={handleSliderRelease}
        />
      </div>

      <div className="control-group">
        <div className="control-label-container">
          <span className="control-label">Gap X</span>
          <span className="control-value">{params.gapX.toFixed(0)}px</span>
        </div>
        <input
          type="range" min="2" max="500" step="1"
          value={params.gapX}
          onChange={(e) => updateParam('gapX', parseFloat(e.target.value))}
          onMouseUp={handleSliderRelease}
        />
      </div>

      <div className="control-group">
        <div className="control-label-container">
          <span className="control-label">Gap Y</span>
          <span className="control-value">{params.gapY.toFixed(0)}px</span>
        </div>
        <input
          type="range" min="2" max="500" step="1"
          value={params.gapY}
          onChange={(e) => updateParam('gapY', parseFloat(e.target.value))}
          onMouseUp={handleSliderRelease}
        />
      </div>

      <div className="control-group">
        <div className="control-label-container">
          <span className="control-label">Stroke Width</span>
          <span className="control-value">{params.strokeWidth.toFixed(1)}px</span>
        </div>
        <input
          type="range" min="0" max="50" step="0.5"
          value={params.strokeWidth}
          onChange={(e) => updateParam('strokeWidth', parseFloat(e.target.value))}
          onMouseUp={handleSliderRelease}
        />
      </div>

      <div className="control-group">
        <div className="control-label-container">
          <span className="control-label">Size Randomness</span>
          <span className="control-value">{(params.sizeRange * 100).toFixed(0)}%</span>
        </div>
        <input
          type="range" min="0" max="1" step="0.01"
          value={params.sizeRange}
          onChange={(e) => updateParam('sizeRange', parseFloat(e.target.value))}
          onMouseUp={handleSliderRelease}
        />
      </div>

      <div className="control-group">
        <div className="control-label-container">
          <span className="control-label">Opacity Randomness</span>
          <span className="control-value">{(params.opacityRange * 100).toFixed(0)}%</span>
        </div>
        <input
          type="range" min="0" max="1" step="0.01"
          value={params.opacityRange}
          onChange={(e) => updateParam('opacityRange', parseFloat(e.target.value))}
          onMouseUp={handleSliderRelease}
        />
      </div>

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
