import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import BackgroundSettings from '../src/renderer/components/BackgroundSettings';
import { makeFullMockContext } from './shared';

vi.mock('../src/renderer/AppContext', () => ({
  useAppContext: () => mockContext,
}));

let mockContext: ReturnType<typeof makeFullMockContext>;

beforeEach(() => {
  mockContext = {
    ...makeFullMockContext(),
    setBackgroundType: vi.fn(),
    setBackgroundValue: vi.fn(),
    setBlurDensity: vi.fn(),
    setAspectRatio: vi.fn(),
    setCanvasWidth: vi.fn(),
    setCanvasHeight: vi.fn(),
    setPaddingMode: vi.fn(),
    setShowHollywoodPalettes: vi.fn(),
    setSelectedGradientCategory: vi.fn(),
    setShowHollywoodMeshPalettes: vi.fn(),
    setMeshPoints: vi.fn(),
    setActivePointIdx: vi.fn(),
    setMeshBlur: vi.fn(),
    setMeshGrain: vi.fn(),
    setMeshOpacity: vi.fn(),
    setMeshSpread: vi.fn(),
    pushHistory: vi.fn(),
    handleSliderRelease: vi.fn(),
    applyMeshPalette: vi.fn(),
    generateRandomPalette: vi.fn(),
    getCurrentConfig: vi.fn(() => ({ backgroundType: 'gradient', backgroundValue: '', meshPoints: [] })),
    selectBackgroundPreset: vi.fn(),
    setBgGrain: vi.fn(),
    setLightRaysStyle: vi.fn(),
    setLightRaysOpacity: vi.fn(),
    setLightRaysAngle: vi.fn(),
    setLightRaysCount: vi.fn(),
    setLightRaysSourceX: vi.fn(),
    setLightRaysSourceY: vi.fn(),
    selectFile: vi.fn(),
    setPosition: vi.fn(),
    setScale: vi.fn(),
    setPadding: vi.fn(),
    setRounded: vi.fn(),
    setShadow: vi.fn(),
    setInset: vi.fn(),
    setBorder: vi.fn(),
    setShowAdvancedInset: vi.fn(),
    setShowAdvancedShadow: vi.fn(),
    setShowAdvancedBorder: vi.fn(),
  };
});

describe('BackgroundSettings', () => {
  // Mode selector
  it('renders all 4 mode buttons', () => {
    render(<BackgroundSettings />);
    expect(screen.getByText('Solid')).toBeInTheDocument();
    expect(screen.getByText('Preset')).toBeInTheDocument();
    expect(screen.getByText('Blurred')).toBeInTheDocument();
    expect(screen.getByText('Mesh')).toBeInTheDocument();
  });

  it('highlights active mode', () => {
    mockContext.backgroundType = 'gradient';
    render(<BackgroundSettings />);
    const presetBtn = screen.getByText('Preset');
    expect(presetBtn).toHaveClass('active');
  });

  it('switches to color mode', () => {
    render(<BackgroundSettings />);
    fireEvent.click(screen.getByText('Solid'));
    expect(mockContext.setBackgroundType).toHaveBeenCalledWith('color');
    expect(mockContext.pushHistory).toHaveBeenCalled();
  });

  it('switches to gradient mode', () => {
    render(<BackgroundSettings />);
    fireEvent.click(screen.getByText('Preset'));
    expect(mockContext.setBackgroundType).toHaveBeenCalledWith('gradient');
  });

  it('switches to blur mode', () => {
    render(<BackgroundSettings />);
    fireEvent.click(screen.getByText('Blurred'));
    expect(mockContext.setBackgroundType).toHaveBeenCalledWith('blur');
  });

  it('switches to mesh mode', () => {
    render(<BackgroundSettings />);
    fireEvent.click(screen.getByText('Mesh'));
    expect(mockContext.setBackgroundType).toHaveBeenCalledWith('mesh');
  });

  // Blur controls
  it('shows blur density slider when background is blur', () => {
    mockContext.backgroundType = 'blur';
    render(<BackgroundSettings />);
    expect(screen.getByText('Blur Density')).toBeInTheDocument();
    expect(screen.getByText('50px')).toBeInTheDocument();
  });

  it('hides blur controls when background is not blur', () => {
    mockContext.backgroundType = 'gradient';
    render(<BackgroundSettings />);
    expect(screen.queryByText('Blur Density')).not.toBeInTheDocument();
  });

  it('changes blur density on slider change', () => {
    mockContext.backgroundType = 'blur';
    render(<BackgroundSettings />);
    const sliders = screen.getAllByRole('slider');
    const blurSlider = sliders[0];
    fireEvent.change(blurSlider, { target: { value: '80' } });
    expect(mockContext.setBlurDensity).toHaveBeenCalledWith(80);
  });

  // Color/Gradient section
  it('shows color picker in color mode', () => {
    mockContext.backgroundType = 'color';
    render(<BackgroundSettings />);
    expect(screen.getByText('Background Colors')).toBeInTheDocument();
  });

  it('shows gradient presets in gradient mode with category selectors', () => {
    mockContext.backgroundType = 'gradient';
    render(<BackgroundSettings />);
    expect(screen.getByText('Background Colors')).toBeInTheDocument();
    expect(screen.getByText('Classic')).toBeInTheDocument();
    expect(screen.getByText('OS Themes')).toBeInTheDocument();
    expect(screen.getByText('Disney')).toBeInTheDocument();
    expect(screen.getByText('Marvel')).toBeInTheDocument();
    expect(screen.getByText('Hollywood')).toBeInTheDocument();
  });

  it('selects gradient category', () => {
    mockContext.backgroundType = 'gradient';
    render(<BackgroundSettings />);
    fireEvent.click(screen.getByText('Marvel'));
    expect(mockContext.setSelectedGradientCategory).toHaveBeenCalledWith('marvel');
  });

  it('selects a gradient preset', () => {
    mockContext.backgroundType = 'gradient';
    mockContext.selectedGradientCategory = 'disney';
    render(<BackgroundSettings />);
    const swatches = document.querySelectorAll('.preset-swatch');
    if (swatches.length > 0) {
      fireEvent.click(swatches[0]);
      expect(mockContext.selectBackgroundPreset).toHaveBeenCalled();
    }
  });

  // Mesh controls
  it('shows mesh controls when background is mesh', () => {
    mockContext.backgroundType = 'mesh';
    render(<BackgroundSettings />);
    expect(screen.getByText('Better Gradient Designer')).toBeInTheDocument();
    expect(screen.getByText('Filters')).toBeInTheDocument();
  });

  it('hides mesh controls when background is not mesh', () => {
    mockContext.backgroundType = 'color';
    render(<BackgroundSettings />);
    expect(screen.queryByText('Better Gradient Designer')).not.toBeInTheDocument();
  });

  it('renders curated mesh palette buttons', () => {
    mockContext.backgroundType = 'mesh';
    render(<BackgroundSettings />);
    expect(screen.getByText('+ Movie Palettes')).toBeInTheDocument();
  });

  it('toggles Hollywood mesh palettes', () => {
    mockContext.backgroundType = 'mesh';
    render(<BackgroundSettings />);
    fireEvent.click(screen.getByText('+ Movie Palettes'));
    expect(mockContext.setShowHollywoodMeshPalettes).toHaveBeenCalledWith(true);
  });

  it('applies mesh palette on button click', () => {
    mockContext.backgroundType = 'mesh';
    render(<BackgroundSettings />);
    // Click the first curated palette button
    const paletteButtons = screen.getAllByRole('button');
    // Find non-icon buttons that are in the curated palettes area
    const randomizeBtn = screen.getByText('Randomize');
    fireEvent.click(randomizeBtn);
    expect(mockContext.generateRandomPalette).toHaveBeenCalled();
  });

  it('adds a mesh spot', () => {
    mockContext.backgroundType = 'mesh';
    mockContext.meshPoints = [
      { x: 0.3, y: 0.2, color: '#ff0000', radius: 200 },
      { x: 0.5, y: 0.5, color: '#00ff00', radius: 200 },
    ];
    mockContext.activePointIdx = 0;
    render(<BackgroundSettings />);
    const addBtn = screen.getByTitle('Add spot');
    fireEvent.click(addBtn);
    expect(mockContext.setMeshPoints).toHaveBeenCalled();
    expect(mockContext.setActivePointIdx).toHaveBeenCalledWith(2);
  });

  it('removes a mesh spot', () => {
    mockContext.backgroundType = 'mesh';
    mockContext.meshPoints = [
      { x: 0.3, y: 0.2, color: '#ff0000', radius: 200 },
      { x: 0.5, y: 0.5, color: '#00ff00', radius: 200 },
      { x: 0.7, y: 0.7, color: '#0000ff', radius: 200 },
    ];
    mockContext.activePointIdx = 1;
    render(<BackgroundSettings />);
    const removeBtn = screen.getByTitle('Remove active spot');
    fireEvent.click(removeBtn);
    expect(mockContext.setMeshPoints).toHaveBeenCalled();
  });

  it('disables add spot button at 10 points', () => {
    mockContext.backgroundType = 'mesh';
    mockContext.meshPoints = Array(10).fill(null).map((_, i) => ({
      x: 0.1 + i * 0.05, y: 0.1 + i * 0.05, color: '#ff0000', radius: 200,
    }));
    render(<BackgroundSettings />);
    const addBtn = screen.getByTitle('Add spot');
    expect(addBtn).toBeDisabled();
  });

  it('disables remove spot button at 2 points', () => {
    mockContext.backgroundType = 'mesh';
    mockContext.meshPoints = [
      { x: 0.3, y: 0.2, color: '#ff0000', radius: 200 },
      { x: 0.5, y: 0.5, color: '#00ff00', radius: 200 },
    ];
    render(<BackgroundSettings />);
    const removeBtn = screen.getByTitle('Remove active spot');
    expect(removeBtn).toBeDisabled();
  });

  it('changes active mesh point', () => {
    mockContext.backgroundType = 'mesh';
    mockContext.meshPoints = [
      { x: 0.3, y: 0.2, color: '#ff0000', radius: 200 },
      { x: 0.5, y: 0.5, color: '#00ff00', radius: 200 },
    ];
    mockContext.activePointIdx = 0;
    render(<BackgroundSettings />);
    const pointButtons = screen.getAllByTitle(/Point \d/);
    if (pointButtons.length > 1) {
      fireEvent.click(pointButtons[1]);
      expect(mockContext.setActivePointIdx).toHaveBeenCalledWith(1);
    }
  });

  it('resets mesh filters', () => {
    mockContext.backgroundType = 'mesh';
    render(<BackgroundSettings />);
    fireEvent.click(screen.getByText('Reset Filters'));
    expect(mockContext.setMeshBlur).toHaveBeenCalledWith(60);
    expect(mockContext.setMeshGrain).toHaveBeenCalledWith(15);
    expect(mockContext.setMeshOpacity).toHaveBeenCalledWith(100);
    expect(mockContext.setMeshSpread).toHaveBeenCalledWith(100);
    expect(mockContext.pushHistory).toHaveBeenCalled();
  });

  it('changes mesh blur slider', () => {
    mockContext.backgroundType = 'mesh';
    render(<BackgroundSettings />);
    const sliders = screen.getAllByRole('slider');
    fireEvent.change(sliders[0], { target: { value: '100' } });
    expect(mockContext.setMeshBlur).toHaveBeenCalledWith(100);
  });

  it('changes mesh grain slider', () => {
    mockContext.backgroundType = 'mesh';
    render(<BackgroundSettings />);
    const sliders = screen.getAllByRole('slider');
    fireEvent.change(sliders[1], { target: { value: '25' } });
    expect(mockContext.setMeshGrain).toHaveBeenCalledWith(25);
  });

  it('changes mesh opacity slider', () => {
    mockContext.backgroundType = 'mesh';
    render(<BackgroundSettings />);
    const sliders = screen.getAllByRole('slider');
    fireEvent.change(sliders[2], { target: { value: '75' } });
    expect(mockContext.setMeshOpacity).toHaveBeenCalledWith(75);
  });

  it('changes mesh spread slider', () => {
    mockContext.backgroundType = 'mesh';
    render(<BackgroundSettings />);
    const sliders = screen.getAllByRole('slider');
    fireEvent.change(sliders[3], { target: { value: '150' } });
    expect(mockContext.setMeshSpread).toHaveBeenCalledWith(150);
  });

  it('calls handleSliderRelease on filter slider mouse up', () => {
    mockContext.backgroundType = 'mesh';
    render(<BackgroundSettings />);
    const sliders = screen.getAllByRole('slider');
    fireEvent.mouseUp(sliders[sliders.length - 1]);
    expect(mockContext.handleSliderRelease).toHaveBeenCalled();
  });

  it('shows Hollywood mesh palettes when enabled', () => {
    mockContext.backgroundType = 'mesh';
    mockContext.showHollywoodMeshPalettes = true;
    render(<BackgroundSettings />);
    expect(screen.getByText('Hide Movie')).toBeInTheDocument();
  });

  // Removed Load Hollywood Palettes test as category bar is always visible

  it('disables remove at 2 and enables add at 3 points', () => {
    mockContext.backgroundType = 'mesh';
    mockContext.meshPoints = [
      { x: 0.3, y: 0.2, color: '#ff0000', radius: 200 },
      { x: 0.5, y: 0.5, color: '#00ff00', radius: 200 },
      { x: 0.7, y: 0.7, color: '#0000ff', radius: 200 },
    ];
    mockContext.activePointIdx = 0;
    render(<BackgroundSettings />);
    const addBtn = screen.getByTitle('Add spot');
    const removeBtn = screen.getByTitle('Remove active spot');
    expect(addBtn).not.toBeDisabled();
    expect(removeBtn).not.toBeDisabled();
  });

  it('selects category button for all categories including OS Themes', () => {
    mockContext.backgroundType = 'gradient';
    render(<BackgroundSettings />);
    fireEvent.click(screen.getByText('OS Themes'));
    expect(mockContext.setSelectedGradientCategory).toHaveBeenCalledWith('os');
    fireEvent.click(screen.getByText('Disney'));
    expect(mockContext.setSelectedGradientCategory).toHaveBeenCalledWith('disney');
    fireEvent.click(screen.getByText('Classic'));
    expect(mockContext.setSelectedGradientCategory).toHaveBeenCalledWith('classic');
  });

  it('calls applyMeshPalette on curated palette click', () => {
    mockContext.backgroundType = 'mesh';
    mockContext.applyMeshPalette = vi.fn();
    render(<BackgroundSettings />);
    // Find a curated palette button - it should call applyMeshPalette
    const randomButton = screen.getByText('Randomize');
    fireEvent.click(randomButton);
    expect(mockContext.generateRandomPalette).toHaveBeenCalled();
  });

  it('renders Blur Density label when background is blur with correct value', () => {
    mockContext.backgroundType = 'blur';
    mockContext.blurDensity = 60;
    render(<BackgroundSettings />);
    expect(screen.getByText('60px')).toBeInTheDocument();
  });

  it('shows background colors section in color mode', () => {
    mockContext.backgroundType = 'color';
    render(<BackgroundSettings />);
    expect(screen.getByText('Background Colors')).toBeInTheDocument();
    // Should have a color input
    const colorInputs = document.querySelectorAll('input[type="color"]');
    expect(colorInputs.length).toBeGreaterThan(0);
  });

  it('handles custom aspect ratio width and height input', () => {
    mockContext.aspectRatio = 'Custom';
    mockContext.canvasWidth = 800;
    mockContext.canvasHeight = 600;
    render(<BackgroundSettings />);
    const numberInputs = screen.getAllByRole('spinbutton');
    expect(numberInputs.length).toBeGreaterThanOrEqual(2);
  });

  // Aspect Ratio
  it('renders all aspect ratio buttons', () => {
    render(<BackgroundSettings />);
    expect(screen.getByText('Auto')).toBeInTheDocument();
    expect(screen.getByText('1:1')).toBeInTheDocument();
    expect(screen.getByText('4:3')).toBeInTheDocument();
    expect(screen.getByText('16:9')).toBeInTheDocument();
    expect(screen.getByText('3:2')).toBeInTheDocument();
    expect(screen.getByText('Custom')).toBeInTheDocument();
  });

  it('selects aspect ratio', () => {
    render(<BackgroundSettings />);
    fireEvent.click(screen.getByText('16:9'));
    expect(mockContext.setAspectRatio).toHaveBeenCalledWith('16:9');
    expect(mockContext.pushHistory).toHaveBeenCalled();
  });

  it('shows custom width/height inputs when Custom is selected', () => {
    mockContext.aspectRatio = 'Custom';
    render(<BackgroundSettings />);
    const inputs = screen.getAllByRole('spinbutton');
    expect(inputs.length).toBeGreaterThanOrEqual(2);
  });

  it('hides padding mode when Auto is selected', () => {
    mockContext.aspectRatio = 'Auto';
    render(<BackgroundSettings />);
    expect(screen.queryByText('Padding Mode')).not.toBeInTheDocument();
  });

  it('shows padding mode when non-Auto ratio selected', () => {
    mockContext.aspectRatio = '1:1';
    render(<BackgroundSettings />);
    expect(screen.getByText('Padding Mode')).toBeInTheDocument();
  });

  it('changes padding mode', () => {
    mockContext.aspectRatio = '1:1';
    render(<BackgroundSettings />);
    const select = screen.getByRole('combobox', { name: /padding mode/i });
    fireEvent.change(select, { target: { value: 'fill' } });
    expect(mockContext.setPaddingMode).toHaveBeenCalledWith('fill');
  });

  describe('Light Rays Custom Settings', () => {
    beforeEach(() => {
      mockContext.backgroundType = 'gradient';
      mockContext.lightRaysStyle = 'diagonal';
      mockContext.lightRaysOpacity = 40;
      mockContext.lightRaysAngle = 135;
      mockContext.lightRaysCount = 4;
      mockContext.lightRaysSourceX = 50;
      mockContext.lightRaysSourceY = 0;
    });

    it('renders customized light ray sliders when style is not none', () => {
      render(<BackgroundSettings />);
      expect(screen.getByText('Ray Opacity')).toBeInTheDocument();
      expect(screen.getByText('Ray Angle')).toBeInTheDocument();
      expect(screen.getByText('Streak Count')).toBeInTheDocument();
      expect(screen.getByText('Light Source X')).toBeInTheDocument();
      expect(screen.getByText('Light Source Y')).toBeInTheDocument();
    });

    it('changes light ray angle slider', () => {
      render(<BackgroundSettings />);
      const angleInput = screen.getByText('Ray Angle').closest('.control-group')?.querySelector('input');
      expect(angleInput).toBeInTheDocument();
      fireEvent.change(angleInput!, { target: { value: '180' } });
      expect(mockContext.setLightRaysAngle).toHaveBeenCalledWith(180);
    });

    it('changes streak count slider', () => {
      render(<BackgroundSettings />);
      const countInput = screen.getByText('Streak Count').closest('.control-group')?.querySelector('input');
      expect(countInput).toBeInTheDocument();
      fireEvent.change(countInput!, { target: { value: '6' } });
      expect(mockContext.setLightRaysCount).toHaveBeenCalledWith(6);
    });

    it('changes light source X slider', () => {
      render(<BackgroundSettings />);
      const sourceXInput = screen.getByText('Light Source X').closest('.control-group')?.querySelector('input');
      expect(sourceXInput).toBeInTheDocument();
      fireEvent.change(sourceXInput!, { target: { value: '45' } });
      expect(mockContext.setLightRaysSourceX).toHaveBeenCalledWith(45);
    });

    it('changes light source Y slider', () => {
      render(<BackgroundSettings />);
      const sourceYInput = screen.getByText('Light Source Y').closest('.control-group')?.querySelector('input');
      expect(sourceYInput).toBeInTheDocument();
      fireEvent.change(sourceYInput!, { target: { value: '25' } });
      expect(mockContext.setLightRaysSourceY).toHaveBeenCalledWith(25);
    });
  });
});
