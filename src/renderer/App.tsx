import { AppProvider, useAppContext } from './AppContext';
import { BurstPackProvider } from './contexts/BurstPackContext';
import BurstPackModal from './components/burst/BurstPackModal';
import Sidebar from './components/Sidebar';
import WorkspaceToolbar from './components/WorkspaceToolbar';
import CanvasPreview from './components/CanvasPreview';
import WorkspaceFooter from './components/WorkspaceFooter';
import PromptModal from './components/PromptModal';
import SettingsModal from './components/SettingsModal';
import HelpModal from './components/HelpModal';
import logoUrl from '../../assets/logo.svg';

function AppContent() {
  const { handleDragOver, handleDragLeave, handleDrop, sidebarVisible, fileInputRef, handleHTMLFileInput, sidebarPosition } = useAppContext();
  const isFrameless = window.framelyAPI && (window.framelyAPI.platform === 'win32' || window.framelyAPI.platform === 'darwin');
  const platformClass = window.framelyAPI ? `platform-${window.framelyAPI.platform}` : '';
  const collapsedClass = !sidebarVisible ? 'sidebar-collapsed' : '';
  const positionClass = sidebarPosition === 'right' ? 'sidebar-right-aligned' : 'sidebar-left-aligned';

  return (
    <div className={`app-container app-load ${platformClass} ${collapsedClass} ${positionClass}`} onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop}>
      {sidebarPosition === 'left' && <Sidebar />}
      <div className="workspace">
        {isFrameless && (
          <div className="workspace-titlebar">
            <div className="workspace-titlebar-brand">
              <img src={logoUrl} alt="Framely" className="workspace-titlebar-logo" />
              <span>Framely</span>
            </div>
          </div>
        )}
        <WorkspaceToolbar />
        <CanvasPreview />
        <WorkspaceFooter />
      </div>
      {sidebarPosition === 'right' && <Sidebar />}
      <PromptModal />
      <SettingsModal />
      <HelpModal />
      <BurstPackModal />
      <input
        type="file"
        ref={fileInputRef as any}
        style={{ display: 'none' }}
        accept="image/*"
        onChange={handleHTMLFileInput}
      />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <BurstPackProvider>
        <AppContent />
      </BurstPackProvider>
    </AppProvider>
  );
}
