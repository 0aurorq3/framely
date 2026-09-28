import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import './Tooltip.css';

interface TooltipProps {
  content?: string;
  children: React.ReactElement;
  position?: 'top' | 'bottom' | 'left' | 'right';
  delay?: number;
}

export default function Tooltip({
  content,
  children,
  position = 'top',
  delay = 150,
}: TooltipProps) {
  const [visible, setVisible] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0 });
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const targetRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  const child = React.Children.only(children);
  const tooltipText = content || child.props.title || '';

  if (!tooltipText) {
    return children;
  }

  const showTooltip = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    timerRef.current = setTimeout(() => {
      if (targetRef.current) {
        // Temporarily remove title attribute to prevent native browser tooltip
        const domTitle = targetRef.current.getAttribute('title');
        if (domTitle) {
          targetRef.current.setAttribute('data-original-title', domTitle);
          targetRef.current.removeAttribute('title');
        }

        const rect = targetRef.current.getBoundingClientRect();
        let top = 0;
        let left = 0;

        if (position === 'top') {
          top = rect.top + window.scrollY;
          left = rect.left + window.scrollX + rect.width / 2;
        } else if (position === 'bottom') {
          top = rect.bottom + window.scrollY;
          left = rect.left + window.scrollX + rect.width / 2;
        } else if (position === 'left') {
          top = rect.top + window.scrollY + rect.height / 2;
          left = rect.left + window.scrollX;
        } else if (position === 'right') {
          top = rect.top + window.scrollY + rect.height / 2;
          left = rect.left + window.scrollX + rect.width;
        }

        setCoords({ top, left });
        setVisible(true);
      }
    }, delay);
  };

  const hideTooltip = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    
    // Restore title attribute if it was cleared
    if (targetRef.current) {
      const originalTitle = targetRef.current.getAttribute('data-original-title');
      if (originalTitle) {
        targetRef.current.setAttribute('title', originalTitle);
        targetRef.current.removeAttribute('data-original-title');
      }
    }
    setVisible(false);
  };

  const trigger = React.cloneElement(child, {
    ref: (node: HTMLElement | null) => {
      targetRef.current = node;
      const { ref } = child as any;
      if (typeof ref === 'function') {
        ref(node);
      } else if (ref) {
        ref.current = node;
      }
    },
    onMouseEnter: (e: React.MouseEvent) => {
      if (child.props.onMouseEnter) child.props.onMouseEnter(e);
      showTooltip();
    },
    onMouseLeave: (e: React.MouseEvent) => {
      if (child.props.onMouseLeave) child.props.onMouseLeave(e);
      hideTooltip();
    },
    onClick: (e: React.MouseEvent) => {
      if (child.props.onClick) child.props.onClick(e);
      hideTooltip();
    }
  });

  return (
    <>
      {trigger}
      {visible && (
        createPortal(
          <div
            className={`custom-tooltip tooltip-${position}`}
            style={{
              position: 'absolute',
              top: coords.top,
              left: coords.left,
              zIndex: 99999,
            }}
          >
            {tooltipText}
          </div>,
          document.body
        )
      )}
    </>
  );
}
