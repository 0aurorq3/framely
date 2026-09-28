import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import AnnotationContextMenu from '../src/renderer/components/AnnotationContextMenu';

describe('AnnotationContextMenu', () => {
  const defaultProps = {
    x: 100,
    y: 100,
    onClose: vi.fn(),
    onOrder: vi.fn(),
    onCut: vi.fn(),
    onCopy: vi.fn(),
    onPaste: vi.fn(),
    canPaste: true,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders clipboard items and all four layer-order items', () => {
    render(<AnnotationContextMenu {...defaultProps} />);
    expect(screen.getByText('Cut')).toBeInTheDocument();
    expect(screen.getByText('Copy')).toBeInTheDocument();
    expect(screen.getByText('Paste')).toBeInTheDocument();
    expect(screen.getByText('Bring to Front')).toBeInTheDocument();
    expect(screen.getByText('Bring Forward')).toBeInTheDocument();
    expect(screen.getByText('Send Backward')).toBeInTheDocument();
    expect(screen.getByText('Send to Back')).toBeInTheDocument();
  });

  it('all four layer-order items are always enabled (no-op safe at edges)', () => {
    render(<AnnotationContextMenu {...defaultProps} />);
    expect(screen.getByText('Bring to Front').closest('button')).not.toBeDisabled();
    expect(screen.getByText('Bring Forward').closest('button')).not.toBeDisabled();
    expect(screen.getByText('Send Backward').closest('button')).not.toBeDisabled();
    expect(screen.getByText('Send to Back').closest('button')).not.toBeDisabled();
  });

  it('disables Paste when canPaste is false', () => {
    render(<AnnotationContextMenu {...defaultProps} canPaste={false} />);
    expect(screen.getByText('Paste').closest('button')).toBeDisabled();
  });

  it('enables Paste when canPaste is true', () => {
    render(<AnnotationContextMenu {...defaultProps} canPaste={true} />);
    expect(screen.getByText('Paste').closest('button')).not.toBeDisabled();
  });

  it('calls onCut and onClose when Cut clicked', () => {
    render(<AnnotationContextMenu {...defaultProps} />);
    fireEvent.click(screen.getByText('Cut'));
    expect(defaultProps.onCut).toHaveBeenCalled();
    expect(defaultProps.onClose).toHaveBeenCalled();
  });

  it('calls onCopy and onClose when Copy clicked', () => {
    render(<AnnotationContextMenu {...defaultProps} />);
    fireEvent.click(screen.getByText('Copy'));
    expect(defaultProps.onCopy).toHaveBeenCalled();
    expect(defaultProps.onClose).toHaveBeenCalled();
  });

  it('calls onPaste and onClose when Paste clicked', () => {
    render(<AnnotationContextMenu {...defaultProps} />);
    fireEvent.click(screen.getByText('Paste'));
    expect(defaultProps.onPaste).toHaveBeenCalled();
    expect(defaultProps.onClose).toHaveBeenCalled();
  });

  it('calls onOrder("bring-to-front") and onClose when Bring to Front clicked', () => {
    render(<AnnotationContextMenu {...defaultProps} />);
    fireEvent.click(screen.getByText('Bring to Front'));
    expect(defaultProps.onOrder).toHaveBeenCalledWith('bring-to-front');
    expect(defaultProps.onClose).toHaveBeenCalled();
  });

  it('calls onOrder("bring-forward") and onClose when Bring Forward clicked', () => {
    render(<AnnotationContextMenu {...defaultProps} />);
    fireEvent.click(screen.getByText('Bring Forward'));
    expect(defaultProps.onOrder).toHaveBeenCalledWith('bring-forward');
    expect(defaultProps.onClose).toHaveBeenCalled();
  });

  it('calls onOrder("send-backward") and onClose when Send Backward clicked', () => {
    render(<AnnotationContextMenu {...defaultProps} />);
    fireEvent.click(screen.getByText('Send Backward'));
    expect(defaultProps.onOrder).toHaveBeenCalledWith('send-backward');
    expect(defaultProps.onClose).toHaveBeenCalled();
  });

  it('calls onOrder("send-to-back") and onClose when Send to Back clicked', () => {
    render(<AnnotationContextMenu {...defaultProps} />);
    fireEvent.click(screen.getByText('Send to Back'));
    expect(defaultProps.onOrder).toHaveBeenCalledWith('send-to-back');
    expect(defaultProps.onClose).toHaveBeenCalled();
  });

  it('renders into document.body via portal (escapes transformed ancestors)', () => {
    // The menu must portal to document.body so position:fixed is resolved
    // against the viewport, not a CSS-transformed ancestor (the scaled
    // preview card). This is the regression guard for the offset bug.
    const { container } = render(<AnnotationContextMenu {...defaultProps} />);
    // The component's own container should NOT contain the menu...
    expect(container.querySelector('.custom-context-menu')).toBeNull();
    // ...it should be attached to document.body instead.
    const menu = document.body.querySelector('.custom-context-menu');
    expect(menu).toBeTruthy();
  });

  it('positions the menu at the given viewport coordinates', () => {
    render(<AnnotationContextMenu {...defaultProps} x={250} y={350} />);
    const menu = document.body.querySelector('.custom-context-menu') as HTMLElement;
    expect(menu).toBeTruthy();
    expect(menu.style.top).toBe('350px');
    expect(menu.style.left).toBe('250px');
  });

  it('clamps position to prevent viewport overflow on the right edge', () => {
    // window.innerWidth in jsdom defaults to 1024
    render(<AnnotationContextMenu {...defaultProps} x={2000} y={100} />);
    const menu = document.body.querySelector('.custom-context-menu') as HTMLElement;
    // MENU_WIDTH=200, padding 8 -> clamped to 1024 - 200 - 8 = 816
    expect(Number(menu.style.left.replace('px', ''))).toBeLessThanOrEqual(816);
  });

  it('clamps position to prevent viewport overflow on the bottom edge', () => {
    // window.innerHeight in jsdom defaults to 768
    render(<AnnotationContextMenu {...defaultProps} x={100} y={2000} />);
    const menu = document.body.querySelector('.custom-context-menu') as HTMLElement;
    // MENU_HEIGHT=280, padding 8 -> clamped to 768 - 280 - 8 = 480
    expect(Number(menu.style.top.replace('px', ''))).toBeLessThanOrEqual(480);
  });

  it('closes on Escape key', () => {
    render(<AnnotationContextMenu {...defaultProps} />);
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(defaultProps.onClose).toHaveBeenCalled();
  });

  it('closes on outside click', () => {
    render(<AnnotationContextMenu {...defaultProps} />);
    fireEvent.click(window.document.body);
    expect(defaultProps.onClose).toHaveBeenCalled();
  });

  it('closes on a contextmenu (right-click) event elsewhere', () => {
    render(<AnnotationContextMenu {...defaultProps} />);
    fireEvent.contextMenu(window.document.body);
    expect(defaultProps.onClose).toHaveBeenCalled();
  });

  it('does not close when a menu item is clicked (stopPropagation on container)', () => {
    // Clicking a button calls onOrder + onClose via run(), but a raw click on
    // the container itself should be stopped from bubbling to the window
    // listener that would otherwise close the menu prematurely.
    const { container } = render(<AnnotationContextMenu {...defaultProps} />);
    const menu = document.body.querySelector('.custom-context-menu') as HTMLElement;
    const stopPropagation = vi.fn();
    fireEvent.click(menu, { stopPropagation });
    // onClose is NOT called from the container click handler itself; it is
    // only called by the window listener, which is stopped by stopPropagation.
    // (testing-library does not wire stopPropagation automatically, so we just
    // assert onClose was not called from this raw container click.)
    expect(defaultProps.onClose).not.toHaveBeenCalled();
    expect(container).toBeDefined();
  });

  it('does not close when right-clicked on itself (stopPropagation prevents window listener)', () => {
    // The menu attaches a window 'contextmenu' listener that calls onClose.
    // Its own onContextMenu handler calls stopPropagation so right-clicking the
    // menu does not bubble to that window listener and close it immediately.
    render(<AnnotationContextMenu {...defaultProps} />);
    const menu = document.body.querySelector('.custom-context-menu') as HTMLElement;
    fireEvent.contextMenu(menu);
    expect(defaultProps.onClose).not.toHaveBeenCalled();
  });

  it('each action maps to the correct LayerOrderAction value', () => {
    const onOrder = vi.fn();
    render(<AnnotationContextMenu {...defaultProps} onOrder={onOrder} />);
    const labels = ['Bring to Front', 'Bring Forward', 'Send Backward', 'Send to Back'];
    for (const label of labels) {
      fireEvent.click(screen.getByText(label));
    }
    expect(onOrder.mock.calls.map((c) => c[0])).toEqual([
      'bring-to-front',
      'bring-forward',
      'send-backward',
      'send-to-back',
    ]);
  });
});
