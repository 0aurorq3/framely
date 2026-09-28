import { useState } from 'react';
import { useAppContext } from '../AppContext';
import { X } from 'lucide-react';
import logoUrl from '../../../assets/logo.svg';
import packageJson from '../../../package.json';

export default function HelpModal() {
  const { helpVisible, setHelpVisible } = useAppContext();
  const [copied, setCopied] = useState(false);

  if (!helpVisible) return null;

  const currentYear = new Date().getFullYear();
  const platformName = window.framelyAPI ? window.framelyAPI.platform : navigator.platform;
  
  const getVersions = () => {
    const apiVersions = window.framelyAPI?.versions;
    // If we have actual Electron version from API, use it
    if (apiVersions && apiVersions.electron && apiVersions.electron !== 'N/A') {
      return apiVersions;
    }
    
    // Fallback: Parse from userAgent if preload script is stale or running in browser
    const ua = navigator.userAgent;
    const electronMatch = ua.match(/Electron\/([\d.]+)/);
    const chromeMatch = ua.match(/Chrome\/([\d.]+)/);
    return {
      electron: electronMatch ? electronMatch[1] : 'N/A',
      chrome: chromeMatch ? chromeMatch[1] : 'N/A',
      node: apiVersions?.node || 'N/A',
      v8: apiVersions?.v8 || 'N/A'
    };
  };

  const versions = getVersions();
  const osInfo = window.framelyAPI?.osInfo || navigator.userAgent || 'Unknown OS';

  const handleCopy = () => {
    const textToCopy = [
      `Framely Version: ${packageJson.version}`,
      `Electron: ${versions.electron}`,
      `Chromium: ${versions.chrome}`,
      `Node.js: ${versions.node}`,
      `V8: ${versions.v8}`,
      `OS: ${osInfo}`
    ].join('\n');

    navigator.clipboard.writeText(textToCopy)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      })
      .catch((err) => {
        console.error('Failed to copy text: ', err);
      });
  };

  return (
    <div className="modal-overlay" onClick={() => setHelpVisible(false)}>
      <div
        className="modal-card"
        role="dialog"
        aria-modal="true"
        aria-label="Help"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '420px',
          display: 'flex',
          flexDirection: 'column',
          padding: '24px',
          position: 'relative',
        }}
      >
        {/* Close Button */}
        <button
          className="preset-delete-btn"
          onClick={() => setHelpVisible(false)}
          aria-label="Close help"
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            width: '28px',
            height: '28px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <X className="w-4 h-4" />
        </button>

        {/* Content Row: Logo on left, App name & Version info on right */}
        <div style={{ display: 'flex', gap: '20px', alignItems: 'center', marginBottom: '20px', marginTop: '8px' }}>
          <img src={logoUrl} alt="Framely Logo" style={{ width: '64px', height: '64px' }} />
          <div>
            <h2 className="modal-title" style={{ margin: 0, fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              Framely
            </h2>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
              Version {packageJson.version} ({platformName})
            </div>
          </div>
        </div>

        {/* Description */}
        <p style={{ margin: '0 0 16px 0', fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
          A privacy-first screenshot beautifier with adaptive aurora backgrounds, polished framing, and local export.
        </p>

        {/* System Specs List */}
        <div
          style={{
            background: 'var(--surface-2)',
            border: '1px solid var(--border)',
            borderRadius: '6px',
            padding: '12px',
            fontSize: '0.78rem',
            fontFamily: 'SFMono-Regular, Consolas, Liberation Mono, Menlo, monospace',
            color: 'var(--text-secondary)',
            display: 'flex',
            flexDirection: 'column',
            gap: '6px',
            marginBottom: '20px'
          }}
        >
          <div><strong>Framely Version:</strong> {packageJson.version}</div>
          <div><strong>Electron:</strong> {versions.electron}</div>
          <div><strong>Chromium:</strong> {versions.chrome}</div>
          <div><strong>Node.js:</strong> {versions.node}</div>
          <div><strong>V8:</strong> {versions.v8}</div>
          <div><strong>OS:</strong> {osInfo}</div>
        </div>

        {/* Footer info: Copyright and dynamic year */}
        <div
          style={{
            borderTop: '1px solid var(--border)',
            paddingTop: '16px',
            fontSize: '0.8rem',
            color: 'var(--text-tertiary)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <span>&copy; {currentYear} Framely contributors</span>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              className="btn btn-secondary"
              onClick={handleCopy}
              style={{ padding: '0 12px', height: '32px', fontSize: '0.8rem' }}
              title="Copy version info"
            >
              {copied ? 'Copied!' : 'Copy'}
            </button>
            <button className="btn btn-primary" onClick={() => setHelpVisible(false)} style={{ padding: '0 16px', height: '32px' }}>
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
