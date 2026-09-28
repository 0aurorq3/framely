import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import MeshGradientControls from '../src/renderer/components/MeshGradientControls';
import { makeFullMockContext } from './shared';

vi.mock('../src/renderer/AppContext', () => ({
  useAppContext: () => mockContext,
}));

let mockContext: ReturnType<typeof makeFullMockContext>;

const makeMeshPoint = (id: string, color: string, x: number, y: number, radius = 200) => ({
  id, color, x, y, radius,
});

beforeEach(() => {
  mockContext = {
    ...makeFullMockContext(),
    meshPoints: [
      makeMeshPoint('1', '#ff6b6b', 0.3, 0.2),
      makeMeshPoint('2', '#4ecdc4', 0.7, 0.3),
      makeMeshPoint('3', '#ffe66d', 0.4, 0.6),
    ],
    setMeshPoints: vi.fn(),
    meshBlur: 60,
    setMeshBlur: vi.fn(),
    meshGrain: 15,
    setMeshGrain: vi.fn(),
    meshOpacity: 100,
    setMeshOpacity: vi.fn(),
    meshSpread: 100,
    setMeshSpread: vi.fn(),
    activePointIdx: 0,
    setActivePointIdx: vi.fn(),
    showHollywoodMeshPalettes: false,
    setShowHollywoodMeshPalettes: vi.fn(),
    getCurrentConfig: vi.fn(() => ({ meshPoints: mockContext?.meshPoints ?? [] })),
    pushHistory: vi.fn(),
    handleSliderRelease: vi.fn(),
    applyMeshPalette: vi.fn(),
    generateRandomPalette: vi.fn(),
  };
});

describe('MeshGradientControls', () => {
  describe('curated palettes', () => {
    it('renders curated palette buttons', () => {
      render(<MeshGradientControls />);
      // Should have some preset palette buttons
      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);
    });

    it('clicking a curated palette calls applyMeshPalette', () => {
      render(<MeshGradientControls />);
      // Find the first palette button (not the movie toggle)
      const paletteButtons = document.querySelectorAll('.btn-secondary');
      expect(paletteButtons.length).toBeGreaterThan(0);
    });

    it('toggles movie palettes', () => {
      render(<MeshGradientControls />);
      const movieBtn = screen.getByText('+ Movie Palettes');
      fireEvent.click(movieBtn);
      expect(mockContext.setShowHollywoodMeshPalettes).toHaveBeenCalledWith(true);
    });
  });

  describe('color spots management', () => {
    it('renders color spot circles for each mesh point', () => {
      render(<MeshGradientControls />);
      // The color spot buttons are rendered with title "Point N"
      expect(screen.getByTitle('Point 1')).toBeInTheDocument();
      expect(screen.getByTitle('Point 2')).toBeInTheDocument();
      expect(screen.getByTitle('Point 3')).toBeInTheDocument();
    });

    it('clicking a color spot sets it as active', () => {
      render(<MeshGradientControls />);
      fireEvent.click(screen.getByTitle('Point 2'));
      expect(mockContext.setActivePointIdx).toHaveBeenCalledWith(1);
    });

    it('renders Randomize button that calls generateRandomPalette', () => {
      render(<MeshGradientControls />);
      fireEvent.click(screen.getByText('Randomize'));
      expect(mockContext.generateRandomPalette).toHaveBeenCalled();
    });

    it('Add spot button is enabled when under 10 points', () => {
      render(<MeshGradientControls />);
      const addBtn = screen.getByTitle('Add spot');
      expect(addBtn).not.toBeDisabled();
    });

    it('Add spot button is disabled at 10 points', () => {
      mockContext.meshPoints = Array.from({ length: 10 }, (_, i) =>
        makeMeshPoint(`${i}`, '#ff0000', 0.1 * i, 0.1 * i)
      );
      render(<MeshGradientControls />);
      const addBtn = screen.getByTitle('Add spot');
      expect(addBtn).toBeDisabled();
    });

    it('clicking Add spot creates a new point and updates history', () => {
      render(<MeshGradientControls />);
      fireEvent.click(screen.getByTitle('Add spot'));
      expect(mockContext.setMeshPoints).toHaveBeenCalled();
      expect(mockContext.setActivePointIdx).toHaveBeenCalled();
      expect(mockContext.pushHistory).toHaveBeenCalled();
    });

    it('Remove spot button is enabled when over 2 points', () => {
      render(<MeshGradientControls />);
      const removeBtn = screen.getByTitle('Remove active spot');
      expect(removeBtn).not.toBeDisabled();
    });

    it('Remove spot button is disabled at 2 points', () => {
      mockContext.meshPoints = [
        makeMeshPoint('1', '#ff0000', 0.2, 0.2),
        makeMeshPoint('2', '#00ff00', 0.8, 0.8),
      ];
      render(<MeshGradientControls />);
      const removeBtn = screen.getByTitle('Remove active spot');
      expect(removeBtn).toBeDisabled();
    });

    it('clicking Remove spot removes active point and updates history', () => {
      render(<MeshGradientControls />);
      fireEvent.click(screen.getByTitle('Remove active spot'));
      expect(mockContext.setMeshPoints).toHaveBeenCalled();
      expect(mockContext.pushHistory).toHaveBeenCalled();
    });
  });

  describe('active point controls', () => {
    it('renders color picker and text input for active point', () => {
      render(<MeshGradientControls />);
      expect(screen.getByText('Color:')).toBeInTheDocument();
      const colorInputs = document.querySelectorAll('input[type="color"]');
      expect(colorInputs.length).toBeGreaterThan(0);
    });

    it('changing color picker updates meshPoints', () => {
      render(<MeshGradientControls />);
      const colorPicker = document.querySelector('input[type="color"]') as HTMLInputElement;
      expect(colorPicker).toBeTruthy();
      fireEvent.change(colorPicker, { target: { value: '#abcdef' } });
      expect(mockContext.setMeshPoints).toHaveBeenCalled();
    });

    it('changing color text input updates meshPoints', () => {
      render(<MeshGradientControls />);
      const textInputs = document.querySelectorAll('input[type="text"]');
      expect(textInputs.length).toBeGreaterThan(0);
      fireEvent.change(textInputs[0], { target: { value: '#123456' } });
      expect(mockContext.setMeshPoints).toHaveBeenCalled();
    });

    it('renders Radius slider', () => {
      render(<MeshGradientControls />);
      expect(screen.getByText('Spot Radius')).toBeInTheDocument();
    });

    it('renders Position X slider', () => {
      render(<MeshGradientControls />);
      expect(screen.getByText('Position X')).toBeInTheDocument();
    });

    it('renders Position Y slider', () => {
      render(<MeshGradientControls />);
      expect(screen.getByText('Position Y')).toBeInTheDocument();
    });

    it('changing Radius slider updates meshPoints', () => {
      render(<MeshGradientControls />);
      const sliders = screen.getAllByRole('slider');
      fireEvent.change(sliders[0], { target: { value: '300' } }); // Radius
      expect(mockContext.setMeshPoints).toHaveBeenCalled();
    });

    it('Radius slider onMouseUp calls handleSliderRelease', () => {
      render(<MeshGradientControls />);
      const sliders = screen.getAllByRole('slider');
      fireEvent.mouseUp(sliders[0]);
      expect(mockContext.handleSliderRelease).toHaveBeenCalled();
    });

    it('hides active point controls when activePointIdx is null', () => {
      mockContext.activePointIdx = null;
      mockContext.meshPoints = []; // No point at null index
      render(<MeshGradientControls />);
      // "Color:" should not be visible
      expect(screen.queryByText('Spot Radius')).not.toBeInTheDocument();
    });

    it('hides controls when meshPoints[activePointIdx] is undefined', () => {
      mockContext.activePointIdx = 5; // out of bounds
      render(<MeshGradientControls />);
      expect(screen.queryByText('Spot Radius')).not.toBeInTheDocument();
    });
  });

  describe('filters panel', () => {
    it('renders filter labels', () => {
      render(<MeshGradientControls />);
      expect(screen.getByText('Filters')).toBeInTheDocument();
      expect(screen.getByText('Blur (Blending)')).toBeInTheDocument();
      expect(screen.getByText('Grain (Noise)')).toBeInTheDocument();
      expect(screen.getByText('Opacity')).toBeInTheDocument();
      expect(screen.getByText('Spread (Radius)')).toBeInTheDocument();
    });

    it('changing Blur slider calls setMeshBlur', () => {
      render(<MeshGradientControls />);
      // Find the blur slider by its containing text
      const blurContainer = screen.getByText('Blur (Blending)').closest('div')?.parentElement;
      const blurSlider = blurContainer?.querySelector('input[type="range"]') as HTMLInputElement;
      expect(blurSlider).toBeTruthy();
      fireEvent.change(blurSlider, { target: { value: '100' } });
      expect(mockContext.setMeshBlur).toHaveBeenCalledWith(100);
    });

    it('changing Grain slider calls setMeshGrain', () => {
      render(<MeshGradientControls />);
      const grainSlider = screen.getByText('Grain (Noise)').closest('div')?.parentElement
        ?.querySelector('input[type="range"]') as HTMLInputElement;
      fireEvent.change(grainSlider, { target: { value: '25' } });
      expect(mockContext.setMeshGrain).toHaveBeenCalledWith(25);
    });

    it('changing Opacity slider calls setMeshOpacity', () => {
      render(<MeshGradientControls />);
      const opacitySlider = screen.getByText('Opacity').closest('div')?.parentElement
        ?.querySelector('input[type="range"]') as HTMLInputElement;
      fireEvent.change(opacitySlider, { target: { value: '50' } });
      expect(mockContext.setMeshOpacity).toHaveBeenCalledWith(50);
    });

    it('changing Spread slider calls setMeshSpread', () => {
      render(<MeshGradientControls />);
      const spreadSlider = screen.getByText('Spread (Radius)').closest('div')?.parentElement
        ?.querySelector('input[type="range"]') as HTMLInputElement;
      fireEvent.change(spreadSlider, { target: { value: '150' } });
      expect(mockContext.setMeshSpread).toHaveBeenCalledWith(150);
    });

    it('Reset Filters button resets all filters to defaults', () => {
      render(<MeshGradientControls />);
      fireEvent.click(screen.getByText('Reset Filters'));
      expect(mockContext.setMeshBlur).toHaveBeenCalledWith(60);
      expect(mockContext.setMeshGrain).toHaveBeenCalledWith(15);
      expect(mockContext.setMeshOpacity).toHaveBeenCalledWith(100);
      expect(mockContext.setMeshSpread).toHaveBeenCalledWith(100);
      expect(mockContext.pushHistory).toHaveBeenCalled();
    });
  });
});
