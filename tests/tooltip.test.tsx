import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import Tooltip from '../src/renderer/components/Tooltip';

describe('Tooltip', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    // Reset document body between tests
    document.body.innerHTML = '';
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('rendering', () => {
    it('renders children without tooltip when no content', () => {
      render(
        <Tooltip>
          <button>Hover me</button>
        </Tooltip>
      );
      expect(screen.getByText('Hover me')).toBeInTheDocument();
    });

    it('renders children when content prop is provided', () => {
      render(
        <Tooltip content="Help text">
          <button>Hover me</button>
        </Tooltip>
      );
      expect(screen.getByText('Hover me')).toBeInTheDocument();
    });

    it('uses child title attribute as fallback when no content prop', () => {
      render(
        <Tooltip>
          <button title="Title help">Hover me</button>
        </Tooltip>
      );
      expect(screen.getByText('Hover me')).toBeInTheDocument();
    });
  });

  describe('show/hide behavior', () => {
    it('shows tooltip on mouse enter after delay', () => {
      render(
        <Tooltip content="Tooltip text" delay={100}>
          <button>Hover me</button>
        </Tooltip>
      );

      fireEvent.mouseEnter(screen.getByText('Hover me'));

      // Not visible yet (delay hasn't passed)
      expect(screen.queryByText('Tooltip text')).not.toBeInTheDocument();

      // Advance past delay
      act(() => {
        vi.advanceTimersByTime(150);
      });

      expect(screen.getByText('Tooltip text')).toBeInTheDocument();
    });

    it('hides tooltip on mouse leave', () => {
      render(
        <Tooltip content="Tooltip text" delay={0}>
          <button>Hover me</button>
        </Tooltip>
      );

      fireEvent.mouseEnter(screen.getByText('Hover me'));
      act(() => {
        vi.advanceTimersByTime(0);
      });

      expect(screen.getByText('Tooltip text')).toBeInTheDocument();

      fireEvent.mouseLeave(screen.getByText('Hover me'));
      expect(screen.queryByText('Tooltip text')).not.toBeInTheDocument();
    });

    it('hides tooltip on click', () => {
      render(
        <Tooltip content="Tooltip text" delay={0}>
          <button>Click me</button>
        </Tooltip>
      );

      fireEvent.mouseEnter(screen.getByText('Click me'));
      act(() => {
        vi.advanceTimersByTime(0);
      });
      expect(screen.getByText('Tooltip text')).toBeInTheDocument();

      fireEvent.click(screen.getByText('Click me'));
      expect(screen.queryByText('Tooltip text')).not.toBeInTheDocument();
    });

    it('cancels pending tooltip when mouse leaves before delay', () => {
      render(
        <Tooltip content="Tooltip text" delay={200}>
          <button>Hover me</button>
        </Tooltip>
      );

      fireEvent.mouseEnter(screen.getByText('Hover me'));
      act(() => {
        vi.advanceTimersByTime(50);
      });

      // Leave before delay completes
      fireEvent.mouseLeave(screen.getByText('Hover me'));

      // Advance past the original delay
      act(() => {
        vi.advanceTimersByTime(200);
      });

      expect(screen.queryByText('Tooltip text')).not.toBeInTheDocument();
    });
  });

  describe('title attribute management', () => {
    it('removes native title on mouse enter', () => {
      render(
        <Tooltip content="Custom tooltip">
          <button title="Native title">Hover me</button>
        </Tooltip>
      );

      const btn = screen.getByText('Hover me');
      expect(btn.getAttribute('title')).toBe('Native title');

      fireEvent.mouseEnter(btn);
      act(() => {
        vi.advanceTimersByTime(200);
      });

      // Title should be removed (stored in data-original-title)
      expect(btn.getAttribute('title')).toBeNull();
      expect(btn.getAttribute('data-original-title')).toBe('Native title');
    });

    it('restores native title on mouse leave', () => {
      render(
        <Tooltip content="Custom tooltip">
          <button title="Native title">Hover me</button>
        </Tooltip>
      );

      const btn = screen.getByText('Hover me');

      fireEvent.mouseEnter(btn);
      act(() => {
        vi.advanceTimersByTime(200);
      });

      // Title removed
      expect(btn.getAttribute('title')).toBeNull();

      fireEvent.mouseLeave(btn);

      // Title restored
      expect(btn.getAttribute('title')).toBe('Native title');
      expect(btn.getAttribute('data-original-title')).toBeNull();
    });
  });

  describe('position classes', () => {
    it('renders with top position class by default', () => {
      render(
        <Tooltip content="Top tooltip" delay={0}>
          <button>Hover</button>
        </Tooltip>
      );

      fireEvent.mouseEnter(screen.getByText('Hover'));
      act(() => {
        vi.advanceTimersByTime(0);
      });

      const tooltip = screen.getByText('Top tooltip');
      expect(tooltip).toHaveClass('tooltip-top');
    });

    it('renders with bottom position class', () => {
      render(
        <Tooltip content="Bottom tooltip" position="bottom" delay={0}>
          <button>Hover</button>
        </Tooltip>
      );

      fireEvent.mouseEnter(screen.getByText('Hover'));
      act(() => {
        vi.advanceTimersByTime(0);
      });

      const tooltip = screen.getByText('Bottom tooltip');
      expect(tooltip).toHaveClass('tooltip-bottom');
    });

    it('renders with left position class', () => {
      render(
        <Tooltip content="Left tooltip" position="left" delay={0}>
          <button>Hover</button>
        </Tooltip>
      );

      fireEvent.mouseEnter(screen.getByText('Hover'));
      act(() => {
        vi.advanceTimersByTime(0);
      });

      const tooltip = screen.getByText('Left tooltip');
      expect(tooltip).toHaveClass('tooltip-left');
    });

    it('renders with right position class', () => {
      render(
        <Tooltip content="Right tooltip" position="right" delay={0}>
          <button>Hover</button>
        </Tooltip>
      );

      fireEvent.mouseEnter(screen.getByText('Hover'));
      act(() => {
        vi.advanceTimersByTime(0);
      });

      const tooltip = screen.getByText('Right tooltip');
      expect(tooltip).toHaveClass('tooltip-right');
    });
  });

  describe('portal rendering', () => {
    it('renders tooltip in document.body via portal', () => {
      render(
        <Tooltip content="Portal tooltip" delay={0}>
          <button>Hover</button>
        </Tooltip>
      );

      fireEvent.mouseEnter(screen.getByText('Hover'));
      act(() => {
        vi.advanceTimersByTime(0);
      });

      // The tooltip should be in document.body
      const tooltip = document.body.querySelector('.custom-tooltip');
      expect(tooltip).toBeTruthy();
      expect(tooltip?.textContent).toBe('Portal tooltip');
    });
  });

  describe('child event handlers', () => {
    it('preserves child onMouseEnter handler', () => {
      const childMouseEnter = vi.fn();
      render(
        <Tooltip content="Tooltip" delay={0}>
          <button onMouseEnter={childMouseEnter}>Hover</button>
        </Tooltip>
      );

      fireEvent.mouseEnter(screen.getByText('Hover'));
      expect(childMouseEnter).toHaveBeenCalled();
    });

    it('preserves child onMouseLeave handler', () => {
      const childMouseLeave = vi.fn();
      render(
        <Tooltip content="Tooltip" delay={0}>
          <button onMouseLeave={childMouseLeave}>Hover</button>
        </Tooltip>
      );

      fireEvent.mouseEnter(screen.getByText('Hover'));
      fireEvent.mouseLeave(screen.getByText('Hover'));
      expect(childMouseLeave).toHaveBeenCalled();
    });

    it('preserves child onClick handler', () => {
      const childClick = vi.fn();
      render(
        <Tooltip content="Tooltip" delay={0}>
          <button onClick={childClick}>Click</button>
        </Tooltip>
      );

      fireEvent.click(screen.getByText('Click'));
      expect(childClick).toHaveBeenCalled();
    });
  });

  describe('cleanup', () => {
    it('clears timeout on unmount', () => {
      const { unmount } = render(
        <Tooltip content="Tooltip" delay={200}>
          <button>Hover</button>
        </Tooltip>
      );

      fireEvent.mouseEnter(screen.getByText('Hover'));

      // Unmount before delay completes
      unmount();

      // Should not throw when timer fires
      act(() => {
        vi.advanceTimersByTime(300);
      });
    });
  });

  describe('edge cases', () => {
    it('handles no content and no title gracefully', () => {
      const { container } = render(
        <Tooltip>
          <button>Plain button</button>
        </Tooltip>
      );
      // Should just render the child
      expect(screen.getByText('Plain button')).toBeInTheDocument();
      // No tooltip wrapper
      expect(container.querySelector('.custom-tooltip')).toBeNull();
    });

    it('clears previous timer on rapid re-hover', () => {
      render(
        <Tooltip content="Tooltip" delay={200}>
          <button>Hover</button>
        </Tooltip>
      );

      fireEvent.mouseEnter(screen.getByText('Hover'));
      act(() => {
        vi.advanceTimersByTime(50);
      });

      // Re-hover (should clear old timer)
      fireEvent.mouseLeave(screen.getByText('Hover'));
      fireEvent.mouseEnter(screen.getByText('Hover'));

      // 50ms after re-hover, not enough for new 200ms delay
      act(() => {
        vi.advanceTimersByTime(50);
      });
      expect(screen.queryByText('Tooltip')).not.toBeInTheDocument();

      // After full new delay
      act(() => {
        vi.advanceTimersByTime(200);
      });
      expect(screen.getByText('Tooltip')).toBeInTheDocument();
    });
  });
});
