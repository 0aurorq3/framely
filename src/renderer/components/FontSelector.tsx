import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Search, ChevronDown, Check, X } from 'lucide-react';
import { useAppContext } from '../AppContext';
import './FontSelector.css';

interface FontSelectorProps {
  value: string;
  onChange: (value: string) => void;
  systemFonts: string[];
  triggerWidth?: string;
  styleType?: 'toolbar' | 'sidebar';
}

export default function FontSelector({
  value,
  onChange,
  systemFonts,
  triggerWidth = '120px',
  styleType = 'toolbar',
}: FontSelectorProps) {
  const { setPreviewFont } = useAppContext();
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const triggerRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const posRef = useRef({ top: 0, left: 0, width: 0 });

  const calcPos = () => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    posRef.current = {
      top: rect.bottom + 6,
      left: rect.left,
      width: Math.max(160, rect.width),
    };
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;
      const inTrigger = triggerRef.current?.contains(target);
      const inDropdown = dropdownRef.current?.contains(target);
      if (!inTrigger && !inDropdown) {
        setIsOpen(false);
        setPreviewFont(null);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [setPreviewFont]);

  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  const handleSelect = (font: string) => {
    onChange(font);
    setPreviewFont(null);
    setIsOpen(false);
  };

  const filteredFonts = systemFonts.filter((f) =>
    f.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const dropdown = (
    <div
      ref={dropdownRef}
      className="font-dropdown-menu"
      style={{
        top: posRef.current.top,
        left: posRef.current.left,
        width: posRef.current.width,
      }}
      onMouseLeave={() => setPreviewFont(null)}
    >
      <div className="font-search-wrapper">
        <Search className="font-search-icon w-3.5 h-3.5" />
        <input
          ref={searchInputRef}
          type="text"
          className="font-search-input"
          placeholder="Search fonts..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        {searchQuery && (
          <button
            type="button"
            className="font-search-clear"
            onClick={() => setSearchQuery('')}
          >
            <X className="w-3 h-3" />
          </button>
        )}
      </div>

      <div className="font-list">
        {filteredFonts.length > 0 ? (
          filteredFonts.map((font) => {
            const isSelected = value === font;
            return (
              <div
                key={font}
                className={`font-item ${isSelected ? 'selected' : ''}`}
                onClick={() => handleSelect(font)}
                onMouseEnter={() => setPreviewFont(font)}
                style={{ fontFamily: font }}
              >
                <span className="font-item-name">{font}</span>
                {isSelected && <Check className="font-check-icon w-3.5 h-3.5" />}
              </div>
            );
          })
        ) : (
          <div className="font-no-results">No fonts found</div>
        )}
      </div>
    </div>
  );

  const buttonStyle: React.CSSProperties =
    styleType === 'toolbar'
      ? {
          fontSize: '0.75rem',
          background: 'var(--surface-2)',
          border: '1px solid var(--border)',
          borderRadius: '4px',
          color: 'var(--text-primary)',
          padding: '2px 8px 2px 6px',
          width: triggerWidth,
          textAlign: 'left',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          outline: 'none',
          height: '22px',
        }
      : {
          width: '100%',
          height: '34px',
          backgroundColor: 'var(--surface-2)',
          border: '1px solid var(--border-strong)',
          borderRadius: 'var(--radius-sm)',
          padding: '0 0.7rem',
          color: 'var(--text-primary)',
          fontFamily: 'var(--font-sans)',
          fontSize: 'var(--fs-body)',
          textAlign: 'left',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          outline: 'none',
        };

  return (
    <div className="font-selector-container" style={{ position: 'relative', display: 'inline-block', width: styleType === 'sidebar' ? '100%' : 'auto' }}>
      <button
        type="button"
        ref={triggerRef}
        className={`font-selector-trigger ${isOpen ? 'open' : ''}`}
        style={buttonStyle}
        onClick={() => {
          calcPos();
          setIsOpen((v) => !v);
          if (isOpen) {
            setPreviewFont(null);
          }
        }}
      >
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1, fontFamily: value }}>
          {value}
        </span>
        <ChevronDown className="w-3.5 h-3.5" style={{ marginLeft: '4px', flexShrink: 0, opacity: 0.7 }} />
      </button>

      {isOpen && createPortal(dropdown, document.body)}
    </div>
  );
}
