import { useState, useRef, useEffect } from 'react';
import { Download, Copy, Share2, MessageSquare, Layers, Loader2, SplitSquareHorizontal, ClipboardCopy } from 'lucide-react';

import { useAppContext } from '../AppContext';
import { useBurstPackContext } from '../contexts/BurstPackContext';
import { buildShareIntentUrl, getShareCaption } from '../utils/shareCaptions';
import './ShareMenu.css';

export default function WorkspaceFooter() {
  const {
    imageSrc,
    noImageMode,
    exportFormat, setExportFormat,
    jpegQuality, setJpegQuality,
    compressionMode, setCompressionMode,
    triggerExport,
    copyBeautifiedImage,
    exportBeforeAfter,
    copyBeforeAfter,
    toastMessage,
    showToast,
  } = useAppContext();
  const { openModal: openBurstModal, toast: burstToast } = useBurstPackContext();

  const [isShareMenuOpen, setIsShareMenuOpen] = useState(false);
  const [busyAction, setBusyAction] = useState<string | null>(null);
  const shareContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (shareContainerRef.current && !shareContainerRef.current.contains(event.target as Node)) {
        setIsShareMenuOpen(false);
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setIsShareMenuOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  if (!imageSrc && !noImageMode) return null;

  const canBeforeAfter = Boolean(imageSrc) && !noImageMode;

  const handleExportClick = () => {
    if (busyAction) return;
    setBusyAction('export');
    try {
      triggerExport();
      showToast?.('Exported successfully');
    } catch {
      showToast?.('Export failed', 4000);
    } finally {
      setBusyAction(null);
    }
  };

  const handleCopyClick = async () => {
    if (busyAction) return;
    setBusyAction('copy');
    try {
      await copyBeautifiedImage();
      showToast?.('Copied to clipboard');
    } catch {
      showToast?.('Copy failed', 4000);
    } finally {
      setBusyAction(null);
    }
  };

  const handleBeforeAfterExport = () => {
    if (busyAction || !canBeforeAfter) return;
    setBusyAction('before-after');
    try {
      exportBeforeAfter();
      showToast?.('Before → After exported');
    } catch {
      showToast?.('Before → After export failed', 4000);
    } finally {
      setBusyAction(null);
    }
  };

  const handleBeforeAfterCopy = async () => {
    if (busyAction || !canBeforeAfter) return;
    setBusyAction('before-after-copy');
    try {
      await copyBeforeAfter();
      showToast?.('Before → After copied');
    } catch {
      showToast?.('Copy failed', 4000);
    } finally {
      setBusyAction(null);
    }
  };

  const openShareUrl = (url: string) => {
    if (window.framelyAPI?.openURL) {
      window.framelyAPI.openURL(url);
    } else {
      window.open(url, '_blank');
    }
  };

  const handleSharePlatform = async (platform: 'x' | 'linkedin' | 'whatsapp') => {
    setIsShareMenuOpen(false);
    const caption = getShareCaption(platform);
    try {
      // Attaches both image + caption text in one clipboard write (see main clipboard:copy-image).
      await copyBeautifiedImage(caption);
      showToast?.('Image + caption ready - paste image after');
    } catch {
      showToast?.('Share copy failed', 4000);
    }
    openShareUrl(buildShareIntentUrl(platform, caption));
  };

  const handleCopyCaptionOnly = async () => {
    setIsShareMenuOpen(false);
    const caption = getShareCaption('generic');
    try {
      if (window.framelyAPI?.copyTextToClipboard) {
        await window.framelyAPI.copyTextToClipboard(caption);
      } else if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(caption);
      }
      showToast?.('Caption copied');
    } catch {
      showToast?.('Could not copy caption', 4000);
    }
  };

  return (
    <div className="workspace-footer">
      {/* Format Toggle */}
      <div className="format-toggle">
        <button
          className={`format-toggle-btn ${exportFormat === 'png' ? 'active' : ''}`}
          onClick={() => setExportFormat('png')}
        >
          PNG
        </button>
        <button
          className={`format-toggle-btn ${exportFormat === 'jpeg' ? 'active' : ''}`}
          onClick={() => setExportFormat('jpeg')}
        >
          JPG
        </button>
        <button
          className={`format-toggle-btn ${exportFormat === 'webp' ? 'active' : ''}`}
          onClick={() => setExportFormat('webp')}
        >
          WEBP
        </button>
      </div>

      {(exportFormat === 'jpeg' || exportFormat === 'webp') && (
        <div className="quality-control">
          <span className="toolbar-control-label">Quality</span>
          <input
            type="range"
            min="30"
            max="100"
            value={jpegQuality}
            onChange={(e) => setJpegQuality(parseInt(e.target.value, 10))}
          />
          <span className="quality-label">{jpegQuality}%</span>
        </div>
      )}

      <div className="compression-control">
        <span className="toolbar-control-label">Optimize</span>
        <div className="format-toggle">
          <button
            className={`format-toggle-btn ${compressionMode === 'original' ? 'active' : ''}`}
            onClick={() => setCompressionMode('original')}
            title="Minimal recompression"
          >
            Original
          </button>
          <button
            className={`format-toggle-btn ${compressionMode === 'balanced' ? 'active' : ''}`}
            onClick={() => setCompressionMode('balanced')}
            title="Good quality with smaller files"
          >
            Balanced
          </button>
          <button
            className={`format-toggle-btn ${compressionMode === 'small' ? 'active' : ''}`}
            onClick={() => setCompressionMode('small')}
            title="Prioritize smaller files for sharing"
          >
            Small
          </button>
        </div>
      </div>

      <div className="toolbar-divider" />

      <button className="btn btn-primary" onClick={handleExportClick} disabled={busyAction === 'export'}>
        {busyAction === 'export' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />} Export
      </button>

      <button className="btn btn-secondary" onClick={openBurstModal} title="Export multiple platform sizes to a folder">
        <Layers className="w-4 h-4" /> Burst
      </button>

      {canBeforeAfter && (
        <button
          className="btn btn-secondary"
          onClick={handleBeforeAfterExport}
          title="Export a side-by-side Before → After demo image"
          disabled={busyAction === 'before-after'}
          data-testid="before-after-export"
        >
          {busyAction === 'before-after' ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <SplitSquareHorizontal className="w-4 h-4" />
          )}{' '}
          Before/After
        </button>
      )}

      <button className="btn btn-secondary" onClick={handleCopyClick} disabled={busyAction === 'copy'}>
        {busyAction === 'copy' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Copy className="w-4 h-4" />} Copy
      </button>

      <div className="share-container" ref={shareContainerRef}>
        <button className="btn btn-secondary" onClick={() => setIsShareMenuOpen(!isShareMenuOpen)}>
          <Share2 className="w-4 h-4" /> Share
        </button>
        {isShareMenuOpen && (
          <div className="share-menu-popover" data-testid="share-menu-popover">
            <button className="share-menu-item" onClick={() => handleSharePlatform('x')}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.747l7.73-8.835L1.254 2.25H8.08l4.259 5.63L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z" />
              </svg>
              <span className="share-menu-item-content">
                <span className="share-menu-item-label">Copy &amp; post on X</span>
                <span className="share-menu-item-hint">image + Framely caption ready</span>
              </span>
            </button>
            <button className="share-menu-item" onClick={() => handleSharePlatform('whatsapp')}>
              <MessageSquare width="16" height="16" />
              <span className="share-menu-item-content">
                <span className="share-menu-item-label">Copy &amp; send on WhatsApp</span>
                <span className="share-menu-item-hint">image + Framely caption ready</span>
              </span>
            </button>
            <button className="share-menu-item" onClick={() => handleSharePlatform('linkedin')}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
              </svg>
              <span className="share-menu-item-content">
                <span className="share-menu-item-label">Copy &amp; share on LinkedIn</span>
                <span className="share-menu-item-hint">paste image + caption in feed</span>
              </span>
            </button>
            {canBeforeAfter && (
              <button
                className="share-menu-item"
                onClick={async () => {
                  setIsShareMenuOpen(false);
                  await handleBeforeAfterCopy();
                }}
                data-testid="share-before-after"
              >
                <SplitSquareHorizontal width="16" height="16" />
                <span className="share-menu-item-content">
                  <span className="share-menu-item-label">Copy Before → After</span>
                  <span className="share-menu-item-hint">dual panel demo for social</span>
                </span>
              </button>
            )}
            <button className="share-menu-item" onClick={handleCopyCaptionOnly} data-testid="copy-caption-only">
              <ClipboardCopy width="16" height="16" />
              <span className="share-menu-item-content">
                <span className="share-menu-item-label">Copy Framely caption</span>
                  <span className="share-menu-item-hint">text only</span>
              </span>
            </button>
          </div>
        )}
      </div>
      {(toastMessage || burstToast) && (
        <div className="workspace-toast" role="status" aria-live="polite">{toastMessage || burstToast}</div>
      )}
    </div>
  );
}
