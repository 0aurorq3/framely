import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import SnapGuides from '../src/renderer/components/annotations/SnapGuides';
import type { SnapGuide } from '../src/renderer/utils/snapUtils';

describe('SnapGuides', () => {
  const containerWidth = 800;
  const containerHeight = 600;

  it('returns null when guides array is empty', () => {
    const { container } = render(
      <svg>
        <SnapGuides guides={[]} containerWidth={containerWidth} containerHeight={containerHeight} />
      </svg>,
    );
    expect(container.querySelector('g')).toBeNull();
  });

  it('renders a single vertical guide line', () => {
    const guides: SnapGuide[] = [
      { id: 'x-0.3', orientation: 'vertical', position: 0.3 },
    ];

    const { container } = render(
      <svg>
        <SnapGuides guides={guides} containerWidth={containerWidth} containerHeight={containerHeight} />
      </svg>,
    );

    const lines = container.querySelectorAll('line');
    expect(lines).toHaveLength(1);

    const line = lines[0];
    const expectedX = 0.3 * containerWidth; // 240
    expect(Number(line.getAttribute('x1'))).toBe(expectedX);
    expect(Number(line.getAttribute('x2'))).toBe(expectedX);
    expect(Number(line.getAttribute('y1'))).toBe(0);
    expect(Number(line.getAttribute('y2'))).toBe(containerHeight);
  });

  it('renders a single horizontal guide line', () => {
    const guides: SnapGuide[] = [
      { id: 'y-0.5', orientation: 'horizontal', position: 0.5 },
    ];

    const { container } = render(
      <svg>
        <SnapGuides guides={guides} containerWidth={containerWidth} containerHeight={containerHeight} />
      </svg>,
    );

    const lines = container.querySelectorAll('line');
    expect(lines).toHaveLength(1);

    const line = lines[0];
    const expectedY = 0.5 * containerHeight; // 300
    expect(Number(line.getAttribute('x1'))).toBe(0);
    expect(Number(line.getAttribute('x2'))).toBe(containerWidth);
    expect(Number(line.getAttribute('y1'))).toBe(expectedY);
    expect(Number(line.getAttribute('y2'))).toBe(expectedY);
  });

  it('renders both vertical and horizontal guides simultaneously', () => {
    const guides: SnapGuide[] = [
      { id: 'x-0.25', orientation: 'vertical', position: 0.25 },
      { id: 'y-0.75', orientation: 'horizontal', position: 0.75 },
    ];

    const { container } = render(
      <svg>
        <SnapGuides guides={guides} containerWidth={containerWidth} containerHeight={containerHeight} />
      </svg>,
    );

    const lines = container.querySelectorAll('line');
    expect(lines).toHaveLength(2);
  });

  it('renders multiple guides of the same orientation', () => {
    const guides: SnapGuide[] = [
      { id: 'x-0.2', orientation: 'vertical', position: 0.2 },
      { id: 'x-0.8', orientation: 'vertical', position: 0.8 },
    ];

    const { container } = render(
      <svg>
        <SnapGuides guides={guides} containerWidth={containerWidth} containerHeight={containerHeight} />
      </svg>,
    );

    const lines = container.querySelectorAll('line');
    expect(lines).toHaveLength(2);
  });

  it('has pointer-events disabled on wrapper group', () => {
    const guides: SnapGuide[] = [
      { id: 'x-0.5', orientation: 'vertical', position: 0.5 },
    ];

    const { container } = render(
      <svg>
        <SnapGuides guides={guides} containerWidth={containerWidth} containerHeight={containerHeight} />
      </svg>,
    );

    const g = container.querySelector('g');
    expect(g).not.toBeNull();
    expect(g!.style.pointerEvents).toBe('none');
  });

  it('applies dashed styling to guide lines', () => {
    const guides: SnapGuide[] = [
      { id: 'x-0.5', orientation: 'vertical', position: 0.5 },
    ];

    const { container } = render(
      <svg>
        <SnapGuides guides={guides} containerWidth={containerWidth} containerHeight={containerHeight} />
      </svg>,
    );

    const line = container.querySelector('line');
    expect(line).not.toBeNull();
    // The styling is via the style prop — check that strokeDasharray and opacity are set
    const style = line!.getAttribute('style');
    expect(style).toContain('stroke-dasharray');
    expect(style).toContain('opacity');
  });

  it('scales positions correctly with different container sizes', () => {
    const guides: SnapGuide[] = [
      { id: 'x-0.5', orientation: 'vertical', position: 0.5 },
    ];

    const { container } = render(
      <svg>
        <SnapGuides guides={guides} containerWidth={400} containerHeight={300} />
      </svg>,
    );

    const line = container.querySelector('line');
    expect(Number(line!.getAttribute('x1'))).toBe(200); // 0.5 * 400
    expect(Number(line!.getAttribute('y2'))).toBe(300);
  });
});
