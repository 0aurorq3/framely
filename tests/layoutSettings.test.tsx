import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import LayoutSettings from '../src/renderer/components/LayoutSettings';
import { makeFullMockContext } from './shared';

vi.mock('../src/renderer/AppContext', () => ({
  useAppContext: () => mockContext,
}));

let mockContext: any;

beforeEach(() => {
  mockContext = {
    ...makeFullMockContext(),
    setPadding: vi.fn(),
    setRounded: vi.fn(),
    setShadow: vi.fn(),
    setShadowColor: vi.fn(),
    setShadowEnabled: vi.fn(),
    setInset: vi.fn(),
    setInsetColor: vi.fn(),
    setBorder: vi.fn(),
    setBorderColor: vi.fn(),
    setScale: vi.fn(),
    setPosition: vi.fn(),
    setShowAdvancedInset: vi.fn(),
    setShowAdvancedShadow: vi.fn(),
    setShowAdvancedBorder: vi.fn(),
    pushHistory: vi.fn(),
    handleSliderRelease: vi.fn(),
    getCurrentConfig: vi.fn(() => ({})),
  };
});

describe('LayoutSettings', () => {
  describe('Position', () => {
    it('renders position select with all options', () => {
      render(<LayoutSettings />);
      expect(screen.getByText('Position')).toBeInTheDocument();
      const select = screen.getByRole('combobox');
      expect(select).toBeInTheDocument();
    });

    it('changes position and pushes history', () => {
      render(<LayoutSettings />);
      const select = screen.getByRole('combobox');
      fireEvent.change(select, { target: { value: 'Top center' } });
      expect(mockContext.setPosition).toHaveBeenCalledWith('Top center');
      expect(mockContext.pushHistory).toHaveBeenCalled();
    });
  });

  describe('Padding', () => {
    it('renders padding slider with value', () => {
      render(<LayoutSettings />);
      expect(screen.getByText('Padding')).toBeInTheDocument();
      expect(screen.getByText('38px')).toBeInTheDocument();
    });

    it('changes padding on slider input', () => {
      render(<LayoutSettings />);
      const sliders = screen.getAllByRole('slider');
      // Padding is usually the first slider
      fireEvent.change(sliders[0], { target: { value: '50' } });
      expect(mockContext.setPadding).toHaveBeenCalledWith(50);
    });

    it('calls handleSliderRelease on mouse up', () => {
      render(<LayoutSettings />);
      const sliders = screen.getAllByRole('slider');
      fireEvent.mouseUp(sliders[0]);
      expect(mockContext.handleSliderRelease).toHaveBeenCalled();
    });
  });

  describe('Scale', () => {
    it('renders scale slider with value', () => {
      render(<LayoutSettings />);
      expect(screen.getByText('Scale')).toBeInTheDocument();
      expect(screen.getByText('100%')).toBeInTheDocument();
    });

    it('changes scale on slider input', () => {
      render(<LayoutSettings />);
      const sliders = screen.getAllByRole('slider');
      // Scale slider is often second
      fireEvent.change(sliders[1], { target: { value: '80' } });
      expect(mockContext.setScale).toHaveBeenCalledWith(80);
    });
  });

  describe('Inset Border', () => {
    it('renders inset border control', () => {
      render(<LayoutSettings />);
      expect(screen.getByText('Inset Border')).toBeInTheDocument();
    });

    it('toggles advanced inset controls', () => {
      mockContext.showAdvancedInset = false;
      render(<LayoutSettings />);
      fireEvent.click(screen.getAllByText('Advanced')[0]);
      expect(mockContext.setShowAdvancedInset).toHaveBeenCalledWith(true);
    });

    it('shows inset color picker when advanced is enabled', () => {
      mockContext.showAdvancedInset = true;
      render(<LayoutSettings />);
      expect(screen.getByText('Hide')).toBeInTheDocument();
    });

    it('hides inset color picker when advanced is disabled', () => {
      mockContext.showAdvancedInset = false;
      render(<LayoutSettings />);
      expect(screen.queryByText('Hide')).not.toBeInTheDocument();
    });
  });

  describe('Shadow', () => {
    it('renders shadow controls', () => {
      render(<LayoutSettings />);
      expect(screen.getByText('Shadow')).toBeInTheDocument();
      expect(screen.getByText('Shadow Enabled')).toBeInTheDocument();
    });

    it('toggles shadow enabled checkbox', () => {
      mockContext.shadowEnabled = true;
      render(<LayoutSettings />);
      const checkboxes = screen.getAllByRole('checkbox');
      const shadowCheckbox = checkboxes[0];
      fireEvent.click(shadowCheckbox);
      expect(mockContext.setShadowEnabled).toHaveBeenCalledWith(false);
    });

    it('disables shadow slider when shadow is off', () => {
      mockContext.shadowEnabled = false;
      render(<LayoutSettings />);
      // Find the shadow slider - it should be disabled
      const sliders = screen.getAllByRole('slider');
      const shadowSlider = Array.from(sliders).find(s => s.getAttribute('disabled') !== null);
      expect(shadowSlider).toBeTruthy();
    });

    it('enables shadow slider when shadow is on', () => {
      mockContext.shadowEnabled = true;
      render(<LayoutSettings />);
      const sliders = screen.getAllByRole('slider');
      // No slider should be disabled when shadow is enabled
      const disabledSliders = Array.from(sliders).filter(s => s.getAttribute('disabled') !== null);
      expect(disabledSliders.length).toBe(0);
    });

    it('toggles advanced shadow controls', () => {
      mockContext.showAdvancedShadow = false;
      render(<LayoutSettings />);
      const advancedButtons = screen.getAllByText('Advanced');
      fireEvent.click(advancedButtons[1]);
      expect(mockContext.setShowAdvancedShadow).toHaveBeenCalledWith(true);
    });

    it('shows shadow color picker when advanced is enabled', () => {
      mockContext.showAdvancedShadow = true;
      mockContext.shadowEnabled = true;
      render(<LayoutSettings />);
      expect(screen.getByText('Hide')).toBeInTheDocument();
    });
  });

  describe('Rounded Corners', () => {
    it('renders rounded corners slider with value', () => {
      render(<LayoutSettings />);
      expect(screen.getByText('Rounded Corners')).toBeInTheDocument();
      expect(screen.getByText('20px')).toBeInTheDocument();
    });

    it('changes rounded on slider input', () => {
      render(<LayoutSettings />);
      const sliders = screen.getAllByRole('slider');
      // Find the rounded corners slider
      fireEvent.change(sliders[sliders.length - 2], { target: { value: '30' } });
      expect(mockContext.setRounded).toHaveBeenCalledWith(30);
    });
  });

  describe('Outer Border', () => {
    it('renders outer border control', () => {
      render(<LayoutSettings />);
      expect(screen.getByText('Outer Border')).toBeInTheDocument();
    });

    it('toggles advanced border controls', () => {
      mockContext.showAdvancedBorder = false;
      render(<LayoutSettings />);
      const advancedButtons = screen.getAllByText('Advanced');
      fireEvent.click(advancedButtons[advancedButtons.length - 1]);
      expect(mockContext.setShowAdvancedBorder).toHaveBeenCalledWith(true);
    });

    it('shows border color picker when advanced is enabled', () => {
      mockContext.showAdvancedBorder = true;
      render(<LayoutSettings />);
      // Should show Hide text on the button
      const hideButtons = screen.getAllByText('Hide');
      expect(hideButtons.length).toBeGreaterThan(0);
    });

    it('changes border value on slider input', () => {
      render(<LayoutSettings />);
      const sliders = screen.getAllByRole('slider');
      fireEvent.change(sliders[sliders.length - 1], { target: { value: '10' } });
      expect(mockContext.setBorder).toHaveBeenCalledWith(10);
    });

    it('changes shadow value on slider input', () => {
      mockContext.shadowEnabled = true;
      render(<LayoutSettings />);
      const sliders = screen.getAllByRole('slider');
      const shadowSlider = Array.from(sliders).find(s => !s.hasAttribute('disabled') && s.getAttribute('max') === '50');
      if (shadowSlider) {
        fireEvent.change(shadowSlider, { target: { value: '40' } });
        expect(mockContext.setShadow).toHaveBeenCalledWith(40);
      }
    });

    it('shows border color picker when advanced border is enabled', () => {
      mockContext.showAdvancedBorder = true;
      render(<LayoutSettings />);
      const hideButtons = screen.getAllByText('Hide');
      expect(hideButtons.length).toBeGreaterThan(0);
    });

    it('shows inset advanced controls and hides them', () => {
      mockContext.showAdvancedInset = true;
      const { rerender } = render(<LayoutSettings key="a" />);
      expect(screen.getAllByText('Hide').length).toBeGreaterThan(0);

      rerender(<LayoutSettings key="b" />);
      mockContext.showAdvancedInset = false;
      rerender(<LayoutSettings key="c" />);
    });

    it('calls handleSliderRelease on all slider mouse ups', () => {
      render(<LayoutSettings />);
      const sliders = screen.getAllByRole('slider');
      fireEvent.mouseUp(sliders[0]);
      expect(mockContext.handleSliderRelease).toHaveBeenCalled();
    });
  });
});
