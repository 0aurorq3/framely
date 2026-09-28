import { useAppContext } from '../AppContext';
import {
  SHAPE_LABELS,
  SHAPE_OPTIONS,
  type GrainGradientParams,
} from '../shaders/shaderPresets';

export default function GrainGradientControls() {
  const {
    shaderType,
    shaderParams,
    setShaderParams,
    getCurrentConfig,
    pushHistory,
    handleSliderRelease,
  } = useAppContext();

  if (shaderType !== 'grainGradient') return null;

  const params = shaderParams as GrainGradientParams;

  const updateParam = <K extends keyof GrainGradientParams>(
    key: K,
    value: GrainGradientParams[K]
  ) => {
    const updated = { ...params, [key]: value };
    setShaderParams(updated);
  };

  return (
    <>
      <div className="control-group">
        <span className="control-label">Shape</span>
        <div className="btn-group" style={{ flexWrap: 'wrap' }}>
          {SHAPE_OPTIONS.map((s) => (
            <button
              key={s}
              className={`btn-group-item ${params.shape === s ? 'active' : ''}`}
              onClick={() => {
                updateParam('shape', s);
                pushHistory({ ...getCurrentConfig(), shaderParams: { ...params, shape: s } });
              }}
              style={{ padding: '0.25rem 0.5rem', fontSize: '0.7rem' }}
            >
              {SHAPE_LABELS[s]}
            </button>
          ))}
        </div>
      </div>

      <div className="control-group">
        <div className="control-label-container">
          <span className="control-label">Softness</span>
          <span className="control-value">{(params.softness * 100).toFixed(0)}%</span>
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
          <span className="control-value">{(params.intensity * 100).toFixed(0)}%</span>
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
          <span className="control-label">Noise</span>
          <span className="control-value">{(params.noise * 100).toFixed(0)}%</span>
        </div>
        <input
          type="range" min="0" max="1" step="0.01"
          value={params.noise}
          onChange={(e) => updateParam('noise', parseFloat(e.target.value))}
          onMouseUp={handleSliderRelease}
        />
      </div>
    </>
  );
}
