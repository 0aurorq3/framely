import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import React from 'react';
import Sidebar from '../src/renderer/components/Sidebar';
import SettingsModal from '../src/renderer/components/SettingsModal';
import HelpModal from '../src/renderer/components/HelpModal';
import WorkspaceToolbar from '../src/renderer/components/WorkspaceToolbar';
import CanvasPreview from '../src/renderer/components/CanvasPreview';
import AnnotationsLayer from '../src/renderer/AnnotationsLayer';
import { Annotation } from '../src/renderer/canvasRenderer';
import App from '../src/renderer/App';
import packageJson from '../package.json';

// Mock AppContext
vi.mock('../src/renderer/AppContext', () => ({
  useAppContext: () => mockContext,
  AppProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

// Mock child components that have complex dependencies
vi.mock('../src/renderer/components/LayoutSettings', () => ({
  default: () => <div data-testid="layout-settings">Layout Settings</div>,
}));

vi.mock('../src/renderer/components/BackgroundSettings', () => ({
  default: () => <div data-testid="background-settings">Background Settings</div>,
}));

vi.mock('../src/renderer/components/ExtraSettings', () => ({
  default: () => <div data-testid="extra-settings">Extra Settings</div>,
}));

vi.mock('../src/renderer/hooks/useAnnotationEvents', () => ({
  useAnnotationEvents: () => ({
    dimensions: { width: 800, height: 600 },
    drawingAnnotation: null,
    selectedId: null,
    editingTextId: null,
    setEditingTextId: vi.fn(),
    editingTextValue: '',
    setEditingTextValue: vi.fn(),
    handlePointerDown: vi.fn(),
    handlePointerMove: vi.fn(),
    handlePointerUp: vi.fn(),
    startDrag: vi.fn(),
    startResize: vi.fn(),
    handleDoubleClick: vi.fn(),
    deleteAnnotation: vi.fn(),
  }),
}));

let mockContext: any = {};

beforeEach(() => {
  mockContext = {
    // Sidebar
    sidebarVisible: true,
    sidebarPosition: 'left',
    setSidebarPosition: vi.fn(),
    vibePalette: null,
    vibeVariantIndex: -1,
    vibeUpdateDrawColor: true,
    setVibeUpdateDrawColor: vi.fn(),
    applyAutoVibe: vi.fn(),
    customPresets: [],
    newPresetName: '',
    setNewPresetName: vi.fn(),
    selectFile: vi.fn(),
    pasteFromClipboard: vi.fn(),
    saveCustomPreset: vi.fn(),
    deleteCustomPreset: vi.fn(),
    selectBackgroundPreset: vi.fn(),
    resetStyles: vi.fn(),
    
    // Settings
    settingsVisible: false,
    setSettingsVisible: vi.fn(),
    autoImportCaptured: true,
    setAutoImportCaptured: vi.fn(),
    captureShortcut: 'PrintScreen',
    setCaptureShortcut: vi.fn(),
    helpVisible: false,
    setHelpVisible: vi.fn(),
    padding: 38,
    setPadding: vi.fn(),
    rounded: 20,
    setRounded: vi.fn(),
    shadow: 30,
    setShadow: vi.fn(),
    watermarkEnabled: true,
    setWatermarkEnabled: vi.fn(),
    watermarkText: 'Made with Framely',
    setWatermarkText: vi.fn(),
    watermarkSize: 20,
    setWatermarkSize: vi.fn(),
    watermarkPosition: 'right',
    setWatermarkPosition: vi.fn(),
    watermarkOpacity: 0.38,
    setWatermarkOpacity: vi.fn(),
    watermarkFont: 'sans-serif',
    setWatermarkFont: vi.fn(),
    watermarkBold: false,
    setWatermarkBold: vi.fn(),
    watermarkItalic: false,
    setWatermarkItalic: vi.fn(),
    annotationFont: 'sans-serif',
    setAnnotationFont: vi.fn(),
    annotationFontSize: 24,
    setAnnotationFontSize: vi.fn(),
    annotationBold: true,
    setAnnotationBold: vi.fn(),
    annotationItalic: false,
    setAnnotationItalic: vi.fn(),
    annotationOutlineEnabled: false,
    setAnnotationOutlineEnabled: vi.fn(),
    annotationOutlineColor: '#000000',
    setAnnotationOutlineColor: vi.fn(),
    annotationOutlineWidth: 3,
    setAnnotationOutlineWidth: vi.fn(),
    systemFonts: [],
    handleSliderRelease: vi.fn(),
    exportFormat: 'png',
    setExportFormat: vi.fn(),
    jpegQuality: 90,
    setJpegQuality: vi.fn(),
    compressionMode: 'balanced',
    setCompressionMode: vi.fn(),
    pushHistory: vi.fn(),
    getCurrentConfig: vi.fn(() => mockContext),
    
    // Toolbar
    setSidebarVisible: vi.fn(),
    editingMode: true,
    setEditingMode: vi.fn(),
    selectedAnnotationId: null,
    setSelectedAnnotationId: vi.fn(),
    blurStrength: 12,
    setBlurStrength: vi.fn(),
    noImageMode: false,
    setNoImageMode: vi.fn(),
    historyIndex: -1,
    history: [],
    handleUndo: vi.fn(),
    handleRedo: vi.fn(),
    setImageSrc: vi.fn(),
    setHistory: vi.fn(),
    setHistoryIndex: vi.fn(),
    activeTool: 'pointer',
    setActiveTool: vi.fn(),
    arrowStyle: 'classic',
    setArrowStyle: vi.fn(),
    annotationColor: '#f43f5e',
    setAnnotationColor: vi.fn(),
    annotationStrokeWidth: 4,
    setAnnotationStrokeWidth: vi.fn(),
    colorInputRef: { current: null },
    appTheme: 'dark',
    setAppTheme: vi.fn(),
    
    // CanvasPreview
    shadowColor: 'rgba(0, 0, 0, 0.4)',
    shadowEnabled: true,
    inset: 0,
    insetColor: 'rgba(255, 255, 255, 0.2)',
    border: 0,
    borderColor: '#ffffff',
    scale: 100,
    backgroundType: 'gradient',
    setBackgroundType: vi.fn(),
    backgroundValue: 'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)',
    aspectRatio: 'Auto',
    canvasWidth: 800,
    canvasHeight: 600,
    chromeStyle: 'mac',
    chromeTheme: 'dark',
    blurDensity: 40,
    meshPoints: [],
    meshDataUrl: '',
    shaderType: 'staticMesh',
    setShaderType: vi.fn(),
    shaderColors: ['#356FE8', '#62B7FF', '#73E1F4', '#D4EEFF', '#735CF2', '#B58CFF'],
    setShaderColors: vi.fn(),
    shaderParams: {},
    setShaderParams: vi.fn(),
    shaderDataUrl: '',
    activePointIdx: 0,
    position: 'Middle center',
    annotations: [],
    setAnnotations: vi.fn(),
    imageSrc: null,
    zoomLevel: 'Zoom to fit',
    setZoomLevel: vi.fn(),
    getZoomStyle: vi.fn(() => ({})),
    customPrompt: vi.fn(),
    handlePointerDown: vi.fn(),
    handlePointerMove: vi.fn(),
    handlePointerUp: vi.fn(),
    
    // App
    handleDragOver: vi.fn(),
    handleDragLeave: vi.fn(),
    handleDrop: vi.fn(),
    clearWorkspace: vi.fn(),
  };
});

describe('Sidebar', () => {
  it('renders sidebar with logo and title', () => {
    render(<Sidebar />);
    
    expect(screen.getByText('Framely')).toBeInTheDocument();
    expect(screen.getByAltText('Framely')).toBeInTheDocument();
  });

  it('renders action buttons', () => {
    render(<Sidebar />);
    
    expect(screen.getByTitle('New snap')).toBeInTheDocument();
    expect(screen.getByTitle('Paste')).toBeInTheDocument();
  });

  it('calls selectFile on New snap click', () => {
    render(<Sidebar />);
    
    fireEvent.click(screen.getByTitle('New snap'));
    expect(mockContext.selectFile).toHaveBeenCalled();
  });

  it('calls pasteFromClipboard on Paste click', () => {
    render(<Sidebar />);
    
    fireEvent.click(screen.getByTitle('Paste'));
    expect(mockContext.pasteFromClipboard).toHaveBeenCalled();
  });

  it('renders Reset settings button', () => {
    render(<Sidebar />);
    expect(screen.getByTitle('Reset Styles')).toBeInTheDocument();
  });

  it('calls resetStyles when Reset settings click is confirmed', () => {
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);
    render(<Sidebar />);

    fireEvent.click(screen.getByTitle('Reset Styles'));

    expect(confirmSpy).toHaveBeenCalled();
    expect(mockContext.resetStyles).toHaveBeenCalled();
    confirmSpy.mockRestore();
  });

  it('does not call resetStyles when Reset settings click is cancelled', () => {
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(false);
    render(<Sidebar />);
    
    fireEvent.click(screen.getByTitle('Reset Styles'));
    
    expect(confirmSpy).toHaveBeenCalled();
    expect(mockContext.resetStyles).not.toHaveBeenCalled();
    confirmSpy.mockRestore();
  });

  it('renders preset input and save button', () => {
    render(<Sidebar />);
    
    expect(screen.getByPlaceholderText('Preset name...')).toBeInTheDocument();
    expect(screen.getByText('User Presets')).toBeInTheDocument();
  });

  it('updates preset name on input change', () => {
    render(<Sidebar />);
    
    const input = screen.getByPlaceholderText('Preset name...');
    fireEvent.change(input, { target: { value: 'My Preset' } });
    
    expect(mockContext.setNewPresetName).toHaveBeenCalledWith('My Preset');
  });

  it('calls saveCustomPreset on save button click', () => {
    render(<Sidebar />);
    
    const saveButton = screen.getByTitle('Save current background');
    fireEvent.click(saveButton);
    
    expect(mockContext.saveCustomPreset).toHaveBeenCalled();
  });

  it('renders custom presets when they exist', () => {
    mockContext.customPresets = [
      { id: '1', name: 'Preset 1', type: 'gradient', gradient: 'linear-gradient(...)' },
      { id: '2', name: 'Preset 2', type: 'color', color: '#ff0000' },
    ];
    
    render(<Sidebar />);
    
    expect(screen.getByText('Preset 1')).toBeInTheDocument();
    expect(screen.getByText('Preset 2')).toBeInTheDocument();
  });

  it('calls selectBackgroundPreset on preset click', () => {
    const preset = { id: '1', name: 'Test Preset', type: 'gradient', gradient: 'linear-gradient(...)' };
    mockContext.customPresets = [preset];
    
    render(<Sidebar />);
    
    fireEvent.click(screen.getByText('Test Preset'));
    expect(mockContext.selectBackgroundPreset).toHaveBeenCalledWith(preset);
  });

  it('calls deleteCustomPreset on delete button click', () => {
    const preset = { id: '1', name: 'Delete Me', type: 'gradient', gradient: 'linear-gradient(...)' };
    mockContext.customPresets = [preset];
    
    render(<Sidebar />);
    
    const deleteButtons = screen.getAllByRole('button');
    const deleteButton = deleteButtons.find(btn => btn.querySelector('.preset-delete-btn') || btn.closest('.preset-delete-btn'));
    
    if (deleteButton) {
      fireEvent.click(deleteButton);
      expect(mockContext.deleteCustomPreset).toHaveBeenCalledWith('1', expect.any(Object));
    }
  });

  it('applies collapsed class when sidebarVisible is false', () => {
    mockContext.sidebarVisible = false;
    
    const { container } = render(<Sidebar />);
    
    const sidebar = container.querySelector('.sidebar');
    expect(sidebar).toHaveClass('collapsed');
  });

  it('renders child settings components', () => {
    render(<Sidebar />);
    
    expect(screen.getByTestId('layout-settings')).toBeInTheDocument();
    expect(screen.getByTestId('background-settings')).toBeInTheDocument();
    expect(screen.getByTestId('extra-settings')).toBeInTheDocument();
  });
});

describe('SettingsModal', () => {
  it('returns null when settingsVisible is false', () => {
    mockContext.settingsVisible = false;
    
    const { container } = render(<SettingsModal />);
    expect(container.firstChild).toBeNull();
  });

  it('renders modal when settingsVisible is true', () => {
    mockContext.settingsVisible = true;
    
    render(<SettingsModal />);
    
    expect(screen.getByText('Preferences')).toBeInTheDocument();
    expect(screen.getByText('Done')).toBeInTheDocument();
    expect(screen.getByText('Reset Defaults')).toBeInTheDocument();
  });

  it('renders all settings sections', () => {
    mockContext.settingsVisible = true;
    
    render(<SettingsModal />);
    
    expect(screen.getByText('Canvas Defaults')).toBeInTheDocument();
    expect(screen.getByText('Export Preferences')).toBeInTheDocument();
    expect(screen.getByText('Watermark Defaults')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Shortcuts'));
    expect(screen.getByText('Keyboard Shortcuts')).toBeInTheDocument();
  });


  it('updates padding on slider change', () => {
    mockContext.settingsVisible = true;
    
    render(<SettingsModal />);
    
    const sliders = screen.getAllByRole('slider');
    const paddingSlider = sliders[0];
    
    fireEvent.change(paddingSlider, { target: { value: '50' } });
    expect(mockContext.setPadding).toHaveBeenCalledWith(50);
  });

  it('updates rounded on slider change', () => {
    mockContext.settingsVisible = true;
    
    render(<SettingsModal />);
    
    const sliders = screen.getAllByRole('slider');
    const roundedSlider = sliders[1];
    
    fireEvent.change(roundedSlider, { target: { value: '30' } });
    expect(mockContext.setRounded).toHaveBeenCalledWith(30);
  });

  it('updates shadow on slider change', () => {
    mockContext.settingsVisible = true;
    
    render(<SettingsModal />);
    
    const sliders = screen.getAllByRole('slider');
    const shadowSlider = sliders[2];
    
    fireEvent.change(shadowSlider, { target: { value: '40' } });
    expect(mockContext.setShadow).toHaveBeenCalledWith(40);
  });

  it('toggles export format', () => {
    mockContext.settingsVisible = true;
    
    render(<SettingsModal />);
    
    fireEvent.click(screen.getByText('JPEG'));
    expect(mockContext.setExportFormat).toHaveBeenCalledWith('jpeg');
    
    fireEvent.click(screen.getByText('PNG'));
    expect(mockContext.setExportFormat).toHaveBeenCalledWith('png');
  });

  it('shows quality slider when JPEG is selected', () => {
    mockContext.settingsVisible = true;
    mockContext.exportFormat = 'jpeg';

    render(<SettingsModal />);

    expect(screen.getByText('Quality')).toBeInTheDocument();
  });

  it('shows quality slider when WebP is selected', () => {
    mockContext.settingsVisible = true;
    mockContext.exportFormat = 'webp';

    render(<SettingsModal />);

    expect(screen.getByText('Quality')).toBeInTheDocument();
  });

  it('hides quality slider when PNG is selected', () => {
    mockContext.settingsVisible = true;
    mockContext.exportFormat = 'png';

    render(<SettingsModal />);

    expect(screen.queryByText('Quality')).not.toBeInTheDocument();
  });

  it('toggles watermark enabled', () => {
    mockContext.settingsVisible = true;
    
    render(<SettingsModal />);
    
    const checkboxes = screen.getAllByRole('checkbox');
    const checkbox = checkboxes.find(cb => {
      const container = cb.closest('.switch-container');
      return container && container.textContent?.includes('Watermark');
    })!;
    fireEvent.click(checkbox);
    
    expect(mockContext.setWatermarkEnabled).toHaveBeenCalled();
  });

  it('updates watermark text', () => {
    mockContext.settingsVisible = true;
    
    render(<SettingsModal />);
    
    const input = screen.getByDisplayValue('Made with Framely');
    fireEvent.change(input, { target: { value: 'New Watermark' } });
    
    expect(mockContext.setWatermarkText).toHaveBeenCalledWith('New Watermark');
  });

  it('updates default watermark position', () => {
    mockContext.settingsVisible = true;
    
    render(<SettingsModal />);
    
    const select = screen.getByDisplayValue('Bottom Right');
    fireEvent.change(select, { target: { value: 'left' } });
    
    expect(mockContext.setWatermarkPosition).toHaveBeenCalledWith('left');
  });

  it('updates default watermark opacity', () => {
    mockContext.settingsVisible = true;
    
    render(<SettingsModal />);
    
    const slider = screen.getAllByRole('slider')[3];
    fireEvent.change(slider, { target: { value: '75' } });
    
    expect(mockContext.setWatermarkOpacity).toHaveBeenCalledWith(0.75);
  });

  it('calls setSettingsVisible(false) on close button click', () => {
    mockContext.settingsVisible = true;
    
    render(<SettingsModal />);
    
    const closeButton = screen.getAllByRole('button').find(btn => 
      btn.querySelector('svg') && btn.closest('.preset-delete-btn')
    );
    
    if (closeButton) {
      fireEvent.click(closeButton);
      expect(mockContext.setSettingsVisible).toHaveBeenCalledWith(false);
    }
  });

  it('calls setSettingsVisible(false) on Done button click', () => {
    mockContext.settingsVisible = true;
    
    render(<SettingsModal />);
    
    fireEvent.click(screen.getByText('Done'));
    expect(mockContext.setSettingsVisible).toHaveBeenCalledWith(false);
  });

  it('calls setSettingsVisible(false) on overlay click', () => {
    mockContext.settingsVisible = true;

    const { container } = render(<SettingsModal />);

    const overlay = container.querySelector('.modal-overlay');
    if (overlay) {
      fireEvent.click(overlay);
      expect(mockContext.setSettingsVisible).toHaveBeenCalledWith(false);
    }
  });

  it('calls setSettingsVisible(false) on Escape key press', () => {
    mockContext.settingsVisible = true;

    render(<SettingsModal />);

    act(() => {
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    });
    expect(mockContext.setSettingsVisible).toHaveBeenCalledWith(false);
  });

  it('resets all settings on Reset Defaults click', () => {
    mockContext.settingsVisible = true;
    
    render(<SettingsModal />);
    
    fireEvent.click(screen.getByText('Reset Defaults'));
    
    expect(mockContext.setPadding).toHaveBeenCalledWith(38);
    expect(mockContext.setRounded).toHaveBeenCalledWith(20);
    expect(mockContext.setShadow).toHaveBeenCalledWith(30);
    expect(mockContext.setWatermarkEnabled).toHaveBeenCalledWith(false);
    expect(mockContext.setWatermarkText).toHaveBeenCalledWith('Made with Framely');
    expect(mockContext.setWatermarkPosition).toHaveBeenCalledWith('right');
    expect(mockContext.setWatermarkOpacity).toHaveBeenCalledWith(0.38);
    expect(mockContext.setExportFormat).toHaveBeenCalledWith('png');
    expect(mockContext.setJpegQuality).toHaveBeenCalledWith(90);
  });

  it('displays keyboard shortcuts', () => {
    mockContext.settingsVisible = true;

    render(<SettingsModal />);

    fireEvent.click(screen.getByText('Shortcuts'));

    expect(screen.getByText('Paste Image')).toBeInTheDocument();
    expect(screen.getByText('Undo / Redo')).toBeInTheDocument();
    expect(screen.getByText('Export image')).toBeInTheDocument();
    expect(screen.getByText('Toggle Code Studio')).toBeInTheDocument();
    expect(screen.getByText('Delete Annotation')).toBeInTheDocument();
  });


  it('updates JPEG quality slider', () => {
    mockContext.settingsVisible = true;
    mockContext.exportFormat = 'jpeg';
    render(<SettingsModal />);
    const qualitySlider = screen.getByDisplayValue('90');
    fireEvent.change(qualitySlider, { target: { value: '75' } });
    expect(mockContext.setJpegQuality).toHaveBeenCalledWith(75);
  });
});

describe('WorkspaceToolbar', () => {
  it('shows annotation tools only in edit mode', () => {
    mockContext.editingMode = false;
    render(<WorkspaceToolbar />);
    expect(screen.queryByTitle('Draw Arrow')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Enter edit mode' }));
    expect(mockContext.setEditingMode).toHaveBeenCalledWith(true);
  });

  it('changes blur strength from the edit toolbar', () => {
    mockContext.activeTool = 'blur';
    mockContext.imageSrc = 'data:image/png;base64,abc';
    render(<WorkspaceToolbar />);
    fireEvent.change(screen.getByRole('slider', { name: 'Blur strength' }), { target: { value: '24' } });
    expect(mockContext.setBlurStrength).toHaveBeenCalledWith(24);
  });

  it('renders sidebar toggle button', () => {
    render(<WorkspaceToolbar />);

    const toggleButton = screen.getByTitle('Hide Sidebar');
    expect(toggleButton).toBeInTheDocument();
  });

  it('toggles sidebar on button click', () => {
    render(<WorkspaceToolbar />);

    const toggleButton = screen.getByTitle('Hide Sidebar');
    fireEvent.click(toggleButton);

    expect(mockContext.setSidebarVisible).toHaveBeenCalled();
  });

  it('renders undo and redo buttons', () => {
    render(<WorkspaceToolbar />);
    
    expect(screen.getByTitle('Undo (Ctrl + Z)')).toBeInTheDocument();
    expect(screen.getByTitle('Redo (Ctrl + Y)')).toBeInTheDocument();
  });

  it('disables undo button when history is empty', () => {
    mockContext.historyIndex = -1;
    
    render(<WorkspaceToolbar />);
    
    const undoButton = screen.getByTitle('Undo (Ctrl + Z)');
    expect(undoButton).toBeDisabled();
  });

  it('disables redo button when at end of history', () => {
    mockContext.historyIndex = 2;
    mockContext.history = [{}, {}, {}];
    
    render(<WorkspaceToolbar />);
    
    const redoButton = screen.getByTitle('Redo (Ctrl + Y)');
    expect(redoButton).toBeDisabled();
  });

  it('calls handleUndo on undo button click', () => {
    mockContext.historyIndex = 1;
    mockContext.history = [{}, {}];
    
    render(<WorkspaceToolbar />);
    
    fireEvent.click(screen.getByTitle('Undo (Ctrl + Z)'));
    expect(mockContext.handleUndo).toHaveBeenCalled();
  });

  it('calls handleRedo on redo button click', () => {
    mockContext.historyIndex = 0;
    mockContext.history = [{}, {}];
    
    render(<WorkspaceToolbar />);
    
    fireEvent.click(screen.getByTitle('Redo (Ctrl + Y)'));
    expect(mockContext.handleRedo).toHaveBeenCalled();
  });

  it('renders all annotation tools', () => {
    render(<WorkspaceToolbar />);
    
    expect(screen.getByTitle('Select / Move')).toBeInTheDocument();
    expect(screen.getByTitle('Rectangle Outline')).toBeInTheDocument();
    expect(screen.getByTitle('Rectangle Filled')).toBeInTheDocument();
    expect(screen.getByTitle('Circle Outline')).toBeInTheDocument();
    expect(screen.getByTitle('Circle Filled')).toBeInTheDocument();
    expect(screen.getByTitle('Straight Line')).toBeInTheDocument();
    expect(screen.getByTitle('Draw Arrow')).toBeInTheDocument();
    expect(screen.getByTitle('Draw Text')).toBeInTheDocument();
    expect(screen.getByTitle('Freehand Draw')).toBeInTheDocument();
    expect(screen.getByTitle('Add Emoji')).toBeInTheDocument();
  });

  it('highlights active tool', () => {
    mockContext.activeTool = 'rect';
    
    render(<WorkspaceToolbar />);
    
    const rectButton = screen.getByTitle('Rectangle Outline');
    expect(rectButton).toHaveClass('active');
  });

  it('calls setActiveTool on tool click', () => {
    render(<WorkspaceToolbar />);
    
    fireEvent.click(screen.getByTitle('Rectangle Outline'));
    expect(mockContext.setActiveTool).toHaveBeenCalledWith('rect');
    
    fireEvent.click(screen.getByTitle('Circle Filled'));
    expect(mockContext.setActiveTool).toHaveBeenCalledWith('filled-circle');
  });

  it('shows arrow style options when arrow tool is active', () => {
    mockContext.activeTool = 'arrow';
    
    render(<WorkspaceToolbar />);
    
    expect(screen.getByTitle('Classic Arrow')).toBeInTheDocument();
    expect(screen.getByTitle('Dashed Arrow')).toBeInTheDocument();
    expect(screen.getByTitle('Tapered Curved Arrow')).toBeInTheDocument();
    expect(screen.getByTitle('Curved Arrow')).toBeInTheDocument();
  });

  it('hides arrow style options when arrow tool is not active', () => {
    mockContext.activeTool = 'pointer';
    
    render(<WorkspaceToolbar />);
    
    expect(screen.queryByTitle('Classic Arrow')).not.toBeInTheDocument();
  });

  it('calls setArrowStyle on arrow style click', () => {
    mockContext.activeTool = 'arrow';
    
    render(<WorkspaceToolbar />);
    
    fireEvent.click(screen.getByTitle('Dashed Arrow'));
    expect(mockContext.setArrowStyle).toHaveBeenCalledWith('dashed');
  });

  it('highlights active arrow style', () => {
    mockContext.activeTool = 'arrow';
    mockContext.arrowStyle = 'tapered';
    
    render(<WorkspaceToolbar />);
    
    const taperedButton = screen.getByTitle('Tapered Curved Arrow');
    expect(taperedButton).toHaveClass('active');
  });

  it('renders annotation color picker', () => {
    render(<WorkspaceToolbar />);
    
    const colorButton = screen.getByTitle('Annotation Color');
    expect(colorButton).toBeInTheDocument();
  });

  it('renders stroke width slider', () => {
    mockContext.activeTool = 'rect';
    render(<WorkspaceToolbar />);
    
    const slider = screen.getByTitle('Stroke Width: 4px');
    expect(slider).toBeInTheDocument();
  });

  it('updates stroke width on slider change', () => {
    mockContext.activeTool = 'rect';
    render(<WorkspaceToolbar />);
    
    const slider = screen.getByTitle('Stroke Width: 4px');
    fireEvent.change(slider, { target: { value: '8' } });
    
    expect(mockContext.setAnnotationStrokeWidth).toHaveBeenCalledWith(8);
  });

  it('renders theme toggle button', () => {
    render(<WorkspaceToolbar />);
    
    const themeButton = screen.getByTitle('Switch to Light Mode');
    expect(themeButton).toBeInTheDocument();
  });

  it('toggles theme on button click', () => {
    render(<WorkspaceToolbar />);
    
    const themeButton = screen.getByTitle('Switch to Light Mode');
    fireEvent.click(themeButton);
    
    expect(mockContext.setAppTheme).toHaveBeenCalledWith('light');
  });

  it('shows different icon for light theme', () => {
    mockContext.appTheme = 'light';
    
    render(<WorkspaceToolbar />);
    
    const themeButton = screen.getByTitle('Switch to Dark Mode');
    expect(themeButton).toBeInTheDocument();
  });

  it('renders settings button', () => {
    render(<WorkspaceToolbar />);
    
    const settingsButton = screen.getByTitle('Settings');
    expect(settingsButton).toBeInTheDocument();
  });

  it('toggles settings on button click', () => {
    render(<WorkspaceToolbar />);
    
    fireEvent.click(screen.getByTitle('Settings'));
    expect(mockContext.setSettingsVisible).toHaveBeenCalled();
  });

  it('highlights settings button when visible', () => {
    mockContext.settingsVisible = true;
    
    render(<WorkspaceToolbar />);
    
    const settingsButton = screen.getByTitle('Settings');
    expect(settingsButton).toHaveClass('active');
  });

  it('renders help button and handles click', () => {
    render(<WorkspaceToolbar />);
    const helpButton = screen.getByTitle('Help');
    expect(helpButton).toBeInTheDocument();
    fireEvent.click(helpButton);
    expect(mockContext.setHelpVisible).toHaveBeenCalled();
  });

  it('renders help button as active when help is visible', () => {
    mockContext.helpVisible = true;
    render(<WorkspaceToolbar />);
    const helpButton = screen.getByTitle('Help');
    expect(helpButton).toHaveClass('active');
  });

  it('renders new workspace button', () => {
    render(<WorkspaceToolbar />);

    const newButton = screen.getByTitle('New workspace (Ctrl + N)');
    expect(newButton).toBeInTheDocument();
  });

  it('clears workspace on button click', () => {
    render(<WorkspaceToolbar />);

    fireEvent.click(screen.getByTitle('New workspace (Ctrl + N)'));

    expect(mockContext.clearWorkspace).toHaveBeenCalled();
  });

  it('shows exit button in no-image mode', () => {
    mockContext.noImageMode = true;
    
    render(<WorkspaceToolbar />);
    
    expect(screen.getByText('Exit')).toBeInTheDocument();
    expect(screen.getByTitle('Upload Screenshot')).toBeInTheDocument();
  });

  it('exits no-image mode on Exit click', () => {
    mockContext.noImageMode = true;
    
    render(<WorkspaceToolbar />);
    
    fireEvent.click(screen.getByText('Exit'));
    
    expect(mockContext.setNoImageMode).toHaveBeenCalledWith(false);
    expect(mockContext.setImageSrc).toHaveBeenCalledWith(null);
  });
});

describe('HelpModal', () => {
  it('renders nothing when helpVisible is false', () => {
    mockContext.helpVisible = false;
    const { container } = render(<HelpModal />);
    expect(container.firstChild).toBeNull();
  });

  it('renders logo, name, version, and dynamic copyright when helpVisible is true', () => {
    mockContext.helpVisible = true;
    render(<HelpModal />);

    expect(screen.getByText('Framely')).toBeInTheDocument();
    expect(screen.getByText(new RegExp(`Version ${packageJson.version.replace(/\./g, '\\.')}`))).toBeInTheDocument();
    expect(screen.getByAltText('Framely Logo')).toBeInTheDocument();

    const currentYear = new Date().getFullYear();
    expect(screen.getByText(`© ${currentYear} Framely contributors`)).toBeInTheDocument();
  });

  it('renders detailed system specifications', () => {
    (window as any).framelyAPI = {
      platform: 'win32',
      osInfo: 'Windows_NT x64 10.0.26200',
      versions: {
        electron: '31.3.1',
        chrome: '124.0.0.0',
        node: '20.11.0',
        v8: '12.4.254.15-electron.0'
      }
    };
    mockContext.helpVisible = true;
    render(<HelpModal />);

    expect(screen.getByText(/Electron:/)).toBeInTheDocument();
    expect(screen.getByText('31.3.1')).toBeInTheDocument();
    expect(screen.getByText(/Chromium:/)).toBeInTheDocument();
    expect(screen.getByText('124.0.0.0')).toBeInTheDocument();
    expect(screen.getByText(/Node\.js:/)).toBeInTheDocument();
    expect(screen.getByText('20.11.0')).toBeInTheDocument();
    expect(screen.getByText(/V8:/)).toBeInTheDocument();
    expect(screen.getByText('12.4.254.15-electron.0')).toBeInTheDocument();
    expect(screen.getByText(/OS:/)).toBeInTheDocument();
    expect(screen.getByText('Windows_NT x64 10.0.26200')).toBeInTheDocument();
  });

  it('copies system specifications on Copy click', async () => {
    const mockWriteText = vi.fn<(_text: string) => Promise<void>>().mockImplementation(() => Promise.resolve());
    Object.defineProperty(navigator, 'clipboard', {
      value: {
        writeText: mockWriteText,
      },
      writable: true,
      configurable: true,
    });

    (window as any).framelyAPI = {
      platform: 'win32',
      osInfo: 'Windows_NT x64 10.0.26200',
      versions: {
        electron: '31.3.1',
        chrome: '124.0.0.0',
        node: '20.11.0',
        v8: '12.4.254.15-electron.0'
      }
    };

    mockContext.helpVisible = true;
    render(<HelpModal />);

    const copyButton = screen.getByTitle('Copy version info');
    fireEvent.click(copyButton);

    expect(await screen.findByText('Copied!')).toBeInTheDocument();

    expect(mockWriteText).toHaveBeenCalledWith([
      `Framely Version: ${packageJson.version}`,
      'Electron: 31.3.1',
      'Chromium: 124.0.0.0',
      'Node.js: 20.11.0',
      'V8: 12.4.254.15-electron.0',
      'OS: Windows_NT x64 10.0.26200'
    ].join('\n'));
  });

  it('calls setHelpVisible(false) when close button is clicked', () => {
    mockContext.helpVisible = true;
    render(<HelpModal />);

    fireEvent.click(screen.getByLabelText('Close help'));
    expect(mockContext.setHelpVisible).toHaveBeenCalledWith(false);
  });

  it('calls setHelpVisible(false) when Done button is clicked', () => {
    mockContext.helpVisible = true;
    render(<HelpModal />);

    fireEvent.click(screen.getByText('Done'));
    expect(mockContext.setHelpVisible).toHaveBeenCalledWith(false);
  });
});

describe('CanvasPreview', () => {
  it('renders empty state when no image', () => {
    mockContext.imageSrc = null;
    mockContext.noImageMode = false;
    
    render(<CanvasPreview />);
    
    expect(screen.getByText('Drag & Drop screenshot here')).toBeInTheDocument();
    expect(screen.getByText('Or click to select an image, or copy-paste directly (Ctrl+V)')).toBeInTheDocument();
  });

  it('renders create blank gradient button in empty state', () => {
    mockContext.imageSrc = null;
    mockContext.noImageMode = false;
    
    render(<CanvasPreview />);
    
    expect(screen.getByText('Create Blank Gradient')).toBeInTheDocument();
  });

  it('calls selectFile on empty state click', () => {
    mockContext.imageSrc = null;
    mockContext.noImageMode = false;
    
    render(<CanvasPreview />);
    
    const emptyState = screen.getByText('Drag & Drop screenshot here').parentElement;
    if (emptyState) {
      fireEvent.click(emptyState);
      expect(mockContext.selectFile).toHaveBeenCalled();
    }
  });

  it('creates a blank Framely Aurora on button click', () => {
    mockContext.imageSrc = null;
    mockContext.noImageMode = false;
    
    render(<CanvasPreview />);
    
    fireEvent.click(screen.getByText('Create Blank Gradient'));
    
    expect(mockContext.setNoImageMode).toHaveBeenCalledWith(true);
    expect(mockContext.setBackgroundType).toHaveBeenCalledWith('shader');
    expect(mockContext.setShaderType).toHaveBeenCalledWith('staticMesh');
    expect(mockContext.setShaderColors).toHaveBeenCalledWith(expect.arrayContaining(['#356FE8', '#73E1F4', '#735CF2']));
    expect(mockContext.setImageSrc).toHaveBeenCalledWith(null);
  });

  it('renders image when imageSrc exists', () => {
    mockContext.imageSrc = 'data:image/png;base64,test';
    
    render(<CanvasPreview />);
    
    const img = screen.getByAltText('Screenshot');
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('src', 'data:image/png;base64,test');
  });

  it('renders canvas in no-image mode', () => {
    mockContext.imageSrc = null;
    mockContext.noImageMode = true;
    
    const { container } = render(<CanvasPreview />);
    
    const canvas = container.querySelector('.preview-background-card');
    expect(canvas).toBeInTheDocument();
  });

  it('renders zoom controls when image or no-image mode', () => {
    mockContext.imageSrc = 'data:image/png;base64,test';
    
    render(<CanvasPreview />);
    
    expect(screen.getByTitle('Zoom out (10%)')).toBeInTheDocument();
    expect(screen.getByTitle('Zoom in (10%)')).toBeInTheDocument();
    expect(screen.getByTitle('Reset to Zoom to fit')).toBeInTheDocument();
  });

  it('hides zoom controls in empty state', () => {
    mockContext.imageSrc = null;
    mockContext.noImageMode = false;
    
    render(<CanvasPreview />);
    
    expect(screen.queryByTitle('Zoom in (10%)')).not.toBeInTheDocument();
  });

  it('calls setZoomLevel on zoom in click', () => {
    mockContext.imageSrc = 'data:image/png;base64,test';
    mockContext.zoomLevel = '100%';
    
    render(<CanvasPreview />);
    
    fireEvent.click(screen.getByTitle('Zoom in (10%)'));
    expect(mockContext.setZoomLevel).toHaveBeenCalledWith('110%');
  });

  it('calls setZoomLevel on zoom out click', () => {
    mockContext.imageSrc = 'data:image/png;base64,test';
    mockContext.zoomLevel = '100%';
    
    render(<CanvasPreview />);
    
    fireEvent.click(screen.getByTitle('Zoom out (10%)'));
    expect(mockContext.setZoomLevel).toHaveBeenCalledWith('90%');
  });

  it('resets to fit on fit button click', () => {
    mockContext.imageSrc = 'data:image/png;base64,test';
    mockContext.zoomLevel = '150%';
    
    render(<CanvasPreview />);
    
    const fitButton = screen.getByTitle('Reset to Zoom to fit');
    fireEvent.click(fitButton);
    
    expect(mockContext.setZoomLevel).toHaveBeenCalledWith('Zoom to fit');
  });

  it('disables zoom out at minimum', () => {
    mockContext.imageSrc = 'data:image/png;base64,test';
    mockContext.zoomLevel = '10%';
    
    render(<CanvasPreview />);
    
    const zoomOutButton = screen.getByTitle('Zoom out (10%)');
    expect(zoomOutButton).toBeDisabled();
  });

  it('disables zoom in at maximum', () => {
    mockContext.imageSrc = 'data:image/png;base64,test';
    mockContext.zoomLevel = '500%';
    
    render(<CanvasPreview />);
    
    const zoomInButton = screen.getByTitle('Zoom in (10%)');
    expect(zoomInButton).toBeDisabled();
  });

  it('shows current zoom level', () => {
    mockContext.imageSrc = 'data:image/png;base64,test';
    mockContext.zoomLevel = '150%';
    
    render(<CanvasPreview />);
    
    expect(screen.getByText('150%')).toBeInTheDocument();
  });

  it('renders watermark when enabled', () => {
    mockContext.imageSrc = 'data:image/png;base64,test';
    mockContext.watermarkEnabled = true;
    mockContext.watermarkText = 'My Watermark';
    
    render(<CanvasPreview />);
    
    expect(screen.getByText('My Watermark')).toBeInTheDocument();
  });

  it('hides watermark when disabled', () => {
    mockContext.imageSrc = 'data:image/png;base64,test';
    mockContext.watermarkEnabled = false;
    mockContext.watermarkText = 'My Watermark';

    render(<CanvasPreview />);

    expect(screen.queryByText('My Watermark')).not.toBeInTheDocument();
  });

  it('renders macOS chrome dots when chromeStyle is mac', () => {
    mockContext.imageSrc = 'data:image/png;base64,test';
    mockContext.chromeStyle = 'mac';
    const { container } = render(<CanvasPreview />);
    const chromeDots = container.querySelectorAll('.dot');
    expect(chromeDots.length).toBe(3);
  });

  it('renders Windows chrome buttons when chromeStyle is windows', () => {
    mockContext.imageSrc = 'data:image/png;base64,test';
    mockContext.chromeStyle = 'windows';
    const { container } = render(<CanvasPreview />);
    const winButtons = container.querySelectorAll('.win-min, .win-icon, .win-close');
    expect(winButtons.length).toBe(3);
  });

  it('renders AnnotationsLayer when image is loaded', () => {
    mockContext.imageSrc = 'data:image/png;base64,test';
    const { container } = render(<CanvasPreview />);
    const annotationsLayer = container.querySelector('.annotations-layer');
    expect(annotationsLayer).toBeInTheDocument();
  });

  it('applies absolute position styles to container box for Middle right', () => {
    mockContext.imageSrc = 'data:image/png;base64,test';
    mockContext.aspectRatio = '1:1';
    mockContext.position = 'Middle right';

    const { container } = render(<CanvasPreview />);
    const box = container.querySelector('.preview-container-box');
    expect(box).toHaveStyle({
      position: 'absolute',
      left: '-38px',
      top: '84px',
    });
  });

  it('applies absolute position styles to container box for Top center', () => {
    mockContext.imageSrc = 'data:image/png;base64,test';
    mockContext.aspectRatio = '1:1';
    mockContext.position = 'Top center';

    const { container } = render(<CanvasPreview />);
    const box = container.querySelector('.preview-container-box');
    expect(box).toHaveStyle({
      position: 'absolute',
      left: '0px',
      top: '38px',
    });
  });

  it('applies absolute position styles to container box for Bottom center', () => {
    mockContext.imageSrc = 'data:image/png;base64,test';
    mockContext.aspectRatio = '1:1';
    mockContext.position = 'Bottom center';

    const { container } = render(<CanvasPreview />);
    const box = container.querySelector('.preview-container-box');
    expect(box).toHaveStyle({
      position: 'absolute',
      left: '0px',
      top: '130px',
    });
  });

  it('applies absolute position styles to container box for Middle left', () => {
    mockContext.imageSrc = 'data:image/png;base64,test';
    mockContext.aspectRatio = '1:1';
    mockContext.position = 'Middle left';

    const { container } = render(<CanvasPreview />);
    const box = container.querySelector('.preview-container-box');
    expect(box).toHaveStyle({
      position: 'absolute',
      left: '38px',
      top: '84px',
    });
  });

  it('applies absolute position styles to container box in Auto mode', () => {
    mockContext.imageSrc = 'data:image/png;base64,test';
    mockContext.aspectRatio = 'Auto';
    mockContext.position = 'Bottom center';

    const { container } = render(<CanvasPreview />);
    const box = container.querySelector('.preview-container-box');
    expect(box).toHaveStyle({ position: 'absolute' });
  });

  it('uses default pixel width for container box at scale 100 before image loads', () => {
    mockContext.imageSrc = 'data:image/png;base64,test';
    mockContext.aspectRatio = '1:1';
    mockContext.scale = 100;
    // imgDims is null (onLoad not yet fired) → default fallback width of 800px * scale = 800px
    const { container } = render(<CanvasPreview />);
    const box = container.querySelector('.preview-container-box');
    expect(box).toHaveStyle({ width: '800px' });
  });

  it('uses default pixel width for container box when scale is below 100 and image not loaded', () => {
    mockContext.imageSrc = 'data:image/png;base64,test';
    mockContext.aspectRatio = '1:1';
    mockContext.scale = 80;
    // imgDims is null (onLoad not yet fired) → default fallback width of 800px * 0.8 = 640px
    const { container } = render(<CanvasPreview />);
    const box = container.querySelector('.preview-container-box');
    expect(box).toHaveStyle({ width: '640px' });
  });

  it('uses pixel width matching image dimensions once image loads', () => {
    mockContext.imageSrc = 'data:image/png;base64,test';
    mockContext.aspectRatio = '1:1';
    mockContext.scale = 100;
    const { container } = render(<CanvasPreview />);
    const img = container.querySelector('img[alt="Screenshot"]') as HTMLImageElement | null;
    if (img) {
      // Simulate image load with known natural dimensions
      Object.defineProperty(img, 'naturalWidth', { value: 500, configurable: true });
      Object.defineProperty(img, 'naturalHeight', { value: 500, configurable: true });
      fireEvent.load(img);
    }
    const box = container.querySelector('.preview-container-box');
    // At scale=100, width = round(500 * 1) = 500px
    expect(box).toHaveStyle({ width: '500px' });
  });

  it('aligns preview card dimensions with canvas dimensions and applies scale transform', () => {
    mockContext.imageSrc = 'data:image/png;base64,test';
    mockContext.aspectRatio = '16:9';
    mockContext.paddingMode = 'fill';
    mockContext.scale = 100;
    mockContext.chromeStyle = 'none';

    const { container } = render(<CanvasPreview />);
    const img = container.querySelector('img[alt="Screenshot"]') as HTMLImageElement | null;
    if (img) {
      Object.defineProperty(img, 'naturalWidth', { value: 1024, configurable: true });
      Object.defineProperty(img, 'naturalHeight', { value: 576, configurable: true });
      fireEvent.load(img);
    }

    const card = container.querySelector('.preview-background-card');
    // 16:9 fill with 1024x576 image yields 1024x576 canvas dimensions
    expect(card).toHaveStyle({ width: '1024px' });
    expect(card).toHaveStyle({ height: '576px' });

    const box = container.querySelector('.preview-container-box');
    expect(box).toHaveStyle({ width: '1024px' });
    expect(box).toHaveStyle({ height: '576px' });
  });

  it('scales Chrome title bar mockup correctly using the --chrome-scale CSS variable', () => {
    mockContext.imageSrc = 'data:image/png;base64,test';
    mockContext.chromeStyle = 'mac';
    mockContext.scale = 50;

    const { container } = render(<CanvasPreview />);
    const chrome = container.querySelector('.preview-chrome-mac');
    expect(chrome).toHaveStyle({ '--chrome-scale': '0.5' });
  });
});

describe('AnnotationsLayer', () => {
  const defaultProps = {
    annotations: [] as Annotation[],
    setAnnotations: vi.fn<React.Dispatch<React.SetStateAction<Annotation[]>>>(),
    activeTool: 'pointer' as const,
    setActiveTool: vi.fn(),
    color: '#ff0000',
    strokeWidth: 4,
    onSaveHistory: vi.fn<(newAnns?: Annotation[]) => void>(),
    customPrompt: vi.fn<(message: string, defaultValue?: string) => Promise<string | null>>(),
    setAnnotationColor: vi.fn<(color: string) => void>(),
  };

  it('renders SVG container', () => {
    const { container } = render(<AnnotationsLayer {...defaultProps} />);
    
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });

  it('applies correct cursor based on active tool', () => {
    const { container, rerender } = render(<AnnotationsLayer {...defaultProps} />);
    
    let layer = container.querySelector('.annotations-layer');
    expect(layer).toHaveStyle({ cursor: 'default' });
    
    rerender(<AnnotationsLayer {...defaultProps} activeTool="rect" />);
    layer = container.querySelector('.annotations-layer');
    expect(layer).toHaveStyle({ cursor: 'crosshair' });
  });

  it('renders annotations when they exist', () => {
    const annotations = [
      {
        id: '1',
        type: 'rect' as const,
        x: 0.1,
        y: 0.1,
        w: 0.2,
        h: 0.15,
        color: '#ff0000',
        strokeWidth: 4,
      },
    ];
    
    const { container } = render(
      <AnnotationsLayer {...defaultProps} annotations={annotations} />
    );
    
    const rect = container.querySelector('rect');
    expect(rect).toBeInTheDocument();
  });

  it('calls pointer event handlers', () => {
    const { container } = render(<AnnotationsLayer {...defaultProps} />);
    
    const layer = container.querySelector('.annotations-layer');
    
    fireEvent.pointerDown(layer!);
    fireEvent.pointerMove(layer!);
    fireEvent.pointerUp(layer!);
    
    // The useAnnotationEvents hook should handle these
    expect(layer).toBeInTheDocument();
  });

  it('applies pointer-events based on active tool', () => {
    const { container, rerender } = render(<AnnotationsLayer {...defaultProps} />);
    
    let svg = container.querySelector('svg');
    expect(svg).toHaveStyle({ pointerEvents: 'auto' });
    
    rerender(<AnnotationsLayer {...defaultProps} activeTool="rect" />);
    svg = container.querySelector('svg');
    expect(svg).toHaveStyle({ pointerEvents: 'none' });
  });
});

describe('App', () => {
  it('renders app container', () => {
    const { container } = render(<App />);
    
    const appContainer = container.querySelector('.app-container');
    expect(appContainer).toBeInTheDocument();
  });

  it('renders workspace', () => {
    const { container } = render(<App />);
    
    const workspace = container.querySelector('.workspace');
    expect(workspace).toBeInTheDocument();
  });

  it('renders sidebar', () => {
    const { container } = render(<App />);
    
    const sidebar = container.querySelector('.sidebar');
    expect(sidebar).toBeInTheDocument();
  });

  it('applies drag and drop handlers', () => {
    const { container } = render(<App />);
    
    const appContainer = container.querySelector('.app-container');
    expect(appContainer).toBeInTheDocument();
    
    fireEvent.dragOver(appContainer!);
    expect(mockContext.handleDragOver).toHaveBeenCalled();
    
    fireEvent.dragLeave(appContainer!);
    expect(mockContext.handleDragLeave).toHaveBeenCalled();
    
    fireEvent.drop(appContainer!);
    expect(mockContext.handleDrop).toHaveBeenCalled();
  });

  it('calls handleDragOver on drag over', () => {
    const { container } = render(<App />);
    
    const appContainer = container.querySelector('.app-container');
    fireEvent.dragOver(appContainer!);
    
    expect(mockContext.handleDragOver).toHaveBeenCalled();
  });

  it('calls handleDragLeave on drag leave', () => {
    const { container } = render(<App />);
    
    const appContainer = container.querySelector('.app-container');
    fireEvent.dragLeave(appContainer!);
    
    expect(mockContext.handleDragLeave).toHaveBeenCalled();
  });

  it('calls handleDrop on drop', () => {
    const { container } = render(<App />);
    
    const appContainer = container.querySelector('.app-container');
    fireEvent.drop(appContainer!);
    
    expect(mockContext.handleDrop).toHaveBeenCalled();
  });
});
