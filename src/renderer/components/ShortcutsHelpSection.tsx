import React from 'react';
import { Keyboard } from 'lucide-react';
import { getModKeyLabel } from '../utils/shortcutLabels';
import { registerSettingsSection } from '../utils/settingsRegistry';

const SHORTCUTS = [
  { label: 'Paste Image', keys: 'ctrl v alt' },
  { label: 'Undo / Redo', keys: 'ctrl z y' },
  { label: 'Export image', keys: 'mod s export save' },
  { label: 'Toggle Code Studio', keys: 'mod shift c code studio' },
  { label: 'Copy Annotation', keys: 'mod c copy annotation' },
  { label: 'Cut Annotation', keys: 'mod x cut annotation' },
  { label: 'Paste Annotation', keys: 'mod v paste annotation' },
  { label: 'Delete Annotation', keys: 'delete backspace annotation' },
];

const TOOLBAR_SHORTCUTS = [
  { label: 'Select / Move', keys: 'v 1 select move' },
  { label: 'Rectangle (Outline / Filled)', keys: 'r f 2 3 rectangle outline filled' },
  { label: 'Circle (Outline / Filled)', keys: 'c o 4 5 circle outline filled' },
  { label: 'Straight Line / Arrow', keys: 'l a 6 7 line arrow straight' },
  { label: 'Blur selected area', keys: 'b blur area' },
  { label: 'Draw Text / Freehand Pen', keys: 't p d 8 9 text freehand pen draw' },
  { label: 'Add Emoji', keys: 'e 0 emoji' },
];

registerSettingsSection({ tab: 'shortcuts', label: 'Keyboard Shortcuts', keywords: 'keyboard shortcut paste undo redo save delete export toggle code studio select move rectangle circle line arrow blur text pen emoji copy cut annotation' });

export default function ShortcutsHelpSection({ searchQuery = '' }: { searchQuery?: string }) {
  const q = searchQuery.toLowerCase();
  const matchItem = (text: string) => !q || text.toLowerCase().includes(q);
  const filteredShortcuts = SHORTCUTS.filter(s => matchItem(s.label) || matchItem(s.keys));
  const filteredToolbar = TOOLBAR_SHORTCUTS.filter(s => matchItem(s.label) || matchItem(s.keys));
  const showShortcuts = filteredShortcuts.length > 0 || filteredToolbar.length > 0;
  if (!showShortcuts) {
    return <div className="settings-no-results">No settings match "{searchQuery}"</div>;
  }

  return (
    <>
      {showShortcuts && (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <h3 style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-tertiary)', margin: '0 0 4px 0', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Keyboard className="w-3.5 h-3.5" /> Keyboard Shortcuts
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.8rem', background: 'var(--surface-2)', padding: '10px', borderRadius: '6px', border: '1px solid var(--border)' }}>
          {filteredShortcuts.map((s, i) => (
            <React.Fragment key={s.label}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: 'var(--text-secondary)' }}>{s.label}</span>
                {s.label === 'Paste Image' && <div><kbd>{getModKeyLabel()}</kbd> <kbd>V</kbd> or <kbd>{getModKeyLabel()}</kbd> <kbd>Alt</kbd> <kbd>V</kbd></div>}
                {s.label === 'Undo / Redo' && <div><kbd>{getModKeyLabel()}</kbd> <kbd>Z</kbd> / <kbd>{getModKeyLabel()}</kbd> <kbd>Y</kbd></div>}
                {s.label === 'Export image' && <div><kbd>{getModKeyLabel()}</kbd> <kbd>S</kbd></div>}
                {s.label === 'Toggle Code Studio' && <div><kbd>{getModKeyLabel()}</kbd> <kbd>Shift</kbd> <kbd>C</kbd></div>}
                {s.label === 'Copy Annotation' && <div><kbd>{getModKeyLabel()}</kbd> <kbd>C</kbd></div>}
                {s.label === 'Cut Annotation' && <div><kbd>{getModKeyLabel()}</kbd> <kbd>X</kbd></div>}
                {s.label === 'Paste Annotation' && <div><kbd>{getModKeyLabel()}</kbd> <kbd>V</kbd></div>}
                {s.label === 'Delete Annotation' && <div><kbd>Delete</kbd> or <kbd>Backspace</kbd></div>}
              </div>
              {i === filteredShortcuts.length - 1 && filteredToolbar.length > 0 && (
                <div style={{ borderTop: '1px solid var(--border)', margin: '6px 0', paddingTop: '6px' }} />
              )}
            </React.Fragment>
          ))}
          {filteredToolbar.length > 0 && (
            <>
              <div style={{ fontWeight: 600, fontSize: '0.75rem', color: 'var(--text-tertiary)', marginBottom: '2px', textTransform: 'uppercase', letterSpacing: '0.03em' }}>Toolbar Shortcuts</div>
              {filteredToolbar.map(s => (
                <div key={s.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>{s.label}</span>
                  {s.label === 'Select / Move' && <div><kbd>V</kbd> or <kbd>1</kbd></div>}
                  {s.label === 'Rectangle (Outline / Filled)' && <div><kbd>R</kbd> (<kbd>Shift+R</kbd> / <kbd>F</kbd> for Filled) or <kbd>2</kbd> / <kbd>3</kbd></div>}
                  {s.label === 'Circle (Outline / Filled)' && <div><kbd>C</kbd> / <kbd>O</kbd> (<kbd>Shift+C</kbd> / <kbd>Shift+O</kbd> for Filled) or <kbd>4</kbd> / <kbd>5</kbd></div>}
                  {s.label === 'Straight Line / Arrow' && <div><kbd>L</kbd> / <kbd>A</kbd> or <kbd>6</kbd> / <kbd>7</kbd></div>}
                  {s.label === 'Blur selected area' && <div><kbd>B</kbd> (Edit mode)</div>}
                  {s.label === 'Draw Text / Freehand Pen' && <div><kbd>T</kbd> / <kbd>P</kbd> / <kbd>D</kbd> or <kbd>8</kbd> / <kbd>9</kbd></div>}
                  {s.label === 'Add Emoji' && <div><kbd>E</kbd> or <kbd>0</kbd></div>}
                </div>
              ))}
            </>
          )}
        </div>
      </div>
      )}

    </>
  );
}
