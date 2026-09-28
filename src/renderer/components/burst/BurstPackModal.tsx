import { useState, useEffect } from 'react';
import { X, Layers, FolderOpen, CheckCircle2, ClipboardCopy, Rocket } from 'lucide-react';
import { useBurstPackContext } from '../../contexts/BurstPackContext';
import { useAppContext } from '../../AppContext';
import { resolvePresetKeys } from '../../../shared/burstPacks';
import { getShareCaption, buildShareIntentUrl } from '../../utils/shareCaptions';
import BurstPackPackList from './BurstPackPackList';
import BurstPackProgress from './BurstPackProgress';
import './BurstPack.css';

export default function BurstPackModal() {
  const { modalOpen, closeModal, phase, progress, saveBurstPack, lastResult } = useBurstPackContext();
  const { documentName, showToast } = useAppContext();
  const [selectedPackId, setSelectedPackId] = useState<string | null>('launch-kit');
  const [customKeys, setCustomKeys] = useState<string[]>([]);
  const busy = phase === 'rendering' || phase === 'saving';
  const showDone = phase === 'done' && lastResult;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !busy) closeModal();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [closeModal, busy]);

  if (!modalOpen) return null;

  const presetCount = resolvePresetKeys(selectedPackId, customKeys).length;

  const handleToggleCustom = (presetKey: string) => {
    setSelectedPackId(null);
    setCustomKeys((prev) =>
      prev.includes(presetKey) ? prev.filter((k) => k !== presetKey) : [...prev, presetKey]
    );
  };

  const handleSave = async () => {
    await saveBurstPack(selectedPackId, customKeys);
  };

  const openPath = async (filePath: string) => {
    if (window.framelyAPI?.openInExplorer) {
      await window.framelyAPI.openInExplorer(filePath);
    }
  };

  const copyText = async (text: string, toastMsg: string) => {
    try {
      if (window.framelyAPI?.copyTextToClipboard) {
        await window.framelyAPI.copyTextToClipboard(text);
      } else if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
      }
      showToast?.(toastMsg);
    } catch {
      showToast?.('Could not copy', 4000);
    }
  };

  const openUrl = (url: string) => {
    if (window.framelyAPI?.openURL) {
      window.framelyAPI.openURL(url);
    } else {
      window.open(url, '_blank');
    }
  };

  return (
    <div className="burst-pack-overlay" data-testid="burst-pack-modal">
      <div className="burst-pack-dialog">
        <div className="burst-pack-header">
          <div className="burst-pack-title-row">
            <Layers className="w-4 h-4" />
            <h2>{showDone ? 'Launch kit ready' : 'Platform Burst Pack'}</h2>
          </div>
          <button type="button" className="burst-pack-close" onClick={closeModal} disabled={busy}>
            <X className="w-4 h-4" />
          </button>
        </div>

        {showDone ? (
          <div className="burst-pack-done" data-testid="burst-pack-done">
            <div className="burst-pack-done-hero">
              <CheckCircle2 className="burst-pack-done-icon" aria-hidden="true" />
              <div>
                <p className="burst-pack-done-title">
                  {lastResult.variantCount} platform variant{lastResult.variantCount === 1 ? '' : 's'} saved
                </p>
                <p className="burst-pack-done-sub">
                  Share your launch assets - captions include a link to Framely so others can find it.
                </p>
              </div>
            </div>

            <ol className="burst-pack-checklist">
              <li>
                <button
                  type="button"
                  className="btn btn-secondary burst-pack-check-btn"
                  onClick={() => openPath(lastResult.bundlePath || lastResult.primaryExportPath)}
                >
                  <FolderOpen className="w-4 h-4" />
                  Open folder in Explorer
                </button>
              </li>
              <li>
                <button
                  type="button"
                  className="btn btn-secondary burst-pack-check-btn"
                  onClick={() =>
                    copyText(getShareCaption('product-hunt'), 'Product Hunt caption copied')
                  }
                >
                  <ClipboardCopy className="w-4 h-4" />
                  Copy Product Hunt caption
                </button>
              </li>
              <li>
                <button
                  type="button"
                  className="btn btn-secondary burst-pack-check-btn"
                  onClick={() => {
                    const caption = getShareCaption('x');
                    copyText(caption, 'Launch tweet copied');
                    openUrl(buildShareIntentUrl('x', caption));
                  }}
                >
                  <Rocket className="w-4 h-4" />
                  Copy launch tweet &amp; open X
                </button>
              </li>
            </ol>

            <div className="burst-pack-footer">
              <span className="burst-pack-footer-hint">
                Bundle: {lastResult.documentName || documentName || 'saved'}
              </span>
              <div className="burst-pack-footer-actions">
                <button type="button" className="btn btn-primary" onClick={closeModal}>
                  Done
                </button>
              </div>
            </div>
          </div>
        ) : (
          <>
            <p className="burst-pack-subtitle">
              Export one edit into multiple platform-ready sizes with safe-zone-aware reframing.
            </p>

            <BurstPackPackList
              selectedPackId={selectedPackId}
              customKeys={customKeys}
              onSelectPack={(id) => {
                setSelectedPackId(id);
                if (id) setCustomKeys([]);
              }}
              onToggleCustom={handleToggleCustom}
            />

            <div className="burst-pack-save-dest">
              <FolderOpen className="w-3.5 h-3.5" aria-hidden="true" />
              <div>
                Choose a folder when saving. Framely creates a bundle folder containing every variant
                and a manifest.
                <span className="burst-pack-save-dest-path">
                  {documentName || 'framely-burst'}/
                </span>
              </div>
            </div>

            <BurstPackProgress phase={phase} current={progress.current} total={progress.total} />

            <div className="burst-pack-footer">
              <span className="burst-pack-footer-hint">
                {presetCount > 0
                  ? `${presetCount} variant${presetCount === 1 ? '' : 's'} will be saved to a folder you choose`
                  : 'Select a pack or custom presets'}
              </span>
              <div className="burst-pack-footer-actions">
                <button type="button" className="btn btn-secondary" onClick={closeModal} disabled={busy}>
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleSave}
                  disabled={busy || presetCount === 0}
                >
                  Save Burst Pack
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
