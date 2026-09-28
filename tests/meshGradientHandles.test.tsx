import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent } from '@testing-library/react';
import MeshGradientHandles from '../src/renderer/components/MeshGradientHandles';

const mockPoints = [
  { id: 'p1', color: '#ff0000', x: 0.3, y: 0.2, radius: 200 },
  { id: 'p2', color: '#00ff00', x: 0.7, y: 0.5, radius: 200 },
  { id: 'p3', color: '#0000ff', x: 0.5, y: 0.8, radius: 200 },
];

describe('MeshGradientHandles', () => {
  it('renders one handle per mesh point', () => {
    const { container } = render(
      <MeshGradientHandles
        meshPoints={mockPoints}
        activePointIdx={0}
        activeTool="pointer"
        handlePointerDown={vi.fn()}
        handlePointerMove={vi.fn()}
        handlePointerUp={vi.fn()}
      />
    );
    const handles = container.querySelectorAll('[title^="Point "]');
    expect(handles.length).toBe(3);
  });

  it('calls handlePointerDown when pointer tool is active', () => {
    const handlePointerDown = vi.fn();
    const { container } = render(
      <MeshGradientHandles
        meshPoints={mockPoints}
        activePointIdx={0}
        activeTool="pointer"
        handlePointerDown={handlePointerDown}
        handlePointerMove={vi.fn()}
        handlePointerUp={vi.fn()}
      />
    );
    const handles = container.querySelectorAll('[title^="Point "]');
    fireEvent.pointerDown(handles[0]);
    expect(handlePointerDown).toHaveBeenCalled();
  });

  it('does not attach pointer events when activeTool is not pointer', () => {
    const handlePointerDown = vi.fn();
    const { container } = render(
      <MeshGradientHandles
        meshPoints={mockPoints}
        activePointIdx={0}
        activeTool="add"
        handlePointerDown={handlePointerDown}
        handlePointerMove={vi.fn()}
        handlePointerUp={vi.fn()}
      />
    );
    const handles = container.querySelectorAll('[title^="Point "]');
    fireEvent.pointerDown(handles[0]);
    expect(handlePointerDown).not.toHaveBeenCalled();
  });

  it('highlights active point with thicker border', () => {
    const { container } = render(
      <MeshGradientHandles
        meshPoints={mockPoints}
        activePointIdx={1}
        activeTool="pointer"
        handlePointerDown={vi.fn()}
        handlePointerMove={vi.fn()}
        handlePointerUp={vi.fn()}
      />
    );
    const handles = container.querySelectorAll('[title^="Point "]');
    const activeHandle = handles[1] as HTMLElement;
    expect(activeHandle.style.border).toContain('3px solid');
  });
});
