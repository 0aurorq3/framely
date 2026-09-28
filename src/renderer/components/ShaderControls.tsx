import { useAppContext } from '../AppContext';
import { Sparkles, Plus, Trash2 } from 'lucide-react';
import Tooltip from './Tooltip';
import {
  shaderPresets,
  DEFAULT_STATIC_MESH_PARAMS,
  DEFAULT_GRAIN_GRADIENT_PARAMS,
  DEFAULT_DOT_GRID_PARAMS,
  DEFAULT_PULSING_BORDER_PARAMS,
} from '../shaders/shaderPresets';
import StaticMeshControls from './StaticMeshControls';
import GrainGradientControls from './GrainGradientControls';
import DotGridControls from './DotGridControls';
import PulsingBorderControls from './PulsingBorderControls';

export default function ShaderControls() {
  const {
    shaderType, setShaderType,
    shaderColors, setShaderColors,
    setShaderParams,
    getCurrentConfig, pushHistory,
    handleSliderRelease,
  } = useAppContext();

  const applyPreset = (preset: typeof shaderPresets[0]) => {
    setShaderType(preset.type);
    setShaderColors(preset.colors);
    setShaderParams(preset.params);
    pushHistory({ ...getCurrentConfig(), shaderType: preset.type, shaderColors: preset.colors, shaderParams: preset.params });
  };

  const randomizeColors = () => {
    const colors = [
      '#ff5f6d', '#ffc371', '#00c6ff', '#7209b7',
      '#f43f5e', '#3b82f6', '#10b981', '#f59e0b',
      '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16',
    ];
    const shuffled = [...colors].sort(() => Math.random() - 0.5);
    const count = 3 + Math.floor(Math.random() * 3);
    setShaderColors(shuffled.slice(0, count));
    pushHistory({ ...getCurrentConfig(), shaderColors: shuffled.slice(0, count) });
  };

  const addColor = () => {
    if (shaderColors.length >= 10) return;
    const hex = '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
    const updated = [...shaderColors, hex];
    setShaderColors(updated);
    pushHistory({ ...getCurrentConfig(), shaderColors: updated });
  };

  const removeColor = (idx: number) => {
    if (shaderColors.length <= 2) return;
    const updated = shaderColors.filter((_, i) => i !== idx);
    setShaderColors(updated);
    pushHistory({ ...getCurrentConfig(), shaderColors: updated });
  };

  const updateColor = (idx: number, color: string) => {
    const updated = [...shaderColors];
    updated[idx] = color;
    setShaderColors(updated);
  };

  return (
    <>
      {/* Shader Type Selector */}
      <div className="control-group">
        <span className="control-label">Shader Style</span>
        <div className="btn-group">
          <button
            className={`btn-group-item ${shaderType === 'staticMesh' ? 'active' : ''}`}
            onClick={() => {
              setShaderType('staticMesh');
              setShaderParams(DEFAULT_STATIC_MESH_PARAMS);
              pushHistory({ ...getCurrentConfig(), shaderType: 'staticMesh', shaderParams: DEFAULT_STATIC_MESH_PARAMS });
            }}
          >
            Mesh
          </button>
          <button
            className={`btn-group-item ${shaderType === 'grainGradient' ? 'active' : ''}`}
            onClick={() => {
              setShaderType('grainGradient');
              setShaderParams(DEFAULT_GRAIN_GRADIENT_PARAMS);
              pushHistory({ ...getCurrentConfig(), shaderType: 'grainGradient', shaderParams: DEFAULT_GRAIN_GRADIENT_PARAMS });
            }}
          >
            Grain
          </button>
          <button
            className={`btn-group-item ${shaderType === 'dotGrid' ? 'active' : ''}`}
            onClick={() => {
              setShaderType('dotGrid');
              setShaderParams(DEFAULT_DOT_GRID_PARAMS);
              pushHistory({ ...getCurrentConfig(), shaderType: 'dotGrid', shaderParams: DEFAULT_DOT_GRID_PARAMS });
            }}
          >
            Dot Grid
          </button>
          <button
            className={`btn-group-item ${shaderType === 'pulsingBorder' ? 'active' : ''}`}
            onClick={() => {
              setShaderType('pulsingBorder');
              setShaderParams(DEFAULT_PULSING_BORDER_PARAMS);
              pushHistory({ ...getCurrentConfig(), shaderType: 'pulsingBorder', shaderParams: DEFAULT_PULSING_BORDER_PARAMS });
            }}
          >
            Border
          </button>
        </div>
      </div>

      {/* Presets */}
      <div className="control-group">
        <span className="control-label">Presets</span>
        <div className="preset-grid">
          {shaderPresets
            .filter((p) => p.type === shaderType)
            .map((preset) => (
              <Tooltip key={preset.id} position="top">
                <div
                  className={`preset-swatch ${preset.id === 'framely-aurora' ? 'featured-preset' : ''}`}
                  role="button"
                  tabIndex={0}
                  aria-label={`Apply ${preset.name} background`}
                  style={{
                    background: `linear-gradient(135deg, ${preset.colors.join(', ')})`,
                  }}
                  onClick={() => applyPreset(preset)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault();
                      applyPreset(preset);
                    }
                  }}
                  title={preset.name}
                />
              </Tooltip>
            ))}
        </div>
      </div>

      {/* Colors */}
      <div className="control-group">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
          <span className="control-label">Colors ({shaderColors.length})</span>
          <div style={{ display: 'flex', gap: '0.25rem' }}>
            <Tooltip position="top">
              <button
                className="btn btn-secondary btn-sm"
                onClick={randomizeColors}
                title="Randomize colors"
              >
                <Sparkles width={14} height={14} style={{ color: 'var(--accent)' }} />
              </button>
            </Tooltip>
            <Tooltip position="top">
              <button
                className="btn btn-secondary btn-sm"
                onClick={addColor}
                disabled={shaderColors.length >= 10}
                title="Add color"
              >
                <Plus width={14} height={14} />
              </button>
            </Tooltip>
          </div>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
          {shaderColors.map((color, idx) => (
            <div key={idx} style={{ position: 'relative' }}>
              <input
                type="color"
                value={color}
                onChange={(e) => updateColor(idx, e.target.value)}
                onMouseUp={handleSliderRelease}
                className="color-swatch-picker"
                style={{ width: '32px', height: '32px', cursor: 'pointer' }}
              />
              {shaderColors.length > 2 && (
                <button
                  onClick={() => removeColor(idx)}
                  style={{
                    position: 'absolute',
                    top: '-6px',
                    right: '-6px',
                    width: '16px',
                    height: '16px',
                    borderRadius: '50%',
                    background: 'var(--bg-tertiary)',
                    border: '1px solid var(--border)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: 0,
                  }}
                >
                  <Trash2 width={10} height={10} />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Parameter Subcomponents */}
      <StaticMeshControls />
      <GrainGradientControls />
      <DotGridControls />
      <PulsingBorderControls />
    </>
  );
}
