import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import AnnotationShape from '../src/renderer/components/annotations/AnnotationShape';
import SelectionBox from '../src/renderer/components/annotations/SelectionBox';
import TextEditor from '../src/renderer/components/annotations/TextEditor';

// Mock arrowUtils
vi.mock('../src/renderer/arrowUtils', () => ({
  getCurvedArrowPoints: vi.fn((x0, y0, x1, y1, _strokeW) => ({
    x0, y0, x1, y1,
    x_h: x1 - 10,
    y_h: y1 - 10,
    cx: (x0 + x1) / 2,
    cy: (y0 + y1) / 2,
    arrow1X: x1 - 15,
    arrow1Y: y1 - 5,
    arrow2X: x1 - 5,
    arrow2Y: y1 - 15,
  })),
  getTaperedCurvedArrowPoints: vi.fn((x0, y0, x1, y1, _strokeW) => ({
    leftPoints: [
      { x: x0, y: y0 },
      { x: (x0 + x1) / 2, y: (y0 + y1) / 2 },
    ],
    rightPoints: [
      { x: x0 + 5, y: y0 + 5 },
      { x: (x0 + x1) / 2 + 5, y: (y0 + y1) / 2 + 5 },
    ],
    H_left: { x: x1 - 15, y: y1 - 5 },
    H_right: { x: x1 - 5, y: y1 - 15 },
    tip: { x: x1, y: y1 },
  })),
}));

describe('AnnotationShape', () => {
  const defaultProps = {
    dimensions: { width: 800, height: 600 },
    rectW: 100,
    rectH: 80,
    w: 0.125,
    h: 0.133,
    strokeW: 4,
    editingTextId: null,
  };

  it('renders rect annotation', () => {
    const ann = {
      id: '1',
      type: 'rect' as const,
      x: 0.1,
      y: 0.1,
      w: 0.125,
      h: 0.133,
      color: '#ff0000',
      strokeWidth: 4,
    };

    const { container } = render(<AnnotationShape ann={ann} {...defaultProps} />);
    
    const rect = container.querySelector('rect');
    expect(rect).toBeInTheDocument();
    expect(rect).toHaveAttribute('stroke', '#ff0000');
    expect(rect).toHaveAttribute('stroke-width', '4');
    expect(rect).toHaveAttribute('fill', 'none');
  });

  it('renders filled-rect annotation with rounded corners', () => {
    const ann = {
      id: '2',
      type: 'filled-rect' as const,
      x: 0.1,
      y: 0.1,
      w: 0.125,
      h: 0.133,
      color: '#00ff00',
      strokeWidth: 4,
    };

    const { container } = render(<AnnotationShape ann={ann} {...defaultProps} />);
    
    const rect = container.querySelector('rect');
    expect(rect).toBeInTheDocument();
    expect(rect).toHaveAttribute('fill', '#00ff00');
    expect(rect).toHaveAttribute('rx');
    expect(rect).toHaveAttribute('ry');
  });

  it('renders circle annotation', () => {
    const ann = {
      id: '3',
      type: 'circle' as const,
      x: 0.1,
      y: 0.1,
      w: 0.125,
      h: 0.133,
      color: '#0000ff',
      strokeWidth: 4,
    };

    const { container } = render(<AnnotationShape ann={ann} {...defaultProps} />);
    
    const ellipse = container.querySelector('ellipse');
    expect(ellipse).toBeInTheDocument();
    expect(ellipse).toHaveAttribute('stroke', '#0000ff');
    expect(ellipse).toHaveAttribute('stroke-width', '4');
    expect(ellipse).toHaveAttribute('fill', 'none');
  });

  it('renders filled-circle annotation', () => {
    const ann = {
      id: '4',
      type: 'filled-circle' as const,
      x: 0.1,
      y: 0.1,
      w: 0.125,
      h: 0.133,
      color: '#ffff00',
      strokeWidth: 4,
    };

    const { container } = render(<AnnotationShape ann={ann} {...defaultProps} />);
    
    const ellipse = container.querySelector('ellipse');
    expect(ellipse).toBeInTheDocument();
    expect(ellipse).toHaveAttribute('fill', '#ffff00');
  });

  it('renders line annotation', () => {
    const ann = {
      id: '5',
      type: 'line' as const,
      x: 0.1,
      y: 0.1,
      w: 0.125,
      h: 0.133,
      color: '#ff00ff',
      strokeWidth: 4,
    };

    const { container } = render(<AnnotationShape ann={ann} {...defaultProps} />);
    
    const line = container.querySelector('line');
    expect(line).toBeInTheDocument();
    expect(line).toHaveAttribute('stroke', '#ff00ff');
    expect(line).toHaveAttribute('stroke-width', '4');
  });

  it('renders classic arrow annotation', () => {
    const ann = {
      id: '6',
      type: 'arrow' as const,
      x: 0.1,
      y: 0.1,
      w: 0.125,
      h: 0.133,
      color: '#00ffff',
      strokeWidth: 4,
      arrowStyle: 'classic' as const,
    };

    const { container } = render(<AnnotationShape ann={ann} {...defaultProps} />);
    
    const line = container.querySelector('line');
    const polygon = container.querySelector('polygon');
    expect(line).toBeInTheDocument();
    expect(polygon).toBeInTheDocument();
    expect(polygon).toHaveAttribute('fill', '#00ffff');
  });

  it('renders dashed arrow annotation', () => {
    const ann = {
      id: '7',
      type: 'arrow' as const,
      x: 0.1,
      y: 0.1,
      w: 0.125,
      h: 0.133,
      color: '#ff8800',
      strokeWidth: 4,
      arrowStyle: 'dashed' as const,
    };

    const { container } = render(<AnnotationShape ann={ann} {...defaultProps} />);
    
    const line = container.querySelector('line');
    expect(line).toBeInTheDocument();
    expect(line).toHaveAttribute('stroke-dasharray');
  });

  it('renders tapered arrow annotation', () => {
    const ann = {
      id: '8',
      type: 'arrow' as const,
      x: 0.1,
      y: 0.1,
      w: 0.125,
      h: 0.133,
      color: '#8800ff',
      strokeWidth: 4,
      arrowStyle: 'tapered' as const,
    };

    const { container } = render(<AnnotationShape ann={ann} {...defaultProps} />);
    
    const polygon = container.querySelector('polygon');
    expect(polygon).toBeInTheDocument();
    expect(polygon).toHaveAttribute('fill', '#8800ff');
  });

  it('renders curved arrow annotation', () => {
    const ann = {
      id: '9',
      type: 'arrow' as const,
      x: 0.1,
      y: 0.1,
      w: 0.125,
      h: 0.133,
      color: '#ff0088',
      strokeWidth: 4,
      arrowStyle: 'curved' as const,
    };

    const { container } = render(<AnnotationShape ann={ann} {...defaultProps} />);
    
    const path = container.querySelector('path');
    const polygon = container.querySelector('polygon');
    expect(path).toBeInTheDocument();
    expect(polygon).toBeInTheDocument();
    expect(path).toHaveAttribute('stroke', '#ff0088');
  });

  it('renders text annotation', () => {
    const ann = {
      id: '10',
      type: 'text' as const,
      x: 0.1,
      y: 0.1,
      w: 0.125,
      h: 0.133,
      color: '#ffffff',
      strokeWidth: 4,
      text: 'Hello World',
    };

    const { container } = render(<AnnotationShape ann={ann} {...defaultProps} />);
    
    const rect = container.querySelector('rect');
    const text = container.querySelector('text');
    expect(rect).not.toBeInTheDocument();
    expect(text).toBeInTheDocument();
    expect(text).toHaveTextContent('Hello World');
    expect(text).toHaveAttribute('fill', '#ffffff');
  });

  it('does not render text when editing', () => {
    const ann = {
      id: '11',
      type: 'text' as const,
      x: 0.1,
      y: 0.1,
      w: 0.125,
      h: 0.133,
      color: '#ffffff',
      strokeWidth: 4,
      text: 'Editing',
    };

    const { container } = render(
      <AnnotationShape ann={ann} {...defaultProps} editingTextId="11" />
    );
    
    const text = container.querySelector('text');
    expect(text).not.toBeInTheDocument();
  });

  it('renders emoji annotation', () => {
    const ann = {
      id: '12',
      type: 'emoji' as const,
      x: 0.1,
      y: 0.1,
      w: 0.125,
      h: 0.133,
      color: '#000000',
      strokeWidth: 4,
      text: '😀',
    };

    const { container } = render(<AnnotationShape ann={ann} {...defaultProps} />);
    
    const text = container.querySelector('text');
    expect(text).toBeInTheDocument();
    expect(text).toHaveTextContent('😀');
  });

  it('renders pen annotation', () => {
    const ann = {
      id: '13',
      type: 'pen' as const,
      x: 0.1,
      y: 0.1,
      w: 0.125,
      h: 0.133,
      color: '#ff0000',
      strokeWidth: 4,
      points: [
        { x: 0, y: 0 },
        { x: 0.5, y: 0.5 },
        { x: 1, y: 1 },
      ],
    };

    const { container } = render(<AnnotationShape ann={ann} {...defaultProps} />);
    
    const path = container.querySelector('path');
    expect(path).toBeInTheDocument();
    expect(path).toHaveAttribute('stroke', '#ff0000');
    expect(path).toHaveAttribute('fill', 'none');
  });

  it('returns null for unknown annotation type', () => {
    const ann = {
      id: '14',
      type: 'unknown' as any,
      x: 0.1,
      y: 0.1,
      w: 0.125,
      h: 0.133,
      color: '#000000',
      strokeWidth: 4,
    };

    const { container } = render(<AnnotationShape ann={ann} {...defaultProps} />);
    
    expect(container.firstChild).toBeNull();
  });
});

describe('SelectionBox', () => {
  const defaultProps = {
    rectW: 100,
    rectH: 80,
    startResize: vi.fn(),
  };

  const ann = {
    id: '1',
    type: 'rect' as const,
    x: 0.1,
    y: 0.1,
    w: 0.125,
    h: 0.133,
    color: '#ff0000',
    strokeWidth: 4,
  };

  it('renders selection rectangle', () => {
    const { container } = render(
      <SelectionBox ann={ann} {...defaultProps} />
    );
    
    const rects = container.querySelectorAll('rect');
    expect(rects.length).toBeGreaterThan(0);
    
    const selectionRect = rects[0];
    expect(selectionRect).toHaveAttribute('stroke', 'var(--color-primary)');
    expect(selectionRect).toHaveAttribute('stroke-dasharray', '4 4');
    expect(selectionRect).toHaveAttribute('fill', 'none');
  });

  it('renders 8 resize handles', () => {
    const { container } = render(
      <SelectionBox ann={ann} {...defaultProps} />
    );
    
    const rects = container.querySelectorAll('rect');
    // 1 selection rect + 8 resize handles = 9 total
    expect(rects.length).toBe(9);
  });

  it('renders rotation handle', () => {
    const { container } = render(
      <SelectionBox ann={ann} {...defaultProps} />
    );
    
    const circles = container.querySelectorAll('circle');
    expect(circles.length).toBe(1);
    expect(circles[0]).toHaveAttribute('fill', 'white');
    expect(circles[0]).toHaveAttribute('stroke', 'var(--color-primary)');
  });

  it('renders rotation stem line', () => {
    const { container } = render(
      <SelectionBox ann={ann} {...defaultProps} />
    );
    
    const lines = container.querySelectorAll('line');
    expect(lines.length).toBe(1);
    expect(lines[0]).toHaveAttribute('stroke', 'var(--color-primary)');
  });

  it('calls startResize on handle pointer down - top-left', () => {
    const { container } = render(
      <SelectionBox ann={ann} {...defaultProps} />
    );
    
    const rects = container.querySelectorAll('rect');
    const tlHandle = rects[1]; // First resize handle
    
    fireEvent.pointerDown(tlHandle);
    
    expect(defaultProps.startResize).toHaveBeenCalledWith(
      expect.any(Object),
      ann,
      'tl'
    );
  });

  it('calls startResize on handle pointer down - bottom-right', () => {
    const { container } = render(
      <SelectionBox ann={ann} {...defaultProps} />
    );
    
    const rects = container.querySelectorAll('rect');
    const brHandle = rects[8]; // Last resize handle
    
    fireEvent.pointerDown(brHandle);
    
    expect(defaultProps.startResize).toHaveBeenCalledWith(
      expect.any(Object),
      ann,
      'br'
    );
  });

  it('calls startResize on rotation handle pointer down', () => {
    const { container } = render(
      <SelectionBox ann={ann} {...defaultProps} />
    );
    
    const circle = container.querySelector('circle');
    
    fireEvent.pointerDown(circle!);
    
    expect(defaultProps.startResize).toHaveBeenCalledWith(
      expect.any(Object),
      ann,
      'rot'
    );
  });

  it('calls startResize on handle pointer down - top-center', () => {
    const { container } = render(
      <SelectionBox ann={ann} {...defaultProps} />
    );
    const rects = container.querySelectorAll('rect');
    fireEvent.pointerDown(rects[2]); // tc
    expect(defaultProps.startResize).toHaveBeenCalledWith(expect.any(Object), ann, 'tc');
  });

  it('calls startResize on handle pointer down - top-right', () => {
    const { container } = render(
      <SelectionBox ann={ann} {...defaultProps} />
    );
    const rects = container.querySelectorAll('rect');
    fireEvent.pointerDown(rects[3]); // tr
    expect(defaultProps.startResize).toHaveBeenCalledWith(expect.any(Object), ann, 'tr');
  });

  it('calls startResize on handle pointer down - middle-left', () => {
    const { container } = render(
      <SelectionBox ann={ann} {...defaultProps} />
    );
    const rects = container.querySelectorAll('rect');
    fireEvent.pointerDown(rects[4]); // ml
    expect(defaultProps.startResize).toHaveBeenCalledWith(expect.any(Object), ann, 'ml');
  });

  it('calls startResize on handle pointer down - middle-right', () => {
    const { container } = render(
      <SelectionBox ann={ann} {...defaultProps} />
    );
    const rects = container.querySelectorAll('rect');
    fireEvent.pointerDown(rects[5]); // mr
    expect(defaultProps.startResize).toHaveBeenCalledWith(expect.any(Object), ann, 'mr');
  });

  it('calls startResize on handle pointer down - bottom-left', () => {
    const { container } = render(
      <SelectionBox ann={ann} {...defaultProps} />
    );
    const rects = container.querySelectorAll('rect');
    fireEvent.pointerDown(rects[6]); // bl
    expect(defaultProps.startResize).toHaveBeenCalledWith(expect.any(Object), ann, 'bl');
  });

  it('calls startResize on handle pointer down - bottom-center', () => {
    const { container } = render(
      <SelectionBox ann={ann} {...defaultProps} />
    );
    const rects = container.querySelectorAll('rect');
    fireEvent.pointerDown(rects[7]); // bc
    expect(defaultProps.startResize).toHaveBeenCalledWith(expect.any(Object), ann, 'bc');
  });

  it('applies correct cursor styles to resize handles', () => {
    const { container } = render(
      <SelectionBox ann={ann} {...defaultProps} />
    );
    
    const rects = container.querySelectorAll('rect');
    
    // Top-left should have nwse-resize
    expect(rects[1]).toHaveStyle({ cursor: 'nwse-resize' });
    
    // Top-center should have ns-resize
    expect(rects[2]).toHaveStyle({ cursor: 'ns-resize' });
    
    // Middle-left should have ew-resize
    expect(rects[4]).toHaveStyle({ cursor: 'ew-resize' });
  });

  it('applies grab cursor to rotation handle', () => {
    const { container } = render(
      <SelectionBox ann={ann} {...defaultProps} />
    );
    
    const circle = container.querySelector('circle');
    expect(circle).toHaveStyle({ cursor: 'grab' });
  });
});

describe('TextEditor', () => {
  const defaultProps = {
    dimensions: { width: 800, height: 600 },
    editingTextValue: 'Test text',
    setEditingTextValue: vi.fn(),
    onBlur: vi.fn(),
    onKeyDown: vi.fn(),
  };

  const ann = {
    id: '1',
    type: 'text' as const,
    x: 0.1,
    y: 0.1,
    w: 0.2,
    h: 0.1,
    color: '#ffffff',
    strokeWidth: 4,
    text: 'Original',
  };

  it('renders textarea with current value', () => {
    render(<TextEditor ann={ann} {...defaultProps} />);
    
    const textarea = screen.getByRole('textbox');
    expect(textarea).toBeInTheDocument();
    expect(textarea).toHaveValue('Test text');
  });

  it('positions textarea correctly', () => {
    render(<TextEditor ann={ann} {...defaultProps} />);
    
    const container = screen.getByRole('textbox').parentElement;
    expect(container).toHaveStyle({
      position: 'absolute',
      left: '80px', // 0.1 * 800
      top: '60px', // 0.1 * 600
      width: '160px', // 0.2 * 800
      height: '60px', // 0.1 * 600
    });
  });

  it('applies rotation transform', () => {
    const rotatedAnn = { ...ann, rotation: 45 };
    
    render(<TextEditor ann={rotatedAnn} {...defaultProps} />);
    
    const container = screen.getByRole('textbox').parentElement;
    expect(container).toHaveStyle({
      transform: 'rotate(45deg)',
    });
  });

  it('calls setEditingTextValue on change', () => {
    render(<TextEditor ann={ann} {...defaultProps} />);
    
    const textarea = screen.getByRole('textbox');
    fireEvent.change(textarea, { target: { value: 'New text' } });
    
    expect(defaultProps.setEditingTextValue).toHaveBeenCalledWith('New text');
  });

  it('calls onBlur when textarea loses focus', () => {
    render(<TextEditor ann={ann} {...defaultProps} />);
    
    const textarea = screen.getByRole('textbox');
    fireEvent.blur(textarea);
    
    expect(defaultProps.onBlur).toHaveBeenCalled();
  });

  it('calls onKeyDown on key press', () => {
    render(<TextEditor ann={ann} {...defaultProps} />);
    
    const textarea = screen.getByRole('textbox');
    fireEvent.keyDown(textarea, { key: 'Enter' });
    
    expect(defaultProps.onKeyDown).toHaveBeenCalled();
  });

  it('stops pointer event propagation', () => {
    const parentHandler = vi.fn();
    
    render(
      <div onPointerDown={parentHandler} onPointerMove={parentHandler} onPointerUp={parentHandler}>
        <TextEditor ann={ann} {...defaultProps} />
      </div>
    );
    
    const container = screen.getByRole('textbox').parentElement;
    
    fireEvent.pointerDown(container!);
    fireEvent.pointerMove(container!);
    fireEvent.pointerUp(container!);
    
    // Parent handler should not be called because events are stopped
    expect(parentHandler).not.toHaveBeenCalled();
  });

  it('applies correct styling to textarea', () => {
    render(<TextEditor ann={ann} {...defaultProps} />);
    
    const textarea = screen.getByRole('textbox');
    expect(textarea).toHaveStyle({
      background: 'transparent',
      border: '2px dashed #ffffff',
      color: '#ffffff',
      fontWeight: 'bold',
      textAlign: 'center',
      resize: 'none',
    });
  });

  it('auto-focuses textarea after timeout', () => {
    vi.useFakeTimers();
    render(<TextEditor ann={ann} {...defaultProps} />);

    const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;
    const focusSpy = vi.spyOn(textarea, 'focus');

    act(() => {
      vi.advanceTimersByTime(50);
    });

    expect(focusSpy).toHaveBeenCalled();
    vi.useRealTimers();
  });

  it('calculates font size based on stroke width', () => {
    const thickStrokeAnn = { ...ann, strokeWidth: 8 };
    
    render(<TextEditor ann={thickStrokeAnn} {...defaultProps} />);
    
    const textarea = screen.getByRole('textbox');
    // Font size should be Math.max(12, 14 + strokeWidth)
    expect(textarea).toHaveStyle({
      fontSize: '22px', // 14 + 8
    });
  });

  it('uses minimum font size of 12px', () => {
    const thinStrokeAnn = { ...ann, strokeWidth: 0 };
    
    render(<TextEditor ann={thinStrokeAnn} {...defaultProps} />);
    
    const textarea = screen.getByRole('textbox');
    expect(textarea).toHaveStyle({
      fontSize: '14px', // 14 + 0
    });
  });
});
