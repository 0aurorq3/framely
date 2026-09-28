import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Search, ChevronDown, Check, X } from 'lucide-react';
import { useAppContext } from '../AppContext';
import { platformPresets, PlatformPreset } from '../presetsData';

export default function PresetSelector() {
  const {
    setAspectRatio,
    setCanvasWidth,
    setCanvasHeight,
    selectedPreset,
    setSelectedPreset,
    getCurrentConfig,
    pushHistory,
  } = useAppContext();

  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const triggerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  // Ref (not state) so position is available synchronously during the render that shows the dropdown
  const posRef = useRef({ top: 0, left: 0, width: 0 });

  const calcPos = () => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    posRef.current = { top: rect.bottom + 6, left: rect.left, width: rect.width };
  };

  // Close on outside click — must check both trigger and portaled dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;
      const inTrigger = triggerRef.current?.contains(target);
      const inDropdown = dropdownRef.current?.contains(target);
      if (!inTrigger && !inDropdown) setIsOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Focus search on open
  useEffect(() => {
    if (isOpen && searchInputRef.current) searchInputRef.current.focus();
  }, [isOpen]);

  const handleSelect = (preset: PlatformPreset) => {
    const presetKey = `${preset.platform} - ${preset.name}`;
    setAspectRatio('Custom');
    setCanvasWidth(preset.width);
    setCanvasHeight(preset.height);
    setSelectedPreset(presetKey);
    setIsOpen(false);
    pushHistory({
      ...getCurrentConfig(),
      aspectRatio: 'Custom',
      canvasWidth: preset.width,
      canvasHeight: preset.height,
      selectedPreset: presetKey,
    });
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedPreset('');
    setAspectRatio('Auto');
    pushHistory({ ...getCurrentConfig(), aspectRatio: 'Auto', selectedPreset: '' });
  };

  const filteredPresets = platformPresets.filter((preset) => {
    const words = searchQuery.toLowerCase().split(/\s+/).filter(Boolean);
    if (words.length === 0) return true;
    return words.every((word) =>
      preset.platform.toLowerCase().includes(word) ||
      preset.name.toLowerCase().includes(word) ||
      preset.note.toLowerCase().includes(word) ||
      `${preset.width}x${preset.height}`.includes(word) ||
      `${preset.width} × ${preset.height}`.includes(word) ||
      preset.ratio.includes(word)
    );
  });

  const activePreset = platformPresets.find(
    (p) => `${p.platform} - ${p.name}` === selectedPreset
  );

  const dropdown = (
    <div
      ref={dropdownRef}
      className="preset-dropdown-menu"
      style={{ top: posRef.current.top, left: posRef.current.left, width: posRef.current.width }}
    >
      <div className="preset-search-wrapper">
        <Search className="preset-search-icon w-4 h-4" />
        <input
          ref={searchInputRef}
          type="text"
          className="preset-search-input"
          placeholder="Search platforms, assets or sizes..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        {searchQuery && (
          <button type="button" className="preset-search-clear" onClick={() => setSearchQuery('')}>
            <X className="w-3 h-3" />
          </button>
        )}
      </div>

      <div className="preset-list">
        {filteredPresets.length > 0 ? (
          filteredPresets.map((preset) => {
            const presetKey = `${preset.platform} - ${preset.name}`;
            const isSelected = selectedPreset === presetKey;
            return (
              <div
                key={presetKey}
                className={`preset-item ${isSelected ? 'selected' : ''}`}
                onClick={() => handleSelect(preset)}
                title={preset.note}
              >
                <div className="preset-item-left">
                  <span className="preset-item-name">
                    {preset.platform !== 'Universal' && (
                      <span style={{ color: 'var(--text-secondary)', marginRight: '6px', fontSize: '0.8rem', fontWeight: 'normal' }}>
                        {preset.platform} -
                      </span>
                    )}
                    <span>{preset.name}</span>
                  </span>
                </div>
                <div className="preset-item-right">
                  <span className="preset-item-dims" style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    {preset.width} × {preset.height} px
                  </span>
                  {isSelected && <Check className="preset-check-icon w-4 h-4" />}
                </div>
              </div>
            );
          })
        ) : (
          <div className="preset-no-results">No matching presets found</div>
        )}
      </div>
    </div>
  );

  return (
    <div className="preset-selector-container">
      <div
        ref={triggerRef}
        className={`preset-selector-trigger ${isOpen ? 'open' : ''} ${activePreset ? 'has-value' : ''}`}
        onClick={() => {
          calcPos(); // sync: posRef is updated before setIsOpen re-render
          setIsOpen((v) => !v);
        }}
      >
        <div className="preset-trigger-content">
          {activePreset ? (
            <div className="active-preset-display">
              <span className="preset-trigger-platform">{activePreset.platform}</span>
              <span className="preset-trigger-separator">/</span>
              <span className="preset-trigger-name">{activePreset.name}</span>
              <span className="preset-trigger-dims">({activePreset.width}×{activePreset.height})</span>
            </div>
          ) : (
            <span className="preset-trigger-placeholder">Select platform preset...</span>
          )}
        </div>

        <div className="preset-trigger-actions">
          {activePreset && (
            <button type="button" className="preset-clear-btn" onClick={handleClear} title="Clear preset selection">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
          <ChevronDown className={`preset-chevron ${isOpen ? 'rotated' : ''} w-4 h-4`} />
        </div>
      </div>

      {isOpen && createPortal(dropdown, document.body)}
    </div>
  );
}
