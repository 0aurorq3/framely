import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import InspectorSection from '../src/renderer/components/InspectorSection';
import PromptModal from '../src/renderer/components/PromptModal';
import WorkspaceFooter from '../src/renderer/components/WorkspaceFooter';
import ExtraSettings from '../src/renderer/components/ExtraSettings';

// Mock AppContext
vi.mock('../src/renderer/AppContext', () => ({
  useAppContext: () => mockContext,
}));

vi.mock('../src/renderer/contexts/BurstPackContext', () => ({
  useBurstPackContext: () => ({
    openModal: vi.fn(),
    toast: null,
  }),
}));

let mockContext: any = {};

beforeEach(() => {
  mockContext = {
    imageSrc: 'data:image/png;base64,test',
    noImageMode: false,
    sidebarPosition: 'left',
    setSidebarPosition: vi.fn(),
    vibePalette: null,
    vibeVariantIndex: -1,
    vibeUpdateDrawColor: true,
    setVibeUpdateDrawColor: vi.fn(),
    applyAutoVibe: vi.fn(),
    exportFormat: 'png',
    setExportFormat: vi.fn(),
    jpegQuality: 90,
    setJpegQuality: vi.fn(),
    compressionMode: 'balanced',
    setCompressionMode: vi.fn(),
    triggerExport: vi.fn(),
    copyBeautifiedImage: vi.fn(),
    toastMessage: null,
    promptConfig: null,
    setPromptConfig: vi.fn(),
    chromeStyle: 'none',
    setChromeStyle: vi.fn(),
    chromeTheme: 'dark',
    setChromeTheme: vi.fn(),
    annotationColor: '#ff0000',
    setAnnotationColor: vi.fn(),
    annotationStrokeWidth: 4,
    setAnnotationStrokeWidth: vi.fn(),
    activeTool: 'text',
    annotations: [],
    setAnnotations: vi.fn(),
    watermarkEnabled: false,
    setWatermarkEnabled: vi.fn(),
    watermarkText: '',
    setWatermarkText: vi.fn(),
    watermarkSize: 20,
    setWatermarkSize: vi.fn(),
    watermarkPosition: 'middle',
    setWatermarkPosition: vi.fn(),
    watermarkOpacity: 0.45,
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
    annotationGradientEnabled: false,
    setAnnotationGradientEnabled: vi.fn(),
    annotationGradientColor1: '#ff0080',
    setAnnotationGradientColor1: vi.fn(),
    annotationGradientColor2: '#7928ca',
    setAnnotationGradientColor2: vi.fn(),
    annotationGradientAngle: 135,
    setAnnotationGradientAngle: vi.fn(),
    systemFonts: [],
    handleSliderRelease: vi.fn(),
    getCurrentConfig: vi.fn(() => ({})),
    pushHistory: vi.fn(),
    clearWorkspace: vi.fn(),
  };
});

describe('InspectorSection', () => {
  it('renders with title and children', () => {
    render(
      <InspectorSection title="Test Section">
        <div>Test Content</div>
      </InspectorSection>
    );
    
    expect(screen.getByText('Test Section')).toBeInTheDocument();
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('is open by default', () => {
    const { container } = render(
      <InspectorSection title="Test">
        <div>Content</div>
      </InspectorSection>
    );
    
    const section = container.querySelector('.inspector-section');
    expect(section).toHaveClass('open');
  });

  it('toggles open/closed on header click', () => {
    const { container } = render(
      <InspectorSection title="Test">
        <div>Content</div>
      </InspectorSection>
    );
    
    const header = screen.getByText('Test');
    const section = container.querySelector('.inspector-section');
    
    expect(section).toHaveClass('open');
    
    fireEvent.click(header);
    expect(section).not.toHaveClass('open');
    
    fireEvent.click(header);
    expect(section).toHaveClass('open');
  });

  it('respects defaultOpen prop', () => {
    const { container } = render(
      <InspectorSection title="Test" defaultOpen={false}>
        <div>Content</div>
      </InspectorSection>
    );
    
    const section = container.querySelector('.inspector-section');
    expect(section).not.toHaveClass('open');
  });
});

describe('PromptModal', () => {
  it('returns null when promptConfig is null', () => {
    const { container } = render(<PromptModal />);
    expect(container.firstChild).toBeNull();
  });

  it('renders modal when promptConfig exists', () => {
    mockContext.promptConfig = {
      message: 'Enter value',
      defaultValue: 'test',
      resolve: vi.fn(),
    };
    
    render(<PromptModal />);
    
    expect(screen.getByText('Enter value')).toBeInTheDocument();
    expect(screen.getByDisplayValue('test')).toBeInTheDocument();
    expect(screen.getByText('OK')).toBeInTheDocument();
    expect(screen.getByText('Cancel')).toBeInTheDocument();
  });

  it('calls resolve with value and closes on OK click', () => {
    const resolve = vi.fn();
    mockContext.promptConfig = {
      message: 'Enter value',
      defaultValue: '',
      resolve,
    };
    
    render(<PromptModal />);
    
    const input = screen.getByRole('textbox') as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'new value' } });
    fireEvent.click(screen.getByText('OK'));
    
    expect(resolve).toHaveBeenCalledWith('new value');
    expect(mockContext.setPromptConfig).toHaveBeenCalledWith(null);
  });

  it('calls resolve with null and closes on Cancel click', () => {
    const resolve = vi.fn();
    mockContext.promptConfig = {
      message: 'Enter value',
      defaultValue: '',
      resolve,
    };
    
    render(<PromptModal />);
    
    fireEvent.click(screen.getByText('Cancel'));
    
    expect(resolve).toHaveBeenCalledWith(null);
    expect(mockContext.setPromptConfig).toHaveBeenCalledWith(null);
  });

  it('calls resolve with value on Enter key', () => {
    const resolve = vi.fn();
    mockContext.promptConfig = {
      message: 'Enter value',
      defaultValue: '',
      resolve,
    };
    
    render(<PromptModal />);
    
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'enter value' } });
    fireEvent.keyDown(input, { key: 'Enter' });
    
    expect(resolve).toHaveBeenCalledWith('enter value');
    expect(mockContext.setPromptConfig).toHaveBeenCalledWith(null);
  });

  it('calls resolve with null on Escape key', () => {
    const resolve = vi.fn();
    mockContext.promptConfig = {
      message: 'Enter value',
      defaultValue: '',
      resolve,
    };
    
    render(<PromptModal />);
    
    const input = screen.getByRole('textbox');
    fireEvent.keyDown(input, { key: 'Escape' });
    
    expect(resolve).toHaveBeenCalledWith(null);
    expect(mockContext.setPromptConfig).toHaveBeenCalledWith(null);
  });
});

describe('WorkspaceFooter', () => {
  it('returns null when no image and not in no-image mode', () => {
    mockContext.imageSrc = null;
    mockContext.noImageMode = false;
    
    const { container } = render(<WorkspaceFooter />);
    expect(container.firstChild).toBeNull();
  });

  it('renders when image exists', () => {
    render(<WorkspaceFooter />);
    
    expect(screen.getByText('PNG')).toBeInTheDocument();
    expect(screen.getByText('JPG')).toBeInTheDocument();
    expect(screen.getByText('Export')).toBeInTheDocument();
    expect(screen.getByText('Copy')).toBeInTheDocument();
  });

  it('renders when in no-image mode', () => {
    mockContext.imageSrc = null;
    mockContext.noImageMode = true;
    
    render(<WorkspaceFooter />);
    
    expect(screen.getByText('PNG')).toBeInTheDocument();
    expect(screen.getByText('Export')).toBeInTheDocument();
  });

  it('toggles export format', () => {
    render(<WorkspaceFooter />);
    
    fireEvent.click(screen.getByText('JPG'));
    expect(mockContext.setExportFormat).toHaveBeenCalledWith('jpeg');
    
    fireEvent.click(screen.getByText('PNG'));
    expect(mockContext.setExportFormat).toHaveBeenCalledWith('png');
  });

  it('shows quality slider when JPEG selected', () => {
    mockContext.exportFormat = 'jpeg';
    
    render(<WorkspaceFooter />);
    
    expect(screen.getByText('Quality')).toBeInTheDocument();
    expect(screen.getByText('90%')).toBeInTheDocument();
  });

  it('hides quality slider when PNG selected', () => {
    mockContext.exportFormat = 'png';
    
    render(<WorkspaceFooter />);
    
    expect(screen.queryByText('Quality')).not.toBeInTheDocument();
  });

  it('calls triggerExport on Export click', () => {
    render(<WorkspaceFooter />);
    
    fireEvent.click(screen.getByText('Export'));
    expect(mockContext.triggerExport).toHaveBeenCalled();
  });

  it('calls copyBeautifiedImage on Copy click', () => {
    render(<WorkspaceFooter />);
    
    fireEvent.click(screen.getByText('Copy'));
    expect(mockContext.copyBeautifiedImage).toHaveBeenCalled();
  });
});

describe('ExtraSettings', () => {
  it('renders browser mockup select', () => {
    render(<ExtraSettings />);
    
    expect(screen.getByText('Browser Mockup')).toBeInTheDocument();
    const select = screen.getAllByRole('combobox')[0];
    expect(select).toBeInTheDocument();
  });

  it('changes chrome style', () => {
    render(<ExtraSettings />);
    
    const select = screen.getAllByRole('combobox')[0];
    fireEvent.change(select, { target: { value: 'mac' } });
    
    expect(mockContext.setChromeStyle).toHaveBeenCalledWith('mac');
    expect(mockContext.pushHistory).toHaveBeenCalled();
  });

  it('shows theme buttons when chrome style is not none', () => {
    mockContext.chromeStyle = 'mac';
    
    render(<ExtraSettings />);
    
    expect(screen.getByText('Dark Theme')).toBeInTheDocument();
    expect(screen.getByText('Light Theme')).toBeInTheDocument();
  });

  it('hides theme buttons when chrome style is none', () => {
    mockContext.chromeStyle = 'none';
    
    render(<ExtraSettings />);
    
    expect(screen.queryByText('Dark Theme')).not.toBeInTheDocument();
    expect(screen.queryByText('Light Theme')).not.toBeInTheDocument();
  });

  it('changes chrome theme', () => {
    mockContext.chromeStyle = 'mac';
    
    render(<ExtraSettings />);
    
    fireEvent.click(screen.getByText('Dark Theme'));
    expect(mockContext.setChromeTheme).toHaveBeenCalledWith('dark');
    
    fireEvent.click(screen.getByText('Light Theme'));
    expect(mockContext.setChromeTheme).toHaveBeenCalledWith('light');
  });

  it('renders annotation color picker', () => {
    render(<ExtraSettings />);
    
    expect(screen.getByText('Annotation Style')).toBeInTheDocument();
    const colorInputs = screen.getAllByDisplayValue('#ff0000');
    expect(colorInputs.length).toBeGreaterThan(0);
  });

  it('changes annotation color', () => {
    render(<ExtraSettings />);
    
    const colorInput = screen.getAllByDisplayValue('#ff0000')[0];
    fireEvent.change(colorInput, { target: { value: '#00ff00' } });
    
    expect(mockContext.setAnnotationColor).toHaveBeenCalledWith('#00ff00');
  });

  it('renders stroke width slider', () => {
    render(<ExtraSettings />);
    
    expect(screen.getByText('4px')).toBeInTheDocument();
  });

  it('changes stroke width', () => {
    render(<ExtraSettings />);
    
    const slider = screen.getAllByRole('slider')[0];
    fireEvent.change(slider, { target: { value: '8' } });
    
    expect(mockContext.setAnnotationStrokeWidth).toHaveBeenCalledWith(8);
  });

  it('shows clear annotations button when annotations exist', () => {
    mockContext.annotations = [{ id: '1', type: 'rect', x: 0, y: 0, w: 0.1, h: 0.1, color: '#fff', strokeWidth: 2 }];
    
    render(<ExtraSettings />);
    
    expect(screen.getByText('Clear Annotations')).toBeInTheDocument();
  });

  it('hides clear annotations button when no annotations', () => {
    mockContext.annotations = [];
    
    render(<ExtraSettings />);
    
    expect(screen.queryByText('Clear Annotations')).not.toBeInTheDocument();
  });

  it('clears annotations on button click', () => {
    mockContext.annotations = [{ id: '1', type: 'rect', x: 0, y: 0, w: 0.1, h: 0.1, color: '#fff', strokeWidth: 2 }];
    
    render(<ExtraSettings />);
    
    fireEvent.click(screen.getByText('Clear Annotations'));
    
    expect(mockContext.setAnnotations).toHaveBeenCalledWith([]);
    expect(mockContext.pushHistory).toHaveBeenCalled();
  });

  it('renders watermark toggle', () => {
    render(<ExtraSettings />);
    
    expect(screen.getByText('Watermark')).toBeInTheDocument();
  });

  it('toggles watermark', () => {
    render(<ExtraSettings />);

    const watermarkLabel = screen.getByText('Watermark');
    const switchContainer = watermarkLabel.closest('.switch-container');
    const checkbox = switchContainer!.querySelector('input[type="checkbox"]') as HTMLInputElement;
    fireEvent.click(checkbox);

    expect(mockContext.setWatermarkEnabled).toHaveBeenCalledWith(true);
    expect(mockContext.pushHistory).toHaveBeenCalled();
  });

  it('shows watermark text input when enabled', () => {
    mockContext.watermarkEnabled = true;
    
    render(<ExtraSettings />);
    
    expect(screen.getByPlaceholderText('Watermark text...')).toBeInTheDocument();
  });

  it('hides watermark text input when disabled', () => {
    mockContext.watermarkEnabled = false;
    
    render(<ExtraSettings />);
    
    expect(screen.queryByPlaceholderText('Watermark text...')).not.toBeInTheDocument();
  });

  it('changes watermark text', () => {
    mockContext.watermarkEnabled = true;
    
    render(<ExtraSettings />);
    
    const input = screen.getByPlaceholderText('Watermark text...');
    fireEvent.change(input, { target: { value: 'My Watermark' } });
    
    expect(mockContext.setWatermarkText).toHaveBeenCalledWith('My Watermark');
  });

  it('changes watermark position', () => {
    mockContext.watermarkEnabled = true;
    render(<ExtraSettings />);
    
    const select = screen.getByDisplayValue('Bottom Center');
    fireEvent.change(select, { target: { value: 'top right' } });
    
    expect(mockContext.setWatermarkPosition).toHaveBeenCalledWith('top right');
  });

  it('changes watermark opacity', () => {
    mockContext.watermarkEnabled = true;
    render(<ExtraSettings />);
    
    const slider = screen.getAllByRole('slider')[4];
    fireEvent.change(slider, { target: { value: '75' } });
    
    expect(mockContext.setWatermarkOpacity).toHaveBeenCalledWith(0.75);
  });
});
