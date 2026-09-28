import { useAppContext } from '../AppContext';
import InspectorSection from './InspectorSection';
import { Code } from 'lucide-react';
import { SUPPORTED_LANGUAGES } from '../utils/codeTokenizer';
import { CODE_THEMES } from '../utils/codeThemes';

function parseBreakpoints(raw: string): number[] {
  const parts = raw.split(/[,\s]+/).map(p => parseInt(p, 10));
  const valid = parts.filter(n => Number.isFinite(n) && n > 0);
  return Array.from(new Set(valid)).sort((a, b) => a - b);
}

export default function CodeStudioSettings() {
  const {
    codeStudioLanguage, setCodeStudioLanguage,
    codeStudioTheme, setCodeStudioTheme,
    codeStudioFontSize, setCodeStudioFontSize,
    codeStudioLineNumbers, setCodeStudioLineNumbers,
    codeStudioShowLanguage, setCodeStudioShowLanguage,
    codeStudioBreakpoints, setCodeStudioBreakpoints,
    codeStudioShowBreakpoints, setCodeStudioShowBreakpoints,
    getCurrentConfig, pushHistory, handleSliderRelease
  } = useAppContext();

  const breakpointsText = codeStudioBreakpoints.join(', ');

  return (
    <InspectorSection title="Code Studio" icon={<Code className="w-3.5 h-3.5" />} defaultOpen={true}>
      {/* Language */}
      <div className="control-group">
        <span className="control-label">Language</span>
        <select
          value={codeStudioLanguage}
          onChange={(e) => {
            const val = e.target.value;
            setCodeStudioLanguage(val);
            pushHistory({ ...getCurrentConfig(), codeStudioLanguage: val });
          }}
        >
          {SUPPORTED_LANGUAGES.map((lang) => (
            <option key={lang} value={lang}>
              {lang}
            </option>
          ))}
        </select>
      </div>

      {/* Code Theme */}
      <div className="control-group">
        <span className="control-label">Code Theme</span>
        <select
          value={codeStudioTheme}
          onChange={(e) => {
            const val = e.target.value;
            setCodeStudioTheme(val);
            pushHistory({ ...getCurrentConfig(), codeStudioTheme: val });
          }}
        >
          {CODE_THEMES.map((t) => (
            <option key={t.name} value={t.name}>
              {t.name}
            </option>
          ))}
        </select>
      </div>

      {/* Font Size */}
      <div className="control-group">
        <div className="control-label-container">
          <span className="control-label">Font Size</span>
          <span className="control-value">{codeStudioFontSize}px</span>
        </div>
        <input
          type="range"
          min="10"
          max="24"
          value={codeStudioFontSize}
          onChange={(e) => setCodeStudioFontSize(parseInt(e.target.value, 10))}
          onMouseUp={handleSliderRelease}
        />
      </div>

      {/* Breakpoints (line numbers) */}
      <div className="control-group">
        <div className="control-label-container">
          <span className="control-label">Breakpoints</span>
          <span className="control-value" style={{ fontSize: '0.7rem' }}>line numbers</span>
        </div>
        <input
          type="text"
          value={breakpointsText}
          placeholder="e.g. 1, 4, 7"
          onChange={(e) => {
            const parsed = parseBreakpoints(e.target.value);
            setCodeStudioBreakpoints(parsed);
            pushHistory({ ...getCurrentConfig(), codeStudioBreakpoints: parsed });
          }}
        />
      </div>

      {/* Show Line Numbers */}
      <div className="control-group">
        <div className="switch-container">
          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Line Numbers</span>
          <label className="switch">
            <input
              type="checkbox"
              checked={codeStudioLineNumbers}
              onChange={(e) => {
                const val = e.target.checked;
                setCodeStudioLineNumbers(val);
                pushHistory({ ...getCurrentConfig(), codeStudioLineNumbers: val });
              }}
            />
            <span className="slider-switch"></span>
          </label>
        </div>
      </div>

      {/* Show Breakpoints */}
      <div className="control-group">
        <div className="switch-container">
          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Show Breakpoints</span>
          <label className="switch">
            <input
              type="checkbox"
              checked={codeStudioShowBreakpoints}
              onChange={(e) => {
                const val = e.target.checked;
                setCodeStudioShowBreakpoints(val);
                pushHistory({ ...getCurrentConfig(), codeStudioShowBreakpoints: val });
              }}
            />
            <span className="slider-switch"></span>
          </label>
        </div>
      </div>

      {/* Show Language Pill */}
      <div className="control-group">
        <div className="switch-container">
          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Show Language Pill</span>
          <label className="switch">
            <input
              type="checkbox"
              checked={codeStudioShowLanguage}
              onChange={(e) => {
                const val = e.target.checked;
                setCodeStudioShowLanguage(val);
                pushHistory({ ...getCurrentConfig(), codeStudioShowLanguage: val });
              }}
            />
            <span className="slider-switch"></span>
          </label>
        </div>
      </div>
    </InspectorSection>
  );
}
