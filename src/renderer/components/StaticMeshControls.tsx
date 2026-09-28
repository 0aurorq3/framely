import { useAppContext } from '../AppContext';
import {
  type StaticMeshGradientParams,
} from '../shaders/shaderPresets';

export default function StaticMeshControls() {
  const {
    shaderType,
    shaderParams,
    setShaderParams,
    handleSliderRelease,
  } = useAppContext();

  if (shaderType !== 'staticMesh') return null;

  const params = shaderParams as StaticMeshGradientParams;

  const updateParam = <K extends keyof StaticMeshGradientParams>(
    key: K,
    value: StaticMeshGradientParams[K]
  ) => {
    const updated = { ...params, [key]: value };
    setShaderParams(updated);
  };

  return (
    <>
      <div className="control-group">
        <div className="control-label-container">
          <span className="control-label">Positions</span>
          <span className="control-value">{params.positions.toFixed(0)}</span>
        </div>
        <input
          type="range" min="0" max="100" step="1"
          value={params.positions}
          onChange={(e) => updateParam('positions', parseFloat(e.target.value))}
          onMouseUp={handleSliderRelease}
        />
      </div>

      <div className="control-group">
        <div className="control-label-container">
          <span className="control-label">Wave X</span>
          <span className="control-value">{(params.waveX * 100).toFixed(0)}%</span>
        </div>
        <input
          type="range" min="0" max="1" step="0.01"
          value={params.waveX}
          onChange={(e) => updateParam('waveX', parseFloat(e.target.value))}
          onMouseUp={handleSliderRelease}
        />
      </div>

      <div className="control-group">
        <div className="control-label-container">
          <span className="control-label">Wave X Shift</span>
          <span className="control-value">{(params.waveXShift ?? 0).toFixed(2)}</span>
        </div>
        <input
          type="range" min="0" max="1" step="0.01"
          value={params.waveXShift ?? 0}
          onChange={(e) => updateParam('waveXShift', parseFloat(e.target.value))}
          onMouseUp={handleSliderRelease}
        />
      </div>

      <div className="control-group">
        <div className="control-label-container">
          <span className="control-label">Wave Y</span>
          <span className="control-value">{(params.waveY * 100).toFixed(0)}%</span>
        </div>
        <input
          type="range" min="0" max="1" step="0.01"
          value={params.waveY}
          onChange={(e) => updateParam('waveY', parseFloat(e.target.value))}
          onMouseUp={handleSliderRelease}
        />
      </div>

      <div className="control-group">
        <div className="control-label-container">
          <span className="control-label">Wave Y Shift</span>
          <span className="control-value">{(params.waveYShift ?? 0).toFixed(2)}</span>
        </div>
        <input
          type="range" min="0" max="1" step="0.01"
          value={params.waveYShift ?? 0}
          onChange={(e) => updateParam('waveYShift', parseFloat(e.target.value))}
          onMouseUp={handleSliderRelease}
        />
      </div>

      <div className="control-group">
        <div className="control-label-container">
          <span className="control-label">Mixing</span>
          <span className="control-value">{(params.mixing * 100).toFixed(0)}%</span>
        </div>
        <input
          type="range" min="0" max="1" step="0.01"
          value={params.mixing}
          onChange={(e) => updateParam('mixing', parseFloat(e.target.value))}
          onMouseUp={handleSliderRelease}
        />
      </div>

      <div className="control-group">
        <div className="control-label-container">
          <span className="control-label">Grain Edge</span>
          <span className="control-value">{(params.grainMixer * 100).toFixed(0)}%</span>
        </div>
        <input
          type="range" min="0" max="1" step="0.01"
          value={params.grainMixer}
          onChange={(e) => updateParam('grainMixer', parseFloat(e.target.value))}
          onMouseUp={handleSliderRelease}
        />
      </div>

      <div className="control-group">
        <div className="control-label-container">
          <span className="control-label">Grain Overlay</span>
          <span className="control-value">{(params.grainOverlay * 100).toFixed(0)}%</span>
        </div>
        <input
          type="range" min="0" max="1" step="0.01"
          value={params.grainOverlay}
          onChange={(e) => updateParam('grainOverlay', parseFloat(e.target.value))}
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
