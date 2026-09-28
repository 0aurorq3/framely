import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import BlurOverlays from '../src/renderer/components/BlurOverlays';
import { getBlurRadius } from '../src/shared/blur';
import type { Annotation } from '../src/renderer/canvasRenderer';

const region: Annotation = {
  id: 'blur-1', type: 'blur', x: 0.25, y: 0.2, w: 0.3, h: 0.4,
  color: '#ffffff', strokeWidth: 2, blurStrength: 20,
};

describe('selected-area blur', () => {
  it('scales Gaussian blur strength with rendered image width', () => {
    expect(getBlurRadius(20, 500)).toBe(10);
    expect(getBlurRadius(20, 1000)).toBe(20);
  });

  it('clips a blurred copy of the screenshot to the selected region', () => {
    render(<BlurOverlays imageSrc="data:image/png;base64,abc" annotations={[region]} displayWidth={500} />);
    const overlay = screen.getByTestId('blur-region');
    const image = overlay.querySelector('img')!;
    expect(overlay).toHaveStyle({ left: '25%', top: '20%', width: '30%', height: '40%' });
    expect(overlay).toHaveStyle({ overflow: 'hidden' });
    expect(image.style.filter).toBe('blur(10px)');
  });
});
